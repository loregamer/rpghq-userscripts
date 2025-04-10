// RPGHQ - Kalarion Reaction Auto-Marker
/**
 * Marks smiley reaction notifs from Kalarion automagically so he can't rape you
 * Original script by loregamer, adapted for the RPGHQ Userscript Manager.
 * License: MIT
 *
 * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/kalareact.md for documentation
 */

export function init() {
  console.log("User Reaction Auto-Marker initialized!");
  const notifications = document.querySelector("#notification_list");

  const notificationItems = notifications.querySelectorAll("li");

  notificationItems.forEach((item) => {
    // Return early if there's no notification-block link
    if (!item.querySelector("a.notification-block")) {
      return;
    }

    // Find the username span within this notification
    const usernameSpan = item.querySelector("span.username");
    if (!usernameSpan) return;

    const username = usernameSpan.textContent.trim();

    // Return if username doesn't start with "Kalarion" or "dolor"
    if (!username.startsWith("Kalarion") && !username.startsWith("dolor")) {
      return;
    }

    console.log(`Found notification from ${username}, marking as read`);

    // Find and click the mark read button
    const markReadButton = item.querySelector("a.mark_read");
    if (markReadButton) {
      markReadButton.click();

      // Remove the notification row from the DOM
      console.log(`Removing ${username} notification from view`);
    }
    item.remove();
  });
}
