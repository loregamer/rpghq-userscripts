/**
 * User Identification Utility
 * 
 * Functions to help identify users from DOM elements and extract user IDs
 */

import { log, warn, error } from "../logger.js";

/**
 * Regular expression to extract user ID from profile links
 * Matches patterns like:
 * - /memberlist.php?mode=viewprofile&u=123
 * - /profile.php?id=123
 */
const USER_ID_REGEX = /(?:viewprofile&u=|profile\.php\?id=)(\d+)/i;

/**
 * Extract user ID from a forum profile link
 * @param {String} url - Profile URL to extract ID from
 * @returns {String|null} User ID as string, or null if not found
 */
export function extractUserIdFromUrl(url) {
  if (!url) return null;
  
  const match = url.match(USER_ID_REGEX);
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}

/**
 * Get user ID from an avatar or username element
 * @param {HTMLElement} element - Avatar/username DOM element
 * @returns {Object|null} Object with userId and username, or null
 */
export function getUserInfoFromElement(element) {
  if (!element) return null;
  
  // Try to find the profile link
  let profileLink = null;
  let username = null;
  
  // If element is a username element (link or span)
  if (element.classList.contains('username') || 
      element.classList.contains('username-coloured')) {
    profileLink = element.href;
    username = element.textContent.trim();
  }
  // If element is an avatar
  else if (element.classList.contains('avatar')) {
    // Find the link inside the avatar
    const link = element.querySelector('a');
    if (link) {
      profileLink = link.href;
      // Try to get username from title or alt
      const img = link.querySelector('img');
      if (img && img.alt) {
        username = img.alt.replace("'s avatar", "").trim();
      }
    }
  }
  // If element is a post author container
  else if (element.classList.contains('author')) {
    // Find the username link
    const usernameEl = element.querySelector('.username, .username-coloured');
    if (usernameEl) {
      profileLink = usernameEl.href;
      username = usernameEl.textContent.trim();
    }
  }
  
  // If profileLink is found, extract the user ID
  if (profileLink) {
    const userId = extractUserIdFromUrl(profileLink);
    if (userId) {
      return { userId, username };
    }
  }
  
  return null;
}

/**
 * Find all user elements on the current page and return their info
 * @returns {Array} Array of user info objects with userId and username
 */
export function findUsersOnPage() {
  const users = new Map();
  
  // Find all username links
  const usernameElements = document.querySelectorAll('.username, .username-coloured');
  usernameElements.forEach(element => {
    const userInfo = getUserInfoFromElement(element);
    if (userInfo && userInfo.userId) {
      users.set(userInfo.userId, userInfo);
    }
  });
  
  // Convert Map to array
  return Array.from(users.values());
}

/**
 * Find user information by username
 * @param {String} username - The username to search for
 * @returns {Promise<Object|null>} User info object with userId and username, or null
 */
export async function findUserByUsername(username) {
  if (!username) return null;
  
  try {
    // This will likely need to be expanded with an API call
    // to search for users by username if they're not on the current page
    
    // For now, search in the current page
    const usersOnPage = findUsersOnPage();
    const user = usersOnPage.find(u => 
      u.username.toLowerCase() === username.toLowerCase()
    );
    
    if (user) return user;
    
    // TODO: Implement an API call to search for users if not found on page
    
    return null;
  } catch (err) {
    error(`Error finding user by username "${username}":`, err);
    return null;
  }
}