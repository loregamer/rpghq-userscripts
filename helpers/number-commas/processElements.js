/**
 * Process DOM elements and format numbers with commas
 * @param {boolean} formatFourDigits - Whether to format 4-digit numbers
 */
export function processElements(formatFourDigits) {
  const numberRegex = formatFourDigits ? /\b\d{4,}\b/g : /\b\d{5,}\b/g;

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
        anchor.textContent = anchor.textContent.replace(numberRegex, (match) =>
          formatNumberWithCommas(match)
        );
      }
    } else if (element.classList.contains("responsive-show")) {
      const strong = element.querySelector("strong");
      if (strong && numberRegex.test(strong.textContent)) {
        strong.textContent = strong.textContent.replace(numberRegex, (match) =>
          formatNumberWithCommas(match)
        );
      }
    }

    const strongElements = element.querySelectorAll("strong");
    strongElements.forEach((strong) => {
      if (numberRegex.test(strong.textContent)) {
        strong.textContent = strong.textContent.replace(numberRegex, (match) =>
          formatNumberWithCommas(match)
        );
      }
    });
  });
}
