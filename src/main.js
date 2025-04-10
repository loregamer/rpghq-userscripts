// Main userscript entry point
import './styles.css'; // Import CSS - Rollup handles injection or bundling
import { SCRIPT_MANIFEST } from "./manifest.js";

// --- Constants ---
const GM_PREFIX = "RPGHQ_Manager_"; // Prefix for GM_setValue/GM_getValue keys

// --- GM Wrappers ---
function gmGetValue(key, defaultValue) {
  // eslint-disable-next-line no-undef
  return GM_getValue(GM_PREFIX + key, defaultValue);
}

function gmSetValue(key, value) {
  // eslint-disable-next-line no-undef
  GM_setValue(GM_PREFIX + key, value);
}

// --- Core Logic ---

// Object to hold the runtime state of scripts (enabled/disabled)
const scriptStates = {};

function initializeScriptStates() {
  console.log("Initializing script states...");
  SCRIPT_MANIFEST.forEach((script) => {
    const storageKey = `script_enabled_${script.id}`;
    // Load state from GM storage, falling back to manifest default
    scriptStates[script.id] = gmGetValue(storageKey, script.enabledByDefault);
    console.log(
      `Script '${script.name}' (${script.id}): ${
        scriptStates[script.id] ? "Enabled" : "Disabled"
      } (Default: ${script.enabledByDefault})`
    );
  });
  console.log("Script states initialized:", scriptStates);
}

function loadEnabledScripts() {
  console.log("Loading enabled scripts...");
  SCRIPT_MANIFEST.forEach((script) => {
    if (scriptStates[script.id]) {
      console.log(`Loading script: ${script.name} (from ${script.path})`);
      // TODO: Phase 5 - Implement dynamic script loading (e.g., using dynamic import())
      // For now, we just log.
      // Example (needs adjustments for userscript environment):
      // import(script.path)
      //   .then(module => {
      //     if (typeof module.init === 'function') {
      //       module.init(); // Assuming scripts have an init function
      //     }
      //   })
      //   .catch(err => console.error(`Failed to load script ${script.name}:`, err));
    }
  });
  console.log("Finished loading scripts.");
}

// --- UI Creation (Phase 4) ---
function createManagerModal() {
  // Return the created elements instead of appending/styling directly
  console.log("Creating manager modal structure...");

  // Create overlay
  const overlay = document.createElement("div");
  overlay.id = "rpghq-modal-overlay";
  // Styles handled by CSS

  // Create modal container
  const modal = document.createElement("div");
  modal.id = "rpghq-manager-modal";
  // Styles handled by CSS

  // Modal Header
  const header = document.createElement("div");
  header.className = "modal-header";

  const title = document.createElement("h2");
  title.textContent = "RPGHQ Userscript Manager";

  const closeButton = document.createElement("button");
  closeButton.id = "rpghq-modal-close";
  closeButton.textContent = "×";
  // Styles handled by CSS

  header.appendChild(title);
  header.appendChild(closeButton);

  // Modal Tabs
  const tabsContainer = document.createElement("div");
  tabsContainer.className = "modal-tabs";

  const tabButtons = ["Installed Scripts", "Forum Preferences", "Settings"];
  tabButtons.forEach((text, index) => {
    const button = document.createElement("button");
    button.dataset.tabTarget = `tab-${index}`;
    button.textContent = text;
    // Styles handled by CSS
    if (index === 0) {
      button.classList.add("active"); // Mark first tab as active initially
      // Active styles handled by CSS
    }
    tabsContainer.appendChild(button);
  });

  // Modal Content Area
  const contentContainer = document.createElement("div");
  contentContainer.className = "modal-content";

  // Create content divs for each tab (initially hidden except the first)
  tabButtons.forEach((_, index) => {
    const tabContent = document.createElement("div");
    tabContent.id = `tab-${index}`;
    tabContent.className = "tab-pane";
    if (index === 0) {
      tabContent.classList.add("active"); // Add active class to first pane

      // Add View Switcher for Installed Scripts tab
      const viewSwitcher = document.createElement("div");
      viewSwitcher.className = "view-switcher";

      const gridButton = document.createElement("button");
      gridButton.className = "view-btn active"; // Default to grid view
      gridButton.dataset.view = "grid";
      gridButton.innerHTML = "&#x25A6;"; // Placeholder Grid Icon (change later if using FontAwesome)
      gridButton.title = "Grid View";

      const listButton = document.createElement("button");
      listButton.className = "view-btn";
      listButton.dataset.view = "list";
      listButton.innerHTML = "&#x2630;"; // Placeholder List Icon
      listButton.title = "List View";

      viewSwitcher.appendChild(gridButton);
      viewSwitcher.appendChild(listButton);
      tabContent.appendChild(viewSwitcher);

      // Add container for script cards/rows
      const scriptsDisplayContainer = document.createElement("div");
      scriptsDisplayContainer.className = "scripts-display-container";
      tabContent.appendChild(scriptsDisplayContainer);
    } else {
      // Placeholder content for other tabs
      // tabContent.textContent = `Content for ${tabButtons[index]}`;
      // Add placeholder content for other tabs using dedicated render functions
      if (index === 1) {
        renderForumPreferencesTab(tabContent);
      } else if (index === 2) {
        renderSettingsTab(tabContent);
      }
    }
    contentContainer.appendChild(tabContent);
  });

  // Assemble Modal
  modal.appendChild(header);
  modal.appendChild(tabsContainer);
  modal.appendChild(contentContainer);

  console.log("Manager modal structure created.");
  // Return elements for setup in initializeManager
  return { modalElement: modal, overlayElement: overlay };
}

function createSettingsModal() {
  console.log("Creating settings modal structure...");

  // Settings Modal Container (no separate overlay needed, sits on top)
  const modal = document.createElement("div");
  modal.id = "rpghq-settings-modal"; // Different ID
  // Styles handled by CSS

  // Settings Modal Header
  const header = document.createElement("div");
  header.className = "settings-modal-header";

  const title = document.createElement("h2");
  title.id = "rpghq-settings-modal-title"; // ID to update title
  title.textContent = "Script Settings"; // Default title

  const closeButton = document.createElement("button");
  closeButton.id = "rpghq-settings-modal-close";
  closeButton.textContent = "×";
  // Styles handled by CSS

  header.appendChild(title);
  header.appendChild(closeButton);

  // Settings Modal Content Area
  const contentContainer = document.createElement("div");
  contentContainer.className = "settings-modal-content";

  // Area for dynamically rendered settings
  const settingsArea = document.createElement("div");
  settingsArea.className = "settings-area";
  settingsArea.innerHTML = "<p>Loading settings...</p>"; // Placeholder

  // Area for script metadata
  const scriptInfoArea = document.createElement("div");
  scriptInfoArea.className = "script-info";
  scriptInfoArea.innerHTML = "<p>Loading script info...</p>"; // Placeholder

  contentContainer.appendChild(settingsArea);
  contentContainer.appendChild(scriptInfoArea);

  // Assemble Modal
  modal.appendChild(header);
  modal.appendChild(contentContainer);

  console.log("Settings modal structure created.");
  return modal; // Return the element
}

// --- UI Rendering (Phase 4 - Installed Scripts Tab) ---

function createScriptToggle(scriptId, initialState) {
  const label = document.createElement("label");
  label.className = "toggle-switch";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = initialState;
  checkbox.dataset.scriptId = scriptId;

  const slider = document.createElement("span");
  slider.className = "slider";

  label.appendChild(checkbox);
  label.appendChild(slider);

  // Event listener for state change
  checkbox.addEventListener("change", (event) => {
    const scriptId = event.target.dataset.scriptId;
    const newState = event.target.checked;
    const storageKey = `script_enabled_${scriptId}`;

    console.log(
      `Toggling script '${scriptId}' to ${newState ? "Enabled" : "Disabled"}`
    );

    // Update the runtime state
    scriptStates[scriptId] = newState;

    // Save the new state to GM storage
    gmSetValue(storageKey, newState);

    // Optional: Trigger any immediate actions needed on toggle (e.g., logging, or later, script loading/unloading)
    console.log(`State for ${scriptId} saved as ${newState}.`);
    // TODO: Phase 5 - Add logic here or elsewhere to handle dynamic loading/unloading if required immediately.
  });

  return label;
}

function renderScriptsGridView(container, scripts, states) {
  console.log("Rendering scripts in Grid View...");
  container.innerHTML = ""; // Clear previous content

  const gridWrapper = document.createElement("div");
  gridWrapper.className = "script-grid";

  if (scripts.length === 0) {
    container.innerHTML = '<p class="empty-state">No scripts found.</p>'; // TODO: Add icon later
    return;
  }

  scripts.forEach((script) => {
    const card = document.createElement("div");
    card.className = "script-card";

    // Simple Card Structure (based on description)
    const header = document.createElement("div");
    header.className = "script-card-header";

    const title = document.createElement("span");
    title.className = "script-card-title";
    title.textContent = script.name;

    const version = document.createElement("span");
    version.className = "script-card-version";
    version.textContent = `v${script.version}`;

    // TODO: Add category overlay if image is implemented

    // Add actual Toggle Switch
    const toggleSwitch = createScriptToggle(script.id, states[script.id]);

    header.appendChild(title);
    header.appendChild(toggleSwitch);
    header.appendChild(version);

    const description = document.createElement("p");
    description.className = "script-card-description";
    description.textContent = script.description || "No description available.";

    const footer = document.createElement("div");
    footer.className = "script-card-footer";

    // Settings Button (only if settings exist)
    if (script.settings && script.settings.length > 0) {
      const settingsButton = document.createElement("button");
      settingsButton.className = "btn btn-primary btn-small view-settings"; // Basic classes
      settingsButton.textContent = "Settings"; // TODO: Add icon later
      settingsButton.dataset.scriptId = script.id;
      // TODO: Add event listener for settings modal
      footer.appendChild(settingsButton);
    }

    card.appendChild(header);
    card.appendChild(description);
    card.appendChild(footer);
    gridWrapper.appendChild(card);
  });

  container.appendChild(gridWrapper);
}

function renderScriptsListView(container, scripts, states) {
  console.log("Rendering scripts in List View...");
  container.innerHTML = ""; // Clear previous content

  if (scripts.length === 0) {
    container.innerHTML = '<p class="empty-state">No scripts found.</p>'; // TODO: Add icon later
    return;
  }

  const table = document.createElement("table");
  table.className = "data-table script-list-table"; // Add specific class if needed

  // Table Header
  const thead = table.createTHead();
  const headerRow = thead.insertRow();
  const headers = [
    "Enabled",
    "Name",
    "Version",
    "Description",
    "Settings",
    "Actions",
  ];
  headers.forEach((text) => {
    const th = document.createElement("th");
    th.textContent = text;
    headerRow.appendChild(th);
  });

  // Table Body
  const tbody = table.createTBody();
  scripts.forEach((script) => {
    const row = tbody.insertRow();

    // Enabled Toggle
    const toggleCell = row.insertCell();
    toggleCell.className = "script-toggle-cell";
    toggleCell.appendChild(createScriptToggle(script.id, states[script.id]));

    // Name
    const nameCell = row.insertCell();
    nameCell.textContent = script.name;
    nameCell.style.fontWeight = "bold";

    // Version
    const versionCell = row.insertCell();
    versionCell.textContent = `v${script.version}`;

    // Description
    const descCell = row.insertCell();
    descCell.textContent = script.description || "-";

    // Settings Count/Badge
    const settingsCell = row.insertCell();
    const settingsCount = script.settings ? script.settings.length : 0;
    if (settingsCount > 0) {
      const badge = document.createElement("span");
      badge.className = "badge badge-primary"; // Basic classes
      badge.textContent = `${settingsCount} setting${
        settingsCount > 1 ? "s" : ""
      }`;
      settingsCell.appendChild(badge);
    } else {
      settingsCell.textContent = "-";
    }

    // Actions (Settings Button)
    const actionsCell = row.insertCell();
    if (settingsCount > 0) {
      const settingsButton = document.createElement("button");
      settingsButton.className = "btn btn-primary btn-small view-settings"; // Basic classes
      settingsButton.textContent = "Settings"; // TODO: Add icon later
      settingsButton.dataset.scriptId = script.id;
      // TODO: Add event listener for settings modal
      actionsCell.appendChild(settingsButton);
    }
  });

  container.appendChild(table);
}

// Placeholder function for rendering settings controls
function renderScriptSettingsContent(container, script) {
  console.log(`Rendering settings content for: ${script.name}`);
  container.innerHTML = ""; // Clear previous content

  if (!script.settings || script.settings.length === 0) {
    container.innerHTML = '<p class="empty-state">No Settings Available</p>'; // TODO: Add icon
    return;
  }

  // TODO: Implement actual rendering of controls based on script.settings
  container.innerHTML = "<p><i>Settings controls placeholder... Implement actual rendering later.</i></p>";
}

// Placeholder for Forum Preferences tab content
function renderForumPreferencesTab(container) {
  console.log("Rendering Forum Preferences tab...");
  container.innerHTML = `
    <div class="wip-banner">
      <i class="fa fa-wrench"></i> Work in Progress: Forum Preferences not yet implemented.
    </div>
    <p>This section will contain options to customize your forum experience.</p>
  `;
}

// Placeholder for Settings tab content
function renderSettingsTab(container) {
  console.log("Rendering Settings tab...");
  container.innerHTML = `
    <div class="wip-banner">
      <i class="fa fa-cog"></i> Work in Progress: Global Settings not yet implemented.
    </div>
    <p>This section will contain global settings for the script manager itself.</p>
  `;
}

// --- Add Button to Profile Dropdown ---
// Add Font Awesome CSS if not already present (basic check)
function ensureFontAwesome() {
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
    document.head.appendChild(link);
    console.log("RPGHQ Manager: Added Font Awesome CSS link.");
  }
}

function addMenuButton(toggleVisibilityCallback) {
  // Ensure FA is loaded for the icon
  ensureFontAwesome();

  const profileDropdown = document.querySelector(
    '.header-profile.dropdown-container .dropdown-contents[role="menu"]'
  );
  if (!profileDropdown) {
    console.warn("RPGHQ Manager: Could not find profile dropdown menu.");
    return;
  }

  // Find the logout button more robustly (check text content and attribute)
  const logoutButton = Array.from(profileDropdown.querySelectorAll("li")).find(
    (li) => {
      const link = li.querySelector("a");
      return (
        link &&
        (link.textContent.trim().includes("Logout") ||
          link.getAttribute("title") === "Logout")
      );
    }
  );

  if (!logoutButton) {
    console.warn("RPGHQ Manager: Could not find logout button in dropdown.");
    return; // Don't add if logout isn't found
  }

  // Check if button already exists
  if (profileDropdown.querySelector('.rpghq-manager-menu-item')) {
    console.log("RPGHQ Manager: Menu button already exists.");
    return;
  }

  const userscriptsButton = document.createElement("li");
  userscriptsButton.className = 'rpghq-manager-menu-item'; // Add class for identification
  userscriptsButton.innerHTML = `
        <a href="#" title="View Userscripts" role="menuitem" style="font-size:0.9em;">
          <i class="fa fa-puzzle-piece fa-fw"></i><span> View Userscripts</span>
        </a>
      `;

  // Insert before the logout button
  logoutButton.parentNode.insertBefore(userscriptsButton, logoutButton);

  // Add click listener
  userscriptsButton.querySelector("a").addEventListener("click", (e) => {
    e.preventDefault();
    console.log("RPGHQ Manager: Menu button clicked.");
    if (typeof toggleVisibilityCallback === "function") {
      toggleVisibilityCallback();
    }
  });

  console.log("RPGHQ Manager: 'View Userscripts' button added to profile menu.");
}

// --- Initialization ---
function initializeManager() {
  console.log("RPGHQ Userscript Manager Initializing...");
  initializeScriptStates();
  loadEnabledScripts();

  // --- CSS Injection ---
  // Note: styles.css is imported at the top and handled by Rollup.
  // However, we need to inject the *final* CSS string using GM_addStyle
  // for compatibility, especially if the Rollup CSS plugin isn't perfect
  // or if not using one.
  // We will copy the contents of src/styles.css here manually for now.
  // TODO: Find a better way to automatically include the built CSS content.
  // eslint-disable-next-line no-undef
  if (typeof GM_addStyle !== "function") {
    console.error("RPGHQ Manager Error: GM_addStyle is not available. Styles will not be applied.");
  } else {
    // Fetch the content of styles.css - this is a placeholder.
    // Ideally, Rollup would make this available or we'd fetch it.
    // For now, we'll duplicate the CSS content here.
    const managerStyles = `
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
#rpghq-modal-overlay {
    display: none;
    position: fixed;
    z-index: 9998;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
}
#rpghq-modal-overlay.active {
    display: block;
}

/* Modal content box */
#rpghq-manager-modal {
    display: none; /* Hidden by default */
    position: fixed;
    z-index: 9999;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 1200px;
    max-height: 90vh;
    background-color: var(--bg-dark);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    color: var(--text-primary);
    display: flex; /* Use flex for internal layout */
    flex-direction: column;
    overflow: hidden; /* Prevent content spill */
}
#rpghq-manager-modal.active {
    display: flex; /* Show when active */
}

/* Header and close button */
.modal-header {
    padding: 15px 20px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
}

.modal-header h2 {
    margin: 0;
    font-size: 1.4em;
}

#rpghq-modal-close {
    background: none;
    border: none;
    font-size: 2em;
    font-weight: bold;
    line-height: 1;
    color: var(--text-secondary);
    cursor: pointer;
    opacity: 0.7;
    padding: 0 5px;
}
#rpghq-modal-close:hover {
    color: var(--text-primary);
    opacity: 1;
}

/* Tab system */
.modal-tabs {
    padding: 10px 20px 0 20px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    flex-shrink: 0;
}

.modal-tabs button {
    background: none;
    border: 1px solid transparent;
    border-bottom: none;
    padding: 10px 15px;
    cursor: pointer;
    font-size: 1em;
    color: var(--text-secondary);
    position: relative;
    margin-right: 5px;
    margin-bottom: -1px; /* Overlap bottom border */
    border-radius: 4px 4px 0 0;
}

.modal-tabs button:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
}

.modal-tabs button.active {
    color: var(--primary-color);
    font-weight: bold;
    border-color: var(--border-color);
    border-bottom-color: var(--bg-dark); /* Make it look like it merges */
    background-color: var(--bg-dark); /* Match content background */
}

/* Content area */
.modal-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}

.tab-pane {
  display: block;
}

.tab-pane:not(.active) {
  display: none;
}

/* Installed Scripts Tab Specific Styles */
.view-switcher {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
}

.view-switcher .view-btn {
  background-color: var(--border-color);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  padding: 5px 10px;
  margin-left: 5px;
  cursor: pointer;
  font-size: 1.2em;
  line-height: 1;
  border-radius: 4px;
  transition: background-color 0.2s, color 0.2s;
}

.view-switcher .view-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
}

.view-switcher .view-btn.active {
  background-color: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
}

.scripts-display-container {
  clear: both;
}

/* Script grid */
.script-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 15px;
}

.script-card {
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 15px;
    display: flex;
    flex-direction: column;
}

.script-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-color);
}

.script-card-title {
    font-size: 1.1em;
    font-weight: bold;
    margin: 0;
    flex-grow: 1;
    margin-right: 10px;
}

.script-card-version {
    background-color: var(--primary-color);
    color: white;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.8em;
    white-space: nowrap;
    margin-left: 5px; /* Space between toggle and version */
}

.script-card-description {
    margin: 0 0 15px 0;
    color: var(--text-secondary);
    font-size: 0.9em;
    line-height: 1.4;
    flex-grow: 1; /* Take up available space */
}

.script-card-footer {
    display: flex;
    justify-content: flex-end; /* Align button to the right */
    align-items: center;
    border-top: 1px solid var(--border-color);
    padding-top: 10px;
    margin-top: auto; /* Push to bottom */
}

/* List View (Table) Styles */
.data-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 15px;
}

.data-table th,
.data-table td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
    vertical-align: middle;
}

.data-table th {
    background-color: rgba(255, 255, 255, 0.05);
    font-weight: bold;
    font-size: 0.9em;
    text-transform: uppercase;
    color: var(--text-secondary);
}

.data-table tbody tr:hover {
    background-color: rgba(255, 255, 255, 0.03);
}

.script-toggle-cell {
    width: 80px;
    text-align: center;
}

.script-list-table td:nth-child(2) { /* Name column */
    font-weight: bold;
}

.script-list-table td:nth-child(5), /* Settings column */
.script-list-table td:nth-child(6) { /* Actions column */
    text-align: center;
}

/* Settings modal */
#rpghq-settings-modal {
    display: none;
    position: fixed;
    z-index: 10001; /* Above main modal */
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    max-width: 800px;
    max-height: 85vh;
    background-color: var(--bg-dark);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    color: var(--text-primary);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
#rpghq-settings-modal.active {
    display: flex;
}

.settings-modal-header {
    padding: 15px 20px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
}

#rpghq-settings-modal-title {
    font-size: 1.3em;
    margin: 0;
}

#rpghq-settings-modal-close {
    background: none;
    border: none;
    font-size: 2em;
    font-weight: bold;
    line-height: 1;
    color: var(--text-secondary);
    cursor: pointer;
    opacity: 0.7;
    padding: 0 5px;
}
#rpghq-settings-modal-close:hover {
    color: var(--text-primary);
    opacity: 1;
}

.settings-modal-content {
    padding: 20px;
    overflow-y: auto;
    flex-grow: 1;
}

.settings-area {
  margin-bottom: 20px;
}

.script-info {
  padding-top: 15px;
  border-top: 1px solid var(--border-color);
  font-size: 0.9em;
  color: var(--text-secondary);
}

/* Use existing data-table styles for script info */
.script-info .data-table td {
  padding: 6px 10px;
}
.script-info .data-table td:first-child {
  font-weight: bold;
  color: var(--text-primary);
}

/* Buttons */
.btn {
    padding: 8px 15px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-size: 0.9em;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    text-decoration: none;
    transition: background-color 0.2s;
}

.btn i.fa {
    line-height: 1; /* Align icon better */
}

.btn-primary {
    background-color: var(--primary-color);
    color: white;
}

.btn-primary:hover {
    background-color: var(--primary-dark);
    color: white;
}

.btn-secondary {
    background-color: #555;
    color: var(--text-primary);
}

.btn-secondary:hover {
    background-color: #666;
    color: var(--text-primary);
}

.btn-small {
    padding: 5px 10px;
    font-size: 0.8em;
}

/* Toggle switch */
.toggle-switch {
    position: relative;
    display: inline-block;
    width: 40px; /* Slightly smaller */
    height: 20px;
    vertical-align: middle;
}

.toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #555; /* Grey when off */
    border-radius: 20px; /* Rounded */
    transition: .4s;
}

.slider:before {
    position: absolute;
    content: "";
    height: 14px; /* Smaller knob */
    width: 14px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    border-radius: 50%;
    transition: .4s;
}

input:checked + .slider {
    background-color: var(--primary-color);
}

input:checked + .slider:before {
    transform: translateX(20px);
}

/* Badges */
.badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.85em;
    font-weight: bold;
    line-height: 1;
}

.badge-primary {
    background-color: var(--primary-color);
    color: white;
}

/* Empty state */
.empty-state {
    text-align: center;
    padding: 30px 20px;
    color: var(--text-secondary);
    font-style: italic;
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
.wip-banner i.fa {
    margin-right: 8px;
}
    `;
    // eslint-disable-next-line no-undef
    GM_addStyle(managerStyles);
    console.log("RPGHQ Manager: Styles injected via GM_addStyle.");
  }


  // --- Phase 4: Initialize UI ---
  const { modalElement, overlayElement } = createManagerModal();
  const settingsModalElement = createSettingsModal(); // Create the settings modal

  // Append elements to the body
  document.body.appendChild(overlayElement);
  document.body.appendChild(modalElement);
  document.body.appendChild(settingsModalElement); // Append settings modal

  // --- Modal Visibility Logic ---
  const toggleModalVisibility = () => {
    const isActive = modalElement.classList.contains("active");
    console.log(
      `Toggling modal visibility. Currently ${
        isActive ? "active" : "inactive"
      }.`
    );
    modalElement.classList.toggle("active");
    overlayElement.classList.toggle("active");
  };

  // --- Settings Modal Visibility & Logic ---
  let currentSettingsScript = null; // Keep track of which script's settings are showing

  const toggleSettingsModalVisibility = (show, script = null) => {
    console.log(
      `Toggling settings modal visibility: ${show ? "show" : "hide"}`
    );
    currentSettingsScript = show ? script : null;

    if (show && script) {
      // Populate Title
      const titleElement = settingsModalElement.querySelector(
        "#rpghq-settings-modal-title"
      );
      if (titleElement) titleElement.textContent = `${script.name} Settings`;

      // Populate Settings Area (Placeholder call)
      const settingsArea = settingsModalElement.querySelector(".settings-area");
      if (settingsArea) renderScriptSettingsContent(settingsArea, script);

      // Populate Script Info Area
      const scriptInfoArea = settingsModalElement.querySelector(".script-info");
      if (scriptInfoArea) {
        scriptInfoArea.innerHTML = ""; // Clear previous
        const infoTable = document.createElement("table");
        infoTable.className = "data-table";
        const tbody = infoTable.createTBody();

        const addInfoRow = (label, value) => {
          const row = tbody.insertRow();
          const labelCell = row.insertCell();
          labelCell.textContent = label;
          labelCell.style.fontWeight = "bold";
          const valueCell = row.insertCell();
          valueCell.textContent = value || "-";
        };

        addInfoRow("ID", script.id);
        addInfoRow("Version", script.version);
        addInfoRow("Author", script.author);
        // Add other relevant metadata later if needed (category, match URLs etc)

        scriptInfoArea.appendChild(infoTable);
      }
      settingsModalElement.classList.add("active");
    } else {
      settingsModalElement.classList.remove("active");
    }
  };

  // Settings Modal Close Button
  const settingsCloseButton = settingsModalElement.querySelector(
    "#rpghq-settings-modal-close"
  );
  if (settingsCloseButton) {
    settingsCloseButton.addEventListener("click", () =>
      toggleSettingsModalVisibility(false)
    );
  } else {
    console.error("Could not find settings modal close button.");
  }

  // Get close button reference
  const closeButton = modalElement.querySelector("#rpghq-modal-close");
  if (closeButton) {
    closeButton.addEventListener("click", toggleModalVisibility);
  } else {
    console.error("Could not find close button.");
  }

  // Close modal when clicking overlay
  overlayElement.addEventListener("click", (event) => {
    // Only close if the overlay itself (not content inside it) is clicked
    if (event.target === overlayElement) {
      toggleModalVisibility();
    }
  });

  // Keyboard shortcut (Insert key)
  document.addEventListener("keydown", (event) => {
    // Check if Insert key is pressed and the target is not an input element
    if (event.key === "Insert" || event.keyCode === 45) {
      const targetTagName = event.target.tagName.toLowerCase();
      if (!["input", "textarea", "select"].includes(targetTagName)) {
        console.log("Insert key detected, attempting to toggle modal.");
        event.preventDefault(); // Prevent potential default browser behavior for Insert
        toggleModalVisibility();
      } else {
        console.log(
          "Insert key pressed in input field, ignoring modal toggle."
        );
      }
    }
  });

  // Register GM Menu Command
  try {
    // eslint-disable-next-line no-undef
    GM_registerMenuCommand("RPGHQ Userscript Manager", toggleModalVisibility);
    console.log("GM Menu command registered.");
  } catch (e) {
    console.error("Failed to register GM menu command:", e);
    // Fallback or notification? For now, just log error.
  }

  // --- Tab Switching Logic ---
  const tabsContainer = modalElement.querySelector(".modal-tabs");
  const contentContainer = modalElement.querySelector(".modal-content");
  const installedScriptsPane = contentContainer.querySelector("#tab-0"); // Get the specific pane for scripts

  if (tabsContainer && contentContainer && installedScriptsPane) {
    const scriptsDisplayContainer = installedScriptsPane.querySelector(
      ".scripts-display-container"
    );
    const viewSwitcher = installedScriptsPane.querySelector(".view-switcher");

    // Check if elements exist before proceeding
    if (!scriptsDisplayContainer) {
      console.error("Could not find scripts display container");
      return; // Exit initialization if critical elements are missing
    }
    if (!viewSwitcher) {
      console.error("Could not find view switcher");
      // Continue initialization, but view switching won't work
    }

    // Initial rendering of the default view (Grid)
    renderScriptsGridView(
      scriptsDisplayContainer,
      SCRIPT_MANIFEST,
      scriptStates
    );

    // Ensure the first tab's content pane is marked active on init
    const initialPane = contentContainer.querySelector("#tab-0");
    if (initialPane) {
        initialPane.classList.add("active");
    }

    // --- View Switcher Logic ---
    if (viewSwitcher) {
      viewSwitcher.addEventListener("click", (event) => {
        const targetButton = event.target.closest(".view-btn");
        if (!targetButton || targetButton.classList.contains("active")) {
          return; // Ignore clicks not on buttons or on the active button
        }

        const viewType = targetButton.dataset.view;
        console.log(`Switching view to: ${viewType}`);

        // Update active button state
        viewSwitcher
          .querySelectorAll(".view-btn")
          .forEach((btn) => btn.classList.remove("active"));
        targetButton.classList.add("active");

        // Re-render the script list with the selected view
        if (viewType === "list") {
          renderScriptsListView(
            scriptsDisplayContainer,
            SCRIPT_MANIFEST,
            scriptStates
          );
        } else {
          // Default to grid view
          renderScriptsGridView(
            scriptsDisplayContainer,
            SCRIPT_MANIFEST,
            scriptStates
          );
        }
      });
    }

    // --- Settings Button Click Listener (Event Delegation) ---
    scriptsDisplayContainer.addEventListener("click", (event) => {
      const settingsButton = event.target.closest(".view-settings");
      if (!settingsButton) return; // Ignore clicks not on a settings button

      const scriptId = settingsButton.dataset.scriptId;
      const script = SCRIPT_MANIFEST.find((s) => s.id === scriptId);

      if (script) {
        console.log(`Opening settings modal for script: ${scriptId}`);
        toggleSettingsModalVisibility(true, script);
      } else {
        console.error(`Could not find script data for ID: ${scriptId}`);
      }
    });

    // --- Tab Switching Logic ---
    tabsContainer.addEventListener("click", (event) => {
      const targetButton = event.target.closest("button");
      if (!targetButton || !targetButton.dataset.tabTarget) return; // Ignore clicks not on tab buttons

      const targetTabId = targetButton.dataset.tabTarget;
      const targetPane = contentContainer.querySelector(`#${targetTabId}`);

      console.log(`Switching to tab: ${targetTabId}`);

      // Remove active class from all tab buttons and panes
      tabsContainer
        .querySelectorAll("button")
        .forEach((btn) => btn.classList.remove("active"));
      contentContainer
        .querySelectorAll(".tab-pane")
        .forEach((pane) => pane.classList.remove("active"));

      // Add active class to the clicked button and corresponding pane
      targetButton.classList.add("active");
      if (targetPane) {
        targetPane.classList.add("active");
      } else {
        console.error(`Could not find tab pane with ID: ${targetTabId}`);
      }
    });
  } else {
    console.error(
      "Could not find tabs container, content container, or installed scripts pane for setup."
    );
  }

  // --- Add Profile Menu Button ---
  // We call this here ensuring the DOM is likely ready because initializeManager
  // is called after DOMContentLoaded or immediately if already loaded.
  addMenuButton(toggleModalVisibility);

  // --- Register GM Menu Command ---
  try {
    // eslint-disable-next-line no-undef
    GM_registerMenuCommand("RPGHQ Userscript Manager", toggleModalVisibility);
    console.log("GM Menu command registered.");
  } catch (e) {
    console.error("Failed to register GM menu command:", e);
  }

  console.log("UI Initialized with visibility controls.");
}

// --- Run ---
// Ensure the DOM is ready before initializing, though most logic here doesn't directly interact yet.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeManager);
} else {
  initializeManager();
}
