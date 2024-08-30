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
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/main/Pin-Threads.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/main/Pin-Threads.user.js
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
        .zomboid-status {
            margin-top: 10px;
            font-size: 0.9em;
            text-align: center;
        }
        .zomboid-status .player-count {
            background-color: black;
            color: white;
            font-weight: bold;
            padding: 2px 4px;
        }
        .zomboid-status .last-updated {
            font-size: 0.8em;
            font-style: italic;
            color: #777;
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
      console.log(`Fetching thread with ID: ${threadId}`);
      console.log(`Thread ID type: ${typeof threadId}`);

      const isZomboidServer = threadId === "2756";
      const url = isZomboidServer
        ? "https://rpghq.org/forums/viewtopic.php?p=132576-project-zomboid-server-1-10"
        : `https://rpghq.org/forums/viewtopic.php?t=${threadId}`;

      console.log(`Fetching URL: ${url}`);

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
            console.log(`Thread title found: ${title}`);

            if (isZomboidServer) {
              console.log("Attempting to scrape Project Zomboid Server status");
              const statusDiv = doc.querySelector(
                'div[style="text-align:center"]'
              );
              if (statusDiv) {
                console.log("Status div found:", statusDiv.innerHTML);
                try {
                  const playerCountElement =
                    statusDiv.querySelector("strong.text-strong");
                  const onlinePlayersElement = statusDiv.querySelector(
                    'span[style="font-size:85%;line-height:116%"]'
                  );
                  const lastUpdatedElement = statusDiv.querySelector(
                    'span[style="font-size:55%;line-height:116%"] em'
                  );

                  console.log(
                    "Player count element:",
                    playerCountElement
                      ? playerCountElement.outerHTML
                      : "Not found"
                  );
                  console.log(
                    "Online players element:",
                    onlinePlayersElement
                      ? onlinePlayersElement.outerHTML
                      : "Not found"
                  );
                  console.log(
                    "Last updated element:",
                    lastUpdatedElement
                      ? lastUpdatedElement.outerHTML
                      : "Not found"
                  );

                  if (
                    playerCountElement &&
                    onlinePlayersElement &&
                    lastUpdatedElement
                  ) {
                    const playerCount = playerCountElement.textContent;
                    const onlinePlayers = onlinePlayersElement.textContent;
                    const lastUpdated = lastUpdatedElement.textContent;

                    console.log(
                      `Scraped data: ${playerCount} | ${onlinePlayers} | ${lastUpdated}`
                    );

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
                console.warn(
                  "Status div not found for Project Zomboid Server thread"
                );
                resolve({ title: title });
              }
            } else {
              console.log("This is not the Project Zomboid Server thread");
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
                        </dl>
                    </li>
                </ul>
                <ul class="topiclist topics" id="pinned-threads-list"></ul>
            </div>
        `;

    const pinnedList = pinnedSection.querySelector("#pinned-threads-list");

    // Create placeholder rows with loading animation
    for (const threadId in pinnedThreads) {
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
                  </dl>
              `;
      pinnedList.appendChild(listItem);
    }

    indexLeft.insertBefore(pinnedSection, indexLeft.firstChild);

    // Asynchronously fetch and update thread titles
    for (const [threadId, threadInfo] of Object.entries(pinnedThreads)) {
      try {
        console.log(`Fetching data for thread ${threadId}`);
        const threadData = await fetchThreadTitle(threadId);
        console.log(`Received data for thread ${threadId}:`, threadData);

        const listItem =
          pinnedList.children[Object.keys(pinnedThreads).indexOf(threadId)];

        let additionalInfo = "";
        if (
          threadId === "2756-project-zomboid-server-1-10" &&
          threadData.status
        ) {
          console.log("Generating additional info for Project Zomboid Server");
          additionalInfo = `
            <div class="zomboid-status">
              <span class="player-count">${threadData.status.playerCount}</span> Players Online<br>
              • ${threadData.status.onlinePlayers}<br>
              <span class="last-updated">${threadData.status.lastUpdated}</span>
            </div>
          `;
        }

        listItem.innerHTML = `
          <dl class="row-item topic_read">
            <dt title="No unread posts">
              <div class="list-inner">
                <a href="https://rpghq.org/forums/viewtopic.php?t=${threadId}&view=unread#unread" class="topictitle">${
          threadData.title
        }</a>
                <br>
                <div class="topic-poster responsive-hide left-box">
                  <span class="by">${threadInfo.author || "Unknown"}</span>
                </div>
                ${additionalInfo}
              </div>
            </dt>
          </dl>
        `;
        console.log(`Updated HTML for thread ${threadId}`);
      } catch (error) {
        console.error(`Error processing thread ${threadId}:`, error);
        const listItem =
          pinnedList.children[Object.keys(pinnedThreads).indexOf(threadId)];
        listItem.innerHTML = `
          <dl class="row-item topic_read">
            <dt>
              <div class="list-inner">
                <span class="topic-title">Error loading thread</span>
              </div>
            </dt>
          </dl>
        `;
      }
    }
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
