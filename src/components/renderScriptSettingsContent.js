/**
 * Renders the settings content HTML for a script.
 *
 * @param {Object} script - The script object from the manifest.
 * @param {Function} getScriptSetting - Function to retrieve a script setting value.
 * @returns {string} - HTML string for the settings content, or empty string if no settings.
 */
import { renderSettingControl } from "./renderSettingControl.js";
import { log } from "../utils/logger.js";

export function renderScriptSettingsContent(script, getScriptSetting) {
  log(`Rendering settings content for script: ${script.name} (${script.id})`);

  // Guard clauses for invalid input or no settings
  if (!script || !script.id) {
    log("Error: Invalid script object passed to renderScriptSettingsContent.");
    return "<p>Error loading settings.</p>";
  }
  if (!script.settings || script.settings.length === 0) {
    log(`No settings defined for script: ${script.name}`);
    // Return an empty state message instead of just empty string
    return `
      <div class="empty-state">
        <p>This script has no configurable settings.</p>
      </div>
    `;
  }
  if (typeof getScriptSetting !== "function") {
    log(
      `Error: getScriptSetting function not provided for script: ${script.name}`,
    );
    return "<p>Error loading setting values.</p>";
  }

  // Map each setting definition to its HTML representation
  const settingsHTML = script.settings
    .map((setting) => {
      if (!setting || !setting.id) {
        log(
          `Warning: Invalid setting definition found in script ${script.id}`,
          setting,
        );
        return ""; // Skip invalid setting definitions
      }
      const controlId = `setting-${script.id}-${setting.id}`; // Unique ID for label

      const settingName = setting.name || setting.id; // Use name if available, else ID
      let controlHTML = "";

      if (setting.type === "checkbox") {
        const isChecked = getScriptSetting(
          script.id,
          setting.id,
          setting.defaultValue,
        );
        controlHTML = `
          <label class="toggle-switch">
            <input 
              type="checkbox" 
              class="setting-input" 
              data-setting-id="${setting.id}" 
              name="${setting.id}" 
              ${isChecked ? "checked" : ""}
            >
            <span class="toggle-slider"></span>
          </label>
        `;
      } else {
        controlHTML = renderSettingControl(
          setting,
          script.id,
          getScriptSetting,
        );
      }
      // New layout: Name/Description on left, Control on right
      return `
        <div class="setting-item">
          <div class="setting-details">
            <div class="setting-name">${settingName}</div>
            ${setting.description ? `<div class="setting-description">${setting.description}</div>` : ""}
            ${setting.previewImage ? `<img src="${setting.previewImage}" alt="Setting preview" class="setting-preview-image">` : ""}
          </div>
          <div class="setting-control">
            ${controlHTML}
          </div>
        </div>
      `;
    })
    .join("\n"); // Join with newline for readability in source

  // Return the group container with all settings HTML
  return `
    <div class="setting-group">
      ${settingsHTML}
    </div>
  `;
}
