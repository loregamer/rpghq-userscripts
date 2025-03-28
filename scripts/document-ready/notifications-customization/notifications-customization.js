/**
 * RPGHQ Notifications Customization
 * Customize RPGHQ notifications display with enhanced reactions, better formatting, and automatic marking
 */
export function notifications_customization() {
  // Check if notifications customization is enabled
  const enableNotificationStyles = GM_getValue("enableNotificationStyles", true);
  if (!enableNotificationStyles) return;
  
  // Add CSS override to set max-width to 50px for .row .list-inner img
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    .row .list-inner img {
      max-width: 50px !important;
    }
  `;
  document.head.appendChild(styleElement);

  // Initialize notifications customization
  customizeNotificationPanel();
  checkAndMarkNotifications();

  // Special handling for notification page
  if (window.location.href.includes("ucp.php?i=ucp_notifications")) {
    customizeNotificationPage();
  }

  // Add debouncing to prevent rapid re-processing
  let debounceTimer;
  const debouncedCustomize = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      customizeNotificationPanel();
    }, 100);
  };

  // Observe DOM changes to apply customizations dynamically
  const observer = new MutationObserver((mutations) => {
    let shouldProcess = false;

    for (const mutation of mutations) {
      // Only process if new notification blocks are added
      if (mutation.type === "childList") {
        const hasNewNotifications = Array.from(mutation.addedNodes).some(
          (node) => {
            return (
              node.nodeType === Node.ELEMENT_NODE &&
              (node.classList?.contains("notification-block") ||
                node.querySelector?.(".notification-block"))
            );
          }
        );

        if (hasNewNotifications) {
          shouldProcess = true;
          break;
        }
      }
    }

    if (shouldProcess) {
      debouncedCustomize();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Run storage cleanup
  cleanupStorage();
}