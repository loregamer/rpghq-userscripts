/**
 * Initialize the userscript
 */
function init() {
  addStyles();
  GM_registerMenuCommand("RPGHQ Userscript Manager", showModal);
  
  // Add event listener for the Insert key to toggle the modal
  document.addEventListener("keydown", toggleModalWithInsertKey);

  // Add menu button to the page when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addMenuButton);
  } else {
    addMenuButton();
  }
}
