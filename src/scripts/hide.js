/**
 * Hide functionality integration for RPGHQ Userscript Manager
 * Provides Hide features for hiding and managing hidden users
 */

import { log, debug, error } from "../utils/logger.js";
import { initHide } from "../utils/hide/hide.js";
import { processHideContent } from "../utils/hide/hide-content.js";

export function init() {
  log("Initializing Hide script...");

  try {
    // Initialize the Hide functionality
    const hideUtils = initHide();

    // Process the content on the page
    processHideContent();

    // Return cleanup function
    return {
      cleanup: () => {
        if (hideUtils && hideUtils.cleanup) {
          hideUtils.cleanup();
        }
        log("Hide script cleanup complete");
      },
    };
  } catch (err) {
    error("Error initializing Hide script:", err);
    return {
      cleanup: () => {
        log("Hide script cleanup (error fallback)");
      },
    };
  }
}
