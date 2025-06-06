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
import { renderInstalledScriptsTab } from "./tabs/renderInstalledScriptsTab.js";
import { renderForumPreferencesTab } from "./tabs/renderForumPreferencesTab.js";
import { renderSettingsTab } from "./tabs/renderSettingsTab.js";
import { log, error } from "../utils/logger.js";

export function loadTabContent(tabName, context) {
  const {
    container,
    scripts,
    scriptStates,
    renderScriptsGridView,
    renderScriptsListView,
    executionPhases,
  } = context;

  // Clear previous content
  container.innerHTML = "";

  switch (tabName) {
    case "installed":
      renderInstalledScriptsTab(
        container,
        scripts,
        scriptStates,
        renderScriptsGridView,
        renderScriptsListView,
        executionPhases,
      );
      break;
    case "forum":
      renderForumPreferencesTab(container);
      break;
    case "settings":
      renderSettingsTab(container);
      break;
    default:
      container.innerHTML = `<div class="error-message">Unknown tab: ${tabName}</div>`;
  }
}
