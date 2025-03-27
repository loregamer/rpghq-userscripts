/**
 * Check if a script is enabled
 * @param {string} scriptId - The ID of the script
 * @returns {boolean} - Whether the script is enabled
 */
function isScriptEnabled(scriptId) {
  const disabledScripts = localStorage.getItem('rpghq-disabled-scripts');
  if (!disabledScripts) {
    return true; // By default, all scripts are enabled
  }
  
  try {
    const disabledScriptsArray = JSON.parse(disabledScripts);
    return !disabledScriptsArray.includes(scriptId);
  } catch (e) {
    return true; // If there's an error parsing, default to enabled
  }
}

// Export the function if in Node.js environment
if (typeof module !== 'undefined') {
  module.exports = isScriptEnabled;
}