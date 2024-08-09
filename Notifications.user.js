// ==UserScript==
// @name         RPGHQ Notifications Customization
// @namespace    http://tampermonkey.net/
// @version      1.6.2
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

  function customizeNotifications() {
    let notificationBlocks = document.querySelectorAll(".notification-block");

    notificationBlocks.forEach((block) => {
      if (block.dataset.customized === "true") return;

      let titleElement = block.querySelector(".notification-title");
      let referenceElement = block.querySelector(".notification-reference");

      if (titleElement) {
        let titleText = titleElement.innerHTML;

        if (titleText.includes("reacted to a message you posted")) {
          let postIdMatch = block.getAttribute("data-real-url")
            ? block.getAttribute("data-real-url").match(/p=(\d+)/)
            : block.href.match(/p=(\d+)/);
          if (postIdMatch && postIdMatch[1]) {
            let postId = postIdMatch[1];
            fetchReactions(postId).then((reactions) => {
              let reactionHTML = formatReactions(reactions);

              let usernameMatches = titleText.match(
                /<span[^>]*class="username(?:-coloured)?"[^>]*>([^<]+)<\/span>/g
              );
              let usernames = usernameMatches
                ? usernameMatches.join(", ")
                : "User";
              titleElement.innerHTML = `${titleText.replace(
                /(have|has)\s+reacted.*$/,
                ""
              )} <b style="color: #3889ED;">reacted</b> ${reactionHTML} to:`;
            });
          }
        } else if (titleText.includes("You were mentioned by")) {
          let topicMatch = titleText.match(/in "(.*)"/);
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

      block.querySelectorAll(".notification-reference").forEach((ref) => {
        Object.assign(ref.style, {
          background: "rgba(23, 27, 36, 0.5)",
          color: "#ffffff",
          padding: "2px 4px",
          borderRadius: "2px",
          zIndex: "-1",
          display: "inline-block",
          whiteSpace: "nowrap",
        });
      });

      block.querySelectorAll(".username-coloured").forEach((el) => {
        el.classList.remove("username-coloured");
        el.classList.add("username");
        el.style.color = "";
      });

      block.dataset.customized = "true";
    });
  }

  function fetchReactions(postId) {
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

  function observeDocumentChanges() {
    const observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.addedNodes.length > 0)) {
        customizeNotifications();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  window.addEventListener("load", function () {
    customizeNotifications();
    observeDocumentChanges();
  });
})();
