// RPGHQ - Kalarion Reaction Auto-Marker
/**
 * Marks smiley reaction notifs from Kalarion automagically so he can't rape you
 * Original script by loregamer, adapted for the RPGHQ Userscript Manager.
 * License: MIT
 *
 * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/kalareact.md for documentation
 */

export function init() {
  console.log("Kalarion Reaction Auto-Marker initialized!");

  // Function to check for notifications from dolor and mark them as read
  function checkAndMarkDolorNotifications() {
    // Find all notification items
    const notificationItems = document.querySelectorAll('li.bg2');
    
    notificationItems.forEach(item => {
      // Find the username span within this notification
      const usernameSpan = item.querySelector('span.username');
      
      // If the username starts with 'dolor', click the mark read button
      if (usernameSpan && usernameSpan.textContent.trim().startsWith('dolor')) {
        console.log('Found notification from dolor, marking as read');
        
        // Find and click the mark read button
        const markReadButton = item.querySelector('a.mark_read');
        if (markReadButton) {
          markReadButton.click();
        }
      }
    });
  }
  
  // Check for dolor notifications immediately
  checkAndMarkDolorNotifications();
  
  // Set up an interval to periodically check for new notifications
  const intervalId = setInterval(checkAndMarkDolorNotifications, 5000); // Check every 5 seconds
  
  // Return cleanup function
  return {
    cleanup: () => {
      console.log("Kalarion Reaction Auto-Marker cleanup");
      // Clear the interval when the script is disabled
      clearInterval(intervalId);
    },
  };
}
