// ==UserScript==
// @name         RPG HQ Thread Ignorer
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  Add ignore/unignore button to threads on rpghq.org and hide ignored threads
// @match        https://rpghq.org/forums/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
  "use strict";

  const ignoredThreads = GM_getValue("ignoredThreads", {});

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
    hideIgnoredThreads();
  }

  function unignoreThread(threadId) {
    if (ignoredThreads.hasOwnProperty(threadId)) {
      delete ignoredThreads[threadId];
      GM_setValue("ignoredThreads", ignoredThreads);
      hideIgnoredThreads();
    }
  }

  function hideIgnoredThreads() {
    const threadItems = document.querySelectorAll(
      ".topiclist.topics > li, #recent-topics .row-item"
    );
    threadItems.forEach((item) => {
      const threadLink = item.querySelector("a.topictitle");
      if (threadLink) {
        const threadId = threadLink.href.split("t=")[1].split("&")[0];
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

  // Register menu commands
  GM_registerMenuCommand("Show Ignored Threads", showIgnoredThreads);

  window.addEventListener("load", function () {
    addIgnoreButton();
    hideIgnoredThreads();
  });
})();
