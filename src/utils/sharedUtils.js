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
  _cachePostData: (postId, data) => {},
  _getCachedPostData: (postId) => {
    return getCachedPost(postId);
  },

  // Page-level Caching Logic
  _cachePostsOnPage: () => {
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
  _applyUserPreferences: () => {},
  _applyThreadPreferences: () => {},
  _cacheTopicData: (topicId, data) => {},
  _getCachedTopicData: (topicId) => {
    return getCachedTopicInfo(topicId);
  },
};
