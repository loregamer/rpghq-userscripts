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

  // Function to hide elements and their parent containers
  function hideElementsWithParents(selector, textContent) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      if (element.textContent.includes(textContent)) {
        // Find the closest parent container and hide it
        const parentButton = element.closest("button._13tt0gb6");
        const parentDiv = element.closest("div.a6xo8r0");
        if (parentButton) parentButton.style.display = "none";
        if (parentDiv) parentDiv.style.display = "none";
        if (!parentButton && !parentDiv) element.style.display = "none";
      }
    });
  }

  // Function to run the hiding logic
  function applyFilters() {
    const usersToHide = ["stackofturtles", "Vergil"];

    usersToHide.forEach((user) => {
      // Hide usernames in bold
      hideElements("b", user);

      // Hide user buttons and their containers
      hideElementsWithParents("p", user);
      hideElementsWithParents("span", user);
    });

    // Hide appservice mentions
    hideElementsWithParents("p", "appservice");

    // Hide messages containing "tz"
    hideElementsWithParents("span", "tz");

    // Hide "left the room" messages
    usersToHide.forEach((user) => {
      hideElements("div._161nxvec p", `${user} left the room`);
    });

    // Hide specific date
    hideElements("span._13qe89m6 p", "25 December 2024");
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
