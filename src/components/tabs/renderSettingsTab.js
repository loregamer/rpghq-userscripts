/**
 * Renders the "Settings" tab content with global manager settings.
 *
 * @param {HTMLElement} container - The container element to render into
 */
import { log, debug } from "../../utils/logger.js";
import { gmGetValue, gmSetValue, gmDeleteValue } from "../../main.js";
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
          <p class="preference-description">Clear all cached posts, topic data, avatars, user colors, reactions, and other cached items. The cache will rebuild as you browse.</p>
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
        // First clear post cache using existing function
        const removedCount = clearAllCachedPosts();
        
        // Get all GM storage keys
        // eslint-disable-next-line no-undef
        const allKeys = GM_listValues ? GM_listValues() : [];
        
        // Define prefixes to clear
        const prefixesToClear = [
          'bq_avatar_',
          'bq_color_',
          'post_content_',
          'userColor_',
          'userAvatar_',
          'reactions_'
        ];
        
        let additionalRemoved = 0;
        
        // Process each key
        allKeys.forEach(key => {
          // Remove the GM_PREFIX to get the actual key name
          const actualKey = key.replace(/^RPGHQ_Manager_/, '');
          
          // Check if this key starts with any of the prefixes
          for (const prefix of prefixesToClear) {
            if (actualKey.startsWith(prefix)) {
              // Delete this key
              gmDeleteValue(actualKey);
              additionalRemoved++;
              debug(`Deleted GM value: ${actualKey}`);
              break; // No need to check other prefixes
            }
          }
        });
        
        statusMessage.textContent = `Successfully cleared ${removedCount} cached posts and ${additionalRemoved} additional cached items.`;
        statusMessage.style.color = "green";
        log(`Cache cleared: ${removedCount} posts and ${additionalRemoved} additional items`);
      } catch (error) {
        statusMessage.textContent = `Error clearing cache: ${error.message}`;
        statusMessage.style.color = "red";
        log(`Error clearing cache: ${error}`);
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
