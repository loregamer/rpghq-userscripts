// ==UserScript==
// @name         RPGHQ Random Topic
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Adds a Random Topic button to RPGHQ
// @match        https://rpghq.org/forums/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // Function to get a random topic
  function getRandomTopic() {
    // We'll use a large range for topic IDs. Adjust if needed.
    const randomId = Math.floor(Math.random() * 10000) + 1;
    return `https://rpghq.org/forums/viewtopic.php?t=${randomId}`;
  }

  // Function to create and add the button
  function addRandomTopicButton() {
    const navMain = document.getElementById("nav-main");
    if (navMain) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#";
      a.role = "menuitem";
      a.innerHTML =
        '<i class="icon fa-random fa-fw" aria-hidden="true"></i><span>Random Topic</span>';
      a.onclick = function (e) {
        e.preventDefault();
        window.location.href = getRandomTopic();
      };
      li.appendChild(a);
      navMain.appendChild(li);
    }
  }

  // Run the function when the page is loaded
  addRandomTopicButton();
})();
