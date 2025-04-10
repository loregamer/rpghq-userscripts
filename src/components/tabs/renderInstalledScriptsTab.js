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

  // Create the view options
  const viewOptions = document.createElement("div");
  viewOptions.className = "view-switcher";
  viewOptions.innerHTML = `
    <div class="btn-group">
      <button id="grid-view-btn" class="view-btn btn btn-primary" data-view="grid">
        <i class="fa fa-th-large"></i>
      </button>
      <button id="list-view-btn" class="view-btn btn btn-secondary" data-view="list">
        <i class="fa fa-list"></i>
      </button>
    </div>
  `;
  container.appendChild(viewOptions);

  // Create the scripts container
  const scriptsContainer = document.createElement("div");
  scriptsContainer.className = "scripts-display-container";
  scriptsContainer.id = "scripts-container";
  container.appendChild(scriptsContainer);

  // Render scripts in grid view initially
  renderScriptsGridView(scriptsContainer, scripts, scriptStates);

  // Filter toggle event listeners removed

  document.getElementById("grid-view-btn").addEventListener("click", () => {
    document.getElementById("grid-view-btn").className =
      "view-btn btn btn-primary";
    document.getElementById("list-view-btn").className =
      "view-btn btn btn-secondary";

    const filteredScripts = filterScripts(scripts);
    renderScriptsGridView(scriptsContainer, filteredScripts, scriptStates);
  });

  document.getElementById("list-view-btn").addEventListener("click", () => {
    document.getElementById("grid-view-btn").className =
      "view-btn btn btn-secondary";
    document.getElementById("list-view-btn").className =
      "view-btn btn btn-primary";

    const filteredScripts = filterScripts(scripts);
    renderScriptsListView(scriptsContainer, filteredScripts, scriptStates);
  });

  // Filter apply/reset event listeners removed
}
