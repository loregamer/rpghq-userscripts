/**
 * Renders scripts in a list/table view.
 *
 * @param {HTMLElement} container - The container element to render into
 * @param {Array} scripts - Array of script objects from the manifest
 * @param {Object} scriptStates - Object containing enabled/disabled states for scripts
 * @param {Function} showScriptSettings - Function to show the settings modal for a script
 */
import { getPhaseDisplayName } from "../utils/getPhaseDisplayName.js";
import { renderEmptyState } from "./emptyState.js";
import { log } from "../utils/logger.js";

export function renderScriptsListView(
  container,
  scripts,
  scriptStates = {},
  showScriptSettings,
) {
  if (!scripts || scripts.length === 0) {
    renderEmptyState(
      container,
      "No scripts found. Try adjusting your filters to see more results.",
    );
    return;
  }

  const table = document.createElement("table");
  table.className = "data-table";

  table.innerHTML = `
    <thead>
      <tr>
        <th>Name</th>
        <th>Category</th>
        <th>Description</th>
        <th>Status</th>
        <th>Settings</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${scripts
        .map((script) => {
          const isEnabled =
            scriptStates[script.id] !== undefined
              ? scriptStates[script.id]
              : script.enabledByDefault;
          return `
              <tr>
                <td><strong>${script.name}</strong> <span class="script-version-inline">v${script.version}</span></td>
                <td>${script.category || "Uncategorized"}</td>
                <td>${script.description || "No description available."}</td>
                <td>
                  <label class="toggle-switch">
                    <input type="checkbox" class="script-toggle" data-script-id="${script.id}" ${isEnabled ? "checked" : ""}>
                    <span class="toggle-slider"></span>
                  </label>
                </td>
                <td>${
                  script.settings && script.settings.length > 0
                    ? `<span class="badge badge-primary">${script.settings.length}</span>`
                    : "-"
                }</td>
                <td>
                  <button class="btn btn-primary btn-small view-settings" data-script-id="${
                    script.id
                  }">
                    <i class="fa fa-cog"></i> Settings
                  </button>
                </td>
              </tr>
            `;
        })
        .join("")}
    </tbody>
  `;

  container.innerHTML = "";
  container.appendChild(table);

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

  // Add event listeners for toggle switches
  document.querySelectorAll(".script-toggle").forEach((toggle) => {
    toggle.addEventListener("change", (e) => {
      const scriptId = toggle.dataset.scriptId;
      const newState = toggle.checked;

      // Dispatch a custom event that main.js can listen for
      const event = new CustomEvent("script-toggle", {
        detail: { scriptId, enabled: newState },
      });
      document.dispatchEvent(event);
    });
  });
}
