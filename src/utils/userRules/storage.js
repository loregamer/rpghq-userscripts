/**
 * User Rules Storage Utility
 * 
 * Handles the storage and retrieval of user-specific rules using GM storage
 */

import { gmGetValue, gmSetValue } from "../../main.js";
import { log, warn, error } from "../logger.js";

// Storage key for user rules
const USER_RULES_STORAGE_KEY = "hqUserRules";

/**
 * Get all user rules from storage
 * @returns {Object} Object containing user rules, keyed by user ID
 */
export async function getUserRules() {
  try {
    const rules = gmGetValue(USER_RULES_STORAGE_KEY, {});
    return rules;
  } catch (err) {
    error("Error retrieving user rules:", err);
    return {};
  }
}

/**
 * Save the entire user rules object to storage
 * @param {Object} rulesObject - The complete user rules object
 * @returns {Boolean} Success indicator
 */
export async function saveUserRules(rulesObject) {
  try {
    gmSetValue(USER_RULES_STORAGE_KEY, rulesObject);
    log("User rules saved successfully");
    return true;
  } catch (err) {
    error("Error saving user rules:", err);
    return false;
  }
}

/**
 * Get rules for a specific user
 * @param {String} userId - The user ID to retrieve rules for
 * @returns {Object|null} User rules object or null if not found
 */
export async function getUserRulesByUserId(userId) {
  const allRules = await getUserRules();
  return allRules[userId] || null;
}

/**
 * Save rules for a specific user
 * @param {String} userId - The user ID to save rules for
 * @param {Object} userData - The user data object containing rules
 * @returns {Boolean} Success indicator
 */
export async function saveUserRulesByUserId(userId, userData) {
  try {
    const allRules = await getUserRules();
    allRules[userId] = userData;
    return await saveUserRules(allRules);
  } catch (err) {
    error(`Error saving rules for user ${userId}:`, err);
    return false;
  }
}

/**
 * Delete rules for a specific user
 * @param {String} userId - The user ID to delete rules for
 * @returns {Boolean} Success indicator
 */
export async function deleteUserRules(userId) {
  try {
    const allRules = await getUserRules();
    if (allRules[userId]) {
      delete allRules[userId];
      return await saveUserRules(allRules);
    }
    return true; // No rules to delete
  } catch (err) {
    error(`Error deleting rules for user ${userId}:`, err);
    return false;
  }
}

/**
 * Updates or creates a rule for a specific user
 * @param {String} userId - The user ID
 * @param {String} username - The user's username
 * @param {Object} rule - The rule object to save
 * @returns {Boolean} Success indicator
 */
export async function saveRule(userId, username, rule) {
  try {
    const userData = await getUserRulesByUserId(userId) || {
      username,
      usernameColor: null,
      rules: []
    };

    // If rule has an ID, update existing rule
    if (rule.id) {
      const index = userData.rules.findIndex(r => r.id === rule.id);
      if (index >= 0) {
        userData.rules[index] = rule;
      } else {
        userData.rules.push(rule);
      }
    } else {
      // Create new rule with ID
      rule.id = `rule_${Date.now()}`;
      userData.rules.push(rule);
    }

    return await saveUserRulesByUserId(userId, userData);
  } catch (err) {
    error(`Error saving rule for user ${userId}:`, err);
    return false;
  }
}

/**
 * Deletes a rule for a specific user
 * @param {String} userId - The user ID
 * @param {String} ruleId - The rule ID to delete
 * @returns {Boolean} Success indicator
 */
export async function deleteRule(userId, ruleId) {
  try {
    const userData = await getUserRulesByUserId(userId);
    if (!userData) return false;

    const index = userData.rules.findIndex(rule => rule.id === ruleId);
    if (index >= 0) {
      userData.rules.splice(index, 1);
      return await saveUserRulesByUserId(userId, userData);
    }
    
    return false; // Rule not found
  } catch (err) {
    error(`Error deleting rule ${ruleId} for user ${userId}:`, err);
    return false;
  }
}

/**
 * Updates the username color for a specific user
 * @param {String} userId - The user ID
 * @param {String} username - The user's username
 * @param {String|null} color - The color to set (hex code or null)
 * @returns {Boolean} Success indicator
 */
export async function updateUsernameColor(userId, username, color) {
  try {
    const userData = await getUserRulesByUserId(userId) || {
      username,
      usernameColor: null,
      rules: []
    };
    
    userData.usernameColor = color;
    return await saveUserRulesByUserId(userId, userData);
  } catch (err) {
    error(`Error updating username color for user ${userId}:`, err);
    return false;
  }
}