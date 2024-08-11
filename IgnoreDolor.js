// ==UserScript==
// @name         Ignore Users
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  Add Ghost User button to profiles, hide content from ghosted users, and replace avatars
// @author       You
// @match        https://rpghq.org/*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  let ignoredUsers = GM_getValue("ignoredUsers", {});
  let replacedAvatars = GM_getValue("replacedAvatars", {});

  function processIgnoredContent() {
    // Process notifications
    const notificationItems = document.querySelectorAll(".notification-block");
    notificationItems.forEach((item) => {
      const usernameElement = item.querySelector(".username");
      if (
        usernameElement &&
        isUserIgnored(usernameElement.textContent.trim())
      ) {
        const markReadLink = item.getAttribute("data-mark-read-url");
        if (markReadLink) {
          markAsRead(markReadLink);
        }
        const listItem = item.closest("li");
        if (listItem) {
          listItem.remove();
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
              // Remove the "by" text node
              byTextNode.remove();
              // Remove the mas-wrap element (avatar and username)
              nextElement.remove();
              // Remove the <br> element
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
  }

  function markAsRead(href) {
    GM_xmlhttpRequest({
      method: "GET",
      url: "https://rpghq.org" + href,
      onload: function (response) {
        console.log(
          "Ignored user notification marked as read:",
          response.status
        );
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

  function init() {
    processIgnoredContent();
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
