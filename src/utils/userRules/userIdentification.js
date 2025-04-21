/**
 * User Identification Utility
 *
 * Helps extract user IDs and usernames from DOM elements on the forum
 */

import { log, warn, error } from "../logger.js";

// Common selectors for user elements
const SELECTORS = {
  // Post-related selectors
  POST_AUTHOR: ".message-userDetails .message-username",
  POST_AUTHOR_LINK: ".message-userDetails .message-username a",
  POST_USERNAME_LINK: ".message-userDetails .username",

  // Profile-related selectors
  PROFILE_USERNAME: ".p-title-value",
  PROFILE_USER_BANNER: ".memberHeader-main",

  // List-related selectors (members list, etc)
  MEMBER_CARD: ".memberCard",
  MEMBER_CARD_USERNAME: ".memberCard--username",

  // Conversation-related selectors
  CONVERSATION_USERNAME: ".username",
  CONVERSATION_PARTICIPANT:
    ".username--staff, .username--moderator, .username--admin, .username",
};

/**
 * Extract user ID from a URL string
 * @param {String} url - URL containing user ID
 * @returns {String|null} - User ID or null if not found
 */
export function extractUserIdFromUrl(url) {
  if (!url) return null;

  try {
    const urlObj = new URL(url, window.location.origin);

    // Profile URLs: /members/username.12345/
    const memberMatch = urlObj.pathname.match(/\/members\/.*\.(\d+)\/?/);
    if (memberMatch && memberMatch[1]) {
      return memberMatch[1];
    }

    // Profile content URLs: /members/username.12345/content/
    const profileContentMatch = urlObj.pathname.match(
      /\/members\/.*\.(\d+)\/content\/?/,
    );
    if (profileContentMatch && profileContentMatch[1]) {
      return profileContentMatch[1];
    }

    // About URLs: /members/username.12345/about/
    const aboutMatch = urlObj.pathname.match(/\/members\/.*\.(\d+)\/about\/?/);
    if (aboutMatch && aboutMatch[1]) {
      return aboutMatch[1];
    }

    // Thread URLs with specific post by user: /threads/thread-name.12345/post-98765
    const postIdMatch = urlObj.pathname.match(/\/posts\/(\d+)\/?/);
    if (postIdMatch && postIdMatch[1]) {
      // Note: This is a post ID, not a user ID
      // To get user ID from this, we'd need to fetch the post content
      return null;
    }

    return null;
  } catch (err) {
    error("Error extracting user ID from URL:", err);
    return null;
  }
}

/**
 * Extract user ID from a post element
 * @param {Element} postElement - The post DOM element
 * @returns {Object|null} - Object with userId and username, or null if not found
 */
export function extractUserFromPost(postElement) {
  if (!postElement) return null;

  try {
    // Try to find the author link which contains the user ID in its href
    const authorLink =
      postElement.querySelector(SELECTORS.POST_AUTHOR_LINK) ||
      postElement.querySelector(SELECTORS.POST_USERNAME_LINK);

    if (authorLink) {
      const userId = extractUserIdFromUrl(authorLink.href);
      const username = authorLink.textContent.trim();

      if (userId && username) {
        return { userId, username };
      }
    }

    // If no author link with href, try to get just the username
    const authorElement = postElement.querySelector(SELECTORS.POST_AUTHOR);
    if (authorElement) {
      return {
        userId: null,
        username: authorElement.textContent.trim(),
      };
    }

    return null;
  } catch (err) {
    error("Error extracting user from post:", err);
    return null;
  }
}

/**
 * Extract user ID from profile page
 * @returns {Object|null} - Object with userId and username, or null if not found
 */
export function extractUserFromProfilePage() {
  try {
    // Check if we're on a profile page
    const profileUsername = document.querySelector(SELECTORS.PROFILE_USERNAME);
    if (!profileUsername) return null;

    // Get user ID from the URL
    const userId = extractUserIdFromUrl(window.location.href);
    const username = profileUsername.textContent.trim();

    if (userId && username) {
      return { userId, username };
    }

    return null;
  } catch (err) {
    error("Error extracting user from profile page:", err);
    return null;
  }
}

/**
 * Extract user from a member card element
 * @param {Element} cardElement - The member card DOM element
 * @returns {Object|null} - Object with userId and username, or null if not found
 */
export function extractUserFromMemberCard(cardElement) {
  if (!cardElement) return null;

  try {
    const usernameElement = cardElement.querySelector(
      SELECTORS.MEMBER_CARD_USERNAME,
    );
    if (!usernameElement) return null;

    const usernameLink = usernameElement.querySelector("a");
    if (!usernameLink) return null;

    const userId = extractUserIdFromUrl(usernameLink.href);
    const username = usernameLink.textContent.trim();

    if (userId && username) {
      return { userId, username };
    }

    return null;
  } catch (err) {
    error("Error extracting user from member card:", err);
    return null;
  }
}

/**
 * Get user from a DOM element based on context
 * Attempts to detect what type of element this is and extract user info accordingly
 * @param {Element} element - A DOM element that might contain user information
 * @returns {Object|null} - Object with userId and username, or null if not found
 */
export function getUserFromElement(element) {
  if (!element) return null;

  try {
    // Check if the element is a post or contains a post
    const postElement =
      element.closest(".message") || element.querySelector(".message");
    if (postElement) {
      return extractUserFromPost(postElement);
    }

    // Check if the element is a member card or contains one
    const cardElement =
      element.closest(SELECTORS.MEMBER_CARD) ||
      element.querySelector(SELECTORS.MEMBER_CARD);
    if (cardElement) {
      return extractUserFromMemberCard(cardElement);
    }

    // Check if element has a username directly
    const usernameElement = element.querySelector(
      SELECTORS.CONVERSATION_USERNAME,
    );
    if (usernameElement && usernameElement.tagName === "A") {
      const userId = extractUserIdFromUrl(usernameElement.href);
      const username = usernameElement.textContent.trim();

      if (userId && username) {
        return { userId, username };
      }
    }

    // Last resort - check if the element itself is a link with a username class
    if (
      element.tagName === "A" &&
      (element.classList.contains("username") ||
        element.classList.contains("username--staff") ||
        element.classList.contains("username--moderator") ||
        element.classList.contains("username--admin"))
    ) {
      const userId = extractUserIdFromUrl(element.href);
      const username = element.textContent.trim();

      if (userId && username) {
        return { userId, username };
      }
    }

    return null;
  } catch (err) {
    error("Error getting user from element:", err);
    return null;
  }
}

/**
 * Get user from the target of an event (like clicks)
 * @param {Event} event - The DOM event
 * @returns {Object|null} - Object with userId and username, or null if not found
 */
export function getUserFromEvent(event) {
  if (!event || !event.target) return null;

  try {
    // Try the target element first
    const userFromTarget = getUserFromElement(event.target);
    if (userFromTarget) return userFromTarget;

    // Try parent elements up to 3 levels
    let element = event.target.parentElement;
    for (let i = 0; i < 3 && element; i++) {
      const userFromParent = getUserFromElement(element);
      if (userFromParent) return userFromParent;
      element = element.parentElement;
    }

    return null;
  } catch (err) {
    error("Error getting user from event:", err);
    return null;
  }
}

/**
 * Get the current context user (from profile page or selected element)
 * @returns {Object|null} - Object with userId and username, or null if not found
 */
export function getCurrentContextUser() {
  // First check if we're on a profile page
  const profileUser = extractUserFromProfilePage();
  if (profileUser) return profileUser;

  // Otherwise check for selected content
  const selection = window.getSelection();
  if (selection && !selection.isCollapsed) {
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;

    // Try to get user from the selection container
    const element =
      container.nodeType === Node.TEXT_NODE
        ? container.parentElement
        : container;
    return getUserFromElement(element);
  }

  return null;
}
