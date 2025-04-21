/**
 * Rule Application System
 *
 * Processes and applies stored user rules to DOM elements
 */

import { getAllUserRules, getUserRules } from "./storage.js";
import {
  getUserFromElement,
  extractUserFromPost,
  extractUserFromProfilePage,
  getCurrentContextUser,
} from "./userIdentification.js";
import { log, warn, error } from "../logger.js";

// Page type detection
const PAGE_TYPES = {
  TOPIC_VIEW: "TOPIC_VIEW",
  PROFILE_VIEW: "PROFILE_VIEW",
  RECENT_TOPICS: "RECENT_TOPICS_LIST",
  SEARCH_RESULTS: "SEARCH_RESULTS",
  MEMBER_LIST: "MEMBER_LIST",
  OTHER: "OTHER",
};

/**
 * Determine the current page type
 * @returns {String} - One of PAGE_TYPES constants
 */
function getPageType() {
  const url = window.location.href;

  if (url.includes("/threads/") || url.includes("/posts/")) {
    return PAGE_TYPES.TOPIC_VIEW;
  } else if (url.includes("/members/") && !url.includes("/list")) {
    return PAGE_TYPES.PROFILE_VIEW;
  } else if (url.includes("/whats-new/") || url.includes("/latest-activity")) {
    return PAGE_TYPES.RECENT_TOPICS;
  } else if (url.includes("/search/")) {
    return PAGE_TYPES.SEARCH_RESULTS;
  } else if (url.includes("/members/list")) {
    return PAGE_TYPES.MEMBER_LIST;
  }

  return PAGE_TYPES.OTHER;
}

/**
 * Check if a rule should be applied based on page scope
 * @param {Object} rule - The rule object
 * @param {String} pageType - Current page type from PAGE_TYPES
 * @returns {Boolean} - True if rule should be applied
 */
function shouldApplyRule(rule, pageType) {
  if (!rule || !rule.scope) return false;

  if (rule.scope === "ALL") {
    return true;
  }

  switch (rule.scope) {
    case "TOPIC_VIEW":
      return pageType === PAGE_TYPES.TOPIC_VIEW;
    case "PROFILE_VIEW":
      return pageType === PAGE_TYPES.PROFILE_VIEW;
    case "RECENT_TOPICS_LIST":
      return pageType === PAGE_TYPES.RECENT_TOPICS;
    case "SEARCH_RESULTS":
      return pageType === PAGE_TYPES.SEARCH_RESULTS;
    default:
      return false;
  }
}

/**
 * Apply a HIDE action rule
 * @param {Element} element - The DOM element to apply to
 * @param {Object} rule - The rule to apply
 * @returns {Boolean} - True if successful
 */
function applyHideRule(element, rule) {
  if (!element) return false;

  try {
    switch (rule.subject) {
      case "POST_BODY":
        const postBody =
          element.querySelector(".message-body") ||
          element.closest(".message-body");
        if (postBody) {
          postBody.style.display = "none";
          return true;
        }
        break;

      case "SIGNATURE":
        const signature =
          element.querySelector(".message-signature") ||
          element.closest(".message-signature");
        if (signature) {
          signature.style.display = "none";
          return true;
        }
        break;

      case "AVATAR":
        const avatar =
          element.querySelector(".message-avatar") ||
          element.closest(".message-avatar") ||
          element.querySelector(".avatar");
        if (avatar) {
          avatar.style.display = "none";
          return true;
        }
        break;

      case "USERNAME":
        // Don't actually hide username as it would break identification
        // Just make it very minimal (for safety)
        const username =
          element.querySelector(".message-username") ||
          element.closest(".message-username") ||
          element.querySelector(".username");
        if (username) {
          username.style.opacity = "0.5";
          username.style.fontSize = "0.8em";
          return true;
        }
        break;
    }

    return false;
  } catch (err) {
    error("Error applying HIDE rule:", err);
    return false;
  }
}

/**
 * Apply a HIGHLIGHT action rule
 * @param {Element} element - The DOM element to apply to
 * @param {Object} rule - The rule to apply
 * @returns {Boolean} - True if successful
 */
function applyHighlightRule(element, rule) {
  if (!element) return false;

  try {
    const color = rule.params?.color || "#FFFF99"; // Default yellow

    switch (rule.subject) {
      case "POST_BODY":
        const postBody =
          element.querySelector(".message-body") ||
          element.closest(".message-body");
        if (postBody) {
          postBody.style.backgroundColor = color;
          postBody.style.borderRadius = "3px";
          postBody.style.padding = "3px";
          return true;
        }
        break;

      case "SIGNATURE":
        const signature =
          element.querySelector(".message-signature") ||
          element.closest(".message-signature");
        if (signature) {
          signature.style.backgroundColor = color;
          signature.style.borderRadius = "3px";
          signature.style.padding = "3px";
          return true;
        }
        break;

      case "AVATAR":
        const avatar =
          element.querySelector(".message-avatar") ||
          element.closest(".message-avatar") ||
          element.querySelector(".avatar");
        if (avatar) {
          avatar.style.border = `2px solid ${color}`;
          avatar.style.borderRadius = "3px";
          return true;
        }
        break;

      case "USERNAME":
        const username =
          element.querySelector(".message-username") ||
          element.closest(".message-username") ||
          element.querySelector(".username");
        if (username) {
          // This is redundant with usernameColor, but keeping for completeness
          username.style.backgroundColor = color;
          username.style.borderRadius = "3px";
          username.style.padding = "0 3px";
          return true;
        }
        break;
    }

    return false;
  } catch (err) {
    error("Error applying HIGHLIGHT rule:", err);
    return false;
  }
}

/**
 * Apply a single rule to an element
 * @param {Element} element - The DOM element to apply the rule to
 * @param {Object} rule - The rule to apply
 * @returns {Boolean} - True if rule was applied successfully
 */
function applyRule(element, rule) {
  if (!element || !rule) return false;

  try {
    switch (rule.action) {
      case "HIDE":
        return applyHideRule(element, rule);
      case "HIGHLIGHT":
        return applyHighlightRule(element, rule);
      default:
        warn(`Unknown rule action: ${rule.action}`);
        return false;
    }
  } catch (err) {
    error("Error applying rule:", err);
    return false;
  }
}

/**
 * Apply username color to an element
 * @param {Element} element - The DOM element containing the username
 * @param {String} color - Hex color code
 * @returns {Boolean} - True if color was applied
 */
function applyUsernameColor(element, color) {
  if (!element || !color) return false;

  try {
    const username =
      element.querySelector(".message-username") ||
      element.querySelector(".username");

    if (username) {
      const usernameLink = username.querySelector("a") || username;
      usernameLink.style.color = color;
      usernameLink.dataset.originalColor = usernameLink.style.color || "";
      usernameLink.dataset.hqUserColor = color;
      return true;
    }

    return false;
  } catch (err) {
    error("Error applying username color:", err);
    return false;
  }
}

/**
 * Apply all rules for a user to a DOM element
 * @param {Element} element - The DOM element to apply rules to
 * @param {String} userId - User ID
 * @param {Object} rulesData - Rules data for the user
 * @returns {Number} - Number of rules applied
 */
function applyUserRules(element, userId, rulesData) {
  if (!element || !userId || !rulesData) return 0;

  try {
    const pageType = getPageType();
    let appliedCount = 0;

    // Apply username color if set
    if (rulesData.usernameColor) {
      if (applyUsernameColor(element, rulesData.usernameColor)) {
        appliedCount++;
      }
    }

    // Apply individual rules
    if (rulesData.rules && Array.isArray(rulesData.rules)) {
      rulesData.rules.forEach((rule) => {
        if (shouldApplyRule(rule, pageType)) {
          if (applyRule(element, rule)) {
            appliedCount++;
          }
        }
      });
    }

    return appliedCount;
  } catch (err) {
    error("Error applying user rules:", err);
    return 0;
  }
}

/**
 * Process an element for user rules application
 * @param {Element} element - DOM element to check and process
 * @returns {Object} - Statistics about processing
 */
export async function processElement(element) {
  if (!element) return { processed: false };

  try {
    const userData = getUserFromElement(element);
    if (!userData || !userData.userId)
      return { processed: false, reason: "no-user-id" };

    const userRules = await getUserRules(userData.userId);
    if (!userRules) return { processed: false, reason: "no-rules" };

    const appliedCount = applyUserRules(element, userData.userId, userRules);

    return {
      processed: appliedCount > 0,
      userId: userData.userId,
      username: userData.username,
      rulesApplied: appliedCount,
    };
  } catch (err) {
    error("Error processing element for user rules:", err);
    return { processed: false, error: err.message };
  }
}

/**
 * Process all posts/users in the current page
 * @returns {Promise<Object>} - Statistics about processing
 */
export async function processCurrentPage() {
  const pageType = getPageType();
  let stats = {
    pageType,
    elementsProcessed: 0,
    usersWithRules: 0,
    rulesApplied: 0,
  };

  try {
    const allUserRules = await getAllUserRules();
    if (!allUserRules || Object.keys(allUserRules).length === 0) {
      log("No user rules defined, skipping page processing");
      return stats;
    }

    // Get appropriate elements based on page type
    let elements = [];

    switch (pageType) {
      case PAGE_TYPES.TOPIC_VIEW:
        elements = Array.from(document.querySelectorAll(".message"));
        break;
      case PAGE_TYPES.PROFILE_VIEW:
        // Process profile banner once
        const profileUser = extractUserFromProfilePage();
        if (profileUser && profileUser.userId) {
          const userRules = allUserRules[profileUser.userId];
          if (userRules) {
            const banner = document.querySelector(".memberHeader-main");
            if (banner) {
              const applied = applyUserRules(
                banner,
                profileUser.userId,
                userRules,
              );
              if (applied > 0) {
                stats.usersWithRules++;
                stats.rulesApplied += applied;
              }
            }
          }
        }
        // Process user's posts if on their content page
        elements = Array.from(document.querySelectorAll(".message"));
        break;
      case PAGE_TYPES.RECENT_TOPICS:
      case PAGE_TYPES.SEARCH_RESULTS:
        elements = Array.from(document.querySelectorAll(".structItem"));
        break;
      case PAGE_TYPES.MEMBER_LIST:
        elements = Array.from(document.querySelectorAll(".memberCard"));
        break;
    }

    // Process found elements
    stats.elementsProcessed = elements.length;

    for (const element of elements) {
      const userData = getUserFromElement(element);
      if (userData && userData.userId) {
        const userRules = allUserRules[userData.userId];
        if (userRules) {
          const applied = applyUserRules(element, userData.userId, userRules);
          if (applied > 0) {
            stats.usersWithRules++;
            stats.rulesApplied += applied;
          }
        }
      }
    }

    log(
      `User rules applied: ${stats.rulesApplied} rules for ${stats.usersWithRules} users on ${stats.elementsProcessed} elements`,
    );
    return stats;
  } catch (err) {
    error("Error processing page for user rules:", err);
    return { ...stats, error: err.message };
  }
}

/**
 * Initialize rule application system and observe DOM for changes
 */
export async function initRuleApplication() {
  try {
    // Initial processing of the current page
    const stats = await processCurrentPage();
    log("Initial user rules application complete:", stats);

    // Set up a mutation observer to process new elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(async (mutation) => {
        // Only process added nodes
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if it's a relevant element to process
              const relevantElement =
                node.classList.contains("message") ||
                node.classList.contains("structItem") ||
                node.classList.contains("memberCard") ||
                node.querySelector(".message") ||
                node.querySelector(".structItem") ||
                node.querySelector(".memberCard");

              if (relevantElement) {
                await processElement(node);
              }
            }
          }
        }
      });
    });

    // Start observing the document body for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return { success: true, observer };
  } catch (err) {
    error("Error initializing rule application:", err);
    return { success: false, error: err.message };
  }
}
