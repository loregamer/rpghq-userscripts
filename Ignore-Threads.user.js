// ==UserScript==
// @name         RPGHQ Ignored Thread Exporter
// @namespace    http://tampermonkey.net/
// @version      4.0.0
// @description  Export previously ignored threads from the old RPGHQ Thread Ignorer userscript.
// @match        https://rpghq.org/forums/*
// @grant        GM_getValue
// @license      MIT
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

  let ignoredThreads = GM_getValue("ignoredThreads", {});

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
        threadList.innerHTML = '<p>No previously ignored threads found.</p>';
    }

    const bottomControls = document.createElement("div");
    bottomControls.style.cssText = `padding: 10px; background-color: #2a2e36; border-top: 1px solid #3a3f4b; text-align: center;`;
    const exportJsonButton = document.createElement("button");
    exportJsonButton.innerHTML = '<i class="icon fa-download fa-fw" aria-hidden="true"></i> Export as JSON';
    exportJsonButton.style.cssText = `background-color: #4a5464; color: #c5d0db; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;`;
    exportJsonButton.onclick = exportIgnoredThreadsJson;
    bottomControls.appendChild(exportJsonButton);

    popup.appendChild(header);
    popup.appendChild(content);
    popup.appendChild(bottomControls);
    document.body.appendChild(popup);
  }

  function addShowExportButton() {
    const dropdown = document.querySelector("#username_logged_in .dropdown-contents");
    if (dropdown && !document.getElementById("show-ignored-export-button")) {
      const listItem = document.createElement("li");
      const showButton = document.createElement("a");
      showButton.id = "show-ignored-export-button";
      showButton.href = "#";
      showButton.title = "Export Ignored Threads";
      showButton.role = "menuitem";
      showButton.innerHTML = '<i class="icon fa-download fa-fw" aria-hidden="true"></i><span>Export Ignored Threads</span>';
      showButton.addEventListener("click", function (e) {
        e.preventDefault();
        showIgnoredThreadsPopup();
      });
      listItem.appendChild(showButton);

      // Find the "Never Iggy Users" button/list item
      const neverIggyUsersButton = document.getElementById("show-never-ignored-users-button");
      const neverIggyListItem = neverIggyUsersButton ? neverIggyUsersButton.closest('li') : null;

      // Add indentation
      listItem.style.paddingLeft = "15px";

      if (neverIggyListItem && neverIggyListItem.parentNode === dropdown) {
        // Insert after "Never Iggy Users" if found
        neverIggyListItem.insertAdjacentElement('afterend', listItem);
      } else {
        // Fallback: Insert before the last item (usually Logout)
        dropdown.insertBefore(listItem, dropdown.lastElementChild);
      }
    }
  }

  function initializeScript() {
    addShowExportButton();
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeScript);
  } else {
    initializeScript();
  }
})();
