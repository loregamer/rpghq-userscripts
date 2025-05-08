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

  // Check preferences
  const disableYouTube = gmGetValue("disable-youtube-embeds", false);
  const disableReddit = gmGetValue("disable-reddit-embeds", false);

  if (!disableYouTube && !disableReddit) {
    log("No embeds disabled, script inactive");
    return { cleanup: () => {} };
  }

  // Create a stylesheet that will be injected
  let styleRules = [];

  // Add rules for disabled YouTube embeds
  if (disableYouTube) {
    // Hide YouTube embeds completely
    styleRules.push(`
      /* Hide YouTube embeds */
      span[data-s9e-mediaembed="youtube"] {
        display: none !important;
      }
    `);

    // Add a CSS pattern that will replace the YouTube embeds with a custom attribute
    const youtubeCSS = `
      /* Replace YouTube embeds with links */
      .content:after {
        content: attr(data-youtube-links);
        display: block;
      }
    `;
    styleRules.push(youtubeCSS);

    // Function to replace YouTube embeds with custom attribute
    const replaceYouTubeEmbeds = () => {
      try {
        // Process all content blocks with YouTube embeds
        const contentBlocks = document.querySelectorAll(".content");
        contentBlocks.forEach((contentBlock) => {
          // Check if this content block has YouTube embeds
          const youtubeEmbeds = contentBlock.querySelectorAll(
            'span[data-s9e-mediaembed="youtube"]',
          );
          if (youtubeEmbeds.length > 0) {
            // Extract links from all YouTube embeds in this content block
            let links = [];
            youtubeEmbeds.forEach((embed) => {
              const iframe = embed.querySelector("iframe");
              if (iframe && iframe.src) {
                const videoId = extractYouTubeId(iframe.src);
                if (videoId) {
                  links.push(`https://www.youtube.com/watch?v=${videoId}`);
                }
              }
            });

            // Add the links as a custom attribute to the content block
            if (links.length > 0) {
              const linksHtml = links
                .map(
                  (link) =>
                    `<a href="${link}" target="_blank" rel="noopener noreferrer" class="disabled-embed-link">${link}</a>`,
                )
                .join("<br>");
              contentBlock.setAttribute("data-youtube-links", "");
              contentBlock.innerHTML += linksHtml;
            }
          }
        });
      } catch (error) {
        log(`Error replacing YouTube embeds: ${error.message}`);
      }
    };

    // Run the replacement as soon as possible
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", replaceYouTubeEmbeds, {
        once: true,
      });
    } else {
      replaceYouTubeEmbeds();
    }
  }

  // Add rules for disabled Reddit embeds
  if (disableReddit) {
    // Hide Reddit embeds completely
    styleRules.push(`
      /* Hide Reddit embeds */
      iframe[data-s9e-mediaembed="reddit"] {
        display: none !important;
      }
    `);

    // Function to replace Reddit embeds
    const replaceRedditEmbeds = () => {
      try {
        // Process all Reddit embeds
        const redditEmbeds = document.querySelectorAll(
          'iframe[data-s9e-mediaembed="reddit"]',
        );
        redditEmbeds.forEach((iframe) => {
          if (iframe && iframe.src) {
            const redditUrl = extractRedditUrl(iframe.src);
            if (redditUrl) {
              // Create the replacement link
              const link = document.createElement("a");
              link.href = redditUrl;
              link.textContent = redditUrl;
              link.target = "_blank";
              link.rel = "noopener noreferrer";
              link.className = "disabled-embed-link";

              // Insert the link after the iframe
              iframe.parentNode.insertBefore(link, iframe.nextSibling);
            }
          }
        });
      } catch (error) {
        log(`Error replacing Reddit embeds: ${error.message}`);
      }
    };

    // Run the replacement as soon as possible
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", replaceRedditEmbeds, {
        once: true,
      });
    } else {
      replaceRedditEmbeds();
    }
  }

  // Add styles for the replacement links
  styleRules.push(`
    /* Styles for embedded links */
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
  `);

  // Inject the stylesheet
  if (styleRules.length > 0) {
    // Use GM_addStyle to add the style rules
    try {
      // eslint-disable-next-line no-undef
      GM_addStyle(styleRules.join("\n"));
      log("Injected embed disabling styles");
    } catch (error) {
      log(`Error injecting styles: ${error.message}`);
    }
  }

  // Helper functions for extracting IDs and URLs
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

  // No cleanup needed for CSS-based solution
  return {
    cleanup: () => {
      log("Disable Embeds cleanup (CSS-based solution has no cleanup)");
      // Can't remove the injected CSS as it's a global modification
    },
  };
}
