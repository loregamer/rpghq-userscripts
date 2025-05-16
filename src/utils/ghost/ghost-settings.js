/**
 * Ghost settings management functions
 * Handles Ghost settings integration with RPGHQ Userscript Manager preferences
 */

import { gmGetValue, gmSetValue } from "../../main.js";
import { log, debug, error } from "../logger.js";
import {
  GHOST_CONFIG_KEY,
  DEFAULT_CONFIG,
  getGhostedUsers,
  getReplacedAvatars,
  getGhostedManualPosts,
  toggleUserGhost,
  replaceUserAvatar,
  resetUserAvatar,
} from "./ghost.js";

/**
 * Get the current Ghost configuration
 * @returns {Object} The current Ghost configuration
 */
export function getGhostSettings() {
  return gmGetValue(GHOST_CONFIG_KEY, DEFAULT_CONFIG);
}

/**
 * Update a Ghost setting
 * @param {string} key - The setting key to update
 * @param {any} value - The new value
 * @returns {Object} The updated Ghost configuration
 */
export function updateGhostSetting(key, value) {
  try {
    const config = getGhostSettings();

    // Update the setting
    config[key] = value;

    // Save the updated configuration
    gmSetValue(GHOST_CONFIG_KEY, config);

    // If we're updating a color setting, apply the CSS variable change
    if (key === "authorHighlightColor" || key === "contentHighlightColor") {
      applyGhostColors(config);
    }

    debug(`Updated Ghost setting: ${key} = ${JSON.stringify(value)}`);
    return config;
  } catch (err) {
    error(`Error updating Ghost setting ${key}:`, err);
    throw err;
  }
}

/**
 * Apply Ghost color settings as CSS variables
 * @param {Object} config - The Ghost configuration
 */
function applyGhostColors(config) {
  document.documentElement.style.setProperty(
    "--ghost-author-highlight",
    config.authorHighlightColor || DEFAULT_CONFIG.authorHighlightColor,
  );
  document.documentElement.style.setProperty(
    "--ghost-content-highlight",
    config.contentHighlightColor || DEFAULT_CONFIG.contentHighlightColor,
  );
}

/**
 * Reset Ghost settings to defaults
 */
export function resetGhostSettings() {
  try {
    // Set the configuration back to defaults
    gmSetValue(GHOST_CONFIG_KEY, DEFAULT_CONFIG);

    // Apply the default colors
    applyGhostColors(DEFAULT_CONFIG);

    debug("Reset Ghost settings to defaults");
    return DEFAULT_CONFIG;
  } catch (err) {
    error("Error resetting Ghost settings:", err);
    throw err;
  }
}

/**
 * Get Ghost status information
 * @returns {Object} Status information about Ghost
 */
export function getGhostStatus() {
  const ghostedUsers = getGhostedUsers();
  const replacedAvatars = getReplacedAvatars();
  const ghostedManualPosts = getGhostedManualPosts();

  return {
    ghostedUserCount: Object.keys(ghostedUsers).length,
    replacedAvatarCount: Object.keys(replacedAvatars).length,
    ghostedPostCount: Object.keys(ghostedManualPosts).length,
    active: true, // Ghost is always active when loaded
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

    const config = getGhostSettings();
    const whitelist = config.whitelistedThreads || [];

    // Check for duplicates
    if (whitelist.includes(trimmedName)) {
      throw new Error("Thread is already whitelisted");
    }

    // Add the thread
    whitelist.push(trimmedName);
    config.whitelistedThreads = whitelist;

    // Save the updated configuration
    gmSetValue(GHOST_CONFIG_KEY, config);

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
    const config = getGhostSettings();
    const whitelist = config.whitelistedThreads || [];

    if (index < 0 || index >= whitelist.length) {
      throw new Error("Invalid thread index");
    }

    // Remove the thread
    const removed = whitelist.splice(index, 1)[0];
    config.whitelistedThreads = whitelist;

    // Save the updated configuration
    gmSetValue(GHOST_CONFIG_KEY, config);

    debug(`Removed thread from whitelist: ${removed}`);
    return whitelist;
  } catch (err) {
    error("Error removing whitelisted thread:", err);
    throw err;
  }
}
