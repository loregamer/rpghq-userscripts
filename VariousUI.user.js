// ==UserScript==
// @name         RPGHQ - Various UI Tweaks
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Various UI improvements for rpghq.org
// @match        https://rpghq.org/*
// @grant        GM_setValue
// @grant        GM_getValue
// @license      MIT
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/main/VariousUI.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/main/VariousUI.user.js
// ==/UserScript==

/*
MIT License

Copyright (c) 2024 loregamer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

(function () {
  "use strict";

  const settings = {
    betterQuoteBoxes: true,
    betterFileLinks: true,
    unreadLastPostButton: true,
    replaceReadTopicLinks: true,
    cleanerEditedNotice: false,
    topicLinkCopyButton: true,
  };

  const utils = {
    saveSettings() {
      GM_setValue("rpghqUITweaks", JSON.stringify(settings));
    },

    loadSettings() {
      const savedSettings = GM_getValue("rpghqUITweaks");
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
      li.id = id;
      li.innerHTML = `
        <a href="#" role="menuitem" class="ui-tweak-toggle">
          <span class="toggle-content">
            <i class="icon ${
              isEnabled ? "fa-toggle-on" : "fa-toggle-off"
            } fa-fw" aria-hidden="true"></i>
            ${text}
          </span>
        </a>
      `;
      const link = li.querySelector("a");
      link.addEventListener("click", (e) => {
        e.preventDefault();
        isEnabled = !isEnabled;
        onClickHandler(isEnabled);
        this.updateToggleUI(link, isEnabled);
      });
      return li;
    },

    updateToggleUI(element, isEnabled) {
      const icon = element.querySelector(".toggle-content i");
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

        .quote-read-more {
          cursor: pointer;
          color: #4a90e2;
          font-size: 0.9em;
          text-align: center;
          padding: 5px;
          background-color: rgba(74, 144, 226, 0.1);
          border-top: 1px solid rgba(74, 144, 226, 0.3);
          margin-top: 10px;
        }

        .quote-read-more:hover {
          background-color: rgba(74, 144, 226, 0.2);
        }

        .quote-content {
          transition: max-height 0.3s ease-out;
        }

        .quote-content.collapsed {
          max-height: 300px;
          overflow: hidden;
        }

        .quote-content.expanded {
          max-height: none;
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
        this.processNestedQuote(quoteBox);
      } else {
        this.processOuterQuote(quoteBox);
      }
    },

    processNestedQuote(quoteBox) {
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
    },

    processOuterQuote(quoteBox) {
      const quoteContent = document.createElement("div");
      quoteContent.className = "quote-content";

      while (quoteBox.firstChild) {
        quoteContent.appendChild(quoteBox.firstChild);
      }

      quoteBox.appendChild(quoteContent);

      this.updateReadMoreToggle(quoteBox, quoteContent);

      // Create a MutationObserver to watch for changes in the quote content
      const observer = new MutationObserver(() => {
        this.updateReadMoreToggle(quoteBox, quoteContent);
      });

      observer.observe(quoteContent, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style"],
      });
    },

    updateReadMoreToggle(quoteBox, quoteContent) {
      let readMoreToggle = quoteBox.querySelector(".quote-read-more");

      if (quoteContent.scrollHeight > 400) {
        if (!readMoreToggle) {
          readMoreToggle = this.createReadMoreToggle(quoteContent);
          quoteBox.appendChild(readMoreToggle);
        }
        if (!quoteContent.classList.contains("expanded")) {
          quoteContent.classList.add("collapsed");
        }
      } else {
        if (readMoreToggle) {
          readMoreToggle.remove();
        }
        quoteContent.classList.remove("collapsed", "expanded");
      }
    },

    createReadMoreToggle(quoteContent) {
      const readMoreToggle = document.createElement("div");
      readMoreToggle.className = "quote-read-more";
      readMoreToggle.textContent = "Read more...";

      readMoreToggle.addEventListener("click", () => {
        if (quoteContent.classList.contains("expanded")) {
          quoteContent.classList.remove("expanded");
          quoteContent.classList.add("collapsed");
          readMoreToggle.textContent = "Read more...";

          // Collapse inner blockquotes
          const innerQuotes = quoteContent.querySelectorAll("blockquote");
          innerQuotes.forEach((innerQuote) => {
            const nestedContent = innerQuote.querySelector(
              ".nested-quote-content"
            );
            if (nestedContent) {
              nestedContent.style.display = "none";
              const toggle = innerQuote.querySelector(".quote-toggle");
              if (toggle) {
                toggle.textContent = "Expand Quote";
              }
            }
          });

          const quoteBox = quoteContent.closest("blockquote");
          if (quoteBox) {
            quoteBox.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        } else {
          quoteContent.classList.remove("collapsed");
          quoteContent.classList.add("expanded");
          readMoreToggle.textContent = "Show less...";
        }
      });

      return readMoreToggle;
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

  const betterFileLinks = {
    init() {
      this.processFileLinks();
    },

    processFileLinks() {
      const fileLinks = document.querySelectorAll(
        'a[href^="https://f.rpghq.org/"]'
      );
      fileLinks.forEach((link) => {
        const url = new URL(link.href);
        const filename = url.searchParams.get("n");
        if (
          filename &&
          link.textContent.trim().startsWith("https://f.rpghq.org/")
        ) {
          const downloadSvg =
            '<img alt="📥" class="emoji smilies" draggable="false" src="//cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f4e5.svg">';
          link.innerHTML = `${downloadSvg} ${filename}`;
          link.title = link.href;
        }
      });
    },
  };

  const unreadLastPostButton = {
    init() {
      this.processRows();
    },

    processRows() {
      const topicRows = document.querySelectorAll('.row-item[class*="topic_"]');
      topicRows.forEach((row) => {
        if (this.isUnreadTopic(row)) {
          this.updateLastPostButton(row);
        }
      });

      const forumRows = document.querySelectorAll(
        ".row-item.forum_read, .row-item.forum_unread"
      );
      forumRows.forEach((row) => this.checkForumLastPost(row));
    },

    isUnreadTopic(row) {
      return (
        row.classList.contains("topic_unread") ||
        row.classList.contains("topic_unread_mine") ||
        row.classList.contains("topic_unread_hot") ||
        row.classList.contains("topic_unread_hot_mine")
      );
    },

    updateLastPostButton(row) {
      const lastPostLink = row.querySelector(
        '.lastpost a[title="Go to last post"], .lastpost a[title="View the latest post"]'
      );
      if (lastPostLink) {
        const icon = lastPostLink.querySelector("i.icon");
        if (icon) {
          icon.classList.remove("icon-lightgray");
          icon.classList.add("icon-red");
        }
      }
    },

    checkForumLastPost(forumRow) {
      const forumLink = forumRow.querySelector("a.forumtitle");
      const lastPostTitle = forumRow.querySelector(".lastpost .lastsubject");
      if (forumLink && lastPostTitle) {
        const forumUrl = forumLink.href;
        const lastPostText = lastPostTitle.textContent.trim();
        fetch(forumUrl)
          .then((response) => response.text())
          .then((html) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const topicRows = doc.querySelectorAll(
              '.row-item[class*="topic_"]'
            );
            const hasUnreadTopic = Array.from(topicRows).some((row) => {
              const topicTitle = row.querySelector(".topictitle");
              return (
                this.isUnreadTopic(row) &&
                topicTitle &&
                topicTitle.textContent.trim() === lastPostText
              );
            });
            if (hasUnreadTopic) {
              this.updateLastPostButton(forumRow);
            }
          })
          .catch((error) =>
            console.error("Error checking forum last post:", error)
          );
      }
    },
  };

  const replaceReadTopicLinks = {
    init() {
      this.processTopicRows();
    },

    processTopicRows() {
      const topicRows = document.querySelectorAll(`
      .row-item[class*="topic_read"],
      .row-item.sticky_read,
      .row-item.sticky_read_mine,
      .row-item.announce_read,
      .row-item.announce_read_mine`);
      topicRows.forEach(this.replaceLink);
    },

    replaceLink(row) {
      const topicLink = row.querySelector(".topictitle");
      const lastPostLink = row.querySelector(
        '.lastpost a[title="Go to last post"]'
      );

      if (topicLink && lastPostLink) {
        topicLink.href = lastPostLink.href;
      }
    },
  };

  const cleanerEditedNotice = {
    init() {
      if (settings.cleanerEditedNotice) {
        this.applyStyles();
      }
    },

    applyStyles() {
      utils.applyStyles(`
        .notice {
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          padding: 6px 10px;
          font-size: 0.85em;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 8px;
          transition: background-color 0.2s ease;
        }
        .notice:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        .notice a {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .notice a:hover {
          color: rgba(255, 255, 255, 0.9);
          text-decoration: underline;
        }
      `);
    },
  };

  const topicLinkCopyButton = {
    init() {
      if (settings.topicLinkCopyButton) {
        this.addCopyButtons();
      }
    },

    addCopyButtons() {
      const topicTitles = document.querySelectorAll(".topic-title");
      topicTitles.forEach((titleElement) => {
        const link = titleElement.querySelector("a");
        if (link) {
          const copyButton = this.createCopyButton(link);
          titleElement.appendChild(copyButton);
        }
      });
    },

    createCopyButton(link) {
      const button = document.createElement("button");
      button.className = "topic-copy-button";
      button.innerHTML =
        '<i class="icon fa-copy fa-fw" aria-hidden="true"></i>';
      button.title = "Copy BBCode link";
      button.addEventListener("click", (e) => {
        e.preventDefault();
        this.copyBBCode(link);
      });
      return button;
    },

    copyBBCode(link) {
      const bbcode = `[size=150][b][url=${link.href}]${link.textContent}[/url][/b][/size]`;
      navigator.clipboard.writeText(bbcode).then(() => {
        this.showCopiedMessage();
      });
    },

    showCopiedMessage() {
      const message = document.createElement("div");
      message.textContent = "BBCode copied!";
      message.className = "copy-message";
      document.body.appendChild(message);
      setTimeout(() => {
        message.remove();
      }, 2000);
    },
  };

  const uiTweaks = {
    init() {
      // Only add the UI Tweaks dropdown if the URL contains "ucp.php"
      if (window.location.href.includes("ucp.php")) {
        this.addUITweaksDropdown();
        this.applyCustomStyles();
      }
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
      // Remove the inline style that was adding extra margin
      // dropdownLi.style.marginRight = "5px";

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
        "betterFileLinks",
        "Better File Links",
        this.toggleBetterFileLinks.bind(this)
      );
      this.addToggleItem(
        dropdownContents,
        "betterQuoteBoxes",
        "Better Quote Boxes",
        this.toggleBetterQuoteBoxes.bind(this)
      );
      this.addToggleItem(
        dropdownContents,
        "cleanerEditedNotice",
        "Cleaner Edited Notice",
        this.toggleCleanerEditedNotice.bind(this)
      );
      this.addToggleItem(
        dropdownContents,
        "replaceReadTopicLinks",
        "Jump to Last Read",
        this.toggleReplaceReadTopicLinks.bind(this)
      );
      this.addToggleItem(
        dropdownContents,
        "topicLinkCopyButton",
        "Topic Link Copy Button",
        this.toggleTopicLinkCopyButton.bind(this)
      );
      this.addToggleItem(
        dropdownContents,
        "unreadLastPostButton",
        "Unread Last Post Button",
        this.toggleUnreadLastPostButton.bind(this)
      );
      // Add more toggle items here as needed

      // Add Save button
      const saveButton = document.createElement("li");
      saveButton.innerHTML = `
        <input type="button" value="Save Changes" class="button1 ui-tweak-save">
      `;
      saveButton.querySelector("input").addEventListener("click", (e) => {
        e.preventDefault();
        this.saveChanges();
      });
      dropdownContents.appendChild(saveButton);

      navMain.insertBefore(dropdownLi, notificationsLi);
    },

    addToggleItem(container, settingKey, text, toggleFunction) {
      const toggleItem = utils.createToggleItem(
        `toggle-${settingKey}`,
        text,
        settings[settingKey],
        (isEnabled) => {
          // Update the UI and store the new state temporarily
          toggleItem.dataset.enabled = isEnabled;
        }
      );
      container.appendChild(toggleItem);
    },

    saveChanges() {
      // Update settings based on current toggle states
      const toggles = document.querySelectorAll(".ui-tweak-toggle");
      toggles.forEach((toggle) => {
        const settingKey = toggle.closest("li").id.replace("toggle-", "");
        const isEnabled = toggle
          .querySelector(".icon")
          .classList.contains("fa-toggle-on");
        settings[settingKey] = isEnabled;
      });

      // Save settings and refresh the page
      utils.saveSettings();
      window.location.reload();
    },

    toggleTopicLinkCopyButton() {
      if (settings.topicLinkCopyButton) {
        topicLinkCopyButton.init();
      } else {
        window.location.reload();
      }
    },

    toggleBetterQuoteBoxes() {
      if (settings.betterQuoteBoxes) {
        betterQuotes.init();
      } else {
        // Implement reverting changes if needed
      }
    },

    toggleBetterFileLinks() {
      if (settings.betterFileLinks) {
        betterFileLinks.init();
      } else {
        // Implement reverting changes if needed
        window.location.reload();
      }
    },

    toggleUnreadLastPostButton() {
      if (settings.unreadLastPostButton) {
        unreadLastPostButton.init();
      } else {
        // Revert changes if needed
        window.location.reload();
      }
    },

    toggleReplaceReadTopicLinks() {
      if (settings.replaceReadTopicLinks) {
        replaceReadTopicLinks.init();
      } else {
        // Revert changes if needed
        window.location.reload();
      }
    },

    toggleCleanerEditedNotice() {
      if (settings.cleanerEditedNotice) {
        cleanerEditedNotice.init();
      } else {
        // Revert changes if needed
        window.location.reload();
      }
    },

    applyCustomStyles() {
      utils.applyStyles(`
          .ui-tweak-toggle {
            display: flex !important;
            align-items: center;
            padding: 5px 10px;
            text-decoration: none !important; /* Remove underline */
          }
          .ui-tweak-toggle .toggle-content {
            display: flex;
            align-items: center;
          }
          .ui-tweak-toggle .icon {
            margin-right: 5px; /* Reduced from 10px to 5px */
            display: flex;
            align-items: center;
            position: relative;
            top: 2px; /* Adjust this value to move the icon down */
          }
          .ui-tweak-toggle .toggle-text {
            flex-grow: 1;
            line-height: 1; /* Ensure text is vertically centered */
          }
          .ui-tweak-toggle:hover {
            text-decoration: none !important; /* Ensure no underline on hover */
          }
          /* Ensure no underline for all states */
          .ui-tweak-toggle:hover,
          .ui-tweak-toggle:focus,
          .ui-tweak-toggle:active {
            text-decoration: none !important;
          }
          .dropdown-contents li {
            display: flex;
            align-items: center;
          }
          .ui-tweak-save {
            display: block;
            width: calc(100% - 20px); /* Adjust width to account for padding */
            margin: 10px auto;
            text-align: center;
            padding: 5px 10px;
          }
          /* Ensure the icon is vertically centered */
          .ui-tweak-toggle .icon {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
          }
          /* Adjust spacing for UI Tweaks dropdown */
          #nav-main .dropdown-container.dropdown-right.rightside:not(:last-child) {
            margin-right: 5px;
          }
          /* Ensure consistent spacing for rightside elements */
          #nav-main .rightside {
            margin-left: 5px;
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
    if (settings.betterFileLinks) {
      betterFileLinks.init();
    }
    if (settings.unreadLastPostButton) {
      unreadLastPostButton.init();
    }
    if (settings.replaceReadTopicLinks) {
      replaceReadTopicLinks.init();
    }
    if (settings.cleanerEditedNotice) {
      cleanerEditedNotice.init();
    }
    if (settings.topicLinkCopyButton) {
      topicLinkCopyButton.init();
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
