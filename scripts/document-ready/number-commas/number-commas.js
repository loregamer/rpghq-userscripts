/**
 * Number Commas Script - Adds commas to numbers for easier reading
 */
function numberCommasScript() {
  // Get the setting for formatting 4-digit numbers
  const formatFourDigits = GM_getValue("formatFourDigits", false);
  
  // Set up the menu command
  updateMenuLabel(formatFourDigits);
  
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

// Export the function
if (typeof module !== 'undefined') {
  module.exports = numberCommasScript;
}
