/**
 * Renders the "Users" subtab content within the Forum Preferences tab.
 *
 * @param {HTMLElement} container - The container element to render into
 */
import { log, error } from "../../../utils/logger.js";
import {
  getAllUserRules,
  getUserRules,
  saveUserRules,
  updateUserRules,
  deleteUserRules,
  addRuleForUser,
  updateRuleForUser,
  deleteRuleForUser,
  updateUsernameColor,
} from "../../../utils/userRules/storage.js";
import { extractUserIdFromUrl } from "../../../utils/userRules/userIdentification.js";
import { searchUsers } from "../../../utils/api/rpghqApi.js"; // Import the search function

// Allowed rule actions and subjects
const RULE_ACTIONS = [
  { id: "HIDE", name: "Hide" },
  { id: "HIGHLIGHT", name: "Highlight" },
];

const RULE_SUBJECTS = [
  { id: "POST_BODY", name: "Post Content" },
  { id: "SIGNATURE", name: "Signature" },
  { id: "AVATAR", name: "Avatar" },
  { id: "USERNAME", name: "Username" },
];

const RULE_SCOPES = [
  { id: "ALL", name: "Everywhere" },
  { id: "TOPIC_VIEW", name: "In Topics" },
  { id: "PROFILE_VIEW", name: "On Profile Pages" },
  { id: "RECENT_TOPICS_LIST", name: "In Recent Activity" },
  { id: "SEARCH_RESULTS", name: "In Search Results" },
];

export function renderUsersSubtab(container) {
  log("Rendering Users subtab...");

  // Create the main structure for the users subtab
  container.innerHTML = `
    <div class="preferences-section">
      <div class="preferences-section-header">
        <h3 class="preferences-section-title">User-Specific Rules</h3>
      </div>
      <div class="preferences-section-body">
        <p class="preference-description">
          Create rules for specific users that change how their content appears to you.
          You can hide or highlight various elements of their posts.
        </p>

        <!-- User Selection Section -->
        <div class="user-selection-area">
          <div class="user-search-form">
            <div class="input-group">
              <label for="user-search">Find User:</label>
              <input type="text" id="user-search" placeholder="Enter username, user ID, or profile URL" 
                     class="form-control">
              <button id="find-user-btn" class="button button--primary">Find User</button>
            </div>
            <div class="input-help">
              Enter a username, user ID, or paste a profile URL
            </div>
          </div>
          
          <div id="user-search-status" class="user-search-status"></div>
        </div>

        <!-- User Rules Section (hidden initially) -->
        <div id="user-rules-editor" class="user-rules-editor" style="display: none;">
          <div class="user-rules-header">
            <h4>Editing Rules for: <span id="selected-username">Username</span></h4>
          </div>
          
          <!-- Username Color Section -->
          <div class="username-color-section">
            <label for="username-color">Username Color:</label>
            <div class="color-input-group">
              <input type="color" id="username-color" class="color-picker">
              <button id="reset-color-btn" class="button button--link">Reset</button>
            </div>
            <div class="color-preview">
              Preview: <span id="username-preview">Username</span>
            </div>
          </div>
          
          <!-- Rules List -->
          <div class="rules-list-section">
            <div class="rules-list-header">
              <h4>Rules</h4>
              <button id="add-rule-btn" class="button button--primary">
                <i class="fa fa-plus"></i> Add Rule
              </button>
            </div>
            
            <div class="rules-table-wrapper">
              <table id="rules-table" class="rules-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Subject</th>
                    <th>Scope</th>
                    <th>Parameters</th>
                    <th>Controls</th>
                  </tr>
                </thead>
                <tbody id="rules-tbody">
                  <tr class="empty-rules">
                    <td colspan="5">No rules defined yet</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Save/Delete Buttons -->
          <div class="user-rules-actions">
            <button id="save-user-rules-btn" class="button button--primary">Save Changes</button>
            <button id="delete-user-rules-btn" class="button button--normal">Delete All Rules for This User</button>
          </div>
        </div>
        
        <!-- User Rules List Section -->
        <div class="user-rules-list-section">
          <div class="user-rules-list-header">
            <h4>Existing User Rules</h4>
          </div>
          <div id="existing-rules-container" class="existing-rules-container">
            <div class="loading-rules">Loading existing rules...</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Rule Editor Modal -->
    <div id="rule-editor-modal" class="modal" style="display: none;">
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="rule-editor-title">Add New Rule</h3>
          <span class="modal-close">&times;</span>
        </div>
        <div class="modal-body">
          <form id="rule-editor-form">
            <input type="hidden" id="rule-id">
            
            <div class="form-group">
              <label for="rule-action">Action:</label>
              <select id="rule-action" class="form-control">
                ${RULE_ACTIONS.map((action) => `<option value="${action.id}">${action.name}</option>`).join("")}
              </select>
            </div>
            
            <div class="form-group">
              <label for="rule-subject">Subject:</label>
              <select id="rule-subject" class="form-control">
                ${RULE_SUBJECTS.map((subject) => `<option value="${subject.id}">${subject.name}</option>`).join("")}
              </select>
            </div>
            
            <div class="form-group">
              <label for="rule-scope">Scope:</label>
              <select id="rule-scope" class="form-control">
                ${RULE_SCOPES.map((scope) => `<option value="${scope.id}">${scope.name}</option>`).join("")}
              </select>
            </div>
            
            <div id="rule-params-container" class="rule-params-container">
              <!-- Dynamic parameters will be rendered here -->
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button id="save-rule-btn" class="button button--primary">Save Rule</button>
          <button id="cancel-rule-btn" class="button button--link">Cancel</button>
        </div>
      </div>
    </div>
  `;

  // Add necessary styles
  addRuleManagementStyles();

  // Initialize the UI components
  initUserSearch(container);
  initRuleEditor(container);
  initUserRulesEditor(container);
  loadExistingUsers(container);
}

// Add CSS styles for the user rules UI
function addRuleManagementStyles() {
  const styleId = "user-rules-management-styles";
  if (document.getElementById(styleId)) return;

  const css = `
    .user-selection-area {
      margin-bottom: 20px;
      padding: 15px;
      background: var(--bg-card);
      border-radius: 4px;
    }
    
    .user-search-form .input-group {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 5px;
    }
    
    .user-search-form label {
      min-width: 80px;
      color: var(--text-secondary);
    }
    
    .user-search-form .form-control {
      flex: 1;
      padding: 6px 10px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background-color: var(--bg-dark);
      color: var(--text-primary);
    }
    
    .user-search-status {
      margin-top: 10px;
      padding: 6px 0;
      font-style: italic;
      color: var(--text-secondary);
    }
    
    .user-search-status.success {
      color: var(--success-color);
    }
    
    .user-search-status.error {
      color: var(--danger-color);
    }
    
    .user-rules-editor {
      border: 1px solid var(--border-color);
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
      background-color: var(--bg-card);
    }
    
    .user-rules-header {
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border-color);
    }
    
    .user-rules-header h4,
    .rules-list-header h4,
    .user-rules-list-header h4 {
      color: var(--text-primary);
    }
    
    .username-color-section {
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    
    .username-color-section label {
      color: var(--text-secondary);
    }
    
    .color-input-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .color-picker {
      width: 40px;
      height: 30px;
      padding: 0;
      border: 1px solid var(--border-color);
      cursor: pointer;
    }
    
    .color-preview {
      margin-left: 15px;
      padding: 5px 10px;
      border-radius: 3px;
      background: var(--bg-dark);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
    }
    
    .rules-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .rules-table-wrapper {
      overflow-x: auto;
    }
    
    .rules-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    .rules-table th, .rules-table td {
      padding: 8px 12px;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
      color: var(--text-secondary);
    }
    
    .rules-table th {
      background-color: rgba(255, 255, 255, 0.05);
      color: var(--text-primary);
      font-weight: bold;
    }
    
    .rules-table tr:hover {
      background-color: rgba(255, 255, 255, 0.03);
    }
    
    .rules-actions {
      display: flex;
      gap: 5px;
    }
    
    .user-rules-actions {
      display: flex;
      gap: 10px;
      justify-content: space-between;
      margin-top: 10px;
    }
    
    .existing-rules-container {
      margin-top: 20px;
    }
    
    /* Modal styles - Inherit from global styles where possible */
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      z-index: 1000001; /* Ensure it's above the main modal */
      overflow-y: auto;
    }
    
    .modal-content {
      background-color: var(--bg-card);
      color: var(--text-primary);
      margin: 5% auto;
      padding: 20px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      width: 90%;
      max-width: 600px;
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    
    .modal-header h3 {
      color: var(--text-primary);
      margin: 0;
    }
    
    .modal-close {
      font-size: 24px;
      cursor: pointer;
      color: var(--text-secondary);
    }
    .modal-close:hover {
      color: var(--danger-color);
    }
    
    .modal-body {
      margin-bottom: 20px;
    }
    
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      border-top: 1px solid var(--border-color);
      padding-top: 15px;
    }
    
    .form-group {
      margin-bottom: 15px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 5px;
      color: var(--text-secondary);
    }
    
    .form-control {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background-color: var(--bg-dark);
      color: var(--text-primary);
    }
    
    select.form-control {
      appearance: none;
      background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23B0BEC5%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
      background-repeat: no-repeat;
      background-position: right .7em top 50%;
      background-size: .65em auto;
      padding-right: 2.5em;
    }
    
    .user-rules-list-section {
      margin-top: 20px;
    }

    .user-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      margin-bottom: 10px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background-color: var(--bg-card);
    }
    
    .user-info {
      display: flex;
      flex-direction: column;
    }
    
    .user-name {
      font-weight: bold;
      color: var(--text-primary);
    }
    
    .user-stats {
      font-size: 0.9em;
      color: var(--text-secondary);
    }
    
    .user-card-actions {
      display: flex;
      gap: 5px;
    }
    
    .empty-rules td {
      text-align: center;
      font-style: italic;
      color: var(--text-secondary);
      padding: 20px;
    }
    
    .rule-params-container {
      padding: 10px;
      background-color: var(--bg-dark);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      margin-top: 10px;
    }

    .rule-params-container p {
      color: var(--text-secondary);
      margin: 0;
    }

    .loading-rules {
      color: var(--text-secondary);
      font-style: italic;
    }

    /* Use global button styles */
    .button {
      padding: 6px 12px;
      border-radius: 3px;
      border: none;
      cursor: pointer;
      font-size: 0.9em;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      text-decoration: none;
      color: var(--text-primary);
      transition: background-color 0.2s ease;
    }
    .button i {
      font-size: 1em;
    }
    .button--primary {
      background-color: var(--primary-color);
      color: white;
    }
    .button--primary:hover {
      background-color: var(--primary-dark);
    }
    .button--normal {
      background-color: #555;
      color: var(--text-primary);
    }
    .button--normal:hover {
      background-color: #666;
    }
    .button--link {
      background: none;
      color: var(--primary-color);
      padding: 0;
    }
    .button--link:hover {
      text-decoration: underline;
    }
  `;

  // Add styles to document head
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = css;
  document.head.appendChild(style);
}

// Initialize user search functionality
function initUserSearch(container) {
  const searchInput = container.querySelector("#user-search");
  const findButton = container.querySelector("#find-user-btn");
  const statusDiv = container.querySelector("#user-search-status");

  findButton.addEventListener("click", async () => {
    const searchValue = searchInput.value.trim();
    if (!searchValue) {
      statusDiv.innerHTML = "Please enter a username, user ID, or profile URL";
      statusDiv.className = "user-search-status error";
      return;
    }

    statusDiv.innerHTML = "Searching...";
    statusDiv.className = "user-search-status";

    try {
      // Case 1: Search value is a URL, extract user ID
      if (searchValue.includes("http")) {
        const userId = extractUserIdFromUrl(searchValue);
        if (userId) {
          // Try to get user data from the URL
          const username = searchValue
            .split("/")
            .filter(Boolean)
            .pop()
            .split(".")[0];
          await handleUserFound(userId, username);
          return;
        }
      }

      // Case 2: Search value is a numeric user ID
      if (/^\d+$/.test(searchValue)) {
        // For now, we'll just use the ID. In the future, we could fetch the username from the server
        await handleUserFound(searchValue, `User #${searchValue}`);
        return;
      }

      // Case 3: Search value is a username
      const results = await searchUsers(searchValue);
      const users = results.filter((item) => item.type === "user");

      if (users.length === 1) {
        await handleUserFound(users[0].user_id, users[0].value);
        return; // Exit after handling the found user
      } else if (users.length === 0) {
        statusDiv.innerHTML = `No user found matching "${searchValue}". Try User ID or profile URL.`;
        statusDiv.className = "user-search-status error";
      } else {
        statusDiv.innerHTML = `Multiple users found matching "${searchValue}". Please be more specific or use User ID/URL.`;
        statusDiv.className = "user-search-status error";
      }
    } catch (err) {
      statusDiv.innerHTML = `Error: ${err.message}`;
      statusDiv.className = "user-search-status error";
      error("Error searching for user:", err);
    }
  });

  // Also trigger search on Enter key
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      findButton.click();
    }
  });

  // Handle when a user is found
  async function handleUserFound(userId, username) {
    try {
      // Check if we already have rules for this user
      const userRules = await getUserRules(userId);

      // Set up the UI with user data
      container.querySelector("#user-rules-editor").style.display = "block";
      container.querySelector("#selected-username").textContent = username;

      // Store user data in data attributes for later use
      const rulesEditor = container.querySelector("#user-rules-editor");
      rulesEditor.dataset.userId = userId;
      rulesEditor.dataset.username = username;

      // Set up username color
      const colorInput = container.querySelector("#username-color");
      const usernamePreview = container.querySelector("#username-preview");
      usernamePreview.textContent = username;

      if (userRules && userRules.usernameColor) {
        colorInput.value = userRules.usernameColor;
        usernamePreview.style.color = userRules.usernameColor;
      } else {
        colorInput.value = "#000000";
        usernamePreview.style.color = "";
      }

      // Load existing rules if any
      loadRulesForUser(userId, container);

      // Update status
      statusDiv.innerHTML = `User found: <strong>${username}</strong> (ID: ${userId})`;
      statusDiv.className = "user-search-status success";
    } catch (err) {
      statusDiv.innerHTML = `Error loading user data: ${err.message}`;
      statusDiv.className = "user-search-status error";
      error("Error handling found user:", err);
    }
  }
}

// Initialize rule editor modal functionality
function initRuleEditor(container) {
  const modal = container.querySelector("#rule-editor-modal");
  const closeBtn = modal.querySelector(".modal-close");
  const cancelBtn = modal.querySelector("#cancel-rule-btn");
  const saveBtn = modal.querySelector("#save-rule-btn");
  const form = modal.querySelector("#rule-editor-form");
  const ruleAction = modal.querySelector("#rule-action");
  const paramsContainer = modal.querySelector("#rule-params-container");

  // Close modal handlers
  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  function closeModal() {
    modal.style.display = "none";
  }

  // Open modal handler (will be called from other functions)
  window.openRuleEditor = function (ruleData = null, userId) {
    // Set modal title based on if we're editing or adding
    modal.querySelector("#rule-editor-title").textContent = ruleData
      ? "Edit Rule"
      : "Add New Rule";

    // Reset the form
    form.reset();

    // If editing, populate form with rule data
    if (ruleData) {
      modal.querySelector("#rule-id").value = ruleData.id;
      modal.querySelector("#rule-action").value = ruleData.action;
      modal.querySelector("#rule-subject").value = ruleData.subject;
      modal.querySelector("#rule-scope").value = ruleData.scope;

      // Update params UI based on action
      updateParamsUI(ruleData.action, ruleData.params);
    } else {
      modal.querySelector("#rule-id").value = "";

      // Set default action and update params UI
      const defaultAction = RULE_ACTIONS[0].id;
      modal.querySelector("#rule-action").value = defaultAction;
      updateParamsUI(defaultAction);
    }

    // Store userId in data attribute
    modal.dataset.userId = userId;

    // Show the modal
    modal.style.display = "block";
  };

  // Handle action change to update param fields
  ruleAction.addEventListener("change", () => {
    updateParamsUI(ruleAction.value);
  });

  // Generate UI for parameters based on action
  function updateParamsUI(action, existingParams = {}) {
    paramsContainer.innerHTML = "";

    switch (action) {
      case "HIGHLIGHT":
        paramsContainer.innerHTML = `
          <div class="form-group">
            <label for="highlight-color">Highlight Color:</label>
            <input type="color" id="highlight-color" class="form-control color-picker" 
                   value="${existingParams.color || "#FFFF99"}">
          </div>
        `;
        break;

      case "HIDE":
        // No params needed for HIDE
        paramsContainer.innerHTML =
          "<p>No additional parameters needed for this action.</p>";
        break;

      default:
        paramsContainer.innerHTML =
          "<p>No parameters available for this action.</p>";
    }
  }

  // Save rule handler
  saveBtn.addEventListener("click", async () => {
    try {
      const userId = modal.dataset.userId;
      const ruleId = modal.querySelector("#rule-id").value;
      const action = modal.querySelector("#rule-action").value;
      const subject = modal.querySelector("#rule-subject").value;
      const scope = modal.querySelector("#rule-scope").value;

      // Get params based on action
      let params = {};
      if (action === "HIGHLIGHT") {
        params.color = modal.querySelector("#highlight-color").value;
      }

      // Create rule object
      const ruleData = {
        id: ruleId || `rule_${Date.now()}`, // Generate an ID if not editing
        action,
        subject,
        scope,
        params,
      };

      // Save the rule - call different functions for add vs update
      if (ruleId) {
        await updateRuleForUser(userId, ruleId, ruleData);
      } else {
        await addRuleForUser(userId, ruleData);
      }

      // Reload rules display
      await loadRulesForUser(userId, container);

      // Close the modal
      closeModal();
    } catch (err) {
      error("Error saving rule:", err);
      alert(`Error saving rule: ${err.message}`);
    }
  });
}

// Initialize the user rules editor section
function initUserRulesEditor(container) {
  const colorInput = container.querySelector("#username-color");
  const usernamePreview = container.querySelector("#username-preview");
  const resetColorBtn = container.querySelector("#reset-color-btn");
  const addRuleBtn = container.querySelector("#add-rule-btn");
  const saveBtn = container.querySelector("#save-user-rules-btn");
  const deleteBtn = container.querySelector("#delete-user-rules-btn");

  // Username color handling
  colorInput.addEventListener("input", () => {
    usernamePreview.style.color = colorInput.value;
  });

  resetColorBtn.addEventListener("click", () => {
    colorInput.value = "#000000";
    usernamePreview.style.color = "";
  });

  // Add rule button
  addRuleBtn.addEventListener("click", () => {
    const userId = container.querySelector("#user-rules-editor").dataset.userId;
    window.openRuleEditor(null, userId);
  });

  // Save all changes button
  saveBtn.addEventListener("click", async () => {
    try {
      const rulesEditor = container.querySelector("#user-rules-editor");
      const userId = rulesEditor.dataset.userId;
      const username = rulesEditor.dataset.username;
      const usernameColor =
        colorInput.value !== "#000000" ? colorInput.value : null;

      // Just update the username color for now
      await updateUsernameColor(userId, username, usernameColor);

      // Show success message
      const statusDiv = container.querySelector("#user-search-status");
      statusDiv.innerHTML = "Changes saved successfully!";
      statusDiv.className = "user-search-status success";

      // Reload the existing users list
      await loadExistingUsers(container);
    } catch (err) {
      error("Error saving user rules:", err);
      alert(`Error saving changes: ${err.message}`);
    }
  });

  // Delete all rules button
  deleteBtn.addEventListener("click", async () => {
    if (!confirm("Are you sure you want to delete all rules for this user?")) {
      return;
    }

    try {
      const rulesEditor = container.querySelector("#user-rules-editor");
      const userId = rulesEditor.dataset.userId;

      await deleteUserRules(userId);

      // Reset UI
      rulesEditor.style.display = "none";
      container.querySelector("#user-search-status").innerHTML =
        "User rules deleted successfully.";
      container.querySelector("#user-search-status").className =
        "user-search-status success";

      // Reload existing users list
      await loadExistingUsers(container);
    } catch (err) {
      error("Error deleting user rules:", err);
      alert(`Error deleting rules: ${err.message}`);
    }
  });
}

// Load and display rules for a specific user
async function loadRulesForUser(userId, container) {
  try {
    const rulesTable = container.querySelector("#rules-tbody");
    const userRules = await getUserRules(userId);

    if (!userRules || !userRules.rules || userRules.rules.length === 0) {
      rulesTable.innerHTML = `
        <tr class="empty-rules">
          <td colspan="5">No rules defined yet</td>
        </tr>
      `;
      return;
    }

    // Generate table rows for each rule
    rulesTable.innerHTML = userRules.rules
      .map((rule) => {
        // Format parameters for display
        let paramsDisplay = "";
        if (rule.action === "HIGHLIGHT" && rule.params?.color) {
          paramsDisplay = `
          <div style="display: flex; align-items: center; gap: 5px;">
            <span style="color: var(--text-secondary);">Color:</span>
            <div style="width: 16px; height: 16px; background-color: ${rule.params.color}; border: 1px solid var(--border-color);"></div>
            <span style="color: var(--text-secondary);">${rule.params.color}</span>
          </div>
        `;
        } else {
          paramsDisplay =
            '<span style="color: var(--text-secondary);">None</span>';
        }

        // Format action, subject, and scope with friendly names
        const actionName =
          RULE_ACTIONS.find((a) => a.id === rule.action)?.name || rule.action;
        const subjectName =
          RULE_SUBJECTS.find((s) => s.id === rule.subject)?.name ||
          rule.subject;
        const scopeName =
          RULE_SCOPES.find((s) => s.id === rule.scope)?.name || rule.scope;

        return `
        <tr data-rule-id="${rule.id}">
          <td>${actionName}</td>
          <td>${subjectName}</td>
          <td>${scopeName}</td>
          <td>${paramsDisplay}</td>
          <td>
            <div class="rules-actions">
              <button class="button button--normal edit-rule-btn" data-rule-id="${rule.id}">
                <i class="fa fa-pencil"></i>
              </button>
              <button class="button button--normal delete-rule-btn" data-rule-id="${rule.id}">
                <i class="fa fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");

    // Add event listeners to edit and delete buttons
    rulesTable.querySelectorAll(".edit-rule-btn").forEach((btn) => {
      btn.addEventListener("click", () =>
        editRule(userId, btn.dataset.ruleId, container),
      );
    });

    rulesTable.querySelectorAll(".delete-rule-btn").forEach((btn) => {
      btn.addEventListener("click", () =>
        deleteRule(userId, btn.dataset.ruleId, container),
      );
    });
  } catch (err) {
    error("Error loading rules for user:", err);
    container.querySelector("#rules-tbody").innerHTML = `
      <tr>
        <td colspan="5">Error loading rules: ${err.message}</td>
      </tr>
    `;
  }
}

// Edit a rule
async function editRule(userId, ruleId, container) {
  try {
    const userRules = await getUserRules(userId);
    if (!userRules || !userRules.rules) throw new Error("User rules not found");

    const rule = userRules.rules.find((r) => r.id === ruleId);
    if (!rule) throw new Error("Rule not found");

    // Open the rule editor with existing data
    window.openRuleEditor(rule, userId);
  } catch (err) {
    error("Error editing rule:", err);
    alert(`Error editing rule: ${err.message}`);
  }
}

// Delete a rule
async function deleteRule(userId, ruleId, container) {
  if (!confirm("Are you sure you want to delete this rule?")) {
    return;
  }

  try {
    await deleteRuleForUser(userId, ruleId);

    // Reload rules display
    await loadRulesForUser(userId, container);
  } catch (err) {
    error("Error deleting rule:", err);
    alert(`Error deleting rule: ${err.message}`);
  }
}

// Load and display existing users with rules
async function loadExistingUsers(container) {
  try {
    const existingRulesContainer = container.querySelector(
      "#existing-rules-container",
    );
    const allUserRules = await getAllUserRules();

    if (!allUserRules || Object.keys(allUserRules).length === 0) {
      existingRulesContainer.innerHTML = "<p>No user rules defined yet.</p>";
      return;
    }

    // Create a card for each user
    const userCards = Object.entries(allUserRules)
      .map(([userId, userData]) => {
        const ruleCount = userData.rules?.length || 0;
        const usernameStyle = userData.usernameColor
          ? `style="color: ${userData.usernameColor}"`
          : "";

        return `
        <div class="user-card" data-user-id="${userId}">
          <div class="user-info">
            <span class="user-name" ${usernameStyle}>${userData.username || `User #${userId}`}</span>
            <span class="user-stats">${ruleCount} rule${ruleCount !== 1 ? "s" : ""}</span>
          </div>
          <div class="user-card-actions">
            <button class="button button--normal edit-user-btn" data-user-id="${userId}" data-username="${userData.username || `User #${userId}`}">
              <i class="fa fa-pencil"></i> Edit
            </button>
          </div>
        </div>
      `;
      })
      .join("");

    existingRulesContainer.innerHTML = userCards;

    // Add event listeners to edit buttons
    existingRulesContainer.querySelectorAll(".edit-user-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const userId = btn.dataset.userId;
        const username = btn.dataset.username;

        // Simulate finding the user
        container.querySelector("#user-search").value = userId;
        const statusDiv = container.querySelector("#user-search-status");

        statusDiv.innerHTML = `Loading user: <strong>${username}</strong> (ID: ${userId})`;
        statusDiv.className = "user-search-status";

        try {
          // Set up UI with user data
          container.querySelector("#user-rules-editor").style.display = "block";
          container.querySelector("#selected-username").textContent = username;

          // Store user data in data attributes for later use
          const rulesEditor = container.querySelector("#user-rules-editor");
          rulesEditor.dataset.userId = userId;
          rulesEditor.dataset.username = username;

          // Get user rules
          const userRules = await getUserRules(userId);

          // Set up username color
          const colorInput = container.querySelector("#username-color");
          const usernamePreview = container.querySelector("#username-preview");
          usernamePreview.textContent = username;

          if (userRules && userRules.usernameColor) {
            colorInput.value = userRules.usernameColor;
            usernamePreview.style.color = userRules.usernameColor;
          } else {
            colorInput.value = "#000000";
            usernamePreview.style.color = "";
          }

          // Load existing rules
          await loadRulesForUser(userId, container);

          // Scroll to the editor
          rulesEditor.scrollIntoView({ behavior: "smooth" });

          // Update status
          statusDiv.innerHTML = `User loaded: <strong>${username}</strong> (ID: ${userId})`;
          statusDiv.className = "user-search-status success";
        } catch (err) {
          statusDiv.innerHTML = `Error loading user: ${err.message}`;
          statusDiv.className = "user-search-status error";
          error("Error loading existing user:", err);
        }
      });
    });
  } catch (err) {
    error("Error loading existing users:", err);
    container.querySelector("#existing-rules-container").innerHTML =
      `<p>Error loading existing users: ${err.message}</p>`;
  }
}
