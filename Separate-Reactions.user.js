// ==UserScript==
// @name         RPGHQ Reaction List
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Display a list of reactions for RPGHQ posts in a Discord-style with hover popups
// @author       loregamer
// @match        https://rpghq.org/forums/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/main/Separate-Reactions.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/main/Separate-Reactions.user.js
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function createReactionList(postId, reactions) {
    return `
            <div class="reaction-score-list" data-post-id="${postId}" data-title="Reactions">
                <div class="list-scores" style="display: flex; flex-wrap: wrap; gap: 4px;">
                    ${reactions
                      .map(
                        (reaction) => `
                        <div class="reaction-group" style="display: flex; align-items: center; background-color: rgba(255,255,255,0.1); border-radius: 8px; padding: 2px 6px; position: relative;">
                            <img src="${reaction.image}" alt="${
                          reaction.title
                        }" style="width: auto; height: 16px; margin-right: 4px; object-fit: contain;">
                            <span style="font-size: 12px; color: #dcddde;">${
                              reaction.count
                            }</span>
                            <div class="reaction-users-popup" style="display: none; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background-color: #191919; border: 1px solid #202225; border-radius: 4px; padding: 8px; z-index: 1000; color: #dcddde; font-size: 12px; width: 200px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                <div style="font-weight: bold; margin-bottom: 4px;">${
                                  reaction.title
                                }</div>
                                <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                                    ${reaction.users
                                      .map(
                                        (user) => `
                                        <div style="display: flex; align-items: center; width: 100%; margin-bottom: 4px;">
                                            <img src="${user.avatar}" alt="${user.username}" style="width: 24px; height: 24px; border-radius: 50%; margin-right: 8px; object-fit: cover;">
                                            <span style="flex-grow: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${user.username}</span>
                                        </div>
                                    `
                                      )
                                      .join("")}
                                </div>
                            </div>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            </div>
        `;
  }

  function parseReactions(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const reactions = [];

    doc.querySelectorAll(".tab-header a:not(.active)").forEach((a) => {
      const image = a.querySelector("img")?.src;
      const title = a.getAttribute("title");
      const count = a.querySelector(".tab-counter")?.textContent;
      const dataId = a.getAttribute("data-id");
      if (image && title && count && dataId) {
        const users = [];
        doc
          .querySelectorAll(`.tab-content[data-id="${dataId}"] li`)
          .forEach((li) => {
            const username = li.querySelector(".cbb-helper-text a").textContent;
            const avatar = li.querySelector(".user-avatar img").src;
            users.push({ username, avatar });
          });
        reactions.push({ image, title, count, users });
      }
    });

    return reactions;
  }

  function fetchReactions(postId) {
    return fetch(
      `https://rpghq.org/forums/reactions?mode=view&post=${postId}`,
      {
        method: "POST",
        headers: {
          accept: "application/json, text/javascript, */*; q=0.01",
          "x-requested-with": "XMLHttpRequest",
        },
        credentials: "include",
      }
    )
      .then((response) => response.json())
      .then((data) => parseReactions(data.htmlContent));
  }

  function processPost(post) {
    const postId = post.id.substring(1);
    const existingReactionList = post.querySelector(".reaction-score-list");
    if (existingReactionList && !existingReactionList.dataset.processed) {
      updateReactions(post, postId);
    }
  }

  function updateReactions(post, postId) {
    const existingReactionList = post.querySelector(".reaction-score-list");
    if (existingReactionList.dataset.processed) return;

    fetchReactions(postId)
      .then((reactions) => {
        if (reactions.length > 0) {
          const reactionListHtml = createReactionList(postId, reactions);
          existingReactionList.outerHTML = reactionListHtml;

          const newReactionList = post.querySelector(".reaction-score-list");
          newReactionList.dataset.processed = "true";

          // Add hover effect to reaction groups
          newReactionList
            .querySelectorAll(".reaction-group")
            .forEach((group) => {
              group.addEventListener("mouseenter", () => {
                group.querySelector(".reaction-users-popup").style.display =
                  "block";
              });
              group.addEventListener("mouseleave", () => {
                group.querySelector(".reaction-users-popup").style.display =
                  "none";
              });
            });
        }
      })
      .catch((error) => console.error("Error fetching reactions:", error));
  }

  function observePosts() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.classList.contains("post")) {
                processPost(node);
              } else if (node.classList.contains("reaction-score-list")) {
                const post = node.closest(".post");
                if (post) {
                  processPost(post);
                }
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Process existing posts
    document.querySelectorAll(".post").forEach(processPost);
  }

  // Run the script when the page is fully loaded
  window.addEventListener("load", observePosts);
})();
