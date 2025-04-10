// Main userscript entry point
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
  console.log("Creating manager modal UI...");

  // Create overlay
  const overlay = document.createElement("div");
  overlay.id = "rpghq-modal-overlay";
  overlay.style.display = "none"; // Initially hidden
  // Basic overlay styles (will be refined in CSS)
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.zIndex = "9998"; // Below modal

  // Create modal container
  const modal = document.createElement("div");
  modal.id = "rpghq-manager-modal";
  modal.style.display = "none"; // Initially hidden
  // Basic modal styles (will be refined in CSS)
  modal.style.position = "fixed";
  modal.style.top = "50%";
  modal.style.left = "50%";
  modal.style.transform = "translate(-50%, -50%)";
  modal.style.width = "80%";
  modal.style.maxWidth = "800px";
  modal.style.maxHeight = "80vh";
  modal.style.backgroundColor = "white";
  modal.style.border = "1px solid #ccc";
  modal.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
  modal.style.zIndex = "9999"; // Above overlay
  modal.style.display = "flex";
  modal.style.flexDirection = "column";

  // Modal Header
  const header = document.createElement("div");
  header.className = "modal-header";
  // Basic header styles
  header.style.padding = "10px 15px";
  header.style.borderBottom = "1px solid #eee";
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";

  const title = document.createElement("h2");
  title.textContent = "RPGHQ Userscript Manager";
  title.style.margin = "0";
  title.style.fontSize = "1.2em";

  const closeButton = document.createElement("button");
  closeButton.id = "rpghq-modal-close";
  closeButton.textContent = "×";
  // Basic button styles
  closeButton.style.background = "none";
  closeButton.style.border = "none";
  closeButton.style.fontSize = "1.5em";
  closeButton.style.cursor = "pointer";

  header.appendChild(title);
  header.appendChild(closeButton);

  // Modal Tabs
  const tabsContainer = document.createElement("div");
  tabsContainer.className = "modal-tabs";
  // Basic tabs styles
  tabsContainer.style.padding = "10px 15px";
  tabsContainer.style.borderBottom = "1px solid #eee";
  tabsContainer.style.display = "flex";

  const tabButtons = ["Installed Scripts", "Forum Preferences", "Settings"];
  tabButtons.forEach((text, index) => {
    const button = document.createElement("button");
    button.dataset.tabTarget = `tab-${index}`; // Link button to tab content
    button.textContent = text;
    // Basic tab button styles
    button.style.padding = "8px 12px";
    button.style.marginRight = "5px";
    button.style.cursor = "pointer";
    button.style.border = "1px solid #ccc";
    button.style.borderBottom = "none";
    button.style.background = "#eee";
    if (index === 0) {
      button.classList.add("active"); // Mark first tab as active initially
      button.style.background = "white";
      button.style.borderBottom = "1px solid white"; // Visually connect to content
      button.style.marginBottom = "-1px";
    }
    tabsContainer.appendChild(button);
  });

  // Modal Content Area
  const contentContainer = document.createElement("div");
  contentContainer.className = "modal-content";
  // Basic content styles
  contentContainer.style.padding = "15px";
  contentContainer.style.overflowY = "auto"; // Make content scrollable if needed
  contentContainer.style.flexGrow = "1"; // Allow content to fill space

  // Create content divs for each tab (initially hidden except the first)
  tabButtons.forEach((_, index) => {
    const tabContent = document.createElement("div");
    tabContent.id = `tab-${index}`;
    tabContent.className = "tab-pane";
    if (index !== 0) {
      tabContent.style.display = "none";
    }
    tabContent.textContent = `Content for ${tabButtons[index]}`; // Placeholder
    contentContainer.appendChild(tabContent);
  });

  // Assemble Modal
  modal.appendChild(header);
  modal.appendChild(tabsContainer);
  modal.appendChild(contentContainer);

  // Append overlay and modal to body
  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  console.log("Manager modal UI created.");
}

// --- Initialization ---
function initializeManager() {
  console.log("RPGHQ Userscript Manager Initializing...");
  initializeScriptStates();
  loadEnabledScripts();
  // Phase 4: Initialize UI
  createManagerModal();
}

// --- Run ---
// Ensure the DOM is ready before initializing, though most logic here doesn't directly interact yet.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeManager);
} else {
  initializeManager();
}
