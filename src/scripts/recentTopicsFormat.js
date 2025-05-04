// RPGHQ - Slightly Formatted Thread Titles
/**
 * Adds some minor formatting to thread titles, fixing malformed AG entries
 * Original script by loregamer, adapted for the RPGHQ Userscript Manager.
 * License: MIT
 *
 * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/recentTopicsFormat.md for documentation
 */

export function init({ getScriptSetting }) {
  const SCRIPT_ID = "recentTopicsFormat"; // Define script ID for settings
  const addedElements = [];

  /***************************************
   * 1) Remove ellipses/truncation in titles (Conditional)
   ***************************************/
  const shouldWrapTitles = getScriptSetting(SCRIPT_ID, "wrapTitles", true);

  if (shouldWrapTitles) {
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
    addedElements.push(style);
  }

  /**
   * Fix malformed AG titles with "> characters
   */
  function fixBrokenTitle(titleElem) {
    // Get the original text
    const originalText = titleElem.textContent;

    // Find malformed Jr. AG titles with the broken HTML entities
    const brokenTitleRegex =
      /(.*?)v0\.8;?">\s*([Jj]r\.\s*)?AG\s*-\s*([A-Za-z]+)/;

    if (brokenTitleRegex.test(originalText)) {
      const match = originalText.match(brokenTitleRegex);
      if (!match) return;

      // Extract the components
      const gameTitle = match[1].trim();
      const juniorPrefix = match[2] || "";
      const month = match[3];

      // Create a properly formatted title
      let fixedTitle = `${gameTitle} - ${juniorPrefix}AG - ${month}`;

      // Replace the broken text
      titleElem.textContent = fixedTitle;
      return true;
    }

    return false;
  }

  /**
   * Make any text in (parentheses) smaller, non-bold
   */
  function styleParentheses(str) {
    return str.replace(/\(([^()]*)\)/g, (match, innerText) => {
      // Avoid double-wrapping
      if (
        innerText.includes(
          '<span style="font-size: 0.85em; font-weight: normal;">',
        )
      ) {
        return match;
      }
      return `(<span style="font-size: 0.85em; font-weight: normal;">${innerText}</span>)`;
    });
  }

  /**
   * Special formatting for Adventurer's Guild titles
   */
  function styleAdventurersGuildTitle(str, elem) {
    // Check if it's an Adventurer's Guild title or post
    const plainText = elem.textContent;
    const isGuildTitle = plainText.includes("Adventurer's Guild");
    const isGuildForum =
      elem
        .closest(".row-item")
        ?.querySelector('.forum-links a[href*="adventurer-s-guild"]') !== null;

    if (!isGuildTitle && !isGuildForum) return str;

    let match;
    if (isGuildTitle) {
      // Match the pattern: optional Junior, Month, Games
      const titleRegex =
        /^(?:(Junior)\s+)?Adventurer's Guild\s*-\s*([A-Za-z]+):(.+?)(?:\s+[A-Z][A-Z\s]+)*$/;
      match = plainText.match(titleRegex);
    } else {
      // Match the pattern: Month, Games (when in AG forum)
      const forumRegex = /^([A-Za-z]+):(.+?)(?:\s+[A-Z][A-Z\s]+)*$/;
      match = plainText.match(forumRegex);
    }

    if (!match) return str;

    if (isGuildTitle) {
      const [_, juniorPrefix, month, gamesList] = match;
      const shortPrefix = juniorPrefix ? "Jr. AG - " : "AG - ";
      return `${gamesList.trim()} <span style="font-size: 0.8em; opacity: 0.8;">${shortPrefix}${month}</span>`;
    } else {
      const [_, month, gamesList] = match;
      return `${gamesList.trim()} <span style="font-size: 0.8em; opacity: 0.8;">(AG - ${month})</span>`;
    }
  }

  /**
   * Make text after dash unbolded (but keep same size)
   */
  function styleEverythingAfterFirstDash(str, elem) {
    const plainText = elem.textContent;
    const isGuildTitle = plainText.includes("Adventurer's Guild");
    const isGuildForum =
      elem
        .closest(".row-item")
        ?.querySelector('.forum-links a[href*="adventurer-s-guild"]') !== null;

    if (isGuildTitle || isGuildForum) return str;

    // Match both regular dash and em dash with optional spaces
    const dashMatch = plainText.match(/\s+[-—]\s+/);
    if (!dashMatch) return str;

    // Find the index of the first dash in the text content
    const dashIndexInText = dashMatch.index;

    // Reconstruct carefully
    let charCount = 0;
    let splitIndex = -1;
    for (let i = 0; i < elem.childNodes.length; i++) {
      const node = elem.childNodes[i];
      if (node.nodeType === Node.TEXT_NODE) {
        if (charCount + node.length >= dashIndexInText) {
          // Dash is in this text node
          const textBeforeDash = node.textContent.slice(
            0,
            dashIndexInText - charCount,
          );
          const textAfterDash = node.textContent.slice(
            dashIndexInText - charCount,
          );

          // Create new nodes
          const beforeNode = document.createTextNode(textBeforeDash);
          const spanNode = document.createElement("span");
          spanNode.style.fontWeight = "normal";
          spanNode.textContent = textAfterDash; // Includes the dash itself

          // Replace the original text node
          elem.replaceChild(spanNode, node);
          elem.insertBefore(beforeNode, spanNode);

          // Wrap subsequent nodes
          for (let j = i + 1; j < elem.childNodes.length; j++) {
            if (elem.childNodes[j] !== spanNode) {
              // Avoid re-wrapping the span we just added
              spanNode.appendChild(elem.childNodes[j].cloneNode(true));
            }
          }
          // Remove original subsequent nodes that were cloned
          while (elem.childNodes.length > i + 2) {
            elem.removeChild(elem.childNodes[i + 2]);
          }

          splitIndex = i; // Mark where split happened
          break; // Found and processed dash
        }
        charCount += node.length;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Could try to estimate length, but skip complex tags for now
        charCount += node.textContent.length;
      }
    }

    return elem.innerHTML; // Return potentially modified HTML
  }

  /**
   * Process a single title element based on settings
   */
  function processTitle(titleElem) {
    // First try to fix any broken titles
    const wasFixed = fixBrokenTitle(titleElem);
    if (wasFixed) return; // Skip further processing if we fixed a broken title

    const shouldUnboldParens = getScriptSetting(
      SCRIPT_ID,
      "unboldParentheses",
      true,
    );
    const shouldReformatAG = getScriptSetting(
      SCRIPT_ID,
      "reformatAGThreads",
      true,
    );

    const originalHTML = titleElem.innerHTML;
    let currentHTML = originalHTML;
    let agFormatted = false;

    // Apply AG formatting first if enabled
    if (shouldReformatAG) {
      const agResult = styleAdventurersGuildTitle(currentHTML, titleElem);
      if (agResult !== currentHTML) {
        currentHTML = agResult;
        agFormatted = true;
      }
    }

    // Apply parentheses styling if enabled
    if (shouldUnboldParens) {
      currentHTML = styleParentheses(currentHTML);
    }

    // Apply dash styling ONLY if AG formatting didn't run
    if (!agFormatted) {
      currentHTML = styleEverythingAfterFirstDash(currentHTML, titleElem);
    }

    // Update DOM only if HTML actually changed
    if (currentHTML !== originalHTML) {
      titleElem.innerHTML = currentHTML;
    }
  }

  /**
   * Process all titles in a container element
   */
  function processTitlesInContainer(container) {
    const titles = container.querySelectorAll(".topictitle");
    titles.forEach(processTitle);
  }

  // Initial processing
  processTitlesInContainer(document);

  // Set up mutation observer for dynamic updates
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        // Check if the added node is an element and contains titles or is a title itself
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.matches(".topictitle")) {
            processTitle(node);
          } else if (node.querySelector(".topictitle")) {
            // If the added node contains titles, process them
            processTitlesInContainer(node);
          }
        }
      });
    });
  });

  // Start observing the document body for added nodes
  observer.observe(document.body, { childList: true, subtree: true });

  // Return a cleanup function to disconnect the observer when the script is disabled
  return {
    cleanup: () => {
      observer.disconnect();

      // Remove added elements
      addedElements.forEach((el) => {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });

      console.log("Disconnected recentTopicsFormat observer.");
    },
  };
}
