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

  // Sample topics data
  const sampleTopics = [
    {
      author: "Classix",
      title: "What are you listening to right now?",
      forum: "Other » HQ's Theater",
      lastPost: {
        author: "Classix",
        time: "1 minute ago",
        avatar: "./download/file.php?avatar=3607_1737756902.png",
      },
    },
    {
      author: "Val the Moofia Boss",
      title: "What can be done to revive the MMO genre?",
      forum: "Gaming » Online RPGs",
      lastPost: {
        author: "Tweed",
        time: "7 minutes ago",
        avatar: "./download/file.php?avatar=68_1718243351.png",
        color: "#0080FF",
      },
    },
  ];

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
        ${sampleTopics
          .map(
            (topic, index) => `
          <li class="author-name-${topic.author.replace(/\s+/g, "-")} row bg${
              (index % 2) + 1
            }">
            <dl class="row-item topic_read">
              <dt title="No unread posts">
                <div class="list-inner">
                  <a href="#" class="topictitle">${topic.title}</a>
                  <div class="forum-links">
                    <a class="forum-link" href="#">${topic.forum}</a>
                  </div>
                </div>
              </dt>
              <dd class="lastpost">
                <span>
                  by <div class="mas-wrap">
                    <div class="mas-avatar" style="width: 20px; height: 20px;">
                      <img class="avatar" src="${
                        topic.lastPost.avatar
                      }" width="128" height="128" alt="User avatar">
                    </div>
                    <div class="mas-username">
                      <a href="#" ${
                        topic.lastPost.color
                          ? `style="color: ${topic.lastPost.color};"`
                          : ""
                      } class="username${
              topic.lastPost.color ? "-coloured" : ""
            }">${topic.lastPost.author}</a>
                    </div>
                  </div>
                  <br>
                  ${topic.lastPost.time}
                  <a href="#" title="Go to last post">
                    <i class="icon fa-external-link-square fa-fw icon-lightgrey icon-md" aria-hidden="true"></i>
                    <span class="sr-only"></span>
                  </a>
                </span>
              </dd>
              <dd class="status-icons">
                <br>
              </dd>
            </dl>
          </li>
        `
          )
          .join("")}
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

  // Adjust responsive styles
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
    `;
  document.head.appendChild(style);
})();
