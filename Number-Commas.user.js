// ==UserScript==
// @name         RPGHQ - Thousands Comma Formatter
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Add commas to numbers
// @match        https://rpghq.org/forums/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/main/Number-Commas.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/main/Number-Commas.user.js
// @license      MIT
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// ==/UserScript==

/*
MIT License

Copyright (c) 2024 loregamer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

(function () {
  "use strict";

  // Get the user's preference for formatting 4-digit numbers (default: false)
  const formatFourDigits = GM_getValue("formatFourDigits", false);

  // Regular expression to match numbers with 4 or more digits, or 5 or more digits
  const numberRegex = formatFourDigits ? /\b\d{4,}\b/g : /\b\d{5,}\b/g;

  // Function to format a number with commas
  function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Function to process and format numbers in specific elements
  function processElements() {
    // Target <dd> elements with class "posts", "profile-posts", or "views", and spans with class "responsive-show left-box"
    const elements = document.querySelectorAll(
      "dd.posts, dd.profile-posts, dd.views, span.responsive-show.left-box"
    );

    elements.forEach((element) => {
      if (
        element.classList.contains("posts") ||
        element.classList.contains("views")
      ) {
        element.childNodes.forEach((node) => {
          if (
            node.nodeType === Node.TEXT_NODE &&
            numberRegex.test(node.nodeValue)
          ) {
            node.nodeValue = node.nodeValue.replace(numberRegex, (match) =>
              formatNumberWithCommas(match)
            );
          }
        });
      } else if (element.classList.contains("profile-posts")) {
        const anchor = element.querySelector("a");
        if (anchor && numberRegex.test(anchor.textContent)) {
          anchor.textContent = anchor.textContent.replace(
            numberRegex,
            (match) => formatNumberWithCommas(match)
          );
        }
      } else if (element.classList.contains("responsive-show")) {
        const strong = element.querySelector("strong");
        if (strong && numberRegex.test(strong.textContent)) {
          strong.textContent = strong.textContent.replace(
            numberRegex,
            (match) => formatNumberWithCommas(match)
          );
        }
      }
    });
  }

  // Function to toggle formatting for 4-digit numbers
  function toggleFourDigitFormatting() {
    const newValue = !GM_getValue("formatFourDigits", false);
    GM_setValue("formatFourDigits", newValue);
    updateMenuLabel(newValue);
    location.reload(); // Reload the page to apply the new setting
  }

  // Function to update the menu label
  function updateMenuLabel(formatFourDigits) {
    const label = formatFourDigits
      ? "Disable 4-digit formatting"
      : "Enable 4-digit formatting";
    GM_unregisterMenuCommand("Toggle 4-digit formatting");
    GM_registerMenuCommand(label, toggleFourDigitFormatting);
  }

  // Initial menu setup
  updateMenuLabel(formatFourDigits);

  // Run the function to format numbers when the page loads
  processElements();

  // Add a mutation observer to handle dynamically added content
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        processElements();
      }
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
