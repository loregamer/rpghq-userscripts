/**
 * Forum Preference Handlers
 *
 * This system manages features that run automatically based on forum preferences
 * rather than being toggleable scripts. These handlers apply display and behavior
 * modifications that users control through the Forum Preferences interface.
 */

import { gmGetValue } from "./main.js";
import { log, error } from "./utils/logger.js";

// Import preference handlers
import { commaFormattingHandler } from "./preferenceHandlers/commaFormatting.js";
import { mediaEmbedsHandler } from "./preferenceHandlers/mediaEmbeds.js";

// Map of preference handlers that run automatically
export const PREFERENCE_HANDLERS = {
  // Display preferences
  commaFormatting: commaFormattingHandler,

  // TODO: Add these handlers as we convert more scripts
  // quoteStyling: quoteStyleHandler,
  // reactionDisplay: reactionDisplayHandler,
  // recentTopicsFormat: recentTopicsFormatHandler,

  // Thread preferences
  mediaEmbeds: mediaEmbedsHandler,
};

// Track loaded handlers for cleanup
const loadedHandlers = {};

/**
 * Initialize all forum preference handlers
 * These run automatically on page load based on user preferences
 */
export function initializeForumPreferences() {
  log("Initializing forum preference handlers...");

  Object.entries(PREFERENCE_HANDLERS).forEach(([id, handler]) => {
    try {
      // Check if handler should be active based on preferences
      if (handler.shouldRun && !handler.shouldRun()) {
        log(`Skipping preference handler: ${id} (conditions not met)`);
        return;
      }

      // Initialize the handler
      log(`Initializing preference handler: ${id}`);
      const result = handler.init();

      // Store cleanup function if provided
      if (result && typeof result.cleanup === "function") {
        loadedHandlers[id] = result.cleanup;
      }
    } catch (err) {
      error(`Failed to initialize preference handler: ${id}`, err);
    }
  });

  log("Forum preference handlers initialized");
}

/**
 * Clean up all loaded preference handlers
 * Called when needed (e.g., before reinitializing)
 */
export function cleanupForumPreferences() {
  log("Cleaning up forum preference handlers...");

  Object.entries(loadedHandlers).forEach(([id, cleanup]) => {
    try {
      if (typeof cleanup === "function") {
        cleanup();
        log(`Cleaned up preference handler: ${id}`);
      }
    } catch (err) {
      error(`Failed to cleanup preference handler: ${id}`, err);
    }
  });

  // Clear the loaded handlers
  Object.keys(loadedHandlers).forEach((key) => delete loadedHandlers[key]);
}

/**
 * Reinitialize preference handlers (useful when preferences change)
 */
export function reinitializeForumPreferences() {
  cleanupForumPreferences();
  initializeForumPreferences();
}
