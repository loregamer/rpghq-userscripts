// RPGHQ - Disable Media Embeds
/**
 * Replaces YouTube and Reddit embeds with plain links
 * Created for the RPGHQ Userscript Manager.
 * License: MIT
 *
 * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/disableEmbeds.md for documentation
 */

import { gmGetValue } from "../main.js";
import { log } from "../utils/logger.js";

export function init() {
  log("Disable Embeds initialized");

  // Keep track of added observers/listeners for cleanup
  const cleanup = [];

  // Check preferences
  const disableYouTube = gmGetValue("disable-youtube-embeds", false);
  const disableReddit = gmGetValue("disable-reddit-embeds", false);

  // Function to process existing embeds
  function processExistingEmbeds() {
    // Handle YouTube embeds
    if (disableYouTube) {
      const youtubeEmbeds = document.querySelectorAll(
        '[data-s9e-mediaembed="youtube"]',
      );
      youtubeEmbeds.forEach((embedContainer) => {
        const iframe = embedContainer.querySelector("iframe");
        if (iframe) {
          const videoId = getYouTubeVideoId(iframe.src);
          if (videoId) {
            const link = document.createElement("a");
            link.href = `https://www.youtube.com/watch?v=${videoId}`;
            link.textContent = `YouTube: https://www.youtube.com/watch?v=${videoId}`;
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            // Replace the embed with the link
            embedContainer.parentNode.replaceChild(link, embedContainer);
          }
        }
      });
    }

    // Handle Reddit embeds
    if (disableReddit) {
      const redditEmbeds = document.querySelectorAll(
        '[data-s9e-mediaembed="reddit"]',
      );
      redditEmbeds.forEach((embed) => {
        const redditUrl = getRedditUrl(embed.src);
        if (redditUrl) {
          const link = document.createElement("a");
          link.href = redditUrl;
          link.textContent = `Reddit: ${redditUrl}`;
          link.target = "_blank";
          link.rel = "noopener noreferrer";

          // Replace the embed with the link
          embed.parentNode.replaceChild(link, embed);
        }
      });
    }
  }

  // Extract YouTube video ID from iframe src
  function getYouTubeVideoId(url) {
    // Handle youtube.com/embed/VIDEO_ID format
    const embedMatch = url.match(/youtube\.com\/embed\/([^/?]+)/);
    if (embedMatch) return embedMatch[1];

    // Handle youtu.be/VIDEO_ID format
    const shortMatch = url.match(/youtu\.be\/([^/?]+)/);
    if (shortMatch) return shortMatch[1];

    // Handle youtube.com/watch?v=VIDEO_ID format
    const watchMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/);
    if (watchMatch) return watchMatch[1];

    return null;
  }

  // Extract Reddit URL from iframe src
  function getRedditUrl(url) {
    // Extract the Reddit post path from the embed URL
    const match = url.match(/reddit\.min\.html#(.+?)(?:#|$)/);
    if (match) {
      // Convert the path to a full Reddit URL
      const path = match[1].replace(/\\/g, "/");
      return `https://www.reddit.com/${path}`;
    }
    return null;
  }

  // Set up mutation observer to catch dynamically added embeds
  if (disableYouTube || disableReddit) {
    const observer = new MutationObserver((mutations) => {
      let needsProcessing = false;

      mutations.forEach((mutation) => {
        // Check if any added nodes contain embeds
        if (mutation.addedNodes.length) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (
                disableYouTube &&
                node.querySelector('[data-s9e-mediaembed="youtube"]')
              ) {
                needsProcessing = true;
              }
              if (
                disableReddit &&
                node.querySelector('[data-s9e-mediaembed="reddit"]')
              ) {
                needsProcessing = true;
              }
            }
          }
        }
      });

      if (needsProcessing) {
        processExistingEmbeds();
      }
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Add to cleanup
    cleanup.push(() => observer.disconnect());
  }

  // Process existing embeds when script is initialized
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", processExistingEmbeds);
    cleanup.push(() =>
      document.removeEventListener("DOMContentLoaded", processExistingEmbeds),
    );
  } else {
    processExistingEmbeds();
  }

  // Return cleanup function
  return {
    cleanup: () => {
      log("Disable Embeds cleanup");
      cleanup.forEach((fn) => fn());
    },
  };
}
