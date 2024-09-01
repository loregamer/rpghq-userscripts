// ==UserScript==
// @name         RPGHQ Thread Pinner
// @namespace    http://tampermonkey.net/
// @version      1.2
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

  // Add the colorMap
  const colorMap = {
    "【 Userscript 】": "#00AA00",
    "【 Resource 】": "#3889ED",
    "【 Project 】": "#FF4A66",
    "【 Tutorial 】": "#FFC107",
    "【 Backups 】": "#BC2A4D",
    "[ Select for merge ]": "#A50000",
  };

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
        .colored-title {
            display: inline;
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

  function colorizeTitle(title) {
    let coloredTitle = title;
    for (const [text, color] of Object.entries(colorMap)) {
      if (title.includes(text)) {
        const coloredText = `<span class="colored-title" style="color: ${color};">${text}</span>`;
        coloredTitle = coloredTitle.replace(text, coloredText);
      }
    }
    return coloredTitle;
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

    // Create placeholder rows with loading animation
    Object.keys(pinnedThreads).forEach(() => {
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
    });

    // Fetch thread data asynchronously
    const threadPromises = Object.entries(pinnedThreads).map(
      ([threadId, threadInfo], index) =>
        fetchThreadData(threadId, threadInfo, pinnedList.children[index])
    );

    // Wait for all threads to load
    Promise.all(threadPromises);
  }

  async function fetchThreadData(threadId, threadInfo, listItem) {
    try {
      console.log(`Fetching data for thread ${threadId}`);
      const threadData = await fetchThreadTitle(threadId);
      console.log(`Received data for thread ${threadId}:`, threadData);

      // Fetch additional thread information
      const rowHTML = await fetchAdditionalThreadInfo(threadData.title);
      console.log(`Row HTML for thread ${threadId}:`, rowHTML);

      if (rowHTML) {
        // Replace the entire listItem content with the fetched row HTML
        listItem.outerHTML = rowHTML;

        // If it's the Zomboid server thread, add the special status
        if (threadId === "2756" && threadData.status) {
          const zomboidStatusHTML = createZomboidStatusHTML(threadData.status);
          const listInner = listItem.querySelector(".list-inner");
          if (listInner) {
            listInner.insertAdjacentHTML("beforeend", zomboidStatusHTML);
          }
        }

        // Recolor the title
        const titleElement = listItem.querySelector(".topictitle");
        if (titleElement) {
          titleElement.innerHTML = colorizeTitle(titleElement.textContent);
        }
      } else {
        console.error(`No row HTML found for thread ${threadId}`);
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

      console.log(`Updated HTML for thread ${threadId}`);
    } catch (error) {
      console.error(`Error processing thread ${threadId}:`, error);
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

  async function fetchAdditionalThreadInfo(threadTitle) {
    return new Promise((resolve, reject) => {
      const encodedTitle = encodeURIComponent(threadTitle);
      const searchUrl = `https://rpghq.org/forums/search.php?keywords=${encodedTitle}&terms=all&author=&sc=1&sf=all&sr=topics&sk=t&sd=d&st=0&ch=1000&t=0&submit=Search`;

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

  function colorizeTopicTitles() {
    const topicTitles = document.querySelectorAll(
      "a.topictitle, h2.topic-title a, h3.first a, dd.lastpost a.lastsubject, .tabs-container h2 a"
    );

    topicTitles.forEach((title) => {
      title.innerHTML = colorizeTitle(title.innerHTML);
    });
  }

  // Main execution
  if (window.location.href.includes("/viewtopic.php")) {
    addPinButton();
    colorizeTopicTitles();
  } else if (
    window.location.href.includes("/index.php") ||
    window.location.href.endsWith("/forums/") ||
    window.location.href.includes("/forums/home")
  ) {
    createPinnedThreadsSection();
    colorizeTopicTitles();
  }
})();
