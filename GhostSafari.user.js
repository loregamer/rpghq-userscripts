// ==UserScript==
// @name         Ghost Users (Safari)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Safari-compatible version of Ghost Users script for hiding content from ghosted users
// @author       You
// @match        https://rpghq.org/*/*
// @run-at       document-end
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @grant        GM_setValue
// @grant        GM_getValue
// @license      MIT
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/ghosted-users/GhostSafari.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/ghosted-users/GhostSafari.user.js
// ==/UserScript==

(function () {
  "use strict";

  // Storage helpers that work in Safari
  const storage = {
    get: function (key, defaultValue) {
      try {
        const value = localStorage.getItem("ghost_" + key);
        return value ? JSON.parse(value) : defaultValue;
      } catch (e) {
        console.error("Storage get error:", e);
        return defaultValue;
      }
    },
    set: function (key, value) {
      try {
        localStorage.setItem("ghost_" + key, JSON.stringify(value));
      } catch (e) {
        console.error("Storage set error:", e);
      }
    },
  };

  // State
  let ignoredUsers = storage.get("ignoredUsers", {});
  let showGhostedPosts = storage.get("showGhostedPosts", false);
  let userColors = storage.get("userColors", {});

  // Styles
  const styles = `
        .ghosted-post, .ghosted-quote, .ghosted-row {
            display: none !important;
        }
        .ghosted-post.show, .ghosted-quote.show, .ghosted-row.show {
            display: block !important;
            border: 3px solid;
            border-image: linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet) 1;
            border-radius: 4px;
            padding: 6px;
        }
        .custom-quote {
            background-color: #242A36;
            border-left: 3px solid #4a90e2;
            padding: 10px;
            margin: 10px 0;
            font-size: 0.9em;
            line-height: 1.4;
        }
        .custom-quote-header {
            display: flex;
            align-items: center;
            gap: 4px;
            margin-bottom: 8px;
        }
        .custom-quote-header a {
            color: #89a6cf;
            text-decoration: none;
            font-weight: 700;
        }
    `;

  // Helper functions
  function isUserIgnored(usernameOrId) {
    if (ignoredUsers.hasOwnProperty(usernameOrId)) return true;
    const lower = usernameOrId.toLowerCase();
    return Object.values(ignoredUsers).includes(lower);
  }

  function toggleUserGhost(userId, username) {
    if (ignoredUsers.hasOwnProperty(userId)) {
      delete ignoredUsers[userId];
    } else {
      ignoredUsers[userId] = username.toLowerCase();
    }
    storage.set("ignoredUsers", ignoredUsers);
    location.reload();
  }

  function addGhostButton() {
    const userId = new URLSearchParams(window.location.search).get("u");
    if (!userId) return;

    const memberlistTitle = document.querySelector(".memberlist-title");
    if (!memberlistTitle) return;

    const username =
      memberlistTitle.textContent.split("-")[1]?.trim() || "Unknown User";

    const button = document.createElement("a");
    button.className = "button button-secondary";
    button.href = "#";
    button.textContent = isUserIgnored(userId) ? "Unghost User" : "Ghost User";
    button.style.marginLeft = "10px";

    button.addEventListener("click", (e) => {
      e.preventDefault();
      toggleUserGhost(userId, username);
    });

    memberlistTitle.appendChild(button);
  }

  function processContent() {
    // Add styles
    const style = document.createElement("style");
    style.textContent = styles;
    document.head.appendChild(style);

    // Process posts
    document.querySelectorAll(".post").forEach((post) => {
      const usernameEl = post.querySelector(".username, .username-coloured");
      if (usernameEl && isUserIgnored(usernameEl.textContent.trim())) {
        post.classList.add("ghosted-post");
        if (showGhostedPosts) post.classList.add("show");
      }
    });

    // Process quotes
    document.querySelectorAll("blockquote").forEach((quote) => {
      const citeEl = quote.querySelector("cite a");
      if (citeEl && isUserIgnored(citeEl.textContent.trim())) {
        quote.classList.add("ghosted-quote");
        if (showGhostedPosts) quote.classList.add("show");
      }
    });

    // Process topic rows
    document.querySelectorAll(".topic-poster, dd.lastpost").forEach((el) => {
      const usernameEl = el.querySelector(".username, .username-coloured");
      if (usernameEl && isUserIgnored(usernameEl.textContent.trim())) {
        const row = el.closest("li.row");
        if (row) {
          row.classList.add("ghosted-row");
          if (showGhostedPosts) row.classList.add("show");
        }
      }
    });

    // Add toggle button if there's ghosted content
    if (document.querySelector(".ghosted-post, .ghosted-quote, .ghosted-row")) {
      const actionBars = document.querySelectorAll(".action-bar");
      actionBars.forEach((bar) => {
        if (bar.querySelector(".ghost-toggle")) return;

        const button = document.createElement("a");
        button.className = "button button-secondary ghost-toggle";
        button.href = "#";
        button.innerHTML = `<i class="icon fa-${
          showGhostedPosts ? "eye-slash" : "eye"
        } fa-fw"></i> ${showGhostedPosts ? "Hide" : "Show"} Ghosted Posts`;
        button.style.marginRight = "10px";

        button.addEventListener("click", (e) => {
          e.preventDefault();
          showGhostedPosts = !showGhostedPosts;
          storage.set("showGhostedPosts", showGhostedPosts);
          location.reload();
        });

        const firstBtn = bar.querySelector(".dropdown-container");
        if (firstBtn) {
          bar.insertBefore(button, firstBtn);
        } else {
          bar.appendChild(button);
        }
      });
    }
  }

  // Initialize
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      addGhostButton();
      processContent();
    });
  } else {
    addGhostButton();
    processContent();
  }
})();
