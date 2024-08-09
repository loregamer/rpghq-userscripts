// ==UserScript==
// @name         RPGHQ Title Colorizer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Colorize specific text in titles on RPGHQ forums, including sticky topics
// @match        https://rpghq.org/forums/*
// @grant        none
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/main/BetterBloomery.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/main/BetterBloomery.user.js
// ==/UserScript==

(function () {
  "use strict";

  const colorMap = {
    "【 Userscript 】": "#00AA00",
    "【 Resource 】": "#3889ED",
    "【 Project 】": "#FF4A66",
    "【 Tutorial 】": "#FFC107",
  };

  function colorizeTopicTitles() {
    // Select all topic titles, including those in sticky rows
    const topicTitles = document.querySelectorAll("a.topictitle");

    topicTitles.forEach((title) => {
      for (const [text, color] of Object.entries(colorMap)) {
        if (title.textContent.includes(text)) {
          const coloredText = `<span style="color: ${color};">${text}</span>`;
          title.innerHTML = title.innerHTML.replace(text, coloredText);
        }
      }
    });
  }

  // If the forum uses AJAX to load new content, you might need to run the function periodically
  // Uncomment the following line if needed:
  // setInterval(colorizeTopicTitles, 2000);

  window.addEventListener("load", function () {
    colorizeTopicTitles();
  });
})();
