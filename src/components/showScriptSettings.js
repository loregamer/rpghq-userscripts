/**
 * Shows the settings modal for a script.
 * 
 * @param {Object} script - The script object from the manifest
 * @param {Function} renderScriptSettingsContent - Function to render the settings content
 * @param {Function} saveScriptSetting - Function to save a script setting
 */
import { renderEmptyState } from './emptyState.js';

export function showScriptSettings(script, renderScriptSettingsContent, saveScriptSetting = null) {
  console.log(`Showing settings modal for script: ${script.name}`);
  
  // Create modal if it doesn't exist
  let modal = document.getElementById("script-settings-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "script-settings-modal";
    modal.className = "settings-modal";
    document.body.appendChild(modal);
  }

  // Populate modal with script settings
  modal.innerHTML = `
    <div class="settings-modal-content">
      <div class="settings-modal-header">
        <h2 class="settings-modal-title">${script.name} Settings</h2>
        <span class="settings-modal-close">&times;</span>
      </div>
    
      ${
        script.settings && script.settings.length > 0 && renderScriptSettingsContent
          ? renderScriptSettingsContent(script, saveScriptSetting)
          : `<div class="empty-state">
              <div class="empty-state-icon">
                <i class="fa fa-cog"></i>
              </div>
              <h3 class="empty-state-message">No Settings Available</h3>
              <p>This script doesn't have any configurable settings.</p>
            </div>`
      }
    
      <div class="script-info" style="margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 15px;">
        <h3>Script Information</h3>
        <table class="data-table">
          <tr>
            <th>ID</th>
            <td>${script.id}</td>
          </tr>
          <tr>
            <th>Version</th>
            <td>${script.version}</td>
          </tr>
          <tr>
            <th>Category</th>
            <td>${script.category || "Uncategorized"}</td>
          </tr>
          <tr>
            <th>Execution Phase</th>
            <td>${script.executionPhase || "Not specified"}</td>
          </tr>
          <tr>
            <th>Matches</th>
            <td>${
              script.matches ? script.matches.join("<br>") : "Not specified"
            }</td>
          </tr>
        </table>
      </div>
    
      <div class="info-note" style="margin-top: 15px;">
        <strong>Note:</strong> Changes to settings may require a page reload to take full effect.
      </div>
    </div>
  `;

  // Show the modal
  modal.style.display = "block";

  // Add event listeners
  modal
    .querySelector(".settings-modal-close")
    .addEventListener("click", () => {
      modal.style.display = "none";
    });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // If we have settings, add event listeners for inputs
  if (script.settings && script.settings.length > 0 && saveScriptSetting) {
    setTimeout(() => {
      // Need to add these with a small delay to ensure the DOM is ready
      const settingsInputs = modal.querySelectorAll('.setting-input');
      settingsInputs.forEach(input => {
        const settingId = input.dataset.settingId;
        if (!settingId) return;
        
        const eventType = input.type === 'checkbox' ? 'change' : 'input';
        input.addEventListener(eventType, (e) => {
          const value = input.type === 'checkbox' ? input.checked : input.value;
          saveScriptSetting(script.id, settingId, value);
        });
      });
    }, 100);
  }
}