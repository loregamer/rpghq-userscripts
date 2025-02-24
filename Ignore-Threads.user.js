// ==UserScript==
// @name         RPGHQ Thread Ignorer
// @namespace    http://tampermonkey.net/
// @version      3.6
// @description  Add ignore/unignore button to threads on rpghq.org and hide ignored threads with an improved review overlay
// @match        https://rpghq.org/forums/*
// @match        https://rpghq.org/forums/memberlist.php*
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

  const I_Want_To_Devlishly_Ignore_Many_Many_Threads = false;

  let ignoredThreads = GM_getValue("ignoredThreads", {});
  let ignoreModeActive = GM_getValue("ignoreModeActive", false);
  let neverIgnoredUsers = GM_getValue("neverIgnoredUsers", {});

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

  function shouldMarkAsRead() {
    const url = window.location.href;
    return (
      url.includes("index.php") ||
      url.includes("viewforum.php") ||
      url.includes("newposts")
    );
  }

  function isThreadListPage() {
    const url = window.location.href;
    return (
      url.includes("index.php") ||
      url.includes("viewforum.php") ||
      url.includes("newposts") ||
      url.includes("search.php")
    );
  }

  function isUnreadThread(element) {
    // Check if any of the element's classes contain "unread"
    const dl = element.querySelector("dl");
    return (
      dl &&
      Array.from(dl.classList).some((className) => className.includes("unread"))
    );
  }

  function isUserNeverIgnored(userId) {
    return neverIgnoredUsers.hasOwnProperty(userId);
  }

  function toggleNeverIgnoreUser(userId, username) {
    if (isUserNeverIgnored(userId)) {
      delete neverIgnoredUsers[userId];
    } else {
      neverIgnoredUsers[userId] = username;
    }
    GM_setValue("neverIgnoredUsers", neverIgnoredUsers);
  }

  function getLastPosterInfo(element) {
    const lastPostLink = element.querySelector('dd.lastpost a[href*="u="]');
    if (!lastPostLink) return null;

    const userIdMatch = lastPostLink.href.match(/[?&]u=(\d+)/);
    if (!userIdMatch) return null;

    return {
      userId: userIdMatch[1],
      username: lastPostLink.textContent.trim(),
    };
  }

  // Pre-hide ignored threads as early as possible
  function hideIgnoredThreadsEarly(mutations) {
    const threadItems = document.querySelectorAll(
      ".topiclist.topics > li, #recent-topics > ul > li, ul.topiclist.topics > li"
    );
    threadItems.forEach((item) => {
      const threadLink = item.querySelector("a.topictitle");
      if (threadLink) {
        const threadTitle = threadLink.textContent.trim();
        const threadIdMatch = threadLink.href.match(/[?&]t=(\d+)/);
        const threadId = threadIdMatch ? threadIdMatch[1] : null;
        const ignoreStatus = isThreadIgnored(threadTitle, threadId);

        // Check if the last poster is never-ignored
        const lastPoster = getLastPosterInfo(item);
        const isLastPosterNeverIgnored =
          lastPoster && isUserNeverIgnored(lastPoster.userId);

        if (ignoreStatus.ignored && !isLastPosterNeverIgnored) {
          // Only mark as read if it's an unread thread and we should mark as read
          if (isUnreadThread(item) && shouldMarkAsRead()) {
            const ids = extractLastPostIds(item);
            if (ids) {
              markRead(ids.topicId, ids.forumId, ids.postId);
            }
          }
          // Remove after potentially marking as read
          item.remove();
        }
      }
    });

    const lastPosts = document.querySelectorAll(".lastpost");
    lastPosts.forEach((lastPost) => {
      const lastPostLink = lastPost.querySelector("a.lastsubject");
      if (lastPostLink) {
        const threadTitle = lastPostLink.getAttribute("title");
        if (threadTitle) {
          // For lastposts, check both title and last poster
          const ignoreStatus = isThreadIgnored(threadTitle);
          const lastPoster = getLastPosterInfo(lastPost.parentElement);
          const isLastPosterNeverIgnored =
            lastPoster && isUserNeverIgnored(lastPoster.userId);

          if (ignoreStatus.ignored && !isLastPosterNeverIgnored) {
            lastPost.remove();
          }
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

      const threadTitle = document
        .querySelector(".topic-title")
        .textContent.trim();
      const ignoreStatus = isThreadIgnored(threadTitle, threadId);
      updateButtonState(ignoreButton, ignoreStatus.exactMatch);

      ignoreButton.addEventListener("click", function (e) {
        e.preventDefault();
        const threadTitle = document
          .querySelector(".topic-title")
          .textContent.trim();
        const currentStatus = isThreadIgnored(threadTitle, threadId);

        if (currentStatus.exactMatch) {
          unignoreThread(threadId);
          updateButtonState(ignoreButton, false);
        } else {
          // If thread is ignored but not exact match (title changed), or not ignored at all
          const action = currentStatus.ignored
            ? "Are you sure you want to update this thread?\n\nYou had it previously ignored, but the title changed.\n\nIt is currently being hidden from your recent topic listings, but you'll have to re-ignore it to fix it appearing in other areas."
            : "Are you sure you want to ignore this thread?";

          if (confirm(action)) {
            ignoreThread(threadId, threadTitle);
            updateButtonState(ignoreButton, true);
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

  function updateButtonState(button, isExactMatch) {
    if (isExactMatch) {
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

  function extractLastPostIds(element) {
    // Find the last post link (the external link icon)
    const lastPostLink = element.querySelector('dd.lastpost a[href*="#p"]');
    if (!lastPostLink) return null;

    // Extract IDs from the href
    const href = lastPostLink.href;
    const forumMatch = href.match(/f=(\d+)/);
    const topicMatch = href.match(/t=(\d+)/);
    const postMatch = href.match(/p=(\d+)/);

    if (!forumMatch || !topicMatch || !postMatch) return null;

    return {
      forumId: forumMatch[1],
      topicId: topicMatch[1].split("-")[0], // Remove any suffix after the ID
      postId: postMatch[1],
    };
  }

  function markRead(topicId, forumId, postId) {
    const markLinks = Array.from(document.querySelectorAll('a[href*="hash="]'));
    const hashLink = markLinks.find((link) => link.href.includes("hash="));

    if (!hashLink) {
      console.error("Could not find any link with hash");
      return;
    }

    const hashMatch = hashLink.href.match(/hash=([a-zA-Z0-9]+)/);
    if (!hashMatch) {
      console.error("Could not find security hash");
      return;
    }

    const hash = hashMatch[1];

    fetch(
      `viewtopic.php?f=${forumId}&t=${topicId}&p=${postId}&mark=topic&hash=${hash}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: `mark=topic&p=${postId}&hash=${hash}`,
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
      })
      .catch((error) => {
        console.error("Error marking as read:", error);
      });
  }

  function markIgnoredThreadsAsRead() {
    if (!shouldMarkAsRead()) return;

    const threadItems = document.querySelectorAll(
      ".topiclist.topics > li, #recent-topics > ul > li, ul.topiclist.topics > li"
    );

    threadItems.forEach((item) => {
      const threadLink = item.querySelector("a.topictitle");
      if (threadLink) {
        const threadTitle = threadLink.textContent.trim();
        const threadIdMatch = threadLink.href.match(/[?&]t=(\d+)/);
        const threadId = threadIdMatch ? threadIdMatch[1] : null;
        const ignoreStatus = isThreadIgnored(threadTitle, threadId);
        const isUnread = isUnreadThread(item);

        if (ignoreStatus.ignored && isUnread) {
          const ids = extractLastPostIds(item);
          if (ids) {
            markRead(ids.topicId, ids.forumId, ids.postId);
          }
        }
      }
    });
  }

  function ignoreThread(threadId, threadTitle) {
    // Fetch the latest data from storage
    let currentIgnoredThreads = GM_getValue("ignoredThreads", {});

    // Add or update the thread in the current list
    currentIgnoredThreads[threadId] = threadTitle;

    // Save the updated list back to storage
    GM_setValue("ignoredThreads", currentIgnoredThreads);

    // Update the local ignoredThreads object
    ignoredThreads = currentIgnoredThreads;

    // Mark the thread as read if we're on a relevant page
    if (shouldMarkAsRead()) {
      const threadItem = document
        .querySelector(`a.topictitle[href*="t=${threadId}"]`)
        ?.closest("li");
      if (threadItem) {
        const ids = extractLastPostIds(threadItem);
        if (ids) {
          markRead(ids.topicId, ids.forumId, ids.postId);
        }
      }
    }
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
    if (!isThreadListPage()) return;

    const threadItems = document.querySelectorAll(
      ".topiclist.topics > li, #recent-topics > ul > li, ul.topiclist.topics > li"
    );
    threadItems.forEach((item) => {
      const threadLink = item.querySelector("a.topictitle");
      if (threadLink) {
        const threadTitle = threadLink.textContent.trim();
        const threadIdMatch = threadLink.href.match(/[?&]t=(\d+)/);
        const threadId = threadIdMatch ? threadIdMatch[1] : null;
        const ignoreStatus = isThreadIgnored(threadTitle, threadId);

        // Check if the last poster is never-ignored
        const lastPoster = getLastPosterInfo(item);
        const isLastPosterNeverIgnored =
          lastPoster && isUserNeverIgnored(lastPoster.userId);

        if (ignoreStatus.ignored && !isLastPosterNeverIgnored) {
          item.remove();
        }
      }
    });

    const lastPosts = document.querySelectorAll(".lastpost");
    lastPosts.forEach((lastPost) => {
      const lastPostLink = lastPost.querySelector("a.lastsubject");
      if (lastPostLink) {
        const threadTitle = lastPostLink.getAttribute("title");
        if (threadTitle) {
          // For lastposts, check both title and last poster
          const ignoreStatus = isThreadIgnored(threadTitle);
          const lastPoster = getLastPosterInfo(lastPost.parentElement);
          const isLastPosterNeverIgnored =
            lastPoster && isUserNeverIgnored(lastPoster.userId);

          if (ignoreStatus.ignored && !isLastPosterNeverIgnored) {
            lastPost.remove();
          }
        }
      }
    });
  }

  function isThreadIgnored(threadTitle, threadId = null) {
    // Check if the thread title matches any ignored thread title
    const titleMatch = Object.values(ignoredThreads).some(
      (ignoredTitle) => ignoredTitle.toLowerCase() === threadTitle.toLowerCase()
    );

    // Check if the thread ID matches any ignored thread ID
    const idMatch = threadId && Object.keys(ignoredThreads).includes(threadId);

    // For exact match checking, we need to verify the specific title matches the specific ID
    const exactMatch =
      threadId &&
      ignoredThreads[threadId]?.toLowerCase() === threadTitle.toLowerCase();

    return {
      ignored: titleMatch || idMatch,
      exactMatch: exactMatch,
    };
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
    if (ignoreModeActive) {
      updateIgnoreButtons();
    } else {
      // Remove all quick ignore buttons when turning off quick ignore mode
      document
        .querySelectorAll(".quick-ignore-button")
        .forEach((button) => button.remove());
    }
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
      toggleButton.title = "Toggle Quick Ignore Mode";
      toggleButton.role = "menuitem";
      toggleButton.innerHTML = `
        <i class="icon ${
          ignoreModeActive ? "fa-toggle-on" : "fa-toggle-off"
        } fa-fw" aria-hidden="true"></i>
        <span>Quick Ignore Mode</span>
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
    if (!isThreadListPage() || !ignoreModeActive) return;

    const threadItems = document.querySelectorAll(
      ".topiclist.topics > li, #recent-topics > ul > li, ul.topiclist.topics > li"
    );
    threadItems.forEach((item) => {
      const existingButton = item.querySelector(".quick-ignore-button");
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
            item.remove();
          }
        });
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
    const isMobile = window.innerWidth <= 700;
    const exportData = JSON.stringify(ignoredThreads, null, 2); // Pretty print JSON with 2 spaces

    if (isMobile) {
      // On mobile, copy JSON directly to clipboard
      navigator.clipboard
        .writeText(exportData)
        .then(() => {
          alert("Ignored threads data copied to clipboard!");
        })
        .catch((err) => {
          // Fallback for browsers that don't support clipboard API
          const textarea = document.createElement("textarea");
          textarea.value = exportData;
          document.body.appendChild(textarea);
          textarea.select();
          try {
            document.execCommand("copy");
            alert("Ignored threads data copied to clipboard!");
          } catch (e) {
            alert(
              "Failed to copy to clipboard. Your browser may not support this feature."
            );
          }
          document.body.removeChild(textarea);
        });
    } else {
      // On desktop, download JSON file
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
          const currentIgnoredThreads = GM_getValue("ignoredThreads", {});

          // Only add threads that don't exist in current ignored threads
          const newThreads = Object.entries(importedData).reduce(
            (acc, [key, value]) => {
              if (!currentIgnoredThreads.hasOwnProperty(key)) {
                acc[key] = value;
              }
              return acc;
            },
            {}
          );

          // Merge current threads with new ones
          const mergedThreads = { ...currentIgnoredThreads, ...newThreads };

          // Sort the merged threads by title
          const sortedThreads = Object.fromEntries(
            Object.entries(mergedThreads).sort(([, a], [, b]) =>
              a.localeCompare(b)
            )
          );

          ignoredThreads = sortedThreads;
          GM_setValue("ignoredThreads", ignoredThreads);

          const newThreadsCount = Object.keys(newThreads).length;
          const skippedCount =
            Object.keys(importedData).length - newThreadsCount;

          alert(
            `Import successful:\n${newThreadsCount} new threads added\n${skippedCount} duplicate threads skipped\nRefreshing page to apply changes.`
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

    // Header with title and close button
    const header = document.createElement("div");
    header.style.cssText = `
      padding: 10px;
      background-color: #2a2e36;
      border-bottom: 1px solid #3a3f4b;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    const title = document.createElement("h2");
    title.textContent = "Ignored Threads";
    title.style.cssText = "margin: 0; color: #c5d0db; font-size: 1.2em;";
    const closeButton = document.createElement("button");
    closeButton.textContent = "×";
    closeButton.style.cssText = `
      background-color: transparent;
      color: #c5d0db;
      border: none;
      font-size: 1.5em;
      cursor: pointer;
    `;
    closeButton.onclick = () => document.body.removeChild(popup);
    header.appendChild(title);
    header.appendChild(closeButton);

    // Statistics section (Ignored count and percentage)
    const statsSection = document.createElement("div");
    statsSection.id = "ignored-threads-stats";
    statsSection.style.cssText = `
      padding: 10px;
      background-color: #3a3f4b;
      color: #c5d0db;
      font-size: 0.9em;
    `;
    const updateStats = () => {
      const ignoredCount = Object.keys(ignoredThreads).length;
      const totalTopics = GM_getValue("totalTopics", 0);
      const percentage =
        totalTopics > 0
          ? ((ignoredCount / totalTopics) * 100).toFixed(2)
          : "N/A";
      statsSection.innerHTML = `<strong>Ignored Threads:</strong> ${ignoredCount} / ${totalTopics} &nbsp; | &nbsp; <strong>Percentage:</strong> ${percentage}%`;
    };
    updateStats();

    // Controls section for search
    const controlsSection = document.createElement("div");
    controlsSection.style.cssText = `
      padding: 10px;
      background-color: #2a2e36;
      border-bottom: 1px solid #3a3f4b;
      display: flex;
      align-items: center;
    `;
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Search ignored threads...";
    searchInput.style.cssText = `
      flex-grow: 1;
      padding: 5px;
      margin-right: 10px;
      border: 1px solid #3a3f4b;
      border-radius: 3px;
      background-color: #4a5464;
      color: #c5d0db;
    `;
    controlsSection.appendChild(searchInput);

    const clearSearchButton = document.createElement("button");
    clearSearchButton.textContent = "Clear";
    clearSearchButton.style.cssText = `
      padding: 5px 10px;
      background-color: #4a5464;
      color: #c5d0db;
      border: none;
      border-radius: 3px;
      cursor: pointer;
    `;
    clearSearchButton.onclick = () => {
      searchInput.value = "";
      renderThreadList("");
    };
    controlsSection.appendChild(clearSearchButton);

    // Content area for the thread list
    const content = document.createElement("div");
    content.style.cssText = `
      padding: 10px;
      overflow-y: auto;
      flex-grow: 1;
      background-color: #2a2e36;
    `;
    const threadList = document.createElement("ul");
    threadList.style.cssText = `
      list-style-type: none;
      padding: 0;
      margin: 0;
    `;
    content.appendChild(threadList);

    // Function to render (and filter) the thread list
    function renderThreadList(filter = "") {
      threadList.innerHTML = "";
      const sortedThreads = Object.entries(ignoredThreads).sort((a, b) =>
        a[1].localeCompare(b[1])
      );
      let anyVisible = false;
      for (const [threadId, threadTitle] of sortedThreads) {
        if (
          filter &&
          !threadTitle.toLowerCase().includes(filter.toLowerCase())
        ) {
          continue;
        }
        anyVisible = true;
        const listItem = document.createElement("li");
        listItem.style.cssText = `
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          padding: 5px;
          border-bottom: 1px solid #3a3f4b;
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
          renderThreadList(searchInput.value);
          updateStats();
        };
        const threadLink = document.createElement("a");
        threadLink.href = `https://rpghq.org/forums/viewtopic.php?t=${threadId}`;
        threadLink.textContent = threadTitle;
        threadLink.style.cssText =
          "color: #4a90e2; text-decoration: none; flex-grow: 1;";
        listItem.appendChild(unignoreButton);
        listItem.appendChild(threadLink);
        threadList.appendChild(listItem);
      }
      if (!anyVisible) {
        threadList.innerHTML =
          '<p style="color: #c5d0db;">No threads match your search criteria.</p>';
      }
    }
    renderThreadList();

    // Bottom controls with buttons
    const bottomControls = document.createElement("div");
    bottomControls.style.cssText = `
      padding: 10px;
      background-color: #2a2e36;
      border-top: 1px solid #3a3f4b;
      text-align: center;
      display: flex;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
    `;

    // Mass Unignore button
    const massUnignoreButton = document.createElement("button");
    massUnignoreButton.innerHTML =
      '<i class="icon fa-trash fa-fw" aria-hidden="true"></i> Unignore All';
    massUnignoreButton.style.cssText = `
      background-color: #4a5464;
      color: #c5d0db;
      border: none;
      padding: 5px 10px;
      border-radius: 3px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
    `;
    massUnignoreButton.onclick = () => {
      if (confirm("Are you sure you want to unignore all threads?")) {
        ignoredThreads = {};
        GM_setValue("ignoredThreads", ignoredThreads);
        renderThreadList(searchInput.value);
        updateStats();
        alert("All threads have been unignored.");
        window.location.reload();
      }
    };

    // Export uBlock button
    const exportUblockButton = document.createElement("button");
    exportUblockButton.innerHTML =
      '<i class="icon fa-shield fa-fw" aria-hidden="true"></i> Export uBlock';
    exportUblockButton.style.cssText = massUnignoreButton.style.cssText;
    exportUblockButton.onclick = () => {
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
    };

    // Export JSON button
    const exportJsonButton = document.createElement("button");
    exportJsonButton.innerHTML =
      '<i class="icon fa-download fa-fw" aria-hidden="true"></i> Export JSON';
    exportJsonButton.style.cssText = massUnignoreButton.style.cssText;
    exportJsonButton.onclick = () => {
      const isMobile = window.innerWidth <= 700;
      const exportData = JSON.stringify(ignoredThreads, null, 2); // Pretty print JSON with 2 spaces

      if (isMobile) {
        // On mobile, copy JSON directly to clipboard
        navigator.clipboard
          .writeText(exportData)
          .then(() => {
            alert("Ignored threads data copied to clipboard!");
          })
          .catch((err) => {
            // Fallback for browsers that don't support clipboard API
            const textarea = document.createElement("textarea");
            textarea.value = exportData;
            document.body.appendChild(textarea);
            textarea.select();
            try {
              document.execCommand("copy");
              alert("Ignored threads data copied to clipboard!");
            } catch (e) {
              alert(
                "Failed to copy to clipboard. Your browser may not support this feature."
              );
            }
            document.body.removeChild(textarea);
          });
      } else {
        // On desktop, download JSON file
        const jsonBlob = new Blob([exportData], { type: "application/json" });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonLink = document.createElement("a");
        jsonLink.href = jsonUrl;
        jsonLink.download = "ignored_threads.json";
        document.body.appendChild(jsonLink);
        jsonLink.click();
        document.body.removeChild(jsonLink);
        URL.revokeObjectURL(jsonUrl);
      }
    };

    // Import JSON button
    const importButton = document.createElement("button");
    importButton.innerHTML =
      '<i class="icon fa-upload fa-fw" aria-hidden="true"></i> Import JSON';
    importButton.style.cssText = massUnignoreButton.style.cssText;
    importButton.onclick = () => {
      importIgnoredThreads();
    };

    bottomControls.appendChild(massUnignoreButton);
    bottomControls.appendChild(exportUblockButton);
    bottomControls.appendChild(exportJsonButton);
    bottomControls.appendChild(importButton);

    // Assemble the popup
    popup.appendChild(header);
    popup.appendChild(statsSection);
    popup.appendChild(controlsSection);
    popup.appendChild(content);
    popup.appendChild(bottomControls);
    document.body.appendChild(popup);

    // Update thread list on search input
    searchInput.addEventListener("input", () => {
      renderThreadList(searchInput.value);
    });
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
      showButton.title = "Ignored Threads";
      showButton.role = "menuitem";
      showButton.innerHTML =
        '<i class="icon fa-eye fa-fw" aria-hidden="true"></i><span>Ignored Threads</span>';

      showButton.addEventListener("click", function (e) {
        e.preventDefault();
        showIgnoredThreadsPopup();
      });

      listItem.appendChild(showButton);
      dropdown.insertBefore(listItem, dropdown.lastElementChild);
    }
  }

  // NEW: When on the board index, update and store total topics count
  function updateTotalTopicsCount() {
    const statsBlock = document.querySelector("div.stat-block.statistics");
    if (statsBlock) {
      // Attempt to find the "Total topics" value using a regex
      const match = statsBlock.innerHTML.match(
        /Total topics\s*<strong>([\d,]+)<\/strong>/i
      );
      if (match && match[1]) {
        const topicsCount = parseInt(match[1].replace(/,/g, ""), 10);
        if (!isNaN(topicsCount)) {
          GM_setValue("totalTopics", topicsCount);
        }
      }
    }
  }

  function addNeverIgnoreButton() {
    if (!window.location.href.includes("memberlist.php")) return;

    const titleElement = document.querySelector(".memberlist-title");
    if (!titleElement) return;

    // Extract user ID and username from the URL/title
    const userIdMatch = window.location.href.match(/[?&]u=(\d+)/);
    if (!userIdMatch) return;
    const userId = userIdMatch[1];
    const username = titleElement.textContent.match(
      /Viewing profile - (.+?)(?:\s*<|$)/
    )?.[1];
    if (!username) return;

    // Create button container if it doesn't exist
    let buttonContainer = titleElement.querySelector("div");
    if (!buttonContainer) {
      buttonContainer = document.createElement("div");
      buttonContainer.style.cssText =
        "display: inline-block; margin-left: 10px;";
      titleElement.appendChild(buttonContainer);
    }

    // Create the Never Ignore button
    const neverIgnoreButton = document.createElement("a");
    neverIgnoreButton.id = "never-ignore-user-button";
    neverIgnoreButton.className = "button button-secondary";
    neverIgnoreButton.href = "#";
    neverIgnoreButton.title = isUserNeverIgnored(userId)
      ? "Remove from Never Ignore list"
      : "Never hide threads that this user posted in";
    neverIgnoreButton.textContent = isUserNeverIgnored(userId)
      ? "Remove Never Ignore"
      : "Never Ignore";

    neverIgnoreButton.addEventListener("click", function (e) {
      e.preventDefault();
      toggleNeverIgnoreUser(userId, username);
      this.title = isUserNeverIgnored(userId)
        ? "Remove from Never Ignore list"
        : "Never hide threads that this user posted in";
      this.textContent = isUserNeverIgnored(userId)
        ? "Remove Never Ignore"
        : "Never Ignore";
    });

    buttonContainer.appendChild(neverIgnoreButton);
  }

  function showNeverIgnoredUsersPopup() {
    // Create popup container
    const popup = document.createElement("div");
    popup.id = "never-ignored-users-popup";
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

    // Header with title and close button
    const header = document.createElement("div");
    header.style.cssText = `
      padding: 10px;
      background-color: #2a2e36;
      border-bottom: 1px solid #3a3f4b;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    const title = document.createElement("h2");
    title.textContent = "Never Ignored Users";
    title.style.cssText = "margin: 0; color: #c5d0db; font-size: 1.2em;";
    const closeButton = document.createElement("button");
    closeButton.textContent = "×";
    closeButton.style.cssText = `
      background-color: transparent;
      color: #c5d0db;
      border: none;
      font-size: 1.5em;
      cursor: pointer;
    `;
    closeButton.onclick = () => document.body.removeChild(popup);
    header.appendChild(title);
    header.appendChild(closeButton);

    // Content area for the user list
    const content = document.createElement("div");
    content.style.cssText = `
      padding: 10px;
      overflow-y: auto;
      flex-grow: 1;
      background-color: #2a2e36;
    `;
    const userList = document.createElement("ul");
    userList.style.cssText = `
      list-style-type: none;
      padding: 0;
      margin: 0;
    `;

    // Render user list
    Object.entries(neverIgnoredUsers)
      .sort((a, b) => a[1].localeCompare(b[1]))
      .forEach(([userId, username]) => {
        const listItem = document.createElement("li");
        listItem.style.cssText = `
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        padding: 5px;
        border-bottom: 1px solid #3a3f4b;
      `;

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.style.cssText = `
        background-color: #4a5464;
        color: #c5d0db;
        border: none;
        padding: 2px 5px;
        border-radius: 3px;
        cursor: pointer;
        margin-right: 10px;
        font-size: 0.8em;
      `;
        removeButton.onclick = () => {
          toggleNeverIgnoreUser(userId);
          listItem.remove();
          if (userList.children.length === 0) {
            userList.innerHTML =
              '<p style="color: #c5d0db;">No users in the Never Ignore list.</p>';
          }
        };

        const userLink = document.createElement("a");
        userLink.href = `https://rpghq.org/forums/memberlist.php?mode=viewprofile&u=${userId}`;
        userLink.textContent = username;
        userLink.style.cssText =
          "color: #4a90e2; text-decoration: none; flex-grow: 1;";

        listItem.appendChild(removeButton);
        listItem.appendChild(userLink);
        userList.appendChild(listItem);
      });

    if (Object.keys(neverIgnoredUsers).length === 0) {
      userList.innerHTML =
        '<p style="color: #c5d0db;">No users in the Never Ignore list.</p>';
    }

    content.appendChild(userList);

    // Assemble the popup
    popup.appendChild(header);
    popup.appendChild(content);
    document.body.appendChild(popup);
  }

  function addShowNeverIgnoredUsersButton() {
    const dropdown = document.querySelector(
      "#username_logged_in .dropdown-contents"
    );
    if (
      dropdown &&
      !document.getElementById("show-never-ignored-users-button")
    ) {
      const listItem = document.createElement("li");
      const showButton = document.createElement("a");
      showButton.id = "show-never-ignored-users-button";
      showButton.href = "#";
      showButton.title = "Never Ignored Users";
      showButton.role = "menuitem";
      showButton.innerHTML =
        '<i class="icon fa-user-shield fa-fw" aria-hidden="true"></i><span>Never Ignored Users</span>';

      showButton.addEventListener("click", function (e) {
        e.preventDefault();
        showNeverIgnoredUsersPopup();
      });

      listItem.appendChild(showButton);
      dropdown.insertBefore(listItem, dropdown.lastElementChild);
    }
  }

  function initializeScript() {
    hideIgnoredThreads();
    addIgnoreButton();
    addShowIgnoredThreadsButton();
    addShowNeverIgnoredUsersButton();
    addNeverIgnoreButton();
    if (I_Want_To_Devlishly_Ignore_Many_Many_Threads) {
      addToggleIgnoreModeButton();
      if (ignoreModeActive) {
        updateIgnoreButtons();
      }
    }
    // If the board index statistics are available, update the total topics count.
    updateTotalTopicsCount();

    // Mark ignored threads as read on relevant pages
    if (shouldMarkAsRead()) {
      markIgnoredThreadsAsRead();
    }

    // Set up the mutation observer once the body exists
    if (document.body) {
      threadObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  }

  // Add mutation observer to detect new thread items (for quick ignore mode)
  const threadObserver = new MutationObserver((mutations) => {
    if (ignoreModeActive) {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node is a thread item or contains thread items
            const threadItems = node.matches(
              ".topiclist.topics > li, #recent-topics > ul > li, ul.topiclist.topics > li"
            )
              ? [node]
              : node.querySelectorAll(
                  ".topiclist.topics > li, #recent-topics > ul > li, ul.topiclist.topics > li"
                );

            if (threadItems.length > 0) {
              updateIgnoreButtons();
            }
          }
        });
      });
    }
  });

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeScript);
  } else {
    initializeScript();
  }
})();
