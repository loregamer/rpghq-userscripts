/**
 * URL Matcher Utility
 *
 * This utility provides functions to check if the current URL matches
 * a pattern or set of patterns. It supports wildcard (*) characters.
 */

/**
 * Check if the current URL matches any of the provided patterns
 *
 * @param {string|string[]} patterns - A pattern or array of patterns to match against
 * @returns {boolean} - True if the current URL matches any pattern, false otherwise
 */
export function matchesUrl(patterns) {
  if (!patterns) return true; // If no patterns, match all URLs

  // Convert single pattern to array
  const patternArray = Array.isArray(patterns) ? patterns : [patterns];

  // If empty array, match all URLs
  if (patternArray.length === 0) return true;

  const currentUrl = window.location.href;

  return patternArray.some((pattern) => {
    // Convert the pattern to a regex pattern
    // Escape regex special chars except for wildcards
    const escapedPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, "\\$&") // Escape special chars
      .replace(/\*/g, ".*"); // Convert * to .*

    const regexPattern = new RegExp("^" + escapedPattern + "$");
    return regexPattern.test(currentUrl);
  });
}

/**
 * Check if a script should be loaded based on the current URL
 *
 * @param {Object} script - The script manifest object
 * @returns {boolean} - True if the script should be loaded, false otherwise
 */
export function shouldLoadScript(script) {
  // If no urlPatterns specified or empty array, load everywhere
  if (!script.urlPatterns || script.urlPatterns.length === 0) {
    return true;
  }

  return matchesUrl(script.urlPatterns);
}
