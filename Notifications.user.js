// ==UserScript==
// @name         RPGHQ Notifications Customization
// @namespace    http://tampermonkey.net/
// @version      2.0.1
// @description  Customize RPGHQ notifications display
// @author       LOREGAMER
// @match        https://rpghq.org/*/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @grant        none
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

  function customizeNotificationPanel() {
    let notificationBlocks = document.querySelectorAll(
      ".notification-block, a.notification-block"
    );
    customizeNotifications(notificationBlocks, true);
  }

  function customizeNotificationPage() {
    let notificationRows = document.querySelectorAll(".cplist .row");
    notificationRows.forEach((row) => {
      if (row.dataset.customized === "true") return;

      let notificationBlock = row.querySelector(".notifications");
      let anchorElement = notificationBlock.querySelector("a");

      if (anchorElement) {
        let titleElement = anchorElement.querySelector(".notifications_title");
        let titleText = titleElement.innerHTML; // Use innerHTML to preserve existing HTML elements

        // Process the title text
        titleText = titleText
          .replace(/\bReply\b/g, '<b style="color: #FFD866;">Reply</b>')
          .replace(/\bQuoted\b/g, '<b style="color: #FF4A66;">Quoted</b>')
          .replace(/\breacted\b/g, '<b style="color: #3889ED;">reacted</b>')
          .replace(
            /\bReport closed\b/g,
            '<b style="color: #f58c05;">Report closed</b>'
          );

        // Handle quoted text
        let quoteMatch = titleText.match(/in topic: "([^"]*)"/);
        if (quoteMatch) {
          let quote = quoteMatch[1];
          let trimmedQuote =
            quote.length > 50 ? quote.substring(0, 50) + "..." : quote;
          titleText = titleText.replace(
            /in topic: "([^"]*)"/,
            `<br><span class="notification-reference" style="background: rgba(23, 27, 36, 0.5); color: #ffffff; padding: 2px 4px; border-radius: 2px; display: inline-block; margin-top: 5px;">"${trimmedQuote}"</span>`
          );
        }

        // Handle "to a message you posted" text
        titleText = titleText.replace(
          /(to a message you posted) "([^"]*)"/g,
          '$1 <br><span class="notification-reference" style="background: rgba(23, 27, 36, 0.5); color: #ffffff; padding: 2px 4px; border-radius: 2px; display: inline-block; margin-top: 5px;">"$2"</span>'
        );

        // Create new content
        let newContent = `
                <div class="notification-block">
                    <div class="notification-title">${titleText}</div>
                </div>
            `;

        // Replace the entire content of the anchor element
        anchorElement.innerHTML = newContent;
      }

      row.dataset.customized = "true";
    });
  }

  function customizeNotifications(notificationBlocks, isPanel) {
    notificationBlocks.forEach((block) => {
      if (block.dataset.customized === "true") return;

      let titleElement = block.querySelector(
        isPanel ? ".notification-title" : ".notifications_title"
      );
      let referenceElement = block.querySelector(".notification-reference");

      if (titleElement) {
        let titleText = titleElement.innerHTML;

        if (titleText.includes("reacted to a message you posted")) {
          let postId;
          if (block.hasAttribute("data-real-url")) {
            // Extract postId from data-real-url for unread notifications
            let match = block.getAttribute("data-real-url").match(/p=(\d+)/);
            postId = match ? match[1] : null;
          } else {
            // Use existing method for read notifications
            let anchorTag = isPanel ? block : block.querySelector("a");
            let postIdMatch =
              anchorTag && anchorTag.href
                ? anchorTag.href.match(/p=(\d+)/)
                : null;
            postId = postIdMatch ? postIdMatch[1] : null;
          }

          fetchReactions(postId).then((reactions) => {
            let reactionHTML = formatReactions(reactions);

            let newTitleText = titleText.replace(
              /(have|has)\s+reacted.*$/,
              `<b style="color: #3889ED;">reacted</b> ${reactionHTML} to:`
            );

            titleElement.innerHTML = newTitleText;
          });
        } else if (titleText.includes("You were mentioned by")) {
          let topicMatch = titleText.match(/in:?\s*"(.*)"/);
          let topicName = topicMatch ? topicMatch[1] : "";
          titleElement.innerHTML = `You were <b style="color: #FFC107;">mentioned</b><br>in <span class="notification-reference">${topicName}</span>`;
        } else if (titleText.includes("Private Message")) {
          titleElement.innerHTML = titleText
            .replace(
              /<strong>Private Message<\/strong>/,
              '<strong style="color: #D31141;">Board warning issued</strong>'
            )
            .replace(/from/, "by")
            .replace(/:$/, "");
          if (referenceElement) referenceElement.remove();
        } else if (titleText.includes("Report closed")) {
          titleElement.innerHTML = titleText.replace(
            /Report closed/,
            '<strong style="color: #f58c05;">Report closed</strong>'
          );
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

      if (referenceElement) {
        Object.assign(referenceElement.style, {
          background: "rgba(23, 27, 36, 0.5)",
          color: "#ffffff",
          padding: "2px 4px",
          borderRadius: "2px",
          zIndex: "-1",
          display: "inline-block",
          whiteSpace: "nowrap",
        });
      }

      block.querySelectorAll(".username-coloured").forEach((el) => {
        el.classList.remove("username-coloured");
        el.classList.add("username");
        el.style.color = "";
      });

      block.dataset.customized = "true";
    });
  }

  // Add this function to handle local storage operations
  function getStoredReactions(postId) {
    const storedReactions = localStorage.getItem(`reactions_${postId}`);
    if (storedReactions) {
      const { reactions, timestamp } = JSON.parse(storedReactions);
      // Check if the stored data is less than 24 hours old
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        return reactions;
      }
    }
    return null;
  }

  function storeReactions(postId, reactions) {
    localStorage.setItem(
      `reactions_${postId}`,
      JSON.stringify({
        reactions,
        timestamp: Date.now(),
      })
    );
  }

  function fetchReactions(postId) {
    const storedReactions = getStoredReactions(postId);
    if (storedReactions) {
      return Promise.resolve(storedReactions);
    }

    return fetch(
      `https://rpghq.org/forums/reactions?mode=view&post=${postId}`,
      {
        method: "POST",
        headers: {
          accept: "application/json, text/javascript, */*; q=0.01",
          "x-requested-with": "XMLHttpRequest",
        },
        credentials: "include",
      }
    )
      .then((response) => response.json())
      .then((data) => {
        let parser = new DOMParser();
        let doc = parser.parseFromString(data.htmlContent, "text/html");
        let reactions = [];
        doc.querySelectorAll('.tab-content[data-id="0"] li').forEach((li) => {
          reactions.push({
            image: li.querySelector(".reaction-image").src,
            name: li.querySelector(".reaction-image").alt,
          });
        });
        storeReactions(postId, reactions);
        return reactions;
      });
  }

  function formatReactions(reactions) {
    let reactionHTML =
      '<span style="display: inline-flex; margin-left: 2px; vertical-align: middle;">';
    reactions.forEach((reaction) => {
      reactionHTML += `
                <img src="${reaction.image}" alt="${reaction.name}" title="${reaction.name}" 
                     style="height: 1em !important; width: auto !important; vertical-align: middle !important; margin-right: 2px !important;">
            `;
    });
    reactionHTML += "</span>";
    return reactionHTML;
  }

  function init() {
    customizeNotificationPanel();

    // Check if we're on the full notifications page
    if (window.location.href.includes("ucp.php?i=ucp_notifications")) {
      customizeNotificationPage();
    }

    // Set up a MutationObserver to handle dynamically loaded notifications
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          customizeNotificationPanel();
        }
      });
    });

    const config = { childList: true, subtree: true };
    observer.observe(document.body, config);
  }

  // Run the init function when the page loads
  window.addEventListener("load", init);
})();
