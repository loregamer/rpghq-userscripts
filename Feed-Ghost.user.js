// ==UserScript==
// @name         Replace entire page with board index
// @namespace    https://rpghq.org/
// @version      1.0
// @description  Makes viewonline.php look exactly like index.php
// @match        https://rpghq.org/forums/viewonline.php
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // URL of the board index
  const sourceURL = "https://rpghq.org/forums/index.php";

  // Fetch the entire HTML of index.php
  fetch(sourceURL)
    .then((response) => response.text())
    .then((html) => {
      // Parse the fetched HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Replace the entire <html> of the current page with the <html> from index.php
      document.documentElement.replaceWith(doc.documentElement);
    })
    .catch((err) => {
      console.error("Error replacing viewonline.php content:", err);
    });
})();
