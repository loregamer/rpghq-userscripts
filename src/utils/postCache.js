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
}

/**
 * Extract and cache all posts from the topicreview section
 */
export function cachePostsFromTopicReview() {
  const topicReview = document.getElementById("topicreview");
  if (!topicReview) {
    return;
  }

  // Log the structure of the topicreview element to help diagnose issues
  const topicReviewHTML = topicReview.innerHTML.substring(0, 200) + "..."; // First 200 chars

  const posts = topicReview.querySelectorAll(".post, .post-container");

  if (posts.length === 0) {
    return;
  }

  let newPostsCached = 0;
  const cachedPosts = getAllCachedPosts();

  posts.forEach((post, index) => {
    // Try multiple methods to get the post ID
    let postId = null;
    let extractionMethod = "";

    // Method 1: From postbody ID
    const postBody = post.querySelector(".postbody");
    if (postBody) {
      if (postBody.id) {
        // Handle both 'pr1234' and 'p1234' formats
        postId = postBody.id.replace(/^(pr|p)/, "");
        extractionMethod = "postbody ID";
      }
    } else {
    }

    // Method 2: Look for message_ div
    if (!postId) {
      const messageDivs = post.querySelectorAll('[id^="message_"]');

      if (messageDivs.length > 0) {
        const messageId = messageDivs[0].id;

        const idMatch = messageId.match(/message_(\d+)/);
        if (idMatch && idMatch[1]) {
          postId = idMatch[1];
          extractionMethod = "message div ID";
        }
      }
    }

    // Method 3: Extract from anchor links
    if (!postId) {
      const anchors = post.querySelectorAll("a[href*='#p']");

      if (anchors.length > 0) {
        const anchor = anchors[0];
        const href = anchor.href;

        const match = href.match(/#p(\d+)/);
        if (match && match[1]) {
          postId = match[1];
          extractionMethod = "anchor link";
        }
      }
    }

    if (!postId) {
      // Log the HTML structure to help diagnose the issue
      const postHTML = post.outerHTML.substring(0, 300) + "...";

      return;
    }

    // Skip if already cached
    if (cachedPosts[postId]) {
      return;
    }

    // Find content and message elements
    const contentDiv =
      postBody?.querySelector(".content") || post.querySelector(".content");
    const messageDiv = post.querySelector(`#message_${postId}`);

    // Log content finding results
    if (contentDiv) {
      const contentPreview =
        contentDiv.innerHTML.substring(0, 100).replace(/\n/g, " ") + "...";
    } else {
    }

    if (messageDiv) {
      const messagePreview =
        messageDiv.textContent.substring(0, 100).replace(/\n/g, " ") + "...";
    } else {
    }

    // Cache as much as we can find
    if (contentDiv || messageDiv) {
      const cacheEntry = {
        time: Date.now(),
      };

      if (contentDiv) {
        cacheEntry.html = contentDiv.innerHTML;
      }

      if (messageDiv) {
        cacheEntry.bbcode = messageDiv.textContent;
      }

      cachedPosts[postId] = cacheEntry;
      newPostsCached++;
    } else {
    }
  });

  if (newPostsCached > 0) {
    gmSetValue(CACHE_KEY, cachedPosts);
  } else {
  }
}

/**
 * Cache all posts on a viewtopic page
 */
export function cachePostsFromViewTopic() {
  // Handle both classic post structure and potential newer layouts
  const posts = document.querySelectorAll(".post, .post-container");

  // If no posts found, try to determine why by examining page structure
  if (posts.length === 0) {
    const body = document.body;
    const classes = body.className;

    // Try to find main content area
    const contentArea = document.querySelector(
      "#page-body, .page-body, main, .main-content",
    );
    if (contentArea) {
      const contentPreview = contentArea.innerHTML.substring(0, 200) + "...";
    } else {
    }
    return;
  }

  let newPostsCached = 0;
  const cachedPosts = getAllCachedPosts();

  posts.forEach((post, index) => {
    let postId = null;
    let extractionMethod = "";

    // Method 1: From the post ID attribute
    if (post.id) {
      const rawId = post.id;
      postId = rawId.replace(/^p/, "");
      if (postId !== rawId) {
        // If replacement happened
        extractionMethod = "post ID attribute";
      } else {
        // If no replacement happened, it might not be a valid ID format
        postId = null;
      }
    } else {
    }

    // Method 2: From postbody element
    if (!postId) {
      const postBody = post.querySelector(".postbody");
      if (postBody) {
        if (postBody.id) {
          const bodyId = postBody.id;
          postId = bodyId.replace(/^p/, "");
          if (postId !== bodyId) {
            // If replacement happened
            extractionMethod = "postbody ID";
          } else {
            postId = null;
          }
        } else {
        }
      } else {
      }
    }

    // Method 3: Extract from anchor links
    if (!postId) {
      const anchors = post.querySelectorAll("a[href*='#p']");

      if (anchors.length > 0) {
        const anchor = anchors[0];
        const href = anchor.href;

        const match = href.match(/#p(\d+)/);
        if (match && match[1]) {
          postId = match[1];
          extractionMethod = "anchor link";
        } else {
        }
      }
    }

    // If we've exhausted our options and still can't find a post ID, skip this post
    if (!postId) {
      // Log the HTML structure to help diagnose the issue
      const postHTML = post.outerHTML.substring(0, 300) + "...";

      return;
    }

    // Don't recache if already in cache
    if (cachedPosts[postId]) {
      return;
    }

    // Find the content
    const contentDiv = post.querySelector(".content");
    if (contentDiv) {
      const contentPreview =
        contentDiv.innerHTML.substring(0, 100).replace(/\n/g, " ") + "...";
    } else {
      return;
    }

    // Cache the post content
    cachedPosts[postId] = {
      html: contentDiv.innerHTML,
      time: Date.now(),
    };
    newPostsCached++;
  });

  if (newPostsCached > 0) {
    gmSetValue(CACHE_KEY, cachedPosts);
  } else {
  }
}

/**
 * Extract topic IDs from lastpost elements and cache them
 */
export function cacheLastPosts() {
  // Try to find lastpost elements using different possible selectors
  const lastPosts = document.querySelectorAll(
    "dd.lastpost, .lastpost, .last-post, .lastpost-container",
  );

  if (lastPosts.length === 0) {
    // Try to determine why by examining page structure

    const body = document.body;
    const classes = body.className;

    // Try to find forum listing or topic listing elements
    const forumRows = document.querySelectorAll(
      ".topiclist, .forumlist, .topic-list, .forum-list",
    );
    if (forumRows.length > 0) {
      const firstRow = forumRows[0];

      // Look for alternative lastpost containers
      const potentialContainers = document.querySelectorAll(
        "[class*='last'], [class*='post']",
      );

      if (potentialContainers.length > 0) {
        for (let i = 0; i < Math.min(3, potentialContainers.length); i++) {
          const container = potentialContainers[i];
        }
      }
    } else {
    }
    return;
  }

  const cachedPosts = getAllCachedPosts();

  if (!cachedPosts.topics) {
    cachedPosts.topics = {};
  }

  let newTopicsCached = 0;

  lastPosts.forEach((lastPost, index) => {
    // Find any link that might contain a topic reference
    const linkElements = lastPost.querySelectorAll(
      "a[href*='viewtopic'], a[href*='t=']",
    );

    if (linkElements.length === 0) {
      const lastPostHTML = lastPost.outerHTML.substring(0, 200) + "...";

      return;
    }

    // Log all found links for debugging
    linkElements.forEach((link, linkIndex) => {
      const href = link.getAttribute("href");
      const text = link.textContent.trim();
    });

    // Try each link until we find a valid topic ID
    for (const linkElement of linkElements) {
      const href = linkElement.getAttribute("href");
      const topicIdMatch = href.match(/[?&]t=(\d+)/);
      if (!topicIdMatch) {
        continue;
      }

      const topicId = topicIdMatch[1];

      // Get additional info if available
      let title = "";
      const titleElement = lastPost.closest("li")?.querySelector(".topictitle");
      if (titleElement) {
        title = titleElement.textContent.trim();
      } else {
      }

      // Update or add topic info
      const now = Date.now();
      const existingTopic = cachedPosts.topics[topicId];
      const topicData = {
        lastSeen: now,
        replyUrl: `https://rpghq.org/forums/posting.php?mode=reply&t=${topicId}`,
        title: title || undefined,
      };

      // Log whether we're updating or adding
      if (existingTopic) {
      } else {
      }

      // Store in cache
      cachedPosts.topics[topicId] = topicData;
      newTopicsCached++;

      break; // Found a topic ID, no need to check other links
    }
  });

  if (newTopicsCached > 0) {
    gmSetValue(CACHE_KEY, cachedPosts);
    const totalTopics = Object.keys(cachedPosts.topics || {}).length;
  } else {
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
    gmSetValue(CACHE_KEY, cachedPosts);
  }
}
