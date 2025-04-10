// RPGHQ - Reaction List Separated
/**
 * Makes smiley reactions and counts separated
 * Original script by loregamer, adapted for the RPGHQ Userscript Manager.
 * License: MIT
 *
 * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/separateReactions.md for documentation
 */

export function init() {
  function createReactionList(postId, reactions) {
    console.log(
      "createReactionList: Starting to create reaction list for post",
      postId,
    );
    const pollVotes = getPollVotes();

    const displayStyle = reactions.length === 0 ? "display: none;" : "";
    console.log(
      "createReactionList: Processing",
      reactions.length,
      "reactions",
    );

    const html = `
        <div class="reaction-score-list content-processed" data-post-id="${postId}" data-title="Reactions" style="padding-top: 10px !important; ${displayStyle}">
            <div class="list-scores" style="display: flex; flex-wrap: wrap; gap: 4px;">
                ${reactions
                  .map((reaction, reactionIndex) => {
                    console.log(
                      `createReactionList: Processing reaction #${
                        reactionIndex + 1
                      }:`,
                      {
                        title: reaction.title,
                        userCount: reaction.users.length,
                      },
                    );
                    return `
                    <div class="reaction-group" style="display: flex; align-items: center; background-color: #3A404A; border-radius: 8px; padding: 2px 6px; position: relative;">
                        <img src="${reaction.image}" alt="${
                          reaction.title
                        }" style="width: auto; height: 16px; margin-right: 4px; object-fit: contain;">
                        <span style="font-size: 12px; color: #dcddde;">${
                          reaction.count
                        }</span>
                        <div class="reaction-users-popup" style="display: none; position: fixed; background-color: #191919; border: 1px solid #202225; border-radius: 4px; padding: 8px; z-index: 1000; color: #dcddde; font-size: 12px; min-width: 200px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <div style="font-weight: bold; margin-bottom: 8px;">${
                              reaction.title
                            }</div>
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                ${reaction.users
                                  .map((user, userIndex) => {
                                    console.log(
                                      `createReactionList: Reaction #${
                                        reactionIndex + 1
                                      }, processing user #${userIndex + 1}:`,
                                      {
                                        username: user.username,
                                        pollVotes:
                                          pollVotes[user.username.toLowerCase()]
                                            ?.options,
                                      },
                                    );
                                    const userPollVotes =
                                      pollVotes[user.username.toLowerCase()];
                                    const pollInfo =
                                      userPollVotes?.options?.length > 0
                                        ? `<div style="font-size: 8.5px; opacity: 0.8; color: #dcddde; margin-top: 2px;">
                                            ${
                                              userPollVotes.options.length === 1
                                                ? `<div>${userPollVotes.options[0]}</div>`
                                                : userPollVotes.options
                                                    .map(
                                                      (option) =>
                                                        `<div style="display: flex; align-items: baseline; gap: 4px;">
                                                  <span style="font-size: 8px;">•</span>
                                                  <span>${option}</span>
                                                </div>`,
                                                    )
                                                    .join("")
                                            }
                                          </div>`
                                        : "";
                                    return `
                                        <div style="display: flex; align-items: flex-start;">
                                            <div style="width: 24px; height: 24px; margin-right: 8px; flex-shrink: 0;">
                                                ${
                                                  user.avatar
                                                    ? `<img src="${user.avatar}" alt="${user.username}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">`
                                                    : ""
                                                }
                                            </div>
                                            <div style="display: flex; flex-direction: column;">
                                                <a href="${
                                                  user.profileUrl
                                                }" style="${
                                                  user.isColoured
                                                    ? `color: ${user.color};`
                                                    : ""
                                                }" class="${
                                                  user.isColoured
                                                    ? "username-coloured"
                                                    : "username"
                                                }">${user.username}</a>
                                                ${pollInfo}
                                            </div>
                                        </div>
                                    `;
                                  })
                                  .join("")}
                            </div>
                        </div>
                    </div>
                `;
                  })
                  .join("")}
            </div>
        </div>
    `;

    return html;
  }

  function parseReactions(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const reactions = [];

    doc.querySelectorAll(".tab-header a:not(.active)").forEach((a) => {
      const image = a.querySelector("img")?.src || "";
      const title = a.getAttribute("title") || "";
      const count = a.querySelector(".tab-counter")?.textContent || "0";
      const dataId = a.getAttribute("data-id");
      if (dataId) {
        const users = [];
        doc
          .querySelectorAll(`.tab-content[data-id="${dataId}"] li`)
          .forEach((li) => {
            const userLink = li.querySelector(".cbb-helper-text a");
            if (userLink) {
              const username = userLink.textContent || "";
              const profileUrl = userLink.href || "";
              const avatarImg = li.querySelector(".user-avatar img");
              const avatar = avatarImg ? avatarImg.src : "";
              const isColoured =
                userLink.classList.contains("username-coloured");
              const color = isColoured ? userLink.style.color : null;
              users.push({ username, avatar, profileUrl, isColoured, color });
            }
          });
        reactions.push({ image, title, count, users });
      }
    });

    return reactions;
  }

  function getPollVotes() {
    const pollVotes = {};
    const polls = document.querySelectorAll(".polls");

    polls.forEach((poll, pollIndex) => {
      const dls = poll.querySelectorAll("dl");
      console.log(
        `getPollVotes: Found ${dls.length} dl elements in poll #${pollIndex + 1}`,
      );

      let currentOption = null;

      dls.forEach((dl, dlIndex) => {
        // First check if this is an option DL
        const optionDt = dl.querySelector("dt");
        if (
          optionDt &&
          !dl.classList.contains("poll_voters_box") &&
          !dl.classList.contains("poll_total_votes")
        ) {
          currentOption = optionDt.textContent.trim();
        }

        // Then check if this is a voters box for the current option
        if (dl.classList.contains("poll_voters_box") && currentOption) {
          console.log(
            `getPollVotes: Processing voters for option: "${currentOption}"`,
          );
          const votersSpan = dl.querySelector(".poll_voters");
          if (!votersSpan) return;

          const voters = votersSpan.querySelectorAll("span[name]");
          console.log(
            `getPollVotes: Found ${voters.length} voters for this option`,
          );

          voters.forEach((voter, voterIndex) => {
            const username = voter.getAttribute("name");
            const userLink = voter.querySelector("a");
            console.log(`getPollVotes: Processing voter #${voterIndex + 1}:`, {
              username,
              hasUserLink: !!userLink,
              linkText: userLink?.textContent,
              option: currentOption,
              isColoured: userLink?.classList.contains("username-coloured"),
              color: userLink?.style.color,
            });

            if (username && userLink) {
              const lowerUsername = username.toLowerCase();
              if (!pollVotes[lowerUsername]) {
                pollVotes[lowerUsername] = {
                  options: [],
                  isColoured: userLink.classList.contains("username-coloured"),
                  color: userLink.style.color || null,
                };
              }
              pollVotes[lowerUsername].options.push(currentOption);
            }
          });
        }
      });
    });

    return pollVotes;
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
      },
    )
      .then((response) => response.json())
      .then((data) => {
        if (!data.htmlContent) {
          console.error("No HTML content in response:", data);
          return [];
        }
        return parseReactions(data.htmlContent);
      })
      .catch((error) => {
        console.error("Error fetching reactions:", error);
        return [];
      });
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
    if (existingReactionList && existingReactionList.dataset.processed) return;

    fetchReactions(postId)
      .then((reactions) => {
        const reactionListHtml = createReactionList(postId, reactions);
        if (existingReactionList) {
          existingReactionList.outerHTML = reactionListHtml;
        } else {
          const reactionLauncher = post.querySelector(".reactions-launcher");
          if (reactionLauncher) {
            reactionLauncher.insertAdjacentHTML(
              "beforebegin",
              reactionListHtml,
            );
          }
        }

        const newReactionList = post.querySelector(".reaction-score-list");
        if (newReactionList) {
          newReactionList.dataset.processed = "true";

          // Add hover effect to reaction groups
          newReactionList
            .querySelectorAll(".reaction-group")
            .forEach((group) => {
              const popup = group.querySelector(".reaction-users-popup");
              let isHovering = false;

              group.addEventListener("mouseenter", (e) => {
                isHovering = true;
                showPopup(group, popup);
              });

              group.addEventListener("mouseleave", () => {
                isHovering = false;
                hidePopup(popup);
              });

              // Add scroll event listener
              window.addEventListener("scroll", () => {
                if (isHovering) {
                  showPopup(group, popup);
                }
              });
            });
        }

        // Update the reaction launcher
        const reactionLauncher = post.querySelector(".reactions-launcher");
        if (reactionLauncher) {
          const reactionButton =
            reactionLauncher.querySelector(".reaction-button");
          if (reactionButton) {
            // Check if a reaction is selected
            const selectedReaction = reactionButton.querySelector("img");
            if (selectedReaction && GM_getValue("leftMode", true)) {
              // Replace the button content with an "X" icon and center-align it
              reactionButton.innerHTML = `
                <svg class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1000 1000" enable-background="new 0 0 1000 1000" xml:space="preserve">
                  <path d="M576.3,877.3c-30.5,7.2-62.1,10.9-93.7,10.9c-223.3,0-405-181.7-405-405s181.7-405,405-405c223.3,0,405,181.7,405,405c0,32.8-3.9,65.5-11.7,97.1c-4.5,18.1,6.6,36.4,24.7,40.8c18.1,4.7,36.4-6.5,40.8-24.7c9.1-36.9,13.7-75,13.7-113.3c0-260.6-212-472.5-472.5-472.5C222,10.6,10,222.6,10,483.1c0,260.6,212,472.6,472.5,472.6c36.9,0,73.7-4.3,109.3-12.7c18.1-4.3,29.4-22.4,25-40.6C612.6,884.2,594.4,872.9,576.3,877.3z"></path>
                  <path d="M250.2,594.7c-14.7,11.5-17.3,32.7-5.8,47.4c58,74.2,145.2,116.7,239.3,116.7c95.1,0,182.9-43.3,240.9-118.7c11.4-14.8,8.6-35.9-6.2-47.3s-35.9-8.6-47.3,6.2c-45.1,58.7-113.4,92.3-187.4,92.3c-73.2,0-141-33.1-186.2-90.8C286.1,585.8,264.8,583.3,250.2,594.7z"></path>
                  <path d="M382.4,435.9v-67.5c0-28-22.6-50.6-50.6-50.6s-50.6,22.6-50.6,50.6v67.5c0,28,22.6,50.6,50.6,50.6S382.4,463.8,382.4,435.9z"></path>
                  <path d="M686.2,435.9v-67.5c0-28-22.7-50.6-50.6-50.6S585,340.4,585,368.3v67.5c0,28,22.7,50.6,50.6,50.6S686.2,463.8,686.2,435.9z"></path>
                  <path d="M956.2,786.9H855V685.6c0-18.7-15.1-33.8-33.8-33.8s-33.8,15.1-33.8,33.8v101.3H686.2c-18.7,0-33.8,15.1-33.8,33.8s15.1,33.8,33.8,33.8h101.3v101.3c0,18.7,15.1,33.8,33.8,33.8s33.8-15.1,33.8-33.8V854.4h101.3c18.7,0,33.8-15.1,33.8-33.8S974.9,786.9,956.2,786.9z"></path>
                </svg>
              `;
              reactionButton.classList.add("default-icon");
              reactionButton.classList.remove("remove-reaction");
              reactionButton.title = "Add reaction";

              // Remove any existing inline styles that might interfere
              reactionButton.style.cssText = "";

              // Highlight the user's reaction in the reaction list
              const userReactionImage = selectedReaction.src;
              const userReactionGroup = newReactionList.querySelector(
                `.reaction-group img[src="${userReactionImage}"]`,
              );
              if (userReactionGroup) {
                userReactionGroup
                  .closest(".reaction-group")
                  .classList.add("user-reacted");
              }
            }
          }
        }
      })
      .catch((error) => console.error("Error fetching reactions:", error));
  }

  function showPopup(group, popup) {
    // Show the popup
    popup.style.display = "block";

    // Position the popup
    const rect = group.getBoundingClientRect();

    let top = rect.bottom;
    let left = rect.left;

    // Adjust if popup goes off-screen
    if (left + popup.offsetWidth > window.innerWidth) {
      left = window.innerWidth - popup.offsetWidth;
    }

    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;
  }

  function hidePopup(popup) {
    popup.style.display = "none";
  }

  function applyLeftMode() {
    const leftMode = GM_getValue("leftMode", false);
    const style =
      document.getElementById("rpghq-reaction-list-style") ||
      document.createElement("style");
    style.id = "rpghq-reaction-list-style";
    style.textContent = leftMode
      ? `
      .reactions-launcher > .reaction-button.default-icon {
        padding-top: 7px !important;
      }
      .reaction-score-list, .reactions-launcher {
        float: left !important;
        margin-right: 4px !important;
        padding-top: 10px !important;
        margin: 0 0 5px 0 !important;
        padding: 4px 4px 4px 0 !important;
      }
      .reactions-launcher {
        display: flex !important;
        align-items: center !important;
      }
      .reactions-launcher a.reaction-button {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: auto !important;
        height: 16px !important;
        padding: 0 !important;
        background: none !important;
      }
      .reactions-launcher a.reaction-button svg {
        width: 16px !important;
        height: 16px !important;
        fill: #dcddde !important;
      }
    `
      : "";
    document.head.appendChild(style);

    if (leftMode) {
      document.querySelectorAll(".postbody").forEach((postbody) => {
        const reactionLauncher = postbody.querySelector(".reactions-launcher");
        const reactionScoreList = postbody.querySelector(
          ".reaction-score-list",
        );
        if (
          reactionLauncher &&
          reactionScoreList &&
          reactionLauncher.previousElementSibling !== reactionScoreList
        ) {
          reactionLauncher.parentNode.insertBefore(
            reactionScoreList,
            reactionLauncher,
          );
        }
      });
    }
  }

  function toggleLeftMode() {
    const currentMode = GM_getValue("leftMode", false);
    GM_setValue("leftMode", !currentMode);
    window.location.reload();
  }

  function addToggleLeftModeOption() {
    if (window.innerWidth <= 768) {
      // Mobile view check
      const dropdown = document.querySelector(
        "#username_logged_in .dropdown-contents",
      );
      if (dropdown && !document.getElementById("toggle-left-reactions-mode")) {
        const leftModeEnabled = GM_getValue("leftMode", false);
        const listItem = document.createElement("li");
        const toggleButton = document.createElement("a");
        toggleButton.id = "toggle-left-reactions-mode";
        toggleButton.href = "#";
        toggleButton.title = "Toggle Left Reactions Mode";
        toggleButton.role = "menuitem";
        toggleButton.innerHTML = `
          <i class="icon fa-align-left fa-fw" aria-hidden="true"></i>
          <span>Left Reactions Mode (${leftModeEnabled ? "On" : "Off"})</span>
        `;

        toggleButton.addEventListener("click", function (e) {
          e.preventDefault();
          toggleLeftMode();
        });

        listItem.appendChild(toggleButton);
        dropdown.insertBefore(listItem, dropdown.lastElementChild);
      }
    }
  }

  GM_registerMenuCommand("[Reaction List] Toggle Left Mode", toggleLeftMode);

  function observePosts() {
    const style = document.createElement("style");
    style.textContent = `
      @media screen and (min-width: 768px) {
        .post .content {
          min-height: 125px;
        }
      }
      .reactions-launcher .reaction-button.remove-reaction .icon {
        font-size: 16px !important;
        line-height: 1 !important;
        margin: 0 !important;
        height: auto !important; /* Override the fixed height */
      }
      .reaction-group.user-reacted {
        background-color: #4A5A6A !important;
      }
      .reaction-group.user-reacted span {
        color: #ffffff !important;
      }
    `;
    document.head.appendChild(style);

    applyLeftMode();
    addToggleLeftModeOption();

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

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    observePosts();
  } else {
    window.addEventListener("load", observePosts);
  }
}
