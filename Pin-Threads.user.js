// ==UserScript==
// @name         RPGHQ Thread Pinner
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Add pin/unpin buttons to threads on rpghq.org and display pinned threads at the top of the board index
// @match        https://rpghq.org/forums/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      rpghq.org
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/main/Pin-Threads.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/main/Pin-Threads.user.js
// @license      MIT
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

  const PINNED_THREADS_KEY = "rpghq_pinned_threads";
  const ZOMBOID_THREAD_ID = "2756";

  // Utility functions
  const util = {
    getPinnedThreads: () => GM_getValue(PINNED_THREADS_KEY, {}),
    setPinnedThreads: (threads) => GM_setValue(PINNED_THREADS_KEY, threads),
    getThreadId: () => {
      const match = window.location.href.match(/[?&]t=(\d+)/);
      return match ? match[1] : null;
    },
    addStyle: (css) => GM_addStyle(css),
    fetchHtml: (url) => {
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: "GET",
          url: url,
          onload: (response) => resolve(response.responseText),
          onerror: (error) => reject(error),
        });
      });
    },
    parseHtml: (html) => new DOMParser().parseFromString(html, "text/html"),
  };

  // Main functions
  function addPinButton() {
    const actionBar = document.querySelector(".action-bar.bar-top");
    const threadId = util.getThreadId();
    if (
      actionBar &&
      threadId &&
      !document.getElementById("pin-thread-button")
    ) {
      const dropdownContainer = createDropdownContainer();
      const pinButton = createPinButton(threadId);
      dropdownContainer.appendChild(pinButton);
      actionBar.insertBefore(dropdownContainer, actionBar.firstChild);
      addResponsiveStyle();
    }
  }

  function createDropdownContainer() {
    const container = document.createElement("div");
    container.className =
      "dropdown-container dropdown-button-control topic-tools";
    return container;
  }

  function createPinButton(threadId) {
    const button = document.createElement("span");
    button.id = "pin-thread-button";
    button.className = "button button-secondary dropdown-trigger";

    const pinnedThreads = util.getPinnedThreads();
    const isPinned = pinnedThreads.hasOwnProperty(threadId);
    updatePinButtonState(button, isPinned);

    button.addEventListener("click", (e) => {
      e.preventDefault();
      togglePinThread(threadId, button);
    });

    return button;
  }

  function updatePinButtonState(button, isPinned) {
    button.innerHTML = isPinned
      ? '<i class="icon fa-thumb-tack fa-fw" aria-hidden="true"></i><span>Unpin</span>'
      : '<i class="icon fa-thumb-tack fa-fw" aria-hidden="true"></i><span>Pin</span>';
    button.title = isPinned ? "Unpin" : "Pin";
  }

  function togglePinThread(threadId, button) {
    const pinnedThreads = util.getPinnedThreads();
    const threadInfo = getThreadInfo();

    if (pinnedThreads.hasOwnProperty(threadId)) {
      delete pinnedThreads[threadId];
    } else {
      pinnedThreads[threadId] = threadInfo;
    }

    util.setPinnedThreads(pinnedThreads);
    updatePinButtonState(button, pinnedThreads.hasOwnProperty(threadId));
  }

  function getThreadInfo() {
    return {
      title: document.querySelector(".topic-title").textContent.trim(),
      author: document.querySelector(".author").textContent.trim(),
      postTime: document.querySelector(".author time").getAttribute("datetime"),
    };
  }

  async function createPinnedThreadsSection() {
    const indexLeft = document.querySelector(".index-left");
    if (!indexLeft) return;

    const pinnedThreads = util.getPinnedThreads();
    if (Object.keys(pinnedThreads).length === 0) return;

    const pinnedSection = createPinnedSection();
    indexLeft.insertBefore(pinnedSection, indexLeft.firstChild);

    const pinnedList = pinnedSection.querySelector("#pinned-threads-list");
    const threadIds = Object.keys(pinnedThreads);

    // Create loading placeholders
    for (const threadId of threadIds) {
      const listItem = createLoadingListItem(threadId);
      pinnedList.appendChild(listItem);
    }

    // Fetch thread data
    let threadsData = await fetchAllThreadsData(pinnedThreads);

    // Sort threads alphabetically by title
    threadsData.sort((a, b) => a.sortableTitle.localeCompare(b.sortableTitle));

    // Clear the list
    pinnedList.innerHTML = "";

    // Update list items with sorted data
    for (const threadData of threadsData) {
      const listItem = document.createElement("li");
      listItem.id = `pinned-thread-${threadData.threadId}`;
      listItem.innerHTML = threadData.rowHTML;
      pinnedList.appendChild(listItem);
    }
  }

  function createPinnedSection() {
    const section = document.createElement("div");
    section.id = "pinned-threads";
    section.className = "forabg";
    section.innerHTML = `
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
    return section;
  }

  function createLoadingListItem(threadId) {
    const listItem = document.createElement("li");
    listItem.className = "row bg1";
    listItem.id = `pinned-thread-${threadId}`;
    listItem.innerHTML = `
      <dl class="row-item topic_read">
        <dt>
          <div class="list-inner">
            <span class="topic-title">
              <i class="fa fa-spinner fa-spin"></i> Loading...
            </span>
          </div>
        </dt>
        <dd class="posts">-</dd>
        <dd class="views">-</dd>
        <dd class="lastpost"><span>-</span></dd>
      </dl>
    `;
    return listItem;
  }

  async function fetchAllThreadsData(pinnedThreads) {
    const threadDataPromises = Object.entries(pinnedThreads).map(
      ([threadId, threadInfo]) =>
        fetchThreadData(threadId, threadInfo).then((data) => ({
          threadId,
          ...data,
        }))
    );
    return Promise.all(threadDataPromises);
  }

  async function fetchThreadData(threadId, threadInfo) {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const threadData = await fetchThreadTitle(threadId);
        let rowHTML = await fetchAdditionalThreadInfo(threadData.title);

        if (rowHTML) {
          if (threadId === ZOMBOID_THREAD_ID && threadData.status) {
            rowHTML = addZomboidStatus(rowHTML, threadData.status);
          }

          return { threadId, title: threadData.title, rowHTML };
        } else {
          throw new Error(`No row HTML found for thread ${threadId}`);
        }
      } catch (error) {
        console.error(
          `Error processing thread ${threadId} (Attempt ${attempts + 1}):`,
          error
        );
        attempts++;

        if (attempts >= maxAttempts) {
          console.error(
            `Failed to fetch data for thread ${threadId} after ${maxAttempts} attempts`
          );
          return {
            threadId,
            title: `Error loading thread ${threadId}`,
            rowHTML: createErrorListItemHTML(threadId),
          };
        } else {
          await new Promise((resolve) => setTimeout(resolve, 3500));
        }
      }
    }
  }

  async function fetchThreadTitle(threadId) {
    const isZomboidServer = threadId === ZOMBOID_THREAD_ID;
    const url = isZomboidServer
      ? "https://rpghq.org/forums/viewtopic.php?p=132576-project-zomboid-server-1-10"
      : `https://rpghq.org/forums/viewtopic.php?t=${threadId}`;

    const html = await util.fetchHtml(url);
    const doc = util.parseHtml(html);
    const titleElement = doc.querySelector("h2.topic-title a");

    if (titleElement) {
      const title = titleElement.textContent.trim();

      if (isZomboidServer) {
        const playerCountElement = doc.querySelector(
          'span[style="background-color:black"] strong.text-strong'
        );

        if (playerCountElement) {
          const statusDiv = playerCountElement.closest("div");

          try {
            const onlinePlayersElements = statusDiv.querySelectorAll(
              'span[style="font-size:85%;line-height:116%"]'
            );
            const lastUpdatedElement = statusDiv.querySelector(
              'span[style="font-size:55%;line-height:116%"] em'
            );

            if (playerCountElement && lastUpdatedElement) {
              const playerCount = playerCountElement.textContent;
              const onlinePlayers = Array.from(onlinePlayersElements).map(
                (el) => el.textContent
              );
              const lastUpdated = lastUpdatedElement.textContent;

              return {
                title: title,
                status: {
                  playerCount: playerCount,
                  onlinePlayers: onlinePlayers,
                  lastUpdated: lastUpdated,
                },
              };
            } else {
              console.warn("Some status elements not found");
              return { title: title };
            }
          } catch (error) {
            console.error(
              "Error scraping Project Zomboid Server status:",
              error
            );
            return { title: title };
          }
        } else {
          console.warn("Player count element not found");
          return { title: title };
        }
      } else {
        return { title: title };
      }
    } else {
      console.error("Thread title not found");
      throw new Error("Thread title not found");
    }
  }

  async function fetchAdditionalThreadInfo(threadTitle) {
    const encodedTitle = encodeURIComponent(threadTitle);
    const searchUrl = `https://rpghq.org/forums/search.php?keywords=${encodedTitle}&terms=all&author=&sc=1&sf=titleonly&sr=topics&sk=t&sd=d&st=0&ch=1000&t=0&submit=Search`;

    const html = await util.fetchHtml(searchUrl);
    const doc = util.parseHtml(html);
    const topicRow = doc.querySelector(".topiclist.topics .row");

    if (topicRow) {
      const links = topicRow.querySelectorAll("a");
      links.forEach((link) => {
        link.href = link.href.replace(/&hilit=[^&]+/, "");

        const colorMap = {
          "【 Userscript 】": "#00AA00",
          "【 Resource 】": "#3889ED",
          "【 BG3 Toolkit 】": "#3889ED",
          "【 Project 】": "#FF4A66",
          "【 Tutorial 】": "#FFC107",
          "【 Backups 】": "#BC2A4D",
          "[ Select for merge ]": "#A50000",
        };

        for (const [text, color] of Object.entries(colorMap)) {
          if (link.textContent.includes(text)) {
            const regex = new RegExp(`(${text})`, "g");
            link.innerHTML = link.innerHTML.replace(
              regex,
              `<span style="color: ${color};">$1</span>`
            );
            break;
          }
        }
      });

      return topicRow.outerHTML;
    } else {
      console.warn("Topic row not found in search results");
      return null;
    }
  }

  function addZomboidStatus(rowHTML, status) {
    const zomboidStatusHTML = createZomboidStatusHTML(status);
    const parser = new DOMParser();
    const doc = parser.parseFromString(rowHTML, "text/html");
    const topicTitle = doc.querySelector(".topictitle");
    if (topicTitle) {
      topicTitle.insertAdjacentHTML("afterend", zomboidStatusHTML);
      return doc.body.innerHTML;
    } else {
      console.error("Topic title not found in rowHTML");
      return rowHTML;
    }
  }

  function createZomboidStatusHTML(status) {
    if (!status || typeof status !== "object") {
      console.error("Invalid status object");
      return "";
    }

    if (!status.playerCount) {
      console.warn("Missing playerCount in status");
      return "";
    }

    const onlinePlayersList =
      status.onlinePlayers &&
      Array.isArray(status.onlinePlayers) &&
      status.onlinePlayers.length > 0
        ? status.onlinePlayers.join(", ")
        : "No players online";

    const lastUpdated = status.lastUpdated || "";

    const statusHTML = `
      <div class="zomboid-status" style="font-size: 0.9em; color: #CCCCCC; margin-top: 5px;">
        • ${onlinePlayersList}<br>
        <span style="font-style: italic; color: #8c8c8c;">${lastUpdated}</span>
      </div>
    `;
    return statusHTML;
  }

  function updateListItem(threadId, threadData) {
    const listItem = document.getElementById(`pinned-thread-${threadId}`);
    if (listItem) {
      listItem.outerHTML = threadData.rowHTML;
    } else {
      console.error(`List item for thread ${threadId} not found`);
    }
  }

  function createErrorListItemHTML(threadId) {
    return `
      <li class="row bg1" id="pinned-thread-${threadId}">
        <dl class="row-item topic_read">
          <dt>
            <div class="list-inner">
              <span class="topic-title">
                Error loading thread
              </span>
            </div>
          </dt>
          <dd class="posts">-</dd>
          <dd class="views">-</dd>
          <dd class="lastpost"><span>-</span></dd>
        </dl>
      </li>
    `;
  }

  function addResponsiveStyle() {
    util.addStyle(`
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
      .zomboid-status {
        margin-top: 5px;
        font-size: 0.9em;
        text-align: left;
        color: #8c8c8c;
      }
      .zomboid-status .online-players {
        font-weight: bold;
        color: #BFC0C5;
      }
      .zomboid-status .last-updated {
        font-size: 0.8em;
        font-style: italic;
      }
      #pinned-threads .pagination {
        display: none !important;
      }
      @media (max-width: 700px) {
        #pinned-threads .responsive-show {
          display: none !important;
        }
        #pinned-threads .responsive-hide {
          display: none !important;
        }
      }
    `);
  }

  // Main execution
  if (window.location.href.includes("/viewtopic.php")) {
    addPinButton();
  } else if (
    window.location.href.includes("/index.php") ||
    window.location.href.endsWith("/forums/") ||
    window.location.href.includes("/forums/home")
  ) {
    createPinnedThreadsSection();
  }
})();
