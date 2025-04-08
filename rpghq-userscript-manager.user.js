// ==UserScript==
// @name        RPGHQ Userscript Manager (Popup Only)
// @namespace   https://rpghq.org/
// @version     3.0.2
// @description A simple popup that displays the MANIFEST of available scripts without any functional components
// @author      loregamer
// @match       https://rpghq.org/forums/*
// @run-at      document-start
// @grant       GM_addStyle
// @grant       GM_deleteValue
// @grant       GM_getValue
// @grant       GM_listValues
// @grant       GM_registerMenuCommand
// @grant       GM_setValue
// @grant       GM_xmlhttpRequest
// ==/UserScript==

(function () {
  'use strict';

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
    ]};

  /**
   * @module scriptState
   * @description Helper functions for managing the enabled/disabled state of scripts.
   */

  const SETTINGS_KEY_PREFIX = 'script_enabled_';

  /**
   * Gets the enabled state for a specific script. Defaults to true if not set.
   * @param {string} scriptId - The ID of the script.
   * @returns {boolean} - True if the script is enabled, false otherwise.
   */
  function isScriptEnabled(scriptId) {
    // Default to enabled (true) if no setting is found
    return GM_getValue(SETTINGS_KEY_PREFIX + scriptId, true);
  }

  /**
   * Sets the enabled state for a specific script.
   * @param {string} scriptId - The ID of the script.
   * @param {boolean} isEnabled - The new state (true for enabled, false for disabled).
   */
  function setScriptEnabled(scriptId, isEnabled) {
    GM_setValue(SETTINGS_KEY_PREFIX + scriptId, isEnabled);
  }

  /**
   * Creates a toggle switch element for enabling/disabling a script.
   * @param {string} scriptId - The ID of the script.
   * @returns {HTMLElement} - The toggle switch element.
   */
  function createScriptToggle(scriptId) {
    const label = document.createElement('label');
    // Use the classes defined in addStyles.js
    label.className = 'toggle-switch';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = isScriptEnabled(scriptId);
    input.dataset.scriptId = scriptId;

    const slider = document.createElement('span');
    // Use the classes defined in addStyles.js
    slider.className = 'toggle-slider';

    label.appendChild(input);
    label.appendChild(slider);

    // Add event listener to handle state changes
    input.addEventListener('change', (event) => {
      const scriptId = event.target.dataset.scriptId;
      const isEnabled = event.target.checked;
      setScriptEnabled(scriptId, isEnabled);
      console.log(`Script '${scriptId}' ${isEnabled ? 'enabled' : 'disabled'}`);
      // Optionally, add visual feedback or trigger other actions here
    });

    return label;
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
    modal.querySelector(".settings-modal-close").addEventListener("click", () => {
      modal.style.display = "none";
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
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
    document.querySelectorAll(".script-card-toggle").forEach((toggleContainer) => {
      const scriptId = toggleContainer.dataset.scriptId;
      if (scriptId) {
        toggleContainer.appendChild(createScriptToggle(scriptId));
      }
    });

    // Add event listeners for settings buttons
    document.querySelectorAll(".view-settings").forEach((btn) => {
      btn.addEventListener("click", () => {
        const scriptId = btn.dataset.scriptId;
        const script = scripts.find((s) => s.id === scriptId);
        if (script) {
          showScriptSettings(script);
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
        cell.appendChild(createScriptToggle(scriptId));
      }
    });

    // Add event listeners for settings buttons
    document.querySelectorAll(".view-settings").forEach((btn) => {
      btn.addEventListener("click", () => {
        const scriptId = btn.dataset.scriptId;
        const script = scripts.find((s) => s.id === scriptId);
        if (script) {
          showScriptSettings(script);
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

  /**
   * Create and show the modal with script information
   */
  function showModal() {
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
      modal.querySelector(".mod-manager-close").addEventListener("click", () => {
        hideModal();
      });

      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          hideModal();
        }
      });

      // Tab switching
      modal.querySelectorAll(".mod-manager-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          document.querySelectorAll(".mod-manager-tab").forEach((t) => {
            t.classList.remove("active");
          });
          tab.classList.add("active");
          loadTabContent(tab.dataset.tab);
        });
      });
    }

    modal.style.display = "block";
    document.body.style.overflow = "hidden";

    // Initial view - load the first tab (Installed Scripts)
    loadTabContent("installed");
  }

  /**
   * Toggle the modal visibility when the Insert key is pressed
   */
  function toggleModalWithInsertKey(e) {
    // Check if the key pressed is Insert (key code 45)
    if (e.keyCode === 45) {
      // Prevent default behavior
      e.preventDefault();
      
      // Check if the modal is currently visible
      const modal = document.getElementById("mod-manager-modal");
      if (modal && modal.style.display === "block") {
        // If visible, hide it
        hideModal();
      } else {
        // If not visible, show it
        showModal();
      }
    }
  }

  // Export the function for Node.js environment
  // Removed for ES Module refactor

  /**
   * Add menu button to the page
   */
  function addMenuButton() {
    const profileDropdown = document.querySelector(
      '.header-profile.dropdown-container .dropdown-contents[role="menu"]'
    );
    if (!profileDropdown) return;

    const logoutButton = Array.from(profileDropdown.querySelectorAll("li")).find(
      (li) => {
        return (
          li.textContent.trim().includes("Logout") ||
          li.querySelector('a[title="Logout"]')
        );
      }
    );

    if (!logoutButton) return;

    const userscriptsButton = document.createElement("li");
    userscriptsButton.innerHTML = `
    <a href="#" title="View Userscripts" role="menuitem" style="font-size:0.9em;">
      <i class="fa fa-puzzle-piece fa-fw"></i><span> View Userscripts</span>
    </a>
  `;

    logoutButton.parentNode.insertBefore(userscriptsButton, logoutButton);
    userscriptsButton.querySelector("a").addEventListener("click", (e) => {
      e.preventDefault();
      showModal();
    });
  }

  /**
   * @module helpers/Notifications/Constants
   * @description Constants specific to the Notifications feature.
   */

  const ONE_DAY = 24 * 60 * 60 * 1000;
  const FETCH_DELAY = 500; // Add delay between fetches (consider if still needed)

  // Base style for displaying quoted content reference in notifications
  const REFERENCE_STYLE = {
    display: "inline-block",
    background: "rgba(23, 27, 36, 0.5)",
    color: "#ffffff",
    padding: "2px 4px",
    borderRadius: "2px",
    zIndex: "-1", // May not be needed if structure is flat
    maxWidth: "98%",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    verticalAlign: "bottom", // Align better with text
    marginLeft: "4px",
    fontSize: "0.9em",
  };

  // Style for the notification block container
  const NOTIFICATION_BLOCK_STYLE = {
    position: "relative",
    paddingBottom: "20px", // Make room for the timestamp
  };

  // Style for the timestamp within a notification block
  const NOTIFICATION_TIME_STYLE = {
    position: "absolute",
    bottom: "2px",
    right: "2px",
    fontSize: "0.85em",
    color: "#888",
    pointerEvents: "none", // Prevent interfering with clicks
  };

  // Style for timestamp on the dedicated notification page (ucp.php?i=ucp_notifications)
  // Note: This might be redundant if the selector can be more specific in CSS
  const NOTIFICATIONS_PAGE_TIME_STYLE = {
    position: "absolute",
    bottom: "2px",
    left: "2px", // Positioned differently on this page in original script
    fontSize: "0.85em",
    color: "#888",
    pointerEvents: "none",
  };

  // --- Reaction display ---
  const REACTION_SPAN_STYLE = {
    display: "inline-flex",
    marginLeft: "2px",
    verticalAlign: "middle",
  };

  const REACTION_IMAGE_STYLE = {
    height: "1em !important",
    width: "auto !important",
    verticalAlign: "middle !important",
    marginRight: "2px !important",
  };

  // --- Color constants for notification types ---
  // Keep consistent with forum or define a palette
  const COLOR_REACTED = "#3889ED"; // Blueish
  const COLOR_MENTIONED = "#FFC107"; // Gold/Yellow
  const COLOR_QUOTED = "#FF4A66"; // Reddish/Pink
  const COLOR_REPLY = "#95DB00"; // Greenish
  const COLOR_WARNING = "#D31141"; // Red
  const COLOR_REPORT_CLOSED = "#f58c05"; // Orange
  const COLOR_POST_APPROVAL = "#00AA00"; // Green

  // --- Text styling ---
  const SUBTLE_TEXT_STYLE = {
    fontSize: "0.85em",
    padding: "0 0.25px",
  };

  /**
   * @module helpers/Core/Logger
   * @description A simple console logger class with levels and context.
   */

  // Define log levels
  const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3};

  // Determine log level (e.g., from settings or a global variable)
  // Default to INFO for production, DEBUG for development maybe?
  // For now, let's use INFO as default, but allow override via GM_config or similar later.
  let currentLogLevel = LogLevel.INFO;

  class Logger {
    /**
     * Creates a new Logger instance.
     * @param {string} context - The context name to prepend to log messages (e.g., 'Notifications API').
     */
    constructor(context = "Default") {
      this.context = context;
    }

    _log(level, message, ...optionalParams) {
      if (level < currentLogLevel) {
        return; // Skip logging if below current level
      }

      const timestamp = new Date().toISOString();
      const prefix = `[${timestamp}] [${this.context}]`;

      switch (level) {
        case LogLevel.DEBUG:
          console.debug(prefix, message, ...optionalParams);
          break;
        case LogLevel.INFO:
          console.info(prefix, message, ...optionalParams);
          break;
        case LogLevel.WARN:
          console.warn(prefix, message, ...optionalParams);
          break;
        case LogLevel.ERROR:
          console.error(prefix, message, ...optionalParams);
          break;
        default:
          console.log(prefix, message, ...optionalParams);
      }
    }

    /**
     * Logs a debug message.
     * @param {any} message - The primary message.
     * @param  {...any} optionalParams - Additional parameters to log.
     */
    debug(message, ...optionalParams) {
      this._log(LogLevel.DEBUG, message, ...optionalParams);
    }

    /**
     * Logs an info message.
     * @param {any} message - The primary message.
     * @param  {...any} optionalParams - Additional parameters to log.
     */
    info(message, ...optionalParams) {
      this._log(LogLevel.INFO, message, ...optionalParams);
    }

    /**
     * Logs a warning message.
     * @param {any} message - The primary message.
     * @param  {...any} optionalParams - Additional parameters to log.
     */
    warn(message, ...optionalParams) {
      this._log(LogLevel.WARN, message, ...optionalParams);
    }

    /**
     * Logs an error message.
     * @param {any} message - The primary message.
     * @param  {...any} optionalParams - Additional parameters to log.
     */
    error(message, ...optionalParams) {
      this._log(LogLevel.ERROR, message, ...optionalParams);
    }
  }

  // Example: Set log level based on a script setting or debug flag
  // import { getSetting } from './SettingsManager'; // Hypothetical settings manager
  // const debugMode = getSetting('global.debugMode', false);
  // setGlobalLogLevel(debugMode ? LogLevel.DEBUG : LogLevel.INFO);

  /**
   * @module helpers/Notifications/Storage
   * @description Storage handling (GM_getValue/setValue) for notification data like reactions and post content, with caching and cleanup.
   */


  const log$4 = new Logger("Notifications Storage");

  const REACTION_PREFIX = "reactions_";
  const CONTENT_PREFIX = "post_content_";
  const CLEANUP_KEY = "last_notification_storage_cleanup";

  /**
   * Retrieves cached reactions for a post ID if not expired.
   * @param {string} postId - The post ID.
   * @returns {Array|null} Cached reactions or null if not found/expired.
   */
  function getStoredReactions(postId) {
    const storedData = GM_getValue(`${REACTION_PREFIX}${postId}`);
    if (storedData) {
      try {
        const { reactions, timestamp } = JSON.parse(storedData);
        if (Date.now() - timestamp < ONE_DAY) {
          log$4.debug(`Cache hit for reactions: ${postId}`);
          return reactions;
        }
        log$4.debug(`Cache expired for reactions: ${postId}`);
        GM_deleteValue(`${REACTION_PREFIX}${postId}`);
      } catch (e) {
        log$4.error(`Error parsing stored reactions for ${postId}:`, e);
        GM_deleteValue(`${REACTION_PREFIX}${postId}`);
      }
    }
    log$4.debug(`Cache miss for reactions: ${postId}`);
    return null;
  }

  /**
   * Stores reactions for a post ID with a timestamp.
   * @param {string} postId - The post ID.
   * @param {Array} reactions - The reactions array to store.
   */
  function storeReactions(postId, reactions) {
    if (!postId || !Array.isArray(reactions)) {
      log$4.warn("Attempted to store invalid reactions data", {
        postId,
        reactions,
      });
      return;
    }
    try {
      GM_setValue(
        `${REACTION_PREFIX}${postId}`,
        JSON.stringify({ reactions, timestamp: Date.now() })
      );
      log$4.debug(`Stored reactions for post: ${postId}`);
    } catch (e) {
      log$4.error(`Error storing reactions for ${postId}:`, e);
    }
  }

  /**
   * Retrieves cached post content for a post ID if not expired.
   * @param {string} postId - The post ID.
   * @returns {string|null} Cached content or null if not found/expired.
   */
  function getStoredPostContent(postId) {
    const storedData = GM_getValue(`${CONTENT_PREFIX}${postId}`);
    if (storedData) {
      try {
        const { content, timestamp } = JSON.parse(storedData);
        if (Date.now() - timestamp < ONE_DAY) {
          log$4.debug(`Cache hit for content: ${postId}`);
          return content;
        }
        log$4.debug(`Cache expired for content: ${postId}`);
        GM_deleteValue(`${CONTENT_PREFIX}${postId}`);
      } catch (e) {
        log$4.error(`Error parsing stored content for ${postId}:`, e);
        GM_deleteValue(`${CONTENT_PREFIX}${postId}`);
      }
    }
    log$4.debug(`Cache miss for content: ${postId}`);
    return null;
  }

  /**
   * Stores post content for a post ID with a timestamp.
   * @param {string} postId - The post ID.
   * @param {string} content - The post content to store.
   */
  function storePostContent(postId, content) {
    if (!postId || typeof content !== "string") {
      log$4.warn("Attempted to store invalid post content data", {
        postId,
        content,
      });
      return;
    }
    try {
      GM_setValue(
        `${CONTENT_PREFIX}${postId}`,
        JSON.stringify({ content, timestamp: Date.now() })
      );
      log$4.debug(`Stored content for post: ${postId}`);
    } catch (e) {
      log$4.error(`Error storing content for ${postId}:`, e);
    }
  }

  /**
   * Cleans up expired notification-related data from GM storage.
   */
  function cleanupStorage() {
    const lastCleanup = GM_getValue(CLEANUP_KEY, 0);
    const now = Date.now();

    // Only cleanup if it's been more than 24 hours since last cleanup
    if (now - lastCleanup < ONE_DAY) {
      return;
    }

    log$4.info("Running notification storage cleanup...");
    let deletedCount = 0;

    try {
      const allKeys = GM_listValues ? GM_listValues() : [];

      allKeys.forEach((key) => {
        if (
          key === CLEANUP_KEY ||
          (!key.startsWith(REACTION_PREFIX) && !key.startsWith(CONTENT_PREFIX))
        ) {
          return; // Skip irrelevant keys
        }

        const data = GM_getValue(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            // Check if data has a timestamp and if it's older than ONE_DAY
            if (parsed.timestamp && now - parsed.timestamp >= ONE_DAY) {
              GM_deleteValue(key);
              deletedCount++;
              log$4.debug(`Deleted expired storage key: ${key}`);
            }
          } catch (e) {
            // If we can't parse, it might be old format or corrupted, delete it
            log$4.warn(`Deleting potentially corrupt key: ${key}`);
            GM_deleteValue(key);
            deletedCount++;
          }
        }
      });

      // Update last cleanup timestamp
      GM_setValue(CLEANUP_KEY, now);
      log$4.info(
        `Storage cleanup complete. Deleted ${deletedCount} expired items.`
      );
    } catch (error) {
      log$4.error("Error during storage cleanup:", error);
    }
  }

  /**
   * @module helpers/Notifications/ContentParsing
   * @description Utilities for parsing and cleaning notification/post content, including BBCode removal and media extraction.
   */


  /**
   * Aggressively removes nested quote blocks from text.
   * @param {string} text - The input text.
   * @returns {string} Text with inner quote blocks removed.
   */
  function aggressiveRemoveInnerQuotes(text) {
    let result = "";
    let i = 0;
    let depth = 0;

    while (i < text.length) {
      // Check for an opening quote tag (simplified, assumes [quote=...]).
      if (text.startsWith("[quote=", i)) {
        depth++;
        const endBracket = text.indexOf("]", i);
        if (endBracket === -1) break; // Malformed
        i = endBracket + 1;
        continue;
      }

      // Check for a closing quote tag.
      if (text.startsWith("[/quote]", i)) {
        if (depth > 0) {
          depth--;
        }
        i += 8; // Skip "[/quote]"
        continue;
      }

      // Only append characters that are NOT inside a quote block.
      if (depth === 0) {
        result += text[i];
      }
      i++;
    }
    return result;
  }

  /**
   * Cleans up raw post content fetched from the quote page.
   * Removes outer quote tags and any nested quote blocks.
   * @param {string} content - The raw post content.
   * @returns {string} Cleaned post content.
   */
  function cleanupPostContent(content) {
    if (!content) return "";

    // 1. Normalize any [quote="..."] tags to [quote=...]
    let cleaned = content.replace(/\[quote="([^"]+)"\]/g, "[quote=$1]");

    // 2. Remove ONLY the first occurrence of an opening quote tag.
    const firstOpenIdx = cleaned.indexOf("[quote=");
    if (firstOpenIdx !== -1) {
      const firstCloseBracket = cleaned.indexOf("]", firstOpenIdx);
      if (firstCloseBracket !== -1) {
        cleaned =
          cleaned.slice(0, firstOpenIdx) + cleaned.slice(firstCloseBracket + 1);
      }
    }

    // 3. Remove ONLY the last occurrence of a closing quote tag.
    const lastCloseIdx = cleaned.lastIndexOf("[/quote]");
    if (lastCloseIdx !== -1) {
      cleaned = cleaned.slice(0, lastCloseIdx) + cleaned.slice(lastCloseIdx + 8);
    }

    // 4. Aggressively remove any remaining inner quote blocks.
    cleaned = aggressiveRemoveInnerQuotes(cleaned);

    return cleaned.trim();
  }

  /**
   * Removes common BBCode tags from text, preserving content.
   * @param {string} text - The input text.
   * @returns {string} Text with BBCode tags removed.
   */
  function removeBBCode(text) {
    if (!text) return "";
    return text
      .replace(/\[(color|size|font)=[^]]*\](.*?)\[\/\1\]/gi, "$2") // color, size, font
      .replace(/\[(b|i|u|s)\](.*?)\[\/\1\]/gi, "$2") // b, i, u, s
      .replace(/\[url=[^]]*\](.*?)\[\/url\]/gi, "$1") // url with attr
      .replace(/\[url\](.*?)\[\/url\]/gi, "$1") // simple url
      .replace(/\[img(?:\s+[^=\]]+=[^\]]+)?\](.*?)\[\/img\]/gi, "") // img tags (remove content)
      .replace(/\[(media|webm)\](.*?)\[\/\1\]/gi, "") // media, webm (remove content)
      .replace(/\[code(?:=[^]]*)?\](.*?)\[\/code\]/gis, "$1") // code (keep content)
      .replace(/\[list(?:=[^]]*)?\](.*?)\[\/list\]/gis, "$1") // list (keep content)
      .replace(/\[\*\]/gi, " ") // list items
      .replace(/\[quote(?:=[^]]*)?\](.*?)\[\/quote\]/gis, "") // quote (remove content, handles nested aggression already)
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
  }

  /**
   * Removes URLs (http, https, ftp, www) from text.
   * @param {string} text - The input text.
   * @returns {string} Text with URLs removed.
   */
  function removeURLs(text) {
    if (!text) return "";
    return text
      .replace(/(?:https?|ftp):\/\/[^\s]+/gi, "")
      .replace(/www\.[^\s]+/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Extracts the URL from the first image tag ([img]...[/img] or [img attr=...]...[/img]) found in the text.
   * @param {string} text - The text containing potential image tags.
   * @returns {string|null} The extracted image URL or null if none found.
   */
  function extractFirstImageUrl(text) {
    if (!text) return null;

    // Match [img]url[/img]
    let match = text.match(/\[img\](.*?)\[\/img\]/i);
    if (match && match[1]) {
      return match[1].trim();
    }

    // Match [img attr=val]url[/img]
    match = text.match(/\[img\s+[^=\]]+=[^\]]+\](.*?)\[\/img\]/i);
    if (match && match[1]) {
      return match[1].trim();
    }

    return null;
  }

  /**
   * Checks if the entire string consists of just a single image tag.
   * @param {string} text - The input text.
   * @returns {boolean} True if the text is only a single image tag.
   */
  function isSingleImageTag(text) {
    if (!text) return false;
    const trimmed = text.trim();
    return (
      (trimmed.startsWith("[img]") && trimmed.endsWith("[/img]")) ||
      !!trimmed.match(/^\[img\s+[^=\]]+=[^\]]+\](.*?)\[\/img\]$/i)
    );
  }

  /**
   * Extracts the URL and type from the first video tag ([webm]...[/webm] or [media]...[/media]) found.
   * @param {string} text - The text containing potential video tags.
   * @returns {{url: string, type: 'webm'|'media'}|null} The extracted video data or null.
   */
  function extractFirstVideoUrl(text) {
    if (!text) return null;

    let match = text.match(/\[webm\](.*?)\[\/webm\]/i);
    if (match && match[1]) {
      return { url: match[1].trim(), type: "webm" };
    }

    match = text.match(/\[media\](.*?)\[\/media\]/i);
    if (match && match[1]) {
      return { url: match[1].trim(), type: "media" };
    }

    return null;
  }

  /**
   * Checks if the entire string consists of just a single video tag.
   * @param {string} text - The input text.
   * @returns {boolean} True if the text is only a single video tag.
   */
  function isSingleVideoTag(text) {
    if (!text) return false;
    const trimmed = text.trim();
    return (
      (trimmed.startsWith("[webm]") && trimmed.endsWith("[/webm]")) ||
      (trimmed.startsWith("[media]") && trimmed.endsWith("[/media]"))
    );
  }

  /**
   * Extracts the post ID from a URL string.
   * @param {string | null | undefined} url - The URL to parse.
   * @returns {string|null} The extracted post ID or null.
   */
  function extractPostIdFromUrl(url) {
    if (!url) return null;
    // Look for p=NUMBER or #pNUMBER
    const match = url.match(/[?&]p=(\d+)|#p(\d+)/);
    return match ? match[1] || match[2] : null;
  }

  /**
   * @module helpers/Core/Utils
   * @description General utility functions.
   */

  /**
   * Creates a promise that resolves after a specified delay.
   * @param {number} ms - Milliseconds to wait.
   * @returns {Promise<void>}
   */
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Escapes HTML special characters in a string.
   * @param {string} str - The string to escape.
   * @returns {string} The escaped string.
   */
  function escapeHTML(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * @module helpers/Notifications/API
   * @description Handles API interactions for the Notifications feature, such as fetching reactions and post content.
   */


  const log$3 = new Logger("Notifications API");

  /**
   * Fetches reactions for a given post ID.
   * Uses cache first, then fetches from the server.
   * @param {string} postId - The ID of the post.
   * @param {boolean} forceFetch - Whether to bypass the cache and force a fetch.
   * @returns {Promise<Array>} A promise resolving to an array of reaction objects.
   */
  async function fetchReactions(postId, forceFetch = false) {
    log$3.debug(`Fetching reactions for post ${postId}, forceFetch: ${forceFetch}`);
    if (!forceFetch) {
      const storedReactions = getStoredReactions(postId);
      if (storedReactions) {
        return storedReactions;
      }
    }

    // Add a small delay to avoid rate-limiting issues
    await sleep(FETCH_DELAY);

    try {
      const response = await fetch(
        `https://rpghq.org/forums/reactions?mode=view&post=${postId}`,
        {
          method: "POST", // Original used POST
          headers: {
            accept: "application/json, text/javascript, */*; q=0.01",
            "x-requested-with": "XMLHttpRequest",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data || !data.htmlContent) {
        throw new Error("Invalid response format for reactions");
      }

      // Parse the HTML to extract reaction details
      const doc = new DOMParser().parseFromString(data.htmlContent, "text/html");
      const reactions = Array.from(
        // Assuming the original selector is correct for the response structure
        doc.querySelectorAll('.tab-content[data-id="0"] li')
      ).map((li) => {
        const userLink = li.querySelector(".cbb-helper-text a");
        const reactionImage = li.querySelector(".reaction-image");
        return {
          username: userLink ? userLink.textContent.trim() : "Unknown User",
          image: reactionImage ? reactionImage.src : "",
          name: reactionImage ? reactionImage.alt : "Unknown Reaction",
        };
      });

      log$3.debug(
        `Successfully fetched ${reactions.length} reactions for post ${postId}`
      );
      storeReactions(postId, reactions);
      return reactions;
    } catch (error) {
      log$3.error(`Error fetching reactions for post ${postId}:`, error);
      return []; // Return empty array on error
    }
  }

  /**
   * Fetches the raw BBCode content of a post.
   * Uses cache first, then fetches from the quote URL.
   * @param {string} postId - The ID of the post.
   * @returns {Promise<string|null>} A promise resolving to the post content string or null on error.
   */
  async function fetchPostContent(postId) {
    log$3.debug(`Fetching content for post ${postId}`);
    const cachedContent = getStoredPostContent(postId);
    if (cachedContent) {
      return cachedContent;
    }

    // Add a small delay
    await sleep(FETCH_DELAY);

    try {
      const response = await fetch(
        `https://rpghq.org/forums/posting.php?mode=quote&p=${postId}`,
        {
          headers: { "X-Requested-With": "XMLHttpRequest" }, // Important for getting the raw content
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();

      // Parse the response HTML to find the message textarea
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = text;
      const messageArea = tempDiv.querySelector("#message");

      if (!messageArea) {
        // Maybe the post is inaccessible (deleted, permissions?)
        log$3.warn(
          `Could not find message content textarea for post ${postId}. Storing null.`
        );
        storePostContent(postId, null); // Store null to prevent refetching immediately
        return null;
      }

      // Clean up the raw content from the textarea
      const content = cleanupPostContent(messageArea.value);
      log$3.debug(`Successfully fetched and cleaned content for post ${postId}`);
      storePostContent(postId, content);
      return content;
    } catch (error) {
      log$3.error(`Error fetching post content for ${postId}:`, error);
      // Store null on error to avoid constant refetch attempts for problematic posts
      storePostContent(postId, null);
      return null;
    }
  }

  /**
   * @module helpers/Core/DOMUtils
   * @description General utility functions for DOM manipulation.
   */

  /**
   * Creates an HTML element with specified attributes and inner HTML.
   * @param {string} tag - The HTML tag name (e.g., 'div', 'span').
   * @param {Object} [attributes={}] - An object containing element attributes (e.g., { className: 'my-class', id: 'my-id' }).
   * @param {string} [innerHTML=''] - The inner HTML content for the element.
   * @returns {HTMLElement} The created HTML element.
   */
  function createElement(tag, attributes = {}, innerHTML = "") {
    const element = document.createElement(tag);
    for (const key in attributes) {
      if (Object.hasOwnProperty.call(attributes, key)) {
        // Handle className separately for convenience
        if (key === "className") {
          element.className = attributes[key];
        } else if (key.startsWith("data-")) {
          // Use dataset for data attributes
          element.dataset[key.substring(5)] = attributes[key];
        } else {
          element.setAttribute(key, attributes[key]);
        }
      }
    }
    if (innerHTML) {
      element.innerHTML = innerHTML;
    }
    return element;
  }

  /**
   * Applies multiple CSS styles to an element.
   * @param {HTMLElement} element - The element to style.
   * @param {Object} styles - An object where keys are CSS property names (camelCase) and values are the property values.
   */
  function applyStyle(element, styles) {
    if (!element || !styles) return;
    for (const property in styles) {
      if (Object.hasOwnProperty.call(styles, property)) {
        element.style[property] = styles[property];
      }
    }
  }

  /**
   * @module helpers/Core/Formatting
   * @description Utility functions for formatting data, like usernames or dates.
   */


  /**
   * Formats an array of username elements (or strings) into a comma-separated string with "and".
   * Preserves the original HTML structure of the username elements if provided.
   * @param {Array<HTMLElement|string>} usernames - An array of username elements or plain strings.
   * @returns {string} A formatted string (e.g., "UserA, UserB and UserC").
   */
  function formatUsernames(usernames) {
    if (!usernames || usernames.length === 0) return "Someone";

    const nameStrings = usernames.map((u) => {
      if (typeof u === "string") {
        return escapeHTML(u);
      } else if (u instanceof HTMLElement) {
        // Clone the element to avoid modifying the original DOM
        const clone = u.cloneNode(true);
        // Optionally remove styles if they interfere
        // clone.style.cssText = '';
        return clone.outerHTML;
      } else {
        return "unknown";
      }
    });

    if (nameStrings.length === 1) {
      return nameStrings[0];
    }
    if (nameStrings.length === 2) {
      return `${nameStrings[0]} and ${nameStrings[1]}`;
    }
    // For 3 or more
    const last = nameStrings.pop();
    return `${nameStrings.join(", ")} and ${last}`;
  }

  // Add other general formatting functions as needed

  /**
   * @module ui/Notifications/CustomizeNotifications
   * @description Handles the visual customization of notification elements in the panel and on the notifications page.
   */


  const log$2 = new Logger("Notifications UI");

  // --- Internal Helper Functions ---

  /**
   * Formats an array of reaction objects into an HTML string.
   * @param {Array} reactions - Array of reaction objects { image, name, username }.
   * @returns {string} HTML string representing the reactions.
   */
  function formatReactionsHTML(reactions) {
    if (!reactions || reactions.length === 0) return "";

    const reactionImages = reactions
      .map((reaction) => {
        // Basic sanitation
        const safeUsername =
          reaction.username?.replace(/["&<>]/g, "") || "unknown";
        const safeName = reaction.name?.replace(/["&<>]/g, "") || "reaction";
        const safeImage = reaction.image?.startsWith("https://")
          ? reaction.image
          : "";

        if (!safeImage) return ""; // Don't render if image URL is invalid

        const img = createElement("img", {
          src: safeImage,
          alt: safeName,
          title: `${safeUsername}: ${safeName}`,
          "reaction-username": safeUsername, // Custom attribute from original script
        });
        applyStyle(img, REACTION_IMAGE_STYLE);
        return img.outerHTML;
      })
      .join("");

    const span = createElement("span");
    applyStyle(span, REACTION_SPAN_STYLE);
    span.innerHTML = reactionImages;
    return span.outerHTML;
  }

  /**
   * Creates or updates the reference element displaying post content.
   * @param {HTMLElement} titleElement - The notification title element.
   * @param {HTMLElement} blockElement - The main notification block element.
   * @param {string|null} content - The post content (or null if not available).
   * @param {boolean} isLoading - Whether content is still loading.
   */
  function updateReferenceElement(
    titleElement,
    blockElement,
    content,
    isLoading = false
  ) {
    let referenceElement = blockElement.querySelector(".notification-reference");

    if (!referenceElement) {
      referenceElement = createElement("span", {
        className: "notification-reference",
      });
      titleElement.appendChild(createElement("br"));
      titleElement.appendChild(referenceElement);
    }

    if (isLoading) {
      referenceElement.textContent = "Loading content...";
    } else if (content === null) {
      referenceElement.textContent = "Content unavailable"; // Indicate fetch failure or empty content
    } else if (content) {
      const cleanedText = removeURLs(removeBBCode(content));
      referenceElement.textContent = cleanedText;
    } else {
      referenceElement.textContent = ""; // Clear if empty string content
    }

    applyStyle(referenceElement, REFERENCE_STYLE);
  }

  /**
   * Creates a media preview element (image or video).
   * @param {string} type - 'image' or 'video'.
   * @param {string} url - The URL of the media.
   * @returns {HTMLElement|null} The preview element or null.
   */
  function createMediaPreview(type, url) {
    if (!url) return null;

    const commonStyle = {
      maxWidth: "100px",
      maxHeight: "60px",
      borderRadius: "3px",
      marginTop: "4px",
      display: "block", // Ensure it takes block space
    };

    let element;
    if (type === "image") {
      element = createElement("img", { src: url });
      applyStyle(element, commonStyle);
    } else if (type === "video") {
      element = createElement("video", {
        src: url,
        loop: true,
        muted: true,
        autoplay: true,
      });
      applyStyle(element, commonStyle);
    } else {
      return null;
    }

    const container = createElement("div", {
      className: "notification-media-preview",
    });
    container.appendChild(element);
    return container;
  }

  /**
   * Applies common styling and structure to a notification block.
   * @param {HTMLElement} block - The notification block element (usually an <a> tag).
   * @param {boolean} isOnNotificationsPage - True if on the dedicated notifications page.
   */
  function applyCommonBlockStyling(block, isOnNotificationsPage = false) {
    applyStyle(block, NOTIFICATION_BLOCK_STYLE);

    const timeElement = block.querySelector(".notification-time");
    if (timeElement) {
      const timeStyle = isOnNotificationsPage
        ? NOTIFICATIONS_PAGE_TIME_STYLE
        : NOTIFICATION_TIME_STYLE;
      applyStyle(timeElement, timeStyle);
    }

    // Ensure `data-real-url` exists for consistent post ID extraction
    if (!block.dataset.realUrl && block.href) {
      block.dataset.realUrl = block.href;
    }

    // Standardize username elements (remove -coloured class if present)
    block.querySelectorAll(".username-coloured").forEach((el) => {
      el.classList.replace("username-coloured", "username");
      el.style.color = ""; // Remove inline color style if any
    });
  }

  /**
   * Applies subtle styling to common words like 'by', 'and', 'in', 'from'.
   * @param {string} html - Input HTML string.
   * @returns {string} HTML string with subtle styling applied.
   */
  function applySubtleTextStyles(html) {
    const span = createElement("span");
    applyStyle(span, SUBTLE_TEXT_STYLE);
    return html.replace(/\b(by|and|in|from)\b(?!-)/g, (match) => {
      span.textContent = match;
      return span.outerHTML;
    });
  }

  // --- Specific Notification Type Customizers ---

  /**
   * Customizes notifications about reactions.
   * @param {HTMLElement} titleElement - The notification title element.
   * @param {HTMLElement} block - The notification block element.
   */
  async function customizeReactionNotification(titleElement, block) {
    log$2.debug("Customizing reaction notification");
    const isUnread = block.href && block.href.includes("mark_notification");
    const postId = extractPostIdFromUrl(block.dataset.realUrl);
    if (!postId) return;

    try {
      // Fetch reactions and post content concurrently
      const [reactions, postContent] = await Promise.all([
        fetchReactions(postId, isUnread),
        fetchPostContent(postId),
      ]);

      const usernameElements = titleElement.querySelectorAll(".username");
      const reactingUsernames = Array.from(usernameElements).map((el) =>
        el.textContent.trim()
      );

      // Filter fetched reactions to only include those by users mentioned in the title
      const filteredReactions = reactions.filter((reaction) =>
        reactingUsernames.includes(reaction.username)
      );
      const reactionHTML = formatReactionsHTML(filteredReactions);

      // Update title text
      const verb = reactingUsernames.length > 1 ? "have" : "has";
      const verbColor = COLOR_REACTED;
      const formattedUsernames = formatUsernames(Array.from(usernameElements)); // Use core helper

      titleElement.innerHTML = titleElement.innerHTML.replace(
        /(?:have|has)\s+reacted.*$/,
        `${verb} <b style="color: ${verbColor};">reacted</b> ${reactionHTML} to:`
      );

      // Handle content preview (reference or media)
      let referenceElement = block.querySelector(".notification-reference");
      let mediaPreviewElement = block.querySelector(
        ".notification-media-preview"
      );

      // Clear existing previews before adding new ones
      referenceElement?.remove();
      mediaPreviewElement?.remove();

      let addedPreview = false;
      if (postContent) {
        const trimmedContent = postContent.trim();

        if (isSingleVideoTag(trimmedContent)) {
          const videoData = extractFirstVideoUrl(trimmedContent);
          const preview = createMediaPreview("video", videoData?.url);
          if (preview) {
            titleElement.appendChild(preview);
            addedPreview = true;
          }
        } else if (isSingleImageTag(trimmedContent)) {
          const imageUrl = extractFirstImageUrl(trimmedContent);
          const preview = createMediaPreview("image", imageUrl);
          if (preview) {
            titleElement.appendChild(preview);
            addedPreview = true;
          }
        }
      }

      // If no media preview was added, add/update the text reference
      if (!addedPreview) {
        updateReferenceElement(titleElement, block, postContent, false);
      }
    } catch (error) {
      log$2.error(
        `Error customizing reaction notification for post ${postId}:`,
        error
      );
      // Add basic reaction icons even if content fetch fails?
      const fallbackReactions = formatReactionsHTML(
        reactingUsernames.map((u) => ({
          username: u,
          name: "reaction",
          image: "",
        }))
      ); // Placeholder
      titleElement.innerHTML = titleElement.innerHTML.replace(
        /(?:have|has)\s+reacted.*$/,
        `${verb} <b style="color: ${verbColor};">reacted</b> ${fallbackReactions} to:`
      );
    }
  }

  /**
   * Customizes notifications about mentions.
   * @param {HTMLElement} titleElement - The notification title element.
   * @param {HTMLElement} block - The notification block element.
   */
  async function customizeMentionNotification(titleElement, block) {
    log$2.debug("Customizing mention notification");
    const postId = extractPostIdFromUrl(block.dataset.realUrl);
    if (!postId) return;

    const usernameElements = titleElement.querySelectorAll(".username");
    const formattedUsernames = formatUsernames(Array.from(usernameElements));

    // Extract topic name if possible
    const originalHTML = titleElement.innerHTML;
    const parts = originalHTML.split("<br>in ");
    let topicName =
      parts.length > 1 ? parts[1].trim().split(":")[0] : "Unknown Topic"; // Attempt to clean up topic
    topicName = topicName.replace(/<[^>]+>/g, ""); // Strip any remaining HTML tags

    // Update title text
    titleElement.innerHTML = `
        <b style="color: ${COLOR_MENTIONED};">Mentioned</b> by ${formattedUsernames}
        ${applySubtleTextStyles("in")} <b>${topicName}</b>:
    `;

    // Show loading state for reference initially
    updateReferenceElement(titleElement, block, null, true);

    // Fetch and display content reference
    try {
      const postContent = await fetchPostContent(postId);
      updateReferenceElement(titleElement, block, postContent, false);
    } catch (error) {
      log$2.error(
        `Error fetching content for mention notification post ${postId}:`,
        error
      );
      updateReferenceElement(titleElement, block, null, false); // Show unavailable
    }
  }

  /**
   * Customizes notifications about private messages.
   * @param {HTMLElement} titleElement - The notification title element.
   * @param {HTMLElement} block - The notification block element.
   */
  function customizePrivateMessageNotification(titleElement, block) {
    log$2.debug("Customizing private message notification");
    const subjectElement = block.querySelector(".notification-reference");
    const subject = subjectElement?.textContent.trim().replace(/^"(.*)"$/, "$1");

    if (subject === "Board warning issued") {
      titleElement.innerHTML = titleElement.innerHTML
        .replace(
          /<strong>Private Message<\/strong>/,
          `<strong style="color: ${COLOR_WARNING};">Board warning issued</strong>`
        )
        .replace(/from/, applySubtleTextStyles("by"))
        .replace(/:$/, "");
      subjectElement?.remove(); // Remove the redundant subject line
    }
  }

  /**
   * Customizes notifications about replies or quotes.
   * @param {HTMLElement} titleElement - The notification title element.
   * @param {HTMLElement} block - The notification block element.
   * @param {'Reply'|'Quoted'} type - The type of notification.
   */
  async function customizeReplyQuoteNotification(titleElement, block, type) {
    log$2.debug(`Customizing ${type} notification`);
    const postId = extractPostIdFromUrl(block.dataset.realUrl);
    if (!postId) return;

    const referenceElement = block.querySelector(".notification-reference");
    const originalTitleHTML = titleElement.innerHTML;

    // Update strong tag color
    const color = type === "Reply" ? COLOR_REPLY : COLOR_QUOTED;
    titleElement.innerHTML = originalTitleHTML.replace(
      `<strong>${type}</strong>`,
      `<strong style="color: ${color};">${type}</strong>`
    );

    // Extract and format topic title from reference if available
    if (referenceElement) {
      const threadTitle = referenceElement.textContent
        .trim()
        .replace(/^"|"$/g, "");
      titleElement.innerHTML = titleElement.innerHTML.replace(
        /in(?:\stopic)?:/,
        `${applySubtleTextStyles("in")} <strong>${threadTitle}</strong>:`
      );
      // Set reference to loading state initially
      updateReferenceElement(titleElement, block, null, true);
    } else {
      // If no reference element, ensure the colon is added for consistency
      if (!titleElement.innerHTML.endsWith(":")) {
        titleElement.innerHTML += ":";
      }
      // Create a loading state reference element
      updateReferenceElement(titleElement, block, null, true);
    }

    // Fetch and display content reference
    try {
      const postContent = await fetchPostContent(postId);
      updateReferenceElement(titleElement, block, postContent, false);
    } catch (error) {
      log$2.error(
        `Error fetching content for ${type} notification post ${postId}:`,
        error
      );
      updateReferenceElement(titleElement, block, null, false); // Show unavailable
    }
  }

  /**
   * Customizes generic notification types like report closed or post approval.
   * @param {HTMLElement} titleElement - The notification title element.
   * @param {string} titleText - Original innerHTML of the title.
   */
  function customizeGenericNotification(titleElement, titleText) {
    log$2.debug("Customizing generic notification");
    if (titleText.includes("Report closed")) {
      titleElement.innerHTML = titleText.replace(
        /Report closed/,
        `<strong style="color: ${COLOR_REPORT_CLOSED};">Report closed</strong>`
      );
    } else if (titleText.includes("Post approval")) {
      titleElement.innerHTML = titleText.replace(
        /<strong>Post approval<\/strong>/,
        `<strong style="color: ${COLOR_POST_APPROVAL};">Post approval</strong>`
      );
    }
    // Add more generic types here if needed
  }

  // --- Main Customization Logic ---

  /**
   * Customizes a single notification block element.
   * Determines the notification type and calls the appropriate specific customizer.
   * @param {HTMLElement} block - The notification block element.
   * @param {boolean} isOnNotificationsPage - Whether the block is on the main notifications page.
   */
  async function customizeNotificationBlock(
    block,
    isOnNotificationsPage = false
  ) {
    if (block.dataset.customized === "true") {
      log$2.debug("Skipping already customized block", block);
      return; // Already processed
    }

    log$2.debug("Applying common styling to block", block);
    applyCommonBlockStyling(block, isOnNotificationsPage);

    const titleElement = block.querySelector(".notification-title");
    if (!titleElement) {
      log$2.warn("Could not find title element in notification block", block);
      block.dataset.customized = "true"; // Mark as processed even if title missing
      return;
    }

    const originalTitleHTML = titleElement.innerHTML;
    let customizedByType = false;

    try {
      if (originalTitleHTML.includes("reacted to a message you posted")) {
        await customizeReactionNotification(titleElement, block);
        customizedByType = true;
      } else if (originalTitleHTML.includes("You were mentioned by")) {
        await customizeMentionNotification(titleElement, block);
        customizedByType = true;
      } else if (originalTitleHTML.includes("<strong>Reply</strong>")) {
        await customizeReplyQuoteNotification(titleElement, block, "Reply");
        customizedByType = true;
      } else if (originalTitleHTML.includes("<strong>Quoted</strong>")) {
        await customizeReplyQuoteNotification(titleElement, block, "Quoted");
        customizedByType = true;
      } else if (originalTitleHTML.includes("Private Message")) {
        customizePrivateMessageNotification(titleElement, block);
        customizedByType = true;
      } else {
        // Handle generic types only if not handled above
        customizeGenericNotification(titleElement, originalTitleHTML);
      }

      // Apply subtle text styling globally after specific changes
      if (titleElement.innerHTML) {
        // Check if element still exists
        titleElement.innerHTML = applySubtleTextStyles(titleElement.innerHTML);
      }
    } catch (error) {
      log$2.error("Error during notification block customization:", error, block);
      // Restore original title on error?
      // titleElement.innerHTML = originalTitleHTML;
    }

    block.dataset.customized = "true";
    log$2.debug("Finished customizing block", block);
  }

  /**
   * Customizes all notification blocks within a given container (e.g., dropdown panel or page).
   * @param {HTMLElement|Document} container - The element containing notification blocks.
   * @param {string} selector - CSS selector for the notification blocks.
   * @param {boolean} isOnNotificationsPage - Whether the container is the main notifications page.
   */
  function customizeNotificationsContainer(
    container,
    selector = ".notification-block",
    isOnNotificationsPage = false
  ) {
    log$2.info(
      `Customizing notifications in container: ${container.nodeName}, page: ${isOnNotificationsPage}`
    );
    const blocks = container.querySelectorAll(selector);
    log$2.debug(
      `Found ${blocks.length} notification blocks using selector: ${selector}`
    );

    if (blocks.length === 0) return;

    // Use Promise.allSettled to process all blocks even if some fail
    const promises = Array.from(blocks).map((block) =>
      customizeNotificationBlock(block, isOnNotificationsPage)
    );

    Promise.allSettled(promises).then((results) => {
      const fulfilled = results.filter((r) => r.status === "fulfilled").length;
      const rejected = results.filter((r) => r.status === "rejected").length;
      log$2.info(
        `Finished customizing notifications container. Success: ${fulfilled}, Failed: ${rejected}`
      );
      if (rejected > 0) {
        results
          .filter((r) => r.status === "rejected")
          .forEach((rej) => {
            log$2.warn("Customization failure reason:", rej.reason);
          });
      }
    });
  }

  const log$1 = new Logger("Notifications Marker");

  /**
   * Gets IDs of posts currently visible in the main content area.
   * @returns {string[]} Array of visible post IDs.
   */
  function getDisplayedPostIds() {
    // Find post containers (adjust selector if needed)
    return Array.from(document.querySelectorAll('div[id^="p"]')).map((el) =>
      el.id.substring(1)
    );
  }

  /**
   * Extracts notification data (link href and associated post ID) from notification elements.
   * @param {string} notificationSelector - CSS selector for notification link elements.
   * @returns {Array<{href: string, postId: string}>} Array of notification data objects.
   */
  function getNotificationData(
    notificationSelector = '.notification-block a[href*="mark_notification="]'
  ) {
    return Array.from(document.querySelectorAll(notificationSelector))
      .map((link) => {
        // Use data-real-url if available (added by customization?), otherwise use href
        const url = link.dataset.realUrl || link.getAttribute("href");
        const postId = extractPostIdFromUrl(url);
        const markReadHref = link.getAttribute("href"); // The actual mark_notification link

        // Ensure we have a valid mark_notification href and a post ID
        if (
          markReadHref &&
          markReadHref.includes("mark_notification=") &&
          postId
        ) {
          return { href: markReadHref, postId };
        }
        return null;
      })
      .filter(Boolean); // Filter out any null entries
  }

  /**
   * Marks a specific notification as read by sending a request.
   * @param {string} markReadHref - The relative URL to mark the notification as read.
   */
  function markNotificationAsRead(markReadHref) {
    if (!markReadHref || !markReadHref.includes("mark_notification=")) {
      log$1.warn("Invalid mark-as-read href provided:", markReadHref);
      return;
    }

    const fullUrl = new URL(markReadHref, "https://rpghq.org/forums/").toString();
    log$1.debug(`Marking notification as read: ${fullUrl}`);

    GM_xmlhttpRequest({
      method: "GET",
      url: fullUrl,
      onload: (response) => {
        if (response.status >= 200 && response.status < 300) {
          log$1.info(`Notification marked as read successfully: ${markReadHref}`);
        } else {
          log$1.warn(
            `Failed to mark notification as read (${response.status}): ${markReadHref}`
          );
        }
      },
      onerror: (error) => {
        log$1.error(
          `Error during mark as read request for ${markReadHref}:`,
          error
        );
      },
    });
  }

  /**
   * Checks currently displayed posts against notifications and marks matching ones as read.
   */
  function checkAndMarkNotifications() {
    try {
      const displayedPostIds = getDisplayedPostIds();
      if (displayedPostIds.length === 0) {
        log$1.debug("No posts found on the page to check against notifications.");
        return; // No posts visible, nothing to mark
      }

      const notificationData = getNotificationData();
      if (notificationData.length === 0) {
        log$1.debug("No unread notifications found to check.");
        return; // No notifications to check
      }

      log$1.info(
        `Checking ${notificationData.length} notifications against ${displayedPostIds.length} displayed posts.`
      );

      let markedCount = 0;
      notificationData.forEach((notification) => {
        // If the post associated with the notification is visible on the page
        if (displayedPostIds.includes(notification.postId)) {
          markNotificationAsRead(notification.href);
          markedCount++;
        }
      });

      if (markedCount > 0) {
        log$1.info(
          `Marked ${markedCount} notifications as read based on viewed posts.`
        );
      }
    } catch (error) {
      log$1.error("Error during checkAndMarkNotifications:", error);
    }
  }

  const log = new Logger("Notifications Init");
  let observer = null;
  let debounceTimer = null;

  /**
   * Debounced function to customize notifications in the main panel.
   */
  function debouncedCustomizePanel() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      log.debug("Debounced panel customization triggered.");
      // Target the dropdown specifically, assuming it gets added/modified
      const panel = document.querySelector("#notification_list"); // Adjust if selector changes
      if (panel) {
        customizeNotificationsContainer(panel, ".notification-block", false);
      }
    }, 250); // Increased debounce slightly
  }

  /**
   * Sets up a MutationObserver to watch for dynamically added notifications.
   */
  function setupObserver() {
    if (observer) {
      log.debug("Observer already running.");
      return; // Don't set up multiple observers
    }

    observer = new MutationObserver((mutations) => {
      let shouldProcessPanel = false;

      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          // Check if added nodes contain the notification panel or individual blocks
          const hasNewNotifications = Array.from(mutation.addedNodes).some(
            (node) =>
              node.nodeType === Node.ELEMENT_NODE &&
              (node.id === "notification_list" || // The whole panel was added
                node.classList?.contains("notification-block") || // A block was added directly
                node.querySelector?.(".notification-block")) // A block was added inside another node
          );

          if (hasNewNotifications) {
            log.debug("Detected new notification nodes.");
            shouldProcessPanel = true;
            break; // No need to check further mutations for this batch
          }
        }
      }

      if (shouldProcessPanel) {
        debouncedCustomizePanel();
        checkAndMarkNotifications(); // Also check marks when panel updates
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    log.info("Notification observer started.");
  }

  /**
   * Initializes the Notifications feature.
   * - Applies initial customizations.
   * - Sets up the observer.
   * - Runs storage cleanup.
   */
  function initializeNotifications() {
    log.info("Initializing Notifications feature...");

    try {
      // Initial customization of notifications page if currently on it
      if (window.location.href.includes("ucp.php?i=ucp_notifications")) {
        log.debug("On notifications page, running initial customization.");
        customizeNotificationsContainer(document, ".notification-block", true);
      }

      // Initial customization of the panel if it exists on load
      const initialPanel = document.querySelector("#notification_list");
      if (initialPanel) {
        log.debug("Notification panel found on initial load, customizing.");
        customizeNotificationsContainer(
          initialPanel,
          ".notification-block",
          false
        );
      }

      // Check for notifications to mark as read on initial load
      checkAndMarkNotifications();

      // Set up the observer to handle dynamic changes
      setupObserver();

      // Run storage cleanup (can run last)
      cleanupStorage();

      log.info("Notifications feature initialized successfully.");
    } catch (error) {
      log.error("Error during Notifications initialization:", error);
    }
  }

  /**
   * Initialize the userscript
   */
  function init() {
    addStyles();
    GM_registerMenuCommand("RPGHQ Userscript Manager", showModal);
    
    // Add event listener for the Insert key to toggle the modal
    document.addEventListener("keydown", toggleModalWithInsertKey);

    // Add menu button to the page when DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", addMenuButton);
    } else {
      addMenuButton();
      // Initialize Notifications feature (matches document-ready) if enabled
      if (isScriptEnabled('notifications')) {
        initializeNotifications();
      }
    }
  }

  // Import metadata for rollup-plugin-userscript

  (function() {

      // Run initialization
      init();
  })();

})();
