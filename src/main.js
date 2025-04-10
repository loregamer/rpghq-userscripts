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
      if (index === 1) {
        tabContent.innerHTML =
          "<p><i>Forum Preferences placeholder. Content will be added later.</i></p>";
      } else if (index === 2) {
        tabContent.innerHTML =
          "<p><i>Global Settings placeholder. Content will be added later.</i></p>";
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

  console.log("UI Initialized with visibility controls.");
}

// --- Run ---
// Ensure the DOM is ready before initializing, though most logic here doesn't directly interact yet.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeManager);
} else {
  initializeManager();
}
