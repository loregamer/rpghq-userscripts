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

      return `
        <div class="setting-item">
          <label class="setting-label" for="${controlId}">
          </label>
          ${
            setting.description
              ? `
            <span class="setting-description">
              ${setting.description}
            </span>
          `
              : ""
          }
          <div class="setting-control">
            ${renderSettingControl(setting, script.id, getScriptSetting)}
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
