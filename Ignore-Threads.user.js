// ==UserScript==
// @name         RPGHQ Thread Ignorer
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Add ignore/unignore button to threads on rpghq.org and hide ignored threads
// @match        https://rpghq.org/forums/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @license      MIT
// @run-at       document-start
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/main/Ignore-Threads.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/main/Ignore-Threads.user.js
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

  let ignoredThreads = GM_getValue("ignoredThreads", {});
  let ignoreModeActive = GM_getValue("ignoreModeActive", false);

  // Add CSS early to prevent flash
  const style = document.createElement("style");
  style.textContent = `
    @media (max-width: 700px) {
      #ignore-thread-button span {
        display: none;
      }
    }
  `;
  document.documentElement.appendChild(style);

  // Pre-hide ignored threads as early as possible
  function hideIgnoredThreadsEarly(mutations) {
    const threadItems = document.querySelectorAll(
      ".topiclist.topics > li, #recent-topics > ul > li, ul.topiclist.topics > li"
    );
    threadItems.forEach((item) => {
      const threadLink = item.querySelector("a.topictitle");
      if (threadLink) {
        const threadTitle = threadLink.textContent.trim();
        if (isThreadIgnored(threadTitle)) {
          item.remove();
        }
      }
    });

    const lastPosts = document.querySelectorAll(".lastpost");
    lastPosts.forEach((lastPost) => {
      const lastPostLink = lastPost.querySelector("a.lastsubject");
      if (lastPostLink) {
        const threadTitle = lastPostLink.getAttribute("title");
        if (threadTitle && isThreadIgnored(threadTitle)) {
          lastPost.remove();
        }
      }
    });
  }

  // Set up early mutation observer
  const earlyObserver = new MutationObserver(hideIgnoredThreadsEarly);
  earlyObserver.observe(document, { childList: true, subtree: true });

  function addIgnoreButton() {
    const actionBar = document.querySelector(".action-bar.bar-top");
    const threadId = getThreadId();
    if (
      actionBar &&
      threadId &&
      !document.getElementById("ignore-thread-button")
    ) {
      const dropdownContainer = document.createElement("div");
      dropdownContainer.className =
        "dropdown-container dropdown-button-control topic-tools";

      const ignoreButton = document.createElement("span");
      ignoreButton.id = "ignore-thread-button";
      ignoreButton.className = "button button-secondary dropdown-trigger";
      ignoreButton.title = "Ignore Thread";

      let isIgnored = ignoredThreads.hasOwnProperty(threadId);
      updateButtonState(ignoreButton, isIgnored);

      ignoreButton.addEventListener("click", function (e) {
        e.preventDefault();
        const threadTitle = document
          .querySelector(".topic-title")
          .textContent.trim();
        if (isIgnored) {
          unignoreThread(threadId);
          updateButtonState(ignoreButton, false);
          isIgnored = false;
        } else {
          if (confirm("Are you sure you want to ignore this thread?")) {
            ignoreThread(threadId, threadTitle);
            updateButtonState(ignoreButton, true);
            isIgnored = true;
            window.location.href = "https://rpghq.org/forums/index.php";
          }
        }
      });

      dropdownContainer.appendChild(ignoreButton);

      const paginationDiv = actionBar.querySelector(".pagination");
      const topicTitle = document.querySelector("h2.topic-title");
      if (paginationDiv && topicTitle) {
        actionBar.insertBefore(dropdownContainer, paginationDiv);
      }
    }
  }

  function updateButtonState(button, isIgnored) {
    if (isIgnored) {
      button.innerHTML =
        '<i class="icon fa-check fa-fw" aria-hidden="true"></i><span>Unignore Thread</span>';
      button.title = "Unignore Thread";
    } else {
      button.innerHTML =
        '<i class="icon fa-ban fa-fw" aria-hidden="true"></i><span>Ignore Thread</span>';
      button.title = "Ignore Thread";
    }
  }

  function getThreadId() {
    const topicTitleLink = document.querySelector("h2.topic-title a");
    if (topicTitleLink) {
      const match = topicTitleLink.href.match(/[?&]t=(\d+)/);
      return match ? match[1] : null;
    }
    return null;
  }

  function ignoreThread(threadId, threadTitle) {
    // Fetch the latest data from storage
    let currentIgnoredThreads = GM_getValue("ignoredThreads", {});

    // Add the new thread to the current list
    currentIgnoredThreads[threadId] = threadTitle;

    // Save the updated list back to storage
    GM_setValue("ignoredThreads", currentIgnoredThreads);

    // Update the local ignoredThreads object
    ignoredThreads = currentIgnoredThreads;
  }

  function unignoreThread(threadId) {
    // Fetch the latest data from storage
    let currentIgnoredThreads = GM_getValue("ignoredThreads", {});

    if (currentIgnoredThreads.hasOwnProperty(threadId)) {
      delete currentIgnoredThreads[threadId];
      GM_setValue("ignoredThreads", currentIgnoredThreads);

      // Update the local ignoredThreads object
      ignoredThreads = currentIgnoredThreads;
    }
  }

  function hideIgnoredThreads() {
    const threadItems = document.querySelectorAll(
      ".topiclist.topics > li, #recent-topics > ul > li, ul.topiclist.topics > li"
    );
    threadItems.forEach((item) => {
      const threadLink = item.querySelector("a.topictitle");
      if (threadLink) {
        const threadTitle = threadLink.textContent.trim();
        if (isThreadIgnored(threadTitle)) {
          item.remove();
        }
      }
    });

    const lastPosts = document.querySelectorAll(".lastpost");
    lastPosts.forEach((lastPost) => {
      const lastPostLink = lastPost.querySelector("a.lastsubject");
      if (lastPostLink) {
        const threadTitle = lastPostLink.getAttribute("title");
        if (threadTitle && isThreadIgnored(threadTitle)) {
          lastPost.remove();
        }
      }
    });
  }

  function isThreadIgnored(threadTitle) {
    return Object.values(ignoredThreads).some(
      (ignoredTitle) => ignoredTitle.toLowerCase() === threadTitle.toLowerCase()
    );
  }

  function resetIgnoredThreads() {
    if (
      confirm(
        "Are you sure you want to reset all ignored threads? This action cannot be undone."
      )
    ) {
      ignoredThreads = {};
      GM_setValue("ignoredThreads", ignoredThreads);
      alert("All ignored threads have been reset.");
      window.location.reload(); // Reload the page to reflect changes
    }
  }

  function addResetIgnoredThreadsButton() {
    const dropdown = document.querySelector(
      "#username_logged_in .dropdown-contents"
    );
    if (dropdown && !document.getElementById("reset-ignored-threads-button")) {
      const listItem = document.createElement("li");
      const resetButton = document.createElement("a");
      resetButton.id = "reset-ignored-threads-button";
      resetButton.href = "#";
      resetButton.title = "Reset Ignored Threads";
      resetButton.role = "menuitem";
      resetButton.innerHTML =
        '<i class="icon fa-refresh fa-fw" aria-hidden="true"></i><span>Reset Ignored Threads</span>';

      resetButton.addEventListener("click", function (e) {
        e.preventDefault();
        resetIgnoredThreads();
      });

      listItem.appendChild(resetButton);
      dropdown.insertBefore(listItem, dropdown.lastElementChild);
    }
  }

  function toggleIgnoreMode() {
    ignoreModeActive = !ignoreModeActive;
    GM_setValue("ignoreModeActive", ignoreModeActive);
    const toggleButton = document.getElementById("toggle-ignore-mode-button");
    if (toggleButton) {
      toggleButton.querySelector("i").className = ignoreModeActive
        ? "icon fa-toggle-on fa-fw"
        : "icon fa-toggle-off fa-fw";
    }
    updateIgnoreButtons();
  }

  function addToggleIgnoreModeButton() {
    const dropdown = document.querySelector(
      "#username_logged_in .dropdown-contents"
    );
    if (dropdown && !document.getElementById("toggle-ignore-mode-button")) {
      const listItem = document.createElement("li");
      const toggleButton = document.createElement("a");
      toggleButton.id = "toggle-ignore-mode-button";
      toggleButton.href = "#";
      toggleButton.title = "Toggle Mass Ignore Mode";
      toggleButton.role = "menuitem";
      toggleButton.innerHTML = `
        <i class="icon ${
          ignoreModeActive ? "fa-toggle-on" : "fa-toggle-off"
        } fa-fw" aria-hidden="true"></i>
        <span>Mass Ignore Mode</span>
      `;

      toggleButton.addEventListener("click", function (e) {
        e.preventDefault();
        toggleIgnoreMode();
      });

      listItem.appendChild(toggleButton);
      dropdown.insertBefore(listItem, dropdown.lastElementChild);
    }
  }

  function updateIgnoreButtons() {
    const threadItems = document.querySelectorAll(
      ".topiclist.topics > li, #recent-topics > ul > li, ul.topiclist.topics > li"
    );
    threadItems.forEach((item) => {
      const existingButton = item.querySelector(".quick-ignore-button");
      if (ignoreModeActive) {
        if (!existingButton) {
          const button = createIgnoreButton();

          // Position the button in the center vertically and on the right
          button.style.cssText = `
            position: absolute;
            right: 5px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 10;
          `;

          item.style.position = "relative";
          item.appendChild(button);

          button.addEventListener("click", function (e) {
            e.stopPropagation();
            const threadLink = item.querySelector("a.topictitle");
            if (threadLink) {
              const threadId = threadLink.href.match(/[?&]t=(\d+)/)[1];
              const threadTitle = threadLink.textContent.trim();
              ignoreThread(threadId, threadTitle);
              item.style.display = "none";
            }
          });
        }
      } else if (existingButton) {
        existingButton.remove();
      }
    });
  }

  function createIgnoreButton() {
    const button = document.createElement("button");
    button.className = "quick-ignore-button";
    button.style.cssText = `
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 10;
    `;

    button.textContent = "×"; // Using the multiplication symbol as a close icon

    button.addEventListener("mouseover", () => {
      button.style.opacity = "1";
    });

    button.addEventListener("mouseout", () => {
      button.style.opacity = "0.8";
    });

    return button;
  }

  function escapeForUblock(str) {
    return str
      .replace(/[\\^$.*+?()[\]{}|]/g, "\\$&") // Escape special regex characters
      .replace(/"/g, '\\"') // Escape double quotes
      .replace(/'/g, "\\'"); // Escape single quotes (apostrophes)
  }

  function exportIgnoredThreads() {
    // Export JSON
    const exportData = JSON.stringify(ignoredThreads);
    const jsonBlob = new Blob([exportData], { type: "application/json" });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement("a");
    jsonLink.href = jsonUrl;
    jsonLink.download = "ignored_threads.json";
    document.body.appendChild(jsonLink);
    jsonLink.click();
    document.body.removeChild(jsonLink);
    URL.revokeObjectURL(jsonUrl);

    // Export uBlock Origin filters
    let uBlockFilters = "! RPGHQ Thread Ignorer - Ignored Threads\n";
    for (const threadId in ignoredThreads) {
      const threadTitle = escapeForUblock(ignoredThreads[threadId]);
      uBlockFilters += `
! Thread ID: ${threadId}
! Thread Title: ${threadTitle}

rpghq.org##ul.topiclist li:has(a:has-text(/${threadTitle}/))
rpghq.org##div#recent-topics li:has(a:has-text(/${threadTitle}/))
`;
    }
    const textBlob = new Blob([uBlockFilters], { type: "text/plain" });
    const textUrl = URL.createObjectURL(textBlob);
    const textLink = document.createElement("a");
    textLink.href = textUrl;
    textLink.download = "ignored_threads_ublock.txt";
    document.body.appendChild(textLink);
    textLink.click();
    document.body.removeChild(textLink);
    URL.revokeObjectURL(textUrl);
  }

  function importIgnoredThreads() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = function (event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const importedData = JSON.parse(e.target.result);
          ignoredThreads = importedData;
          GM_setValue("ignoredThreads", ignoredThreads);
          alert(
            "Ignored threads imported successfully. Refresh the page to see the changes."
          );
          window.location.reload();
        } catch (error) {
          alert(
            "Error importing ignored threads. Please make sure the file is valid."
          );
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function addExportImportButtons() {
    const dropdown = document.querySelector(
      "#username_logged_in .dropdown-contents"
    );
    if (dropdown) {
      // Export button
      if (!document.getElementById("export-ignored-threads-button")) {
        const exportListItem = document.createElement("li");
        const exportButton = document.createElement("a");
        exportButton.id = "export-ignored-threads-button";
        exportButton.href = "#";
        exportButton.title = "Export Ignored Threads";
        exportButton.role = "menuitem";
        exportButton.innerHTML =
          '<i class="icon fa-download fa-fw" aria-hidden="true"></i><span>Export Ignored Threads</span>';
        exportButton.addEventListener("click", function (e) {
          e.preventDefault();
          exportIgnoredThreads();
        });
        exportListItem.appendChild(exportButton);
        dropdown.insertBefore(exportListItem, dropdown.lastElementChild);
      }

      // Import button
      if (!document.getElementById("import-ignored-threads-button")) {
        const importListItem = document.createElement("li");
        const importButton = document.createElement("a");
        importButton.id = "import-ignored-threads-button";
        importButton.href = "#";
        importButton.title = "Import Ignored Threads";
        importButton.role = "menuitem";
        importButton.innerHTML =
          '<i class="icon fa-upload fa-fw" aria-hidden="true"></i><span>Import Ignored Threads</span>';
        importButton.addEventListener("click", function (e) {
          e.preventDefault();
          importIgnoredThreads();
        });
        importListItem.appendChild(importButton);
        dropdown.insertBefore(importListItem, dropdown.lastElementChild);
      }
    }
  }

  function showIgnoredThreadsPopup() {
    // Create popup container
    const popup = document.createElement("div");
    popup.id = "ignored-threads-popup";
    popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #2a2e36;
      border: 1px solid #3a3f4b;
      border-radius: 5px;
      width: 80%;
      max-width: 600px;
      height: 80%;
      max-height: 600px;
      display: flex;
      flex-direction: column;
      z-index: 9999;
      font-family: 'Open Sans', 'Droid Sans', Arial, Verdana, sans-serif;
    `;

    // Create header
    const header = document.createElement("div");
    header.style.cssText = `
      padding: 20px;
      background-color: #2a2e36;
      border-bottom: 1px solid #3a3f4b;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 1;
    `;

    const title = document.createElement("h2");
    title.textContent = "Ignored Threads";
    title.style.margin = "0";
    title.style.color = "#c5d0db";

    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.style.cssText = `
      background-color: #4a5464;
      color: #c5d0db;
      border: none;
      padding: 5px 10px;
      border-radius: 3px;
      cursor: pointer;
    `;
    closeButton.onclick = () => document.body.removeChild(popup);

    header.appendChild(title);
    header.appendChild(closeButton);

    // Create content
    const content = document.createElement("div");
    content.style.cssText = `
      padding: 20px;
      overflow-y: auto;
      flex-grow: 1;
    `;

    // Sort ignored threads alphabetically
    const sortedThreads = Object.entries(ignoredThreads).sort((a, b) =>
      a[1].localeCompare(b[1])
    );

    if (sortedThreads.length === 0) {
      content.innerHTML =
        '<p style="color: #c5d0db;">No threads are currently ignored.</p>';
    } else {
      const threadList = document.createElement("ul");
      threadList.style.cssText = `
        list-style-type: none;
        padding: 0;
        margin: 0;
      `;

      for (const [threadId, title] of sortedThreads) {
        const listItem = document.createElement("li");
        listItem.style.cssText = `
          margin-bottom: 10px;
          display: flex;
          align-items: center;
        `;

        const unignoreButton = document.createElement("button");
        unignoreButton.textContent = "Unignore";
        unignoreButton.style.cssText = `
          background-color: #4a5464;
          color: #c5d0db;
          border: none;
          padding: 2px 5px;
          border-radius: 3px;
          cursor: pointer;
          margin-right: 10px;
          font-size: 0.8em;
        `;
        unignoreButton.onclick = () => {
          unignoreThread(threadId);
          listItem.remove();
          if (threadList.children.length === 0) {
            content.innerHTML =
              '<p style="color: #c5d0db;">No threads are currently ignored.</p>';
          }
        };

        const threadLink = document.createElement("a");
        threadLink.href = `https://rpghq.org/forums/viewtopic.php?t=${threadId}`;
        threadLink.textContent = title;
        threadLink.style.color = "#4a90e2";
        threadLink.style.textDecoration = "none";

        listItem.appendChild(unignoreButton);
        listItem.appendChild(threadLink);
        threadList.appendChild(listItem);
      }

      content.appendChild(threadList);

      // Add mass unignore button
      const massUnignoreButton = document.createElement("button");
      massUnignoreButton.textContent = "Unignore All Threads";
      massUnignoreButton.style.cssText = `
        margin-top: 15px;
        background-color: #4a5464;
        color: #c5d0db;
        border: none;
        padding: 5px 10px;
        border-radius: 3px;
        cursor: pointer;
      `;
      massUnignoreButton.onclick = () => {
        if (confirm("Are you sure you want to unignore all threads?")) {
          ignoredThreads = {};
          GM_setValue("ignoredThreads", ignoredThreads);
          alert("All threads have been unignored.");
          document.body.removeChild(popup);
          window.location.reload(); // Reload the page to reflect changes
        }
      };
      content.appendChild(massUnignoreButton);
    }

    // Assemble popup
    popup.appendChild(header);
    popup.appendChild(content);
    document.body.appendChild(popup);
  }

  function addShowIgnoredThreadsButton() {
    const dropdown = document.querySelector(
      "#username_logged_in .dropdown-contents"
    );
    if (dropdown && !document.getElementById("show-ignored-threads-button")) {
      const listItem = document.createElement("li");
      const showButton = document.createElement("a");
      showButton.id = "show-ignored-threads-button";
      showButton.href = "#";
      showButton.title = "Review Ignored Threads";
      showButton.role = "menuitem";
      showButton.innerHTML =
        '<i class="icon fa-eye fa-fw" aria-hidden="true"></i><span>Review Ignored Threads</span>';

      showButton.addEventListener("click", function (e) {
        e.preventDefault();
        showIgnoredThreadsPopup();
      });

      listItem.appendChild(showButton);
      dropdown.insertBefore(listItem, dropdown.lastElementChild);
    }
  }

  function initializeScript() {
    hideIgnoredThreads();
    addIgnoreButton();
    addResetIgnoredThreadsButton();
    addShowIgnoredThreadsButton();
    addToggleIgnoreModeButton();
    addExportImportButtons();
    if (ignoreModeActive) {
      updateIgnoreButtons();
    }
  }

  // Initialize when DOM is ready
  document.addEventListener("DOMContentLoaded", initializeScript);
})();
