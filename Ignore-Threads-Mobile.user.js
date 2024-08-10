// ==UserScript==
// @name         RPGHQ Thread Ignorer (Mobile Compatible)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Add ignore/unignore button to threads on rpghq.org and hide ignored threads (Mobile Compatible)
// @match        https://rpghq.org/forums/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @license      MIT
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
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

  function addIgnoreButton() {
    const actionBar = document.querySelector(".action-bar.bar-top");
    const threadId = getThreadId();
    if (
      actionBar &&
      threadId &&
      !document.getElementById("ignore-thread-button")
    ) {
      const ignoreButton = document.createElement("a");
      ignoreButton.id = "ignore-thread-button";
      ignoreButton.className = "button button-secondary";
      ignoreButton.style.cssText = `
        display: inline-block;
        padding: 10px;
        margin: 5px;
        font-size: 16px;
      `;

      let isIgnored = ignoredThreads.hasOwnProperty(threadId);
      updateButtonState(ignoreButton, isIgnored);

      ignoreButton.addEventListener("touchend", function (e) {
        e.preventDefault();
        handleIgnoreButtonClick(ignoreButton, threadId, isIgnored);
      });

      actionBar.appendChild(ignoreButton);
    }
  }

  function handleIgnoreButtonClick(button, threadId, isIgnored) {
    const threadTitle = document
      .querySelector(".topic-title")
      .textContent.trim();
    if (isIgnored) {
      unignoreThread(threadId);
      updateButtonState(button, false);
      isIgnored = false;
    } else {
      if (confirm("Are you sure you want to ignore this thread?")) {
        ignoreThread(threadId, threadTitle);
        updateButtonState(button, true);
        isIgnored = true;
        window.location.href = "https://rpghq.org/forums/index.php";
      }
    }
  }

  function updateButtonState(button, isIgnored) {
    if (isIgnored) {
      button.innerHTML =
        '<span>Unignore Thread</span> <i class="icon fa-check fa-fw" aria-hidden="true"></i>';
      button.title = "Unignore Thread";
    } else {
      button.innerHTML =
        '<span>Ignore Thread</span> <i class="icon fa-ban fa-fw" aria-hidden="true"></i>';
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
          item.style.display = "none";
        } else {
          item.style.display = "";
        }
      }
    });

    // Hide lastpost information if it's from an ignored thread
    const lastPosts = document.querySelectorAll(".lastpost");
    lastPosts.forEach((lastPost) => {
      const lastPostLink = lastPost.querySelector("a.lastsubject");
      if (lastPostLink) {
        const threadTitle = lastPostLink.getAttribute("title");
        if (threadTitle && isThreadIgnored(threadTitle)) {
          lastPost.style.display = "none";
        } else {
          lastPost.style.display = "";
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

  let ignoreModeActive = GM_getValue("ignoreModeActive", false);

  function toggleIgnoreMode() {
    ignoreModeActive = !ignoreModeActive;
    GM_setValue("ignoreModeActive", ignoreModeActive);
    const toggleButton = document.getElementById("toggle-ignore-mode-button");
    if (toggleButton) {
      toggleButton.querySelector("i").className = ignoreModeActive
        ? "icon fa-toggle-on fa-fw"
        : "icon fa-toggle-off fa-fw";
      toggleButton.querySelector("span").textContent = ignoreModeActive
        ? "Disable Ignore Mode"
        : "Enable Ignore Mode";
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
      toggleButton.title = "Toggle Ignore Mode";
      toggleButton.role = "menuitem";
      toggleButton.innerHTML = ignoreModeActive
        ? '<i class="icon fa-toggle-on fa-fw" aria-hidden="true"></i><span>Disable Ignore Mode</span>'
        : '<i class="icon fa-toggle-off fa-fw" aria-hidden="true"></i><span>Enable Ignore Mode</span>';

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
          const ignoreButton = document.createElement("button");
          ignoreButton.className = "quick-ignore-button";
          ignoreButton.innerHTML =
            '<img src="https://rpghq.org/forums/ext/canidev/reactions/images/reaction/cancel.svg" alt="Ignore" width="16" height="16">';
          ignoreButton.style.cssText = `
            background: none;
            border: none;
            cursor: pointer;
            position: absolute;
            right: 5px;
            bottom: 5px;
            padding: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
          `;
          ignoreButton.addEventListener("touchend", function (e) {
            e.preventDefault();
            e.stopPropagation();
            const threadLink = item.querySelector("a.topictitle");
            if (threadLink) {
              const threadId = threadLink.href.match(/[?&]t=(\d+)/)[1];
              const threadTitle = threadLink.textContent.trim();
              ignoreThread(threadId, threadTitle);
              item.style.display = "none";
            }
          });
          item.style.position = "relative";
          item.appendChild(ignoreButton);
        }
      } else if (existingButton) {
        existingButton.remove();
      }
    });
  }

  function showExportImportPopup(mode) {
    const popup = document.createElement("div");
    popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #2a2e36;
      border: 1px solid #3a3f4b;
      border-radius: 5px;
      width: 90%;
      max-width: 600px;
      padding: 20px;
      z-index: 9999;
      font-family: 'Open Sans', 'Droid Sans', Arial, Verdana, sans-serif;
      color: #c5d0db;
    `;

    const title = document.createElement("h2");
    title.textContent =
      mode === "export" ? "Export Ignored Threads" : "Import Ignored Threads";
    title.style.marginTop = "0";

    const textArea = document.createElement("textarea");
    textArea.style.cssText = `
      width: 100%;
      height: 150px;
      margin: 10px 0;
      padding: 5px;
      background-color: #1c1e22;
      color: #c5d0db;
      border: 1px solid #3a3f4b;
      border-radius: 3px;
    `;

    const actionButton = document.createElement("button");
    actionButton.textContent =
      mode === "export" ? "Copy to Clipboard" : "Import";
    actionButton.style.cssText = `
      background-color: #4a5464;
      color: #c5d0db;
      border: none;
      padding: 10px 15px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 16px;
      margin-right: 10px;
    `;

    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.style.cssText = `
      background-color: #4a5464;
      color: #c5d0db;
      border: none;
      padding: 10px 15px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 16px;
    `;

    closeButton.addEventListener("click", () =>
      document.body.removeChild(popup)
    );

    if (mode === "export") {
      const exportData = JSON.stringify(ignoredThreads);
      textArea.value = exportData;
      actionButton.addEventListener("click", () => {
        textArea.select();
        document.execCommand("copy");
        alert("Exported data copied to clipboard!");
      });
    } else {
      actionButton.addEventListener("click", () => {
        try {
          const importedData = JSON.parse(textArea.value);
          ignoredThreads = importedData;
          GM_setValue("ignoredThreads", ignoredThreads);
          alert(
            "Ignored threads imported successfully. Refresh the page to see the changes."
          );
          document.body.removeChild(popup);
          window.location.reload();
        } catch (error) {
          alert(
            "Error importing ignored threads. Please make sure the data is valid JSON."
          );
        }
      });
    }

    popup.appendChild(title);
    popup.appendChild(textArea);
    popup.appendChild(actionButton);
    popup.appendChild(closeButton);
    document.body.appendChild(popup);
  }

  function exportIgnoredThreads() {
    showExportImportPopup("export");
  }

  function importIgnoredThreads() {
    showExportImportPopup("import");
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
      padding: 10px 15px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 16px;
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
          padding: 5px 10px;
          border-radius: 3px;
          cursor: pointer;
          margin-right: 10px;
          font-size: 14px;
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
        padding: 10px 15px;
        border-radius: 3px;
        cursor: pointer;
        font-size: 16px;
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
      showButton.title = "Show Ignored Threads";
      showButton.role = "menuitem";
      showButton.innerHTML =
        '<i class="icon fa-eye fa-fw" aria-hidden="true"></i><span>Show Ignored Threads</span>';

      showButton.addEventListener("click", function (e) {
        e.preventDefault();
        showIgnoredThreadsPopup();
      });

      listItem.appendChild(showButton);
      dropdown.insertBefore(listItem, dropdown.lastElementChild);
    }
  }

  function initializeScript() {
    addIgnoreButton();
    hideIgnoredThreads();
    addResetIgnoredThreadsButton();
    addShowIgnoredThreadsButton();
    addToggleIgnoreModeButton();
    addExportImportButtons();
    if (ignoreModeActive) {
      updateIgnoreButtons();
    }
  }

  // Try to run immediately
  document.addEventListener("DOMContentLoaded", () => {
    initializeScript();
    updateIgnoreButtons();
  });

  // If immediate execution fails, wait for DOM content to be loaded
  if (
    !document.querySelector(".topiclist.topics") &&
    !document.querySelector("#recent-topics")
  ) {
    document.addEventListener("DOMContentLoaded", initializeScript);
  }

  // Fallback: If still not loaded, use a short timeout
  setTimeout(initializeScript, 500);

  // Add a MutationObserver to handle dynamically loaded content
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        updateIgnoreButtons();
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
