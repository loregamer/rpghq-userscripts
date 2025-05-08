/**
 * Renders the "Settings" tab content with global manager settings.
 *
 * @param {HTMLElement} container - The container element to render into
 */
import { log } from "../../utils/logger.js";
import { gmGetValue, gmSetValue } from "../../main.js";
import { clearAllCachedPosts } from "../../utils/postCache.js";

// Key for the auto-update check setting
const AUTO_UPDATE_CHECK_KEY = "auto_update_check";

export function renderSettingsTab(container) {
  log("Rendering Settings tab...");

  // Get the current auto-update check setting
  const autoUpdateCheck = gmGetValue(AUTO_UPDATE_CHECK_KEY, true); // Default to true

  container.innerHTML = `
    <div class="preferences-section">
      <div class="preferences-section-header">
        <h3 class="preferences-section-title">Data Management</h3>
      </div>
      <div class="preferences-section-body">
        <div class="preference-item">
          <div class="preference-header">
            <h4 class="preference-name">Post Cache</h4>
            <div class="preference-control">
              <button id="clear-post-cache-btn" class="button1">Clear Cache</button>
            </div>
          </div>
          <p class="preference-description">Clear all cached posts and topic data. The cache will rebuild as you browse.</p>
          <p id="cache-status-message" class="preference-status" style="font-style: italic; margin-top: 8px;"></p>
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
            <h4 class="preference-name">Auto-check for Updates</h4>
            <div class="preference-control">
              <label class="toggle-switch">
                <input type="checkbox" id="auto-update-check" ${autoUpdateCheck ? "checked" : ""}>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <p class="preference-description">Automatically check for script updates when the page loads</p>
        </div>
      </div>
    </div>
  `;

  // Add event listener for the clear cache button
  const clearCacheBtn = container.querySelector("#clear-post-cache-btn");
  const statusMessage = container.querySelector("#cache-status-message");

  clearCacheBtn.addEventListener("click", () => {
    // Disable button while processing
    clearCacheBtn.disabled = true;
    clearCacheBtn.textContent = "Clearing...";

    // Clear the cache
    setTimeout(() => {
      try {
        const removedCount = clearAllCachedPosts();
        statusMessage.textContent = `Successfully cleared ${removedCount} cached items.`;
        statusMessage.style.color = "green";
      } catch (error) {
        statusMessage.textContent = `Error clearing cache: ${error.message}`;
        statusMessage.style.color = "red";
        log(`Error clearing post cache: ${error}`);
      } finally {
        // Re-enable button
        clearCacheBtn.disabled = false;
        clearCacheBtn.textContent = "Clear Cache";
      }
    }, 300); // Short delay for visual feedback
  });

  // Add event listener for the auto-update checkbox
  const autoUpdateCheckbox = container.querySelector("#auto-update-check");
  autoUpdateCheckbox.addEventListener("change", (e) => {
    gmSetValue(AUTO_UPDATE_CHECK_KEY, e.target.checked);
    log(`Auto-update check set to: ${e.target.checked}`);
  });
}
