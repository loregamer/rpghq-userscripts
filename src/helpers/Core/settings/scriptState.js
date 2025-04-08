/**
 * @module scriptState
 * @description Helper functions for managing the enabled/disabled state of scripts.
 */

const SETTINGS_KEY_PREFIX = 'script_enabled_';

/**
 * Gets the enabled state for a specific script. Defaults to true if not set.
 * @param {string} scriptId - The ID of the script.
 * @returns {boolean} - True if the script is enabled, false otherwise.
 */
export function isScriptEnabled(scriptId) {
  // Default to enabled (true) if no setting is found
  return GM_getValue(SETTINGS_KEY_PREFIX + scriptId, true);
}

/**
 * Sets the enabled state for a specific script.
 * @param {string} scriptId - The ID of the script.
 * @param {boolean} isEnabled - The new state (true for enabled, false for disabled).
 */
export function setScriptEnabled(scriptId, isEnabled) {
  GM_setValue(SETTINGS_KEY_PREFIX + scriptId, isEnabled);
}
