// ==UserScript==
// @name         RPGHQ Title Colorizer
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Colorize specific text in titles on RPGHQ forums, including sticky topics
// @match        https://rpghq.org/forums/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/loregamer/rpghq-userscripts/main/Notifications.user.js
// @downloadURL  https://raw.githubusercontent.com/loregamer/rpghq-userscripts/main/Notifications.user.js
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
