import { MANIFEST } from '../../../data/MANIFEST.js';

/**
 * Get unique categories for the filter dropdown
 * @returns {string} - HTML options for categories
 */
export function getCategoryOptions() {
  const categories = new Set();
  MANIFEST.scripts.forEach((script) => {
    if (script.category) {
      categories.add(script.category);
    }
  });

  return Array.from(categories)
    .sort()
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("");
}
