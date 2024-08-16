// ==UserScript==
// @name         RPGHQ Reaction List
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Display a list of reactions for RPGHQ posts in a Discord-style with click functionality
// @author       loregamer
// @match        https://rpghq.org/forums/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const reactionMap = {
    Care: "3",
    Watermelon: "8",
    Thanks: "10",
    Agree: "11",
    Disagree: "12",
    Informative: "13",
    Mad: "14",
    Funny: "15",
    Sad: "16",
    "Hmm...": "18",
    Toot: "19",
    404: "20",
  };

  function createReactionList(postId, reactions, userReaction) {
    const reactionListHtml = `
              <div class="reaction-list" data-post-id="${postId}" style="display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin-top: 8px;">
                  ${reactions
                    .map(
                      (reaction) => `
                      <div class="reaction-group ${
                        reaction.title === userReaction ? "selected" : ""
                      }" data-reaction-id="${
                        reactionMap[reaction.title]
                      }" style="display: flex; align-items: center; background-color: ${
                        reaction.title === userReaction
                          ? "rgba(255,255,255,0.3)"
                          : "rgba(255,255,255,0.1)"
                      }; border-radius: 8px; padding: 2px 6px; cursor: pointer; position: relative;">
                          <img src="${reaction.image}" alt="${
                        reaction.title
                      }" style="width: 16px; height: 16px; margin-right: 4px;">
                          <span style="font-size: 12px; color: #dcddde;">${
                            reaction.count
                          }</span>
                          <div class="reaction-users-popup" style="display: none; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background-color: #36393f; border: 1px solid #202225; border-radius: 4px; padding: 8px; z-index: 1000; color: #dcddde; font-size: 12px; width: 200px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                              <div style="font-weight: bold; margin-bottom: 4px;">${
                                reaction.title
                              }</div>
                              <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                                  ${reaction.users
                                    .map(
                                      (user) => `
                                      <div style="display: flex; align-items: center; margin-right: 4px;">
                                          <img src="${user.avatar}" alt="${user.username}" style="width: 24px; height: 24px; border-radius: 50%; margin-right: 4px;">
                                          <span>${user.username}</span>
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
          `;

    return reactionListHtml;
  }

  function parseReactions(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const reactions = [];
    let userReaction = null;

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

    // Check for user's reaction
    const userReactionElement = doc.querySelector(
      ".reactions-launcher .reaction-button:not(.default-icon)"
    );
    if (userReactionElement) {
      userReaction = userReactionElement.querySelector("span").textContent;
    }

    return { reactions, userReaction };
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

  function addReaction(postId, reactionId) {
    return fetch(`https://rpghq.org/forums/reactions?post=${postId}&user=551`, {
      method: "POST",
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "x-requested-with": "XMLHttpRequest",
      },
      body: `mode=add_reaction&reaction=${reactionId}`,
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          return fetchReactions(postId);
        } else {
          throw new Error("Failed to add reaction");
        }
      });
  }

  function processPost(post) {
    const postId = post.id.substring(1);
    const existingReactionList = post.querySelector(".reaction-score-list");
    const existingLauncher = post.querySelector(".reactions-launcher");
    if (existingReactionList && existingLauncher) {
      fetchReactions(postId)
        .then(({ reactions, userReaction }) => {
          if (reactions.length > 0) {
            const reactionListHtml = createReactionList(
              postId,
              reactions,
              userReaction
            );
            existingReactionList.outerHTML = reactionListHtml;

            // Move the existing launcher to the end of the reaction list
            const newReactionList = post.querySelector(".reaction-list");
            newReactionList.appendChild(existingLauncher);

            // Add hover effect and click event to reaction groups
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

                // Add click event to set reaction
                group.addEventListener("click", (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const reactionId = group.dataset.reactionId;
                  addReaction(postId, reactionId)
                    .then(({ reactions, userReaction }) => {
                      const updatedReactionListHtml = createReactionList(
                        postId,
                        reactions,
                        userReaction
                      );
                      newReactionList.outerHTML = updatedReactionListHtml;
                      processPost(post); // Reprocess the post to add event listeners
                    })
                    .catch((error) =>
                      console.error("Error adding reaction:", error)
                    );
                });
              });
          }
        })
        .catch((error) => console.error("Error fetching reactions:", error));
    }
  }

  function observePosts() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (
              node.nodeType === Node.ELEMENT_NODE &&
              node.classList.contains("post")
            ) {
              processPost(node);
            }
          });
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Process existing posts
    document.querySelectorAll(".post").forEach(processPost);
  }

  // Run the script when the page is fully loaded
  window.addEventListener("load", observePosts);
})();
