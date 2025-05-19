import { gmGetValue, gmSetValue } from "../main.js";
import {
  getCachedPost,
  cachePost,
  cachePostsFromViewTopic,
  cachePostsFromTopicReview,
  cacheLastPosts,
  clearOldCachedPosts,
} from "../utils/postCache.js";
import { log, debug } from "../utils/logger.js";

export function init() {
  console.log("Forum Plausibility Fix initialized!");

  // Store original title and set loading message
  window.originalTitle = document.title;
  document.title = "Loading...";

  // Inject a small inline script to override the page's activeNotifications update interval.
  const overrideCode = `(${function () {
    function overrideUpdateInterval() {
      if (
        window.activeNotifications &&
        typeof window.activeNotifications === "object"
      ) {
        window.activeNotifications.updateInterval = 999999;
        console.log("activeNotifications.updateInterval set to 999999");
      } else {
        setTimeout(overrideUpdateInterval, 50);
      }
    }
    overrideUpdateInterval();
  }.toString()})();`;

  const overrideScript = document.createElement("script");
  overrideScript.textContent = overrideCode;
  (document.head || document.documentElement).appendChild(overrideScript);
  overrideScript.remove();

  // ---------------------------------------------------------------------
  // 1) DATA LOAD + INITIAL STYLES + CONFIG
  // ---------------------------------------------------------------------

  // Hard-coded settings instead of using localStorage
  const ignoredUsers = {
    367: "Vergil", // userId => username
  };
  const replacedAvatars = {}; // userId => image URL

  // Initial cleanup of old cached posts (> 1 day)
  clearOldCachedPosts(1);
  // No need to store local reference to cache as we'll use the utility functions

  const userColors = {}; // username => color
  const vergilManualPosts = {}; // postId => true

  // Whitelist for specific posts that should never be hidden
  const POST_WHITELIST = ["238105"]; // Add post IDs (as strings) here

  // Hard-coded configuration values (settings removed)
  const config = {
    authorHighlightColor: "rgba(255, 0, 0, 0.1)", // Default red for vergil-by-author
    contentHighlightColor: "rgba(255, 128, 0, 0.1)", // Default orange for vergil-by-content
    hideEntireRow: true, // Default: only hide lastpost, not entire row
    hideTopicCreations: true, // Default: hide rows with vergil username in row class,
    whitelistedThreads: [], // Array of thread names that should never be hidden
  };

  let showVergilPosts = false; // Always start hidden

  // Cleanup old cached posts upon initialization
  clearOldCachedPosts(1); // Clear entries older than 1 day

  // Inject style at document-start
  const mainStyle = document.createElement("style");
  mainStyle.textContent = `
    /* -----------------------------------------------------------------
       Processing message for containers that are not yet processed
       ----------------------------------------------------------------- */
    #recent-topics:not(.content-processed)::before,
    .topiclist.forums:not(.content-processed)::before,
    fieldset.polls:not(.content-processed)::before,
    .topiclist.topics:not(.content-processed)::before {
      content: "Processing posts...";
      display: block;
      text-align: center;
      padding: 20px;
      font-weight: bold;
      color: #777;
      pointer-events: none;
    }

    /* -----------------------------------------------------------------
       Hide unprocessed content
       ----------------------------------------------------------------- */
    /* Hide child elements in these containers until processed */
    #recent-topics:not(.content-processed) > *:not(style),
    .topiclist.forums:not(.content-processed) > *:not(style),
    .topiclist.topics:not(.content-processed) > *:not(style),
    fieldset.polls:not(.content-processed) > *:not(style) {
      visibility: hidden;
    }
    /* Hide badges until processed */
    strong.badge:not(.content-processed) {
      display: none !important;
    }
    /* Hide main post containers until processed */
    .post.bg1:not(.content-processed),
    .post.bg2:not(.content-processed),
    dd.lastpost:not(.content-processed),
    .reaction-score-list:not(.content-processed),
    .pagination:not(.content-processed) {
      visibility: hidden !important;
    }
    /* Hide list rows until they are processed */
    li.row:not(.content-processed) {
      display: none !important;
    }
    .loading_indicator:not(.content-processed) {
      display: none !important;
    }

    /* -----------------------------------------------------------------
       3) Reveal content once processing is complete
       ----------------------------------------------------------------- */
    #recent-topics.content-processed > *,
    .topiclist.forums.content-processed > *,
    fieldset.polls.content-processed > *,
    strong.badge.content-processed,
    .reaction-score-list.content-processed,
    li.row.content-processed,
    .notification-block,
    .pagination.content-processed,
    .content-processed:not(.vergil-post):not(.vergil-row):not(.vergil-quote) {
      visibility: visible !important;
    }

    /* -----------------------------------------------------------------
      4) Vergil element styling - with increased specificity
      ----------------------------------------------------------------- */
    /* Simple hiding for vergil-row */
    .vergil-row {
      display: none !important;
    }

    .vergil-row.show {
      display: block !important;
    }

    /* Background colors for highlighting with higher specificity to override site defaults */
    html body .vergil-by-author,
    html body li.row.vergil-by-author,
    html body .bg1.vergil-by-author,
    html body .bg2.vergil-by-author {
      background-color: var(--vergil-author-highlight, rgba(255, 0, 0, 0.1)) !important;
    }

    html body .vergil-by-content,
    html body li.row.vergil-by-content,
    html body .bg1.vergil-by-content,
    html body .bg2.vergil-by-content {
      background-color: var(--vergil-content-highlight, rgba(255, 128, 0, 0.1)) !important;
    }
    .topiclist.forums .vergil-row:not(.show) dd.lastpost,
    body[class*="viewforum-"] .vergil-row:not(.show) dd.lastpost,
    .topiclist.topics .vergil-row:not(.show) dd.lastpost,
    #recent-topics .vergil-row:not(.show) dd.lastpost {
      display: none !important;
    }
    .vergil-row.show::before {
      display: block;
    }
    .topiclist.forums .vergil-row.show dd.lastpost,
    body[class*="viewforum-"] .vergil-row.show dd.lastpost {
      display: block !important;
    }
    .topiclist.forums .vergil-row.show dd.lastpost,
    body[class*="viewforum-"] .vergil-row.show dd.lastpost {
      display: block !important;
    }
    .vergil-post,
    .vergil-quote {
      display: none !important;
    }
    .vergil-post.show,
    .vergil-quote.show {
      display: block !important;
      border: 3px solid;
      border-image: linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet) 1;
      border-image-slice: 1;
      border-radius: 4px;
      padding: 6px;
    }

    /* -----------------------------------------------------------------
       5) Post preview tooltip & custom quote styling
       ----------------------------------------------------------------- */
    .post-preview-tooltip {
      position: absolute;
      background: #171b24;
      padding: 15px;
      border-radius: 5px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      z-index: 9999;
      max-width: 600px;
      min-width: 400px;
      font-size: 12px;
      line-height: 1.4;
      word-break: break-word;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .post-preview-tooltip.visible {
      opacity: 1;
      pointer-events: auto;
    }
    .post-preview-tooltip .post-content {
      max-height: 500px;
      overflow-y: auto;
      padding-right: 10px;
    }
    .post-preview-tooltip pre.code {
      background: #1a1a1a;
      padding: 8px;
      border-radius: 3px;
      font-family: monospace;
      font-size: 11px;
      overflow-x: auto;
    }
    .post-preview-tooltip ul,
    .post-preview-tooltip ol {
      padding-left: 20px;
      margin: 5px 0;
    }
    .post-preview-tooltip li {
      margin: 2px 0;
    }
    .post-preview-tooltip details {
      margin: 5px 0;
      padding: 5px;
      background: #253450;
      border: 1px solid #959595;
      border-radius: 3px;
    }
    .post-preview-tooltip summary {
      cursor: pointer;
      user-select: none;
    }
    .post-preview-tooltip table {
      border-collapse: collapse;
      margin: 5px 0;
    }
    .post-preview-tooltip td {
      border: 1px solid #4a4a4a;
      padding: 3px 6px;
    }
    .custom-quote {
      background-color: #242a36;
      border-left: 3px solid #4a90e2;
      padding: 10px;
      margin: 10px 0;
      font-size: 0.9em;
      line-height: 1.4;
    }
    .custom-quote-header {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 8px;
    }
    .custom-quote-header a {
      color: #89a6cf;
      text-decoration: none;
      font-weight: 700;
    }
    .custom-quote .custom-quote {
      border-left-color: #ff9e4a;
      margin: 10px 0;
    }
    .custom-quote .custom-quote .custom-quote-header a {
      color: #ff9e4a;
    }
    .custom-quote .custom-quote .custom-quote-header a:hover {
      color: #ffa85e;
    }
    @media (max-width: 700px) {
      .show-vergil-posts span:not(.icon) {
        display: none;
      }
    }

    /* -----------------------------------------------------------------
       7) Manual Post Vergiling Button
       ----------------------------------------------------------------- */
    .post-vergil-button {
      position: absolute;
      top: 5px;
      right: 5px;
      background-color: rgba(200, 0, 0, 0.6) !important; /* Make it visible */
      color: #fff !important;
      cursor: pointer;
      z-index: 10; /* Ensure it's above post content */
    }

    /* Hide the list item containing the vergil button by default */
    li.post-vergil-button-li {
        display: none !important;
    }

    /* Show the list item when Alt key is down */
    body.alt-key-down .post li.post-vergil-button-li {
      display: inline-block !important; /* Or list-item, adjust if needed */
    }

    .vergil-post-manual {
        display: none !important;
    }
  `;
  document.documentElement.appendChild(mainStyle);

  // ---------------------------------------------------------------------
  // 2) TOOLTIP, MOBILE DETECTION & BBCode/Quote PARSING
  // ---------------------------------------------------------------------

  let tooltip = null;
  let currentHoverTimeout = null;
  let isMobileDevice = false;

  function detectMobile() {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      ) ||
      window.matchMedia("(max-width: 768px)").matches ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0
    );
  }

  function removeRemainingBrackets(text) {
    text = text.replace(/\[[^\]]*\][^\[]*\[\/[^\]]*\]/g, "");
    text = text.replace(/\[[^\]]*\]/g, "");
    return text;
  }

  function parseBBCode(text) {
    if (!text) return "";
    const patterns = {
      b: { pattern: /\[b\](.*?)\[\/b\]/gi, replacement: "<strong>$1</strong>" },
      i: { pattern: /\[i\](.*?)\[\/i\]/gi, replacement: "<em>$1</em>" },
      u: { pattern: /\[u\](.*?)\[\/u\]/gi, replacement: "<u>$1</u>" },
      s: { pattern: /\[s\](.*?)\[\/s\]/gi, replacement: " $1 " },
      smention: {
        pattern: /\[smention u=(\d+)\](.*?)\[\/smention\]/gi,
        replacement: '<em class="mention">@$2</em>',
      },
      color: {
        pattern: /\[color=([^\]]+)\](.*?)\[\/color\]/gi,
        replacement: '<span style="color: $1">$2</span>',
      },
      size: {
        pattern: /\[size=([^\]]+)\](.*?)\[\/size\]/gi,
        replacement: '<span style="font-size: $1">$2</span>',
      },
      url: {
        pattern: /\[url=([^\]]+)\](.*?)\[\/url\]/gi,
        replacement:
          '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>',
      },
      img: {
        pattern: /\[img\](.*?)\[\/img\]/gi,
        replacement:
          '<img src="$1" alt="" style="max-width: 100%; height: auto;">',
      },
      media: {
        pattern: /\[media\](.*?)\[\/media\]/gi,
        replacement:
          '<img src="https://f.rpghq.org/516uJnaFaEYB.png?n=pasted-file.png" alt="" style="max-width: 50%; height: auto;">',
      },
      list: {
        pattern: /\[list\](.*?)\[\/list\]/gis,
        replacement: "<ul>$1</ul>",
      },
      "*": {
        pattern: /\[\*\](.*?)(?=\[\*\]|\[\/list\]|$)/gi,
        replacement: "<li>$1</li>",
      },
      code: {
        pattern: /\[code\](.*?)\[\/code\]/gis,
        replacement: '<pre class="code">$1</pre>',
      },
      center: {
        pattern: /\[center\](.*?)\[\/center\]/gi,
        replacement: '<div style="text-align: center">$1</div>',
      },
      right: {
        pattern: /\[right\](.*?)\[\/right\]/gi,
        replacement: '<div style="text-align: right">$1</div>',
      },
      spoiler: {
        pattern: /\[spoiler\](.*?)\[\/spoiler\]/gis,
        replacement: "<details><summary>Spoiler</summary>$1</details>",
      },
      generic: {
        pattern: /\[([a-z]+)\](.*?)\[\/\1\]/gis,
        replacement: (match, tag, content) =>
          `<details><summary>${
            tag.charAt(0).toUpperCase() + tag.slice(1)
          }</summary>${content}</details>`,
      },
    };
    let processedText = text.replace(/\n/g, "<br>");
    for (const { pattern, replacement } of Object.values(patterns)) {
      processedText = processedText.replace(pattern, replacement);
    }
    return removeRemainingBrackets(processedText);
  }

  function parseQuotes(text) {
    if (!text) return "";
    const quoteRegex =
      /\[quote=(.*?)(?: post_id=(\d+))?(?: time=(\d+))?(?: user_id=(\d+))?\]([\s\S]*?)\[\/quote\]/gi;
    let output = "";
    let lastIndex = 0;
    let match;
    while ((match = quoteRegex.exec(text)) !== null) {
      output += text.slice(lastIndex, match.index);
      const author = match[1] || "Unknown";
      const userId = match[4] || "";
      let quoteBody = match[5] || "";
      quoteBody = quoteBody
        .replace(/\[quote=.*?\]|\[\/quote\]/g, "")
        .replace(/^\s+/, "");
      const profileUrl = `https://rpghq.org/forums/memberlist.php?mode=viewprofile&u=${userId}-${encodeURIComponent(
        author,
      )}`;
      const quoteHtml = `
        <div class="custom-quote">
          <div class="custom-quote-header">
            <a href="${profileUrl}" class="quote-author">${author}</a>
            <span class="quote-wrote">wrote:</span>
          </div>
          <div class="custom-quote-content">${quoteBody}</div>
        </div>`;
      output += quoteHtml;
      lastIndex = quoteRegex.lastIndex;
    }
    return output + text.slice(lastIndex);
  }

  function createTooltip() {
    if (tooltip) return;
    tooltip = document.createElement("div");
    tooltip.className = "post-preview-tooltip";
    document.body.appendChild(tooltip);
  }

  async function showPostPreview(event, postId) {
    if (isMobileDevice) return;
    if (!tooltip) return;
    if (currentHoverTimeout) clearTimeout(currentHoverTimeout);
    currentHoverTimeout = setTimeout(async () => {
      let content = await fetchAndCachePost(postId);
      if (!content) return;
      content = parseQuotes(content);
      content = parseBBCode(content);
      Object.entries(userColors).forEach(([username, color]) => {
        const usernameRegex = new RegExp(`<a[^>]*>${username}</a>`, "g");
        content = content.replace(
          usernameRegex,
          `<a href="#" style="color: ${color};">${username}</a>`,
        );
      });
      tooltip.innerHTML = `<div class="post-content">${content}</div>`;
      const tooltipX = Math.max(10, event.pageX - tooltip.offsetWidth - 100);
      const tooltipY = Math.max(10, event.pageY - tooltip.offsetHeight / 2);
      tooltip.style.left = `${tooltipX}px`;
      tooltip.style.top = `${tooltipY}px`;
      tooltip.classList.add("visible");
      tooltip.addEventListener("mouseenter", () => {
        if (currentHoverTimeout) clearTimeout(currentHoverTimeout);
      });
      tooltip.addEventListener("mouseleave", hidePostPreview);
    }, 200);
  }

  function hidePostPreview() {
    if (!tooltip) return;
    if (currentHoverTimeout) {
      clearTimeout(currentHoverTimeout);
      currentHoverTimeout = null;
    }
    tooltip.classList.remove("visible");
  }

  // ---------------------------------------------------------------------
  // 3) IGNORE / GHOST USERS FUNCTIONS
  // ---------------------------------------------------------------------

  function cleanUsername(username) {
    if (!username) return "";

    // First remove any HTML tags that might be in the username
    let cleaned = username.replace(/<[^>]*>/g, "");

    // Remove "Never Iggy" and other button text that might be in the username
    cleaned = cleaned.replace(
      /never iggy|unvergil user|replace avatar|vergil user/gi,
      "",
    );

    // Remove any extra whitespace
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    return cleaned;
  }

  function isUserIgnored(usernameOrId) {
    if (ignoredUsers.hasOwnProperty(usernameOrId)) return true;
    const cleanedUsername = cleanUsername(usernameOrId);

    // Check for exact matches (new format) first
    if (Object.values(ignoredUsers).includes(cleanedUsername)) return true;

    // Then check for case-insensitive matches (legacy format)
    const lower = cleanedUsername.toLowerCase();
    return Object.values(ignoredUsers).some(
      (name) => name.toLowerCase() === lower,
    );
  }

  function getUserIdFromUrl() {
    const match = window.location.href.match(/u=(\d+)/);
    return match ? match[1] : null;
  }

  function toggleUserVergil(userId, username) {
    const cleanedUsername = cleanUsername(username);
    if (ignoredUsers.hasOwnProperty(userId)) {
      delete ignoredUsers[userId];
    } else {
      ignoredUsers[userId] = cleanedUsername;
    }
  }

  // ---------------------------------------------------------------------
  // 4) POST FETCH, CACHING & CLEANUP
  // ---------------------------------------------------------------------

  function cleanupPostContent(content) {
    content = content.replace(/\[quote="([^"]+)"/g, "[quote=$1");
    content = content.replace(/^(\[quote=[^\]]+\]\s*)/, "");
    content = content.replace(/\[\/quote\]\s*$/, "");
    return removeNestedQuotes(content);
  }

  function removeNestedQuotes(str) {
    let result = "",
      i = 0,
      inQuote = false;
    while (i < str.length) {
      const openMatch = str.slice(i).match(/^(\[quote=[^\]]+\])/);
      if (openMatch) {
        if (!inQuote) {
          inQuote = true;
          result += openMatch[1];
          i += openMatch[1].length;
        } else {
          i += openMatch[1].length;
          const closeIdx = str.indexOf("[/quote]", i);
          i = closeIdx === -1 ? str.length : closeIdx + 8;
        }
        continue;
      }
      const closeMatch = str.slice(i).match(/^(\[\/quote\])/);
      if (closeMatch) {
        if (inQuote) {
          inQuote = false;
          result += closeMatch[1];
        }
        i += closeMatch[1].length;
        continue;
      }
      result += str[i];
      i++;
    }
    return result;
  }

  async function fetchAndCachePost(postId) {
    // First try getting from postCache.js
    const cachedPost = getCachedPost(postId);

    if (cachedPost) {
      // Return content based on available data
      if (cachedPost.bbcode) {
        return cachedPost.bbcode;
      } else if (cachedPost.html) {
        // If we have HTML but no BBCode, we might need to strip HTML tags
        return cleanupPostContent(cachedPost.html);
      }
    }

    // Fallback to quote functionality if not in cache
    try {
      const response = await fetch(
        `https://rpghq.org/forums/posting.php?mode=quote&p=182671&multiquote=${postId}`,
      );
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      const textarea = doc.querySelector("textarea#message");

      if (textarea) {
        let content = textarea.value;
        content = cleanupPostContent(content);

        // Store in the new cache system
        cachePost(postId, {
          bbcode: content,
          html: null, // We don't have HTML here
        });

        return content;
      }
    } catch (err) {
      console.error(`Failed to fetch post ${postId}:`, err);
    }

    return null;
  }

  async function cacheAllPosts() {
    // First try to use postCache.js functions to cache posts
    cachePostsFromViewTopic();
    cachePostsFromTopicReview();
    cacheLastPosts();

    // Then fetch any remaining posts using the quote functionality
    const lastPostLinks = document.querySelectorAll(
      'a[title="Go to last post"], a[title="View the latest post"]',
    );

    // Only fetch posts that aren't already in the cache
    const postIds = Array.from(lastPostLinks)
      .map((lnk) => lnk.href.match(/p=(\d+)/)?.[1])
      .filter((id) => {
        // Check if post exists in cache
        return id && !getCachedPost(id);
      });

    if (postIds.length === 0) {
      log("No new posts to fetch, using existing cache");
      return false;
    }

    log(`Fetching ${postIds.length} posts that aren't in cache`);

    // Fetch posts in smaller chunks to avoid overwhelming the server
    for (let i = 0; i < postIds.length; i += 3) {
      const chunk = postIds.slice(i, i + 3);
      await Promise.all(chunk.map(fetchAndCachePost));

      // Add a small delay between chunks to be nice to the server
      if (i + 3 < postIds.length) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    log("Post cache updated");
    return true;
  }

  // ---------------------------------------------------------------------
  // 5) CONTENT PROCESSING / HIDING LOGIC
  // ---------------------------------------------------------------------

  function postContentContainsVergil(content) {
    if (!content) return false;

    for (const userId in ignoredUsers) {
      const username = ignoredUsers[userId];
      if (content.toLowerCase().includes(username.toLowerCase())) {
        return true;
      }
    }

    return false;
  }

  // Check if post content contains @mentions of vergil users
  function postContentContainsMentionedVergil(post) {
    // Get the post content div
    const contentDiv = post.querySelector(".content");
    if (!contentDiv) return false;

    // Get the text content of the post
    const postText = contentDiv.textContent;
    if (!postText) return false;

    // Check for @username mentions of vergil users
    for (const userId in ignoredUsers) {
      const username = ignoredUsers[userId];
      if (postText.toLowerCase().includes(username.toLowerCase())) {
        return true;
      }
    }

    return false;
  }

  /**
   * Helper function to check if we're on a UCP page that's not notifications
   * @returns {boolean} True if on a UCP page that's not notifications
   */
  function isNonNotificationUCP() {
    return (
      window.location.href.includes("ucp") &&
      !window.location.href.includes("notifications")
    );
  }

  function isThreadWhitelisted(element) {
    // Check if this thread is in the whitelist
    const topicTitleElement = element.querySelector("a.topictitle");
    if (
      topicTitleElement &&
      config.whitelistedThreads &&
      config.whitelistedThreads.length > 0
    ) {
      const topicTitle = topicTitleElement.textContent.trim();

      // Check if thread title contains any of the whitelisted terms (partial match, case insensitive)
      return config.whitelistedThreads.some((whitelistedTitle) =>
        topicTitle.toLowerCase().includes(whitelistedTitle.toLowerCase()),
      );
    }
    return false;
  }

  function hideTopicRow(element) {
    // Check if this thread is whitelisted
    const isWhitelisted = isThreadWhitelisted(element);

    // First, check if the element or its parent row has author-name-* class
    // which indicates it's authored by a vergil user
    const rowItem = element.closest("li.row");
    const hasVergilClass =
      rowItem &&
      Array.from(rowItem.classList).some((cls) => {
        // Check for author-name-* class
        if (cls.startsWith("author-name-")) {
          const username = cls.replace("author-name-", "");
          return isUserIgnored(username) && !isNonNotificationUCP();
        }
        // Check for row-by-* class
        if (cls.startsWith("row-by-")) {
          const username = cls.replace("row-by-", "");
          return isUserIgnored(username) && !isNonNotificationUCP();
        }
        return false;
      });

    if (hasVergilClass) {
      // If it's authored by a vergil user
      if (rowItem) {
        // If hideTopicCreations is true and not whitelisted, delete the entire row
        if (config.hideTopicCreations && !isWhitelisted) {
          rowItem.remove();
          return;
        }

        // Otherwise just add classes - only hide entire row if it's not whitelisted
        if (!isWhitelisted && config.hideEntireRow) {
          rowItem.classList.add("vergil-row", "vergil-by-author");
        } else {
          // For whitelisted threads, only add the highlighting class
          rowItem.classList.add("vergil-by-author");
          // If we have a lastpost cell, hide only that instead of the entire row
          const lastpost = rowItem.querySelector("dd.lastpost");
          if (lastpost) {
            lastpost.classList.add("vergil-row");
          }
        }
        // Add asterisk to topic title
        const topicTitle = rowItem.querySelector("a.topictitle");
        if (topicTitle && !topicTitle.textContent.startsWith("*")) {
          topicTitle.textContent = "*" + topicTitle.textContent;
        }
        const lastpost = rowItem.querySelector("dd.lastpost");
        if (lastpost) {
          lastpost.classList.add("vergil-by-author");
        }
      } else {
        // If applied to a non-row element
        if (config.hideTopicCreations && !isWhitelisted) {
          // Try to find a parent row to remove
          const parentRow = element.closest("li.row");
          if (parentRow) {
            parentRow.remove();
            return;
          }
        }

        // Only add vergil-row class if this thread is not whitelisted AND hideEntireRow is true
        if (!isWhitelisted && config.hideEntireRow) {
          element.classList.add("vergil-row", "vergil-by-author");
        } else {
          // Otherwise just add the highlighting class
          element.classList.add("vergil-by-author");
        }
        // Add asterisk to topic title if it exists
        const topicTitle = element.querySelector("a.topictitle");
        if (topicTitle && !topicTitle.textContent.startsWith("*")) {
          topicTitle.textContent = "*" + topicTitle.textContent;
        }
      }
      return;
    }

    const recentTopicLi = element.closest("#recent-topics li");
    if (recentTopicLi) {
      recentTopicLi.classList.add("vergil-row", "vergil-by-author");
      return;
    }

    if (rowItem) {
      const forumLinks = rowItem.querySelectorAll(
        ".forum-links a, .responsive-hide a",
      );
      const forumNames = Array.from(forumLinks).map((link) =>
        link.textContent.trim(),
      );
      if (
        forumNames.includes("Moderation Station") ||
        forumNames.includes("Chat With Staff")
      )
        return;

      const isForumList = rowItem.closest(".topiclist.forums");
      const isViewForum = window.location.href.includes("/viewforum.php");
      const isSearch = window.location.href.includes("/search.php");

      if (isViewForum || isSearch) {
        const lastpostCell = rowItem.querySelector("dd.lastpost");
        if (lastpostCell) {
          const authorLink = lastpostCell.querySelector(
            "a.username, a.username-coloured",
          );
          if (
            authorLink &&
            isUserIgnored(authorLink.textContent.trim()) &&
            !isNonNotificationUCP()
          ) {
            // Author is vergil, check hideEntireRow setting and whitelist
            if (config.hideEntireRow && !isWhitelisted) {
              // Hide entire row if not whitelisted
              rowItem.classList.add("vergil-row");
            } else {
              // Only hide lastpost
              if (isViewForum) lastpostCell.classList.add("vergil-row");
            }
            // Always add the highlighting class
            lastpostCell.classList.add("vergil-by-author");
            return;
          } else {
            const allLinks = rowItem.querySelectorAll(
              "a.username, a.username-coloured",
            );
            const nonAuthorLinks = Array.from(allLinks).filter(
              (link) => !link.closest(".responsive-hide.left-box"),
            );
            const hasVergilUser = nonAuthorLinks.some(
              (link) =>
                isUserIgnored(link.textContent.trim()) &&
                !isNonNotificationUCP(),
            );
            if (hasVergilUser) {
              // Has vergil user in content, check hideEntireRow setting and whitelist
              if (config.hideEntireRow && !isWhitelisted) {
                // Hide entire row if not whitelisted
                rowItem.classList.add("vergil-row", "vergil-by-author");
              } else {
                // Only hide lastpost
                if (isViewForum) lastpostCell.classList.add("vergil-row");
                rowItem.classList.add("vergil-by-author");
              }
            } else {
              // No vergil author, but content might contain vergil references
              if (config.hideEntireRow && !isWhitelisted) {
                // Hide entire row
                rowItem.classList.add("vergil-by-content");
              } else {
                // Only hide lastpost
                if (isViewForum)
                  lastpostCell.classList.add("vergil-by-content");
              }
            }
          }
          return;
        }
      }

      // Check for vergil authors in the row
      const authorLinks = rowItem.querySelectorAll(
        "a.username, a.username-coloured",
      );
      const authorNames = Array.from(authorLinks).map((link) =>
        link.textContent.trim(),
      );
      const hasVergilAuthor = authorNames.some(
        (name) => isUserIgnored(name) && !isNonNotificationUCP(),
      );

      if (hasVergilAuthor) {
        if (config.hideEntireRow && !isWhitelisted) {
          // Hide entire row if not whitelisted
          rowItem.classList.add("vergil-row", "vergil-by-author");
        } else {
          // For whitelisted threads or if hideEntireRow is false, show the row but mark it
          rowItem.classList.add("vergil-by-author");

          // Only hide lastpost if available
          const lastpostCell = rowItem.querySelector("dd.lastpost");
          if (lastpostCell) {
            lastpostCell.classList.add("vergil-row");
          } else if (!isWhitelisted) {
            // Fallback to hiding the row if no lastpost cell and not whitelisted
            rowItem.classList.add("vergil-row");
          }
        }
        return;
      }

      const innerDiv = rowItem.querySelector(".list-inner");
      if (innerDiv) {
        const byText = innerDiv.textContent.toLowerCase();
        const hasVergilInBy = Object.values(ignoredUsers).some(
          (username) =>
            byText.includes(`by ${username.toLowerCase()}`) &&
            !isNonNotificationUCP(),
        );
        if (hasVergilInBy) {
          rowItem.classList.add("vergil-row", "vergil-by-author");
          return;
        }
      }

      // If we get here, it's content-based vergiling
      if (!isNonNotificationUCP()) {
        if (config.hideEntireRow && !isWhitelisted) {
          // Hide entire row if not whitelisted
          rowItem.classList.add("vergil-by-content");
        } else {
          // Only hide lastpost if available
          const lastpostCell = rowItem.querySelector("dd.lastpost");
          if (lastpostCell) {
            lastpostCell.classList.add("vergil-row");
          } else {
            // Fallback to hiding the row if no lastpost cell and not whitelisted
            if (!isWhitelisted) {
              rowItem.classList.add("vergil-row");
            }
          }
          rowItem.classList.add("vergil-by-content");
        }
      }
    } else {
      if (!isNonNotificationUCP()) {
        // This is the non-row element case (like in recent topics)
        // Only add vergil-row if not whitelisted
        if (!isWhitelisted) {
          element.classList.add("vergil-row");
        }
        element.classList.add("vergil-by-author");
      }
    }
  }

  /**
   * Process topiclist rows - hide entire row except for forum rows where we only hide lastpost
   * @param {string} rowType - The type of row to process ('forum' or 'topic')
   */
  function processTopicListRow(rowType) {
    // Determine selector based on rowType
    let selector;
    if (rowType === "forum") {
      selector = "ul.topiclist.forums > li.row";
    } else if (rowType === "topic") {
      selector = "ul.topiclist.topics > li.row";
    } else if (rowType === "recent") {
      selector = "#recent-topics > ul > li.row";
    } else {
      console.error(
        "Invalid rowType provided to processTopicListRow:",
        rowType,
      );
      return;
    }

    // Get all rows based on the selector
    const rows = document.querySelectorAll(selector);

    rows.forEach((row) => {
      // Skip if not a valid row
      if (!row) return;

      // First check for author-name-* class
      const authorNameClass = Array.from(row.classList).find((cls) =>
        cls.startsWith("author-name-"),
      );
      if (authorNameClass) {
        const username = authorNameClass.replace("author-name-", "");
        if (isUserIgnored(username) && !isNonNotificationUCP()) {
          row.classList.add("vergil-by-content");
          const lastpost = row.querySelector("dd.lastpost");
          if (lastpost) {
            lastpost.classList.add("vergil-by-content");
          }
          return;
        }
      }

      // Check for special forums we don't want to process
      const forumLinks = row.querySelectorAll(
        ".forum-links a, .responsive-hide a",
      );
      const forumNames = Array.from(forumLinks).map((link) =>
        link.textContent.trim(),
      );
      if (
        forumNames.includes("Moderation Station") ||
        forumNames.includes("Chat With Staff")
      ) {
        return;
      }

      // Get the lastpost cell
      const lastpostCell = row.querySelector("dd.lastpost");
      if (!lastpostCell) return;

      // Get the topic title (without adding asterisk to all titles)
      const topicTitle = row.querySelector("a.topictitle");

      // Get the author link in the lastpost cell
      const authorLink = lastpostCell.querySelector(
        "a.username, a.username-coloured",
      );
      if (!authorLink) return;

      const authorName = authorLink.textContent.trim();

      // For forum rows, we only hide the lastpost section
      if (rowType === "forum") {
        // Check if the author is ignored
        if (isUserIgnored(authorName) && !isNonNotificationUCP()) {
          // Author is vergil, add vergil-row class to lastpost
          lastpostCell.classList.add("vergil-row");
          // Add highlighting class to the row
          row.classList.add("vergil-by-author");
          return;
        }

        // If author isn't ignored, check the post content
        const postLink = lastpostCell.querySelector("a[href*='viewtopic.php']");
        if (postLink) {
          const postId = postLink.href.match(/p=(\d+)/)?.[1];
          if (postId && getCachedPost(postId)) {
            const cachedPost = getCachedPost(postId);
            const postContent = cachedPost.bbcode || cachedPost.html;
            if (
              postContent &&
              postContentContainsVergil(postContent) &&
              !isNonNotificationUCP()
            ) {
              row.classList.add("vergil-by-content");
            }
          }
        }
      } else {
        // For topic and recent rows, check config to see if we should hide entire row or just lastpost
        // Check if the author is ignored
        if (isUserIgnored(authorName) && !isNonNotificationUCP()) {
          // Check if this thread is whitelisted
          const isWhitelisted = isThreadWhitelisted(row);

          if (config.hideEntireRow && !isWhitelisted) {
            // Hide entire row - Author is vergil (if not whitelisted)
            row.classList.add("vergil-row");
            // Add highlighting class to the row
            row.classList.add("vergil-by-author");
          } else {
            // Only hide lastpost
            lastpostCell.classList.add("vergil-row");
            // Add highlighting class to the row
            row.classList.add("vergil-by-author");
          }
          return;
        }

        // Check for post content with vergil mentions
        const postLink = lastpostCell.querySelector("a[href*='viewtopic.php']");
        if (postLink) {
          const postId = postLink.href.match(/p=(\d+)/)?.[1];
          if (postId && getCachedPost(postId)) {
            const cachedPost = getCachedPost(postId);
            const postContent = cachedPost.bbcode || cachedPost.html;
            // Check if the lastPostCell contains the username of a vergil user
            if (
              authorLink &&
              isUserIgnored(authorLink.textContent.trim()) &&
              !isNonNotificationUCP()
            ) {
              // Check if this thread is whitelisted
              const isWhitelisted = isThreadWhitelisted(row);

              if (config.hideEntireRow && !isWhitelisted) {
                // Hide entire row if not whitelisted
                row.classList.add("vergil-row");
                // Add highlighting class to the row
                row.classList.add("vergil-by-author");
              } else {
                // Only hide lastpost
                lastpostCell.classList.add("vergil-row");
                // Add highlighting class to the row
                row.classList.add("vergil-by-author");
              }
              return; // Stop here, don't check content
            } else if (
              postContent &&
              postContentContainsVergil(postContent) &&
              !isNonNotificationUCP()
            ) {
              // Content contains vergil references
              // Check if this thread is whitelisted
              const isWhitelisted = isThreadWhitelisted(row);

              if (config.hideEntireRow && !isWhitelisted) {
                // Add highlighting class to the row
                row.classList.add("vergil-by-content");
              } else {
                // Add highlighting class to the row
                row.classList.add("vergil-by-content");
              }
            }
          }
        }
      }
    });
  }

  // Legacy functions for backward compatibility
  function processTopiclistForumsRow() {
    processTopicListRow("forum");
    // Add content-processed class to the container
    document.querySelectorAll(".topiclist.forums").forEach((element) => {
      element.classList.add("content-processed");
    });
  }

  function processRecentTopicsRows() {
    processTopicListRow("recent");
    // Add content-processed class to the container
    document.querySelectorAll("#recent-topics").forEach((element) => {
      element.classList.add("content-processed");
    });
  }

  function processTopiclistTopicsRows() {
    processTopicListRow("topic");
    // Add content-processed class to the container
    document.querySelectorAll(".topiclist.topics").forEach((element) => {
      element.classList.add("content-processed");
    });
  }

  async function processLastPost(element) {
    const linksWithIcons = element.querySelectorAll("a:has(i.icon)");
    linksWithIcons.forEach((link) => {
      const pid = link.href.match(/[#&]p=?(\d+)/)?.[1];
      if (pid) {
        link.addEventListener("mouseenter", (e) => showPostPreview(e, pid));
        link.addEventListener("mouseleave", hidePostPreview);
      }
    });

    const row = element.closest("li.row");
    const isForumList = row && row.closest(".topiclist.forums");

    // Check if the lastpost author is ignored
    const authorLink = element.querySelector("a.username, a.username-coloured");
    if (
      authorLink &&
      isUserIgnored(authorLink.textContent.trim()) &&
      !isNonNotificationUCP()
    ) {
      if (isForumList) {
        // For forum rows, only hide the lastpost
        element.classList.add("vergil-row");
        // Add highlight class to the row
        if (row) row.classList.add("vergil-by-author");
      } else if (row) {
        // Check if this thread is whitelisted
        const isWhitelisted = isThreadWhitelisted(row);

        // For other rows, apply to the row or lastpost based on config
        if (config.hideEntireRow && !isWhitelisted) {
          // Hide entire row if not whitelisted
          row.classList.add("vergil-row", "vergil-by-author");
        } else {
          // Only hide lastpost
          element.classList.add("vergil-row");
          // Add highlight class to the row
          row.classList.add("vergil-by-author");
        }
      }
      element.classList.add("content-processed");
      return;
    }

    const spanEl = element.querySelector("span");
    if (!spanEl) {
      element.classList.add("content-processed");
      return;
    }

    const byTextNode = Array.from(spanEl.childNodes).find(
      (node) =>
        node.nodeType === Node.TEXT_NODE &&
        node.textContent.trim().toLowerCase() === "by",
    );

    if (!byTextNode) {
      element.classList.add("content-processed");
      return;
    }

    const nextEl = byTextNode.nextElementSibling;
    if (
      nextEl &&
      (nextEl.classList.contains("mas-wrap") ||
        nextEl.classList.contains("username") ||
        nextEl.classList.contains("username-coloured"))
    ) {
      const userEl =
        nextEl.classList.contains("username") ||
        nextEl.classList.contains("username-coloured")
          ? nextEl
          : nextEl.querySelector(".username, .username-coloured");

      const link = element.querySelector(
        'a[href*="viewtopic.php"][href*="#p"]',
      );

      if (link) {
        const pid = link.href.match(/[#&]p=?(\d+)/)?.[1];
        if (pid) {
          if (userEl && isUserIgnored(userEl.textContent.trim())) {
            if (isForumList) {
              // For forum rows, only hide the lastpost
              element.classList.add("vergil-row");
              // Add highlight class to the row
              if (row) row.classList.add("vergil-by-author");
            } else if (row) {
              // Check if this thread is whitelisted
              const isWhitelisted = isThreadWhitelisted(row);

              // For other rows, apply based on config
              if (config.hideEntireRow && !isWhitelisted) {
                // Hide entire row if not whitelisted
                row.classList.add("vergil-row", "vergil-by-author");
              } else {
                // Only hide lastpost
                element.classList.add("vergil-row");
                // Add highlight class to the row
                row.classList.add("vergil-by-author");
              }
            }
          } else {
            try {
              const content = await fetchAndCachePost(pid);
              if (!content || postContentContainsVergil(content)) {
                if (isForumList) {
                  if (row) row.classList.add("vergil-by-content");
                } else if (row) {
                  // Check if this thread is whitelisted
                  const isWhitelisted = isThreadWhitelisted(row);

                  // For other rows, apply based on config
                  if (config.hideEntireRow && !isWhitelisted) {
                    // Hide entire row if not whitelisted
                    row.classList.add("vergil-by-content");
                  } else {
                    // Add highlight class to the row
                    row.classList.add("vergil-by-content");
                  }
                }
              }
            } catch (err) {
              if (isForumList) {
                // For forum rows, only hide the lastpost
                // Add highlight class to the row
                if (row) row.classList.add("vergil-by-content");
              } else if (row) {
                // For other rows, hide based on config
                if (config.hideEntireRow) {
                  // Hide entire row
                  row.classList.add("vergil-by-content");
                } else {
                  // Only hide lastpost
                  // Add highlight class to the row
                  row.classList.add("vergil-by-content");
                }
              }
            }
          }
        }
      }
    }

    element.classList.add("content-processed");
  }

  function processReactionList(list) {
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
        if (uid && isUserIgnored(uid)) {
          // Start from the link and traverse upward to find the complete user entry container
          // Look for a more specific parent that contains the entire user entry with avatar
          let userRow = link;
          let parent = link.parentElement;

          // Go up several levels to ensure we get the complete structure
          // This traverses up to find the outermost flex container that has the avatar and username
          while (parent && parent !== popup) {
            userRow = parent;
            if (
              parent.style &&
              parent.style.display === "flex" &&
              parent.querySelector("img[alt]") &&
              parent.textContent.trim().includes(link.textContent.trim())
            ) {
              break; // Found the complete container with both avatar and username
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
  }

  async function processCPListNotification(item) {
    const titleEl = item.querySelector(".notifications_title");
    if (!titleEl) {
      item.classList.add("content-processed");
      return;
    }

    const usernameEls = titleEl.querySelectorAll(
      ".username, .username-coloured",
    );
    const usernames = Array.from(usernameEls).map((el) =>
      el.textContent.trim(),
    );

    if (usernames.length === 0) {
      item.classList.add("content-processed");
      return;
    }

    // For notifications that start with "Quoted by" or "You were mentioned by", the first username is the key user
    const titleText = titleEl.textContent.trim();
    const isQuoteOrMention =
      titleText.startsWith("Quoted") || titleText.includes("mentioned by");
    const firstUsername = usernames[0];

    if (isQuoteOrMention && isUserIgnored(firstUsername)) {
      const row = item.closest("li.row");
      if (row) {
        row.classList.add("vergil-row", "vergil-by-author");
        await markNotificationAsRead(item);
      }
      item.classList.add("content-processed");
      return;
    }

    const nonIgnored = usernames.filter((u) => !isUserIgnored(u));
    const vergil = usernames.filter((u) => isUserIgnored(u));
    const hasIgnored = vergil.length > 0;

    if (!hasIgnored) {
      item.classList.add("content-processed");
      return;
    }

    if (nonIgnored.length === 0) {
      const row = item.closest("li.row");
      if (row) {
        row.classList.add("vergil-row", "vergil-by-author");
        await markNotificationAsRead(item);
      }
      item.classList.add("content-processed");
      return;
    }

    // Create the non-vergil notification first
    // Find the last username element to get text after it
    const lastIgnoredEl = usernameEls[usernameEls.length - 1];
    const nodesAfter = [];
    let nxt = lastIgnoredEl?.nextSibling;
    while (nxt) {
      nodesAfter.push(nxt.cloneNode(true));
      nxt = nxt.nextSibling;
    }

    // Clear the title element
    titleEl.textContent = "";

    // Add non-ignored usernames with appropriate separators
    nonIgnored.forEach((username, i) => {
      const matchEl = Array.from(usernameEls).find(
        (el) => el.textContent.trim().toLowerCase() === username.toLowerCase(),
      );
      if (matchEl) {
        titleEl.appendChild(matchEl.cloneNode(true));
      } else {
        titleEl.appendChild(document.createTextNode(username));
      }

      if (i < nonIgnored.length - 2) {
        titleEl.appendChild(document.createTextNode(", "));
      } else if (i === nonIgnored.length - 2) {
        titleEl.appendChild(document.createTextNode(" and "));
      }
    });

    // Add "have reacted" or other trailing text
    nodesAfter.forEach((node) => titleEl.appendChild(node));

    // Now create vergil notifications for each vergil user
    const row = item.closest("li.row");
    if (row) {
      vergil.forEach((vergilUsername) => {
        const vergilRow = row.cloneNode(true);
        vergilRow.classList.add("vergil-row", "vergil-by-author");

        // Update the notification text for this vergil user
        const vergilTitleEl = vergilRow.querySelector(".notifications_title");
        if (vergilTitleEl) {
          vergilTitleEl.textContent = "";
          const matchEl = Array.from(usernameEls).find(
            (el) =>
              el.textContent.trim().toLowerCase() ===
              vergilUsername.toLowerCase(),
          );
          if (matchEl) {
            vergilTitleEl.appendChild(matchEl.cloneNode(true));
          } else {
            vergilTitleEl.appendChild(document.createTextNode(vergilUsername));
          }

          // Add the trailing text
          nodesAfter.forEach((node) =>
            vergilTitleEl.appendChild(node.cloneNode(true)),
          );
        }

        // Insert the vergil row after the original
        row.parentNode.insertBefore(vergilRow, row.nextSibling);
      });
    }

    item.classList.add("content-processed");
  }

  async function processNotification(item) {
    const usernameEls = item.querySelectorAll(".username, .username-coloured");
    const usernames = Array.from(usernameEls).map((el) =>
      el.textContent.trim(),
    );
    if (usernames.length === 0) {
      item.classList.add("content-processed");
      return;
    }
    const firstUsername = usernames[0];
    if (isUserIgnored(firstUsername)) {
      const li = item.closest("li");
      if (li) {
        await markNotificationAsRead(item);
        li.style.display = "none";
      }
      item.classList.add("content-processed");
      return;
    }
    const nonIgnored = usernames.filter((u) => !isUserIgnored(u));
    const hasIgnored = nonIgnored.length < usernames.length;
    if (!hasIgnored) {
      item.classList.add("content-processed");
      return;
    }
    const titleEl = item.querySelector(".notification-title");
    if (!titleEl) {
      item.classList.add("content-processed");
      return;
    }
    if (nonIgnored.length === 0) {
      const li = item.closest("li");
      if (li) {
        await markNotificationAsRead(item);
        li.style.display = "none";
      }
      item.classList.add("content-processed");
      return;
    }
    const lastIgnoredEl = usernameEls[usernameEls.length - 1];
    const nodesAfter = [];
    let nxt = lastIgnoredEl?.nextSibling;
    while (nxt) {
      nodesAfter.push(nxt.cloneNode(true));
      nxt = nxt.nextSibling;
    }
    titleEl.textContent = "";
    nonIgnored.forEach((usr, i) => {
      const matchEl = Array.from(usernameEls).find(
        (el) => el.textContent.trim().toLowerCase() === usr.toLowerCase(),
      );
      if (matchEl) {
        titleEl.appendChild(matchEl.cloneNode(true));
      } else {
        titleEl.appendChild(document.createTextNode(usr));
      }
      if (i < nonIgnored.length - 2) {
        titleEl.appendChild(document.createTextNode(", "));
      } else if (i === nonIgnored.length - 2) {
        titleEl.appendChild(document.createTextNode(" and "));
      }
    });
    nodesAfter.forEach((node) => titleEl.appendChild(node));
    item.classList.add("content-processed");
  }

  function processBlockquotesInPost(post) {
    const topLevelBlockquotes = post.querySelectorAll(".content > blockquote");
    if (topLevelBlockquotes.length === 1) {
      const anchor = topLevelBlockquotes[0].querySelector("cite a");
      if (
        anchor &&
        isUserIgnored(anchor.textContent.trim()) &&
        !isNonNotificationUCP()
      ) {
        post.dataset.hideForSingleIgnoredQuote = "true";
        return;
      }
    }

    const allBlockquotes = post.querySelectorAll(".content blockquote");
    allBlockquotes.forEach((bq) => {
      const anchor = bq.querySelector("cite a");
      if (!anchor) return;
      if (isUserIgnored(anchor.textContent.trim()) && !isNonNotificationUCP()) {
        bq.classList.add("vergil-quote");
      }
    });
  }

  function processPost(post) {
    const postId = post.id.replace("p", "");

    // Check if post is manually vergil
    if (vergilManualPosts[postId]) {
      post.classList.add("vergil-post-manual");
      post.classList.add("content-processed");
      return; // Don't process further if manually hidden
    }

    // Check if the post is whitelisted
    if (POST_WHITELIST.includes(postId)) {
      post.classList.add("content-processed"); // Ensure it's marked processed
      return; // Don't hide whitelisted posts
    }

    processBlockquotesInPost(post);
    const usernameEl = post.querySelector(".username, .username-coloured");
    let hideIt = false;

    if (post.dataset.hideForSingleIgnoredQuote === "true") {
      // Only hide if not in UCP or in notifications
      if (!isNonNotificationUCP()) {
        hideIt = true;
      }
      delete post.dataset.hideForSingleIgnoredQuote;
    }

    if (
      usernameEl &&
      isUserIgnored(usernameEl.textContent.trim()) &&
      !isNonNotificationUCP()
    ) {
      hideIt = true;
    }

    // Check for @mentions of vergil users
    if (
      !hideIt &&
      postContentContainsMentionedVergil(post) &&
      !isNonNotificationUCP()
    ) {
      hideIt = true;
      // Use the existing vergil-by-content class
      post.classList.add("vergil-by-content");
    }

    if (hideIt) {
      post.classList.add("vergil-post");
    }

    // Add the manual vergil button
    const vergilLi = document.createElement("li");
    vergilLi.className = "post-vergil-button-li"; // Add class to the list item
    const vergilButton = document.createElement("a");
    vergilButton.className = "button button-icon-only post-vergil-button"; // Added relevant classes
    vergilButton.innerHTML =
      '<i class="icon fa-times fa-fw" aria-hidden="true"></i>'; // Use FontAwesome icon
    vergilButton.href = "#"; // Make it behave like a link
    vergilButton.title = "Vergil this post (Alt+Click)";
    vergilButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Mark as manually vergil
      vergilManualPosts[postId] = true;

      // Hide the post immediately
      post.classList.add("vergil-post-manual");
      post.classList.remove(
        "vergil-post",
        "vergil-by-author",
        "vergil-by-content",
      ); // Ensure other vergiling is removed

      console.log(`Manually vergil post: ${postId}`);
    });

    // Append to the post buttons list
    const postButtonsList = post.querySelector("ul.post-buttons");
    if (postButtonsList) {
      vergilLi.appendChild(vergilButton);
      postButtonsList.appendChild(vergilLi);
    }

    post.classList.add("content-processed");
  }

  function processTopicPosters() {
    // Use ignoredUsers directly
    const rows = document.querySelectorAll(".row");

    rows.forEach((row) => {
      const leftBox = row.querySelector(".responsive-hide");
      if (!leftBox) return;
      const masWrapElements = leftBox.querySelectorAll(".mas-wrap");

      masWrapElements.forEach((element) => {
        // Check if the element contains any ignored username
        const elementText = element.textContent || "";
        let containsVergilUser = false;

        // Check for any ignored username in the text
        Object.values(ignoredUsers).forEach((username) => {
          if (elementText.toLowerCase().includes(username.toLowerCase())) {
            containsVergilUser = true;
          }
        });

        if (containsVergilUser) {
          if (config.hideTopicCreations) {
            // If hideTopicCreations is true, remove the entire row
            row.remove();
          } else {
            // Otherwise, try to remove "by [author]" text
            const byTextRegex = /\sby\s+[^\s]+/;
            if (byTextRegex.test(elementText)) {
              // Find and remove the text node or element containing "by [author]"
              const textNodes = Array.from(element.childNodes).filter(
                (node) =>
                  node.nodeType === Node.TEXT_NODE &&
                  byTextRegex.test(node.textContent),
              );

              if (textNodes.length > 0) {
                // If found in a text node, replace it
                textNodes.forEach((node) => {
                  node.textContent = node.textContent.replace(byTextRegex, "");
                });
              } else {
                // If it's in a child element, try to find and remove that
                const childElements = element.querySelectorAll("*");
                childElements.forEach((child) => {
                  if (byTextRegex.test(child.textContent)) {
                    child.remove();
                  }
                });
              }
            }
          }
        }
      });
    });
  }

  function processPoll(poll) {
    poll.classList.remove("content-processed");
    let totalVotes = 0;
    const options = poll.querySelectorAll("dl[data-poll-option-id]");
    options.forEach((option) => {
      const resultBar = option.querySelector(".resultbar");
      const pollBar = resultBar?.querySelector('[class^="pollbar"]');
      const voteCount = parseInt(pollBar?.textContent || "0", 10);
      totalVotes += voteCount;
    });
    options.forEach((option) => {
      const voterBox = option.nextElementSibling;
      if (!voterBox || !voterBox.classList.contains("poll_voters_box")) return;
      const votersList = voterBox.querySelector(".poll_voters");
      if (!votersList) return;
      const resultBar = option.querySelector(".resultbar");
      const pollBar = resultBar?.querySelector('[class^="pollbar"]');
      const voteCount = parseInt(pollBar?.textContent || "0", 10);
      let newCount = voteCount;
      const voterSpans = Array.from(votersList.childNodes);
      const toRemove = new Set();
      voterSpans.forEach((node, i) => {
        if (node.nodeType === Node.ELEMENT_NODE && node.matches("span[name]")) {
          const userLink = node.querySelector("a");
          if (!userLink) return;
          const userId = userLink.href.match(/[?&]u=(\d+)/)?.[1];
          const username = userLink.textContent.trim();
          if ((userId && isUserIgnored(userId)) || isUserIgnored(username)) {
            toRemove.add(node);
            const prev = voterSpans[i - 1];
            if (prev && prev.nodeType === Node.TEXT_NODE) {
              toRemove.add(prev);
            }
            newCount--;
          }
        }
      });
      toRemove.forEach((node) => node.remove());
      const firstNode = votersList.firstChild;
      if (firstNode && firstNode.nodeType === Node.TEXT_NODE) {
        firstNode.remove();
      }
      if (newCount !== voteCount && pollBar) {
        pollBar.textContent = String(newCount);
        const maxVotes = Math.max(
          ...Array.from(options).map((opt) => {
            const bar = opt.querySelector('[class^="pollbar"]');
            return parseInt(bar?.textContent || "0", 10);
          }),
        );
        const widthPercent = maxVotes > 0 ? (newCount / maxVotes) * 100 : 0;
        pollBar.style.width = `${widthPercent}%`;
      }
      if (!votersList.querySelector("span[name]")) {
        votersList.innerHTML = '<span name="none">None</span>';
      }
    });
    const finalVoteCounts = Array.from(options).map((opt) => {
      const bar = opt.querySelector('[class^="pollbar"]');
      return parseInt(bar?.textContent || "0", 10);
    });
    const total = finalVoteCounts.reduce((a, b) => a + b, 0);
    const exactPercentages = finalVoteCounts.map(
      (count) => (count / total) * 100,
    );
    const roundedDown = exactPercentages.map((p) => Math.floor(p));
    const remainder = 100 - roundedDown.reduce((a, b) => a + b, 0);
    const fractionalParts = exactPercentages
      .map((p, i) => ({ index: i, frac: p - Math.floor(p) }))
      .sort((a, b) => b.frac - a.frac);
    const finalPercentages = [...roundedDown];
    for (let i = 0; i < remainder; i++) {
      if (fractionalParts[i]) {
        finalPercentages[fractionalParts[i].index]++;
      }
    }
    options.forEach((option, index) => {
      const percentEl = option.querySelector(".poll_option_percent");
      if (percentEl) {
        const count = finalVoteCounts[index];
        percentEl.textContent =
          count === 0 ? "No votes" : `${finalPercentages[index]}%`;
      }
    });
    const totalVotesEl = poll.querySelector(".poll_total_vote_cnt");
    if (totalVotesEl) {
      totalVotesEl.textContent = String(total);
    }
    poll.classList.add("content-processed");
  }

  function setupPollRefreshDetection() {
    document.addEventListener("submit", (e) => {
      const form = e.target;
      const poll = form.closest("fieldset.polls");
      if (poll) poll.classList.remove("content-processed");
    });
    document.addEventListener("click", (e) => {
      if (
        e.target.matches(
          'input[type="submit"][name="update"][value="Submit vote"]',
        )
      ) {
        const poll = e.target.closest("fieldset.polls");
        if (poll) poll.classList.remove("content-processed");
      }
    });
    const pollObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style"
        ) {
          const node = mutation.target;
          if (
            node.classList.contains("vote-submitted") &&
            node.style.display === "block"
          ) {
            const pollSection = node.closest("fieldset.polls");
            if (pollSection) {
              pollSection.style.visibility = "hidden";
            }
            window.location.reload();
            return;
          }
        }
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const polls = node.matches("fieldset.polls")
              ? [node]
              : node.querySelectorAll("fieldset.polls");
            polls.forEach((poll) => {
              if (!poll.classList.contains("content-processed")) {
                processPoll(poll);
              }
            });
          }
        });
      });
    });
    pollObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style"],
    });
  }

  function processReactionImages() {
    // Find all reaction images with reaction-username attribute
    const reactionImages = document.querySelectorAll("img[reaction-username]");

    reactionImages.forEach((img) => {
      const username = img.getAttribute("reaction-username");
      if (username) {
        // Convert username to lowercase for comparison
        const lowercaseUsername = username.toLowerCase();

        // Check if this user is ignored
        if (isUserIgnored(lowercaseUsername)) {
          // Remove the image
          img.remove();
        }
      }
    });
  }

  async function processIgnoredContentOnce() {
    await Promise.all(
      Array.from(
        document.querySelectorAll(
          ".notification-block:not(.content-processed)",
        ),
      ).map(processNotification),
    );

    // Process reaction notification blocks
    await Promise.all(
      Array.from(
        document.querySelectorAll(
          "a.notification-block[data-real-url]:not(.content-processed)",
        ),
      ).map(processReactionNotificationBlock),
    );

    await cacheAllPosts();

    // Process the different types of topiclist rows
    processTopiclistForumsRow();
    processRecentTopicsRows();
    processTopiclistTopicsRows();

    // Mark poll containers as processed after processing them
    document.querySelectorAll("fieldset.polls").forEach((poll) => {
      processPoll(poll);
    });

    setupPollRefreshDetection();

    processTopicPosters();

    // Remove elements with vergil author names
    removeVergilAuthorElements();

    // Check for topic list rows: Process ALL responsive-hide left-box elements
    const leftBoxes = document.querySelectorAll(".left-box");
    leftBoxes.forEach((leftBox) => {
      const usernameLink = leftBox.querySelector(
        ".username, .username-coloured",
      );
      if (
        usernameLink &&
        isUserIgnored(usernameLink.textContent.trim()) &&
        !isNonNotificationUCP()
      ) {
        // If hideTopicCreations is true, delete the entire row
        if (config.hideTopicCreations) {
          const row = leftBox.closest("li.row");
          if (row) {
            row.remove();
            return;
          }
        }

        // Remove only the 'by' text, the '»' character, and username link, not the entire box
        Array.from(leftBox.childNodes).forEach((node) => {
          // Remove text nodes containing 'by' or '»'
          if (
            node.nodeType === Node.TEXT_NODE &&
            (node.textContent.trim().toLowerCase().includes("by") ||
              node.textContent.includes("»"))
          ) {
            node.remove();
          }
        });
        // Remove the username link
        if (usernameLink) {
          usernameLink.remove();
        }
      }
    });

    function removeVergilAuthorElements() {
      // Get all unique vergil usernames
      const vergilUsernames = new Set(Object.values(ignoredUsers));

      // Process each vergil username
      vergilUsernames.forEach((username) => {
        // Find and remove all elements with this class
        const selector = `.author-name-${username}`;
        document.querySelectorAll(selector).forEach((element) => {
          element.remove();
        });
      });
    }

    document
      .querySelectorAll(".post:not(.content-processed)")
      .forEach(processPost);

    document
      .querySelectorAll(".reaction-score-list")
      .forEach(processReactionList);

    // Process reaction images from ignored users
    processReactionImages();

    const reactionObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const lists = node.classList?.contains("reaction-score-list")
              ? [node]
              : node.querySelectorAll(".reaction-score-list");
            lists.forEach((list) => processReactionList(list));

            // Also check for reaction images in added nodes
            if (node.querySelectorAll) {
              const images = node.querySelectorAll("img[reaction-username]");
              if (images.length > 0) {
                processReactionImages();
              }
            }
          }
        });
      });
    });

    reactionObserver.observe(document.body, { childList: true, subtree: true });
    await new Promise((resolve) => setTimeout(resolve, 150));

    document
      .querySelectorAll("strong.badge:not(.content-processed)")
      .forEach((badge) => badge.classList.add("content-processed"));

    const lastPosts = document.querySelectorAll(
      "dd.lastpost:not(.content-processed), #recent-topics li dd.lastpost:not(.content-processed)",
    );

    await Promise.all(Array.from(lastPosts).map(processLastPost));

    document
      .querySelectorAll("li.row:not(.content-processed)")
      .forEach((row) => {
        const lp = row.querySelector("dd.lastpost");
        if (lp && !lp.classList.contains("content-processed")) return;
        row.classList.add("content-processed");
      });
  }

  // ---------------------------------------------------------------------
  // 6) AVATAR REPLACEMENT
  // ---------------------------------------------------------------------

  function replaceUserAvatars() {
    document.querySelectorAll("img").forEach((img) => {
      const match = img.src.match(/avatar=(\d+)/);
      if (match) {
        const uid = match[1];
        if (replacedAvatars.hasOwnProperty(uid)) {
          img.src = replacedAvatars[uid];
        }
      }
    });
  }

  function startPeriodicAvatarCheck() {
    replaceUserAvatars();
    setInterval(replaceUserAvatars, 1500);
  }

  function validateAndReplaceAvatar(userId, url) {
    const testImg = new Image();
    testImg.onload = function () {
      if (this.width <= 128 && this.height <= 128) {
        replacedAvatars[userId] = url;
        localStorage.setItem(
          "replacedAvatars",
          JSON.stringify(replacedAvatars),
        );
        alert("Avatar replaced!");
        replaceUserAvatars();
      } else {
        alert("Image must be 128x128 or smaller.");
      }
    };
    testImg.onerror = function () {
      alert("Could not load image from the provided URL.");
    };
    testImg.src = url;
  }

  // ---------------------------------------------------------------------
  // 8) SHOW/HIDE GHOSTED POSTS TOGGLE VIA KEYBOARD
  // ---------------------------------------------------------------------

  function showToggleNotification() {
    const notification = document.createElement("div");
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
    notification.textContent = showVergilPosts
      ? "Showing Vergil Posts"
      : "Hiding Vergil Posts";
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => notification.remove(), 300);
    }, 1500);
  }

  function toggleVergilPosts() {
    const vergilPosts = document.querySelectorAll(".post.vergil-post");
    const vergilQuotes = document.querySelectorAll(".vergil-quote");
    const vergilRows = document.querySelectorAll(".vergil-row");

    const hasVergilContent =
      vergilPosts.length > 0 ||
      vergilQuotes.length > 0 ||
      vergilRows.length > 0;

    if (!hasVergilContent) {
      console.log("No Vergil content found on this page");
      const notification = document.createElement("div");
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
      notification.textContent = "No Vergil content found on this page";
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => notification.remove(), 300);
      }, 1500);
      return;
    }

    showVergilPosts = !showVergilPosts;

    vergilPosts.forEach((p) => p.classList.toggle("show", showVergilPosts));
    vergilQuotes.forEach((q) => q.classList.toggle("show", showVergilPosts));

    // For vergil rows (which are now only lastpost cells), toggle visibility
    vergilRows.forEach((r) => {
      r.classList.toggle("show", showVergilPosts);
    });

    document.body.classList.toggle("show-hidden-threads", showVergilPosts);

    showToggleNotification();
    updatePaginationPostCount();
  }

  // Add keyboard shortcut listener
  document.addEventListener("keydown", (e) => {
    // Check if we're in a text input
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      return;
    }

    // Check for backslash key
    if (e.key === "\\") {
      e.preventDefault();
      toggleVergilPosts();
    }
  });

  // ---------------------------------------------------------------------
  // 9) MISC HELPER FUNCTIONS
  // ---------------------------------------------------------------------

  function moveExternalLinkIcon() {
    const lastPostSpans = document.querySelectorAll(
      "dd.lastpost span:not(.icon-moved)",
    );
    lastPostSpans.forEach((sp) => {
      const externalLink = sp.querySelector('a[title="Go to last post"]');
      const timeEl = sp.querySelector("time");
      if (externalLink && timeEl) {
        externalLink.remove();
        timeEl.insertAdjacentElement("afterend", externalLink);
        externalLink.style.marginLeft = "5px";
        sp.classList.add("icon-moved");
      }
    });
  }

  function cleanVergilQuotesInTextarea() {
    const textarea = document.querySelector("textarea#message");
    if (!textarea || !textarea.value.includes("[quote")) return;
    let text = textarea.value;
    for (const userId in ignoredUsers) {
      const rx = new RegExp(
        `\\[quote=[^\\]]*user_id=${userId}[^\\]]*\\][\\s\\S]*?\\[\\/quote\\]`,
        "g",
      );
      text = text.replace(rx, "");
    }
    if (text !== textarea.value) {
      textarea.value = text;
    }
  }

  function processOnlineList() {
    const onlineList = document.querySelector(".stat-block.online-list p");
    if (!onlineList) return;
    const userLinks = Array.from(
      onlineList.querySelectorAll("a.username, a.username-coloured"),
    );
    const nonVergilUsers = userLinks.filter((link) => {
      const userId = link.href.match(/u=(\d+)/)?.[1];
      const username = link.textContent.trim();
      return !(userId && isUserIgnored(userId)) && !isUserIgnored(username);
    });
    if (nonVergilUsers.length === 0) {
      const guestsMatch = onlineList.textContent.match(/and (\d+) guests/);
      const guestCount = guestsMatch ? guestsMatch[1] : "0";
      onlineList.innerHTML = `Users browsing this forum: ${guestCount} guests`;
      return;
    }
    let newText = "Users browsing this forum: ";
    nonVergilUsers.forEach((link, index) => {
      if (index > 0) newText += ", ";
      newText += link.outerHTML;
    });
    const guestsMatch = onlineList.textContent.match(/and (\d+) guests/);
    if (guestsMatch) {
      newText += `, and ${guestsMatch[1]} guests`;
    }
    onlineList.innerHTML = newText;
  }

  // ---------------------------------------------------------------------
  // 11) RT PAGE INJECTION
  // ---------------------------------------------------------------------

  async function injectRTContent() {
    if (!window.location.href.includes("search.php?search_id=newposts")) return;
    try {
      const pagebody = document.querySelector("#page-body");
      const innerDiv = pagebody.querySelector(".inner:not(.column1)");
      if (!innerDiv) return;

      // Immediately replace with loading state
      innerDiv.innerHTML = `
        <ul class="topiclist">
            <li class="header">
                <dl class="row-item">
                    <dt><div class="list-inner">Topics</div></dt>
                    <dd class="posts">Replies</dd>
                    <dd class="views">Views</dd>
                    <dd class="lastpost content-processed"><span>Last post</span></dd>
                </dl>
            </li>
        </ul>
        <ul class="topiclist topics collapsible">
        </ul>
      `;

      const originalAvatars = new Map();
      const response = await fetch(
        "https://rpghq.org/forums/rt?recent_topics_start=0",
      );
      const text = await response.text();
      const parser = new DOMParser();
      const rtDoc = parser.parseFromString(text, "text/html");
      const rtInner = rtDoc.querySelector(".inner:not(.column1)");
      if (!rtInner) throw new Error("Could not find inner div in RT page");

      const targetList = innerDiv.querySelector("ul.topiclist.topics");
      const rtListItems = rtInner.querySelectorAll("li.row");
      console.log(`Found ${rtListItems.length} topics on first RT page`);
      rtListItems.forEach((row) => {
        targetList.appendChild(row.cloneNode(true));
      });

      if (rtListItems.length === 35) {
        console.log("Found 35 items, fetching second page...");
        const secondResponse = await fetch(
          "https://rpghq.org/forums/rt?recent_topics_start=35",
        );
        const secondText = await secondResponse.text();
        const secondDoc = parser.parseFromString(secondText, "text/html");
        const secondInner = secondDoc.querySelector(".inner:not(.column1)");
        if (secondInner) {
          const secondPageItems = secondInner.querySelectorAll("li.row");
          console.log(
            `Found ${secondPageItems.length} topics on second RT page`,
          );
          secondPageItems.forEach((row) => {
            targetList.appendChild(row.cloneNode(true));
          });
        }
      }

      innerDiv.querySelectorAll('a[href^="./"]').forEach((link) => {
        link.href = link.href.replace("./", "https://rpghq.org/forums/");
      });

      innerDiv.querySelectorAll("li.row").forEach((row) => {
        const responsiveHide = row.querySelector(".responsive-hide");
        if (responsiveHide) {
          const otherLink = responsiveHide.querySelector('a[href$="f=11"]');
          if (
            otherLink &&
            otherLink.nextSibling &&
            otherLink.nextSibling.textContent.includes("»")
          ) {
            otherLink.nextSibling.remove();
            otherLink.remove();
          }
        }

        const isUnread =
          row.querySelector(".row-item").classList.contains("topic_unread") ||
          row
            .querySelector(".row-item")
            .classList.contains("topic_unread_hot") ||
          row
            .querySelector(".row-item")
            .classList.contains("topic_unread_hot_mine") ||
          row.querySelector(".row-item").classList.contains("sticky_unread") ||
          row
            .querySelector(".row-item")
            .classList.contains("sticky_unread_mine") ||
          row.querySelector(".row-item").classList.contains("announce_unread");

        const topicTitle = row.querySelector("a.topictitle");
        if (topicTitle) {
          if (isUnread) {
            topicTitle.href = topicTitle.href + "&view=unread#unread";
            const externalIcon = row.querySelector(".icon-lightgray");
            if (externalIcon) {
              externalIcon.classList.remove("icon-lightgray");
              externalIcon.classList.add("icon-red");
            }
          } else {
            const lastPostLink = row.querySelector(
              'a[title="Go to last post"]',
            );
            if (lastPostLink) {
              const postParams = lastPostLink.href.match(/[?&]p=\d+#p\d+/)?.[0];
              if (postParams) {
                topicTitle.href = topicTitle.href + postParams;
              }
            }
          }
        }
      });
    } catch (error) {
      console.error("Failed to inject RT content:", error);
    }
  }

  function updatePaginationPostCount() {
    const paginationElements = document.querySelectorAll(".pagination");
    if (!paginationElements.length) return;

    paginationElements.forEach((pagination) => {
      const paginationText = pagination.textContent.trim();
      if (!paginationText.includes("Page 1 of 1")) {
        pagination.classList.add("content-processed");
        return;
      }

      const visiblePosts = showVergilPosts
        ? document.querySelectorAll(".post").length
        : document.querySelectorAll(".post:not(.vergil-post)").length;

      const visibleMatches = showVergilPosts
        ? document.querySelectorAll("li.row").length
        : document.querySelectorAll("li.row:not(.vergil-row)").length;

      const originalText = pagination.innerHTML;
      let newText = originalText;

      // Update post count if this is a post page
      const postCountMatch = paginationText.match(/(\d+) posts/);
      if (postCountMatch) {
        newText = newText.replace(/\d+ posts/, `${visiblePosts} posts`);
      }

      // Update match count if this is a search page
      const matchCountMatch = paginationText.match(
        /Search found (\d+) matches/,
      );
      if (matchCountMatch) {
        newText = newText.replace(
          /Search found \d+ matches/,
          `Search found ${visibleMatches} matches`,
        );
      }

      if (newText !== originalText) {
        pagination.innerHTML = newText;
      }
      pagination.classList.add("content-processed");
    });
  }

  // ---------------------------------------------------------------------
  // 12) INIT ON DOMContentLoaded
  // ---------------------------------------------------------------------

  function startPeriodicReactionCheck() {
    // Initial check
    processReactionImages();

    // Set up interval to check every 2 seconds
    setInterval(processReactionImages, 2000);
  }

  // Function to clean up any elements that have both vergil-by-author and vergil-by-content classes
  function cleanupVergilClasses() {
    // Find all elements with both classes
    const elementsWithBothClasses = document.querySelectorAll(
      ".vergil-by-author.vergil-by-content",
    );

    // Remove vergil-by-content from these elements
    elementsWithBothClasses.forEach((element) => {
      element.classList.remove("vergil-by-content");
    });
  }

  // Apply CSS variables for custom colors
  function applyCustomColors() {
    document.documentElement.style.setProperty(
      "--vergil-author-highlight",
      config.authorHighlightColor,
    );
    document.documentElement.style.setProperty(
      "--vergil-content-highlight",
      config.contentHighlightColor,
    );
  }

  /**
   * Process mas-wrap elements that may contain vergil users
   * Hides the entire element if it contains a user who is vergil
   */
  function processMasWrapElements() {
    // First, find all responsive-hide containers that contain mas-wrap elements
    const responsiveHideElements =
      document.querySelectorAll(".responsive-hide");

    responsiveHideElements.forEach((container) => {
      const masWrapElement = container.querySelector(".mas-wrap");
      if (!masWrapElement) return;

      const usernameElement = masWrapElement.querySelector(".mas-username");
      if (!usernameElement) return;

      const usernameLink = usernameElement.querySelector("a");
      if (!usernameLink) return;

      const username = cleanUsername(usernameLink.textContent.trim());
      if (isUserIgnored(username)) {
        // Clean up the text nodes before and after mas-wrap
        const containerContent = container.childNodes;
        containerContent.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            // Replace "by" and "»" with a space
            node.textContent = node.textContent
              .replace(/by\s*$/, " ")
              .replace(/^\s*»/, " ");
          }
        });

        // Remove the entire mas-wrap element (contains both username and avatar)
        masWrapElement.remove();
      }
    });
  }

  async function markNotificationAsRead(notificationElement) {
    try {
      // First try to find the mark read input checkbox (for notification center)
      const container = notificationElement.closest(
        "li, div.notification-block",
      );
      if (!container) return false;

      // Try to find the mark read checkbox
      const markReadInput = container.querySelector('input[name^="mark"]');
      if (markReadInput) {
        markReadInput.checked = true;
        await new Promise((resolve) => setTimeout(resolve, 100));
        return true;
      }

      // Try to find the mark read icon/link
      const markReadLink = container.querySelector(".mark_read.icon-mark");
      if (markReadLink) {
        markReadLink.click();
        await new Promise((resolve) => setTimeout(resolve, 100));
        return true;
      }

      // Try to extract the mark notification URL from the href attribute
      if (
        notificationElement.href &&
        notificationElement.href.includes("mark_notification")
      ) {
        // Extract the notification ID and hash from the URL
        const markUrl = notificationElement.href;

        // Create a hidden iframe to load the mark as read URL
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = markUrl;
        document.body.appendChild(iframe);

        // Wait for the iframe to load
        await new Promise((resolve) => {
          iframe.onload = resolve;
          // Timeout after 2 seconds in case the iframe doesn't load
          setTimeout(resolve, 2000);
        });

        // Remove the iframe
        document.body.removeChild(iframe);
        return true;
      }

      return false;
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      return false;
    }
  }

  /**
   * Process reaction notification blocks (the ones with data-real-url attribute)
   * @param {Element} notificationBlock - The notification block element
   */
  async function processReactionNotificationBlock(notificationBlock) {
    try {
      // Skip if already processed
      if (notificationBlock.classList.contains("content-processed")) {
        return;
      }

      // Find username elements
      const usernameEl = notificationBlock.querySelector(".username");
      if (!usernameEl) {
        notificationBlock.classList.add("content-processed");
        return;
      }

      const username = usernameEl.textContent.trim();

      // Check if the user who reacted is ignored
      if (isUserIgnored(username)) {
        // Mark as read before hiding
        await markNotificationAsRead(notificationBlock);

        // Hide the notification
        notificationBlock.style.display = "none";
      }

      notificationBlock.classList.add("content-processed");
    } catch (err) {
      console.error("Error processing reaction notification block:", err);
      notificationBlock.classList.add("content-processed");
    }
  }

  /**
   * Remove badges that show "0" and prevent tab title from showing notification numbers
   */
  function removeZeroBadges() {
    const zeroBadges = document.querySelectorAll(
      "strong.badge.hidden.content-processed",
    );

    zeroBadges.forEach((badge) => {
      if (badge.textContent.trim() === "0") {
        badge.remove();
      }
    });

    // Store the original title if not already stored
    if (!window.originalTitle) {
      window.originalTitle = document.title.replace(/^\(\d+\)\s+/, "");
    }
  }

  /**
   * Clean notification numbers from the tab title and format it with [HQ] prefix
   */
  function cleanTitleNotifications() {
    // Handle the "Loading..." state specially
    if (document.title === "Loading...") {
      // Format originalTitle and set it
      let formattedTitle = window.originalTitle.replace(/^.*RPGHQ/, "RPGHQ");
      document.title = formattedTitle;
      return;
    }

    let newTitle = document.title;

    // Remove notification count if present
    if (/^\(\d+\)\s+/.test(newTitle)) {
      newTitle = newTitle.replace(/^\(\d+\)\s+/, "");
    }

    // Replace RPGHQ and everything before it with [HQ]
    newTitle = newTitle.replace(/^.*RPGHQ/, "RPGHQ");

    // Update the title
    document.title = newTitle;
  }

  // ---------------------------------------------------------------------
  // ALT KEY LISTENER FOR GHOST BUTTON VISIBILITY (TOGGLE)
  // ---------------------------------------------------------------------

  let altKeyDownActive = false; // State variable for the toggle

  window.addEventListener("keydown", (event) => {
    // Check if the key pressed is Alt and we are not in an input field
    if (
      event.key === "Alt" &&
      !["INPUT", "TEXTAREA"].includes(event.target.tagName)
    ) {
      event.preventDefault(); // Prevent default Alt key behavior (like focusing menu bar)
      altKeyDownActive = !altKeyDownActive; // Toggle the state
      document.body.classList.toggle("alt-key-down", altKeyDownActive); // Toggle the class based on state
    }
  });

  // Main initialization
  document.addEventListener("DOMContentLoaded", async function () {
    // Immediately call to change from "Loading..." to formatted title
    cleanTitleNotifications();
    setupPollRefreshDetection();

    // Remove zero badges on page load
    removeZeroBadges();
    cleanTitleNotifications();

    // Also check periodically for any dynamically added zero badges
    setInterval(removeZeroBadges, 150);

    setInterval(cleanTitleNotifications, 150);

    // Apply custom colors from config
    applyCustomColors();
    // Set up interval to periodically check for and remove zero badges
    setInterval(removeZeroBadges, 1000);
    // Set up more frequent title cleaning
    setInterval(cleanTitleNotifications, 250);

    await Promise.all(
      Array.from(
        document.querySelectorAll(
          ".topiclist.cplist .notifications:not(.content-processed)",
        ),
      ).map(processCPListNotification),
    );
    isMobileDevice = detectMobile();
    createTooltip();
    startPeriodicAvatarCheck();
    startPeriodicReactionCheck();
    await injectRTContent();
    const needsFetching = await cacheAllPosts();

    // Process topiclist topics elements first
    document.querySelectorAll(".topiclist.topics").forEach((topiclist) => {
      processTopicListRow("topic");
    });

    await processIgnoredContentOnce();
    replaceUserAvatars();
    processOnlineList();
    moveExternalLinkIcon();
    cleanVergilQuotesInTextarea();
    updatePaginationPostCount();

    // Process mas-wrap elements
    processMasWrapElements();

    // Clean up any elements that have both vergil-by-author and vergil-by-content classes
    cleanupVergilClasses();

    // Make sure all containers have the content-processed class
    document
      .querySelectorAll("#recent-topics:not(.content-processed)")
      .forEach((el) => el.classList.add("content-processed"));
    document
      .querySelectorAll(".topiclist.forums:not(.content-processed)")
      .forEach((el) => el.classList.add("content-processed"));
    document
      .querySelectorAll(".topiclist.topics:not(.content-processed)")
      .forEach((el) => el.classList.add("content-processed"));
    document
      .querySelectorAll("fieldset.polls:not(.content-processed)")
      .forEach((el) => el.classList.add("content-processed"));

    // Set up a MutationObserver to clean up any elements that get both classes in the future
    const vergilClassesObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class" &&
          mutation.target.classList.contains("vergil-by-author") &&
          mutation.target.classList.contains("vergil-by-content")
        ) {
          mutation.target.classList.remove("vergil-by-content");
        }
      });
    });

    vergilClassesObserver.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
  });

  // Return cleanup function
  return {
    cleanup: () => {
      console.log("Forum Plausibility Fix cleanup");
      // Remove event listeners and clean up any changes made
      document.removeEventListener("keydown", toggleVergilPosts);

      // No need to save cache on cleanup as it's already saved
      // when it's modified during regular operation
      console.log(
        "[Forum Plausibility Fix] Cleanup complete, cache is preserved for next page load",
      );
    },
  };
}
