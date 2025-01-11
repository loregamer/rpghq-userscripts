// ==UserScript==
// @name         Chat Ignore
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Hide specific elements in chat
// @author       You
// @match        https://chat.rpghq.org/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // Function to hide elements based on text content and selector
  function hideElements(selector, textContent) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      if (element.textContent.includes(textContent)) {
        element.style.display = "none";
      }
    });
  }

  // Function to selectively hide text elements
  function hideTextElements(selector, textContent) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      // Skip if this is part of a following message
      if (
        element.closest(
          "p._1xny9xl0._1mqalmd1._1mqalmd0._1xny9xlb._1xny9xlr._1xny9xln"
        )
      ) {
        return;
      }

      // If it's a direct text match in a button, only hide the specific text elements
      const parentButton = element.closest("button._13tt0gb6");
      if (parentButton) {
        const textElements = parentButton.querySelectorAll("p, span, b");
        textElements.forEach((textEl) => {
          if (textEl.textContent.includes(textContent)) {
            textEl.style.display = "none";
          }
        });
        return;
      }

      // For other cases, hide the element if it contains the text
      if (element.textContent.includes(textContent)) {
        element.style.display = "none";
      }
    });
  }

  // Function to handle "following the conversation" messages
  function handleFollowingMessages(usersToHide) {
    const followingMessages = document.querySelectorAll(
      "p._1xny9xl0._1mqalmd1._1mqalmd0._1xny9xlb._1xny9xlr._1xny9xln"
    );
    followingMessages.forEach((message) => {
      const boldElements = message.querySelectorAll("b");
      boldElements.forEach((bold) => {
        if (usersToHide.includes(bold.textContent)) {
          // Find the next span with comma or "and"
          let nextSpan = bold.nextElementSibling;
          if (nextSpan && nextSpan.textContent.match(/(,| and )/)) {
            nextSpan.style.display = "none";
          }
          bold.style.display = "none";
        }
      });
    });
  }

  // Function to run the hiding logic
  function applyFilters() {
    const usersToHide = ["stackofturtles", "Vergil"];

    // Handle following messages specially
    handleFollowingMessages(usersToHide);

    usersToHide.forEach((user) => {
      // Hide usernames in bold (except in following messages which are handled separately)
      const boldElements = document.querySelectorAll("b");
      boldElements.forEach((element) => {
        if (
          element.textContent === user &&
          !element.closest(
            "p._1xny9xl0._1mqalmd1._1mqalmd0._1xny9xlb._1xny9xlr._1xny9xln"
          )
        ) {
          element.style.display = "none";
        }
      });

      // Use the new selective hiding function instead of hideElementsWithParents
      hideTextElements("p", user);
      hideTextElements("span", user);
    });

    // Hide appservice mentions
    hideTextElements("p", "appservice");

    // Hide messages containing "tz"
    hideTextElements("span", "tz");

    // Hide "left the room" messages
    usersToHide.forEach((user) => {
      hideElements("div._161nxvec p", `${user} left the room`);
    });

    // Hide specific date
    hideElements("span._13qe89m6 p", "25 December 2024");

    // Hide all messages from tars that mention ignored users
    usersToHide.forEach((user) => {
      const tarsMessages = document.querySelectorAll(
        'button[data-user-id="@irc_tars:rpghq.org"]'
      );
      tarsMessages.forEach((message) => {
        const messageContainer = message.closest("div._161nxvec");
        if (messageContainer && messageContainer.textContent.includes(user)) {
          messageContainer.style.display = "none";
        }
      });
    });
  }

  // Run initially
  applyFilters();

  // Create a MutationObserver to handle dynamically loaded content
  const observer = new MutationObserver(() => {
    applyFilters();
  });

  // Start observing the chat container for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
