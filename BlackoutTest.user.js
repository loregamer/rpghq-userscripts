// ==UserScript==
// @name         Blackout Test
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Test script that immediately blacks out the page
// @author       You
// @match        https://rpghq.org/*/*
// @run-at       document-start
// @grant        none
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/ghosted-users/BlackoutTest.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/ghosted-users/BlackoutTest.user.js
// ==/UserScript==

(function () {
  "use strict";

  // Create and inject the overlay style immediately
  const style = document.createElement("style");
  style.textContent = `
        /* Force the overlay to be on top of everything */
        #immediate-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: black;
            z-index: 999999;
            pointer-events: none;
        }

        /* Hide all content until processed */
        body {
            visibility: hidden !important;
        }
        
        /* Only show content when ready */
        body.content-ready {
            visibility: visible !important;
        }
    `;

  // Insert style as early as possible
  (document.head || document.documentElement).appendChild(style);

  // Create and insert overlay div
  const overlay = document.createElement("div");
  overlay.id = "immediate-overlay";
  (document.body || document.documentElement).appendChild(overlay);

  // Wait for full load before removing overlay
  window.addEventListener("load", () => {
    // Simulate some processing time
    setTimeout(() => {
      document.body.classList.add("content-ready");
      overlay.remove();
    }, 500); // Half second delay to simulate processing
  });
})();
