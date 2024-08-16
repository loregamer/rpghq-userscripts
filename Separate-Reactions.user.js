// ==UserScript==
// @name         RPGHQ Reaction List (Discord-style)
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Display a list of reactions for RPGHQ posts in a Discord-style
// @author       YourName
// @match        https://rpghq.org/forums/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function createReactionList(postId, reactions, userReaction) {
    const reactionListHtml = `
            <div class="reaction-list" data-post-id="${postId}" style="display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin-top: 8px;">
                ${reactions
                  .map(
                    (reaction) => `
                    <div class="reaction-group ${
                      reaction.title === userReaction ? "selected" : ""
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

  function addReactionLists() {
    const posts = document.querySelectorAll('.post[id^="p"]');
    posts.forEach((post) => {
      const postId = post.id.substring(1);
      const existingReactionList = post.querySelector(".reaction-score-list");
      const existingLauncher = post.querySelector(".reactions-launcher");
      if (existingReactionList && existingLauncher) {
        fetchReactions(postId).then(({ reactions, userReaction }) => {
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

            // Add hover effect to show reaction users popup
            post.querySelectorAll(".reaction-group").forEach((group) => {
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
        });
      }
    });
  }

  // Run the script when the page is fully loaded
  window.addEventListener("load", addReactionLists);

  // Optional: Set up a MutationObserver to handle dynamically loaded content
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        addReactionLists();
      }
    });
  });

  const config = { childList: true, subtree: true };
  observer.observe(document.body, config);
})();
