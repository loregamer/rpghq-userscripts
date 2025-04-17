// G:/Modding/_Github/HQ-Userscripts/src/components/updateNotification.js
import { log } from "../utils/logger.js";

// Function to inject CSS for the notification
function addNotificationStyles() {
  const styleId = "update-notification-style";
  if (document.getElementById(styleId)) return; // Style already added

  const css = `
    .update-notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: #C62D51; /* Green */
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      z-index: 10001; /* Above modal */
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      transition: opacity 0.3s ease-in-out;
    }
    .update-notification:hover {
      opacity: 0.9;
    }
    .update-notification-close {
      margin-left: 10px;
      font-weight: bold;
      cursor: pointer;
    }
  `;
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = css;
  document.head.appendChild(style);
}

export function showUpdateNotification(newVersion, downloadUrl) {
  log(`Showing update notification for version ${newVersion}`);
  addNotificationStyles(); // Ensure styles are present

  // Remove existing notification if any
  const existingNotification = document.getElementById(
    "update-notification-bubble",
  );
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement("div");
  notification.id = "update-notification-bubble";
  notification.className = "update-notification";
  notification.innerHTML = `
    Userscript Update (v${newVersion})
    <span class="update-notification-close" title="Dismiss">&times;</span>
  `;

  // Click on main body opens download link
  notification.addEventListener("click", (event) => {
    if (
      event.target !== notification.querySelector(".update-notification-close")
    ) {
      log(`Opening download URL: ${downloadUrl}`);
      window.open(downloadUrl, "_blank");
    }
  });

  // Click on close button dismisses
  notification
    .querySelector(".update-notification-close")
    .addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent triggering the main click
      log("Dismissing update notification.");
      notification.remove();
    });

  document.body.appendChild(notification);
}
