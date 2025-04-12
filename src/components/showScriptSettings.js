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
  getScriptSetting,
  saveScriptSetting,
) {
  log(`Showing settings modal for script: ${script.name}`);

  let modal = document.getElementById("script-settings-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "script-settings-modal";
    modal.className = "settings-modal";
    document.body.appendChild(modal);
  }

  const canRenderSettings =
    script.settings &&
    script.settings.length > 0 &&
    renderScriptSettingsContent &&
    getScriptSetting;

  modal.innerHTML = `
    <div class="settings-modal-content">
      <div class="settings-modal-header">
        <h2 class="settings-modal-title">${script.name} Settings</h2>
        <span class="settings-modal-close">&times;</span>
      </div>

      ${
        canRenderSettings
          ? renderScriptSettingsContent(script, getScriptSetting)
          : renderEmptyState(
              null,
              "This script doesn't have any configurable settings.",
            )
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

  modal.style.display = "block";

  const closeButton = modal.querySelector(".settings-modal-close");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // Function to update visibility of dependent settings
  function updateDependentSettingsVisibility(changedSettingId, newValue) {
    const settingItems = modal.querySelectorAll(
      ".setting-item[data-depends-on]",
    );
    settingItems.forEach((item) => {
      const dependsOn = item.dataset.dependsOn;
      if (dependsOn === changedSettingId) {
        const requiredValue = JSON.parse(item.dataset.dependsValue);
        const shouldBeVisible = newValue === requiredValue;
        log(
          `Checking dependency: ${item.dataset.settingId} depends on ${changedSettingId}. Value: ${newValue}, Required: ${requiredValue}. Visible: ${shouldBeVisible}`,
        );
        if (shouldBeVisible) {
          item.classList.remove("setting-item-hidden");
        } else {
          item.classList.add("setting-item-hidden");
        }
      }
    });
  }

  if (canRenderSettings && saveScriptSetting) {
    setTimeout(() => {
      const settingsInputs = modal.querySelectorAll(".setting-input");
      settingsInputs.forEach((input) => {
        const settingId = input.dataset.settingId;
        if (!settingId) {
          console.warn("Setting input missing data-setting-id:", input);
          return;
        }

        const eventType =
          input.type === "checkbox" ||
          input.type === "radio" ||
          input.tagName === "SELECT"
            ? "change"
            : "input";

        // Use existing input, no need to clone
        input.addEventListener(eventType, (e) => {
          const target = e.target;
          const value =
            target.type === "checkbox" ? target.checked : target.value;
          log(`Setting changed: ${script.id}.${settingId} = ${value}`);
          saveScriptSetting(script.id, settingId, value);

          // Update visibility of dependent settings
          updateDependentSettingsVisibility(settingId, value);
        });
      });
    }, 150);
  }
}
