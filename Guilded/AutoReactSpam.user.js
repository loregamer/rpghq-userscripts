// ==UserScript==
// @name         Guilded Auto-Reactor (Enhanced Error Detection + Reaction Counter)
// @namespace    http://tampermonkey.net/
// @version      2.0
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
  const REACTIONS_PER_BATCH = 15; // Number of reactions to click before taking a break

  let isActive = false;
  let isPaused = false;
  let lastClickedIndex = 0; // Add this near the other state variables (isActive, isPaused)

  // Create a visual feedback indicator
  const statusIndicator = document.createElement("div");
  const statusLabel = document.createElement("span");
  const statusValue = document.createElement("span");
  statusLabel.textContent = "Auto-Reactor: ";
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
  statusIndicator.appendChild(statusLabel);
  statusIndicator.appendChild(statusValue);
  statusValue.textContent = "OFF";
  statusValue.style.color = "#ff0000"; // Set initial color to red
  document.body.appendChild(statusIndicator);

  // Create blocking overlay
  const blockingOverlay = document.createElement("div");
  blockingOverlay.style.position = "fixed";
  blockingOverlay.style.top = "0";
  blockingOverlay.style.left = "0";
  blockingOverlay.style.width = "100%";
  blockingOverlay.style.height = "100%";
  blockingOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  blockingOverlay.style.zIndex = "9999";
  blockingOverlay.style.cursor = "not-allowed";
  blockingOverlay.style.flexDirection = "column";
  blockingOverlay.style.justifyContent = "center";
  blockingOverlay.style.alignItems = "center";
  blockingOverlay.style.color = "white";
  blockingOverlay.style.fontSize = "24px";
  blockingOverlay.style.fontWeight = "bold";
  blockingOverlay.style.display = "none"; // Only set display once

  const overlayTitle = document.createElement("div");
  overlayTitle.textContent = "Auto Reactor Running...";
  overlayTitle.style.marginBottom = "10px";

  const overlayStatus = document.createElement("div");
  overlayStatus.style.fontSize = "18px";
  overlayStatus.style.opacity = "0.8";
  overlayStatus.textContent = "Working...";

  blockingOverlay.appendChild(overlayTitle);
  blockingOverlay.appendChild(overlayStatus);
  document.body.appendChild(blockingOverlay);

  const reactionCounter = document.createElement("div");
  const counterLabel = document.createElement("span");
  const counterValue = document.createElement("span");
  counterLabel.textContent = "Reactions: ";
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
  reactionCounter.appendChild(counterLabel);
  reactionCounter.appendChild(counterValue);
  counterValue.textContent = "0";
  document.body.appendChild(reactionCounter);

  function updateStatus(message, keepOnStatus = false) {
    let color;
    switch (message) {
      case "Paused (Error Detected)":
        color = "#ffff00";
        overlayStatus.textContent = "Paused - Error Detected";
        overlayStatus.style.color = color;
        break;
      case "Break":
        color = "#00ffff";
        overlayStatus.style.color = color;
        break;
      case "ON":
        color = "#00ff00";
        overlayStatus.textContent = "Working...";
        overlayStatus.style.color = color;
        break;
      case "OFF":
        color = "#ff0000";
        overlayStatus.textContent = "";
        break;
      default:
        color = "#ffffff";
        overlayStatus.textContent = message;
        overlayStatus.style.color = color;
    }

    // Only update the status text if we're turning it on/off or if keepOnStatus is false
    if (message === "ON" || message === "OFF" || !keepOnStatus) {
      statusValue.textContent = message;
      statusValue.style.color = color;
    }
  }

  function updateReactionCount(count) {
    const color = count <= 30 ? "#00ff00" : "#ff0000"; // Green if ≤30, Red if >30
    counterValue.textContent = `${count} / 30`;
    counterValue.style.color = color;
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

  async function takeBreak(reason = "Completed batch") {
    console.log(`[Auto Reactor] ${reason}. Taking a 10 second break...`);
    updateStatus("ON", true); // Keep the ON status in corner

    // Start countdown
    for (let i = 10; i > 0; i--) {
      if (!isActive) break; // Stop countdown if script is turned off
      overlayStatus.textContent = `Taking a Break (${i}s)`;
      overlayStatus.style.color = "#00ffff"; // Light blue color for countdown
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (isActive) {
      // Only update if still active
      overlayStatus.textContent = "Working...";
      overlayStatus.style.color = "#00ff00"; // Reset to green when working
    }
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

    let clickedInThisBatch = 0;

    // Start from lastClickedIndex instead of beginning
    for (let i = lastClickedIndex; i < allReactions.length; i++) {
      if (!isActive) break;

      const badge = allReactions[i];
      if (badge instanceof HTMLElement) {
        badge.click();
        console.log("[Auto Reactor] Clicked reaction at index:", i);
        lastClickedIndex = i + 1;
        clickedInThisBatch++;

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

        // Take a break after REACTIONS_PER_BATCH reactions
        if (clickedInThisBatch >= REACTIONS_PER_BATCH) {
          await takeBreak(`Clicked ${REACTIONS_PER_BATCH} reactions`);
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, CLICK_DELAY));
      }
    }

    // Reset index when we've gone through all reactions
    if (lastClickedIndex >= allReactions.length) {
      await takeBreak("Completed all reactions");
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
        blockingOverlay.style.display = "none";
        console.log("[Auto Reactor] OFF");
      } else {
        // Turn on
        isActive = true;
        updateStatus("ON");
        blockingOverlay.style.display = "flex";
        console.log("[Auto Reactor] ON");

        (async function autoClickLoop() {
          while (isActive) {
            refreshReactionCount();
            await clickReactions();
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        })();
      }
    }
  });

  // Initialize reaction count and observe page changes
  refreshReactionCount();
  observePageChanges();

  // Add beforeunload event listener for page close confirmation
  window.addEventListener("beforeunload", (e) => {
    if (isActive) {
      e.preventDefault();
      e.returnValue =
        "Auto Reactor is still running. Are you sure you want to leave?";
      return e.returnValue;
    }
  });
})();
