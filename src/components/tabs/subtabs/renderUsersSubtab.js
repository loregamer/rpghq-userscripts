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
    <div class="wip-banner">
      <i class="fa fa-wrench"></i> Thread Preferences - Work In Progress
    </div>
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
    
  `;

  // Add necessary styles
  addRuleManagementStyles();

  // Initialize the UI components
  initUserSearch(container);
  // initRuleEditor(container); // Removed - modal is gone
  // initUserRulesEditor(container); // Removed - editor is inline
  loadExistingUsers(container);
}

// Toggle user card expansion and load details
async function toggleUserCard(userCard, container) {
  const userId = userCard.dataset.userId;
  const detailsDiv = userCard.querySelector(".user-card-details");
  const isLoading = detailsDiv.classList.contains("loading");
  const isExpanded = userCard.classList.contains("expanded");

  if (isLoading) return; // Prevent multiple loads

  if (isExpanded) {
    userCard.classList.remove("expanded");
    // Optional: Clear details on collapse to save memory?
    // detailsDiv.innerHTML = '<div class="loading-placeholder">Loading details...</div>';
  } else {
    userCard.classList.add("expanded");
    // Check if details are already loaded
    if (!detailsDiv.dataset.loaded) {
      detailsDiv.innerHTML =
        '<div class="loading-placeholder">Loading details...</div>';
      detailsDiv.classList.add("loading");
      try {
        await renderUserDetails(userId, detailsDiv, container);
        detailsDiv.dataset.loaded = "true"; // Mark as loaded
      } catch (err) {
        detailsDiv.innerHTML = `<p class="error">Error loading details: ${err.message}</p>`;
        error(`Error rendering details for user ${userId}:`, err);
      } finally {
        detailsDiv.classList.remove("loading");
      }
    }
  }
}

// Render the content inside an expanded user card
async function renderUserDetails(userId, detailsContainer, mainContainer) {
  const userRules = await getUserRules(userId);
  const username =
    detailsContainer.closest(".user-card").dataset.username ||
    `User #${userId}`;

  detailsContainer.innerHTML = `
    <!-- Username Color Section -->
    <div class="username-color-section">
      <label for="username-color-${userId}">Username Color:</label>
      <div class="color-input-group">
        <input type="color" id="username-color-${userId}" class="color-picker username-color-input" value="${userRules?.usernameColor || "#000000"}">
        <button class="button button--link reset-color-btn">Reset</button>
      </div>
      <div class="color-preview">
        Preview: <span class="username-preview" style="color: ${userRules?.usernameColor || "inherit"}">${username}</span>
      </div>
    </div>

    <!-- Rules List -->
    <div class="rules-list-section">
      <div class="rules-list-header">
        <h4>Rules</h4>
        <button class="button button--primary add-rule-btn">
          <i class="fa fa-plus"></i> Add Rule
        </button>
      </div>
      <div class="rules-table-wrapper">
        <table class="rules-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Subject</th>
              <th>Scope</th>
              <th>Parameters</th>
              <th>Controls</th>
            </tr>
          </thead>
          <tbody class="rules-tbody">
            <!-- Rules will be loaded here -->
          </tbody>
        </table>
      </div>
      <!-- Inline Rule Editor Form (hidden initially) -->
      <form class="rule-editor-form" style="display: none;">
         <input type="hidden" class="rule-id">
         <div class="form-group">
           <label>Action:</label>
           <select class="form-control rule-action">
             ${RULE_ACTIONS.map((action) => `<option value="${action.id}">${action.name}</option>`).join("")}
           </select>
         </div>
         <div class="form-group">
           <label>Subject:</label>
           <select class="form-control rule-subject">
             ${RULE_SUBJECTS.map((subject) => `<option value="${subject.id}">${subject.name}</option>`).join("")}
           </select>
         </div>
         <div class="form-group">
           <label>Scope:</label>
           <select class="form-control rule-scope">
             ${RULE_SCOPES.map((scope) => `<option value="${scope.id}">${scope.name}</option>`).join("")}
           </select>
         </div>
         <div class="rule-params-container form-group">
           <!-- Dynamic parameters will be rendered here -->
         </div>
         <div class="modal-footer">
           <button type="button" class="button button--primary save-inline-rule-btn">Save Rule</button>
           <button type="button" class="button button--link cancel-inline-rule-btn">Cancel</button>
         </div>
      </form>
    </div>

    <!-- Save/Delete Buttons -->
    <div class="user-rules-actions">
      <button class="button button--primary save-user-changes-btn">Save Color</button>
      <button class="button button--normal delete-user-rules-btn">Delete All Rules for This User</button>
    </div>
  `;

  // Load rules into the table
  await loadRulesForUser(userId, detailsContainer); // Pass detailsContainer as context

  // Initialize event listeners within this specific details section
  initInlineRuleEditing(userId, detailsContainer, mainContainer);
}

// Initialize event listeners for the inline editor and actions within a user card
function initInlineRuleEditing(userId, detailsContainer, mainContainer) {
  const colorInput = detailsContainer.querySelector(".username-color-input");
  const usernamePreview = detailsContainer.querySelector(".username-preview");
  const resetColorBtn = detailsContainer.querySelector(".reset-color-btn");
  const addRuleBtn = detailsContainer.querySelector(".add-rule-btn");
  const saveColorBtn = detailsContainer.querySelector(".save-user-changes-btn");
  const deleteAllBtn = detailsContainer.querySelector(".delete-user-rules-btn");
  const ruleForm = detailsContainer.querySelector(".rule-editor-form");
  const cancelInlineBtn = detailsContainer.querySelector(
    ".cancel-inline-rule-btn"
  );
  const saveInlineBtn = detailsContainer.querySelector(".save-inline-rule-btn");
  const ruleActionSelect = detailsContainer.querySelector(".rule-action");
  const paramsContainer = detailsContainer.querySelector(
    ".rule-params-container"
  );

  // Username color handling
  colorInput.addEventListener("input", () => {
    usernamePreview.style.color =
      colorInput.value === "#000000" ? "inherit" : colorInput.value;
    // Update header preview immediately
    const headerPreview = detailsContainer
      .closest(".user-card")
      .querySelector(".user-name");
    if (headerPreview) {
      headerPreview.style.color =
        colorInput.value === "#000000" ? "" : colorInput.value;
    }
  });

  resetColorBtn.addEventListener("click", () => {
    colorInput.value = "#000000";
    usernamePreview.style.color = "inherit";
    // Update header preview immediately
    const headerPreview = detailsContainer
      .closest(".user-card")
      .querySelector(".user-name");
    if (headerPreview) {
      headerPreview.style.color = "";
    }
  });

  saveColorBtn.addEventListener("click", async () => {
    try {
      const username = detailsContainer.closest(".user-card").dataset.username;
      const newColor = colorInput.value !== "#000000" ? colorInput.value : null;
      await updateUsernameColor(userId, username, newColor);
      // Maybe add a temporary success indicator?
      log(`Username color saved for user ${userId}`);
      // Reload the main list to reflect potential name color changes (could optimize)
      // await loadExistingUsers(mainContainer);
    } catch (err) {
      error(`Error saving color for user ${userId}:`, err);
      alert(`Error saving color: ${err.message}`);
    }
  });

  // Delete all rules button
  deleteAllBtn.addEventListener("click", async () => {
    if (
      !confirm(`Are you sure you want to delete all rules for user ${userId}?`)
    ) {
      return;
    }
    try {
      await deleteUserRules(userId);
      log(`Deleted all rules for user ${userId}`);
      // Reload the details section or collapse the card
      await renderUserDetails(userId, detailsContainer, mainContainer); // Re-render details
      // Update rule count in header
      const headerStats = detailsContainer
        .closest(".user-card")
        .querySelector(".user-stats");
      if (headerStats) headerStats.textContent = "0 rules";
      // Reload main list (optional, if needed elsewhere)
      // await loadExistingUsers(mainContainer);
    } catch (err) {
      error(`Error deleting rules for user ${userId}:`, err);
      alert(`Error deleting rules: ${err.message}`);
    }
  });

  // --- Inline Rule Form Logic ---

  // Show/Hide Form
  addRuleBtn.addEventListener("click", () => {
    ruleForm.reset();
    ruleForm.querySelector(".rule-id").value = ""; // Ensure ID is cleared for adding
    updateInlineParamsUI(ruleActionSelect.value, {}, paramsContainer); // Update params for default action
    ruleForm.style.display = "block";
    addRuleBtn.style.display = "none"; // Hide 'Add' button while form is open
  });

  cancelInlineBtn.addEventListener("click", () => {
    ruleForm.style.display = "none";
    addRuleBtn.style.display = "inline-flex"; // Show 'Add' button again
  });

  // Update params on action change
  ruleActionSelect.addEventListener("change", () => {
    updateInlineParamsUI(ruleActionSelect.value, {}, paramsContainer);
  });

  // Save Inline Rule
  saveInlineBtn.addEventListener("click", async () => {
    try {
      const ruleId = ruleForm.querySelector(".rule-id").value;
      const action = ruleActionSelect.value;
      const subject = detailsContainer.querySelector(".rule-subject").value;
      const scope = detailsContainer.querySelector(".rule-scope").value;

      let params = {};
      if (action === "HIGHLIGHT") {
        params.color = paramsContainer.querySelector(
          ".highlight-color-inline"
        ).value;
      }

      const ruleData = {
        id: ruleId || `rule_${Date.now()}`,
        action,
        subject,
        scope,
        params,
      };

      if (ruleId) {
        await updateRuleForUser(userId, ruleId, ruleData);
      } else {
        await addRuleForUser(userId, ruleData);
      }

      // Hide form, reload rules table, show add button
      ruleForm.style.display = "none";
      addRuleBtn.style.display = "inline-flex";
      await loadRulesForUser(userId, detailsContainer); // Reload rules in this card
      // Update rule count in header
      const userRules = await getUserRules(userId);
      const ruleCount = userRules?.rules?.length || 0;
      const headerStats = detailsContainer
        .closest(".user-card")
        .querySelector(".user-stats");
      if (headerStats)
        headerStats.textContent = `${ruleCount} rule${ruleCount !== 1 ? "s" : ""}`;
    } catch (err) {
      error(`Error saving inline rule for user ${userId}:`, err);
      alert(`Error saving rule: ${err.message}`);
    }
  });

  // Edit/Delete buttons within the rules table will be handled by loadRulesForUser
}

// Generate UI for parameters based on action for the inline editor
function updateInlineParamsUI(action, existingParams = {}, paramsContainer) {
  paramsContainer.innerHTML = ""; // Clear previous params

  switch (action) {
    case "HIGHLIGHT":
      paramsContainer.innerHTML = `
        <label for="highlight-color-inline-${paramsContainer.closest(".user-card").dataset.userId}">Highlight Color:</label>
        <input type="color" id="highlight-color-inline-${paramsContainer.closest(".user-card").dataset.userId}" class="form-control color-picker highlight-color-inline" 
               value="${existingParams.color || "#FFFF99"}">
      `;
      break;
    case "HIDE":
      paramsContainer.innerHTML = "<p>No additional parameters needed.</p>";
      break;
    default:
      paramsContainer.innerHTML =
        "<p>No parameters available for this action.</p>";
  }
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
      margin-bottom: 10px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background-color: var(--bg-card);
      overflow: hidden; /* Contain children */
    }

    .user-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      cursor: pointer;
      background-color: rgba(255, 255, 255, 0.02); /* Slightly different bg */
    }

    .user-card-header:hover {
      background-color: rgba(255, 255, 255, 0.05);
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

    .expand-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 1.2em;
      cursor: pointer;
      padding: 5px;
      transition: transform 0.2s ease;
    }

    .user-card.expanded .expand-btn {
      transform: rotate(90deg);
    }

    .user-card-details {
      display: none; /* Hidden by default */
      padding: 15px;
      border-top: 1px solid var(--border-color);
      background-color: var(--bg-card); /* Same as card bg */
    }

    .user-card.expanded .user-card-details {
      display: block; /* Shown when expanded */
    }

    /* Reuse existing styles within the details section */
    .user-card-details .username-color-section,
    .user-card-details .rules-list-section,
    .user-card-details .user-rules-actions {
      margin-bottom: 15px; /* Adjust spacing */
    }

    .user-card-details .rules-list-header {
      margin-bottom: 5px;
    }

    .user-card-details .rules-table-wrapper {
      margin-bottom: 15px;
    }

    .user-card-details .user-rules-actions {
      margin-top: 0; /* Remove extra top margin */
      padding-top: 10px;
      border-top: 1px solid var(--border-color);
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

  // Handle when a user is found via search
  async function handleUserFound(userId, username) {
    const existingRulesContainer = container.querySelector(
      "#existing-rules-container"
    );
    let userCard = existingRulesContainer.querySelector(
      `.user-card[data-user-id="${userId}"]`
    );

    if (userCard) {
      // User card exists, scroll and expand
      statusDiv.innerHTML = `User found: <strong>${username}</strong> (ID: ${userId}). Expanding existing card.`;
      statusDiv.className = "user-search-status success";
      userCard.scrollIntoView({ behavior: "smooth", block: "center" });
      if (!userCard.classList.contains("expanded")) {
        await toggleUserCard(userCard, container);
      }
    } else {
      // User card doesn't exist, create and append it
      statusDiv.innerHTML = `User found: <strong>${username}</strong> (ID: ${userId}). Creating new card.`;
      statusDiv.className = "user-search-status success";
      log(`Creating new card for user ${userId} (${username})`);

      // Remove the 'no rules' placeholder if it exists
      const noRulesPlaceholder = existingRulesContainer.querySelector("p");
      if (
        noRulesPlaceholder &&
        noRulesPlaceholder.textContent.includes("No user rules defined yet")
      ) {
        existingRulesContainer.innerHTML = ""; // Clear the placeholder
      }

      // Create the new card element
      userCard = createUserCardElement(userId, username, 0, null); // Start with 0 rules

      // Attach event listeners
      attachCardEventListeners(userCard, container);

      // Append the new card to the container
      existingRulesContainer.appendChild(userCard);

      // Scroll to the new card and expand it
      userCard.scrollIntoView({ behavior: "smooth", block: "center" });
      await toggleUserCard(userCard, container); // Expand to load details
    }
    // Clear the search input
    searchInput.value = "";
  }
}

// Load and display rules for a specific user within their card details
async function loadRulesForUser(userId, detailsContainer) {
  try {
    const rulesTableBody = detailsContainer.querySelector(".rules-tbody");
    if (!rulesTableBody) {
      error(
        `Could not find .rules-tbody within provided container for user ${userId}`
      );
      return;
    }
    const userRules = await getUserRules(userId);

    if (!userRules || !userRules.rules || userRules.rules.length === 0) {
      rulesTableBody.innerHTML = `
        <tr class="empty-rules">
          <td colspan="5">No rules defined yet</td>
        </tr>
      `;
      return;
    }

    // Generate table rows for each rule
    rulesTableBody.innerHTML = userRules.rules
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
              <button class="button button--normal edit-inline-rule-btn" data-rule-id="${rule.id}">
                <i class="fa fa-pencil"></i>
              </button>
              <button class="button button--normal delete-inline-rule-btn" data-rule-id="${rule.id}">
                <i class="fa fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");

    // Add event listeners to edit and delete buttons within this specific table
    rulesTableBody.querySelectorAll(".edit-inline-rule-btn").forEach((btn) => {
      btn.addEventListener("click", () =>
        editInlineRule(userId, btn.dataset.ruleId, detailsContainer)
      );
    });

    rulesTableBody
      .querySelectorAll(".delete-inline-rule-btn")
      .forEach((btn) => {
        btn.addEventListener("click", () =>
          deleteInlineRule(userId, btn.dataset.ruleId, detailsContainer)
        );
      });
  } catch (err) {
    error(`Error loading rules for user ${userId}:`, err);
    if (detailsContainer.querySelector(".rules-tbody")) {
      detailsContainer.querySelector(".rules-tbody").innerHTML = `
          <tr>
            <td colspan="5">Error loading rules: ${err.message}</td>
          </tr>
        `;
    }
  }
}

// Edit an inline rule: Populate the inline form
async function editInlineRule(userId, ruleId, detailsContainer) {
  try {
    const userRules = await getUserRules(userId);
    if (!userRules || !userRules.rules) throw new Error("User rules not found");

    const rule = userRules.rules.find((r) => r.id === ruleId);
    if (!rule) throw new Error("Rule not found");

    const ruleForm = detailsContainer.querySelector(".rule-editor-form");
    const addRuleBtn = detailsContainer.querySelector(".add-rule-btn");
    const paramsContainer = ruleForm.querySelector(".rule-params-container");

    // Populate form
    ruleForm.querySelector(".rule-id").value = rule.id;
    ruleForm.querySelector(".rule-action").value = rule.action;
    ruleForm.querySelector(".rule-subject").value = rule.subject;
    ruleForm.querySelector(".rule-scope").value = rule.scope;

    // Update and populate params UI
    updateInlineParamsUI(rule.action, rule.params, paramsContainer);

    // Show form, hide add button
    ruleForm.style.display = "block";
    addRuleBtn.style.display = "none";
  } catch (err) {
    error(`Error preparing inline edit for rule ${ruleId}:`, err);
    alert(`Error editing rule: ${err.message}`);
  }
}

// Delete an inline rule
async function deleteInlineRule(userId, ruleId, detailsContainer) {
  if (!confirm("Are you sure you want to delete this rule?")) {
    return;
  }

  try {
    await deleteRuleForUser(userId, ruleId);

    // Reload rules display within this card
    await loadRulesForUser(userId, detailsContainer);
    // Update rule count in header
    const userRules = await getUserRules(userId);
    const ruleCount = userRules?.rules?.length || 0;
    const headerStats = detailsContainer
      .closest(".user-card")
      .querySelector(".user-stats");
    if (headerStats)
      headerStats.textContent = `${ruleCount} rule${ruleCount !== 1 ? "s" : ""}`;
  } catch (err) {
    error(`Error deleting inline rule ${ruleId}:`, err);
    alert(`Error deleting rule: ${err.message}`);
  }
}

// Load and display existing users with rules
async function loadExistingUsers(container) {
  try {
    const existingRulesContainer = container.querySelector(
      "#existing-rules-container"
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
        const cardElement = createUserCardElement(
          userId,
          userData.username || `User #${userId}`,
          ruleCount,
          userData.usernameColor
        );
        return cardElement.outerHTML;
      })
      .join("");

    existingRulesContainer.innerHTML = userCards;

    // Add event listeners to cards
    existingRulesContainer.querySelectorAll(".user-card").forEach((card) => {
      attachCardEventListeners(card, container);
    });
  } catch (err) {
    error("Error loading existing users:", err);
    container.querySelector("#existing-rules-container").innerHTML =
      `<p>Error loading existing users: ${err.message}</p>`;
  }
}

// Helper function to create a user card element
function createUserCardElement(
  userId,
  username,
  ruleCount = 0,
  usernameColor = null
) {
  const card = document.createElement("div");
  card.className = "user-card";
  card.dataset.userId = userId;
  card.dataset.username = username;

  const usernameStyle = usernameColor ? `style="color: ${usernameColor}"` : "";

  card.innerHTML = `
    <div class="user-card-header">
      <div class="user-info">
        <span class="user-name" ${usernameStyle}>${username}</span>
        <span class="user-stats">${ruleCount} rule${ruleCount !== 1 ? "s" : ""}</span>
      </div>
      <div class="user-card-actions">
        <button class="button button--icon expand-btn" title="Expand/Collapse">
          <i class="fa fa-chevron-right"></i>
        </button>
      </div>
    </div>
    <div class="user-card-details">
      <div class="loading-placeholder">Loading details...</div>
    </div>
  `;
  return card;
}

// Helper function to attach event listeners to a card
function attachCardEventListeners(cardElement, container) {
  const header = cardElement.querySelector(".user-card-header");
  const expandBtn = cardElement.querySelector(".expand-btn");

  if (header) {
    header.addEventListener("click", (event) => {
      // Prevent toggling if a button inside the header was clicked
      if (event.target.closest("button")) return;
      toggleUserCard(cardElement, container);
    });
  }

  if (expandBtn) {
    expandBtn.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent header click listener
      toggleUserCard(cardElement, container);
    });
  }
}
