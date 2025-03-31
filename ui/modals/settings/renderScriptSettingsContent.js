/**
 * Render script settings content
 * @param {Object} script - The script object
 * @returns {string} - HTML for the script settings
 */
function renderScriptSettingsContent(script) {
  if (!script.settings || script.settings.length === 0) {
    return "";
  }

  return `
    <div class="setting-group">
      ${script.settings
        .map(
          (setting) => `
        <div class="setting-item">
          <label class="setting-label">${setting.label}</label>
          <span class="setting-description">${setting.description}</span>
          <div class="setting-control">
            ${renderSettingControl(setting)}
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}
