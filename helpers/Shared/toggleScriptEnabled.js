/**
 * Toggle whether a script is enabled
 * @param {string} scriptId - The ID of the script
 * @returns {boolean} - The new state (true = enabled, false = disabled)
 */
function toggleScriptEnabled(scriptId) {
  const disabledScripts = localStorage.getItem('rpghq-disabled-scripts');
  let disabledScriptsArray = [];
  
  if (disabledScripts) {
    try {
      disabledScriptsArray = JSON.parse(disabledScripts);
    } catch (e) {
      disabledScriptsArray = [];
    }
  }
  
  const isCurrentlyEnabled = !disabledScriptsArray.includes(scriptId);
  
  if (isCurrentlyEnabled) {
    // Disable the script
    disabledScriptsArray.push(scriptId);
  } else {
    // Enable the script
    disabledScriptsArray = disabledScriptsArray.filter(id => id !== scriptId);
  }
  
  localStorage.setItem('rpghq-disabled-scripts', JSON.stringify(disabledScriptsArray));
  
  return !isCurrentlyEnabled;
}

// Export the function if in Node.js environment
if (typeof module !== 'undefined') {
  module.exports = toggleScriptEnabled;
}