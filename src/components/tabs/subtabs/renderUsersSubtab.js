/**
 * Renders the "Users" subtab content with Hide functionality
 * Replaces the previous work-in-progress implementation
 *
 * @param {HTMLElement} container - The container element to render into
 */
import { log, debug, error } from "../../../utils/logger.js";
import { gmGetValue, gmSetValue } from "../../../main.js";
import { searchUsers } from "../../../utils/api/rpghqApi.js"; // Import the search function
import { showHideUsersModal } from "../../../utils/hide/hide-modal.js";

// Hide configuration storage keys
const HIDE_CONFIG_KEY = "hideConfig";
const IGNORED_USERS_KEY = "ignoredUsers";
const REPLACED_AVATARS_KEY = "replacedAvatars";
const HIDDEN_MANUAL_POSTS_KEY = "hiddenManualPosts";
const USER_COLORS_KEY = "userColors";

// Default configuration values
const DEFAULT_CONFIG = {
  authorHighlightColor: "rgba(255, 0, 0, 0.1)", // Default red for hidden-by-author
  contentHighlightColor: "rgba(255, 128, 0, 0.1)", // Default orange for hidden-by-content
  hideEntireRow: false, // Default: only hide lastpost, not entire row
  hideTopicCreations: true, // Default: hide rows with hidden username in row class,
  whitelistedThreads: [], // Array of thread names that should never be hidden
};

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
        
        <!-- Hide Management Actions -->
        <div class="hide-settings-container">
          <h4 class="settings-group-title">Management</h4>
          
          <div class="hide-actions">
            <button id="manage-hidden-users-btn" class="button button--primary">
              <i class="fa fa-users"></i> Manage Hidden Users
            </button>
            
            <button id="reset-hide-settings-btn" class="button button--secondary">
              <i class="fa fa-refresh"></i> Reset to Defaults
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
  const manageUsersBtn = container.querySelector("#manage-hidden-users-btn");
  manageUsersBtn.addEventListener("click", function () {
    showHideUsersModal();
  });

  const resetSettingsBtn = container.querySelector("#reset-hide-settings-btn");
  resetSettingsBtn.addEventListener("click", function () {
    resetToDefaults(container);
  });
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
