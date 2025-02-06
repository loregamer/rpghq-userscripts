// ==UserScript==
// @name         RPGHQ - Various UI Tweaks
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Various UI improvements for rpghq.org
// @match        https://rpghq.org/*
// @grant        none
// @license      MIT
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/refs/heads/ghosted-users/VariousUI.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/refs/heads/ghosted-users/VariousUI.user.js
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

  const utils = {
    applyStyles(styles) {
      const style = document.createElement("style");
      style.textContent = styles;
      document.head.appendChild(style);
    },

    addPostIdsToUsernames() {
      document.querySelectorAll(".post").forEach((post) => {
        const postId = post.id;
        if (!postId) return;

        const usernameSpan = post.querySelector(".responsive-hide");
        if (!usernameSpan) return;

        // Check if we already added the post ID
        if (usernameSpan.querySelector(".post-id-text")) return;

        // Find the text node containing "»"
        const nodes = Array.from(usernameSpan.childNodes);
        const arrowNode = nodes.find(
          (node) =>
            node.nodeType === Node.TEXT_NODE && node.textContent.includes("»")
        );

        if (arrowNode) {
          const idSpan = document.createElement("span");
          idSpan.className = "post-id-text";
          idSpan.style.fontSize = "0";
          idSpan.style.color = "transparent";
          idSpan.textContent = postId;
          usernameSpan.insertBefore(idSpan, arrowNode);
        }
      });
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

  const betterQuotes = {
    init() {
      this.applyStyles();
      this.processQuoteBoxes();
      this.removeReadMoreButtons();
      this.colorizeUsernames();
      this.processAvatars();
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
          display: flex;
          align-items: center;
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

        blockquote cite a {
          display: inline-flex;
          align-items: center;
          font-weight: bold;
        }
        .quote-avatar {
          width: 16px;
          height: 16px;
          margin-left: 4px;
          margin-right: 3px;
          border-radius: 50%;
          object-fit: cover;
        }
        blockquote cite {
          display: flex;
          align-items: center;
          margin-bottom: 8px; // Add some space below the citation
        }
      `);
    },

    restructureCitation(citation) {
      const container = document.createElement("div");
      container.className = "quote-citation-container";

      while (citation.firstChild) {
        container.appendChild(citation.firstChild);
      }

      citation.appendChild(container);
    },

    getUserColor(username) {
      const key = `userColor_${username.toLowerCase()}`;
      const storedColor = localStorage.getItem(key);
      if (storedColor) {
        const { color, timestamp } = JSON.parse(storedColor);
        // Check if the stored color is less than 7 days old
        if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
          return color;
        }
      }
      return null;
    },

    storeUserColor(username, color) {
      const key = `userColor_${username.toLowerCase()}`;
      const data = JSON.stringify({ color, timestamp: Date.now() });
      localStorage.setItem(key, data);
    },

    getUserAvatar(username) {
      const key = `userAvatar_${username.toLowerCase()}`;
      const storedAvatar = localStorage.getItem(key);
      if (storedAvatar) {
        const { avatar, timestamp } = JSON.parse(storedAvatar);
        // Check if the stored avatar is less than 7 days old
        if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
          return avatar;
        }
      }
      return null;
    },

    storeUserAvatar(username, avatar) {
      const key = `userAvatar_${username.toLowerCase()}`;
      const data = JSON.stringify({ avatar, timestamp: Date.now() });
      localStorage.setItem(key, data);
    },

    processAvatars() {
      const avatarMap = new Map();

      // First, collect all avatars from the page
      document
        .querySelectorAll(".avatar-container img.avatar")
        .forEach((img) => {
          const postprofile = img.closest(".postprofile");
          if (postprofile) {
            const usernameElement = postprofile.querySelector(
              "a.username-coloured, a.username"
            );
            if (usernameElement) {
              const username = usernameElement.textContent.trim();
              avatarMap.set(username.toLowerCase(), img.src);
              this.storeUserAvatar(username, img.src);
            }
          }
        });

      // Then, apply avatars to usernames in blockquotes
      document.querySelectorAll("blockquote cite").forEach(async (citation) => {
        this.restructureCitation(citation);
        const link = citation.querySelector("a");
        if (link) {
          const username = link.textContent.trim();
          let avatar =
            avatarMap.get(username.toLowerCase()) ||
            this.getUserAvatar(username);

          if (!avatar) {
            avatar = await this.fetchUserAvatar(link.href);
            if (avatar) {
              this.storeUserAvatar(username, avatar);
            }
          }

          if (avatar) {
            const avatarImg = document.createElement("img");
            avatarImg.src = avatar;
            avatarImg.className = "quote-avatar";
            avatarImg.alt = `${username}'s avatar`;
            citation
              .querySelector(".quote-citation-container")
              .insertBefore(
                avatarImg,
                citation.querySelector(".quote-citation-container").firstChild
              );
          }
        }
      });
    },

    async fetchUserAvatar(profileUrl) {
      try {
        const response = await fetch(profileUrl);
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");
        const avatarImg = doc.querySelector(".profile-avatar img.avatar");
        if (avatarImg) {
          return avatarImg.src;
        }
      } catch (error) {
        console.error("Error fetching user avatar:", error);
      }
      return null;
    },

    colorizeUsernames() {
      const colorMap = new Map();

      // First, collect all colored usernames from the page
      document.querySelectorAll("a.username-coloured").forEach((link) => {
        const username = link.textContent.trim();
        const color = link.style.color;
        if (color) {
          colorMap.set(username.toLowerCase(), color);
          this.storeUserColor(username, color);
        }
      });

      // Then, apply colors to usernames in blockquotes
      document.querySelectorAll("blockquote cite a").forEach(async (link) => {
        const username = link.textContent.trim();
        let color =
          colorMap.get(username.toLowerCase()) || this.getUserColor(username);

        if (!color) {
          // If color not found in map or localStorage, fetch from user profile
          color = await this.fetchUserColor(link.href);
          if (color) {
            this.storeUserColor(username, color);
          }
        }

        if (color) {
          link.style.color = color;
          link.classList.add("username-coloured");
        }
      });
    },

    async fetchUserColor(profileUrl) {
      try {
        const response = await fetch(profileUrl);
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");
        const coloredUsername = doc.querySelector(
          '.left-box.details.profile-details dd span[style^="color:"]'
        );
        if (coloredUsername) {
          return coloredUsername.style.color;
        }
      } catch (error) {
        console.error("Error fetching user color:", error);
      }
      return null;
    },

    fixQuoteLinks() {
      const quoteLinks = document.querySelectorAll("blockquote cite a");
      const isMobile = window.matchMedia("(max-width: 700px)").matches;

      quoteLinks.forEach((link) => {
        const linkText = link.textContent.trim();
        if (linkText.startsWith("↑") && !linkText.startsWith("↑ ")) {
          if (isMobile) {
            link.textContent = " ↑ ";
          } else {
            link.textContent = "↑  " + linkText.slice(1);
          }
        }
      });
    },

    processQuoteBoxes() {
      const allQuotes = document.querySelectorAll("blockquote");
      allQuotes.forEach(this.processQuote.bind(this));
      this.fixQuoteLinks();
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
        const quoteBox = quoteContent.closest("blockquote");
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

          if (quoteBox) {
            const quoteBoxRect = quoteBox.getBoundingClientRect();
            if (quoteBoxRect.top < 0) {
              quoteBox.scrollIntoView({ behavior: "smooth", block: "start" });
            }
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

          // Expand all parent quote contents
          let parentQuoteContent = quoteBox.closest(".quote-content");
          while (parentQuoteContent) {
            if (parentQuoteContent.classList.contains("collapsed")) {
              const parentReadMoreToggle =
                parentQuoteContent.nextElementSibling;
              if (
                parentReadMoreToggle &&
                parentReadMoreToggle.classList.contains("quote-read-more")
              ) {
                parentReadMoreToggle.click();
              } else {
                // Force update of read more toggle
                betterQuotes.updateReadMoreToggle(
                  parentQuoteContent.closest("blockquote"),
                  parentQuoteContent
                );
              }
            }
            parentQuoteContent = parentQuoteContent
              .closest("blockquote")
              ?.closest(".quote-content");
          }

          // Automatically trigger "Read More..." if applicable, including newly created ones
          setTimeout(() => {
            let currentQuoteContent = quoteBox.closest(".quote-content");
            while (currentQuoteContent) {
              if (currentQuoteContent.classList.contains("collapsed")) {
                const readMoreToggle = currentQuoteContent.nextElementSibling;
                if (
                  readMoreToggle &&
                  readMoreToggle.classList.contains("quote-read-more")
                ) {
                  readMoreToggle.click();
                }
              }
              currentQuoteContent = currentQuoteContent
                .closest("blockquote")
                ?.closest(".quote-content");
            }
          }, 0);
        } else {
          nestedContent.style.display = "none";
          this.textContent = "Expand Quote";
        }

        // Scroll to ensure the quote is visible
        setTimeout(() => {
          quoteBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 0);
      };
      quoteBox.appendChild(toggle);
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
      this.applyStyles();
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

  const highlightCurrentPost = {
    init() {
      this.applyStyles();
      this.highlightPost();
    },

    applyStyles() {
      utils.applyStyles(`
        .post.highlighted-current-post {
          outline: 2px solid #BC2A4D;
          outline-offset: -2px;
          animation: highlightFade 1s ease-out;
        }
        @keyframes highlightFade {
          from {
            outline-color: rgba(188, 42, 77, 1);
          }
          to {
            outline-color: rgba(188, 42, 77, 0.7);
          }
        }
      `);
    },

    highlightPost() {
      const hash = window.location.hash;
      const postId = hash ? hash.slice(1) : null;

      // Also check for p parameter in URL
      const urlParams = new URLSearchParams(window.location.search);
      const postParam = urlParams.get("p");

      const targetPostId = postId || postParam;

      if (targetPostId) {
        const postElement = document.getElementById(targetPostId);
        if (postElement) {
          const postContainer = postElement.closest(".post");
          if (postContainer) {
            postContainer.classList.add("highlighted-current-post");
          }
        }
      }
    },
  };

  function init() {
    // Always run replaceReadTopicLinks
    replaceReadTopicLinks.init();

    // Skip other UI modifications if URL contains index.php
    if (window.location.href.includes("index.php")) {
      return;
    }

    utils.addPostIdsToUsernames();
    betterQuotes.init();
    utils.scrollToPost();
    cleanerEditedNotice.init();
    highlightCurrentPost.init();
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
