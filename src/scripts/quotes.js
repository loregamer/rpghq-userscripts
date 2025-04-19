export function init() {
  // Basic utility function for applying styles
  const utils = {
    applyStyles: function (styles) {
      const styleSheet = document.createElement("style");
      styleSheet.type = "text/css";
      styleSheet.innerText = styles;
      document.head.appendChild(styleSheet);
    },
  };

  const betterQuotes = {
    init() {
      // Check if already initialized
      if (document.body.classList.contains("better-quotes-initialized")) {
        return;
      }
      this.applyStyles();
      this.processQuoteBoxes();
      this.removeReadMoreButtons();
      this.colorizeUsernames();
      this.processAvatars();
      document.body.classList.add("better-quotes-initialized"); // Mark as initialized
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
                  vertical-align: middle; /* Align avatar nicely */
                }
                blockquote cite {
                  display: flex;
                  align-items: center;
                  margin-bottom: 8px;
                }
              `);
    },

    restructureCitation(citation) {
      // Avoid restructuring if already done
      if (citation.querySelector(".quote-citation-container")) {
        return;
      }
      const container = document.createElement("div");
      container.className = "quote-citation-container";

      // Move direct children (like username link and 'said:') into the container
      while (citation.firstChild) {
        container.appendChild(citation.firstChild);
      }

      citation.appendChild(container);
    },

    getUserColor(username) {
      const key = `userColor_${username.toLowerCase()}`;
      try {
        const storedColor = localStorage.getItem(key);
        if (storedColor) {
          const { color, timestamp } = JSON.parse(storedColor);
          if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
            return color;
          }
        }
      } catch (e) {
        console.error(
          `Error reading color for ${username} from localStorage:`,
          e,
        );
        localStorage.removeItem(key);
      }
      return null;
    },

    storeUserColor(username, color) {
      const key = `userColor_${username.toLowerCase()}`;
      try {
        const data = JSON.stringify({ color, timestamp: Date.now() });
        localStorage.setItem(key, data);
      } catch (e) {
        console.error(
          `Error storing color for ${username} in localStorage:`,
          e,
        );
      }
    },

    getUserAvatar(username) {
      const key = `userAvatar_${username.toLowerCase()}`;
      try {
        const storedAvatar = localStorage.getItem(key);
        if (storedAvatar) {
          const { avatar, timestamp } = JSON.parse(storedAvatar);
          if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
            return avatar;
          }
        }
      } catch (e) {
        console.error(
          `Error reading avatar for ${username} from localStorage:`,
          e,
        );
        localStorage.removeItem(key);
      }
      return null;
    },

    storeUserAvatar(username, avatar) {
      const key = `userAvatar_${username.toLowerCase()}`;
      try {
        const data = JSON.stringify({ avatar, timestamp: Date.now() });
        localStorage.setItem(key, data);
      } catch (e) {
        console.error(
          `Error storing avatar for ${username} in localStorage:`,
          e,
        );
      }
    },

    processAvatars() {
      const avatarMap = new Map();
      const citationPromises = [];

      // Collect avatars from post profiles
      document
        .querySelectorAll(".postprofile .avatar-container img.avatar")
        .forEach((img) => {
          const postprofile = img.closest(".postprofile");
          if (postprofile) {
            const usernameElement = postprofile.querySelector(
              "a.username-coloured, a.username",
            );
            if (usernameElement) {
              const username = usernameElement.textContent.trim();
              if (username && img.src) {
                // Use absolute URL
                const absoluteSrc = new URL(img.src, document.baseURI).href;
                avatarMap.set(username.toLowerCase(), absoluteSrc);
                this.storeUserAvatar(username, absoluteSrc);
              }
            }
          }
        });

      // Apply avatars to blockquote citations
      document.querySelectorAll("blockquote cite").forEach((citation) => {
        this.restructureCitation(citation); // Ensure structure is ready
        const link = citation.querySelector("a");
        if (link) {
          const username = link.textContent.trim();
          const citationContainer = citation.querySelector(
            ".quote-citation-container",
          );

          if (
            username &&
            citationContainer &&
            !citationContainer.querySelector(".quote-avatar")
          ) {
            const promise = (async () => {
              let avatar =
                avatarMap.get(username.toLowerCase()) ||
                this.getUserAvatar(username);

              if (!avatar && link.href) {
                try {
                  avatar = await this.fetchUserAvatar(link.href);
                  if (avatar) {
                    this.storeUserAvatar(username, avatar);
                  }
                } catch (fetchError) {
                  console.error(
                    `Failed to fetch avatar for ${username}:`,
                    fetchError,
                  );
                }
              }

              if (avatar) {
                const avatarImg = document.createElement("img");
                avatarImg.src = avatar;
                avatarImg.className = "quote-avatar";
                avatarImg.alt = `${username}'s avatar`;
                citationContainer.insertBefore(
                  avatarImg,
                  citationContainer.firstChild,
                );
              }
            })();
            citationPromises.push(promise);
          }
        }
      });

      // Handle potential errors for all promises if needed
      Promise.allSettled(citationPromises).then((results) => {
        results.forEach((result) => {
          if (result.status === "rejected") {
            console.error(
              "Error processing an avatar citation:",
              result.reason,
            );
          }
        });
      });
    },

    async fetchUserAvatar(profileUrl) {
      // Avoid fetching if URL is invalid or points to javascript:void(0)
      if (!profileUrl || profileUrl.startsWith("javascript:")) return null;
      try {
        const response = await fetch(profileUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");
        const avatarImg = doc.querySelector(
          "#profile-advanced-right img.avatar, .profile-avatar img.avatar, dt img.avatar",
        );
        if (avatarImg && avatarImg.src) {
          return new URL(avatarImg.src, profileUrl).href;
        }
      } catch (error) {
        console.error(
          "Error fetching user avatar from",
          profileUrl,
          ":",
          error,
        );
      }
      return null;
    },

    colorizeUsernames() {
      const colorMap = new Map();
      const colorPromises = [];

      // Collect colors from post profiles
      document
        .querySelectorAll(".postprofile a.username-coloured")
        .forEach((link) => {
          const username = link.textContent.trim();
          const color = link.style.color;
          if (username && color) {
            colorMap.set(username.toLowerCase(), color);
            this.storeUserColor(username, color);
          }
        });

      // Apply colors to blockquote citations
      document.querySelectorAll("blockquote cite a").forEach((link) => {
        // Only color the username link, not the 'go to post' link
        if (
          link.href &&
          link.href.includes("memberlist.php?mode=viewprofile")
        ) {
          const username = link.textContent.trim();
          if (username) {
            const promise = (async () => {
              let color =
                colorMap.get(username.toLowerCase()) ||
                this.getUserColor(username);

              if (!color && link.href) {
                try {
                  color = await this.fetchUserColor(link.href);
                  if (color) {
                    this.storeUserColor(username, color);
                  }
                } catch (fetchError) {
                  console.error(
                    `Failed to fetch color for ${username}:`,
                    fetchError,
                  );
                }
              }

              if (color) {
                link.style.color = color;
                if (!link.classList.contains("username-coloured")) {
                  link.classList.add("username-coloured");
                }
              }
            })();
            colorPromises.push(promise);
          }
        }
      });

      // Handle potential errors
      Promise.allSettled(colorPromises).then((results) => {
        results.forEach((result) => {
          if (result.status === "rejected") {
            console.error(
              "Error processing a username color citation:",
              result.reason,
            );
          }
        });
      });
    },

    async fetchUserColor(profileUrl) {
      if (!profileUrl || profileUrl.startsWith("javascript:")) return null;
      try {
        const response = await fetch(profileUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");
        const coloredUsername = doc.querySelector(
          '.profile-details span[style*="color"], #profile-advanced-right dd span[style*="color"], .username-coloured[style*="color"]',
        );
        if (coloredUsername && coloredUsername.style.color) {
          return coloredUsername.style.color;
        }
      } catch (error) {
        console.error("Error fetching user color from", profileUrl, ":", error);
      }
      return null;
    },

    fixQuoteLinks() {
      const quoteLinks = document.querySelectorAll("blockquote cite a");

      quoteLinks.forEach((link) => {
        // Target only the 'go to post' links (usually contain '↑' or href includes '#p')
        if (
          link.parentElement.tagName === "CITE" &&
          (link.textContent.includes("↑") || link.href.includes("#p"))
        ) {
          const linkText = link.textContent.trim();
          if (linkText.startsWith("↑")) {
            if (linkText === "↑") {
              link.innerHTML = "&nbsp;↑&nbsp;";
            } else if (
              !linkText.startsWith("↑ ") &&
              !linkText.startsWith("↑&nbsp;")
            ) {
              // Add space only if it doesn't already have one
              link.textContent = "↑ " + linkText.slice(1);
            }
          }
        }
      });
    },

    processQuoteBoxes() {
      const allQuotes = document.querySelectorAll(
        "blockquote:not(.quote-processed)",
      );

      // Process from innermost to outermost
      const sortedQuotes = Array.from(allQuotes).sort((a, b) => {
        // Compare depth by counting ancestor blockquotes
        const depthA = Array.from(a.querySelectorAll("blockquote")).length;
        const depthB = Array.from(b.querySelectorAll("blockquote")).length;
        return depthB - depthA; // Process deeper quotes first
      });

      sortedQuotes.forEach((quoteBox) => {
        // Check again if it was processed as part of a parent's inner loop
        if (!quoteBox.classList.contains("quote-processed")) {
          this.processQuote(quoteBox);
        }
      });

      this.fixQuoteLinks(); // Fix links after all structure changes are likely complete
    },

    processQuote(quoteBox) {
      if (quoteBox.classList.contains("quote-processed")) {
        return;
      }

      const isNested = quoteBox.parentElement.closest("blockquote") !== null;

      if (isNested) {
        this.processNestedQuote(quoteBox);
      } else {
        this.processOuterQuote(quoteBox);
      }
      quoteBox.classList.add("quote-processed");
    },

    processNestedQuote(quoteBox) {
      const citation = quoteBox.querySelector(":scope > cite");
      let nestedContent = quoteBox.querySelector(
        ":scope > .nested-quote-content",
      );

      if (!nestedContent) {
        nestedContent = document.createElement("div");
        nestedContent.className = "nested-quote-content";
        // Move nodes into the container
        Array.from(quoteBox.childNodes).forEach((node) => {
          // Keep citation as direct child of blockquote
          if (node !== citation) {
            nestedContent.appendChild(node);
          }
        });
        quoteBox.appendChild(nestedContent);
      }

      this.addQuoteToggle(quoteBox, nestedContent, citation);
    },

    processOuterQuote(quoteBox) {
      let quoteContent = quoteBox.querySelector(":scope > .quote-content");

      if (!quoteContent) {
        quoteContent = document.createElement("div");
        quoteContent.className = "quote-content";
        // Move all direct children into the content div
        while (quoteBox.firstChild) {
          quoteContent.appendChild(quoteBox.firstChild);
        }
        quoteBox.appendChild(quoteContent);
      }

      this.updateReadMoreToggle(quoteBox, quoteContent);

      // Use ResizeObserver if available for more reliable height checks
      if (
        typeof ResizeObserver !== "undefined" &&
        !quoteBox.dataset.resizeObserverAttached
      ) {
        const resizeObserver = new ResizeObserver(() => {
          this.updateReadMoreToggle(quoteBox, quoteContent);
        });
        resizeObserver.observe(quoteContent);
        quoteBox.dataset.resizeObserverAttached = "true";
      }
      // Fallback or additional observer for dynamic content loading
      else if (!quoteBox.dataset.mutationObserverAttached) {
        const observer = new MutationObserver(() => {
          this.updateReadMoreToggle(quoteBox, quoteContent);
          // Maybe disconnect after first trigger if only initial load matters?
          // observer.disconnect();
          // delete quoteBox.dataset.mutationObserverAttached;
        });
        observer.observe(quoteContent, { childList: true, subtree: true });
        quoteBox.dataset.mutationObserverAttached = "true";
      }
    },

    updateReadMoreToggle(quoteBox, quoteContent) {
      let readMoreToggle = quoteBox.querySelector(":scope > .quote-read-more");
      const contentHeight = quoteContent.scrollHeight;
      const maxHeight = 300;

      // Debounce this check slightly to avoid excessive calls during reflows
      clearTimeout(quoteBox._readMoreTimeout);
      quoteBox._readMoreTimeout = setTimeout(() => {
        if (contentHeight > maxHeight + 10) {
          // Overflow threshold
          if (!readMoreToggle) {
            readMoreToggle = this.createReadMoreToggle(quoteContent);
            quoteBox.appendChild(readMoreToggle);
          }
          if (!quoteContent.classList.contains("expanded")) {
            quoteContent.classList.add("collapsed");
            quoteContent.style.maxHeight = `${maxHeight}px`;
            readMoreToggle.textContent = "Read more...";
          } else {
            // Already expanded, ensure text is correct
            readMoreToggle.textContent = "Show less...";
          }
          readMoreToggle.style.display = "";
        } else {
          if (readMoreToggle) {
            readMoreToggle.style.display = "none";
          }
          quoteContent.classList.remove("collapsed", "expanded");
          quoteContent.style.maxHeight = "";
        }
      }, 50); // 50ms debounce
    },

    createReadMoreToggle(quoteContent) {
      const readMoreToggle = document.createElement("div");
      readMoreToggle.className = "quote-read-more";
      readMoreToggle.textContent = "Read more...";
      readMoreToggle.style.cursor = "pointer";

      readMoreToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const quoteBox = quoteContent.closest("blockquote");
        const maxHeight = 300;

        if (quoteContent.classList.contains("expanded")) {
          quoteContent.classList.remove("expanded");
          quoteContent.classList.add("collapsed");
          quoteContent.style.maxHeight = `${maxHeight}px`;
          readMoreToggle.textContent = "Read more...";

          // Collapse inner nested quotes
          const innerQuotes = quoteContent.querySelectorAll(
            "blockquote .nested-quote-content",
          );
          innerQuotes.forEach((innerContent) => {
            if (innerContent.style.display !== "none") {
              const innerToggle = innerContent.parentElement.querySelector(
                ":scope > .quote-toggle",
              );
              if (innerToggle && innerToggle.textContent === "Collapse Quote") {
                innerToggle.click();
              }
            }
          });

          if (quoteBox) {
            setTimeout(() => {
              const quoteBoxRect = quoteBox.getBoundingClientRect();
              if (quoteBoxRect.top < 0) {
                quoteBox.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }, 50);
          }
        } else {
          quoteContent.classList.remove("collapsed");
          quoteContent.classList.add("expanded");
          quoteContent.style.maxHeight = "";
          readMoreToggle.textContent = "Show less...";
        }
      });

      return readMoreToggle;
    },

    addQuoteToggle(quoteBox, nestedContent, citation) {
      let toggle = quoteBox.querySelector(":scope > .quote-toggle");
      if (toggle) return;

      toggle = document.createElement("span");
      toggle.className = "quote-toggle";
      toggle.textContent = "Expand Quote";
      toggle.style.cursor = "pointer";
      nestedContent.style.display = "none";

      toggle.onclick = function (e) {
        e.stopPropagation();

        if (nestedContent.style.display === "none") {
          nestedContent.style.display = "block";
          this.textContent = "Collapse Quote";

          // Expand necessary parent quotes
          let parentQuoteBox = quoteBox.parentElement.closest("blockquote");
          while (parentQuoteBox) {
            const parentContent = parentQuoteBox.querySelector(
              ":scope > .quote-content, :scope > .nested-quote-content",
            );
            if (parentContent) {
              // Expand collapsed outer parent
              const parentReadMore = parentQuoteBox.querySelector(
                ":scope > .quote-read-more",
              );
              if (
                parentReadMore &&
                parentContent.classList.contains("collapsed") &&
                parentReadMore.style.display !== "none"
              ) {
                parentReadMore.click();
              }
              // Expand collapsed nested parent
              const parentToggle = parentQuoteBox.querySelector(
                ":scope > .quote-toggle",
              );
              if (parentToggle && parentContent.style.display === "none") {
                parentToggle.click();
              }
            }
            parentQuoteBox = parentQuoteBox.parentElement.closest("blockquote");
          }
        } else {
          nestedContent.style.display = "none";
          this.textContent = "Expand Quote";
        }

        setTimeout(() => {
          const quoteBoxRect = quoteBox.getBoundingClientRect();
          if (
            quoteBoxRect.top < 0 ||
            quoteBoxRect.bottom > window.innerHeight
          ) {
            quoteBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }, 50);
      };

      // Insert toggle after citation or at the start if no citation
      if (citation && citation.parentNode === quoteBox) {
        citation.after(toggle);
      } else {
        quoteBox.prepend(toggle); // Prepend if no citation found within scope
      }
    },

    removeReadMoreButtons() {
      // Compatibility cleanup for potential other scripts
      document
        .querySelectorAll(".imcger-quote-button, .imcger-quote-shadow")
        .forEach((el) => el.remove());

      document.querySelectorAll(".imcger-quote-text").forEach((text) => {
        // Avoid interfering if our script manages this element
        if (!text.closest(".quote-content.collapsed")) {
          text.style.maxHeight = "none";
        }
      });
    },
  };

  betterQuotes.init();
}
