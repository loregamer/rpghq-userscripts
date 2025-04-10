// RPGHQ - Thousands Comma Formatter
/**
 * Adds commas to large numbers in forum posts and statistics.
 * Original script by loregamer, adapted for the RPGHQ Userscript Manager.
 * License: MIT
 * 
 * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/commaFormatter.md for documentation
 */

export function init() {
  console.log("Thousands Comma Formatter initialized!");

  // Get user settings
  const formatFourDigits = GM_getValue(
    "RPGHQ_Manager_commaFormatter_formatFourDigits",
    false,
  );

  // Create regex based on settings
  const numberRegex = formatFourDigits ? /\b\d{4,}\b/g : /\b\d{5,}\b/g;

  // Core formatting function
  function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Process forum statistics (only on index page)
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

    // Sum up posts
    postsElements.forEach((element) => {
      const postsText = element.childNodes[0].textContent
        .trim()
        .replace(/,/g, "");
      const posts = parseInt(postsText);
      if (!isNaN(posts)) {
        totalPosts += posts;
      }
    });

    // Sum up topics
    topicsElements.forEach((element) => {
      const topicsText = element.childNodes[0].textContent
        .trim()
        .replace(/,/g, "");
      const topics = parseInt(topicsText);
      if (!isNaN(topics)) {
        totalTopics += topics;
      }
    });

    // Function to format numbers, only adding commas for 5+ digits (or 4+ if enabled)
    function formatStatNumber(num) {
      return formatFourDigits
        ? num.toString().length >= 4
          ? formatNumberWithCommas(num)
          : num.toString()
        : num.toString().length >= 5
          ? formatNumberWithCommas(num)
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
          /Total members <strong>(\d+)<\/strong>/,
        );
        const newestMemberMatch = existingText.match(
          /(Our newest member <strong>.*?<\/strong>)/,
        );

        if (membersMatch && newestMemberMatch) {
          statsText.innerHTML = `Total posts <strong>${formatStatNumber(
            totalPosts,
          )}</strong> • Total topics <strong>${formatStatNumber(
            totalTopics,
          )}</strong> • Total members <strong>${membersMatch[1]}</strong> • ${
            newestMemberMatch[1]
          }`;
        }
      }
    }
  }

  // Process all elements with numbers that need commas
  function processElements() {
    const elements = document.querySelectorAll(
      "dd.posts, dd.profile-posts, dd.views, span.responsive-show.left-box, .column2 .details dd",
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
              formatNumberWithCommas(match),
            );
          }
        });
      } else if (element.classList.contains("profile-posts")) {
        const anchor = element.querySelector("a");
        if (anchor && numberRegex.test(anchor.textContent)) {
          anchor.textContent = anchor.textContent.replace(
            numberRegex,
            (match) => formatNumberWithCommas(match),
          );
        }
      } else if (element.classList.contains("responsive-show")) {
        const strong = element.querySelector("strong");
        if (strong && numberRegex.test(strong.textContent)) {
          strong.textContent = strong.textContent.replace(
            numberRegex,
            (match) => formatNumberWithCommas(match),
          );
        }
      }

      const strongElements = element.querySelectorAll("strong");
      strongElements.forEach((strong) => {
        if (numberRegex.test(strong.textContent)) {
          strong.textContent = strong.textContent.replace(
            numberRegex,
            (match) => formatNumberWithCommas(match),
          );
        }
      });
    });
  }

  // Initial processing
  processElements();
  calculateForumStatistics();

  // Set up observer to handle dynamic content
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        processElements();
      }
    });
  });

  // Start observing
  observer.observe(document.body, { childList: true, subtree: true });

  // Return cleanup function
  return {
    cleanup: () => {
      console.log("Thousands Comma Formatter cleanup");
      // Disconnect observer
      observer.disconnect();
      // We can't easily "undo" the formatting without a page reload
      // since we directly modified text nodes
    },
  };
}
