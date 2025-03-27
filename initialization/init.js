/**
 * Initialize the userscript
 */
export function init() {
  addStyles();
  GM_registerMenuCommand("RPGHQ Userscript Manager", showModal);

  // Add menu button to the page when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addMenuButton);
  } else {
    addMenuButton();
  }
}
