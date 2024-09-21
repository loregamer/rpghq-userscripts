// ==UserScript==
// @name         RPGHQ Quote Box Improver
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Improves quote boxes on rpghq.org
// @match        https://rpghq.org/forums/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function processQuoteBoxes() {
    const topLevelQuotes = document.querySelectorAll(
      "blockquote:not(blockquote blockquote)"
    );
    topLevelQuotes.forEach((quoteBox) => {
      try {
        flattenQuote(quoteBox);
      } catch (error) {
        console.error("Error processing quote box:", error);
      }
    });
  }

  function flattenQuote(quoteBox) {
    const nestedQuotes = Array.from(quoteBox.querySelectorAll("blockquote"));

    // Process nested quotes from innermost to outermost
    for (let i = nestedQuotes.length - 1; i >= 0; i--) {
      const nestedQuote = nestedQuotes[i];
      const parentQuote = nestedQuote.parentElement.closest("blockquote");

      if (parentQuote) {
        const citation = nestedQuote.querySelector("cite");
        if (citation) {
          const divider = document.createElement("hr");
          divider.className = "quote-divider";
          parentQuote.insertBefore(divider, nestedQuote);
          parentQuote.insertBefore(citation, divider);
        }

        // Move content of nested quote to parent quote
        const fragment = document.createDocumentFragment();
        while (nestedQuote.firstChild) {
          fragment.appendChild(nestedQuote.firstChild);
        }
        parentQuote.insertBefore(fragment, nestedQuote);

        // Remove the now-empty nested quote
        nestedQuote.remove();
      }
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
                display: inline-block;
            }
        `;
    document.head.appendChild(style);
  }

  function addQuoteToggle(quoteBox) {
    const toggle = document.createElement("span");
    toggle.className = "quote-toggle";
    toggle.textContent = "Collapse Quote";
    toggle.onclick = function () {
      const content = quoteBox.querySelector(".imcger-quote-text");
      if (content.style.display === "none") {
        content.style.display = "block";
        this.textContent = "Collapse Quote";
      } else {
        content.style.display = "none";
        this.textContent = "Expand Quote";
      }
    };
    quoteBox.appendChild(toggle);
  }

  function init() {
    processQuoteBoxes();
    removeReadMoreButtons();
    applyCustomStyles();
    document.querySelectorAll("blockquote").forEach(addQuoteToggle);
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
