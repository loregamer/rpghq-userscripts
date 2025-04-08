// ==UserScript==
// @name        RPGHQ Userscript Manager (Popup Only)
// @namespace   https://rpghq.org/
// @version     3.0.2
// @description A simple popup that displays the MANIFEST of available scripts without any functional components
// @author      loregamer
// @match       https://rpghq.org/forums/*
// @run-at      document-start
// @grant       GM_addStyle
// @grant       GM_registerMenuCommand
// ==/UserScript==

(function () {
  "use strict";

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

  // Import metadata for rollup-plugin-userscript

  (function () {
    // Run initialization
    init();
  })();
})();
