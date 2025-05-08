/**
 * Renders the "Settings" tab content with global manager settings.
 *
 * @param {HTMLElement} container - The container element to render into
 */
import { log, debug } from "../../utils/logger.js";
import { gmGetValue, gmSetValue, gmDeleteValue } from "../../main.js";
import {
  clearAllCachedPosts,
  getAllCachedPosts,
} from "../../utils/postCache.js";

// Key for the auto-update check setting
const AUTO_UPDATE_CHECK_KEY = "auto_update_check";

// Function to count cached items by type
function countCachedItems() {
  // Get all GM storage keys
  // eslint-disable-next-line no-undef
  const allKeys = GM_listValues ? GM_listValues() : [];

  // Define the prefixes we want to count
  const prefixCounts = {
    post_cache: 0,
    bq_avatar_: 0,
    bq_color_: 0,
    post_content_: 0,
    userColor_: 0,
    userAvatar_: 0,
    reactions_: 0,
  };

  // Count regular posts from post cache
  const cachedPosts = getAllCachedPosts();
  let postCount = 0;

  // Count regular posts
  Object.keys(cachedPosts).forEach((key) => {
    if (key !== "topics") {
      postCount++;
    }
  });

  // Count topics
  let topicCount = 0;
  if (cachedPosts.topics) {
    topicCount = Object.keys(cachedPosts.topics).length;
  }

  prefixCounts["post_cache"] = postCount + topicCount;

  // Process each key to count by prefix
  allKeys.forEach((key) => {
    // Check if this key includes any of our prefixes after the GM_PREFIX
    for (const prefix of Object.keys(prefixCounts)) {
      if (prefix !== "post_cache" && key.includes(prefix)) {
        prefixCounts[prefix]++;
        break; // No need to check other prefixes
      }
    }
  });

  return prefixCounts;
}

// Function to update the cache count display
function updateCacheCountsDisplay() {
  const countsContainer = document.getElementById("cache-counts-container");
  if (!countsContainer) return;

  const counts = countCachedItems();

  // Clear previous content
  countsContainer.innerHTML = "";

  // Create list with counts
  const list = document.createElement("ul");
  // list.style.listStyleType = "none"; // Removed to show bullets
  // list.style.padding = "0"; // Removed to allow default bullet padding
  list.style.margin = "0"; // Keep margin 0 or adjust as needed
  list.style.fontSize = "0.9em";
  list.style.paddingLeft = "20px"; // Add some padding for bullets

  // Add items to list with friendly labels
  const items = [
    { key: "post_content_", label: "Post content cache" },
    { key: "bq_avatar_", label: "User avatars (Better Quotes)" },
    { key: "bq_color_", label: "User colors (Better Quotes)" },
    { key: "userColor_", label: "User colors" },
    { key: "userAvatar_", label: "User avatars" },
    { key: "reactions_", label: "Reaction data" },
  ];

  items.forEach((item) => {
    // Only show items with counts > 0
    if (counts[item.key] > 0) {
      const li = document.createElement("li");
      li.style.marginBottom = "4px";
      // li.style.display = "flex"; // Removed for standard list item flow
      // li.style.justifyContent = "space-between"; // Removed

      const label = document.createElement("span");
      label.textContent = item.label + ": "; // Added space for better readability
      // label.style.marginRight = "8px"; // No longer needed with flex removed

      const count = document.createElement("span");
      count.textContent = counts[item.key];
      count.style.fontWeight = "bold";

      // Append text directly or use textContent for the li
      li.appendChild(label); // Label first
      li.appendChild(count); // Then count
      list.appendChild(li);
    }
  });

  // If the list is empty, show a message
  if (list.children.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.textContent = "No cached items found";
    emptyMessage.style.fontStyle = "italic";
    emptyMessage.style.color = "#666";
    list.appendChild(emptyMessage);
  }

  countsContainer.appendChild(list);
}

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
          <div class="preference-header" style="display: flex; justify-content: space-between; align-items: center;">
            <h4 class="preference-name" style="margin-right: auto;">Cache Management</h4>
            <div class="preference-control">
              <button id="clear-post-cache-btn" class="button1" style="padding: 6px 12px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer;">Clear Cache</button>
            </div>
          </div>
          <p class="preference-description">Clear all cached posts, topic data, avatars, user colors, reactions, and other cached items. The cache will rebuild as you browse.</p>
          <div id="cache-counts-container" class="cache-counts" style="margin-top: 12px; background: rgba(0,0,0,0.03); padding: 10px; border-radius: 5px;"></div>
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

  // Initialize the cache counts display
  setTimeout(() => {
    updateCacheCountsDisplay();
  }, 100);

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
          "bq_avatar_",
          "bq_color_",
          "post_content_",
          "userColor_",
          "userAvatar_",
          "reactions_",
        ];

        let additionalRemoved = 0;

        // Process each key
        for (const key of allKeys) {
          // Check if this key includes any of the prefixes
          for (const prefix of prefixesToClear) {
            if (key.includes(prefix)) {
              // Delete this key directly (with the GM_PREFIX)
              // eslint-disable-next-line no-undef
              GM_deleteValue(key);
              additionalRemoved++;
              debug(`Deleted GM value: ${key}`);
              break; // No need to check other prefixes
            }
          }
        }

        statusMessage.textContent = `Successfully cleared ${removedCount} cached posts and ${additionalRemoved} additional cached items.`;
        statusMessage.style.color = "green";
        log(
          `Cache cleared: ${removedCount} posts and ${additionalRemoved} additional items`,
        );

        // Update the cache counts display
        updateCacheCountsDisplay();
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
