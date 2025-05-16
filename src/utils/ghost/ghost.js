/**
 * Ghost functionality core utilities
 * Provides functions to manage the Ghost feature for RPGHQ Userscript Manager
 */

import { gmGetValue, gmSetValue } from "../../main.js";
import { log, debug, error } from "../logger.js";
import { getCachedPost } from "../postCache.js";
import { addGhostStyles } from "./ghost-styles.js";

// Storage keys
export const GHOST_CONFIG_KEY = "ghostConfig";
export const IGNORED_USERS_KEY = "ignoredUsers";
export const REPLACED_AVATARS_KEY = "replacedAvatars";
export const GHOSTED_MANUAL_POSTS_KEY = "ghostedManualPosts";
export const USER_COLORS_KEY = "userColors";

// Default configuration values
export const DEFAULT_CONFIG = {
  authorHighlightColor: "rgba(255, 0, 0, 0.1)", // Default red for ghosted-by-author
  contentHighlightColor: "rgba(255, 128, 0, 0.1)", // Default orange for ghosted-by-content
  hideEntireRow: false, // Default: only hide lastpost, not entire row
  hideTopicCreations: true, // Default: hide rows with ghosted username in row class,
  whitelistedThreads: [], // Array of thread names that should never be hidden
};

// Global state
let showGhostedPosts = false; // Always start hidden

/**
 * Initialize Ghost functionality
 * This sets up the Ghost feature when the page loads
 */
export function initGhost() {
  log("Initializing Ghost functionality");

  // Load the configuration
  const config = getGhostConfig();

  // Add Ghost styles to the page
  addGhostStyles();

  // Apply custom CSS variables for colors
  applyGhostColors(config);

  // Add global keyboard shortcut
  setupKeyboardShortcut();

  return {
    cleanup: cleanupGhost,
  };
}

/**
 * Clean up Ghost functionality when unloaded
 */
function cleanupGhost() {
  log("Cleaning up Ghost functionality");
  // Remove event listeners, etc.
}

/**
 * Get the current Ghost configuration
 * @returns {Object} The current Ghost configuration
 */
export function getGhostConfig() {
  return gmGetValue(GHOST_CONFIG_KEY, DEFAULT_CONFIG);
}

/**
 * Set a Ghost configuration value
 * @param {string} key - The configuration key to set
 * @param {any} value - The value to set
 */
export function setGhostConfig(key, value) {
  const config = getGhostConfig();
  config[key] = value;
  gmSetValue(GHOST_CONFIG_KEY, config);

  // If it's a color setting, update the CSS variables
  if (key === "authorHighlightColor" || key === "contentHighlightColor") {
    applyGhostColors(config);
  }

  debug(`Updated Ghost config: ${key} = ${value}`);
  return config;
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
 * Set up keyboard shortcuts for Ghost functionality
 */
function setupKeyboardShortcut() {
  document.addEventListener("keydown", (e) => {
    // Check if we're in a text input
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      return;
    }

    // Check for backslash key
    if (e.key === "\\") {
      e.preventDefault();
      toggleGhostedPosts();
    }

    // Check for Alt key to show/hide manual ghost buttons
    if (e.key === "Alt") {
      e.preventDefault();
      document.body.classList.toggle("alt-key-down");
    }
  });
}

/**
 * Toggle visibility of ghosted posts
 */
function toggleGhostedPosts() {
  showGhostedPosts = !showGhostedPosts;

  const ghostedPosts = document.querySelectorAll(".ghosted-post");
  const ghostedQuotes = document.querySelectorAll(".ghosted-quote");
  const ghostedRows = document.querySelectorAll(".ghosted-row");

  ghostedPosts.forEach((p) => p.classList.toggle("show", showGhostedPosts));
  ghostedQuotes.forEach((q) => q.classList.toggle("show", showGhostedPosts));
  ghostedRows.forEach((r) => r.classList.toggle("show", showGhostedPosts));

  document.body.classList.toggle("show-hidden-threads", showGhostedPosts);

  showToggleNotification();
}

/**
 * Show a notification when toggling ghosted posts
 */
function showToggleNotification() {
  // Remove any existing notification
  const existingNotification = document.querySelector(
    ".ghost-toggle-notification",
  );
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create a new notification
  const notification = document.createElement("div");
  notification.className = "ghost-toggle-notification";
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 9999;
    transition: opacity 0.3s;
  `;
  notification.textContent = showGhostedPosts
    ? "Showing Ghosted Content"
    : "Hiding Ghosted Content";

  document.body.appendChild(notification);

  // Fade out and remove after a delay
  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => notification.remove(), 300);
  }, 1500);
}

/**
 * Check if a user is ghosted
 * @param {string} userIdOrName - The user ID or username to check
 * @returns {boolean} True if the user is ghosted
 */
export function isUserGhosted(userIdOrName) {
  if (!userIdOrName) return false;

  const ignoredUsers = gmGetValue(IGNORED_USERS_KEY, {});

  // If it's a direct match for a user ID
  if (ignoredUsers.hasOwnProperty(userIdOrName)) return true;

  // Clean the username if it's not a user ID
  const cleanedUsername = cleanUsername(userIdOrName);

  // Check for exact matches (case-sensitive)
  if (Object.values(ignoredUsers).includes(cleanedUsername)) return true;

  // Check for case-insensitive matches
  const lower = cleanedUsername.toLowerCase();
  return Object.values(ignoredUsers).some(
    (name) => name.toLowerCase() === lower,
  );
}

/**
 * Clean a username by removing HTML tags, special text, and extra whitespace
 * @param {string} username - The username to clean
 * @returns {string} The cleaned username
 */
function cleanUsername(username) {
  if (!username) return "";

  // First remove any HTML tags that might be in the username
  let cleaned = username.replace(/<[^>]*>/g, "");

  // Remove "Never Iggy" and other button text that might be in the username
  cleaned = cleaned.replace(
    /never iggy|unghost user|replace avatar|ghost user/gi,
    "",
  );

  // Remove any extra whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}

/**
 * Ghost or unghost a user
 * @param {string} userId - The user ID
 * @param {string} username - The username
 * @returns {boolean} True if the user is now ghosted, false if unghosted
 */
export function toggleUserGhost(userId, username) {
  const cleanedUsername = cleanUsername(username);
  const ignoredUsers = gmGetValue(IGNORED_USERS_KEY, {});

  if (ignoredUsers.hasOwnProperty(userId)) {
    delete ignoredUsers[userId];
    gmSetValue(IGNORED_USERS_KEY, ignoredUsers);
    debug(`Unghosted user: ${userId} (${cleanedUsername})`);
    return false;
  } else {
    ignoredUsers[userId] = cleanedUsername;
    gmSetValue(IGNORED_USERS_KEY, ignoredUsers);
    debug(`Ghosted user: ${userId} (${cleanedUsername})`);
    return true;
  }
}

/**
 * Check if post content contains references to ghosted users
 * @param {string} content - The post content to check
 * @returns {boolean} True if the content contains ghosted user references
 */
export function contentContainsGhosted(content) {
  if (!content) return false;

  const ignoredUsers = gmGetValue(IGNORED_USERS_KEY, {});

  for (const userId in ignoredUsers) {
    const username = ignoredUsers[userId];
    if (content.toLowerCase().includes(username.toLowerCase())) {
      return true;
    }
  }

  return false;
}

/**
 * Validate and replace a user's avatar
 * @param {string} userId - The user ID
 * @param {string} url - The URL of the new avatar
 */
export function replaceUserAvatar(userId, url) {
  // Create a test image to verify the URL
  const testImg = new Image();

  return new Promise((resolve, reject) => {
    testImg.onload = function () {
      // Check image dimensions
      if (this.width <= 128 && this.height <= 128) {
        const replacedAvatars = gmGetValue(REPLACED_AVATARS_KEY, {});
        replacedAvatars[userId] = url;
        gmSetValue(REPLACED_AVATARS_KEY, replacedAvatars);
        debug(`Avatar replaced for user ${userId}: ${url}`);
        resolve(true);
      } else {
        reject(new Error("Image must be 128x128 or smaller"));
      }
    };

    testImg.onerror = function () {
      reject(new Error("Could not load image from the provided URL"));
    };

    testImg.src = url;
  });
}

/**
 * Reset a user's avatar to the default
 * @param {string} userId - The user ID
 */
export function resetUserAvatar(userId) {
  const replacedAvatars = gmGetValue(REPLACED_AVATARS_KEY, {});

  if (replacedAvatars.hasOwnProperty(userId)) {
    delete replacedAvatars[userId];
    gmSetValue(REPLACED_AVATARS_KEY, replacedAvatars);
    debug(`Reset avatar for user ${userId}`);
    return true;
  }

  return false;
}

/**
 * Get all ghosted users
 * @returns {Object} The ghosted users object (userId => username)
 */
export function getGhostedUsers() {
  return gmGetValue(IGNORED_USERS_KEY, {});
}

/**
 * Get all replaced avatars
 * @returns {Object} The replaced avatars object (userId => url)
 */
export function getReplacedAvatars() {
  return gmGetValue(REPLACED_AVATARS_KEY, {});
}

/**
 * Get all manually ghosted posts
 * @returns {Object} The manually ghosted posts object (postId => true)
 */
export function getGhostedManualPosts() {
  return gmGetValue(GHOSTED_MANUAL_POSTS_KEY, {});
}

/**
 * Manually ghost a post
 * @param {string} postId - The post ID to ghost
 */
export function ghostPost(postId) {
  const ghostedManualPosts = gmGetValue(GHOSTED_MANUAL_POSTS_KEY, {});
  ghostedManualPosts[postId] = true;
  gmSetValue(GHOSTED_MANUAL_POSTS_KEY, ghostedManualPosts);
  debug(`Manually ghosted post: ${postId}`);
}

/**
 * Unghost a manually ghosted post
 * @param {string} postId - The post ID to unghost
 */
export function unghostPost(postId) {
  const ghostedManualPosts = gmGetValue(GHOSTED_MANUAL_POSTS_KEY, {});

  if (ghostedManualPosts.hasOwnProperty(postId)) {
    delete ghostedManualPosts[postId];
    gmSetValue(GHOSTED_MANUAL_POSTS_KEY, ghostedManualPosts);
    debug(`Unghosted manual post: ${postId}`);
    return true;
  }

  return false;
}
