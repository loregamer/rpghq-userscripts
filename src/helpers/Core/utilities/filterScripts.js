import { compareVersions } from './compareVersions.js';

/**
 * Filter scripts based on selected criteria
 * @param {Array} scripts - The list of scripts to filter
 * @param {Object} filters - The filter criteria
 * @returns {Array} - Filtered scripts
 */
export function filterScripts(scripts, filters) {
  if (!filters) {
    // If no filters provided, get them from the DOM
    const category = document.getElementById("category-filter").value;
    const phase = document.getElementById("phase-filter").value;
    const hasSettings = document.getElementById("has-settings-filter").value;
    const searchTerm = document
      .getElementById("search-filter")
      .value.toLowerCase();
    const sortBy = document.getElementById("sort-filter").value;

    filters = { category, phase, hasSettings, searchTerm, sortBy };
  }

  // Filter scripts
  let filtered = scripts.filter((script) => {
    const matchesCategory =
      filters.category === "all" || script.category === filters.category;
    const matchesPhase =
      filters.phase === "all" || script.executionPhase === filters.phase;
    const matchesSettings =
      filters.hasSettings === "all" ||
      (filters.hasSettings === "with" &&
        script.settings &&
        script.settings.length > 0) ||
      (filters.hasSettings === "without" &&
        (!script.settings || script.settings.length === 0));
    const matchesSearch =
      !filters.searchTerm ||
      script.name.toLowerCase().includes(filters.searchTerm) ||
      (script.description &&
        script.description.toLowerCase().includes(filters.searchTerm));

    return matchesCategory && matchesPhase && matchesSettings && matchesSearch;
  });

  // Sort scripts
  filtered.sort((a, b) => {
    switch (filters.sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "version-asc":
        return compareVersions(a.version, b.version);
      case "version-desc":
        return compareVersions(b.version, a.version);
      case "category":
        return (a.category || "").localeCompare(b.category || "");
      default:
        return 0;
    }
  });

  return filtered;
}
