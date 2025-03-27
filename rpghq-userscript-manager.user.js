// ==UserScript==
// @name         RPGHQ Userscript Manager (Popup Only)
// @namespace    https://rpghq.org/
// @version      3.0.2
// @description  A simple popup that displays the MANIFEST of available scripts without any functional components
// @author       loregamer
// @match        https://rpghq.org/forums/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
  "use strict";

  // Data from MANIFEST.js

  const MANIFEST = {
  scripts: [
    {
      id: "number-commas",
      name: "Commas on Numbers",
      version: "2.1.2",
      description: "Add commas to numbers",
      filename: "number-commas.js",
      matches: ["https://rpghq.org/forums/*"],
      executionPhase: "document-ready",
      category: "Aesthetic",
      image: "https://f.rpghq.org/olnCVAbEzbkt.png?n=pasted-file.png",
      settings: [
        {
          id: "formatFourDigits",
          label: "Format 4-digit numbers",
          description:
            "Whether to add commas to 4-digit numbers (e.g., 1,000) or only 5+ digit numbers",
          type: "boolean",
          default: false,
        },
      ],
    },
  ],
  schema: {
    version: "1.0.0",
    executionPhases: [
      {
        id: "document-start",
        name: "Document Start",
        description: "Executes before DOM parsing begins",
      },
      {
        id: "document-ready",
        name: "Document Ready",
        description:
          "Executes when basic DOM is available but before resources are loaded",
      },
      {
        id: "document-loaded",
        name: "Document Loaded",
        description: "Executes after page is fully loaded",
      },
      {
        id: "document-idle",
        name: "Document Idle",
        description: "Executes after a short delay when page is idle",
      },
      {
        id: "custom-event",
        name: "Custom Event",
        description: "Executes when a specific custom event is triggered",
      },
    ],
  },
};




  // Data from FORUM_PREFERENCES.js

  const FORUM_PREFERENCES = {
  sections: [
    {
      name: "Display Settings",
      preferences: [
        {
          id: "theme",
          name: "Theme",
          description: "Choose your preferred theme",
          type: "select",
          options: ["Default", "Dark", "Light", "High Contrast"],
          default: "Default",
        },
        {
          id: "font_size",
          name: "Font Size",
          description: "Base font size for forum text",
          type: "select",
          options: ["Small", "Medium", "Large", "Extra Large"],
          default: "Medium",
        },
        {
          id: "show_avatars",
          name: "Show Avatars",
          description: "Display user avatars in posts",
          type: "toggle",
          default: true,
        },
      ],
    },
    {
      name: "Notification Settings",
      preferences: [
        {
          id: "email_notifications",
          name: "Email Notifications",
          description: "Receive email notifications for important events",
          type: "toggle",
          default: true,
        },
        {
          id: "notification_frequency",
          name: "Notification Frequency",
          description: "How often to receive notifications",
          type: "select",
          options: ["Immediately", "Daily Digest", "Weekly Digest"],
          default: "Immediately",
        },
      ],
    },
    {
      name: "Privacy Settings",
      preferences: [
        {
          id: "online_status",
          name: "Online Status",
          description: "Show your online status to other users",
          type: "toggle",
          default: true,
        },
        {
          id: "profile_visibility",
          name: "Profile Visibility",
          description: "Who can see your profile details",
          type: "select",
          options: ["Everyone", "Members Only", "Friends Only", "Nobody"],
          default: "Members Only",
        },
      ],
    },
  ],
};





  // Helper function from Shared/logger.js

  function logInfo(message) {
  console.log(
    "%c[RPGHQ USERSCRIPTS]%c " + message,
    "color: #2196F3; font-weight: bold;",
    "color: inherit;"
  );
}

function logSuccess(message) {
  console.log(
    "%c[RPGHQ USERSCRIPTS]%c " + message,
    "color: #4CAF50; font-weight: bold;",
    "color: inherit;"
  );
}

function logWarning(message) {
  console.warn(
    "%c[RPGHQ USERSCRIPTS]%c " + message,
    "color: #FFC107; font-weight: bold;",
    "color: inherit;"
  );
}

function logError(message) {
  console.error(
    "%c[RPGHQ USERSCRIPTS]%c " + message,
    "color: #F44336; font-weight: bold;",
    "color: inherit;"
  );
}



  logInfo,
  logSuccess,
  logWarning,
  logError,
};


  // Helper function from Shared/compareVersions.js

  function compareVersions(a, b) {  const partsA = a.split(".").map(Number);  const partsB = b.split(".").map(Number);

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {  const numA = partsA[i] || 0;  const numB = partsB[i] || 0;  if (numA !== numB) {
      return numA - numB;
    }
  }

  return 0;
}





  // Helper function from Shared/getPhaseDisplayName.js

  function getPhaseDisplayName(phase) {  if (!phase) return "Not specified";  const phaseMap = {
    "document-start": "Document Start",
    "document-ready": "Document Ready",
    "document-loaded": "Document Loaded",
    "document-idle": "Document Idle",
    "custom-event": "Custom Event",
  };

  return phaseMap[phase] || phase;
}






  // Helper function from Shared/renderSettingControl.js

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





  // Helper function from Shared/renderPreferenceControl.js

  function renderPreferenceControl(preference) {
  switch (preference.type) {
    case "toggle":
      return `
        <label class="toggle-switch">
          <input type="checkbox" ${preference.default ? "checked" : ""}>
          <span class="toggle-slider"></span>
        </label>
      `;
    case "select":
      return `
        <select>
          ${preference.options
            .map(
              (option) => `
            <option ${
              option === preference.default ? "selected" : ""
            }>${option}</option>
          `
            )
            .join("")}
        </select>
      `;
    default:
      return `
        <input type="text" value="${preference.default || ""}">
      `;
  }
}





  // Helper function from Shared/filterScripts.js

  function filterScripts(scripts, filters) {
  if (!filters) {
    // If no filters provided, get them from the DOM
  const category = document.getElementById("category-filter").value;
  const phase = document.getElementById("phase-filter").value;
  const hasSettings = document.getElementById("has-settings-filter").value;
  const enabled = document.getElementById("enabled-filter").value;
  const searchTerm = document
      .getElementById("search-filter")
      .value.toLowerCase();
  const sortBy = document.getElementById("sort-filter").value;

    filters = { category, phase, hasSettings, enabled, searchTerm, sortBy };
  }

  // Filter scripts
  let filtered = scripts.filter((script) => {
  const matchesCategory =
      filters.category === "all" || script.category === filters.category;
  const matchesPhase =
      filters.phase === "all" || script.executionPhase === filters.phase;
  const matchesSettings =
      filters.hasSettings === "all" ||
      (filters.hasSettings === "with" &&
        script.settings &&
        script.settings.length > 0) ||
      (filters.hasSettings === "without" &&
        (!script.settings || script.settings.length === 0));
  const matchesEnabled =
      filters.enabled === "all" ||
      (filters.enabled === "enabled" && isScriptEnabled(script.id)) ||
      (filters.enabled === "disabled" && !isScriptEnabled(script.id));
  const matchesSearch =
      !filters.searchTerm ||
      script.name.toLowerCase().includes(filters.searchTerm) ||
      (script.description &&
        script.description.toLowerCase().includes(filters.searchTerm));

    return (
      matchesCategory &&
      matchesPhase &&
      matchesSettings &&
      matchesEnabled &&
      matchesSearch
    );
  });

  // Sort scripts
  filtered.sort((a, b) => {
    switch (filters.sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "version-asc":
        return compareVersions(a.version, b.version);
      case "version-desc":
        return compareVersions(b.version, a.version);
      case "category":
        return (a.category || "").localeCompare(b.category || "");
      default:
        return 0;
    }
  });

  return filtered;
}





  // Helper function from Shared/addStyles.js

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
    
    .btn-success {
        background-color: var(--success-color);
        color: white;
    }
    
    .btn-success:hover {
        background-color: #3d8b40;
    }
    
    .btn-danger {
        background-color: var(--danger-color);
        color: white;
    }
    
    .btn-danger:hover {
        background-color: #d32f2f;
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
    
    /* Styles for toggle buttons */
    .btn-icon {
        background: none;
        border: none;
        cursor: pointer;
        padding: 5px;
        text-align: center;
        transition: all 0.2s ease;
    }
    
    .btn-icon:hover {
        opacity: 0.8;
    }
    
    .btn-icon:focus {
        outline: none;
    }
    
    .text-success {
        color: #28a745;
    }
    
    .text-muted {
        color: #6c757d;
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
    
    /* Hide modal on ESC key */
    document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
  const modal = document.getElementById('mod-manager-modal');
  if (modal && modal.style.display === 'block') {
          hideModal();
        }
      }
    });
  `);
}





  // Helper function from Shared/isScriptEnabled.js

  function isScriptEnabled(scriptId) {
  // First try to check the enabled scripts array
  const enabledScripts = GM_getValue("rpghq-enabled-scripts", null);
  if (enabledScripts) {
    try {
  const enabledScriptsArray = JSON.parse(enabledScripts);
  if (enabledScriptsArray.includes(scriptId)) {
        logInfo(`Script ${scriptId} is enabled (found in enabled scripts)`);
        return true;
      }
    } catch (e) {
      logWarning(`Error parsing enabled scripts: ${e.message}`);
    }
  }

  // Fall back to checking the disabled scripts array
  const disabledScripts = GM_getValue("rpghq-disabled-scripts", null);
  if (!disabledScripts) {
    logInfo(`Script ${scriptId} is enabled (no disabled scripts found)`);
    return true; // By default, all scripts are enabled
  }

  try {
  const disabledScriptsArray = JSON.parse(disabledScripts);
  const isEnabled = !disabledScriptsArray.includes(scriptId);
    logInfo(
      `Script ${scriptId} is ${
        isEnabled ? "enabled" : "disabled"
      } (based on disabled scripts list)`
    );
    return isEnabled;
  } catch (e) {
    logWarning(`Error parsing disabled scripts: ${e.message}`);
    return true; // If there's an error parsing, default to enabled
  }
}


  


  // Helper function from Shared/toggleScriptEnabled.js

  function toggleScriptEnabled(scriptId) {
  // For backwards compatibility, read from disabled scripts
  const disabledScripts = GM_getValue("rpghq-disabled-scripts", null);
  let disabledScriptsArray = [];
  if (disabledScripts) {
    try {
      disabledScriptsArray = JSON.parse(disabledScripts);
    } catch (e) {
      disabledScriptsArray = [];
      logWarning(`Error parsing disabled scripts: ${e.message}`);
    }
  }

  // Get the enabled scripts array
  const enabledScripts = GM_getValue("rpghq-enabled-scripts", null);
  let enabledScriptsArray = [];
  if (enabledScripts) {
    try {
      enabledScriptsArray = JSON.parse(enabledScripts);
    } catch (e) {
      enabledScriptsArray = [];
      logWarning(`Error parsing enabled scripts: ${e.message}`);
    }
  }

  // If a script isn't in either array, consider it enabled by default
  const isCurrentlyEnabled = !disabledScriptsArray.includes(scriptId);
  if (isCurrentlyEnabled) {
    // Disable the script
    disabledScriptsArray.push(scriptId);
    // Remove from enabled scripts if it exists
    enabledScriptsArray = enabledScriptsArray.filter((id) => id !== scriptId);
    logInfo(`Disabled script: ${scriptId}`);
  } else {
    // Enable the script
    disabledScriptsArray = disabledScriptsArray.filter((id) => id !== scriptId);
    // Add to enabled scripts if it doesn't exist
  if (!enabledScriptsArray.includes(scriptId)) {
      enabledScriptsArray.push(scriptId);
    }
    logInfo(`Enabled script: ${scriptId}`);
  }

  // Update both storage items
  GM_setValue("rpghq-disabled-scripts", JSON.stringify(disabledScriptsArray));
  GM_setValue("rpghq-enabled-scripts", JSON.stringify(enabledScriptsArray));

  logInfo(
    `Script state toggled: ${scriptId} is now ${
      !isCurrentlyEnabled ? "enabled" : "disabled"
    }`
  );
  logInfo(`Enabled scripts: ${JSON.stringify(enabledScriptsArray)}`);

  return !isCurrentlyEnabled;
}


  


  // UI function from showModal.js

  function showModal() {  let modal = document.getElementById("mod-manager-modal");  if (!modal) {
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

    modal.addEventListener("click", (e) => {  if (e.target === modal) {
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





  // UI function from hideModal.js

  function hideModal() {  const modal = document.getElementById("mod-manager-modal");  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }

  // Hide any open settings modal  const settingsModal = document.getElementById("script-settings-modal");  if (settingsModal) {
    settingsModal.style.display = "none";
  }
}





  // UI function from loadTabContent.js

  function loadTabContent(tabName) {  const content = document.getElementById("mod-manager-content");

  // Clear previous content (except the info note)  const infoNote = content.querySelector(".info-note");
  content.innerHTML = "";  if (infoNote) {
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






  // UI function from renderInstalledScriptsTab.js

  function renderInstalledScriptsTab(container) {
  // Create the filter panel
  const filterPanel = document.createElement("div");
  filterPanel.className = "filter-panel";
  filterPanel.innerHTML = `
    <div class="filter-panel-header">
      <h3 class="filter-panel-title">Filter Scripts</h3>
      <button class="filter-panel-toggle" id="toggle-filters">
        <i class="fa fa-chevron-up"></i>
      </button>
    </div>
    <div class="filter-panel-body" id="filter-panel-body">
      <div class="filter-group">
        <label for="category-filter">Category</label>
        <select id="category-filter">
          <option value="all">All Categories</option>
          ${getCategoryOptions()}
        </select>
      </div>
      <div class="filter-group">
        <label for="phase-filter">Execution Phase</label>
        <select id="phase-filter">
          <option value="all">All Phases</option>
          ${getExecutionPhaseOptions()}
        </select>
      </div>
      <div class="filter-group">
        <label for="has-settings-filter">Settings</label>
        <select id="has-settings-filter">
          <option value="all">All Scripts</option>
          <option value="with">With Settings</option>
          <option value="without">Without Settings</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="enabled-filter">Status</label>
        <select id="enabled-filter">
          <option value="all">All Scripts</option>
          <option value="enabled">Enabled Only</option>
          <option value="disabled">Disabled Only</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="search-filter">Search</label>
        <input type="text" id="search-filter" placeholder="Script name or description...">
      </div>
      <div class="filter-group">
        <label for="sort-filter">Sort By</label>
        <select id="sort-filter">
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="version-asc">Version (Low to High)</option>
          <option value="version-desc">Version (High to Low)</option>
          <option value="category">Category</option>
        </select>
      </div>
      <div class="filter-actions">
        <button id="reset-filters" class="btn btn-secondary">
          <i class="fa fa-undo btn-icon"></i> Reset
        </button>
        <button id="apply-filters" class="btn btn-primary" style="margin-left: 10px;">
          <i class="fa fa-filter btn-icon"></i> Apply Filters
        </button>
      </div>
    </div>
  `;
  container.appendChild(filterPanel);

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
  document.getElementById("toggle-filters").addEventListener("click", () => {
  const panel = document.getElementById("filter-panel-body");
    panel.classList.toggle("collapsed");
  const icon = document.getElementById("toggle-filters").querySelector("i");
  if (panel.classList.contains("collapsed")) {
      icon.className = "fa fa-chevron-down";
    } else {
      icon.className = "fa fa-chevron-up";
    }
  });

  document.getElementById("grid-view-btn").addEventListener("click", () => {
    document.getElementById("grid-view-btn").className = "btn btn-primary";
    document.getElementById("list-view-btn").className = "btn btn-secondary";
  const filteredScripts = filterScripts(MANIFEST.scripts);
    renderScriptsGridView(scriptsContainer, filteredScripts);
  });

  document.getElementById("list-view-btn").addEventListener("click", () => {
    document.getElementById("grid-view-btn").className = "btn btn-secondary";
    document.getElementById("list-view-btn").className = "btn btn-primary";
  const filteredScripts = filterScripts(MANIFEST.scripts);
    renderScriptsListView(scriptsContainer, filteredScripts);
  });

  document.getElementById("apply-filters").addEventListener("click", () => {
  const filteredScripts = filterScripts(MANIFEST.scripts);

    // Use the active view to render
  if (
      document.getElementById("grid-view-btn").classList.contains("btn-primary")
    ) {
      renderScriptsGridView(scriptsContainer, filteredScripts);
    } else {
      renderScriptsListView(scriptsContainer, filteredScripts);
    }
  });

  document.getElementById("reset-filters").addEventListener("click", () => {
    document.getElementById("category-filter").value = "all";
    document.getElementById("phase-filter").value = "all";
    document.getElementById("has-settings-filter").value = "all";
    document.getElementById("enabled-filter").value = "all";
    document.getElementById("search-filter").value = "";
    document.getElementById("sort-filter").value = "name-asc";

    // Use the active view to render
  if (
      document.getElementById("grid-view-btn").classList.contains("btn-primary")
    ) {
      renderScriptsGridView(scriptsContainer, MANIFEST.scripts);
    } else {
      renderScriptsListView(scriptsContainer, MANIFEST.scripts);
    }
  });
}





  // UI function from renderForumPreferencesTab.js

  function renderForumPreferencesTab(container) {
  container.innerHTML += `<h2>Forum Preferences</h2>`;

  // Add sub-tabs for Threads and Users  const subTabsContainer = document.createElement("div");
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

  // Add container for sub-tab content  const subTabContent = document.createElement("div");
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

      // Load content  if (tab.dataset.subtab === "threads") {
        renderThreadsSubtab(subTabContent);
      } else if (tab.dataset.subtab === "users") {
        renderUsersSubtab(subTabContent);
      }
    });
  });
}





  // UI function from renderSettingsTab.js

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





  // UI function from renderThreadsSubtab.js

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





  // UI function from renderUsersSubtab.js

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





  // UI function from showScriptSettings.js

  function showScriptSettings(script) {
  // Create modal if it doesn't exist  let modal = document.getElementById("script-settings-modal");  if (!modal) {
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

  modal.addEventListener("click", (e) => {  if (e.target === modal) {
      modal.style.display = "none";
    }
  });
}





  // UI function from renderScriptSettingsContent.js

  function renderScriptSettingsContent(script) {  if (!script.settings || script.settings.length === 0) {
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





  // UI function from renderScriptsGridView.js

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
  
  scripts.forEach(script => {
  const card = document.createElement("div");
    card.className = "script-card";
    card.dataset.scriptId = script.id;
    
    card.innerHTML = `
      <div class="script-card-image">
        <img src="${script.image || "https://via.placeholder.com/240x130?text=No+Image"}" alt="${script.name}">
        <div class="script-card-category">${script.category || "Uncategorized"}</div>
      </div>
      <div class="script-card-content">
        <div class="script-card-header">
          <h3 class="script-card-title">${script.name}</h3>
          <span class="script-card-version">v${script.version}</span>
        </div>
        <p class="script-card-description">${script.description || "No description available."}</p>
        <div class="script-card-footer">
          <div class="script-card-phase">
            <i class="fa fa-bolt"></i> ${getPhaseDisplayName(script.executionPhase)}
          </div>
          <div class="script-card-actions">
            <button class="btn ${isScriptEnabled(script.id) ? 'btn-danger' : 'btn-success'} btn-small toggle-script" data-script-id="${script.id}">
              <i class="fa ${isScriptEnabled(script.id) ? 'fa-ban' : 'fa-check'}"></i> ${isScriptEnabled(script.id) ? 'Disable' : 'Enable'}
            </button>
            <button class="btn btn-primary btn-small view-settings" data-script-id="${script.id}">
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
  
  // Add event listeners for settings buttons
  document.querySelectorAll(".view-settings").forEach(btn => {
    btn.addEventListener("click", () => {
  const scriptId = btn.dataset.scriptId;
  const script = scripts.find(s => s.id === scriptId);
  if (script) {
        showScriptSettings(script);
      }
    });
  });
  
  // Add event listeners for toggle script buttons
  document.querySelectorAll(".toggle-script").forEach(btn => {
    btn.addEventListener("click", () => {
  const scriptId = btn.dataset.scriptId;
  const newState = toggleScriptEnabled(scriptId);
      
      // Update button state
  if (newState) {
        // Script is now enabled
        btn.classList.remove("btn-success");
        btn.classList.add("btn-danger");
        btn.innerHTML = '<i class="fa fa-ban"></i> Disable';
      } else {
        // Script is now disabled
        btn.classList.remove("btn-danger");
        btn.classList.add("btn-success");
        btn.innerHTML = '<i class="fa fa-check"></i> Enable';
      }
    });
  });
}

  // UI function from renderScriptsListView.js

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
        <th>Status</th>
        <th>Name</th>
        <th>Version</th>
        <th>Category</th>
        <th>Description</th>
        <th>Execution Phase</th>
        <th>Settings</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${scripts.map(script => `
        <tr>
          <td>
            <button class="btn btn-icon toggle-script" data-script-id="${script.id}" title="${isScriptEnabled(script.id) ? 'Enabled (click to disable)' : 'Disabled (click to enable)'}">
              <i class="fa ${isScriptEnabled(script.id) ? 'fa-toggle-on text-success' : 'fa-toggle-off text-muted'}" style="font-size: 1.5em;"></i>
            </button>
          </td>
          <td><strong>${script.name}</strong></td>
          <td>v${script.version}</td>
          <td>${script.category || "Uncategorized"}</td>
          <td>${script.description || "No description available."}</td>
          <td>${getPhaseDisplayName(script.executionPhase)}</td>
          <td>${script.settings && script.settings.length > 0 ? `<span class="badge badge-primary">${script.settings.length}</span>` : "-"}</td>
          <td>
            <button class="btn btn-primary btn-small view-settings" data-script-id="${script.id}">
              <i class="fa fa-cog"></i> Settings
            </button>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;
  
  container.innerHTML = "";
  container.appendChild(table);
  
  // Add event listeners for settings buttons
  document.querySelectorAll(".view-settings").forEach(btn => {
    btn.addEventListener("click", () => {
  const scriptId = btn.dataset.scriptId;
  const script = scripts.find(s => s.id === scriptId);
  if (script) {
        showScriptSettings(script);
      }
    });
  });
  
  // Add event listeners for toggle script buttons
  document.querySelectorAll(".toggle-script").forEach(btn => {
    btn.addEventListener("click", () => {
  const scriptId = btn.dataset.scriptId;
  const newState = toggleScriptEnabled(scriptId);
      
      // Update icon state
  const icon = btn.querySelector("i");
  if (newState) {
        // Script is now enabled
        icon.classList.remove("fa-toggle-off");
        icon.classList.remove("text-muted");
        icon.classList.add("fa-toggle-on");
        icon.classList.add("text-success");
        btn.setAttribute("title", "Enabled (click to disable)");
      } else {
        // Script is now disabled
        icon.classList.remove("fa-toggle-on");
        icon.classList.remove("text-success");
        icon.classList.add("fa-toggle-off");
        icon.classList.add("text-muted");
        btn.setAttribute("title", "Disabled (click to enable)");
      }
    });
  });
}

  // UI function from getCategoryOptions.js

  function getCategoryOptions() {  const categories = new Set();
  MANIFEST.scripts.forEach((script) => {  if (script.category) {
      categories.add(script.category);
    }
  });

  return Array.from(categories)
    .sort()
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("");
}





  // UI function from getExecutionPhaseOptions.js

  function getExecutionPhaseOptions() {
  return MANIFEST.schema.executionPhases
    .map((phase) => `<option value="${phase.id}">${phase.name}</option>`)
    .join("");
}





  // Script function from document-ready/number-commas/number-commas.js

  function numberCommasScript() {
  // Get the setting for formatting 4-digit numbers
  const formatFourDigits = GM_getValue("formatFourDigits", false);

  // Set up the menu command
  updateMenuLabel(formatFourDigits);

  // Run initial processing
  processElements(formatFourDigits);
  calculateForumStatistics();

  // Set up observer for dynamic content
  const observer = new MutationObserver(() => {
    processElements(formatFourDigits);
  });

  // Start observing the document
  observer.observe(document.body, { childList: true, subtree: true });
}





  // Initialization from init.js

  function init() {
  addStyles();
  GM_registerMenuCommand("RPGHQ Userscript Manager", showModal);

  // Add menu button to the page when DOM is ready  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addMenuButton);
  } else {
    addMenuButton();
  }
}





  // Initialization from addMenuButton.js

  function addMenuButton() {  const profileDropdown = document.querySelector(
    '.header-profile.dropdown-container .dropdown-contents[role="menu"]'
  );  if (!profileDropdown) return;  const logoutButton = Array.from(profileDropdown.querySelectorAll("li")).find(
    (li) => {
      return (
        li.textContent.trim().includes("Logout") ||
        li.querySelector('a[title="Logout"]')
      );
    }
  );  if (!logoutButton) return;  const userscriptsButton = document.createElement("li");
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






  // Execute scripts by phase
  document.addEventListener("DOMContentLoaded", function() {
    // Execute document-ready scripts
    if (isScriptEnabled("number-commas")) { try { number-commas(); } catch(e) { console.error("Error executing number-commas:", e); } }
  });

  // Execute document-start scripts

  // Add handlers for other phases
  window.addEventListener("load", function() {
    // Execute document-loaded scripts
  });

  // Execute document-idle scripts after a short delay
  window.addEventListener("load", function() {
    setTimeout(function() {
      // Execute document-idle scripts
    }, 500);
  });

  // Setup handlers for custom event scripts

  // Run initialization
  init();
})();
