/**
 * Render a preference control based on its type
 * @param {Object} preference - The preference object
 * @returns {string} - HTML for the preference control
 */
function renderPreferenceControl(preference) {
  switch (preference.type) {
    case "toggle":
      return `
        <label class="toggle-switch">
          <input type="checkbox" ${preference.default ? "checked" : ""}>
          <span class="toggle-slider"></span>
        </label>
      `;
    case "select":
      return `
        <select>
          ${preference.options
            .map(
              (option) => `
            <option ${
              option === preference.default ? "selected" : ""
            }>${option}</option>
          `
            )
            .join("")}
        </select>
      `;
    default:
      return `
        <input type="text" value="${preference.default || ""}">
      `;
  }
}

// Export the function
module.exports = renderPreferenceControl;
