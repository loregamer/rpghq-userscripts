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

  const settings = {
    betterQuoteBoxes: false,
  };

  const utils = {
    saveSettings() {
      localStorage.setItem("rpghqUITweaks", JSON.stringify(settings));
    },

    loadSettings() {
      const savedSettings = localStorage.getItem("rpghqUITweaks");
      if (savedSettings) {
        Object.assign(settings, JSON.parse(savedSettings));
      }
    },

    applyStyles(styles) {
      const style = document.createElement("style");
      style.textContent = styles;
      document.head.appendChild(style);
    },

    scrollToPost() {
      const urlParams = new URLSearchParams(window.location.search);
      const postId = urlParams.get("p") || window.location.hash.slice(1);
      if (postId) {
        const postElement = document.getElementById(postId);
        if (postElement) {
          setTimeout(() => {
            postElement.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 100);
        }
      }
    },
  };

  const betterQuotes = {
    init() {
      this.applyStyles();
      this.processQuoteBoxes();
      this.removeReadMoreButtons();
    },

    applyStyles() {
      utils.applyStyles(`
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
        `);
    },

    processQuoteBoxes() {
      const allQuotes = document.querySelectorAll("blockquote");
      allQuotes.forEach(this.processQuote.bind(this));
    },

    processQuote(quoteBox) {
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
        this.addQuoteToggle(quoteBox, nestedContent);
      }
    },

    addQuoteToggle(quoteBox, nestedContent) {
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
    },

    removeReadMoreButtons() {
      document
        .querySelectorAll(".imcger-quote-button")
        .forEach((button) => button.remove());
      document
        .querySelectorAll(".imcger-quote-shadow")
        .forEach((shadow) => shadow.remove());
      document.querySelectorAll(".imcger-quote-text").forEach((text) => {
        text.style.maxHeight = "none";
        text.style.overflow = "visible";
      });
    },
  };

  const uiTweaks = {
    init() {
      this.addUITweaksDropdown();
      this.applyCustomStyles();
    },

    addUITweaksDropdown() {
      const navMain = document.getElementById("nav-main");
      if (!navMain) return;

      const notificationsLi = document.querySelector(
        "#nav-main .dropdown-container.dropdown-right.rightside"
      );
      if (!notificationsLi) return;

      const dropdownLi = document.createElement("li");
      dropdownLi.className = "dropdown-container dropdown-right rightside";
      dropdownLi.style.marginRight = "5px";
      dropdownLi.innerHTML = `
          <a href="#" class="dropdown-trigger">
            <i class="icon fa-cogs fa-fw" aria-hidden="true"></i
            ><span>UI Tweaks</span>
          </a>
          <div class="dropdown">
            <div class="pointer"><div class="pointer-inner"></div></div>
            <ul class="dropdown-contents" role="menu">
              <li>
                <a id="toggle-better-quote-boxes" href="#" role="menuitem">
                  <i class="icon fa-fw" aria-hidden="true"></i>
                  <span></span>
                </a>
              </li>
            </ul>
          </div>
        `;

      navMain.insertBefore(dropdownLi, notificationsLi);

      const toggleButton = dropdownLi.querySelector(
        "#toggle-better-quote-boxes"
      );
      toggleButton.addEventListener(
        "click",
        this.toggleBetterQuoteBoxes.bind(this)
      );

      this.updateToggleUI();
    },

    toggleBetterQuoteBoxes(e) {
      e.preventDefault();
      settings.betterQuoteBoxes = !settings.betterQuoteBoxes;
      utils.saveSettings();
      this.updateToggleUI();
      if (settings.betterQuoteBoxes) {
        betterQuotes.init();
      } else {
        // Implement reverting changes if needed
      }
    },

    updateToggleUI() {
      const toggleButton = document.getElementById("toggle-better-quote-boxes");
      if (toggleButton) {
        const icon = toggleButton.querySelector("i");
        const text = toggleButton.querySelector("span");
        if (icon && text) {
          icon.className = settings.betterQuoteBoxes
            ? "icon fa-toggle-on fa-fw"
            : "icon fa-toggle-off fa-fw";
          text.textContent = "Better Quote Boxes";
          toggleButton.title = settings.betterQuoteBoxes
            ? "Disable Better Quote Boxes"
            : "Enable Better Quote Boxes";
        }
      }
    },

    applyCustomStyles() {
      utils.applyStyles(`
          .toggle-setting {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .toggle-switch {
            position: relative;
            display: inline-block;
            width: 30px;
            height: 17px;
          }
          .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
          }
          .toggle-switch .slider {
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
          .toggle-switch .slider:before {
            position: absolute;
            content: "";
            height: 13px;
            width: 13px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
          }
          .toggle-switch input:checked + .slider {
            background-color: #2196F3;
          }
          .toggle-switch input:checked + .slider:before {
            transform: translateX(13px);
          }
        `);
    },
  };

  function init() {
    utils.loadSettings();
    uiTweaks.init();
    if (settings.betterQuoteBoxes) {
      betterQuotes.init();
      utils.scrollToPost();
    }
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
