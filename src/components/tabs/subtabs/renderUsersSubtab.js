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
      <i class="fa fa-wrench"></i> Work In Progress
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
    <div class="user-settings-list">
      <div class="user-setting-row">
        <i class="fa fa-user-circle user-setting-icon"></i>
        <label for="avatar-override-${userId}" class="user-setting-label">Avatar Override:</label>
        <input type="text" id="avatar-override-${userId}" class="form-control avatar-override-input" value="${userRules?.avatarOverride || ""}" placeholder="Image URL or leave blank">
      </div>
      <div class="user-setting-row">
        <i class="fa fa-paint-brush user-setting-icon"></i>
        <label for="color-override-${userId}" class="user-setting-label">Color Override:</label>
        <input type="color" id="color-override-${userId}" class="form-control color-override-input" value="${userRules?.usernameColor || "#000000"}">
        <span class="color-preview username-preview" style="color: ${userRules?.usernameColor || "inherit"}">${username}</span>
        <button type="button" class="button button--small clear-color-btn" title="Clear Color" style="margin-left:6px;">Clear</button>
      </div>
      <div class="user-setting-row">
        <i class="fa fa-comments user-setting-icon"></i>
        <label for="threads-setting-${userId}" class="user-setting-label">Threads:</label>
        <select id="threads-setting-${userId}" class="form-control threads-setting-input">
          <option value="" ${!userRules?.threads ? "selected" : ""}></option>
          <option value="HIGHLIGHT" ${userRules?.threads === "HIGHLIGHT" ? "selected" : ""}>Highlight</option>
          <option value="HIDE" ${userRules?.threads === "HIDE" ? "selected" : ""}>Hide</option>
        </select>
      </div>
      <div class="user-setting-row">
        <i class="fa fa-file-text user-setting-icon"></i>
        <label for="posts-setting-${userId}" class="user-setting-label">Posts:</label>
        <select id="posts-setting-${userId}" class="form-control posts-setting-input">
          <option value="" ${!userRules?.posts ? "selected" : ""}></option>
          <option value="HIGHLIGHT" ${userRules?.posts === "HIGHLIGHT" ? "selected" : ""}>Highlight</option>
          <option value="HIDE" ${userRules?.posts === "HIDE" ? "selected" : ""}>Hide</option>
        </select>
      </div>
      <div class="user-setting-row">
        <i class="fa fa-at user-setting-icon"></i>
        <label for="mentions-setting-${userId}" class="user-setting-label">Mentions:</label>
        <select id="mentions-setting-${userId}" class="form-control mentions-setting-input">
          <option value="" ${!userRules?.mentions ? "selected" : ""}></option>
          <option value="HIGHLIGHT" ${userRules?.mentions === "HIGHLIGHT" ? "selected" : ""}>Highlight</option>
          <option value="HIDE" ${userRules?.mentions === "HIDE" ? "selected" : ""}>Hide</option>
        </select>
      </div>
      <div class="user-settings-actions">
        <button class="button button--normal delete-user-rules-btn">Delete User</button>
      </div>
    </div>
  `;

  // Add event listeners for color preview and delete action
  const colorInput = detailsContainer.querySelector(".color-override-input");
  const usernamePreview = detailsContainer.querySelector(".username-preview");
  const clearColorBtn = detailsContainer.querySelector(".clear-color-btn");
  colorInput.addEventListener("input", () => {
    usernamePreview.style.color =
      colorInput.value === "#000000" ? "inherit" : colorInput.value;
  });
  if (clearColorBtn) {
    clearColorBtn.addEventListener("click", () => {
      colorInput.value = "#000000";
      usernamePreview.style.color = "inherit";
      colorInput.dispatchEvent(new Event("change"));
    });
  }

  // Auto-save on any input change
  const autoSave = async () => {
    try {
      const avatarOverride = detailsContainer.querySelector(
        ".avatar-override-input",
      ).value;
      const usernameColor =
        colorInput.value !== "#000000" ? colorInput.value : null;
      const threads = detailsContainer.querySelector(
        ".threads-setting-input",
      ).value;
      const posts = detailsContainer.querySelector(
        ".posts-setting-input",
      ).value;
      const mentions = detailsContainer.querySelector(
        ".mentions-setting-input",
      ).value;
      const username = detailsContainer.closest(".user-card").dataset.username;
      await updateUserRules(userId, {
        username,
        avatarOverride,
        usernameColor,
        threads,
        posts,
        mentions,
      });
      updateUserRuleCount(detailsContainer.closest(".user-card"));
    } catch (err) {
      error(`Error auto-saving settings for user ${userId}:`, err);
    }
  };

  detailsContainer
    .querySelectorAll(
      ".avatar-override-input, .color-override-input, .threads-setting-input, .posts-setting-input, .mentions-setting-input",
    )
    .forEach((input) => {
      input.addEventListener("change", autoSave);
      input.addEventListener("input", autoSave);
    });

  detailsContainer
    .querySelector(".delete-user-rules-btn")
    .addEventListener("click", async () => {
      if (
        !confirm(
          `Are you sure you want to delete all rules for user ${userId}?`,
        )
      )
        return;
      try {
        await deleteUserRules(userId);
        await renderUserDetails(userId, detailsContainer, mainContainer);
        updateUserRuleCount(detailsContainer.closest(".user-card"));
      } catch (err) {
        error(`Error deleting rules for user ${userId}:`, err);
        alert(`Error deleting rules: ${err.message}`);
      }
    });

  // Set rule count on open
  setTimeout(() => {
    updateUserRuleCount(detailsContainer.closest(".user-card"));
  }, 0);
}

// Add CSS styles for the user rules UI
function addRuleManagementStyles() {
  const styleId = "user-rules-management-styles";
  if (document.getElementById(styleId)) return;

  const css = `
    .user-settings-list {
      display: flex;
      flex-direction: column;
      gap: 18px;
      margin-bottom: 20px;
    }
    .user-setting-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 0;
    }
    .user-setting-icon {
      font-size: 1.3em;
      color: var(--primary-color);
      min-width: 24px;
      text-align: center;
    }
    .user-setting-label {
      min-width: 110px;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .user-settings-actions {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    .color-preview.username-preview {
      margin-left: 10px;
      font-weight: bold;
      padding: 2px 8px;
      border-radius: 3px;
      background: var(--bg-dark);
      border: 1px solid var(--border-color);
    }
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
      "#existing-rules-container",
    );
    let userCard = existingRulesContainer.querySelector(
      `.user-card[data-user-id="${userId}"]`,
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
      const userData = await getUserRules(userId);
      const ruleCount = getUserRuleCount(userData);
      userCard = createUserCardElement(
        userId,
        username,
        ruleCount,
        userData?.usernameColor,
      );

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

// Helper to count all non-empty user settings as rules
function getUserRuleCount(userData) {
  if (!userData) return 0;
  let count = 0;
  if (userData.avatarOverride) count++;
  if (userData.usernameColor && userData.usernameColor !== "#000000") count++;
  if (userData.threads) count++;
  if (userData.posts) count++;
  if (userData.mentions) count++;
  return count;
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
        const ruleCount = getUserRuleCount(userData);
        const cardElement = createUserCardElement(
          userId,
          userData.username || `User #${userId}`,
          ruleCount,
          userData.usernameColor,
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
  usernameColor = null,
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
        <span class="user-stats user-rule-count">${ruleCount} rule${ruleCount !== 1 ? "s" : ""}</span>
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

// Helper to update the rule count display on the user card
function updateUserRuleCount(userCard) {
  if (!userCard) return;
  // Count non-empty settings as rules
  const details = userCard.querySelector(".user-card-details");
  if (!details) return;
  const avatar = details.querySelector(".avatar-override-input")?.value?.trim();
  const color = details.querySelector(".color-override-input")?.value;
  const threads = details.querySelector(".threads-setting-input")?.value;
  const posts = details.querySelector(".posts-setting-input")?.value;
  const mentions = details.querySelector(".mentions-setting-input")?.value;
  let count = 0;
  if (avatar) count++;
  if (color && color !== "#000000") count++;
  if (threads) count++;
  if (posts) count++;
  if (mentions) count++;
  const countEl = userCard.querySelector(".user-rule-count");
  if (countEl) {
    countEl.textContent = `${count} rule${count !== 1 ? "s" : ""}`;
  }
}
