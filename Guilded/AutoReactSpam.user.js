// ==UserScript==
// @name         Guilded Auto-Reactor (Enhanced Error Detection + Reaction Counter)
// @namespace    http://tampermonkey.net/
// @version      1.12
// @description  Automatically react to messages, detecting errors via DOM for "An error occurred" and "You're doing that too often", and display reaction count
// @match        https://www.guilded.gg/*
// @icon         https://support.guilded.gg/favicon.ico
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const TOGGLE_KEY = "Insert";
  const CLICK_DELAY = 100; // Very small delay (100ms) between each click
  const THROTTLE_DELAY = 10000; // 10 seconds pause if an error is detected

  let isActive = false;
  let isPaused = false;

  // Create a visual feedback indicator
  const statusIndicator = document.createElement("div");
  statusIndicator.style.position = "fixed";
  statusIndicator.style.top = "10px";
  statusIndicator.style.right = "10px";
  statusIndicator.style.padding = "10px";
  statusIndicator.style.backgroundColor = "#000";
  statusIndicator.style.color = "#fff";
  statusIndicator.style.borderRadius = "5px";
  statusIndicator.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
  statusIndicator.style.fontSize = "14px";
  statusIndicator.style.zIndex = "10000";
  statusIndicator.textContent = "Auto-Reactor: OFF";
  document.body.appendChild(statusIndicator);

  const reactionCounter = document.createElement("div");
  reactionCounter.style.position = "fixed";
  reactionCounter.style.top = "50px";
  reactionCounter.style.right = "10px";
  reactionCounter.style.padding = "10px";
  reactionCounter.style.backgroundColor = "#000";
  reactionCounter.style.color = "#fff";
  reactionCounter.style.borderRadius = "5px";
  reactionCounter.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
  reactionCounter.style.fontSize = "14px";
  reactionCounter.style.zIndex = "10000";
  reactionCounter.textContent = "Reactions: 0";
  document.body.appendChild(reactionCounter);

  function updateStatus(message) {
    statusIndicator.textContent = `Auto-Reactor: ${message}`;
  }

  function updateReactionCount(count) {
    reactionCounter.textContent = `Reactions: ${count}`;
    reactionCounter.style.color = count > 30 ? "red" : "#fff";
  }

  function countReactions() {
    // Look for all reaction badges in the document
    const allReactions = document.querySelectorAll(
      ".ReactionBadge-container-content"
    );
    return allReactions.length;
  }

  function isErrorPresent() {
    const errorElement = document.querySelector(".StatusMessage-content");
    if (!errorElement) return false;
    const errorText = errorElement.textContent;
    return (
      errorText.includes("An error occurred") ||
      errorText.includes("You're doing that too often")
    );
  }

  async function clickReactions() {
    if (isPaused) {
      console.log("[Auto Reactor] Paused. Skipping execution.");
      return;
    }

    const layerWrapper = document.querySelector(
      ".LayerContext-layer-item-wrapper"
    );
    if (!layerWrapper) return;
    const allReactions = layerWrapper.querySelectorAll(
      ".ReactionBadge-container-content"
    );
    for (const badge of allReactions) {
      if (!isActive) break; // Stop if script is turned off

      if (badge instanceof HTMLElement) {
        badge.click();
        console.log("[Auto Reactor] Clicked a reaction");

        if (isErrorPresent()) {
          console.warn(
            "[Auto Reactor] Detected error message in DOM. Pausing..."
          );
          updateStatus("Paused (Error Detected)");
          isPaused = true;
          await new Promise((resolve) => setTimeout(resolve, THROTTLE_DELAY));
          isPaused = false;
          updateStatus("Resuming...");
          console.log("[Auto Reactor] Resuming after pause.");
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, CLICK_DELAY));
      }
    }
  }

  function refreshReactionCount() {
    const reactionCount = countReactions();
    updateReactionCount(reactionCount);
  }

  function observePageChanges() {
    const observer = new MutationObserver((mutations) => {
      // Check if any of the mutations involve reaction changes
      for (const mutation of mutations) {
        if (
          mutation.target.classList.contains(
            "ReactionBadge-container-content"
          ) ||
          mutation.target.querySelector(".ReactionBadge-container-content")
        ) {
          refreshReactionCount();
          break;
        }
      }
    });

    // Observe the entire document body for reaction changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === TOGGLE_KEY) {
      if (isActive) {
        // Turn off
        isActive = false;
        updateStatus("OFF");
        console.log("[Auto Reactor] OFF");
      } else {
        // Turn on
        isActive = true;
        updateStatus("ON");
        console.log("[Auto Reactor] ON");

        (async function autoClickLoop() {
          while (isActive) {
            refreshReactionCount();
            await clickReactions();
            await new Promise((resolve) => setTimeout(resolve, 500)); // Small gap between cycles
          }
        })();
      }
    }
  });

  // Initialize reaction count and observe page changes
  refreshReactionCount();
  observePageChanges();
})();
