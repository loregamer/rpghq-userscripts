// ==UserScript==
// @name         Prevent Tab Close During ChatGPT Reasoning
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Prevent closing the tab when ChatGPT is showing "Reasoning" text
// @author       Loregamer
// @match        https://chatgpt.com/*
// @grant        none
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/main/Misc/better-chatgpt.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/main/Misc/better-chatgpt.user.js
// ==/UserScript==

(function () {
  "use strict";

  // Track if reasoning is in progress
  let isReasoning = false;

  // Function to check for reasoning text
  function checkReasoning() {
    const reasoningElement = document.querySelector(
      '.loading-shimmer:contains("Reasoning")'
    );
    isReasoning = !!reasoningElement;
  }

  // Set up a MutationObserver to watch for changes
  const observer = new MutationObserver(checkReasoning);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  // Initial check
  checkReasoning();

  // Add beforeunload event listener
  window.addEventListener("beforeunload", function (e) {
    if (isReasoning) {
      e.preventDefault();
      e.returnValue =
        "ChatGPT is currently reasoning. Are you sure you want to leave?";
      return e.returnValue;
    }
  });

  // Check periodically in case MutationObserver misses something
  setInterval(checkReasoning, 1000);
})();
