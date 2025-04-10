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

  // Create the filter panel
  const filterPanel = document.createElement("div");
  filterPanel.className = "filter-panel";
  filterPanel.innerHTML = `
    <div class="filter-panel-header">
      <h3 class="filter-panel-title">Filter Scripts</h3>
      <button class="filter-panel-toggle" id="toggle-filters">
        <i class="fa fa-chevron-up"></i>
      </button>
    </div>
    <div class="filter-panel-body" id="filter-panel-body">
      <div class="filter-group">
        <label for="category-filter">Category</label>
        <select id="category-filter">
          <option value="all">All Categories</option>
          ${getCategoryOptions(scripts)}
        </select>
      </div>
      <div class="filter-group">
        <label for="phase-filter">Execution Phase</label>
        <select id="phase-filter">
          <option value="all">All Phases</option>
          ${getExecutionPhaseOptions(executionPhases || [])}
        </select>
      </div>
      <div class="filter-group">
        <label for="has-settings-filter">Settings</label>
        <select id="has-settings-filter">
          <option value="all">All Scripts</option>
          <option value="with">With Settings</option>
          <option value="without">Without Settings</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="search-filter">Search</label>
        <input type="text" id="search-filter" placeholder="Script name or description...">
      </div>
      <div class="filter-group">
        <label for="sort-filter">Sort By</label>
        <select id="sort-filter">
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="version-asc">Version (Low to High)</option>
          <option value="version-desc">Version (High to Low)</option>
          <option value="category">Category</option>
        </select>
      </div>
      <div class="filter-actions">
        <button id="reset-filters" class="btn btn-secondary">
          <i class="fa fa-undo btn-icon"></i> Reset
        </button>
        <button id="apply-filters" class="btn btn-primary" style="margin-left: 10px;">
          <i class="fa fa-filter btn-icon"></i> Apply Filters
        </button>
      </div>
    </div>
  `;
  container.appendChild(filterPanel);

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

  // Add event listeners
  document.getElementById("toggle-filters").addEventListener("click", () => {
    const panel = document.getElementById("filter-panel-body");
    panel.classList.toggle("collapsed");

    const icon = document.getElementById("toggle-filters").querySelector("i");
    if (panel.classList.contains("collapsed")) {
      icon.className = "fa fa-chevron-down";
    } else {
      icon.className = "fa fa-chevron-up";
    }
  });

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

  document.getElementById("apply-filters").addEventListener("click", () => {
    const filteredScripts = filterScripts(scripts);

    // Use the active view to render
    if (
      document.getElementById("grid-view-btn").classList.contains("btn-primary")
    ) {
      renderScriptsGridView(scriptsContainer, filteredScripts, scriptStates);
    } else {
      renderScriptsListView(scriptsContainer, filteredScripts, scriptStates);
    }
  });

  document.getElementById("reset-filters").addEventListener("click", () => {
    document.getElementById("category-filter").value = "all";
    document.getElementById("phase-filter").value = "all";
    document.getElementById("has-settings-filter").value = "all";
    document.getElementById("search-filter").value = "";
    document.getElementById("sort-filter").value = "name-asc";

    // Use the active view to render
    if (
      document.getElementById("grid-view-btn").classList.contains("btn-primary")
    ) {
      renderScriptsGridView(scriptsContainer, scripts, scriptStates);
    } else {
      renderScriptsListView(scriptsContainer, scripts, scriptStates);
    }
  });
}
