// ==UserScript==
// @name         RPGHQ Userscript Manager
// @namespace    rpghq-userscripts
// @version      0.2.1
// @description  RPGHQ Userscript Manager
// @author       loregamer
// @match        https://rpghq.org/*
// @match        https://vault.rpghq.org/*
// @match        *://*.rpghq.org/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @grant        GM_addStyle
// @run-at       document-start
// @homepage     https://github.com/loregamer/rpghq-userscripts#readme
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/main/dist/rpghq-userscript-manager.user.js
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/main/dist/rpghq-userscript-manager.user.js
// ==/UserScript==

!(function () {
  "use strict";
  // Inject styles
  GM_addStyle(`
    :root {
      --primary-color: #2196f3;
      --primary-dark: #1976d2;
      --accent-color: #ff9800;
      --success-color: #4caf50;
      --warning-color: #ffc107;
      --danger-color: #f44336;
      --text-primary: #ffffff;
      --text-secondary: #b0bec5;
      --bg-dark: #1e1e1e;
      --bg-card: #2d2d2d;
      --border-color: #444444;
    }
    
    /* Modal overlay */
    #rpghq-modal-overlay {
      display: none;
      position: fixed;
      z-index: 1000000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.8);
      overflow: hidden;
    }
  
    /* Modal container */
    .mod-manager-modal {
      display: none;
      position: fixed;
      z-index: 1000000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.8);
      overflow: hidden; /* Prevent body scroll when modal is open */
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
      transition: all 0.3s ease;
    }
    
    .script-card.disabled {
      opacity: 0.7;
      filter: grayscale(0.8);
    }
  
    .script-card-image {
      position: relative;
      height: 130px;
      overflow: hidden;
      cursor: pointer;
    }
  
    .script-card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .image-toggle {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 10;
      border-radius: 3px;
      padding: 3px;
    }
  
    /* Category display removed */
  
    .script-card-content {
      padding: 10px;
    }
  
    .script-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
  
    .script-card-actions-top {
      display: none;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
    }
  
    .script-toggle-wrapper {
      cursor: pointer;
      font-size: 1.2em;
      display: flex;
      align-items: center;
    }
  
    /* Default checkboxes - no custom styling */
    input[type="checkbox"] {
      cursor: pointer;
    }
  
    /* Specific styling for the script toggle checkbox */
    .script-toggle-checkbox {
      margin: 2px;
    }
  
    .btn-icon {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 4px;
      border-radius: 3px;
    }
  
    .btn-icon:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: var(--text-primary);
    }
  
    .script-card-title {
      font-size: 1.1em;
      font-weight: bold;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
      padding-right: 8px;
    }
  
    .script-card-version {
      background-color: var(--primary-color);
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 0.8em;
    }
    
    .script-card-version-inline {
      font-size: 0.8em;
      color: var(--text-secondary);
      font-weight: normal;
      display: none; /* Hide version for now */
    }
    
    .script-version-inline {
      font-size: 0.8em;
      color: var(--text-secondary);
      font-weight: normal;
      display: none; /* Hide version for now */
    }
  
    .script-card-description {
      margin: 0 0 10px 0;
      color: var(--text-secondary);
      font-size: 0.9em;
      line-height: 1.3;
      height: 3.6em; /* Approx 3 lines */
      overflow: hidden;
    }
  
    .script-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 8px;
      margin-top: 8px;
      border-top: 1px solid var(--border-color);
    }
  
    .script-card-version {
      font-size: 0.8em;
      color: var(--text-secondary);
      display: none; /* Hide version for now */
    }
  
    .script-card-phase {
      font-size: 0.85em;
      color: var(--text-secondary);
    }
  
    /* Script list view */
    .script-list {
      /* Uses .data-table styling */
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
      z-index: 1100000; /* Above main modal */
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
  
    /* Toggle switch - replaced with font awesome icons */
  
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
  
    /* Info note */
    .info-note {
      background-color: rgba(33, 150, 243, 0.1);
      border-left: 4px solid var(--primary-color);
      padding: 10px;
      margin-bottom: 15px;
      border-radius: 0 4px 4px 0;
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
  const SCRIPT_MANIFEST = [
    {
      id: "bbcode",
      name: "BBCode Highlighting",
      version: "1.0.0",
      description:
        "Adds BBCode highlighting and other QOL improvements to the text editor",
      author: "loregamer",
      path: "./scripts/bbcode.js",
      enabledByDefault: !0,
      image: "https://f.rpghq.org/bEm69Td9mEGU.png?n=pasted-file.png",
      urlPatterns: [
        "https://rpghq.org/forums/posting.php?mode=post*",
        "https://rpghq.org/forums/posting.php?mode=quote*",
        "https://rpghq.org/forums/posting.php?mode=reply*",
        "https://rpghq.org/forums/posting.php?mode=edit*",
      ],
      settings: [],
      categories: ["UI"],
    },
    {
      id: "kalareact",
      name: "Kalarion Reaction Auto-Marker",
      version: "1.0.0",
      description:
        "Auto marks Kalarion rape notifs as read (I will move this to user preferences and make it squashed instead)",
      author: "loregamer",
      image: "https://f.rpghq.org/OA0rQkkRSSVq.png?n=pasted-file.png",
      // Add an image URL if available
      path: "./scripts/kalareact.js",
      enabledByDefault: !1,
      settings: [],
      categories: ["General"],
    },
    {
      id: "memberSearch",
      name: "Member Search Button",
      version: "1.0.0",
      description: "Adds a quick member search button next to Unread posts",
      author: "loregamer",
      image: "https://f.rpghq.org/Rjsn2V3CLLOU.png?n=pasted-file.png",
      // Add an image URL if available
      path: "./scripts/memberSearch.js",
      enabledByDefault: !0,
      settings: [],
      categories: ["Fun"],
    },
    {
      id: "notifications",
      name: "Notification Improver",
      version: "1.0.0",
      description:
        "Adds smileys to reacted notifs, adds colors, idk just makes em cooler I guess",
      author: "loregamer",
      image: "https://f.rpghq.org/rso7uNB6S4H9.png",
      // Add an image URL if available
      path: "./scripts/notifications.js",
      enabledByDefault: !0,
      settings: [],
      categories: ["UI"],
    },
    {
      id: "pinThreads",
      name: "Pin Threads",
      version: "1.0.0",
      description:
        "Adds a Pin button to threads so you can see them in board index",
      author: "loregamer",
      image: "https://f.rpghq.org/HTYypNZVXaOt.png?n=pasted-file.png",
      // Add an image URL if available
      path: "./scripts/pinThreads.js",
      enabledByDefault: !0,
      settings: [],
      categories: ["UI"],
    },
    {
      id: "randomTopic",
      name: "Random Topic Button",
      version: "1.0.0",
      description: "Adds a Random Topic button, for funsies",
      author: "loregamer",
      image: "https://f.rpghq.org/LzsLP40AK6Ut.png?n=pasted-file.png",
      // Add an image URL if available
      path: "./scripts/randomTopic.js",
      enabledByDefault: !0,
      settings: [],
      categories: ["Fun"],
    },
    {
      id: "separateReactions",
      name: "Reaction List Separated",
      version: "1.0.0",
      description: "Makes smiley reactions and counts separated",
      author: "loregamer",
      image:
        "https://f.rpghq.org/H6zBOaMtu9i2.gif?n=Separated%20Reactions%20(2).gif",
      // Add an image URL if available
      path: "./scripts/separateReactions.js",
      enabledByDefault: !1,
      settings: [],
      categories: ["UI"],
    },
    {
      id: "recentTopicsFormat",
      name: "Slightly Formatted Thread Titles in Recent Topics",
      version: "1.0.0",
      description:
        "Adds some minor formatting to thread titles, like unbolding stuff in parantheses, add line wrapping, or reformatting the AG threads",
      author: "loregamer",
      image: "https://f.rpghq.org/97x4ryHzRbVf.png?n=pasted-file.png",
      // Add an image URL if available
      path: "./scripts/recentTopicsFormat.js",
      enabledByDefault: !1,
      settings: [],
      categories: ["UI"],
    },
    {
      id: "commaFormatter",
      name: "Thousands Comma Formatter",
      version: "2.1.2",
      description: "Add commas to large numbers in forum posts and statistics.",
      author: "loregamer",
      image: "https://f.rpghq.org/olnCVAbEzbkt.png?n=pasted-file.png",
      path: "./scripts/commaFormatter.js",
      enabledByDefault: !0,
      urlPatterns: [],
      settings: [
        {
          id: "formatFourDigits",
          label: "Format 4-digit numbers",
          type: "checkbox",
          defaultValue: !1,
          description:
            "Enable to add commas to 4-digit numbers (1,000+). Disable to only format 5-digit numbers (10,000+).",
        },
      ],
    },
  ];
  /**
   * URL Matcher Utility
   *
   * This utility provides functions to check if the current URL matches
   * a pattern or set of patterns. It supports wildcard (*) characters.
   */
  /**
   * Check if the current URL matches any of the provided patterns
   *
   * @param {string|string[]} patterns - A pattern or array of patterns to match against
   * @returns {boolean} - True if the current URL matches any pattern, false otherwise
   */
  /**
   * Check if a script should be loaded based on the current URL
   *
   * @param {Object} script - The script manifest object
   * @returns {boolean} - True if the script should be loaded, false otherwise
   */
  function shouldLoadScript(script) {
    // If no urlPatterns specified or empty array, load everywhere
    return (
      !script.urlPatterns ||
      0 === script.urlPatterns.length ||
      (function (patterns) {
        if (!patterns) return !0;
        // If no patterns, match all URLs
        // Convert single pattern to array
        const patternArray = Array.isArray(patterns) ? patterns : [patterns];
        // If empty array, match all URLs
        if (0 === patternArray.length) return !0;
        const currentUrl = window.location.href;
        return patternArray.some((pattern) => {
          // Convert the pattern to a regex pattern
          // Escape regex special chars except for wildcards
          const escapedPattern = pattern
            .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
            .replace(/\*/g, ".*");
          // Convert * to .*
          return new RegExp("^" + escapedPattern + "$").test(currentUrl);
        });
      })(script.urlPatterns)
    );
  }
  /**
   * Utility for consistent logging throughout the application
   * Prefixes all console outputs with a stylized RPGHQ Userscript Manager label
   */
  /**
   * Log a message to the console with RPGHQ Userscript Manager prefix
   * @param {...any} args - Arguments to pass to console.log
   */ function log(...args) {
    console.log(
      "%c[RPGHQ Userscript Manager]%c",
      "color: #3889ED; font-weight: bold",
      "",
      ...args
    );
  }
  /**
   * Log a warning to the console with RPGHQ Userscript Manager prefix
   * @param {...any} args - Arguments to pass to console.warn
   */ function warn(...args) {
    console.warn(
      "%c[RPGHQ Userscript Manager]%c",
      "color: #FFC107; font-weight: bold",
      "",
      ...args
    );
  }
  /**
   * Log an error to the console with RPGHQ Userscript Manager prefix
   * @param {...any} args - Arguments to pass to console.error
   */ function error(...args) {
    console.error(
      "%c[RPGHQ Userscript Manager]%c",
      "color: #F5575D; font-weight: bold",
      "",
      ...args
    );
  }
  // Shared utility functions for RPGHQ Userscripts
  const sharedUtils = {
    // Caching functions will go here
    _cachePostData: (postId, data) => {
      console.log(`Caching data for post ${postId}`);
      // GM_setValue(`post_${postId}`, JSON.stringify(data)); // Example structure
    },
    _getCachedPostData: (postId) => (
      console.log(`Getting cached data for post ${postId}`), null
    ), // Placeholder
    // Page-level Caching Logic (Placeholders)
    _cachePostsOnPage: () => {
      console.log("Shared Logic: Caching posts on current page (stub).");
      // Logic to find all posts on the page and call cachePostData for each
    },
    // Preference Application Logic (Placeholders)
    _applyUserPreferences: () => {
      console.log("Shared Logic: Applying user preferences (stub).");
      // Logic to read stored user preferences (hiding/highlighting users) and apply them
    },
    _applyThreadPreferences: () => {
      console.log("Shared Logic: Applying thread preferences (stub).");
      // Logic to read stored thread preferences (pinning/hiding/highlighting topics) and apply them
    },
    _cacheTopicData: (topicId, data) => {
      console.log(`Caching data for topic ${topicId}`);
      // GM_setValue(`topic_${topicId}`, JSON.stringify(data)); // Example structure
    },
    _getCachedTopicData: (topicId) => (
      console.log(`Getting cached data for topic ${topicId}`), null
    ),
    // Placeholder
  };
  var loadOrder = {
    "document-start": [
      "_applyThreadPreferences",
      "_cachePostsOnPage",
      "recentTopicsFormat",
      "_applyUserPreferences",
      "bbcode",
      "commaFormatter",
    ],
    "document-end": [
      "memberSearch",
      "randomTopic",
      "kalareact",
      "notifications",
      "pinThreads",
      "separateReactions",
    ],
    "document-idle": [],
    after_dom: [],
  };
  /**
   * Hides the userscript manager modal.
   */
  function hideModal() {
    log("Hiding userscript manager modal...");
    const modal = document.getElementById("mod-manager-modal");
    modal &&
      ((modal.style.display = "none"), (document.body.style.overflow = ""));
    // Hide any open settings modal
    const settingsModal = document.getElementById("script-settings-modal");
    settingsModal && (settingsModal.style.display = "none");
  }
  /**
   * Renders the "Installed Scripts" tab content with filtering and view options.
   *
   * @param {HTMLElement} container - The container element to render into
   * @param {Array} scripts - The array of script objects from SCRIPT_MANIFEST
   * @param {Object} scriptStates - Object containing enabled/disabled states for scripts
   * @param {Function} renderScriptsGridView - Function to render scripts in grid view
   * @param {Function} renderScriptsListView - Function to render scripts in list view
   */
  /**
   * Renders the "Threads" subtab content within the Forum Preferences tab.
   *
   * @param {HTMLElement} container - The container element to render into
   */
  function renderThreadsSubtab(container) {
    log("Rendering Threads subtab..."),
      (container.innerHTML =
        '\n    <div class="wip-banner">\n      <i class="fa fa-wrench"></i> Thread Preferences - Work In Progress\n    </div>\n  \n    <div class="preferences-section">\n      <div class="preferences-section-header">\n        <h3 class="preferences-section-title">Thread Display</h3>\n      </div>\n      <div class="preferences-section-body">\n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Thread Layout</h4>\n            <div class="preference-control">\n              <select>\n                <option selected>Compact</option>\n                <option>Standard</option>\n                <option>Expanded</option>\n              </select>\n            </div>\n          </div>\n          <p class="preference-description">Choose how thread listings are displayed</p>\n        </div>\n      \n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Threads Per Page</h4>\n            <div class="preference-control">\n              <select>\n                <option>10</option>\n                <option selected>20</option>\n                <option>30</option>\n                <option>50</option>\n              </select>\n            </div>\n          </div>\n          <p class="preference-description">Number of threads to display per page</p>\n        </div>\n      </div>\n    </div>\n  \n    <div class="info-note">\n      <strong>Note:</strong> This is a view-only display. Additional Thread preferences will be added in future updates.\n    </div>\n  ');
  }
  /**
   * Renders the "Users" subtab content within the Forum Preferences tab.
   *
   * @param {HTMLElement} container - The container element to render into
   */
  /**
   * Renders the "Forum Preferences" tab content with subtabs.
   *
   * @param {HTMLElement} container - The container element to render into
   */
  function renderForumPreferencesTab(container) {
    log("Rendering Forum Preferences tab with subtabs..."),
      (container.innerHTML = "<h2>Forum Preferences</h2>");
    // Add sub-tabs for Threads and Users
    const subTabsContainer = document.createElement("div");
    (subTabsContainer.className = "sub-tabs"),
      (subTabsContainer.innerHTML =
        '\n    <div class="sub-tab active" data-subtab="threads">\n      <i class="fa fa-comments"></i> Threads\n    </div>\n    <div class="sub-tab" data-subtab="users">\n      <i class="fa fa-users"></i> Users\n    </div>\n  '),
      container.appendChild(subTabsContainer);
    // Add container for sub-tab content
    const subTabContent = document.createElement("div");
    (subTabContent.id = "forum-subtab-content"),
      container.appendChild(subTabContent),
      // Load initial sub-tab (Threads)
      renderThreadsSubtab(subTabContent),
      // Add event listeners for sub-tabs
      subTabsContainer.querySelectorAll(".sub-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          // Update active state
          subTabsContainer.querySelectorAll(".sub-tab").forEach((t) => {
            t.classList.remove("active");
          }),
            tab.classList.add("active"),
            // Load content
            "threads" === tab.dataset.subtab
              ? renderThreadsSubtab(subTabContent)
              : "users" === tab.dataset.subtab &&
                (function (container) {
                  log("Rendering Users subtab..."),
                    (container.innerHTML =
                      '\n    <div class="wip-banner">\n      <i class="fa fa-wrench"></i> User Preferences - Work In Progress\n    </div>\n  \n    <div class="preferences-section">\n      <div class="preferences-section-header">\n        <h3 class="preferences-section-title">User Display</h3>\n      </div>\n      <div class="preferences-section-body">\n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Show User Signatures</h4>\n            <div class="preference-control">\n              <input type="checkbox" name="user.display.signatures" checked>\n            </div>\n          </div>\n          <p class="preference-description">Display user signatures in posts</p>\n        </div>\n      \n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Show User Avatars</h4>\n            <div class="preference-control">\n              <input type="checkbox" name="user.display.avatars" checked>\n            </div>\n          </div>\n          <p class="preference-description">Display user avatars in posts and listings</p>\n        </div>\n      </div>\n    </div>\n  \n    <div class="info-note">\n      <strong>Note:</strong> This is a view-only display. Additional User preferences will be added in future updates.\n    </div>\n  ');
                })(subTabContent);
        });
      });
  }
  /**
   * Renders the "Settings" tab content with global manager settings.
   *
   * @param {HTMLElement} container - The container element to render into
   */
  /**
   * Loads the appropriate tab content based on the selected tab.
   *
   * @param {string} tabName - The name of the tab to load ('installed', 'forum', or 'settings')
   * @param {Object} context - Object containing necessary data and functions for rendering tabs
   * @param {HTMLElement} context.container - The container element to render into
   * @param {Array} context.scripts - The scripts array from SCRIPT_MANIFEST
   * @param {Object} context.scriptStates - Object containing enabled/disabled states for scripts
   * @param {Function} context.renderScriptsGridView - Function to render scripts in grid view
   * @param {Function} context.renderScriptsListView - Function to render scripts in list view
   * @param {Array} context.executionPhases - Array of execution phase objects from manifest schema
   */
  function loadTabContent(tabName, context) {
    const {
      container: container,
      scripts: scripts,
      scriptStates: scriptStates,
      renderScriptsGridView: renderScriptsGridView,
    } = context;
    switch (
      (log(`Loading tab content for: ${tabName}`),
      // Clear previous content
      (container.innerHTML = ""),
      tabName)
    ) {
      case "installed":
        !(function (container, scripts, scriptStates, renderScriptsGridView) {
          log("Rendering Installed Scripts tab with filtering...");
          // Filter panel removed
          // View switcher removed
          // Create the scripts container
          const scriptsContainer = document.createElement("div");
          (scriptsContainer.className = "scripts-display-container"),
            (scriptsContainer.id = "scripts-container"),
            container.appendChild(scriptsContainer),
            // Render scripts in grid view initially
            renderScriptsGridView(scriptsContainer, scripts, scriptStates);
        })(container, scripts, scriptStates, renderScriptsGridView);
        break;

      case "forum":
        renderForumPreferencesTab(container);
        break;

      case "settings":
        !(function (container) {
          log("Rendering Settings tab..."),
            (container.innerHTML =
              '\n    <h2>Global Settings</h2>\n  \n    <div class="preferences-section">\n      <div class="preferences-section-header">\n        <h3 class="preferences-section-title">Appearance</h3>\n      </div>\n      <div class="preferences-section-body">\n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Theme</h4>\n            <div class="preference-control">\n              <select class="setting-input">\n                <option value="dark" selected>Dark</option>\n                <option value="light">Light</option>\n                <option value="system">System Default</option>\n              </select>\n            </div>\n          </div>\n          <p class="preference-description">Choose your preferred theme for the userscript manager</p>\n        </div>\n      \n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Script Card Size</h4>\n            <div class="preference-control">\n              <select class="setting-input">\n                <option value="small">Small</option>\n                <option value="medium" selected>Medium</option>\n                <option value="large">Large</option>\n              </select>\n            </div>\n          </div>\n          <p class="preference-description">Adjust the size of script cards in the gallery view</p>\n        </div>\n      </div>\n    </div>\n  \n    <div class="preferences-section">\n      <div class="preferences-section-header">\n        <h3 class="preferences-section-title">Behavior</h3>\n      </div>\n      <div class="preferences-section-body">\n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Default View</h4>\n            <div class="preference-control">\n              <select class="setting-input">\n                <option value="grid" selected>Grid</option>\n                <option value="list">List</option>\n              </select>\n            </div>\n          </div>\n          <p class="preference-description">Choose the default view for displaying scripts</p>\n        </div>\n      \n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Auto-check for Updates</h4>\n            <div class="preference-control">\n              <label class="toggle-switch">\n                <input type="checkbox" checked>\n                <span class="toggle-slider"></span>\n              </label>\n            </div>\n          </div>\n          <p class="preference-description">Automatically check for script updates when the page loads</p>\n        </div>\n      </div>\n    </div>\n  \n    <div class="preferences-section">\n      <div class="preferences-section-header">\n        <h3 class="preferences-section-title">Advanced</h3>\n      </div>\n      <div class="preferences-section-body">\n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Update Check Interval</h4>\n            <div class="preference-control">\n              <select class="setting-input">\n                <option value="daily">Daily</option>\n                <option value="weekly" selected>Weekly</option>\n                <option value="monthly">Monthly</option>\n              </select>\n            </div>\n          </div>\n          <p class="preference-description">How often to check for script updates</p>\n        </div>\n      \n        <div class="preference-item">\n          <div class="preference-header">\n            <h4 class="preference-name">Debug Mode</h4>\n            <div class="preference-control">\n              <label class="toggle-switch">\n                <input type="checkbox">\n                <span class="toggle-slider"></span>\n              </label>\n            </div>\n          </div>\n          <p class="preference-description">Enable verbose console logging for troubleshooting</p>\n        </div>\n      </div>\n    </div>\n  \n    <div class="info-note">\n      <strong>Note:</strong> These are view-only representations of settings. Changes made here will not be saved.\n    </div>\n  ');
        })(container);
        break;

      default:
        error(`Unknown tab: ${tabName}`),
          (container.innerHTML = `<div class="error-message">Unknown tab: ${tabName}</div>`);
    }
  }
  /**
   * Renders an empty state message when no scripts are found.
   *
   * @param {HTMLElement} container - The container element to render into
   * @param {string} message - The message to display (optional)
   * @param {string} iconClass - The Font Awesome icon class to use (optional)
   */
  /**
   * Renders scripts in a grid view with cards.
   *
   * @param {HTMLElement} container - The container element to render into
   * @param {Array} scripts - Array of script objects from the manifest
   * @param {Object} scriptStates - Object containing enabled/disabled states for scripts
   * @param {Function} showScriptSettings - Function to show the settings modal for a script
   */
  function renderScriptsGridView(
    container,
    scripts,
    scriptStates = {},
    showScriptSettings
  ) {
    if (
      (log("Rendering scripts in Grid View..."),
      !scripts || 0 === scripts.length)
    )
      return void (function (
        container,
        message = "No scripts found.",
        iconClass = "fa-search"
      ) {
        log("Rendering empty state..."),
          (container.innerHTML = `\n    <div class="empty-state">\n      <div class="empty-state-icon">\n        <i class="fa ${iconClass}"></i>\n      </div>\n      <div class="empty-state-message">${message}</div>\n    </div>\n  `);
      })(
        container,
        "No scripts found. Try adjusting your filters to see more results."
      );
    const grid = document.createElement("div");
    (grid.className = "script-grid"),
      scripts.forEach((script) => {
        const isEnabled =
            void 0 !== scriptStates[script.id]
              ? scriptStates[script.id]
              : script.enabledByDefault,
          card = document.createElement("div");
        (card.className = isEnabled ? "script-card" : "script-card disabled"),
          (card.dataset.scriptId = script.id),
          (card.innerHTML = `\n      <div class="script-card-image">\n        <div class="script-toggle-wrapper image-toggle" data-script-id="${script.id}">\n          <input type="checkbox" class="script-toggle-checkbox" data-script-id="${script.id}" ${isEnabled ? "checked" : ""}>\n        </div>\n        <img src="${script.image || "https://via.placeholder.com/240x130?text=No+Image"}" alt="${script.name}" class="script-image-toggle" data-script-id="${script.id}">\n      </div>\n      <div class="script-card-content">\n        <div class="script-card-header">\n          <h3 class="script-card-title">${script.name}</h3>\n          <div class="script-card-actions-top">\n            <button class="btn btn-icon view-settings" data-script-id="${script.id}">\n              <i class="fa fa-cog"></i>\n            </button>\n          </div>\n        </div>\n        <p class="script-card-description">${script.description || "No description available."}</p>\n        <div class="script-card-footer">\n          <span class="script-card-version">v${script.version}</span>\n        </div>\n      </div>\n    `),
          grid.appendChild(card);
      }),
      (container.innerHTML = ""),
      container.appendChild(grid),
      // Add event listeners for settings buttons
      document.querySelectorAll(".view-settings").forEach((btn) => {
        btn.addEventListener("click", () => {
          const scriptId = btn.dataset.scriptId,
            script = scripts.find((s) => s.id === scriptId);
          script && showScriptSettings && showScriptSettings(script);
        });
      }),
      // Add event listeners for checkbox toggles
      document.querySelectorAll(".script-toggle-checkbox").forEach((toggle) => {
        toggle.addEventListener("change", (e) => {
          const scriptId = toggle.dataset.scriptId,
            newState = toggle.checked,
            card = document.querySelector(
              `.script-card[data-script-id="${scriptId}"]`
            );
          card &&
            (newState
              ? card.classList.remove("disabled")
              : card.classList.add("disabled"));
          // Dispatch a custom event that main.js can listen for
          const event = new CustomEvent("script-toggle", {
            detail: {
              scriptId: scriptId,
              enabled: newState,
            },
          });
          document.dispatchEvent(event);
        });
      }),
      // Make the image clickable for toggling
      document.querySelectorAll(".script-image-toggle").forEach((img) => {
        img.addEventListener("click", (e) => {
          const scriptId = img.dataset.scriptId,
            checkbox = document.querySelector(
              `.script-toggle-checkbox[data-script-id="${scriptId}"]`
            );
          if (checkbox) {
            // Toggle the checkbox state
            checkbox.checked = !checkbox.checked;
            // Trigger the change event to update everything
            const changeEvent = new Event("change");
            checkbox.dispatchEvent(changeEvent);
          }
        });
      });
  }
  /**
   * Shows the settings modal for a script.
   *
   * @param {Object} script - The script object from the manifest
   * @param {Function} renderScriptSettingsContent - Function to render the settings content
   * @param {Function} saveScriptSetting - Function to save a script setting
   */
  /**
   * Renders the settings content for a script.
   *
   * @param {Object} script - The script object from the manifest
   * @param {Function} saveScriptSetting - Function to save a script setting
   * @returns {string} - HTML string for the settings content
   */
  function renderScriptSettingsContent(script, saveScriptSetting = null) {
    return (
      log(`Rendering settings content for script: ${script.name}`),
      script.settings && 0 !== script.settings.length
        ? `\n    <div class="setting-group">\n      ${script.settings
            .map(
              (setting) =>
                `\n        <div class="setting-item">\n          <label class="setting-label">${setting.label || setting.id}</label>\n          <span class="setting-description">${setting.description || ""}</span>\n          <div class="setting-control">\n            ${
                  /**
                   * Renders an appropriate HTML control element based on the setting type.
                   *
                   * @param {Object} setting - The setting object with type, options, etc.
                   * @returns {string} - HTML string for the rendered control
                   */
                  (function (setting) {
                    switch (setting.type) {
                      case "boolean":
                        return `\n          <input type="checkbox" name="${setting.id}" ${setting.default ? "checked" : ""}>\n        `;

                      case "select":
                        return `\n          <select class="setting-input">\n            ${setting.options.map((option) => `\n              <option value="${option}" ${option === setting.default ? "selected" : ""}>${option}</option>\n            `).join("")}\n          </select>\n        `;

                      case "number":
                        return `\n          <input type="number" class="setting-input" value="${setting.default || 0}">\n        `;

                      default:
                        return `\n          <input type="text" class="setting-input" value="${setting.default || ""}">\n        `;
                    }
                  })(setting)
                }\n          </div>\n        </div>\n      `
            )
            .join("")}\n    </div>\n  `
        : ""
    );
  }
  /**
   * Toggles a script's enabled state, saves the state, and loads/unloads the script.
   *
   * @param {string} scriptId - The ID of the script to toggle
   * @param {boolean} newState - The new enabled state
   * @param {Object} scriptStates - Object containing enabled/disabled states for scripts
   * @param {Function} gmSetValue - Function to save the state
   * @param {Array} scriptManifest - Array of script objects from the manifest
   * @param {Function} loadScript - Function to load a script
   * @param {Function} unloadScript - Function to unload a script
   */ var recentTopicsFormat = Object.freeze({
    __proto__: null,
    init:
      // RPGHQ - Slightly Formatted Thread Titles
      /**
       * Adds some minor formatting to thread titles, like unbolding stuff in parantheses or reformatting the AG threads
       * Original script by loregamer, adapted for the RPGHQ Userscript Manager.
       * License: MIT
       *
       * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/recentTopicsFormat.md for documentation
       */
      function () {
        /***************************************
         * 1) Remove ellipses/truncation in titles
         ***************************************/
        const style = document.createElement("style");
        /**
         * Process a single title element
         */
        function processTitle(titleElem) {
          // Apply transformations in sequence
          let newHTML = titleElem.textContent;
          (newHTML = newHTML.replace(
            /\([^()]*\)/g,
            (match) =>
              `<span style="font-size: 0.85em; font-weight: normal;">${match}</span>`
          )),
            (newHTML =
              /**
               * Style version numbers by adding 'v' prefix and making them smaller
               * Matches patterns like: 1.0, 1.0.0, 1.0.0.1, etc.
               */
              (function (str) {
                return str.replace(
                  /\b(\d+(?:\.\d+)+)\b/g,
                  (match) => `<span style="font-size: 0.75em;">v${match}</span>`
                );
              })(
                /**
                 * Special formatting for Adventurer's Guild titles
                 * Format: "[x] Adventurer's Guild - Month: Games" or "Month: Games"
                 */ newHTML
              )),
            (newHTML = (function (str, elem) {
              // Check if it's an Adventurer's Guild title or post
              const isGuildTitle = str.includes("Adventurer's Guild"),
                isGuildForum =
                  null !==
                  elem
                    .closest(".row-item")
                    .querySelector(
                      '.forum-links a[href*="adventurer-s-guild"]'
                    );
              if (!isGuildTitle && !isGuildForum) return str;
              let match;
              if (isGuildTitle) {
                // Match the pattern: everything before the month, the month, and games list
                const titleRegex =
                  /^(?:(Junior)\s+)?Adventurer's Guild\s*-\s*([A-Za-z]+):(.+?)(?:\s+[A-Z][A-Z\s]+)*$/;
                match = str.match(titleRegex);
              } else {
                // Match the pattern: month and games list
                const forumRegex = /^([A-Za-z]+):(.+?)(?:\s+[A-Z][A-Z\s]+)*$/;
                match = str.match(forumRegex);
              }
              if (!match) return str;
              if (isGuildTitle) {
                const [_, juniorPrefix, month, gamesList] = match,
                  shortPrefix = juniorPrefix ? "Jr. AG - " : "AG - ";
                return `${gamesList.trim()} <span style="font-size: 0.8em; opacity: 0.8;">${shortPrefix}${month}</span>`;
              }
              {
                const [_, month, gamesList] = match;
                return `${gamesList.trim()} <span style="font-size: 0.8em; opacity: 0.8;">(AG - ${month})</span>`;
              }
            })(
              /**
               * Make text after dash unbolded (but keep same size)
               * e.g. "Title - Game" -> "Title<span style="font-weight: normal"> - Game</span>"
               * Handles both regular dash and em dash
               */ newHTML,
              titleElem
            )),
            (newHTML = (function (str, elem) {
              // Don't process Adventurer's Guild titles or posts
              const isGuildTitle = str.includes("Adventurer's Guild"),
                isGuildForum =
                  null !==
                  elem
                    .closest(".row-item")
                    .querySelector(
                      '.forum-links a[href*="adventurer-s-guild"]'
                    );
              if (isGuildTitle || isGuildForum) return str;
              // Match both regular dash and em dash with optional spaces
              const match = str.match(/\s+[-—]\s+/);
              // If there is no dash, return unmodified
              if (!match) return str;
              const dashIndex = match.index;
              // Part before the dash
              // Wrap the dash + everything after it, only changing font-weight
              return `${str.slice(0, dashIndex)}<span style="font-weight: normal;">${str.slice(dashIndex)}</span>`;
            })(newHTML, titleElem)),
            // Replace original text with our new HTML
            (titleElem.innerHTML = newHTML);
        }
        /**
         * Process all titles in a container element
         */ function processTitlesInContainer(container) {
          container.querySelectorAll(".topictitle").forEach(processTitle);
        }
        // Initial processing
        (style.textContent =
          "\n         /* Ensure topic titles don't get truncated with ellipses */\n         .topictitle {\n             white-space: normal !important;\n             overflow: visible !important;\n             text-overflow: unset !important;\n             max-width: none !important;\n             display: inline-block;\n         }\n     "),
          document.head.appendChild(style),
          processTitlesInContainer(document),
          // Start observing the document with the configured parameters
          new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              "childList" === mutation.type &&
                mutation.addedNodes.forEach((node) => {
                  node.nodeType === Node.ELEMENT_NODE &&
                    processTitlesInContainer(node);
                });
            });
          }).observe(document.body, {
            childList: !0,
            subtree: !0,
          });
      },
  });
  // RPGHQ - Random Topic Button
  /**
   * Adds a Random Topic button, for funsies
   * Original script by loregamer, adapted for the RPGHQ Userscript Manager.
   * License: MIT
   *
   * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/randomTopic.md for documentation
   */ var randomTopic = Object.freeze({
    __proto__: null,
    init: function () {
      // Function to check if a topic exists
      function checkTopicExists(topicId) {
        return new Promise((resolve, reject) => {
          GM_xmlhttpRequest({
            method: "HEAD",
            url: `https://rpghq.org/forums/viewtopic.php?t=${topicId}`,
            onload: function (response) {
              resolve(200 === response.status);
            },
            onerror: function (error) {
              reject(error);
            },
          });
        });
      }
      // Function to get a valid random topic
      async function getValidRandomTopic() {
        let topicId,
          topicExists = !1;
        for (; !topicExists; )
          (topicId = Math.floor(2800 * Math.random()) + 1),
            (topicExists = await checkTopicExists(topicId));
        return `https://rpghq.org/forums/viewtopic.php?t=${topicId}`;
      }
      // Function to create and add the button
      function handleRandomTopicClick(e) {
        e.preventDefault(),
          (this.style.textDecoration = "none"),
          (this.innerHTML =
            '<i class="icon fa-spinner fa-spin fa-fw" aria-hidden="true"></i><span>Loading...</span>'),
          getValidRandomTopic()
            .then((validTopic) => {
              window.location.href = validTopic;
            })
            .catch((error) => {
              console.error("Error finding random topic:", error),
                (this.innerHTML =
                  '<i class="icon fa-random fa-fw" aria-hidden="true"></i><span>Random Topic</span>');
            });
      }
      // Run the function when the page is loaded
      !(function () {
        // Add to quick links dropdown
        const quickLinks = document.querySelector(
          "#quick-links .dropdown-contents"
        );
        if (quickLinks) {
          const listItem = document.createElement("li");
          listItem.innerHTML =
            '\n          <a href="#" role="menuitem">\n            <i class="icon fa-random fa-fw" aria-hidden="true"></i><span>Random Topic</span>\n          </a>\n        ';
          // Insert after "Active topics" in the dropdown
          const activeTopicsItem = quickLinks.querySelector(
            'a[href*="search_id=active_topics"]'
          );
          if (activeTopicsItem) {
            const insertAfter = activeTopicsItem.closest("li");
            insertAfter.parentNode.insertBefore(
              listItem,
              insertAfter.nextSibling
            );
          } else
            // If "Active topics" is not found, append to the end of the list
            quickLinks.appendChild(listItem);
          // Add click event to the dropdown item
          listItem.querySelector("a").onclick = handleRandomTopicClick;
        }
        // Add as a separate button in the main navigation (existing code)
        const navMain = document.getElementById("nav-main");
        if (navMain) {
          const li = document.createElement("li"),
            a = document.createElement("a");
          (a.href = "#"),
            (a.role = "menuitem"),
            (a.innerHTML =
              '<i class="icon fa-random fa-fw" aria-hidden="true"></i><span>Random Topic</span>'),
            // Add custom styles to the anchor and icon
            (a.style.cssText =
              "\n              display: flex;\n              align-items: center;\n              height: 100%;\n              text-decoration: none;\n          "),
            // Apply styles after a short delay to ensure the icon is loaded
            setTimeout(() => {
              const icon = a.querySelector(".icon");
              icon &&
                (icon.style.cssText =
                  "\n                      font-size: 14px;\n                  ");
            }, 100),
            (a.onclick = async function (e) {
              e.preventDefault(),
                (this.style.textDecoration = "none"),
                (this.innerHTML =
                  '<i class="icon fa-spinner fa-spin fa-fw" aria-hidden="true"></i><span>Loading...</span>');
              try {
                const validTopic = await getValidRandomTopic();
                window.location.href = validTopic;
              } catch (error) {
                console.error("Error finding random topic:", error),
                  (this.innerHTML =
                    '<i class="icon fa-random fa-fw" aria-hidden="true"></i><span>Random Topic</span>');
              }
            }),
            li.appendChild(a),
            navMain.appendChild(li);
        }
      })();
    },
  });
  // RPGHQ - Member Search Button
  /**
   * Adds a quick member search button next to Unread posts
   * Original script by loregamer, adapted for the RPGHQ Userscript Manager.
   * License: MIT
   *
   * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/memberSearch.md for documentation
   */ var memberSearch = Object.freeze({
    __proto__: null,
    init: function () {
      // Create member search modal
      function createMemberSearchModal() {
        const modal = document.createElement("div");
        (modal.className = "member-search-modal"),
          (modal.innerHTML =
            '\n              <div class="member-search-container">\n                  <div class="member-search-close">&times;</div>\n                  <div class="member-search-title">Member Search</div>\n                  <input type="text" class="member-search-input" placeholder="Search for a member...">\n                  <div class="member-search-results"></div>\n              </div>\n          '),
          document.body.appendChild(modal);
        return (
          modal
            .querySelector(".member-search-close")
            .addEventListener("click", function () {
              modal.classList.remove("active");
            }),
          // Remove the event listener that closes the modal when clicking outside
          // This ensures users must click the X to close the overlay
          // Setup search functionality
          // Function to setup search functionality
          (function (modal) {
            const searchInput = modal.querySelector(".member-search-input"),
              searchResults = modal.querySelector(".member-search-results");
            // Handle input changes for search
            let debounceTimer;
            searchInput.addEventListener("input", function () {
              clearTimeout(debounceTimer);
              const query = this.value.trim();
              query.length < 2
                ? (searchResults.innerHTML = "")
                : ((searchResults.innerHTML =
                    '<div class="member-search-loading">Searching...</div>'),
                  (debounceTimer = setTimeout(() => {
                    !(
                      // Function to search for members using the API
                      (function (query, resultsContainer) {
                        fetch(
                          `https://rpghq.org/forums/mentionloc?q=${encodeURIComponent(query)}`,
                          {
                            method: "GET",
                            headers: {
                              accept:
                                "application/json, text/javascript, */*; q=0.01",
                              "x-requested-with": "XMLHttpRequest",
                            },
                            credentials: "include",
                          }
                        )
                          .then((response) => response.json())
                          .then((data) => {
                            !(
                              // Function to display search results
                              (function (data, resultsContainer) {
                                resultsContainer.innerHTML = "";
                                // Filter to only include users, exclude groups
                                const filteredData = data.filter(
                                  (item) => "user" === item.type
                                );
                                if (!filteredData || 0 === filteredData.length)
                                  return void (resultsContainer.innerHTML =
                                    '<div class="member-search-no-results">No members found</div>');
                                const fragment =
                                  document.createDocumentFragment();
                                // No need to sort since we're only showing users now
                                filteredData.forEach((item) => {
                                  const resultItem =
                                    document.createElement("div");
                                  (resultItem.className =
                                    "member-search-result"),
                                    // User entry
                                    resultItem.setAttribute(
                                      "data-user-id",
                                      item.user_id
                                    );
                                  // Create avatar URL with proper format
                                  const userId = item.user_id,
                                    username =
                                      item.value || item.key || "Unknown User",
                                    defaultAvatar =
                                      "https://f.rpghq.org/OhUxAgzR9avp.png?n=pasted-file.png";
                                  // Create the result item with image that tries multiple extensions
                                  (resultItem.innerHTML = `\n          <img \n            src="https://rpghq.org/forums/download/file.php?avatar=${userId}.jpg" \n            alt="${username}'s avatar" \n            onerror="if(this.src.endsWith('.jpg')){this.src='https://rpghq.org/forums/download/file.php?avatar=${userId}.png';}else if(this.src.endsWith('.png')){this.src='https://rpghq.org/forums/download/file.php?avatar=${userId}.gif';}else{this.src='${defaultAvatar}';}"\n          >\n          <span>${username}</span>\n        `),
                                    resultItem.addEventListener(
                                      "click",
                                      function () {
                                        const userId =
                                          this.getAttribute("data-user-id");
                                        window.location.href = `https://rpghq.org/forums/memberlist.php?mode=viewprofile&u=${userId}`;
                                      }
                                    ),
                                    fragment.appendChild(resultItem);
                                }),
                                  resultsContainer.appendChild(fragment);
                              })(
                                // Add the member search button to the navigation bar
                                data,
                                resultsContainer
                              )
                            );
                          })
                          .catch((error) => {
                            console.error(
                              "Error searching for members:",
                              error
                            ),
                              (resultsContainer.innerHTML =
                                '<div class="member-search-no-results">Error searching for members</div>');
                          });
                      })(query, searchResults)
                    );
                  }, 300)));
            }),
              // Focus input when modal is opened
              modal.addEventListener("transitionend", function () {
                modal.classList.contains("active") && searchInput.focus();
              });
            // Also try to focus right away when modal is shown
            // This helps in browsers that don't fire transitionend properly
            const activeObserver = new MutationObserver(function (mutations) {
              mutations.forEach(function (mutation) {
                "class" === mutation.attributeName &&
                  modal.classList.contains("active") &&
                  searchInput.focus();
              });
            });
            activeObserver.observe(modal, {
              attributes: !0,
            });
          })(modal),
          modal
        );
      }
      // Add CSS styles
      GM_addStyle(
        "\n          .member-search-modal {\n              display: none;\n              position: fixed;\n              top: 0;\n              left: 0;\n              width: 100%;\n              height: 100%;\n              background-color: rgba(0, 0, 0, 0.7);\n              z-index: 1000;\n              justify-content: center;\n              align-items: center;\n          }\n          .member-search-modal.active {\n              display: flex;\n          }\n          .member-search-container {\n              background-color: #1e232b;\n              border: 1px solid #292e37;\n              border-radius: 4px;\n              width: 350px;\n              max-width: 80%;\n              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);\n              padding: 20px 20px;\n              position: relative;\n              z-index: 1001;\n              margin: 0 auto;\n              box-sizing: border-box;\n          }\n          .member-search-close {\n              position: absolute;\n              top: 10px;\n              right: 10px;\n              font-size: 20px;\n              color: #888;\n              cursor: pointer;\n          }\n          .member-search-close:hover {\n              color: #fff;\n          }\n          .member-search-title {\n              font-size: 18px;\n              margin-bottom: 15px;\n              color: #fff;\n              text-align: center;\n          }\n          .member-search-input {\n              width: calc(100% - 20px);\n              padding: 8px 10px;\n              border: 1px solid #292e37;\n              border-radius: 4px;\n              background-color: #171b24;\n              color: #fff;\n              margin-bottom: 10px;\n              font-size: 14px;\n              position: relative;\n              z-index: 1002;\n              margin-left: 10px;\n              margin-right: 10px;\n              box-sizing: border-box;\n          }\n          .member-search-input:focus {\n              outline: none;\n              border-color: #8698b3;\n          }\n          .member-search-results {\n              max-height: 300px;\n              overflow-y: auto;\n          }\n          .member-search-result {\n              display: flex;\n              align-items: center;\n              padding: 8px 10px;\n              cursor: pointer;\n              border-radius: 4px;\n          }\n          .member-search-result:hover {\n              background-color: #292e37;\n          }\n          .member-search-result img {\n              width: 32px;\n              height: 32px;\n              border-radius: 50%;\n              margin-right: 10px;\n          }\n          .member-search-result span {\n              white-space: nowrap;\n              overflow: hidden;\n              text-overflow: ellipsis;\n          }\n          .member-search-no-results {\n              padding: 10px;\n              color: #8a8a8a;\n              text-align: center;\n          }\n          .member-search-loading {\n              text-align: center;\n              padding: 10px;\n              color: #8a8a8a;\n          }\n          .member-search-group {\n              background-color: #272e38;\n              padding: 2px 6px;\n              border-radius: 3px;\n              margin-left: 6px;\n              font-size: 0.8em;\n              color: #aaa;\n          }\n      "
      ),
        // Initialize the member search functionality
        (function () {
          const navMain = document.getElementById("nav-main");
          if (!navMain) return;
          // Create the modal first
          const searchModal = createMemberSearchModal(),
            li = document.createElement("li");
          // Create the navigation button
          li.setAttribute("data-skip-responsive", "true");
          const a = document.createElement("a");
          (a.href = "#"),
            (a.role = "menuitem"),
            (a.innerHTML =
              '<i class="icon fa-user-plus fa-fw" aria-hidden="true"></i><span>Find Member</span>'),
            // Add custom styles to the anchor and icon
            (a.style.cssText =
              "\n              display: flex;\n              align-items: center;\n              height: 100%;\n              text-decoration: none;\n          "),
            // Apply styles after a short delay to ensure the icon is loaded
            setTimeout(() => {
              const icon = a.querySelector(".icon");
              icon &&
                (icon.style.cssText =
                  "\n                      font-size: 14px;\n                  ");
            }, 100),
            // Add click event to open the search modal
            a.addEventListener("click", function (e) {
              e.preventDefault(), searchModal.classList.add("active");
              const searchInput = searchModal.querySelector(
                ".member-search-input"
              );
              (searchInput.value = ""),
                searchInput.focus(),
                (searchModal.querySelector(".member-search-results").innerHTML =
                  "");
            }),
            li.appendChild(a);
          // Try a different approach for inserting the button in the navigation
          // Find a good position for the button, like after Chat or near Members
          const chatItem = Array.from(navMain.children).find(
              (el) =>
                el.textContent.trim().includes("Chat") ||
                el.textContent.trim().includes("IRC")
            ),
            membersItem = Array.from(navMain.children).find((el) =>
              el.textContent.trim().includes("Members")
            );
          // Try to find the Members item again, but look for direct children of navMain
          // Try to insert it after Chat, or Members, or just append to navMain
          chatItem && chatItem.parentNode === navMain
            ? navMain.insertBefore(li, chatItem.nextSibling)
            : membersItem && membersItem.parentNode === navMain
              ? navMain.insertBefore(li, membersItem.nextSibling)
              : // Just append it to the navMain as a safe fallback
                navMain.appendChild(li);
        })();
    },
  });
  // RPGHQ - Reaction List Separated
  /**
   * Makes smiley reactions and counts separated
   * Original script by loregamer, adapted for the RPGHQ Userscript Manager.
   * License: MIT
   *
   * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/separateReactions.md for documentation
   */ var separateReactions = Object.freeze({
    __proto__: null,
    init: function () {
      function createReactionList(postId, reactions) {
        console.log(
          "createReactionList: Starting to create reaction list for post",
          postId
        );
        const pollVotes = (function () {
          console.log("getPollVotes: Starting to collect poll votes");
          const pollVotes = {},
            polls = document.querySelectorAll(".polls");
          return (
            console.log("getPollVotes: Found polls:", polls.length),
            polls.forEach((poll, pollIndex) => {
              console.log(`getPollVotes: Processing poll #${pollIndex + 1}`);
              const dls = poll.querySelectorAll("dl");
              console.log(
                `getPollVotes: Found ${dls.length} dl elements in poll #${pollIndex + 1}`
              );
              let currentOption = null;
              dls.forEach((dl, dlIndex) => {
                // First check if this is an option DL
                const optionDt = dl.querySelector("dt");
                // Then check if this is a voters box for the current option
                if (
                  (!optionDt ||
                    dl.classList.contains("poll_voters_box") ||
                    dl.classList.contains("poll_total_votes") ||
                    ((currentOption = optionDt.textContent.trim()),
                    console.log(
                      `getPollVotes: Found option: "${currentOption}"`
                    )),
                  dl.classList.contains("poll_voters_box") && currentOption)
                ) {
                  console.log(
                    `getPollVotes: Processing voters for option: "${currentOption}"`
                  );
                  const votersSpan = dl.querySelector(".poll_voters");
                  if (!votersSpan) return;
                  const voters = votersSpan.querySelectorAll("span[name]");
                  console.log(
                    `getPollVotes: Found ${voters.length} voters for this option`
                  ),
                    voters.forEach((voter, voterIndex) => {
                      const username = voter.getAttribute("name"),
                        userLink = voter.querySelector("a");
                      if (
                        (console.log(
                          `getPollVotes: Processing voter #${voterIndex + 1}:`,
                          {
                            username: username,
                            hasUserLink: !!userLink,
                            linkText: userLink?.textContent,
                            option: currentOption,
                            isColoured:
                              userLink?.classList.contains("username-coloured"),
                            color: userLink?.style.color,
                          }
                        ),
                        username && userLink)
                      ) {
                        const lowerUsername = username.toLowerCase();
                        pollVotes[lowerUsername] ||
                          (pollVotes[lowerUsername] = {
                            options: [],
                            isColoured:
                              userLink.classList.contains("username-coloured"),
                            color: userLink.style.color || null,
                          }),
                          pollVotes[lowerUsername].options.push(currentOption);
                      }
                    });
                }
              });
            }),
            console.log("getPollVotes: Final collected votes:", pollVotes),
            pollVotes
          );
        })();
        console.log("createReactionList: Got poll votes:", pollVotes);
        const displayStyle = 0 === reactions.length ? "display: none;" : "";
        console.log(
          "createReactionList: Processing",
          reactions.length,
          "reactions"
        );
        const html = `\n        <div class="reaction-score-list content-processed" data-post-id="${postId}" data-title="Reactions" style="padding-top: 10px !important; ${displayStyle}">\n            <div class="list-scores" style="display: flex; flex-wrap: wrap; gap: 4px;">\n                ${reactions
          .map(
            (reaction, reactionIndex) => (
              console.log(
                `createReactionList: Processing reaction #${reactionIndex + 1}:`,
                {
                  title: reaction.title,
                  userCount: reaction.users.length,
                }
              ),
              `\n                    <div class="reaction-group" style="display: flex; align-items: center; background-color: #3A404A; border-radius: 8px; padding: 2px 6px; position: relative;">\n                        <img src="${reaction.image}" alt="${reaction.title}" style="width: auto; height: 16px; margin-right: 4px; object-fit: contain;">\n                        <span style="font-size: 12px; color: #dcddde;">${reaction.count}</span>\n                        <div class="reaction-users-popup" style="display: none; position: fixed; background-color: #191919; border: 1px solid #202225; border-radius: 4px; padding: 8px; z-index: 1000; color: #dcddde; font-size: 12px; min-width: 200px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">\n                            <div style="font-weight: bold; margin-bottom: 8px;">${reaction.title}</div>\n                            <div style="display: flex; flex-direction: column; gap: 8px;">\n                                ${reaction.users
                .map((user, userIndex) => {
                  console.log(
                    `createReactionList: Reaction #${reactionIndex + 1}, processing user #${userIndex + 1}:`,
                    {
                      username: user.username,
                      pollVotes:
                        pollVotes[user.username.toLowerCase()]?.options,
                    }
                  );
                  const userPollVotes = pollVotes[user.username.toLowerCase()],
                    pollInfo =
                      userPollVotes?.options?.length > 0
                        ? `<div style="font-size: 8.5px; opacity: 0.8; color: #dcddde; margin-top: 2px;">\n                                            ${1 === userPollVotes.options.length ? `<div>${userPollVotes.options[0]}</div>` : userPollVotes.options.map((option) => `<div style="display: flex; align-items: baseline; gap: 4px;">\n                                                  <span style="font-size: 8px;">•</span>\n                                                  <span>${option}</span>\n                                                </div>`).join("")}\n                                          </div>`
                        : "";
                  return `\n                                        <div style="display: flex; align-items: flex-start;">\n                                            <div style="width: 24px; height: 24px; margin-right: 8px; flex-shrink: 0;">\n                                                ${user.avatar ? `<img src="${user.avatar}" alt="${user.username}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">` : ""}\n                                            </div>\n                                            <div style="display: flex; flex-direction: column;">\n                                                <a href="${user.profileUrl}" style="${user.isColoured ? `color: ${user.color};` : ""}" class="${user.isColoured ? "username-coloured" : "username"}">${user.username}</a>\n                                                ${pollInfo}\n                                            </div>\n                                        </div>\n                                    `;
                })
                .join(
                  ""
                )}\n                            </div>\n                        </div>\n                    </div>\n                `
            )
          )
          .join("")}\n            </div>\n        </div>\n    `;
        return console.log("createReactionList: Finished creating HTML"), html;
      }
      function fetchReactions(postId) {
        return fetch(
          `https://rpghq.org/forums/reactions?mode=view&post=${postId}`,
          {
            method: "POST",
            headers: {
              accept: "application/json, text/javascript, */*; q=0.01",
              "x-requested-with": "XMLHttpRequest",
            },
            credentials: "include",
          }
        )
          .then((response) => response.json())
          .then((data) =>
            data.htmlContent
              ? (function (htmlContent) {
                  const doc = new DOMParser().parseFromString(
                      htmlContent,
                      "text/html"
                    ),
                    reactions = [];
                  return (
                    doc
                      .querySelectorAll(".tab-header a:not(.active)")
                      .forEach((a) => {
                        const image = a.querySelector("img")?.src || "",
                          title = a.getAttribute("title") || "",
                          count =
                            a.querySelector(".tab-counter")?.textContent || "0",
                          dataId = a.getAttribute("data-id");
                        if (dataId) {
                          const users = [];
                          doc
                            .querySelectorAll(
                              `.tab-content[data-id="${dataId}"] li`
                            )
                            .forEach((li) => {
                              const userLink =
                                li.querySelector(".cbb-helper-text a");
                              if (userLink) {
                                const username = userLink.textContent || "",
                                  profileUrl = userLink.href || "",
                                  avatarImg =
                                    li.querySelector(".user-avatar img"),
                                  avatar = avatarImg ? avatarImg.src : "",
                                  isColoured =
                                    userLink.classList.contains(
                                      "username-coloured"
                                    ),
                                  color = isColoured
                                    ? userLink.style.color
                                    : null;
                                users.push({
                                  username: username,
                                  avatar: avatar,
                                  profileUrl: profileUrl,
                                  isColoured: isColoured,
                                  color: color,
                                });
                              }
                            }),
                            reactions.push({
                              image: image,
                              title: title,
                              count: count,
                              users: users,
                            });
                        }
                      }),
                    reactions
                  );
                })(data.htmlContent)
              : (console.error("No HTML content in response:", data), [])
          )
          .catch(
            (error) => (console.error("Error fetching reactions:", error), [])
          );
      }
      function processPost(post) {
        const postId = post.id.substring(1),
          existingReactionList = post.querySelector(".reaction-score-list");
        existingReactionList &&
          !existingReactionList.dataset.processed &&
          (function (post, postId) {
            const existingReactionList = post.querySelector(
              ".reaction-score-list"
            );
            if (existingReactionList && existingReactionList.dataset.processed)
              return;
            fetchReactions(postId)
              .then((reactions) => {
                const reactionListHtml = createReactionList(postId, reactions);
                if (existingReactionList)
                  existingReactionList.outerHTML = reactionListHtml;
                else {
                  const reactionLauncher = post.querySelector(
                    ".reactions-launcher"
                  );
                  reactionLauncher &&
                    reactionLauncher.insertAdjacentHTML(
                      "beforebegin",
                      reactionListHtml
                    );
                }
                const newReactionList = post.querySelector(
                  ".reaction-score-list"
                );
                newReactionList &&
                  ((newReactionList.dataset.processed = "true"),
                  // Add hover effect to reaction groups
                  newReactionList
                    .querySelectorAll(".reaction-group")
                    .forEach((group) => {
                      const popup = group.querySelector(
                        ".reaction-users-popup"
                      );
                      let isHovering = !1;
                      group.addEventListener("mouseenter", (e) => {
                        (isHovering = !0), showPopup(group, popup);
                      }),
                        group.addEventListener("mouseleave", () => {
                          (isHovering = !1),
                            (function (popup) {
                              popup.style.display = "none";
                            })(popup);
                        }),
                        // Add scroll event listener
                        window.addEventListener("scroll", () => {
                          isHovering && showPopup(group, popup);
                        });
                    }));
                // Update the reaction launcher
                const reactionLauncher = post.querySelector(
                  ".reactions-launcher"
                );
                if (reactionLauncher) {
                  const reactionButton =
                    reactionLauncher.querySelector(".reaction-button");
                  if (reactionButton) {
                    // Check if a reaction is selected
                    const selectedReaction =
                      reactionButton.querySelector("img");
                    if (selectedReaction && GM_getValue("leftMode", !0)) {
                      // Replace the button content with an "X" icon and center-align it
                      (reactionButton.innerHTML =
                        '\n                <svg class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1000 1000" enable-background="new 0 0 1000 1000" xml:space="preserve">\n                  <path d="M576.3,877.3c-30.5,7.2-62.1,10.9-93.7,10.9c-223.3,0-405-181.7-405-405s181.7-405,405-405c223.3,0,405,181.7,405,405c0,32.8-3.9,65.5-11.7,97.1c-4.5,18.1,6.6,36.4,24.7,40.8c18.1,4.7,36.4-6.5,40.8-24.7c9.1-36.9,13.7-75,13.7-113.3c0-260.6-212-472.5-472.5-472.5C222,10.6,10,222.6,10,483.1c0,260.6,212,472.6,472.5,472.6c36.9,0,73.7-4.3,109.3-12.7c18.1-4.3,29.4-22.4,25-40.6C612.6,884.2,594.4,872.9,576.3,877.3z"></path>\n                  <path d="M250.2,594.7c-14.7,11.5-17.3,32.7-5.8,47.4c58,74.2,145.2,116.7,239.3,116.7c95.1,0,182.9-43.3,240.9-118.7c11.4-14.8,8.6-35.9-6.2-47.3s-35.9-8.6-47.3,6.2c-45.1,58.7-113.4,92.3-187.4,92.3c-73.2,0-141-33.1-186.2-90.8C286.1,585.8,264.8,583.3,250.2,594.7z"></path>\n                  <path d="M382.4,435.9v-67.5c0-28-22.6-50.6-50.6-50.6s-50.6,22.6-50.6,50.6v67.5c0,28,22.6,50.6,50.6,50.6S382.4,463.8,382.4,435.9z"></path>\n                  <path d="M686.2,435.9v-67.5c0-28-22.7-50.6-50.6-50.6S585,340.4,585,368.3v67.5c0,28,22.7,50.6,50.6,50.6S686.2,463.8,686.2,435.9z"></path>\n                  <path d="M956.2,786.9H855V685.6c0-18.7-15.1-33.8-33.8-33.8s-33.8,15.1-33.8,33.8v101.3H686.2c-18.7,0-33.8,15.1-33.8,33.8s15.1,33.8,33.8,33.8h101.3v101.3c0,18.7,15.1,33.8,33.8,33.8s33.8-15.1,33.8-33.8V854.4h101.3c18.7,0,33.8-15.1,33.8-33.8S974.9,786.9,956.2,786.9z"></path>\n                </svg>\n              '),
                        reactionButton.classList.add("default-icon"),
                        reactionButton.classList.remove("remove-reaction"),
                        (reactionButton.title = "Add reaction"),
                        // Remove any existing inline styles that might interfere
                        (reactionButton.style.cssText = "");
                      // Highlight the user's reaction in the reaction list
                      const userReactionImage = selectedReaction.src,
                        userReactionGroup = newReactionList.querySelector(
                          `.reaction-group img[src="${userReactionImage}"]`
                        );
                      userReactionGroup &&
                        userReactionGroup
                          .closest(".reaction-group")
                          .classList.add("user-reacted");
                    }
                  }
                }
              })
              .catch((error) =>
                console.error("Error fetching reactions:", error)
              );
          })(post, postId);
      }
      function showPopup(group, popup) {
        // Show the popup
        popup.style.display = "block";
        // Position the popup
        const rect = group.getBoundingClientRect();
        let top = rect.bottom,
          left = rect.left;
        // Adjust if popup goes off-screen
        left + popup.offsetWidth > window.innerWidth &&
          (left = window.innerWidth - popup.offsetWidth),
          (popup.style.top = `${top}px`),
          (popup.style.left = `${left}px`);
      }
      function toggleLeftMode() {
        const currentMode = GM_getValue("leftMode", !1);
        GM_setValue("leftMode", !currentMode), window.location.reload();
      }
      function observePosts() {
        const style = document.createElement("style");
        (style.textContent =
          "\n      @media screen and (min-width: 768px) {\n        .post .content {\n          min-height: 125px;\n        }\n      }\n      .reactions-launcher .reaction-button.remove-reaction .icon {\n        font-size: 16px !important;\n        line-height: 1 !important;\n        margin: 0 !important;\n        height: auto !important; /* Override the fixed height */\n      }\n      .reaction-group.user-reacted {\n        background-color: #4A5A6A !important;\n      }\n      .reaction-group.user-reacted span {\n        color: #ffffff !important;\n      }\n    "),
          document.head.appendChild(style),
          (function () {
            const leftMode = GM_getValue("leftMode", !1),
              style =
                document.getElementById("rpghq-reaction-list-style") ||
                document.createElement("style");
            (style.id = "rpghq-reaction-list-style"),
              (style.textContent = leftMode
                ? "\n      .reactions-launcher > .reaction-button.default-icon {\n        padding-top: 7px !important;\n      }\n      .reaction-score-list, .reactions-launcher {\n        float: left !important;\n        margin-right: 4px !important;\n        padding-top: 10px !important;\n        margin: 0 0 5px 0 !important;\n        padding: 4px 4px 4px 0 !important;\n      }\n      .reactions-launcher {\n        display: flex !important;\n        align-items: center !important;\n      }\n      .reactions-launcher a.reaction-button {\n        display: flex !important;\n        align-items: center !important;\n        justify-content: center !important;\n        width: auto !important;\n        height: 16px !important;\n        padding: 0 !important;\n        background: none !important;\n      }\n      .reactions-launcher a.reaction-button svg {\n        width: 16px !important;\n        height: 16px !important;\n        fill: #dcddde !important;\n      }\n    "
                : ""),
              document.head.appendChild(style),
              leftMode &&
                document.querySelectorAll(".postbody").forEach((postbody) => {
                  const reactionLauncher = postbody.querySelector(
                      ".reactions-launcher"
                    ),
                    reactionScoreList = postbody.querySelector(
                      ".reaction-score-list"
                    );
                  reactionLauncher &&
                    reactionScoreList &&
                    reactionLauncher.previousElementSibling !==
                      reactionScoreList &&
                    reactionLauncher.parentNode.insertBefore(
                      reactionScoreList,
                      reactionLauncher
                    );
                });
          })(),
          (function () {
            if (window.innerWidth <= 768) {
              // Mobile view check
              const dropdown = document.querySelector(
                "#username_logged_in .dropdown-contents"
              );
              if (
                dropdown &&
                !document.getElementById("toggle-left-reactions-mode")
              ) {
                const leftModeEnabled = GM_getValue("leftMode", !1),
                  listItem = document.createElement("li"),
                  toggleButton = document.createElement("a");
                (toggleButton.id = "toggle-left-reactions-mode"),
                  (toggleButton.href = "#"),
                  (toggleButton.title = "Toggle Left Reactions Mode"),
                  (toggleButton.role = "menuitem"),
                  (toggleButton.innerHTML = `\n          <i class="icon fa-align-left fa-fw" aria-hidden="true"></i>\n          <span>Left Reactions Mode (${leftModeEnabled ? "On" : "Off"})</span>\n        `),
                  toggleButton.addEventListener("click", function (e) {
                    e.preventDefault(), toggleLeftMode();
                  }),
                  listItem.appendChild(toggleButton),
                  dropdown.insertBefore(listItem, dropdown.lastElementChild);
              }
            }
          })();
        new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            "childList" === mutation.type &&
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE)
                  if (node.classList.contains("post")) processPost(node);
                  else if (node.classList.contains("reaction-score-list")) {
                    const post = node.closest(".post");
                    post && processPost(post);
                  }
              });
          });
        }).observe(document.body, {
          childList: !0,
          subtree: !0,
        }),
          // Process existing posts
          document.querySelectorAll(".post").forEach(processPost);
      }
      GM_registerMenuCommand(
        "[Reaction List] Toggle Left Mode",
        toggleLeftMode
      ),
        "complete" === document.readyState ||
        "interactive" === document.readyState
          ? observePosts()
          : window.addEventListener("load", observePosts);
    },
  });
  // RPGHQ - Pin Threads
  /**
   * Adds a Pin button to threads so you can see them in board index
   * Original script by loregamer, adapted for the RPGHQ Userscript Manager.
   * License: MIT
   *
   * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/pinThreads.md for documentation
   */ var pinThreads = Object.freeze({
    __proto__: null,
    init: function () {
      let menuCommandId = null;
      // Utility functions
      const util_getPinnedThreads = () =>
          GM_getValue("rpghq_pinned_threads", {}),
        util_setPinnedThreads = (threads) =>
          GM_setValue("rpghq_pinned_threads", threads),
        util_getPinnedForums = () => GM_getValue("rpghq_pinned_forums", {}),
        util_setPinnedForums = (forums) =>
          GM_setValue("rpghq_pinned_forums", forums),
        util_getShowOnNewPosts = () =>
          GM_getValue("rpghq_show_pinned_on_new_posts", !1),
        util_setShowOnNewPosts = (value) =>
          GM_setValue("rpghq_show_pinned_on_new_posts", value),
        util_getThreadId = () => {
          const match = window.location.href.match(/[?&]t=(\d+)/);
          if (match) return match[1];
          const topicTitleLink = document.querySelector("h2.topic-title a");
          if (topicTitleLink) {
            const topicUrlMatch = topicTitleLink.href.match(/[?&]t=(\d+)/);
            return topicUrlMatch ? topicUrlMatch[1] : null;
          }
          return null;
        },
        util_getForumId = () => {
          const match = window.location.href.match(/[?&]f=(\d+)/);
          return match ? match[1] : null;
        },
        util_getForumName = () => {
          const forumTitleElement = document.querySelector("h2.forum-title");
          return forumTitleElement
            ? forumTitleElement.textContent.trim()
            : null;
        },
        util_addStyle = (css) => GM_addStyle(css),
        util_fetchHtml = (url) =>
          new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
              method: "GET",
              url: url,
              headers: {
                "User-Agent": navigator.userAgent,
                Accept:
                  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                Referer: "https://rpghq.org/forums/",
                DNT: "1",
                Connection: "keep-alive",
                "Upgrade-Insecure-Requests": "1",
              },
              withCredentials: !0,
              timeout: 3e4,
              onload: (response) => resolve(response.responseText),
              onerror: (error) => reject(error),
              ontimeout: () => reject(new Error("Request timed out")),
            });
          }),
        util_parseHtml = (html) =>
          new DOMParser().parseFromString(html, "text/html");
      function toggleNewPostsDisplay() {
        const currentState = util_getShowOnNewPosts();
        util_setShowOnNewPosts(!currentState),
          updateMenuCommand(),
          location.reload();
      }
      function updateMenuCommand() {
        null !== menuCommandId && GM_unregisterMenuCommand(menuCommandId);
        const currentState = util_getShowOnNewPosts();
        menuCommandId = GM_registerMenuCommand(
          currentState
            ? "[Pinned Threads] Disable on New Posts"
            : "[Pinned Threads] Enable on New Posts",
          toggleNewPostsDisplay
        );
      }
      function togglePinThread(threadId, button) {
        const pinnedThreads = util_getPinnedThreads(),
          threadInfo = {
            title: document.querySelector(".topic-title").textContent.trim(),
            author: document.querySelector(".author").textContent.trim(),
            postTime: document
              .querySelector(".author time")
              .getAttribute("datetime"),
          };
        pinnedThreads.hasOwnProperty(threadId)
          ? delete pinnedThreads[threadId]
          : (pinnedThreads[threadId] = threadInfo),
          util_setPinnedThreads(pinnedThreads),
          updatePinButtonState(button, pinnedThreads.hasOwnProperty(threadId));
      }
      function createForumListItemHTML(forumId, forumInfo) {
        const forumClass =
          forumInfo.isUnread || !1 ? "forum_unread_subforum" : "forum_read";
        // Create breadcrumbs text based on whether it's a subforum
        let breadcrumbsText = forumInfo.breadcrumbs || "";
        return (
          forumInfo.parentForumName &&
            (breadcrumbsText = `Subforum of ${forumInfo.parentForumName}`),
          `\n        <li class="row content-processed" id="pinned-forum-${forumId}">\n          <dl class="row-item ${forumClass}">\n            <dt title="${forumInfo.name}">\n              <div class="list-inner">\n                <a href="${forumInfo.url}" class="forumtitle">${forumInfo.name}</a>\n                <br><span class="forum-path responsive-hide">${breadcrumbsText}</span>\n              </div>\n            </dt>\n            <dd class="posts">-</dd>\n            <dd class="views">-</dd>\n            <dd class="lastpost">              -</dd>\n          </dl>\n        </li>\n      `
        );
      }
      function createCustomThreadRowHTML(
        threadId,
        title,
        forumName,
        forumUrl,
        errorMessage = ""
      ) {
        const forumInfo =
          forumName && forumUrl
            ? `» in <a href="${forumUrl}">${forumName}</a>`
            : "";
        return `\n        <li class="row bg1 content-processed" id="pinned-thread-${threadId}">\n          <dl class="row-item topic_read">\n            <dt>\n              <div class="list-inner">\n                <a href="https://rpghq.org/forums/viewtopic.php?t=${threadId}" class="topictitle">${errorMessage ? `${title} (${errorMessage})` : title}</a>\n                ${forumInfo ? `<br><span class="responsive-hide">${forumInfo}</span>` : ""}\n              </div>\n            </dt>\n            <dd class="posts">-</dd>\n            <dd class="views">-</dd>\n          </dl>\n        </li>\n      `;
      }
      async function fetchThreadRowFromForum(
        threadTitle,
        forumUrl,
        page = 1,
        maxPages = 5
      ) {
        const url = `${forumUrl}&start=${25 * (page - 1)}`;
        try {
          const html = await util_fetchHtml(url),
            doc = util_parseHtml(html);
          if (doc.querySelector('form[action="./ucp.php?mode=login"]'))
            throw new Error(
              "Redirected to login page. User might not be authenticated."
            );
          const threadRows = doc.querySelectorAll(".topiclist.topics .row");
          for (const row of threadRows) {
            const rowTitleElement = row.querySelector(".topictitle");
            if (rowTitleElement) {
              if (rowTitleElement.textContent.trim() === threadTitle)
                return row.outerHTML;
            }
          }
          // If thread not found on this page, check the next page
          if (doc.querySelector(".pagination .next a") && page < maxPages)
            return fetchThreadRowFromForum(
              threadTitle,
              forumUrl,
              page + 1,
              maxPages
            );
          // If no next page or max pages reached, thread not found
          throw new Error(`Thread not found after checking ${page} pages`);
        } catch (error) {
          throw new Error(`Error fetching thread row: ${error.message}`);
        }
      }
      function createErrorListItemHTML(threadId) {
        return `\n        <li class="row bg1 content-processed" id="pinned-thread-${threadId}">\n          <dl class="row-item topic_read">\n            <dt>\n              <div class="list-inner">\n                <span class="topic-title">\n                  Error loading thread\n                </span>\n              </div>\n            </dt>\n            <dd class="posts">-</dd>\n            <dd class="views">-</dd>\n          </dl>\n        </li>\n      `;
      }
      function addResponsiveStyle() {
        util_addStyle(
          "\n        #pinned-threads, #pinned-forums {\n          margin-bottom: 20px;\n        }\n        #pinned-threads .topiclist.topics, #pinned-forums .topiclist.forums {\n          margin-top: 0;\n        }\n        .pin-button {\n          margin-left: 10px;\n          cursor: pointer;\n        }\n        #pinned-threads .topic-poster .by, #pinned-forums .forum-poster .by {\n          display: none;\n        }\n        .zomboid-status {\n          margin-top: 5px;\n          font-size: 0.9em;\n          text-align: left;\n          color: #8c8c8c;\n        }\n        .zomboid-status .online-players {\n          font-weight: bold;\n          color: #BFC0C5;\n        }\n        .zomboid-status .last-updated {\n          font-size: 0.8em;\n          font-style: italic;\n        }\n        #pinned-threads .pagination, #pinned-forums .pagination {\n          display: none !important;\n        }\n        .forum-path {\n          font-size: 0.9em;\n          color: #8c8c8c;\n        }\n        @media (max-width: 700px) {\n          #pinned-threads .responsive-show, #pinned-forums .responsive-show {\n            display: none !important;\n          }\n          #pinned-threads .responsive-hide, #pinned-forums .responsive-hide {\n            display: none !important;\n          }\n        }\n      "
        );
      }
      function createDropdownContainer() {
        const container = document.createElement("div");
        return (
          (container.className =
            "dropdown-container dropdown-button-control topic-tools"),
          container
        );
      }
      function updatePinButtonState(button, isPinned) {
        (button.innerHTML = isPinned
          ? '<i class="icon fa-thumb-tack fa-fw" aria-hidden="true"></i><span>Unpin</span>'
          : '<i class="icon fa-thumb-tack fa-fw" aria-hidden="true"></i><span>Pin</span>'),
          (button.title = isPinned ? "Unpin" : "Pin");
      }
      updateMenuCommand(),
        // Main execution
        window.location.href.includes("/viewtopic.php")
          ? // Thread pinning functions
            (function () {
              const actionBar = document.querySelector(".action-bar.bar-top"),
                threadId = util_getThreadId();
              if (
                actionBar &&
                threadId &&
                !document.getElementById("pin-thread-button")
              ) {
                const dropdownContainer = createDropdownContainer(),
                  pinButton = (function (threadId) {
                    const button = document.createElement("span");
                    (button.id = "pin-thread-button"),
                      (button.className =
                        "button button-secondary dropdown-trigger");
                    const isPinned =
                      util_getPinnedThreads().hasOwnProperty(threadId);
                    return (
                      updatePinButtonState(button, isPinned),
                      button.addEventListener("click", (e) => {
                        e.preventDefault(), togglePinThread(threadId, button);
                      }),
                      button
                    );
                  })(
                    // Forum pinning functions
                    threadId
                  );
                dropdownContainer.appendChild(pinButton),
                  actionBar.insertBefore(
                    dropdownContainer,
                    actionBar.firstChild
                  ),
                  addResponsiveStyle();
              }
            })()
          : window.location.href.includes("/viewforum.php")
            ? (function () {
                const actionBar = document.querySelector(".action-bar.bar-top"),
                  forumId = util_getForumId(),
                  forumName = util_getForumName();
                if (
                  actionBar &&
                  forumId &&
                  forumName &&
                  !document.getElementById("pin-forum-button")
                ) {
                  const dropdownContainer = createDropdownContainer(),
                    pinButton = (function (forumId) {
                      const button = document.createElement("span");
                      (button.id = "pin-forum-button"),
                        (button.className =
                          "button button-secondary dropdown-trigger");
                      const isPinned =
                        util_getPinnedForums().hasOwnProperty(forumId);
                      return (
                        updatePinButtonState(button, isPinned),
                        button.addEventListener("click", (e) => {
                          e.preventDefault(),
                            (function (forumId, button) {
                              const pinnedForums = util_getPinnedForums(),
                                forumInfo = (function () {
                                  const forumName = util_getForumName(),
                                    breadcrumbs =
                                      document.querySelectorAll(".crumb"),
                                    breadcrumbsPath = Array.from(breadcrumbs)
                                      .filter((crumb) =>
                                        crumb.querySelector("a")
                                      )
                                      .map((crumb) =>
                                        crumb
                                          .querySelector("a")
                                          .textContent.trim()
                                      )
                                      .join(" » ");
                                  return {
                                    name: forumName,
                                    breadcrumbs: breadcrumbsPath,
                                    url: window.location.href.split(
                                      "&start="
                                    )[0],
                                  };
                                })();
                              pinnedForums.hasOwnProperty(forumId)
                                ? delete pinnedForums[forumId]
                                : (pinnedForums[forumId] = forumInfo);
                              util_setPinnedForums(pinnedForums),
                                updatePinButtonState(
                                  button,
                                  pinnedForums.hasOwnProperty(forumId)
                                );
                            })(forumId, button);
                        }),
                        button
                      );
                    })(forumId);
                  dropdownContainer.appendChild(pinButton),
                    // Add the pin button at the start of the action bar
                    actionBar.insertBefore(
                      dropdownContainer,
                      actionBar.firstChild
                    ),
                    addResponsiveStyle();
                }
              })()
            : (window.location.href.includes("/index.php") ||
                window.location.href.endsWith("/forums/") ||
                window.location.href.includes("/forums/home") ||
                (window.location.href.includes(
                  "/search.php?search_id=newposts"
                ) &&
                  util_getShowOnNewPosts())) &&
              (async function () {
                const pageBody = document.querySelector("#page-body");
                if (!pageBody) return;
                const pinnedThreads = util_getPinnedThreads(),
                  pinnedForums = util_getPinnedForums();
                // If there's nothing to display, exit early
                if (
                  0 === Object.keys(pinnedThreads).length &&
                  0 === Object.keys(pinnedForums).length
                )
                  return;
                // Determine the correct insertion point based on the current page
                let insertionPoint;
                insertionPoint = window.location.href.includes("/search.php")
                  ? (function (pageBody) {
                      const actionBar = pageBody.querySelector(
                        ".action-bar.bar-top"
                      );
                      return actionBar
                        ? actionBar.nextElementSibling
                        : pageBody.querySelector(".forumbg");
                    })(pageBody)
                  : pageBody.querySelector(".index-left") ||
                    pageBody.querySelector(".forumbg");
                if (insertionPoint) {
                  // Create and insert pinned sections if needed
                  if (Object.keys(pinnedForums).length > 0) {
                    const pinnedForumsSection = (function () {
                      const section = document.createElement("div");
                      return (
                        (section.id = "pinned-forums"),
                        (section.className = "forabg"),
                        (section.innerHTML =
                          '\n        <div class="inner">\n          <ul class="topiclist content-processed">\n            <li class="header">\n              <dl class="row-item">\n                <dt><div class="list-inner"><i class="icon fa-thumb-tack fa-fw icon-sm" aria-hidden="true"></i> Pinned Forums</div></dt>\n                <dd class="posts">Topics</dd>\n                <dd class="views">Posts</dd>\n              </dl>\n            </li>\n          </ul>\n          <ul class="topiclist forums content-processed" id="pinned-forums-list"></ul>\n        </div>\n      '),
                        section
                      );
                    })();
                    // Insert the pinned forums section
                    insertionPoint.classList.contains("index-left")
                      ? insertionPoint.insertAdjacentElement(
                          "afterbegin",
                          pinnedForumsSection
                        )
                      : insertionPoint.parentNode.insertBefore(
                          pinnedForumsSection,
                          insertionPoint
                        ),
                      (function (pinnedSection) {
                        const pinnedForums = util_getPinnedForums(),
                          pinnedList = pinnedSection.querySelector(
                            "#pinned-forums-list"
                          );
                        // Add each forum to the list
                        Object.entries(pinnedForums)
                          .sort(([, a], [, b]) =>
                            a.name.localeCompare(b.name, void 0, {
                              numeric: !0,
                              sensitivity: "base",
                            })
                          )
                          .forEach(([forumId, forumInfo]) => {
                            // First try to find the forum row on the page
                            const existingRow = (function (forumId) {
                              // Look for forum rows on the current page
                              const forumRows = document.querySelectorAll(
                                ".topiclist.forums .row"
                              );
                              for (const row of forumRows) {
                                const forumLink =
                                  row.querySelector("a.forumtitle");
                                if (
                                  forumLink &&
                                  forumLink.href.includes(`f=${forumId}`)
                                )
                                  return row;
                              }
                              // If not found in main forums, look for it in subforums
                              const subforums =
                                document.querySelectorAll("a.subforum");
                              for (const subforum of subforums)
                                if (subforum.href.includes(`f=${forumId}`)) {
                                  // Create a synthetic row based on the subforum link
                                  const isUnread =
                                      subforum.classList.contains("unread"),
                                    forumName = subforum.textContent.trim();
                                  // Find the parent forum name
                                  let parentForumName = "Unknown Forum";
                                  const forumtitle = subforum
                                    .closest(".row")
                                    ?.querySelector("a.forumtitle");
                                  forumtitle &&
                                    (parentForumName =
                                      forumtitle.textContent.trim());
                                  const row = document.createElement("div");
                                  return (
                                    (row.dataset.isSubforum = "true"),
                                    (row.dataset.isUnread = isUnread),
                                    (row.dataset.forumName = forumName),
                                    (row.dataset.forumUrl = subforum.href),
                                    (row.dataset.parentForumName =
                                      parentForumName),
                                    row
                                  );
                                }
                              return null;
                            })(forumId);
                            if (existingRow)
                              if (
                                existingRow.dataset &&
                                existingRow.dataset.isSubforum
                              ) {
                                // This is a synthetic row from a subforum link
                                const isUnread =
                                  "true" === existingRow.dataset.isUnread;
                                (forumInfo.isUnread = isUnread),
                                  // Add parent forum name to the forum info
                                  existingRow.dataset.parentForumName &&
                                    (forumInfo.parentForumName =
                                      existingRow.dataset.parentForumName);
                                const html = createForumListItemHTML(
                                  forumId,
                                  forumInfo
                                );
                                pinnedList.insertAdjacentHTML(
                                  "beforeend",
                                  html
                                );
                              } else {
                                // This is a regular forum row
                                const clonedRow = existingRow.cloneNode(!0);
                                clonedRow.id = `pinned-forum-${forumId}`;
                                // Check if this forum is unread
                                const dlElement = clonedRow.querySelector("dl");
                                (dlElement &&
                                  (dlElement.classList.contains(
                                    "forum_unread"
                                  ) ||
                                    dlElement.classList.contains(
                                      "forum_unread_subforum"
                                    ) ||
                                    dlElement.classList.contains(
                                      "forum_unread_locked"
                                    ))) ||
                                  // Make sure we use the read class
                                  (dlElement &&
                                    (dlElement.className =
                                      dlElement.className.replace(
                                        /forum_\w+/g,
                                        "forum_read"
                                      ))),
                                  clonedRow
                                    .querySelectorAll("strong")
                                    .forEach((section) => {
                                      if (
                                        section.textContent.includes(
                                          "Subforums:"
                                        )
                                      ) {
                                        // Remove the "Subforums:" text
                                        section.remove();
                                        // Find and remove all subforum links that follow
                                        const listInner =
                                          clonedRow.querySelector(
                                            ".list-inner"
                                          );
                                        listInner &&
                                          listInner
                                            .querySelectorAll("a.subforum")
                                            .forEach((link) => {
                                              link.remove();
                                            });
                                      }
                                    });
                                // Remove subforum sections and clean up commas
                                // Remove any text nodes that might contain "Subforums:" text or stray commas
                                const listInner =
                                  clonedRow.querySelector(".list-inner");
                                if (listInner) {
                                  const walker = document.createTreeWalker(
                                      listInner,
                                      NodeFilter.SHOW_TEXT
                                    ),
                                    textNodesToProcess = [];
                                  for (; walker.nextNode(); ) {
                                    const textNode = walker.currentNode;
                                    (textNode.textContent.includes(
                                      "Subforums:"
                                    ) ||
                                      /^\s*,\s*$/.test(textNode.textContent)) &&
                                      textNodesToProcess.push(textNode);
                                  }
                                  textNodesToProcess.forEach((node) => {
                                    // If it's just commas and whitespace, remove it entirely
                                    /^\s*[,\s]*\s*$/.test(node.textContent)
                                      ? node.remove()
                                      : // Otherwise, clean up any trailing commas
                                        (node.textContent = node.textContent
                                          .replace(/\s*,\s*,\s*/g, "")
                                          .trim());
                                  });
                                }
                                // Remove any unwanted elements or classes
                                clonedRow
                                  .querySelectorAll(".pagination")
                                  .forEach((el) => el.remove()),
                                  clonedRow.classList.add("content-processed"),
                                  pinnedList.appendChild(clonedRow);
                              }
                            else
                              // If not found, create a new row
                              pinnedList.insertAdjacentHTML(
                                "beforeend",
                                createForumListItemHTML(forumId, forumInfo)
                              );
                          });
                      })(pinnedForumsSection);
                  }
                  if (Object.keys(pinnedThreads).length > 0) {
                    const pinnedThreadsSection = (function () {
                      const section = document.createElement("div");
                      return (
                        (section.id = "pinned-threads"),
                        (section.className = "forabg"),
                        (section.innerHTML =
                          '\n        <div class="inner">\n          <ul class="topiclist content-processed">\n            <li class="header">\n              <dl class="row-item">\n                <dt><div class="list-inner"><i class="icon fa-thumb-tack fa-fw icon-sm" aria-hidden="true"></i> Pinned Topics</div></dt>\n                <dd class="posts">Replies</dd>\n                <dd class="views">Views</dd>\n                <dd class="lastpost">Last Post</dd>\n              </dl>\n            </li>\n          </ul>\n          <ul class="topiclist topics content-processed" id="pinned-threads-list"></ul>\n        </div>\n      '),
                        section
                      );
                    })();
                    // Insert the pinned threads section
                    if (insertionPoint.classList.contains("index-left"))
                      insertionPoint.insertAdjacentElement(
                        "afterbegin",
                        pinnedThreadsSection
                      );
                    else if (Object.keys(pinnedForums).length > 0) {
                      // If we already have pinned forums, insert after that section
                      const pinnedForumsSection =
                        document.getElementById("pinned-forums");
                      pinnedForumsSection
                        ? pinnedForumsSection.insertAdjacentElement(
                            "afterend",
                            pinnedThreadsSection
                          )
                        : insertionPoint.parentNode.insertBefore(
                            pinnedThreadsSection,
                            insertionPoint
                          );
                    } else
                      insertionPoint.parentNode.insertBefore(
                        pinnedThreadsSection,
                        insertionPoint
                      );
                    await (async function (pinnedSection) {
                      const pinnedThreads = util_getPinnedThreads(),
                        pinnedList = pinnedSection.querySelector(
                          "#pinned-threads-list"
                        ),
                        threadIds = Object.keys(pinnedThreads),
                        existingThreadRows = (function (threadIds) {
                          const result = new Map(),
                            threadRowsOnPage = document.querySelectorAll(
                              ".topiclist.topics .row"
                            );
                          for (const row of threadRowsOnPage) {
                            const threadLink =
                              row.querySelector("a.topictitle");
                            if (threadLink)
                              for (const threadId of threadIds)
                                if (threadLink.href.includes(`t=${threadId}`)) {
                                  result.set(threadId, row);
                                  break;
                                }
                          }
                          return result;
                        })(threadIds),
                        threadsToFetch = threadIds.filter(
                          (id) => !existingThreadRows.has(id)
                        );
                      // Create loading placeholders for threads we need to fetch
                      threadsToFetch.forEach((threadId) => {
                        pinnedList.insertAdjacentHTML(
                          "beforeend",
                          (function (threadId) {
                            return `\n        <li class="row bg1 content-processed" id="pinned-thread-${threadId}">\n          <dl class="row-item topic_read">\n            <dt>\n              <div class="list-inner">\n                <span class="topic-title">\n                  <i class="fa fa-spinner fa-spin"></i> Loading...\n                </span>\n              </div>\n            </dt>\n            <dd class="posts">-</dd>\n            <dd class="views">-</dd>\n            <dd class="lastpost"><span style="padding-left: 2.75em;">-</span></dd>\n          </dl>\n        </li>\n      `;
                          })(threadId)
                        );
                      });
                      // Set up Intersection Observer
                      let isVisible = !1;
                      const observer = new IntersectionObserver(
                        (entries) => {
                          isVisible = entries[0].isIntersecting;
                        },
                        {
                          threshold: 0.1,
                        }
                      );
                      observer.observe(pinnedSection);
                      // Store the initial height
                      const initialHeight = pinnedSection.offsetHeight;
                      // Add existing thread rows first
                      for (const [
                        threadId,
                        row,
                      ] of existingThreadRows.entries()) {
                        const clonedRow = row.cloneNode(!0);
                        (clonedRow.id = `pinned-thread-${threadId}`),
                          // Remove any unwanted elements or classes
                          clonedRow
                            .querySelectorAll(".pagination")
                            .forEach((el) => el.remove()),
                          clonedRow.classList.add("content-processed");
                        // Find the placeholder if it exists and replace it, or just append
                        const placeholder = pinnedList.querySelector(
                          `#pinned-thread-${threadId}`
                        );
                        placeholder
                          ? pinnedList.replaceChild(clonedRow, placeholder)
                          : pinnedList.appendChild(clonedRow);
                      }
                      // Fetch and process threads that don't exist on the page
                      if (threadsToFetch.length > 0) {
                        const threadsData = await Promise.all(
                          threadsToFetch.map((threadId) =>
                            (async function (threadId) {
                              try {
                                const {
                                  title: title,
                                  forumUrl: forumUrl,
                                  forumName: forumName,
                                  status: status,
                                } = await (async function (threadId) {
                                  const url = `https://rpghq.org/forums/viewtopic.php?t=${threadId}`,
                                    html = await util_fetchHtml(url),
                                    doc = util_parseHtml(html),
                                    titleElement =
                                      doc.querySelector("h2.topic-title a"),
                                    breadcrumbs = doc.querySelectorAll(
                                      "#nav-breadcrumbs .crumb"
                                    ),
                                    lastBreadcrumb =
                                      breadcrumbs[breadcrumbs.length - 1];
                                  if (!titleElement || !lastBreadcrumb)
                                    throw new Error(
                                      "Thread title or forum not found"
                                    );
                                  const title = titleElement.textContent.trim(),
                                    forumUrl =
                                      lastBreadcrumb.querySelector("a").href,
                                    forumName = lastBreadcrumb
                                      .querySelector("a")
                                      .textContent.trim();
                                  let status = null;
                                  return (
                                    "2756" === threadId &&
                                      (status = (function (doc) {
                                        const playerCountElement =
                                          doc.querySelector(
                                            'span[style="background-color:black"] strong.text-strong'
                                          );
                                        if (playerCountElement) {
                                          const statusDiv =
                                              playerCountElement.closest("div"),
                                            onlinePlayersElements =
                                              statusDiv.querySelectorAll(
                                                'span[style="font-size:85%;line-height:116%"]'
                                              ),
                                            lastUpdatedElement =
                                              statusDiv.querySelector(
                                                'span[style="font-size:55%;line-height:116%"] em'
                                              );
                                          if (
                                            playerCountElement &&
                                            lastUpdatedElement
                                          )
                                            return {
                                              playerCount:
                                                playerCountElement.textContent,
                                              onlinePlayers: Array.from(
                                                onlinePlayersElements
                                              ).map((el) => el.textContent),
                                              lastUpdated:
                                                lastUpdatedElement.textContent,
                                            };
                                        }
                                        return null;
                                      })(doc)),
                                    {
                                      title: title,
                                      forumUrl: forumUrl,
                                      forumName: forumName,
                                      status: status,
                                    }
                                  );
                                })(threadId);
                                let rowHTML = await fetchThreadRowFromForum(
                                  title,
                                  forumUrl
                                );
                                if (rowHTML) {
                                  rowHTML = (function (
                                    rowHTML,
                                    threadId,
                                    status,
                                    forumName,
                                    forumUrl
                                  ) {
                                    const row = new DOMParser()
                                      .parseFromString(rowHTML, "text/html")
                                      .querySelector(".row");
                                    if (!row) return rowHTML;
                                    // Add content-processed class if it's not already there
                                    row.classList.contains(
                                      "content-processed"
                                    ) || row.classList.add("content-processed"),
                                      // Change "sticky_" classes to "topic_"
                                      row
                                        .querySelectorAll('*[class*="sticky_"]')
                                        .forEach((element) => {
                                          element.className =
                                            element.className.replace(
                                              /\bsticky_/g,
                                              "topic_"
                                            );
                                        });
                                    // Remove pagination
                                    const pagination =
                                      row.querySelector(".pagination");
                                    pagination &&
                                      (pagination.style.display = "none"),
                                      row
                                        .querySelectorAll(".rh_tag")
                                        .forEach((tag) => tag.remove());
                                    // Remove rh_tag elements
                                    // Check if the thread is unread
                                    const dlElement = row.querySelector("dl"),
                                      isUnread =
                                        dlElement &&
                                        (dlElement.classList.contains(
                                          "topic_unread"
                                        ) ||
                                          dlElement.classList.contains(
                                            "topic_unread_hot"
                                          ) ||
                                          dlElement.classList.contains(
                                            "topic_unread_mine"
                                          ) ||
                                          dlElement.classList.contains(
                                            "topic_unread_hot_mine"
                                          )),
                                      iconElement =
                                        row.querySelector(".icon.fa-file");
                                    iconElement &&
                                      (iconElement.classList.remove(
                                        "icon-lightgray",
                                        "icon-red"
                                      ),
                                      iconElement.classList.add(
                                        isUnread ? "icon-red" : "icon-lightgray"
                                      ));
                                    // Modify the topic hyperlink
                                    const topicLink =
                                      row.querySelector(".topictitle");
                                    if (topicLink) {
                                      const dlElement = row.querySelector("dl");
                                      if (
                                        !dlElement ||
                                        !(
                                          dlElement.classList.contains(
                                            "topic_unread"
                                          ) ||
                                          dlElement.classList.contains(
                                            "topic_unread_hot"
                                          ) ||
                                          dlElement.classList.contains(
                                            "topic_unread_mine"
                                          ) ||
                                          dlElement.classList.contains(
                                            "topic_unread_hot_mine"
                                          )
                                        )
                                      ) {
                                        const currentHref =
                                          topicLink.getAttribute("href");
                                        topicLink.setAttribute(
                                          "href",
                                          `${currentHref}&view=unread`
                                        );
                                      }
                                    }
                                    // Add forum section information
                                    const leftBox = row.querySelector(
                                      ".responsive-hide.left-box"
                                    );
                                    if (leftBox) {
                                      const lastTimeElement =
                                        leftBox.querySelector("time");
                                      if (lastTimeElement) {
                                        const forumLink =
                                          document.createElement("a");
                                        (forumLink.href = forumUrl),
                                          (forumLink.textContent = forumName),
                                          document.createTextNode("  » in "),
                                          lastTimeElement.insertAdjacentElement(
                                            "afterend",
                                            forumLink
                                          ),
                                          lastTimeElement.insertAdjacentText(
                                            "afterend",
                                            "  » in "
                                          );
                                      }
                                    }
                                    // Add id to the row for easier manipulation later if needed
                                    return (
                                      (row.id = `pinned-thread-${threadId}`),
                                      row.outerHTML
                                    );
                                  })(rowHTML, threadId, 0, forumName, forumUrl);
                                  const sortableTitle = title.replace(
                                    /^[【】\[\]\s]+/,
                                    ""
                                  );
                                  return {
                                    threadId: threadId,
                                    title: title,
                                    sortableTitle: sortableTitle,
                                    rowHTML: rowHTML,
                                  };
                                }
                                {
                                  // Create a custom row HTML for threads that can't be found in the forum list
                                  rowHTML = createCustomThreadRowHTML(
                                    threadId,
                                    title,
                                    forumName,
                                    forumUrl,
                                    "Thread not found in forum list"
                                  );
                                  const sortableTitle = title.replace(
                                    /^[【】\[\]\s]+/,
                                    ""
                                  );
                                  return {
                                    threadId: threadId,
                                    title: title,
                                    sortableTitle: sortableTitle,
                                    rowHTML: rowHTML,
                                  };
                                }
                              } catch (error) {
                                return {
                                  threadId: threadId,
                                  title: `Error loading thread ${threadId}`,
                                  sortableTitle: `Error loading thread ${threadId}`,
                                  rowHTML: createCustomThreadRowHTML(
                                    threadId,
                                    `Error loading thread ${threadId}`,
                                    "",
                                    "",
                                    `Error: ${error.message || "Unknown error"}`
                                  ),
                                };
                              }
                            })(threadId, pinnedThreads[threadId]).catch(
                              (error) => ({
                                threadId: threadId,
                                title: `Error loading thread ${threadId}`,
                                sortableTitle: `error loading thread ${threadId}`,
                                rowHTML: createErrorListItemHTML(threadId),
                              })
                            )
                          )
                        );
                        // Sort threads
                        threadsData.sort((a, b) =>
                          a.title.localeCompare(b.title, void 0, {
                            numeric: !0,
                            sensitivity: "base",
                            ignorePunctuation: !1,
                          })
                        ),
                          // Update the list with sorted threads
                          threadsData.forEach((threadData) => {
                            const placeholder = pinnedList.querySelector(
                              `#pinned-thread-${threadData.threadId}`
                            );
                            placeholder
                              ? (placeholder.outerHTML = threadData.rowHTML)
                              : pinnedList.insertAdjacentHTML(
                                  "beforeend",
                                  threadData.rowHTML
                                );
                          });
                      }
                      // Sort all thread rows now that we have all of them
                      const allRows = Array.from(pinnedList.children);
                      allRows.sort((a, b) => {
                        const aTitle =
                            a.querySelector(".topictitle")?.textContent || "",
                          bTitle =
                            b.querySelector(".topictitle")?.textContent || "";
                        return aTitle.localeCompare(bTitle, void 0, {
                          numeric: !0,
                          sensitivity: "base",
                          ignorePunctuation: !1,
                        });
                      }),
                        // Re-append in sorted order
                        allRows.forEach((row) => pinnedList.appendChild(row));
                      // Adjust scroll position if necessary
                      const heightDifference =
                        pinnedSection.offsetHeight - initialHeight;
                      !isVisible &&
                        heightDifference > 0 &&
                        window.scrollBy(0, heightDifference),
                        // Clean up the observer
                        observer.disconnect();
                    })(pinnedThreadsSection);
                  }
                }
              })();
    },
  });
  // RPGHQ - Notification Improver
  /**
   * Adds smileys to reacted notifs, adds colors, idk just makes em cooler I guess
   * Original script by loregamer, adapted for the RPGHQ Userscript Manager.
   * License: MIT
   *
   * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/notifications.md for documentation
   */ var notifications = Object.freeze({
    __proto__: null,
    init: function () {
      const REFERENCE_STYLE = {
          display: "inline-block",
          background: "rgba(23, 27, 36, 0.5)",
          color: "#ffffff",
          padding: "2px 4px",
          borderRadius: "2px",
          zIndex: "-1",
          maxWidth: "98%",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        },
        NOTIFICATION_BLOCK_STYLE = {
          position: "relative",
          paddingBottom: "20px",
        },
        NOTIFICATION_TIME_STYLE = {
          position: "absolute",
          bottom: "2px",
          right: "2px",
          fontSize: "0.85em",
          color: "#888",
        },
        NOTIFICATIONS_TIME_STYLE = {
          position: "absolute",
          bottom: "2px",
          left: "2px",
          fontSize: "0.85em",
          color: "#888",
        },
        Utils = {
          createElement: (tag, attributes = {}, innerHTML = "") => {
            const element = document.createElement(tag);
            return (
              Object.assign(element, attributes),
              (element.innerHTML = innerHTML),
              element
            );
          },
          formatReactions: (reactions) =>
            `<span style="display: inline-flex; margin-left: 2px; vertical-align: middle;">\n          ${reactions.map((reaction) => `\n            <img src="${reaction.image}" alt="${reaction.name}" title="${reaction.username}: ${reaction.name}" \n                 reaction-username="${reaction.username}"\n                 style="height: 1em !important; width: auto !important; vertical-align: middle !important; margin-right: 2px !important;">\n          `).join("")}\n        </span>`,
          styleReference: (element) => {
            Object.assign(element.style, REFERENCE_STYLE);
          },
          extractPostId: (url) => {
            const match = (url || "").match(/p=(\d+)/);
            return match ? match[1] : null;
          },
          sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
          cleanupPostContent: (content) => {
            // 2. Remove ONLY the first occurrence of an opening quote tag.
            const firstOpenIdx =
              // 1. Normalize any [quote="..."] tags to [quote=...]
              (content = content.replace(
                /\[quote="([^"]+)"\]/g,
                "[quote=$1]"
              )).indexOf("[quote=");
            if (-1 !== firstOpenIdx) {
              const firstCloseBracket = content.indexOf("]", firstOpenIdx);
              -1 !== firstCloseBracket &&
                // Remove the tag from [quote= ... ]
                (content =
                  content.slice(0, firstOpenIdx) +
                  content.slice(firstCloseBracket + 1));
            }
            // 3. Remove ONLY the last occurrence of a closing quote tag.
            const lastCloseIdx = content.lastIndexOf("[/quote]");
            return (
              -1 !== lastCloseIdx &&
                // Remove that closing tag (8 characters long).
                (content =
                  content.slice(0, lastCloseIdx) +
                  content.slice(lastCloseIdx + 8)),
              // 4. Aggressively remove any inner quote blocks.
              (content = Utils.aggressiveRemoveInnerQuotes(content)).trim()
            );
          },
          aggressiveRemoveInnerQuotes: (text) => {
            let result = "",
              i = 0,
              depth = 0;
            for (; i < text.length; )
              // Check for an opening quote tag.
              if (text.startsWith("[quote=", i)) {
                depth++;
                const endBracket = text.indexOf("]", i);
                if (-1 === endBracket)
                  // Malformed tag; break out.
                  break;
                i = endBracket + 1;
              }
              // Check for a closing quote tag.
              else
                text.startsWith("[/quote]", i)
                  ? (depth > 0 && depth--, (i += 8))
                  : // Only append characters that are NOT inside a quote block.
                    (0 === depth && (result += text[i]), i++);
            return result;
          },
          removeBBCode: (text) =>
            text
              .replace(/\[color=[^\]]*\](.*?)\[\/color\]/gi, "$1")
              .replace(/\[size=[^\]]*\](.*?)\[\/size\]/gi, "$1")
              .replace(/\[b\](.*?)\[\/b\]/gi, "$1")
              .replace(/\[i\](.*?)\[\/i\]/gi, "$1")
              .replace(/\[u\](.*?)\[\/u\]/gi, "$1")
              .replace(/\[s\](.*?)\[\/s\]/gi, "$1")
              .replace(/\[url=[^\]]*\](.*?)\[\/url\]/gi, "$1")
              .replace(/\[url\](.*?)\[\/url\]/gi, "$1")
              .replace(/\[img\s+[^=\]]+=[^\]]+\](.*?)\[\/img\]/gi, "")
              .replace(/\[img\](.*?)\[\/img\]/gi, "")
              .replace(/\[media\](.*?)\[\/media\]/gi, "")
              .replace(/\[webm\](.*?)\[\/webm\]/gi, "")
              .replace(/\[code\](.*?)\[\/code\]/gi, "$1")
              .replace(/\[list\](.*?)\[\/list\]/gi, "$1")
              .replace(/\[\*\]/gi, "")
              .replace(/\[quote(?:=[^\]]*?)?\](.*?)\[\/quote\]/gi, "")
              .replace(/\[[^\]]*\]/g, "")
              .replace(/\s+/g, " ")
              .trim(),
          removeURLs: (text) =>
            text
              .replace(/(?:https?|ftp):\/\/[\n\S]+/gi, "")
              .replace(/www\.[^\s]+/gi, "")
              .replace(/\s+/g, " ")
              .trim(),
          extractSingleImageUrl: (text) => {
            console.log("Extracting image URL from text:", text);
            // If the entire text is just an image tag, extract it
            const trimmedText = text.trim();
            // Handle standard [img]url[/img] format
            if (
              (console.log("Trimmed text:", trimmedText),
              trimmedText.startsWith("[img]") && trimmedText.endsWith("[/img]"))
            ) {
              console.log("Text is a single image tag");
              const url = trimmedText.slice(5, -6).trim();
              return console.log("Extracted URL:", url), url;
            }
            // Handle [img size=X]url[/img] format with parameters
            const paramImgMatch = trimmedText.match(
              /^\[img\s+([^=\]]+)=([^\]]+)\](.*?)\[\/img\]$/i
            );
            if (paramImgMatch) {
              console.log("Text is a single image tag with parameters");
              const url = paramImgMatch[3].trim();
              return console.log("Extracted URL:", url), url;
            }
            // Find all image tags (both with and without parameters)
            const imageUrls = text.match(
              /\[img(?:\s+[^=\]]+=[^\]]+)?\](.*?)\[\/img\]/gi
            );
            if (
              (console.log("Found image tags:", imageUrls),
              imageUrls && imageUrls.length > 0)
            ) {
              console.log("Using first image tag");
              // Extract URL from the first image tag, handling both formats
              const firstTag = imageUrls[0];
              let url;
              // Standard format
              return (
                (url = firstTag.startsWith("[img]")
                  ? firstTag.replace(/\[img\](.*?)\[\/img\]/i, "$1").trim()
                  : firstTag
                      .replace(/\[img\s+[^=\]]+=[^\]]+\](.*?)\[\/img\]/i, "$1")
                      .trim()),
                console.log("Extracted URL:", url),
                url
              );
            }
            return console.log("No valid image URL found"), null;
          },
          extractVideoUrl: (text) => {
            console.log("Extracting video URL from text:", text);
            const trimmedText = text.trim();
            // Handle [webm] tags
            if (
              trimmedText.startsWith("[webm]") &&
              trimmedText.endsWith("[/webm]")
            ) {
              console.log("Text is a single webm tag");
              const url = trimmedText.slice(6, -7).trim();
              return (
                console.log("Extracted webm URL:", url),
                {
                  url: url,
                  type: "webm",
                }
              );
            }
            // Handle [media] tags
            if (
              trimmedText.startsWith("[media]") &&
              trimmedText.endsWith("[/media]")
            ) {
              console.log("Text is a single media tag");
              const url = trimmedText.slice(7, -8).trim();
              return (
                console.log("Extracted media URL:", url),
                {
                  url: url,
                  type: "media",
                }
              );
            }
            // Find all video tags
            const webmMatch = text.match(/\[webm\](.*?)\[\/webm\]/i);
            if (webmMatch)
              return (
                console.log("Found webm tag"),
                {
                  url: webmMatch[1].trim(),
                  type: "webm",
                }
              );
            const mediaMatch = text.match(/\[media\](.*?)\[\/media\]/i);
            return mediaMatch
              ? (console.log("Found media tag"),
                {
                  url: mediaMatch[1].trim(),
                  type: "media",
                })
              : (console.log("No valid video URL found"), null);
          },
        },
        Storage_getStoredReactions = (postId) => {
          const storedData = GM_getValue(`reactions_${postId}`);
          if (storedData) {
            const { reactions: reactions, timestamp: timestamp } =
              JSON.parse(storedData);
            if (Date.now() - timestamp < 864e5) return reactions;
            GM_deleteValue(`reactions_${postId}`);
          }
          return null;
        },
        Storage_storeReactions = (postId, reactions) => {
          GM_setValue(
            `reactions_${postId}`,
            JSON.stringify({
              reactions: reactions,
              timestamp: Date.now(),
            })
          );
        },
        Storage_getStoredPostContent = (postId) => {
          const storedData = GM_getValue(`post_content_${postId}`);
          if (storedData) {
            const { content: content, timestamp: timestamp } =
              JSON.parse(storedData);
            if (Date.now() - timestamp < 864e5) return content;
            GM_deleteValue(`post_content_${postId}`);
          }
          return null;
        },
        Storage_storePostContent = (postId, content) => {
          GM_setValue(
            `post_content_${postId}`,
            JSON.stringify({
              content: content,
              timestamp: Date.now(),
            })
          );
        },
        Storage_cleanupStorage = () => {
          const lastCleanup = GM_getValue("last_storage_cleanup", 0),
            now = Date.now();
          // Only cleanup if it's been more than 24 hours since last cleanup
          if (now - lastCleanup >= 864e5) {
            (GM_listValues ? GM_listValues() : []).forEach((key) => {
              if ("last_storage_cleanup" === key) return;
              const data = GM_getValue(key);
              if (data)
                try {
                  const parsed = JSON.parse(data);
                  parsed.timestamp &&
                    now - parsed.timestamp >= 864e5 &&
                    GM_deleteValue(key);
                } catch (e) {
                  // If we can't parse the data, it's probably corrupted, so delete it
                  GM_deleteValue(key);
                }
            }),
              // Update last cleanup timestamp
              GM_setValue("last_storage_cleanup", now);
          }
        },
        ReactionHandler_fetchReactions = async (postId, isUnread) => {
          if (!isUnread) {
            const storedReactions = Storage_getStoredReactions(postId);
            if (storedReactions) return storedReactions;
          }
          try {
            const response = await fetch(
                `https://rpghq.org/forums/reactions?mode=view&post=${postId}`,
                {
                  method: "POST",
                  headers: {
                    accept: "application/json, text/javascript, */*; q=0.01",
                    "x-requested-with": "XMLHttpRequest",
                  },
                  credentials: "include",
                }
              ),
              data = await response.json(),
              doc = new DOMParser().parseFromString(
                data.htmlContent,
                "text/html"
              ),
              reactions = Array.from(
                doc.querySelectorAll('.tab-content[data-id="0"] li')
              ).map((li) => ({
                username: li.querySelector(".cbb-helper-text a").textContent,
                image: li.querySelector(".reaction-image").src,
                name: li.querySelector(".reaction-image").alt,
              }));
            return Storage_storeReactions(postId, reactions), reactions;
          } catch (error) {
            return console.error("Error fetching reactions:", error), [];
          }
        },
        ReactionHandler_fetchPostContent = async (postId) => {
          const cachedContent = Storage_getStoredPostContent(postId);
          if (cachedContent) return cachedContent;
          try {
            const response = await fetch(
              `https://rpghq.org/forums/posting.php?mode=quote&p=${postId}`,
              {
                headers: {
                  "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "include",
              }
            );
            if (!response.ok)
              throw new Error(`HTTP error! status: ${response.status}`);
            const text = await response.text(),
              tempDiv = document.createElement("div");
            tempDiv.innerHTML = text;
            const messageArea = tempDiv.querySelector("#message");
            if (!messageArea) throw new Error("Could not find message content");
            let content = Utils.cleanupPostContent(messageArea.value);
            return Storage_storePostContent(postId, content), content;
          } catch (error) {
            return console.error("Error fetching post content:", error), null;
          }
        },
        NotificationCustomizer = {
          async customizeReactionNotification(titleElement, block) {
            if ("true" === block.dataset.reactionCustomized) return;
            // Apply container styling to the block
            Object.assign(block.style, NOTIFICATION_BLOCK_STYLE);
            // Move time element to bottom right
            const timeElement = block.querySelector(".notification-time");
            timeElement &&
              Object.assign(timeElement.style, NOTIFICATION_TIME_STYLE);
            const titleText = titleElement.innerHTML,
              isUnread = block.href && block.href.includes("mark_notification"),
              postId = Utils.extractPostId(
                block.getAttribute("data-real-url") || block.href
              );
            if (!postId) return;
            const usernameElements = titleElement.querySelectorAll(
                ".username, .username-coloured"
              ),
              usernames = Array.from(usernameElements).map((el) =>
                el.textContent.trim()
              ),
              filteredReactions = (
                await ReactionHandler_fetchReactions(postId, isUnread)
              ).filter((reaction) => usernames.includes(reaction.username)),
              reactionHTML = Utils.formatReactions(filteredReactions);
            if (titleText.includes("reacted to a message you posted")) {
              titleElement.innerHTML = titleText.replace(
                /(have|has)\s+reacted.*$/,
                `<b style="color: #3889ED;">reacted</b> ${reactionHTML} to:`
              );
              const postContent =
                await ReactionHandler_fetchPostContent(postId);
              if (postContent) {
                const trimmedContent = postContent.trim();
                let referenceElement = block.querySelector(
                  ".notification-reference"
                );
                referenceElement ||
                  ((referenceElement = Utils.createElement("span", {
                    className: "notification-reference",
                  })),
                  Utils.styleReference(referenceElement),
                  titleElement.appendChild(document.createElement("br")),
                  titleElement.appendChild(referenceElement));
                // Always create the image/video preview div
                const mediaPreview = Utils.createElement("div", {
                  className: "notification-image-preview",
                });
                // Check for video content first - only if the entire content is just a video tag
                if (
                  (trimmedContent.startsWith("[webm]") &&
                    trimmedContent.endsWith("[/webm]")) ||
                  (trimmedContent.startsWith("[media]") &&
                    trimmedContent.endsWith("[/media]"))
                ) {
                  const videoData = Utils.extractVideoUrl(trimmedContent);
                  videoData &&
                    // Create video element for preview
                    ((mediaPreview.innerHTML = `<video src="${videoData.url}" style="max-width: 100px; max-height: 60px; border-radius: 3px; margin-top: 4px;" loop muted autoplay></video>`),
                    // If we have a video, remove any existing reference element and don't create a new one
                    referenceElement && referenceElement.remove(),
                    titleElement.appendChild(mediaPreview));
                }
                // If no video, check for image tag before any BBCode removal
                else if (
                  (trimmedContent.startsWith("[img]") &&
                    trimmedContent.endsWith("[/img]")) ||
                  trimmedContent.match(
                    /^\[img\s+[^=\]]+=[^\]]+\].*?\[\/img\]$/i
                  )
                ) {
                  let imageUrl;
                  if (trimmedContent.startsWith("[img]"))
                    // Standard format
                    imageUrl = trimmedContent.slice(5, -6).trim();
                  else {
                    imageUrl = trimmedContent
                      .match(/^\[img\s+[^=\]]+=[^\]]+\](.*?)\[\/img\]$/i)[1]
                      .trim();
                  }
                  (mediaPreview.innerHTML = `<img src="${imageUrl}" style="max-width: 100px; max-height: 60px; border-radius: 3px; margin-top: 4px;">`),
                    // If we have an image, remove any existing reference element and don't create a new one
                    referenceElement && referenceElement.remove(),
                    titleElement.appendChild(mediaPreview);
                } else
                  // Only create/update reference element if there's no image or video
                  referenceElement
                    ? ((referenceElement.textContent = Utils.removeURLs(
                        Utils.removeBBCode(postContent)
                      )),
                      Utils.styleReference(referenceElement),
                      referenceElement.insertAdjacentElement(
                        "afterend",
                        mediaPreview
                      ))
                    : ((referenceElement = Utils.createElement("span", {
                        className: "notification-reference",
                        textContent: Utils.removeURLs(
                          Utils.removeBBCode(postContent)
                        ),
                      })),
                      Utils.styleReference(referenceElement),
                      titleElement.appendChild(document.createElement("br")),
                      titleElement.appendChild(referenceElement),
                      referenceElement.insertAdjacentElement(
                        "afterend",
                        mediaPreview
                      ));
              }
            } else
              titleElement.innerHTML = titleText.replace(
                /(have|has)\s+reacted.*$/,
                `<b style="color: #3889ED;">reacted</b> ${reactionHTML}`
              );
            block.dataset.reactionCustomized = "true";
          },
          async customizeMentionNotification(notificationBlock) {
            // Apply container styling to the block
            Object.assign(notificationBlock.style, NOTIFICATION_BLOCK_STYLE);
            const notificationText =
                notificationBlock.querySelector(".notification_text"),
              titleElement = notificationText.querySelector(
                ".notification-title"
              ),
              originalHTML = titleElement.innerHTML,
              usernameElements = titleElement.querySelectorAll(
                ".username, .username-coloured"
              ),
              usernames = Array.from(usernameElements)
                .map((el) => el.outerHTML)
                .join(", "),
              parts = originalHTML.split("<br>in ");
            let topicName =
              parts.length > 1 ? parts[1].trim() : "Unknown Topic";
            titleElement.innerHTML = `\n          <b style="color: #FFC107;">Mentioned</b> by ${usernames} in <b>${topicName}</b>\n        `;
            // Create or update reference element for post content
            let referenceElement = notificationBlock.querySelector(
              ".notification-reference"
            );
            referenceElement ||
              ((referenceElement = Utils.createElement("span", {
                className: "notification-reference",
                textContent: "Loading...",
              })),
              Utils.styleReference(referenceElement),
              titleElement.appendChild(document.createElement("br")),
              titleElement.appendChild(referenceElement)),
              // Queue the content fetch
              this.queuePostContentFetch(
                notificationBlock.getAttribute("data-real-url") ||
                  notificationBlock.href,
                referenceElement
              );
            // Move time element to bottom right
            const timeElement =
              notificationText.querySelector(".notification-time");
            timeElement &&
              Object.assign(timeElement.style, NOTIFICATION_TIME_STYLE);
          },
          customizePrivateMessageNotification(titleElement, block) {
            // Apply container styling to the block
            Object.assign(block.style, NOTIFICATION_BLOCK_STYLE);
            // Move time element to bottom right
            const timeElement = block.querySelector(".notification-time");
            timeElement &&
              Object.assign(timeElement.style, NOTIFICATION_TIME_STYLE);
            const subject = block
              .querySelector(".notification-reference")
              ?.textContent.trim()
              .replace(/^"(.*)"$/, "$1");
            "Board warning issued" === subject &&
              ((titleElement.innerHTML = titleElement.innerHTML
                .replace(
                  /<strong>Private Message<\/strong>/,
                  '<strong style="color: #D31141;">Board warning issued</strong>'
                )
                .replace(/from/, "by")
                .replace(/:$/, "")),
              block.querySelector(".notification-reference")?.remove());
          },
          async customizeNotificationBlock(block) {
            if ("true" === block.dataset.customized) return;
            // Apply container styling to the block
            Object.assign(block.style, NOTIFICATION_BLOCK_STYLE);
            const notificationText = block.querySelector(".notification_text");
            if (!notificationText) return;
            // Move time element to bottom right
            const timeElement = block.querySelector(".notification-time");
            timeElement &&
              Object.assign(timeElement.style, NOTIFICATION_TIME_STYLE);
            const titleElement = notificationText.querySelector(
              ".notification-title"
            );
            if (titleElement) {
              let titleText = titleElement.innerHTML;
              titleText.includes("You were mentioned by")
                ? await this.customizeMentionNotification(block)
                : titleText.includes("reacted to a message you posted")
                  ? await this.customizeReactionNotification(
                      titleElement,
                      block
                    )
                  : titleText.includes("Private Message")
                    ? this.customizePrivateMessageNotification(
                        titleElement,
                        block
                      )
                    : titleText.includes("Report closed")
                      ? (titleElement.innerHTML = titleText.replace(
                          /Report closed/,
                          '<strong style="color: #f58c05;">Report closed</strong>'
                        ))
                      : titleText.includes("Post approval") &&
                        (titleElement.innerHTML = titleText.replace(
                          /<strong>Post approval<\/strong>/,
                          '<strong style="color: #00AA00;">Post approval</strong>'
                        ));
              const referenceElement = notificationText.querySelector(
                ".notification-reference"
              );
              if (
                referenceElement &&
                (titleText.includes("<strong>Reply</strong>") ||
                  titleText.includes("<strong>Quoted</strong>"))
              ) {
                const threadTitle = referenceElement.textContent
                  .trim()
                  .replace(/^"|"$/g, "");
                (titleElement.innerHTML = titleElement.innerHTML.replace(
                  /in(?:\stopic)?:/,
                  `<span style="font-size: 0.85em; padding: 0 0.25px;">in</span> <strong>${threadTitle}</strong>:`
                )),
                  // Update the existing reference element with loading state
                  (referenceElement.textContent = "Loading..."),
                  Utils.styleReference(referenceElement),
                  // Queue the content fetch
                  this.queuePostContentFetch(
                    block.getAttribute("data-real-url") || block.href,
                    referenceElement
                  );
              }
              // Apply text resizing to all notifications
              titleElement.innerHTML = titleElement.innerHTML
                .replace(
                  /\b(by|and|in|from)\b(?!-)/g,
                  '<span style="font-size: 0.85em; padding: 0 0.25px;">$1</span>'
                )
                .replace(
                  /<strong>Quoted<\/strong>/,
                  '<strong style="color: #FF4A66;">Quoted</strong>'
                )
                .replace(
                  /<strong>Reply<\/strong>/,
                  '<strong style="color: #95DB00;">Reply</strong>'
                );
            }
            const referenceElement = block.querySelector(
              ".notification-reference"
            );
            referenceElement && Utils.styleReference(referenceElement),
              block.querySelectorAll(".username-coloured").forEach((el) => {
                el.classList.replace("username-coloured", "username"),
                  (el.style.color = "");
              }),
              (block.dataset.customized = "true");
          },
          customizeNotificationPanel() {
            document
              .querySelectorAll(".notification-block, a.notification-block")
              .forEach(
                NotificationCustomizer.customizeNotificationBlock.bind(
                  NotificationCustomizer
                )
              );
          },
          customizeNotificationPage() {
            document.querySelectorAll(".cplist .row").forEach(async (row) => {
              if ("true" === row.dataset.customized) return;
              // Ensure row has position relative for absolute positioning
              (row.style.position = "relative"),
                (row.style.paddingBottom = "20px");
              // Make room for timestamp
              // Handle the notifications_time elements
              const timeElement = row.querySelector(".notifications_time");
              timeElement &&
                Object.assign(timeElement.style, NOTIFICATIONS_TIME_STYLE);
              const anchorElement = row
                .querySelector(".notifications")
                .querySelector("a");
              if (anchorElement) {
                const titleElement = anchorElement.querySelector(
                  ".notifications_title"
                );
                let titleText = titleElement.innerHTML;
                // Handle mentioned notifications specially
                if (titleText.includes("You were mentioned by")) {
                  const parts = titleText.split("<br>");
                  if (2 === parts.length) {
                    titleText = parts[0] + " " + parts[1];
                    // Create the new HTML structure for mentions
                    const newHtml = `\n                  <div class="notification-block">\n                    <div class="notification-title">${titleText}</div>\n                    <div class="notification-reference" style="background: rgba(23, 27, 36, 0.5); color: #ffffff; padding: 2px 4px; border-radius: 2px; margin-top: 5px;">\n                      Loading...\n                    </div>\n                  </div>\n                `;
                    anchorElement.innerHTML = newHtml;
                    // Queue the content fetch
                    const referenceElement = anchorElement.querySelector(
                      ".notification-reference"
                    );
                    referenceElement &&
                      NotificationCustomizer.queuePostContentFetch(
                        anchorElement.href,
                        referenceElement
                      );
                  }
                }
                // Handle reaction notifications
                else if (titleText.includes("reacted to")) {
                  const usernameElements = Array.from(
                      titleElement.querySelectorAll(
                        ".username, .username-coloured"
                      )
                    ),
                    usernames = usernameElements.map((el) =>
                      el.textContent.trim()
                    ),
                    postId = Utils.extractPostId(anchorElement.href);
                  if (postId) {
                    const filteredReactions = (
                        await ReactionHandler_fetchReactions(postId, !1)
                      ).filter((reaction) =>
                        usernames.includes(reaction.username)
                      ),
                      reactionHTML = Utils.formatReactions(filteredReactions),
                      firstPart = titleText.split(
                        usernameElements[0].outerHTML
                      )[0],
                      smallAnd =
                        '<span style="font-size: 0.85em; padding: 0 0.25px;">and</span>';
                    // Format usernames based on count
                    let formattedUsernames;
                    (formattedUsernames =
                      2 === usernameElements.length
                        ? `${usernameElements[0].outerHTML} ${smallAnd} ${usernameElements[1].outerHTML}`
                        : usernameElements.length > 2
                          ? usernameElements
                              .slice(0, -1)
                              .map((el) => el.outerHTML)
                              .join(", ") +
                            `, ${smallAnd} ${usernameElements[usernameElements.length - 1].outerHTML}`
                          : usernameElements[0].outerHTML),
                      (titleText =
                        firstPart +
                        formattedUsernames +
                        ` <b style="color: #3889ED;">reacted</b> ${reactionHTML} to:`);
                    // Create the new HTML structure
                    const newHtml = `\n                  <div class="notification-block">\n                    <div class="notification-title">${titleText}</div>\n                    <div class="notification-reference" style="background: rgba(23, 27, 36, 0.5); color: #ffffff; padding: 2px 4px; border-radius: 2px; margin-top: 5px;">\n                      Loading...\n                    </div>\n                  </div>\n                `;
                    anchorElement.innerHTML = newHtml;
                    // Queue the content fetch
                    const referenceElement = anchorElement.querySelector(
                      ".notification-reference"
                    );
                    referenceElement &&
                      NotificationCustomizer.queuePostContentFetch(
                        anchorElement.href,
                        referenceElement
                      );
                  }
                }
                // Handle other notifications with quotes
                else {
                  if (titleText.match(/"([^"]*)"$/)) {
                    // Only remove the quote from title if it's not a "Quoted" notification
                    titleText.includes("<strong>Quoted</strong>") ||
                      (titleText = titleText.replace(/"[^"]*"$/, "").trim()),
                      // Apply text styling
                      (titleText = titleText
                        .replace(
                          /\b(by|and|in|from)\b(?!-)/g,
                          '<span style="font-size: 0.85em; padding: 0 0.25px;">$1</span>'
                        )
                        .replace(
                          /<strong>Quoted<\/strong>/,
                          '<strong style="color: #FF4A66;">Quoted</strong>'
                        )
                        .replace(
                          /<strong>Reply<\/strong>/,
                          '<strong style="color: #95DB00;">Reply</strong>'
                        ));
                    // Create the new HTML structure
                    const newHtml = `\n                  <div class="notification-block">\n                    <div class="notification-title">${titleText}</div>\n                    <div class="notification-reference" style="background: rgba(23, 27, 36, 0.5); color: #ffffff; padding: 2px 4px; border-radius: 2px; margin-top: 5px;">\n                      Loading...\n                    </div>\n                  </div>\n                `;
                    anchorElement.innerHTML = newHtml;
                    // Queue the content fetch
                    const referenceElement = anchorElement.querySelector(
                      ".notification-reference"
                    );
                    referenceElement &&
                      NotificationCustomizer.queuePostContentFetch(
                        anchorElement.href,
                        referenceElement
                      );
                  }
                }
                // Convert username-coloured to username
                anchorElement
                  .querySelectorAll(".username-coloured")
                  .forEach((el) => {
                    el.classList.replace("username-coloured", "username"),
                      (el.style.color = "");
                  });
              }
              row.dataset.customized = "true";
            });
          },
          async queuePostContentFetch(url, placeholder) {
            const postId = Utils.extractPostId(url);
            if (postId) {
              // Check if we need to wait before next fetch
              if (this.lastFetchTime) {
                const timeSinceLastFetch = Date.now() - this.lastFetchTime;
                timeSinceLastFetch < 500 &&
                  (await Utils.sleep(500 - timeSinceLastFetch));
              }
              try {
                const postContent =
                  await ReactionHandler_fetchPostContent(postId);
                if (postContent && placeholder.parentNode) {
                  const trimmedContent = postContent.trim(),
                    mediaPreview = Utils.createElement("div", {
                      className: "notification-image-preview",
                    });
                  // Always create the image/video preview div
                  // Check for video content first - only if the entire content is just a video tag
                  if (
                    (trimmedContent.startsWith("[webm]") &&
                      trimmedContent.endsWith("[/webm]")) ||
                    (trimmedContent.startsWith("[media]") &&
                      trimmedContent.endsWith("[/media]"))
                  ) {
                    const videoData = Utils.extractVideoUrl(trimmedContent);
                    videoData &&
                      // Create video element for preview
                      ((mediaPreview.innerHTML = `<video src="${videoData.url}" style="max-width: 100px; max-height: 60px; border-radius: 3px; margin-top: 4px;" loop muted autoplay></video>`),
                      // Remove the placeholder and add the video preview
                      placeholder.parentNode.insertBefore(
                        mediaPreview,
                        placeholder
                      ),
                      placeholder.remove());
                  }
                  // Only add image if content is just an image tag
                  else if (
                    (trimmedContent.startsWith("[img]") &&
                      trimmedContent.endsWith("[/img]")) ||
                    trimmedContent.match(
                      /^\[img\s+[^=\]]+=[^\]]+\].*?\[\/img\]$/i
                    )
                  ) {
                    let imageUrl;
                    if (trimmedContent.startsWith("[img]"))
                      // Standard format
                      imageUrl = trimmedContent.slice(5, -6).trim();
                    else {
                      imageUrl = trimmedContent
                        .match(/^\[img\s+[^=\]]+=[^\]]+\](.*?)\[\/img\]$/i)[1]
                        .trim();
                    }
                    (mediaPreview.innerHTML = `<img src="${imageUrl}" style="max-width: 100px; max-height: 60px; border-radius: 3px; margin-top: 4px;">`),
                      // Remove the placeholder and add the image preview
                      placeholder.parentNode.insertBefore(
                        mediaPreview,
                        placeholder
                      ),
                      placeholder.remove();
                  } else
                    // If not an image or video, update the placeholder with the text content
                    placeholder.insertAdjacentElement("afterend", mediaPreview),
                      (placeholder.textContent =
                        Utils.removeBBCode(postContent)),
                      Utils.styleReference(placeholder);
                } else placeholder.remove();
              } catch (error) {
                console.error("Error fetching post content:", error),
                  placeholder.remove();
              }
              this.lastFetchTime = Date.now();
            } else placeholder.remove();
          },
        },
        NotificationMarker = {
          getDisplayedPostIds: () =>
            Array.from(document.querySelectorAll('div[id^="p"]')).map((el) =>
              el.id.substring(1)
            ),
          getNotificationData: () =>
            Array.from(document.querySelectorAll(".notification-block"))
              .map((link) => {
                const href = link.getAttribute("href");
                return {
                  href: href,
                  postId: Utils.extractPostId(
                    link.getAttribute("data-real-url") || href
                  ),
                };
              })
              .filter((data) => data.href && data.postId),
          markNotificationAsRead(href) {
            GM_xmlhttpRequest({
              method: "GET",
              url: "https://rpghq.org/forums/" + href,
              onload: (response) =>
                console.log("Notification marked as read:", response.status),
            });
          },
          checkAndMarkNotifications() {
            const displayedPostIds = this.getDisplayedPostIds();
            this.getNotificationData().forEach((notification) => {
              displayedPostIds.includes(notification.postId) &&
                this.markNotificationAsRead(notification.href);
            });
          },
        },
        init = () => {
          // Add CSS override to set max-width to 50px for .row .list-inner img
          const styleElement = document.createElement("style");
          // Add debouncing to prevent rapid re-processing
          let debounceTimer;
          (styleElement.textContent =
            "\n        .row .list-inner img {\n          max-width: 50px !important;\n        }\n      "),
            document.head.appendChild(styleElement),
            NotificationCustomizer.customizeNotificationPanel(),
            NotificationMarker.checkAndMarkNotifications(),
            window.location.href.includes("ucp.php?i=ucp_notifications") &&
              NotificationCustomizer.customizeNotificationPage();
          new MutationObserver((mutations) => {
            let shouldProcess = !1;
            // Only process if new notification blocks are added
            for (const mutation of mutations)
              if ("childList" === mutation.type) {
                if (
                  Array.from(mutation.addedNodes).some(
                    (node) =>
                      node.nodeType === Node.ELEMENT_NODE &&
                      (node.classList?.contains("notification-block") ||
                        node.querySelector?.(".notification-block"))
                  )
                ) {
                  shouldProcess = !0;
                  break;
                }
              }
            shouldProcess &&
              (clearTimeout(debounceTimer),
              (debounceTimer = setTimeout(() => {
                NotificationCustomizer.customizeNotificationPanel();
              }, 100)));
          }).observe(document.body, {
            childList: !0,
            subtree: !0,
          }),
            // Run storage cleanup last
            Storage_cleanupStorage();
        };
      "complete" === document.readyState ||
      "interactive" === document.readyState
        ? init()
        : window.addEventListener("load", init);
    },
  });
  // RPGHQ - Kalarion Reaction Auto-Marker
  /**
   * Marks smiley reaction notifs from Kalarion automagically so he can't rape you
   * Original script by loregamer, adapted for the RPGHQ Userscript Manager.
   * License: MIT
   *
   * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/kalareact.md for documentation
   */ var kalareact = Object.freeze({
    __proto__: null,
    init: function () {
      console.log("User Reaction Auto-Marker initialized!"),
        document
          .querySelector("#notification_list")
          .querySelectorAll("li")
          .forEach((item) => {
            // Return early if there's no notification-block link
            if (!item.querySelector("a.notification-block")) return;
            // Find the username span within this notification
            const usernameSpan = item.querySelector("span.username");
            if (!usernameSpan) return;
            const username = usernameSpan.textContent.trim();
            // Return if username doesn't start with "Kalarion" or "dolor"
            if (
              !username.startsWith("Kalarion") &&
              !username.startsWith("dolor")
            )
              return;
            console.log(`Found notification from ${username}, marking as read`);
            // Find and click the mark read button
            const markReadButton = item.querySelector("a.mark_read");
            markReadButton &&
              (markReadButton.click(),
              // Remove the notification row from the DOM
              console.log(`Removing ${username} notification from view`)),
              item.remove();
          });
    },
  });
  var bbcode = Object.freeze({
    __proto__: null,
    init: function () {
      // =============================
      // Update Page Title
      // =============================
      const escapeHTML = (str) =>
        str.replace(
          /[&<>"']/g,
          (m) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            })[m]
        );
      // =============================
      // Utility Functions
      // =============================
      // =============================
      // Global Variables & Settings
      // =============================
      let customSmileys = [
        "📥",
        "https://f.rpghq.org/ZgRYx3ztDLyD.png?n=cancel_forum.png",
        "https://f.rpghq.org/W5kvLDYCwg8G.png",
      ];
      const tagColorMap = {
          img: 1,
          url: 4,
          color: 3,
        },
        highlightBBCode = (text) => {
          // First, process all BBCode tags.
          let output = text.replace(
            /\[(\/?)([a-zA-Z0-9*]+)([^\]]*)\]/g,
            (match, slash, keyword, rest) => {
              // Special handling for list items ([*])
              if ("*" === keyword)
                return '<span class="bbcode-bracket" style="color:#A0A0A0;">[</span><span class="bbcode-list-item">*</span><span class="bbcode-bracket" style="color:#A0A0A0;">]</span>';
              // Special handling for smention: force a fixed color.
              if ("smention" === keyword.toLowerCase()) {
                let out = `<span class="bbcode-bracket" style="color:#A0A0A0;">[</span><span class="bbcode-tag-smention" style="color:#FFC107;">${escapeHTML(slash + keyword)}</span>`;
                if (rest) {
                  const leadingWs = rest.match(/^\s*/)[0],
                    params = rest.slice(leadingWs.length);
                  if (params)
                    if (params.startsWith("=")) {
                      const paramValue = params.slice(1).trim();
                      out +=
                        leadingWs +
                        '<span class="bbcode-attribute">=</span>' +
                        `<span class="bbcode-attribute">${escapeHTML(paramValue)}</span>`;
                    } else
                      out +=
                        leadingWs +
                        `<span class="bbcode-attribute">${escapeHTML(params)}</span>`;
                }
                return (
                  (out +=
                    '<span class="bbcode-bracket" style="color:#A0A0A0;">]</span>'),
                  out
                );
              }
              // For all other tags, assign colors using the tagColorMap.
              let out = `<span class="bbcode-bracket" style="color:#A0A0A0;">[</span><span class="bbcode-tag-${((
                tagName
              ) => {
                if ("*" === tagName) return "list-item";
                if (!(tagName in tagColorMap)) {
                  const colorIndex = Object.keys(tagColorMap).length % 5;
                  tagColorMap[tagName] = colorIndex;
                }
                return tagColorMap[tagName];
              })(keyword)}">${escapeHTML(slash + keyword)}</span>`;
              if (rest) {
                const leadingWs = rest.match(/^\s*/)[0],
                  params = rest.slice(leadingWs.length);
                if (params)
                  if (params.startsWith("=")) {
                    const paramValue = params.slice(1).trim();
                    if ("color" === keyword.toLowerCase()) {
                      const hexMatch = paramValue.match(/^(#[0-9A-Fa-f]{6})/);
                      if (hexMatch) {
                        const hex = hexMatch[1];
                        out +=
                          leadingWs +
                          '<span class="bbcode-attribute">=</span>' +
                          `<span class="bbcode-color-preview" style="background-color:${hex}; color:${
                            ((hexColor = hex),
                            (299 * parseInt(hexColor.slice(1, 3), 16) +
                              587 * parseInt(hexColor.slice(3, 5), 16) +
                              114 * parseInt(hexColor.slice(5, 7), 16)) /
                              1e3 >=
                            128
                              ? "black"
                              : "white")
                          };">${escapeHTML(hex)}</span>`;
                        const extra = paramValue.slice(hex.length);
                        extra &&
                          (out += `<span class="bbcode-attribute">${escapeHTML(extra)}</span>`);
                      } else
                        out +=
                          leadingWs +
                          '<span class="bbcode-attribute">=</span>' +
                          `<span class="bbcode-attribute">${escapeHTML(paramValue)}</span>`;
                    } else
                      out +=
                        leadingWs +
                        '<span class="bbcode-attribute">=</span>' +
                        `<span class="bbcode-attribute">${escapeHTML(paramValue)}</span>`;
                  } else
                    out +=
                      leadingWs +
                      `<span class="bbcode-attribute">${escapeHTML(params)}</span>`;
              }
              var hexColor;
              return (
                (out +=
                  '<span class="bbcode-bracket" style="color:#A0A0A0;">]</span>'),
                out
              );
            }
          );
          // Second pass: Wrap any URLs in the output with a span using the "bbcode-link" class.
          return (
            (output = output.replace(
              /(https?:\/\/[^\s<]+)/g,
              (match) => `<span class="bbcode-link">${match}</span>`
            )),
            output
          );
        },
        adjustTextareaAndHighlight = () => {
          const textArea = document.getElementById("message"),
            highlightDiv = document.getElementById("bbcode-highlight");
          if (!textArea || !highlightDiv) return;
          (textArea.style.height = "auto"),
            (textArea.style.height = textArea.scrollHeight + "px");
          const computed = window.getComputedStyle(textArea);
          Object.assign(highlightDiv.style, {
            width: textArea.offsetWidth + "px",
            height: textArea.offsetHeight + "px",
            padding: computed.padding,
            borderWidth: computed.borderWidth,
            borderStyle: computed.borderStyle,
            borderColor: "transparent",
            fontFamily: computed.fontFamily,
            fontSize: computed.fontSize,
            lineHeight: computed.lineHeight,
          }),
            positionSmileyBox(),
            positionEditorHeader();
        },
        updateHighlight = () => {
          const textarea = document.getElementById("message"),
            highlightDiv = document.getElementById("bbcode-highlight");
          textarea &&
            highlightDiv &&
            (highlightDiv.innerHTML = highlightBBCode(textarea.value));
        },
        wrapSelectedText = (textarea, tag) => {
          const start = textarea.selectionStart,
            end = textarea.selectionEnd,
            selected = textarea.value.substring(start, end),
            replacement = tag.includes("=")
              ? `[${tag}]${selected}[/${tag.split("=")[0]}]`
              : `[${tag}]${selected}[/${tag}]`;
          (textarea.value =
            textarea.value.substring(0, start) +
            replacement +
            textarea.value.substring(end)),
            textarea.setSelectionRange(
              start + tag.length + 2,
              start + tag.length + 2
            );
        },
        insertTextAtCursor = (text) => {
          const textarea = document.getElementById("message");
          if (!textarea) return;
          const {
              selectionStart: start,
              selectionEnd: end,
              value: value,
            } = textarea,
            before = value.substring(0, start),
            after = value.substring(end);
          (textarea.value = before + text + after),
            textarea.setSelectionRange(
              start + text.length,
              start + text.length
            ),
            textarea.focus(),
            updateHighlight(),
            adjustTextareaAndHighlight();
        },
        positionSmileyBox = () => {
          const smileyBox = document.getElementById("smiley-box"),
            textarea = document.getElementById("message");
          if (smileyBox && textarea)
            if (window.innerWidth <= 768)
              Object.assign(smileyBox.style, {
                position: "static",
                width: "100%",
                maxHeight: "none",
                overflowY: "visible",
                marginBottom: "10px",
              });
            else {
              const { top: top, right: right } =
                  textarea.getBoundingClientRect(),
                windowWidth = window.innerWidth,
                scrollTop =
                  window.pageYOffset || document.documentElement.scrollTop,
                scrollStart = top + scrollTop,
                smileyBoxWidth = 220,
                leftPosition = Math.min(
                  right + 10,
                  windowWidth - smileyBoxWidth
                );
              if (scrollTop >= scrollStart) {
                const scrollDistance = scrollTop - scrollStart,
                  maxScroll = textarea.offsetHeight - smileyBox.offsetHeight,
                  newTop = Math.min(scrollDistance, maxScroll);
                Object.assign(smileyBox.style, {
                  position: "absolute",
                  top: scrollStart + newTop + "px",
                  left: leftPosition + "px",
                });
              } else
                Object.assign(smileyBox.style, {
                  position: "absolute",
                  top: scrollStart + "px",
                  left: leftPosition + "px",
                });
              (smileyBox.style.maxHeight = "80vh"),
                (smileyBox.style.overflowY = "auto");
            }
        },
        positionEditorHeader = () => {
          const editorHeader = document.getElementById("abbc3_buttons"),
            textarea = document.getElementById("message");
          if (!editorHeader || !textarea) return;
          const textareaRect = textarea.getBoundingClientRect(),
            headerRect = editorHeader.getBoundingClientRect(),
            scrollTop =
              window.pageYOffset || document.documentElement.scrollTop,
            offset = headerRect.top - textareaRect.top;
          if (scrollTop >= textareaRect.top + scrollTop - offset) {
            if (!editorHeader.classList.contains("fixed")) {
              editorHeader.classList.add("fixed");
              const placeholder = document.createElement("div");
              (placeholder.style.height = editorHeader.offsetHeight + "px"),
                (placeholder.id = "abbc3_buttons_placeholder"),
                editorHeader.parentNode.insertBefore(placeholder, editorHeader);
            }
            Object.assign(editorHeader.style, {
              width: textarea.offsetWidth + "px",
              left: textareaRect.left + "px",
              top: "0px",
            });
            let cumulative = 0;
            editorHeader
              .querySelectorAll(".abbc3_buttons_row")
              .forEach((row) => {
                Object.assign(row.style, {
                  width: textarea.offsetWidth + "px",
                  position: "fixed",
                  top: cumulative + "px",
                }),
                  row.classList.add("fixed"),
                  (cumulative += row.offsetHeight);
              });
          } else if (editorHeader.classList.contains("fixed")) {
            editorHeader.classList.remove("fixed"), (editorHeader.style = "");
            const placeholder = document.getElementById(
              "abbc3_buttons_placeholder"
            );
            placeholder && placeholder.remove(),
              editorHeader
                .querySelectorAll(".abbc3_buttons_row")
                .forEach((row) => {
                  (row.style = ""), row.classList.remove("fixed");
                });
          }
        },
        addCustomSmileyButtons = () => {
          const smileyBox = document.getElementById("smiley-box");
          if (!smileyBox) return;
          const topicReviewLink = smileyBox.querySelector('a[href="#review"]');
          topicReviewLink &&
            (topicReviewLink.parentElement.style.display = "none");
          const viewMoreLink = smileyBox.querySelector(
              'a[href*="mode=smilies"]'
            ),
            existing = Array.from(
              smileyBox.querySelectorAll('a[onclick^="insert_text"]')
            ),
            groups = {};
          existing.forEach((smiley) => {
            const dir = (smiley.querySelector("img")?.src || "")
              .split("/")
              .slice(0, -1)
              .join("/");
            (groups[dir] = groups[dir] || []), groups[dir].push(smiley);
          }),
            existing.forEach((smiley) => smiley.remove());
          let firstGroup = !0;
          for (const group of Object.values(groups)) {
            if (!firstGroup) {
              const hr = document.createElement("hr");
              (hr.className = "smiley-group-separator"),
                smileyBox.insertBefore(hr, viewMoreLink);
            }
            firstGroup = !1;
            const groupContainer = document.createElement("div");
            (groupContainer.className = "smiley-group"),
              group.forEach((smiley) => {
                const btn = document.createElement("a");
                (btn.href = "#"),
                  (btn.className = "smiley-button"),
                  (btn.onclick = smiley.onclick);
                const img = smiley.querySelector("img");
                (btn.innerHTML = `<img src="${img.src}" alt="${img.alt}" title="${img.title}">`),
                  groupContainer.appendChild(btn);
              }),
              smileyBox.insertBefore(groupContainer, viewMoreLink);
          }
          let customContainer = smileyBox.querySelector(
              ".custom-smiley-container"
            ),
            customHr = smileyBox.querySelector(".custom-smiley-separator");
          customSmileys.length > 0
            ? (customHr ||
                ((customHr = document.createElement("hr")),
                (customHr.className = "custom-smiley-separator"),
                smileyBox.insertBefore(customHr, viewMoreLink)),
              customContainer
                ? (customContainer.innerHTML = "")
                : ((customContainer = document.createElement("div")),
                  (customContainer.className = "custom-smiley-container"),
                  smileyBox.insertBefore(customContainer, viewMoreLink)),
              customSmileys.forEach((smiley) => {
                const btn = document.createElement("a");
                (btn.href = "#"),
                  (btn.className = "custom-smiley-button"),
                  (btn.innerHTML = smiley.startsWith("http")
                    ? `<img src="${smiley}" alt="Custom Smiley" title="Custom Smiley">`
                    : `<span class="emoji-smiley">${smiley}</span>`),
                  btn.addEventListener("click", (e) => {
                    e.preventDefault(),
                      ((smiley) => {
                        const textarea = document.getElementById("message");
                        if (!textarea) return;
                        const start = textarea.selectionStart,
                          end = textarea.selectionEnd,
                          scrollTop = textarea.scrollTop,
                          text = textarea.value,
                          before = text.substring(0, start),
                          after = text.substring(end),
                          insert = smiley.startsWith("http")
                            ? `[img]${smiley}[/img]`
                            : smiley;
                        (textarea.value = before + insert + after),
                          textarea.setSelectionRange(
                            start + insert.length,
                            start + insert.length
                          ),
                          (textarea.scrollTop = scrollTop),
                          textarea.focus(),
                          updateHighlight(),
                          adjustTextareaAndHighlight();
                      })(smiley);
                  }),
                  customContainer.appendChild(btn);
              }))
            : (customContainer && customContainer.remove(),
              customHr && customHr.remove());
        },
        insertModTemplate = () => {
          insertTextAtCursor(
            "[align=center][img] MOD IMAGE URL HERE [/img][/align]\n\n[hr]\n\n[size=150][b][color=#FE545D] Overview [/color][/b][/size]\nMOD DESCRIPTION HERE\n\n[hr]\n\n[size=150][b][color=#FE545D] Downloads [/color][/b][/size]\n| Files | Version | Type | Description |\n|-------|-----------|-------|---------------|\n|[url=URL HERE] 📥 HYPERLINK TEXT HERE [/url] | FILE VERSION HERE | Main/Optional/Add-on | FILE DESCRIPTION HERE |\n|[url=URL HERE] 📥 HYPERLINK TEXT HERE [/url] | FILE VERSION HERE | Main/Optional/Add-on | FILE DESCRIPTION HERE |\n|[url=URL HERE] 📥 HYPERLINK TEXT HERE [/url] | FILE VERSION HERE | Main/Optional/Add-on | FILE DESCRIPTION HERE |\n|[url=URL HERE] 📥 HYPERLINK TEXT HERE [/url] | FILE VERSION HERE | Main/Optional/Add-on | FILE DESCRIPTION HERE |\n\n[hr]\n\n[size=150][b][color=#FE545D] Installation Instructions [/color][/b][/size]\n[list=1]\n[*] Instruction Number 1\n[*] Instruction Number 2\n[*] Instruction Number 3\n[/list]\n\n[hr]\n\n[size=150][b][color=#FE545D] Changelog [/color][/b][/size]\n[spoiler]\n[b]VERSION NUMBER HERE[/b]\n[list]\n[*] CHANGE HERE\n[*] CHANGE HERE\n[*] CHANGE HERE\n[/list]\n\n[b]VERSION NUMBER HERE[/b]\n[list]\n[*] CHANGE HERE\n[*] CHANGE HERE\n[*] CHANGE HERE\n[/list]\n[/spoiler]\n\n[hr]\n\n[size=150][b][color=#FE545D] To Do [/color][/b][/size]\n[list]\n[*] TO DO\n[*] TO DO\n[*] TO DO\n[/list]\n\n[hr]\n\n[size=150][b][color=#FE545D] Reporting Bugs [/color][/b][/size]\nTo report any bugs, please submit a post in the [url=https://rpghq.org/forums/posting.php?mode=post&f=40]Mod Support section[/url] and mention my username.\n\n[hr]\n\n[size=150][b][color=#FE545D]Credits[/color][/b][/size]\n[list]\n[*] CREDIT\n[*] CREDIT\n[*] CREDIT\n[/list]\n\n[hr]\n\n[size=150][b][color=#FE545D] My Other Mods [/color][/b][/size]\n[list]\n[*] [url=MOD URL] MOD NAME [/url]\n[*] [url=MOD URL] MOD NAME [/url]\n[*] [url=MOD URL] MOD NAME [/url]\n[*] [url=MOD URL] MOD NAME [/url]\n[*] [url=MOD URL] MOD NAME [/url]\n[/list]\n\n[hr]\n"
          );
        },
        insertTable = () => {
          insertTextAtCursor(
            "| Files | Version | Type | Description |\n|-------|-----------|-------|---------------|\n|[url=URL HERE] 📥 HYPERLINK TEXT HERE [/url] | FILE VERSION HERE | Main/Optional/Add-on | FILE DESCRIPTION HERE |\n|[url=URL HERE] 📥 HYPERLINK TEXT HERE [/url] | FILE VERSION HERE | Main/Optional/Add-on | FILE DESCRIPTION HERE |\n|[url=URL HERE] 📥 HYPERLINK TEXT HERE [/url] | FILE VERSION HERE | Main/Optional/Add-on | FILE DESCRIPTION HERE |\n|[url=URL HERE] 📥 HYPERLINK TEXT HERE [/url] | FILE VERSION HERE | Main/Optional/Add-on | FILE DESCRIPTION HERE |\n"
          );
        },
        insertBloomeryPing = () => {
          insertTextAtCursor(
            "[smention]Bloomery[/smention]\n[size=1] [smention u=459][/smention] [smention u=510][/smention] [smention u=897][/smention] [smention u=515][/smention] [smention u=548][/smention] [smention u=555][/smention] [smention u=615][/smention] [smention u=753][/smention] [smention u=918][/smention] [smention u=919][/smention] [smention u=3114][/smention] [smention u=58][/smention] [smention u=256][/smention] [smention u=63][/smention]  [/size]"
          );
        },
        showCustomSmileysPopup = (e) => {
          e.preventDefault();
          const popup = document.createElement("div");
          (popup.id = "custom-smileys-popup"),
            Object.assign(popup.style, {
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#2a2e36",
              border: "1px solid #3a3f4b",
              borderRadius: "5px",
              width: "80%",
              maxWidth: "600px",
              height: "80%",
              maxHeight: "600px",
              display: "flex",
              flexDirection: "column",
              zIndex: "9999",
              fontFamily:
                "'Open Sans', 'Droid Sans', Arial, Verdana, sans-serif",
            });
          const header = document.createElement("div");
          Object.assign(header.style, {
            padding: "20px",
            backgroundColor: "#2a2e36",
            borderBottom: "1px solid #3a3f4b",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: "0",
            zIndex: "1",
          });
          const title = document.createElement("h2");
          (title.textContent = "Manage Custom Smileys"),
            (title.style.margin = "0"),
            (title.style.color = "#c5d0db");
          const closeButton = document.createElement("button");
          (closeButton.textContent = "Close"),
            Object.assign(closeButton.style, {
              backgroundColor: "#4a5464",
              color: "#c5d0db",
              border: "none",
              padding: "5px 10px",
              borderRadius: "3px",
              cursor: "pointer",
            }),
            (closeButton.onclick = (e) => {
              e.preventDefault(), popup.remove();
            }),
            header.append(title, closeButton);
          const content = document.createElement("div");
          Object.assign(content.style, {
            padding: "20px",
            overflowY: "auto",
            flexGrow: "1",
          });
          const smileyList = document.createElement("ul");
          Object.assign(smileyList.style, {
            listStyleType: "none",
            padding: "0",
            margin: "0",
          });
          const updateSmileyList = () => {
            (smileyList.innerHTML = ""),
              customSmileys.forEach((smiley, index) => {
                const li = document.createElement("li");
                if (
                  (Object.assign(li.style, {
                    marginBottom: "10px",
                    display: "flex",
                    alignItems: "center",
                  }),
                  isSingleEmoji(smiley))
                ) {
                  const emojiSpan = document.createElement("span");
                  (emojiSpan.textContent = smiley),
                    (emojiSpan.style.fontSize = "18px"),
                    (emojiSpan.style.marginRight = "10px"),
                    li.appendChild(emojiSpan);
                } else {
                  const img = document.createElement("img");
                  (img.src = smiley),
                    (img.alt = "Smiley"),
                    Object.assign(img.style, {
                      width: "20px",
                      height: "20px",
                      marginRight: "10px",
                    }),
                    li.appendChild(img);
                }
                const input = document.createElement("input");
                (input.type = "text"),
                  (input.value = smiley),
                  (input.disabled = !0),
                  Object.assign(input.style, {
                    flexGrow: "1",
                    marginRight: "10px",
                    padding: "5px",
                    backgroundColor: "#2a2e36",
                    color: "#a0a0a0",
                    border: "1px solid #3a3f4b",
                    borderRadius: "3px",
                    cursor: "default",
                  });
                const btnStyle =
                    "\n          background-color: #4a5464;\n          color: #c5d0db;\n          border: none;\n          padding: 5px 10px;\n          margin-left: 5px;\n          border-radius: 3px;\n          cursor: pointer;\n        ",
                  upBtn = document.createElement("button");
                (upBtn.textContent = "↑"),
                  (upBtn.style.cssText = btnStyle),
                  (upBtn.onclick = () => {
                    index > 0 &&
                      (([customSmileys[index - 1], customSmileys[index]] = [
                        customSmileys[index],
                        customSmileys[index - 1],
                      ]),
                      saveCustomSmileys(),
                      updateSmileyList());
                  });
                const downBtn = document.createElement("button");
                (downBtn.textContent = "↓"),
                  (downBtn.style.cssText = btnStyle),
                  (downBtn.onclick = () => {
                    index < customSmileys.length - 1 &&
                      (([customSmileys[index], customSmileys[index + 1]] = [
                        customSmileys[index + 1],
                        customSmileys[index],
                      ]),
                      saveCustomSmileys(),
                      updateSmileyList());
                  });
                const removeBtn = document.createElement("button");
                (removeBtn.textContent = "Remove"),
                  (removeBtn.style.cssText = btnStyle),
                  (removeBtn.onclick = () => {
                    customSmileys.splice(index, 1),
                      saveCustomSmileys(),
                      updateSmileyList();
                  }),
                  li.append(input, upBtn, downBtn, removeBtn),
                  smileyList.appendChild(li);
              });
          };
          content.appendChild(smileyList);
          const newInput = document.createElement("input");
          (newInput.type = "text"),
            (newInput.placeholder =
              "Enter new smiley or emoji and press Enter"),
            Object.assign(newInput.style, {
              marginTop: "15px",
              padding: "5px",
              backgroundColor: "#3a3f4b",
              color: "#c5d0db",
              border: "1px solid #4a5464",
              borderRadius: "3px",
            }),
            newInput.addEventListener("keypress", (e) => {
              "Enter" === e.key &&
                newInput.value.trim() &&
                (customSmileys.push(newInput.value.trim()),
                saveCustomSmileys(),
                (newInput.value = ""),
                updateSmileyList());
            }),
            content.appendChild(newInput),
            updateSmileyList(),
            popup.append(header, content),
            document.body.appendChild(popup);
        },
        isSingleEmoji = (str) =>
          /^(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])$/.test(
            str
          ),
        saveCustomSmileys = () => {
          GM_setValue("customSmileys", JSON.stringify(customSmileys)),
            addCustomSmileyButtons();
        },
        addCustomColorsToExistingPalette = (colorPalette) => {
          // Check if we've already added our custom row to this palette
          if ("true" === colorPalette.dataset.customColorsAdded) return;
          // Also check if our custom colors are already present in the palette
          const existingColors = Array.from(
              colorPalette.querySelectorAll("a[data-color]")
            ).map((a) => `#${a.getAttribute("data-color")}`.toUpperCase()),
            customColors = [
              "#F5575D", // Red
              "#3889ED", // Blue
              "#FFC107", // Yellow/Gold
              "#00AA00", // Green
              "#FC8A92",
              "#F7E6E7",
            ];
          // Custom colors to add
          // If all our custom colors are already present, mark as added and exit
          if (
            customColors.every((color) =>
              existingColors.includes(color.toUpperCase())
            )
          )
            return void (colorPalette.dataset.customColorsAdded = "true");
          // Create a new row for custom colors
          let tbody = colorPalette.querySelector("tbody");
          // If there's no tbody, create one
          tbody ||
            ((tbody = document.createElement("tbody")),
            colorPalette.appendChild(tbody));
          // Get the first row to determine the number of cells
          const firstRow = tbody.querySelector("tr");
          if (!firstRow) {
            // If there are no rows, we can't determine the cell count
            // Create a default row with 25 cells (standard palette width)
            const newRow = document.createElement("tr");
            // Create cells for each custom color
            return (
              customColors.forEach((color) => {
                const td = document.createElement("td");
                (td.style.backgroundColor = color),
                  (td.style.width = "15px"),
                  (td.style.height = "12px");
                const a = document.createElement("a");
                (a.href = "#"),
                  a.setAttribute("data-color", color.substring(1)), // Remove # from color code
                  (a.style.display = "block"),
                  (a.style.width = "15px"),
                  (a.style.height = "12px"),
                  a.setAttribute("alt", color),
                  a.setAttribute("title", color),
                  // Use the same click behavior as the original color cells
                  (a.onclick = function (e) {
                    e.preventDefault(), e.stopPropagation();
                    // This is the standard behavior for color palette links
                    const colorCode = this.getAttribute("data-color"),
                      textarea = document.getElementById("message");
                    return (
                      textarea &&
                        // Use the existing wrapSelectedText function
                        (wrapSelectedText(textarea, `color=#${colorCode}`),
                        updateHighlight(),
                        adjustTextareaAndHighlight()),
                      // Close the palette
                      document.body.click(),
                      !1
                    );
                  }),
                  td.appendChild(a),
                  newRow.appendChild(td);
              }),
              // Add the new row to the palette
              tbody.appendChild(newRow),
              void (
                // Mark this palette as having custom colors added
                (colorPalette.dataset.customColorsAdded = "true")
              )
            );
          }
          const newRow = document.createElement("tr");
          // Create cells for each custom color
          customColors.forEach((color) => {
            const td = document.createElement("td");
            (td.style.backgroundColor = color),
              (td.style.width = "15px"),
              (td.style.height = "12px");
            const a = document.createElement("a");
            (a.href = "#"),
              a.setAttribute("data-color", color.substring(1)), // Remove # from color code
              (a.style.display = "block"),
              (a.style.width = "15px"),
              (a.style.height = "12px"),
              a.setAttribute("alt", color),
              a.setAttribute("title", color),
              // Use the same click behavior as the original color cells
              (a.onclick = function (e) {
                e.preventDefault(), e.stopPropagation();
                // This is the standard behavior for color palette links
                const colorCode = this.getAttribute("data-color"),
                  textarea = document.getElementById("message");
                return (
                  textarea &&
                    // Use the existing wrapSelectedText function
                    (wrapSelectedText(textarea, `color=#${colorCode}`),
                    updateHighlight(),
                    adjustTextareaAndHighlight()),
                  // Close the palette
                  document.body.click(),
                  !1
                );
              }),
              td.appendChild(a),
              newRow.appendChild(td);
          });
          // Add empty cells to fill the row
          const totalCells = firstRow.childElementCount;
          for (let i = customColors.length; i < totalCells; i++) {
            const td = document.createElement("td");
            (td.style.width = "15px"),
              (td.style.height = "12px"),
              newRow.appendChild(td);
          }
          // Add the new row to the palette
          tbody.appendChild(newRow),
            // Mark this palette as having custom colors added
            (colorPalette.dataset.customColorsAdded = "true");
        },
        initialize = () => {
          (() => {
            const mode = new URLSearchParams(window.location.search).get(
                "mode"
              ),
              postingTitleElement = document.querySelector(".posting-title a");
            if (postingTitleElement) {
              const threadTitle = postingTitleElement.textContent.trim();
              "reply" === mode || "quote" === mode
                ? (document.title = `RPGHQ - Replying to "${threadTitle}"`)
                : "edit" === mode &&
                  (document.title = `RPGHQ - Editing post in "${threadTitle}"`);
            }
          })();
          const textArea = document.getElementById("message");
          if (!textArea) return setTimeout(initialize, 500);
          (() => {
            const textarea = document.getElementById("message");
            textarea &&
              ($(textarea).off("focus change keyup"),
              textarea.classList.remove("auto-resized"),
              (textarea.style.height = ""),
              (textarea.style.resize = "none"));
          })();
          const container = document.createElement("div");
          container.className = "editor-container";
          const highlightDiv = document.createElement("div");
          (highlightDiv.id = "bbcode-highlight"),
            textArea.parentNode.replaceChild(container, textArea),
            container.append(highlightDiv, textArea),
            Object.assign(textArea.style, {
              overflow: "hidden",
              resize: "none",
              minHeight: "500px",
              position: "relative",
              zIndex: "2",
              background: "transparent",
              color: "rgb(204, 204, 204)",
              caretColor: "white",
              width: "100%",
              height: "100%",
              padding: "3px",
              boxSizing: "border-box",
              fontFamily: "Verdana, Helvetica, Arial, sans-serif",
              fontSize: "11px",
              lineHeight: "15.4px",
            }),
            textArea.addEventListener("keydown", function (e) {
              e.ctrlKey &&
                ["b", "i", "u"].includes(e.key) &&
                (e.preventDefault(),
                wrapSelectedText(this, e.key),
                updateHighlight(),
                adjustTextareaAndHighlight()),
                e.altKey &&
                  "g" === e.key &&
                  (e.preventDefault(),
                  wrapSelectedText(this, "color=#80BF00"),
                  updateHighlight(),
                  adjustTextareaAndHighlight());
            });
          let lastContent = textArea.value,
            updateTimer = null;
          const storedSmileys = GM_getValue("customSmileys");
          storedSmileys && (customSmileys = JSON.parse(storedSmileys));
          const smileyBox = document.getElementById("smiley-box");
          if (smileyBox) {
            const manageButton = document.createElement("button");
            (manageButton.textContent = "Manage Custom Smileys"),
              Object.assign(manageButton.style, {
                marginTop: "10px",
                backgroundColor: "#4a5464",
                color: "#c5d0db",
                border: "none",
                padding: "5px 10px",
                borderRadius: "3px",
                cursor: "pointer",
              }),
              (manageButton.onclick = showCustomSmileysPopup),
              smileyBox.appendChild(manageButton);
          }
          const checkForUpdates = () => {
            textArea.value !== lastContent &&
              (updateHighlight(),
              adjustTextareaAndHighlight(),
              (lastContent = textArea.value)),
              (updateTimer = setTimeout(checkForUpdates, 100));
          };
          textArea.addEventListener("input", () => {
            clearTimeout(updateTimer), checkForUpdates();
          }),
            window.addEventListener("resize", adjustTextareaAndHighlight),
            updateHighlight(),
            adjustTextareaAndHighlight(),
            checkForUpdates(),
            document.querySelectorAll("h3").forEach((heading) => {
              if ("Submit a new mod" === heading.textContent.trim()) {
                const headerContainer = document.createElement("div");
                (headerContainer.style.display = "flex"),
                  (headerContainer.style.alignItems = "center"),
                  (headerContainer.style.marginBottom = "10px");
                const headingClone = document.createElement("h3");
                (headingClone.textContent = heading.textContent),
                  (headingClone.style.margin = "0 10px 0 0"),
                  heading.className &&
                    (headingClone.className = heading.className),
                  Array.from(heading.style).forEach((prop) => {
                    "margin" !== prop &&
                      (headingClone.style[prop] = heading.style[prop]);
                  });
                const copyButton = document.createElement("button");
                (copyButton.innerHTML =
                  '<i class="icon fa-copy fa-fw" aria-hidden="true"></i> Copy'),
                  Object.assign(copyButton.style, {
                    backgroundColor: "#4a5464",
                    color: "#c5d0db",
                    border: "none",
                    padding: "5px 10px",
                    marginRight: "5px",
                    borderRadius: "3px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  });
                const pasteButton = document.createElement("button");
                (pasteButton.innerHTML =
                  '<i class="icon fa-paste fa-fw" aria-hidden="true"></i> Paste'),
                  Object.assign(pasteButton.style, {
                    backgroundColor: "#4a5464",
                    color: "#c5d0db",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "3px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }),
                  copyButton.addEventListener("click", (e) => {
                    e.preventDefault(), e.stopPropagation();
                    const existingData = GM_getValue("savedFormData", null);
                    if (existingData) {
                      const confirmDialog = document.createElement("div");
                      Object.assign(confirmDialog.style, {
                        position: "fixed",
                        top: "0",
                        left: "0",
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: "10000",
                      });
                      const dialogContent = document.createElement("div");
                      Object.assign(dialogContent.style, {
                        backgroundColor: "#3A404A",
                        borderRadius: "5px",
                        padding: "20px",
                        maxWidth: "450px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                      });
                      const title = document.createElement("h3");
                      (title.textContent = "Confirm Overwrite"),
                        Object.assign(title.style, {
                          color: "#c5d0db",
                          marginTop: "0",
                          marginBottom: "15px",
                          fontSize: "16px",
                          borderBottom: "1px solid #4a5464",
                          paddingBottom: "10px",
                        });
                      const message = document.createElement("p");
                      (message.textContent =
                        "There's already saved form data in your clipboard. Do you want to overwrite it?"),
                        Object.assign(message.style, {
                          color: "#c5d0db",
                          marginBottom: "15px",
                          fontSize: "14px",
                        });
                      const parsedData = JSON.parse(existingData),
                        previewContainer = document.createElement("div");
                      Object.assign(previewContainer.style, {
                        backgroundColor: "#2a2e36",
                        borderRadius: "3px",
                        padding: "10px",
                        marginBottom: "15px",
                        maxHeight: "150px",
                        overflowY: "auto",
                        fontSize: "12px",
                        color: "#a0a0a0",
                      });
                      let previewHTML = "";
                      if (
                        (parsedData.modName &&
                          (previewHTML += `<strong>Mod Name:</strong> ${parsedData.modName}<br>`),
                        parsedData.modVersion &&
                          (previewHTML += `<strong>Version:</strong> ${parsedData.modVersion}<br>`),
                        parsedData.modAuthorName &&
                          (previewHTML += `<strong>Author:</strong> ${parsedData.modAuthorName}<br>`),
                        parsedData.message)
                      ) {
                        previewHTML += `<strong>Message:</strong> ${parsedData.message.length > 100 ? parsedData.message.substring(0, 100) + "..." : parsedData.message}<br>`;
                      }
                      parsedData.tags &&
                        parsedData.tags.length > 0 &&
                        (previewHTML += `<strong>Tags:</strong> ${parsedData.tags.join(", ")}<br>`),
                        (previewContainer.innerHTML =
                          previewHTML || "No preview available");
                      const buttonContainer = document.createElement("div");
                      Object.assign(buttonContainer.style, {
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "10px",
                      });
                      const cancelButton = document.createElement("button");
                      (cancelButton.textContent = "Cancel"),
                        Object.assign(cancelButton.style, {
                          backgroundColor: "#4a5464",
                          color: "#c5d0db",
                          border: "none",
                          padding: "8px 15px",
                          borderRadius: "3px",
                          cursor: "pointer",
                        });
                      const confirmButton = document.createElement("button");
                      return (
                        (confirmButton.textContent = "Overwrite"),
                        Object.assign(confirmButton.style, {
                          backgroundColor: "#9C4343",
                          color: "#c5d0db",
                          border: "none",
                          padding: "8px 15px",
                          borderRadius: "3px",
                          cursor: "pointer",
                        }),
                        cancelButton.addEventListener("click", () =>
                          confirmDialog.remove()
                        ),
                        confirmButton.addEventListener("click", () => {
                          confirmDialog.remove(), saveFormData();
                        }),
                        dialogContent.append(
                          title,
                          message,
                          previewContainer,
                          buttonContainer
                        ),
                        buttonContainer.append(cancelButton, confirmButton),
                        confirmDialog.appendChild(dialogContent),
                        void document.body.appendChild(confirmDialog)
                      );
                    }
                    function saveFormData() {
                      const formData = {
                        message: document.getElementById("message").value,
                      };
                      document.getElementById("modwrangler-wrapper") &&
                        (document.getElementById("gameSelect") &&
                          (formData.gameSelect =
                            document.getElementById("gameSelect").value),
                        document.getElementById("modName") &&
                          (formData.modName =
                            document.getElementById("modName").value),
                        document.getElementById("modVersion") &&
                          (formData.modVersion =
                            document.getElementById("modVersion").value),
                        document.getElementById("modAuthorName") &&
                          (formData.modAuthorName =
                            document.getElementById("modAuthorName").value),
                        (formData.tags = []),
                        document
                          .querySelectorAll(
                            'input[type="checkbox"][id^="tag-"]'
                          )
                          .forEach((checkbox) => {
                            checkbox.checked &&
                              formData.tags.push(checkbox.value);
                          }),
                        document.getElementById("thumbnailURL") &&
                          (formData.thumbnailURL =
                            document.getElementById("thumbnailURL").value),
                        document.getElementById("vaultFileName") &&
                          (formData.vaultFileName =
                            document.getElementById("vaultFileName").value),
                        document.getElementById("modDescription") &&
                          (formData.modDescription =
                            document.getElementById("modDescription").value)),
                        GM_setValue("savedFormData", JSON.stringify(formData));
                      const notification = document.createElement("div");
                      (notification.textContent = "Form data saved!"),
                        Object.assign(notification.style, {
                          position: "fixed",
                          top: "20px",
                          right: "20px",
                          backgroundColor: "#4a5464",
                          color: "#c5d0db",
                          padding: "10px",
                          borderRadius: "5px",
                          zIndex: "9999",
                          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                        }),
                        document.body.appendChild(notification),
                        setTimeout(() => notification.remove(), 2e3);
                    }
                    saveFormData();
                  }),
                  pasteButton.addEventListener("click", (e) => {
                    e.preventDefault(), e.stopPropagation();
                    const savedData = GM_getValue("savedFormData", "{}"),
                      formData = JSON.parse(savedData);
                    formData.message &&
                      ((document.getElementById("message").value =
                        formData.message),
                      updateHighlight(),
                      adjustTextareaAndHighlight()),
                      document.getElementById("modwrangler-wrapper") &&
                        (document.getElementById("gameSelect") &&
                          formData.gameSelect &&
                          (document.getElementById("gameSelect").value =
                            formData.gameSelect),
                        document.getElementById("modName") &&
                          formData.modName &&
                          (document.getElementById("modName").value =
                            formData.modName),
                        document.getElementById("modVersion") &&
                          formData.modVersion &&
                          (document.getElementById("modVersion").value =
                            formData.modVersion),
                        document.getElementById("modAuthorName") &&
                          formData.modAuthorName &&
                          (document.getElementById("modAuthorName").value =
                            formData.modAuthorName),
                        formData.tags &&
                          Array.isArray(formData.tags) &&
                          (document
                            .querySelectorAll(
                              'input[type="checkbox"][id^="tag-"]'
                            )
                            .forEach((checkbox) => (checkbox.checked = !1)),
                          formData.tags.forEach((tag) => {
                            const checkbox = document.querySelector(
                              `input[type="checkbox"][value="${tag}"]`
                            );
                            checkbox && (checkbox.checked = !0);
                          })),
                        document.getElementById("thumbnailURL") &&
                          formData.thumbnailURL &&
                          (document.getElementById("thumbnailURL").value =
                            formData.thumbnailURL),
                        document.getElementById("vaultFileName") &&
                          formData.vaultFileName &&
                          (document.getElementById("vaultFileName").value =
                            formData.vaultFileName),
                        document.getElementById("modDescription") &&
                          formData.modDescription &&
                          (document.getElementById("modDescription").value =
                            formData.modDescription));
                    const notification = document.createElement("div");
                    (notification.textContent = "Form data restored!"),
                      Object.assign(notification.style, {
                        position: "fixed",
                        top: "20px",
                        right: "20px",
                        backgroundColor: "#4a5464",
                        color: "#c5d0db",
                        padding: "10px",
                        borderRadius: "5px",
                        zIndex: "9999",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                      }),
                      document.body.appendChild(notification),
                      setTimeout(() => notification.remove(), 2e3);
                  }),
                  headerContainer.append(headingClone, copyButton, pasteButton),
                  heading.parentNode.replaceChild(headerContainer, heading);
              }
            }),
            addCustomSmileyButtons(),
            (() => {
              const smileyBox = document.getElementById("smiley-box");
              if (!smileyBox) return;
              const bbcodeStatus = smileyBox.querySelector(".bbcode-status"),
                usernameElement = document.querySelector(".username-coloured"),
                isLoregamer =
                  usernameElement &&
                  "loregamer" === usernameElement.textContent.trim();
              bbcodeStatus &&
                ((bbcodeStatus.innerHTML = `\n        <hr />\n        <button type="button" class="button button-secondary custom-button" id="insert-mod-template">Insert Mod Template</button>\n        <button type="button" class="button button-secondary custom-button" id="insert-table">Insert Table</button>\n        <button type="button" class="button button-secondary custom-button" id="ping-bloomery" style="display: ${isLoregamer ? "inline-block" : "none"};">Ping Bloomery</button>\n      `),
                document
                  .getElementById("insert-mod-template")
                  .addEventListener("click", (e) => {
                    e.preventDefault(), insertModTemplate();
                  }),
                document
                  .getElementById("insert-table")
                  .addEventListener("click", (e) => {
                    e.preventDefault(), insertTable();
                  }),
                document
                  .getElementById("ping-bloomery")
                  .addEventListener("click", (e) => {
                    e.preventDefault(), insertBloomeryPing();
                  }));
            })(),
            positionSmileyBox(),
            positionEditorHeader();
          const vaultContainer = document.createElement("div");
          vaultContainer.style.marginTop = "10px";
          const vaultLink = document.createElement("a");
          (vaultLink.href = "javascript:void(0);"),
            Object.assign(vaultLink.style, {
              color: "rgb(58, 128, 234)",
              fontSize: "1em",
              display: "inline-flex",
              alignItems: "center",
              textDecoration: "none",
            }),
            (vaultLink.innerHTML =
              '<img src="https://f.rpghq.org/V4gHDnvTTgpf.webp" width="16" height="16" style="margin-right: 5px;"> Open Vault'),
            (vaultLink.onclick = (e) => {
              e.preventDefault(),
                window.open(
                  "https://vault.rpghq.org/",
                  "RPGHQVault",
                  "width=800,height=800,resizable=yes,scrollbars=yes"
                );
            }),
            vaultContainer.appendChild(vaultLink),
            textArea.parentNode.insertBefore(
              vaultContainer,
              textArea.nextSibling
            ),
            window.addEventListener("resize", () => {
              positionSmileyBox(), positionEditorHeader();
            }),
            window.addEventListener("scroll", () => {
              positionSmileyBox(), positionEditorHeader();
            });
        };
      // window.addEventListener("beforeunload", (e) => {
      //   if (isFormSubmitting) return;
      //   const msg = "You have unsaved changes. Are you sure you want to leave?";
      //   e.returnValue = msg;
      //   return msg;
      // });
      // =============================
      // Run Initialization
      // =============================
      // Run immediately rather than waiting for window load
      (() => {
        const style = document.createElement("style");
        (style.textContent =
          "\n      .bbcode-bracket { color: #D4D4D4; }\n      .bbcode-tag-0 { color: #569CD6; }\n      .bbcode-tag-1 { color: #CE9178; }\n      .bbcode-tag-2 { color: #DCDCAA; }\n      .bbcode-tag-3 { color: #C586C0; }\n      .bbcode-tag-4 { color: #4EC9B0; }\n      .bbcode-attribute { color: #9CDCFE; }\n      .bbcode-list-item, .bbcode-smiley { color: #FFD700; }\n      #bbcode-highlight {\n        white-space: pre-wrap;\n        word-wrap: break-word;\n        position: absolute;\n        top: 0; left: 0;\n        z-index: 3;\n        width: 100%; height: 100%;\n        overflow: hidden;\n        pointer-events: none;\n        box-sizing: border-box;\n        padding: 3px;\n        font-family: Verdana, Helvetica, Arial, sans-serif;\n        font-size: 11px;\n        line-height: 15.4px;\n        background-color: transparent;\n        color: transparent;\n        transition: all 0.5s ease, height 0.001s linear;\n      }\n      #message {\n        position: relative;\n        z-index: 2;\n        background: transparent;\n        color: rgb(204, 204, 204);\n        caret-color: white;\n        width: 100%;\n        height: 100%;\n        padding: 3px;\n        box-sizing: border-box;\n        resize: none;\n        overflow: auto;\n        font-family: Verdana, Helvetica, Arial, sans-serif;\n        font-size: 11px;\n        line-height: 15.4px;\n      }\n      .editor-container { position: relative; width: 100%; height: auto; }\n      .bbcode-link { color: #5D8FBD; }\n      .smiley-button, .custom-smiley-button {\n        display: inline-flex; justify-content: center; align-items: center;\n        width: 22px; height: 22px; margin: 2px;\n        text-decoration: none; vertical-align: middle; overflow: hidden;\n      }\n      .smiley-button img, .custom-smiley-button img {\n        max-width: 80%; max-height: 80%; object-fit: contain;\n      }\n      .emoji-smiley { font-size: 18px; display: flex; justify-content: center; align-items: center; width: 80%; height: 80%; }\n      #smiley-box {\n        position: absolute; max-height: 80vh; width: 17%;\n        overflow-y: auto; border-radius: 5px; z-index: 1000;\n      }\n      .smiley-group { margin-bottom: 10px; }\n      #smiley-box a { color: #5D8FBD; text-decoration: none; }\n      #smiley-box a:hover { text-decoration: underline; }\n      #abbc3_buttons.fixed { position: fixed; top: 0; z-index: 1000; background-color: #3A404A !important; }\n      .abbc3_buttons_row.fixed { background-color: #3A404A !important; position: fixed; top: 0; z-index: 1000; }\n      .custom-buttons-container { margin-top: 10px; }\n      .custom-button { margin-bottom: 5px; margin-right: 5px; }\n      .smiley-group-separator { margin: 10px 0; }\n      @media (max-width: 768px) {\n        #smiley-box {\n          position: static !important; width: 100% !important;\n          max-height: none !important; overflow-y: visible !important; margin-bottom: 10px;\n        }\n        .smiley-button, .custom-smiley-button { width: 36px; height: 36px; }\n        .smiley-button img, .custom-smiley-button img { width: 30px; height: 30px; }\n        .emoji-smiley { font-size: 24px; }\n      }\n    "),
          document.head.appendChild(style);
      })(),
        initialize(),
        (() => {
          const postForm = document.getElementById("postform");
          postForm && postForm.addEventListener("submit", () => {});
        })(),
        (() => {
          // Immediate check for existing palette
          const colorPalette = document.querySelector(
            ".colour-palette.horizontal-palette"
          );
          colorPalette && addCustomColorsToExistingPalette(colorPalette);
          // Set up a mutation observer to watch for the palette being added to the DOM
          // Start observing the document body for palette additions
          new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              "childList" === mutation.type &&
                mutation.addedNodes.length > 0 &&
                mutation.addedNodes.forEach((node) => {
                  if (node.nodeType === Node.ELEMENT_NODE) {
                    const palette =
                      node.classList &&
                      node.classList.contains("colour-palette")
                        ? node
                        : node.querySelector(
                            ".colour-palette.horizontal-palette"
                          );
                    palette && addCustomColorsToExistingPalette(palette);
                  }
                });
            });
          }).observe(document.body, {
            childList: !0,
            subtree: !0,
          });
          // Add direct event listeners to color buttons - but only once
          const addColorButtonListeners = () => {
            document
              .querySelectorAll(
                '.bbcode-palette-colour, .color-palette-trigger, [data-bbcode="color"], .colour-palette-trigger'
              )
              .forEach((button) => {
                // Skip if we've already added a listener
                "true" !== button.dataset.customListenerAdded &&
                  // Add a click listener that will add our custom colors when the palette appears
                  (button.addEventListener(
                    "click",
                    () => {
                      // Wait a short time for the palette to be added to the DOM
                      setTimeout(() => {
                        const palette = document.querySelector(
                          ".colour-palette.horizontal-palette"
                        );
                        palette && addCustomColorsToExistingPalette(palette);
                      }, 50);
                    },
                    {
                      once: !1,
                    }
                  ), // Allow multiple clicks
                  // Mark this button as having a listener added
                  (button.dataset.customListenerAdded = "true"));
              });
          };
          // Initial call
          addColorButtonListeners();
          // Set up an interval to check for new color buttons, but limit it to run for 30 seconds
          // after page load to avoid unnecessary processing
          let checkCount = 0;
          const intervalId = setInterval(() => {
            addColorButtonListeners(),
              checkCount++,
              checkCount >= 30 && clearInterval(intervalId);
          }, 1e3);
        })();
    },
  });
  // RPGHQ - Thousands Comma Formatter
  /**
   * Adds commas to large numbers in forum posts and statistics.
   * Original script by loregamer, adapted for the RPGHQ Userscript Manager.
   * License: MIT
   *
   * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/commaFormatter.md for documentation
   */ function gmSetValue(key, value) {
    // eslint-disable-next-line no-undef
    GM_setValue("RPGHQ_Manager_" + key, value);
  }
  // --- Core Logic ---
  // Object to hold the runtime state of scripts (enabled/disabled)
  const scriptStates = {},
    loadedScripts = {};
  // Object to hold loaded script modules and their cleanup functions
  function initializeScriptStates() {
    log("Initializing script states..."),
      SCRIPT_MANIFEST.forEach((script) => {
        const storageKey = `script_enabled_${script.id}`;
        // Load state from GM storage, falling back to manifest default
        // Prefix for GM_setValue/GM_getValue keys
        // --- GM Wrappers ---
        var key, defaultValue;
        (scriptStates[script.id] =
          ((key = storageKey),
          (defaultValue = script.enabledByDefault),
          GM_getValue("RPGHQ_Manager_" + key, defaultValue))),
          log(
            `Script '${script.name}' (${script.id}): ${scriptStates[script.id] ? "Enabled" : "Disabled"} (Default: ${script.enabledByDefault})`
          );
      }),
      log("Script states initialized:", scriptStates);
  }
  // Find a script definition in the manifest by its ID
  // Execute functions and scripts based on the load order for a specific phase
  function executeLoadOrderForPhase(phase) {
    log(`Executing load order for phase: ${phase}`);
    const itemsToLoad = loadOrder[phase] || [];
    0 !== itemsToLoad.length
      ? (itemsToLoad.forEach((item) => {
          // Check if it's a known shared function
          if ("function" == typeof sharedUtils[item]) {
            log(`-> Executing shared function: ${item}`);
            try {
              sharedUtils[item]();
            } catch (err) {
              error(`Error executing shared function ${item}:`, err);
            }
          }
          // Check if it's a script ID
          else {
            const script =
              ((scriptId = item),
              SCRIPT_MANIFEST.find((script) => script.id === scriptId));
            script
              ? // Check if script is enabled
                scriptStates[script.id]
                ? (log(
                    `-> Loading script from load order: ${script.name} (${script.id}) for phase: ${phase}`
                  ),
                  loadScript(script))
                : log(`-> Script ${item} skipped (disabled).`)
              : warn(
                  `-> Item "${item}" in load_order.json is not a known shared function or script ID.`
                );
          }
          var scriptId;
        }),
        log(`Finished executing load order for phase: ${phase}`))
      : log(`No items defined in load order for phase: ${phase}`);
  }
  // Map of script ids to their modules
  const scriptModules = {
    commaFormatter: Object.freeze({
      __proto__: null,
      init: function () {
        log("Thousands Comma Formatter initialized!");
        // Get user settings
        const formatFourDigits = GM_getValue(
            "RPGHQ_Manager_commaFormatter_formatFourDigits",
            !1
          ),
          numberRegex = formatFourDigits ? /\b\d{4,}\b/g : /\b\d{5,}\b/g;
        // Create regex based on settings
        // Core formatting function
        function formatNumberWithCommas(number) {
          return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        // Process forum statistics (only on index page)
        // Process all elements with numbers that need commas
        function processElements() {
          document
            .querySelectorAll(
              "dd.posts, dd.profile-posts, dd.views, span.responsive-show.left-box, .column2 .details dd"
            )
            .forEach((element) => {
              if (
                element.classList.contains("posts") ||
                element.classList.contains("views") ||
                (element.parentElement &&
                  element.parentElement.classList.contains("details"))
              ) {
                if (
                  element.previousElementSibling &&
                  "Joined:" ===
                    element.previousElementSibling.textContent.trim()
                )
                  return;
                element.childNodes.forEach((node) => {
                  node.nodeType === Node.TEXT_NODE &&
                    numberRegex.test(node.nodeValue) &&
                    (node.nodeValue = node.nodeValue.replace(
                      numberRegex,
                      (match) => formatNumberWithCommas(match)
                    ));
                });
              } else if (element.classList.contains("profile-posts")) {
                const anchor = element.querySelector("a");
                anchor &&
                  numberRegex.test(anchor.textContent) &&
                  (anchor.textContent = anchor.textContent.replace(
                    numberRegex,
                    (match) => formatNumberWithCommas(match)
                  ));
              } else if (element.classList.contains("responsive-show")) {
                const strong = element.querySelector("strong");
                strong &&
                  numberRegex.test(strong.textContent) &&
                  (strong.textContent = strong.textContent.replace(
                    numberRegex,
                    (match) => formatNumberWithCommas(match)
                  ));
              }
              element.querySelectorAll("strong").forEach((strong) => {
                numberRegex.test(strong.textContent) &&
                  (strong.textContent = strong.textContent.replace(
                    numberRegex,
                    (match) => formatNumberWithCommas(match)
                  ));
              });
            });
        }
        // Initial processing
        processElements(),
          (function () {
            // Only run on index.php
            if (!window.location.pathname.endsWith("index.php")) return;
            let totalTopics = 0,
              totalPosts = 0;
            // Get all posts and topics elements
            const postsElements = document.querySelectorAll("dd.posts"),
              topicsElements = document.querySelectorAll("dd.topics");
            // Function to format numbers, only adding commas for 5+ digits (or 4+ if enabled)
            function formatStatNumber(num) {
              return formatFourDigits
                ? num.toString().length >= 4
                  ? formatNumberWithCommas(num)
                  : num.toString()
                : num.toString().length >= 5
                  ? formatNumberWithCommas(num)
                  : num.toString();
            }
            // Find and update the statistics block
            // Sum up posts
            postsElements.forEach((element) => {
              const postsText = element.childNodes[0].textContent
                  .trim()
                  .replace(/,/g, ""),
                posts = parseInt(postsText);
              isNaN(posts) || (totalPosts += posts);
            }),
              // Sum up topics
              topicsElements.forEach((element) => {
                const topicsText = element.childNodes[0].textContent
                    .trim()
                    .replace(/,/g, ""),
                  topics = parseInt(topicsText);
                isNaN(topics) || (totalTopics += topics);
              });
            const statsBlock = document.querySelector(".stat-block.statistics");
            if (statsBlock) {
              const statsText = statsBlock.querySelector("p");
              if (statsText) {
                const existingText = statsText.innerHTML,
                  membersMatch = existingText.match(
                    /Total members <strong>(\d+)<\/strong>/
                  ),
                  newestMemberMatch = existingText.match(
                    /(Our newest member <strong>.*?<\/strong>)/
                  );
                // Keep the members count and newest member info, but update topics and posts
                membersMatch &&
                  newestMemberMatch &&
                  (statsText.innerHTML = `Total posts <strong>${formatStatNumber(totalPosts)}</strong> • Total topics <strong>${formatStatNumber(totalTopics)}</strong> • Total members <strong>${membersMatch[1]}</strong> • ${newestMemberMatch[1]}`);
              }
            }
          })();
        // Set up observer to handle dynamic content
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            "childList" === mutation.type && processElements();
          });
        });
        // Start observing
        // Return cleanup function
        return (
          observer.observe(document.body, {
            childList: !0,
            subtree: !0,
          }),
          {
            cleanup: () => {
              log("Thousands Comma Formatter cleanup"),
                // Disconnect observer
                observer.disconnect();
            },
            // We can't easily "undo" the formatting without a page reload
            // since we directly modified text nodes
          }
        );
      },
    }),
    bbcode: bbcode,
    kalareact: kalareact,
    notifications: notifications,
    pinThreads: pinThreads,
    separateReactions: separateReactions,
    memberSearch: memberSearch,
    randomTopic: randomTopic,
    recentTopicsFormat: recentTopicsFormat,
  };
  // Load a single script by its manifest entry
  function loadScript(script) {
    if (loadedScripts[script.id])
      log(`Script ${script.name} already loaded, skipping.`);
    else if (shouldLoadScript(script)) {
      // Check if the script should run on the current URL
      // log(`Loading script: ${script.name} (${script.id})`); // Phase is determined by load_order.json
      log(`Loading script: ${script.name} (${script.id})`);
      try {
        // Get the module from our imports
        const module = scriptModules[script.id];
        if (!module) return void error(`Script module ${script.id} not found`);
        // Check if the module has an init function
        if ("function" == typeof module.init) {
          // Call init and store any returned cleanup function or object
          const result = module.init();
          // Store the loaded module and any cleanup function
          (loadedScripts[script.id] = {
            module: module,
            cleanup:
              result && "function" == typeof result.cleanup
                ? result.cleanup
                : null,
          }),
            log(`Successfully loaded script: ${script.name}`);
        } else warn(`Script ${script.name} has no init function, skipping.`);
      } catch (err) {
        error(`Failed to load script ${script.name}:`, err);
      }
    } else log(`Script ${script.name} not loaded: URL pattern did not match.`);
  }
  // Unload a single script by its ID
  function unloadScript(scriptId) {
    const scriptInfo = loadedScripts[scriptId];
    if (scriptInfo) {
      // Call cleanup function if it exists
      if (
        (log(`Unloading script: ${scriptId}`),
        scriptInfo.cleanup && "function" == typeof scriptInfo.cleanup)
      )
        try {
          scriptInfo.cleanup(),
            log(`Cleanup completed for script: ${scriptId}`);
        } catch (err) {
          error(`Error during cleanup for script ${scriptId}:`, err);
        }
      // Remove the script from loadedScripts
      delete loadedScripts[scriptId], log(`Script ${scriptId} unloaded.`);
    } else log(`Script ${scriptId} not loaded, nothing to unload.`);
  }
  // --- Script Toggle Event Handler ---
  // --- UI Handlers ---
  function handleRenderScriptsGridView(container, scripts, states) {
    renderScriptsGridView(container, scripts, states, handleShowScriptSettings);
  }
  function handleShowScriptSettings(script) {
    !(function (script, renderScriptSettingsContent, saveScriptSetting = null) {
      log(`Showing settings modal for script: ${script.name}`);
      // Create modal if it doesn't exist
      let modal = document.getElementById("script-settings-modal");
      modal ||
        ((modal = document.createElement("div")),
        (modal.id = "script-settings-modal"),
        (modal.className = "settings-modal"),
        document.body.appendChild(modal)),
        // Populate modal with script settings
        (modal.innerHTML = `\n    <div class="settings-modal-content">\n      <div class="settings-modal-header">\n        <h2 class="settings-modal-title">${script.name} Settings</h2>\n        <span class="settings-modal-close">&times;</span>\n      </div>\n    \n      ${script.settings && script.settings.length > 0 && renderScriptSettingsContent ? renderScriptSettingsContent(script, saveScriptSetting) : '<div class="empty-state">\n              <div class="empty-state-icon">\n                <i class="fa fa-cog"></i>\n              </div>\n              <h3 class="empty-state-message">No Settings Available</h3>\n              <p>This script doesn\'t have any configurable settings.</p>\n            </div>'}\n    \n      <div class="script-info" style="margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 15px;">\n        <h3>Script Information</h3>\n        <table class="data-table">\n          <tr>\n            <th>ID</th>\n            <td>${script.id}</td>\n          </tr>\n          <tr>\n            <th>Version</th>\n            <td>${script.version}</td>\n          </tr>\n          <tr>\n            <th>Category</th>\n            <td>${script.category || "Uncategorized"}</td>\n          </tr>\n          <tr>\n            <th>Execution Phase</th>\n            <td>${script.executionPhase || "Not specified"}</td>\n          </tr>\n          <tr>\n            <th>Matches</th>\n            <td>${script.matches ? script.matches.join("<br>") : "Not specified"}</td>\n          </tr>\n        </table>\n      </div>\n    \n      <div class="info-note" style="margin-top: 15px;">\n        <strong>Note:</strong> Changes to settings may require a page reload to take full effect.\n      </div>\n    </div>\n  `),
        // Show the modal
        (modal.style.display = "block"),
        // Add event listeners
        modal
          .querySelector(".settings-modal-close")
          .addEventListener("click", () => {
            modal.style.display = "none";
          }),
        modal.addEventListener("click", (e) => {
          e.target === modal && (modal.style.display = "none");
        }),
        // If we have settings, add event listeners for inputs
        script.settings &&
          script.settings.length > 0 &&
          saveScriptSetting &&
          setTimeout(() => {
            modal.querySelectorAll(".setting-input").forEach((input) => {
              const settingId = input.dataset.settingId;
              if (!settingId) return;
              const eventType = "checkbox" === input.type ? "change" : "input";
              input.addEventListener(eventType, (e) => {
                const value =
                  "checkbox" === input.type ? input.checked : input.value;
                saveScriptSetting(script.id, settingId, value);
              });
            });
          }, 100);
    })(script, renderScriptSettingsContent, saveScriptSetting);
  }
  function saveScriptSetting(scriptId, settingId, value) {
    gmSetValue(`script_setting_${scriptId}_${settingId}`, value),
      log(`Saved setting: ${scriptId}.${settingId} = ${value}`);
  }
  // --- Tab Content Handling ---
  function handleLoadTabContent(tabName) {
    const contentContainer = document.getElementById("mod-manager-content");
    contentContainer &&
      loadTabContent(tabName, {
        container: contentContainer,
        scripts: SCRIPT_MANIFEST,
        scriptStates: scriptStates,
        renderScriptsGridView: handleRenderScriptsGridView,
      });
  }
  // --- Modal Visibility Logic ---
  function toggleModalVisibility() {
    const modal = document.getElementById("mod-manager-modal"),
      isVisible = modal && "block" === modal.style.display;
    log(
      `Toggling modal visibility. Currently ${isVisible ? "visible" : "hidden"}.`
    ),
      isVisible
        ? hideModal()
        : /**
           * Shows the userscript manager modal and sets up tab functionality.
           *
           * @param {Object} options - Configuration options
           * @param {Function} options.loadTabContent - Function to load tab content
           * @param {Function} options.hideModal - Function to hide the modal
           */
          (function ({ loadTabContent: loadTabContent, hideModal: hideModal }) {
            log("Showing userscript manager modal...");
            let modal = document.getElementById("mod-manager-modal");
            modal ||
              ((modal = document.createElement("div")),
              (modal.id = "mod-manager-modal"),
              (modal.className = "mod-manager-modal"),
              (modal.innerHTML =
                '\n      <div class="mod-manager-modal-content">\n        <div class="mod-manager-header">\n          <h2 class="mod-manager-title">RPGHQ Userscript Manager</h2>\n          <span class="mod-manager-close">&times;</span>\n        </div>\n        <div class="mod-manager-tabs">\n          <div class="mod-manager-tab active" data-tab="installed">\n            <i class="fa fa-puzzle-piece"></i> Installed Scripts\n          </div>\n          <div class="mod-manager-tab" data-tab="forum">\n            <i class="fa fa-sliders"></i> Forum Preferences\n          </div>\n          \x3c!-- Settings tab completely hidden --\x3e\n        </div>\n        <div class="mod-manager-content" id="mod-manager-content">\n          \x3c!-- Content loaded dynamically --\x3e\n        </div>\n      </div>\n    '),
              document.body.appendChild(modal),
              // Add event listeners
              modal
                .querySelector(".mod-manager-close")
                .addEventListener("click", () => {
                  hideModal();
                }),
              modal.addEventListener("click", (e) => {
                e.target === modal && hideModal();
              }),
              // Tab switching
              modal.querySelectorAll(".mod-manager-tab").forEach((tab) => {
                tab.addEventListener("click", () => {
                  document.querySelectorAll(".mod-manager-tab").forEach((t) => {
                    t.classList.remove("active");
                  }),
                    tab.classList.add("active"),
                    loadTabContent(tab.dataset.tab);
                });
              })),
              (modal.style.display = "block"),
              (document.body.style.overflow = "hidden"),
              // Initial view - load the first tab (Installed Scripts)
              loadTabContent("installed");
          })({
            loadTabContent: handleLoadTabContent,
            hideModal: hideModal,
          });
  }
  // --- Add Button to Profile Dropdown ---
  // Add Font Awesome CSS if not already present
  function addMenuButton(toggleVisibilityCallback) {
    // Ensure FA is loaded for the icon
    !(function () {
      if (!document.querySelector('link[href*="font-awesome"]')) {
        const link = document.createElement("link");
        (link.rel = "stylesheet"),
          (link.href =
            "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"),
          document.head.appendChild(link),
          log("RPGHQ Manager: Added Font Awesome CSS link.");
      }
    })();
    const profileDropdown = document.querySelector(
      '.header-profile.dropdown-container .dropdown-contents[role="menu"]'
    );
    if (!profileDropdown)
      return void warn("RPGHQ Manager: Could not find profile dropdown menu.");
    // Find the logout button more robustly
    const logoutButton = Array.from(
      profileDropdown.querySelectorAll("li")
    ).find((li) => {
      const link = li.querySelector("a");
      return (
        link &&
        (link.textContent.trim().includes("Logout") ||
          "Logout" === link.getAttribute("title"))
      );
    });
    if (!logoutButton)
      return void warn(
        "RPGHQ Manager: Could not find logout button for reference."
      );
    // Check if button already exists
    const existingButton = profileDropdown.querySelector(
      'a[title="RPGHQ Userscript Manager"]'
    );
    if (existingButton)
      return (
        log("RPGHQ Manager: Button already exists, updating listener."),
        void (existingButton.onclick = function (e) {
          e.preventDefault(), toggleVisibilityCallback();
        })
      );
    // Create the new button
    const userscriptsButton = document.createElement("li");
    (userscriptsButton.innerHTML =
      '\n    <a href="#" title="RPGHQ Userscript Manager">\n      <i class="fa fa-puzzle-piece"></i> View Userscripts\n    </a>\n  '),
      // Add click handler
      (userscriptsButton.querySelector("a").onclick = function (e) {
        e.preventDefault(), toggleVisibilityCallback();
      }),
      // Insert before logout button
      profileDropdown.insertBefore(userscriptsButton, logoutButton),
      log("RPGHQ Manager: 'View Userscripts' button added to profile menu.");
  }
  // --- Initialization ---
  document.addEventListener("script-toggle", (event) => {
    const { scriptId: scriptId, enabled: enabled } = event.detail;
    !(function (
      scriptId,
      newState,
      scriptStates,
      gmSetValue,
      scriptManifest,
      loadScript,
      unloadScript
    ) {
      const storageKey = `script_enabled_${scriptId}`;
      log(
        `Toggling script '${scriptId}' to ${newState ? "Enabled" : "Disabled"}`
      ),
        // Update the runtime state
        (scriptStates[scriptId] = newState),
        // Save the new state to GM storage
        gmSetValue(storageKey, newState),
        // Trigger immediate loading/unloading based on new state
        log(
          `State for ${scriptId} saved as ${newState}. Triggering script ${newState ? "loading" : "unloading"}...`
        );
      // Find the script in the manifest
      const script = scriptManifest.find((s) => s.id === scriptId);
      script
        ? // Load or unload the script based on new state
          newState
          ? loadScript(script)
          : unloadScript(scriptId)
        : error(`Could not find script with ID ${scriptId} in manifest.`);
    })(
      scriptId,
      enabled,
      scriptStates,
      gmSetValue,
      SCRIPT_MANIFEST,
      loadScript,
      unloadScript
    );
  }),
    log("Initializing RPGHQ Userscript Manager..."),
    // Initialize script states
    initializeScriptStates(),
    // Execute load order for document-start phase immediately
    executeLoadOrderForPhase("document-start"),
    // Set up listeners for other execution phases
    document.addEventListener("DOMContentLoaded", () => {
      executeLoadOrderForPhase("document-end"),
        // Add menu button (needs DOM ready)
        addMenuButton(toggleModalVisibility);
    }),
    window.addEventListener("load", () => {
      executeLoadOrderForPhase("document-idle");
    }),
    // Set up a phase for after DOM is fully ready and rendered
    setTimeout(() => {
      executeLoadOrderForPhase("after_dom");
    }, 500), // Small delay to ensure everything is loaded
    // Add keyboard shortcut listener for Insert key
    document.addEventListener("keydown", (event) => {
      // Insert key = keyCode 45
      if (45 === event.keyCode) {
        // Don't toggle if focus is on an input element
        if (
          "INPUT" === document.activeElement.tagName ||
          "TEXTAREA" === document.activeElement.tagName ||
          document.activeElement.isContentEditable
        )
          return void log(
            "Insert key pressed in input field, ignoring modal toggle."
          );
        event.preventDefault(), toggleModalVisibility();
      }
    });
})();
