// ==UserScript==
// @name         RPGHQ Ignored Thread Enhancer
// @namespace    http://tampermonkey.net/
// @version      4.0.4
// @description  Export previously ignored threads from the old RPGHQ Thread Ignorer userscript.
// @match        https://rpghq.org/forums/*
// @grant        GM_getValue
// @grant        GM_setValue // Still needed for ignoreThread() function
// @license      MIT
// @run-at       document-start
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/main/Ignore-Threads.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/main/Ignore-Threads.user.js
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

  const I_Want_To_Devlishly_Ignore_Many_Many_Threads = false;

  // --- Inject CSS for Instant Hiding ---
  const style = document.createElement("style");
  style.textContent = `li.thread-ignored { display: none !important; }`;
  (document.head || document.documentElement).appendChild(style);

  // --- localStorage Wrapper Functions ---
  function storageGetValue(key, defaultValue) {
    const storedValue = localStorage.getItem(key);
    if (storedValue === null) {
      return defaultValue;
    }
    try {
      return JSON.parse(storedValue);
    } catch (e) {
      console.error(`Error parsing localStorage item "${key}":`, e);
      return defaultValue;
    }
  }

  function storageSetValue(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error setting localStorage item "${key}":`, e);
    }
  }
  // --- End localStorage Wrapper Functions ---

  let ignoredThreads = GM_getValue("ignoredThreads", {}); // Keep using GM for the export data
  let ignoreModeActive = false;

  function exportIgnoredThreadsJson() {
    const exportData = JSON.stringify(ignoredThreads, null, 2); // Pretty print JSON
    const jsonBlob = new Blob([exportData], { type: "application/json" });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement("a");
    jsonLink.href = jsonUrl;
    jsonLink.download = "ignored_threads_export.json";
    document.body.appendChild(jsonLink);
    jsonLink.click();
    document.body.removeChild(jsonLink);
    URL.revokeObjectURL(jsonUrl);
    alert("Ignored threads exported as JSON.");
  }

  function showIgnoredThreadsPopup() {
    const popup = document.createElement("div");
    popup.id = "ignored-threads-export-popup";
    popup.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background-color: #2a2e36; border: 1px solid #3a3f4b; border-radius: 5px;
      width: 80%; max-width: 600px; max-height: 80%; display: flex;
      flex-direction: column; z-index: 9999; font-family: 'Open Sans', 'Droid Sans', Arial, Verdana, sans-serif;
      color: #c5d0db;
    `;

    const header = document.createElement("div");
    header.style.cssText = `padding: 10px; background-color: #2a2e36; border-bottom: 1px solid #3a3f4b; display: flex; justify-content: space-between; align-items: center;`;
    const title = document.createElement("h2");
    title.textContent = "Previously Ignored Threads";
    title.style.cssText = "margin: 0; font-size: 1.2em;";
    const closeButton = document.createElement("button");
    closeButton.textContent = "×";
    closeButton.style.cssText = `background-color: transparent; color: #c5d0db; border: none; font-size: 1.5em; cursor: pointer;`;
    closeButton.onclick = () => document.body.removeChild(popup);
    header.appendChild(title);
    header.appendChild(closeButton);

    const content = document.createElement("div");
    content.style.cssText = `padding: 10px; overflow-y: auto; flex-grow: 1; background-color: #2a2e36;`;
    const threadList = document.createElement("ul");
    threadList.style.cssText = `list-style-type: none; padding: 0; margin: 0;`;
    content.appendChild(threadList);

    Object.entries(ignoredThreads)
      .sort((a, b) => a[1].localeCompare(b[1])) // Sort by title
      .forEach(([threadId, threadTitle]) => {
        const listItem = document.createElement("li");
        listItem.style.cssText = `margin-bottom: 5px; padding: 5px; border-bottom: 1px solid #3a3f4b;`;
        const threadLink = document.createElement("a");
        threadLink.href = `https://rpghq.org/forums/viewtopic.php?t=${threadId}`;
        threadLink.textContent = threadTitle;
        threadLink.style.cssText = "color: #4a90e2; text-decoration: none;";
        listItem.appendChild(threadLink);
        threadList.appendChild(listItem);
      });

    if (Object.keys(ignoredThreads).length === 0) {
      threadList.innerHTML = "<p>No previously ignored threads found.</p>";
    }

    const bottomControls = document.createElement("div");
    bottomControls.style.cssText = `padding: 10px; background-color: #2a2e36; border-top: 1px solid #3a3f4b; text-align: center;`;
    const exportJsonButton = document.createElement("button");
    exportJsonButton.innerHTML =
      '<i class="icon fa-download fa-fw" aria-hidden="true"></i> Export as JSON';
    exportJsonButton.style.cssText = `background-color: #4a5464; color: #c5d0db; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;`;
    exportJsonButton.onclick = exportIgnoredThreadsJson;
    bottomControls.appendChild(exportJsonButton);

    popup.appendChild(header);
    popup.appendChild(content);
    popup.appendChild(bottomControls);
    document.body.appendChild(popup);
  }

  function addShowExportButton() {
    const dropdown = document.querySelector(
      "#username_logged_in .dropdown-contents"
    );
    if (dropdown && !document.getElementById("show-ignored-export-button")) {
      const listItem = document.createElement("li");
      const showButton = document.createElement("a");
      showButton.id = "show-ignored-export-button";
      showButton.href = "#";
      showButton.title = "Export Userscript Iggys";
      showButton.role = "menuitem";
      showButton.innerHTML =
        '<i class="icon fa-download fa-fw" aria-hidden="true"></i><span>Export Userscript Iggys</span>';
      showButton.addEventListener("click", function (e) {
        e.preventDefault();
        showIgnoredThreadsPopup();
      });
      listItem.appendChild(showButton);

      // Find the "Never Iggy Users" button/list item
      const neverIggyUsersButton = document.getElementById(
        "show-never-ignored-users-button"
      );
      const neverIggyListItem = neverIggyUsersButton
        ? neverIggyUsersButton.closest("li")
        : null;

      // Add indentation
      listItem.style.paddingLeft = "15px";

      if (neverIggyListItem && neverIggyListItem.parentNode === dropdown) {
        // Insert after "Never Iggy Users" if found
        neverIggyListItem.insertAdjacentElement("afterend", listItem);
      } else {
        // Fallback: Insert before the last item (usually Logout)
        dropdown.insertBefore(listItem, dropdown.lastElementChild);
      }
    }
  }

  // --- Helper Functions ---
  function isThreadListPage() {
    const url = window.location.href;
    return (
      url.includes("index.php") ||
      url.includes("viewforum.php") ||
      url.includes("newposts") ||
      url.includes("search.php")
    );
  }

  // --- Quick Ignore Mode ---
  function toggleIgnoreMode() {
    ignoreModeActive = !ignoreModeActive;
    storageSetValue("ignoreModeActive", ignoreModeActive); // Use localStorage
    const toggleButton = document.getElementById("toggle-ignore-mode-button");
    if (toggleButton) {
      const icon = toggleButton.querySelector("i.icon");
      if (icon)
        icon.className = `icon ${ignoreModeActive ? "fa-toggle-on" : "fa-toggle-off"} fa-fw`;
      toggleButton.setAttribute("aria-checked", String(ignoreModeActive));
      toggleButton.title = `Quick Ignore Mode (${ignoreModeActive ? "ON" : "OFF"})`;
    }
    if (ignoreModeActive) {
      updateIgnoreButtons(); // Add buttons if activating
    } else {
      // Remove existing quick ignore buttons
      document
        .querySelectorAll(".quick-ignore-button")
        .forEach((b) => b.remove());
    }
  }

  function addToggleIgnoreModeButton() {
    if (!I_Want_To_Devlishly_Ignore_Many_Many_Threads) return;

    const dropdown = document.querySelector(
      "#username_logged_in .dropdown-contents"
    );
    if (dropdown && !document.getElementById("toggle-ignore-mode-button")) {
      const li = document.createElement("li");
      li.className = "small-icon icon-settings"; // Use a relevant icon class
      const a = document.createElement("a");
      a.id = "toggle-ignore-mode-button";
      a.href = "#";
      a.role = "menuitemcheckbox";
      a.setAttribute("aria-checked", String(ignoreModeActive));
      a.title = `Quick Ignore Mode (${ignoreModeActive ? "ON" : "OFF"})`;
      a.innerHTML = `<i class="icon ${ignoreModeActive ? "fa-toggle-on" : "fa-toggle-off"} fa-fw" aria-hidden="true"></i> <span>Quick Ignore</span>`;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleIgnoreMode();
      });
      li.appendChild(a);

      // Find the Export button li
      const exportButtonLi = document
        .getElementById("show-ignored-export-button")
        ?.closest("li");

      if (exportButtonLi && exportButtonLi.parentNode === dropdown) {
        // Insert after the export button
        exportButtonLi.insertAdjacentElement("afterend", li);
      } else {
        // Fallback: Insert before the last item (usually Logout)
        dropdown.insertBefore(li, dropdown.lastElementChild);
      }
    }
  }

  function updateIgnoreButtons() {
    if (!isThreadListPage() || !ignoreModeActive) return;
    const threadItems = document.querySelectorAll(
      ".topiclist.topics > li, #recent-topics > ul > li, ul.topiclist.topics > li"
    );
    threadItems.forEach((item) => {
      if (!item.parentNode || item.querySelector(".quick-ignore-button"))
        return;
      const threadLink = item.querySelector("a.topictitle");
      if (!threadLink) return;
      // Button should be appended directly to the list item now

      const button = createIgnoreButton();
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idMatch = threadLink.href.match(/[?&]t=(\d+)/);
        const title = threadLink.textContent.trim();
        if (
          idMatch &&
          idMatch[1] &&
          title
          // Removed confirm() check
        ) {
          ignoreThread(idMatch[1], title);
          item.remove(); // Remove the whole list item
        }
      });
      item.appendChild(button); // Append to the list item directly
    });
  }

  function createIgnoreButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quick-ignore-button"; // Rely on external CSS
    button.title = "Quick Ignore";
    button.setAttribute("aria-label", "Quick Ignore Thread");
    button.textContent = "✕";
    button.style.zIndex = "1"; // Set z-index
    return button;
  }

  function ignoreThread(threadId, threadTitle) {
    if (
      !threadId ||
      typeof threadTitle !== "string" ||
      threadTitle.trim() === ""
    )
      return;
    // Read from localStorage for active ignores
    let currentIgnoredThreads = storageGetValue("ignoredThreads", {});
    currentIgnoredThreads[String(threadId)] = threadTitle.trim();
    // Write back to localStorage
    storageSetValue("ignoredThreads", currentIgnoredThreads);
    // No need to update the global ignoredThreads used for export
  }

  function removeIgnoredThreadsOnLoad() {
    if (!isThreadListPage()) return;

    // Get active ignored threads from localStorage for hiding
    const activeIgnoredThreads = storageGetValue("ignoredThreads", {});
    const ignoredIds = Object.keys(activeIgnoredThreads);
    const ignoredTitles = Object.values(activeIgnoredThreads);

    // Handle main thread list items
    const threadItems = document.querySelectorAll(
      ".topiclist.topics > li, #recent-topics > ul > li, ul.topiclist.topics > li"
    );
    threadItems.forEach((item) => {
      const threadLink = item.querySelector("a.topictitle");
      if (threadLink) {
        const idMatch = threadLink.href.match(/[?&]t=(\d+)/);
        // Add class if the thread ID is in the ignored list (from localStorage)
        if (idMatch && idMatch[1] && ignoredIds.includes(idMatch[1])) {
          item.classList.add("thread-ignored");
        }
      }
    });

    // Handle last post links based on title match (from localStorage)
    const lastPosts = document.querySelectorAll("dd.lastpost"); // Target dd elements
    // Note: ignoredTitles is already defined above using localStorage data

    lastPosts.forEach((lastPostContainer) => {
      // Check if it's already marked
      if (lastPostContainer.classList.contains("lastpost-ignored")) return;

      const lastSubjectLink = lastPostContainer.querySelector("a.lastsubject");
      if (lastSubjectLink) {
        const lastSubjectTitle = lastSubjectLink.getAttribute("title")?.trim(); // Get title from link
        if (lastSubjectTitle && ignoredTitles.includes(lastSubjectTitle)) {
          // Mark as ignored and replace content
          lastPostContainer.classList.add("lastpost-ignored");
          lastPostContainer.innerHTML =
            '<span class="lastpost-ignored-text" style="opacity: 0.7;"><dfn>Last post</dfn> <span>(Topic Ignored)</span></span>';
        }
      }
    });
  }

  // --- Early Observer for Instant Removal ---
  const earlyObserver = new MutationObserver((mutations) => {
    // Re-run removal logic on any early changes before DOM is fully loaded
    removeIgnoredThreadsOnLoad();
  });

  // Start observing the document element immediately
  earlyObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // --- Mutation Observer for Dynamic Content ---
  const threadObserver = new MutationObserver((mutations) => {
    let relevantChange = false;
    for (const mutation of mutations) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (
            node.nodeType === Node.ELEMENT_NODE &&
            node.matches(
              ".topiclist.topics > li, #recent-topics > ul > li, ul.topiclist.topics > li"
            )
          ) {
            relevantChange = true;
            break;
          }
        }
      }
      if (relevantChange) break;
    }

    if (relevantChange) {
      if (
        I_Want_To_Devlishly_Ignore_Many_Many_Threads &&
        ignoreModeActive &&
        isThreadListPage()
      ) {
        updateIgnoreButtons();
      }
    }
  });

  // --- Initialization ---
  function initializeScript() {
    // Note: removeIgnoredThreadsOnLoad() is now handled by earlyObserver
    addShowExportButton();
    if (I_Want_To_Devlishly_Ignore_Many_Many_Threads) {
      addToggleIgnoreModeButton(); // Add the toggle button

      if (ignoreModeActive && isThreadListPage()) {
        updateIgnoreButtons(); // Add buttons if mode is initially active
      }
    }

    // Observe for dynamically loaded threads
    const pageBody = document.getElementById("page-body") || document.body;
    if (pageBody) {
      threadObserver.observe(pageBody, { childList: true, subtree: true });
    }

    // Add keydown listener for toggling ignore mode
    document.addEventListener("keydown", function (event) {
      // Check if the pressed key is Backslash (\) and not inside an input/textarea
      // or contentEditable element
      if (
        event.key === "\\" &&
        !/^(input|textarea)$/i.test(event.target.tagName) &&
        event.target.contentEditable !== "true"
      ) {
        event.preventDefault(); // Prevent typing the backslash if needed
        toggleIgnoreMode();
      }
    });
  }

  // Initialize when DOM is ready

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      earlyObserver.disconnect(); // Stop early observer once DOM is ready
      initializeScript();
    });
  } else {
    earlyObserver.disconnect(); // Stop early observer if script loads after DOM is ready
    initializeScript();
  }
})();
