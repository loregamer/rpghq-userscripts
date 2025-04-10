/**
 * Renders the settings content for a script.
 *
 * @param {Object} script - The script object from the manifest
 * @param {Function} saveScriptSetting - Function to save a script setting
 * @returns {string} - HTML string for the settings content
 */
import { renderSettingControl } from "./renderSettingControl.js";

export function renderScriptSettingsContent(script, saveScriptSetting = null) {
  log(`Rendering settings content for script: ${script.name}`);

  if (!script.settings || script.settings.length === 0) {
    return "";
  }

  return `
    <div class="setting-group">
      ${script.settings
        .map(
          (setting) => `
        <div class="setting-item">
          <label class="setting-label">${setting.label || setting.id}</label>
          <span class="setting-description">${setting.description || ""}</span>
          <div class="setting-control">
            ${renderSettingControl(setting)}
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
  `;
}
