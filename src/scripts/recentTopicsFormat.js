// RPGHQ - Slightly Formatted Thread Titles
/**
 * Adds some minor formatting to thread titles, like unbolding stuff in parantheses or reformatting the AG threads
 * Original script by loregamer, adapted for the RPGHQ Userscript Manager.
 * License: MIT
 *
 * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/recentTopicsFormat.md for documentation
 */

// Note: Assumes getScriptSetting is provided to init by main.js
export function init({ getScriptSetting }) {
  const SCRIPT_ID = "recentTopicsFormat"; // Define script ID for settings

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
  }

  /*******************************************
   * 2) Functions to style different elements
   *******************************************/

  /**
   * Add hammer and pick symbol (⚒) to support threads
   * Detects if the thread row contains "Support" text and adds the symbol to the title
   * Or adds checkmark (✔) icon for solved threads
   */
  function addSupportSymbol(str, elem) {
    const shouldAddSupportSymbol = getScriptSetting(
      SCRIPT_ID,
      "addSupportSymbol",
      true,
    );

    if (!shouldAddSupportSymbol) return str; // Skip if setting is disabled

    // Check if title contains [Solved] tag
    const plainText = elem.textContent;
    const isSolved = plainText.includes("[Solved]");

    // If it's solved, we'll replace [Solved] with checkmark instead of adding hammer
    if (isSolved) {
      // Only replace if not already replaced
      if (!plainText.includes("✔") && plainText.includes("[Solved]")) {
        return str.replace(/\[Solved\]/g, "✔");
      }
      return str;
    }

    // Look for "Support" text in the thread row
    const rowItem = elem.closest("li.row");
    if (!rowItem) return str;

    // Check if thread is in a support category by looking for "Support" text
    const hasSupport = rowItem.textContent.includes("Support");
    if (!hasSupport) return str;

    // Add the symbol at the beginning if not already present
    if (!elem.textContent.startsWith("⚒")) {
      return `⚒ ${str}`;
    }

    return str;
  }

  /**
   * Make any text in (parentheses) smaller, non-bold
   * e.g. "Title (Extra Info)" -> "Title (<span>Extra Info</span>)"
   */
  function styleParentheses(str) {
    // Use HTML replace to avoid breaking existing spans
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
   * Style version numbers by adding 'v' prefix and making them smaller
   * Matches patterns like: 1.0, 1.0.0, 1.0.0.1, etc.
   */
  function styleVersionNumbers(str) {
    // Use HTML replace
    return str.replace(/\b(\d+(?:\.\d+)+)\b/g, (match, versionNumber) => {
      // Avoid double-wrapping
      if (
        str.includes(
          `<span style="font-size: 0.75em;">v${versionNumber}</span>`,
        )
      ) {
        return match;
      }
      return `<span style="font-size: 0.75em;">v${versionNumber}</span>`;
    });
  }

  /**
   * Special formatting for Adventurer's Guild titles
   * Format: "[x] Adventurer's Guild - Month: Games" or "Month: Games"
   */
  function styleAdventurersGuildTitle(str, elem) {
    // Check if it's an Adventurer's Guild title or post
    const plainText = elem.textContent; // Use textContent for matching patterns
    const isGuildTitle = plainText.includes("Adventurer's Guild");
    const isGuildForum =
      elem
        .closest(".row-item")
        ?.querySelector('.forum-links a[href*="adventurer-s-guild"]') !== null;

    if (!isGuildTitle && !isGuildForum) return str; // Return original HTML if not relevant

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

    if (!match) return str; // Return original HTML if no pattern match

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
   * e.g. "Title - Game" -> "Title<span style="font-weight: normal"> - Game</span>"
   * Handles both regular dash and em dash
   */
  function styleEverythingAfterFirstDash(str, elem) {
    // Context check needed here because AG formatting might not run if setting is off
    const plainText = elem.textContent;
    const isGuildTitle = plainText.includes("Adventurer's Guild");
    const isGuildForum =
      elem
        .closest(".row-item")
        ?.querySelector('.forum-links a[href*="adventurer-s-guild"]') !== null;

    if (isGuildTitle || isGuildForum) return str; // Don't process AG titles/posts here

    // Match both regular dash and em dash with optional spaces, ensuring it's not inside HTML tags
    // This is tricky with regex on HTML, might need a simpler approach or DOM parsing
    // Simple approach: find the first dash in text content, then reconstruct HTML
    const dashMatch = plainText.match(/\s+[-—]\s+/);
    if (!dashMatch) return str;

    // Find the index of the first dash in the text content
    const dashIndexInText = dashMatch.index;

    // Reconstruct carefully - this might break existing spans across the dash
    // A more robust solution would parse the DOM nodes within the title element
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
    const shouldAddSupportSymbol = getScriptSetting(
      SCRIPT_ID,
      "addSupportSymbol",
      true,
    );
    // Add settings checks for other styles if needed in the future

    const originalHTML = titleElem.innerHTML; // Work with HTML
    let currentHTML = originalHTML;
    let agFormatted = false;

    // Apply AG formatting first if enabled
    if (shouldReformatAG) {
      const agResult = styleAdventurersGuildTitle(currentHTML, titleElem);
      if (agResult !== currentHTML) {
        currentHTML = agResult;
        agFormatted = true; // Mark that AG formatting was applied
      }
    }

    // Apply parentheses styling if enabled
    if (shouldUnboldParens) {
      currentHTML = styleParentheses(currentHTML);
    }

    // Apply version styling (always, for now)
    currentHTML = styleVersionNumbers(currentHTML);

    // Apply dash styling ONLY if AG formatting didn't run
    if (!agFormatted) {
      currentHTML = styleEverythingAfterFirstDash(currentHTML, titleElem);
    }

    // Apply support symbol styling if enabled
    if (shouldAddSupportSymbol) {
      currentHTML = addSupportSymbol(currentHTML, titleElem);
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
    // Query only for direct children or specific containers if performance is an issue
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
      // Potentially add code here to revert styles if needed, though complex
      console.log("Disconnected recentTopicsFormat observer.");
    },
  };
}
