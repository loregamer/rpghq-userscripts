// Shared utility functions for RPGHQ Userscripts
import {
  cachePostsFromTopicReview,
  cachePostsFromViewTopic,
  cacheLastPosts,
  clearOldCachedPosts,
  getCachedPost,
  getCachedTopicInfo,
} from "./postCache.js";
import { log, debug } from "./logger.js";

export const sharedUtils = {
  // Caching functions will go here
  _cachePostData: (postId, data) => {
    log(`Caching data for post ${postId}`);
    // This functionality is now handled by the postCache.js module
  },
  _getCachedPostData: (postId) => {
    debug(`Getting cached data for post ${postId}`);
    return getCachedPost(postId);
  },

  // Page-level Caching Logic
  _cachePostsOnPage: () => {
    log("Caching posts on current page");

    // Different caching depending on page type
    if (window.location.href.includes("posting.php")) {
      cachePostsFromTopicReview();
    }

    if (window.location.href.includes("viewtopic.php")) {
      cachePostsFromViewTopic();
    }

    if (
      window.location.href.includes("index.php") ||
      window.location.href.includes("viewforum.php")
    ) {
      cacheLastPosts();
    }

    // Periodically clean up old cached posts (once per session)
    if (!sharedUtils._cleanupRun) {
      clearOldCachedPosts(7); // Keep posts for 7 days
      sharedUtils._cleanupRun = true;
    }
  },

  // Preference Application Logic (Placeholders)
  _applyUserPreferences: () => {
    console.log("Shared Logic: Applying user preferences (stub).");
    // Logic to read stored user preferences (hiding/highlighting users) and apply them
  },
  _applyThreadPreferences: () => {
    console.log("Shared Logic: Applying thread preferences (stub).");
    // Logic to read stored thread preferences (pinning/hiding/highlighting topics) and apply them
  },
  _cacheTopicData: (topicId, data) => {
    log(`Caching data for topic ${topicId}`);
    // This functionality is now handled by the postCache.js module
  },
  _getCachedTopicData: (topicId) => {
    debug(`Getting cached data for topic ${topicId}`);
    return getCachedTopicInfo(topicId);
  },
};
