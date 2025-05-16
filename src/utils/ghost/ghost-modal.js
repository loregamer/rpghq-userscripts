/**
 * Ghost Users Management Modal
 * Provides a UI for managing ghosted users, including search, unghosting, and avatar replacement
 */

import { log, debug, error } from "../logger.js";
import { gmGetValue, gmSetValue } from "../../main.js";
import {
  IGNORED_USERS_KEY,
  REPLACED_AVATARS_KEY,
  toggleUserGhost,
  replaceUserAvatar,
  resetUserAvatar,
  cleanUsername,
  getGhostedUsers,
  getReplacedAvatars,
} from "./ghost.js";
import { searchUsers } from "../api/rpghqApi.js";

// Default avatar URL for fallback
const DEFAULT_AVATAR = "https://f.rpghq.org/OhUxAgzR9avp.png?n=pasted-file.png";

/**
 * Show the Ghost users management modal
 */
export function showGhostUsersModal() {
  log("Showing Ghost users management modal");

  // Remove any existing modal
  const existingModal = document.getElementById("ghost-users-modal");
  if (existingModal) {
    existingModal.remove();
  }

  // Create the modal element
  const modal = document.createElement("div");
  modal.id = "ghost-users-modal";
  modal.className = "ghost-modal";

  // Create the modal content
  modal.innerHTML = `
    <div class="ghost-modal-dialog">
      <div class="ghost-modal-header">
        <h3 class="ghost-modal-title">Manage Ghosted Users</h3>
        <button class="ghost-modal-close" aria-label="Close">&times;</button>
      </div>
      
      <div class="ghost-modal-body">
        <!-- User Search -->
        <div class="ghost-user-search">
          <div class="ghost-user-search-form">
            <input type="text" id="ghost-search-input" placeholder="Search for users to ghost...">
            <button id="ghost-search-btn" class="button button--primary">
              <i class="fa fa-search"></i> Search
            </button>
          </div>
          <div class="ghost-user-search-results"></div>
        </div>
        
        <!-- Currently Ghosted Users -->
        <div class="ghost-section">
          <h4 class="ghost-section-title">
            <i class="fa fa-user-times"></i> Ghosted Users 
            <span class="ghost-user-count"></span>
          </h4>
          <div class="ghosted-users-grid" id="ghosted-users-grid"></div>
        </div>
        
        <!-- Avatar Replacement -->
        <div class="ghost-section">
          <h4 class="ghost-section-title">
            <i class="fa fa-image"></i> Avatar Replacement
            <span class="ghost-avatar-count"></span>
          </h4>
          
          <div class="avatar-replacement-form">
            <div class="avatar-input-row">
              <input type="text" id="ghost-user-id-input" placeholder="User ID" class="form-control">
              <input type="text" id="ghost-avatar-url-input" placeholder="Image URL (128x128 or smaller)" class="form-control">
              <button id="ghost-replace-avatar-btn" class="button button--primary">Replace</button>
              <button id="ghost-reset-avatar-btn" class="button button--secondary">Reset</button>
            </div>
            
            <div class="avatar-preview">
              <div class="avatar-preview-text">Enter a valid user ID and image URL above to replace a user's avatar</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="ghost-modal-footer">
        <button id="ghost-reset-all-btn" class="button button--danger">
          <i class="fa fa-trash"></i> Reset All Ghosted Users
        </button>
        <button id="ghost-close-btn" class="button button--primary">
          <i class="fa fa-check"></i> Close
        </button>
      </div>
    </div>
  `;

  // Add the modal to the document
  document.body.appendChild(modal);

  // Add the modal styles
  addGhostModalStyles();

  // Initialize the modal
  initGhostUsersModal(modal);

  // Show the modal
  setTimeout(() => {
    modal.classList.add("active");
  }, 10);
}

/**
 * Initialize the Ghost users management modal
 * @param {HTMLElement} modal - The modal element
 */
function initGhostUsersModal(modal) {
  // Load and display current ghosted users
  populateGhostedUsers();

  // Set up event listeners
  const closeBtn = modal.querySelector(".ghost-modal-close");
  closeBtn.addEventListener("click", closeGhostUsersModal);

  const closeBtn2 = modal.querySelector("#ghost-close-btn");
  closeBtn2.addEventListener("click", closeGhostUsersModal);

  // Setup user search
  const searchInput = modal.querySelector("#ghost-search-input");
  const searchBtn = modal.querySelector("#ghost-search-btn");

  searchBtn.addEventListener("click", () =>
    performUserSearch(searchInput.value),
  );
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      performUserSearch(searchInput.value);
    }
  });

  // Setup avatar replacement
  const userIdInput = modal.querySelector("#ghost-user-id-input");
  const avatarUrlInput = modal.querySelector("#ghost-avatar-url-input");
  const replaceBtn = modal.querySelector("#ghost-replace-avatar-btn");
  const resetBtn = modal.querySelector("#ghost-reset-avatar-btn");

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
  const resetAllBtn = modal.querySelector("#ghost-reset-all-btn");
  resetAllBtn.addEventListener("click", resetAllGhostedUsers);

  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeGhostUsersModal();
    }
  });
}

/**
 * Close the Ghost users management modal
 */
function closeGhostUsersModal() {
  const modal = document.getElementById("ghost-users-modal");
  if (modal) {
    modal.classList.remove("active");
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

/**
 * Add styles for the Ghost users management modal
 */
function addGhostModalStyles() {
  const styleId = "ghost-modal-styles";
  if (document.getElementById(styleId)) return;

  const css = `
    .ghost-modal {
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
    
    .ghost-modal.active {
      opacity: 1;
      pointer-events: auto;
    }
    
    .ghost-modal-dialog {
      background-color: var(--bg-card);
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      animation: ghost-modal-in 0.3s ease-out;
    }
    
    @keyframes ghost-modal-in {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    .ghost-modal-header {
      padding: 15px 20px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .ghost-modal-title {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.3em;
    }
    
    .ghost-modal-close {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 1.5em;
      cursor: pointer;
      padding: 0;
      transition: color 0.2s;
    }
    
    .ghost-modal-close:hover {
      color: var(--text-primary);
    }
    
    .ghost-modal-body {
      padding: 20px;
      overflow-y: auto;
      flex-grow: 1;
      max-height: calc(90vh - 150px);
    }
    
    .ghost-modal-footer {
      padding: 15px 20px;
      border-top: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: rgba(0, 0, 0, 0.05);
    }
    
    .ghost-section {
      margin-bottom: 20px;
      padding: 15px;
      background-color: var(--bg-dark);
      border-radius: 4px;
      border: 1px solid var(--border-color);
    }
    
    .ghost-section-title {
      margin-top: 0;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-color);
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .ghost-user-count,
    .ghost-avatar-count {
      font-size: 0.9em;
      color: var(--text-secondary);
      font-weight: normal;
      margin-left: 5px;
    }
    
    .ghost-search-status {
      margin-top: 10px;
      font-style: italic;
      color: var(--text-secondary);
    }
    
    .ghost-user-item {
      display: flex;
      align-items: center;
      padding: 10px;
      background-color: var(--bg-card);
      border-radius: 4px;
      margin-bottom: 10px;
      border: 1px solid var(--border-color);
      transition: transform 0.2s;
    }
    
    .ghost-user-item:hover {
      transform: translateY(-2px);
    }
    
    .ghost-user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      margin-right: 10px;
    }
    
    .ghost-user-name {
      flex: 1;
      color: var(--text-primary);
    }
    
    .ghost-user-actions {
      display: flex;
      gap: 5px;
    }
    
    /* Empty state styling */
    .ghost-empty-state {
      padding: 30px 15px;
      text-align: center;
      color: var(--text-secondary);
      font-style: italic;
      background-color: rgba(255, 255, 255, 0.02);
      border-radius: 4px;
    }
    
    /* Loading indicator */
    .ghost-loading {
      text-align: center;
      padding: 20px;
      color: var(--text-secondary);
    }
    
    /* Ghost styles from ghost-styles.css */
    .ghosted-users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    
    .ghosted-user-tile {
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
    
    .ghosted-user-tile:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    .ghosted-user-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      margin-bottom: 10px;
      object-fit: cover;
      border: 2px solid var(--border-color);
    }
    
    .ghosted-user-name {
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
    
    .ghosted-user-actions {
      display: flex;
      gap: 5px;
      margin-top: auto;
    }
    
    .ghosted-user-unghost {
      background-color: var(--danger-color);
      color: white;
      border: none;
      border-radius: 3px;
      padding: 4px 8px;
      font-size: 12px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .ghosted-user-unghost:hover {
      background-color: var(--danger-color-hover, darkred);
    }
    
    .ghosted-user-visit {
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: 3px;
      padding: 4px 8px;
      font-size: 12px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .ghosted-user-visit:hover {
      background-color: var(--primary-color-hover, darkblue);
    }
    
    /* Ghost user search */
    .ghost-user-search {
      margin-bottom: 20px;
    }
    
    .ghost-user-search-form {
      display: flex;
      gap: 10px;
    }
    
    .ghost-user-search-form input {
      flex: 1;
      padding: 8px 12px;
      background: var(--bg-dark);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      color: var(--text-primary);
    }
    
    .ghost-user-search-results {
      margin-top: 15px;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .ghost-user-search-result {
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
    
    .ghost-user-search-result:hover {
      background-color: rgba(255,255,255,0.05);
    }
    
    .ghost-user-search-result img {
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
      .ghosted-users-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      }
      
      .ghost-user-search-form {
        flex-direction: column;
      }
      
      .avatar-input-row {
        flex-direction: column;
      }
      
      .ghost-modal-footer {
        flex-direction: column;
        gap: 10px;
      }
      
      .ghost-modal-footer button {
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
 * Populate the ghosted users grid
 */
function populateGhostedUsers() {
  const grid = document.getElementById("ghosted-users-grid");
  if (!grid) return;

  const ignoredUsers = getGhostedUsers();
  const userCount = Object.keys(ignoredUsers).length;

  // Update user count
  const countElement = document.querySelector(".ghost-user-count");
  if (countElement) {
    countElement.textContent = `(${userCount})`;
  }

  // Show empty state if no users are ghosted
  if (userCount === 0) {
    grid.innerHTML = `
      <div class="ghost-empty-state">
        <p>No users are currently ghosted</p>
        <p>Use the search above to find and ghost users</p>
      </div>
    `;
    return;
  }

  // Generate ghosted user tiles
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
      <div class="ghosted-user-tile" data-user-id="${userId}">
        <img
          class="ghosted-user-avatar"
          src="${avatarUrl}"
          alt="${username}'s avatar"
          onerror="if(this.src.endsWith('.jpg')){this.src='https://rpghq.org/forums/download/file.php?avatar=${userId}.png';}else if(this.src.endsWith('.png')){this.src='https://rpghq.org/forums/download/file.php?avatar=${userId}.gif';}else{this.src='${DEFAULT_AVATAR}';}"
        >
        <div class="ghosted-user-name" title="${username}">${username}</div>
        <div class="ghosted-user-actions">
          <button class="ghosted-user-unghost" title="Unghost User" data-user-id="${userId}">Unghost</button>
          <button class="ghosted-user-visit" title="Visit Profile" data-user-id="${userId}">Profile</button>
        </div>
      </div>
    `;
  });

  // Update the grid
  grid.innerHTML = html;

  // Add event listeners to buttons
  grid.querySelectorAll(".ghosted-user-unghost").forEach((button) => {
    button.addEventListener("click", () => {
      const userId = button.dataset.userId;
      const username = ignoredUsers[userId];
      unghostUser(userId, username);
    });
  });

  grid.querySelectorAll(".ghosted-user-visit").forEach((button) => {
    button.addEventListener("click", () => {
      const userId = button.dataset.userId;
      visitUserProfile(userId);
    });
  });

  // Update avatar replacement count
  const avatarCount = Object.keys(replacedAvatars).length;
  const avatarCountElement = document.querySelector(".ghost-avatar-count");
  if (avatarCountElement) {
    avatarCountElement.textContent = `(${avatarCount})`;
  }
}

/**
 * Unghost a user
 * @param {string} userId - The user ID
 * @param {string} username - The username
 */
function unghostUser(userId, username) {
  try {
    toggleUserGhost(userId, username);

    // Update the UI
    populateGhostedUsers();

    // Show confirmation
    showStatusMessage(`Unghosted user: ${username}`);
  } catch (err) {
    error(`Error unghosting user ${userId}:`, err);
    showStatusMessage(`Error unghosting user: ${err.message}`, true);
  }
}

/**
 * Show a status message
 * @param {string} message - The message to show
 * @param {boolean} isError - Whether this is an error message
 */
function showStatusMessage(message, isError = false) {
  // Remove any existing status message
  const existing = document.querySelector(".ghost-status-message");
  if (existing) {
    existing.remove();
  }

  // Create the message element
  const statusElement = document.createElement("div");
  statusElement.className = `ghost-status-message ${isError ? "error" : "success"}`;
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
  const resultsContainer = document.querySelector(".ghost-user-search-results");
  if (!resultsContainer) return;

  // Clear previous results
  resultsContainer.innerHTML = '<div class="ghost-loading">Searching...</div>';

  if (!query.trim()) {
    resultsContainer.innerHTML =
      '<div class="ghost-empty-state">Enter a username to search</div>';
    return;
  }

  try {
    // Perform the search
    const results = await searchUsers(query);

    // Filter to only include users
    const users = results.filter((item) => item.type === "user");

    if (users.length === 0) {
      resultsContainer.innerHTML = `<div class="ghost-empty-state">No users found matching "${query}"</div>`;
      return;
    }

    // Generate search results HTML
    let html = "";
    users.forEach((user) => {
      const userId = user.user_id;
      const username = user.value || user.key || "Unknown User";

      html += `
        <div class="ghost-user-search-result" data-user-id="${userId}" data-username="${username}">
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
      .querySelectorAll(".ghost-user-search-result")
      .forEach((result) => {
        result.addEventListener("click", () => {
          const userId = result.dataset.userId;
          const username = result.dataset.username;

          // Check if user is already ghosted
          const ignoredUsers = getGhostedUsers();
          if (ignoredUsers[userId]) {
            showStatusMessage(`${username} is already ghosted`, true);
            return;
          }

          // Ghost the user
          ghostUser(userId, username);
        });
      });
  } catch (err) {
    error("Error searching for users:", err);
    resultsContainer.innerHTML = `<div class="ghost-empty-state">Error searching for users: ${err.message}</div>`;
  }
}

/**
 * Ghost a user
 * @param {string} userId - The user ID
 * @param {string} username - The username
 */
function ghostUser(userId, username) {
  try {
    toggleUserGhost(userId, username);

    // Update the UI
    populateGhostedUsers();

    // Show confirmation
    showStatusMessage(`Ghosted user: ${username}`);

    // Clear search results
    const resultsContainer = document.querySelector(
      ".ghost-user-search-results",
    );
    if (resultsContainer) {
      resultsContainer.innerHTML = "";
    }

    // Clear search input
    const searchInput = document.querySelector("#ghost-search-input");
    if (searchInput) {
      searchInput.value = "";
    }
  } catch (err) {
    error(`Error ghosting user ${userId}:`, err);
    showStatusMessage(`Error ghosting user: ${err.message}`, true);
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
    populateGhostedUsers();

    // Show confirmation
    showStatusMessage(`Avatar replaced for user ID: ${userId}`);

    // Clear inputs
    const userIdInput = document.querySelector("#ghost-user-id-input");
    const avatarUrlInput = document.querySelector("#ghost-avatar-url-input");

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
    populateGhostedUsers();

    // Show confirmation
    showStatusMessage(`Avatar reset for user ID: ${userId}`);

    // Clear inputs
    const userIdInput = document.querySelector("#ghost-user-id-input");
    const avatarUrlInput = document.querySelector("#ghost-avatar-url-input");

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
 * Reset all ghosted users
 */
function resetAllGhostedUsers() {
  if (
    !confirm(
      "Are you sure you want to reset ALL ghosted users? This cannot be undone!",
    )
  ) {
    return;
  }

  try {
    gmSetValue(IGNORED_USERS_KEY, {});

    // Update the UI
    populateGhostedUsers();

    // Show confirmation
    showStatusMessage("All ghosted users have been reset");
  } catch (err) {
    error("Error resetting all ghosted users:", err);
    showStatusMessage(`Error resetting ghosted users: ${err.message}`, true);
  }
}
