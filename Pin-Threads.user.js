// ==UserScript==
// @name         RPGHQ - Thread & Forum Pinner
// @namespace    http://tampermonkey.net/
// @version      3.6.0
// @description  Add pin/unpin buttons to threads and forums on rpghq.org and display them at the top of the board index
// @match        https://rpghq.org/forums/index.php
// @match        https://rpghq.org/forums/home
// @match        https://rpghq.org/forums/viewforum.php*
// @match        https://rpghq.org/forums/viewtopic.php*
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
  const PINNED_FORUMS_KEY = "rpghq_pinned_forums";
  const SHOW_ON_NEW_POSTS_KEY = "rpghq_show_pinned_on_new_posts";
  const ZOMBOID_THREAD_ID = "2756";

  let menuCommandId = null;

  // Utility functions
  const util = {
    getPinnedThreads: () => GM_getValue(PINNED_THREADS_KEY, {}),
    setPinnedThreads: (threads) => GM_setValue(PINNED_THREADS_KEY, threads),
    getPinnedForums: () => GM_getValue(PINNED_FORUMS_KEY, {}),
    setPinnedForums: (forums) => GM_setValue(PINNED_FORUMS_KEY, forums),
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
    getForumId: () => {
      const match = window.location.href.match(/[?&]f=(\d+)/);
      return match ? match[1] : null;
    },
    getForumName: () => {
      const forumTitleElement = document.querySelector("h2.forum-title");
      return forumTitleElement ? forumTitleElement.textContent.trim() : null;
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
    // For backward compatibility, redirect to the new function
    addThreadPinButton();
  }

  function createPinButton(threadId) {
    // For backward compatibility, redirect to the new function
    return createThreadPinButton(threadId);
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
    const pinnedForums = util.getPinnedForums();

    // If there's nothing to display, exit early
    if (
      Object.keys(pinnedThreads).length === 0 &&
      Object.keys(pinnedForums).length === 0
    )
      return;

    // Determine the correct insertion point based on the current page
    let insertionPoint;
    if (window.location.href.includes("/search.php")) {
      insertionPoint = findSearchPageInsertionPoint(pageBody);
    } else {
      const indexLeft = pageBody.querySelector(".index-left");
      insertionPoint = indexLeft || pageBody.querySelector(".forumbg");
    }

    if (!insertionPoint) return;

    // Create and insert pinned sections if needed
    if (Object.keys(pinnedForums).length > 0) {
      const pinnedForumsSection = createPinnedForumsSectionElement();

      // Insert the pinned forums section
      if (insertionPoint.classList.contains("index-left")) {
        insertionPoint.insertAdjacentElement("afterbegin", pinnedForumsSection);
      } else {
        insertionPoint.parentNode.insertBefore(
          pinnedForumsSection,
          insertionPoint
        );
      }

      populatePinnedForumsSection(pinnedForumsSection);
    }

    if (Object.keys(pinnedThreads).length > 0) {
      const pinnedThreadsSection = createPinnedThreadsSectionElement();

      // Insert the pinned threads section
      if (insertionPoint.classList.contains("index-left")) {
        insertionPoint.insertAdjacentElement(
          "afterbegin",
          pinnedThreadsSection
        );
      } else {
        if (Object.keys(pinnedForums).length > 0) {
          // If we already have pinned forums, insert after that section
          const pinnedForumsSection = document.getElementById("pinned-forums");
          if (pinnedForumsSection) {
            pinnedForumsSection.insertAdjacentElement(
              "afterend",
              pinnedThreadsSection
            );
          } else {
            insertionPoint.parentNode.insertBefore(
              pinnedThreadsSection,
              insertionPoint
            );
          }
        } else {
          insertionPoint.parentNode.insertBefore(
            pinnedThreadsSection,
            insertionPoint
          );
        }
      }

      await populatePinnedThreadsSection(pinnedThreadsSection);
    }
  }

  function populatePinnedForumsSection(pinnedSection) {
    const pinnedForums = util.getPinnedForums();
    const pinnedList = pinnedSection.querySelector("#pinned-forums-list");

    // Sort forums by name
    const sortedForums = Object.entries(pinnedForums).sort(([, a], [, b]) =>
      a.name.localeCompare(b.name, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );

    // Add each forum to the list
    sortedForums.forEach(([forumId, forumInfo]) => {
      // First try to find the forum row on the page
      const existingRow = findExistingForumRow(forumId);

      if (existingRow) {
        // If found, clone and modify the row
        const clonedRow = existingRow.cloneNode(true);
        clonedRow.id = `pinned-forum-${forumId}`;

        // Remove any unwanted elements or classes
        clonedRow.querySelectorAll(".pagination").forEach((el) => el.remove());
        clonedRow.classList.add("content-processed");

        pinnedList.appendChild(clonedRow);
      } else {
        // If not found, create a new row
        pinnedList.insertAdjacentHTML(
          "beforeend",
          createForumListItemHTML(forumId, forumInfo)
        );
      }
    });
  }

  function findExistingForumRow(forumId) {
    // Look for forum rows on the current page
    const forumRows = document.querySelectorAll(".topiclist.forums .row");

    for (const row of forumRows) {
      const forumLink = row.querySelector("a.forumtitle");
      if (forumLink && forumLink.href.includes(`f=${forumId}`)) {
        return row;
      }
    }

    return null;
  }

  function createForumListItemHTML(forumId, forumInfo) {
    return `
      <li class="row content-processed" id="pinned-forum-${forumId}">
        <dl class="row-item forum_read">
          <dt title="${forumInfo.name}">
            <div class="list-inner">
              <a href="${forumInfo.url}" class="forumtitle">${forumInfo.name}</a>
              <br><span class="forum-path responsive-hide">${forumInfo.breadcrumbs}</span>
            </div>
          </dt>
          <dd class="posts">-</dd>
          <dd class="views">-</dd>
        </dl>
      </li>
    `;
  }

  function findSearchPageInsertionPoint(pageBody) {
    const actionBar = pageBody.querySelector(".action-bar.bar-top");
    return actionBar
      ? actionBar.nextElementSibling
      : pageBody.querySelector(".forumbg");
  }

  function createPinnedSectionsContainer() {
    const sectionsContainer = document.createElement("div");
    sectionsContainer.id = "pinned-sections-container";
    return sectionsContainer;
  }

  function createPinnedThreadsSectionElement() {
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

  function createPinnedForumsSectionElement() {
    const section = document.createElement("div");
    section.id = "pinned-forums";
    section.className = "forabg";
    section.innerHTML = `
      <div class="inner">
        <ul class="topiclist content-processed">
          <li class="header">
            <dl class="row-item">
              <dt><div class="list-inner">Pinned Forums</div></dt>
              <dd class="posts">Topics</dd>
              <dd class="views">Posts</dd>
            </dl>
          </li>
        </ul>
        <ul class="topiclist forums content-processed" id="pinned-forums-list"></ul>
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
      #pinned-threads, #pinned-forums {
        margin-bottom: 20px;
      }
      #pinned-threads .topiclist.topics, #pinned-forums .topiclist.forums {
        margin-top: 0;
      }
      .pin-button {
        margin-left: 10px;
        cursor: pointer;
      }
      #pinned-threads .topic-poster .by, #pinned-forums .forum-poster .by {
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
      #pinned-threads .pagination, #pinned-forums .pagination {
        display: none !important;
      }
      .forum-path {
        font-size: 0.9em;
        color: #8c8c8c;
      }
      @media (max-width: 700px) {
        #pinned-threads .responsive-show, #pinned-forums .responsive-show {
          display: none !important;
        }
        #pinned-threads .responsive-hide, #pinned-forums .responsive-hide {
          display: none !important;
        }
      }
    `);
  }

  updateMenuCommand();

  // Main execution
  if (window.location.href.includes("/viewtopic.php")) {
    addThreadPinButton();
  } else if (window.location.href.includes("/viewforum.php")) {
    addForumPinButton();
  } else if (
    window.location.href.includes("/index.php") ||
    window.location.href.endsWith("/forums/") ||
    window.location.href.includes("/forums/home") ||
    (window.location.href.includes("/search.php?search_id=newposts") &&
      util.getShowOnNewPosts())
  ) {
    createPinnedThreadsSection();
  }

  async function populatePinnedThreadsSection(pinnedSection) {
    const pinnedThreads = util.getPinnedThreads();
    const pinnedList = pinnedSection.querySelector("#pinned-threads-list");
    const threadIds = Object.keys(pinnedThreads);

    // First, check if threads exist on the current page
    const existingThreadRows = findExistingThreadRows(threadIds);

    // For threads that don't exist on the page, we'll need to fetch them
    const threadsToFetch = threadIds.filter(
      (id) => !existingThreadRows.has(id)
    );

    // Create loading placeholders for threads we need to fetch
    threadsToFetch.forEach((threadId) => {
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

    // Add existing thread rows first
    for (const [threadId, row] of existingThreadRows.entries()) {
      const clonedRow = row.cloneNode(true);
      clonedRow.id = `pinned-thread-${threadId}`;

      // Remove any unwanted elements or classes
      clonedRow.querySelectorAll(".pagination").forEach((el) => el.remove());
      clonedRow.classList.add("content-processed");

      // Find the placeholder if it exists and replace it, or just append
      const placeholder = pinnedList.querySelector(
        `#pinned-thread-${threadId}`
      );
      if (placeholder) {
        pinnedList.replaceChild(clonedRow, placeholder);
      } else {
        pinnedList.appendChild(clonedRow);
      }
    }

    // Fetch and process threads that don't exist on the page
    if (threadsToFetch.length > 0) {
      const threadsData = await Promise.all(
        threadsToFetch.map((threadId) =>
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
      threadsData.forEach((threadData) => {
        const placeholder = pinnedList.querySelector(
          `#pinned-thread-${threadData.threadId}`
        );
        if (placeholder) {
          placeholder.outerHTML = threadData.rowHTML;
        } else {
          pinnedList.insertAdjacentHTML("beforeend", threadData.rowHTML);
        }
      });
    }

    // Sort all thread rows now that we have all of them
    const allRows = Array.from(pinnedList.children);
    allRows.sort((a, b) => {
      const aTitle = a.querySelector(".topictitle")?.textContent || "";
      const bTitle = b.querySelector(".topictitle")?.textContent || "";
      return aTitle.localeCompare(bTitle, undefined, {
        numeric: true,
        sensitivity: "base",
        ignorePunctuation: false,
      });
    });

    // Re-append in sorted order
    allRows.forEach((row) => pinnedList.appendChild(row));

    // Adjust scroll position if necessary
    const newHeight = pinnedSection.offsetHeight;
    const heightDifference = newHeight - initialHeight;

    if (!isVisible && heightDifference > 0) {
      window.scrollBy(0, heightDifference);
    }

    // Clean up the observer
    observer.disconnect();
  }

  function findExistingThreadRows(threadIds) {
    const result = new Map();
    const threadRowsOnPage = document.querySelectorAll(
      ".topiclist.topics .row"
    );

    for (const row of threadRowsOnPage) {
      const threadLink = row.querySelector("a.topictitle");
      if (threadLink) {
        for (const threadId of threadIds) {
          if (threadLink.href.includes(`t=${threadId}`)) {
            result.set(threadId, row);
            break;
          }
        }
      }
    }

    return result;
  }

  // Thread pinning functions
  function addThreadPinButton() {
    const actionBar = document.querySelector(".action-bar.bar-top");
    const threadId = util.getThreadId();
    if (
      actionBar &&
      threadId &&
      !document.getElementById("pin-thread-button")
    ) {
      const dropdownContainer = createDropdownContainer();
      const pinButton = createThreadPinButton(threadId);
      dropdownContainer.appendChild(pinButton);
      actionBar.insertBefore(dropdownContainer, actionBar.firstChild);
      addResponsiveStyle();
    }
  }

  function createThreadPinButton(threadId) {
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

  // Forum pinning functions
  function addForumPinButton() {
    const actionBar = document.querySelector(".action-bar.bar-top");
    const forumId = util.getForumId();
    const forumName = util.getForumName();

    if (
      actionBar &&
      forumId &&
      forumName &&
      !document.getElementById("pin-forum-button")
    ) {
      const dropdownContainer = createDropdownContainer();
      const pinButton = createForumPinButton(forumId);
      dropdownContainer.appendChild(pinButton);
      // Add the pin button at the start of the action bar
      actionBar.insertBefore(dropdownContainer, actionBar.firstChild);
      addResponsiveStyle();
    }
  }

  function createForumPinButton(forumId) {
    const button = document.createElement("span");
    button.id = "pin-forum-button";
    button.className = "button button-secondary dropdown-trigger";

    const pinnedForums = util.getPinnedForums();
    const isPinned = pinnedForums.hasOwnProperty(forumId);
    updatePinButtonState(button, isPinned);

    button.addEventListener("click", (e) => {
      e.preventDefault();
      togglePinForum(forumId, button);
    });

    return button;
  }

  function togglePinForum(forumId, button) {
    const pinnedForums = util.getPinnedForums();
    const forumInfo = getForumInfo();

    if (pinnedForums.hasOwnProperty(forumId)) {
      delete pinnedForums[forumId];
    } else {
      pinnedForums[forumId] = forumInfo;
    }

    util.setPinnedForums(pinnedForums);
    updatePinButtonState(button, pinnedForums.hasOwnProperty(forumId));
  }

  function getForumInfo() {
    const forumName = util.getForumName();
    const breadcrumbs = document.querySelectorAll(".crumb");
    const breadcrumbsPath = Array.from(breadcrumbs)
      .filter((crumb) => crumb.querySelector("a"))
      .map((crumb) => crumb.querySelector("a").textContent.trim())
      .join(" » ");

    return {
      name: forumName,
      breadcrumbs: breadcrumbsPath,
      url: window.location.href.split("&start=")[0], // Remove pagination
    };
  }

  function createDropdownContainer() {
    const container = document.createElement("div");
    container.className =
      "dropdown-container dropdown-button-control topic-tools";
    return container;
  }

  function updatePinButtonState(button, isPinned) {
    button.innerHTML = isPinned
      ? '<i class="icon fa-thumb-tack fa-fw" aria-hidden="true"></i><span>Unpin</span>'
      : '<i class="icon fa-thumb-tack fa-fw" aria-hidden="true"></i><span>Pin</span>';
    button.title = isPinned ? "Unpin" : "Pin";
  }
})();
