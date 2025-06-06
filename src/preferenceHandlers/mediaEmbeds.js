/**
 * Media Embeds Preference Handler
 *
 * Controls the display of YouTube and Reddit embeds based on forum preferences.
 * This runs automatically based on thread display preferences.
 */

import { gmGetValue } from "../main.js";
import { log } from "../utils/logger.js";

export const mediaEmbedsHandler = {
  /**
   * Check if this handler should run
   */
  shouldRun: () => {
    // Check if any embed disabling is enabled
    const disableYouTube = gmGetValue("disable-youtube-embeds", false); // Default: OFF
    const disableReddit = gmGetValue("disable-reddit-embeds", false); // Default: OFF
    
    return disableYouTube || disableReddit;
  },

  /**
   * Initialize the media embed handler
   */
  init: () => {
    log("Initializing media embeds preference handler");

    // Check preferences
    const disableYouTube = gmGetValue("disable-youtube-embeds", false); // Default: OFF
    const disableReddit = gmGetValue("disable-reddit-embeds", false); // Default: OFF

    // Create stylesheet rules
    let styleRules = [];

    // Add rules for disabled YouTube embeds
    if (disableYouTube) {
      // Hide YouTube embeds completely
      styleRules.push(`
        /* Hide YouTube embeds but keep them in the DOM */
        span[data-s9e-mediaembed="youtube"] {
          display: none !important; 
        }
      `);

      // Function to add links after YouTube embeds
      const processYouTubeEmbeds = () => {
        try {
          // Find all YouTube embeds
          const youtubeEmbeds = document.querySelectorAll(
            'span[data-s9e-mediaembed="youtube"]',
          );
          log(`Found ${youtubeEmbeds.length} YouTube embeds to process`);

          youtubeEmbeds.forEach((embed, index) => {
            try {
              // Check if we already processed this embed
              if (
                embed.nextSibling &&
                embed.nextSibling.classList &&
                embed.nextSibling.classList.contains("embed-replacement-link")
              ) {
                return; // Skip already processed embeds
              }

              // Get the iframe to extract the video ID
              const iframe = embed.querySelector("iframe");
              if (iframe && iframe.src) {
                const videoId = extractYouTubeId(iframe.src);
                if (videoId) {
                  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

                  // Create a container for the link
                  const linkContainer = document.createElement("div");
                  linkContainer.className = "embed-replacement-link";
                  linkContainer.style.margin = "10px 0";

                  // Create the link
                  const link = document.createElement("a");
                  link.href = videoUrl;
                  link.textContent = videoUrl;
                  link.target = "_blank";
                  link.rel = "noopener noreferrer";
                  link.className = "disabled-embed-link";

                  linkContainer.appendChild(link);

                  // Insert after the embed
                  if (embed.nextSibling) {
                    embed.parentNode.insertBefore(
                      linkContainer,
                      embed.nextSibling,
                    );
                  } else {
                    embed.parentNode.appendChild(linkContainer);
                  }

                  log(
                    `Processed YouTube embed ${index + 1}: Added link for ${videoUrl}`,
                  );
                }
              }
            } catch (error) {
              log(
                `Error processing YouTube embed ${index + 1}: ${error.message}`,
              );
            }
          });
        } catch (error) {
          log(`Error processing YouTube embeds: ${error.message}`);
        }
      };

      // Run once when DOM is ready
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", processYouTubeEmbeds, {
          once: true,
        });
      } else {
        processYouTubeEmbeds();
      }
    }

    // Add rules for disabled Reddit embeds
    if (disableReddit) {
      // Hide Reddit embeds
      styleRules.push(`
        /* Hide Reddit embeds but keep them in the DOM */
        iframe[data-s9e-mediaembed="reddit"] {
          display: none !important;
        }
      `);

      // Function to add links after Reddit embeds
      const processRedditEmbeds = () => {
        try {
          // Find all Reddit embeds
          const redditEmbeds = document.querySelectorAll(
            'iframe[data-s9e-mediaembed="reddit"]',
          );
          log(`Found ${redditEmbeds.length} Reddit embeds to process`);

          redditEmbeds.forEach((iframe, index) => {
            try {
              // Check if we already processed this embed
              if (
                iframe.nextSibling &&
                iframe.nextSibling.classList &&
                iframe.nextSibling.classList.contains("embed-replacement-link")
              ) {
                return; // Skip already processed embeds
              }

              if (iframe.src) {
                // Try to directly access the full URL from the iframe source
                let redditUrl = extractRedditUrl(iframe.src);

                // If we couldn't get a proper URL, use a generic Reddit link
                if (!redditUrl) {
                  redditUrl = "https://www.reddit.com";
                  log(
                    `Could not extract specific Reddit URL for embed ${index + 1}, using generic URL`,
                  );
                }

                // Create a container for the link
                const linkContainer = document.createElement("div");
                linkContainer.className = "embed-replacement-link";
                linkContainer.style.margin = "10px 0";

                // Create the link
                const link = document.createElement("a");
                link.href = redditUrl;
                link.textContent = redditUrl;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.className = "disabled-embed-link";

                linkContainer.appendChild(link);

                // Insert after the iframe
                if (iframe.nextSibling) {
                  iframe.parentNode.insertBefore(
                    linkContainer,
                    iframe.nextSibling,
                  );
                } else {
                  iframe.parentNode.appendChild(linkContainer);
                }

                log(
                  `Processed Reddit embed ${index + 1}: Added link for ${redditUrl}`,
                );
              }
            } catch (error) {
              log(
                `Error processing Reddit embed ${index + 1}: ${error.message}`,
              );
            }
          });
        } catch (error) {
          log(`Error processing Reddit embeds: ${error.message}`);
        }
      };

      // Run once when DOM is ready
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", processRedditEmbeds, {
          once: true,
        });
      } else {
        processRedditEmbeds();
      }
    }

    // Add styles for the replacement links
    styleRules.push(`
      /* Styles for disabled embed links */
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
        let path = match[1].replace(/\\/g, "/");

        // Fix path format
        if (path.match(/^ClaudeAI\/comments\//)) {
          path = "r/" + path; // Add the missing 'r/' prefix
        } else if (!path.startsWith("r/") && path.includes("/comments/")) {
          // Handle any other subreddit missing r/
          const parts = path.split("/comments/");
          if (parts.length === 2) {
            path = "r/" + parts[0] + "/comments/" + parts[1];
          }
        }

        return `https://www.reddit.com/${path}`;
      }
      return null;
    }

    // No specific cleanup needed for CSS-based solution
    return {
      cleanup: () => {
        log(
          "Media embeds preference handler cleanup (CSS-based solution has no cleanup)",
        );
      },
    };
  },
};
