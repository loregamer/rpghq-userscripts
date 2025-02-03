// ==UserScript==
// @name         RPGHQ Board Index Layout Enhancer
// @namespace    http://rpghq.org/
// @version      1.0
// @description  Moves recent topics to right side of page on RPGHQ board index
// @author       You
// @match        https://rpghq.org/forums/index.php*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // Helper function to create a topic row
  function createTopicRow(topic, index) {
    const authorName =
      topic.querySelector(".mas-username a")?.textContent?.trim() || "";
    const topicTitle =
      topic.querySelector(".topictitle")?.textContent?.trim() || "";
    const topicLink = topic.querySelector(".topictitle")?.href || "#";
    const forumPath = Array.from(topic.querySelectorAll(".responsive-hide a"))
      .slice(1) // Skip the author link
      .map((a) => a.textContent.trim())
      .join(" » ");
    const lastPostAuthor =
      topic.querySelector(".lastpost .mas-username a")?.textContent?.trim() ||
      "";
    const lastPostAvatar =
      topic.querySelector(".lastpost .mas-avatar img")?.src || "";
    const lastPostTime =
      topic.querySelector(".lastpost time")?.textContent?.trim() ||
      topic
        .querySelector(".lastpost")
        ?.textContent?.trim()
        ?.split("»")?.[1]
        ?.trim() ||
      "";
    const lastPostColor =
      topic.querySelector(".lastpost .mas-username a")?.style?.color || "";
    const lastPostLink =
      topic.querySelector('.lastpost a[title="Go to last post"]')?.href || "#";
    const replies =
      topic.querySelector(".posts")?.textContent?.split(" ")?.[0]?.trim() ||
      "0";
    const views =
      topic.querySelector(".views")?.textContent?.split(" ")?.[0]?.trim() ||
      "0";

    // Check if topic is unread
    const isUnread =
      topic.querySelector(".row-item")?.classList?.contains("topic_unread") ||
      topic
        .querySelector(".row-item")
        ?.classList?.contains("topic_unread_hot") ||
      topic
        .querySelector(".row-item")
        ?.classList?.contains("topic_unread_hot_mine");

    // Get unread link if it exists
    const unreadLink = topic.querySelector(
      'a[href*="view=unread#unread"]'
    )?.href;

    return `
      <li class="author-name-${authorName.replace(/\s+/g, "-")} row bg${
      (index % 2) + 1
    }">
        <dl class="row-item ${isUnread ? "topic_unread_hot" : "topic_read"}">
          <dt title="${isUnread ? "Unread posts" : "No unread posts"}">
            ${
              isUnread
                ? `<a href="${unreadLink}" class="row-item-link"></a>`
                : ""
            }
            <div class="list-inner">
              ${
                isUnread
                  ? `
                <a href="${unreadLink}">
                  <i class="icon fa-file fa-fw icon-red icon-md" aria-hidden="true"></i><span class="sr-only"></span>
                </a>`
                  : ""
              }
              <a href="${topicLink}" class="topictitle">${topicTitle}</a>
              <div class="forum-links">
                <a class="forum-link" href="#">${forumPath}</a>
              </div>
              <div class="topic-stats">
                <span class="replies">${replies} replies</span>
                <span class="views">${views} views</span>
              </div>
            </div>
          </dt>
          <dd class="lastpost">
            <span>
              by <div class="mas-wrap">
                <div class="mas-avatar" style="width: 20px; height: 20px;">
                  <img class="avatar" src="${lastPostAvatar}" width="128" height="128" alt="User avatar">
                </div>
                <div class="mas-username">
                  <a href="#" ${
                    lastPostColor ? `style="color: ${lastPostColor};"` : ""
                  } 
                     class="username${
                       lastPostColor ? "-coloured" : ""
                     }">${lastPostAuthor}</a>
                </div>
              </div>
              <br>
              ${lastPostTime}
              <a href="${lastPostLink}" title="Go to last post">
                <i class="icon fa-external-link-square fa-fw ${
                  isUnread ? "icon-red" : "icon-lightgrey"
                } icon-md" aria-hidden="true"></i>
                <span class="sr-only"></span>
              </a>
            </span>
          </dd>
        </dl>
      </li>
    `;
  }

  // Create wrapper for flex layout
  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
        display: flex;
        gap: 20px;
    `;

  // Get the main content and create recent topics box
  const pageBody = document.querySelector("#page-body");
  if (!pageBody) return;

  // Move elements after the time/mark-read section to mainContent
  const mainContent = document.createElement("div");
  mainContent.style.cssText = `
        flex: 1;
        min-width: 0;
    `;

  // Find the action-bar element which is our insertion point
  const actionBar = pageBody.querySelector(".action-bar");
  if (!actionBar) return;

  // Create the recent topics box
  const recentTopicsBox = document.createElement("div");
  recentTopicsBox.id = "recent-topics-box";
  recentTopicsBox.className = "forabg";

  // Get actual recent topics from the page
  const recentTopicsBottom = document.querySelector(
    "#recenttopicsbottom .topics"
  );
  const topicElements = recentTopicsBottom
    ? Array.from(recentTopicsBottom.children)
    : [];

  // Create the HTML structure
  recentTopicsBox.innerHTML = `
    <div class="inner">
      <ul class="topiclist">
        <li class="header">
          <dl class="row-item">
            <dt></dt>
            <dd class="list-inner">&nbsp;Recent Topics</dd>
          </dl>
        </li>
      </ul>
    </div>
    <div id="recent-topics" class="inner collapsible">
      <ul>
        ${topicElements.slice(0, 10).map(createTopicRow).join("")}
      </ul>
    </div>
  `;

  // Style the recent topics section
  recentTopicsBox.style.cssText = `
        width: 300px;
        flex-shrink: 0;
    `;

  // Get all elements after the action bar
  const elementsToMove = [];
  let currentElement = actionBar.nextElementSibling;
  while (currentElement) {
    elementsToMove.push(currentElement);
    currentElement = currentElement.nextElementSibling;
  }

  // Move elements to the main content div
  elementsToMove.forEach((el) => {
    mainContent.appendChild(el);
  });

  // Assemble the new layout
  wrapper.appendChild(mainContent);
  wrapper.appendChild(recentTopicsBox);

  // Insert the wrapper right after the action bar
  actionBar.insertAdjacentElement("afterend", wrapper);

  // Add styles for topic stats
  const style = document.createElement("style");
  style.textContent = `
        @media (max-width: 700px) {
            #page-body > div {
                flex-direction: column;
            }
            #recent-topics-box {
                width: 100%;
            }
        }
        .topic-stats {
            font-size: 0.9em;
            color: #666;
            margin-top: 4px;
        }
        .topic-stats span {
            margin-right: 10px;
        }
        #recent-topics-box .forum-links {
            font-size: 0.9em;
            color: #666;
            margin-top: 2px;
        }
    `;
  document.head.appendChild(style);
})();
