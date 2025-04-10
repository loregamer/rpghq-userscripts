/**
 * @module scriptStateHelpers
 * @description Helper functions for managing the enabled/disabled state of scripts.
 */

const SETTINGS_KEY_PREFIX = "script_enabled_";

/**
 * Gets the enabled state for a specific script. Defaults to true if not set.
 * @param {string} scriptId - The ID of the script.
 * @returns {boolean} - True if the script is enabled, false otherwise.
 */
function _isScriptEnabled(scriptId) {
  // Default to enabled (true) if no setting is found
  return GM_getValue(SETTINGS_KEY_PREFIX + scriptId, true);
}

/**
 * Sets the enabled state for a specific script.
 * @param {string} scriptId - The ID of the script.
 * @param {boolean} isEnabled - The new state (true for enabled, false for disabled).
 */
function _setScriptEnabled(scriptId, isEnabled) {
  GM_setValue(SETTINGS_KEY_PREFIX + scriptId, isEnabled);
}

export const scriptState = {
  isScriptEnabled: _isScriptEnabled,
  setScriptEnabled: _setScriptEnabled,
  SETTINGS_KEY_PREFIX: SETTINGS_KEY_PREFIX, // Optionally export prefix if needed elsewhere
};
