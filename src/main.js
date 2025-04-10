// Main userscript entry point
import "./meta.js?userscript-metadata";
import { SCRIPT_MANIFEST } from "./manifest.js";
import { FORUM_PREFERENCES } from "./forumPreferences.js";
import { shouldLoadScript } from "./utils/urlMatcher.js";
import { log, warn, error, debug } from "./utils/logger.js";
import {
  gmGetValue,
  gmSetValue,
  getScriptSetting,
  saveScriptSetting,
} from "./utils/gmUtils.js"; // Import GM utilities
import { sharedUtils } from "./utils/sharedUtils.js"; // Import shared utilities
import loadOrder from "../load_order.json"; // Import the execution order

// Import UI components
import { showModal } from "./components/showModal.js";
import { hideModal } from "./components/hideModal.js";
import { loadTabContent } from "./components/loadTabContent.js";
import { renderScriptsGridView } from "./components/renderScriptsGridView.js";
import { renderScriptsListView } from "./components/renderScriptsListView.js";
import { showScriptSettings } from "./components/showScriptSettings.js";
import { renderScriptSettingsContent } from "./components/renderScriptSettingsContent.js";
import { toggleScriptEnabled } from "./components/toggleScriptEnabled.js";

// Import Core Preference Modules
import { initializeThreadPrefs } from "./preferences/threadPrefs.js";

// --- Constants ---
const GM_PREFIX = "RPGHQ_Manager_"; // Prefix for GM_setValue/GM_getValue keys
const EXECUTION_PHASES = [
  { id: "document-start", name: "Document Start" },
  { id: "document-end", name: "Document End" },
  { id: "document-idle", name: "Document Idle" },
  { id: "after_dom", name: "After DOM Ready" },
];

// The current execution phase the page is in
let currentExecutionPhase = "document-start";

// --- Core Logic ---

// Object to hold the runtime state of scripts (enabled/disabled)
const scriptStates = {};

// Object to hold loaded script modules and their cleanup functions
const loadedScripts = {};

function initializeScriptStates() {
  SCRIPT_MANIFEST.forEach((script) => {
    const storageKey = `script_enabled_${script.id}`;
    // Load state from GM storage, falling back to manifest default
    scriptStates[script.id] = gmGetValue(storageKey, script.enabledByDefault);
    // Log status with scriptId as context
    log(
      script.id,
      `${scriptStates[script.id] ? "Enabled" : "Disabled"} (Default: ${script.enabledByDefault})`,
    );
  });
}

// Find a script definition in the manifest by its ID
function findScriptById(scriptId) {
  return SCRIPT_MANIFEST.find((script) => script.id === scriptId);
}

// Execute functions and scripts based on the load order for a specific phase
function executeLoadOrderForPhase(phase) {
  const itemsToLoad = loadOrder[phase] || [];

  if (itemsToLoad.length === 0) {
    return;
  }

  itemsToLoad.forEach((item) => {
    // Check if it's a known shared function
    if (typeof sharedUtils[item] === "function") {
      try {
        sharedUtils[item]();
      } catch (err) {
        error(`Error executing shared function ${item}:`, err);
      }
    }
    // Check if it's a script ID
    else {
      const script = findScriptById(item);
      if (script) {
        // Check if script is enabled
        if (scriptStates[script.id]) {
          log(
            `-> Loading script from load order: ${script.name} (${script.id}) for phase: ${phase}`,
          );
          loadScript(script); // Use the existing loadScript function
        } else {
        }
      } else {
        warn(
          `-> Item "${item}" in load_order.json is not a known shared function or script ID.`,
        );
      }
    }
  });
}

// Import scripts directly
import * as recentTopicsFormat from "./scripts/recentTopicsFormat.js";
import * as randomTopic from "./scripts/randomTopic.js";
import * as memberSearch from "./scripts/memberSearch.js";
import * as separateReactions from "./scripts/separateReactions.js";
import * as pinThreads from "./scripts/pinThreads.js";
import * as notifications from "./scripts/notifications.js";
import * as kalareact from "./scripts/kalareact.js";
import * as bbcode from "./scripts/bbcode.js";
import * as commaFormatter from "./scripts/commaFormatter.js";

// Map of script ids to their modules
const scriptModules = {
  commaFormatter: commaFormatter,
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
  if (loadedScripts[script.id]) {
    return;
  }

  // Check if the script should run on the current URL
  if (!shouldLoadScript(script)) {
    return;
  }

  //  // Phase is determined by load_order.json

  try {
    // Get the module from our imports
    const module = scriptModules[script.id];

    if (!module) {
      error(`Script module ${script.id} not found`);
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
    } else {
      warn(`Script ${script.name} has no init function, skipping.`);
    }
  } catch (err) {
    error(`Failed to load script ${script.name}:`, err);
  }
}

// Unload a single script by its ID
function unloadScript(scriptId) {
  const scriptInfo = loadedScripts[scriptId];
  if (!scriptInfo) {
    return;
  }

  // Call cleanup function if it exists
  if (scriptInfo.cleanup && typeof scriptInfo.cleanup === "function") {
    try {
      scriptInfo.cleanup();
    } catch (err) {
      error(`Error during cleanup for script ${scriptId}:`, err);
    }
  }

  // Remove the script from loadedScripts
  delete loadedScripts[scriptId];
}

// --- Script Toggle Event Handler ---
document.addEventListener("script-toggle", (event) => {
  const { scriptId, enabled } = event.detail;
  toggleScriptEnabled(
    scriptId,
    enabled,
    scriptStates,
    gmSetValue, // Pass imported function
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
  showScriptSettings(script, renderScriptSettingsContent, saveScriptSetting); // Use imported saveScriptSetting
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

  log(
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
  }
}

function addMenuButton(toggleVisibilityCallback) {
  // Ensure FA is loaded for the icon
  ensureFontAwesome();

  const profileDropdown = document.querySelector(
    '.header-profile.dropdown-container .dropdown-contents[role="menu"]',
  );
  if (!profileDropdown) {
    warn("RPGHQ Manager: Could not find profile dropdown menu.");
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
    warn("RPGHQ Manager: Could not find logout button for reference.");
    return;
  }

  // Check if button already exists
  const existingButton = profileDropdown.querySelector(
    'a[title="RPGHQ Userscript Manager"]',
  );
  if (existingButton) {
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
}

// --- Initialization ---
function init() {
  // Initialize script states
  initializeScriptStates();

  // Execute load order for document-start phase immediately
  executeLoadOrderForPhase("document-start");

  // Set up listeners for other execution phases
  document.addEventListener("DOMContentLoaded", () => {
    // Update current phase and execute load order
    currentExecutionPhase = "document-end";
    executeLoadOrderForPhase("document-end");

    // Initialize Core Preferences that need DOM
    initializeThreadPrefs();

    // Add menu button (needs DOM ready)
    addMenuButton(toggleModalVisibility);
  });

  window.addEventListener("load", () => {
    // Update current phase and execute load order
    currentExecutionPhase = "document-idle";
    executeLoadOrderForPhase("document-idle");
  });

  // Set up a phase for after DOM is fully ready and rendered
  setTimeout(() => {
    // Update current phase and execute load order
    currentExecutionPhase = "after_dom";
    executeLoadOrderForPhase("after_dom");
  }, 500); // Small delay to ensure everything is loaded

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
        return;
      }

      event.preventDefault();
      toggleModalVisibility();
    }
  });
}

// Run initialization
init();
