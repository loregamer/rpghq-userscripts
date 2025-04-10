import { popupHelpers } from "../../helpers/popupHelpers.js";
import { createScriptToggle } from "./scriptToggle.js";
import { MANIFEST } from "../../data/MANIFEST.js";

/**
 * Render the scripts in a grid view
 * @param {HTMLElement} container - The container to render into
 * @param {Array} scripts - The scripts to render
 */
export function renderScriptsGridView(container, scripts) {
  if (scripts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <i class="fa fa-search"></i>
        </div>
        <h3 class="empty-state-message">No scripts found</h3>
        <p>Try adjusting your filters to see more results.</p>
      </div>
    `;
    return;
  }

  const grid = document.createElement("div");
  grid.className = "script-grid";

  scripts.forEach((script) => {
    const card = document.createElement("div");
    card.className = "script-card";
    card.dataset.scriptId = script.id;

    card.innerHTML = `
      <div class="script-card-image">
        <img src="${
          script.image || "https://via.placeholder.com/240x130?text=No+Image"
        }" alt="${script.name}">
        <div class="script-card-category">${
          script.category || "Uncategorized"
        }</div>
      </div>
      <div class="script-card-content">
        <div class="script-card-header">
          <h3 class="script-card-title">${script.name}</h3>
          <!-- Placeholder for the toggle switch -->
          <div class="script-card-toggle" data-script-id="${script.id}"></div>
          <span class="script-card-version">v${script.version}</span>
        </div>
        <p class="script-card-description">${
          script.description || "No description available."
        }</p>
        <div class="script-card-footer">
          <!-- Execution phase removed -->
          <div class="script-card-actions">
            <button class="btn btn-primary btn-small view-settings" data-script-id="${
              script.id
            }">
              <i class="fa fa-cog"></i> Settings
            </button>
          </div>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  container.innerHTML = "";
  container.appendChild(grid);

  // Add toggle switches after appending the grid to the DOM
  document
    .querySelectorAll(".script-card-toggle")
    .forEach((toggleContainer) => {
      const scriptId = toggleContainer.dataset.scriptId;
      if (scriptId) {
        const toggle = popupHelpers.createScriptToggle(scriptId);
        toggleContainer.appendChild(toggle);
      }
    });

  // Add event listeners for settings buttons
  container.querySelectorAll(".view-settings").forEach((button) => {
    button.addEventListener("click", (e) => {
      const scriptId = e.currentTarget.dataset.scriptId;
      const script = MANIFEST.scripts.find((s) => s.id === scriptId);
      if (script && script.settings) {
        popupHelpers.showScriptSettings(script);
      } else {
        console.warn(
          `Settings button clicked for script '${scriptId}' which has no settings defined.`
        );
      }
    });
  });
}
