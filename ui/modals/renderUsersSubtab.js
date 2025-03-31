/**
 * Render the Users sub-tab content
 * @param {HTMLElement} container - The container to render the content into
 */
function renderUsersSubtab(container) {
  container.innerHTML = `
    <div class="wip-banner">
      <i class="fa fa-wrench"></i> User Preferences - Work In Progress
    </div>
    
    <div class="preferences-section">
      <div class="preferences-section-header">
        <h3 class="preferences-section-title">User Display</h3>
      </div>
      <div class="preferences-section-body">
        <div class="preference-item">
          <div class="preference-header">
            <h4 class="preference-name">Show User Signatures</h4>
            <div class="preference-control">
              <label class="toggle-switch">
                <input type="checkbox" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <p class="preference-description">Display user signatures in posts</p>
        </div>
        
        <div class="preference-item">
          <div class="preference-header">
            <h4 class="preference-name">Show User Avatars</h4>
            <div class="preference-control">
              <label class="toggle-switch">
                <input type="checkbox" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <p class="preference-description">Display user avatars in posts and listings</p>
        </div>
      </div>
    </div>
    
    <div class="info-note">
      <strong>Note:</strong> This is a view-only display. Additional User preferences will be added in future updates.
    </div>
  `;
}

// Export the function
if (typeof module !== 'undefined') {
  module.exports = renderUsersSubtab;
}
