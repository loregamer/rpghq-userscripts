/**
 * Hide Users Management Modal
 * Provides a UI for managing hidden users, including search, unhideing, and avatar replacement
 */

import { log, debug, error } from "../logger.js";
import { gmGetValue, gmSetValue } from "../../main.js";
import {
  IGNORED_USERS_KEY,
  REPLACED_AVATARS_KEY,
  toggleUserHide,
  replaceUserAvatar,
  resetUserAvatar,
  cleanUsername,
  getHiddenUsers,
  getReplacedAvatars,
} from "./hide.js";
import { searchUsers } from "../api/rpghqApi.js";

// Default avatar URL for fallback
const DEFAULT_AVATAR = "https://f.rpghq.org/OhUxAgzR9avp.png?n=pasted-file.png";

/**
 * Show the Hide users management modal
 */
export function showHideUsersModal() {
  log("Showing Hide users management modal");

  // Remove any existing modal
  const existingModal = document.getElementById("hide-users-modal");
  if (existingModal) {
    existingModal.remove();
  }

  // Create the modal element
  const modal = document.createElement("div");
  modal.id = "hide-users-modal";
  modal.className = "hide-modal";

  // Create the modal content
  modal.innerHTML = `
    <div class="hide-modal-dialog">
      <div class="hide-modal-header">
        <h3 class="hide-modal-title">Manage Hidden Users</h3>
        <button class="hide-modal-close" aria-label="Close">&times;</button>
      </div>
      
      <div class="hide-modal-body">
        <!-- User Search -->
        <div class="hide-user-search">
          <div class="hide-user-search-form">
            <input type="text" id="hide-search-input" placeholder="Search for users to hide...">
            <button id="hide-search-btn" class="button button--primary">
              <i class="fa fa-search"></i> Search
            </button>
          </div>
          <div class="hide-user-search-results"></div>
        </div>
        
        <!-- Currently Hidden Users -->
        <div class="hide-section">
          <h4 class="hide-section-title">
            <i class="fa fa-user-times"></i> Hidden Users 
            <span class="hide-user-count"></span>
          </h4>
          <div class="hidden-users-grid" id="hidden-users-grid"></div>
        </div>
        
        <!-- Avatar Replacement -->
        <div class="hide-section">
          <h4 class="hide-section-title">
            <i class="fa fa-image"></i> Avatar Replacement
            <span class="hide-avatar-count"></span>
          </h4>
          
          <div class="avatar-replacement-form">
            <div class="avatar-input-row">
              <input type="text" id="hide-user-id-input" placeholder="User ID" class="form-control">
              <input type="text" id="hide-avatar-url-input" placeholder="Image URL (128x128 or smaller)" class="form-control">
              <button id="hide-replace-avatar-btn" class="button button--primary">Replace</button>
              <button id="hide-reset-avatar-btn" class="button button--secondary">Reset</button>
            </div>
            
            <div class="avatar-preview">
              <div class="avatar-preview-text">Enter a valid user ID and image URL above to replace a user's avatar</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="hide-modal-footer">
        <button id="hide-reset-all-btn" class="button button--danger">
          <i class="fa fa-trash"></i> Reset All Hidden Users
        </button>
        <button id="hide-close-btn" class="button button--primary">
          <i class="fa fa-check"></i> Close
        </button>
      </div>
    </div>
  `;

  // Add the modal to the document
  document.body.appendChild(modal);

  // Add the modal styles
  addHideModalStyles();

  // Initialize the modal
  initHideUsersModal(modal);

  // Show the modal
  setTimeout(() => {
    modal.classList.add("active");
  }, 10);
}

/**
 * Initialize the Hide users management modal
 * @param {HTMLElement} modal - The modal element
 */
function initHideUsersModal(modal) {
  // Load and display current hidden users
  populateHiddenUsers();

  // Set up event listeners
  const closeBtn = modal.querySelector(".hide-modal-close");
  closeBtn.addEventListener("click", closeHideUsersModal);

  const closeBtn2 = modal.querySelector("#hide-close-btn");
  closeBtn2.addEventListener("click", closeHideUsersModal);

  // Setup user search
  const searchInput = modal.querySelector("#hide-search-input");
  const searchBtn = modal.querySelector("#hide-search-btn");

  searchBtn.addEventListener("click", () =>
    performUserSearch(searchInput.value),
  );
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      performUserSearch(searchInput.value);
    }
  });

  // Setup avatar replacement
  const userIdInput = modal.querySelector("#hide-user-id-input");
  const avatarUrlInput = modal.querySelector("#hide-avatar-url-input");
  const replaceBtn = modal.querySelector("#hide-replace-avatar-btn");
  const resetBtn = modal.querySelector("#hide-reset-avatar-btn");

  replaceBtn.addEventListener("click", () => {
    replaceAvatarAction(userIdInput.value, avatarUrlInput.value);
  });

  resetBtn.addEventListener("click", () => {
    resetAvatarAction(userIdInput.value);
  });

  // Setup avatar preview on input
  avatarUrlInput.addEventListener("input", () => {
    updateAvatarPreview(userIdInput.value, avatarUrlInput.value);
  });

  userIdInput.addEventListener("input", () => {
    updateAvatarPreview(userIdInput.value, avatarUrlInput.value);
  });

  // Setup reset all button
  const resetAllBtn = modal.querySelector("#hide-reset-all-btn");
  resetAllBtn.addEventListener("click", resetAllHiddenUsers);

  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeHideUsersModal();
    }
  });
}

/**
 * Close the Hide users management modal
 */
function closeHideUsersModal() {
  const modal = document.getElementById("hide-users-modal");
  if (modal) {
    modal.classList.remove("active");
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

/**
 * Add styles for the Hide users management modal
 */
function addHideModalStyles() {
  const styleId = "hide-modal-styles";
  if (document.getElementById(styleId)) return;

  const css = `
    .hide-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
    }
    
    .hide-modal.active {
      opacity: 1;
      pointer-events: auto;
    }
    
    .hide-modal-dialog {
      background-color: var(--bg-card);
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      animation: hide-modal-in 0.3s ease-out;
    }
    
    @keyframes hide-modal-in {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    .hide-modal-header {
      padding: 15px 20px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .hide-modal-title {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.3em;
    }
    
    .hide-modal-close {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 1.5em;
      cursor: pointer;
      padding: 0;
      transition: color 0.2s;
    }
    
    .hide-modal-close:hover {
      color: var(--text-primary);
    }
    
    .hide-modal-body {
      padding: 20px;
      overflow-y: auto;
      flex-grow: 1;
      max-height: calc(90vh - 150px);
    }
    
    .hide-modal-footer {
      padding: 15px 20px;
      border-top: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: rgba(0, 0, 0, 0.05);
    }
    
    .hide-section {
      margin-bottom: 20px;
      padding: 15px;
      background-color: var(--bg-dark);
      border-radius: 4px;
      border: 1px solid var(--border-color);
    }
    
    .hide-section-title {
      margin-top: 0;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-color);
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .hide-user-count,
    .hide-avatar-count {
      font-size: 0.9em;
      color: var(--text-secondary);
      font-weight: normal;
      margin-left: 5px;
    }
    
    .hide-search-status {
      margin-top: 10px;
      font-style: italic;
      color: var(--text-secondary);
    }
    
    .hide-user-item {
      display: flex;
      align-items: center;
      padding: 10px;
      background-color: var(--bg-card);
      border-radius: 4px;
      margin-bottom: 10px;
      border: 1px solid var(--border-color);
      transition: transform 0.2s;
    }
    
    .hide-user-item:hover {
      transform: translateY(-2px);
    }
    
    .hide-user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      margin-right: 10px;
    }
    
    .hide-user-name {
      flex: 1;
      color: var(--text-primary);
    }
    
    .hide-user-actions {
      display: flex;
      gap: 5px;
    }
    
    /* Empty state styling */
    .hide-empty-state {
      padding: 30px 15px;
      text-align: center;
      color: var(--text-secondary);
      font-style: italic;
      background-color: rgba(255, 255, 255, 0.02);
      border-radius: 4px;
    }
    
    /* Loading indicator */
    .hide-loading {
      text-align: center;
      padding: 20px;
      color: var(--text-secondary);
    }
    
    /* Hide styles from hide-styles.css */
    .hidden-users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    
    .hidden-user-tile {
      background-color: var(--bg-card);
      border-radius: 5px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      border: 1px solid var(--border-color);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .hidden-user-tile:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    .hidden-user-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      margin-bottom: 10px;
      object-fit: cover;
      border: 2px solid var(--border-color);
    }
    
    .hidden-user-name {
      color: var(--text-primary);
      font-size: 14px;
      text-align: center;
      word-break: break-word;
      margin-bottom: 8px;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .hidden-user-actions {
      display: flex;
      gap: 5px;
      margin-top: auto;
    }
    
    .hidden-user-unhide {
      background-color: var(--danger-color);
      color: white;
      border: none;
      border-radius: 3px;
      padding: 4px 8px;
      font-size: 12px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .hidden-user-unhide:hover {
      background-color: var(--danger-color-hover, darkred);
    }
    
    .hidden-user-visit {
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: 3px;
      padding: 4px 8px;
      font-size: 12px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .hidden-user-visit:hover {
      background-color: var(--primary-color-hover, darkblue);
    }
    
    /* Hide user search */
    .hide-user-search {
      margin-bottom: 20px;
    }
    
    .hide-user-search-form {
      display: flex;
      gap: 10px;
    }
    
    .hide-user-search-form input {
      flex: 1;
      padding: 8px 12px;
      background: var(--bg-dark);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      color: var(--text-primary);
    }
    
    .hide-user-search-results {
      margin-top: 15px;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .hide-user-search-result {
      display: flex;
      align-items: center;
      padding: 8px 10px;
      margin-bottom: 5px;
      background: var(--bg-dark);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .hide-user-search-result:hover {
      background-color: rgba(255,255,255,0.05);
    }
    
    .hide-user-search-result img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      margin-right: 10px;
    }
    
    /* Avatar replacement */
    .avatar-replacement-form {
      margin-top: 15px;
    }
    
    .avatar-input-row {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }
    
    .avatar-input-row input {
      flex: 1;
      padding: 8px 12px;
      background: var(--bg-dark);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      color: var(--text-primary);
    }
    
    .avatar-preview {
      margin-top: 10px;
      display: flex;
      gap: 20px;
      align-items: center;
    }
    
    .avatar-preview-image {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--border-color);
    }
    
    .avatar-preview-text {
      color: var(--text-secondary);
      font-style: italic;
    }
    
    /* Button utility classes */
    .button--danger {
      background-color: var(--danger-color, #e74c3c) !important;
    }
    
    .button--danger:hover {
      background-color: var(--danger-color-hover, #c0392b) !important;
    }
    
    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .hidden-users-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      }
      
      .hide-user-search-form {
        flex-direction: column;
      }
      
      .avatar-input-row {
        flex-direction: column;
      }
      
      .hide-modal-footer {
        flex-direction: column;
        gap: 10px;
      }
      
      .hide-modal-footer button {
        width: 100%;
      }
    }
  `;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = css;
  document.head.appendChild(style);
}

/**
 * Populate the hidden users grid
 */
function populateHiddenUsers() {
  const grid = document.getElementById("hidden-users-grid");
  if (!grid) return;

  const ignoredUsers = getHiddenUsers();
  const userCount = Object.keys(ignoredUsers).length;

  // Update user count
  const countElement = document.querySelector(".hide-user-count");
  if (countElement) {
    countElement.textContent = `(${userCount})`;
  }

  // Show empty state if no users are hidden
  if (userCount === 0) {
    grid.innerHTML = `
      <div class="hide-empty-state">
        <p>No users are currently hidden</p>
        <p>Use the search above to find and hide users</p>
      </div>
    `;
    return;
  }

  // Generate hidden user tiles
  const replacedAvatars = getReplacedAvatars();

  let html = "";

  // Convert to array and sort by username
  const users = Object.entries(ignoredUsers)
    .map(([userId, username]) => ({ userId, username }))
    .sort((a, b) => a.username.localeCompare(b.username));

  users.forEach(({ userId, username }) => {
    // Get custom avatar if available
    const avatarUrl =
      replacedAvatars[userId] ||
      `https://rpghq.org/forums/download/file.php?avatar=${userId}.jpg`;

    html += `
      <div class="hidden-user-tile" data-user-id="${userId}">
        <img
          class="hidden-user-avatar"
          src="${avatarUrl}"
          alt="${username}'s avatar"
          onerror="if(this.src.endsWith('.jpg')){this.src='https://rpghq.org/forums/download/file.php?avatar=${userId}.png';}else if(this.src.endsWith('.png')){this.src='https://rpghq.org/forums/download/file.php?avatar=${userId}.gif';}else{this.src='${DEFAULT_AVATAR}';}"
        >
        <div class="hidden-user-name" title="${username}">${username}</div>
        <div class="hidden-user-actions">
          <button class="hidden-user-unhide" title="Unhide User" data-user-id="${userId}">Unhide</button>
          <button class="hidden-user-visit" title="Visit Profile" data-user-id="${userId}">Profile</button>
        </div>
      </div>
    `;
  });

  // Update the grid
  grid.innerHTML = html;

  // Add event listeners to buttons
  grid.querySelectorAll(".hidden-user-unhide").forEach((button) => {
    button.addEventListener("click", () => {
      const userId = button.dataset.userId;
      const username = ignoredUsers[userId];
      unhideUser(userId, username);
    });
  });

  grid.querySelectorAll(".hidden-user-visit").forEach((button) => {
    button.addEventListener("click", () => {
      const userId = button.dataset.userId;
      visitUserProfile(userId);
    });
  });

  // Update avatar replacement count
  const avatarCount = Object.keys(replacedAvatars).length;
  const avatarCountElement = document.querySelector(".hide-avatar-count");
  if (avatarCountElement) {
    avatarCountElement.textContent = `(${avatarCount})`;
  }
}

/**
 * Unhide a user
 * @param {string} userId - The user ID
 * @param {string} username - The username
 */
function unhideUser(userId, username) {
  try {
    toggleUserHide(userId, username);

    // Update the UI
    populateHiddenUsers();

    // Show confirmation
    showStatusMessage(`Unhidden user: ${username}`);
  } catch (err) {
    error(`Error unhideing user ${userId}:`, err);
    showStatusMessage(`Error unhideing user: ${err.message}`, true);
  }
}

/**
 * Show a status message
 * @param {string} message - The message to show
 * @param {boolean} isError - Whether this is an error message
 */
function showStatusMessage(message, isError = false) {
  // Remove any existing status message
  const existing = document.querySelector(".hide-status-message");
  if (existing) {
    existing.remove();
  }

  // Create the message element
  const statusElement = document.createElement("div");
  statusElement.className = `hide-status-message ${isError ? "error" : "success"}`;
  statusElement.textContent = message;
  statusElement.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 10px 15px;
    border-radius: 4px;
    background-color: ${isError ? "var(--danger-color, #e74c3c)" : "var(--success-color, #2ecc71)"};
    color: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    transition: opacity 0.3s;
  `;

  document.body.appendChild(statusElement);

  // Remove after a delay
  setTimeout(() => {
    statusElement.style.opacity = "0";
    setTimeout(() => {
      statusElement.remove();
    }, 300);
  }, 3000);
}

/**
 * Visit a user's profile
 * @param {string} userId - The user ID
 */
function visitUserProfile(userId) {
  window.location.href = `https://rpghq.org/forums/memberlist.php?mode=viewprofile&u=${userId}`;
}

/**
 * Perform a user search
 * @param {string} query - The search query
 */
async function performUserSearch(query) {
  const resultsContainer = document.querySelector(".hide-user-search-results");
  if (!resultsContainer) return;

  // Clear previous results
  resultsContainer.innerHTML = '<div class="hide-loading">Searching...</div>';

  if (!query.trim()) {
    resultsContainer.innerHTML =
      '<div class="hide-empty-state">Enter a username to search</div>';
    return;
  }

  try {
    // Perform the search
    const results = await searchUsers(query);

    // Filter to only include users
    const users = results.filter((item) => item.type === "user");

    if (users.length === 0) {
      resultsContainer.innerHTML = `<div class="hide-empty-state">No users found matching "${query}"</div>`;
      return;
    }

    // Generate search results HTML
    let html = "";
    users.forEach((user) => {
      const userId = user.user_id;
      const username = user.value || user.key || "Unknown User";

      html += `
        <div class="hide-user-search-result" data-user-id="${userId}" data-username="${username}">
          <img 
            src="https://rpghq.org/forums/download/file.php?avatar=${userId}.jpg" 
            alt="${username}'s avatar"
            onerror="if(this.src.endsWith('.jpg')){this.src='https://rpghq.org/forums/download/file.php?avatar=${userId}.png';}else if(this.src.endsWith('.png')){this.src='https://rpghq.org/forums/download/file.php?avatar=${userId}.gif';}else{this.src='${DEFAULT_AVATAR}';}"
          >
          <span>${username}</span>
        </div>
      `;
    });

    // Update the results container
    resultsContainer.innerHTML = html;

    // Add event listeners to results
    resultsContainer
      .querySelectorAll(".hide-user-search-result")
      .forEach((result) => {
        result.addEventListener("click", () => {
          const userId = result.dataset.userId;
          const username = result.dataset.username;

          // Check if user is already hidden
          const ignoredUsers = getHiddenUsers();
          if (ignoredUsers[userId]) {
            showStatusMessage(`${username} is already hidden`, true);
            return;
          }

          // Hide the user
          hideUser(userId, username);
        });
      });
  } catch (err) {
    error("Error searching for users:", err);
    resultsContainer.innerHTML = `<div class="hide-empty-state">Error searching for users: ${err.message}</div>`;
  }
}

/**
 * Hide a user
 * @param {string} userId - The user ID
 * @param {string} username - The username
 */
function hideUser(userId, username) {
  try {
    toggleUserHide(userId, username);

    // Update the UI
    populateHiddenUsers();

    // Show confirmation
    showStatusMessage(`Hidden user: ${username}`);

    // Clear search results
    const resultsContainer = document.querySelector(
      ".hide-user-search-results",
    );
    if (resultsContainer) {
      resultsContainer.innerHTML = "";
    }

    // Clear search input
    const searchInput = document.querySelector("#hide-search-input");
    if (searchInput) {
      searchInput.value = "";
    }
  } catch (err) {
    error(`Error hideing user ${userId}:`, err);
    showStatusMessage(`Error hideing user: ${err.message}`, true);
  }
}

/**
 * Update the avatar preview
 * @param {string} userId - The user ID
 * @param {string} url - The avatar URL
 */
function updateAvatarPreview(userId, url) {
  const previewElement = document.querySelector(".avatar-preview");
  if (!previewElement) return;

  // Check if we have both userId and URL
  if (!userId || !url) {
    previewElement.innerHTML = `
      <div class="avatar-preview-text">Enter a valid user ID and image URL above to replace a user's avatar</div>
    `;
    return;
  }

  // Create preview image
  previewElement.innerHTML = `
    <img 
      src="${url}" 
      alt="Preview" 
      class="avatar-preview-image"
      onerror="this.src='${DEFAULT_AVATAR}'; this.onerror=null;"
    >
    <div class="avatar-preview-text">Preview for User ID: ${userId}</div>
  `;
}

/**
 * Replace a user's avatar
 * @param {string} userId - The user ID
 * @param {string} url - The avatar URL
 */
async function replaceAvatarAction(userId, url) {
  if (!userId || !url) {
    showStatusMessage("Please enter both a User ID and Image URL", true);
    return;
  }

  try {
    await replaceUserAvatar(userId, url);

    // Update the UI
    populateHiddenUsers();

    // Show confirmation
    showStatusMessage(`Avatar replaced for user ID: ${userId}`);

    // Clear inputs
    const userIdInput = document.querySelector("#hide-user-id-input");
    const avatarUrlInput = document.querySelector("#hide-avatar-url-input");

    if (userIdInput) userIdInput.value = "";
    if (avatarUrlInput) avatarUrlInput.value = "";

    // Update preview
    updateAvatarPreview("", "");
  } catch (err) {
    error(`Error replacing avatar for user ${userId}:`, err);
    showStatusMessage(`Error replacing avatar: ${err.message}`, true);
  }
}

/**
 * Reset a user's avatar to default
 * @param {string} userId - The user ID
 */
function resetAvatarAction(userId) {
  if (!userId) {
    showStatusMessage("Please enter a User ID", true);
    return;
  }

  try {
    resetUserAvatar(userId);

    // Update the UI
    populateHiddenUsers();

    // Show confirmation
    showStatusMessage(`Avatar reset for user ID: ${userId}`);

    // Clear inputs
    const userIdInput = document.querySelector("#hide-user-id-input");
    const avatarUrlInput = document.querySelector("#hide-avatar-url-input");

    if (userIdInput) userIdInput.value = "";
    if (avatarUrlInput) avatarUrlInput.value = "";

    // Update preview
    updateAvatarPreview("", "");
  } catch (err) {
    error(`Error resetting avatar for user ${userId}:`, err);
    showStatusMessage(`Error resetting avatar: ${err.message}`, true);
  }
}

/**
 * Reset all hidden users
 */
function resetAllHiddenUsers() {
  if (
    !confirm(
      "Are you sure you want to reset ALL hidden users? This cannot be undone!",
    )
  ) {
    return;
  }

  try {
    gmSetValue(IGNORED_USERS_KEY, {});

    // Update the UI
    populateHiddenUsers();

    // Show confirmation
    showStatusMessage("All hidden users have been reset");
  } catch (err) {
    error("Error resetting all hidden users:", err);
    showStatusMessage(`Error resetting hidden users: ${err.message}`, true);
  }
}
