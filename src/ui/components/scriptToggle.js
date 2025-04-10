import { scriptHelpers } from "../../helpers/scriptHelpers.js";

/**
 * Creates a toggle switch element for enabling/disabling a script.
 * @param {string} scriptId - The ID of the script.
 * @returns {HTMLElement} - The toggle switch element.
 */
export function createScriptToggle(scriptId) {
  const label = document.createElement("label");
  // Use the classes defined in addStyles.js
  label.className = "toggle-switch";

  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = scriptHelpers.isScriptEnabled(scriptId);
  input.dataset.scriptId = scriptId;

  const slider = document.createElement("span");
  // Use the classes defined in addStyles.js
  slider.className = "toggle-slider";

  label.appendChild(input);
  label.appendChild(slider);

  // Add event listener to handle state changes
  input.addEventListener("change", (event) => {
    const scriptId = event.target.dataset.scriptId;
    const isEnabled = event.target.checked;
    scriptHelpers.setScriptEnabled(scriptId, isEnabled);
    console.log(`${scriptId} enabled state set to: ${isEnabled}`);
    // Optionally, add visual feedback or trigger other actions here
  });

  return label;
}
