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

  // Function to hide user buttons and messages
  function hideUserContent(userId) {
    // Hide user buttons - try both original case and lowercase
    const userButtons = document.querySelectorAll(
      `button[data-user-id="@${userId.toLowerCase()}:rpghq.org"], button[data-user-id="@${userId}:rpghq.org"]`
    );
    userButtons.forEach((button) => {
      button.style.display = "none";
    });

    // Hide messages containing the user's name
    const allMessages = document.querySelectorAll("div._161nxvec");
    allMessages.forEach((message) => {
      if (message.textContent.toLowerCase().includes(userId.toLowerCase())) {
        message.style.display = "none";
      }
    });

    // Hide direct message entries in sidebar
    const directMessageEntries = document.querySelectorAll("div.a6xo8r0");
    directMessageEntries.forEach((entry) => {
      if (entry.textContent.toLowerCase().includes(userId.toLowerCase())) {
        entry.style.display = "none";
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

  // Function to hide typing indicators
  function hideTypingIndicators() {
    const typingIndicators = document.querySelectorAll(
      "p._1xny9xl0._1mqalmd1._1mqalmd0._1xny9xlb._1xny9xlr._1xny9xln"
    );
    typingIndicators.forEach((indicator) => {
      if (indicator.textContent.includes("is typing...")) {
        const container = indicator.closest(
          "div.prxiv40._1mqalmd1._1mqalmd0.prxiv41"
        );
        if (container) {
          container.style.display = "none";
        }
      }
    });
  }

  // Function to run the hiding logic
  function applyFilters() {
    const usersToHide = ["stackofturtles", "Vergil"];

    // Hide typing indicators
    hideTypingIndicators();

    // Handle following messages specially
    handleFollowingMessages(usersToHide);

    usersToHide.forEach((user) => {
      // Hide all content for each user
      hideUserContent(user);
    });

    // Hide appservice mentions
    hideElements("div._161nxvec", "appservice");

    // Hide messages containing "tz"
    hideElements("div._161nxvec", "tz");

    // Hide "left the room" messages
    usersToHide.forEach((user) => {
      hideElements("div._161nxvec", `${user} left the room`);
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
