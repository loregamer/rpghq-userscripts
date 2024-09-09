// ==UserScript==
// @name         RPGHQ - Thread Pinner
// @namespace    http://tampermonkey.net/
// @version      3.2.1
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
          onload: (response) => resolve(response.responseText),
          onerror: (error) => reject(error),
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
      const actionBar = pageBody.querySelector(".action-bar.bar-top");
      insertionPoint = actionBar
        ? actionBar.nextElementSibling
        : pageBody.querySelector(".forumbg");
      if (insertionPoint) {
        insertionPoint.parentNode.insertBefore(pinnedSection, insertionPoint);
      }
    } else {
      const indexLeft = pageBody.querySelector(".index-left");
      if (indexLeft) {
        indexLeft.insertAdjacentElement("afterbegin", pinnedSection);
      } else {
        insertionPoint = pageBody.querySelector(".forumbg");
        if (insertionPoint) {
          insertionPoint.parentNode.insertBefore(pinnedSection, insertionPoint);
        }
      }
    }

    // If we couldn't insert the section anywhere, return
    if (!pinnedSection.parentNode) return;

    const pinnedList = pinnedSection.querySelector("#pinned-threads-list");
    const threadIds = Object.keys(pinnedThreads);

    // Create loading placeholders
    for (const threadId of threadIds) {
      pinnedList.insertAdjacentHTML(
        "beforeend",
        createLoadingListItem(threadId)
      );
    }

    // Fetch thread data asynchronously
    const threadDataPromises = threadIds.map(async (threadId) => {
      try {
        const threadData = await fetchThreadData(
          threadId,
          pinnedThreads[threadId]
        );
        return threadData;
      } catch (error) {
        console.error(`Error loading thread ${threadId}:`, error);
        return {
          threadId,
          title: `Error loading thread ${threadId}`,
          sortableTitle: `error loading thread ${threadId}`,
          rowHTML: createErrorListItemHTML(threadId),
        };
      }
    });

    // Wait for all thread data to be fetched
    const threadsData = await Promise.all(threadDataPromises);

    // Sort threads using localeCompare with options
    threadsData.sort((a, b) =>
      a.title.localeCompare(b.title, undefined, {
        numeric: true,
        sensitivity: "base",
        ignorePunctuation: false,
      })
    );

    // Clear the list and add sorted threads
    pinnedList.innerHTML = "";
    threadsData.forEach((threadData) => {
      pinnedList.insertAdjacentHTML("beforeend", threadData.rowHTML);
    });
  }

  function findSearchPageInsertionPoint(pageBody) {
    const actionBar = pageBody.querySelector(".action-bar.bar-top");
    if (actionBar) {
      return actionBar.nextElementSibling;
    }
    return pageBody.querySelector(".forumbg");
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
    return `
      <li class="row bg1" id="pinned-thread-${threadId}">
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
          <dd class="lastpost"><span>Loading...</span></dd>
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

  async function fetchThreadData(threadId, threadInfo) {
    try {
      const { title, forumUrl, status } = await fetchThreadTitleAndForum(
        threadId
      );
      let rowHTML = await fetchThreadRowFromForum(title, forumUrl);

      if (rowHTML) {
        rowHTML = modifyRowHTML(rowHTML, threadId, status);
        const sortableTitle = title.replace(/^[【】\[\]\s]+/, "");
        return { threadId, title, sortableTitle, rowHTML };
      } else {
        throw new Error(`No row HTML found for thread ${threadId}`);
      }
    } catch (error) {
      console.error(`Error processing thread ${threadId}:`, error);
      return {
        threadId,
        title: `Error loading thread ${threadId}`,
        sortableTitle: `Error loading thread ${threadId}`,
        rowHTML: createErrorListItemHTML(threadId),
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

    let status = null;
    if (threadId === ZOMBOID_THREAD_ID) {
      status = fetchZomboidStatus(doc);
    }

    return { title, forumUrl, status };
  }

  async function fetchThreadRowFromForum(threadTitle, forumUrl, page = 1) {
    const url = `${forumUrl}&start=${(page - 1) * 25}`;
    const html = await util.fetchHtml(url);
    const doc = util.parseHtml(html);

    const threadRows = doc.querySelectorAll(".topiclist.topics .row");
    for (const row of threadRows) {
      const rowTitle = row.querySelector(".topictitle").textContent.trim();
      if (rowTitle === threadTitle) {
        return row.outerHTML;
      }
    }

    // If thread not found on this page, check the next page
    const nextPageLink = doc.querySelector(".pagination .next a");
    if (nextPageLink) {
      return fetchThreadRowFromForum(threadTitle, forumUrl, page + 1);
    }

    // If no next page, thread not found
    return null;
  }

  function modifyRowHTML(rowHTML, threadId, status) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rowHTML, "text/html");

    const row = doc.querySelector(".row");
    if (!row) return rowHTML; // Return original if no row found

    // Change "sticky_" classes to "topic_"
    row.querySelectorAll('*[class*="sticky_"]').forEach((element) => {
      element.className = element.className.replace(/\bsticky_/g, "topic_");
    });

    // Hide pagination
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

    // Modify the external link icon
    const lastpostLink = row.querySelector(
      ".lastpost a[title='Go to last post']"
    );
    if (lastpostLink) {
      const externalLinkIcon =
        lastpostLink.querySelector("i") || document.createElement("i");
      externalLinkIcon.className = `icon fa-external-link-square fa-fw icon-${
        isUnread ? "red" : "lightgray"
      } icon-md`;
      externalLinkIcon.setAttribute("aria-hidden", "true");
      if (!lastpostLink.contains(externalLinkIcon)) {
        lastpostLink.innerHTML = "";
        lastpostLink.appendChild(externalLinkIcon);
      }
    }

    // Add Project Zomboid Server text if applicable
    if (threadId === ZOMBOID_THREAD_ID && status) {
      const topicTitle = row.querySelector(".topictitle");
      if (topicTitle) {
        const zomboidStatus = createZomboidStatusHTML(status);
        topicTitle.insertAdjacentHTML("afterend", zomboidStatus);

        // Remove the <br> after zomboid-status
        const zomboidStatusElement = row.querySelector(".zomboid-status");
        if (
          zomboidStatusElement &&
          zomboidStatusElement.nextElementSibling &&
          zomboidStatusElement.nextElementSibling.tagName === "BR"
        ) {
          zomboidStatusElement.nextElementSibling.remove();
        }
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
