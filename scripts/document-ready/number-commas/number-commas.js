/**
 * Number Commas Script - Adds commas to numbers for easier reading
 */
export function number_commas() {
  // Get the setting for formatting 4-digit numbers
  const formatFourDigits = GM_getValue("formatFourDigits", false);

  // Run initial processing
  processElements(formatFourDigits);
  calculateForumStatistics();

  // Set up observer for dynamic content
  const observer = new MutationObserver(() => {
    processElements(formatFourDigits);
  });

  // Start observing the document
  observer.observe(document.body, { childList: true, subtree: true });
}
