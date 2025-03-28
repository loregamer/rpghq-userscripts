/**
 * Get post IDs displayed on the current page
 * @returns {Array} Array of post IDs
 */
export function getDisplayedPostIds() {
  return Array.from(document.querySelectorAll('div[id^="p"]')).map((el) =>
    el.id.substring(1)
  );
}