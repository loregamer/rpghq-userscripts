/**
 * @module helpers/Notifications/Storage
 * @description Storage handling (GM_getValue/setValue) for notification data like reactions and post content, with caching and cleanup.
 */

import { ONE_DAY } from "./Constants.js";
import { Logger } from "../../../shared/helpers/Logger.js";

const log = new Logger("Notifications Storage");

const REACTION_PREFIX = "reactions_";
const CONTENT_PREFIX = "post_content_";
const CLEANUP_KEY = "last_notification_storage_cleanup";

/**
 * Retrieves cached reactions for a post ID if not expired.
 * @param {string} postId - The post ID.
 * @returns {Array|null} Cached reactions or null if not found/expired.
 */
export function getStoredReactions(postId) {
  const storedData = GM_getValue(`${REACTION_PREFIX}${postId}`);
  if (storedData) {
    try {
      const { reactions, timestamp } = JSON.parse(storedData);
      if (Date.now() - timestamp < ONE_DAY) {
        log.debug(`Cache hit for reactions: ${postId}`);
        return reactions;
      }
      log.debug(`Cache expired for reactions: ${postId}`);
      GM_deleteValue(`${REACTION_PREFIX}${postId}`);
    } catch (e) {
      log.error(`Error parsing stored reactions for ${postId}:`, e);
      GM_deleteValue(`${REACTION_PREFIX}${postId}`);
    }
  }
  log.debug(`Cache miss for reactions: ${postId}`);
  return null;
}

/**
 * Stores reactions for a post ID with a timestamp.
 * @param {string} postId - The post ID.
 * @param {Array} reactions - The reactions array to store.
 */
export function storeReactions(postId, reactions) {
  if (!postId || !Array.isArray(reactions)) {
    log.warn("Attempted to store invalid reactions data", {
      postId,
      reactions,
    });
    return;
  }
  try {
    GM_setValue(
      `${REACTION_PREFIX}${postId}`,
      JSON.stringify({ reactions, timestamp: Date.now() })
    );
    log.debug(`Stored reactions for post: ${postId}`);
  } catch (e) {
    log.error(`Error storing reactions for ${postId}:`, e);
  }
}

/**
 * Retrieves cached post content for a post ID if not expired.
 * @param {string} postId - The post ID.
 * @returns {string|null} Cached content or null if not found/expired.
 */
export function getStoredPostContent(postId) {
  const storedData = GM_getValue(`${CONTENT_PREFIX}${postId}`);
  if (storedData) {
    try {
      const { content, timestamp } = JSON.parse(storedData);
      if (Date.now() - timestamp < ONE_DAY) {
        log.debug(`Cache hit for content: ${postId}`);
        return content;
      }
      log.debug(`Cache expired for content: ${postId}`);
      GM_deleteValue(`${CONTENT_PREFIX}${postId}`);
    } catch (e) {
      log.error(`Error parsing stored content for ${postId}:`, e);
      GM_deleteValue(`${CONTENT_PREFIX}${postId}`);
    }
  }
  log.debug(`Cache miss for content: ${postId}`);
  return null;
}

/**
 * Stores post content for a post ID with a timestamp.
 * @param {string} postId - The post ID.
 * @param {string} content - The post content to store.
 */
export function storePostContent(postId, content) {
  if (!postId || typeof content !== "string") {
    log.warn("Attempted to store invalid post content data", {
      postId,
      content,
    });
    return;
  }
  try {
    GM_setValue(
      `${CONTENT_PREFIX}${postId}`,
      JSON.stringify({ content, timestamp: Date.now() })
    );
    log.debug(`Stored content for post: ${postId}`);
  } catch (e) {
    log.error(`Error storing content for ${postId}:`, e);
  }
}

/**
 * Cleans up expired notification-related data from GM storage.
 */
export function cleanupStorage() {
  const lastCleanup = GM_getValue(CLEANUP_KEY, 0);
  const now = Date.now();

  // Only cleanup if it's been more than 24 hours since last cleanup
  if (now - lastCleanup < ONE_DAY) {
    return;
  }

  log.info("Running notification storage cleanup...");
  let deletedCount = 0;

  try {
    const allKeys = GM_listValues ? GM_listValues() : [];

    allKeys.forEach((key) => {
      if (
        key === CLEANUP_KEY ||
        (!key.startsWith(REACTION_PREFIX) && !key.startsWith(CONTENT_PREFIX))
      ) {
        return; // Skip irrelevant keys
      }

      const data = GM_getValue(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          // Check if data has a timestamp and if it's older than ONE_DAY
          if (parsed.timestamp && now - parsed.timestamp >= ONE_DAY) {
            GM_deleteValue(key);
            deletedCount++;
            log.debug(`Deleted expired storage key: ${key}`);
          }
        } catch (e) {
          // If we can't parse, it might be old format or corrupted, delete it
          log.warn(`Deleting potentially corrupt key: ${key}`);
          GM_deleteValue(key);
          deletedCount++;
        }
      }
    });

    // Update last cleanup timestamp
    GM_setValue(CLEANUP_KEY, now);
    log.info(
      `Storage cleanup complete. Deleted ${deletedCount} expired items.`
    );
  } catch (error) {
    log.error("Error during storage cleanup:", error);
  }
}
