/**
 * Thread Author Highlight
 *
 * Applies highlight or hide effects to thread rows based on user preferences
 */

import { log, debug, error } from "../utils/logger.js";
import { getAllUserRules } from "../utils/userRules/storage.js";
import { gmGetValue } from "../main.js";

// Constants for thread-related settings
const THREAD_LIST_AUTHOR_HIGHLIGHT_KEY = "thread_list_author_highlight";
const THREAD_LIST_AUTHOR_HIGHLIGHT_COLOR_KEY =
  "thread_list_author_highlight_color";
const THREAD_LIST_ALTERNATING_ROWS_KEY = "thread_list_alternating_rows";
const THREAD_LIST_ALTERNATING_COLOR_KEY = "thread_list_alternating_color";

/**
 * Extract author username from a thread row element
 * @param {Element} rowElement - The thread row DOM element
 * @returns {String|null} - Username or null if not found
 */
function extractAuthorFromThreadRow(rowElement) {
  if (!rowElement || !rowElement.className) return null;

  // Get author from className (e.g., author-name-rusty_shackleford)
  const authorClassMatch = rowElement.className.match(
    /author-name-([a-zA-Z0-9_-]+)/,
  );
  if (authorClassMatch && authorClassMatch[1]) {
    return authorClassMatch[1];
  }

  // If not in class, try to find author in lastpost
  const lastpost = rowElement.querySelector(".lastpost");
  if (lastpost) {
    const usernameElement = lastpost.querySelector(".mas-username .username");
    if (usernameElement) {
      // Extract username from URL or text
      const href = usernameElement.getAttribute("href");
      if (href) {
        const usernameMatch = href.match(/u=(\d+)-([a-zA-Z0-9_-]+)/);
        if (usernameMatch && usernameMatch[2]) {
          return usernameMatch[2];
        }
      }
      return usernameElement.textContent.trim();
    }
  }

  return null;
}

/**
 * Find user ID by username in user rules
 * @param {Object} allUserRules - All user rules
 * @param {String} username - Username to find
 * @returns {String|null} - User ID or null if not found
 */
function findUserIdByUsername(allUserRules, username) {
  if (!allUserRules || !username) return null;

  for (const [userId, userData] of Object.entries(allUserRules)) {
    if (
      userData.username &&
      userData.username.toLowerCase() === username.toLowerCase()
    ) {
      return userId;
    }
  }

  return null;
}

/**
 * Apply style to thread row based on user rule
 * @param {Element} rowElement - Thread row element
 * @param {Object} userRule - User rule to apply
 * @returns {Boolean} - True if rule was applied
 */
function applyThreadRowStyle(rowElement, userRule) {
  if (!rowElement || !userRule) return false;

  try {
    // Apply based on threads setting
    if (userRule.threads === "HIGHLIGHT") {
      // Get global author highlight color or use default
      const highlightEnabled = gmGetValue(
        THREAD_LIST_AUTHOR_HIGHLIGHT_KEY,
        false,
      );
      let highlightColor = userRule.usernameColor || "#ffe4b5"; // Use user's color or default

      if (highlightEnabled) {
        // If global highlight is enabled, use that color instead
        highlightColor = gmGetValue(
          THREAD_LIST_AUTHOR_HIGHLIGHT_COLOR_KEY,
          "#ffe4b5",
        );
      }

      // Apply highlight
      rowElement.style.backgroundColor = highlightColor;

      // Add a subtle indication
      const topicTitle = rowElement.querySelector(".topictitle");
      if (topicTitle && !topicTitle.dataset.highlighted) {
        topicTitle.dataset.highlighted = "true";

        if (userRule.usernameColor) {
          // Apply username color as border
          rowElement.style.borderLeft = `3px solid ${userRule.usernameColor}`;
        }
      }

      return true;
    } else if (userRule.threads === "HIDE") {
      // Hide the thread row
      rowElement.style.display = "none";
      return true;
    }

    return false;
  } catch (err) {
    error("Error applying thread row style:", err);
    return false;
  }
}

/**
 * Apply alternating row colors to thread list
 */
function applyAlternatingRowColors() {
  const alternatingEnabled = gmGetValue(
    THREAD_LIST_ALTERNATING_ROWS_KEY,
    false,
  );
  if (!alternatingEnabled) return;

  const alternatingColor = gmGetValue(
    THREAD_LIST_ALTERNATING_COLOR_KEY,
    "#242a36",
  );
  const rowElements = document.querySelectorAll(".row");

  rowElements.forEach((row, index) => {
    // Skip rows that already have user highlights
    if (row.style.backgroundColor && row.style.backgroundColor !== "") return;

    // Apply alternating colors (even rows)
    if (index % 2 === 0) {
      row.style.backgroundColor = alternatingColor;
    }
  });
}

/**
 * Process thread lists on the page
 */
export async function processThreadLists() {
  try {
    // Get all user rules
    const allUserRules = await getAllUserRules();
    if (!allUserRules || Object.keys(allUserRules).length === 0) {
      // No user rules, only apply alternating colors if enabled
      applyAlternatingRowColors();
      return;
    }

    // Get all thread rows
    const threadRows = document.querySelectorAll(".row");
    let rulesApplied = 0;

    for (const row of threadRows) {
      const authorUsername = extractAuthorFromThreadRow(row);
      if (!authorUsername) continue;

      // Find the user ID by username
      const userId = findUserIdByUsername(allUserRules, authorUsername);
      if (!userId) continue;

      // Apply thread row style based on user rules
      const userRule = allUserRules[userId];
      if (userRule && applyThreadRowStyle(row, userRule)) {
        rulesApplied++;
      }
    }

    // Apply alternating colors to remaining rows
    applyAlternatingRowColors();

    if (rulesApplied > 0) {
      log(
        `Applied thread styling to ${rulesApplied} rows based on user preferences`,
      );
    }
  } catch (err) {
    error("Error processing thread lists:", err);
  }
}

/**
 * Initialize MutationObserver to watch for new thread rows
 */
function setupThreadRowObserver() {
  // Set up a mutation observer to process new rows
  const observer = new MutationObserver((mutations) => {
    let needsProcessing = false;

    mutations.forEach((mutation) => {
      // Only process added nodes
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if it's a thread row
            if (node.classList && node.classList.contains("row")) {
              needsProcessing = true;
              break;
            }
          }
        }
      }
    });

    // If new rows were added, process the thread list again
    if (needsProcessing) {
      processThreadLists();
    }
  });

  // Make sure we have a valid target to observe - document.body is always safe
  // Wait for document.body to be available
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    log("Thread observer attached to document.body");
  } else {
    // If body isn't available yet (shouldn't happen), set up a small delay
    log("Document body not available yet, setting up delayed observer");
    setTimeout(() => {
      if (document.body) {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
        log("Thread observer attached to document.body (delayed)");
      } else {
        error("Failed to find document.body for thread observer");
      }
    }, 100);
  }

  return observer;
}

/**
 * Initialize the script
 */
export function init() {
  log("Initializing Thread Author Highlight script");

  // Process thread lists on page load
  processThreadLists();

  // Set up observer for dynamic content
  const observer = setupThreadRowObserver();

  // Return cleanup function
  return function cleanup() {
    observer.disconnect();
    log("Thread Author Highlight script cleaned up");
  };
}
