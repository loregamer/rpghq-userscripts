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
  log("Attempting to cache posts from topic review section");
  const topicReview = document.getElementById("topicreview");
  if (!topicReview) {
    log("No topicreview element found in the DOM");
    return;
  }
  log(`Found topicreview element: ${topicReview.tagName}#${topicReview.id}`);

  // Log the structure of the topicreview element to help diagnose issues
  const topicReviewHTML = topicReview.innerHTML.substring(0, 200) + "..."; // First 200 chars
  debug(`Topicreview element structure (preview): ${topicReviewHTML}`);

  const posts = topicReview.querySelectorAll(".post, .post-container");
  log(`Found ${posts.length} posts in topic review`);

  if (posts.length === 0) {
    return;
  }

  let newPostsCached = 0;
  const cachedPosts = getAllCachedPosts();

  posts.forEach((post, index) => {
    if (!post) {
      log(`Warning: Null post element at index ${index}`);
      return;
    }

    log(`Processing topic review post ${index + 1}/${posts.length}`);
    debug(
      `Post element: ${post.tagName}${post.id ? "#" + post.id : ""} class="${post.className || ""}"`,
    );

    // Try multiple methods to get the post ID
    let postId = null;
    let extractionMethod = "";

    // Method 1: From postbody ID
    const postBody = post.querySelector(".postbody");
    if (postBody) {
      log(
        `Found postbody: ${postBody.tagName}${postBody.id ? "#" + postBody.id : ""} class="${postBody.className || ""}"`,
      );
      if (postBody.id) {
        // Handle both 'pr1234' and 'p1234' formats
        postId = postBody.id.replace(/^(pr|p)/, "");
        extractionMethod = "postbody ID";
        log(`Extracted post ID ${postId} from postbody ID: ${postBody.id}`);
      }
    } else {
      log(`No .postbody element found in review post ${index + 1}`);
    }

    // Method 2: Look for message_ div
    if (!postId) {
      const messageDivs = post.querySelectorAll('[id^="message_"]');
      log(
        `Found ${messageDivs.length} message_ divs in review post ${index + 1}`,
      );
      if (messageDivs.length > 0) {
        const messageId = messageDivs[0].id;
        log(`First message div ID: ${messageId}`);
        const idMatch = messageId.match(/message_(\d+)/);
        if (idMatch && idMatch[1]) {
          postId = idMatch[1];
          extractionMethod = "message div ID";
          log(`Extracted post ID ${postId} from message div ID: ${messageId}`);
        }
      }
    }

    // Method 3: Extract from anchor links
    if (!postId) {
      const anchors = post.querySelectorAll("a[href*='#p']");
      log(
        `Found ${anchors.length} anchors with #p in href in review post ${index + 1}`,
      );
      if (anchors.length > 0) {
        const anchor = anchors[0];
        const href = anchor.href;
        log(`First anchor href: ${href}`);
        const match = href.match(/#p(\d+)/);
        if (match && match[1]) {
          postId = match[1];
          extractionMethod = "anchor link";
          log(`Extracted post ID ${postId} from anchor link: ${href}`);
        }
      }
    }

    if (!postId) {
      log(
        `Could not find post ID for review post ${index + 1} using any method`,
      );
      // Log the HTML structure to help diagnose the issue
      const postHTML = post.outerHTML.substring(0, 300) + "...";
      debug(`Post HTML preview: ${postHTML}`);
      return;
    }

    log(
      `Successfully identified post ID ${postId} using ${extractionMethod} method`,
    );

    // Skip if already cached
    if (cachedPosts[postId]) {
      log(`Post ${postId} already exists in cache, skipping`);
      return;
    }

    // Find content and message elements
    const contentDiv =
      postBody?.querySelector(".content") || post.querySelector(".content");
    const messageDiv = post.querySelector(`#message_${postId}`);

    // Log content finding results
    if (contentDiv) {
      log(
        `Found content div for post ${postId}: ${contentDiv.tagName}${contentDiv.id ? "#" + contentDiv.id : ""} class="${contentDiv.className || ""}"`,
      );
      const contentPreview =
        contentDiv.innerHTML.substring(0, 100).replace(/\n/g, " ") + "...";
      debug(`Content preview: ${contentPreview}`);
    } else {
      log(`No content div found for post ${postId}`);
    }

    if (messageDiv) {
      log(
        `Found message div for post ${postId}: ${messageDiv.tagName}#${messageDiv.id}`,
      );
      const messagePreview =
        messageDiv.textContent.substring(0, 100).replace(/\n/g, " ") + "...";
      debug(`Message preview: ${messagePreview}`);
    } else {
      log(`No message div found with ID message_${postId}`);
    }

    // Cache as much as we can find
    if (contentDiv || messageDiv) {
      const cacheEntry = {
        time: Date.now(),
      };

      if (contentDiv) {
        cacheEntry.html = contentDiv.innerHTML;
        log(
          `Cached HTML content for post ${postId} (${contentDiv.innerHTML.length} characters)`,
        );
      }

      if (messageDiv) {
        cacheEntry.bbcode = messageDiv.textContent;
        log(
          `Cached BBCode content for post ${postId} (${messageDiv.textContent.length} characters)`,
        );
      }

      cachedPosts[postId] = cacheEntry;
      newPostsCached++;
      log(`Successfully cached review post ${postId}`);
    } else {
      log(`No content found for review post ${postId}, nothing to cache`);
    }
  });

  if (newPostsCached > 0) {
    debug(`Cached ${newPostsCached} new posts from topic review`);
    gmSetValue(CACHE_KEY, cachedPosts);
  } else {
    debug("No new posts cached from topic review");
  }
}

/**
 * Cache all posts on a viewtopic page
 */
export function cachePostsFromViewTopic() {
  log("Attempting to cache posts from viewtopic page");

  // Handle both classic post structure and potential newer layouts
  const posts = document.querySelectorAll(".post, .post-container");
  log(`Found ${posts.length} potential post elements on the viewtopic page`);

  // If no posts found, try to determine why by examining page structure
  if (posts.length === 0) {
    log("No post elements found on page. Examining page structure...");
    const body = document.body;
    const classes = body.className;
    log(`Body classes: ${classes}`);

    // Try to find main content area
    const contentArea = document.querySelector(
      "#page-body, .page-body, main, .main-content",
    );
    if (contentArea) {
      log(
        `Found main content area: ${contentArea.tagName}${contentArea.id ? "#" + contentArea.id : ""} class="${contentArea.className || ""}"`,
      );
      const contentPreview = contentArea.innerHTML.substring(0, 200) + "...";
      debug(`Content area preview: ${contentPreview}`);
    } else {
      log("Could not find main content area");
    }
    return;
  }

  let newPostsCached = 0;
  const cachedPosts = getAllCachedPosts();

  posts.forEach((post, index) => {
    if (!post) {
      log(`Warning: Null post element at index ${index}`);
      return;
    }

    log(`Processing viewtopic post ${index + 1}/${posts.length}`);
    debug(
      `Post element: ${post.tagName}${post.id ? "#" + post.id : ""} class="${post.className || ""}"`,
    );

    let postId = null;
    let extractionMethod = "";

    // Method 1: From the post ID attribute
    if (post.id) {
      const rawId = post.id;
      postId = rawId.replace(/^p/, "");
      if (postId !== rawId) {
        // If replacement happened
        extractionMethod = "post ID attribute";
        log(`Extracted post ID ${postId} from post ID attribute: ${rawId}`);
      } else {
        // If no replacement happened, it might not be a valid ID format
        postId = null;
        log(
          `Post has ID attribute ${rawId} but it doesn't match expected format`,
        );
      }
    } else {
      log(`Post element ${index + 1} has no ID attribute`);
    }

    // Method 2: From postbody element
    if (!postId) {
      const postBody = post.querySelector(".postbody");
      if (postBody) {
        log(
          `Found postbody: ${postBody.tagName}${postBody.id ? "#" + postBody.id : ""} class="${postBody.className || ""}"`,
        );
        if (postBody.id) {
          const bodyId = postBody.id;
          postId = bodyId.replace(/^p/, "");
          if (postId !== bodyId) {
            // If replacement happened
            extractionMethod = "postbody ID";
            log(`Extracted post ID ${postId} from postbody ID: ${bodyId}`);
          } else {
            postId = null;
            log(
              `Postbody has ID ${bodyId} but it doesn't match expected format`,
            );
          }
        } else {
          log(`Postbody has no ID attribute`);
        }
      } else {
        log(`No .postbody element found in post ${index + 1}`);
      }
    }

    // Method 3: Extract from anchor links
    if (!postId) {
      const anchors = post.querySelectorAll("a[href*='#p']");
      log(
        `Found ${anchors.length} anchors with #p in href in post ${index + 1}`,
      );
      if (anchors.length > 0) {
        const anchor = anchors[0];
        const href = anchor.href;
        log(`First anchor href: ${href}`);
        const match = href.match(/#p(\d+)/);
        if (match && match[1]) {
          postId = match[1];
          extractionMethod = "anchor link";
          log(`Extracted post ID ${postId} from anchor link: ${href}`);
        } else {
          log(`Anchor href ${href} doesn't match expected #p format`);
        }
      }
    }

    // If we've exhausted our options and still can't find a post ID, skip this post
    if (!postId) {
      log(
        `Could not find post ID for post element ${index + 1} using any method`,
      );
      // Log the HTML structure to help diagnose the issue
      const postHTML = post.outerHTML.substring(0, 300) + "...";
      debug(`Post HTML preview: ${postHTML}`);
      return;
    }

    log(
      `Successfully identified post ID ${postId} using ${extractionMethod} method`,
    );

    // Don't recache if already in cache
    if (cachedPosts[postId]) {
      log(`Post ${postId} already exists in cache, skipping`);
      return;
    }

    // Find the content
    const contentDiv = post.querySelector(".content");
    if (contentDiv) {
      log(
        `Found content div for post ${postId}: ${contentDiv.tagName}${contentDiv.id ? "#" + contentDiv.id : ""} class="${contentDiv.className || ""}"`,
      );
      const contentPreview =
        contentDiv.innerHTML.substring(0, 100).replace(/\n/g, " ") + "...";
      debug(`Content preview: ${contentPreview}`);
    } else {
      log(`No content div found for post ${postId}, cannot cache`);
      return;
    }

    // Cache the post content
    cachedPosts[postId] = {
      html: contentDiv.innerHTML,
      time: Date.now(),
    };
    newPostsCached++;
    log(
      `Successfully cached post ${postId} (${contentDiv.innerHTML.length} characters)`,
    );
  });

  if (newPostsCached > 0) {
    debug(`Cached ${newPostsCached} new posts from topic page`);
    gmSetValue(CACHE_KEY, cachedPosts);
  } else {
    debug("No new posts cached from topic page");
  }
}

/**
 * Extract topic IDs from lastpost elements and cache them
 */
export function cacheLastPosts() {
  log("Attempting to cache last posts from forum/index page");

  // Try to find lastpost elements using different possible selectors
  const lastPosts = document.querySelectorAll(
    "dd.lastpost, .lastpost, .last-post, .lastpost-container",
  );

  if (lastPosts.length === 0) {
    log("No lastpost elements found on the page");

    // Try to determine why by examining page structure
    log(
      "Examining page structure to understand why no lastpost elements were found...",
    );
    const body = document.body;
    const classes = body.className;
    log(`Body classes: ${classes}`);

    // Try to find forum listing or topic listing elements
    const forumRows = document.querySelectorAll(
      ".topiclist, .forumlist, .topic-list, .forum-list",
    );
    if (forumRows.length > 0) {
      log(`Found ${forumRows.length} forum/topic list container elements`);
      const firstRow = forumRows[0];
      log(
        `First forum/topic listing element: ${firstRow.tagName}${firstRow.id ? "#" + firstRow.id : ""} class="${firstRow.className || ""}"`,
      );

      // Look for alternative lastpost containers
      const potentialContainers = document.querySelectorAll(
        "[class*='last'], [class*='post']",
      );
      log(
        `Found ${potentialContainers.length} potential alternative lastpost containers`,
      );
      if (potentialContainers.length > 0) {
        for (let i = 0; i < Math.min(3, potentialContainers.length); i++) {
          const container = potentialContainers[i];
          log(
            `Potential lastpost container ${i + 1}: ${container.tagName}${container.id ? "#" + container.id : ""} class="${container.className || ""}"`,
          );
        }
      }
    } else {
      log("Could not find any forum or topic listing elements");
    }
    return;
  }

  log(`Found ${lastPosts.length} lastpost elements`);
  const cachedPosts = getAllCachedPosts();

  if (!cachedPosts.topics) {
    cachedPosts.topics = {};
  }

  let newTopicsCached = 0;

  lastPosts.forEach((lastPost, index) => {
    if (!lastPost) {
      log(`Warning: Null lastpost element at index ${index}`);
      return;
    }

    log(`Processing lastpost element ${index + 1}/${lastPosts.length}`);
    debug(
      `Lastpost element: ${lastPost.tagName}${lastPost.id ? "#" + lastPost.id : ""} class="${lastPost.className || ""}"`,
    );

    // Find any link that might contain a topic reference
    const linkElements = lastPost.querySelectorAll(
      "a[href*='viewtopic'], a[href*='t=']",
    );
    log(
      `Found ${linkElements.length} potential topic links in lastpost element ${index + 1}`,
    );

    if (linkElements.length === 0) {
      log(
        `No topic links found in lastpost element ${index + 1}, examining HTML structure...`,
      );
      const lastPostHTML = lastPost.outerHTML.substring(0, 200) + "...";
      debug(`Lastpost HTML preview: ${lastPostHTML}`);
      return;
    }

    // Log all found links for debugging
    linkElements.forEach((link, linkIndex) => {
      const href = link.getAttribute("href");
      const text = link.textContent.trim();
      log(`Link ${linkIndex + 1}: href="${href}", text="${text}"`);
    });

    // Try each link until we find a valid topic ID
    for (const linkElement of linkElements) {
      const href = linkElement.getAttribute("href");
      const topicIdMatch = href.match(/[?&]t=(\d+)/);
      if (!topicIdMatch) {
        debug(
          `Link href ${href} doesn't contain a topic ID in the expected format`,
        );
        continue;
      }

      const topicId = topicIdMatch[1];
      log(`Successfully extracted topic ID ${topicId} from href ${href}`);

      // Get additional info if available
      let title = "";
      const titleElement = lastPost.closest("li")?.querySelector(".topictitle");
      if (titleElement) {
        title = titleElement.textContent.trim();
        log(`Found title for topic ${topicId}: "${title}"`);
      } else {
        log(`No title element found for topic ${topicId}`);
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
        log(
          `Updating existing cached topic ${topicId}, last seen ${now - existingTopic.lastSeen}ms ago`,
        );
      } else {
        log(`Adding new topic ${topicId} to cache`);
      }

      // Store in cache
      cachedPosts.topics[topicId] = topicData;
      newTopicsCached++;
      log(`Cached topic: ${topicId}${title ? ` (${title})` : ""}`);
      break; // Found a topic ID, no need to check other links
    }
  });

  if (newTopicsCached > 0) {
    log(
      `Successfully cached ${newTopicsCached} topic IDs from ${lastPosts.length} lastpost elements`,
    );
    gmSetValue(CACHE_KEY, cachedPosts);
    const totalTopics = Object.keys(cachedPosts.topics || {}).length;
    debug(`Total topics in cache after update: ${totalTopics}`);
  } else {
    log("No topics were cached from lastpost elements");
    log(
      "This could be due to no new topics found or all topics already being cached",
    );
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
