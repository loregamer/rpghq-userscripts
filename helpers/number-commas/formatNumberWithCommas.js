/**
 * Format a number with commas (e.g., 1000 -> 1,000)
 * @param {number|string} number - The number to format
 * @returns {string} - The formatted number with commas
 */
export function formatNumberWithCommas(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
