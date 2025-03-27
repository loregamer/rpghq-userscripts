/**
 * Render the "Installed Scripts" tab content
 * @param {HTMLElement} container - The container to render into
 */
export function renderInstalledScriptsTab(container) {
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
          ${getCategoryOptions()}
        </select>
      </div>
      <div class="filter-group">
        <label for="phase-filter">Execution Phase</label>
        <select id="phase-filter">
          <option value="all">All Phases</option>
          ${getExecutionPhaseOptions()}
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
        <label for="enabled-filter">Status</label>
        <select id="enabled-filter">
          <option value="all">All Scripts</option>
          <option value="enabled">Enabled Only</option>
          <option value="disabled">Disabled Only</option>
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
  viewOptions.className = "view-options";
  viewOptions.style.display = "flex";
  viewOptions.style.justifyContent = "flex-end";
  viewOptions.style.marginBottom = "10px";
  viewOptions.innerHTML = `
    <div class="btn-group" style="display: flex;">
      <button id="grid-view-btn" class="btn btn-primary" style="border-radius: 3px 0 0 3px; margin: 0;">
        <i class="fa fa-th-large"></i>
      </button>
      <button id="list-view-btn" class="btn btn-secondary" style="border-radius: 0 3px 3px 0; margin: 0;">
        <i class="fa fa-list"></i>
      </button>
    </div>
  `;
  container.appendChild(viewOptions);

  // Create the scripts container
  const scriptsContainer = document.createElement("div");
  scriptsContainer.id = "scripts-container";
  container.appendChild(scriptsContainer);

  // Render scripts in grid view initially
  renderScriptsGridView(scriptsContainer, MANIFEST.scripts);

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
    document.getElementById("grid-view-btn").className = "btn btn-primary";
    document.getElementById("list-view-btn").className = "btn btn-secondary";

    const filteredScripts = filterScripts(MANIFEST.scripts);
    renderScriptsGridView(scriptsContainer, filteredScripts);
  });

  document.getElementById("list-view-btn").addEventListener("click", () => {
    document.getElementById("grid-view-btn").className = "btn btn-secondary";
    document.getElementById("list-view-btn").className = "btn btn-primary";

    const filteredScripts = filterScripts(MANIFEST.scripts);
    renderScriptsListView(scriptsContainer, filteredScripts);
  });

  document.getElementById("apply-filters").addEventListener("click", () => {
    const filteredScripts = filterScripts(MANIFEST.scripts);

    // Use the active view to render
    if (
      document.getElementById("grid-view-btn").classList.contains("btn-primary")
    ) {
      renderScriptsGridView(scriptsContainer, filteredScripts);
    } else {
      renderScriptsListView(scriptsContainer, filteredScripts);
    }
  });

  document.getElementById("reset-filters").addEventListener("click", () => {
    document.getElementById("category-filter").value = "all";
    document.getElementById("phase-filter").value = "all";
    document.getElementById("has-settings-filter").value = "all";
    document.getElementById("enabled-filter").value = "all";
    document.getElementById("search-filter").value = "";
    document.getElementById("sort-filter").value = "name-asc";

    // Use the active view to render
    if (
      document.getElementById("grid-view-btn").classList.contains("btn-primary")
    ) {
      renderScriptsGridView(scriptsContainer, MANIFEST.scripts);
    } else {
      renderScriptsListView(scriptsContainer, MANIFEST.scripts);
    }
  });
}
