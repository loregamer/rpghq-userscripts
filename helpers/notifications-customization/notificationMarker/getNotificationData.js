/**
 * Get notification data from notification blocks
 * @returns {Array} Array of notification data objects
 */
export function getNotificationData() {
  return Array.from(document.querySelectorAll(".notification-block"))
    .map((link) => {
      const href = link.getAttribute("href");
      const postId = extractPostId(
        link.getAttribute("data-real-url") || href
      );
      return { href, postId };
    })
    .filter((data) => data.href && data.postId);
}