// ==UserScript==
// @name         Ghost Users
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  Hides content from ghosted users + optional avatar replacement
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

  // Inject style at document-start to hide ghostable content ASAP
  const mainStyle = document.createElement("style");
  mainStyle.textContent = `
    /* Hide relevant containers until processed */
    .post:not(.content-processed),
    .notification-block:not(.content-processed),
    dd.lastpost:not(.content-processed):not(#pinned-threads-list dd.lastpost),
    #recent-topics li dd.lastpost:not(.content-processed),
    li.row:not(.content-processed):not(#pinned-threads-list li.row) {
      visibility: hidden !important;
    }

    /* Ghosted row styling */
    .ghosted-row {
      display: none !important;
    }
    .ghosted-row.show {
      display: block !important;
      background-color: rgba(255, 0, 0, 0.1) !important;
    }

    /* Once processed, show if not ghosted */
    .content-processed:not(.ghosted-post):not(.ghosted-row):not(.ghosted-quote),
    .reaction-score-list.content-processed {
      visibility: visible !important;
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
      background: #2a2a2a;
      color: #e0e0e0;
      padding: 10px;
      border-radius: 5px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      z-index: 9999;
      max-width: 400px;
      font-size: 13px;
      line-height: 1.4;
      white-space: pre-wrap;
      word-break: break-word;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .post-preview-tooltip.visible {
      opacity: 1;
    }
    .post-preview-tooltip .post-subject {
      font-weight: bold;
      margin-bottom: 5px;
      color: #8af;
    }
    .post-preview-tooltip .post-content {
      max-height: 300px;
      overflow-y: auto;
      padding-right: 5px;
    }
    .post-preview-tooltip .quote {
      margin: 5px 0;
      padding: 5px;
      background: rgba(255,255,255,0.1);
      border-radius: 3px;
    }
    .post-preview-tooltip .quote-header {
      color: #8af;
      margin-bottom: 3px;
      font-size: 12px;
    }
    .post-preview-tooltip .quote-content {
      padding-left: 10px;
      border-left: 2px solid rgba(255,255,255,0.2);
    }
    .post-preview-tooltip a {
      color: #8af;
      text-decoration: none;
    }
    .post-preview-tooltip a:hover {
      text-decoration: underline;
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
  // 2) HELPER: BBCode Parsing
  // ---------------------------------------------------------------------
  function parseBBCode(text) {
    if (!text) return "";

    // Remove the subject URL line
    text = text.replace(/\[url=[^\]]+\]Subject:[^\[]+\[\/url\]\n+/, "");

    // If no quotes
    const lastQuoteEnd = text.lastIndexOf("[/quote]");
    if (lastQuoteEnd === -1) {
      return text;
    }

    // Find the second-to-last quote end
    const beforeLastQuote = text.lastIndexOf("[/quote]", lastQuoteEnd - 1);

    // Extract content between the last quotes
    let content =
      beforeLastQuote !== -1
        ? text.substring(beforeLastQuote + 8, lastQuoteEnd).trim()
        : text.substring(0, lastQuoteEnd).trim();

    // Remove quote start tags and any other BBCode
    content = content
      .replace(/\[quote=[^\]]+\]/g, "")
      .replace(/\[[^\]]+\]/g, "");
    return content.trim().replace(/\n/g, "<br>");
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

    // Slight delay before showing
    currentHoverTimeout = setTimeout(async () => {
      const content = await fetchAndCachePost(postId);
      if (!content) return;

      tooltip.innerHTML = `<div class="post-content">${content}</div>`;

      // Position to the left of cursor
      const tooltipX = event.pageX - tooltip.offsetWidth - 10;
      const tooltipY = event.pageY;

      tooltip.style.left = `${tooltipX}px`;
      tooltip.style.top = `${tooltipY}px`;
      tooltip.classList.add("visible");
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
  // 5) POST FETCH & CACHING
  // ---------------------------------------------------------------------
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
      const response = await fetch(
        `https://rpghq.org/forums/ucp.php?i=pm&mode=compose&action=quotepost&p=${postId}`
      );
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      const textarea = doc.querySelector("textarea#message");
      if (textarea) {
        // Clean up the content before caching
        let content = textarea.value;

        // Remove the subject line
        content = content.replace(
          /\[url=[^\]]+\]Subject:[^\[]+\[\/url\]\n+/,
          ""
        );

        // Extract content between the outermost quote tags
        const quoteMatch = content.match(
          /\[quote=[^\]]+\]([\s\S]*)\[\/quote\]/
        );
        if (quoteMatch) {
          content = quoteMatch[1].trim();
        }

        postCache[postId] = {
          content: content,
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

  // Pre-cache posts found on the page
  async function cacheAllPosts() {
    const lastPostLinks = document.querySelectorAll(
      'a[title="Go to last post"], a[title="View the latest post"]'
    );
    const postIds = Array.from(lastPostLinks)
      .map((lnk) => lnk.href.match(/p=(\d+)/)?.[1])
      .filter((id) => id && !postCache[id]);

    // Fetch in parallel, limit concurrency to 5
    for (let i = 0; i < postIds.length; i += 5) {
      const chunk = postIds.slice(i, i + 5);
      await Promise.all(chunk.map((pid) => fetchAndCachePost(pid)));
    }
  }

  // ---------------------------------------------------------------------
  // 6) CONTENT PROCESSING FOR HIDING
  // ---------------------------------------------------------------------
  function postContentContainsGhosted(content) {
    if (!content) return false;
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
      recentTopicLi.style.display = "none";
      return;
    }
    const rowItem = element.closest("li.row");
    if (rowItem) {
      rowItem.classList.add("ghosted-row");
    } else {
      element.style.display = "none";
    }
  }

  async function processLastPost(element) {
    if (element.closest("#pinned-threads-list")) {
      element.classList.add("content-processed");
      return;
    }
    const spanEl = element.querySelector("span");
    if (!spanEl) return;

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
      const userEl =
        nextEl.classList.contains("username") ||
        nextEl.classList.contains("username-coloured")
          ? nextEl
          : nextEl.querySelector(".username, .username-coloured");

      if (userEl && isUserIgnored(userEl.textContent.trim())) {
        hideTopicRow(element);
      } else {
        // Check post content for ghosted quotes
        const lastLink = element.querySelector(
          'a[title="Go to last post"], a[title="View the latest post"]'
        );
        const altLink = lastLink
          ? null
          : element.querySelector('a[href*="viewtopic.php"][href*="#p"]');
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
              // Add hover preview
              [lastLink, altLink, subjLink].filter(Boolean).forEach((l) => {
                l.addEventListener("mouseenter", (e) =>
                  showPostPreview(e, pid)
                );
                l.addEventListener("mouseleave", hidePostPreview);
              });
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

    // If all are ignored, just hide
    if (nonIgnored.length === 0) {
      const li = item.closest("li");
      if (li) li.style.display = "none";
      item.classList.add("content-processed");
      return;
    }

    // Otherwise rewrite notification
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

  // Single routine to hide everything from ignored users
  async function processIgnoredContentOnce() {
    await cacheAllPosts();

    document
      .querySelectorAll(".post:not(.content-processed)")
      .forEach(processPost);

    document
      .querySelectorAll(".reaction-score-list:not(.content-processed)")
      .forEach(processReactionList);

    document
      .querySelectorAll(".notification-block:not(.content-processed)")
      .forEach(processNotification);

    const lastPosts = document.querySelectorAll(
      "dd.lastpost:not(.content-processed), #recent-topics li dd.lastpost:not(.content-processed)"
    );
    await Promise.all(Array.from(lastPosts).map(processLastPost));

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

    // Handle ghosted rows and add preview functionality when shown
    document.querySelectorAll(".ghosted-row").forEach((r) => {
      r.classList.toggle("show");
      if (r.classList.contains("show")) {
        const lastPost = r.querySelector("dd.lastpost");
        if (lastPost) {
          const lastLink = lastPost.querySelector(
            'a[title="Go to last post"], a[title="View the latest post"]'
          );
          const altLink = lastLink
            ? null
            : lastPost.querySelector('a[href*="viewtopic.php"][href*="#p"]');
          const subjLink =
            lastLink || altLink
              ? null
              : lastPost.querySelector("a.lastsubject");

          const link = lastLink || altLink || subjLink;
          if (link) {
            const pid = link.href.match(/[#&]p=?(\d+)/)?.[1];
            if (pid) {
              [lastLink, altLink, subjLink].filter(Boolean).forEach((l) => {
                // Remove existing listeners first to prevent duplicates
                l.removeEventListener("mouseenter", (e) =>
                  showPostPreview(e, pid)
                );
                l.removeEventListener("mouseleave", hidePostPreview);
                // Add new listeners
                l.addEventListener("mouseenter", (e) =>
                  showPostPreview(e, pid)
                );
                l.addEventListener("mouseleave", hidePostPreview);
              });
            }
          }
        }
      }
    });

    document.body.classList.toggle("show-hidden-threads");
  }

  // ---------------------------------------------------------------------
  // 10) MISC
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

  // ---------------------------------------------------------------------
  // 11) INIT ON DOMContentLoaded
  // ---------------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", async () => {
    createTooltip();
    await processIgnoredContentOnce();
    replaceUserAvatars();
    addShowGhostedPostsButton();
    addGhostButtonsIfOnProfile();
    moveExternalLinkIcon();
    cleanGhostedQuotesInTextarea();
  });
})();
