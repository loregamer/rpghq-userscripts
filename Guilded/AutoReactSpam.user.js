// ==UserScript==
// @name         Guilded Auto-Reactor (Enhanced Error Detection + Reaction Counter)
// @namespace    http://tampermonkey.net/
// @version      1.12
// @description  Automatically react to messages, detecting errors via DOM for "An error occurred" and "You're doing that too often", and display reaction count
// @match        https://www.guilded.gg/*
// @icon         https://support.guilded.gg/favicon.ico
// @grant        none
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/main/Guilded/AutoReactSpam.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/main/Guilded/AutoReactSpam.user.js
// ==/UserScript==

(function () {
  "use strict";

  const TOGGLE_KEY = "Insert";
  const CLICK_DELAY = 100; // Very small delay (100ms) between each click
  const THROTTLE_DELAY = 10000; // 10 seconds pause if an error is detected

  let isActive = false;
  let isPaused = false;
  let lastClickedIndex = 0; // Add this near the other state variables (isActive, isPaused)

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

  function getVisibleLayerWrapper() {
    // Get the wrapper that's actually visible in the DOM
    const wrapper = document.querySelector(
      ".LayerContext-layer-item-wrapper:not(.LayerContext-layer-hidden):not([style*='display: none']):not([style*='opacity: 0'])"
    );
    console.log("[Debug] Found visible layer wrapper:", wrapper);
    return wrapper;
  }

  function isElementVisible(element) {
    // Check if element or any ancestor is hidden
    let current = element;
    while (current) {
      const style = window.getComputedStyle(current);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.opacity === "0" ||
        current.classList.contains("LayerContext-layer-hidden")
      ) {
        return false;
      }
      current = current.parentElement;
    }
    return true;
  }

  function countReactions() {
    // Get all reactions and filter out ones with hidden ancestors
    const allReactions = Array.from(
      document.querySelectorAll(".ReactionBadge-container-content")
    ).filter(isElementVisible);

    console.log("[Debug] Found visible reactions:", allReactions.length);
    updateReactionCount(allReactions.length);
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

    // Get all visible reactions
    const allReactions = Array.from(
      document.querySelectorAll(".ReactionBadge-container-content")
    ).filter(isElementVisible);

    console.log(
      "[Debug] Found visible reactions to click:",
      allReactions.length,
      "Starting from index:",
      lastClickedIndex
    );

    // Reset lastClickedIndex if it's beyond the array length
    if (lastClickedIndex >= allReactions.length) {
      lastClickedIndex = 0;
    }

    // Start from lastClickedIndex instead of beginning
    for (let i = lastClickedIndex; i < allReactions.length; i++) {
      if (!isActive) break;

      const badge = allReactions[i];
      if (badge instanceof HTMLElement) {
        badge.click();
        console.log("[Auto Reactor] Clicked reaction at index:", i);
        lastClickedIndex = i + 1; // Update the index for next time

        if (isErrorPresent()) {
          console.warn(
            "[Auto Reactor] Detected error message in DOM. Pausing..."
          );
          updateStatus("Paused (Error Detected)");
          isPaused = true;
          await new Promise((resolve) => setTimeout(resolve, THROTTLE_DELAY));
          isPaused = false;
          updateStatus("Resuming...");
          console.log(
            "[Auto Reactor] Resuming after pause at index:",
            lastClickedIndex
          );
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, CLICK_DELAY));
      }
    }

    // If we've completed all reactions, pause for 10 seconds
    if (lastClickedIndex >= allReactions.length) {
      console.log(
        "[Auto Reactor] Completed all reactions. Taking a 10 second break..."
      );
      updateStatus("Break (10s)");
      await new Promise((resolve) => setTimeout(resolve, THROTTLE_DELAY));
      updateStatus("ON");
      lastClickedIndex = 0;
    }
  }

  function refreshReactionCount() {
    console.log("[Debug] Refreshing reaction count");
    const reactionCount = countReactions();
    console.log("[Debug] Setting count to:", reactionCount);
    updateReactionCount(reactionCount);
  }

  function observePageChanges() {
    const observer = new MutationObserver((mutations) => {
      // Always refresh count on any mutation to catch layer changes
      refreshReactionCount();

      // Additional logging for debugging
      for (const mutation of mutations) {
        const layerWrapper = getVisibleLayerWrapper();
        if (!layerWrapper) {
          console.log("[Debug] No layer wrapper in mutation check");
          continue;
        }

        if (layerWrapper.contains(mutation.target)) {
          console.log("[Debug] Mutation detected in layer wrapper:", {
            target: mutation.target,
            type: mutation.type,
            addedNodes: mutation.addedNodes.length,
            removedNodes: mutation.removedNodes.length,
          });
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true, // Add this to catch class changes
      attributeFilter: ["class"], // Only watch for class changes
    });
    console.log("[Debug] Observer started");
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
