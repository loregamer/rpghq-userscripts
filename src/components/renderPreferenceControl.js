/**
 * Renders an appropriate HTML control element based on the preference type.
 *
 * @param {Object} preference - The preference object with type, options, etc.
 * @returns {string} - HTML string for the rendered control
 */
export function renderPreferenceControl(preference) {
  switch (preference.type) {
    case "toggle":
      return `
          <input type="checkbox" name="${preference.id}" ${preference.default ? "checked" : ""}>
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
            `,
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
