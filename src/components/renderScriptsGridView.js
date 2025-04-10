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

export function renderScriptsGridView(
  container,
  scripts,
  scriptStates = {},
  showScriptSettings,
) {
  console.log("Rendering scripts in Grid View...");

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
    card.className = isEnabled ? "script-card enabled" : "script-card";
    card.dataset.scriptId = script.id;

    card.innerHTML = `
      <div class="script-card-image">
        <img src="${
          script.image || "https://via.placeholder.com/240x130?text=No+Image"
        }" alt="${script.name}">
      </div>
      <div class="script-card-content">
        <div class="script-card-header">
          <h3 class="script-card-title">${script.name}</h3>
          <div class="script-card-actions-top">
            <span class="script-toggle-wrapper" data-script-id="${script.id}">
              <input type="checkbox" class="script-toggle-checkbox" data-script-id="${script.id}" ${isEnabled ? "checked" : ""}>
            </span>
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

  // Add event listeners for checkbox toggles
  document.querySelectorAll(".script-toggle-checkbox").forEach((toggle) => {
    toggle.addEventListener("change", (e) => {
      const scriptId = toggle.dataset.scriptId;
      const newState = toggle.checked;

      // Update the card class to show enabled state with border
      const card = document.querySelector(
        `.script-card[data-script-id="${scriptId}"]`,
      );
      if (card) {
        if (newState) {
          card.classList.add("enabled");
        } else {
          card.classList.remove("enabled");
        }
      }

      // Dispatch a custom event that main.js can listen for
      const event = new CustomEvent("script-toggle", {
        detail: { scriptId, enabled: newState },
      });
      document.dispatchEvent(event);
    });
  });
}
