// ==UserScript==
// @name         Ghost Users
// @namespace    http://tampermonkey.net/
// @version      2.2
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

  /*** -----------------------------------------------------------------------
   * 1) DATA LOAD + IMMEDIATE STYLE
   * ------------------------------------------------------------------------ ***/

  let ignoredUsers = GM_getValue("ignoredUsers", {}); // userId => lowercased username
  let replacedAvatars = GM_getValue("replacedAvatars", {}); // userId => image URL
  let recentPostsCache = null; // Cache for recent posts data
  let lastRecentPostsFetch = 0; // Timestamp of last fetch
  let pagePostsContent = GM_getValue("pagePostsContent", {}); // postId => text content

  // Inject style at document-start to immediately hide potential ghosted content
  const style = document.createElement("style");
  style.textContent = `
    /* Immediately hide all relevant containers until processed */
    .post:not(.content-processed),
    .notification-block:not(.content-processed),
    dd.lastpost:not(.content-processed):not(#pinned-threads-list dd.lastpost),
    #recent-topics li dd.lastpost:not(.content-processed),
    .reaction-score-list:not(.content-processed),
    li.row:not(.content-processed):not(#pinned-threads-list li.row) {
      visibility: hidden !important;
    }

    /* Once processed, they become visible if not ghosted */
    .content-processed:not(.ghosted-post):not(.ghosted-row):not(.ghosted-quote) {
      visibility: visible !important;
    }

    /* Ghosted content is hidden altogether */
    .ghosted-post, .ghosted-row:not(#pinned-threads-list .row) {
      display: none !important;
    }
    .ghosted-post.show, .ghosted-row.show {
      display: block !important;
    }
    .ghosted-quote {
      display: none !important;
    }
    .ghosted-quote.show {
      display: block !important;
    }

    @media (max-width: 700px) {
      .show-ghosted-posts span:not(.icon) {
        display: none;
      }
    }
  `;

  // Insert style ASAP
  if (document.documentElement) {
    document.documentElement.appendChild(style);
  }

  /*** -----------------------------------------------------------------------
   * 2) MAIN HELPERS
   * ------------------------------------------------------------------------ ***/

  // Check if the user is ignored
  function isUserIgnored(usernameOrId) {
    // If numeric ID is in the ignoredUsers object
    if (ignoredUsers.hasOwnProperty(usernameOrId)) {
      return true;
    }
    // If it's a username string, compare to stored lowercased names
    const lowercaseUsername = usernameOrId.toLowerCase();
    return Object.values(ignoredUsers).includes(lowercaseUsername);
  }

  // Simple helper to get userId from URL, if on a profile
  function getUserIdFromUrl() {
    const match = window.location.href.match(/u=(\d+)/);
    return match ? match[1] : null;
  }

  // Toggle ignoring a user
  function toggleUserGhost(userId, username) {
    if (ignoredUsers.hasOwnProperty(userId)) {
      delete ignoredUsers[userId];
    } else {
      ignoredUsers[userId] = username.toLowerCase();
    }
    GM_setValue("ignoredUsers", ignoredUsers);
  }

  // Function to store post content
  function storePostContent(postId, content) {
    if (!postId || !content) return;
    pagePostsContent[postId] = content;
    GM_setValue("pagePostsContent", pagePostsContent);
  }

  // Function to process post content
  function processPostContent(post) {
    const postId =
      post.id?.match(/p(\d+)/)?.[1] ||
      Array.from(post.querySelectorAll("a"))
        .find((a) => a.href?.includes("p="))
        ?.href?.match(/p=(\d+)/)?.[1];

    if (postId) {
      const content = post.querySelector(".content")?.textContent?.trim() || "";
      storePostContent(postId, content);
    }
  }

  /*** -----------------------------------------------------------------------
   * 3) CONTENT-PROCESSING ROUTINES
   * ------------------------------------------------------------------------ ***/

  // Fetch and cache recent posts data
  async function fetchRecentPosts() {
    const now = Date.now();
    // Only fetch if cache is empty or older than 5 minutes
    if (recentPostsCache && now - lastRecentPostsFetch < 300000) {
      return recentPostsCache;
    }

    try {
      const response = await fetch(
        "https://rpghq.org/forums/search.php?search_id=newposts&terms=all&author=&sc=1&sr=posts&sk=t&sd=d&st=0&ch=1000&t=0&submit=Search"
      );
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");

      // Extract post data
      const posts = {};
      doc.querySelectorAll(".search.post").forEach((post) => {
        const postLink = post.querySelector(".postbody h3 a");
        if (!postLink) return;

        const postId = postLink.href.match(/p=(\d+)/)?.[1];
        if (!postId) return;

        const content =
          post.querySelector(".content")?.textContent?.trim() || "";
        const author =
          post.querySelector(".author a")?.textContent?.trim() || "";

        posts[postId] = {
          content,
          author,
        };
      });

      recentPostsCache = posts;
      lastRecentPostsFetch = now;
      return posts;
    } catch (error) {
      console.error("Failed to fetch recent posts:", error);
      return {};
    }
  }

  // Enhanced processLastPost that checks post content
  async function processLastPost(element) {
    // Skip if element is within pinned section
    if (element.closest("#pinned-threads-list")) {
      element.classList.add("content-processed");
      return;
    }

    const spanElement = element.querySelector("span");
    if (!spanElement) return;

    // Look for "by user"
    const byTextNode = Array.from(spanElement.childNodes).find(
      (node) =>
        node.nodeType === Node.TEXT_NODE &&
        node.textContent.trim().toLowerCase() === "by"
    );
    if (!byTextNode) return;

    const nextElement = byTextNode.nextElementSibling;
    if (
      nextElement &&
      (nextElement.classList.contains("mas-wrap") ||
        nextElement.classList.contains("username"))
    ) {
      const userEl = nextElement.classList.contains("username")
        ? nextElement
        : nextElement.querySelector(".username");

      if (!userEl) {
        element.classList.add("content-processed");
        return;
      }

      const username = userEl.textContent.trim();
      let shouldHide = isUserIgnored(username);

      if (!shouldHide) {
        // Check the post content if we can find the post ID
        const postLink = element.querySelector('a[title="Go to last post"]');
        if (postLink) {
          const postId = postLink.href.match(/p=(\d+)/)?.[1];
          if (postId) {
            const recentPosts = await fetchRecentPosts();
            const postData = recentPosts[postId];

            if (postData) {
              // Check if the post content or author contains any ignored username
              const contentLower = postData.content.toLowerCase();
              const authorLower = postData.author.toLowerCase();

              for (const ignoredId in ignoredUsers) {
                const ignoredName = ignoredUsers[ignoredId].toLowerCase();
                if (
                  contentLower.includes(ignoredName) ||
                  authorLower.includes(ignoredName)
                ) {
                  shouldHide = true;
                  break;
                }
              }
            }
          }
        }
      }

      if (shouldHide) {
        // For recent topics, hide the entire li
        const recentTopicLi = element.closest("#recent-topics li");
        if (recentTopicLi) {
          recentTopicLi.style.display = "none";
        } else {
          // Hide the entire .row if it's a topic row
          const rowItem = element.closest("li.row");
          if (rowItem) {
            rowItem.classList.add("ghosted-row");
          } else {
            // fallback
            element.style.display = "none";
          }
        }
      }
    }

    // Mark processed
    element.classList.add("content-processed");
  }

  // Hide ghosted reaction-lists
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
        // If link is like ...u=123
        const userId = link.href.match(/u=(\d+)/)?.[1];
        if (userId && isUserIgnored(userId)) {
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
  }

  // Hide ghosted notifications
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

    // If it's 100% from ignored user, you might want to hide or mark read
    const titleEl = item.querySelector(".notification-title");
    if (!titleEl) {
      item.classList.add("content-processed");
      return;
    }

    // If there's only one user and it's ignored, we can just hide
    if (nonIgnored.length === 0) {
      const li = item.closest("li");
      if (li) li.style.display = "none";
      item.classList.add("content-processed");
      return;
    }

    // Otherwise, rewrite the notification text to remove ignored names
    // (e.g. "X, Y, Z replied" => "Y, Z replied" if X is ignored)
    const lastIgnoredEl = usernameEls[usernameEls.length - 1];
    const nodesAfter = [];
    let nextNode = lastIgnoredEl?.nextSibling;
    while (nextNode) {
      nodesAfter.push(nextNode.cloneNode(true));
      nextNode = nextNode.nextSibling;
    }

    // Clear the title
    titleEl.textContent = "";
    // Add back non-ignored usernames (with commas/and)
    nonIgnored.forEach((usr, i) => {
      // find the original link for styling
      const matchEl = Array.from(usernameEls).find(
        (el) => el.textContent.trim().toLowerCase() === usr.toLowerCase()
      );
      if (matchEl) {
        titleEl.appendChild(matchEl.cloneNode(true));
      } else {
        // fallback text
        titleEl.appendChild(document.createTextNode(usr));
      }
      if (i < nonIgnored.length - 2) {
        titleEl.appendChild(document.createTextNode(", "));
      } else if (i === nonIgnored.length - 2) {
        titleEl.appendChild(document.createTextNode(" and "));
      }
    });

    // Re-inject the leftover text
    nodesAfter.forEach((node) => {
      titleEl.appendChild(node);
    });

    item.classList.add("content-processed");
  }

  // Hide ghosted quotes within a single .post
  function processBlockquotesInPost(post) {
    const blockquotes = post.querySelectorAll(".content blockquote");
    blockquotes.forEach((blockquote) => {
      const anchor = blockquote.querySelector("cite a");
      if (!anchor) return;
      const quotedUsername = anchor.textContent.trim();
      if (isUserIgnored(quotedUsername)) {
        blockquote.classList.add("ghosted-quote");
      }
    });
  }

  // Hide ghosted posts themselves
  function processPost(post) {
    processPostContent(post);
    processBlockquotesInPost(post);

    const usernameEl = post.querySelector(".username, .username-coloured");
    const mentions = post.querySelectorAll("em.mention");

    let shouldHide = false;

    // If the author is ignored
    if (usernameEl && isUserIgnored(usernameEl.textContent.trim())) {
      shouldHide = true;
    }

    // Or it mentions an ignored user
    mentions.forEach((mention) => {
      const mentionTxt = mention.textContent.trim().replace("@", "");
      if (isUserIgnored(mentionTxt)) {
        shouldHide = true;
      }
    });

    if (shouldHide) {
      post.classList.add("ghosted-post");
    }

    // Mark processed
    post.classList.add("content-processed");
  }

  // Main single-pass function: hide anything from ignored users
  async function processIgnoredContentOnce() {
    // Fetch recent posts first
    await fetchRecentPosts();

    // Posts
    document
      .querySelectorAll(".post:not(.content-processed)")
      .forEach(processPost);

    // Reaction lists
    document
      .querySelectorAll(".reaction-score-list:not(.content-processed)")
      .forEach(processReactionList);

    // Notifications
    document
      .querySelectorAll(".notification-block:not(.content-processed)")
      .forEach(processNotification);

    // Lastpost items (topics, etc.)
    const lastposts = document.querySelectorAll(
      "dd.lastpost:not(.content-processed), #recent-topics li dd.lastpost:not(.content-processed)"
    );
    for (const lastpost of lastposts) {
      await processLastPost(lastpost);
    }

    // Row items in topic lists
    const rows = document.querySelectorAll("li.row:not(.content-processed)");
    for (const row of rows) {
      // Possibly handle the lastpost inside that row
      const lastpost = row.querySelector("dd.lastpost");
      if (lastpost && !lastpost.classList.contains("content-processed")) {
        await processLastPost(lastpost);
      }
      row.classList.add("content-processed");
    }
  }

  /*** -----------------------------------------------------------------------
   * 4) AVATAR REPLACEMENT
   * ------------------------------------------------------------------------ ***/

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
    const img = new Image();
    img.onload = function () {
      if (this.width <= 128 && this.height <= 128) {
        replacedAvatars[userId] = url;
        GM_setValue("replacedAvatars", replacedAvatars);
        alert("Avatar replaced!");
        replaceUserAvatars();
      } else {
        alert("Image must be 128x128 or smaller.");
      }
    };
    img.onerror = function () {
      alert("Could not load image from the provided URL.");
    };
    img.src = url;
  }

  /*** -----------------------------------------------------------------------
   * 5) BUTTONS: GHOST + REPLACE AVATAR
   * ------------------------------------------------------------------------ ***/

  function addGhostButtonsIfOnProfile() {
    const memberlistTitle = document.querySelector(".memberlist-title");
    if (!memberlistTitle) return;
    if (document.getElementById("ghost-user-button")) return;

    // Usually "Viewing profile - Username"
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
    container.appendChild(ghostBtn);

    const replaceBtn = document.createElement("a");
    replaceBtn.id = "replace-avatar-button";
    replaceBtn.className = "button button-secondary";
    replaceBtn.href = "#";
    replaceBtn.textContent = "Replace Avatar";
    replaceBtn.style.marginLeft = "5px";
    container.appendChild(replaceBtn);

    // Add to DOM
    memberlistTitle.appendChild(container);

    // Update states
    function refreshGhostBtn() {
      const isGhosted = ignoredUsers.hasOwnProperty(userId);
      ghostBtn.textContent = isGhosted ? "Unghost User" : "Ghost User";
      ghostBtn.title = isGhosted
        ? "Stop ignoring this user"
        : "Ignore this user";
    }
    refreshGhostBtn();

    // Handlers
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
      b.addEventListener("mouseover", () => {
        b.style.backgroundColor = "#4a4a4a";
      });
      b.addEventListener("mouseout", () => {
        b.style.backgroundColor = "#3a3a3a";
      });
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

  /*** -----------------------------------------------------------------------
   * 6) SHOW/HIDE GHOSTED BUTTON
   * ------------------------------------------------------------------------ ***/

  function addShowGhostedPostsButton() {
    // Insert a "Show Ghosted Posts" button in the .action-bar, if present
    const actionBars = document.querySelectorAll(
      ".action-bar.bar-top, .action-bar.bar-bottom"
    );
    actionBars.forEach((bar) => {
      if (bar.querySelector(".show-ghosted-posts")) return; // already added

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
      const firstBtn = bar.querySelector(".button");
      if (firstBtn) {
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

    // Toggle .show class on ghosted content
    document
      .querySelectorAll(".post.ghosted-post")
      .forEach((p) => p.classList.toggle("show"));
    document
      .querySelectorAll(".ghosted-quote")
      .forEach((q) => q.classList.toggle("show"));
    document
      .querySelectorAll(".ghosted-row")
      .forEach((r) => r.classList.toggle("show"));
  }

  /*** -----------------------------------------------------------------------
   * 7) MISCELLANEOUS
   * ------------------------------------------------------------------------ ***/

  // Move external link icon after the <time> in .lastpost
  function moveExternalLinkIcon() {
    const lastPostSpans = document.querySelectorAll(
      "dd.lastpost span:not(.icon-moved)"
    );
    lastPostSpans.forEach((span) => {
      const externalLink = span.querySelector('a[title="Go to last post"]');
      const timeEl = span.querySelector("time");
      if (externalLink && timeEl) {
        externalLink.remove();
        timeEl.insertAdjacentElement("afterend", externalLink);
        externalLink.style.marginLeft = "5px";
        span.classList.add("icon-moved");
      }
    });
  }

  // Clean out quotes from ignored users if you reply
  function cleanGhostedQuotesInTextarea() {
    const textarea = document.querySelector("textarea#message");
    if (!textarea || !textarea.value.includes("[quote")) return;

    let text = textarea.value;
    for (const userId in ignoredUsers) {
      // e.g. [quote="SomeUser" user_id=123]...[/quote]
      const regex = new RegExp(
        `\\[quote=[^\\]]*user_id=${userId}[^\\]]*\\][\\s\\S]*?\\[\\/quote\\]`,
        "g"
      );
      text = text.replace(regex, "");
    }
    if (text !== textarea.value) {
      textarea.value = text;
    }
  }

  /*** -----------------------------------------------------------------------
   * 8) SCRIPT ENTRY POINTS
   * ------------------------------------------------------------------------ ***/

  // At document-start, we inject style only.
  // The main processing will happen at DOMContentLoaded.
  document.addEventListener("DOMContentLoaded", () => {
    // Single pass to hide ghosted content
    processIgnoredContentOnce().catch(console.error);

    // Replace avatars
    replaceUserAvatars();

    // Add "Show Ghosted" button
    addShowGhostedPostsButton();

    // Add ghost button on profile
    addGhostButtonsIfOnProfile();

    // Move external link icons in last post
    moveExternalLinkIcon();

    // Clean out any ghosted quotes if we're replying
    cleanGhostedQuotesInTextarea();
  });
})();
