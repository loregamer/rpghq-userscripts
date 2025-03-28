/**
 * Mark a notification as read
 * @param {string} href - The notification href
 */
export function markNotificationAsRead(href) {
  GM_xmlhttpRequest({
    method: "GET",
    url: "https://rpghq.org/forums/" + href,
    onload: (response) =>
      console.log("Notification marked as read:", response.status),
  });
}