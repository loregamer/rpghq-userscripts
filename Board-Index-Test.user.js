// ==UserScript==
// @name         RPGHQ Board Index Layout Enhancer
// @namespace    http://rpghq.org/
// @version      1.0
// @description  Moves recent topics to right side of page on RPGHQ board index
// @author       You
// @match        https://rpghq.org/forums/index.php*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // Create wrapper for flex layout
  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
        display: flex;
        gap: 20px;
        margin-top: 20px;
    `;

  // Get the main content and recent topics sections
  const pageBody = document.querySelector("#page-body");
  const recentTopics = document.querySelector("#recenttopicsbottom");

  if (!pageBody || !recentTopics) return;

  // Style the main content area
  const mainContent = document.createElement("div");
  mainContent.style.cssText = `
        flex: 1;
        min-width: 0;
    `;

  // Style the recent topics section
  recentTopics.style.cssText = `
        width: 300px;
        flex-shrink: 0;
    `;

  // Move elements to their new containers
  const elements = Array.from(pageBody.children);
  elements.forEach((el) => {
    if (el !== recentTopics) {
      mainContent.appendChild(el);
    }
  });

  // Assemble the new layout
  wrapper.appendChild(mainContent);
  wrapper.appendChild(recentTopics);
  pageBody.appendChild(wrapper);

  // Adjust responsive styles
  const style = document.createElement("style");
  style.textContent = `
        @media (max-width: 700px) {
            #page-body > div {
                flex-direction: column;
            }
            #recenttopicsbottom {
                width: 100%;
            }
        }
    `;
  document.head.appendChild(style);
})();
