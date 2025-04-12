/**
 * Renders an appropriate HTML control element based on the setting type.
 *
 * @param {Object} setting - The setting object with type, options, etc.
 * @returns {string} - HTML string for the rendered control
 */
export function renderSettingControl(setting) {
  switch (setting.type) {
    case "checkbox": // Changed from boolean
      return `
          <input type="checkbox" name="${setting.id}" ${setting.default ? "checked" : ""}>
        `;
    case "select":
      return `
          <select class="setting-input">
            ${setting.options
              .map(
                (option) => `
              <option value="${option}" ${
                option === setting.default ? "selected" : ""
              }>${option}</option>
            `,
              )
              .join("")}
          </select>
        `;
    case "number":
      return `
          <input type="number" class="setting-input" value="${
            setting.default || 0
          }">
        `;
    default:
      return `
          <input type="text" class="setting-input" value="${
            setting.default || ""
          }">
        `;
  }
}
