/**
 * Hide settings management functions
 * Handles Hide settings integration with RPGHQ Userscript Manager preferences
 */

import { gmGetValue, gmSetValue } from "../../main.js";
import { log, debug, error } from "../logger.js";
import {
  HIDE_CONFIG_KEY,
  DEFAULT_CONFIG,
  getHiddenUsers,
  getReplacedAvatars,
  getHiddenManualPosts,
  toggleUserHide,
  replaceUserAvatar,
  resetUserAvatar,
} from "./hide.js";

/**
 * Get the current Hide configuration
 * @returns {Object} The current Hide configuration
 */
export function getHideSettings() {
  return gmGetValue(HIDE_CONFIG_KEY, DEFAULT_CONFIG);
}

/**
 * Update a Hide setting
 * @param {string} key - The setting key to update
 * @param {any} value - The new value
 * @returns {Object} The updated Hide configuration
 */
export function updateHideSetting(key, value) {
  try {
    const config = getHideSettings();

    // Update the setting
    config[key] = value;

    // Save the updated configuration
    gmSetValue(HIDE_CONFIG_KEY, config);

    // If we're updating a color setting, apply the CSS variable change
    if (key === "authorHighlightColor" || key === "contentHighlightColor") {
      applyHideColors(config);
    }

    debug(`Updated Hide setting: ${key} = ${JSON.stringify(value)}`);
    return config;
  } catch (err) {
    error(`Error updating Hide setting ${key}:`, err);
    throw err;
  }
}

/**
 * Apply Hide color settings as CSS variables
 * @param {Object} config - The Hide configuration
 */
function applyHideColors(config) {
  document.documentElement.style.setProperty(
    "--hide-author-highlight",
    config.authorHighlightColor || DEFAULT_CONFIG.authorHighlightColor,
  );
  document.documentElement.style.setProperty(
    "--hide-content-highlight",
    config.contentHighlightColor || DEFAULT_CONFIG.contentHighlightColor,
  );
}

/**
 * Reset Hide settings to defaults
 */
export function resetHideSettings() {
  try {
    // Set the configuration back to defaults
    gmSetValue(HIDE_CONFIG_KEY, DEFAULT_CONFIG);

    // Apply the default colors
    applyHideColors(DEFAULT_CONFIG);

    debug("Reset Hide settings to defaults");
    return DEFAULT_CONFIG;
  } catch (err) {
    error("Error resetting Hide settings:", err);
    throw err;
  }
}

/**
 * Get Hide status information
 * @returns {Object} Status information about Hide
 */
export function getHideStatus() {
  const hiddenUsers = getHiddenUsers();
  const replacedAvatars = getReplacedAvatars();
  const hiddenManualPosts = getHiddenManualPosts();

  return {
    hiddenUserCount: Object.keys(hiddenUsers).length,
    replacedAvatarCount: Object.keys(replacedAvatars).length,
    hiddenPostCount: Object.keys(hiddenManualPosts).length,
    active: true, // Hide is always active when loaded
  };
}

/**
 * Add a thread to the whitelist
 * @param {string} threadName - The thread name to add
 * @returns {Array} The updated whitelist
 */
export function addWhitelistedThread(threadName) {
  try {
    if (!threadName || typeof threadName !== "string") {
      throw new Error("Invalid thread name");
    }

    const trimmedName = threadName.trim();
    if (!trimmedName) {
      throw new Error("Thread name cannot be empty");
    }

    const config = getHideSettings();
    const whitelist = config.whitelistedThreads || [];

    // Check for duplicates
    if (whitelist.includes(trimmedName)) {
      throw new Error("Thread is already whitelisted");
    }

    // Add the thread
    whitelist.push(trimmedName);
    config.whitelistedThreads = whitelist;

    // Save the updated configuration
    gmSetValue(HIDE_CONFIG_KEY, config);

    debug(`Added thread to whitelist: ${trimmedName}`);
    return whitelist;
  } catch (err) {
    error("Error adding whitelisted thread:", err);
    throw err;
  }
}

/**
 * Remove a thread from the whitelist
 * @param {number} index - The index of the thread to remove
 * @returns {Array} The updated whitelist
 */
export function removeWhitelistedThread(index) {
  try {
    const config = getHideSettings();
    const whitelist = config.whitelistedThreads || [];

    if (index < 0 || index >= whitelist.length) {
      throw new Error("Invalid thread index");
    }

    // Remove the thread
    const removed = whitelist.splice(index, 1)[0];
    config.whitelistedThreads = whitelist;

    // Save the updated configuration
    gmSetValue(HIDE_CONFIG_KEY, config);

    debug(`Removed thread from whitelist: ${removed}`);
    return whitelist;
  } catch (err) {
    error("Error removing whitelisted thread:", err);
    throw err;
  }
}
