/**
 * Initialize the userscript
 */
function init() {
  addStyles();
  GM_registerMenuCommand("RPGHQ Userscript Manager", showModal);
  
  // Add menu button to the page when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addMenuButton);
  } else {
    addMenuButton();
  }
}

// Export the function if in Node.js environment
if (typeof module !== 'undefined') {
  module.exports = init;
}
