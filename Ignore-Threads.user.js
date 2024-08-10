// ==UserScript==
// @name         RPG HQ Thread Ignorer
// @namespace    http://tampermonkey.net/
// @version      2.1
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
        const threadTitle = lastPostLink.textContent.trim();
        if (isThreadIgnored(threadTitle)) {
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

  function initializeScript() {
    addIgnoreButton();
    hideIgnoredThreads();
    addUnignoreAllButton();
  }

  // Try to run immediately
  initializeScript();

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
})();
