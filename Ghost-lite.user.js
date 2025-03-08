// ==UserScript==
// @name         RPGHQ - Iggy Iggy Iggy
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Highlights content from iggy'd users rather than hiding them, while leaving reaction score list logic intact.
// @author       You
// @match        https://rpghq.org/*/*
// @run-at       document-start
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/main/Ghost-lite.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/main/Ghost-lite.user.js
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
  const postCache = GM_getValue("postCache", {}); // postId => { content, timestamp }

  let showGhostedPosts = false; // (toggle functionality is now disabled)

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
       2) Hide unprocessed content
       ----------------------------------------------------------------- */
    /* Hide child elements in these containers until processed */
    fieldset.polls:not(.content-processed) > *:not(style) {
      visibility: hidden;
    }
    /* Hide badges until processed */
    strong.badge:not(.content-processed),
    .reaction-score-list:not(.content-processed) {
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
    .content-processed:not(.ghosted-post):not(.ghosted-row):not(.ghosted-quote) {
      visibility: visible !important;
    }

    /* -----------------------------------------------------------------
       4) Ghosted element styling (modified to highlight instead of hide)
       ----------------------------------------------------------------- */
    .ghosted-row {
      display: block !important; /* Always visible */
    }
    .ghosted-row.ghosted-by-author {
      background-color: rgba(255, 0, 0, 0.1) !important;
    }
    .ghosted-row.ghosted-by-content {
      background-color: rgba(255, 128, 0, 0.1) !important;
    }
    .ghosted-post,
    .ghosted-quote {
      display: block !important; /* Always visible */
      border: 3px solid;
      border-image: linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet) 1;
      border-image-slice: 1;
      border-radius: 4px;
      padding: 6px;
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
    // Extract just the numeric ID part, even if followed by a dash and username
    const match = window.location.href.match(/u=(\d+)(?:-[\w-]+)?/);
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
  // 5) CONTENT PROCESSING / HIGHLIGHTING LOGIC (instead of hiding)
  // ---------------------------------------------------------------------

  function postContentContainsGhosted(content) {
    if (!content) return false;
    for (const userId in ignoredUsers) {
      const username = ignoredUsers[userId];
      if (content.toLowerCase().includes(username.toLowerCase())) {
        return true;
      }
    }
    return false;
  }

  function postContentContainsMentionedGhosted(post) {
    const contentDiv = post.querySelector(".content");
    if (!contentDiv) return false;
    const postText = contentDiv.textContent;
    if (!postText) return false;
    for (const userId in ignoredUsers) {
      const username = ignoredUsers[userId];
      if (postText.toLowerCase().includes(username.toLowerCase())) {
        return true;
      }
    }
    return false;
  }

  /**
   * Consolidated function to process topic rows and determine if they should be ghosted
   * @param {Element} element - The element to process (row or cell)
   * @param {boolean} markProcessed - Whether to mark the element as processed
   * @returns {Promise<void>}
   */
  async function processTopicRow(element, markProcessed = true) {
    // Find the row element
    const recentTopicLi = element.closest("#recent-topics li");
    const rowItem = recentTopicLi || element.closest("li.row");

    if (!rowItem) {
      // If no row found, just mark the element itself as processed
      if (markProcessed) element.classList.add("content-processed");
      return;
    }

    // Skip certain forums
    const forumLinks = rowItem.querySelectorAll(
      ".forum-links a, .responsive-hide a"
    );
    const forumNames = Array.from(forumLinks).map((link) =>
      link.textContent.trim()
    );
    if (
      forumNames.includes("Moderation Station") ||
      forumNames.includes("Chat With Staff")
    ) {
      if (markProcessed) element.classList.add("content-processed");
      return;
    }

    // Clean up author-name classes
    Array.from(rowItem.classList).forEach((cls) => {
      if (cls.startsWith("author-name-")) rowItem.classList.remove(cls);
    });

    // Check for ghosted authors in the row
    const authorLinks = rowItem.querySelectorAll(
      "a.username, a.username-coloured"
    );
    const authorNames = Array.from(authorLinks).map((link) =>
      link.textContent.trim()
    );
    const hasGhostedAuthor = authorNames.some((name) => isUserIgnored(name));

    // Check for ghosted class
    const hasGhostedClass = Array.from(rowItem.classList).some(
      (cls) =>
        cls.startsWith("author-name-") &&
        isUserIgnored(cls.replace("author-name-", ""))
    );

    // Check for "by username" text
    let hasGhostedInBy = false;
    const innerDiv = rowItem.querySelector(".list-inner");
    if (innerDiv) {
      const byText = innerDiv.textContent.toLowerCase();
      hasGhostedInBy = Object.values(ignoredUsers).some((username) =>
        byText.includes(`by ${username.toLowerCase()}`)
      );
    }

    // Process responsive-hide element (from cleanupTopicAuthor)
    const responsiveHide = element.querySelector(".responsive-hide");
    if (responsiveHide && responsiveHide.textContent.trim().includes("» in")) {
      const masWrap = responsiveHide.querySelector(".mas-wrap");
      if (masWrap) {
        const userLink = masWrap.querySelector(".mas-username a");
        if (userLink) {
          const userId = userLink.href.match(/u=(\d+)/)?.[1];
          const username = userLink.textContent.trim();

          if ((userId && isUserIgnored(userId)) || isUserIgnored(username)) {
            const nodes = Array.from(responsiveHide.childNodes);
            const byTextNodeIndex = nodes.findIndex(
              (node) =>
                node.nodeType === Node.TEXT_NODE &&
                node.textContent.trim().toLowerCase() === "by"
            );

            if (byTextNodeIndex !== -1) {
              const arrowTextNode = nodes.find(
                (node, index) =>
                  index < byTextNodeIndex &&
                  node.nodeType === Node.TEXT_NODE &&
                  node.textContent.includes("»")
              );

              if (arrowTextNode) responsiveHide.removeChild(arrowTextNode);
              responsiveHide.removeChild(nodes[byTextNodeIndex]);
              masWrap.remove();

              // Mark as ghosted by author since we removed author info
              rowItem.classList.add("ghosted-row", "ghosted-by-author");
            }
          }
        }
      }
    }

    // Check if we're in a forum or search view
    const isViewForum = window.location.href.includes("/viewforum.php");
    const isSearch = window.location.href.includes("/search.php");
    let shouldGhostByContent = false;
    let shouldGhostByAuthor =
      hasGhostedAuthor || hasGhostedClass || hasGhostedInBy;

    // Check for post content in lastpost
    const lastpostCell = rowItem.querySelector("dd.lastpost");
    if (lastpostCell) {
      const authorLink = lastpostCell.querySelector(
        "a.username, a.username-coloured"
      );

      if (authorLink && isUserIgnored(authorLink.textContent.trim())) {
        // Last post author is ghosted
        if (isViewForum)
          lastpostCell.classList.add("ghosted-row", "ghosted-by-author");
        shouldGhostByAuthor = true;
      } else {
        // Check post content
        const link = lastpostCell.querySelector(
          'a[href*="viewtopic.php"][href*="#p"]'
        );
        if (link) {
          const pid = link.href.match(/[#&]p=?(\d+)/)?.[1];
          if (pid) {
            // First check if the post is already in the cache
            if (postCache[pid] && postCache[pid].content) {
              const content = postCache[pid].content;
              if (postContentContainsGhosted(content)) {
                if (isViewForum)
                  lastpostCell.classList.add(
                    "ghosted-row",
                    "ghosted-by-content"
                  );
                shouldGhostByContent = true;
              }
            } else {
              // If not in cache, fetch it
              try {
                const content = await fetchAndCachePost(pid);
                if (content && postContentContainsGhosted(content)) {
                  if (isViewForum)
                    lastpostCell.classList.add(
                      "ghosted-row",
                      "ghosted-by-content"
                    );
                  shouldGhostByContent = true;
                }
              } catch (err) {
                console.error(`Error fetching post ${pid}:`, err);
              }
            }
          }
        }
      }
    }

    // Apply ghosting based on what we found
    if (shouldGhostByAuthor) {
      rowItem.classList.add("ghosted-row", "ghosted-by-author");
    } else if (shouldGhostByContent) {
      rowItem.classList.add("ghosted-row", "ghosted-by-content");
    }

    if (markProcessed) element.classList.add("content-processed");
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

    const titleText = titleEl.textContent.trim();
    const isQuoteOrMention =
      titleText.startsWith("Quoted") || titleText.includes("mentioned by");
    const firstUsername = usernames[0];

    if (isQuoteOrMention && isUserIgnored(firstUsername)) {
      const row = item.closest("li.row");
      if (row) {
        row.classList.add("ghosted-row", "ghosted-by-author");
        const markReadInput = row.querySelector('input[name^="mark"]');
        if (markReadInput) {
          try {
            markReadInput.checked = true;
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (err) {
            console.error("Failed to mark notification as read:", err);
          }
        }
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
        const markReadInput = row.querySelector('input[name^="mark"]');
        if (markReadInput) {
          try {
            markReadInput.checked = true;
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (err) {
            console.error("Failed to mark notification as read:", err);
          }
        }
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
    nodesAfter.forEach((node) => titleEl.appendChild(node));
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

    // Check if this is a reaction notification
    const titleEl = item.querySelector(".notification-title");
    const isReactionNotification =
      titleEl &&
      titleEl.textContent.includes("has reacted to a message you posted");

    const firstUsername = usernames[0];
    if (isUserIgnored(firstUsername)) {
      const li = item.closest("li");
      if (li) {
        // Try to find the mark read input first
        const markReadInput = li.querySelector('input[name^="mark"]');
        if (markReadInput) {
          try {
            markReadInput.checked = true;
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (err) {
            console.error("Failed to mark notification as read:", err);
          }
        } else {
          // If no input found, try to find the mark read link (for reaction notifications)
          const markReadLink = li.querySelector(".mark_read.icon-mark");
          if (markReadLink) {
            try {
              markReadLink.click();
              await new Promise((resolve) => setTimeout(resolve, 100));
            } catch (err) {
              console.error("Failed to mark notification as read:", err);
            }
          }
        }

        // Hide the notification regardless of type
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

    if (!titleEl) {
      item.classList.add("content-processed");
      return;
    }

    if (nonIgnored.length === 0) {
      const li = item.closest("li");
      if (li) {
        const markReadLink = li.querySelector(".mark_read.icon-mark");
        if (markReadLink) {
          try {
            markReadLink.click();
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (err) {
            console.error("Failed to mark notification as read:", err);
          }
        }

        // Hide the notification regardless of type
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
    if (!hideIt && postContentContainsMentionedGhosted(post)) {
      hideIt = true;
      post.classList.add("ghosted-by-content");
    }
    if (hideIt) {
      post.classList.add("ghosted-post");
    }
    const reactionLists = post.querySelectorAll(
      ".reaction-score-list:not(.content-processed)"
    );
    if (reactionLists.length > 0) {
      processReactionLists();
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
    const reactionImages = document.querySelectorAll("img[reaction-username]");
    reactionImages.forEach((img) => {
      const username = img.getAttribute("reaction-username");
      if (username) {
        const lowercaseUsername = username.toLowerCase();
        if (isUserIgnored(lowercaseUsername)) {
          img.remove();
        }
      }
    });
  }

  async function processIgnoredContentOnce() {
    document.querySelectorAll("li.row").forEach(async (row) => {
      await processTopicRow(row);
    });
    await Promise.all(
      Array.from(
        document.querySelectorAll(".notification-block:not(.content-processed)")
      ).map(processNotification)
    );
    await cacheAllPosts();
    document.querySelectorAll("fieldset.polls").forEach(processPoll);
    setupPollRefreshDetection();
    document.querySelectorAll(".topic-poster").forEach(processTopicPoster);
    document
      .querySelectorAll(".post:not(.content-processed)")
      .forEach(processPost);
    document
      .querySelectorAll(".reaction-score-list")
      .forEach(processReactionList);
    processReactionImages();
    const reactionObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const lists = node.classList?.contains("reaction-score-list")
              ? [node]
              : node.querySelectorAll(".reaction-score-list");
            lists.forEach((list) => processReactionList(list));
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
    await Promise.all(
      Array.from(lastPosts).map(async (lp) => {
        await processTopicRow(lp, false);
      })
    );
    document
      .querySelectorAll("li.row:not(.content-processed)")
      .forEach((row) => {
        const lp = row.querySelector("dd.lastpost");
        if (lp && !lp.classList.contains("content-processed")) return;
        row.classList.add("content-processed");
      });
  }

  // ---------------------------------------------------------------------
  // 6) PROFILE BUTTONS: GHOST + REPLACE AVATAR
  // ---------------------------------------------------------------------

  function addGhostButtonsIfOnProfile() {
    const memberlistTitle = document.querySelector(".memberlist-title");
    if (!memberlistTitle || document.getElementById("ghost-user-button"))
      return;
    const userId = getUserIdFromUrl();
    const titleText = Array.from(memberlistTitle.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent.trim())
      .join(" ");
    let username = "Unknown User";
    const match = titleText.match(/Viewing profile - (.+)/);
    if (match && match[1]) {
      username = match[1].trim();
    }
    username = cleanUsername(username);
    if (!userId) return;
    const container = document.createElement("div");
    container.style.display = "inline-block";
    container.style.marginLeft = "10px";
    const ghostBtn = document.createElement("a");
    ghostBtn.id = "ghost-user-button";
    ghostBtn.className = "button button-secondary";
    ghostBtn.href = "#";
    container.appendChild(ghostBtn);
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
  }

  // ---------------------------------------------------------------------
  // 7) SHOW/HIGHLIGHT GHOSTED POSTS TOGGLE VIA KEYBOARD (disabled)
  // ---------------------------------------------------------------------
  // The original toggle functionality has been disabled so that ghosted content
  // is always visible (highlighted via CSS). The keyboard listener below has been removed.

  // ---------------------------------------------------------------------
  // 8) MISC HELPER FUNCTIONS
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
  // 9) IGNORED USERS MANAGEMENT
  // ---------------------------------------------------------------------

  function showIgnoredUsersPopup() {
    const popup = document.createElement("div");
    popup.id = "ignored-users-popup";
    popup.style.cssText = `
      position: fixed;
      top: 50%;
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
  // 11) INIT ON DOMContentLoaded
  // ---------------------------------------------------------------------

  function startPeriodicReactionCheck() {
    processReactionImages();
    setInterval(processReactionImages, 2000);
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
    startPeriodicReactionCheck();
    const needsFetching = await cacheAllPosts();
    document.querySelectorAll("li.row").forEach((row) => {
      const lp = row.querySelector("dd.lastpost");
      if (lp && !lp.classList.contains("content-processed")) return;
      row.classList.add("content-processed");
    });
    if (!needsFetching) {
      document
        .querySelectorAll(
          ".topiclist.topics, #recent-topics, .topiclist.forums"
        )
        .forEach((container) => {
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
            container.classList.add("content-processed");
          }
        });
    }
    await processIgnoredContentOnce();
    addGhostButtonsIfOnProfile();
    addShowIgnoredUsersButton();
    processOnlineList();
    moveExternalLinkIcon();
    cleanGhostedQuotesInTextarea();
    observeReactionLists();
  });

  // ---------------------------------------------------------------------
  // RPGHQ Reaction List Integration (unchanged)
  // ---------------------------------------------------------------------

  function addPreventDefaultToReactionList(reactionList) {
    reactionList.addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        const postId = reactionList.dataset.postId;
        if (postId) {
          showCustomReactionsPopup(postId);
        }
        return false;
      },
      true
    );
    reactionList.querySelectorAll("a").forEach((link) => {
      link.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          const postId = reactionList.dataset.postId;
          if (postId) {
            showCustomReactionsPopup(postId);
          }
          return false;
        },
        true
      );
    });
  }

  const reactionsCache = new Map();

  async function fetchReactionsWithCache(postId) {
    if (reactionsCache.has(postId)) {
      return reactionsCache.get(postId);
    }
    try {
      const response = await fetch(
        `https://rpghq.org/forums/reactions?mode=view&post=${postId}`,
        {
          method: "POST",
          headers: {
            accept: "application/json, text/javascript, */*; q=0.01",
            "x-requested-with": "XMLHttpRequest",
          },
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data && data.htmlContent) {
        reactionsCache.set(postId, data);
      }
      return data;
    } catch (error) {
      console.error("Error fetching reaction data:", error);
      throw error;
    }
  }

  function invalidateReactionsCache(postId) {
    if (reactionsCache.has(postId)) {
      reactionsCache.delete(postId);
      console.log(`Invalidated reactions cache for post ${postId}`);
    }
  }

  function setupReactionChangeDetection() {
    document.addEventListener("click", async (e) => {
      const reactionButton = e.target.closest("a[href*='reactions?mode=give']");
      if (!reactionButton) return;
      const hrefMatch = reactionButton.href.match(/post=(\d+)/);
      const postId = hrefMatch ? hrefMatch[1] : null;
      if (postId) {
        console.log(`Detected reaction click for post ${postId}`);
        setTimeout(() => {
          invalidateReactionsCache(postId);
          document
            .querySelectorAll(`.reaction-score-list[data-post-id="${postId}"]`)
            .forEach((list) => {
              list.classList.remove("content-processed");
            });
          processReactionLists();
        }, 1000);
      }
    });
  }

  function showCustomReactionsPopup(postId) {
    const existingPopup = document.querySelector(".reactions-view-dialog");
    const existingOverlay = document.querySelector(
      ".cbb-overlay.js-dialog-overlay"
    );

    if (existingPopup) {
      existingPopup.remove();
    }

    if (existingOverlay) {
      existingOverlay.remove();
    }

    // Create overlay
    const overlay = document.createElement("div");
    overlay.className = "cbb-overlay js-dialog-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    overlay.style.zIndex = "9998"; // One less than the popup
    document.body.appendChild(overlay);

    // Prevent scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const popup = document.createElement("div");
    popup.className = "cbb-dialog reactions-view-dialog fixed";
    popup.title = "";
    popup.style.width = "600px";
    popup.style.position = "fixed";
    const totalHeight = 440;
    const viewportHeight = window.innerHeight;
    if (totalHeight > viewportHeight) {
      popup.style.top = "10px";
    } else {
      popup.style.top = Math.max(0, (viewportHeight - totalHeight) / 2) + "px";
    }
    popup.style.zIndex = "9999";
    const header = document.createElement("div");
    header.className = "cbb-dialog-header";
    const closeButton = document.createElement("a");
    closeButton.href = "#";
    closeButton.dataset.action = "close";
    closeButton.className = "cbb-dialog-close";
    closeButton.innerHTML = '<i class="fa fa-remove" aria-hidden="true"></i>';
    closeButton.addEventListener("click", (e) => {
      e.preventDefault();
      popup.remove();
      overlay.remove();
      // Restore scrolling
      document.body.style.overflow = originalOverflow;
    });
    const title = document.createElement("span");
    title.className = "cbb-dialog-title";
    title.textContent = "Reactions";
    header.appendChild(closeButton);
    header.appendChild(title);
    const content = document.createElement("div");
    content.className = "cbb-dialog-content";
    content.style.height = "400px";
    content.style.overflowY = "auto";
    content.innerHTML =
      '<div style="text-align: center; padding: 20px;"><i class="fa fa-spinner fa-spin fa-3x"></i></div>';
    popup.appendChild(header);
    popup.appendChild(content);
    document.body.appendChild(popup);

    // Add click handler to overlay to close popup
    overlay.addEventListener("click", () => {
      popup.remove();
      overlay.remove();
      // Restore scrolling
      document.body.style.overflow = originalOverflow;
    });

    const escapeHandler = (e) => {
      if (e.key === "Escape") {
        popup.remove();
        overlay.remove();
        // Restore scrolling
        document.body.style.overflow = originalOverflow;
        document.removeEventListener("keydown", escapeHandler);
      }
    };
    document.addEventListener("keydown", escapeHandler);
    fetchReactionsWithCache(postId)
      .then((data) => {
        if (data.htmlContent) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(data.htmlContent, "text/html");
          const reactionsList = document.createElement("div");
          reactionsList.className = "reactions-list";
          const tabHeader = doc.querySelector(".tab-header");
          const tabContents = doc.querySelectorAll(".tab-content");
          let newTabHeader = null;
          if (tabHeader) {
            newTabHeader = tabHeader.cloneNode(true);
            newTabHeader.querySelectorAll("a").forEach((link) => {
              link.href = "#";
              link.addEventListener("click", (e) => {
                e.preventDefault();
                newTabHeader
                  .querySelectorAll("a")
                  .forEach((a) => a.classList.remove("active"));
                link.classList.add("active");
                const tabId = link.dataset.id;
                reactionsList
                  .querySelectorAll(".tab-content")
                  .forEach((tab) => {
                    if (tab.dataset.id === tabId) {
                      tab.classList.remove("cbb-helper-hidden");
                    } else {
                      tab.classList.add("cbb-helper-hidden");
                    }
                  });
              });
            });
            reactionsList.appendChild(newTabHeader);
          }
          let totalIgnoredUsers = new Set();
          let tabsToRemove = new Set();
          tabContents.forEach((tabContent) => {
            const newTabContent = tabContent.cloneNode(true);
            let ignoredCount = 0;
            let totalCount = 0;
            const tabId = newTabContent.dataset.id;
            if (GM_getValue("hideGhostedContent", true)) {
              totalCount = newTabContent.querySelectorAll("li").length;
              newTabContent.querySelectorAll("li").forEach((li) => {
                const usernameElement = li.querySelector(".cbb-helper-text a");
                if (usernameElement) {
                  const username = usernameElement.textContent.trim();
                  if (isUserIgnored(username)) {
                    li.remove();
                    ignoredCount++;
                    totalIgnoredUsers.add(username);
                  }
                }
              });
              if (
                tabId !== "0" &&
                ignoredCount > 0 &&
                ignoredCount >= totalCount
              ) {
                tabsToRemove.add(tabId);
              }
            }
            if (ignoredCount > 0 && newTabHeader) {
              const tabLink = newTabHeader.querySelector(
                `a[data-id="${tabId}"]`
              );
              if (tabLink && tabId !== "0") {
                const tabCounter = tabLink.querySelector(".tab-counter");
                if (tabCounter) {
                  const currentCount = parseInt(
                    tabCounter.textContent.trim(),
                    10
                  );
                  if (!isNaN(currentCount)) {
                    const newCount = Math.max(0, currentCount - ignoredCount);
                    tabCounter.textContent = newCount.toString();
                  }
                } else {
                  const countMatch = tabLink.textContent.match(/\((\d+)\)/);
                  if (countMatch && countMatch[1]) {
                    const originalCount = parseInt(countMatch[1], 10);
                    const newCount = Math.max(0, originalCount - ignoredCount);
                    tabLink.textContent = tabLink.textContent.replace(
                      /\(\d+\)/,
                      `(${newCount})`
                    );
                  }
                }
              }
            }
            reactionsList.appendChild(newTabContent);
          });
          if (newTabHeader && tabsToRemove.size > 0) {
            tabsToRemove.forEach((tabId) => {
              const tabToRemove = newTabHeader.querySelector(
                `a[data-id="${tabId}"]`
              );
              if (tabToRemove) {
                tabToRemove.remove();
              }
            });
          }
          if (totalIgnoredUsers.size > 0 && newTabHeader) {
            const allTabLink = newTabHeader.querySelector('a[data-id="0"]');
            if (allTabLink) {
              const tabCounter = allTabLink.querySelector(".tab-counter");
              if (tabCounter) {
                const currentCount = parseInt(
                  tabCounter.textContent.trim(),
                  10
                );
                if (!isNaN(currentCount)) {
                  const newCount = Math.max(
                    0,
                    currentCount - totalIgnoredUsers.size
                  );
                  tabCounter.textContent = newCount.toString();
                }
              } else {
                const allCountMatch = allTabLink.textContent.match(/\((\d+)\)/);
                if (allCountMatch && allCountMatch[1]) {
                  const allOriginalCount = parseInt(allCountMatch[1], 10);
                  const allNewCount = Math.max(
                    0,
                    allOriginalCount - totalIgnoredUsers.size
                  );
                  allTabLink.textContent = allTabLink.textContent.replace(
                    /\(\d+\)/,
                    `(${allNewCount})`
                  );
                }
              }
            }
          }
          content.innerHTML = "";
          content.appendChild(reactionsList);
          const firstTab = popup.querySelector(".tab-header a");
          if (firstTab) {
            firstTab.click();
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching reaction data:", error);
        content.innerHTML =
          '<div style="text-align: center; padding: 20px;">Error loading reactions</div>';
      });
  }

  function processReactionLists() {
    document
      .querySelectorAll(".reaction-score-list:not(.content-processed)")
      .forEach((reactionList) => {
        addPreventDefaultToReactionList(reactionList);
        const listLabel = reactionList.querySelector(".list-label a");
        if (!listLabel) return;
        const postId = reactionList.dataset.postId;
        if (!postId) return;
        fetchReactionsWithCache(postId)
          .then((data) => {
            if (!data.htmlContent) return;
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.htmlContent, "text/html");
            const allUsers = [];
            const ignoredUsers = new Set();
            doc
              .querySelectorAll(
                '.tab-content[data-id="0"] li .cbb-helper-text a'
              )
              .forEach((userLink) => {
                const username = userLink.textContent.trim();
                if (username) {
                  if (isUserIgnored(username)) {
                    ignoredUsers.add(username);
                  } else {
                    allUsers.push(username);
                  }
                }
              });
            const validReactionIds = new Set();
            const ignoredCountByReaction = new Map();
            doc
              .querySelectorAll(".tab-header a:not(.active)")
              .forEach((reactionTab) => {
                const reactionId = reactionTab.getAttribute("data-id");
                if (!reactionId) return;
                let ignoredCount = 0;
                let hasNonIgnoredUsers = false;
                Array.from(
                  doc.querySelectorAll(
                    `.tab-content[data-id="${reactionId}"] li .cbb-helper-text a`
                  )
                ).forEach((userLink) => {
                  const username = userLink.textContent.trim();
                  if (username) {
                    if (isUserIgnored(username)) {
                      ignoredCount++;
                    } else {
                      hasNonIgnoredUsers = true;
                    }
                  }
                });
                ignoredCountByReaction.set(reactionId, ignoredCount);
                if (hasNonIgnoredUsers) {
                  validReactionIds.add(reactionId);
                }
              });
            const listScores = reactionList.querySelector(".list-scores");
            if (listScores && ignoredUsers.size > 0) {
              listScores.querySelectorAll("a").forEach((reactionLink) => {
                const reactionId =
                  reactionLink.href.match(/reaction=(\d+)/)?.[1];
                if (reactionId) {
                  const countElement =
                    reactionLink.querySelector(".reaction-score");
                  if (countElement) {
                    const currentCount = parseInt(
                      countElement.textContent.trim(),
                      10
                    );
                    if (!isNaN(currentCount)) {
                      const ignoredCount =
                        ignoredCountByReaction.get(reactionId) || 0;
                      const newCount = Math.max(0, currentCount - ignoredCount);
                      countElement.textContent = newCount.toString();
                      if (newCount === 0) {
                        reactionLink.style.display = "none";
                      }
                    }
                  }
                }
              });
            }
            if (allUsers.length > 0) {
              let newText = "";
              if (allUsers.length === 1) {
                newText = allUsers[0];
              } else if (allUsers.length === 2) {
                newText = `${allUsers[0]} and ${allUsers[1]}`;
              } else {
                const firstTwo = allUsers.slice(0, 2);
                newText = `${firstTwo.join(", ")} and ${
                  allUsers.length - 2
                } other user${allUsers.length - 2 > 1 ? "s" : ""}`;
              }
              listLabel.textContent = newText;
              if (listScores) {
                listScores.querySelectorAll("a").forEach((reactionLink) => {
                  const reactionId =
                    reactionLink.href.match(/reaction=(\d+)/)?.[1];
                  if (reactionId && !validReactionIds.has(reactionId)) {
                    reactionLink.style.display = "none";
                  }
                });
              }
              reactionList.style.display = "";
              reactionList.classList.add("content-processed");
            } else {
              reactionList.style.display = "none";
            }
          })
          .catch((error) => {
            console.error("Error processing reaction list:", error);
          })
          .finally(() => {
            addPreventDefaultToReactionList(reactionList);
          });
      });
  }

  function observeReactionLists() {
    const observer = new MutationObserver((mutations) => {
      let needsProcessing = false;
      let changedPostIds = new Set();
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          for (const node of mutation.addedNodes) {
            if (node.nodeType !== Node.ELEMENT_NODE) continue;
            if (
              node.classList &&
              node.classList.contains("reaction-score-list")
            ) {
              const postId = node.dataset.postId;
              if (postId) {
                changedPostIds.add(postId);
                node.classList.remove("content-processed");
                needsProcessing = true;
              }
            }
            const lists = node.querySelectorAll?.(".reaction-score-list");
            if (lists && lists.length > 0) {
              lists.forEach((list) => {
                const postId = list.dataset.postId;
                if (postId) {
                  changedPostIds.add(postId);
                  list.classList.remove("content-processed");
                  needsProcessing = true;
                }
              });
            }
          }
        }
      }
      if (changedPostIds.size > 0) {
        console.log(
          `Detected changes for posts: ${Array.from(changedPostIds).join(", ")}`
        );
        changedPostIds.forEach((postId) => {
          invalidateReactionsCache(postId);
        });
      }
      if (needsProcessing) {
        processReactionLists();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    processReactionLists();
    setupReactionChangeDetection();
    setInterval(() => {
      const unprocessedLists = document.querySelectorAll(
        ".reaction-score-list:not(.content-processed)"
      );
      if (unprocessedLists.length > 0) {
        console.log(
          `Found ${unprocessedLists.length} unprocessed reaction lists during interval check`
        );
        processReactionLists();
      }
    }, 2000);
  }
})();
