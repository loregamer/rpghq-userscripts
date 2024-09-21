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

    createToggleItem(id, text, isEnabled, onClickHandler) {
      const li = document.createElement("li");
      li.innerHTML = `
        <a href="#" role="menuitem" class="ui-tweak-toggle">
          <span class="toggle-switch">
            <i class="icon ${
              isEnabled ? "fa-toggle-on" : "fa-toggle-off"
            } fa-fw" aria-hidden="true"></i>
          </span>
          <span class="toggle-text">${text}</span>
        </a>
      `;
      const link = li.querySelector("a");
      link.addEventListener("click", (e) => {
        e.preventDefault();
        onClickHandler();
        this.updateToggleUI(link, !isEnabled);
      });
      return li;
    },

    updateToggleUI(element, isEnabled) {
      const icon = element.querySelector(".toggle-switch i");
      if (icon) {
        icon.className = `icon ${
          isEnabled ? "fa-toggle-on" : "fa-toggle-off"
        } fa-fw`;
      }
      element.title = isEnabled
        ? `Disable ${element.textContent.trim()}`
        : `Enable ${element.textContent.trim()}`;
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
          <i class="icon fa-cogs fa-fw" aria-hidden="true"></i>
          <span>UI Tweaks</span>
        </a>
        <div class="dropdown">
          <div class="pointer"><div class="pointer-inner"></div></div>
          <ul class="dropdown-contents" role="menu">
          </ul>
        </div>
      `;

      const dropdownContents = dropdownLi.querySelector(".dropdown-contents");

      // Add toggle items for each setting
      this.addToggleItem(
        dropdownContents,
        "betterQuoteBoxes",
        "Better Quote Boxes",
        this.toggleBetterQuoteBoxes.bind(this)
      );
      // Add more toggle items here as needed

      navMain.insertBefore(dropdownLi, notificationsLi);
    },

    addToggleItem(container, settingKey, text, toggleFunction) {
      const toggleItem = utils.createToggleItem(
        `toggle-${settingKey}`,
        text,
        settings[settingKey],
        () => {
          settings[settingKey] = !settings[settingKey];
          utils.saveSettings();
          toggleFunction();
        }
      );
      container.appendChild(toggleItem);
    },

    toggleBetterQuoteBoxes() {
      if (settings.betterQuoteBoxes) {
        betterQuotes.init();
      } else {
        // Implement reverting changes if needed
      }
    },

    applyCustomStyles() {
      utils.applyStyles(`
        .ui-tweak-toggle {
          display: flex !important;
          align-items: center;
          padding: 5px 10px;
        }
        .ui-tweak-toggle .toggle-switch {
          margin-right: 10px;
        }
        .ui-tweak-toggle .toggle-text {
          flex-grow: 1;
        }
        .ui-tweak-toggle:hover {
          background-color: rgba(255, 255, 255, 0.1);
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
