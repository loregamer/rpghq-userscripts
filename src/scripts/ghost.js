/**
 * Ghost functionality integration for RPGHQ Userscript Manager
 * Provides Ghost features for hiding and managing ghosted users
 */

import { log, debug, error } from "../utils/logger.js";
import { initGhost } from "../utils/ghost/ghost.js";
import { processGhostContent } from "../utils/ghost/ghost-content.js";

export function init() {
  log("Initializing Ghost script...");

  try {
    // Initialize the Ghost functionality
    const ghostUtils = initGhost();

    // Process the content on the page
    processGhostContent();

    // Return cleanup function
    return {
      cleanup: () => {
        if (ghostUtils && ghostUtils.cleanup) {
          ghostUtils.cleanup();
        }
        log("Ghost script cleanup complete");
      },
    };
  } catch (err) {
    error("Error initializing Ghost script:", err);
    return {
      cleanup: () => {
        log("Ghost script cleanup (error fallback)");
      },
    };
  }
}
