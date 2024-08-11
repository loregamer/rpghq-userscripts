// ==UserScript==
// @name         Guilded Image/Video Only (Improved)
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  Remove messages without images or videos on guilded.gg, except the first message
// @match        https://www.guilded.gg/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function removeNonMediaMessages() {
    const messageWrappers = document.querySelectorAll(
      ".EnableAnimationsOnHover-hover-wrapper"
    );

    // Skip the first message wrapper
    for (let i = 1; i < messageWrappers.length; i++) {
      const wrapper = messageWrappers[i];
      const messageContainer = wrapper.querySelector(
        ".ChatV2Message-container"
      );
      if (messageContainer) {
        const hasMedia = messageContainer.querySelector(
          ".MediaRendererV2-container"
        );
        if (!hasMedia) {
          messageContainer.remove();
        }
      }
    }
  }

  // Run the function initially and then every 2 seconds
  removeNonMediaMessages();
  setInterval(removeNonMediaMessages, 2000);

  // Add a MutationObserver to handle dynamically loaded content
  const chatContainer = document.querySelector(".ChatV2MessageList-container");
  if (chatContainer) {
    const observer = new MutationObserver(removeNonMediaMessages);
    observer.observe(chatContainer, { childList: true, subtree: true });
  }
})();
