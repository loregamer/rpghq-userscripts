import { MANIFEST } from '../../../data/MANIFEST.js';
import { renderScriptsGridView } from '../../components/renderScriptsGridView.js';
import { renderScriptsListView } from '../../components/renderScriptsListView.js';
// Removed filter-related imports

/**
 * Render the "Installed Scripts" tab content
 * @param {HTMLElement} container - The container to render into
 */
export function renderInstalledScriptsTab(container) {
  // Filter panel removed

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
  // Filter toggle listener removed

  document.getElementById("grid-view-btn").addEventListener("click", () => {
    document.getElementById("grid-view-btn").className = "btn btn-primary";
    document.getElementById("list-view-btn").className = "btn btn-secondary";

    // Removed filtering
    renderScriptsGridView(scriptsContainer, MANIFEST.scripts);
  });

  document.getElementById("list-view-btn").addEventListener("click", () => {
    document.getElementById("grid-view-btn").className = "btn btn-secondary";
    document.getElementById("list-view-btn").className = "btn btn-primary";

    // Removed filtering
    renderScriptsListView(scriptsContainer, MANIFEST.scripts);
  });

  // Apply/Reset filter listeners removed
}
