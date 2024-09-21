// ==UserScript==
// @name         RPGHQ Quote Box Improver
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Improves quote boxes on rpghq.org and scrolls to specified post
// @match        https://rpghq.org/forums/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function processQuoteBoxes() {
    const allQuotes = document.querySelectorAll("blockquote");
    allQuotes.forEach((quoteBox) => {
      try {
        processQuote(quoteBox);
      } catch (error) {
        console.error("Error processing quote box:", error);
      }
    });
  }

  function processQuote(quoteBox) {
    const isNested = quoteBox.closest("blockquote blockquote") !== null;
    if (isNested) {
      const citation = quoteBox.querySelector("cite");
      const nestedContent = document.createElement("div");
      nestedContent.className = "nested-quote-content";

      while (quoteBox.firstChild) {
        if (quoteBox.firstChild !== citation) {
          nestedContent.appendChild(quoteBox.firstChild);
        } else {
          quoteBox.removeChild(quoteBox.firstChild);
        }
      }

      if (citation) {
        quoteBox.appendChild(citation);
      }
      quoteBox.appendChild(nestedContent);
      addQuoteToggle(quoteBox, nestedContent);
    }
  }

  function removeReadMoreButtons() {
    const readMoreButtons = document.querySelectorAll(".imcger-quote-button");
    readMoreButtons.forEach((button) => button.remove());

    const quoteShadows = document.querySelectorAll(".imcger-quote-shadow");
    quoteShadows.forEach((shadow) => shadow.remove());

    const quoteTexts = document.querySelectorAll(".imcger-quote-text");
    quoteTexts.forEach((text) => {
      text.style.maxHeight = "none";
      text.style.overflow = "visible";
    });
  }

  function applyCustomStyles() {
    const style = document.createElement("style");
    style.textContent = `
            blockquote {
                background-color: #2a2e36;
                border-left: 3px solid #4a90e2;
                padding: 10px;
                margin: 10px 0;
                font-size: 0.9em;
                line-height: 1.4;
            }
            blockquote cite {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
                color: #4a90e2;
            }
            .quote-divider {
                border: none;
                border-top: 1px solid #3a3f4c;
                margin: 10px 0;
            }
            .quote-toggle {
                cursor: pointer;
                color: #4a90e2;
                font-size: 0.8em;
                margin-top: 5px;
                display: block;
            }
            .nested-quote-content {
                margin-top: 5px;
                margin-bottom: 5px;
            }
        `;
    document.head.appendChild(style);
  }

  function addQuoteToggle(quoteBox, nestedContent) {
    const toggle = document.createElement("span");
    toggle.className = "quote-toggle";
    toggle.textContent = "Expand Quote";
    nestedContent.style.display = "none";

    toggle.onclick = function () {
      if (nestedContent.style.display === "none") {
        nestedContent.style.display = "block";
        this.textContent = "Collapse Quote";
      } else {
        nestedContent.style.display = "none";
        this.textContent = "Expand Quote";
      }
    };
    quoteBox.appendChild(toggle);
  }

  function scrollToPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("p") || window.location.hash.slice(1);
    if (postId) {
      const postElement = document.getElementById(postId);
      if (postElement) {
        setTimeout(() => {
          postElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100); // Small delay to ensure DOM is ready
      }
    }
  }

  function init() {
    processQuoteBoxes();
    removeReadMoreButtons();
    applyCustomStyles();
    scrollToPost();
  }

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    init();
  } else {
    window.addEventListener("load", init);
  }
})();
