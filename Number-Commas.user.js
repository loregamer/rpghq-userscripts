// ==UserScript==
// @name         RPGHQ - Thousands Comma Formatter
// @namespace    http://tampermonkey.net/
// @version      2.1.1
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

  const formatFourDigits = GM_getValue("formatFourDigits", false);

  const numberRegex = formatFourDigits ? /\b\d{4,}\b/g : /\b\d{5,}\b/g;

  function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function calculateForumStatistics() {
    // Only run on index.php
    if (!window.location.pathname.endsWith("index.php")) {
      return;
    }

    let totalTopics = 0;
    let totalPosts = 0;

    // Get all posts and topics elements
    const postsElements = document.querySelectorAll("dd.posts");
    const topicsElements = document.querySelectorAll("dd.topics");

    console.log(
      `Found ${postsElements.length} post elements and ${topicsElements.length} topic elements`
    );

    // Sum up posts
    postsElements.forEach((element, index) => {
      const postsText = element.childNodes[0].textContent
        .trim()
        .replace(/,/g, "");
      const posts = parseInt(postsText);
      console.log(`Post element ${index + 1}:`, {
        rawText: element.textContent,
        trimmedNumber: postsText,
        parsed: posts,
      });
      if (!isNaN(posts)) {
        totalPosts += posts;
        console.log(`Added ${posts} posts, running total: ${totalPosts}`);
      }
    });

    // Sum up topics
    topicsElements.forEach((element, index) => {
      const topicsText = element.childNodes[0].textContent
        .trim()
        .replace(/,/g, "");
      const topics = parseInt(topicsText);
      console.log(`Topic element ${index + 1}:`, {
        rawText: element.textContent,
        trimmedNumber: topicsText,
        parsed: topics,
      });
      if (!isNaN(topics)) {
        totalTopics += topics;
        console.log(`Added ${topics} topics, running total: ${totalTopics}`);
      }
    });

    console.log("Final totals:", {
      posts: totalPosts,
      topics: totalTopics,
    });

    // Function to format numbers, only adding commas for 5+ digits
    function formatStatNumber(num) {
      return num.toString().length >= 5
        ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        : num.toString();
    }

    // Find and update the statistics block
    const statsBlock = document.querySelector(".stat-block.statistics");
    if (statsBlock) {
      const statsText = statsBlock.querySelector("p");
      if (statsText) {
        const existingText = statsText.innerHTML;
        // Keep the members count and newest member info, but update topics and posts
        const membersMatch = existingText.match(
          /Total members <strong>(\d+)<\/strong>/
        );
        const newestMemberMatch = existingText.match(
          /(Our newest member <strong>.*?<\/strong>)/
        );

        if (membersMatch && newestMemberMatch) {
          statsText.innerHTML = `Total posts <strong>${formatStatNumber(
            totalPosts
          )}</strong> • Total topics <strong>${formatStatNumber(
            totalTopics
          )}</strong> • Total members <strong>${membersMatch[1]}</strong> • ${
            newestMemberMatch[1]
          }`;
          console.log("Updated statistics block with new totals");
        }
      }
    }
  }

  function processElements() {
    const elements = document.querySelectorAll(
      "dd.posts, dd.profile-posts, dd.views, span.responsive-show.left-box, .column2 .details dd"
    );

    elements.forEach((element) => {
      if (
        element.classList.contains("posts") ||
        element.classList.contains("views") ||
        (element.parentElement &&
          element.parentElement.classList.contains("details"))
      ) {
        if (
          element.previousElementSibling &&
          element.previousElementSibling.textContent.trim() === "Joined:"
        ) {
          return;
        }

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

      const strongElements = element.querySelectorAll("strong");
      strongElements.forEach((strong) => {
        if (numberRegex.test(strong.textContent)) {
          strong.textContent = strong.textContent.replace(
            numberRegex,
            (match) => formatNumberWithCommas(match)
          );
        }
      });
    });
  }

  function toggleFourDigitFormatting() {
    const newValue = !GM_getValue("formatFourDigits", false);
    GM_setValue("formatFourDigits", newValue);
    updateMenuLabel(newValue);
    location.reload();
  }

  function updateMenuLabel(formatFourDigits) {
    const label = formatFourDigits
      ? "Disable 4-digit formatting"
      : "Enable 4-digit formatting";
    GM_unregisterMenuCommand("Toggle 4-digit formatting");
    GM_registerMenuCommand(label, toggleFourDigitFormatting);
  }

  updateMenuLabel(formatFourDigits);

  // Run initial processing
  processElements();
  calculateForumStatistics();

  // Only observe for number formatting changes, not statistics
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        processElements();
      }
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
