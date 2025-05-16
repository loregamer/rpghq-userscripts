/**
 * Ghost functionality styles
 * CSS styling for the Ghost feature in the RPGHQ Userscript Manager
 */

import { log } from "../logger.js";

/**
 * Add Ghost-specific styles to the page
 */
export function addGhostStyles() {
  const styleId = "rpghq-ghost-styles";

  // If styles already exist, don't add them again
  if (document.getElementById(styleId)) {
    return;
  }

  log("Adding Ghost styles to page");

  const css = `
    /* Ghost Feature: Core styles for hiding and highlighting content */
    .ghosted-post:not(.show),
    .ghosted-post-manual:not(.show) {
      position: relative;
      opacity: 0.25;
      pointer-events: none;
    }

    .show-hidden-threads .ghosted-post,
    .show-hidden-threads .ghosted-post-manual,
    .ghosted-post.show,
    .ghosted-post-manual.show {
      opacity: 1;
      pointer-events: auto;
    }

    /* Ghost markers for highlighting */
    .ghosted-by-author {
      background-color: var(--ghost-author-highlight, rgba(255, 0, 0, 0.1)) !important;
    }

    .ghosted-by-content {
      background-color: var(--ghost-content-highlight, rgba(255, 128, 0, 0.1)) !important;
    }

    /* Hide content in rows */
    .ghosted-row:not(.show) {
      display: none !important;
    }

    .ghosted-row.show {
      display: inherit !important;
      opacity: 0.6;
    }

    /* Quotes from ghosted users */
    .ghosted-quote:not(.show) {
      display: none !important;
    }

    .ghosted-quote.show {
      display: inherit !important;
      opacity: 0.6;
      border-left: 3px solid var(--ghost-author-highlight, rgba(255, 0, 0, 0.1)) !important;
    }

    /* Manual ghost buttons */
    .post-ghost-button-li {
      display: none;
    }

    .alt-key-down .post-ghost-button-li,
    body.show-ghost-buttons .post-ghost-button-li {
      display: inline-block;
    }

    /* Toggle button for showing/hiding ghosted content */
    .show-ghosted-posts {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      border: none;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, background-color 0.2s;
    }

    .show-ghosted-posts:hover {
      transform: scale(1.1);
      background-color: rgba(0, 0, 0, 0.8);
    }

    .show-ghosted-posts.active {
      background-color: #3889ED;
    }

    /* Ghost toggle notification */
    .ghost-toggle-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 9999;
      transition: opacity 0.3s;
    }

    /* Ghost status message styles */
    .ghost-status-message {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 10px 15px;
      border-radius: 4px;
      color: white;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      transition: opacity 0.3s;
    }

    .ghost-status-message.success {
      background-color: var(--success-color, #2ecc71);
    }

    .ghost-status-message.error {
      background-color: var(--danger-color, #e74c3c);
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
      .show-ghosted-posts {
        bottom: 10px;
        right: 10px;
        width: 36px;
        height: 36px;
      }
    }
  `;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = css;
  document.head.appendChild(style);
}
