/**
 * Check if a script is enabled
 * @param {string} scriptId - The ID of the script
 * @returns {boolean} - Whether the script is enabled
 */
function isScriptEnabled(scriptId) {
  // First try to check the enabled scripts array
  const enabledScripts = localStorage.getItem('rpghq-enabled-scripts');
  if (enabledScripts) {
    try {
      const enabledScriptsArray = JSON.parse(enabledScripts);
      if (enabledScriptsArray.includes(scriptId)) {
        logInfo(`Script ${scriptId} is enabled (found in enabled scripts)`);
        return true;
      }
    } catch (e) {
      logWarning(`Error parsing enabled scripts: ${e.message}`);
    }
  }
  
  // Fall back to checking the disabled scripts array
  const disabledScripts = localStorage.getItem('rpghq-disabled-scripts');
  if (!disabledScripts) {
    logInfo(`Script ${scriptId} is enabled (no disabled scripts found)`);
    return true; // By default, all scripts are enabled
  }
  
  try {
    const disabledScriptsArray = JSON.parse(disabledScripts);
    const isEnabled = !disabledScriptsArray.includes(scriptId);
    logInfo(`Script ${scriptId} is ${isEnabled ? 'enabled' : 'disabled'} (based on disabled scripts list)`);
    return isEnabled;
  } catch (e) {
    logWarning(`Error parsing disabled scripts: ${e.message}`);
    return true; // If there's an error parsing, default to enabled
  }
}

// Export the function if in Node.js environment
if (typeof module !== 'undefined') {
  module.exports = isScriptEnabled;
}