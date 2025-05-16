/**
 * Renders the "Users" subtab content with Hide functionality
 * Replaces the previous work-in-progress implementation
 *
 * @param {HTMLElement} container - The container element to render into
 */
import { log, debug, error } from "../../../utils/logger.js";
import { gmGetValue, gmSetValue } from "../../../main.js";
import { searchUsers } from "../../../utils/api/rpghqApi.js"; // Import the search function
import {
  HIDE_CONFIG_KEY,
  IGNORED_USERS_KEY,
  REPLACED_AVATARS_KEY,
  HIDDEN_MANUAL_POSTS_KEY,
  USER_COLORS_KEY,
  DEFAULT_CONFIG,
  toggleUserHide,
  replaceUserAvatar,
  resetUserAvatar,
  getHiddenUsers,
  getReplacedAvatars,
} from "../../../utils/hide/hide.js";

export function renderUsersSubtab(container) {
  log("Rendering Users subtab with Hide functionality...");

  // Create the main structure for the Hide subtab
  container.innerHTML = `
    <div class="preferences-section">
      <div class="preferences-section-header">
        <h3 class="preferences-section-title">Hide Settings</h3>
      </div>
      <div class="preferences-section-body">
        <p class="preference-description">
          Configure how Hide hides and highlights content from users you've chosen to hide.
          Hide allows you to hide posts, topics, and mentions from specific users.
        </p>

        <!-- Hide Appearance Settings -->
        <div class="hide-settings-container">
          <h4 class="settings-group-title">Appearance</h4>
          
          <div class="setting-row">
            <div class="setting-label">
              <label for="hide-author-color">Author Highlight Color:</label>
              <div class="setting-description">Color for content by hidden authors</div>
            </div>
            <div class="setting-control">
              <input type="text" id="hide-author-color" class="color-input" 
                     placeholder="rgba(255, 0, 0, 0.1)">
              <div class="color-preview" id="author-color-preview"></div>
            </div>
          </div>
          
          <div class="setting-row">
            <div class="setting-label">
              <label for="hide-content-color">Content Highlight Color:</label>
              <div class="setting-description">Color for content mentioning hidden users</div>
            </div>
            <div class="setting-control">
              <input type="text" id="hide-content-color" class="color-input"
                     placeholder="rgba(255, 128, 0, 0.1)">
              <div class="color-preview" id="content-color-preview"></div>
            </div>
          </div>
        </div>

        <!-- Hide Behavior Settings -->
        <div class="hide-settings-container">
          <h4 class="settings-group-title">Behavior</h4>
          
          <div class="setting-row">
            <div class="setting-label">
              <label for="hide-hide-entire-row">Hide Entire Row:</label>
              <div class="setting-description">When enabled, hides the entire topic row instead of just the lastpost</div>
            </div>
            <div class="setting-control">
              <div class="toggle-switch">
                <input type="checkbox" id="hide-hide-entire-row" class="toggle-input">
                <label for="hide-hide-entire-row" class="toggle-label"></label>
              </div>
            </div>
          </div>
          
          <div class="setting-row">
            <div class="setting-label">
              <label for="hide-hide-topic-creations">Hide Topic Creations:</label>
              <div class="setting-description">When enabled, hides topics created by hidden users</div>
            </div>
            <div class="setting-control">
              <div class="toggle-switch">
                <input type="checkbox" id="hide-hide-topic-creations" class="toggle-input">
                <label for="hide-hide-topic-creations" class="toggle-label"></label>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Whitelisted Threads -->
        <div class="hide-settings-container">
          <h4 class="settings-group-title">Whitelisted Threads</h4>
          <p class="setting-description">
            Threads containing these terms will never be completely hidden, even if they have hidden content
          </p>
          
          <div class="whitelisted-threads-container">
            <div id="whitelist-items" class="whitelist-items"></div>
            
            <div class="whitelist-add-row">
              <input type="text" id="whitelist-input" placeholder="Enter thread name/keyword" class="form-control">
              <button id="add-whitelist-btn" class="button button--primary">Add</button>
            </div>
          </div>
        </div>

        <!-- Keyboard Shortcuts Info -->
        <div class="hide-settings-container">
          <h4 class="settings-group-title">Keyboard Shortcuts</h4>
          
          <div class="keyboard-shortcut-row">
            <div class="shortcut-key"><span>\\</span></div>
            <div class="shortcut-description">Show/hide all hidden content</div>
          </div>
          
          <div class="keyboard-shortcut-row">
            <div class="shortcut-key"><span>Alt</span></div>
            <div class="shortcut-description">Toggle visibility of manual hide buttons on posts</div>
          </div>
        </div>
        
        <!-- Hide Management Section -->
        <div class="hide-settings-container">
          <h4 class="settings-group-title">Management</h4>
          
          <div class="hide-actions">
            <button id="reset-hide-settings-btn" class="button button--secondary">
              <i class="fa fa-refresh"></i> Reset to Defaults
            </button>
            <button id="reset-all-hidden-users-btn" class="button button--danger">
              <i class="fa fa-trash"></i> Reset All Hidden Users
            </button>
          </div>
        </div>
        
        <!-- Hide Status Info -->
        <div class="hide-settings-container">
          <div class="hide-status-info">
            <div id="hide-status">
              <strong>Status:</strong> <span id="hide-active-status">Active</span>
            </div>
            <div id="hide-counts">
              <div><strong>Hidden Users:</strong> <span id="hidden-users-count">0</span></div>
              <div><strong>Replaced Avatars:</strong> <span id="replaced-avatars-count">0</span></div>
              <div><strong>Hidden Posts:</strong> <span id="hidden-posts-count">0</span></div>
            </div>
          </div>
        </div>
        
        <!-- User Search -->
        <div class="hide-settings-container">
          <h4 class="settings-group-title">
            <i class="fa fa-search"></i> Search Users to Hide
          </h4>
          <div class="hide-user-search">
            <div class="hide-user-search-form">
              <input type="text" id="hide-search-input" placeholder="Search for users to hide...">
              <button id="hide-search-btn" class="button button--primary">
                <i class="fa fa-search"></i> Search
              </button>
            </div>
            <div class="hide-user-search-results"></div>
          </div>
        </div>
        
        <!-- Currently Hidden Users -->
        <div class="hide-settings-container">
          <h4 class="settings-group-title">
            <i class="fa fa-user-times"></i> Hidden Users 
            <span class="hide-user-count"></span>
          </h4>
          <div class="hidden-users-grid" id="hidden-users-grid"></div>
        </div>
        
        <!-- Avatar Replacement -->
        <div class="hide-settings-container">
          <h4 class="settings-group-title">
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
    </div>
  `;

  // Add the necessary styles
  addHideStyles();

  // Initialize the settings
  initializeHideSettings(container);

  // Set up event listeners
  setupEventListeners(container);
}

// Add Hide-specific styles
function addHideStyles() {
  const styleId = "hide-settings-styles";
  if (document.getElementById(styleId)) return;

  const css = `
    .preferences-section {
      margin-bottom: 20px;
    }
    
    .preferences-section-title {
      margin-bottom: 10px;
    }
    
    .preference-description {
      color: var(--text-secondary);
      margin-bottom: 15px;
    }
    
    .hide-settings-container {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 15px;
      margin-bottom: 20px;
    }
    
    .settings-group-title {
      margin-top: 0;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-color);
      color: var(--text-primary);
    }
    
    .setting-row {
      display: flex;
      align-items: flex-start;
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    
    .setting-row:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
    
    .setting-label {
      flex: 1;
    }
    
    .setting-label label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }
    
    .setting-description {
      font-size: 0.9em;
      color: var(--text-secondary);
    }
    
    .setting-control {
      min-width: 120px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    /* Color inputs */
    .color-input {
      width: 150px;
      padding: 8px;
      background: var(--bg-dark);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      color: var(--text-primary);
    }
    
    .color-preview {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 1px solid var(--border-color);
      background-color: rgba(255, 0, 0, 0.1);
    }
    
    /* Toggle switches */
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 22px;
    }
    
    .toggle-input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .toggle-label {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--bg-dark);
      border: 1px solid var(--border-color);
      transition: .4s;
      border-radius: 34px;
    }
    
    .toggle-label:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 3px;
      bottom: 2px;
      background-color: var(--text-secondary);
      transition: .4s;
      border-radius: 50%;
    }
    
    .toggle-input:checked + .toggle-label {
      background-color: var(--primary-color);
    }
    
    .toggle-input:checked + .toggle-label:before {
      transform: translateX(20px);
      background-color: white;
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
    
    /* Loading indicator */
    .hide-loading {
      text-align: center;
      padding: 20px;
      color: var(--text-secondary);
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
    
    /* Whitelisted threads */
    .whitelisted-threads-container {
      margin-top: 10px;
    }
    
    .whitelist-items {
      max-height: 150px;
      overflow-y: auto;
      margin-bottom: 10px;
      background: var(--bg-dark);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 5px;
    }
    
    .whitelist-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 10px;
      margin-bottom: 5px;
      background: rgba(255,255,255,0.05);
      border-radius: 4px;
    }
    
    .whitelist-item:last-child {
      margin-bottom: 0;
    }
    
    .whitelist-item-text {
      flex: 1;
    }
    
    .whitelist-remove-btn {
      background: none;
      border: none;
      color: var(--danger-color);
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .whitelist-add-row {
      display: flex;
      gap: 10px;
    }
    
    .whitelist-add-row input {
      flex: 1;
      padding: 8px 10px;
      background: var(--bg-dark);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      color: var(--text-primary);
    }
    
    /* Keyboard shortcuts */
    .keyboard-shortcut-row {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .keyboard-shortcut-row:last-child {
      margin-bottom: 0;
    }
    
    .shortcut-key {
      margin-right: 15px;
      min-width: 80px;
    }
    
    .shortcut-key span {
      display: inline-block;
      padding: 5px 10px;
      background: var(--bg-dark);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      font-family: monospace;
      font-size: 14px;
      text-align: center;
      min-width: 30px;
    }
    
    .shortcut-description {
      color: var(--text-secondary);
    }
    
    /* Hide actions */
    .hide-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    /* Hide status info */
    .hide-status-info {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    #hide-active-status {
      color: var(--success-color);
      font-weight: 500;
    }
    
    #hide-counts {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
    }
    
    #hide-counts > div {
      min-width: 150px;
    }
  `;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = css;
  document.head.appendChild(style);
}

// Initialize settings from stored values
function initializeHideSettings(container) {
  try {
    // Load Hide config
    const hideConfig = gmGetValue(HIDE_CONFIG_KEY, DEFAULT_CONFIG);
    debug("Loaded Hide config:", hideConfig);

    // Set color inputs and previews
    const authorColorInput = container.querySelector("#hide-author-color");
    const authorColorPreview = container.querySelector("#author-color-preview");
    authorColorInput.value =
      hideConfig.authorHighlightColor || DEFAULT_CONFIG.authorHighlightColor;
    authorColorPreview.style.backgroundColor = authorColorInput.value;

    const contentColorInput = container.querySelector("#hide-content-color");
    const contentColorPreview = container.querySelector(
      "#content-color-preview",
    );
    contentColorInput.value =
      hideConfig.contentHighlightColor || DEFAULT_CONFIG.contentHighlightColor;
    contentColorPreview.style.backgroundColor = contentColorInput.value;

    // Set toggle switches
    const hideRowToggle = container.querySelector("#hide-hide-entire-row");
    hideRowToggle.checked =
      hideConfig.hideEntireRow || DEFAULT_CONFIG.hideEntireRow;

    const hideTopicsToggle = container.querySelector(
      "#hide-hide-topic-creations",
    );
    hideTopicsToggle.checked =
      hideConfig.hideTopicCreations || DEFAULT_CONFIG.hideTopicCreations;

    // Populate whitelisted threads
    populateWhitelistedThreads(container, hideConfig.whitelistedThreads || []);

    // Update status counts
    updateHideStatusCounts(container);
  } catch (err) {
    error("Error initializing Hide settings:", err);
    // Use defaults if there's an error
    resetToDefaults(container);
  }
}

// Populate the whitelisted threads list
function populateWhitelistedThreads(container, threads) {
  const whitelistContainer = container.querySelector("#whitelist-items");

  if (!threads || threads.length === 0) {
    whitelistContainer.innerHTML =
      '<div class="empty-whitelist">No whitelisted threads. Add threads that should never be hidden.</div>';
    return;
  }

  const threadsHtml = threads
    .map(
      (thread, index) => `
    <div class="whitelist-item" data-index="${index}">
      <div class="whitelist-item-text">${thread}</div>
      <button class="whitelist-remove-btn" title="Remove from whitelist">×</button>
    </div>
  `,
    )
    .join("");

  whitelistContainer.innerHTML = threadsHtml;

  // Add event listeners to remove buttons
  whitelistContainer
    .querySelectorAll(".whitelist-remove-btn")
    .forEach((btn) => {
      btn.addEventListener("click", function () {
        const item = this.closest(".whitelist-item");
        const index = parseInt(item.dataset.index);
        removeWhitelistedThread(container, index);
      });
    });
}

// Remove a thread from the whitelist
function removeWhitelistedThread(container, index) {
  try {
    const hideConfig = gmGetValue(HIDE_CONFIG_KEY, DEFAULT_CONFIG);
    const threads = hideConfig.whitelistedThreads || [];

    if (index >= 0 && index < threads.length) {
      threads.splice(index, 1);
      hideConfig.whitelistedThreads = threads;
      gmSetValue(HIDE_CONFIG_KEY, hideConfig);

      // Update the UI
      populateWhitelistedThreads(container, threads);
    }
  } catch (err) {
    error("Error removing whitelisted thread:", err);
  }
}

// Add a thread to the whitelist
function addWhitelistedThread(container, threadName) {
  if (!threadName.trim()) return;

  try {
    const hideConfig = gmGetValue(HIDE_CONFIG_KEY, DEFAULT_CONFIG);
    const threads = hideConfig.whitelistedThreads || [];

    // Check for duplicates
    if (threads.includes(threadName)) {
      alert("This thread is already whitelisted.");
      return;
    }

    threads.push(threadName);
    hideConfig.whitelistedThreads = threads;
    gmSetValue(HIDE_CONFIG_KEY, hideConfig);

    // Update the UI
    populateWhitelistedThreads(container, threads);

    // Clear the input
    container.querySelector("#whitelist-input").value = "";
  } catch (err) {
    error("Error adding whitelisted thread:", err);
  }
}

// Update the Hide status counts
function updateHideStatusCounts(container) {
  try {
    const ignoredUsers = gmGetValue(IGNORED_USERS_KEY, {});
    const replacedAvatars = gmGetValue(REPLACED_AVATARS_KEY, {});
    const hiddenManualPosts = gmGetValue(HIDDEN_MANUAL_POSTS_KEY, {});

    const ignoredUserCount = Object.keys(ignoredUsers).length;
    const replacedAvatarCount = Object.keys(replacedAvatars).length;
    const hiddenPostCount = Object.keys(hiddenManualPosts).length;

    container.querySelector("#hidden-users-count").textContent =
      ignoredUserCount;
    container.querySelector("#replaced-avatars-count").textContent =
      replacedAvatarCount;
    container.querySelector("#hidden-posts-count").textContent =
      hiddenPostCount;
  } catch (err) {
    error("Error updating Hide status counts:", err);
  }
}

// Reset all settings to defaults
function resetToDefaults(container) {
  if (
    !confirm(
      "Are you sure you want to reset all Hide settings to defaults? This will not affect your hidden users list.",
    )
  ) {
    return;
  }

  try {
    gmSetValue(HIDE_CONFIG_KEY, DEFAULT_CONFIG);

    // Update the UI
    initializeHideSettings(container);

    alert("Hide settings have been reset to defaults.");
  } catch (err) {
    error("Error resetting Hide settings:", err);
    alert("An error occurred while resetting settings.");
  }
}

// Set up event listeners for the settings UI
function setupEventListeners(container) {
  // Color input change events
  const authorColorInput = container.querySelector("#hide-author-color");
  const authorColorPreview = container.querySelector("#author-color-preview");

  authorColorInput.addEventListener("input", function () {
    authorColorPreview.style.backgroundColor = this.value;
  });

  authorColorInput.addEventListener("change", function () {
    saveHideSetting("authorHighlightColor", this.value);
  });

  const contentColorInput = container.querySelector("#hide-content-color");
  const contentColorPreview = container.querySelector("#content-color-preview");

  contentColorInput.addEventListener("input", function () {
    contentColorPreview.style.backgroundColor = this.value;
  });

  contentColorInput.addEventListener("change", function () {
    saveHideSetting("contentHighlightColor", this.value);
  });

  // Toggle switch change events
  const hideRowToggle = container.querySelector("#hide-hide-entire-row");
  hideRowToggle.addEventListener("change", function () {
    saveHideSetting("hideEntireRow", this.checked);
  });

  const hideTopicsToggle = container.querySelector(
    "#hide-hide-topic-creations",
  );
  hideTopicsToggle.addEventListener("change", function () {
    saveHideSetting("hideTopicCreations", this.checked);
  });

  // Whitelist functions
  const addWhitelistBtn = container.querySelector("#add-whitelist-btn");
  const whitelistInput = container.querySelector("#whitelist-input");

  addWhitelistBtn.addEventListener("click", function () {
    addWhitelistedThread(container, whitelistInput.value);
  });

  whitelistInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      addWhitelistedThread(container, this.value);
    }
  });

  // Management buttons
  const resetSettingsBtn = container.querySelector("#reset-hide-settings-btn");
  resetSettingsBtn.addEventListener("click", function () {
    resetToDefaults(container);
  });

  // Reset all hidden users button
  const resetAllUsersBtn = container.querySelector(
    "#reset-all-hidden-users-btn",
  );
  resetAllUsersBtn.addEventListener("click", function () {
    resetAllHiddenUsers(container);
  });

  // Setup user search
  const searchInput = container.querySelector("#hide-search-input");
  const searchBtn = container.querySelector("#hide-search-btn");

  searchBtn.addEventListener("click", function () {
    performUserSearch(container, searchInput.value);
  });

  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      performUserSearch(container, this.value);
    }
  });

  // Setup avatar replacement
  const userIdInput = container.querySelector("#hide-user-id-input");
  const avatarUrlInput = container.querySelector("#hide-avatar-url-input");
  const replaceBtn = container.querySelector("#hide-replace-avatar-btn");
  const resetBtn = container.querySelector("#hide-reset-avatar-btn");

  replaceBtn.addEventListener("click", function () {
    replaceAvatarAction(container, userIdInput.value, avatarUrlInput.value);
  });

  resetBtn.addEventListener("click", function () {
    resetAvatarAction(container, userIdInput.value);
  });

  // Setup avatar preview on input
  avatarUrlInput.addEventListener("input", function () {
    updateAvatarPreview(container, userIdInput.value, avatarUrlInput.value);
  });

  userIdInput.addEventListener("input", function () {
    updateAvatarPreview(container, userIdInput.value, avatarUrlInput.value);
  });

  // Populate hidden users grid
  populateHiddenUsers(container);
}

// Default avatar URL for fallback
const DEFAULT_AVATAR = "https://f.rpghq.org/OhUxAgzR9avp.png?n=pasted-file.png";

/**
 * Populate the hidden users grid
 * @param {HTMLElement} container - The container element
 */
function populateHiddenUsers(container) {
  const grid = container.querySelector("#hidden-users-grid");
  if (!grid) return;

  const ignoredUsers = getHiddenUsers();
  const userCount = Object.keys(ignoredUsers).length;

  // Update user count
  const countElement = container.querySelector(".hide-user-count");
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
      unhideUser(container, userId, username);
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
  const avatarCountElement = container.querySelector(".hide-avatar-count");
  if (avatarCountElement) {
    avatarCountElement.textContent = `(${avatarCount})`;
  }
}

/**
 * Unhide a user
 * @param {HTMLElement} container - The container element
 * @param {string} userId - The user ID
 * @param {string} username - The username
 */
function unhideUser(container, userId, username) {
  try {
    toggleUserHide(userId, username);

    // Update the UI
    populateHiddenUsers(container);

    // Show confirmation
    showStatusMessage(`Unhidden user: ${username}`);
  } catch (err) {
    error(`Error unhiding user ${userId}:`, err);
    showStatusMessage(`Error unhiding user: ${err.message}`, true);
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
 * @param {HTMLElement} container - The container element
 * @param {string} query - The search query
 */
async function performUserSearch(container, query) {
  const resultsContainer = container.querySelector(".hide-user-search-results");
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
          hideUser(container, userId, username);
        });
      });
  } catch (err) {
    error("Error searching for users:", err);
    resultsContainer.innerHTML = `<div class="hide-empty-state">Error searching for users: ${err.message}</div>`;
  }
}

/**
 * Hide a user
 * @param {HTMLElement} container - The container element
 * @param {string} userId - The user ID
 * @param {string} username - The username
 */
function hideUser(container, userId, username) {
  try {
    toggleUserHide(userId, username);

    // Update the UI
    populateHiddenUsers(container);

    // Show confirmation
    showStatusMessage(`Hidden user: ${username}`);

    // Clear search results
    const resultsContainer = container.querySelector(
      ".hide-user-search-results",
    );
    if (resultsContainer) {
      resultsContainer.innerHTML = "";
    }

    // Clear search input
    const searchInput = container.querySelector("#hide-search-input");
    if (searchInput) {
      searchInput.value = "";
    }
  } catch (err) {
    error(`Error hiding user ${userId}:`, err);
    showStatusMessage(`Error hiding user: ${err.message}`, true);
  }
}

/**
 * Update the avatar preview
 * @param {HTMLElement} container - The container element
 * @param {string} userId - The user ID
 * @param {string} url - The avatar URL
 */
function updateAvatarPreview(container, userId, url) {
  const previewElement = container.querySelector(".avatar-preview");
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
 * @param {HTMLElement} container - The container element
 * @param {string} userId - The user ID
 * @param {string} url - The avatar URL
 */
async function replaceAvatarAction(container, userId, url) {
  if (!userId || !url) {
    showStatusMessage("Please enter both a User ID and Image URL", true);
    return;
  }

  try {
    await replaceUserAvatar(userId, url);

    // Update the UI
    populateHiddenUsers(container);

    // Show confirmation
    showStatusMessage(`Avatar replaced for user ID: ${userId}`);

    // Clear inputs
    const userIdInput = container.querySelector("#hide-user-id-input");
    const avatarUrlInput = container.querySelector("#hide-avatar-url-input");

    if (userIdInput) userIdInput.value = "";
    if (avatarUrlInput) avatarUrlInput.value = "";

    // Update preview
    updateAvatarPreview(container, "", "");
  } catch (err) {
    error(`Error replacing avatar for user ${userId}:`, err);
    showStatusMessage(`Error replacing avatar: ${err.message}`, true);
  }
}

/**
 * Reset a user's avatar to default
 * @param {HTMLElement} container - The container element
 * @param {string} userId - The user ID
 */
function resetAvatarAction(container, userId) {
  if (!userId) {
    showStatusMessage("Please enter a User ID", true);
    return;
  }

  try {
    resetUserAvatar(userId);

    // Update the UI
    populateHiddenUsers(container);

    // Show confirmation
    showStatusMessage(`Avatar reset for user ID: ${userId}`);

    // Clear inputs
    const userIdInput = container.querySelector("#hide-user-id-input");
    const avatarUrlInput = container.querySelector("#hide-avatar-url-input");

    if (userIdInput) userIdInput.value = "";
    if (avatarUrlInput) avatarUrlInput.value = "";

    // Update preview
    updateAvatarPreview(container, "", "");
  } catch (err) {
    error(`Error resetting avatar for user ${userId}:`, err);
    showStatusMessage(`Error resetting avatar: ${err.message}`, true);
  }
}

// Save a single Hide setting
function saveHideSetting(key, value) {
  try {
    const hideConfig = gmGetValue(HIDE_CONFIG_KEY, DEFAULT_CONFIG);
    hideConfig[key] = value;
    gmSetValue(HIDE_CONFIG_KEY, hideConfig);
    debug(`Saved Hide setting: ${key} = ${value}`);
  } catch (err) {
    error(`Error saving Hide setting ${key}:`, err);
  }
}

/**
 * Reset all hidden users
 * @param {HTMLElement} container - The container element
 */
function resetAllHiddenUsers(container) {
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
    populateHiddenUsers(container);

    // Show confirmation
    showStatusMessage("All hidden users have been reset");
  } catch (err) {
    error("Error resetting all hidden users:", err);
    showStatusMessage(`Error resetting hidden users: ${err.message}`, true);
  }
}
