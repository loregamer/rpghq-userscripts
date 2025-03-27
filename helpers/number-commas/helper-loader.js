/**
 * Helper function to load all number-commas helpers and make them available to the script
 */
function loadNumberCommasHelpers() {
  // These functions are already available in the final script through the build process
  // This is just for reference/documentation of what's needed
  return {
    formatNumberWithCommas,
    processElements,
    calculateForumStatistics,
    toggleFourDigitFormatting,
    updateMenuLabel,
  };
}

// Export the function
module.exports = loadNumberCommasHelpers;
