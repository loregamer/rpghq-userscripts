import { addStyles } from "../helpers/Core/ui/addStyles.js";
// import { showModal } from "../ui/modals/core/showModal.js"; // Remove old import
// import { toggleModalWithInsertKey } from "../helpers/Core/ui/toggleModalWithInsertKey.js"; // Remove old import
import { popupHelpers } from "../helpers/popupHelpers.js"; // Import new helpers
import { addMenuButton } from "./addMenuButton.js";

/**
 * Initialize the userscript
 */
export function init() {
  addStyles();
  // Register menu command to use the helper function
  GM_registerMenuCommand("RPGHQ Userscript Manager", popupHelpers.showModal);

  // Add event listener for the Insert key using the helper function
  // Note: toggleModalWithInsertKey function itself adds the listener now
  popupHelpers.toggleModalWithInsertKey();

  // Add menu button to the page when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addMenuButton);
  } else {
    addMenuButton();
  }
}
