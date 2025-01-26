// ==UserScript==
// @name         Ghost Users
// @namespace    http://tampermonkey.net/
// @version      3.4.0
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
    .topiclist.forums:not(.content-processed) {
      position: relative;
      min-height: 32px;
    }
    /* Single spinner in the center */
    .topiclist.topics:not(#pinned-threads-list):not(.content-processed)::after,
    #recent-topics:not(.content-processed)::after,
    .topiclist.forums:not(.content-processed)::after {
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
    .topiclist.forums:not(.content-processed) > *:not(style) {
      visibility: hidden;
    }

    /* Once processed, reveal child items */
    .topiclist.topics:not(#pinned-threads-list).content-processed > *,
    #recent-topics.content-processed > *,
    .topiclist.forums.content-processed > * {
      visibility: visible !important;
    }

    /* Hide main post containers until processed */
    .post.bg1:not(.content-processed),
    .post.bg2:not(.content-processed),
    dd.lastpost:not(.content-processed),
    .notification-block:not(.content-processed) {
      visibility: hidden !important;
    }

    /* Once processed and not ghosted, show content */
    .content-processed:not(.ghosted-post):not(.ghosted-row):not(.ghosted-quote),
    .reaction-score-list.content-processed {
      visibility: visible !important;
    }

    /* Ghosted row styling */
    .ghosted-row {
      display: none !important;
    }
    .ghosted-row.show {
      display: block !important;
      background-color: rgba(255, 0, 0, 0.1) !important;
    }

    /* Ghosted posts and quotes */
    .ghosted-post, .ghosted-quote {
      display: none !important;
    }
    .ghosted-post.show, .ghosted-quote.show {
      display: block !important;
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

      // Position near cursor
      const tooltipX = Math.max(10, event.pageX - tooltip.offsetWidth - 10);
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
    // (1) Remove the subject URL line
    content = content.replace(/^\[url=[^\]]+\]Subject:[^\]]+\[\/url\]\s*/m, "");

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
        `https://rpghq.org/forums/ucp.php?i=pm&mode=compose&action=quotepost&p=${postId}`
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
    const recentTopicLi = element.closest("#recent-topics li");
    if (recentTopicLi) {
      // For "recent topics" block
      recentTopicLi.style.display = "none";
      return;
    }
    const rowItem = element.closest("li.row");
    if (rowItem) {
      rowItem.classList.add("ghosted-row");
    } else {
      // Fallback
      element.style.display = "none";
    }
  }

  async function processLastPost(element) {
    // Skip pinned threads
    if (element.closest("#pinned-threads-list")) {
      element.classList.add("content-processed");
      return;
    }
    const spanEl = element.querySelector("span");
    if (!spanEl) return;

    // We look for the "by" text node
    const byTextNode = Array.from(spanEl.childNodes).find(
      (node) =>
        node.nodeType === Node.TEXT_NODE &&
        node.textContent.trim().toLowerCase() === "by"
    );
    if (!byTextNode) return;

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

      if (userEl && isUserIgnored(userEl.textContent.trim())) {
        hideTopicRow(element);
      } else {
        // Or we check the post content for ghosted quotes
        const lastLink = element.querySelector(
          'a[title="Go to last post"], a[title="View the latest post"]'
        );
        const altLink =
          lastLink == null
            ? element.querySelector('a[href*="viewtopic.php"][href*="#p"]')
            : null;
        const subjLink =
          lastLink || altLink ? null : element.querySelector("a.lastsubject");

        const link = lastLink || altLink || subjLink;
        if (link) {
          const pid = link.href.match(/[#&]p=?(\d+)/)?.[1];
          if (pid) {
            const content = await fetchAndCachePost(pid);
            if (content && postContentContainsGhosted(content)) {
              hideTopicRow(element);
            } else {
              // Add hover preview on the icon
              [lastLink, altLink, subjLink].filter(Boolean).forEach((l) => {
                const icon = l.querySelector(".icon");
                if (icon) {
                  icon.addEventListener("mouseenter", (e) =>
                    showPostPreview(e, pid)
                  );
                  icon.addEventListener("mouseleave", hidePostPreview);
                }
              });
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
    // In actual page posts, see if any blockquote is from an ignored user
    const blockquotes = post.querySelectorAll(".content blockquote");
    blockquotes.forEach((bq) => {
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

  // This runs once after DOMContentLoaded
  async function processIgnoredContentOnce() {
    // Prefetch post data for last posts
    await cacheAllPosts();

    // Posts
    document
      .querySelectorAll(".post:not(.content-processed)")
      .forEach(processPost);

    // Reaction popups
    document
      .querySelectorAll(".reaction-score-list:not(.content-processed)")
      .forEach(processReactionList);

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
      button.title = "Show Ghosted Posts";
      button.innerHTML = `<i class="icon fa-eye fa-fw"></i><span>Show Ghosted Posts</span>`;
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
  }

  function toggleGhostedPosts() {
    const buttons = document.querySelectorAll(".show-ghosted-posts");
    const currentlyShowing =
      buttons[0]?.querySelector("span:not(.icon)")?.textContent ===
      "Hide Ghosted Posts";

    buttons.forEach((btn) => {
      const textSpan = btn.querySelector("span:not(.icon)");
      const icon = btn.querySelector("i");
      if (!textSpan || !icon) return;

      if (currentlyShowing) {
        textSpan.textContent = "Show Ghosted Posts";
        icon.className = "icon fa-eye fa-fw";
      } else {
        textSpan.textContent = "Hide Ghosted Posts";
        icon.className = "icon fa-eye-slash fa-fw";
      }
    });

    document
      .querySelectorAll(".post.ghosted-post")
      .forEach((p) => p.classList.toggle("show"));
    document
      .querySelectorAll(".ghosted-quote")
      .forEach((q) => q.classList.toggle("show"));
    document
      .querySelectorAll(".ghosted-row")
      .forEach((r) => r.classList.toggle("show"));

    document.body.classList.toggle("show-hidden-threads");
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
  // 11) INIT ON DOMContentLoaded
  // ---------------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", async () => {
    createTooltip();

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
    cleanGhostedQuotesInTextarea();

    // Finally, mark each container as processed (remove the spinner)
    document
      .querySelectorAll(".topiclist.topics, #recent-topics, .topiclist.forums")
      .forEach((container) => container.classList.add("content-processed"));
  });
})();
