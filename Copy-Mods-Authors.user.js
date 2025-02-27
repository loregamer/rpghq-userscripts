// ==UserScript==
// @name         RPGHQ - Copy Mods and Authors
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Adds "Copy Mods" and "Copy Authors" buttons to forum threads
// @match        https://rpghq.org/forums/viewtopic.php?t=3511*
// @grant        GM_addStyle
// @license      MIT
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// ==/UserScript==

/*
MIT License

Copyright (c) 2024

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

  // Add CSS for the buttons and notification
  GM_addStyle(`
    @media (max-width: 700px) {
      .copy-button span {
        display: none;
      }
    }
    
    .copied-message {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
    }
    
    .copied-message.show {
      opacity: 1;
    }
  `);

  // Function to extract code blocks from posts containing "Mod Report"
  function extractModReportCodeBlocks() {
    const codeBlocks = [];

    // Find all posts
    document.querySelectorAll(".post").forEach((post) => {
      const postContent = post.querySelector(".content");

      // Check if post content exists and contains "Mod Report"
      if (postContent && postContent.textContent.includes("Mod Report")) {
        // Find code blocks within this post
        const codeBox = postContent.querySelector(".codebox pre code");
        if (codeBox) {
          codeBlocks.push(codeBox.textContent.trim());
        }
      }
    });

    return codeBlocks;
  }

  // Function to extract mod names from the page (kept for backward compatibility)
  function extractMods() {
    const modNames = new Set();

    // Look for mod names in post content
    document.querySelectorAll(".content").forEach((content) => {
      // Look for links that might contain mod names
      const modLinks = content.querySelectorAll('a[href*="nexusmods.com"]');
      modLinks.forEach((link) => {
        const url = link.href;
        const modNameMatch = url.match(
          /nexusmods\.com\/[^\/]+\/mods\/([^\/\?#]+)/
        );
        if (modNameMatch && modNameMatch[1]) {
          let modName = modNameMatch[1].replace(/-/g, " ");
          modName = modName.replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize first letter of each word
          modNames.add(modName);
        } else {
          // If no match in URL, use the link text as a fallback
          const linkText = link.textContent.trim();
          if (linkText && !linkText.includes("nexusmods.com")) {
            modNames.add(linkText);
          }
        }
      });

      // Look for text that might mention mods
      const text = content.textContent;
      const modMatches = text.match(
        /(?:mod|addon|add-on|plugin):\s*([^\n.,]+)/gi
      );
      if (modMatches) {
        modMatches.forEach((match) => {
          const modName = match
            .replace(/(?:mod|addon|add-on|plugin):\s*/i, "")
            .trim();
          if (modName) {
            modNames.add(modName);
          }
        });
      }
    });

    return Array.from(modNames);
  }

  // Function to extract author names from the page
  function extractAuthors() {
    const authors = new Set();

    // Get all usernames from posts
    document.querySelectorAll(".postprofile .username").forEach((username) => {
      authors.add(username.textContent.trim());
    });

    return Array.from(authors);
  }

  // Function to copy text to clipboard
  function copyToClipboard(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);

    showCopiedMessage(text);
  }

  // Function to show a notification when text is copied
  function showCopiedMessage(text) {
    let message = document.querySelector(".copied-message");

    if (!message) {
      message = document.createElement("div");
      message.className = "copied-message";
      document.body.appendChild(message);
    }

    // Truncate text if it's too long
    const displayText = text.length > 50 ? text.substring(0, 47) + "..." : text;
    message.textContent = `Copied: ${displayText}`;
    message.classList.add("show");

    setTimeout(() => {
      message.classList.remove("show");
    }, 2000);
  }

  // Function to add the copy buttons to the action bar
  function addCopyButtons() {
    const actionBar = document.querySelector(".action-bar.bar-top");
    if (!actionBar) return;

    // Create Copy Mods button
    const copyModsContainer = document.createElement("div");
    copyModsContainer.className =
      "dropdown-container dropdown-button-control topic-tools";

    const copyModsButton = document.createElement("span");
    copyModsButton.id = "copy-mods-button";
    copyModsButton.className =
      "button button-secondary dropdown-trigger copy-button";
    copyModsButton.title = "Copy Mod Reports";

    const modsIcon = document.createElement("i");
    modsIcon.className = "icon fa-clipboard fa-fw";
    modsIcon.setAttribute("aria-hidden", "true");

    const modsText = document.createElement("span");
    modsText.textContent = "Copy Mods";

    copyModsButton.appendChild(modsIcon);
    copyModsButton.appendChild(modsText);
    copyModsContainer.appendChild(copyModsButton);

    // Create Copy Authors button
    const copyAuthorsContainer = document.createElement("div");
    copyAuthorsContainer.className =
      "dropdown-container dropdown-button-control topic-tools";

    const copyAuthorsButton = document.createElement("span");
    copyAuthorsButton.id = "copy-authors-button";
    copyAuthorsButton.className =
      "button button-secondary dropdown-trigger copy-button";
    copyAuthorsButton.title = "Copy Author Names";

    const authorsIcon = document.createElement("i");
    authorsIcon.className = "icon fa-users fa-fw";
    authorsIcon.setAttribute("aria-hidden", "true");

    const authorsText = document.createElement("span");
    authorsText.textContent = "Copy Authors";

    copyAuthorsButton.appendChild(authorsIcon);
    copyAuthorsButton.appendChild(authorsText);
    copyAuthorsContainer.appendChild(copyAuthorsButton);

    // Add event listeners
    copyModsButton.addEventListener("click", function (e) {
      e.preventDefault();
      const codeBlocks = extractModReportCodeBlocks();
      if (codeBlocks.length > 0) {
        copyToClipboard(codeBlocks.join("\n\n"));
      } else {
        copyToClipboard("No mod reports found");
      }
    });

    copyAuthorsButton.addEventListener("click", function (e) {
      e.preventDefault();
      const authors = extractAuthors();
      if (authors.length > 0) {
        copyToClipboard(authors.join("\n"));
      } else {
        copyToClipboard("No authors found");
      }
    });

    // Insert buttons before the pagination
    const paginationDiv = actionBar.querySelector(".pagination");
    if (paginationDiv) {
      actionBar.insertBefore(copyAuthorsContainer, paginationDiv);
      actionBar.insertBefore(copyModsContainer, paginationDiv);
    } else {
      // If pagination not found, append to the end
      actionBar.appendChild(copyModsContainer);
      actionBar.appendChild(copyAuthorsContainer);
    }
  }

  // Initialize the script when the page is loaded
  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", addCopyButtons);
    } else {
      addCopyButtons();
    }
  }

  init();
})();
