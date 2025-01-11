// ==UserScript==
// @name         Ghost Users
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Add Ghost User button to profiles, hide content from ghosted users, and replace avatars
// @author       You
// @match        https://rpghq.org/*/*
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

  // Add CSS for ghosted posts
  const style = document.createElement("style");
  style.textContent = `
    .ghosted-post {
      display: none !important;
    }
    .ghosted-post.show {
      display: block !important;
    }
    .ghosted-quote {
      display: none !important;
    }
    .ghosted-quote.show {
      display: block !important;
    }
  `;
  document.head.appendChild(style);

  let ignoredUsers = GM_getValue("ignoredUsers", {});
  let replacedAvatars = GM_getValue("replacedAvatars", {});

  function processIgnoredContent() {
    // Process posts from ghosted users
    const posts = document.querySelectorAll(".post");
    posts.forEach((post) => {
      const usernameElement = post.querySelector(
        ".username, .username-coloured"
      );
      if (
        usernameElement &&
        isUserIgnored(usernameElement.textContent.trim())
      ) {
        post.classList.add("ghosted-post");
      }
    });

    // Check if we're viewing a ghosted user's post and redirect if needed
    const currentPostId = window.location.hash.replace("#p", "");
    if (currentPostId) {
      const currentPost = document.getElementById("p" + currentPostId);
      if (currentPost) {
        const postProfile = currentPost.querySelector(".postprofile");
        if (postProfile) {
          const usernameElement = postProfile.querySelector(
            ".username, .username-coloured"
          );
          if (
            usernameElement &&
            isUserIgnored(usernameElement.textContent.trim())
          ) {
            // Find the previous visible post
            let previousPost = currentPost.previousElementSibling;
            while (previousPost) {
              if (previousPost.classList.contains("post")) {
                const prevProfile = previousPost.querySelector(".postprofile");
                const prevUsername = prevProfile?.querySelector(
                  ".username, .username-coloured"
                );
                if (
                  prevUsername &&
                  !isUserIgnored(prevUsername.textContent.trim())
                ) {
                  // Get the post ID and update the URL
                  const prevPostId = previousPost.id.replace("p", "");
                  const newUrl =
                    window.location.href.replace(/#p\d+$/, "") +
                    "#p" +
                    prevPostId;
                  window.history.replaceState(null, "", newUrl);
                  previousPost.scrollIntoView();
                  break;
                }
              }
              previousPost = previousPost.previousElementSibling;
            }
          }
        }
      }
    }

    // Process notifications
    const notificationItems = document.querySelectorAll(".notification-block");
    notificationItems.forEach((item) => {
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
    });

    // Process recent topics and lastpost
    const lastpostElements = document.querySelectorAll(
      "dd.lastpost, #recent-topics li dd.lastpost"
    );
    lastpostElements.forEach((lastpostElement) => {
      const spanElement = lastpostElement.querySelector("span");
      if (spanElement) {
        // Find the "by" text node
        const byTextNode = Array.from(spanElement.childNodes).find(
          (node) =>
            node.nodeType === Node.TEXT_NODE && node.textContent.trim() === "by"
        );

        if (byTextNode) {
          // Check if the next element is the username
          const nextElement = byTextNode.nextElementSibling;
          if (nextElement && nextElement.classList.contains("mas-wrap")) {
            const usernameElement = nextElement.querySelector(".username");
            if (
              usernameElement &&
              isUserIgnored(usernameElement.textContent.trim())
            ) {
              // For recent topics, hide the entire li element
              const recentTopicLi =
                lastpostElement.closest("#recent-topics li");
              if (recentTopicLi) {
                recentTopicLi.style.display = "none";
              } else {
                // For other lastpost elements, just remove the user info as before
                byTextNode.remove();
                nextElement.remove();
                const br = spanElement.querySelector("br");
                if (br) {
                  br.remove();
                }
                spanElement.normalize();
              }
            }
          }
        }
      }
    });

    // NEW: Process topic list items
    const topicListItems = document.querySelectorAll("dl.row-item");
    topicListItems.forEach((item) => {
      const lastpostElement = item.querySelector("dd.lastpost");
      if (lastpostElement) {
        const spanElement = lastpostElement.querySelector("span");
        if (spanElement) {
          // Find the "by" text node
          const byTextNode = Array.from(spanElement.childNodes).find(
            (node) =>
              node.nodeType === Node.TEXT_NODE &&
              node.textContent.trim() === "by"
          );

          if (byTextNode) {
            // Check if the next element is the username
            const nextElement = byTextNode.nextElementSibling;
            if (nextElement && nextElement.classList.contains("username")) {
              const usernameElement = nextElement;
              if (
                usernameElement &&
                isUserIgnored(usernameElement.textContent.trim())
              ) {
                // Remove the "by" text node
                byTextNode.remove();
                // Remove the username element
                usernameElement.remove();
                // Remove the <br> element if it exists
                const br = spanElement.querySelector("br");
                if (br) {
                  br.remove();
                }
                // Remove any extra spaces
                spanElement.normalize();
              }
            }
          }
        }

        // Process the responsive-show element if it exists
        const responsiveShow = item.querySelector(".responsive-show");
        if (responsiveShow) {
          const usernameElement = responsiveShow.querySelector(".username");
          if (
            usernameElement &&
            isUserIgnored(usernameElement.textContent.trim())
          ) {
            // Find and remove the "Last post by" text
            const lastPostByText = Array.from(responsiveShow.childNodes).find(
              (node) =>
                node.nodeType === Node.TEXT_NODE &&
                node.textContent.trim().startsWith("Last post by")
            );
            if (lastPostByText) {
              lastPostByText.remove();
            }
            // Remove the username element
            usernameElement.remove();
            // Remove any extra spaces
            responsiveShow.normalize();
          }
        }
      }
    });

    // Process posts - check both author and blockquotes from ignored users
    const blockquotes = document.querySelectorAll(".post .content blockquote");

    blockquotes.forEach((blockquote) => {
      // 1. Detect the quoted user with the correct selector:
      const anchor = blockquote.querySelector("cite a");
      if (!anchor) return; // no user link

      const quotedUsername = anchor.textContent.trim();

      // 2. If that user is ignored, hide blockquote & following text
      if (isUserIgnored(quotedUsername)) {
        // Mark the blockquote with our new ghosted-quote class
        blockquote.classList.add("ghosted-quote");

        // Then walk siblings and hide them, until hitting another blockquote (or none):
        let sibling = blockquote.nextSibling;
        while (sibling) {
          // If you only want to hide *up to* the next blockquote
          // (so you don't nuke an entirely different quote),
          // break out if next is a <blockquote>.
          if (
            sibling.nodeType === Node.ELEMENT_NODE &&
            sibling.tagName === "BLOCKQUOTE"
          ) {
            break;
          }

          // If sibling is an element, just add the .ghosted-quote class
          if (sibling.nodeType === Node.ELEMENT_NODE) {
            sibling.classList.add("ghosted-quote");
          }
          // If sibling is a text node, wrap it in a <span> so we can toggle w/CSS
          else if (sibling.nodeType === Node.TEXT_NODE) {
            // Only if it's nonempty text
            const trimmedText = sibling.nodeValue.trim();
            if (trimmedText.length > 0) {
              const span = document.createElement("span");
              span.classList.add("ghosted-quote");
              span.textContent = sibling.nodeValue;

              // Insert <span> before the original text node, remove text node
              sibling.parentNode.insertBefore(span, sibling);
              sibling.parentNode.removeChild(sibling);

              // Move on from the newly inserted <span>
              sibling = span;
            }
          }

          sibling = sibling.nextSibling;
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

  function isUserIgnored(username) {
    return Object.values(ignoredUsers).includes(username.toLowerCase());
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
        } else if (isUserIgnored(userId)) {
          avatar.src = "https://f.rpghq.org/sVKSQ0VE3PJW.png?n=pasted-file.png";
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
    if (!document.getElementById("show-ghosted-posts")) {
      const dropdownContainer = document.createElement("div");
      dropdownContainer.className =
        "dropdown-container dropdown-button-control topic-tools";

      const button = document.createElement("span");
      button.id = "show-ghosted-posts";
      button.className = "button button-secondary dropdown-trigger";
      button.title = "Show Ghosted Posts";
      button.innerHTML =
        '<i class="icon fa-eye fa-fw" aria-hidden="true"></i><span>Show Ghosted Posts</span>';

      button.addEventListener("click", function (e) {
        e.preventDefault();
        toggleGhostedPosts();
      });

      dropdownContainer.appendChild(button);

      const actionBar = document.querySelector(".action-bar.bar-top");
      if (actionBar) {
        const firstButton = actionBar.querySelector(".button");
        if (firstButton) {
          actionBar.insertBefore(dropdownContainer, firstButton);
        } else {
          actionBar.appendChild(dropdownContainer);
        }
      }

      // Add media query for responsive design
      const style = document.createElement("style");
      style.textContent = `
        @media (max-width: 700px) {
          #show-ghosted-posts span:not(.icon) {
            display: none;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  function toggleGhostedPosts() {
    const button = document.getElementById("show-ghosted-posts");
    const textSpan = button.querySelector("span:not(.icon)");
    const icon = button.querySelector("i");
    const isShowing = textSpan.textContent === "Hide Ghosted Posts";

    textSpan.textContent = isShowing
      ? "Show Ghosted Posts"
      : "Hide Ghosted Posts";
    icon.className = isShowing
      ? "icon fa-eye fa-fw"
      : "icon fa-eye-slash fa-fw";

    // 1) Toggle the main ghosted posts
    const ghostedPosts = document.querySelectorAll(".post.ghosted-post");
    ghostedPosts.forEach((post) => {
      post.classList.toggle("show");
    });

    // 2) Toggle the ghosted quotes
    const ghostedQuotes = document.querySelectorAll(".ghosted-quote");
    ghostedQuotes.forEach((el) => {
      el.classList.toggle("show");
    });
  }

  function init() {
    processIgnoredContent();
    addShowGhostedPostsButton();
    replaceUserAvatar();
    addGhostButton();
    moveExternalLinkIcon();

    // Set up a MutationObserver to handle dynamically loaded content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          processIgnoredContent();
          replaceUserAvatar();
          addGhostButton();
        }
      });
    });

    const config = { childList: true, subtree: true };
    observer.observe(document.body, config);
  }

  // Run the init function when the page loads
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    init();
  } else {
    window.addEventListener("load", init);
  }
})();
