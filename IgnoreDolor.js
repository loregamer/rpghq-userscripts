// ==UserScript==
// @name         Ignore Users
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Add Ghost User button to profiles and hide content from ghosted users
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
  }

  function replaceIgnoredUserAvatar() {
    const avatars = document.querySelectorAll("img.avatar");
    avatars.forEach((avatar) => {
      const srcMatch = avatar.src.match(/avatar=(\d+)/);
      if (srcMatch && isUserIgnored(srcMatch[1])) {
        avatar.src = "https://f.rpghq.org/sVKSQ0VE3PJW.png?n=pasted-file.png";
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
    const profileHeader = document.querySelector(".profile-info h2");
    if (profileHeader && !document.getElementById("ghost-user-button")) {
      const userId = getUserIdFromUrl();
      const username = profileHeader.textContent.trim();

      if (userId) {
        const ghostButton = document.createElement("button");
        ghostButton.id = "ghost-user-button";
        ghostButton.className = "button";
        ghostButton.style.marginLeft = "10px";

        updateGhostButtonState(ghostButton, userId);

        ghostButton.addEventListener("click", function (e) {
          e.preventDefault();
          toggleUserGhost(userId, username);
          updateGhostButtonState(ghostButton, userId);
        });

        profileHeader.appendChild(ghostButton);
      }
    }
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

  function init() {
    processIgnoredContent();
    replaceIgnoredUserAvatar();
    addGhostButton();

    // Set up a MutationObserver to handle dynamically loaded content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          processIgnoredContent();
          replaceIgnoredUserAvatar();
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
