/**
 * Toggles a script's enabled state, saves the state, and loads/unloads the script.
 * 
 * @param {string} scriptId - The ID of the script to toggle
 * @param {boolean} newState - The new enabled state
 * @param {Object} scriptStates - Object containing enabled/disabled states for scripts
 * @param {Function} gmSetValue - Function to save the state
 * @param {Array} scriptManifest - Array of script objects from the manifest
 * @param {Function} loadScript - Function to load a script
 * @param {Function} unloadScript - Function to unload a script
 */
export function toggleScriptEnabled(
  scriptId, 
  newState, 
  scriptStates, 
  gmSetValue, 
  scriptManifest, 
  loadScript, 
  unloadScript
) {
  const storageKey = `script_enabled_${scriptId}`;

  console.log(
    `Toggling script '${scriptId}' to ${newState ? "Enabled" : "Disabled"}`,
  );

  // Update the runtime state
  scriptStates[scriptId] = newState;

  // Save the new state to GM storage
  gmSetValue(storageKey, newState);

  // Trigger immediate loading/unloading based on new state
  console.log(
    `State for ${scriptId} saved as ${newState}. Triggering script ${newState ? "loading" : "unloading"}...`,
  );

  // Find the script in the manifest
  const script = scriptManifest.find((s) => s.id === scriptId);
  if (!script) {
    console.error(`Could not find script with ID ${scriptId} in manifest.`);
    return;
  }

  // Load or unload the script based on new state
  if (newState) {
    loadScript(script);
  } else {
    unloadScript(scriptId);
  }
}