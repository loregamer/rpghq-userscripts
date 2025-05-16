/**
 * Content processing for Hide functionality
 * Handles processing of forum content to hide/highlight hidden users
 */

import { log, debug, error } from "../logger.js";
import { gmGetValue } from "../../main.js";
import { getCachedPost } from "../postCache.js";
import { addHideStyles } from "./hide-styles.js";
import {
  IGNORED_USERS_KEY,
  REPLACED_AVATARS_KEY,
  HIDDEN_MANUAL_POSTS_KEY,
  USER_COLORS_KEY,
  HIDE_CONFIG_KEY,
  DEFAULT_CONFIG,
  isUserHidden,
  contentContainsHidden,
  hidePost,
  unhidePost,
} from "./hide.js";

// Global state for tracking whether hidden content is shown or hidden
let showHiddenPosts = false;

// Elements that have been processed
const processedElements = new Set();

/**
 * Process all hide-related content on the page
 */
export function processHideContent() {
  log("Processing Hide content...");

  try {
    // Get configuration
    const config = gmGetValue(HIDE_CONFIG_KEY, DEFAULT_CONFIG);

    // Add Hide styles to the page
    addHideStyles();

    // Apply CSS variables
    document.documentElement.style.setProperty(
      "--hide-author-highlight",
      config.authorHighlightColor,
    );
    document.documentElement.style.setProperty(
      "--hide-content-highlight",
      config.contentHighlightColor,
    );

    // Process forum content
    processTopicListRows();
    processForumPosts();
    processPagination();
    processLastPosts();
    processQuotes();
    processAvatars();
    processReactionList();
    processNotifications();

    // Add the toggle button
    addHideToggleButton();

    // Setup keyboard shortcuts
    setupKeyboardShortcuts();

    // Add manual hide buttons to posts
    addManualHideButtons();

    // Log success
    log("Hide content processing complete");
    return true;
  } catch (err) {
    error("Error processing Hide content:", err);
    return false;
  }
}

/**
 * Process topic list rows to hide/highlight content from hidden users
 */
function processTopicListRows() {
  log("Processing topic list rows...");

  try {
    const config = gmGetValue(HIDE_CONFIG_KEY, DEFAULT_CONFIG);

    // Process forum list rows
    const forumRows = document.querySelectorAll("ul.topiclist.forums > li.row");
    forumRows.forEach((row) => processForumRow(row, config));

    // Process topic list rows
    const topicRows = document.querySelectorAll("ul.topiclist.topics > li.row");
    topicRows.forEach((row) => processTopicRow(row, config));

    // Process recent topics rows
    const recentRows = document.querySelectorAll(
      "#recent-topics > ul > li.row",
    );
    recentRows.forEach((row) => processTopicRow(row, config));

    log(
      `Processed ${forumRows.length} forum rows, ${topicRows.length} topic rows, ${recentRows.length} recent rows`,
    );
  } catch (err) {
    error("Error processing topic list rows:", err);
  }
}

/**
 * Process a forum row
 * @param {HTMLElement} row - The forum row element
 * @param {Object} config - The Hide configuration
 */
function processForumRow(row, config) {
  // Skip if already processed
  if (processedElements.has(row)) {
    return;
  }

  try {
    // Flag as processed
    processedElements.add(row);

    // Check for thread whitelisting
    const isWhitelisted = isThreadWhitelisted(row, config);

    // Check lastpost column
    const lastpost = row.querySelector("dd.lastpost");
    if (!lastpost) return;

    // Check if the lastpost author is hidden
    const authorLink = lastpost.querySelector(
      "a.username, a.username-coloured",
    );
    if (authorLink && isUserHidden(authorLink.textContent.trim())) {
      lastpost.classList.add("hidden-row");
      row.classList.add("hidden-by-author");
      return;
    }

    // Check for content references to hidden users
    const postLink = lastpost.querySelector("a[href*='viewtopic.php']");
    if (postLink) {
      const postId = postLink.href.match(/p=(\d+)/)?.[1];
      if (postId) {
        const post = getCachedPost(postId);
        if (post && post.html && contentContainsHidden(post.html)) {
          row.classList.add("hidden-by-content");
        }
      }
    }
  } catch (err) {
    error("Error processing forum row:", err);
  }
}

/**
 * Process a topic row
 * @param {HTMLElement} row - The topic row element
 * @param {Object} config - The Hide configuration
 */
function processTopicRow(row, config) {
  // Skip if already processed
  if (processedElements.has(row)) {
    return;
  }

  try {
    // Flag as processed
    processedElements.add(row);

    // Check for thread whitelisting
    const isWhitelisted = isThreadWhitelisted(row, config);

    // First, check for author in row class
    const authorClasses = Array.from(row.classList).filter(
      (cls) => cls.startsWith("author-name-") || cls.startsWith("row-by-"),
    );

    if (authorClasses.length > 0) {
      for (const cls of authorClasses) {
        const username = cls.replace("author-name-", "").replace("row-by-", "");
        if (isUserHidden(username)) {
          // Check if we should hide topic creations
          if (config.hideTopicCreations && !isWhitelisted) {
            row.classList.add("hidden-row");
          }
          row.classList.add("hidden-by-author");

          // Add asterisk to topic title if not already there
          const topicTitle = row.querySelector("a.topictitle");
          if (topicTitle && !topicTitle.textContent.startsWith("*")) {
            topicTitle.textContent = "*" + topicTitle.textContent;
          }

          return;
        }
      }
    }

    // Check lastpost column
    const lastpost = row.querySelector("dd.lastpost");
    if (!lastpost) return;

    // Check if the lastpost author is hidden
    const authorLink = lastpost.querySelector(
      "a.username, a.username-coloured",
    );
    if (authorLink && isUserHidden(authorLink.textContent.trim())) {
      if (config.hideEntireRow && !isWhitelisted) {
        row.classList.add("hidden-row");
      } else {
        lastpost.classList.add("hidden-row");
      }
      row.classList.add("hidden-by-author");
      return;
    }

    // Check for content references to hidden users
    const postLink = lastpost.querySelector("a[href*='viewtopic.php']");
    if (postLink) {
      const postId = postLink.href.match(/p=(\d+)/)?.[1];
      if (postId) {
        const post = getCachedPost(postId);
        if (post && post.html && contentContainsHidden(post.html)) {
          if (config.hideEntireRow && !isWhitelisted) {
            row.classList.add("hidden-row");
          }
          row.classList.add("hidden-by-content");
        }
      }
    }
  } catch (err) {
    error("Error processing topic row:", err);
  }
}

/**
 * Check if a thread is whitelisted
 * @param {HTMLElement} element - The element to check
 * @param {Object} config - The Hide configuration
 * @returns {boolean} Whether the thread is whitelisted
 */
function isThreadWhitelisted(element, config) {
  try {
    // Get the topic title
    const topicTitleElement = element.querySelector("a.topictitle");
    if (!topicTitleElement) return false;

    // Get the whitelisted threads
    const whitelistedThreads = config.whitelistedThreads || [];
    if (whitelistedThreads.length === 0) return false;

    // Check if the topic title contains any whitelisted thread
    const topicTitle = topicTitleElement.textContent.trim();
    return whitelistedThreads.some((thread) =>
      topicTitle.toLowerCase().includes(thread.toLowerCase()),
    );
  } catch (err) {
    error("Error checking thread whitelist:", err);
    return false;
  }
}

/**
 * Process forum posts to hide/highlight content from hidden users
 */
function processForumPosts() {
  log("Processing forum posts...");

  try {
    // Get manually hidden posts
    const hiddenManualPosts = gmGetValue(HIDDEN_MANUAL_POSTS_KEY, {});

    // Process all posts
    const posts = document.querySelectorAll(".post");
    posts.forEach((post) => {
      // Skip if already processed
      if (processedElements.has(post)) {
        return;
      }

      // Flag as processed
      processedElements.add(post);

      // Extract post ID
      const postId = post.id.replace("p", "");
      if (!postId) return;

      // Check if manually hidden
      if (hiddenManualPosts[postId]) {
        post.classList.add("hidden-post-manual");
        return;
      }

      // Check author
      const usernameEl = post.querySelector(".username, .username-coloured");
      if (usernameEl && isUserHidden(usernameEl.textContent.trim())) {
        post.classList.add("hidden-post");
        post.classList.add("hidden-by-author");
        return;
      }

      // Check for mentions of hidden users in post content
      const contentDiv = post.querySelector(".content");
      if (contentDiv && contentContainsHidden(contentDiv.innerHTML)) {
        post.classList.add("hidden-post");
        post.classList.add("hidden-by-content");
      }
    });

    log(`Processed ${posts.length} forum posts`);
  } catch (err) {
    error("Error processing forum posts:", err);
  }
}

/**
 * Process pagination to update post counts
 */
function processPagination() {
  log("Processing pagination...");

  try {
    const paginationElements = document.querySelectorAll(".pagination");

    paginationElements.forEach((pagination) => {
      // Skip if already processed
      if (processedElements.has(pagination)) {
        return;
      }

      // Flag as processed
      processedElements.add(pagination);

      const paginationText = pagination.textContent.trim();
      if (!paginationText.includes("Page 1 of 1")) {
        return;
      }

      const visiblePosts = showHiddenPosts
        ? document.querySelectorAll(".post").length
        : document.querySelectorAll(
            ".post:not(.hidden-post):not(.hidden-post-manual)",
          ).length;

      const visibleMatches = showHiddenPosts
        ? document.querySelectorAll("li.row").length
        : document.querySelectorAll("li.row:not(.hidden-row)").length;

      // Update post count if this is a post page
      const postCountMatch = paginationText.match(/(\d+) posts/);
      if (postCountMatch) {
        pagination.innerHTML = pagination.innerHTML.replace(
          /\d+ posts/,
          `${visiblePosts} posts`,
        );
      }

      // Update match count if this is a search page
      const matchCountMatch = paginationText.match(
        /Search found (\d+) matches/,
      );
      if (matchCountMatch) {
        pagination.innerHTML = pagination.innerHTML.replace(
          /Search found \d+ matches/,
          `Search found ${visibleMatches} matches`,
        );
      }
    });

    log(`Processed ${paginationElements.length} pagination elements`);
  } catch (err) {
    error("Error processing pagination:", err);
  }
}

/**
 * Process lastposts to hide/highlight content from hidden users
 */
function processLastPosts() {
  log("Processing lastposts...");

  try {
    const lastPosts = document.querySelectorAll("dd.lastpost");

    lastPosts.forEach((lastPost) => {
      // Skip if already processed
      if (processedElements.has(lastPost)) {
        return;
      }

      // Flag as processed
      processedElements.add(lastPost);

      // Check author
      const authorLink = lastPost.querySelector(
        "a.username, a.username-coloured",
      );
      if (authorLink && isUserHidden(authorLink.textContent.trim())) {
        lastPost.classList.add("hidden-row");
        lastPost.classList.add("hidden-by-author");
      }
    });

    log(`Processed ${lastPosts.length} lastpost elements`);
  } catch (err) {
    error("Error processing lastposts:", err);
  }
}

/**
 * Process quotes to hide/highlight quotes from hidden users
 */
function processQuotes() {
  log("Processing quotes...");

  try {
    // Process blockquotes to hide quotes from hidden users
    const quotes = document.querySelectorAll("blockquote");

    quotes.forEach((quote) => {
      // Skip if already processed
      if (processedElements.has(quote)) {
        return;
      }

      // Flag as processed
      processedElements.add(quote);

      // Check author
      const citeElement = quote.querySelector("cite");
      if (!citeElement) return;

      const authorLink = citeElement.querySelector("a");
      if (authorLink && isUserHidden(authorLink.textContent.trim())) {
        quote.classList.add("hidden-quote");
      }
    });

    log(`Processed ${quotes.length} quotes`);
  } catch (err) {
    error("Error processing quotes:", err);
  }
}

/**
 * Process avatars to replace avatars from hidden users
 */
function processAvatars() {
  log("Processing avatars...");

  try {
    // Get replaced avatars
    const replacedAvatars = gmGetValue(REPLACED_AVATARS_KEY, {});

    // Find avatar images
    const avatarImages = document.querySelectorAll("img");

    avatarImages.forEach((img) => {
      // Skip if already processed
      if (processedElements.has(img)) {
        return;
      }

      // Check if this is an avatar image
      const match = img.src.match(/avatar=(\d+)/);
      if (!match) return;

      // Flag as processed
      processedElements.add(img);

      // Check if we have a replacement avatar
      const userId = match[1];
      if (replacedAvatars[userId]) {
        img.src = replacedAvatars[userId];
      }
    });

    log(`Processed ${avatarImages.length} avatar images`);
  } catch (err) {
    error("Error processing avatars:", err);
  }
}

/**
 * Process reaction lists to hide/highlight reactions from hidden users
 */
function processReactionList() {
  log("Processing reaction lists...");

  try {
    const reactionLists = document.querySelectorAll(".reaction-score-list");

    reactionLists.forEach((list) => {
      // Skip if already processed
      if (processedElements.has(list)) {
        return;
      }

      // Flag as processed
      processedElements.add(list);

      // Process reaction groups
      const reactionGroups = list.querySelectorAll(".reaction-group");

      reactionGroups.forEach((group) => {
        const popup = group.querySelector(".reaction-users-popup");
        if (!popup) return;

        const userLinks = popup.querySelectorAll(
          "a.username, a.username-coloured",
        );
        const countSpan = group.querySelector("span");
        if (!countSpan) return;

        let currentCount = parseInt(countSpan.textContent || "0", 10);
        let removedCount = 0;

        userLinks.forEach((link) => {
          const uid = link.href.match(/u=(\d+)/)?.[1];
          if (uid && isUserHidden(uid)) {
            // Navigate up to find the complete user entry
            let userRow = link;
            let parent = link.parentElement;

            while (parent && parent !== popup) {
              userRow = parent;
              if (
                parent.style &&
                parent.style.display === "flex" &&
                parent.querySelector("img[alt]") &&
                parent.textContent.trim().includes(link.textContent.trim())
              ) {
                break;
              }
              parent = parent.parentElement;
            }

            if (userRow) {
              userRow.remove();
              removedCount++;
            }
          }
        });

        if (removedCount > 0) {
          const newCount = currentCount - removedCount;
          if (newCount <= 0) {
            group.remove();
          } else {
            countSpan.textContent = String(newCount);
          }
        }
      });
    });

    log(`Processed ${reactionLists.length} reaction lists`);
  } catch (err) {
    error("Error processing reaction lists:", err);
  }
}

/**
 * Process notifications to hide/highlight notifications from hidden users
 */
function processNotifications() {
  log("Processing notifications...");

  try {
    // Process notification blocks
    const notificationBlocks = document.querySelectorAll(".notification-block");

    notificationBlocks.forEach((notification) => {
      // Skip if already processed
      if (processedElements.has(notification)) {
        return;
      }

      // Flag as processed
      processedElements.add(notification);

      // Check usernames
      const usernameEls = notification.querySelectorAll(
        ".username, .username-coloured",
      );

      // If no usernames, skip
      if (usernameEls.length === 0) return;

      // Get all usernames in the notification
      const usernames = Array.from(usernameEls).map((el) =>
        el.textContent.trim(),
      );

      // Check if the first username is hidden (most important for notifications)
      if (isUserHidden(usernames[0])) {
        const notificationItem = notification.closest("li");
        if (notificationItem) {
          notificationItem.classList.add("hidden-row");
          notificationItem.classList.add("hidden-by-author");

          // Try to mark as read
          markNotificationAsRead(notification);
        }
        return;
      }

      // Check if any username is hidden
      const hasHidden = usernames.some((username) => isUserHidden(username));

      if (hasHidden) {
        // Filter out hidden usernames
        const nonHidden = usernames.filter(
          (username) => !isUserHidden(username),
        );

        // If no non-hidden usernames, hide the notification
        if (nonHidden.length === 0) {
          const notificationItem = notification.closest("li");
          if (notificationItem) {
            notificationItem.classList.add("hidden-row");
            notificationItem.classList.add("hidden-by-author");

            // Try to mark as read
            markNotificationAsRead(notification);
          }
          return;
        }
      }
    });

    log(`Processed ${notificationBlocks.length} notification blocks`);
  } catch (err) {
    error("Error processing notifications:", err);
  }
}

/**
 * Mark a notification as read
 * @param {HTMLElement} notification - The notification element
 */
async function markNotificationAsRead(notification) {
  try {
    // Try to find the mark read input checkbox
    const container = notification.closest("li, div.notification-block");
    if (!container) return;

    // Try to find the mark read checkbox
    const markReadInput = container.querySelector('input[name^="mark"]');
    if (markReadInput) {
      markReadInput.checked = true;
      return;
    }

    // Try to find the mark read icon/link
    const markReadLink = container.querySelector(".mark_read.icon-mark");
    if (markReadLink) {
      markReadLink.click();
      return;
    }

    // Try to extract the mark notification URL from the href attribute
    if (notification.href && notification.href.includes("mark_notification")) {
      const markUrl = notification.href;

      // Create a hidden iframe to load the mark as read URL
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = markUrl;
      document.body.appendChild(iframe);

      // Wait for the iframe to load
      await new Promise((resolve) => {
        iframe.onload = resolve;
        setTimeout(resolve, 2000); // Timeout after 2 seconds
      });

      // Remove the iframe
      document.body.removeChild(iframe);
    }
  } catch (err) {
    error("Failed to mark notification as read:", err);
  }
}

/**
 * Add Hide toggle button
 */
function addHideToggleButton() {
  // Check if the button already exists
  if (document.querySelector(".show-hidden-posts")) {
    return;
  }

  // Create the button
  const toggleButton = document.createElement("button");
  toggleButton.className = "show-hidden-posts";
  toggleButton.innerHTML = '<i class="fa fa-eye"></i>';
  toggleButton.title = "Show/hide hidden content (Backslash key)";

  // Add event listener
  toggleButton.addEventListener("click", toggleHiddenPosts);

  // Append to body
  document.body.appendChild(toggleButton);
}

/**
 * Set up keyboard shortcuts for Hide functionality
 */
function setupKeyboardShortcuts() {
  // Remove any existing listeners
  document.removeEventListener("keydown", keydownHandler);

  // Add new listener
  document.addEventListener("keydown", keydownHandler);
}

/**
 * Keyboard event handler
 * @param {KeyboardEvent} e - The keyboard event
 */
function keydownHandler(e) {
  // Check if we're in a text input
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
    return;
  }

  // Check for backslash key to toggle hidden content
  if (e.key === "\\") {
    e.preventDefault();
    toggleHiddenPosts();
  }

  // Check for Alt key to toggle manual hide buttons
  if (e.key === "Alt") {
    e.preventDefault();
    document.body.classList.toggle("alt-key-down");
  }
}

/**
 * Toggle visibility of hidden content
 */
function toggleHiddenPosts() {
  showHiddenPosts = !showHiddenPosts;

  // Update button state
  const toggleButton = document.querySelector(".show-hidden-posts");
  if (toggleButton) {
    toggleButton.classList.toggle("active", showHiddenPosts);
    toggleButton.innerHTML = showHiddenPosts
      ? '<i class="fa fa-eye-slash"></i>'
      : '<i class="fa fa-eye"></i>';
  }

  // Update hidden elements
  const hiddenPosts = document.querySelectorAll(".hidden-post");
  const hiddenQuotes = document.querySelectorAll(".hidden-quote");
  const hiddenRows = document.querySelectorAll(".hidden-row");
  const hiddenManual = document.querySelectorAll(".hidden-post-manual");

  // Toggle visibility
  hiddenPosts.forEach((p) => p.classList.toggle("show", showHiddenPosts));
  hiddenQuotes.forEach((q) => q.classList.toggle("show", showHiddenPosts));
  hiddenRows.forEach((r) => r.classList.toggle("show", showHiddenPosts));
  hiddenManual.forEach((m) => m.classList.toggle("show", showHiddenPosts));

  // Toggle body class
  document.body.classList.toggle("show-hidden-threads", showHiddenPosts);

  // Show notification
  showToggleNotification();

  // Update pagination
  processPagination();
}

/**
 * Show a notification when toggling hidden content
 */
function showToggleNotification() {
  // Remove any existing notification
  const existingNotification = document.querySelector(
    ".hide-toggle-notification",
  );
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create a new notification
  const notification = document.createElement("div");
  notification.className = "hide-toggle-notification";
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 9999;
    transition: opacity 0.3s;
  `;
  notification.textContent = showHiddenPosts
    ? "Showing Hidden Content"
    : "Hiding Hidden Content";

  document.body.appendChild(notification);

  // Fade out and remove after a delay
  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => notification.remove(), 300);
  }, 1500);
}

/**
 * Add manual hide buttons to posts
 */
function addManualHideButtons() {
  log("Adding manual hide buttons to posts...");

  try {
    // Get manually hidden posts
    const hiddenManualPosts = gmGetValue(HIDDEN_MANUAL_POSTS_KEY, {});

    // Process all posts that don't already have a hide button
    const posts = document.querySelectorAll(".post:not(.has-hide-button)");

    posts.forEach((post) => {
      // Extract post ID
      const postId = post.id.replace("p", "");
      if (!postId) return;

      // Add the hide button
      const postButtons = post.querySelector("ul.post-buttons");
      if (postButtons) {
        const hideLi = document.createElement("li");
        hideLi.className = "post-hide-button-li";

        const hideButton = document.createElement("a");
        hideButton.className = "button button-icon-only post-hide-button";
        hideButton.innerHTML =
          '<i class="icon fa-times fa-fw" aria-hidden="true"></i>';
        hideButton.href = "#";
        hideButton.title = "Hide this post (Alt+Click)";

        hideButton.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          // Check if the post is already hidden
          if (hiddenManualPosts[postId]) {
            // Unhide it
            unhidePost(postId);
            post.classList.remove("hidden-post-manual");
            alert("Post unhidden successfully.");
          } else {
            // Hide it
            hidePost(postId);
            post.classList.add("hidden-post-manual");
            post.classList.remove(
              "hidden-post",
              "hidden-by-author",
              "hidden-by-content",
            );
          }
        });

        hideLi.appendChild(hideButton);
        postButtons.appendChild(hideLi);

        // Mark post as having hide button
        post.classList.add("has-hide-button");
      }
    });

    log(`Added manual hide buttons to ${posts.length} posts`);
  } catch (err) {
    error("Error adding manual hide buttons:", err);
  }
}
