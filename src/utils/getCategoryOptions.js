/**
 * Generates a list of <option> HTML elements for all unique categories in scripts.
 *
 * @param {Array} scripts - The scripts array from SCRIPT_MANIFEST
 * @returns {string} - HTML string of <option> elements for categories
 */
export function getCategoryOptions(scripts) {
  const categories = new Set();
  scripts.forEach((script) => {
    if (script.category) {
      categories.add(script.category);
    }
  });

  return Array.from(categories)
    .sort()
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("");
}
