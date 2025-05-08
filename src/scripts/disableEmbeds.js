// RPGHQ - Disable Media Embeds
/**
 * Replaces YouTube and Reddit embeds with plain links
 * Created for the RPGHQ Userscript Manager.
 * License: MIT
 *
 * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/disableEmbeds.md for documentation
 */

import { gmGetValue } from "../main.js";
import { log, debug } from "../utils/logger.js";

export function init() {
  log("Disable Embeds initialized");

  // Keep track of added observers/listeners for cleanup
  const cleanup = [];

  // Check preferences
  const disableYouTube = gmGetValue("disable-youtube-embeds", false);
  const disableReddit = gmGetValue("disable-reddit-embeds", false);

  debug(`YouTube embeds ${disableYouTube ? "disabled" : "enabled"}`);
  debug(`Reddit embeds ${disableReddit ? "disabled" : "enabled"}`);

  if (!disableYouTube && !disableReddit) {
    log("No embeds disabled, script inactive");
    return { cleanup: () => {} };
  }

  // Add a simple style for the links that replace embeds
  const style = document.createElement("style");
  style.textContent = `
    .disabled-embed-link {
      display: inline-block;
      padding: 8px 12px;
      margin: 5px 0;
      background-color: rgba(0, 0, 0, 0.05);
      border-radius: 5px;
      text-decoration: none;
    }
    .disabled-embed-link:hover {
      background-color: rgba(0, 0, 0, 0.1);
      text-decoration: underline;
    }
  `;
  document.head.appendChild(style);
  cleanup.push(() => {
    if (style.parentNode) {
      style.parentNode.removeChild(style);
    }
  });

  // Function to process existing embeds
  function processExistingEmbeds() {
    debug("Processing existing embeds");
    let replacedCount = 0;

    // Handle YouTube embeds
    if (disableYouTube) {
      debug("Looking for YouTube embeds...");

      // Get all YouTube embed containers
      const youtubeEmbeds = document.querySelectorAll(
        'span[data-s9e-mediaembed="youtube"]',
      );
      debug(`Found ${youtubeEmbeds.length} YouTube embeds`);

      youtubeEmbeds.forEach((embed, index) => {
        try {
          debug(
            `Processing YouTube embed ${index + 1}/${youtubeEmbeds.length}`,
          );

          // Get the iframe
          const iframe = embed.querySelector("iframe");
          if (!iframe) {
            debug(`No iframe found in YouTube embed ${index + 1}`);
            return;
          }

          // Extract the video ID from the iframe source or background image
          let videoId = null;
          if (iframe.src) {
            videoId = extractYouTubeId(iframe.src);
            debug(`Extracted video ID from src: ${videoId}`);
          }

          // If we couldn't get the video ID from src, try from the style background
          if (!videoId && iframe.style && iframe.style.background) {
            const bgMatch = iframe.style.background.match(/vi\/([^/]+)\//);
            if (bgMatch) {
              videoId = bgMatch[1];
              debug(`Extracted video ID from background: ${videoId}`);
            }
          }

          // If we still don't have a video ID, try parsing from any URL in the element
          if (!videoId) {
            // Check for any data attributes that might contain a YouTube URL
            const element = embed.outerHTML;
            const urlMatch = element.match(/youtube\.com\/watch\?v=([^&"]+)/);
            if (urlMatch) {
              videoId = urlMatch[1];
              debug(`Extracted video ID from element HTML: ${videoId}`);
            }
          }

          if (videoId) {
            // Create a replacement link
            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
            const link = document.createElement("a");
            link.href = videoUrl;
            link.textContent = videoUrl;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.className = "disabled-embed-link";

            // Insert link before the embed container
            debug(`Replacing YouTube embed with link to ${videoUrl}`);
            embed.parentNode.insertBefore(link, embed);

            // Remove the original embed
            embed.parentNode.removeChild(embed);
            replacedCount++;
          } else {
            debug(`Could not extract video ID for YouTube embed ${index + 1}`);
          }
        } catch (error) {
          log(`Error replacing YouTube embed ${index + 1}: ${error.message}`);
        }
      });
    }

    // Handle Reddit embeds
    if (disableReddit) {
      debug("Looking for Reddit embeds...");

      // Find all elements containing Reddit embeds
      const redditContainers = Array.from(
        document.querySelectorAll('iframe[data-s9e-mediaembed="reddit"]'),
      );
      debug(`Found ${redditContainers.length} Reddit embeds`);

      redditContainers.forEach((iframe, index) => {
        try {
          debug(
            `Processing Reddit embed ${index + 1}/${redditContainers.length}`,
          );

          // Try to extract the Reddit URL
          let redditUrl = null;

          if (iframe.src) {
            redditUrl = extractRedditUrl(iframe.src);
            debug(`Extracted Reddit URL from src: ${redditUrl}`);
          }

          // If we couldn't get the URL, use a generic Reddit URL
          if (!redditUrl) {
            redditUrl = "https://www.reddit.com";
            debug("Could not extract specific Reddit URL, using generic URL");
          }

          // Create a replacement link
          const link = document.createElement("a");
          link.href = redditUrl;
          link.textContent = redditUrl;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.className = "disabled-embed-link";

          // Insert link before the embed iframe
          debug(`Replacing Reddit embed with link to ${redditUrl}`);
          iframe.parentNode.insertBefore(link, iframe);

          // Remove the original embed
          iframe.parentNode.removeChild(iframe);
          replacedCount++;
        } catch (error) {
          log(`Error replacing Reddit embed ${index + 1}: ${error.message}`);
        }
      });
    }

    log(`Replaced ${replacedCount} embeds in total`);
  }

  // Extract YouTube video ID from iframe src
  function extractYouTubeId(url) {
    if (!url) return null;

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
  function extractRedditUrl(url) {
    if (!url) return null;

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
  const observer = new MutationObserver((mutations) => {
    let needsProcessing = false;

    for (const mutation of mutations) {
      // Check if any nodes were added
      if (mutation.addedNodes.length) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if this node or any of its children have YouTube embeds
            if (
              disableYouTube &&
              (node.querySelector('span[data-s9e-mediaembed="youtube"]') ||
                (node.tagName === "SPAN" &&
                  node.getAttribute("data-s9e-mediaembed") === "youtube"))
            ) {
              needsProcessing = true;
              break;
            }

            // Check if this node or any of its children have Reddit embeds
            if (
              disableReddit &&
              (node.querySelector('iframe[data-s9e-mediaembed="reddit"]') ||
                (node.tagName === "IFRAME" &&
                  node.getAttribute("data-s9e-mediaembed") === "reddit"))
            ) {
              needsProcessing = true;
              break;
            }
          }
        }

        if (needsProcessing) break;
      }
    }

    if (needsProcessing) {
      debug("Found new embeds in DOM mutation, processing...");
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
