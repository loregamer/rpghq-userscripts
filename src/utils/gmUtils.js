// Utility functions for interacting with GM_setValue and GM_getValue

const GM_PREFIX = "RPGHQ_Manager_"; // Prefix for GM_setValue/GM_getValue keys

export function gmGetValue(key, defaultValue) {
  // eslint-disable-next-line no-undef
  return GM_getValue(GM_PREFIX + key, defaultValue);
}

export function gmSetValue(key, value) {
  // eslint-disable-next-line no-undef
  GM_setValue(GM_PREFIX + key, value);
}

// Function to get a setting specific to a script
export function getScriptSetting(scriptId, settingId, defaultValue) {
  const storageKey = `script_setting_${scriptId}_${settingId}`;
  return gmGetValue(storageKey, defaultValue);
}

// Function to save a setting specific to a script
export function saveScriptSetting(scriptId, settingId, value) {
  const storageKey = `script_setting_${scriptId}_${settingId}`;
  gmSetValue(storageKey, value);
}

// Add other GM_* related utility functions here if needed
