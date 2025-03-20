// ==UserScript==
// @name         Ghost Users
// @namespace    http://tampermonkey.net/
// @version      5.7
// @description  Hides content from ghosted users + optional avatar replacement, plus quote→blockquote formatting in previews, hides posts with @mentions of ghosted users
// @author       You
// @match        https://rpghq.org/*/*
// @run-at       document-start
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/ghosted-users/Ghost.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/ghosted-users/Ghost.user.js
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

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
  // 1) DATA LOAD + INITIAL STYLES
  // ---------------------------------------------------------------------

  const ignoredUsers = GM_getValue("ignoredUsers", {}); // userId => lowercased username
  const replacedAvatars = GM_getValue("replacedAvatars", {}); // userId => image URL
  const postCache = GM_getValue("postCache", {}); // postId => { content, timestamp }
  const userColors = GM_getValue("userColors", {}); // username => color

  // Set Oyster Sauce's username color
  userColors["Oyster Sauce"] = "#00AA00";
  GM_setValue("userColors", userColors);

  let showGhostedPosts = false; // Always start hidden

  // Clear expired cache entries (older than 24h)
  const now = Date.now();
  Object.keys(postCache)
    .filter(
      (key) =>
        !postCache[key].timestamp || now - postCache[key].timestamp > 86400000
    )
    .forEach((key) => delete postCache[key]);
  GM_setValue("postCache", postCache);

  // Inject style at document-start
  const mainStyle = document.createElement("style");
  mainStyle.textContent = `
    /* -----------------------------------------------------------------
       1) Spinner styling for containers that are not yet processed
       ----------------------------------------------------------------- */
    #recent-topics:not(.content-processed),
    .topiclist.forums:not(.content-processed),
    fieldset.polls:not(.content-processed),
    .topiclist.topics:not(.content-processed) {
      position: relative;
      min-height: 64px;
    }
    #recent-topics:not(.content-processed)::after,
    .topiclist.forums:not(.content-processed)::after,
    fieldset.polls:not(.content-processed)::after,
    .topiclist.topics:not(.content-processed)::after {
      content: "";
      position: absolute;
      top: 16px;
      left: 50%;
      margin-top: 0;
      margin-left: -12px;
      width: 24px;
      height: 24px;
      border: 3px solid #999;
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      pointer-events: none;
      z-index: 9999;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* -----------------------------------------------------------------
       2) Hide unprocessed content
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
    .content-processed:not(.ghosted-post):not(.ghosted-row):not(.ghosted-quote) {
      visibility: visible !important;
    }

    /* -----------------------------------------------------------------
       4) Ghosted element styling
       ----------------------------------------------------------------- */
    .ghosted-row {
      display: none !important;
    }
    .ghosted-row.show {
      display: block !important;
    }
    .ghosted-row.show.ghosted-by-author {
      background-color: rgba(255, 0, 0, 0.1) !important;
    }
    .ghosted-row.show.ghosted-by-content {
      background-color: rgba(255, 128, 0, 0.1) !important;
    }
    .topiclist.forums .ghosted-row:not(.show) dd.lastpost,
    body[class*="viewforum-"] .ghosted-row:not(.show) dd.lastpost {
      display: none !important;
    }
    .topiclist.forums .ghosted-row.show dd.lastpost.ghosted-by-author,
    body[class*="viewforum-"] .ghosted-row.show dd.lastpost.ghosted-by-author {
      display: block !important;
      background-color: rgba(255, 0, 0, 0.1) !important;
    }
    .topiclist.forums .ghosted-row.show dd.lastpost.ghosted-by-content,
    body[class*="viewforum-"] .ghosted-row.show dd.lastpost.ghosted-by-content {
      display: block !important;
      background-color: rgba(255, 255, 0, 0.1) !important;
    }
    .ghosted-post,
    .ghosted-quote {
      display: none !important;
    }
    .ghosted-post.show,
    .ghosted-quote.show {
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
      .show-ghosted-posts span:not(.icon) {
        display: none;
      }
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
        navigator.userAgent
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
        author
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
          `<a href="#" style="color: ${color};">${username}</a>`
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
      /never iggy|unghost user|replace avatar|ghost user/gi,
      ""
    );

    // Remove any extra whitespace
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    return cleaned;
  }

  function isUserIgnored(usernameOrId) {
    if (ignoredUsers.hasOwnProperty(usernameOrId)) return true;
    const cleanedUsername = cleanUsername(usernameOrId);
    const lower = cleanedUsername.toLowerCase();
    return Object.values(ignoredUsers).includes(lower);
  }

  function getUserIdFromUrl() {
    const match = window.location.href.match(/u=(\d+)/);
    return match ? match[1] : null;
  }

  function toggleUserGhost(userId, username) {
    const cleanedUsername = cleanUsername(username);
    if (ignoredUsers.hasOwnProperty(userId)) {
      delete ignoredUsers[userId];
    } else {
      ignoredUsers[userId] = cleanedUsername.toLowerCase();
    }
    GM_setValue("ignoredUsers", ignoredUsers);
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
    const cached = postCache[postId];
    if (
      cached &&
      cached.timestamp &&
      Date.now() - cached.timestamp < 86400000
    ) {
      return cached.content;
    }
    try {
      const response = await fetch(
        `https://rpghq.org/forums/posting.php?mode=quote&p=182671&multiquote=${postId}`
      );
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      const textarea = doc.querySelector("textarea#message");
      if (textarea) {
        let content = textarea.value;
        content = cleanupPostContent(content);
        postCache[postId] = { content, timestamp: Date.now() };
        GM_setValue("postCache", postCache);
        return content;
      }
    } catch (err) {
      console.error(`Failed to fetch post ${postId}:`, err);
    }
    return null;
  }

  async function cacheAllPosts() {
    const lastPostLinks = document.querySelectorAll(
      'a[title="Go to last post"], a[title="View the latest post"]'
    );
    const postIds = Array.from(lastPostLinks)
      .map((lnk) => lnk.href.match(/p=(\d+)/)?.[1])
      .filter((id) => id && !postCache[id]);
    if (postIds.length === 0) return false;
    for (let i = 0; i < postIds.length; i += 5) {
      const chunk = postIds.slice(i, i + 5);
      await Promise.all(chunk.map(fetchAndCachePost));
    }
    return true;
  }

  // ---------------------------------------------------------------------
  // 5) CONTENT PROCESSING / HIDING LOGIC
  // ---------------------------------------------------------------------

  function postContentContainsGhosted(content) {
    if (!content) return false;
    // const quoteMatches = content.match(/\[quote=([^\]]+)/g);
    // if (quoteMatches) {
    //   for (const q of quoteMatches) {
    //     const userIdMatch = q.match(/user_id=(\d+)/);
    //     if (userIdMatch && isUserIgnored(userIdMatch[1])) return true;
    //     const quotedName = q.replace("[quote=", "").split(" ")[0];
    //     if (isUserIgnored(quotedName)) return true;
    //   }
    // }

    for (const userId in ignoredUsers) {
      const username = ignoredUsers[userId];
      if (content.toLowerCase().includes(username.toLowerCase())) {
        return true;
      }
    }

    return false;
  }

  // Check if post content contains @mentions of ghosted users
  function postContentContainsMentionedGhosted(post) {
    // Get the post content div
    const contentDiv = post.querySelector(".content");
    if (!contentDiv) return false;

    // Get the text content of the post
    const postText = contentDiv.textContent;
    if (!postText) return false;

    // Check for @username mentions of ghosted users
    for (const userId in ignoredUsers) {
      const username = ignoredUsers[userId];
      // Look for @username pattern with word boundary
      // const mentionRegex = new RegExp(`@${username}\\b`, "i");
      // if (mentionRegex.test(postText)) {
      //   return true;
      // }
      if (postText.toLowerCase().includes(username.toLowerCase())) {
        return true;
      }
    }

    return false;
  }

  function hideTopicRow(element) {
    // First, check if the element or its parent row has author-name-* class
    // which indicates it's authored by a ghosted user
    const rowItem = element.closest("li.row");
    const hasGhostedClass = rowItem && Array.from(rowItem.classList).some(
      (cls) => cls.startsWith("author-name-") && 
      isUserIgnored(cls.replace("author-name-", ""))
    );
    
    if (hasGhostedClass) {
      // If it's authored by a ghosted user, only add ghosted-by-author
      if (rowItem) {
        rowItem.classList.add("ghosted-row", "ghosted-by-author");
      } else {
        element.classList.add("ghosted-row", "ghosted-by-author");
      }
      return;
    }
    
    const recentTopicLi = element.closest("#recent-topics li");
    if (recentTopicLi) {
      recentTopicLi.classList.add("ghosted-row", "ghosted-by-author");
      return;
    }
    
    if (rowItem) {
      const forumLinks = rowItem.querySelectorAll(
        ".forum-links a, .responsive-hide a"
      );
      const forumNames = Array.from(forumLinks).map((link) =>
        link.textContent.trim()
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
            "a.username, a.username-coloured"
          );
          if (authorLink && isUserIgnored(authorLink.textContent.trim())) {
            // Author is ghosted, only add ghosted-by-author
            if (isViewForum)
              lastpostCell.classList.add("ghosted-row", "ghosted-by-author");
            rowItem.classList.add("ghosted-row", "ghosted-by-author");
            return;
          } else {
            const allLinks = rowItem.querySelectorAll(
              "a.username, a.username-coloured"
            );
            const nonAuthorLinks = Array.from(allLinks).filter(
              (link) => !link.closest(".responsive-hide.left-box")
            );
            const hasGhostedUser = nonAuthorLinks.some((link) =>
              isUserIgnored(link.textContent.trim())
            );
            if (hasGhostedUser) {
              // Has ghosted user in content, add ghosted-by-author
              if (isViewForum)
                lastpostCell.classList.add("ghosted-row", "ghosted-by-author");
              rowItem.classList.add("ghosted-row", "ghosted-by-author");
            } else {
              // No ghosted author, but content might contain ghosted references
              if (isViewForum)
                lastpostCell.classList.add("ghosted-row", "ghosted-by-content");
              rowItem.classList.add("ghosted-row", "ghosted-by-content");
            }
          }
          return;
        }
      }
      
      // Check for ghosted authors in the row
      const authorLinks = rowItem.querySelectorAll(
        "a.username, a.username-coloured"
      );
      const authorNames = Array.from(authorLinks).map((link) =>
        link.textContent.trim()
      );
      const hasGhostedAuthor = authorNames.some((name) => isUserIgnored(name));
      
      if (hasGhostedAuthor) {
        rowItem.classList.add("ghosted-row", "ghosted-by-author");
        return;
      }
      
      const innerDiv = rowItem.querySelector(".list-inner");
      if (innerDiv) {
        const byText = innerDiv.textContent.toLowerCase();
        const hasGhostedInBy = Object.values(ignoredUsers).some((username) =>
          byText.includes(`by ${username.toLowerCase()}`)
        );
        if (hasGhostedInBy) {
          rowItem.classList.add("ghosted-row", "ghosted-by-author");
          return;
        }
      }
      
      // If we get here, it's content-based ghosting
      rowItem.classList.add("ghosted-row", "ghosted-by-content");
    } else {
      element.classList.add("ghosted-row", "ghosted-by-author");
    }
  }

  /**
   * Process topiclist rows - hide entire row except for forum rows where we only hide lastpost
   * @param {string} rowType - The type of row to process ('forum' or 'topic')
   */
  function processTopicListRow(rowType) {
    // Determine selector based on rowType
    let selector;
    if (rowType === 'forum') {
      selector = "ul.topiclist.forums > li.row";
    } else if (rowType === 'topic') {
      selector = "ul.topiclist.topics > li.row";
    } else if (rowType === 'recent') {
      selector = "#recent-topics > ul > li.row";
    } else {
      console.error("Invalid rowType provided to processTopicListRow:", rowType);
      return;
    }

    // Get all rows based on the selector
    const rows = document.querySelectorAll(selector);

    rows.forEach((row) => {
      // Skip if not a valid row
      if (!row) return;

      // Check for special forums we don't want to process
      const forumLinks = row.querySelectorAll(
        ".forum-links a, .responsive-hide a"
      );
      const forumNames = Array.from(forumLinks).map((link) =>
        link.textContent.trim()
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

      // Get the author link in the lastpost cell
      const authorLink = lastpostCell.querySelector(
        "a.username, a.username-coloured"
      );
      if (!authorLink) return;

      const authorName = authorLink.textContent.trim();

      // For forum rows, we only hide the lastpost section
      if (rowType === 'forum') {
        // Check if the author is ignored
        if (isUserIgnored(authorName)) {
          // Author is ghosted, add ghosted-by-author class
          lastpostCell.classList.add("ghosted-row", "ghosted-by-author");
          return;
        }

        // If author isn't ignored, check the post content
        const postLink = lastpostCell.querySelector("a[href*='viewtopic.php']");
        if (postLink) {
          const postId = postLink.href.match(/p=(\d+)/)?.[1];
          if (postId && postCache[postId]) {
            const postContent = postCache[postId].content;
            if (postContent && postContentContainsGhosted(postContent)) {
              // Post content contains ghosted username, add ghosted-by-content class
              lastpostCell.classList.add("ghosted-row", "ghosted-by-content");
            }
          }
        }
      } else {
        // For topic and recent rows, we hide the entire row
        // Check if the author is ignored
        if (isUserIgnored(authorName)) {
          // Author is ghosted, add ghosted-by-author class to the entire row
          row.classList.add("ghosted-row", "ghosted-by-author");
          return;
        }

        // Check for post content with ghosted mentions
        const postLink = lastpostCell.querySelector("a[href*='viewtopic.php']");
        if (postLink) {
          const postId = postLink.href.match(/p=(\d+)/)?.[1];
          if (postId && postCache[postId]) {
            const postContent = postCache[postId].content;
            // Check if the lastPostCell contains the username of a ghosted user
            const lastpostCell = row.querySelector("dd.lastpost");
            if (lastpostCell) {
              const authorLink = lastpostCell.querySelector("a.username, a.username-coloured");
              if (authorLink && isUserIgnored(authorLink.textContent.trim())) {
                // If author is ghosted, ONLY add ghosted-by-author and stop processing
                row.classList.add("ghosted-row", "ghosted-by-author");
                return; // Stop here, don't check content
              } else if (postContent && postContentContainsGhosted(postContent)) {
                // Only if author is not ghosted, check content
                row.classList.add("ghosted-row", "ghosted-by-content");
              }
            } else if (postContent && postContentContainsGhosted(postContent)) {
              row.classList.add("ghosted-row", "ghosted-by-content");
            }
          }
        }
      }
    });
  }

  // Legacy functions for backward compatibility
  function processTopiclistForumsRow() {
    processTopicListRow('forum');
  }

  function processRecentTopicsRows() {
    processTopicListRow('recent');
  }

  function processTopiclistTopicsRows() {
    processTopicListRow('topic');
  }

  // Legacy function for backward compatibility - hide entire row except for forum rows
  function hideTopicRow(element) {
    const recentTopicLi = element.closest("#recent-topics li");
    if (recentTopicLi) {
      recentTopicLi.classList.add("ghosted-row", "ghosted-by-author");
      return;
    }

    const rowItem = element.closest("li.row");
    if (!rowItem) {
      element.classList.add("ghosted-row", "ghosted-by-author");
      return;
    }

    const isForumList = rowItem.closest(".topiclist.forums");
    if (isForumList) {
      // For forum rows, only hide the lastpost
      const lastpostCell = rowItem.querySelector("dd.lastpost");
      if (lastpostCell) {
        // Get the author link in the lastpost cell
        const authorLink = lastpostCell.querySelector(
          "a.username, a.username-coloured"
        );
        if (authorLink && isUserIgnored(authorLink.textContent.trim())) {
          lastpostCell.classList.add("ghosted-row", "ghosted-by-author");
        } else {
          // Check post content
          const postLink = lastpostCell.querySelector("a[href*='viewtopic.php']");
          if (postLink) {
            const postId = postLink.href.match(/p=(\d+)/)?.[1];
            if (postId && postCache[postId]) {
              const postContent = postCache[postId].content;
              if (postContent && postContentContainsGhosted(postContent)) {
                lastpostCell.classList.add("ghosted-row", "ghosted-by-content");
              }
            }
          }
        }
      }
      return;
    }

    // For all other row types, hide the entire row
    rowItem.classList.add("ghosted-row", "ghosted-by-content");
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
    if (authorLink && isUserIgnored(authorLink.textContent.trim())) {
      if (isForumList) {
        // For forum rows, only hide the lastpost
        element.classList.add("ghosted-row", "ghosted-by-author");
      } else if (row) {
        // For other rows, hide the entire row
        hideTopicRow(row);
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
        node.textContent.trim().toLowerCase() === "by"
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
        'a[href*="viewtopic.php"][href*="#p"]'
      );
      
      if (link) {
        const pid = link.href.match(/[#&]p=?(\d+)/)?.[1];
        if (pid) {
          if (userEl && isUserIgnored(userEl.textContent.trim())) {
            if (isForumList) {
              // For forum rows, only hide the lastpost
              element.classList.add("ghosted-row", "ghosted-by-author");
            } else if (row) {
              // For other rows, hide the entire row
              hideTopicRow(row);
            }
          } else {
            try {
              const content = await fetchAndCachePost(pid);
              if (!content || postContentContainsGhosted(content)) {
                if (isForumList) {
                  // For forum rows, only hide the lastpost
                  element.classList.add("ghosted-row", "ghosted-by-content");
                } else if (row) {
                  // For other rows, hide the entire row
                  hideTopicRow(row);
                }
              }
            } catch (err) {
              if (isForumList) {
                // For forum rows, only hide the lastpost
                element.classList.add("ghosted-row", "ghosted-by-content");
              } else if (row) {
                // For other rows, hide the entire row
                hideTopicRow(row);
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
        "a.username, a.username-coloured"
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
      ".username, .username-coloured"
    );
    const usernames = Array.from(usernameEls).map((el) =>
      el.textContent.trim()
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
        row.classList.add("ghosted-row", "ghosted-by-author");
        await markNotificationAsRead(item);
      }
      item.classList.add("content-processed");
      return;
    }

    const nonIgnored = usernames.filter((u) => !isUserIgnored(u));
    const ghosted = usernames.filter((u) => isUserIgnored(u));
    const hasIgnored = ghosted.length > 0;

    if (!hasIgnored) {
      item.classList.add("content-processed");
      return;
    }

    if (nonIgnored.length === 0) {
      const row = item.closest("li.row");
      if (row) {
        row.classList.add("ghosted-row", "ghosted-by-author");
        await markNotificationAsRead(item);
      }
      item.classList.add("content-processed");
      return;
    }

    // Create the non-ghosted notification first
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
        (el) => el.textContent.trim().toLowerCase() === username.toLowerCase()
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

    // Now create ghosted notifications for each ghosted user
    const row = item.closest("li.row");
    if (row) {
      ghosted.forEach((ghostedUsername) => {
        const ghostedRow = row.cloneNode(true);
        ghostedRow.classList.add("ghosted-row", "ghosted-by-author");

        // Update the notification text for this ghosted user
        const ghostedTitleEl = ghostedRow.querySelector(".notifications_title");
        if (ghostedTitleEl) {
          ghostedTitleEl.textContent = "";
          const matchEl = Array.from(usernameEls).find(
            (el) =>
              el.textContent.trim().toLowerCase() ===
              ghostedUsername.toLowerCase()
          );
          if (matchEl) {
            ghostedTitleEl.appendChild(matchEl.cloneNode(true));
          } else {
            ghostedTitleEl.appendChild(
              document.createTextNode(ghostedUsername)
            );
          }

          // Add the trailing text
          nodesAfter.forEach((node) =>
            ghostedTitleEl.appendChild(node.cloneNode(true))
          );
        }

        // Insert the ghosted row after the original
        row.parentNode.insertBefore(ghostedRow, row.nextSibling);
      });
    }

    item.classList.add("content-processed");
  }

  async function processNotification(item) {
    const usernameEls = item.querySelectorAll(".username, .username-coloured");
    const usernames = Array.from(usernameEls).map((el) =>
      el.textContent.trim()
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
        (el) => el.textContent.trim().toLowerCase() === usr.toLowerCase()
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
      if (anchor && isUserIgnored(anchor.textContent.trim())) {
        post.dataset.hideForSingleIgnoredQuote = "true";
        return;
      }
    }
    const allBlockquotes = post.querySelectorAll(".content blockquote");
    allBlockquotes.forEach((bq) => {
      const anchor = bq.querySelector("cite a");
      if (!anchor) return;
      if (isUserIgnored(anchor.textContent.trim())) {
        bq.classList.add("ghosted-quote");
      }
    });
  }

  function processPost(post) {
    processBlockquotesInPost(post);
    const usernameEl = post.querySelector(".username, .username-coloured");
    let hideIt = false;
    if (post.dataset.hideForSingleIgnoredQuote === "true") {
      hideIt = true;
      delete post.dataset.hideForSingleIgnoredQuote;
    }
    if (usernameEl && isUserIgnored(usernameEl.textContent.trim())) {
      hideIt = true;
    }
    // Check for @mentions of ghosted users
    if (!hideIt && postContentContainsMentionedGhosted(post)) {
      hideIt = true;
      // Use the existing ghosted-by-content class
      post.classList.add("ghosted-by-content");
    }
    if (hideIt) {
      post.classList.add("ghosted-post");
    }
    post.classList.add("content-processed");
  }

  function processTopicPoster(poster) {
    const usernameEl = poster.querySelector(".username, .username-coloured");
    if (!usernameEl) return;
    if (isUserIgnored(usernameEl.textContent.trim())) {
      const masWrap = poster.querySelector(".mas-wrap");
      if (masWrap) {
        masWrap.innerHTML = `
          <div class="mas-avatar" style="width: 20px; height: 20px;">
            <img class="avatar" src="./download/file.php?avatar=58.png" width="102" height="111" alt="User avatar">
          </div>
          <div class="mas-username">
            <a href="https://rpghq.org/forums/memberlist.php?mode=viewprofile&amp;u=58-rusty-shackleford" style="color: #ff6e6e;" class="username-coloured">rusty_shackleford</a>
          </div>
        `;
      }
    }
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
          })
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
      (count) => (count / total) * 100
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
          'input[type="submit"][name="update"][value="Submit vote"]'
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
        document.querySelectorAll(".notification-block:not(.content-processed)")
      ).map(processNotification)
    );

    // Process reaction notification blocks
    await Promise.all(
      Array.from(
        document.querySelectorAll(
          "a.notification-block[data-real-url]:not(.content-processed)"
        )
      ).map(processReactionNotificationBlock)
    );

    await cacheAllPosts();

    // Process the different types of topiclist rows
    processTopiclistForumsRow();
    processRecentTopicsRows();
    processTopiclistTopicsRows();

    document.querySelectorAll("fieldset.polls").forEach(processPoll);

    setupPollRefreshDetection();

    document.querySelectorAll(".topic-poster").forEach(processTopicPoster);

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
      "dd.lastpost:not(.content-processed), #recent-topics li dd.lastpost:not(.content-processed)"
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
        GM_setValue("replacedAvatars", replacedAvatars);
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
  // 7) PROFILE BUTTONS: GHOST + REPLACE AVATAR
  // ---------------------------------------------------------------------

  function addGhostButtonsIfOnProfile() {
    const memberlistTitle = document.querySelector(".memberlist-title");
    if (!memberlistTitle || document.getElementById("ghost-user-button"))
      return;
    const userId = getUserIdFromUrl();

    // Get just the direct text content, not including child divs
    const titleText = Array.from(memberlistTitle.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent.trim())
      .join(" ");

    // Extract the username after the dash
    const parts = titleText.split("-");
    let username = parts[1]?.trim() || "Unknown User";

    // Clean the username to remove any button text that might have been included
    username = cleanUsername(username);

    if (!userId) return;
    const container = document.createElement("div");
    container.style.display = "inline-block";
    container.style.marginLeft = "10px";
    const ghostBtn = document.createElement("a");
    ghostBtn.id = "ghost-user-button";
    ghostBtn.className = "button button-secondary";
    ghostBtn.href = "#";
    const replaceBtn = document.createElement("a");
    replaceBtn.id = "replace-avatar-button";
    replaceBtn.className = "button button-secondary";
    replaceBtn.href = "#";
    replaceBtn.textContent = "Replace Avatar";
    replaceBtn.style.marginLeft = "5px";
    container.appendChild(ghostBtn);
    container.appendChild(replaceBtn);
    memberlistTitle.appendChild(container);
    function refreshGhostBtn() {
      const isGhosted = ignoredUsers.hasOwnProperty(userId);
      ghostBtn.textContent = isGhosted ? "Unghost User" : "Ghost User";
      ghostBtn.title = isGhosted
        ? "Stop ignoring this user"
        : "Ignore this user";
    }
    refreshGhostBtn();
    ghostBtn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleUserGhost(userId, username);
      refreshGhostBtn();
    });
    replaceBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showReplaceAvatarPopup(userId);
    });
  }

  function showReplaceAvatarPopup(userId) {
    const popup = document.createElement("div");
    popup.style.cssText = `
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background-color: #2a2a2a; color: #e0e0e0; padding: 20px;
      border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.5); z-index: 9999;
      width: 300px;
    `;
    const title = document.createElement("h3");
    title.textContent = "Replace Avatar";
    title.style.marginTop = "0";
    title.style.marginBottom = "15px";
    popup.appendChild(title);
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter image URL (128x128 or smaller)";
    input.style.cssText = `
      width: 100%; padding: 5px; margin-bottom: 15px; background: #3a3a3a;
      border: 1px solid #4a4a4a; color: #e0e0e0; border-radius: 3px;
    `;
    popup.appendChild(input);
    const btnContainer = document.createElement("div");
    btnContainer.style.display = "flex";
    btnContainer.style.justifyContent = "space-between";
    popup.appendChild(btnContainer);
    function makeBtn(label) {
      const b = document.createElement("button");
      b.textContent = label;
      b.style.cssText = `
        background-color: #3a3a3a; color: #e0e0e0; border: none;
        padding: 5px 10px; border-radius: 3px; cursor: pointer;
      `;
      b.addEventListener(
        "mouseover",
        () => (b.style.backgroundColor = "#4a4a4a")
      );
      b.addEventListener(
        "mouseout",
        () => (b.style.backgroundColor = "#3a3a3a")
      );
      return b;
    }
    const replaceB = makeBtn("Replace");
    replaceB.addEventListener("click", () => {
      validateAndReplaceAvatar(userId, input.value);
      document.body.removeChild(popup);
    });
    const resetB = makeBtn("Reset to Default");
    resetB.addEventListener("click", () => {
      delete replacedAvatars[userId];
      GM_setValue("replacedAvatars", replacedAvatars);
      alert("Avatar reset to default.");
      replaceUserAvatars();
      document.body.removeChild(popup);
    });
    const cancelB = makeBtn("Cancel");
    cancelB.addEventListener("click", () => {
      document.body.removeChild(popup);
    });
    btnContainer.appendChild(replaceB);
    btnContainer.appendChild(resetB);
    btnContainer.appendChild(cancelB);
    document.body.appendChild(popup);
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
    notification.textContent = showGhostedPosts
      ? "Showing Ghosted Posts"
      : "Hiding Ghosted Posts";
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => notification.remove(), 300);
    }, 1500);
  }

  function toggleGhostedPosts() {
    const ghostedPosts = document.querySelectorAll(".post.ghosted-post");
    const ghostedQuotes = document.querySelectorAll(".ghosted-quote");
    const ghostedRows = document.querySelectorAll(".ghosted-row");

    const hasGhostedContent =
      ghostedPosts.length > 0 ||
      ghostedQuotes.length > 0 ||
      ghostedRows.length > 0;

    if (!hasGhostedContent) {
      console.log("No ghosted content found on this page");
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
      notification.textContent = "No ghosted content found on this page";
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => notification.remove(), 300);
      }, 1500);
      return;
    }

    showGhostedPosts = !showGhostedPosts;

    ghostedPosts.forEach((p) => p.classList.toggle("show", showGhostedPosts));
    ghostedQuotes.forEach((q) => q.classList.toggle("show", showGhostedPosts));
    
    // For ghosted rows (which are now only lastpost cells), toggle visibility
    ghostedRows.forEach((r) => {
      r.classList.toggle("show", showGhostedPosts);
    });
    
    document.body.classList.toggle("show-hidden-threads", showGhostedPosts);

    showToggleNotification();
    updatePaginationPostCount();

    // If we're showing ghosted content, scroll to the first shown element
    if (showGhostedPosts) {
      const firstShownElement =
        document.querySelector(".post.ghosted-post.show") ||
        document.querySelector(".ghosted-quote.show") ||
        document.querySelector(".ghosted-row.show");

      if (firstShownElement) {
        firstShownElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
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
      toggleGhostedPosts();
    }
  });

  // ---------------------------------------------------------------------
  // 9) MISC HELPER FUNCTIONS
  // ---------------------------------------------------------------------

  function moveExternalLinkIcon() {
    const lastPostSpans = document.querySelectorAll(
      "dd.lastpost span:not(.icon-moved)"
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

  function cleanGhostedQuotesInTextarea() {
    const textarea = document.querySelector("textarea#message");
    if (!textarea || !textarea.value.includes("[quote")) return;
    let text = textarea.value;
    for (const userId in ignoredUsers) {
      const rx = new RegExp(
        `\\[quote=[^\\]]*user_id=${userId}[^\\]]*\\][\\s\\S]*?\\[\\/quote\\]`,
        "g"
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
      onlineList.querySelectorAll("a.username, a.username-coloured")
    );
    const nonGhostedUsers = userLinks.filter((link) => {
      const userId = link.href.match(/u=(\d+)/)?.[1];
      const username = link.textContent.trim();
      return !(userId && isUserIgnored(userId)) && !isUserIgnored(username);
    });
    if (nonGhostedUsers.length === 0) {
      const guestsMatch = onlineList.textContent.match(/and (\d+) guests/);
      const guestCount = guestsMatch ? guestsMatch[1] : "0";
      onlineList.innerHTML = `Users browsing this forum: ${guestCount} guests`;
      return;
    }
    let newText = "Users browsing this forum: ";
    nonGhostedUsers.forEach((link, index) => {
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
  // 10) IGNORED USERS MANAGEMENT
  // ---------------------------------------------------------------------

  function showIgnoredUsersPopup() {
    // Create popup container
    const popup = document.createElement("div");
    popup.id = "ignored-users-popup";
    popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #2a2e36;
      border: 1px solid #3a3f4b;
      border-radius: 5px;
      width: 80%;
      max-width: 600px;
      height: 80%;
      max-height: 600px;
      display: flex;
      flex-direction: column;
      z-index: 9999;
      font-family: 'Open Sans', 'Droid Sans', Arial, Verdana, sans-serif;
    `;

    // Header with title and close button
    const header = document.createElement("div");
    header.style.cssText = `
      padding: 10px;
      background-color: #2a2e36;
      border-bottom: 1px solid #3a3f4b;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    const title = document.createElement("h2");
    title.textContent = "Ghosted Users";
    title.style.cssText = "margin: 0; color: #c5d0db; font-size: 1.2em;";
    const closeButton = document.createElement("button");
    closeButton.textContent = "×";
    closeButton.style.cssText = `
      background-color: transparent;
      color: #c5d0db;
      border: none;
      font-size: 1.5em;
      cursor: pointer;
    `;
    closeButton.onclick = () => document.body.removeChild(popup);
    header.appendChild(title);
    header.appendChild(closeButton);

    // Content area for the user list
    const content = document.createElement("div");
    content.style.cssText = `
      padding: 10px;
      overflow-y: auto;
      flex-grow: 1;
      background-color: #2a2e36;
    `;
    const userList = document.createElement("ul");
    userList.style.cssText = `
      list-style-type: none;
      padding: 0;
      margin: 0;
    `;

    // Render user list
    const userEntries = Object.entries(ignoredUsers).map(
      ([userId, username]) => ({
        userId,
        username: typeof username === "string" ? username : "Unknown User",
      })
    );

    userEntries.sort((a, b) => a.username.localeCompare(b.username));

    userEntries.forEach(({ userId, username }) => {
      const listItem = document.createElement("li");
      listItem.style.cssText = `
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        padding: 5px;
        border-bottom: 1px solid #3a3f4b;
      `;

      const unghostedButton = document.createElement("button");
      unghostedButton.textContent = "Unghost";
      unghostedButton.style.cssText = `
        background-color: #4a5464;
        color: #c5d0db;
        border: none;
        padding: 2px 5px;
        border-radius: 3px;
        cursor: pointer;
        margin-right: 10px;
        font-size: 0.8em;
      `;
      unghostedButton.onclick = () => {
        toggleUserGhost(userId, username);
        listItem.remove();
        if (userList.children.length === 0) {
          userList.innerHTML =
            '<p style="color: #c5d0db;">No ghosted users.</p>';
        }
      };

      const userLink = document.createElement("a");
      userLink.href = `https://rpghq.org/forums/memberlist.php?mode=viewprofile&u=${userId}`;
      userLink.textContent = username;
      userLink.style.cssText =
        "color: #4a90e2; text-decoration: none; flex-grow: 1;";

      listItem.appendChild(unghostedButton);
      listItem.appendChild(userLink);
      userList.appendChild(listItem);
    });

    if (Object.keys(ignoredUsers).length === 0) {
      userList.innerHTML = '<p style="color: #c5d0db;">No ghosted users.</p>';
    }

    content.appendChild(userList);

    // Bottom controls with buttons
    const bottomControls = document.createElement("div");
    bottomControls.style.cssText = `
      padding: 10px;
      background-color: #2a2e36;
      border-top: 1px solid #3a3f4b;
      text-align: center;
      display: flex;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
    `;

    // Mass Unghost button
    const massUnghostButton = document.createElement("button");
    massUnghostButton.innerHTML =
      '<i class="icon fa-trash fa-fw" aria-hidden="true"></i> Unghost All';
    massUnghostButton.style.cssText = `
      background-color: #4a5464;
      color: #c5d0db;
      border: none;
      padding: 5px 10px;
      border-radius: 3px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
    `;
    massUnghostButton.onclick = () => {
      if (confirm("Are you sure you want to unghost all users?")) {
        GM_setValue("ignoredUsers", {});
        ignoredUsers = {};
        userList.innerHTML = '<p style="color: #c5d0db;">No ghosted users.</p>';
        alert("All users have been unghosted.");
      }
    };

    bottomControls.appendChild(massUnghostButton);

    // Assemble the popup
    popup.appendChild(header);
    popup.appendChild(content);
    popup.appendChild(bottomControls);
    document.body.appendChild(popup);
  }

  function addShowIgnoredUsersButton() {
    const dropdown = document.querySelector(
      "#username_logged_in .dropdown-contents"
    );
    if (dropdown && !document.getElementById("show-ignored-users-button")) {
      const listItem = document.createElement("li");
      const showButton = document.createElement("a");
      showButton.id = "show-ignored-users-button";
      showButton.href = "#";
      showButton.title = "Ghosted Users";
      showButton.role = "menuitem";
      showButton.innerHTML =
        '<i class="icon fa-ban fa-fw" aria-hidden="true"></i><span>Ghosted Users</span>';

      showButton.addEventListener("click", function (e) {
        e.preventDefault();
        showIgnoredUsersPopup();
      });

      listItem.appendChild(showButton);
      dropdown.insertBefore(listItem, dropdown.lastElementChild);
    }
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
        "https://rpghq.org/forums/rt?recent_topics_start=0"
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
          "https://rpghq.org/forums/rt?recent_topics_start=35"
        );
        const secondText = await secondResponse.text();
        const secondDoc = parser.parseFromString(secondText, "text/html");
        const secondInner = secondDoc.querySelector(".inner:not(.column1)");
        if (secondInner) {
          const secondPageItems = secondInner.querySelectorAll("li.row");
          console.log(
            `Found ${secondPageItems.length} topics on second RT page`
          );
          secondPageItems.forEach((row) => {
            targetList.appendChild(row.cloneNode(true));
          });
        }
      }

      innerDiv.querySelectorAll('a[href^="./"]').forEach((link) => {
        link.href = link.href.replace("./", "https://rpghq.org/forums/");
      });

      // Change Oyster Sauce's username color to #00AA00
      innerDiv.querySelectorAll("a.username-coloured").forEach((link) => {
        if (link.textContent.trim() === "Oyster Sauce") {
          link.style.color = "#00AA00";
        }
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
              'a[title="Go to last post"]'
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

      const visiblePosts = showGhostedPosts
        ? document.querySelectorAll(".post").length
        : document.querySelectorAll(".post:not(.ghosted-post)").length;

      const visibleMatches = showGhostedPosts
        ? document.querySelectorAll("li.row").length
        : document.querySelectorAll("li.row:not(.ghosted-row)").length;

      const originalText = pagination.innerHTML;
      let newText = originalText;

      // Update post count if this is a post page
      const postCountMatch = paginationText.match(/(\d+) posts/);
      if (postCountMatch) {
        newText = newText.replace(/\d+ posts/, `${visiblePosts} posts`);
      }

      // Update match count if this is a search page
      const matchCountMatch = paginationText.match(
        /Search found (\d+) matches/
      );
      if (matchCountMatch) {
        newText = newText.replace(
          /Search found \d+ matches/,
          `Search found ${visibleMatches} matches`
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

  // Function to change Oyster Sauce's username color to #00AA00
  function changeOysterSauceColor() {
    document.querySelectorAll("a.username-coloured").forEach((link) => {
      if (link.textContent.trim() === "Oyster Sauce") {
        link.style.color = "#00AA00";
      }
    });

    // Set up a MutationObserver to handle dynamically loaded content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              // Element node
              const usernameLinks = node.querySelectorAll
                ? node.querySelectorAll("a.username-coloured")
                : [];

              usernameLinks.forEach((link) => {
                if (link.textContent.trim() === "Oyster Sauce") {
                  link.style.color = "#00AA00";
                }
              });
            }
          });
        }
      });
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Function to clean up any elements that have both ghosted-by-author and ghosted-by-content classes
  function cleanupGhostedClasses() {
    // Find all elements with both classes
    const elementsWithBothClasses = document.querySelectorAll('.ghosted-by-author.ghosted-by-content');
    
    // Remove ghosted-by-content from these elements
    elementsWithBothClasses.forEach(element => {
      element.classList.remove('ghosted-by-content');
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await Promise.all(
      Array.from(
        document.querySelectorAll(
          ".topiclist.cplist .notifications:not(.content-processed)"
        )
      ).map(processCPListNotification)
    );
    isMobileDevice = detectMobile();
    createTooltip();
    startPeriodicAvatarCheck();
    startPeriodicReactionCheck();
    await injectRTContent();
    const needsFetching = await cacheAllPosts();

    // Process topiclist topics elements first
    document.querySelectorAll(".topiclist.topics").forEach((topiclist) => {
      processTopicListRow('topic');
    });

    // Process cplist notifications

    // Then process the containers, but only if all their li elements are processed
    if (!needsFetching) {
      document
        .querySelectorAll(
          ".topiclist.topics, #recent-topics, .topiclist.forums"
        )
        .forEach((container) => {
          // For topiclist.topics and recent-topics, only add content-processed if all li's are processed
          if (
            (container.classList.contains("topiclist") &&
              container.classList.contains("topics")) ||
            container.id === "recent-topics"
          ) {
            const allLis = container.querySelectorAll("li.row");
            const allProcessed = Array.from(allLis).every((li) =>
              li.classList.contains("content-processed")
            );
            if (allProcessed) {
              container.classList.add("content-processed");
            }
          } else {
            // For other containers, proceed as before
            container.classList.add("content-processed");
          }
        });
    }

    await processIgnoredContentOnce();
    replaceUserAvatars();
    addGhostButtonsIfOnProfile();
    addShowIgnoredUsersButton();
    processOnlineList();
    moveExternalLinkIcon();
    cleanGhostedQuotesInTextarea();
    updatePaginationPostCount();
    changeOysterSauceColor();

    // Final pass to ensure all containers are marked as processed
    document
      .querySelectorAll(".topiclist.topics, #recent-topics, .topiclist.forums")
      .forEach((container) => {
        if (container.classList.contains("topiclist") && container.classList.contains("topics")) {
          processTopicListRow('topic');
          container.classList.add("content-processed");
        } else if (container.id === "recent-topics") {
          processTopicListRow('recent');
          container.classList.add("content-processed");
        } else if (container.classList.contains("topiclist") && container.classList.contains("forums")) {
          processTopicListRow('forum');
          container.classList.add("content-processed");
        } else {
          container.classList.add("content-processed");
        }
      });
      
    // Clean up any elements that have both ghosted-by-author and ghosted-by-content classes
    cleanupGhostedClasses();
    
    // Set up a MutationObserver to clean up any elements that get both classes in the future
    const ghostedClassesObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            mutation.attributeName === 'class' && 
            mutation.target.classList.contains('ghosted-by-author') && 
            mutation.target.classList.contains('ghosted-by-content')) {
          mutation.target.classList.remove('ghosted-by-content');
        }
      });
    });
    
    ghostedClassesObserver.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  });

  /**
   * Marks a notification as read before hiding it
   * @param {Element} notificationElement - The notification element to mark as read
   * @returns {Promise<boolean>} - Whether the notification was successfully marked as read
   */
  async function markNotificationAsRead(notificationElement) {
    try {
      // First try to find the mark read input checkbox (for notification center)
      const container = notificationElement.closest(
        "li, div.notification-block"
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
})();
