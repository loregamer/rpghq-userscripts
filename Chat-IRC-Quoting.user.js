// ==UserScript==
// @name         Chat IRC Quoting
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Convert IRC-style quotes to proper reply format on chat.rpghq.org
// @author       You
// @match        https://chat.rpghq.org/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // Helper function to find the closest message element
  function findMessageElement(element) {
    return element.closest("[data-message-id]");
  }

  // Helper function to find a message by username and content
  function findMessageByContent(username, content) {
    const messages = document.querySelectorAll("[data-message-id]");
    for (const message of messages) {
      const userElement = message.querySelector("button[data-user-id]");
      if (!userElement) continue;

      const messageUsername = userElement.querySelector("b").textContent;
      const messageContent = message.querySelector("._161nxvet")?.textContent;

      if (messageUsername === username && messageContent?.includes(content)) {
        return message;
      }
    }
    return null;
  }

  // Function to convert IRC quote to reply
  function convertIRCQuote(messageElement) {
    const contentDiv = messageElement.querySelector("._161nxvet");
    if (!contentDiv) return;

    const text = contentDiv.textContent;
    const quoteMatch = text.match(/<@?([^>]+)>\s*(.*?)\s*</);

    if (!quoteMatch) return;

    const [fullMatch, username, quotedContent] = quoteMatch;
    const remainingText = text
      .substring(fullMatch.length)
      .replace(/^\s*<\s*/, "")
      .trim();

    // Find the quoted message
    const quotedMessage = findMessageByContent(username, quotedContent);
    if (!quotedMessage) return;

    // Create reply wrapper
    const replyWrapper = document.createElement("div");
    replyWrapper.className = "replyWrapper";

    // Create reply button structure
    const replyHTML = `
            <div class="prxiv40 _1mqalmd1 _1mqalmd0 prxiv41 prxiv46">
                <button class="prxiv40 _1mqalmd1 _1mqalmd0 prxiv41 prxiv41a prxiv41d prxiv41j _1en4l6y3" data-event-id="${quotedMessage.dataset.messageId}">
                    <div class="prxiv40 _1mqalmd1 _1mqalmd0 prxiv41 prxiv41a prxiv41t" style="color: var(--mx-uc-1); max-width: 12.5rem;">
                        <svg class="_19nrl2w0 _1mqalmd1 _1mqalmd0 cpipac8" focusable="false" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 9.5V8H7V16H8.5V9.5H21Z" fill="currentColor"></path>
                            <path d="M4.56066 12.6993L3.5 13.76L7.74264 18.0027L11.9853 13.76L10.9246 12.6993L7.74264 15.8813L4.56066 12.6993Z" fill="currentColor"></path>
                        </svg>
                        <p class="_1xny9xl0 _1mqalmd1 _1mqalmd0 _1xny9xlb _1xny9xlr _1xny9xln"><b>${username}</b></p>
                    </div>
                    <div class="prxiv40 _1mqalmd1 _1mqalmd0 prxiv41 prxiv41s _1en4l6y4">
                        <p class="_1xny9xl0 _1mqalmd1 _1mqalmd0 _1xny9xlb _1xny9xlr _1xny9xln">${quotedContent}</p>
                    </div>
                </button>
            </div>
        `;

    replyWrapper.innerHTML = replyHTML;

    // Update the content
    const newContentDiv = document.createElement("div");
    newContentDiv.className = contentDiv.className;
    newContentDiv.textContent = remainingText;

    // Replace the old content
    contentDiv.parentElement.insertBefore(replyWrapper, contentDiv);
    contentDiv.replaceWith(newContentDiv);
  }

  // In the main function, add these utility functions at the top
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Replace the existing observer code with these functions
  function updateAllElements() {
    const messages = document.querySelectorAll("[data-message-id]");
    messages.forEach((messageElement) => {
      const content = messageElement.querySelector("._161nxvet")?.textContent;
      if (content?.match(/<@?[^>]+>/)) {
        convertIRCQuote(messageElement);
      }
    });
  }

  function setupObservers() {
    const debouncedUpdateAllElements = debounce(updateAllElements, 100);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          debouncedUpdateAllElements();
        }
      },
      { subtree: true, childList: true }
    );

    intersectionObserver.observe(document.body);

    const mutationObserver = new MutationObserver((mutations) => {
      if (
        mutations.some(
          (mutation) =>
            mutation.type === "childList" && mutation.addedNodes.length > 0
        )
      ) {
        debouncedUpdateAllElements();
      }
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }

  function initializeScript() {
    updateAllElements();
    setupObservers();
  }

  // Replace the existing observer initialization with
  initializeScript();
})();
