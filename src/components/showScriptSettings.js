/**
 * Shows the settings modal for a script.
 *
 * @param {Object} script - The script object from the manifest.
 * @param {Function} renderScriptSettingsContent - Function to render the settings content.
 * @param {Function} getScriptSetting - Function to retrieve a script setting value.
 * @param {Function} saveScriptSetting - Function to save a script setting value.
 */
import { renderEmptyState } from "./emptyState.js";
import { log } from "../utils/logger.js";

export function showScriptSettings(
  script,
  renderScriptSettingsContent,
  getScriptSetting, // Added getScriptSetting parameter
  saveScriptSetting, // Ensure saveScriptSetting is also passed
) {
  log(`Showing settings modal for script: ${script.name}`);

  // Create modal if it doesn't exist
  let modal = document.getElementById("script-settings-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "script-settings-modal";
    modal.className = "settings-modal";
    document.body.appendChild(modal);
  }

  // Determine if settings can be rendered
  const canRenderSettings =
    script.settings &&
    script.settings.length > 0 &&
    renderScriptSettingsContent &&
    getScriptSetting; // Check if getScriptSetting is provided

  // Populate modal with script settings content
  modal.innerHTML = `
    <div class="settings-modal-content">
      <div class="settings-modal-header">
        <h2 class="settings-modal-title">${script.name} Settings</h2>
        <span class="settings-modal-close">&times;</span>
      </div>

      ${
        /* Conditionally render settings or empty state */
        canRenderSettings
          ? renderScriptSettingsContent(script, getScriptSetting) // Pass getScriptSetting
          : renderEmptyState(
              null,
              "This script doesn't have any configurable settings.",
            ) // Use empty state component
      }

      <div
        class="script-info"
        style="margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 15px;"
      >
        <h3>Script Information</h3>
        <table class="data-table">
          <tr>
            <th>ID</th>
            <td>${script.id}</td>
          </tr>
          <tr>
            <th>Version</th>
            <td>${script.version}</td>
          </tr>
          <tr>
            <th>Category</th>
            <td>${script.category || "Uncategorized"}</td>
          </tr>
          <tr>
            <th>Author</th>
            <td>${script.author || "Unknown"}</td>
          </tr>
          <tr>
            <th>Description</th>
            <td>${script.description || "-"}</td>
          </tr>
          ${
            script.urlPatterns && script.urlPatterns.length > 0
              ? `
          <tr><th>URL Patterns</th><td>${script.urlPatterns.join("<br>")}</td></tr>
          `
              : ""
          }
        </table>
      </div>

      <div class="info-note" style="margin-top: 15px;">
        <strong>Note:</strong> Changes to settings may require a page reload to
        take full effect.
      </div>
    </div>
  `;

  // Show the modal
  modal.style.display = "block";

  // --- Event Listeners ---

  // Close button listener
  const closeButton = modal.querySelector(".settings-modal-close");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  // Click outside listener
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // Add event listeners for setting inputs ONLY if save function is provided
  if (canRenderSettings && saveScriptSetting) {
    // Use a small delay to ensure DOM is ready after innerHTML assignment
    setTimeout(() => {
      const settingsInputs = modal.querySelectorAll(".setting-input");
      settingsInputs.forEach((input) => {
        const settingId = input.dataset.settingId;
        if (!settingId) {
          console.warn("Setting input missing data-setting-id:", input);
          return;
        }

        const eventType = input.type === "checkbox" ? "change" : "input";

        // Clear previous listeners if any (simple approach)
        const new_input = input.cloneNode(true);
        input.parentNode.replaceChild(new_input, input);

        // Add the new listener
        new_input.addEventListener(eventType, (e) => {
          const value =
            e.target.type === "checkbox" ? e.target.checked : e.target.value;
          log(`Setting changed: ${script.id}.${settingId} = ${value}`);
          saveScriptSetting(script.id, settingId, value);
        });
      });
    }, 150); // Slightly increased delay
  }
}
