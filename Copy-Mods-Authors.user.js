// ==UserScript==
// @name         RPGHQ - Copy Mods and Authors
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Adds "Copy Mods" and "Copy Authors" buttons to forum threads
// @match        https://rpghq.org/forums/viewtopic.php?t=3511*
// @match        https://rpghq.org/forums/viewtopic.php*submissions-for-nexus*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @license      MIT
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/main/Copy-Mods-Authors.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/main/Copy-Mods-Authors.user.js
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

    .post.hidden-post {
      display: none !important;
    }
    
    .hide-all-button {
      background-color: #d9534f !important;
      color: white !important;
    }
    
    .hide-all-button:hover {
      background-color: #c9302c !important;
    }
  `);

  // Define separator line
  const SEPARATOR_LINE = "----------------------------------------";

  // Function to extract all code blocks and categorize them
  function extractCodeBlocks() {
    const modReports = [];
    const authorReports = [];
    const hiddenPosts = GM_getValue("hiddenPosts", []);

    // Find all code blocks in the page
    document.querySelectorAll(".codebox pre code").forEach((codeBlock) => {
      // Check if the code block is inside a hidden post
      const postElement = codeBlock.closest(".post");
      if (postElement && hiddenPosts.includes(postElement.id)) {
        // Skip this code block as it's in a hidden post
        return;
      }

      // Check if the code block is inside a blockquote
      if (codeBlock.closest("blockquote")) {
        // Skip this code block as it's inside a blockquote
        return;
      }

      const content = codeBlock.textContent.trim();

      // Categorize based on content
      if (content.startsWith("Game Shortname:")) {
        modReports.push(content);
      } else if (content.startsWith("Username:")) {
        authorReports.push(content);
      }
    });

    return { modReports, authorReports };
  }

  // Function to replace standalone "-" with "null" in report text
  function replaceHyphensWithNull(text) {
    // Replace standalone "-" that appears after a colon and whitespace
    return text.replace(/:\s*-(\s|$)/g, ": null$1");
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
    copyAuthorsButton.title = "Copy Author Reports";

    const authorsIcon = document.createElement("i");
    authorsIcon.className = "icon fa-users fa-fw";
    authorsIcon.setAttribute("aria-hidden", "true");

    const authorsText = document.createElement("span");
    authorsText.textContent = "Copy Authors";

    copyAuthorsButton.appendChild(authorsIcon);
    copyAuthorsButton.appendChild(authorsText);
    copyAuthorsContainer.appendChild(copyAuthorsButton);

    // Create Hide All button
    const hideAllContainer = document.createElement("div");
    hideAllContainer.className =
      "dropdown-container dropdown-button-control topic-tools";

    const hideAllButton = document.createElement("span");
    hideAllButton.id = "hide-all-button";
    hideAllButton.className =
      "button button-secondary dropdown-trigger copy-button hide-all-button";
    hideAllButton.title = "Hide All Report Posts";

    const hideIcon = document.createElement("i");
    hideIcon.className = "icon fa-eye-slash fa-fw";
    hideIcon.setAttribute("aria-hidden", "true");

    const hideText = document.createElement("span");
    hideText.textContent = "Hide All";

    hideAllButton.appendChild(hideIcon);
    hideAllButton.appendChild(hideText);
    hideAllContainer.appendChild(hideAllButton);

    // Add event listeners
    copyModsButton.addEventListener("click", function (e) {
      e.preventDefault();
      // Extract code blocks on-demand when button is clicked
      const { modReports } = extractCodeBlocks();
      if (modReports.length > 0) {
        // Process each report to replace hyphens with null
        const processedReports = modReports.map((report) =>
          replaceHyphensWithNull(report)
        );
        copyToClipboard(processedReports.join(`\n\n${SEPARATOR_LINE}\n\n`));
      } else {
        copyToClipboard("No mod reports found");
      }
    });

    copyAuthorsButton.addEventListener("click", function (e) {
      e.preventDefault();
      // Extract code blocks on-demand when button is clicked
      const { authorReports } = extractCodeBlocks();
      if (authorReports.length > 0) {
        // Process each report to replace hyphens with null
        const processedReports = authorReports.map((report) =>
          replaceHyphensWithNull(report)
        );
        copyToClipboard(processedReports.join(`\n\n${SEPARATOR_LINE}\n\n`));
      } else {
        copyToClipboard("No author reports found");
      }
    });

    hideAllButton.addEventListener("click", function (e) {
      e.preventDefault();
      // Hide all report posts
      hideAllReportPosts();
    });

    // Insert buttons before the pagination
    const paginationDiv = actionBar.querySelector(".pagination");
    if (paginationDiv) {
      actionBar.insertBefore(copyModsContainer, paginationDiv);
      actionBar.insertBefore(copyAuthorsContainer, paginationDiv);
      actionBar.insertBefore(hideAllContainer, paginationDiv);
    } else {
      // If pagination not found, append to the end
      actionBar.appendChild(copyModsContainer);
      actionBar.appendChild(copyAuthorsContainer);
      actionBar.appendChild(hideAllContainer);
    }
  }

  // Function to save hidden posts to storage
  function saveHiddenPost(postId) {
    const hiddenPosts = GM_getValue("hiddenPosts", []);
    if (!hiddenPosts.includes(postId)) {
      hiddenPosts.push(postId);
      GM_setValue("hiddenPosts", hiddenPosts);
    }
  }

  // Function to handle post deletion
  function handlePostDeletion(event) {
    event.preventDefault();
    const deleteButton = event.currentTarget;
    const postElement = deleteButton.closest(".post");

    if (postElement) {
      const postId = postElement.id;

      // Save post ID
      saveHiddenPost(postId);

      // Remove the post from DOM
      postElement.remove();

      // Show notification
      showCopiedMessage("Post removed");
    }
  }

  // Function to check if a post has a single blockquote
  function hasSingleBlockquote(postElement) {
    const blockquotes = postElement.querySelectorAll("blockquote");
    return blockquotes.length === 1;
  }

  // Function to hide all report posts
  function hideAllReportPosts() {
    let hiddenCount = 0;
    const hiddenPosts = GM_getValue("hiddenPosts", []);

    // Find all posts with code blocks that contain reports
    document.querySelectorAll(".post").forEach((postElement) => {
      // Skip if already hidden
      if (hiddenPosts.includes(postElement.id)) {
        return;
      }

      // Skip posts with a single blockquote
      if (hasSingleBlockquote(postElement)) {
        return;
      }

      // Check if post contains a report
      const codeBlocks = postElement.querySelectorAll(".codebox pre code");
      let hasReport = false;

      for (const codeBlock of codeBlocks) {
        // Skip code blocks in blockquotes
        if (codeBlock.closest("blockquote")) {
          continue;
        }

        const content = codeBlock.textContent.trim();
        if (
          content.startsWith("Game Shortname:") ||
          content.startsWith("Username:")
        ) {
          hasReport = true;
          break;
        }
      }

      if (hasReport) {
        const postId = postElement.id;

        // Save post ID
        saveHiddenPost(postId);

        // Remove the post from DOM
        postElement.remove();

        hiddenCount++;
      }
    });

    // Show notification
    showCopiedMessage(`${hiddenCount} posts hidden`);
  }

  // Function to hide posts that were previously deleted
  function hideStoredPosts() {
    const hiddenPosts = GM_getValue("hiddenPosts", []);

    // Loop through stored hidden post IDs and remove them from DOM
    hiddenPosts.forEach((postId) => {
      const postElement = document.getElementById(postId);
      if (postElement) {
        postElement.remove();
      }
    });
  }

  // Function to modify delete buttons
  function modifyDeleteButtons() {
    document
      .querySelectorAll('.post-buttons .button[title="Delete post"]')
      .forEach((button) => {
        // Remove original click event listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        // Add our custom event listener
        newButton.addEventListener("click", handlePostDeletion);
      });
  }

  // Initialize the script when the page is loaded
  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        hideStoredPosts();
        addCopyButtons();
        modifyDeleteButtons();
      });
    } else {
      hideStoredPosts();
      addCopyButtons();
      modifyDeleteButtons();
    }
  }

  init();
})();
