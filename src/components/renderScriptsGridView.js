/**
 * Renders scripts in a grid view with cards.
 *
 * @param {HTMLElement} container - The container element to render into
 * @param {Array} scripts - Array of script objects from the manifest
 * @param {Object} scriptStates - Object containing enabled/disabled states for scripts
 * @param {Function} showScriptSettings - Function to show the settings modal for a script
 */
import { getPhaseDisplayName } from "../utils/getPhaseDisplayName.js";
import { renderEmptyState } from "./emptyState.js";
import { log } from "../utils/logger.js";

export function renderScriptsGridView(
  container,
  scripts,
  scriptStates = {},
  showScriptSettings,
) {
  log("Rendering scripts in Grid View...");

  if (!scripts || scripts.length === 0) {
    renderEmptyState(
      container,
      "No scripts found. Try adjusting your filters to see more results.",
    );
    return;
  }

  const grid = document.createElement("div");
  grid.className = "script-grid";

  scripts.forEach((script) => {
    const isEnabled =
      scriptStates[script.id] !== undefined
        ? scriptStates[script.id]
        : script.enabledByDefault;

    const card = document.createElement("div");
    card.className = isEnabled ? "script-card" : "script-card disabled";
    card.dataset.scriptId = script.id;

    card.innerHTML = `
      <div class="script-card-image">
        <!-- Removed toggle wrapper -->
        <img src="${
          script.image || "https://via.placeholder.com/240x130?text=No+Image"
        }" alt="${script.name}" class="script-image-toggle" data-script-id="${script.id}">
      </div>
      <div class="script-card-content">
        <div class="script-card-header">
          <h3 class="script-card-title">${script.name}</h3>\n          <div class="script-card-actions-top">\n            ${script.settings && script.settings.length > 0 ? `\n            <button class="btn btn-icon view-settings" title="Settings" data-script-id="${script.id}">\n              <i class="fa fa-cog"></i>\n            </button>` : ""}\n          </div>
          <div class="script-card-actions-top">
            <button class="btn btn-icon view-settings" data-script-id="${script.id}">
              <i class="fa fa-cog"></i>
            </button>
          </div>
        </div>
        <p class="script-card-description">${
          script.description || "No description available."
        }</p>
        <div class="script-card-footer">
          <span class="script-card-version">v${script.version}</span>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  container.innerHTML = "";
  container.appendChild(grid);

  // Add event listeners for settings buttons
  document.querySelectorAll(".view-settings").forEach((btn) => {
    btn.addEventListener("click", () => {
      const scriptId = btn.dataset.scriptId;
      const script = scripts.find((s) => s.id === scriptId);
      if (script && showScriptSettings) {
        showScriptSettings(script);
      }
    });
  });

  // Checkbox toggle event listener removed.

  // Make the image clickable for toggling state
  document.querySelectorAll(".script-image-toggle").forEach((img) => {
    img.addEventListener("click", (e) => {
      const scriptId = img.dataset.scriptId;
      const card = img.closest(".script-card"); // Find the parent card

      if (card) {
        // Determine the new state based on current class
        const currentState = !card.classList.contains("disabled"); // true if enabled, false if disabled
        const newState = !currentState; // The desired new state

        // Update the card's visual state
        if (newState) {
          card.classList.remove("disabled");
        } else {
          card.classList.add("disabled");
        }

        // Dispatch the event to notify the application
        const event = new CustomEvent("script-toggle", {
          detail: { scriptId, enabled: newState },
        });
        document.dispatchEvent(event);
      }
    });
  });
}
