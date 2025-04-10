// RPGHQ - Pin Threads
/**
 * Adds a Pin button to threads so you can see them in board index
 * Original script by loregamer, adapted for the RPGHQ Userscript Manager.
 * License: MIT
 *
 * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/pinThreads.md for documentation
 */

export function init() {
  const PINNED_FORUMS_KEY = "rpghq_pinned_forums";
  const SHOW_ON_NEW_POSTS_KEY = "rpghq_show_pinned_on_new_posts";
  const ZOMBOID_THREAD_ID = "2756";

  let menuCommandId = null;

  // Utility functions
  const util = {
    getPinnedForums: () => GM_getValue(PINNED_FORUMS_KEY, {}),
    setPinnedForums: (forums) => GM_setValue(PINNED_FORUMS_KEY, forums),
    getShowOnNewPosts: () => GM_getValue(SHOW_ON_NEW_POSTS_KEY, false),
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
      ? "[Pinned Threads] Disable on New Posts"
      : "[Pinned Threads] Enable on New Posts";
    menuCommandId = GM_registerMenuCommand(label, toggleNewPostsDisplay);
  }
}

// --- Exported Function for Refreshing Pinned View ---
export async function refreshPinnedView(pinnedThreads) {
  // Remove existing pinned threads section if it exists
  const existingSection = document.getElementById("pinned-threads");
  if (existingSection) {
    existingSection.remove();
  }

  const threadIds = Object.keys(pinnedThreads);
  if (threadIds.length === 0) return; // Nothing to pin

  const pageBody = document.querySelector("#page-body");
  if (!pageBody) return;

  // --- Determine Insertion Point (copied from createPinnedThreadsSection) ---
  let insertionPoint;
  if (window.location.href.includes("/search.php")) {
    insertionPoint = findSearchPageInsertionPoint(pageBody);
  } else {
    const indexLeft = pageBody.querySelector(".index-left");
    insertionPoint = indexLeft || pageBody.querySelector(".forumbg");
  }
  if (!insertionPoint) return;

  // --- Create Pinned Threads Section Element (copied from create...) ---
  const pinnedThreadsSection = createPinnedThreadsSectionElement();

  // --- Insert the Pinned Threads Section ---
  const existingForumsSection = document.getElementById("pinned-forums");
  if (insertionPoint.classList.contains("index-left")) {
    if (existingForumsSection) {
      insertionPoint.insertBefore(
        pinnedThreadsSection,
        existingForumsSection.nextSibling,
      ); // Insert after forums if they exist
    } else {
      insertionPoint.insertAdjacentElement("afterbegin", pinnedThreadsSection); // Insert at top if no forums
    }
  } else {
    if (existingForumsSection) {
      existingForumsSection.insertAdjacentElement(
        "afterend",
        pinnedThreadsSection,
      ); // Insert after forums
    } else {
      insertionPoint.parentNode.insertBefore(
        pinnedThreadsSection,
        insertionPoint,
      ); // Insert before main content
    }
  }

  // --- Populate Pinned Threads Section (logic will be added next) ---
  await _populatePinnedThreadsSectionInternal(
    pinnedThreadsSection,
    pinnedThreads,
    threadIds,
  );
}

function populatePinnedForumsSection(pinnedSection) {
  const pinnedForums = util.getPinnedForums();
  const pinnedList = pinnedSection.querySelector("#pinned-forums-list");

  // Sort forums by name
  const sortedForums = Object.entries(pinnedForums).sort(([, a], [, b]) =>
    a.name.localeCompare(b.name, undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );

  // Add each forum to the list
  sortedForums.forEach(([forumId, forumInfo]) => {
    // First try to find the forum row on the page
    const existingRow = findExistingForumRow(forumId);

    if (existingRow) {
      if (existingRow.dataset && existingRow.dataset.isSubforum) {
        // This is a synthetic row from a subforum link
        const isUnread = existingRow.dataset.isUnread === "true";
        forumInfo.isUnread = isUnread;
        // Add parent forum name to the forum info
        if (existingRow.dataset.parentForumName) {
          forumInfo.parentForumName = existingRow.dataset.parentForumName;
        }
        const html = createForumListItemHTML(forumId, forumInfo);
        pinnedList.insertAdjacentHTML("beforeend", html);
      } else {
        // This is a regular forum row
        const clonedRow = existingRow.cloneNode(true);
        clonedRow.id = `pinned-forum-${forumId}`;

        // Check if this forum is unread
        const dlElement = clonedRow.querySelector("dl");
        if (
          dlElement &&
          (dlElement.classList.contains("forum_unread") ||
            dlElement.classList.contains("forum_unread_subforum") ||
            dlElement.classList.contains("forum_unread_locked"))
        ) {
          // Keep the unread classes
        } else {
          // Make sure we use the read class
          if (dlElement) {
            dlElement.className = dlElement.className.replace(
              /forum_\w+/g,
              "forum_read",
            );
          }
        }

        // Remove subforum sections and clean up commas
        const subforumSections = clonedRow.querySelectorAll("strong");
        subforumSections.forEach((section) => {
          if (section.textContent.includes("Subforums:")) {
            // Remove the "Subforums:" text
            section.remove();

            // Find and remove all subforum links that follow
            const listInner = clonedRow.querySelector(".list-inner");
            if (listInner) {
              listInner.querySelectorAll("a.subforum").forEach((link) => {
                link.remove();
              });
            }
          }
        });

        // Remove any text nodes that might contain "Subforums:" text or stray commas
        const listInner = clonedRow.querySelector(".list-inner");
        if (listInner) {
          const walker = document.createTreeWalker(
            listInner,
            NodeFilter.SHOW_TEXT,
          );
          const textNodesToProcess = [];

          while (walker.nextNode()) {
            const textNode = walker.currentNode;
            if (
              textNode.textContent.includes("Subforums:") ||
              /^\s*,\s*$/.test(textNode.textContent)
            ) {
              textNodesToProcess.push(textNode);
            }
          }

          textNodesToProcess.forEach((node) => {
            // If it's just commas and whitespace, remove it entirely
            if (/^\s*[,\s]*\s*$/.test(node.textContent)) {
              node.remove();
            } else {
              // Otherwise, clean up any trailing commas
              node.textContent = node.textContent
                .replace(/\s*,\s*,\s*/g, "")
                .trim();
            }
          });
        }

        // Remove any unwanted elements or classes
        clonedRow.querySelectorAll(".pagination").forEach((el) => el.remove());
        clonedRow.classList.add("content-processed");

        pinnedList.appendChild(clonedRow);
      }
    } else {
      // If not found, create a new row
      pinnedList.insertAdjacentHTML(
        "beforeend",
        createForumListItemHTML(forumId, forumInfo),
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

  // If not found in main forums, look for it in subforums
  const subforums = document.querySelectorAll("a.subforum");
  for (const subforum of subforums) {
    if (subforum.href.includes(`f=${forumId}`)) {
      // Create a synthetic row based on the subforum link
      const isUnread = subforum.classList.contains("unread");
      const forumName = subforum.textContent.trim();

      // Find the parent forum name
      let parentForumName = "Unknown Forum";
      const forumtitle = subforum
        .closest(".row")
        ?.querySelector("a.forumtitle");
      if (forumtitle) {
        parentForumName = forumtitle.textContent.trim();
      }

      const row = document.createElement("div");
      row.dataset.isSubforum = "true";
      row.dataset.isUnread = isUnread;
      row.dataset.forumName = forumName;
      row.dataset.forumUrl = subforum.href;
      row.dataset.parentForumName = parentForumName;
      return row;
    }
  }

  return null;
}

function createForumListItemHTML(forumId, forumInfo) {
  const isUnread = forumInfo.isUnread || false;
  const forumClass = isUnread ? "forum_unread_subforum" : "forum_read";
  const iconClass = isUnread ? "icon-red" : "";

  // Create breadcrumbs text based on whether it's a subforum
  let breadcrumbsText = forumInfo.breadcrumbs || "";
  if (forumInfo.parentForumName) {
    breadcrumbsText = `Subforum of ${forumInfo.parentForumName}`;
  }

  return `
        <li class="row content-processed" id="pinned-forum-${forumId}">
          <dl class="row-item ${forumClass}">
            <dt title="${forumInfo.name}">
              <div class="list-inner">
                <a href="${forumInfo.url}" class="forumtitle">${forumInfo.name}</a>
                <br><span class="forum-path responsive-hide">${breadcrumbsText}</span>
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
                <dt><div class="list-inner"><i class="icon fa-thumb-tack fa-fw icon-sm" aria-hidden="true"></i> Pinned Topics</div></dt>
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
                <dt><div class="list-inner"><i class="icon fa-thumb-tack fa-fw icon-sm" aria-hidden="true"></i> Pinned Forums</div></dt>
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
    ([threadId, threadInfo]) => fetchThreadData(threadId, threadInfo),
  );
  return Promise.all(threadDataPromises);
}

function createCustomThreadRowHTML(
  threadId,
  title,
  forumName,
  forumUrl,
  errorMessage = "",
) {
  const titleWithError = errorMessage ? `${title} (${errorMessage})` : title;
  const forumInfo =
    forumName && forumUrl ? `» in <a href="${forumUrl}">${forumName}</a>` : "";

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
        "Thread not found in forum list",
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
        errorMessage,
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
  maxPages = 5,
) {
  const url = `${forumUrl}&start=${(page - 1) * 25}`;

  try {
    const html = await util.fetchHtml(url);
    const doc = util.parseHtml(html);

    // Check if we're redirected to a login page or error page
    const loginForm = doc.querySelector('form[action="./ucp.php?mode=login"]');
    if (loginForm) {
      throw new Error(
        "Redirected to login page. User might not be authenticated.",
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
      return fetchThreadRowFromForum(threadTitle, forumUrl, page + 1, maxPages);
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
    'span[style="background-color:black"] strong.text-strong',
  );

  if (playerCountElement) {
    const statusDiv = playerCountElement.closest("div");
    const onlinePlayersElements = statusDiv.querySelectorAll(
      'span[style="font-size:85%;line-height:116%"]',
    );
    const lastUpdatedElement = statusDiv.querySelector(
      'span[style="font-size:55%;line-height:116%"] em',
    );

    if (playerCountElement && lastUpdatedElement) {
      return {
        playerCount: playerCountElement.textContent,
        onlinePlayers: Array.from(onlinePlayersElements).map(
          (el) => el.textContent,
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
  // createPinnedThreadsSection(); // Removed - Now called by threadPrefs.js via refreshPinnedView
}

async function _populatePinnedThreadsSectionInternal(
  pinnedThreadsSection,
  pinnedThreads,
  threadIds,
) {
  // --- Populate Pinned Threads Section (logic from populatePinnedThreadsSection) ---
  const pinnedList = pinnedThreadsSection.querySelector("#pinned-threads-list");

  // Check for threads on current page
  const existingThreadRows = findExistingThreadRows(threadIds);
  const threadsToFetch = threadIds.filter((id) => !existingThreadRows.has(id));

  // Create loading placeholders
  threadsToFetch.forEach((threadId) => {
    pinnedList.insertAdjacentHTML("beforeend", createLoadingListItem(threadId));
  });

  // Observer setup
  let isVisible = false;
  const observer = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0].isIntersecting;
    },
    { threshold: 0.1 },
  );
  observer.observe(pinnedThreadsSection);
  const initialHeight = pinnedThreadsSection.offsetHeight;

  // Add existing rows
  for (const [threadId, row] of existingThreadRows.entries()) {
    const clonedRow = row.cloneNode(true);
    clonedRow.id = `pinned-thread-${threadId}`;
    clonedRow.querySelectorAll(".pagination").forEach((el) => el.remove());
    clonedRow.classList.add("content-processed");
    const placeholder = pinnedList.querySelector(`#pinned-thread-${threadId}`);
    if (placeholder) {
      pinnedList.replaceChild(clonedRow, placeholder);
    } else {
      pinnedList.appendChild(clonedRow);
    }
  }

  // Fetch missing threads
  if (threadsToFetch.length > 0) {
    const threadsData = await Promise.all(
      threadsToFetch.map((threadId) =>
        fetchThreadData(threadId, pinnedThreads[threadId]).catch((error) => ({
          threadId,
          title: `Error loading thread ${threadId}`,
          sortableTitle: `error loading thread ${threadId}`,
          rowHTML: createErrorListItemHTML(threadId),
        })),
      ),
    );

    // Sort fetched threads (using sortableTitle for robustness)
    threadsData.sort((a, b) =>
      (a.sortableTitle || a.title).localeCompare(
        b.sortableTitle || b.title,
        undefined,
        { numeric: true, sensitivity: "base", ignorePunctuation: false },
      ),
    );

    // Update list with fetched threads
    threadsData.forEach((threadData) => {
      const placeholder = pinnedList.querySelector(
        `#pinned-thread-${threadData.threadId}`,
      );
      if (placeholder) {
        placeholder.outerHTML = threadData.rowHTML;
      } else {
        pinnedList.insertAdjacentHTML("beforeend", threadData.rowHTML);
      }
    });
  }

  // Sort all rows
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
  allRows.forEach((row) => pinnedList.appendChild(row)); // Re-append sorted

  // Scroll adjustment
  const newHeight = pinnedThreadsSection.offsetHeight;
  const heightDifference = newHeight - initialHeight;
  if (!isVisible && heightDifference > 0) {
    window.scrollBy(0, heightDifference);
  }

  observer.disconnect(); // Clean up observer
}

// Function removed - logic moved to _populatePinnedThreadsSectionInternal
// async function populatePinnedThreadsSection(pinnedSection) { ... }

function findExistingThreadRows(threadIds) {
  const result = new Map();
  const threadRowsOnPage = document.querySelectorAll(".topiclist.topics .row");

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

// Function removed - handled by threadPrefs.js

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

// Function removed - handled by threadPrefs.js
