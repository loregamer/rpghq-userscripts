// ==UserScript==
// @name        RPGHQ Userscript Manager (Popup Only)
// @namespace   https://rpghq.org/
// @version     3.0.2
// @description A simple popup that displays the MANIFEST of available scripts without any functional components
// @author      loregamer
// @match       https://rpghq.org/forums/*
// @run-at      document-start
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_registerMenuCommand
// @grant       GM_setValue
// ==/UserScript==

(function () {
  "use strict";

  /**
   * Add CSS styles for the modal
   */
  function addStyles() {
    GM_addStyle(`
    /* Import Font Awesome */
    @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');

    :root {
        --primary-color: #2196F3;
        --primary-dark: #1976D2;
        --accent-color: #FF9800;
        --success-color: #4CAF50;
        --warning-color: #FFC107;
        --danger-color: #F44336;
        --text-primary: #FFFFFF;
        --text-secondary: #B0BEC5;
        --bg-dark: #1E1E1E;
        --bg-card: #2D2D2D;
        --border-color: #444444;
    }
    
    /* Modal container */
    .mod-manager-modal {
        display: none;
        position: fixed;
        z-index: 10000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        overflow: hidden;
    }
    
    /* Modal content box */
    .mod-manager-modal-content {
        background-color: var(--bg-dark);
        margin: 2% auto;
        padding: 10px;
        border: 1px solid var(--border-color);
        width: 90%;
        max-width: 1200px;
        max-height: 90vh;
        border-radius: 4px;
        color: var(--text-primary);
        display: flex;
        flex-direction: column;
    }
    
    /* Header and close button */
    .mod-manager-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 10px;
    }
    
    .mod-manager-title {
        margin: 0;
        font-size: 1.8em;
        color: var(--text-primary);
    }
    
    .mod-manager-close {
        font-size: 1.8em;
        cursor: pointer;
    }
    
    .mod-manager-close:hover {
        color: var(--danger-color);
    }
    
    /* Tab system */
    .mod-manager-tabs {
        display: flex;
        margin-bottom: 10px;
        border-bottom: 1px solid var(--border-color);
    }
    
    .mod-manager-tab {
        padding: 8px 16px;
        cursor: pointer;
        font-size: 1em;
        color: var(--text-secondary);
        position: relative;
    }
    
    .mod-manager-tab:hover {
        background-color: rgba(255, 255, 255, 0.05);
    }
    
    .mod-manager-tab.active {
        color: var(--primary-color);
        font-weight: bold;
        border-bottom: 2px solid var(--primary-color);
    }
    
    /* Sub-tabs system */
    .sub-tabs {
        display: flex;
        margin-bottom: 10px;
        border-bottom: 1px solid var(--border-color);
        background-color: var(--bg-card);
        border-radius: 4px 4px 0 0;
    }
    
    .sub-tab {
        padding: 8px 16px;
        cursor: pointer;
        font-size: 1em;
        color: var(--text-secondary);
        position: relative;
    }
    
    .sub-tab:hover {
        background-color: rgba(255, 255, 255, 0.05);
    }
    
    .sub-tab.active {
        color: var(--primary-color);
        font-weight: bold;
        border-bottom: 2px solid var(--primary-color);
    }
    
    /* Content area */
    .mod-manager-content {
        flex: 1;
        overflow-y: auto;
        padding: 10px;
    }
    
    /* Filter panel */
    .filter-panel {
        background-color: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        padding: 10px;
        margin-bottom: 15px;
    }
    
    .filter-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    
    .filter-panel-title {
        font-size: 1.1em;
        font-weight: bold;
        margin: 0;
    }
    
    .filter-panel-toggle {
        background: none;
        border: none;
        color: var(--text-primary);
        cursor: pointer;
        font-size: 1.1em;
    }
    
    .filter-panel-body {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 10px;
    }
    
    .filter-panel-body.collapsed {
        display: none;
    }
    
    .filter-group {
        display: flex;
        flex-direction: column;
    }
    
    .filter-group label {
        margin-bottom: 5px;
        font-weight: bold;
        font-size: 0.9em;
    }
    
    .filter-group select,
    .filter-group input {
        padding: 5px;
        border: 1px solid var(--border-color);
        border-radius: 3px;
        background-color: var(--bg-dark);
        color: var(--text-primary);
    }
    
    .filter-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 10px;
        grid-column: 1 / -1;
    }
    
    /* Script grid */
    .script-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 10px;
    }
    
    .script-card {
        background-color: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        overflow: hidden;
    }
    
    .script-card-image {
        position: relative;
        height: 130px;
        overflow: hidden;
    }
    
    .script-card-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .script-card-category {
        position: absolute;
        top: 5px;
        right: 5px;
        background-color: rgba(0, 0, 0, 0.7);
        color: var(--text-primary);
        padding: 3px 8px;
        border-radius: 3px;
        font-size: 0.8em;
    }
    
    .script-card-content {
        padding: 10px;
    }
    
    .script-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;
    }
    
    .script-card-title {
        font-size: 1.1em;
        font-weight: bold;
        margin: 0;
    }
    
    .script-card-version {
        background-color: var(--primary-color);
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 0.8em;
    }
    
    .script-card-description {
        margin: 0 0 10px 0;
        color: var(--text-secondary);
        font-size: 0.9em;
        line-height: 1.3;
        height: 3.6em;
        overflow: hidden;
    }
    
    .script-card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid var(--border-color);
        padding-top: 8px;
    }
    
    .script-card-phase {
        font-size: 0.85em;
        color: var(--text-secondary);
    }
    
    /* Forum preferences */
    .preferences-section {
        background-color: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        margin-bottom: 15px;
        overflow: hidden;
    }
    
    .preferences-section-header {
        background-color: rgba(33, 150, 243, 0.1);
        padding: 10px;
        border-bottom: 1px solid var(--border-color);
    }
    
    .preferences-section-title {
        margin: 0;
        font-size: 1.1em;
        color: var(--text-primary);
    }
    
    .preferences-section-body {
        padding: 10px;
    }
    
    .preference-item {
        display: flex;
        flex-direction: column;
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .preference-item:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
    }
    
    .preference-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;
    }
    
    .preference-name {
        font-weight: bold;
        margin: 0;
    }
    
    .preference-control {
        min-width: 150px;
    }
    
    .preference-description {
        color: var(--text-secondary);
        font-size: 0.9em;
        margin: 0;
    }
    
    /* Settings modal */
    .settings-modal {
        display: none;
        position: fixed;
        z-index: 10001;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
    }
    
    .settings-modal-content {
        background-color: var(--bg-dark);
        margin: 5% auto;
        padding: 15px;
        border: 1px solid var(--border-color);
        width: 60%;
        max-width: 800px;
        max-height: 85vh;
        border-radius: 4px;
        overflow-y: auto;
    }
    
    .settings-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--border-color);
    }
    
    .settings-modal-title {
        font-size: 1.4em;
        margin: 0;
    }
    
    .settings-modal-close {
        font-size: 1.4em;
        cursor: pointer;
        color: var(--text-secondary);
    }
    
    .settings-modal-close:hover {
        color: var(--danger-color);
    }
    
    .setting-group {
        margin-bottom: 15px;
    }
    
    .setting-group-title {
        font-size: 1.1em;
        margin: 0 0 10px 0;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .setting-item {
        margin-bottom: 12px;
    }
    
    .setting-label {
        display: block;
        font-weight: bold;
        margin-bottom: 5px;
    }
    
    .setting-description {
        display: block;
        color: var(--text-secondary);
        font-size: 0.9em;
        margin-bottom: 5px;
    }
    
    .setting-control {
        margin-top: 5px;
    }
    
    /* Buttons */
    .btn {
        padding: 5px 10px;
        border-radius: 3px;
        border: none;
        cursor: pointer;
        font-size: 0.9em;
        display: inline-flex;
        align-items: center;
        gap: 5px;
    }
    
    .btn-icon {
        font-size: 1em;
    }
    
    .btn-primary {
        background-color: var(--primary-color);
        color: white;
    }
    
    .btn-primary:hover {
        background-color: var(--primary-dark);
    }
    
    .btn-secondary {
        background-color: #555;
        color: var(--text-primary);
    }
    
    .btn-secondary:hover {
        background-color: #666;
    }
    
    .btn-small {
        padding: 3px 8px;
        font-size: 0.8em;
    }
    
    /* Toggle switch */
    .toggle-switch {
        position: relative;
        display: inline-block;
        width: 46px;
        height: 22px;
    }
    
    .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }
    
    .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #444;
        border-radius: 3px;
    }
    
    .toggle-slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        border-radius: 2px;
    }
    
    input:checked + .toggle-slider {
        background-color: var(--primary-color);
    }
    
    input:checked + .toggle-slider:before {
        transform: translateX(24px);
    }
    
    /* Tables */
    .data-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 15px;
    }
    
    .data-table th,
    .data-table td {
        padding: 8px 10px;
        text-align: left;
        border-bottom: 1px solid var(--border-color);
    }
    
    .data-table th {
        background-color: rgba(255, 255, 255, 0.05);
        font-weight: bold;
    }
    
    .data-table tr:hover {
        background-color: rgba(255, 255, 255, 0.03);
    }
    
    /* Empty state */
    .empty-state {
        text-align: center;
        padding: 30px 20px;
        color: var(--text-secondary);
    }
    
    .empty-state-icon {
        font-size: 2.5em;
        margin-bottom: 15px;
        opacity: 0.5;
    }
    
    .empty-state-message {
        font-size: 1.1em;
        margin-bottom: 10px;
    }
    
    /* Badges */
    .badge {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 0.8em;
        font-weight: bold;
    }
    
    .badge-primary {
        background-color: var(--primary-color);
        color: white;
    }
    
    /* Info note */
    .info-note {
        background-color: rgba(33, 150, 243, 0.1);
        border-left: 4px solid var(--primary-color);
        padding: 10px;
        margin-bottom: 15px;
        border-radius: 0 4px 4px 0;
    }
    
    /* WIP Banner */
    .wip-banner {
        background-color: var(--warning-color);
        color: #000;
        padding: 10px;
        margin-bottom: 15px;
        border-radius: 4px;
        text-align: center;
        font-weight: bold;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .script-grid {
            grid-template-columns: 1fr;
        }
        
        .filter-panel-body {
            grid-template-columns: 1fr;
        }
        
        .settings-modal-content {
            width: 90%;
        }
    }
  `);
  }

  // Remove existing imports for hideModal and loadTabContent
  // import { hideModal } from './hideModal.js';
  // import { loadTabContent } from './loadTabContent.js';

  /**
   * Create and show the modal with script information
   * @param {function} hideFunc - Function to hide the modal.
   * @param {function} loadFunc - Function to load tab content.
   */
  function showModal(hideFunc, loadFunc) {
    let modal = document.getElementById("mod-manager-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "mod-manager-modal";
      modal.className = "mod-manager-modal";
      modal.innerHTML = `
      <div class="mod-manager-modal-content">
        <div class="mod-manager-header">
          <h2 class="mod-manager-title">RPGHQ Userscript Manager</h2>
          <span class="mod-manager-close">&times;</span>
        </div>
        <div class="mod-manager-tabs">
          <div class="mod-manager-tab active" data-tab="installed">
            <i class="fa fa-puzzle-piece"></i> Installed Scripts
          </div>
          <div class="mod-manager-tab" data-tab="forum">
            <i class="fa fa-sliders-h"></i> Forum Preferences
          </div>
          <div class="mod-manager-tab" data-tab="settings">
            <i class="fa fa-cog"></i> Settings
          </div>
        </div>
        <div class="mod-manager-content" id="mod-manager-content">
          <div class="info-note">
            <strong>Note:</strong> This is a view-only display of available userscripts. No scripts will be installed or executed.
          </div>
          <!-- Content loaded dynamically -->
        </div>
      </div>
    `;
      document.body.appendChild(modal);

      // Add event listeners
      modal
        .querySelector(".mod-manager-close")
        .addEventListener("click", () => {
          hideFunc();
        });

      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          hideFunc();
        }
      });

      // Tab switching
      modal.querySelectorAll(".mod-manager-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          document.querySelectorAll(".mod-manager-tab").forEach((t) => {
            t.classList.remove("active");
          });
          tab.classList.add("active");
          loadFunc(tab.dataset.tab);
        });
      });
    }

    modal.style.display = "block";
    document.body.style.overflow = "hidden";

    // Initial view - load the first tab (Installed Scripts)
    loadFunc("installed");
  }

  /**
   * Hide the modal
   */
  function hideModal() {
    const modal = document.getElementById("mod-manager-modal");
    if (modal) {
      modal.style.display = "none";
      document.body.style.overflow = "";
    }

    // Hide any open settings modal
    const settingsModal = document.getElementById("script-settings-modal");
    if (settingsModal) {
      settingsModal.style.display = "none";
    }
  }

  /**
   * Hard-coded manifest - just for display purposes
   */
  const MANIFEST = {
    scripts: [
      {
        id: "notifications",
        name: "Notifications Improved",
        version: "1.1.0",
        description:
          "Adds reaction smileys to notifications and makes them formatted better",
        filename: "notifications.js",
        matches: ["https://rpghq.org/forums/*"],
        executionPhase: "document-ready",
        category: "Aesthetic",
        image: "https://f.rpghq.org/rso7uNB6S4H9.png",
        settings: [],
      },
    ],
  };

  /**
   * @module scriptStateHelpers
   * @description Helper functions for managing the enabled/disabled state of scripts.
   */

  const SETTINGS_KEY_PREFIX = "script_enabled_";

  /**
   * Gets the enabled state for a specific script. Defaults to true if not set.
   * @param {string} scriptId - The ID of the script.
   * @returns {boolean} - True if the script is enabled, false otherwise.
   */
  function _isScriptEnabled(scriptId) {
    // Default to enabled (true) if no setting is found
    return GM_getValue(SETTINGS_KEY_PREFIX + scriptId, true);
  }

  /**
   * Sets the enabled state for a specific script.
   * @param {string} scriptId - The ID of the script.
   * @param {boolean} isEnabled - The new state (true for enabled, false for disabled).
   */
  function _setScriptEnabled(scriptId, isEnabled) {
    GM_setValue(SETTINGS_KEY_PREFIX + scriptId, isEnabled);
  }

  const scriptState = {
    isScriptEnabled: _isScriptEnabled,
    setScriptEnabled: _setScriptEnabled,
  };

  // src/helpers/scriptHelpers.js
  // Import other general script logic helpers here if needed

  const scriptHelpers = {
    isScriptEnabled: scriptState.isScriptEnabled,
    setScriptEnabled: scriptState.setScriptEnabled,
    // Add other script helpers as needed, e.g.:
    // getScriptSetting: someOtherModule.getScriptSetting,
  };

  /**
   * Creates a toggle switch element for enabling/disabling a script.
   * @param {string} scriptId - The ID of the script.
   * @returns {HTMLElement} - The toggle switch element.
   */
  function createScriptToggle(scriptId) {
    const label = document.createElement("label");
    // Use the classes defined in addStyles.js
    label.className = "toggle-switch";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = scriptHelpers.isScriptEnabled(scriptId);
    input.dataset.scriptId = scriptId;

    const slider = document.createElement("span");
    // Use the classes defined in addStyles.js
    slider.className = "toggle-slider";

    label.appendChild(input);
    label.appendChild(slider);

    // Add event listener to handle state changes
    input.addEventListener("change", (event) => {
      const scriptId = event.target.dataset.scriptId;
      const isEnabled = event.target.checked;
      scriptHelpers.setScriptEnabled(scriptId, isEnabled);
      console.log(`${scriptId} enabled state set to: ${isEnabled}`);
      // Optionally, add visual feedback or trigger other actions here
    });

    return label;
  }

  /**
   * Render the scripts in a grid view
   * @param {HTMLElement} container - The container to render into
   * @param {Array} scripts - The scripts to render
   */
  function renderScriptsGridView(container, scripts) {
    if (scripts.length === 0) {
      container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <i class="fa fa-search"></i>
        </div>
        <h3 class="empty-state-message">No scripts found</h3>
        <p>Try adjusting your filters to see more results.</p>
      </div>
    `;
      return;
    }

    const grid = document.createElement("div");
    grid.className = "script-grid";

    scripts.forEach((script) => {
      const card = document.createElement("div");
      card.className = "script-card";
      card.dataset.scriptId = script.id;

      card.innerHTML = `
      <div class="script-card-image">
        <img src="${
          script.image || "https://via.placeholder.com/240x130?text=No+Image"
        }" alt="${script.name}">
        <div class="script-card-category">${
          script.category || "Uncategorized"
        }</div>
      </div>
      <div class="script-card-content">
        <div class="script-card-header">
          <h3 class="script-card-title">${script.name}</h3>
          <!-- Placeholder for the toggle switch -->
          <div class="script-card-toggle" data-script-id="${script.id}"></div>
          <span class="script-card-version">v${script.version}</span>
        </div>
        <p class="script-card-description">${
          script.description || "No description available."
        }</p>
        <div class="script-card-footer">
          <!-- Execution phase removed -->
          <div class="script-card-actions">
            <button class="btn btn-primary btn-small view-settings" data-script-id="${
              script.id
            }">
              <i class="fa fa-cog"></i> Settings
            </button>
          </div>
        </div>
      </div>
    `;

      grid.appendChild(card);
    });

    container.innerHTML = "";
    container.appendChild(grid);

    // Add toggle switches after appending the grid to the DOM
    document
      .querySelectorAll(".script-card-toggle")
      .forEach((toggleContainer) => {
        const scriptId = toggleContainer.dataset.scriptId;
        if (scriptId) {
          const toggle = popupHelpers.createScriptToggle(scriptId);
          toggleContainer.appendChild(toggle);
        }
      });

    // Add event listeners for settings buttons
    container.querySelectorAll(".view-settings").forEach((button) => {
      button.addEventListener("click", (e) => {
        const scriptId = e.currentTarget.dataset.scriptId;
        const script = MANIFEST.scripts.find((s) => s.id === scriptId);
        if (script && script.settings) {
          popupHelpers.showScriptSettings(script);
        } else {
          console.warn(
            `Settings button clicked for script '${scriptId}' which has no settings defined.`
          );
        }
      });
    });
  }

  /**
   * Render the scripts in a list view
   * @param {HTMLElement} container - The container to render into
   * @param {Array} scripts - The scripts to render
   */
  function renderScriptsListView(container, scripts) {
    if (scripts.length === 0) {
      container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <i class="fa fa-search"></i>
        </div>
        <h3 class="empty-state-message">No scripts found</h3>
        <p>Try adjusting your filters to see more results.</p>
      </div>
    `;
      return;
    }

    const table = document.createElement("table");
    table.className = "data-table";

    table.innerHTML = `
    <thead>
      <tr>
        <th>Enabled</th>
        <th>Name</th>
        <th>Version</th>
        <th>Category</th>
        <th>Description</th>
        <!-- Execution Phase removed -->
        <th>Settings</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${scripts
        .map(
          (script) => `
        <tr>
          <!-- Placeholder for the toggle switch -->
          <td class="script-toggle-cell" data-script-id="${script.id}"></td>
          <td><strong>${script.name}</strong></td>
          <td>v${script.version}</td>
          <td>${script.category || "Uncategorized"}</td>
          <td>${script.description || "No description available."}</td>
          <!-- Execution phase removed -->
          <td>${
            script.settings && script.settings.length > 0
              ? `<span class="badge badge-primary">${script.settings.length}</span>`
              : "-"
          }</td>
          <td>
            <button class="btn btn-primary btn-small view-settings" data-script-id="${
              script.id
            }">
              <i class="fa fa-cog"></i> Settings
            </button>
          </td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  `;

    container.innerHTML = "";
    container.appendChild(table);

    // Add toggle switches after appending the table to the DOM
    document.querySelectorAll(".script-toggle-cell").forEach((cell) => {
      const scriptId = cell.dataset.scriptId;
      if (scriptId) {
        const toggle = popupHelpers.createScriptToggle(scriptId);
        cell.appendChild(toggle);
      }
    });

    // Add event listeners for settings buttons
    container.querySelectorAll(".view-settings").forEach((button) => {
      button.addEventListener("click", (e) => {
        const scriptId = e.currentTarget.dataset.scriptId;
        const script = scripts.find((s) => s.id === scriptId);
        if (script && script.settings) {
          popupHelpers.showScriptSettings(script);
        } else {
          console.warn(
            `Settings button clicked for script '${scriptId}' which has no settings defined.`
          );
        }
      });
    });
  }

  // Removed filter-related imports

  /**
   * Render the "Installed Scripts" tab content
   * @param {HTMLElement} container - The container to render into
   */
  function renderInstalledScriptsTab(container) {
    // Filter panel removed

    // Create the view options
    const viewOptions = document.createElement("div");
    viewOptions.className = "view-options";
    viewOptions.style.display = "flex";
    viewOptions.style.justifyContent = "flex-end";
    viewOptions.style.marginBottom = "10px";
    viewOptions.innerHTML = `
    <div class="btn-group" style="display: flex;">
      <button id="grid-view-btn" class="btn btn-primary" style="border-radius: 3px 0 0 3px; margin: 0;">
        <i class="fa fa-th-large"></i>
      </button>
      <button id="list-view-btn" class="btn btn-secondary" style="border-radius: 0 3px 3px 0; margin: 0;">
        <i class="fa fa-list"></i>
      </button>
    </div>
  `;
    container.appendChild(viewOptions);

    // Create the scripts container
    const scriptsContainer = document.createElement("div");
    scriptsContainer.id = "scripts-container";
    container.appendChild(scriptsContainer);

    // Render scripts in grid view initially
    renderScriptsGridView(scriptsContainer, MANIFEST.scripts);

    // Add event listeners
    // Filter toggle listener removed

    document.getElementById("grid-view-btn").addEventListener("click", () => {
      document.getElementById("grid-view-btn").className = "btn btn-primary";
      document.getElementById("list-view-btn").className = "btn btn-secondary";

      // Removed filtering
      renderScriptsGridView(scriptsContainer, MANIFEST.scripts);
    });

    document.getElementById("list-view-btn").addEventListener("click", () => {
      document.getElementById("grid-view-btn").className = "btn btn-secondary";
      document.getElementById("list-view-btn").className = "btn btn-primary";

      // Removed filtering
      renderScriptsListView(scriptsContainer, MANIFEST.scripts);
    });

    // Apply/Reset filter listeners removed
  }

  /**
   * Render the Threads sub-tab content
   * @param {HTMLElement} container - The container to render the content into
   */
  function renderThreadsSubtab(container) {
    container.innerHTML = `
    <div class="wip-banner">
      <i class="fa fa-wrench"></i> Thread Preferences - Work In Progress
    </div>
    
    <div class="preferences-section">
      <div class="preferences-section-header">
        <h3 class="preferences-section-title">Thread Display</h3>
      </div>
      <div class="preferences-section-body">
        <div class="preference-item">
          <div class="preference-header">
            <h4 class="preference-name">Thread Layout</h4>
            <div class="preference-control">
              <select>
                <option selected>Compact</option>
                <option>Standard</option>
                <option>Expanded</option>
              </select>
            </div>
          </div>
          <p class="preference-description">Choose how thread listings are displayed</p>
        </div>
        
        <div class="preference-item">
          <div class="preference-header">
            <h4 class="preference-name">Threads Per Page</h4>
            <div class="preference-control">
              <select>
                <option>10</option>
                <option selected>20</option>
                <option>30</option>
                <option>50</option>
              </select>
            </div>
          </div>
          <p class="preference-description">Number of threads to display per page</p>
        </div>
      </div>
    </div>
    
    <div class="info-note">
      <strong>Note:</strong> This is a view-only display. Additional Thread preferences will be added in future updates.
    </div>
  `;
  }

  /**
   * Render the Users sub-tab content
   * @param {HTMLElement} container - The container to render the content into
   */
  function renderUsersSubtab(container) {
    container.innerHTML = `
    <div class="wip-banner">
      <i class="fa fa-wrench"></i> User Preferences - Work In Progress
    </div>
    
    <div class="preferences-section">
      <div class="preferences-section-header">
        <h3 class="preferences-section-title">User Display</h3>
      </div>
      <div class="preferences-section-body">
        <div class="preference-item">
          <div class="preference-header">
            <h4 class="preference-name">Show User Signatures</h4>
            <div class="preference-control">
              <label class="toggle-switch">
                <input type="checkbox" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <p class="preference-description">Display user signatures in posts</p>
        </div>
        
        <div class="preference-item">
          <div class="preference-header">
            <h4 class="preference-name">Show User Avatars</h4>
            <div class="preference-control">
              <label class="toggle-switch">
                <input type="checkbox" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <p class="preference-description">Display user avatars in posts and listings</p>
        </div>
      </div>
    </div>
    
    <div class="info-note">
      <strong>Note:</strong> This is a view-only display. Additional User preferences will be added in future updates.
    </div>
  `;
  }

  /**
   * Render the "Forum Preferences" tab content
   * @param {HTMLElement} container - The container to render into
   */
  function renderForumPreferencesTab(container) {
    container.innerHTML += `<h2>Forum Preferences</h2>`;

    // Add sub-tabs for Threads and Users
    const subTabsContainer = document.createElement("div");
    subTabsContainer.className = "sub-tabs";
    subTabsContainer.innerHTML = `
    <div class="sub-tab active" data-subtab="threads">
      <i class="fa fa-comments"></i> Threads
    </div>
    <div class="sub-tab" data-subtab="users">
      <i class="fa fa-users"></i> Users
    </div>
  `;
    container.appendChild(subTabsContainer);

    // Add container for sub-tab content
    const subTabContent = document.createElement("div");
    subTabContent.id = "forum-subtab-content";
    container.appendChild(subTabContent);

    // Load initial sub-tab (Threads)
    renderThreadsSubtab(subTabContent);

    // Add event listeners for sub-tabs
    subTabsContainer.querySelectorAll(".sub-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        // Update active state
        subTabsContainer.querySelectorAll(".sub-tab").forEach((t) => {
          t.classList.remove("active");
        });
        tab.classList.add("active");

        // Load content
        if (tab.dataset.subtab === "threads") {
          renderThreadsSubtab(subTabContent);
        } else if (tab.dataset.subtab === "users") {
          renderUsersSubtab(subTabContent);
        }
      });
    });
  }

  /**
   * Render the "Settings" tab content
   * @param {HTMLElement} container - The container to render into
   */
  function renderSettingsTab(container) {
    container.innerHTML += `
    <h2>Global Settings</h2>
    
    <div class="preferences-section">
      <div class="preferences-section-header">
        <h3 class="preferences-section-title">Appearance</h3>
      </div>
      <div class="preferences-section-body">
        <div class="preference-item">
          <div class="preference-header">
            <h4 class="preference-name">Theme</h4>
            <div class="preference-control">
              <select class="setting-input">
                <option value="dark" selected>Dark</option>
                <option value="light">Light</option>
                <option value="system">System Default</option>
              </select>
            </div>
          </div>
          <p class="preference-description">Choose your preferred theme for the userscript manager</p>
        </div>
        
        <div class="preference-item">
          <div class="preference-header">
            <h4 class="preference-name">Script Card Size</h4>
            <div class="preference-control">
              <select class="setting-input">
                <option value="small">Small</option>
                <option value="medium" selected>Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
          <p class="preference-description">Adjust the size of script cards in the gallery view</p>
        </div>
      </div>
    </div>
    
    <div class="preferences-section">
      <div class="preferences-section-header">
        <h3 class="preferences-section-title">Behavior</h3>
      </div>
      <div class="preferences-section-body">
        <div class="preference-item">
          <div class="preference-header">
            <h4 class="preference-name">Default View</h4>
            <div class="preference-control">
              <select class="setting-input">
                <option value="grid" selected>Grid</option>
                <option value="list">List</option>
              </select>
            </div>
          </div>
          <p class="preference-description">Choose the default view for displaying scripts</p>
        </div>
        
        <div class="preference-item">
          <div class="preference-header">
            <h4 class="preference-name">Auto-check for Updates</h4>
            <div class="preference-control">
              <label class="toggle-switch">
                <input type="checkbox" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <p class="preference-description">Automatically check for script updates when the page loads</p>
        </div>
      </div>
    </div>
    
    <div class="preferences-section">
      <div class="preferences-section-header">
        <h3 class="preferences-section-title">Advanced</h3>
      </div>
      <div class="preferences-section-body">
        <div class="preference-item">
          <div class="preference-header">
            <h4 class="preference-name">Update Check Interval</h4>
            <div class="preference-control">
              <select class="setting-input">
                <option value="daily">Daily</option>
                <option value="weekly" selected>Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
          <p class="preference-description">How often to check for script updates</p>
        </div>
        
        <div class="preference-item">
          <div class="preference-header">
            <h4 class="preference-name">Debug Mode</h4>
            <div class="preference-control">
              <label class="toggle-switch">
                <input type="checkbox">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <p class="preference-description">Enable verbose console logging for troubleshooting</p>
        </div>
      </div>
    </div>
    
    <div class="info-note">
      <strong>Note:</strong> These are view-only representations of settings. Changes made here will not be saved.
    </div>
  `;
  }

  /**
   * Load content for the selected tab
   * @param {string} tabName - The name of the tab to load
   */
  function loadTabContent(tabName) {
    const content = document.getElementById("mod-manager-content");

    // Clear previous content (except the info note)
    const infoNote = content.querySelector(".info-note");
    content.innerHTML = "";
    if (infoNote) {
      content.appendChild(infoNote);
    }

    switch (tabName) {
      case "installed":
        renderInstalledScriptsTab(content);
        break;
      case "forum":
        renderForumPreferencesTab(content);
        break;
      case "settings":
        renderSettingsTab(content);
        break;
    }
  }

  // G:/Modding/_Github/HQ-Userscripts/src/ui/modals/core/modalManager.js

  /**
   * Core functions for managing the main userscript manager modal.
   */
  const modalCore = {
    showModal: () => showModal(hideModal, loadTabContent),
    hideModal: hideModal,
    loadTabContent: loadTabContent,
  };

  // Re-wire internal calls within showModal to use the new object structure
  // This requires modifying showModal.js AFTER modalManager.js is created and imported elsewhere.
  // For now, we assume external calls will use modalCore.hideModal() etc.
  // We might need to adjust showModal.js later if direct calls like hideModal() cause issues.

  /**
   * Logic to handle the Insert key press for toggling the modal.
   * This function should be bound to the correct modal show/hide context when used as a listener.
   * @param {KeyboardEvent} event - The keyboard event.
   * @param {function} showFunc - The function to call to show the modal.
   * @param {function} hideFunc - The function to call to hide the modal.
   */
  function handleInsertKeyPressLogic(event, showFunc, hideFunc) {
    // Check if the Insert key was pressed and no input field is focused
    if (
      event.key === "Insert" &&
      !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)
    ) {
      event.preventDefault(); // Prevent default Insert key behavior (like overtype)
      const modal = document.getElementById("mod-manager-modal");
      // Check if the modal exists and is currently hidden or doesn't exist yet
      if (!modal || modal.style.display === "none") {
        showFunc();
      } else {
        hideFunc();
      }
    }
  }

  /**
   * Render a setting control based on its type
   * @param {Object} setting - The setting object
   * @returns {string} - HTML for the setting control
   */
  function renderSettingControl(setting) {
    switch (setting.type) {
      case "boolean":
        return `
        <label class="toggle-switch">
          <input type="checkbox" ${setting.default ? "checked" : ""}>
          <span class="toggle-slider"></span>
        </label>
      `;
      case "select":
        return `
        <select class="setting-input">
          ${setting.options
            .map(
              (option) => `
            <option value="${option}" ${
                option === setting.default ? "selected" : ""
              }>${option}</option>
          `
            )
            .join("")}
        </select>
      `;
      case "number":
        return `
        <input type="number" class="setting-input" value="${
          setting.default || 0
        }">
      `;
      default:
        return `
        <input type="text" class="setting-input" value="${
          setting.default || ""
        }">
      `;
    }
  }

  /**
   * Render script settings content
   * @param {Object} script - The script object
   * @returns {string} - HTML for the script settings
   */
  function renderScriptSettingsContent(script) {
    if (!script.settings || script.settings.length === 0) {
      return "";
    }

    return `
    <div class="setting-group">
      ${script.settings
        .map(
          (setting) => `
        <div class="setting-item">
          <label class="setting-label">${setting.label}</label>
          <span class="setting-description">${setting.description}</span>
          <div class="setting-control">
            ${renderSettingControl(setting)}
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
  }

  /**
   * Show the script settings modal
   * @param {Object} script - The script object to show settings for
   */
  function showScriptSettings(script) {
    // Create modal if it doesn't exist
    let modal = document.getElementById("script-settings-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "script-settings-modal";
      modal.className = "settings-modal";
      document.body.appendChild(modal);
    }

    // Populate modal with script settings
    modal.innerHTML = `
    <div class="settings-modal-content">
      <div class="settings-modal-header">
        <h2 class="settings-modal-title">${script.name} Settings</h2>
        <span class="settings-modal-close">&times;</span>
      </div>
      
      ${
        script.settings && script.settings.length > 0
          ? renderScriptSettingsContent(script)
          : `
          <div class="empty-state">
            <div class="empty-state-icon">
              <i class="fa fa-cog"></i>
            </div>
            <h3 class="empty-state-message">No Settings Available</h3>
            <p>This script doesn't have any configurable settings.</p>
          </div>
        `
      }
      
      <div class="script-info" style="margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 15px;">
        <h3>Script Information</h3>
        <table class="data-table">
          <tr>
            <th>ID</th>
            <td>${script.id}</td>
          </tr>
          <tr>
            <th>Version</th>
            <td>${script.version}</td>
          </tr>
          <tr>
            <th>Category</th>
            <td>${script.category || "Uncategorized"}</td>
          </tr>
          <tr>
            <th>Execution Phase</th>
            <td>${script.executionPhase || "Not specified"}</td>
          </tr>
          <tr>
            <th>Matches</th>
            <td>${
              script.matches ? script.matches.join("<br>") : "Not specified"
            }</td>
          </tr>
        </table>
      </div>
      
      <div class="info-note" style="margin-top: 15px;">
        <strong>Note:</strong> This is a view-only display of script settings. No changes will be saved.
      </div>
    </div>
  `;

    // Show the modal
    modal.style.display = "block";

    // Add event listeners
    modal
      .querySelector(".settings-modal-close")
      .addEventListener("click", () => {
        modal.style.display = "none";
      });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  // src/helpers/popupHelpers.js
  // Import other UI/popup helpers here

  // Define helper functions first
  const _showModal = modalCore.showModal;
  const _hideModal = modalCore.hideModal;

  // Function to set up the Insert key listener
  function setupInsertKeyListener() {
    // Add the listener, passing the correct show/hide functions
    document.addEventListener("keydown", (event) => {
      handleInsertKeyPressLogic(event, _showModal, _hideModal);
    });
  }

  const popupHelpers = {
    showModal: _showModal,
    hideModal: _hideModal,
    loadTabContent: modalCore.loadTabContent,
    createScriptToggle: createScriptToggle,
    // Expose the function that sets up the listener
    toggleModalWithInsertKey: setupInsertKeyListener,
    showScriptSettings: showScriptSettings,
    // Add other popup/UI helpers as needed
  };

  /**
   * Add menu button to the page
   */
  function addMenuButton() {
    const profileDropdown = document.querySelector(
      '.header-profile.dropdown-container .dropdown-contents[role="menu"]'
    );
    if (!profileDropdown) return;

    const logoutButton = Array.from(
      profileDropdown.querySelectorAll("li")
    ).find((li) => {
      return (
        li.textContent.trim().includes("Logout") ||
        li.querySelector('a[title="Logout"]')
      );
    });

    if (!logoutButton) return;

    const userscriptsButton = document.createElement("li");
    userscriptsButton.innerHTML = `
    <a href="#" title="View Userscripts" role="menuitem" style="font-size:0.9em;">
      <i class="fa fa-puzzle-piece fa-fw"></i><span> View Userscripts</span>
    </a>
  `;

    logoutButton.parentNode.insertBefore(userscriptsButton, logoutButton);
    userscriptsButton.querySelector("a").addEventListener("click", (event) => {
      event.preventDefault();
      popupHelpers.showModal();
    });
  }

  /**
   * Initialize the userscript
   */
  function init() {
    addStyles();
    // Register menu command to use the helper function
    GM_registerMenuCommand("RPGHQ Userscript Manager", popupHelpers.showModal);

    // Add event listener for the Insert key using the helper function
    // Note: toggleModalWithInsertKey function itself adds the listener now
    popupHelpers.toggleModalWithInsertKey();

    // Add menu button to the page when DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", addMenuButton);
    } else {
      addMenuButton();
    }
  }

  // Import metadata for rollup-plugin-userscript

  (function () {
    // Run initialization
    init();
  })();
})();
