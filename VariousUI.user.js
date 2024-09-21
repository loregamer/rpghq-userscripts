// ==UserScript==
// @name         RPGHQ Quote Box Improver
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Improves quote boxes on rpghq.org
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
      const nestedContent = document.createElement("div");
      nestedContent.className = "nested-quote-content";
      while (quoteBox.firstChild) {
        nestedContent.appendChild(quoteBox.firstChild);
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
                display: inline-block;
            }
            .nested-quote-content {
                margin-top: 10px;
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
    quoteBox.insertBefore(toggle, quoteBox.firstChild);
  }

  function init() {
    processQuoteBoxes();
    removeReadMoreButtons();
    applyCustomStyles();
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
