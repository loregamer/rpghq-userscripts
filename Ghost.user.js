// ==UserScript==
// @name         Ghost Users
// @namespace    http://tampermonkey.net/
// @version      4.1
// @description  Hides content from ghosted users + optional avatar replacement, plus quote→blockquote formatting in previews, now with a single spinner per container
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

  // ---------------------------------------------------------------------
  // 1) DATA LOAD + IMMEDIATE STYLES
  // ---------------------------------------------------------------------

  let ignoredUsers = GM_getValue("ignoredUsers", {}); // userId => lowercased username
  let replacedAvatars = GM_getValue("replacedAvatars", {}); // userId => image URL
  let postCache = GM_getValue("postCache", {}); // postId => { content, timestamp }
  let userColors = GM_getValue("userColors", {}); // username => color
  let showGhostedPosts = GM_getValue("showGhostedPosts", false); // New preference

  // Clear expired cache entries (older than 24h)
  const now = Date.now();
  const expiredKeys = Object.keys(postCache).filter((key) => {
    const entry = postCache[key];
    return !entry.timestamp || now - entry.timestamp > 86400000; // 24h
  });
  if (expiredKeys.length > 0) {
    expiredKeys.forEach((key) => delete postCache[key]);
    GM_setValue("postCache", postCache);
  }

  // Inject style at document-start
  // Instead of per-item spinners, we show exactly one spinner per container
  const mainStyle = document.createElement("style");
  mainStyle.textContent = `
    /* -----------------------------------------------------------------
       1) One spinner per container
       ----------------------------------------------------------------- */
    .topiclist.topics:not(#pinned-threads-list):not(.content-processed),
    #recent-topics:not(.content-processed),
    .topiclist.forums:not(.content-processed),
    fieldset.polls:not(.content-processed) {
      position: relative;
      min-height: 32px;
    }
    /* Single spinner in the center */
    .topiclist.topics:not(#pinned-threads-list):not(.content-processed)::after,
    #recent-topics:not(.content-processed)::after,
    .topiclist.forums:not(.content-processed)::after,
    fieldset.polls:not(.content-processed)::after {
      content: "";
      position: absolute;
      top: 16px;   /* Fixed distance from top instead of 50% */
      left: 50%;
      margin-top: 0;   /* Remove vertical margin */
      margin-left: -12px;  /* half the spinner width */
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
      to {
        transform: rotate(360deg);
      }
    }

    /* Hide child elements in these containers until processed */
    .topiclist.topics:not(#pinned-threads-list):not(.content-processed) > *:not(style),
    #recent-topics:not(.content-processed) > *:not(style),
    .topiclist.forums:not(.content-processed) > *:not(style),
    fieldset.polls:not(.content-processed) > *:not(style) {
      visibility: hidden;
    }

    /* Once processed, reveal child items */
    .topiclist.topics:not(#pinned-threads-list).content-processed > *,
    #recent-topics.content-processed > *,
    .topiclist.forums.content-processed > *,
    fieldset.polls.content-processed > * {
      visibility: visible !important;
    }

    /* Hide main post containers until processed */
    .post.bg1:not(.content-processed),
    .post.bg2:not(.content-processed),
    dd.lastpost:not(.content-processed),
    .reaction-score-list:not(.content-processed) {
      visibility: hidden !important;
    }

    /* Once processed and not ghosted, show content */
    .content-processed:not(.ghosted-post):not(.ghosted-row):not(.ghosted-quote),
    .reaction-score-list.content-processed,
    li.row.content-processed,
    .notification-block {
      visibility: visible !important;
    }

    /* Ghosted row styling */
    .ghosted-row {
      display: none !important;
    }
    .ghosted-row.show {
      display: block !important;
    }
    /* Different colors based on ghost reason */
    .ghosted-row.show.ghosted-by-author {
      background-color: rgba(255, 0, 0, 0.1) !important;
    }
    .ghosted-row.show.ghosted-by-content {
      background-color: rgba(255, 128, 0, 0.1) !important;
    }

    /* Special handling for forum lists and viewforum - only hide lastpost */
    .topiclist.forums .ghosted-row,
    body[class*="viewforum-"] .ghosted-row {
      display: block !important;
    }
    .topiclist.forums .ghosted-row.show,
    body[class*="viewforum-"] .ghosted-row.show {
      background-color: transparent !important;
    }
    .topiclist.forums .ghosted-row dd.lastpost,
    body[class*="viewforum-"] .ghosted-row dd.lastpost {
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

    /* Ghosted posts and quotes */
    .ghosted-post, .ghosted-quote {
      display: none !important;
    }
    .ghosted-post.show,
    .ghosted-quote.show {
      display: block !important;

      /* Add a 3px border that uses a rainbow gradient */
      border: 3px solid;                  /* required to enable border-image */
      border-image: linear-gradient(
        to right,
        red, orange, yellow, green, blue, indigo, violet
      ) 1;
      border-image-slice: 1;

      /* optional extra niceness */
      border-radius: 4px;                 /* slightly rounded corners */
      padding: 6px;                       /* spacing so border is more visible */
    }

    /* Post preview tooltip */
    .post-preview-tooltip {
      position: absolute;
      background: #171B24;
      padding: 15px;
      border-radius: 5px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
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
    .post-preview-tooltip ul, .post-preview-tooltip ol {
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

    /* Custom Quote Styling */
    .custom-quote {
      background-color: #242A36;
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
    .custom-quote-header::before {
      display: none;
    }
    .custom-quote-header a {
      color: #89a6cf;
      text-decoration: none;
      font-weight: 700;
    }
    /* Nested quotes get a different border color */
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

    /* Responsive: hide text on small screens */
    @media (max-width: 700px) {
      .show-ghosted-posts span:not(.icon) {
        display: none;
      }
    }
  `;
  if (document.documentElement) {
    document.documentElement.appendChild(mainStyle);
  }

  // Tooltip tracking
  let tooltip = null;
  let currentHoverTimeout = null;

  // ---------------------------------------------------------------------
  // 2) HELPER: BBCODE + QUOTE PARSER FOR PREVIEW
  // ---------------------------------------------------------------------

  function removeRemainingBrackets(text) {
    // Remove any remaining [tag]content[/tag] patterns
    text = text.replace(/\[[^\]]*\][^\[]*\[\/[^\]]*\]/g, "");
    // Remove any standalone brackets with content
    text = text.replace(/\[[^\]]*\]/g, "");
    return text;
  }

  function parseBBCode(text) {
    if (!text) return "";

    // Basic BBCode patterns
    const patterns = {
      // Text formatting
      b: { pattern: /\[b\](.*?)\[\/b\]/gi, replacement: "<strong>$1</strong>" },
      i: { pattern: /\[i\](.*?)\[\/i\]/gi, replacement: "<em>$1</em>" },
      u: { pattern: /\[u\](.*?)\[\/u\]/gi, replacement: "<u>$1</u>" },
      s: { pattern: /\[s\](.*?)\[\/s\]/gi, replacement: "<s>$1</s>" },

      // Mentions
      smention: {
        pattern: /\[smention u=(\d+)\](.*?)\[\/smention\]/gi,
        replacement: '<em class="mention">@$2</em>',
      },

      // Colors and sizes
      color: {
        pattern: /\[color=([^\]]+)\](.*?)\[\/color\]/gi,
        replacement: '<span style="color: $1">$2</span>',
      },
      size: {
        pattern: /\[size=([^\]]+)\](.*?)\[\/size\]/gi,
        replacement: '<span style="font-size: $1">$2</span>',
      },

      // Links and images
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

      // Media tag that always shows a specific image
      media: {
        pattern: /\[media\](.*?)\[\/media\]/gi,
        replacement:
          '<img src="https://f.rpghq.org/516uJnaFaEYB.png?n=pasted-file.png" alt="" style="max-width: 50%; height: auto;">',
      },

      // Lists
      list: {
        pattern: /\[list\](.*?)\[\/list\]/gis,
        replacement: "<ul>$1</ul>",
      },
      "*": {
        pattern: /\[\*\](.*?)(?=\[\*\]|\[\/list\]|$)/gi,
        replacement: "<li>$1</li>",
      },

      // Code blocks
      code: {
        pattern: /\[code\](.*?)\[\/code\]/gis,
        replacement: '<pre class="code">$1</pre>',
      },

      // Alignment
      center: {
        pattern: /\[center\](.*?)\[\/center\]/gi,
        replacement: '<div style="text-align: center">$1</div>',
      },
      right: {
        pattern: /\[right\](.*?)\[\/right\]/gi,
        replacement: '<div style="text-align: right">$1</div>',
      },

      // Spoilers
      spoiler: {
        pattern: /\[spoiler\](.*?)\[\/spoiler\]/gis,
        replacement: "<details><summary>Spoiler</summary>$1</details>",
      },

      // Generic handler for any other BBCode tags
      generic: {
        pattern: /\[([a-z]+)\](.*?)\[\/\1\]/gis,
        replacement: (match, tag, content) =>
          `<details><summary>${
            tag.charAt(0).toUpperCase() + tag.slice(1)
          }</summary>${content}</details>`,
      },
    };

    let processedText = text;
    // Convert newlines
    processedText = processedText.replace(/\n/g, "<br>");

    // Then process each BBCode
    for (const { pattern, replacement } of Object.values(patterns)) {
      processedText = processedText.replace(pattern, replacement);
    }

    // Finally, remove leftover [ ] tags
    processedText = removeRemainingBrackets(processedText);
    return processedText;
  }

  function parseQuotes(text) {
    if (!text) return "";

    const quoteRegex =
      /\[quote=(.*?)(?: post_id=(\d+))?(?: time=(\d+))?(?: user_id=(\d+))?\]([\s\S]*?)\[\/quote\]/gi;

    let output = "";
    let lastIndex = 0;
    let match;

    while ((match = quoteRegex.exec(text)) !== null) {
      // Text before the quote
      output += text.slice(lastIndex, match.index);

      const author = match[1] || "Unknown";
      const userId = match[4] || "";
      let quoteBody = match[5] || "";

      // Remove raw [quote] tags from inside
      quoteBody = quoteBody.replace(/\[quote=.*?\]|\[\/quote\]/g, "");
      // Trim leading whitespace
      quoteBody = quoteBody.replace(/^\s+/, "");

      // Link to profile
      const profileUrl =
        `https://rpghq.org/forums/memberlist.php?mode=viewprofile&u=` +
        `${userId}-${encodeURIComponent(author)}`;

      // Our custom quote HTML
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
    // Append any remainder
    output += text.slice(lastIndex);

    return output;
  }

  // ---------------------------------------------------------------------
  // 3) TOOLTIP CREATION / SHOW / HIDE
  // ---------------------------------------------------------------------

  function createTooltip() {
    if (tooltip) return;
    tooltip = document.createElement("div");
    tooltip.className = "post-preview-tooltip";
    document.body.appendChild(tooltip);
  }

  async function showPostPreview(event, postId) {
    if (!tooltip) return;
    if (currentHoverTimeout) clearTimeout(currentHoverTimeout);

    // Slight delay to avoid flicker
    currentHoverTimeout = setTimeout(async () => {
      let content = await fetchAndCachePost(postId);
      if (!content) return;

      // Parse quotes
      content = parseQuotes(content);
      // Parse remaining BBCode
      content = parseBBCode(content);

      // Apply stored user color
      Object.entries(userColors).forEach(([username, color]) => {
        const usernameRegex = new RegExp(`<a[^>]*>${username}</a>`, "g");
        content = content.replace(
          usernameRegex,
          `<a href="#" style="color: ${color};">${username}</a>`
        );
      });

      tooltip.innerHTML = `<div class="post-content">${content}</div>`;

      // Position near cursor, but further to the left
      const tooltipX = Math.max(10, event.pageX - tooltip.offsetWidth - 100);
      const tooltipY = Math.max(10, event.pageY - tooltip.offsetHeight / 2);
      tooltip.style.left = `${tooltipX}px`;
      tooltip.style.top = `${tooltipY}px`;
      tooltip.classList.add("visible");

      // Keep tooltip if hovered
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
  // 4) IGNORE / GHOST USERS
  // ---------------------------------------------------------------------

  function isUserIgnored(usernameOrId) {
    // Numeric ID check
    if (ignoredUsers.hasOwnProperty(usernameOrId)) return true;
    // Username check
    const lower = usernameOrId.toLowerCase();
    return Object.values(ignoredUsers).includes(lower);
  }

  function getUserIdFromUrl() {
    const match = window.location.href.match(/u=(\d+)/);
    return match ? match[1] : null;
  }

  function toggleUserGhost(userId, username) {
    if (ignoredUsers.hasOwnProperty(userId)) {
      delete ignoredUsers[userId];
    } else {
      ignoredUsers[userId] = username.toLowerCase();
    }
    GM_setValue("ignoredUsers", ignoredUsers);
  }

  // ---------------------------------------------------------------------
  // 5) POST FETCH & CACHING + CLEANUP
  // ---------------------------------------------------------------------

  function cleanupPostContent(content) {
    // (2) Remove quotation marks from quote usernames
    content = content.replace(/\[quote="([^"]+)"/g, "[quote=$1");

    // (3) Remove the first [quote=...]
    content = content.replace(/^(\[quote=[^\]]+\]\s*)/, "");
    // (4) Remove the last [/quote]
    content = content.replace(/\[\/quote\]\s*$/, "");
    // (5) Remove nested quotes
    content = removeNestedQuotes(content);
    return content;
  }

  function removeNestedQuotes(str) {
    let result = "";
    let i = 0;
    let inQuote = false;

    while (i < str.length) {
      const openMatch = str.slice(i).match(/^(\[quote=[^\]]+\])/);
      if (openMatch) {
        if (!inQuote) {
          // This is the first/outer quote
          inQuote = true;
          result += openMatch[1];
          i += openMatch[1].length;
        } else {
          // Already in a quote, skip until [/quote]
          i += openMatch[1].length;
          const closeIdx = str.indexOf("[/quote]", i);
          if (closeIdx === -1) {
            i = str.length;
          } else {
            i = closeIdx + 8; // length of "[/quote]"
          }
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
      // Normal char
      result += str[i];
      i++;
    }
    return result;
  }

  async function fetchAndCachePost(postId) {
    // Return cached if under 24h
    const cached = postCache[postId];
    if (
      cached &&
      cached.timestamp &&
      Date.now() - cached.timestamp < 86400000
    ) {
      return cached.content;
    }

    try {
      // The "quote post" page includes the BBCode of the post in a textarea
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
        // Cache it
        postCache[postId] = {
          content,
          timestamp: Date.now(),
        };
        GM_setValue("postCache", postCache);
        return content;
      }
    } catch (err) {
      console.error(`Failed to fetch post ${postId}:`, err);
    }
    return null;
  }

  async function cacheAllPosts() {
    // Prefetch last post contents
    const lastPostLinks = document.querySelectorAll(
      'a[title="Go to last post"], a[title="View the latest post"]'
    );
    const postIds = Array.from(lastPostLinks)
      .map((lnk) => lnk.href.match(/p=(\d+)/)?.[1])
      .filter((id) => id && !postCache[id]);

    // Limit concurrency in chunks of 5
    for (let i = 0; i < postIds.length; i += 5) {
      const chunk = postIds.slice(i, i + 5);
      await Promise.all(chunk.map(fetchAndCachePost));
    }
  }

  // ---------------------------------------------------------------------
  // 6) CONTENT PROCESSING FOR HIDING
  // ---------------------------------------------------------------------

  function postContentContainsGhosted(content) {
    if (!content) return false;
    // If quotes mention an ignored user
    const quoteMatches = content.match(/\[quote=([^\]]+)/g);
    if (quoteMatches) {
      for (const q of quoteMatches) {
        const quotedName = q.replace("[quote=", "").split(" ")[0];
        if (isUserIgnored(quotedName)) return true;
      }
    }
    return false;
  }

  function hideTopicRow(element) {
    // First check if it's a recent topics list item
    const recentTopicLi = element.closest("#recent-topics li");
    if (recentTopicLi) {
      recentTopicLi.style.display = "none";
      return;
    }

    // Check for any row element
    const rowItem = element.closest("li.row");
    if (rowItem) {
      // Check if we're in a forum list
      const isForumList = rowItem.closest(".topiclist.forums");
      const isViewForum = window.location.href.includes("/viewforum.php");
      const isSearch = window.location.href.includes("/search.php");

      // If we're in viewforum or search, only check the lastpost cell
      if (isViewForum || isSearch) {
        const lastpostCell = rowItem.querySelector("dd.lastpost");
        if (lastpostCell) {
          // Check if the lastpost author is ghosted
          const authorLink = lastpostCell.querySelector(
            "a.username, a.username-coloured"
          );
          if (authorLink && isUserIgnored(authorLink.textContent.trim())) {
            if (isViewForum) {
              lastpostCell.classList.add("ghosted-row", "ghosted-by-author");
            }
            rowItem.classList.add("ghosted-row", "ghosted-by-author");
          } else {
            // Check if there are any ghosted users mentioned in the content
            // Exclude the topic author link (which is in .responsive-hide.left-box)
            const allLinks = rowItem.querySelectorAll(
              "a.username, a.username-coloured"
            );
            const nonAuthorLinks = Array.from(allLinks).filter((link) => {
              const leftBox = link.closest(".responsive-hide.left-box");
              return !leftBox; // Keep only links that aren't in the left-box
            });

            const hasGhostedUser = nonAuthorLinks.some((link) =>
              isUserIgnored(link.textContent.trim())
            );

            if (hasGhostedUser) {
              if (isViewForum) {
                lastpostCell.classList.add("ghosted-row", "ghosted-by-author");
              }
              rowItem.classList.add("ghosted-row", "ghosted-by-author");
            } else {
              if (isViewForum) {
                lastpostCell.classList.add("ghosted-row", "ghosted-by-content");
              }
              rowItem.classList.add("ghosted-row", "ghosted-by-content");
            }
          }
          return;
        }
      }

      // For non-viewforum pages, check if the row itself indicates a ghosted user
      const authorLinks = rowItem.querySelectorAll(
        "a.username, a.username-coloured"
      );
      const authorNames = Array.from(authorLinks).map((link) =>
        link.textContent.trim()
      );
      const hasGhostedAuthor = authorNames.some((name) => isUserIgnored(name));

      // Also check for author name in the class
      const hasGhostedClass = Array.from(rowItem.classList).some(
        (cls) =>
          cls.startsWith("author-name-") &&
          isUserIgnored(cls.replace("author-name-", ""))
      );

      if (hasGhostedAuthor || hasGhostedClass) {
        rowItem.classList.add("ghosted-row", "ghosted-by-author");
        return;
      }

      // Check the inner content for ghosted user mentions
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

      // If we got here and still have a rowItem, add the content-based class
      rowItem.classList.add("ghosted-row", "ghosted-by-content");
    } else {
      // Fallback to just hiding the element
      element.style.display = "none";
    }
  }

  async function processLastPost(element) {
    // Skip pinned threads
    if (element.closest("#pinned-threads-list")) {
      element.classList.add("content-processed");
      return;
    }

    // First, set up any post previews for links with icons
    const linksWithIcons = element.querySelectorAll("a:has(i.icon)");
    linksWithIcons.forEach((link) => {
      const pid = link.href.match(/[#&]p=?(\d+)/)?.[1];
      if (pid) {
        link.addEventListener("mouseenter", (e) => showPostPreview(e, pid));
        link.addEventListener("mouseleave", hidePostPreview);
      }
    });

    // Check if this post is in a row that mentions a ghosted user
    const row = element.closest("li.row");
    if (row) {
      const authorLinks = row.querySelectorAll(
        "a.username, a.username-coloured"
      );
      for (const link of authorLinks) {
        if (isUserIgnored(link.textContent.trim())) {
          hideTopicRow(row);
          element.classList.add("content-processed");
          return;
        }
      }

      // Check for author-name class
      const hasGhostedClass = Array.from(row.classList).some(
        (cls) =>
          cls.startsWith("author-name-") &&
          isUserIgnored(cls.replace("author-name-", ""))
      );
      if (hasGhostedClass) {
        hideTopicRow(row);
        element.classList.add("content-processed");
        return;
      }
    }

    const spanEl = element.querySelector("span");
    if (!spanEl) {
      element.classList.add("content-processed");
      return;
    }

    // Look for the "by" text node
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
      // This is the poster's username link
      const userEl =
        nextEl.classList.contains("username") ||
        nextEl.classList.contains("username-coloured")
          ? nextEl
          : nextEl.querySelector(".username, .username-coloured");

      // Get the post ID for checking content
      const link = element.querySelector(
        'a[href*="viewtopic.php"][href*="#p"]'
      );
      if (link) {
        const pid = link.href.match(/[#&]p=?(\d+)/)?.[1];
        if (pid) {
          // Check if we need to hide it
          if (userEl && isUserIgnored(userEl.textContent.trim())) {
            hideTopicRow(element);
          } else {
            const content = await fetchAndCachePost(pid);
            if (content && postContentContainsGhosted(content)) {
              hideTopicRow(element);
            }
          }
        }
      }
    }
    element.classList.add("content-processed");
  }

  function processReactionList(list) {
    // Some boards have reaction score popups
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
          const userDiv = link.closest("div");
          if (userDiv) {
            userDiv.remove();
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
    list.classList.add("content-processed");
    // Make sure it's shown
    list.style.visibility = "visible";
  }

  function processNotification(item) {
    const usernameEls = item.querySelectorAll(".username, .username-coloured");
    const usernames = Array.from(usernameEls).map((el) =>
      el.textContent.trim()
    );
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

    // If all are ignored, hide it
    if (nonIgnored.length === 0) {
      const li = item.closest("li");
      if (li) li.style.display = "none";
      item.classList.add("content-processed");
      return;
    }

    // Otherwise rewrite the notification to only show non-ignored
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
    // First check top-level blockquotes to see if post should be hidden
    const topLevelBlockquotes = post.querySelectorAll(".content > blockquote");

    // If there's only one top-level blockquote and it's from an ignored user, mark the post for hiding
    if (topLevelBlockquotes.length === 1) {
      const anchor = topLevelBlockquotes[0].querySelector("cite a");
      if (anchor && isUserIgnored(anchor.textContent.trim())) {
        post.dataset.hideForSingleIgnoredQuote = "true";
        return;
      }
    }

    // Then process ALL blockquotes (including nested) for ghosting
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
    const mentions = post.querySelectorAll("em.mention");
    let hideIt = false;

    // Check if post should be hidden due to single ignored quote
    if (post.dataset.hideForSingleIgnoredQuote === "true") {
      hideIt = true;
      delete post.dataset.hideForSingleIgnoredQuote; // Clean up the data attribute
    }

    // Store user color for future highlights
    if (usernameEl && usernameEl.classList.contains("username-coloured")) {
      const username = usernameEl.textContent.trim();
      const color = usernameEl.style.color;
      if (color && !userColors[username]) {
        userColors[username] = color;
        GM_setValue("userColors", userColors);
      }
    }

    if (usernameEl && isUserIgnored(usernameEl.textContent.trim())) {
      hideIt = true;
    }
    mentions.forEach((m) => {
      if (isUserIgnored(m.textContent.trim().replace("@", ""))) {
        hideIt = true;
      }
    });
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
    // Remove any existing processed class first
    poll.classList.remove("content-processed");

    // First get the total votes across all options
    let totalVotes = 0;
    const options = poll.querySelectorAll("dl[data-poll-option-id]");
    options.forEach((option) => {
      const resultBar = option.querySelector(".resultbar");
      const pollBar = resultBar?.querySelector('[class^="pollbar"]');
      const voteCount = parseInt(pollBar?.textContent || "0", 10);
      totalVotes += voteCount;
    });

    // Process each poll option
    options.forEach((option) => {
      const voterBox = option.nextElementSibling;
      if (!voterBox || !voterBox.classList.contains("poll_voters_box")) return;

      const votersList = voterBox.querySelector(".poll_voters");
      if (!votersList) return;

      // Get original vote count
      const resultBar = option.querySelector(".resultbar");
      const pollBar = resultBar?.querySelector('[class^="pollbar"]');
      const voteCount = parseInt(pollBar?.textContent || "0", 10);

      // Process voters
      let newCount = voteCount;
      const voterSpans = Array.from(votersList.childNodes);

      // First pass: mark nodes for removal
      const toRemove = new Set();
      voterSpans.forEach((node, i) => {
        if (node.nodeType === Node.ELEMENT_NODE && node.matches("span[name]")) {
          const userLink = node.querySelector("a");
          if (!userLink) return;

          const userId = userLink.href.match(/[?&]u=(\d+)/)?.[1];
          const username = userLink.textContent.trim();

          if ((userId && isUserIgnored(userId)) || isUserIgnored(username)) {
            toRemove.add(node);
            // Also mark the preceding comma/space if it exists
            const prev = voterSpans[i - 1];
            if (prev && prev.nodeType === Node.TEXT_NODE) {
              toRemove.add(prev);
            }
            newCount--;
          }
        }
      });

      // Second pass: remove marked nodes
      toRemove.forEach((node) => node.remove());

      // Clean up any remaining leading commas
      const firstNode = votersList.firstChild;
      if (firstNode && firstNode.nodeType === Node.TEXT_NODE) {
        firstNode.remove();
      }

      // Update vote count, width percentage, and display percentage
      if (newCount !== voteCount && pollBar) {
        pollBar.textContent = String(newCount);

        // Calculate new width percentage based on highest vote count
        const maxVotes = Math.max(
          ...Array.from(options).map((opt) => {
            const bar = opt.querySelector('[class^="pollbar"]');
            return parseInt(bar?.textContent || "0", 10);
          })
        );

        // Set width relative to highest vote count (100%)
        const widthPercent = maxVotes > 0 ? (newCount / maxVotes) * 100 : 0;
        pollBar.style.width = `${widthPercent}%`;

        // Update the percentage text (this is relative to total votes)
        const percentEl = option.querySelector(".poll_option_percent");
        if (percentEl) {
          if (newCount === 0) {
            percentEl.textContent = "No votes";
          } else {
            // Calculate percentage of total remaining votes
            const newTotal = Array.from(options).reduce((sum, opt) => {
              const bar = opt.querySelector('[class^="pollbar"]');
              return sum + parseInt(bar?.textContent || "0", 10);
            }, 0);
            const percent = Math.round((newCount / newTotal) * 100);
            percentEl.textContent = `${percent}%`;
          }
        }
      }

      // If no voters left, update the text
      if (!votersList.querySelector("span[name]")) {
        votersList.innerHTML = '<span name="none">None</span>';
      }
    });

    // Update total votes
    const totalVotesEl = poll.querySelector(".poll_total_vote_cnt");
    if (totalVotesEl) {
      const newTotal = Array.from(
        poll.querySelectorAll('[class^="pollbar"]')
      ).reduce((sum, bar) => sum + parseInt(bar.textContent || "0", 10), 0);
      totalVotesEl.textContent = String(newTotal);
    }

    // Mark as processed at the end
    poll.classList.add("content-processed");
  }

  // Add poll refresh detection
  function setupPollRefreshDetection() {
    // Watch for form submissions
    document.addEventListener("submit", (e) => {
      const form = e.target;
      const poll = form.closest("fieldset.polls");
      if (poll) {
        // Remove processed class to show loading state
        poll.classList.remove("content-processed");
      }
    });

    // Add click handler for Submit vote button
    document.addEventListener("click", (e) => {
      if (
        e.target.matches(
          'input[type="submit"][name="update"][value="Submit vote"]'
        )
      ) {
        const poll = e.target.closest("fieldset.polls");
        if (poll) {
          poll.classList.remove("content-processed");
        }
      }
    });

    // Watch for DOM changes that might indicate a poll refresh
    const pollObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Check if this is a style change
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style"
        ) {
          const node = mutation.target;
          if (
            node.classList.contains("vote-submitted") &&
            node.style.display === "block"
          ) {
            // Hide the poll section
            const pollSection = node.closest("fieldset.polls");
            if (pollSection) {
              pollSection.style.visibility = "hidden";
            }
            // Refresh as soon as vote-submitted becomes visible
            window.location.reload();
            return;
          }
        }

        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if this is a poll or contains polls
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

  // This runs once after DOMContentLoaded
  async function processIgnoredContentOnce() {
    // Prefetch post data for last posts
    await cacheAllPosts();

    // Process polls
    document.querySelectorAll("fieldset.polls").forEach(processPoll);
    setupPollRefreshDetection();

    // Topic posters
    document.querySelectorAll(".topic-poster").forEach(processTopicPoster);

    // Posts
    document
      .querySelectorAll(".post:not(.content-processed)")
      .forEach(processPost);

    // Initial reaction popups
    document
      .querySelectorAll(".reaction-score-list:not(.content-processed)")
      .forEach(processReactionList);

    // Set up observer for future reaction lists
    const reactionObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const lists = node.classList?.contains("reaction-score-list")
              ? [node]
              : node.querySelectorAll(".reaction-score-list");
            lists.forEach((list) => {
              if (!list.classList.contains("content-processed")) {
                processReactionList(list);
              }
            });
          }
        });
      });
    });

    reactionObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Notifications
    document
      .querySelectorAll(".notification-block:not(.content-processed)")
      .forEach(processNotification);

    // Lastpost cells
    const lastPosts = document.querySelectorAll(
      "dd.lastpost:not(.content-processed), #recent-topics li dd.lastpost:not(.content-processed)"
    );
    await Promise.all(Array.from(lastPosts).map(processLastPost));

    // Mark leftover rows as processed
    document
      .querySelectorAll("li.row:not(.content-processed)")
      .forEach((row) => {
        const lp = row.querySelector("dd.lastpost");
        if (lp && !lp.classList.contains("content-processed")) {
          return;
        }
        row.classList.add("content-processed");
      });
  }

  // ---------------------------------------------------------------------
  // 7) AVATAR REPLACEMENT
  // ---------------------------------------------------------------------

  function replaceUserAvatars() {
    const avatars = document.querySelectorAll("img.avatar");
    avatars.forEach((img) => {
      const match = img.src.match(/avatar=(\d+)/);
      if (match) {
        const uid = match[1];
        if (replacedAvatars.hasOwnProperty(uid)) {
          img.src = replacedAvatars[uid];
        }
      }
    });
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
  // 8) PROFILE BUTTONS: GHOST + REPLACE AVATAR
  // ---------------------------------------------------------------------

  function addGhostButtonsIfOnProfile() {
    const memberlistTitle = document.querySelector(".memberlist-title");
    if (!memberlistTitle) return;
    if (document.getElementById("ghost-user-button")) return;

    const userId = getUserIdFromUrl();
    const parts = memberlistTitle.textContent.split("-");
    const username = parts[1]?.trim() || "Unknown User";
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
  // 9) SHOW/HIDE GHOSTED POSTS
  // ---------------------------------------------------------------------

  function addShowGhostedPostsButton() {
    // Check if there's any ghosted content first
    const hasGhostedPosts =
      document.querySelectorAll(".ghosted-post").length > 0;
    const hasGhostedQuotes =
      document.querySelectorAll(".ghosted-quote").length > 0;
    const hasGhostedRows = document.querySelectorAll(".ghosted-row").length > 0;

    if (!hasGhostedPosts && !hasGhostedQuotes && !hasGhostedRows) {
      return;
    }

    const actionBars = document.querySelectorAll(
      ".action-bar.bar-top, .action-bar.bar-bottom"
    );
    actionBars.forEach((bar) => {
      if (bar.querySelector(".show-ghosted-posts")) return;

      const container = document.createElement("div");
      container.className =
        "dropdown-container dropdown-button-control topic-tools";

      const button = document.createElement("span");
      button.className =
        "button button-secondary dropdown-trigger show-ghosted-posts";
      button.title = showGhostedPosts
        ? "Hide Ghosted Posts"
        : "Show Ghosted Posts";
      button.innerHTML = `<i class="icon fa-${
        showGhostedPosts ? "eye-slash" : "eye"
      } fa-fw"></i><span>${
        showGhostedPosts ? "Hide" : "Show"
      } Ghosted Posts</span>`;
      button.addEventListener("click", (e) => {
        e.preventDefault();
        toggleGhostedPosts();
      });

      container.appendChild(button);

      // Insert it at the beginning if possible
      const firstBtn = bar.querySelector(".dropdown-container");
      if (firstBtn && firstBtn.parentNode === bar) {
        bar.insertBefore(container, firstBtn);
      } else {
        bar.appendChild(container);
      }
    });

    // Apply initial state if showing
    if (showGhostedPosts) {
      document
        .querySelectorAll(".post.ghosted-post")
        .forEach((p) => p.classList.add("show"));
      document
        .querySelectorAll(".ghosted-quote")
        .forEach((q) => q.classList.add("show"));
      document
        .querySelectorAll(".ghosted-row")
        .forEach((r) => r.classList.add("show"));
      document.body.classList.add("show-hidden-threads");
    }
  }

  function toggleGhostedPosts() {
    showGhostedPosts = !showGhostedPosts;
    GM_setValue("showGhostedPosts", showGhostedPosts);

    const buttons = document.querySelectorAll(".show-ghosted-posts");
    buttons.forEach((btn) => {
      const textSpan = btn.querySelector("span:not(.icon)");
      const icon = btn.querySelector("i");
      if (!textSpan || !icon) return;

      textSpan.textContent = showGhostedPosts
        ? "Hide Ghosted Posts"
        : "Show Ghosted Posts";
      icon.className = `icon fa-${
        showGhostedPosts ? "eye-slash" : "eye"
      } fa-fw`;
    });

    document
      .querySelectorAll(".post.ghosted-post")
      .forEach((p) => p.classList.toggle("show", showGhostedPosts));
    document
      .querySelectorAll(".ghosted-quote")
      .forEach((q) => q.classList.toggle("show", showGhostedPosts));
    document
      .querySelectorAll(".ghosted-row")
      .forEach((r) => r.classList.toggle("show", showGhostedPosts));

    document.body.classList.toggle("show-hidden-threads", showGhostedPosts);
  }

  // ---------------------------------------------------------------------
  // 10) MISC
  // ---------------------------------------------------------------------

  function moveExternalLinkIcon() {
    // Just a small tweak that moves the external link icon after the time
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

  function removeNotificationButtonId() {
    // Remove the ID from the notification list button
    const notificationButton = document.querySelector(
      "#notification_list_button"
    );
    if (notificationButton) {
      notificationButton.removeAttribute("id");
    }
    const notificationList = document.querySelector("#notification_list");
    if (notificationList) {
      notificationList.removeAttribute("id");
    }
  }

  function cleanGhostedQuotesInTextarea() {
    const textarea = document.querySelector("textarea#message");
    if (!textarea || !textarea.value.includes("[quote")) return;
    let text = textarea.value;

    // Remove quotes referencing ignored user IDs
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

  // ---------------------------------------------------------------------
  // 11) RT PAGE INJECTION
  // ---------------------------------------------------------------------

  async function injectRTContent() {
    // Only run on the newposts page
    if (!window.location.href.includes("search.php?search_id=newposts")) return;

    try {
      // Get the target container and store original avatars
      const targetList = document.querySelector(".topiclist.topics");
      if (!targetList) return;

      // Store original avatars before removing rows
      const originalAvatars = new Map();
      targetList.querySelectorAll("li.row").forEach((row) => {
        const userLinks = row.querySelectorAll(
          "a.username, a.username-coloured"
        );
        userLinks.forEach((link) => {
          const userId = link.href.match(/u=(\d+)/)?.[1];
          if (userId) {
            const avatar = row.querySelector("img.avatar");
            if (avatar) {
              originalAvatars.set(userId, avatar.src);
            }
          }
        });
      });

      // Clear existing rows
      while (targetList.firstChild) {
        targetList.removeChild(targetList.firstChild);
      }

      // Fetch the RT page content
      const response = await fetch(
        "https://rpghq.org/forums/rt?recent_topics_start=0"
      );
      const text = await response.text();
      const parser = new DOMParser();
      const rtDoc = parser.parseFromString(text, "text/html");

      // Get the RT rows
      const rtRows = Array.from(
        rtDoc.querySelectorAll(".topiclist.topics li.row")
      );
      if (!rtRows.length) return;

      // Process each RT row before injecting
      rtRows.forEach((row) => {
        // Fix the links to be absolute
        row.querySelectorAll('a[href^="./"]').forEach((link) => {
          link.href = link.href.replace("./", "https://rpghq.org/forums/");
        });

        // Fix forum hierarchy display
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

        // Change external link icon color for unread rows
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

        if (isUnread) {
          const externalIcon = row.querySelector(".icon-lightgray");
          if (externalIcon) {
            externalIcon.classList.remove("icon-lightgray");
            externalIcon.classList.add("icon-red");
          }
        }

        // Add the row to the target list
        targetList.appendChild(row);
      });
    } catch (error) {
      console.error("Failed to inject RT content:", error);
    }
  }

  // ---------------------------------------------------------------------
  // 12) INIT ON DOMContentLoaded
  // ---------------------------------------------------------------------

  document.addEventListener("DOMContentLoaded", async () => {
    createTooltip();

    // Inject RT content first
    await injectRTContent();

    // Main pass: fetch & hide ghosted content
    await processIgnoredContentOnce();

    // Avatars
    replaceUserAvatars();
    // Ghost toggle button
    addShowGhostedPostsButton();
    // Profile ghost button
    addGhostButtonsIfOnProfile();
    // Misc
    moveExternalLinkIcon();
    removeNotificationButtonId();
    cleanGhostedQuotesInTextarea();

    // Finally, mark each container as processed (remove the spinner)
    document
      .querySelectorAll(".topiclist.topics, #recent-topics, .topiclist.forums")
      .forEach((container) => container.classList.add("content-processed"));
  });
})();
