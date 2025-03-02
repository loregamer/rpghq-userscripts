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

  // Add beforeunload event listener

  window.addEventListener("beforeunload", function (e) {
    const confirmationMessage =
      "ChatGPT is currently reasoning. Are you sure you want to leave?";
    e.returnValue = confirmationMessage; // Standard for most browsers
    return confirmationMessage; // For older browsers
  });
})();
