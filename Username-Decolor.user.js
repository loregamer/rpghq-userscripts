// ==UserScript==
// @name         RPGHQ Username Color Remover
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Remove color styling from usernames on rpghq.org, except for specified users
// @match        https://rpghq.org/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @grant        none
// @license     MIT
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/main/Username-Decolor.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/main/Username-Decolor.user.js
// ==/UserScript==

(function () {
  "use strict";

  const exclusions = [
    "loregamer",
    "WhiteShark",
    "Nemesis",
    "rusty_shackleford",
    "Oyster Sauce",
  ];

  function processUsernameLinks() {
    const usernameLinks = document.querySelectorAll("a.username-coloured");

    usernameLinks.forEach((link) => {
      const username = link.textContent.trim();

      if (!exclusions.includes(username)) {
        link.classList.remove("username-coloured");
        link.classList.add("username");
        link.style.removeProperty("color");
      }
    });
  }

  processUsernameLinks();

  const observer = new MutationObserver(processUsernameLinks);
  observer.observe(document.body, { childList: true, subtree: true });
})();
