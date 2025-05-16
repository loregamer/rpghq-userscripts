/**
 * Hide functionality core utilities
 * Provides functions to manage the Hide feature for RPGHQ Userscript Manager
 */

import { gmGetValue, gmSetValue } from "../../main.js";
import { log, debug, error } from "../logger.js";
import { getCachedPost } from "../postCache.js";
import { addHideStyles } from "./hide-styles.js";

// Storage keys
export const HIDE_CONFIG_KEY = "hideConfig";
export const IGNORED_USERS_KEY = "ignoredUsers";
export const REPLACED_AVATARS_KEY = "replacedAvatars";
export const HIDDEN_MANUAL_POSTS_KEY = "hiddenManualPosts";
export const USER_COLORS_KEY = "userColors";

// Default configuration values
export const DEFAULT_CONFIG = {
  authorHighlightColor: "rgba(255, 0, 0, 0.1)", // Default red for hidden-by-author
  contentHighlightColor: "rgba(255, 128, 0, 0.1)", // Default orange for hidden-by-content
  hideEntireRow: false, // Default: only hide lastpost, not entire row
  hideTopicCreations: true, // Default: hide rows with hidden username in row class,
  whitelistedThreads: [], // Array of thread names that should never be hidden
};

// Global state
let showHiddenPosts = false; // Always start hidden

/**
 * Initialize Hide functionality
 * This sets up the Hide feature when the page loads
 */
export function initHide() {
  log("Initializing Hide functionality");

  // Load the configuration
  const config = getHideConfig();

  // Add Hide styles to the page
  addHideStyles();

  // Apply custom CSS variables for colors
  applyHideColors(config);

  // Add global keyboard shortcut
  setupKeyboardShortcut();

  return {
    cleanup: cleanupHide,
  };
}

/**
 * Clean up Hide functionality when unloaded
 */
function cleanupHide() {
  log("Cleaning up Hide functionality");
  // Remove event listeners, etc.
}

/**
 * Get the current Hide configuration
 * @returns {Object} The current Hide configuration
 */
export function getHideConfig() {
  return gmGetValue(HIDE_CONFIG_KEY, DEFAULT_CONFIG);
}

/**
 * Set a Hide configuration value
 * @param {string} key - The configuration key to set
 * @param {any} value - The value to set
 */
export function setHideConfig(key, value) {
  const config = getHideConfig();
  config[key] = value;
  gmSetValue(HIDE_CONFIG_KEY, config);

  // If it's a color setting, update the CSS variables
  if (key === "authorHighlightColor" || key === "contentHighlightColor") {
    applyHideColors(config);
  }

  debug(`Updated Hide config: ${key} = ${value}`);
  return config;
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
 * Set up keyboard shortcuts for Hide functionality
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
      toggleHiddenPosts();
    }

    // Check for Alt key to show/hide manual hide buttons
    if (e.key === "Alt") {
      e.preventDefault();
      document.body.classList.toggle("alt-key-down");
    }
  });
}

/**
 * Toggle visibility of hidden posts
 */
function toggleHiddenPosts() {
  showHiddenPosts = !showHiddenPosts;

  const hiddenPosts = document.querySelectorAll(".hidden-post");
  const hiddenQuotes = document.querySelectorAll(".hidden-quote");
  const hiddenRows = document.querySelectorAll(".hidden-row");

  hiddenPosts.forEach((p) => p.classList.toggle("show", showHiddenPosts));
  hiddenQuotes.forEach((q) => q.classList.toggle("show", showHiddenPosts));
  hiddenRows.forEach((r) => r.classList.toggle("show", showHiddenPosts));

  document.body.classList.toggle("show-hidden-threads", showHiddenPosts);

  showToggleNotification();
}

/**
 * Show a notification when toggling hidden posts
 */
function showToggleNotification() {
  // Remove any existing notification
  const existingNotification = document.querySelector(
    ".hide-toggle-notification",
  );
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create a new notification
  const notification = document.createElement("div");
  notification.className = "hide-toggle-notification";
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
  notification.textContent = showHiddenPosts
    ? "Showing Hidden Content"
    : "Hiding Hidden Content";

  document.body.appendChild(notification);

  // Fade out and remove after a delay
  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => notification.remove(), 300);
  }, 1500);
}

/**
 * Check if a user is hidden
 * @param {string} userIdOrName - The user ID or username to check
 * @returns {boolean} True if the user is hidden
 */
export function isUserHidden(userIdOrName) {
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
    /never iggy|unhide user|replace avatar|hide user/gi,
    "",
  );

  // Remove any extra whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}

/**
 * Hide or unhide a user
 * @param {string} userId - The user ID
 * @param {string} username - The username
 * @returns {boolean} True if the user is now hidden, false if unhidden
 */
export function toggleUserHide(userId, username) {
  const cleanedUsername = cleanUsername(username);
  const ignoredUsers = gmGetValue(IGNORED_USERS_KEY, {});

  if (ignoredUsers.hasOwnProperty(userId)) {
    delete ignoredUsers[userId];
    gmSetValue(IGNORED_USERS_KEY, ignoredUsers);
    debug(`Unhidden user: ${userId} (${cleanedUsername})`);
    return false;
  } else {
    ignoredUsers[userId] = cleanedUsername;
    gmSetValue(IGNORED_USERS_KEY, ignoredUsers);
    debug(`Hidden user: ${userId} (${cleanedUsername})`);
    return true;
  }
}

/**
 * Check if post content contains references to hidden users
 * @param {string} content - The post content to check
 * @returns {boolean} True if the content contains hidden user references
 */
export function contentContainsHidden(content) {
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
 * Get all hidden users
 * @returns {Object} The hidden users object (userId => username)
 */
export function getHiddenUsers() {
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
 * Get all manually hidden posts
 * @returns {Object} The manually hidden posts object (postId => true)
 */
export function getHiddenManualPosts() {
  return gmGetValue(HIDDEN_MANUAL_POSTS_KEY, {});
}

/**
 * Manually hide a post
 * @param {string} postId - The post ID to hide
 */
export function hidePost(postId) {
  const hiddenManualPosts = gmGetValue(HIDDEN_MANUAL_POSTS_KEY, {});
  hiddenManualPosts[postId] = true;
  gmSetValue(HIDDEN_MANUAL_POSTS_KEY, hiddenManualPosts);
  debug(`Manually hidden post: ${postId}`);
}

/**
 * Unhide a manually hidden post
 * @param {string} postId - The post ID to unhide
 */
export function unhidePost(postId) {
  const hiddenManualPosts = gmGetValue(HIDDEN_MANUAL_POSTS_KEY, {});

  if (hiddenManualPosts.hasOwnProperty(postId)) {
    delete hiddenManualPosts[postId];
    gmSetValue(HIDDEN_MANUAL_POSTS_KEY, hiddenManualPosts);
    debug(`Unhidden manual post: ${postId}`);
    return true;
  }

  return false;
}
