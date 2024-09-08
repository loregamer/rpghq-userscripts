// ==UserScript==
// @name         RPGHQ Notifications Customization
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Customize RPGHQ notifications display
// @author       LOREGAMER
// @match        https://rpghq.org/*/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @grant        GM_xmlhttpRequest
// @license     MIT
// @updateURL    https://raw.githubusercontent.com/loregamer/rpghq-userscripts/main/Notifications.user.js
// @downloadURL  https://raw.githubusercontent.com/loregamer/rpghq-userscripts/main/Notifications.user.js
// ==/UserScript==

/*
MIT License

Copyright (c) 2024 loregamer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

(function () {
  "use strict";

  // Utility functions
  const createElement = (tag, attributes = {}, innerHTML = "") => {
    const element = document.createElement(tag);
    Object.assign(element, attributes);
    element.innerHTML = innerHTML;
    return element;
  };

  const formatReactions = (reactions) => {
    return `<span style="display: inline-flex; margin-left: 2px; vertical-align: middle;">
      ${reactions
        .map(
          (reaction) => `
        <img src="${reaction.image}" alt="${reaction.name}" title="${reaction.name}" 
             style="height: 1em !important; width: auto !important; vertical-align: middle !important; margin-right: 2px !important;">
      `
        )
        .join("")}
    </span>`;
  };

  const styleReference = (element) => {
    Object.assign(element.style, {
      background: "rgba(23, 27, 36, 0.5)",
      color: "#ffffff",
      padding: "2px 4px",
      borderRadius: "2px",
      zIndex: "-1",
      display: "inline-block",
      whiteSpace: "nowrap",
    });
  };

  // Local storage functions
  const getStoredReactions = (postId) => {
    const storedData = localStorage.getItem(`reactions_${postId}`);
    if (storedData) {
      const { reactions, timestamp } = JSON.parse(storedData);
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        return reactions;
      }
    }
    return null;
  };

  const storeReactions = (postId, reactions) => {
    localStorage.setItem(
      `reactions_${postId}`,
      JSON.stringify({
        reactions,
        timestamp: Date.now(),
      })
    );
  };

  // Fetch reactions
  const fetchReactions = async (postId, isUnread) => {
    if (!isUnread) {
      const storedReactions = getStoredReactions(postId);
      if (storedReactions) return storedReactions;
    }

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
    const doc = new DOMParser().parseFromString(data.htmlContent, "text/html");
    const reactions = Array.from(
      doc.querySelectorAll('.tab-content[data-id="0"] li')
    ).map((li) => ({
      username: li.querySelector(".cbb-helper-text a").textContent,
      image: li.querySelector(".reaction-image").src,
      name: li.querySelector(".reaction-image").alt,
    }));

    storeReactions(postId, reactions);
    return reactions;
  };

  // Customize notification functions
  const customizeReactionNotification = async (titleElement, block) => {
    let titleText = titleElement.innerHTML;
    const isUnread = block.href && block.href.includes("mark_notification");
    const postId = (block.getAttribute("data-real-url") || block.href).match(
      /p=(\d+)/
    )?.[1];

    if (postId) {
      const usernames = Array.from(
        titleElement.querySelectorAll(".username, .username-coloured")
      ).map((el) => el.textContent.trim());
      const reactions = await fetchReactions(postId, isUnread);
      const filteredReactions = reactions.filter((reaction) =>
        usernames.includes(reaction.username)
      );
      const reactionHTML = formatReactions(filteredReactions);
      titleElement.innerHTML = titleText.replace(
        /(have|has)\s+reacted.*$/,
        `<b style="color: #3889ED;">reacted</b> ${reactionHTML} to:`
      );
    }
  };

  const customizeMentionNotification = (notificationBlock) => {
    console.log("Notification block:", notificationBlock);

    const notificationText =
      notificationBlock.querySelector(".notification_text");
    console.log("Notification text element:", notificationText);

    const titleElement = notificationText.querySelector(".notification-title");
    console.log("Title element:", titleElement);

    const originalHTML = titleElement.innerHTML;
    console.log("Original HTML:", originalHTML);

    // Extract usernames
    const usernameElements = titleElement.querySelectorAll(
      ".username, .username-coloured"
    );
    console.log("Username elements:", usernameElements);

    const usernames = Array.from(usernameElements)
      .map((el) => el.outerHTML)
      .join(", ");
    console.log("Extracted usernames:", usernames);

    // Extract topic name
    const parts = originalHTML.split("<br>in ");
    console.log("Split parts:", parts);
    let topicName = "Unknown Topic";
    if (parts.length > 1) {
      topicName = parts[1].replace(/^"|"$/g, "").trim();
    }
    console.log("Extracted topic name:", topicName);

    if (topicName.length > 50) {
      topicName = topicName.substring(0, 50) + "...";
    }

    // Construct new HTML
    const newHTML = `
      You were <b style="color: #FFC107;">mentioned</b> by ${usernames}
      <br>in <span class="notification-reference">${topicName}</span>
    `;
    console.log("New HTML:", newHTML);

    titleElement.innerHTML = newHTML;

    // Reattach the time element if it exists
    const timeElement = notificationText.querySelector(".notification-time");
    if (timeElement) {
      notificationText.appendChild(timeElement);
    }
  };

  const customizePrivateMessageNotification = (
    titleElement,
    referenceElement
  ) => {
    const subject = referenceElement?.textContent
      .trim()
      .replace(/^"(.*)"$/, "$1");
    if (subject === "Board warning issued") {
      titleElement.innerHTML = titleElement.innerHTML
        .replace(
          /<strong>Private Message<\/strong>/,
          '<strong style="color: #D31141;">Board warning issued</strong>'
        )
        .replace(/from/, "by")
        .replace(/:$/, "");
      referenceElement?.remove();
    }
  };

  const customizeNotificationBlock = async (block) => {
    if (block.dataset.customized === "true") return;

    const notificationText = block.querySelector(".notification_text");
    const titleElement = notificationText.querySelector(".notification-title");

    if (titleElement) {
      const titleText = titleElement.innerHTML;

      if (titleText.includes("You were mentioned by")) {
        customizeMentionNotification(block);
      } else if (titleText.includes("reacted to a message you posted")) {
        await customizeReactionNotification(titleElement, block);
      } else if (titleText.includes("Private Message")) {
        customizePrivateMessageNotification(
          titleElement,
          notificationText.querySelector(".notification-reference")
        );
      } else if (titleText.includes("Report closed")) {
        titleElement.innerHTML = titleText.replace(
          /Report closed/,
          '<strong style="color: #f58c05;">Report closed</strong>'
        );
      } else if (titleText.includes("Quoted")) {
        // Handle Quoted notifications if needed
      }

      titleElement.innerHTML = titleElement.innerHTML
        .replace(
          /<strong>Quoted<\/strong>/,
          '<strong style="color: #FF4A66;">Quoted</strong>'
        )
        .replace(
          /<strong>Reply<\/strong>/,
          '<strong style="color: #FFD866;">Reply</strong>'
        );
    }

    const referenceElement = block.querySelector(".notification-reference");
    if (referenceElement) {
      styleReference(referenceElement);
    }

    block.querySelectorAll(".username-coloured").forEach((el) => {
      el.classList.replace("username-coloured", "username");
      el.style.color = "";
    });

    block.dataset.customized = "true";
  };

  const customizeNotificationPanel = () => {
    document
      .querySelectorAll(".notification-block, a.notification-block")
      .forEach(customizeNotificationBlock);
  };

  const customizeNotificationPage = () => {
    document.querySelectorAll(".cplist .row").forEach((row) => {
      if (row.dataset.customized === "true") return;

      const notificationBlock = row.querySelector(".notifications");
      const anchorElement = notificationBlock.querySelector("a");

      if (anchorElement) {
        const titleElement = anchorElement.querySelector(
          ".notifications_title"
        );
        let titleText = titleElement.innerHTML;

        titleText = titleText
          .replace(/\bReply\b/g, '<b style="color: #FFD866;">Reply</b>')
          .replace(/\bQuoted\b/g, '<b style="color: #FF4A66;">Quoted</b>')
          .replace(/\breacted\b/g, '<b style="color: #3889ED;">reacted</b>')
          .replace(
            /\bReport closed\b/g,
            '<b style="color: #f58c05;">Report closed</b>'
          );

        const quoteMatch = titleText.match(/"([^"]*)"/);
        if (quoteMatch) {
          const quote = quoteMatch[1];
          const trimmedQuote =
            quote.length > 50 ? quote.substring(0, 50) + "..." : quote;
          titleText = titleText.replace(
            /in topic: "([^"]*)"/,
            `<br><span class="notification-reference" style="background: rgba(23, 27, 36, 0.5); color: #ffffff; padding: 2px 4px; border-radius: 2px; display: inline-block; margin-top: 5px;">"${trimmedQuote}"</span>`
          );
        }

        titleText = titleText.replace(
          /(to a message you posted) "([^"]*)"/g,
          '$1 <br><span class="notification-reference" style="background: rgba(23, 27, 36, 0.5); color: #ffffff; padding: 2px 4px; border-radius: 2px; display: inline-block; margin-top: 5px;">"$2"</span>'
        );

        anchorElement.innerHTML = `
          <div class="notification-block">
            <div class="notification-title">${titleText}</div>
          </div>
        `;
      }

      row.dataset.customized = "true";
    });
  };

  // Mark notifications as read
  const getDisplayedPostIds = () => {
    return Array.from(document.querySelectorAll('div[id^="p"]')).map((el) =>
      el.id.substring(1)
    );
  };

  const getNotificationData = () => {
    return Array.from(document.querySelectorAll(".notification-block"))
      .map((link) => {
        const href = link.getAttribute("href");
        const postId = (link.getAttribute("data-real-url") || href)?.match(
          /p=(\d+)/
        )?.[1];
        return { href, postId };
      })
      .filter((data) => data.href && data.postId);
  };

  const markNotificationAsRead = (href) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: "https://rpghq.org/forums/" + href,
      onload: (response) =>
        console.log("Notification marked as read:", response.status),
    });
  };

  const checkAndMarkNotifications = () => {
    const displayedPostIds = getDisplayedPostIds();
    const notificationData = getNotificationData();

    notificationData.forEach((notification) => {
      if (displayedPostIds.includes(notification.postId)) {
        markNotificationAsRead(notification.href);
      }
    });
  };

  // Main function
  const init = () => {
    customizeNotificationPanel();
    checkAndMarkNotifications();

    if (window.location.href.includes("ucp.php?i=ucp_notifications")) {
      customizeNotificationPage();
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          customizeNotificationPanel();
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  };

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
