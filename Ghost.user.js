// ==UserScript==
// @name         Ghost Users
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Add Ghost User button to profiles, hide content from ghosted users, and replace avatars
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

  // Load stored data immediately
  let ignoredUsers = GM_getValue("ignoredUsers", {});
  let replacedAvatars = GM_getValue("replacedAvatars", {});

  // Add CSS for ghosted posts immediately at document-start
  const style = document.createElement("style");
  style.textContent = `
    /* Hide all potentially ghostable content by default */
    .post:not(.content-processed),
    .notification-block:not(.content-processed),
    dd.lastpost:not(.content-processed),
    #recent-topics li dd.lastpost:not(.content-processed),
    .reaction-score-list:not(.content-processed),
    li.row:not(.content-processed) {
      visibility: hidden !important;
    }

    /* Show content once processed and not ghosted */
    .content-processed:not(.ghosted-post):not(.ghosted-row):not(.ghosted-quote) {
      visibility: visible !important;
    }

    /* Hide ghosted content */
    .ghosted-post, .ghosted-row {
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

  // Insert style as early as possible
  if (document.documentElement) {
    document.documentElement.appendChild(style);
  }

  // Create and insert a style element for immediate hiding
  document.addEventListener("DOMContentLoaded", function () {
    document.head.appendChild(style);
  });

  function processNestedBlockquotes() {
    // Process from innermost to outermost blockquotes
    const allBlockquotes = Array.from(
      document.querySelectorAll(".post .content blockquote")
    );

    // Sort blockquotes by nesting level (deepest first)
    allBlockquotes.sort((a, b) => {
      const aDepth = getBlockquoteDepth(a);
      const bDepth = getBlockquoteDepth(b);
      return bDepth - aDepth;
    });

    allBlockquotes.forEach((blockquote) => {
      const anchor = blockquote.querySelector("cite a");
      if (!anchor) return;

      const quotedUsername = anchor.textContent.trim();
      if (isUserIgnored(quotedUsername)) {
        blockquote.classList.add("ghosted-quote");
      }
    });
  }

  function getBlockquoteDepth(element) {
    let depth = 0;
    let current = element;
    while (current) {
      if (current.tagName === "BLOCKQUOTE") {
        depth++;
      }
      current = current.parentElement;
    }
    return depth;
  }

  function processIgnoredContent() {
    // Process rows in topic lists
    const topicRows = document.querySelectorAll("li.row");
    topicRows.forEach((row) => {
      const lastpostElement = row.querySelector("dd.lastpost");
      if (lastpostElement) {
        processLastPost(lastpostElement);
      }
      row.classList.add("content-processed");
    });

    // Process reactions from ignored users
    const reactionLists = document.querySelectorAll(".reaction-score-list");
    reactionLists.forEach((list) => {
      processReactionList(list);
      list.classList.add("content-processed");
    });

    // Process posts from ghosted users
    const posts = document.querySelectorAll(".post");
    let shouldRedirect = false;
    let currentPost = null;

    posts.forEach((post) => {
      // First process any nested blockquotes in this post
      processNestedBlockquotes();

      // Check if all blockquotes in this post are ghosted
      const blockquotes = post.querySelectorAll(".content blockquote");
      const allBlockquotesGhosted =
        blockquotes.length > 0 &&
        Array.from(blockquotes).every((quote) => {
          const anchor = quote.querySelector("cite a");
          if (!anchor) return false;
          return isUserIgnored(anchor.textContent.trim());
        });

      // Then check if the post itself should be hidden
      const usernameElement = post.querySelector(
        ".username, .username-coloured"
      );
      const mentions = post.querySelectorAll("em.mention");

      let isHidden = false;

      // Check if post author is ghosted or if all blockquotes are ghosted
      if (
        (usernameElement &&
          isUserIgnored(usernameElement.textContent.trim())) ||
        allBlockquotesGhosted
      ) {
        post.classList.add("ghosted-post");
        isHidden = true;
      }

      // Check for mentions of ghosted users
      mentions.forEach((mention) => {
        const mentionedUser = mention.textContent.trim().replace("@", "");
        if (isUserIgnored(mentionedUser)) {
          post.classList.add("ghosted-post");
          isHidden = true;
        }
      });

      // Mark as processed
      post.classList.add("content-processed");

      // Check if this is the current post and it's hidden
      const postId = post.id.replace("p", "");
      const currentPostId = window.location.hash.replace("#p", "");
      if (postId === currentPostId && isHidden) {
        shouldRedirect = true;
        currentPost = post;
      }
    });

    // Process notifications
    const notificationItems = document.querySelectorAll(".notification-block");
    notificationItems.forEach((item) => {
      processNotification(item);
      item.classList.add("content-processed");
    });

    // Process lastpost elements
    const lastpostElements = document.querySelectorAll(
      "dd.lastpost, #recent-topics li dd.lastpost"
    );
    lastpostElements.forEach((element) => {
      processLastPost(element);
      element.classList.add("content-processed");
    });
  }

  function processReactionList(reactionList) {
    const reactionGroups = reactionList.querySelectorAll(".reaction-group");
    reactionGroups.forEach((group) => {
      const popup = group.querySelector(".reaction-users-popup");
      if (!popup) return;

      const userLinks = popup.querySelectorAll(
        "a.username, a.username-coloured"
      );
      const countSpan = group.querySelector("span");
      if (!countSpan) return;

      let currentCount = parseInt(countSpan.textContent);
      let removedCount = 0;

      userLinks.forEach((link) => {
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
          // Remove the entire reaction group if count reaches 0
          group.remove();
        } else {
          // Update the count
          countSpan.textContent = newCount.toString();
        }
      }
    });
  }

  function markAsRead(href) {
    GM_xmlhttpRequest({
      method: "GET",
      url: "https://rpghq.org/forums/" + href,
      onload: function (response) {
        console.log("Ghosted notification marked as read:", response.status);
      },
    });
  }

  function processNotification(item) {
    // Get all usernames in the notification
    const usernameElements = item.querySelectorAll(
      ".username, .username-coloured"
    );
    const usernames = Array.from(usernameElements).map((el) =>
      el.textContent.trim()
    );

    // Check if any of the users are ignored
    const nonIgnoredUsers = usernames.filter(
      (username) => !isUserIgnored(username)
    );
    const hasIgnoredUsers = nonIgnoredUsers.length < usernames.length;

    if (hasIgnoredUsers) {
      const notificationTitle = item.querySelector(".notification-title");
      if (notificationTitle) {
        // Check if there are any commas in the notification text
        const hasCommas = notificationTitle.textContent.includes(",");

        if (!hasCommas) {
          // Find the mark as read link first
          const listItem = item.closest("li");
          if (listItem) {
            const markReadLink = listItem.querySelector(
              'a.mark_read[data-ajax="notification.mark_read"]'
            );
            if (markReadLink && markReadLink.href) {
              GM_xmlhttpRequest({
                method: "GET",
                url: markReadLink.href,
                onload: function (response) {
                  console.log(
                    "Ghosted notification marked as read:",
                    response.status
                  );
                  // Refresh the page after marking as read
                  window.location.reload();
                },
              });
            }
            // Hide the notification
            listItem.style.display = "none";
          }
          return;
        }

        // Store all nodes after the last username for later
        const lastUsername = usernameElements[usernameElements.length - 1];
        const nodesAfter = [];
        let currentNode = lastUsername.nextSibling;
        while (currentNode) {
          nodesAfter.push(currentNode.cloneNode(true));
          currentNode = currentNode.nextSibling;
        }

        // Keep track of non-ignored username elements
        const nonIgnoredElements = Array.from(usernameElements).filter(
          (el) => !isUserIgnored(el.textContent.trim())
        );

        // Clear the title content
        notificationTitle.textContent = "";

        // Add back non-ignored usernames with proper formatting
        nonIgnoredElements.forEach((el, index) => {
          const clone = el.cloneNode(true);
          notificationTitle.appendChild(clone);

          if (index < nonIgnoredElements.length - 2) {
            notificationTitle.appendChild(document.createTextNode(", "));
          } else if (index === nonIgnoredElements.length - 2) {
            notificationTitle.appendChild(document.createTextNode(" and "));
          }
        });

        // Add back the stored nodes
        nodesAfter.forEach((node) => {
          notificationTitle.appendChild(node);
        });
      }
    }
  }

  function processLastPost(element) {
    const spanElement = element.querySelector("span");
    if (spanElement) {
      // Find the "by" text node
      const byTextNode = Array.from(spanElement.childNodes).find(
        (node) =>
          node.nodeType === Node.TEXT_NODE && node.textContent.trim() === "by"
      );

      if (byTextNode) {
        // Check if the next element is the username
        const nextElement = byTextNode.nextElementSibling;
        if (
          nextElement &&
          (nextElement.classList.contains("mas-wrap") ||
            nextElement.classList.contains("username"))
        ) {
          const usernameElement = nextElement.classList.contains("username")
            ? nextElement
            : nextElement.querySelector(".username");
          if (
            usernameElement &&
            isUserIgnored(usernameElement.textContent.trim())
          ) {
            // For recent topics, hide the entire li element
            const recentTopicLi = element.closest("#recent-topics li");
            if (recentTopicLi) {
              recentTopicLi.style.display = "none";
            } else {
              // Hide the entire row if it's in a topic list
              const rowItem = element.closest("li.row");
              if (rowItem) {
                rowItem.classList.add("ghosted-row");
              } else {
                // Otherwise just hide the lastpost element
                element.style.display = "none";
              }
            }
          }
        }
      }

      // Process the responsive-show element if it exists
      const responsiveShow = element
        .closest("dl.row-item")
        .querySelector(".responsive-show");
      if (responsiveShow) {
        const usernameElement = responsiveShow.querySelector(".username");
        if (
          usernameElement &&
          isUserIgnored(usernameElement.textContent.trim())
        ) {
          // Hide the entire row
          const rowItem = responsiveShow.closest("li.row");
          if (rowItem) {
            rowItem.classList.add("ghosted-row");
          }
        }
      }
    }
  }

  function isUserIgnored(usernameOrId) {
    // If it's a user ID, check if it exists as a key in ignoredUsers
    if (ignoredUsers.hasOwnProperty(usernameOrId)) {
      return true;
    }

    // If it's a username, check if it exists as a value in ignoredUsers
    const lowercaseUsername = usernameOrId.toLowerCase();
    return Object.values(ignoredUsers).includes(lowercaseUsername);
  }

  function addGhostButton() {
    const memberlistTitle = document.querySelector(".memberlist-title");
    if (memberlistTitle && !document.getElementById("ghost-user-button")) {
      const userId = getUserIdFromUrl();
      const username = memberlistTitle.textContent.split("-")[1].trim();

      if (userId) {
        const buttonContainer = document.createElement("div");
        buttonContainer.style.display = "inline-block";
        buttonContainer.style.marginLeft = "10px";

        const ghostButton = createButton("ghost-user-button", "Ghost User");
        const replaceAvatarButton = createButton(
          "replace-avatar-button",
          "Replace Avatar"
        );

        ghostButton.addEventListener("click", function (e) {
          e.preventDefault();
          toggleUserGhost(userId, username);
          updateGhostButtonState(ghostButton, userId);
        });

        replaceAvatarButton.addEventListener("click", function (e) {
          e.preventDefault();
          showReplaceAvatarPopup(userId);
        });

        buttonContainer.appendChild(ghostButton);
        buttonContainer.appendChild(replaceAvatarButton);
        memberlistTitle.appendChild(buttonContainer);

        updateGhostButtonState(ghostButton, userId);
      }
    }
  }

  function createButton(id, text) {
    const button = document.createElement("a");
    button.id = id;
    button.className = "button button-secondary";
    button.href = "#";
    button.textContent = text;
    button.style.marginRight = "5px";
    return button;
  }

  function showReplaceAvatarPopup(userId) {
    const popup = document.createElement("div");
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #2a2a2a;
        color: #e0e0e0;
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
        z-index: 9999;
        width: 300px;
    `;

    const title = document.createElement("h3");
    title.textContent = "Replace Avatar";
    title.style.cssText = `
        margin-top: 0;
        margin-bottom: 15px;
        color: #e0e0e0;
        font-size: 18px;
    `;

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter image URL (128x128 or smaller)";
    input.style.cssText = `
        width: 100%;
        padding: 5px;
        margin-bottom: 15px;
        background-color: #3a3a3a;
        border: 1px solid #4a4a4a;
        color: #e0e0e0;
        border-radius: 3px;
    `;

    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "space-between";

    const replaceButton = createPopupButton("Replace");
    const resetButton = createPopupButton("Reset to Default");
    const cancelButton = createPopupButton("Cancel");

    replaceButton.addEventListener("click", function () {
      validateAndReplaceAvatar(userId, input.value);
      document.body.removeChild(popup);
    });

    resetButton.addEventListener("click", function () {
      delete replacedAvatars[userId];
      GM_setValue("replacedAvatars", replacedAvatars);
      alert("Avatar reset to default.");
      replaceUserAvatar();
      document.body.removeChild(popup);
    });

    cancelButton.addEventListener("click", function () {
      document.body.removeChild(popup);
    });

    buttonContainer.appendChild(replaceButton);
    buttonContainer.appendChild(resetButton);
    buttonContainer.appendChild(cancelButton);

    popup.appendChild(title);
    popup.appendChild(input);
    popup.appendChild(buttonContainer);

    document.body.appendChild(popup);
  }

  function createPopupButton(text) {
    const button = document.createElement("button");
    button.textContent = text;
    button.style.cssText = `
        background-color: #3a3a3a;
        color: #e0e0e0;
        border: none;
        padding: 5px 10px;
        margin: 0 5px;
        border-radius: 3px;
        cursor: pointer;
    `;
    button.addEventListener("mouseover", function () {
      this.style.backgroundColor = "#4a4a4a";
    });
    button.addEventListener("mouseout", function () {
      this.style.backgroundColor = "#3a3a3a";
    });
    return button;
  }

  function validateAndReplaceAvatar(userId, imageUrl) {
    const img = new Image();
    img.onload = function () {
      if (this.width <= 128 && this.height <= 128) {
        replacedAvatars[userId] = imageUrl;
        GM_setValue("replacedAvatars", replacedAvatars);
        alert("Avatar replacement saved successfully!");
        replaceUserAvatar();
      } else {
        alert("Image must be 128x128 pixels or smaller. Please try again.");
      }
    };
    img.onerror = function () {
      alert("Failed to load the image. Please check the URL and try again.");
    };
    img.src = imageUrl;
  }

  function replaceUserAvatar() {
    const avatars = document.querySelectorAll("img.avatar");
    avatars.forEach((avatar) => {
      const srcMatch = avatar.src.match(/avatar=(\d+)/);
      if (srcMatch) {
        const userId = srcMatch[1];
        if (replacedAvatars.hasOwnProperty(userId)) {
          avatar.src = replacedAvatars[userId];
        }
      }
    });
  }

  function updateGhostButtonState(button, userId) {
    const isGhosted = ignoredUsers.hasOwnProperty(userId);
    button.textContent = isGhosted ? "Unghost User" : "Ghost User";
    button.title = isGhosted ? "Stop ignoring this user" : "Ignore this user";
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

  function moveExternalLinkIcon() {
    const lastPostSpans = document.querySelectorAll(
      "dd.lastpost span:not(.icon-moved)"
    );
    lastPostSpans.forEach((span) => {
      const externalLinkIcon = span.querySelector('a[title="Go to last post"]');
      const timeElement = span.querySelector("time");

      if (externalLinkIcon && timeElement) {
        // Remove the icon from its current position
        externalLinkIcon.remove();

        // Insert the icon after the time element
        timeElement.insertAdjacentElement("afterend", externalLinkIcon);

        // Add a small margin to separate the time and the icon
        externalLinkIcon.style.marginLeft = "5px";

        // Mark this span as processed
        span.classList.add("icon-moved");
      }
    });
  }

  function addShowGhostedPostsButton() {
    const actionBars = document.querySelectorAll(
      ".action-bar.bar-top, .action-bar.bar-bottom"
    );

    actionBars.forEach((actionBar, index) => {
      if (!actionBar.querySelector(".show-ghosted-posts")) {
        const dropdownContainer = document.createElement("div");
        dropdownContainer.className =
          "dropdown-container dropdown-button-control topic-tools";

        const button = document.createElement("span");
        button.className =
          "button button-secondary dropdown-trigger show-ghosted-posts";
        button.title = "Show Ghosted Posts";
        button.innerHTML =
          '<i class="icon fa-eye fa-fw" aria-hidden="true"></i><span>Show Ghosted Posts</span>';

        button.addEventListener("click", function (e) {
          e.preventDefault();
          toggleGhostedPosts();
        });

        dropdownContainer.appendChild(button);

        const firstButton = actionBar.querySelector(".button");
        if (firstButton) {
          actionBar.insertBefore(dropdownContainer, firstButton);
        } else {
          actionBar.appendChild(dropdownContainer);
        }
      }
    });
  }

  function toggleGhostedPosts() {
    const buttons = document.querySelectorAll(".show-ghosted-posts");
    const isShowing =
      buttons[0].querySelector("span:not(.icon)").textContent ===
      "Hide Ghosted Posts";

    buttons.forEach((button) => {
      const textSpan = button.querySelector("span:not(.icon)");
      const icon = button.querySelector("i");

      textSpan.textContent = isShowing
        ? "Show Ghosted Posts"
        : "Hide Ghosted Posts";
      icon.className = isShowing
        ? "icon fa-eye fa-fw"
        : "icon fa-eye-slash fa-fw";
    });

    // Toggle the main ghosted posts
    const ghostedPosts = document.querySelectorAll(".post.ghosted-post");
    ghostedPosts.forEach((post) => {
      post.classList.toggle("show");
    });

    // Toggle the ghosted quotes
    const ghostedQuotes = document.querySelectorAll(".ghosted-quote");
    ghostedQuotes.forEach((el) => {
      el.classList.toggle("show");
    });
  }

  function cleanGhostedQuotes(text) {
    let cleanedText = text;
    for (const userId in ignoredUsers) {
      // Match the quote block only, preserving text after it
      const regex = new RegExp(
        `\\[quote=[^\\]]*user_id=${userId}[^\\]]*\\][\\s\\S]*?\\[\\/quote\\]`,
        "g"
      );
      cleanedText = cleanedText.replace(regex, "");
    }
    return cleanedText;
  }

  function handleTextArea() {
    const textarea = document.querySelector("textarea#message");
    if (textarea && textarea.value.includes("[quote")) {
      const cleanedText = cleanGhostedQuotes(textarea.value);
      if (cleanedText !== textarea.value) {
        textarea.value = cleanedText;
      }
    }
  }

  // Early initialization function
  function earlyInit() {
    // Process any content that's already loaded
    processIgnoredContent();
    replaceUserAvatar();

    // Set up mutation observer for dynamic content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          // Process only new nodes
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (!node.classList.contains("content-processed")) {
                processIgnoredContent();
                replaceUserAvatar();
              }
            }
          });
        }
      });
    });

    // Start observing as early as possible
    const config = { childList: true, subtree: true };
    observer.observe(document.documentElement, config);
  }

  // Run early initialization immediately
  earlyInit();

  // Set up remaining initialization for when DOM is ready
  document.addEventListener("DOMContentLoaded", function () {
    addShowGhostedPostsButton();
    addGhostButton();
    moveExternalLinkIcon();
    handleTextArea();
  });

  // Ensure everything is processed after full load
  window.addEventListener("load", function () {
    processIgnoredContent();
    replaceUserAvatar();
  });
})();
