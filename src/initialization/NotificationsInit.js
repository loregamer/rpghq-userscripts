import { customizeNotificationsContainer } from "../ui/Notifications/CustomizeNotifications.js";
import { checkAndMarkNotifications } from "../helpers/Notifications/Marker.js";
import { cleanupStorage } from "../helpers/Notifications/Storage.js";
import { Logger } from "../helpers/Core/Logger.js";

const log = new Logger("Notifications Init");
let observer = null;
let debounceTimer = null;

/**
 * Debounced function to customize notifications in the main panel.
 */
function debouncedCustomizePanel() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    log.debug("Debounced panel customization triggered.");
    // Target the dropdown specifically, assuming it gets added/modified
    const panel = document.querySelector("#notification_list"); // Adjust if selector changes
    if (panel) {
      customizeNotificationsContainer(panel, ".notification-block", false);
    }
  }, 250); // Increased debounce slightly
}

/**
 * Sets up a MutationObserver to watch for dynamically added notifications.
 */
function setupObserver() {
  if (observer) {
    log.debug("Observer already running.");
    return; // Don't set up multiple observers
  }

  observer = new MutationObserver((mutations) => {
    let shouldProcessPanel = false;

    for (const mutation of mutations) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        // Check if added nodes contain the notification panel or individual blocks
        const hasNewNotifications = Array.from(mutation.addedNodes).some(
          (node) =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.id === "notification_list" || // The whole panel was added
              node.classList?.contains("notification-block") || // A block was added directly
              node.querySelector?.(".notification-block")) // A block was added inside another node
        );

        if (hasNewNotifications) {
          log.debug("Detected new notification nodes.");
          shouldProcessPanel = true;
          break; // No need to check further mutations for this batch
        }
      }
    }

    if (shouldProcessPanel) {
      debouncedCustomizePanel();
      checkAndMarkNotifications(); // Also check marks when panel updates
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  log.info("Notification observer started.");
}

/**
 * Initializes the Notifications feature.
 * - Applies initial customizations.
 * - Sets up the observer.
 * - Runs storage cleanup.
 */
export function initializeNotifications() {
  log.info("Initializing Notifications feature...");

  try {
    // Initial customization of notifications page if currently on it
    if (window.location.href.includes("ucp.php?i=ucp_notifications")) {
      log.debug("On notifications page, running initial customization.");
      customizeNotificationsContainer(document, ".notification-block", true);
    }

    // Initial customization of the panel if it exists on load
    const initialPanel = document.querySelector("#notification_list");
    if (initialPanel) {
      log.debug("Notification panel found on initial load, customizing.");
      customizeNotificationsContainer(
        initialPanel,
        ".notification-block",
        false
      );
    }

    // Check for notifications to mark as read on initial load
    checkAndMarkNotifications();

    // Set up the observer to handle dynamic changes
    setupObserver();

    // Run storage cleanup (can run last)
    cleanupStorage();

    log.info("Notifications feature initialized successfully.");
  } catch (error) {
    log.error("Error during Notifications initialization:", error);
  }
}
