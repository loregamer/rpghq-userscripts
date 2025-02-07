// ==UserScript==
// @name         rpghq.org - Override updateInterval
// @namespace    https://rpghq.org/
// @version      1.0
// @description  Overrides activeNotifications.updateInterval to 999999 on rpghq.org forums page.
// @match        http://rpghq.org/forums/index.php*
// @match        https://rpghq.org/forums/index.php*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  // Poll for the activeNotifications object.
  function overrideUpdateInterval() {
    if (
      window.activeNotifications &&
      typeof window.activeNotifications === "object"
    ) {
      window.activeNotifications.updateInterval = 999999;
      console.log("activeNotifications.updateInterval set to 999999");
    } else {
      // Try again shortly if the object isn’t available yet.
      setTimeout(overrideUpdateInterval, 50);
    }
  }

  overrideUpdateInterval();
})();
