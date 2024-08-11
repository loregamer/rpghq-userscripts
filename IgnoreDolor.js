// ==UserScript==
// @name         Ignore Dolor
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Remove "by dolor" in recent topics and lastpost, ignore dolor's notifications
// @author       You
// @match        https://rpghq.org/*/*
// @grant        GM_xmlhttpRequest
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  function processDolorContent() {
    // Process notifications
    const notificationItems = document.querySelectorAll(".notification-block");
    notificationItems.forEach((item) => {
      const usernameElement = item.querySelector(".username");
      if (
        usernameElement &&
        usernameElement.textContent.trim().toLowerCase() === "dolor"
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
              usernameElement.textContent.trim().toLowerCase() === "dolor"
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

  function markAsRead(href) {
    GM_xmlhttpRequest({
      method: "GET",
      url: "https://rpghq.org" + href,
      onload: function (response) {
        console.log("Dolor notification marked as read:", response.status);
      },
    });
  }

  function init() {
    processDolorContent();

    // Set up a MutationObserver to handle dynamically loaded content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          processDolorContent();
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
