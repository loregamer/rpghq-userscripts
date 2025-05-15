// RPGHQ - Last Post Tooltip
/**
 * Shows post HTML in a tooltip when hovering over the "Go to last post" icon
 * Author: loregamer
 * License: MIT
 */

import { log } from "../utils/logger.js";
import { gmGetValue, gmSetValue } from "../main.js";

export function init() {
  console.log("Last Post Tooltip initialized");
  log("Last Post Tooltip initialized");

  // Track added elements for cleanup
  const addedElements = [];
  const addedListeners = [];

  // Create tooltip element
  const tooltip = document.createElement("div");
  tooltip.className = "lastpost-tooltip";
  tooltip.style.cssText =
    "position: fixed; background: rgba(23, 27, 36, 0.95); color: #fff; padding: 15px; border-radius: 6px; width: 600px; max-width: 80vw; max-height: 400px; overflow: auto; z-index: 9999; display: none; border: 2px solid #3889ED; box-shadow: 0 0 20px rgba(0,0,0,0.7); font-size: 14px; line-height: 1.5; transition: opacity 0.2s ease; opacity: 0;";
  document.body.appendChild(tooltip);
  addedElements.push(tooltip);

  console.log("Tooltip element created and added to body");

  // Find all "Go to last post" links (with external-link-square icon)
  const lastPostLinks = document.querySelectorAll(
    'a[title="Go to last post"] .icon.fa-external-link-square',
  );
  console.log(`Found ${lastPostLinks.length} last post links`);

  lastPostLinks.forEach((icon, index) => {
    // Get the parent link element
    const linkElement = icon.closest("a");
    if (!linkElement) {
      console.log(`Link element ${index} not found for icon`);
      return;
    }

    const postUrl = linkElement.href;
    if (!postUrl) {
      console.log(`No href found for link element ${index}`);
      return;
    }

    console.log(`Processing link ${index}:`, postUrl);

    // Create mouseenter handler
    const mouseenterHandler = async (e) => {
      console.log(`Mouse entered link ${index}`);
      // Extract post ID from URL
      const postIdMatch = postUrl.match(/p=(\d+)/);
      if (!postIdMatch) {
        console.log(`Could not extract post ID from URL: ${postUrl}`);
        return;
      }

      const postId = postIdMatch[1];
      console.log(`Found post ID: ${postId}`);

      // Clear any existing hide timeout
      if (window.tooltipHideTimeout) {
        clearTimeout(window.tooltipHideTimeout);
      }

      // Position tooltip - fixed position relative to viewport
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Start with showing the tooltip but transparent
      tooltip.style.display = "block";
      tooltip.style.opacity = "0";

      // Determine position - try to keep it visible in viewport
      // Position MUCH further to the LEFT of the mouse
      let leftPos = Math.max(20, e.clientX - 650); // Move it further left, but keep it at least 20px from the edge
      let topPos = e.clientY - 150; // Also position it higher up relative to the cursor

      // Adjust if it would go off screen
      const tooltipWidth = Math.min(600, window.innerWidth * 0.8);
      const tooltipHeight = 400; // Max height

      // If not enough space on the left, position to the right
      if (leftPos < 20) {
        leftPos = Math.min(e.clientX + 20, viewportWidth - tooltipWidth - 20);
      }

      // Adjust vertical position if needed
      if (topPos + tooltipHeight > viewportHeight - 20) {
        topPos = Math.max(20, viewportHeight - tooltipHeight - 20);
      }

      tooltip.style.left = `${leftPos}px`;
      tooltip.style.top = `${topPos}px`;

      // Add loading indicator
      tooltip.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 80px;">
          <div style="text-align: center;">
            <div style="margin-bottom: 10px; font-weight: bold;">Loading post content...</div>
            <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3889ED; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
          </div>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;

      // Fade in the tooltip
      setTimeout(() => {
        tooltip.style.opacity = "1";
      }, 10);

      // Check cache first
      const cacheKey = `post_content_${postId}`;
      let postContent = gmGetValue(cacheKey, null);

      if (postContent) {
        console.log(`Post content found in cache for ID: ${postId}`);
        tooltip.innerHTML = `
          <div style="max-width: 100%;">
            ${postContent}
          </div>
        `;
      } else {
        console.log(
          `No cached content found for ID: ${postId}, fetching from server`,
        );
        try {
          // Fetch post content
          const response = await fetch(postUrl);
          const html = await response.text();
          console.log(`Received HTML response: ${html.substring(0, 100)}...`);

          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          // Find the post content
          const postContentElement = doc.querySelector(
            `#post_content${postId}`,
          );

          if (postContentElement) {
            console.log(`Post content found, updating tooltip and cache`);
            postContent = postContentElement.innerHTML;

            // Save to cache
            gmSetValue(cacheKey, postContent);

            // Add a wrapper div with padding and max-width
            tooltip.innerHTML = `
              <div style="max-width: 100%;">
                ${postContent}
              </div>
            `;
          } else {
            console.log(`Post content not found for ID: ${postId}`);
            tooltip.innerHTML = `
              <div style="text-align: center; padding: 20px;">
                <div style="font-size: 18px; margin-bottom: 10px;">⚠️</div>
                <div>Post content not found</div>
              </div>
            `;
          }
        } catch (error) {
          console.error("Error fetching post content:", error);
          tooltip.innerHTML = `
            <div style="text-align: center; padding: 20px;">
              <div style="font-size: 18px; margin-bottom: 10px;">❌</div>
              <div>Error loading post content</div>
              <div style="font-size: 12px; color: #aaa; margin-top: 10px;">${error.message}</div>
            </div>
          `;
        }
      }
    };

    // Create mouseleave handler
    const mouseleaveHandler = () => {
      console.log(`Mouse left link ${index}`);
      // Fade out the tooltip with a small delay
      tooltip.style.opacity = "0";

      // Hide tooltip after transition completes
      window.tooltipHideTimeout = setTimeout(() => {
        tooltip.style.display = "none";
        tooltip.innerHTML = "";
      }, 300); // Matches the transition duration
    };

    // Create mousemove handler
    const mousemoveHandler = (e) => {
      // Only update position if tooltip is visible
      if (tooltip.style.display === "block") {
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Get tooltip dimensions
        const tooltipWidth = Math.min(600, window.innerWidth * 0.8);
        const tooltipHeight = 400; // Max height

        // Position MUCH further to the LEFT of the mouse
        let leftPos = Math.max(20, e.clientX - 650);
        let topPos = e.clientY - 150; // Position it higher up

        // If not enough space on the left, position to the right
        if (leftPos < 20) {
          leftPos = Math.min(e.clientX + 20, viewportWidth - tooltipWidth - 20);
        }

        // Adjust vertical position if needed
        if (topPos + tooltipHeight > viewportHeight - 20) {
          topPos = Math.max(20, viewportHeight - tooltipHeight - 20);
        }

        tooltip.style.left = `${leftPos}px`;
        tooltip.style.top = `${topPos}px`;
      }
    };

    // Add event listeners to the link element
    linkElement.addEventListener("mouseenter", mouseenterHandler);
    linkElement.addEventListener("mouseleave", mouseleaveHandler);
    linkElement.addEventListener("mousemove", mousemoveHandler);

    console.log(`Added event listeners to link ${index}`);

    // Track listeners for cleanup
    addedListeners.push(
      { element: linkElement, type: "mouseenter", handler: mouseenterHandler },
      { element: linkElement, type: "mouseleave", handler: mouseleaveHandler },
      { element: linkElement, type: "mousemove", handler: mousemoveHandler },
    );
  });

  console.log(
    `Last Post Tooltip setup complete with ${addedListeners.length / 3} links tracked`,
  );

  // Return cleanup function
  return {
    cleanup: () => {
      console.log("Last Post Tooltip cleanup started");
      log("Last Post Tooltip cleanup");

      // Remove added elements
      addedElements.forEach((el) => {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
          console.log("Removed tooltip element");
        }
      });

      // Remove event listeners
      addedListeners.forEach(({ element, type, handler }) => {
        if (element) {
          element.removeEventListener(type, handler);
          console.log(`Removed ${type} listener from element`);
        }
      });

      // Clear any pending timeout
      if (window.tooltipHideTimeout) {
        clearTimeout(window.tooltipHideTimeout);
      }

      console.log("Last Post Tooltip cleanup complete");
    },
  };
}
