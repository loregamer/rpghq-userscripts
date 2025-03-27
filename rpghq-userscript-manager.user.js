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
// ==/UserScript==

(function () {
  "use strict";

  // Hard-coded manifest - just for display purposes
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
      {
        id: "bbcode",
        name: "BBCode Highlighter",
        version: "1.1.0",
        description:
          "Adds reaction smileys to notifications and makes them formatted better",
        filename: "bbcode.js",
        matches: [
          "https://rpghq.org/forums/posting.php?mode=post*",
          "https://rpghq.org/forums/posting.php?mode=quote*",
          "https://rpghq.org/forums/posting.php?mode=reply*",
          "https://rpghq.org/forums/posting.php?mode=edit*",
        ],
        executionPhase: "document-ready",
        category: "Aesthetic",
        image: "https://f.rpghq.org/bEm69Td9mEGU.png?n=pasted-file.png",
        settings: [],
      },
      {
        id: "ignore-threads",
        name: "Ignore Threads",
        version: "1.0.0",
        description: "Ignore threads",
        filename: "ignore-threads.js",
        matches: ["https://rpghq.org/forums/*"],
        executionPhase: "document-start",
        category: "Iggy Stuff",
        image: "https://f.rpghq.org/nZiGcejzrfWJ.png?n=pasted-file.png",
        settings: [],
      },
      {
        id: "ignore-users",
        name: "Ignore Users",
        version: "1.0.0",
        description: "(Actually) ignore users",
        filename: "ignore-users.js",
        matches: ["https://rpghq.org/forums/*"],
        executionPhase: "document-start",
        category: "Iggy Stuff",
        image: "https://f.rpghq.org/v4iqrprFCWq0.png?n=pasted-file.png",
        settings: [],
      },
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
      {
        id: "pin-threads",
        name: "Pin Threads",
        version: "1.0.0",
        description: "Adds a pin button to the forum",
        filename: "pin-threads.js",
        matches: ["https://rpghq.org/forums/index.php/*"],
        executionPhase: "document-ready",
        category: "Utility",
        image: "https://f.rpghq.org/nZiGcejzrfWJ.png?n=pasted-file.png",
        settings: [],
      },
      {
        id: "member-search",
        name: "Member Search Button",
        version: "1.0.0",
        description: "Adds a member search button to the forum",
        filename: "member-search.js",
        matches: ["https://rpghq.org/forums/*"],
        executionPhase: "document-ready",
        category: "Utility",
        image: "https://f.rpghq.org/nZiGcejzrfWJ.png?n=pasted-file.png",
        settings: [],
      },
      {
        id: "random-topic",
        name: "Random Topic Button",
        version: "1.0.0",
        description: "Adds a random topic button to the forum",
        filename: "random-topic.js",
        matches: ["https://rpghq.org/forums/*"],
        executionPhase: "document-ready",
        category: "Utility",
        image: "https://f.rpghq.org/nZiGcejzrfWJ.png?n=pasted-file.png",
        settings: [],
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

  // Forum preferences (mock data for display)
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
            default: "Default"
          },
          {
            id: "font_size",
            name: "Font Size",
            description: "Base font size for forum text",
            type: "select",
            options: ["Small", "Medium", "Large", "Extra Large"],
            default: "Medium"
          },
          {
            id: "show_avatars",
            name: "Show Avatars",
            description: "Display user avatars in posts",
            type: "toggle",
            default: true
          }
        ]
      },
      {
        name: "Notification Settings",
        preferences: [
          {
            id: "email_notifications",
            name: "Email Notifications",
            description: "Receive email notifications for important events",
            type: "toggle",
            default: true
          },
          {
            id: "notification_frequency",
            name: "Notification Frequency",
            description: "How often to receive notifications",
            type: "select",
            options: ["Immediately", "Daily Digest", "Weekly Digest"],
            default: "Immediately"
          }
        ]
      },
      {
        name: "Privacy Settings",
        preferences: [
          {
            id: "online_status",
            name: "Online Status",
            description: "Show your online status to other users",
            type: "toggle",
            default: true
          },
          {
            id: "profile_visibility",
            name: "Profile Visibility",
            description: "Who can see your profile details",
            type: "select",
            options: ["Everyone", "Members Only", "Friends Only", "Nobody"],
            default: "Members Only"
          }
        ]
      }
    ]
  };

  // Add CSS for the modal
  function addStyles() {
    GM_addStyle(`
      /* Import Font Awesome */
      @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

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
          padding: 20px;
          border: 1px solid var(--border-color);
          width: 90%;
          max-width: 1200px;
          max-height: 90vh;
          border-radius: 8px;
          color: var(--text-primary);
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      }
      
      /* Header and close button */
      .mod-manager-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 15px;
      }
      
      .mod-manager-title {
          margin: 0;
          font-size: 1.8em;
          color: var(--primary-color);
      }
      
      .mod-manager-close {
          font-size: 1.8em;
          cursor: pointer;
          transition: color 0.2s ease;
      }
      
      .mod-manager-close:hover {
          color: var(--danger-color);
      }
      
      /* Tab system */
      .mod-manager-tabs {
          display: flex;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
      }
      
      .mod-manager-tab {
          padding: 10px 20px;
          cursor: pointer;
          font-size: 1.1em;
          color: var(--text-secondary);
          position: relative;
          transition: all 0.2s ease;
      }
      
      .mod-manager-tab:hover {
          background-color: rgba(255, 255, 255, 0.05);
      }
      
      .mod-manager-tab.active {
          color: var(--primary-color);
          font-weight: bold;
      }
      
      .mod-manager-tab.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 3px;
          background-color: var(--primary-color);
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
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
      }
      
      .filter-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
      }
      
      .filter-panel-title {
          font-size: 1.2em;
          font-weight: bold;
          margin: 0;
      }
      
      .filter-panel-toggle {
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          font-size: 1.2em;
      }
      
      .filter-panel-body {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
          animation: fadeIn 0.3s ease;
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
          padding: 8px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background-color: var(--bg-dark);
          color: var(--text-primary);
      }
      
      .filter-group select:focus,
      .filter-group input:focus {
          border-color: var(--primary-color);
          outline: none;
      }
      
      .filter-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 15px;
          grid-column: 1 / -1;
      }
      
      /* Card views */
      .script-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          animation: fadeIn 0.3s ease;
      }
      
      .script-card {
          background-color: var(--bg-card);
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: 1px solid var(--border-color);
      }
      
      .script-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
      }
      
      .script-card-image {
          position: relative;
          height: 160px;
          overflow: hidden;
      }
      
      .script-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
      }
      
      .script-card:hover .script-card-image img {
          transform: scale(1.05);
      }
      
      .script-card-category {
          position: absolute;
          top: 10px;
          right: 10px;
          background-color: rgba(0, 0, 0, 0.7);
          color: var(--text-primary);
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.8em;
      }
      
      .script-card-content {
          padding: 15px;
      }
      
      .script-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
      }
      
      .script-card-title {
          font-size: 1.2em;
          font-weight: bold;
          margin: 0;
      }
      
      .script-card-version {
          background-color: var(--primary-color);
          color: white;
          padding: 3px 8px;
          border-radius: 20px;
          font-size: 0.8em;
      }
      
      .script-card-description {
          margin: 0 0 15px 0;
          color: var(--text-secondary);
          font-size: 0.9em;
          line-height: 1.4;
          height: 3.8em;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
      }
      
      .script-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-color);
          padding-top: 15px;
      }
      
      .script-card-phase {
          font-size: 0.85em;
          color: var(--text-secondary);
      }
      
      .script-card-actions {
          display: flex;
          gap: 10px;
      }
      
      /* Forum preferences */
      .preferences-section {
          background-color: var(--bg-card);
          border-radius: 8px;
          margin-bottom: 20px;
          overflow: hidden;
      }
      
      .preferences-section-header {
          background-color: rgba(33, 150, 243, 0.1);
          padding: 15px;
          border-bottom: 1px solid var(--border-color);
      }
      
      .preferences-section-title {
          margin: 0;
          font-size: 1.2em;
          color: var(--primary-color);
      }
      
      .preferences-section-body {
          padding: 15px;
      }
      
      .preference-item {
          display: flex;
          flex-direction: column;
          margin-bottom: 15px;
          padding-bottom: 15px;
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
          margin-bottom: 10px;
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
          padding: 25px;
          border: 1px solid var(--border-color);
          width: 60%;
          max-width: 800px;
          max-height: 85vh;
          border-radius: 8px;
          box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5);
          overflow-y: auto;
      }
      
      .settings-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid var(--border-color);
      }
      
      .settings-modal-title {
          font-size: 1.6em;
          margin: 0;
          color: var(--primary-color);
      }
      
      .settings-modal-close {
          font-size: 1.5em;
          cursor: pointer;
          color: var(--text-secondary);
          transition: color 0.2s ease;
      }
      
      .settings-modal-close:hover {
          color: var(--danger-color);
      }
      
      .setting-group {
          margin-bottom: 25px;
      }
      
      .setting-group-title {
          font-size: 1.2em;
          margin: 0 0 15px 0;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--accent-color);
      }
      
      .setting-item {
          margin-bottom: 20px;
      }
      
      .setting-label {
          display: block;
          font-weight: bold;
          margin-bottom: 8px;
      }
      
      .setting-description {
          display: block;
          color: var(--text-secondary);
          font-size: 0.9em;
          margin-bottom: 8px;
      }
      
      .setting-control {
          margin-top: 5px;
      }
      
      /* Buttons */
      .btn {
          padding: 8px 16px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-size: 0.9em;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
      }
      
      .btn-icon {
          font-size: 1.1em;
      }
      
      .btn-primary {
          background-color: var(--primary-color);
          color: white;
      }
      
      .btn-primary:hover {
          background-color: var(--primary-dark);
      }
      
      .btn-secondary {
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
      }
      
      .btn-secondary:hover {
          background-color: rgba(255, 255, 255, 0.2);
      }
      
      .btn-accent {
          background-color: var(--accent-color);
          color: white;
      }
      
      .btn-accent:hover {
          background-color: #F57C00;
      }
      
      .btn-small {
          padding: 4px 10px;
          font-size: 0.8em;
      }
      
      /* Toggle switch */
      .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
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
          transition: .4s;
          border-radius: 24px;
      }
      
      .toggle-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
      }
      
      input:checked + .toggle-slider {
          background-color: var(--primary-color);
      }
      
      input:checked + .toggle-slider:before {
          transform: translateX(26px);
      }
      
      /* Tables */
      .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
      }
      
      .data-table th,
      .data-table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
      }
      
      .data-table th {
          background-color: rgba(255, 255, 255, 0.05);
          font-weight: bold;
          color: var(--primary-color);
      }
      
      .data-table tr:hover {
          background-color: rgba(255, 255, 255, 0.03);
      }
      
      /* Empty state */
      .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-secondary);
      }
      
      .empty-state-icon {
          font-size: 3em;
          margin-bottom: 20px;
          opacity: 0.5;
      }
      
      .empty-state-message {
          font-size: 1.2em;
          margin-bottom: 15px;
      }
      
      /* Badges */
      .badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 0.8em;
          font-weight: bold;
      }
      
      .badge-primary {
          background-color: var(--primary-color);
          color: white;
      }
      
      .badge-accent {
          background-color: var(--accent-color);
          color: white;
      }
      
      /* Animations */
      @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
      }
      
      /* Info note */
      .info-note {
          background-color: rgba(33, 150, 243, 0.1);
          border-left: 4px solid var(--primary-color);
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 0 4px 4px 0;
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

  // Create and show the modal with script information
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
              <i class="fas fa-puzzle-piece"></i> Installed Scripts
            </div>
            <div class="mod-manager-tab" data-tab="forum">
              <i class="fas fa-sliders-h"></i> Forum Preferences
            </div>
            <div class="mod-manager-tab" data-tab="settings">
              <i class="fas fa-cog"></i> Settings
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
      modal.querySelectorAll(".mod-manager-tab").forEach(tab => {
        tab.addEventListener("click", () => {
          document.querySelectorAll(".mod-manager-tab").forEach(t => {
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

  // Hide the modal
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
  
  // Load content for the selected tab
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
  
  // Render the "Installed Scripts" tab content
  function renderInstalledScriptsTab(container) {
    // Create the filter panel
    const filterPanel = document.createElement("div");
    filterPanel.className = "filter-panel";
    filterPanel.innerHTML = `
      <div class="filter-panel-header">
        <h3 class="filter-panel-title">Filter Scripts</h3>
        <button class="filter-panel-toggle" id="toggle-filters">
          <i class="fas fa-chevron-up"></i>
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
            <i class="fas fa-undo btn-icon"></i> Reset
          </button>
          <button id="apply-filters" class="btn btn-primary" style="margin-left: 10px;">
            <i class="fas fa-filter btn-icon"></i> Apply Filters
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
    viewOptions.style.marginBottom = "15px";
    viewOptions.innerHTML = `
      <div class="btn-group" style="display: flex;">
        <button id="grid-view-btn" class="btn btn-primary" style="border-radius: 4px 0 0 4px; margin: 0;">
          <i class="fas fa-th-large"></i>
        </button>
        <button id="list-view-btn" class="btn btn-secondary" style="border-radius: 0 4px 4px 0; margin: 0;">
          <i class="fas fa-list"></i>
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
        icon.className = "fas fa-chevron-down";
      } else {
        icon.className = "fas fa-chevron-up";
      }
    });
    
    document.getElementById("grid-view-btn").addEventListener("click", () => {
      document.getElementById("grid-view-btn").className = "btn btn-primary";
      document.getElementById("list-view-btn").className = "btn btn-secondary";
      
      const filteredScripts = filterScripts();
      renderScriptsGridView(scriptsContainer, filteredScripts);
    });
    
    document.getElementById("list-view-btn").addEventListener("click", () => {
      document.getElementById("grid-view-btn").className = "btn btn-secondary";
      document.getElementById("list-view-btn").className = "btn btn-primary";
      
      const filteredScripts = filterScripts();
      renderScriptsListView(scriptsContainer, filteredScripts);
    });
    
    document.getElementById("apply-filters").addEventListener("click", () => {
      const filteredScripts = filterScripts();
      
      // Use the active view to render
      if (document.getElementById("grid-view-btn").classList.contains("btn-primary")) {
        renderScriptsGridView(scriptsContainer, filteredScripts);
      } else {
        renderScriptsListView(scriptsContainer, filteredScripts);
      }
    });
    
    document.getElementById("reset-filters").addEventListener("click", () => {
      document.getElementById("category-filter").value = "all";
      document.getElementById("phase-filter").value = "all";
      document.getElementById("has-settings-filter").value = "all";
      document.getElementById("search-filter").value = "";
      document.getElementById("sort-filter").value = "name-asc";
      
      // Use the active view to render
      if (document.getElementById("grid-view-btn").classList.contains("btn-primary")) {
        renderScriptsGridView(scriptsContainer, MANIFEST.scripts);
      } else {
        renderScriptsListView(scriptsContainer, MANIFEST.scripts);
      }
    });
  }
  
  // Render the "Forum Preferences" tab content
  function renderForumPreferencesTab(container) {
    container.innerHTML += `<h2>Forum Preferences</h2>`;
    
    FORUM_PREFERENCES.sections.forEach(section => {
      const sectionEl = document.createElement("div");
      sectionEl.className = "preferences-section";
      
      sectionEl.innerHTML = `
        <div class="preferences-section-header">
          <h3 class="preferences-section-title">${section.name}</h3>
        </div>
        <div class="preferences-section-body">
          ${section.preferences.map(pref => `
            <div class="preference-item">
              <div class="preference-header">
                <h4 class="preference-name">${pref.name}</h4>
                <div class="preference-control">
                  ${renderPreferenceControl(pref)}
                </div>
              </div>
              <p class="preference-description">${pref.description}</p>
            </div>
          `).join('')}
        </div>
      `;
      
      container.appendChild(sectionEl);
    });
    
    // Add a note at the bottom
    const note = document.createElement("div");
    note.className = "info-note";
    note.innerHTML = `
      <strong>Note:</strong> These are view-only representations of forum preferences. Changes made here will not be saved.
    `;
    container.appendChild(note);
  }
  
  // Render the "Settings" tab content
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
  
  // Show the script settings modal
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
                <i class="fas fa-cog"></i>
              </div>
              <h3 class="empty-state-message">No Settings Available</h3>
              <p>This script doesn't have any configurable settings.</p>
            </div>
          `
        }
        
        <div class="script-info" style="margin-top: 30px; border-top: 1px solid var(--border-color); padding-top: 20px;">
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
              <td>${script.category || 'Uncategorized'}</td>
            </tr>
            <tr>
              <th>Execution Phase</th>
              <td>${script.executionPhase || 'Not specified'}</td>
            </tr>
            <tr>
              <th>Matches</th>
              <td>${script.matches ? script.matches.join('<br>') : 'Not specified'}</td>
            </tr>
          </table>
        </div>
        
        <div class="info-note" style="margin-top: 20px;">
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
  
  // Render script settings content
  function renderScriptSettingsContent(script) {
    if (!script.settings || script.settings.length === 0) {
      return '';
    }
    
    return `
      <div class="setting-group">
        ${script.settings.map(setting => `
          <div class="setting-item">
            <label class="setting-label">${setting.label}</label>
            <span class="setting-description">${setting.description}</span>
            <div class="setting-control">
              ${renderSettingControl(setting)}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  // Render a setting control based on its type
  function renderSettingControl(setting) {
    switch (setting.type) {
      case 'boolean':
        return `
          <label class="toggle-switch">
            <input type="checkbox" ${setting.default ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        `;
      case 'select':
        return `
          <select class="setting-input">
            ${setting.options.map(option => `
              <option value="${option}" ${option === setting.default ? 'selected' : ''}>${option}</option>
            `).join('')}
          </select>
        `;
      case 'number':
        return `
          <input type="number" class="setting-input" value="${setting.default || 0}">
        `;
      default:
        return `
          <input type="text" class="setting-input" value="${setting.default || ''}">
        `;
    }
  }
  
  // Render a preference control based on its type
  function renderPreferenceControl(preference) {
    switch (preference.type) {
      case 'toggle':
        return `
          <label class="toggle-switch">
            <input type="checkbox" ${preference.default ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        `;
      case 'select':
        return `
          <select>
            ${preference.options.map(option => `
              <option ${option === preference.default ? 'selected' : ''}>${option}</option>
            `).join('')}
          </select>
        `;
      default:
        return `
          <input type="text" value="${preference.default || ''}">
        `;
    }
  }
  
  // Render the scripts in a grid view
  function renderScriptsGridView(container, scripts) {
    if (scripts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <i class="fas fa-search"></i>
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
          <img src="${script.image || "https://via.placeholder.com/280x160?text=No+Image"}" alt="${script.name}">
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
              <i class="fas fa-bolt"></i> ${getPhaseDisplayName(script.executionPhase)}
            </div>
            <div class="script-card-actions">
              <button class="btn btn-primary btn-small view-settings" data-script-id="${script.id}">
                <i class="fas fa-cog"></i> Settings
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
  }
  
  // Render the scripts in a list view
  function renderScriptsListView(container, scripts) {
    if (scripts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <i class="fas fa-search"></i>
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
            <td><strong>${script.name}</strong></td>
            <td>v${script.version}</td>
            <td>${script.category || "Uncategorized"}</td>
            <td>${script.description || "No description available."}</td>
            <td>${getPhaseDisplayName(script.executionPhase)}</td>
            <td>${script.settings && script.settings.length > 0 ? `<span class="badge badge-primary">${script.settings.length}</span>` : "-"}</td>
            <td>
              <button class="btn btn-primary btn-small view-settings" data-script-id="${script.id}">
                <i class="fas fa-cog"></i> Settings
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
  }
  
  // Get the user-friendly name for an execution phase
  function getPhaseDisplayName(phase) {
    if (!phase) return "Not specified";
    
    const phaseMap = {
      "document-start": "Document Start",
      "document-ready": "Document Ready",
      "document-loaded": "Document Loaded",
      "document-idle": "Document Idle",
      "custom-event": "Custom Event"
    };
    
    return phaseMap[phase] || phase;
  }
  
  // Get unique categories for the filter dropdown
  function getCategoryOptions() {
    const categories = new Set();
    MANIFEST.scripts.forEach(script => {
      if (script.category) {
        categories.add(script.category);
      }
    });
    
    return Array.from(categories).sort().map(category => 
      `<option value="${category}">${category}</option>`
    ).join('');
  }
  
  // Get execution phase options for the filter dropdown
  function getExecutionPhaseOptions() {
    return MANIFEST.schema.executionPhases.map(phase => 
      `<option value="${phase.id}">${phase.name}</option>`
    ).join('');
  }
  
  // Filter scripts based on selected criteria
  function filterScripts() {
    const category = document.getElementById("category-filter").value;
    const phase = document.getElementById("phase-filter").value;
    const hasSettings = document.getElementById("has-settings-filter").value;
    const searchTerm = document.getElementById("search-filter").value.toLowerCase();
    const sortBy = document.getElementById("sort-filter").value;
    
    // Filter scripts
    let filtered = MANIFEST.scripts.filter(script => {
      const matchesCategory = category === "all" || script.category === category;
      const matchesPhase = phase === "all" || script.executionPhase === phase;
      const matchesSettings = hasSettings === "all" || 
                            (hasSettings === "with" && script.settings && script.settings.length > 0) ||
                            (hasSettings === "without" && (!script.settings || script.settings.length === 0));
      const matchesSearch = !searchTerm || 
                          script.name.toLowerCase().includes(searchTerm) || 
                          (script.description && script.description.toLowerCase().includes(searchTerm));
      
      return matchesCategory && matchesPhase && matchesSettings && matchesSearch;
    });
    
    // Sort scripts
    filtered.sort((a, b) => {
      switch(sortBy) {
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
  
  // Compare version strings (e.g., 1.2.3 vs 1.10.0)
  function compareVersions(a, b) {
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);
    
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const numA = partsA[i] || 0;
      const numB = partsB[i] || 0;
      
      if (numA !== numB) {
        return numA - numB;
      }
    }
    
    return 0;
  }
  
  // Add menu button to the page
  function addMenuButton() {
    const profileDropdown = document.querySelector('.header-profile.dropdown-container .dropdown-contents[role="menu"]');
    if (!profileDropdown) return;
    
    const logoutButton = Array.from(profileDropdown.querySelectorAll("li")).find(li => {
      return li.textContent.trim().includes("Logout") || li.querySelector('a[title="Logout"]');
    });
    
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

  // Initialize
  function init() {
    addStyles();
    GM_registerMenuCommand("RPGHQ Userscript Manager", showModal);
    
    // Add menu button to the page when DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", addMenuButton);
    } else {
      addMenuButton();
    }
  }

  // Run initialization
  init();
})();
