// ==UserScript==
// @name         RPG HQ Thread Ignorer
// @namespace    http://tampermonkey.net/
// @version      0.7
// @description  Add ignore button to threads on rpghq.org and hide ignored threads
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
    if (actionBar && !document.getElementById("ignore-thread-button")) {
      const ignoreButton = document.createElement("a");
      ignoreButton.id = "ignore-thread-button";
      ignoreButton.className = "button button-secondary";
      ignoreButton.innerHTML =
        '<span>Ignore Thread</span> <i class="icon fa-ban fa-fw" aria-hidden="true"></i>';
      ignoreButton.title = "Ignore Thread";
      ignoreButton.style.marginLeft = "5px";

      ignoreButton.addEventListener("click", function (e) {
        e.preventDefault();
        const threadId = getThreadId();
        const threadTitle = document
          .querySelector(".topic-title")
          .textContent.trim();
        if (
          threadId &&
          confirm("Are you sure you want to ignore this thread?")
        ) {
          ignoreThread(threadId, threadTitle);
          window.location.href = "https://rpghq.org/forums/";
        }
      });

      actionBar.appendChild(ignoreButton);
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

  function unignoreThread() {
    const threadId = prompt("Enter the thread ID you want to un-ignore:");
    if (threadId) {
      if (ignoredThreads.hasOwnProperty(threadId)) {
        delete ignoredThreads[threadId];
        GM_setValue("ignoredThreads", ignoredThreads);
        alert("Thread un-ignored. Refresh the page to see the changes.");
      } else {
        alert("This thread is not in your ignore list.");
      }
    }
  }

  // Register menu commands
  GM_registerMenuCommand("Show Ignored Threads", showIgnoredThreads);
  GM_registerMenuCommand("Un-ignore Thread", unignoreThread);

  // Run functions
  addIgnoreButton();
  hideIgnoredThreads();

  // Re-run functions periodically in case of dynamic content loading
  setInterval(addIgnoreButton, 5000);
  setInterval(hideIgnoredThreads, 5000);
})();
