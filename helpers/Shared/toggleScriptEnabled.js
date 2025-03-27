/**
 * Toggle whether a script is enabled
 * @param {string} scriptId - The ID of the script
 * @returns {boolean} - The new state (true = enabled, false = disabled)
 */
function toggleScriptEnabled(scriptId) {
  // For backwards compatibility, read from disabled scripts
  const disabledScripts = GM_getValue("rpghq-disabled-scripts", null);
  let disabledScriptsArray = [];

  if (disabledScripts) {
    try {
      disabledScriptsArray = JSON.parse(disabledScripts);
    } catch (e) {
      disabledScriptsArray = [];
      logWarning(`Error parsing disabled scripts: ${e.message}`);
    }
  }

  // Get the enabled scripts array
  const enabledScripts = GM_getValue("rpghq-enabled-scripts", null);
  let enabledScriptsArray = [];

  if (enabledScripts) {
    try {
      enabledScriptsArray = JSON.parse(enabledScripts);
    } catch (e) {
      enabledScriptsArray = [];
      logWarning(`Error parsing enabled scripts: ${e.message}`);
    }
  }

  // If a script isn't in either array, consider it enabled by default
  const isCurrentlyEnabled = !disabledScriptsArray.includes(scriptId);

  if (isCurrentlyEnabled) {
    // Disable the script
    disabledScriptsArray.push(scriptId);
    // Remove from enabled scripts if it exists
    enabledScriptsArray = enabledScriptsArray.filter((id) => id !== scriptId);
    logInfo(`Disabled script: ${scriptId}`);
  } else {
    // Enable the script
    disabledScriptsArray = disabledScriptsArray.filter((id) => id !== scriptId);
    // Add to enabled scripts if it doesn't exist
    if (!enabledScriptsArray.includes(scriptId)) {
      enabledScriptsArray.push(scriptId);
    }
    logInfo(`Enabled script: ${scriptId}`);
  }

  // Update both storage items
  GM_setValue("rpghq-disabled-scripts", JSON.stringify(disabledScriptsArray));
  GM_setValue("rpghq-enabled-scripts", JSON.stringify(enabledScriptsArray));

  logInfo(
    `Script state toggled: ${scriptId} is now ${
      !isCurrentlyEnabled ? "enabled" : "disabled"
    }`
  );
  logInfo(`Enabled scripts: ${JSON.stringify(enabledScriptsArray)}`);

  return !isCurrentlyEnabled;
}

// Export the function if in Node.js environment
if (typeof module !== "undefined") {
  module.exports = toggleScriptEnabled;
}
