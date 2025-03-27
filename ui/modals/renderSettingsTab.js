/**
 * Render the "Settings" tab content
 * @param {HTMLElement} container - The container to render into
 */
function renderSettingsTab(container) {
  container.innerHTML += `
    <h2>Global Settings</h2>
    
    <div class="preferences-section">
      <div class="preferences-section-header">
        <h3 class="preferences-section-title">Appearance</h3>
      </div>
      <div class="preferences-section-body">
        <div class="preference-item">
          <div class="preference-header">
            <h4 class="preference-name">Theme</h4>
            <div class="preference-control">
              <select class="setting-input">
                <option value="dark" selected>Dark</option>
                <option value="light">Light</option>
                <option value="system">System Default</option>
              </select>
            </div>
          </div>
          <p class="preference-description">Choose your preferred theme for the userscript manager</p>
        </div>
        
        <div class="preference-item">
          <div class="preference-header">
            <h4 class="preference-name">Script Card Size</h4>
            <div class="preference-control">
              <select class="setting-input">
                <option value="small">Small</option>
                <option value="medium" selected>Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
          <p class="preference-description">Adjust the size of script cards in the gallery view</p>
        </div>
      </div>
    </div>
    
    <div class="preferences-section">
      <div class="preferences-section-header">
        <h3 class="preferences-section-title">Behavior</h3>
      </div>
      <div class="preferences-section-body">
        <div class="preference-item">
          <div class="preference-header">
            <h4 class="preference-name">Default View</h4>
            <div class="preference-control">
              <select class="setting-input">
                <option value="grid" selected>Grid</option>
                <option value="list">List</option>
              </select>
            </div>
          </div>
          <p class="preference-description">Choose the default view for displaying scripts</p>
        </div>
        
        <div class="preference-item">
          <div class="preference-header">
            <h4 class="preference-name">Auto-check for Updates</h4>
            <div class="preference-control">
              <label class="toggle-switch">
                <input type="checkbox" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <p class="preference-description">Automatically check for script updates when the page loads</p>
        </div>
      </div>
    </div>
    
    <div class="preferences-section">
      <div class="preferences-section-header">
        <h3 class="preferences-section-title">Advanced</h3>
      </div>
      <div class="preferences-section-body">
        <div class="preference-item">
          <div class="preference-header">
            <h4 class="preference-name">Update Check Interval</h4>
            <div class="preference-control">
              <select class="setting-input">
                <option value="daily">Daily</option>
                <option value="weekly" selected>Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
          <p class="preference-description">How often to check for script updates</p>
        </div>
        
        <div class="preference-item">
          <div class="preference-header">
            <h4 class="preference-name">Debug Mode</h4>
            <div class="preference-control">
              <label class="toggle-switch">
                <input type="checkbox">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <p class="preference-description">Enable verbose console logging for troubleshooting</p>
        </div>
      </div>
    </div>
    
    <div class="info-note">
      <strong>Note:</strong> These are view-only representations of settings. Changes made here will not be saved.
    </div>
  `;
}

// Export the function
if (typeof module !== 'undefined') {
  module.exports = renderSettingsTab;
}
