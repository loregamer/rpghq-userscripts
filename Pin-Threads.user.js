// ==UserScript==
// @name         RPGHQ Thread Pinner
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Add pin/unpin buttons to threads on rpghq.org and display pinned threads at the top of the board index
// @match        https://rpghq.org/forums/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  const PINNED_THREADS_KEY = "rpghq_pinned_threads";

  GM_addStyle(`
        #pinned-threads {
            margin-bottom: 20px;
        }
        #pinned-threads .topiclist.topics {
            margin-top: 0;
        }
        .pin-button {
            margin-left: 10px;
            cursor: pointer;
        }
    `);

  function getPinnedThreads() {
    return GM_getValue(PINNED_THREADS_KEY, {});
  }

  function setPinnedThreads(threads) {
    GM_setValue(PINNED_THREADS_KEY, threads);
  }

  function addPinButton() {
    const threadTitle = document.querySelector(".topic-title");
    if (threadTitle) {
      const pinButton = document.createElement("span");
      pinButton.className = "pin-button";
      const threadId = getThreadId();
      const pinnedThreads = getPinnedThreads();
      const isPinned = pinnedThreads.hasOwnProperty(threadId);

      updatePinButtonState(pinButton, isPinned);

      pinButton.addEventListener("click", () =>
        togglePinThread(threadId, pinButton)
      );
      threadTitle.parentNode.insertBefore(pinButton, threadTitle.nextSibling);
    }
  }

  function updatePinButtonState(button, isPinned) {
    button.textContent = isPinned ? "📌 Unpin" : "📌 Pin";
    button.title = isPinned ? "Unpin this thread" : "Pin this thread";
  }

  function togglePinThread(threadId, button) {
    const pinnedThreads = getPinnedThreads();
    const threadTitle = document
      .querySelector(".topic-title")
      .textContent.trim();
    const author = document.querySelector(".author").textContent.trim();
    const postTime = document
      .querySelector(".author time")
      .getAttribute("datetime");

    if (pinnedThreads.hasOwnProperty(threadId)) {
      delete pinnedThreads[threadId];
    } else {
      pinnedThreads[threadId] = {
        title: threadTitle,
        author: author,
        postTime: postTime,
      };
    }

    setPinnedThreads(pinnedThreads);
    updatePinButtonState(button, pinnedThreads.hasOwnProperty(threadId));
  }

  function getThreadId() {
    const match = window.location.href.match(/[?&]t=(\d+)/);
    return match ? match[1] : null;
  }

  function createPinnedThreadsSection() {
    const indexLeft = document.querySelector(".index-left");
    if (!indexLeft) return;

    const pinnedThreads = getPinnedThreads();
    if (Object.keys(pinnedThreads).length === 0) return;

    const pinnedSection = document.createElement("div");
    pinnedSection.id = "pinned-threads";
    pinnedSection.className = "forabg";
    pinnedSection.innerHTML = `
            <div class="inner">
                <ul class="topiclist">
                    <li class="header">
                        <dl class="row-item">
                            <dt><div class="list-inner">Pinned Topics</div></dt>
                            <dd class="posts">Replies</dd>
                            <dd class="views">Views</dd>
                            <dd class="lastpost"><span>Last post</span></dd>
                        </dl>
                    </li>
                </ul>
                <ul class="topiclist topics" id="pinned-threads-list"></ul>
            </div>
        `;

    const pinnedList = pinnedSection.querySelector("#pinned-threads-list");

    Object.entries(pinnedThreads).forEach(([threadId, threadInfo]) => {
      const listItem = document.createElement("li");
      listItem.className = "row bg1";
      listItem.innerHTML = `
                <dl class="row-item topic_read">
                    <dt title="No unread posts">
                        <div class="list-inner">
                            <a href="https://rpghq.org/forums/viewtopic.php?t=${threadId}" class="topictitle">${
        threadInfo.title
      }</a>
                            <br>
                            <div class="topic-poster responsive-hide left-box">
                                by ${threadInfo.author} » <time datetime="${
        threadInfo.postTime
      }">${new Date(threadInfo.postTime).toLocaleString()}</time>
                            </div>
                        </div>
                    </dt>
                    <dd class="posts">-</dd>
                    <dd class="views">-</dd>
                    <dd class="lastpost">
                        <span>
                            <dfn>Last post</dfn> by ${threadInfo.author}
                            <br><time datetime="${
                              threadInfo.postTime
                            }">${new Date(
        threadInfo.postTime
      ).toLocaleString()}</time>
                        </span>
                    </dd>
                </dl>
            `;
      pinnedList.appendChild(listItem);
    });

    indexLeft.insertBefore(pinnedSection, indexLeft.firstChild);
  }

  // Main execution
  if (window.location.href.includes("/viewtopic.php")) {
    addPinButton();
  } else if (
    window.location.href.includes("/index.php") ||
    window.location.href.endsWith("/forums/")
  ) {
    createPinnedThreadsSection();
  }
})();
