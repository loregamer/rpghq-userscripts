// ==UserScript==
// @name         RPG HQ Thread Ignorer
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Add ignore/unignore button to threads on rpghq.org and hide ignored threads
// @match        https://rpghq.org/forums/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

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
    ignoredThreads[threadId] = threadTitle;
    GM_setValue("ignoredThreads", ignoredThreads);
  }

  function unignoreThread(threadId) {
    if (ignoredThreads.hasOwnProperty(threadId)) {
      delete ignoredThreads[threadId];
      GM_setValue("ignoredThreads", ignoredThreads);
    }
  }

  function hideIgnoredThreads() {
    const threadItems = document.querySelectorAll(
      ".topiclist.topics > li, #recent-topics .row-item"
    );
    threadItems.forEach((item) => {
      const threadLink = item.querySelector("a.topictitle");
      if (threadLink) {
        const threadId = threadLink.href.match(/[?&]t=(\d+)/)[1];
        if (ignoredThreads.hasOwnProperty(threadId)) {
          item.style.display = "none";
        } else {
          item.style.display = "";
        }
      }
    });
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

  window.addEventListener("load", function () {
    addIgnoreButton();
    hideIgnoredThreads();
    addUnignoreAllButton();
  });

  // Register menu commands
  GM_registerMenuCommand("Show Ignored Threads", showIgnoredThreads);
})();
