// ==UserScript==
// @name         Nexus Mods - BBCode Link Copier
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds a BBCode link copy button next to mod titles on Nexus Mods
// @author       You
// @match        https://www.nexusmods.com/*/mods/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function addCopyButton() {
    const titleElement = document.querySelector("#pagetitle h1");
    if (!titleElement || document.querySelector(".bbcode-copy-btn")) return;

    const button = document.createElement("button");
    button.className = "bbcode-copy-btn";
    button.innerHTML = '<i class="icon fa-copy fa-fw" aria-hidden="true"></i>';
    button.style.cssText = `
            margin-left: 10px;
            padding: 5px 10px;
            background: #da8e35;
            border: none;
            border-radius: 3px;
            color: white;
            cursor: pointer;
            font-size: 14px;
            vertical-align: middle;
        `;

    button.addEventListener("click", () => {
      const title = titleElement.textContent.trim();
      const url = window.location.href;
      const bbcode = `[url=${url}]${title}[/url]`;

      navigator.clipboard.writeText(bbcode).then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = "✓ Copied!";
        button.style.background = "#4CAF50";

        setTimeout(() => {
          button.innerHTML = originalText;
          button.style.background = "#da8e35";
        }, 2000);
      });
    });

    titleElement.appendChild(button);
  }

  // Run on page load
  addCopyButton();

  // Watch for dynamic content changes
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        addCopyButton();
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
