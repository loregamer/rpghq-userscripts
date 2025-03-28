/**
 * Customize all notifications in the panel
 */
export function customizeNotificationPanel() {
  document
    .querySelectorAll(".notification-block, a.notification-block")
    .forEach(customizeNotificationBlock);
}