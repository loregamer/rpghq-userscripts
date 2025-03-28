/**
 * Check for displayed posts and mark their notifications as read
 */
export function checkAndMarkNotifications() {
  const displayedPostIds = getDisplayedPostIds();
  const notificationData = getNotificationData();

  notificationData.forEach((notification) => {
    if (displayedPostIds.includes(notification.postId)) {
      markNotificationAsRead(notification.href);
    }
  });
}