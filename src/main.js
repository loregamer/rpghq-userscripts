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
    }
    // Placeholder content (will be replaced later)
    tabContent.textContent = `Content for ${tabButtons[index]}`;
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

// --- Initialization ---
function initializeManager() {
  console.log("RPGHQ Userscript Manager Initializing...");
  initializeScriptStates();
  loadEnabledScripts();

  // --- Phase 4: Initialize UI ---
  const { modalElement, overlayElement } = createManagerModal();

  // Append elements to the body
  document.body.appendChild(overlayElement);
  document.body.appendChild(modalElement);

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

  console.log("UI Initialized with visibility controls.");
}

// --- Run ---
// Ensure the DOM is ready before initializing, though most logic here doesn't directly interact yet.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeManager);
} else {
  initializeManager();
}
