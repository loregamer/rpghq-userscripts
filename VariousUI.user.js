// ==UserScript==
// @name         RPGHQ UI Tweaks
// @namespace    http://tampermonkey.net/
// @version      0.7
// @description  Various UI improvements for rpghq.org
// @match        https://rpghq.org/forums/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  let settings = {
    betterQuoteBoxes: false,
  };

  function addUITweaksDropdown() {
    const navMain = document.getElementById("nav-main");
    if (!navMain) return;

    const notificationsLi = document.querySelector(
      "#nav-main .dropdown-container.dropdown-right.rightside"
    );
    if (!notificationsLi) return;

    const dropdownLi = document.createElement("li");
    dropdownLi.className = "dropdown-container dropdown-right rightside";
    dropdownLi.style.marginRight = "5px"; // Add some space between UI Tweaks and Notifications
    dropdownLi.innerHTML = `
      <a href="#" class="dropdown-trigger">
        <i class="icon fa-cogs fa-fw" aria-hidden="true"></i><span>UI Tweaks</span>
      </a>
      <div class="dropdown">
        <div class="pointer"><div class="pointer-inner"></div></div>
        <ul class="dropdown-contents" role="menu">
          <li>
            <a href="#" id="toggle-better-quote-boxes" class="toggle-setting">
              <span class="setting-name">Better Quote Boxes</span>
              <span class="toggle-switch">
                <input type="checkbox" id="better-quote-boxes-checkbox">
                <label for="better-quote-boxes-checkbox"></label>
              </span>
            </a>
          </li>
        </ul>
      </div>
    `;

    navMain.insertBefore(dropdownLi, notificationsLi);

    document
      .getElementById("toggle-better-quote-boxes")
      .addEventListener("click", toggleBetterQuoteBoxes);

    // Apply initial state
    updateToggleUI(
      document.getElementById("better-quote-boxes-checkbox"),
      settings.betterQuoteBoxes
    );
  }

  function toggleBetterQuoteBoxes(e) {
    e.preventDefault();
    const checkbox = document.getElementById("better-quote-boxes-checkbox");
    settings.betterQuoteBoxes = !settings.betterQuoteBoxes;
    saveSettings();
    if (settings.betterQuoteBoxes) {
      processQuoteBoxes();
      removeReadMoreButtons();
      applyCustomStyles();
    } else {
      // Implement reverting changes if needed
    }
    updateToggleUI(checkbox, settings.betterQuoteBoxes);
  }

  function updateToggleUI(checkbox, enabled) {
    if (checkbox) {
      checkbox.checked = enabled;
    }
  }

  function saveSettings() {
    localStorage.setItem("rpghqUITweaks", JSON.stringify(settings));
  }

  function loadSettings() {
    const savedSettings = localStorage.getItem("rpghqUITweaks");
    if (savedSettings) {
      settings = JSON.parse(savedSettings);
    }
  }

  function applyCustomStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .toggle-setting {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .toggle-switch {
        position: relative;
        display: inline-block;
        width: 40px;
        height: 20px;
      }
      .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .toggle-switch label {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
        border-radius: 34px;
      }
      .toggle-switch label:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }
      .toggle-switch input:checked + label {
        background-color: #2196F3;
      }
      .toggle-switch input:checked + label:before {
        transform: translateX(20px);
      }
      /* Existing styles for quote boxes */
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
    loadSettings();
    addUITweaksDropdown();
    applyCustomStyles();
    if (settings.betterQuoteBoxes) {
      processQuoteBoxes();
      removeReadMoreButtons();
    }
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
