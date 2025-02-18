// ==UserScript==
// @name         RPGHQ Recent Topics: No Ellipses + Smaller Parentheses + Post-Dash
// @namespace    rpghqEnhancer
// @version      1.0
// @description  Removes ellipsification on topic titles, makes parentheses smaller, styles version numbers, and unbolds game names
// @match        https://rpghq.org/forums/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  /***************************************
   * 1) Remove ellipses/truncation in titles
   ***************************************/
  const style = document.createElement("style");
  style.textContent = `
        /* Ensure topic titles don't get truncated with ellipses */
        .topictitle {
            white-space: normal !important;
            overflow: visible !important;
            text-overflow: unset !important;
            max-width: none !important;
            display: inline-block;
        }
    `;
  document.head.appendChild(style);

  /*******************************************
   * 2) Functions to style different elements
   *******************************************/

  /**
   * Make any text in (parentheses) smaller, non-bold
   * e.g. "Title (Extra Info)" -> "Title (<span>Extra Info</span>)"
   */
  function styleParentheses(str) {
    return str.replace(/\([^()]*\)/g, (match) => {
      return `<span style="font-size: 0.85em; font-weight: normal;">${match}</span>`;
    });
  }

  /**
   * Style version numbers by adding 'v' prefix and making them smaller
   * Matches patterns like: 1.0, 1.0.0, 1.0.0.1, etc.
   */
  function styleVersionNumbers(str) {
    return str.replace(/\b(\d+(?:\.\d+)+)\b/g, (match) => {
      return `<span style="font-size: 0.75em;">v${match}</span>`;
    });
  }

  /**
   * Special formatting for Adventurer's Guild titles
   * Format: "[x] Adventurer's Guild - Month: Games"
   */
  function styleAdventurersGuildTitle(str) {
    // Check if it's an Adventurer's Guild title
    if (!str.includes("Adventurer's Guild")) return str;

    // Match the pattern: everything before the month, the month, and games list
    const regex =
      /^(.*?Adventurer's Guild\s*-\s*)([A-Za-z]+):(.+?)(?:\s+[A-Z][A-Z\s]+)*$/;
    const match = str.match(regex);
    if (!match) return str;

    const [_, prefix, month, gamesList] = match;

    // Format each part:
    // - Make the prefix and month smaller and less prominent
    // - Put games list on new line, with any all-caps text removed
    return `<span style="font-size: 0.85em; opacity: 0.8;">${prefix}${month}</span><br>${gamesList.trim()}`;
  }

  /**
   * Make text after dash unbolded (but keep same size)
   * e.g. "Title - Game" -> "Title<span style="font-weight: normal"> - Game</span>"
   * Handles both regular dash and em dash
   */
  function styleEverythingAfterFirstDash(str) {
    // Don't process Adventurer's Guild titles with this function
    if (str.includes("Adventurer's Guild")) return str;

    // Match both regular dash and em dash with optional spaces
    const dashRegex = /\s+[-—]\s+/;
    const match = str.match(dashRegex);

    // If there is no dash, return unmodified
    if (!match) return str;

    const dashIndex = match.index;
    // Part before the dash
    const beforePart = str.slice(0, dashIndex);
    // Part from the dash to the end
    const afterPart = str.slice(dashIndex);

    // Wrap the dash + everything after it, only changing font-weight
    return `${beforePart}<span style="font-weight: normal;">${afterPart}</span>`;
  }

  /******************************************
   * 3) Transform each topic title
   ******************************************/
  const titles = document.querySelectorAll(".topictitle");
  titles.forEach((titleElem) => {
    const originalText = titleElem.textContent;

    // Apply transformations in sequence
    let newHTML = originalText;
    newHTML = styleParentheses(newHTML);
    newHTML = styleVersionNumbers(newHTML);
    newHTML = styleAdventurersGuildTitle(newHTML);
    newHTML = styleEverythingAfterFirstDash(newHTML);

    // Replace original text with our new HTML
    titleElem.innerHTML = newHTML;
  });
})();
