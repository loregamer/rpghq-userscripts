// ==UserScript==
// @name         RPGHQ Thread Pinner
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Add pin/unpin buttons to threads on rpghq.org and display pinned threads at the top of the board index
// @match        https://rpghq.org/forums/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      rpghq.org
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
        #pinned-threads .topic-poster .by {
            display: none;
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

  function fetchThreadTitle(threadId) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "GET",
        url: `https://rpghq.org/forums/viewtopic.php?t=${threadId}`,
        onload: function (response) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(
            response.responseText,
            "text/html"
          );
          const titleElement = doc.querySelector("h2.topic-title a");
          if (titleElement) {
            resolve(titleElement.textContent.trim());
          } else {
            reject("Thread title not found");
          }
        },
        onerror: function (error) {
          reject(error);
        },
      });
    });
  }

  async function createPinnedThreadsSection() {
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
                        </dl>
                    </li>
                </ul>
                <ul class="topiclist topics" id="pinned-threads-list"></ul>
            </div>
        `;

    const pinnedList = pinnedSection.querySelector("#pinned-threads-list");

    for (const [threadId, threadInfo] of Object.entries(pinnedThreads)) {
      try {
        const threadTitle = await fetchThreadTitle(threadId);
        const listItem = document.createElement("li");
        listItem.className = "row bg1";
        listItem.innerHTML = `
                    <dl class="row-item topic_read">
                        <dt title="No unread posts">
                            <div class="list-inner">
                                <a href="https://rpghq.org/forums/viewtopic.php?t=${threadId}&view=unread#unread" class="topictitle">${threadTitle}</a>
                                <br>
                                <div class="topic-poster responsive-hide left-box">
                                    <span class="by">${
                                      threadInfo.author || "Unknown"
                                    }</span>
                                </div>
                            </div>
                        </dt>
                    </dl>
                `;
        pinnedList.appendChild(listItem);
      } catch (error) {
        console.error(
          `Error fetching thread title for thread ${threadId}:`,
          error
        );
      }
    }

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
