import { addStyles } from '../helpers/Core/ui/addStyles.js';
import { showModal } from '../ui/modals/core/showModal.js';
import { toggleModalWithInsertKey } from '../helpers/Core/ui/toggleModalWithInsertKey.js';
import { addMenuButton } from './addMenuButton.js';
import { initializeNotifications } from './NotificationsInit.js'; // Import the new initializer

/**
 * Initialize the userscript
 */
export function init() {
  addStyles();
  GM_registerMenuCommand("RPGHQ Userscript Manager", showModal);
  
  // Add event listener for the Insert key to toggle the modal
  document.addEventListener("keydown", toggleModalWithInsertKey);

  // Add menu button to the page when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addMenuButton);
  } else {
    addMenuButton();
    // Initialize Notifications feature (matches document-ready)
    initializeNotifications();
  }
}
