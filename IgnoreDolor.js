// ==UserScript==
// @name         Ignore Dolor
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically mark as read and remove notifications from dolor
// @author       You
// @match        https://rpghq.org/*/*
// @grant        GM_xmlhttpRequest
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  function processDolorNotifications() {
    const notificationItems = document.querySelectorAll(".notification-block");

    notificationItems.forEach((item) => {
      const usernameElement = item.querySelector(".username");
      if (
        usernameElement &&
        usernameElement.textContent.trim().toLowerCase() === "dolor"
      ) {
        const markReadLink = item.getAttribute("href");
        if (markReadLink) {
          markAsRead(markReadLink);
        }

        const listItem = item.closest("li");
        if (listItem) {
          listItem.remove();
        }
      }
    });
  }

  function markAsRead(href) {
    GM_xmlhttpRequest({
      method: "GET",
      url: "https://rpghq.org/forums/" + href,
      onload: function (response) {
        console.log("Dolor notification marked as read:", response.status);
      },
    });
  }

  function init() {
    processDolorNotifications();

    // Set up a MutationObserver to handle dynamically loaded notifications
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          processDolorNotifications();
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
