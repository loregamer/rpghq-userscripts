// Main userscript entry point
import "./meta.js?userscript-metadata";
import { SCRIPT_MANIFEST } from "./manifest.js";
import { FORUM_PREFERENCES } from "./forumPreferences.js";

// Import UI components
import { showModal } from "./components/showModal.js";
import { hideModal } from "./components/hideModal.js";
import { loadTabContent } from "./components/loadTabContent.js";
import { renderScriptsGridView } from "./components/renderScriptsGridView.js";
import { renderScriptsListView } from "./components/renderScriptsListView.js";
import { showScriptSettings } from "./components/showScriptSettings.js";
import { renderScriptSettingsContent } from "./components/renderScriptSettingsContent.js";
import { toggleScriptEnabled } from "./components/toggleScriptEnabled.js";

// --- Constants ---
const GM_PREFIX = "RPGHQ_Manager_"; // Prefix for GM_setValue/GM_getValue keys
const EXECUTION_PHASES = [
  { id: "document-start", name: "Document Start" },
  { id: "document-end", name: "Document End" },
  { id: "document-idle", name: "Document Idle" },
];

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

// Object to hold loaded script modules and their cleanup functions
const loadedScripts = {};

function initializeScriptStates() {
  console.log("Initializing script states...");
  SCRIPT_MANIFEST.forEach((script) => {
    const storageKey = `script_enabled_${script.id}`;
    // Load state from GM storage, falling back to manifest default
    scriptStates[script.id] = gmGetValue(storageKey, script.enabledByDefault);
    console.log(
      `Script '${script.name}' (${script.id}): ${
        scriptStates[script.id] ? "Enabled" : "Disabled"
      } (Default: ${script.enabledByDefault})`,
    );
  });
  console.log("Script states initialized:", scriptStates);
}

function loadEnabledScripts() {
  console.log("Loading enabled scripts...");
  SCRIPT_MANIFEST.forEach((script) => {
    if (scriptStates[script.id]) {
      loadScript(script);
    }
  });
  console.log("Finished loading scripts.");
}

// Import scripts directly
import * as scriptId from "./scripts/scriptId.js";
import * as commaFormatter from "./scripts/commaFormatter.js";

// Map of script ids to their modules
const scriptModules = {
  commaFormatter: commaFormatter,

  scriptId: scriptId,};

// Load a single script by its manifest entry
function loadScript(script) {
  if (loadedScripts[script.id]) {
    console.log(`Script ${script.name} already loaded, skipping.`);
    return;
  }

  console.log(`Loading script: ${script.name} (${script.id})`);
  try {
    // Get the module from our imports
    const module = scriptModules[script.id];

    if (!module) {
      console.error(`Script module ${script.id} not found`);
      return;
    }

    // Check if the module has an init function
    if (typeof module.init === "function") {
      // Call init and store any returned cleanup function or object
      const result = module.init();

      // Store the loaded module and any cleanup function
      loadedScripts[script.id] = {
        module,
        cleanup:
          result && typeof result.cleanup === "function"
            ? result.cleanup
            : null,
      };

      console.log(`Successfully loaded script: ${script.name}`);
    } else {
      console.warn(`Script ${script.name} has no init function, skipping.`);
    }
  } catch (err) {
    console.error(`Failed to load script ${script.name}:`, err);
  }
}

// Unload a single script by its ID
function unloadScript(scriptId) {
  const scriptInfo = loadedScripts[scriptId];
  if (!scriptInfo) {
    console.log(`Script ${scriptId} not loaded, nothing to unload.`);
    return;
  }

  console.log(`Unloading script: ${scriptId}`);

  // Call cleanup function if it exists
  if (scriptInfo.cleanup && typeof scriptInfo.cleanup === "function") {
    try {
      scriptInfo.cleanup();
      console.log(`Cleanup completed for script: ${scriptId}`);
    } catch (err) {
      console.error(`Error during cleanup for script ${scriptId}:`, err);
    }
  }

  // Remove the script from loadedScripts
  delete loadedScripts[scriptId];
  console.log(`Script ${scriptId} unloaded.`);
}

// --- Script Toggle Event Handler ---
document.addEventListener("script-toggle", (event) => {
  const { scriptId, enabled } = event.detail;
  toggleScriptEnabled(
    scriptId,
    enabled,
    scriptStates,
    gmSetValue,
    SCRIPT_MANIFEST,
    loadScript,
    unloadScript,
  );
});

// --- UI Handlers ---
function handleRenderScriptsGridView(container, scripts, states) {
  renderScriptsGridView(container, scripts, states, handleShowScriptSettings);
}

function handleRenderScriptsListView(container, scripts, states) {
  renderScriptsListView(container, scripts, states, handleShowScriptSettings);
}

function handleShowScriptSettings(script) {
  showScriptSettings(script, renderScriptSettingsContent, saveScriptSetting);
}

function saveScriptSetting(scriptId, settingId, value) {
  const storageKey = `script_setting_${scriptId}_${settingId}`;
  gmSetValue(storageKey, value);
  console.log(`Saved setting: ${scriptId}.${settingId} = ${value}`);
}

function getScriptSetting(scriptId, settingId, defaultValue) {
  const storageKey = `script_setting_${scriptId}_${settingId}`;
  return gmGetValue(storageKey, defaultValue);
}

// --- Tab Content Handling ---
function handleLoadTabContent(tabName) {
  const contentContainer = document.getElementById("mod-manager-content");
  if (!contentContainer) return;

  loadTabContent(tabName, {
    container: contentContainer,
    scripts: SCRIPT_MANIFEST,
    scriptStates,
    renderScriptsGridView: handleRenderScriptsGridView,
    renderScriptsListView: handleRenderScriptsListView,
    executionPhases: EXECUTION_PHASES,
  });
}

// --- Modal Visibility Logic ---
function toggleModalVisibility() {
  const modal = document.getElementById("mod-manager-modal");
  const isVisible = modal && modal.style.display === "block";

  console.log(
    `Toggling modal visibility. Currently ${isVisible ? "visible" : "hidden"}.`,
  );

  if (isVisible) {
    hideModal();
  } else {
    showModal({
      loadTabContent: handleLoadTabContent,
      hideModal,
    });
  }
}

// --- Add Button to Profile Dropdown ---
// Add Font Awesome CSS if not already present
function ensureFontAwesome() {
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css";
    document.head.appendChild(link);
    console.log("RPGHQ Manager: Added Font Awesome CSS link.");
  }
}

function addMenuButton(toggleVisibilityCallback) {
  // Ensure FA is loaded for the icon
  ensureFontAwesome();

  const profileDropdown = document.querySelector(
    '.header-profile.dropdown-container .dropdown-contents[role="menu"]',
  );
  if (!profileDropdown) {
    console.warn("RPGHQ Manager: Could not find profile dropdown menu.");
    return;
  }

  // Find the logout button more robustly
  const logoutButton = Array.from(profileDropdown.querySelectorAll("li")).find(
    (li) => {
      const link = li.querySelector("a");
      return (
        link &&
        (link.textContent.trim().includes("Logout") ||
          link.getAttribute("title") === "Logout")
      );
    },
  );

  if (!logoutButton) {
    console.warn("RPGHQ Manager: Could not find logout button for reference.");
    return;
  }

  // Check if button already exists
  const existingButton = profileDropdown.querySelector(
    'a[title="RPGHQ Userscript Manager"]',
  );
  if (existingButton) {
    console.log("RPGHQ Manager: Button already exists, updating listener.");
    existingButton.onclick = function (e) {
      e.preventDefault();
      toggleVisibilityCallback();
    };
    return;
  }

  // Create the new button
  const userscriptsButton = document.createElement("li");
  userscriptsButton.innerHTML = `
    <a href="#" title="RPGHQ Userscript Manager">
      <i class="fa fa-puzzle-piece"></i> View Userscripts
    </a>
  `;

  // Add click handler
  userscriptsButton.querySelector("a").onclick = function (e) {
    e.preventDefault();
    toggleVisibilityCallback();
  };

  // Insert before logout button
  profileDropdown.insertBefore(userscriptsButton, logoutButton);
  console.log(
    "RPGHQ Manager: 'View Userscripts' button added to profile menu.",
  );
}

// --- Initialization ---
function init() {
  console.log("Initializing RPGHQ Userscript Manager...");

  // Initialize script states and load enabled scripts
  initializeScriptStates();
  loadEnabledScripts();

  // Add keyboard shortcut listener for Insert key
  document.addEventListener("keydown", (event) => {
    // Insert key = keyCode 45
    if (event.keyCode === 45) {
      // Don't toggle if focus is on an input element
      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA" ||
        document.activeElement.isContentEditable
      ) {
        console.log(
          "Insert key pressed in input field, ignoring modal toggle.",
        );
        return;
      }

      event.preventDefault();
      toggleModalVisibility();
    }
  });

  // Register GM menu command
  try {
    // eslint-disable-next-line no-undef
    GM_registerMenuCommand("RPGHQ Userscript Manager", toggleModalVisibility);
    console.log("GM Menu command registered.");
  } catch (e) {
    console.error("Failed to register GM menu command:", e);
  }

  // Add menu button to the page
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    addMenuButton(toggleModalVisibility);
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      addMenuButton(toggleModalVisibility);
    });
  }
}

// Run initialization
init();
