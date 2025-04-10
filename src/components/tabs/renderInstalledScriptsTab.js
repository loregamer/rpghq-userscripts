/**
 * Renders the "Installed Scripts" tab content with filtering and view options.
 *
 * @param {HTMLElement} container - The container element to render into
 * @param {Array} scripts - The array of script objects from SCRIPT_MANIFEST
 * @param {Object} scriptStates - Object containing enabled/disabled states for scripts
 * @param {Function} renderScriptsGridView - Function to render scripts in grid view
 * @param {Function} renderScriptsListView - Function to render scripts in list view
 */
import { filterScripts } from "../../utils/filterScripts.js";
import { getCategoryOptions } from "../../utils/getCategoryOptions.js";
import { getExecutionPhaseOptions } from "../../utils/getExecutionPhaseOptions.js";

export function renderInstalledScriptsTab(
  container,
  scripts,
  scriptStates,
  renderScriptsGridView,
  renderScriptsListView,
  executionPhases,
) {
  console.log("Rendering Installed Scripts tab with filtering...");

  // Filter panel removed

  // View switcher removed

  // Create the scripts container
  const scriptsContainer = document.createElement("div");
  scriptsContainer.className = "scripts-display-container";
  scriptsContainer.id = "scripts-container";
  container.appendChild(scriptsContainer);

  // Render scripts in grid view initially
  renderScriptsGridView(scriptsContainer, scripts, scriptStates);

  // Filter toggle event listeners removed

  // View switcher event listeners removed

  // Filter apply/reset event listeners removed
}
