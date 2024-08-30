// ==UserScript==
// @name         RPGHQ Thread Pinner
// @namespace    http://tampermonkey.net/
// @version      1.0
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
        .pin-button {
            margin-left: 5px;
            cursor: pointer;
        }
        #pinned-threads {
            margin-bottom: 10px;
        }
        #pinned-threads .header {
            background-color: #4a5a73;
            color: #fff;
            padding: 5px 10px;
        }
        #pinned-threads ul {
            list-style-type: none;
            padding: 0;
            margin: 0;
        }
        #pinned-threads li {
            padding: 5px 10px;
            border-bottom: 1px solid #ddd;
        }
    `);

  function getPinnedThreads() {
    return GM_getValue(PINNED_THREADS_KEY, []);
  }

  function setPinnedThreads(threads) {
    GM_setValue(PINNED_THREADS_KEY, threads);
  }

  function addPinButton(threadRow) {
    const titleElement = threadRow.querySelector(".topictitle");
    if (!titleElement) return;

    const threadId = titleElement.href.match(/t=(\d+)/)[1];
    const isPinned = getPinnedThreads().includes(threadId);

    const pinButton = document.createElement("span");
    pinButton.className = "pin-button";
    pinButton.textContent = isPinned ? "📌 Unpin" : "📌 Pin";
    pinButton.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      togglePinThread(threadId);
      pinButton.textContent = isPinned ? "📌 Pin" : "📌 Unpin";
    };

    titleElement.parentNode.insertBefore(pinButton, titleElement.nextSibling);
  }

  function togglePinThread(threadId) {
    const pinnedThreads = getPinnedThreads();
    const index = pinnedThreads.indexOf(threadId);

    if (index === -1) {
      pinnedThreads.push(threadId);
    } else {
      pinnedThreads.splice(index, 1);
    }

    setPinnedThreads(pinnedThreads);
    if (window.location.href.includes("/index.php")) {
      location.reload();
    }
  }

  function createPinnedThreadsSection() {
    const pinnedThreads = getPinnedThreads();
    if (pinnedThreads.length === 0) return;

    const indexLeft = document.querySelector(".index-left");
    if (!indexLeft) return;

    const pinnedSection = document.createElement("div");
    pinnedSection.id = "pinned-threads";
    pinnedSection.innerHTML = `
            <div class="forabg">
                <div class="inner">
                    <ul class="topiclist">
                        <li class="header">
                            <dl class="row-item">
                                <dt><div class="list-inner">Pinned Threads</div></dt>
                                <dd class="lastpost"><span>Last post</span></dd>
                            </dl>
                        </li>
                    </ul>
                    <ul class="topiclist forums" id="pinned-threads-list"></ul>
                </div>
            </div>
        `;

    indexLeft.insertBefore(pinnedSection, indexLeft.firstChild);

    const pinnedList = document.getElementById("pinned-threads-list");
    pinnedThreads.forEach((threadId) => fetchThreadInfo(threadId, pinnedList));
  }

  function fetchThreadInfo(threadId, pinnedList) {
    fetch(`https://rpghq.org/forums/viewtopic.php?t=${threadId}`)
      .then((response) => response.text())
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const title = doc.querySelector(".topic-title").textContent.trim();
        const lastPost = doc.querySelector(".author").innerHTML;
        addPinnedThread(threadId, title, lastPost, pinnedList);
      });
  }

  function addPinnedThread(threadId, title, lastPost, pinnedList) {
    const listItem = document.createElement("li");
    listItem.className = "row";
    listItem.innerHTML = `
            <dl class="row-item forum_read">
                <dt title="No unread posts">
                    <div class="list-inner">
                        <a href="https://rpghq.org/forums/viewtopic.php?t=${threadId}" class="forumtitle">${title}</a>
                    </div>
                </dt>
                <dd class="lastpost">
                    <span>
                        <dfn>Last post</dfn>
                        ${lastPost}
                    </span>
                </dd>
            </dl>
        `;
    pinnedList.appendChild(listItem);
  }

  // Main execution
  if (window.location.href.includes("/viewtopic.php")) {
    const threadRow = document.querySelector(".topic-title").closest("li");
    addPinButton(threadRow);
  } else if (
    window.location.href.includes("/index.php") ||
    window.location.href.endsWith("/forums/")
  ) {
    createPinnedThreadsSection();
    document.querySelectorAll(".topiclist.topics .row").forEach(addPinButton);
  }
})();
