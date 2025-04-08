import { createScriptToggle } from './scriptToggle.js';
import { showScriptSettings } from '../modals/settings/showScriptSettings.js';

/**
 * Render the scripts in a list view
 * @param {HTMLElement} container - The container to render into
 * @param {Array} scripts - The scripts to render
 */
export function renderScriptsListView(container, scripts) {
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

  const table = document.createElement("table");
  table.className = "data-table";

  table.innerHTML = `
    <thead>
      <tr>
        <th>Enabled</th>
        <th>Name</th>
        <th>Version</th>
        <th>Category</th>
        <th>Description</th>
        <!-- Execution Phase removed -->
        <th>Settings</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${scripts
        .map(
          (script) => `
        <tr>
          <!-- Placeholder for the toggle switch -->
          <td class="script-toggle-cell" data-script-id="${script.id}"></td>
          <td><strong>${script.name}</strong></td>
          <td>v${script.version}</td>
          <td>${script.category || "Uncategorized"}</td>
          <td>${script.description || "No description available."}</td>
          <!-- Execution phase removed -->
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
      `
        )
        .join("")}
    </tbody>
  `;

  container.innerHTML = "";
  container.appendChild(table);

  // Add toggle switches after appending the table to the DOM
  document.querySelectorAll(".script-toggle-cell").forEach((cell) => {
    const scriptId = cell.dataset.scriptId;
    if (scriptId) {
      cell.appendChild(createScriptToggle(scriptId));
    }
  });

  // Add event listeners for settings buttons
  document.querySelectorAll(".view-settings").forEach((btn) => {
    btn.addEventListener("click", () => {
      const scriptId = btn.dataset.scriptId;
      const script = scripts.find((s) => s.id === scriptId);
      if (script) {
        showScriptSettings(script);
      }
    });
  });
}
