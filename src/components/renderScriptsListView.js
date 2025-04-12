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
  log("Rendering scripts in List View...");

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
              <tr class="${isEnabled ? "enabled" : ""}">
                <td><strong>${script.name}</strong> <span class="script-version-inline">v${script.version}</span></td>
                <td>${script.category || "Uncategorized"}</td>
                <td>${script.description || "No description available."}</td>
                <td>
                  <!-- Removed toggle switch -->
                </td>
                <td>${
                  script.settings && script.settings.length > 0
                    ? `<span class="badge badge-primary">${script.settings.length}</span>`
                    : "-"
                }</td>
                <td>${
                  script.settings && script.settings.length > 0
                    ? `\n                  <button class="btn btn-primary btn-small view-settings" title="Settings" data-script-id="${
                        script.id
                      }">\n                    <i class="fa fa-cog"></i> Settings\n                  </button>`
                    : ""
                }</td>
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

  // Event listeners for toggle switches were removed.
}
