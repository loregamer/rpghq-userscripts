// ==UserScript==
// @name         RPGHQ Reaction Grouping
// @namespace    https://rpghq.org/
// @version      2.5
// @description  Group specific reactions on RPGHQ forums with extensive logging.
// @match        https://rpghq.org/forums/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const reactionGroupings = {
    // Format: 'originalReactionId': { newId: 'newReactionId', newTitle: 'New Reaction Title', newImageUrl: 'URL to new image' }
    26: {
      newId: "3",
      newTitle: "Care",
      newImageUrl:
        "https://rpghq.org/forums/ext/canidev/reactions/images/reaction/matter.svg",
    },
    23: {
      newId: "14",
      newTitle: "Mad",
      newImageUrl:
        "https://rpghq.org/forums/ext/canidev/reactions/images/reaction/argh.gif",
    },
  };

  console.log("RPGHQ Reaction Grouping script loaded");
  console.log("Reaction groupings:", reactionGroupings);

  let isProcessing = false;

  function waitForContent() {
    return new Promise((resolve, reject) => {
      const maxAttempts = 50; // 5 seconds total
      let attempts = 0;

      const checkContent = setInterval(() => {
        attempts++;
        const loadingIndicator = document.querySelector(".reactions-loading");
        const reactionsList = document.querySelector(".reactions-list");

        console.log(
          `Attempt ${attempts}: Loading indicator present: ${!!loadingIndicator}, Reactions list present: ${!!reactionsList}`
        );

        if (!loadingIndicator && reactionsList) {
          clearInterval(checkContent);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkContent);
          reject("Timed out waiting for content to load");
        }
      }, 100);
    });
  }

  function groupReactions() {
    console.log("groupReactions function called");
    if (isProcessing) {
      console.log("Already processing, skipping");
      return;
    }
    isProcessing = true;

    waitForContent()
      .then(() => {
        console.log("Content loaded, processing reactions");
        const reactionTabs = document.querySelectorAll(
          ".reactions-list .tab-header a"
        );
        const reactionItems = document.querySelectorAll(
          ".reactions-list .tab-content li"
        );
        processReactions(reactionTabs, reactionItems);
        processReactionScoreLists();
      })
      .catch((error) => {
        console.log(error);
        isProcessing = false;
      });
  }

  function processReactions(reactionTabs, reactionItems) {
    console.log("Found reaction tabs:", reactionTabs.length);
    console.log(
      "Reaction tabs:",
      Array.from(reactionTabs).map(
        (tab) => `${tab.getAttribute("data-id")}: ${tab.title}`
      )
    );

    console.log("Found reaction items:", reactionItems.length);
    console.log(
      "Reaction items:",
      Array.from(reactionItems).map((item) =>
        item.getAttribute("data-reaction")
      )
    );

    // Process tabs
    reactionTabs.forEach((tab) => {
      const tabId = tab.getAttribute("data-id");
      console.log("Processing tab:", tabId, tab.title);
      if (reactionGroupings[tabId]) {
        console.log("Tab needs regrouping:", tabId);
        const newTab = Array.from(reactionTabs).find(
          (t) => t.getAttribute("data-id") === reactionGroupings[tabId].newId
        );
        if (newTab) {
          console.log(
            "Found existing new tab:",
            newTab.getAttribute("data-id")
          );
          // Update counter
          const newCounter = newTab.querySelector(".tab-counter");
          const oldCounter = tab.querySelector(".tab-counter");
          if (newCounter && oldCounter) {
            const newCount =
              parseInt(newCounter.textContent || "0") +
              parseInt(oldCounter.textContent || "0");
            console.log("Updating counter:", newCount);
            newCounter.textContent = newCount;
          }
          // Hide original tab
          console.log("Hiding original tab:", tabId);
          tab.style.display = "none";
        } else {
          console.log("Creating new tab for:", tabId);
          // Create new tab if it doesn't exist
          const newTab = tab.cloneNode(true);
          newTab.setAttribute("data-id", reactionGroupings[tabId].newId);
          newTab.title = reactionGroupings[tabId].newTitle;
          const img = newTab.querySelector("img");
          if (img) {
            img.src = reactionGroupings[tabId].newImageUrl;
            img.alt = reactionGroupings[tabId].newTitle;
          }
          tab.parentNode.insertBefore(newTab, tab);
          tab.style.display = "none";
          console.log("New tab created:", newTab.getAttribute("data-id"));
        }
      }
    });

    // Process reaction items
    reactionItems.forEach((item) => {
      const reactionId = item.getAttribute("data-reaction");
      console.log("Processing reaction item:", reactionId);
      if (reactionGroupings[reactionId]) {
        console.log(
          "Regrouping reaction item:",
          reactionId,
          "to",
          reactionGroupings[reactionId].newId
        );
        item.setAttribute("data-reaction", reactionGroupings[reactionId].newId);
        const reactionImage = item.querySelector(".reaction-image");
        if (reactionImage) {
          reactionImage.src = reactionGroupings[reactionId].newImageUrl;
          reactionImage.alt = reactionGroupings[reactionId].newTitle;
          console.log("Updated reaction image:", reactionImage.src);
        }
      }
    });

    // Move items to new tab contents
    Object.keys(reactionGroupings).forEach((oldId) => {
      const newId = reactionGroupings[oldId].newId;
      console.log("Moving items from", oldId, "to", newId);
      let newTabContent = document.querySelector(
        `.reactions-list .tab-content[data-id="${newId}"]`
      );
      const oldTabContent = document.querySelector(
        `.reactions-list .tab-content[data-id="${oldId}"]`
      );

      if (oldTabContent) {
        console.log("Found old tab content:", oldId);
        if (!newTabContent) {
          console.log("Creating new tab content for:", newId);
          newTabContent = oldTabContent.cloneNode(false);
          newTabContent.setAttribute("data-id", newId);
          oldTabContent.parentNode.insertBefore(newTabContent, oldTabContent);
        }
        console.log("Moving children from", oldId, "to", newId);
        while (oldTabContent.firstChild) {
          newTabContent.appendChild(oldTabContent.firstChild);
        }
        oldTabContent.remove();
        console.log("Removed old tab content:", oldId);
      } else {
        console.log("Old tab content not found:", oldId);
      }
    });

    // Update "All" tab counter
    const allTab = document.querySelector(
      '.reactions-list .tab-header a[data-id="0"]'
    );
    if (allTab) {
      const allCounter = allTab.querySelector(".tab-counter");
      if (allCounter) {
        const newCount = document.querySelectorAll(
          '.reactions-list .tab-content[data-id="0"] li'
        ).length;
        console.log('Updating "All" tab counter:', newCount);
        allCounter.textContent = newCount;
      }
    }

    isProcessing = false;
    console.log("groupReactions function completed");
  }

  function processReactionScoreLists() {
    const scoreLists = document.querySelectorAll(".reaction-score-list");
    console.log("Found reaction score lists:", scoreLists.length);

    scoreLists.forEach((scoreList) => {
      const scoreItems = scoreList.querySelectorAll(".list-scores a");
      console.log("Processing score list, items:", scoreItems.length);

      scoreItems.forEach((item) => {
        const reactionId = item.getAttribute("href").split("reaction=")[1];
        console.log("Processing score item:", reactionId);
        if (reactionGroupings[reactionId]) {
          console.log(
            "Regrouping score item:",
            reactionId,
            "to",
            reactionGroupings[reactionId].newId
          );
          const newReactionId = reactionGroupings[reactionId].newId;
          const existingNewItem = scoreList.querySelector(
            `.list-scores a[href$="reaction=${newReactionId}"]`
          );

          if (existingNewItem) {
            // Update existing item count
            const oldCount = parseInt(item.title.match(/\d+/)[0]);
            const newCount =
              parseInt(existingNewItem.title.match(/\d+/)[0]) + oldCount;
            existingNewItem.title = `${reactionGroupings[reactionId].newTitle} (${newCount})`;
            item.remove();
          } else {
            // Update item attributes
            item.href = item.href.replace(
              `reaction=${reactionId}`,
              `reaction=${newReactionId}`
            );
            item.title = `${reactionGroupings[reactionId].newTitle} ${
              item.title.match(/\(\d+\)/)[0]
            }`;
            const img = item.querySelector("img");
            if (img) {
              img.src = reactionGroupings[reactionId].newImageUrl;
              img.alt = reactionGroupings[reactionId].newTitle;
            }
          }
        }
      });

      // Re-order items based on z-index
      const sortedItems = Array.from(
        scoreList.querySelectorAll(".list-scores a")
      ).sort((a, b) => parseInt(b.style.zIndex) - parseInt(a.style.zIndex));
      const listScores = scoreList.querySelector(".list-scores");
      sortedItems.forEach((item) => listScores.appendChild(item));
    });

    console.log("Reaction score lists processing completed");
  }

  // Set up a MutationObserver for the entire document
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        const addedNodes = Array.from(mutation.addedNodes);
        const reactionDialog = addedNodes.find(
          (node) =>
            node.nodeType === Node.ELEMENT_NODE &&
            node.classList.contains("reactions-view-dialog")
        );
        if (reactionDialog) {
          console.log("Reaction dialog opened, running groupReactions");
          setTimeout(groupReactions, 0);
          break;
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  console.log("MutationObserver set up for the entire document");

  // Process reaction score lists on page load
  window.addEventListener("load", processReactionScoreLists);

  console.log("RPGHQ Reaction Grouping script setup complete");
})();
