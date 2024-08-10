// ==UserScript==
// @name         RPGHQ Thread Ignorer
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Add ignore/unignore button to threads on rpghq.org and hide ignored threads
// @match        https://rpghq.org/forums/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @license      MIT
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

      actionBar.appendChild(ignoreButton);
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

  function showIgnoredThreads() {
    let message = "Ignored Threads:\n\n";
    for (const [threadId, title] of Object.entries(ignoredThreads)) {
      message += `${title}\nhttps://rpghq.org/forums/viewtopic.php?t=${threadId}\n\n`;
    }
    alert(message || "No threads are currently ignored.");
  }

  function addUnignoreAllButton() {
    const dropdown = document.querySelector(
      "#username_logged_in .dropdown-contents"
    );
    if (dropdown && !document.getElementById("unignore-all-button")) {
      const listItem = document.createElement("li");
      const unignoreAllButton = document.createElement("a");
      unignoreAllButton.id = "unignore-all-button";
      unignoreAllButton.href = "#";
      unignoreAllButton.title = "Unignore all threads";
      unignoreAllButton.role = "menuitem";
      unignoreAllButton.innerHTML =
        '<i class="icon fa-eye fa-fw" aria-hidden="true"></i><span>Unignore all threads</span>';

      unignoreAllButton.addEventListener("click", function (e) {
        e.preventDefault();
        if (confirm("Are you sure you want to unignore all threads?")) {
          ignoredThreads = {};
          GM_setValue("ignoredThreads", ignoredThreads);
          alert(
            "All threads have been unignored. Refresh the page to see the changes."
          );
          window.location.reload();
        }
      });

      listItem.appendChild(unignoreAllButton);
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
          ignoreButton.style.cssText =
            "background: none; border: none; cursor: pointer; position: absolute; right: 5px; top: 5px;";
          ignoreButton.addEventListener("click", function (e) {
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

  function initializeScript() {
    addIgnoreButton();
    hideIgnoredThreads();
    addUnignoreAllButton();
    addToggleIgnoreModeButton();
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

  // Register menu commands
  GM_registerMenuCommand("Show Ignored Threads", showIgnoredThreads);

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
