// ==UserScript==
// @name         RPGHQ Notifications Customization
// @namespace    http://tampermonkey.net/
// @version      1.6.1
// @description  Customize RPGHQ notifications display
// @author       LOREGAMER
// @match        https://rpghq.org/*/*
// @updateURL    https://raw.githubusercontent.com/loregamer/rpghq-userscripts/main/Notifications.userscript.js
// @downloadURL  https://raw.githubusercontent.com/loregamer/rpghq-userscripts/main/Notifications.userscript.js
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function customizeNotifications() {
    let notificationBlocks = document.querySelectorAll(
      ".notification-block, .notifications"
    );

    notificationBlocks.forEach((block) => {
      if (block.dataset.customized) return;

      let titleElement = block.querySelector(
        ".notification-title, .notifications_title"
      );
      let referenceElement = block.querySelector(".notification-reference");

      if (titleElement) {
        let titleText = titleElement.innerHTML;

        if (
          titleText.includes("has reacted to a message you posted") ||
          titleText.includes("have reacted to a message you posted")
        ) {
          let usernameMatches = titleText.match(
            /<span[^>]*class="username(?:-coloured)?"[^>]*>([^<]+)<\/span>/g
          );
          let usernames = usernameMatches ? usernameMatches.join(", ") : "User";
          titleElement.innerHTML = `${usernames} <b style="color: #3889ED;">reacted</b>`;
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

        titleElement.innerHTML = titleElement.innerHTML.replace(
          /<strong>Quoted<\/strong>/,
          '<strong style="color: #FF4A66;">Quoted</strong>'
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

  customizeNotifications();

  const observer = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.addedNodes.length > 0)) {
      customizeNotifications();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();