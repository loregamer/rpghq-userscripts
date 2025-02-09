// ==UserScript==
// @name         RPGHQ - Thread Pinner
// @namespace    http://tampermonkey.net/
// @version      3.5.1
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
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
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
  const SHOW_ON_NEW_POSTS_KEY = "rpghq_show_pinned_on_new_posts";
  const ZOMBOID_THREAD_ID = "2756";

  let menuCommandId = null;

  // Utility functions
  const util = {
    getPinnedThreads: () => GM_getValue(PINNED_THREADS_KEY, {}),
    setPinnedThreads: (threads) => GM_setValue(PINNED_THREADS_KEY, threads),
    getShowOnNewPosts: () => GM_getValue(SHOW_ON_NEW_POSTS_KEY, true),
    setShowOnNewPosts: (value) => GM_setValue(SHOW_ON_NEW_POSTS_KEY, value),
    getThreadId: () => {
      const match = window.location.href.match(/[?&]t=(\d+)/);
      if (match) return match[1];

      const topicTitleLink = document.querySelector("h2.topic-title a");
      if (topicTitleLink) {
        const topicUrlMatch = topicTitleLink.href.match(/[?&]t=(\d+)/);
        return topicUrlMatch ? topicUrlMatch[1] : null;
      }

      return null;
    },
    addStyle: (css) => GM_addStyle(css),
    fetchHtml: (url) => {
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: "GET",
          url: url,
          headers: {
            "User-Agent": navigator.userAgent,
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            Referer: "https://rpghq.org/forums/",
            DNT: "1",
            Connection: "keep-alive",
            "Upgrade-Insecure-Requests": "1",
          },
          withCredentials: true,
          timeout: 30000,
          onload: (response) => resolve(response.responseText),
          onerror: (error) => reject(error),
          ontimeout: () => reject(new Error("Request timed out")),
        });
      });
    },
    parseHtml: (html) => new DOMParser().parseFromString(html, "text/html"),
  };

  function toggleNewPostsDisplay() {
    const currentState = util.getShowOnNewPosts();
    util.setShowOnNewPosts(!currentState);
    updateMenuCommand();
    location.reload();
  }

  function updateMenuCommand() {
    if (menuCommandId !== null) {
      GM_unregisterMenuCommand(menuCommandId);
    }
    const currentState = util.getShowOnNewPosts();
    const label = currentState
      ? "Disable Pinned Threads on New Posts"
      : "Enable Pinned Threads on New Posts";
    menuCommandId = GM_registerMenuCommand(label, toggleNewPostsDisplay);
  }

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
    const pageBody = document.querySelector("#page-body");
    if (!pageBody) return;

    const pinnedThreads = util.getPinnedThreads();
    if (Object.keys(pinnedThreads).length === 0) return;

    const pinnedSection = createPinnedSection();

    // Determine the correct insertion point based on the current page
    let insertionPoint;
    if (window.location.href.includes("/search.php")) {
      insertionPoint = findSearchPageInsertionPoint(pageBody);
    } else {
      const indexLeft = pageBody.querySelector(".index-left");
      insertionPoint = indexLeft || pageBody.querySelector(".forumbg");
    }

    if (!insertionPoint) return;

    // Insert the pinned section
    if (insertionPoint.classList.contains("index-left")) {
      insertionPoint.insertAdjacentElement("afterbegin", pinnedSection);
    } else {
      insertionPoint.parentNode.insertBefore(pinnedSection, insertionPoint);
    }

    const pinnedList = pinnedSection.querySelector("#pinned-threads-list");
    const threadIds = Object.keys(pinnedThreads);

    // Create loading placeholders
    threadIds.forEach((threadId) => {
      pinnedList.insertAdjacentHTML(
        "beforeend",
        createLoadingListItem(threadId)
      );
    });

    // Set up Intersection Observer
    let isVisible = false;
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(pinnedSection);

    // Store the initial height
    const initialHeight = pinnedSection.offsetHeight;

    // Fetch and process thread data
    const threadsData = await Promise.all(
      threadIds.map((threadId) =>
        fetchThreadData(threadId, pinnedThreads[threadId]).catch((error) => ({
          threadId,
          title: `Error loading thread ${threadId}`,
          sortableTitle: `error loading thread ${threadId}`,
          rowHTML: createErrorListItemHTML(threadId),
        }))
      )
    );

    // Sort threads
    threadsData.sort((a, b) =>
      a.title.localeCompare(b.title, undefined, {
        numeric: true,
        sensitivity: "base",
        ignorePunctuation: false,
      })
    );

    // Update the list with sorted threads
    pinnedList.innerHTML = "";
    threadsData.forEach((threadData) => {
      pinnedList.insertAdjacentHTML("beforeend", threadData.rowHTML);
    });

    // Adjust scroll position if necessary
    const newHeight = pinnedSection.offsetHeight;
    const heightDifference = newHeight - initialHeight;

    if (!isVisible && heightDifference > 0) {
      window.scrollBy(0, heightDifference);
    }

    // Clean up the observer
    observer.disconnect();
  }

  function findSearchPageInsertionPoint(pageBody) {
    const actionBar = pageBody.querySelector(".action-bar.bar-top");
    return actionBar
      ? actionBar.nextElementSibling
      : pageBody.querySelector(".forumbg");
  }

  function createPinnedSection() {
    const section = document.createElement("div");
    section.id = "pinned-threads";
    section.className = "forabg";
    section.innerHTML = `
      <div class="inner">
        <ul class="topiclist content-processed">
          <li class="header">
            <dl class="row-item">
              <dt><div class="list-inner">Pinned Topics</div></dt>
              <dd class="posts">Replies</dd>
              <dd class="views">Views</dd>
            </dl>
          </li>
        </ul>
        <ul class="topiclist topics content-processed" id="pinned-threads-list"></ul>
      </div>
    `;
    return section;
  }

  function createLoadingListItem(threadId) {
    return `
      <li class="row bg1 content-processed" id="pinned-thread-${threadId}">
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
        </dl>
      </li>
    `;
  }

  async function fetchAllThreadsData(pinnedThreads) {
    const threadDataPromises = Object.entries(pinnedThreads).map(
      ([threadId, threadInfo]) => fetchThreadData(threadId, threadInfo)
    );
    return Promise.all(threadDataPromises);
  }

  function createCustomThreadRowHTML(
    threadId,
    title,
    forumName,
    forumUrl,
    errorMessage = ""
  ) {
    const titleWithError = errorMessage ? `${title} (${errorMessage})` : title;
    const forumInfo =
      forumName && forumUrl
        ? `» in <a href="${forumUrl}">${forumName}</a>`
        : "";

    return `
      <li class="row bg1 content-processed" id="pinned-thread-${threadId}">
        <dl class="row-item topic_read">
          <dt>
            <div class="list-inner">
              <a href="https://rpghq.org/forums/viewtopic.php?t=${threadId}" class="topictitle">${titleWithError}</a>
              ${
                forumInfo
                  ? `<br><span class="responsive-hide">${forumInfo}</span>`
                  : ""
              }
            </div>
          </dt>
          <dd class="posts">-</dd>
          <dd class="views">-</dd>
        </dl>
      </li>
    `;
  }

  async function fetchThreadData(threadId, threadInfo) {
    try {
      const { title, forumUrl, forumName, status } =
        await fetchThreadTitleAndForum(threadId);
      let rowHTML = await fetchThreadRowFromForum(title, forumUrl);

      if (rowHTML) {
        rowHTML = modifyRowHTML(rowHTML, threadId, status, forumName, forumUrl);
        const sortableTitle = title.replace(/^[【】\[\]\s]+/, "");
        return { threadId, title, sortableTitle, rowHTML };
      } else {
        // Create a custom row HTML for threads that can't be found in the forum list
        rowHTML = createCustomThreadRowHTML(
          threadId,
          title,
          forumName,
          forumUrl,
          "Thread not found in forum list"
        );
        const sortableTitle = title.replace(/^[【】\[\]\s]+/, "");
        return { threadId, title, sortableTitle, rowHTML };
      }
    } catch (error) {
      const errorMessage = `Error: ${error.message || "Unknown error"}`;
      return {
        threadId,
        title: `Error loading thread ${threadId}`,
        sortableTitle: `Error loading thread ${threadId}`,
        rowHTML: createCustomThreadRowHTML(
          threadId,
          `Error loading thread ${threadId}`,
          "",
          "",
          errorMessage
        ),
      };
    }
  }

  async function fetchThreadTitleAndForum(threadId) {
    const url = `https://rpghq.org/forums/viewtopic.php?t=${threadId}`;
    const html = await util.fetchHtml(url);
    const doc = util.parseHtml(html);

    const titleElement = doc.querySelector("h2.topic-title a");
    const breadcrumbs = doc.querySelectorAll("#nav-breadcrumbs .crumb");
    const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];

    if (!titleElement || !lastBreadcrumb) {
      throw new Error("Thread title or forum not found");
    }

    const title = titleElement.textContent.trim();
    const forumUrl = lastBreadcrumb.querySelector("a").href;
    const forumName = lastBreadcrumb.querySelector("a").textContent.trim();

    let status = null;
    if (threadId === ZOMBOID_THREAD_ID) {
      status = fetchZomboidStatus(doc);
    }

    return { title, forumUrl, forumName, status };
  }

  async function fetchThreadRowFromForum(
    threadTitle,
    forumUrl,
    page = 1,
    maxPages = 5
  ) {
    const url = `${forumUrl}&start=${(page - 1) * 25}`;

    try {
      const html = await util.fetchHtml(url);
      const doc = util.parseHtml(html);

      // Check if we're redirected to a login page or error page
      const loginForm = doc.querySelector(
        'form[action="./ucp.php?mode=login"]'
      );
      if (loginForm) {
        throw new Error(
          "Redirected to login page. User might not be authenticated."
        );
      }

      const threadRows = doc.querySelectorAll(".topiclist.topics .row");

      for (const row of threadRows) {
        const rowTitleElement = row.querySelector(".topictitle");
        if (rowTitleElement) {
          const rowTitle = rowTitleElement.textContent.trim();
          if (rowTitle === threadTitle) {
            return row.outerHTML;
          }
        }
      }

      // If thread not found on this page, check the next page
      const nextPageLink = doc.querySelector(".pagination .next a");
      if (nextPageLink && page < maxPages) {
        return fetchThreadRowFromForum(
          threadTitle,
          forumUrl,
          page + 1,
          maxPages
        );
      }

      // If no next page or max pages reached, thread not found
      throw new Error(`Thread not found after checking ${page} pages`);
    } catch (error) {
      throw new Error(`Error fetching thread row: ${error.message}`);
    }
  }

  function modifyRowHTML(rowHTML, threadId, status, forumName, forumUrl) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rowHTML, "text/html");

    const row = doc.querySelector(".row");
    if (!row) return rowHTML;

    // Add content-processed class if it's not already there
    if (!row.classList.contains("content-processed")) {
      row.classList.add("content-processed");
    }

    // Change "sticky_" classes to "topic_"
    row.querySelectorAll('*[class*="sticky_"]').forEach((element) => {
      element.className = element.className.replace(/\bsticky_/g, "topic_");
    });

    // Remove pagination
    const pagination = row.querySelector(".pagination");
    if (pagination) {
      pagination.style.display = "none";
    }

    // Remove rh_tag elements
    const rhTags = row.querySelectorAll(".rh_tag");
    rhTags.forEach((tag) => tag.remove());

    // Check if the thread is unread
    const dlElement = row.querySelector("dl");
    const isUnread =
      dlElement &&
      (dlElement.classList.contains("topic_unread") ||
        dlElement.classList.contains("topic_unread_hot") ||
        dlElement.classList.contains("topic_unread_mine") ||
        dlElement.classList.contains("topic_unread_hot_mine"));

    // Change icon for unread threads
    const iconElement = row.querySelector(".icon.fa-file");
    if (iconElement) {
      iconElement.classList.remove("icon-lightgray", "icon-red");
      iconElement.classList.add(isUnread ? "icon-red" : "icon-lightgray");
    }

    // Remove lastpost column
    const lastpostColumn = row.querySelector(".lastpost");
    if (lastpostColumn) {
      lastpostColumn.remove();
    }

    // Modify the topic hyperlink
    const topicLink = row.querySelector(".topictitle");
    if (topicLink) {
      const dlElement = row.querySelector("dl");
      const isUnread =
        dlElement &&
        (dlElement.classList.contains("topic_unread") ||
          dlElement.classList.contains("topic_unread_hot") ||
          dlElement.classList.contains("topic_unread_mine") ||
          dlElement.classList.contains("topic_unread_hot_mine"));

      if (!isUnread) {
        const currentHref = topicLink.getAttribute("href");
        topicLink.setAttribute("href", `${currentHref}&view=unread`);
      }
    }

    // Add forum section information
    const leftBox = row.querySelector(".responsive-hide.left-box");
    if (leftBox) {
      const lastTimeElement = leftBox.querySelector("time");
      if (lastTimeElement) {
        const forumLink = document.createElement("a");
        forumLink.href = forumUrl;
        forumLink.textContent = forumName;

        const inText = document.createTextNode("  » in ");

        lastTimeElement.insertAdjacentElement("afterend", forumLink);
        lastTimeElement.insertAdjacentText("afterend", "  » in ");
      }
    }

    // Add id to the row for easier manipulation later if needed
    row.id = `pinned-thread-${threadId}`;

    return row.outerHTML;
  }

  function fetchZomboidStatus(doc) {
    const playerCountElement = doc.querySelector(
      'span[style="background-color:black"] strong.text-strong'
    );

    if (playerCountElement) {
      const statusDiv = playerCountElement.closest("div");
      const onlinePlayersElements = statusDiv.querySelectorAll(
        'span[style="font-size:85%;line-height:116%"]'
      );
      const lastUpdatedElement = statusDiv.querySelector(
        'span[style="font-size:55%;line-height:116%"] em'
      );

      if (playerCountElement && lastUpdatedElement) {
        return {
          playerCount: playerCountElement.textContent,
          onlinePlayers: Array.from(onlinePlayersElements).map(
            (el) => el.textContent
          ),
          lastUpdated: lastUpdatedElement.textContent,
        };
      }
    }

    return null;
  }

  function createZomboidStatusHTML(status) {
    if (!status) return "";

    const onlinePlayersList =
      status.onlinePlayers.length > 0
        ? status.onlinePlayers.join(", ")
        : "No players online";

    return `
      <div class="zomboid-status" style="font-size: 0.9em; color: #CCCCCC; margin-top: 5px;">
        • ${onlinePlayersList}<br>
        <span style="font-style: italic; color: #8c8c8c;">${status.lastUpdated}</span>
      </div>
    `;
  }

  function createErrorListItemHTML(threadId) {
    return `
      <li class="row bg1 content-processed" id="pinned-thread-${threadId}">
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

  updateMenuCommand();

  // Main execution
  if (window.location.href.includes("/viewtopic.php")) {
    addPinButton();
  } else if (
    window.location.href.includes("/index.php") ||
    window.location.href.endsWith("/forums/") ||
    window.location.href.includes("/forums/home") ||
    (window.location.href.includes("/search.php?search_id=newposts") &&
      util.getShowOnNewPosts())
  ) {
    createPinnedThreadsSection();
  }
})();
