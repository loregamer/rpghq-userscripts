/**
 * Post Caching Utility
 * Provides functions to cache and retrieve post content from forum topics
 */

import { gmGetValue, gmSetValue } from "../main.js";
import { log, debug } from "./logger.js";

// Storage key for cached posts
const CACHE_KEY = "cached_posts";

/**
 * Get all cached posts
 * @returns {Object} Object containing all cached posts
 */
export function getAllCachedPosts() {
  return gmGetValue(CACHE_KEY, {});
}

/**
 * Get a specific cached post by ID
 * @param {string} postId - The post ID to retrieve
 * @returns {Object|null} The cached post data or null if not found
 */
export function getCachedPost(postId) {
  const cachedPosts = getAllCachedPosts();
  return cachedPosts[postId] || null;
}

/**
 * Get cached topic info by topic ID
 * @param {string} topicId - The topic ID to retrieve info for
 * @returns {Object|null} The cached topic data or null if not found
 */
export function getCachedTopicInfo(topicId) {
  const cachedPosts = getAllCachedPosts();
  return (cachedPosts.topics && cachedPosts.topics[topicId]) || null;
}

/**
 * Save post content to cache
 * @param {string} postId - The post ID
 * @param {Object} postData - The post data to cache
 */
export function cachePost(postId, postData) {
  const cachedPosts = getAllCachedPosts();
  cachedPosts[postId] = {
    ...postData,
    time: Date.now(),
  };
  gmSetValue(CACHE_KEY, cachedPosts);
  debug(`Cached post: ${postId}`);
}

/**
 * Cache topic info
 * @param {string} topicId - The topic ID
 * @param {Object} topicData - The topic data to cache
 */
export function cacheTopic(topicId, topicData) {
  const cachedPosts = getAllCachedPosts();

  if (!cachedPosts.topics) {
    cachedPosts.topics = {};
  }

  cachedPosts.topics[topicId] = {
    ...topicData,
    lastSeen: Date.now(),
  };

  gmSetValue(CACHE_KEY, cachedPosts);
  debug(`Cached topic: ${topicId}`);
}

/**
 * Extract and cache all posts from the topicreview section
 */
export function cachePostsFromTopicReview() {
  const topicReview = document.getElementById("topicreview");
  if (!topicReview) return;

  const posts = topicReview.querySelectorAll(".post");
  let newPostsCached = 0;
  const cachedPosts = getAllCachedPosts();

  posts.forEach((post) => {
    const postBody = post.querySelector(".postbody");
    if (!postBody) return;

    const postId = postBody.id.replace("pr", "");
    if (!postId) return;

    // Cache post content if not already cached
    if (!cachedPosts[postId]) {
      const contentDiv = postBody.querySelector(".content");
      const messageDiv = postBody.querySelector(`#message_${postId}`);

      if (contentDiv && messageDiv) {
        cachedPosts[postId] = {
          html: contentDiv.innerHTML,
          bbcode: messageDiv.textContent,
          time: Date.now(),
        };
        newPostsCached++;
      }
    }
  });

  if (newPostsCached > 0) {
    debug(`Cached ${newPostsCached} new posts from topic review`);
    gmSetValue(CACHE_KEY, cachedPosts);
  }
}

/**
 * Cache all posts on a viewtopic page
 */
export function cachePostsFromViewTopic() {
  const posts = document.querySelectorAll(".post");
  let newPostsCached = 0;
  const cachedPosts = getAllCachedPosts();

  posts.forEach((post) => {
    const postBody = post.querySelector(".postbody");
    if (!postBody) return;

    const postId = postBody.id.replace("p", "");
    if (!postId) return;

    // Cache post content if not already cached
    if (!cachedPosts[postId]) {
      const contentDiv = post.querySelector(".content");

      if (contentDiv) {
        cachedPosts[postId] = {
          html: contentDiv.innerHTML,
          time: Date.now(),
        };
        newPostsCached++;
      }
    }
  });

  if (newPostsCached > 0) {
    debug(`Cached ${newPostsCached} new posts from topic page`);
    gmSetValue(CACHE_KEY, cachedPosts);
  }
}

/**
 * Extract topic IDs from lastpost elements and cache them
 */
export function cacheLastPosts() {
  const lastPosts = document.querySelectorAll("dd.lastpost");
  if (lastPosts.length === 0) return;

  debug(`Found ${lastPosts.length} lastpost elements`);
  const cachedPosts = getAllCachedPosts();

  if (!cachedPosts.topics) {
    cachedPosts.topics = {};
  }

  let newTopicsCached = 0;

  lastPosts.forEach((lastPost) => {
    const linkElement = lastPost.querySelector("a[href*='viewtopic']");
    if (!linkElement) return;

    const href = linkElement.getAttribute("href");
    const topicIdMatch = href.match(/[?&]t=(\d+)/);
    if (!topicIdMatch) return;

    const topicId = topicIdMatch[1];

    // Update or add topic info
    cachedPosts.topics[topicId] = {
      lastSeen: Date.now(),
      replyUrl: `https://rpghq.org/forums/posting.php?mode=reply&t=${topicId}`,
    };
    newTopicsCached++;
  });

  if (newTopicsCached > 0) {
    debug(`Cached ${newTopicsCached} topic IDs from lastpost elements`);
    gmSetValue(CACHE_KEY, cachedPosts);
  }
}

/**
 * Clear all cached posts and topics
 * @returns {number} Number of items that were removed
 */
export function clearAllCachedPosts() {
  const cachedPosts = getAllCachedPosts();
  let removedCount = 0;

  // Count regular posts
  Object.keys(cachedPosts).forEach((key) => {
    if (key !== "topics") {
      removedCount++;
    }
  });

  // Count topics
  if (cachedPosts.topics) {
    removedCount += Object.keys(cachedPosts.topics).length;
  }

  // Clear all by setting to empty object
  gmSetValue(CACHE_KEY, {});
  log(`Cleared all cached posts: ${removedCount} items removed`);

  return removedCount;
}

/**
 * Clear old cached posts (older than specified days)
 * @param {number} days - Number of days to keep posts (default 7)
 */
export function clearOldCachedPosts(days = 7) {
  const cachedPosts = getAllCachedPosts();
  const now = Date.now();
  const maxAge = days * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  let removedCount = 0;

  // Clear old posts
  Object.keys(cachedPosts).forEach((key) => {
    if (key === "topics") return; // Skip the topics object

    const post = cachedPosts[key];
    if (post.time && now - post.time > maxAge) {
      delete cachedPosts[key];
      removedCount++;
    }
  });

  // Clear old topics
  if (cachedPosts.topics) {
    Object.keys(cachedPosts.topics).forEach((topicId) => {
      const topic = cachedPosts.topics[topicId];
      if (topic.lastSeen && now - topic.lastSeen > maxAge) {
        delete cachedPosts.topics[topicId];
        removedCount++;
      }
    });
  }

  if (removedCount > 0) {
    debug(`Cleared ${removedCount} old cached items`);
    gmSetValue(CACHE_KEY, cachedPosts);
  }
}
