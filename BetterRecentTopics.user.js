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
   * Format: "[x] Adventurer's Guild - Month: Games" or "Month: Games"
   */
  function styleAdventurersGuildTitle(str, elem) {
    // Check if it's an Adventurer's Guild title or post
    const isGuildTitle = str.includes("Adventurer's Guild");
    const isGuildForum =
      elem
        .closest(".row-item")
        .querySelector('.forum-links a[href*="adventurer-s-guild"]') !== null;

    if (!isGuildTitle && !isGuildForum) return str;

    let match;
    if (isGuildTitle) {
      // Match the pattern: everything before the month, the month, and games list
      const titleRegex =
        /^(.*?Adventurer's Guild\s*-\s*)([A-Za-z]+):(.+?)(?:\s+[A-Z][A-Z\s]+)*$/;
      match = str.match(titleRegex);
    } else {
      // Match the pattern: month and games list
      const forumRegex = /^([A-Za-z]+):(.+?)(?:\s+[A-Z][A-Z\s]+)*$/;
      match = str.match(forumRegex);
    }

    if (!match) return str;

    if (isGuildTitle) {
      const [_, prefix, month, gamesList] = match;
      return `${gamesList.trim()} <span style="font-size: 0.8em; opacity: 0.8;">${prefix}${month}</span>`;
    } else {
      const [_, month, gamesList] = match;
      return `${gamesList.trim()} <span style="font-size: 0.8em; opacity: 0.8;">Adventurer's Guild - ${month}</span>`;
    }
  }

  /**
   * Make text after dash unbolded (but keep same size)
   * e.g. "Title - Game" -> "Title<span style="font-weight: normal"> - Game</span>"
   * Handles both regular dash and em dash
   */
  function styleEverythingAfterFirstDash(str, elem) {
    // Don't process Adventurer's Guild titles or posts
    const isGuildTitle = str.includes("Adventurer's Guild");
    const isGuildForum =
      elem
        .closest(".row-item")
        .querySelector('.forum-links a[href*="adventurer-s-guild"]') !== null;
    if (isGuildTitle || isGuildForum) return str;

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
    newHTML = styleAdventurersGuildTitle(newHTML, titleElem);
    newHTML = styleEverythingAfterFirstDash(newHTML, titleElem);

    // Replace original text with our new HTML
    titleElem.innerHTML = newHTML;
  });
})();
