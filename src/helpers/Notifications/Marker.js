import { extractPostIdFromUrl } from "./ContentParsing.js";
import { Logger } from "../Core/Logger.js";

const log = new Logger("Notifications Marker");

/**
 * Gets IDs of posts currently visible in the main content area.
 * @returns {string[]} Array of visible post IDs.
 */
function getDisplayedPostIds() {
  // Find post containers (adjust selector if needed)
  return Array.from(document.querySelectorAll('div[id^="p"]')).map((el) =>
    el.id.substring(1)
  );
}

/**
 * Extracts notification data (link href and associated post ID) from notification elements.
 * @param {string} notificationSelector - CSS selector for notification link elements.
 * @returns {Array<{href: string, postId: string}>} Array of notification data objects.
 */
function getNotificationData(
  notificationSelector = '.notification-block a[href*="mark_notification="]'
) {
  return Array.from(document.querySelectorAll(notificationSelector))
    .map((link) => {
      // Use data-real-url if available (added by customization?), otherwise use href
      const url = link.dataset.realUrl || link.getAttribute("href");
      const postId = extractPostIdFromUrl(url);
      const markReadHref = link.getAttribute("href"); // The actual mark_notification link

      // Ensure we have a valid mark_notification href and a post ID
      if (
        markReadHref &&
        markReadHref.includes("mark_notification=") &&
        postId
      ) {
        return { href: markReadHref, postId };
      }
      return null;
    })
    .filter(Boolean); // Filter out any null entries
}

/**
 * Marks a specific notification as read by sending a request.
 * @param {string} markReadHref - The relative URL to mark the notification as read.
 */
function markNotificationAsRead(markReadHref) {
  if (!markReadHref || !markReadHref.includes("mark_notification=")) {
    log.warn("Invalid mark-as-read href provided:", markReadHref);
    return;
  }

  const fullUrl = new URL(markReadHref, "https://rpghq.org/forums/").toString();
  log.debug(`Marking notification as read: ${fullUrl}`);

  GM_xmlhttpRequest({
    method: "GET",
    url: fullUrl,
    onload: (response) => {
      if (response.status >= 200 && response.status < 300) {
        log.info(`Notification marked as read successfully: ${markReadHref}`);
      } else {
        log.warn(
          `Failed to mark notification as read (${response.status}): ${markReadHref}`
        );
      }
    },
    onerror: (error) => {
      log.error(
        `Error during mark as read request for ${markReadHref}:`,
        error
      );
    },
  });
}

/**
 * Checks currently displayed posts against notifications and marks matching ones as read.
 */
export function checkAndMarkNotifications() {
  try {
    const displayedPostIds = getDisplayedPostIds();
    if (displayedPostIds.length === 0) {
      log.debug("No posts found on the page to check against notifications.");
      return; // No posts visible, nothing to mark
    }

    const notificationData = getNotificationData();
    if (notificationData.length === 0) {
      log.debug("No unread notifications found to check.");
      return; // No notifications to check
    }

    log.info(
      `Checking ${notificationData.length} notifications against ${displayedPostIds.length} displayed posts.`
    );

    let markedCount = 0;
    notificationData.forEach((notification) => {
      // If the post associated with the notification is visible on the page
      if (displayedPostIds.includes(notification.postId)) {
        markNotificationAsRead(notification.href);
        markedCount++;
      }
    });

    if (markedCount > 0) {
      log.info(
        `Marked ${markedCount} notifications as read based on viewed posts.`
      );
    }
  } catch (error) {
    log.error("Error during checkAndMarkNotifications:", error);
  }
}
