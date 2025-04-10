// RPGHQ - Pinned Threads Rendering
/**
 * Renders the pinned threads view.
 * Adapted from original script by loregamer.
 * License: MIT
 *
 * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/pinThreads.md for documentation
 */

const ZOMBOID_THREAD_ID = "2756";

// Minimal utility functions needed for rendering
const util = {
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

  // --- Determine Insertion Point ---
  let insertionPoint;
  if (window.location.href.includes("/search.php")) {
    insertionPoint = findSearchPageInsertionPoint(pageBody);
  } else {
    // On index/home, insert before the first forum category
    insertionPoint = pageBody.querySelector(".forumbg");
  }
  if (!insertionPoint) {
    // Fallback if no .forumbg found
    console.warn("PinThreads: Could not find standard insertion point.");
    insertionPoint = pageBody.firstChild;
  }

  // --- Create Pinned Threads Section Element ---
  const pinnedThreadsSection = createPinnedThreadsSectionElement();

  // --- Insert the Pinned Threads Section ---
  // Always insert before the determined insertion point
  insertionPoint.parentNode.insertBefore(pinnedThreadsSection, insertionPoint);

  // --- Populate Pinned Threads Section ---
  await _populatePinnedThreadsSectionInternal(
    pinnedThreadsSection,
    pinnedThreads,
    threadIds,
  );
}

// --- Helper Functions for Pinned Threads View ---

function findSearchPageInsertionPoint(pageBody) {
  const actionBar = pageBody.querySelector(".action-bar.bar-top");
  return actionBar
    ? actionBar.nextElementSibling
    : pageBody.querySelector(".forumbg");
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

// --- Helper Functions Used Only By refreshPinnedView ---
