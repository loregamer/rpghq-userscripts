/**
 * Hide functionality styles
 * CSS styling for the Hide feature in the RPGHQ Userscript Manager
 */

import { log } from "../logger.js";

/**
 * Add Hide-specific styles to the page
 */
export function addHideStyles() {
  const styleId = "rpghq-hide-styles";

  // If styles already exist, don't add them again
  if (document.getElementById(styleId)) {
    return;
  }

  log("Adding Hide styles to page");

  const css = `
    /* Hide Feature: Core styles for hiding and highlighting content */
    .hidden-post:not(.show),
    .hidden-post-manual:not(.show) {
      position: relative;
      opacity: 0.25;
      pointer-events: none;
    }

    .show-hidden-threads .hidden-post,
    .show-hidden-threads .hidden-post-manual,
    .hidden-post.show,
    .hidden-post-manual.show {
      opacity: 1;
      pointer-events: auto;
    }

    /* Hide markers for highlighting */
    .hidden-by-author {
      background-color: var(--hide-author-highlight, rgba(255, 0, 0, 0.1)) !important;
    }

    .hidden-by-content {
      background-color: var(--hide-content-highlight, rgba(255, 128, 0, 0.1)) !important;
    }

    /* Hide content in rows */
    .hidden-row:not(.show) {
      display: none !important;
    }

    .hidden-row.show {
      display: inherit !important;
      opacity: 0.6;
    }

    /* Quotes from hidden users */
    .hidden-quote:not(.show) {
      display: none !important;
    }

    .hidden-quote.show {
      display: inherit !important;
      opacity: 0.6;
      border-left: 3px solid var(--hide-author-highlight, rgba(255, 0, 0, 0.1)) !important;
    }

    /* Manual hide buttons */
    .post-hide-button-li {
      display: none;
    }

    .alt-key-down .post-hide-button-li,
    body.show-hide-buttons .post-hide-button-li {
      display: inline-block;
    }

    /* Toggle button for showing/hiding hidden content */
    .show-hidden-posts {
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

    .show-hidden-posts:hover {
      transform: scale(1.1);
      background-color: rgba(0, 0, 0, 0.8);
    }

    .show-hidden-posts.active {
      background-color: #3889ED;
    }

    /* Hide toggle notification */
    .hide-toggle-notification {
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

    /* Hide status message styles */
    .hide-status-message {
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

    .hide-status-message.success {
      background-color: var(--success-color, #2ecc71);
    }

    .hide-status-message.error {
      background-color: var(--danger-color, #e74c3c);
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
      .show-hidden-posts {
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
