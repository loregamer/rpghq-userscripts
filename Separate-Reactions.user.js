// ==UserScript==
// @name         RPGHQ Reaction List (Discord-style)
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Display a list of reactions for RPGHQ posts in a Discord-like style
// @author       YourName
// @match        https://rpghq.org/forums/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function createReactionList(postId, reactions) {
    const reactionListHtml = `
            <div class="reaction-list" data-post-id="${postId}" style="display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin-top: 8px;">
                ${reactions
                  .map(
                    (reaction) => `
                    <div class="reaction-group" style="display: flex; align-items: center; background-color: rgba(255,255,255,0.1); border-radius: 8px; padding: 2px 6px; cursor: pointer;">
                        <img src="${reaction.image}" alt="${reaction.title}" style="width: 16px; height: 16px; margin-right: 4px;">
                        <span style="font-size: 12px; color: #dcddde;">${reaction.count}</span>
                        <span class="reaction-users" style="display: none; position: absolute; background-color: #36393f; border: 1px solid #202225; border-radius: 4px; padding: 8px; z-index: 1000; color: #dcddde; font-size: 12px; max-width: 200px; word-wrap: break-word;">
                            ${reaction.title}
                        </span>
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

    doc.querySelectorAll(".tab-header a:not(.active)").forEach((a) => {
      const image = a.querySelector("img")?.src;
      const title = a.getAttribute("title");
      const count = a.querySelector(".tab-counter")?.textContent;
      if (image && title && count) {
        reactions.push({ image, title, count });
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

  function addReactionLists() {
    const posts = document.querySelectorAll('.post[id^="p"]');
    posts.forEach((post) => {
      const postId = post.id.substring(1);
      const existingReactionList = post.querySelector(".reaction-score-list");
      if (existingReactionList) {
        fetchReactions(postId).then((reactions) => {
          if (reactions.length > 0) {
            const reactionListHtml = createReactionList(postId, reactions);
            existingReactionList.outerHTML = reactionListHtml;

            // Add hover effect to show reaction titles
            post.querySelectorAll(".reaction-group").forEach((group) => {
              group.addEventListener("mouseenter", () => {
                group.querySelector(".reaction-users").style.display = "block";
              });
              group.addEventListener("mouseleave", () => {
                group.querySelector(".reaction-users").style.display = "none";
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
