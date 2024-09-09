// ==UserScript==
// @name         RPGHQ Thread Pinner
// @namespace    http://tampermonkey.net/
// @version      2.1
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

  function getPinnedThreads() {
    return GM_getValue(PINNED_THREADS_KEY, {});
  }

  function setPinnedThreads(threads) {
    GM_setValue(PINNED_THREADS_KEY, threads);
  }

  function addPinButton() {
    const actionBar = document.querySelector(".action-bar.bar-top");
    const threadId = getThreadId();
    if (
      actionBar &&
      threadId &&
      !document.getElementById("pin-thread-button")
    ) {
      const dropdownContainer = document.createElement("div");
      dropdownContainer.className =
        "dropdown-container dropdown-button-control topic-tools";

      const pinButton = document.createElement("span");
      pinButton.id = "pin-thread-button";
      pinButton.className = "button button-secondary dropdown-trigger";
      pinButton.title = "Pin Thread";

      const pinnedThreads = getPinnedThreads();
      const isPinned = pinnedThreads.hasOwnProperty(threadId);
      updatePinButtonState(pinButton, isPinned);

      pinButton.addEventListener("click", function (e) {
        e.preventDefault();
        const threadTitle = document
          .querySelector(".topic-title")
          .textContent.trim();
        togglePinThread(threadId, pinButton);
      });

      dropdownContainer.appendChild(pinButton);

      // Insert the pin button as the first item in the action bar
      if (actionBar.firstChild) {
        actionBar.insertBefore(dropdownContainer, actionBar.firstChild);
      } else {
        actionBar.appendChild(dropdownContainer);
      }

      // Add media query for responsive design
      const style = document.createElement("style");
      style.textContent = `
        @media (max-width: 700px) {
          #pin-thread-button span {
            display: none;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  function updatePinButtonState(button, isPinned) {
    if (isPinned) {
      button.innerHTML =
        '<i class="icon fa-thumb-tack fa-fw" aria-hidden="true"></i><span>Unpin</span>';
      button.title = "Unpin";
    } else {
      button.innerHTML =
        '<i class="icon fa-thumb-tack fa-fw" aria-hidden="true"></i><span>Pin</span>';
      button.title = "Pin";
    }
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
      const isZomboidServer = threadId === "2756";
      const url = isZomboidServer
        ? "https://rpghq.org/forums/viewtopic.php?p=132576-project-zomboid-server-1-10"
        : `https://rpghq.org/forums/viewtopic.php?t=${threadId}`;

      GM_xmlhttpRequest({
        method: "GET",
        url: url,
        onload: function (response) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(
            response.responseText,
            "text/html"
          );
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

                  if (
                    playerCountElement &&
                    onlinePlayersElements.length > 0 &&
                    lastUpdatedElement
                  ) {
                    const playerCount = playerCountElement.textContent;
                    const onlinePlayers = Array.from(onlinePlayersElements).map(
                      (el) => el.textContent
                    );
                    const lastUpdated = lastUpdatedElement.textContent;

                    resolve({
                      title: title,
                      status: {
                        playerCount: playerCount,
                        onlinePlayers: onlinePlayers,
                        lastUpdated: lastUpdated,
                      },
                    });
                  } else {
                    console.warn("Some status elements not found");
                    resolve({ title: title });
                  }
                } catch (error) {
                  console.error(
                    "Error scraping Project Zomboid Server status:",
                    error
                  );
                  resolve({ title: title });
                }
              } else {
                console.warn("Player count element not found");
                resolve({ title: title });
              }
            } else {
              resolve({ title: title });
            }
          } else {
            console.error("Thread title not found");
            reject("Thread title not found");
          }
        },
        onerror: function (error) {
          console.error("Error fetching thread:", error);
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
              <dd class="posts">Replies</dd>
              <dd class="views">Views</dd>
              <dd class="lastpost"><span>Last post</span></dd>
            </dl>
          </li>
        </ul>
        <ul class="topiclist topics" id="pinned-threads-list"></ul>
      </div>
    `;

    indexLeft.insertBefore(pinnedSection, indexLeft.firstChild);

    const pinnedList = pinnedSection.querySelector("#pinned-threads-list");

    // Fetch thread data for all pinned threads
    const threadDataPromises = Object.entries(pinnedThreads).map(
      ([threadId, threadInfo]) =>
        fetchThreadTitle(threadId).then((data) => ({ threadId, ...data }))
    );

    // Wait for all thread data to be fetched
    const threadsData = await Promise.all(threadDataPromises);

    // Sort threads alphabetically by title
    threadsData.sort((a, b) => a.title.localeCompare(b.title));

    // Create and append list items in sorted order
    for (const threadData of threadsData) {
      const listItem = document.createElement("li");
      listItem.className = "row bg1";
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
      pinnedList.appendChild(listItem);

      // Fetch additional thread info and update the list item
      fetchThreadData(
        threadData.threadId,
        pinnedThreads[threadData.threadId],
        listItem,
        threadData
      );
    }
  }

  async function fetchThreadData(threadId, threadInfo, listItem) {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const threadData = await fetchThreadTitle(threadId);

        // Fetch additional thread information
        const rowHTML = await fetchAdditionalThreadInfo(threadData.title);

        if (rowHTML) {
          // Replace the entire listItem content with the fetched row HTML
          listItem.outerHTML = rowHTML;

          // If it's the Zomboid server thread, add the special status
          if (threadId === "2756" && threadData.status) {
            const zomboidStatusHTML = createZomboidStatusHTML(
              threadData.status
            );
            const listInner = listItem.querySelector(".list-inner");
            if (listInner) {
              listInner.insertAdjacentHTML("beforeend", zomboidStatusHTML);
            }
          }
          return; // Success, exit the function
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
          listItem.innerHTML = `
            <dl class="row-item topic_read">
              <dt>
                <div class="list-inner">
                  <span class="topic-title">Error loading thread after ${maxAttempts} attempts</span>
                </div>
              </dt>
            </dl>
          `;
        } else {
          // Wait for 5 seconds before retrying
          await new Promise((resolve) => setTimeout(resolve, 2500));
        }
      }
    }
  }

  const colorMap = {
    "【 Userscript 】": "#00AA00",
    "【 Resource 】": "#3889ED",
    "【 BG3 Toolkit 】": "#3889ED",
    "【 Project 】": "#FF4A66",
    "【 Tutorial 】": "#FFC107",
    "【 Backups 】": "#BC2A4D",
    "[ Select for merge ]": "#A50000",
  };

  async function fetchAdditionalThreadInfo(threadTitle) {
    return new Promise((resolve, reject) => {
      const encodedTitle = encodeURIComponent(threadTitle);
      const searchUrl = `https://rpghq.org/forums/search.php?keywords=${encodedTitle}&terms=all&author=&sc=1&sf=titleonly&sr=topics&sk=t&sd=d&st=0&ch=1000&t=0&submit=Search`;

      GM_xmlhttpRequest({
        method: "GET",
        url: searchUrl,
        onload: function (response) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(
            response.responseText,
            "text/html"
          );
          const topicRow = doc.querySelector(".topiclist.topics .row");

          if (topicRow) {
            // Remove &hilit= from all URLs in the row
            const links = topicRow.querySelectorAll("a");
            links.forEach((link) => {
              link.href = link.href.replace(/&hilit=[^&]+/, "");

              // Apply colorizing logic
              for (const [text, color] of Object.entries(colorMap)) {
                if (link.textContent.includes(text)) {
                  const regex = new RegExp(`(${text})`, "g");
                  link.innerHTML = link.innerHTML.replace(
                    regex,
                    `<span style="color: ${color};">$1</span>`
                  );
                  break; // Stop after first match to prevent overwriting
                }
              }
            });

            resolve(topicRow.outerHTML);
          } else {
            console.warn("Topic row not found in search results");
            resolve(null);
          }
        },
        onerror: function (error) {
          console.error("Error fetching additional thread info:", error);
          reject(error);
        },
      });
    });
  }

  function createZomboidStatusHTML(status) {
    const onlinePlayersList = status.onlinePlayers
      .map((player) => `• ${player}`)
      .join("<br>");
    return `
      <div class="zomboid-status">
        <span class="online-players">${onlinePlayersList}</span><br>
        <span class="last-updated">${status.lastUpdated}</span>
      </div>
    `;
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
