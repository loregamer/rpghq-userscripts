/**
 * Renders an appropriate HTML control element based on the setting type,
 * using the currently saved value.
 *
 * @param {Object} setting - The setting object from the manifest.
 * @param {string} scriptId - The ID of the script these settings belong to.
 * @param {Function} getScriptSetting - Function to retrieve the saved setting value.
 * @returns {string} - HTML string for the rendered control.
 */
export function renderSettingControl(setting, scriptId, getScriptSetting) {
  // Get the currently saved value, falling back to the manifest default
  const currentValue = getScriptSetting(
    scriptId,
    setting.id,
    setting.defaultValue,
  );
  const controlId = `setting-${scriptId}-${setting.id}`; // Unique ID for label association

  switch (setting.type) {
    case "checkbox":
      return `
        <input 
          type="checkbox" 
          class="setting-input" 
          id="${controlId}" 
          data-setting-id="${setting.id}" 
          name="${setting.id}" 
          ${currentValue ? "checked" : ""}
        >`;
    case "select":
      return `
        <select 
          class="setting-input" 
          id="${controlId}" 
          data-setting-id="${setting.id}" 
          name="${setting.id}"
        >
          ${setting.options
            .map((option) => {
              const value = typeof option === "object" ? option.value : option;
              const label = typeof option === "object" ? option.label : option;
              const isSelected = value === currentValue;
              return `<option value="${value}" ${isSelected ? "selected" : ""}>${label}</option>`;
            })
            .join("")}
        </select>`;
    case "number":
      return `
        <input 
          type="number" 
          class="setting-input" 
          id="${controlId}" 
          data-setting-id="${setting.id}" 
          name="${setting.id}" 
          value="${currentValue ?? 0}"
        >`;
    default: // Default to text
      return `
        <input 
          type="text" 
          class="setting-input" 
          id="${controlId}" 
          data-setting-id="${setting.id}" 
          name="${setting.id}" 
          value="${currentValue ?? ""}"
        >`;
  }
}
