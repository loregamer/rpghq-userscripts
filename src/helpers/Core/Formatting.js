/**
 * @module helpers/Core/Formatting
 * @description Utility functions for formatting data, like usernames or dates.
 */

import { escapeHTML } from "./Utils.js"; // Assuming escapeHTML exists

/**
 * Formats an array of username elements (or strings) into a comma-separated string with "and".
 * Preserves the original HTML structure of the username elements if provided.
 * @param {Array<HTMLElement|string>} usernames - An array of username elements or plain strings.
 * @returns {string} A formatted string (e.g., "UserA, UserB and UserC").
 */
export function formatUsernames(usernames) {
  if (!usernames || usernames.length === 0) return "Someone";

  const nameStrings = usernames.map((u) => {
    if (typeof u === "string") {
      return escapeHTML(u);
    } else if (u instanceof HTMLElement) {
      // Clone the element to avoid modifying the original DOM
      const clone = u.cloneNode(true);
      // Optionally remove styles if they interfere
      // clone.style.cssText = '';
      return clone.outerHTML;
    } else {
      return "unknown";
    }
  });

  if (nameStrings.length === 1) {
    return nameStrings[0];
  }
  if (nameStrings.length === 2) {
    return `${nameStrings[0]} and ${nameStrings[1]}`;
  }
  // For 3 or more
  const last = nameStrings.pop();
  return `${nameStrings.join(", ")} and ${last}`;
}

/**
 * Formats a timestamp or Date object into a relative time string (e.g., "5 minutes ago").
 * Basic implementation, consider using a library for more complex needs.
 * @param {number|Date} timestamp - The timestamp (in milliseconds) or Date object.
 * @returns {string} A relative time string.
 */
export function formatRelativeTime(timestamp) {
  const now = Date.now();
  const date = timestamp instanceof Date ? timestamp.getTime() : timestamp;
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 1) return `${days} days ago`;
  if (days === 1) return `yesterday`;
  if (hours > 1) return `${hours} hours ago`;
  if (hours === 1) return `an hour ago`;
  if (minutes > 1) return `${minutes} minutes ago`;
  if (minutes === 1) return `a minute ago`;
  if (seconds > 10) return `${seconds} seconds ago`;
  return `just now`;
}

// Add other general formatting functions as needed
