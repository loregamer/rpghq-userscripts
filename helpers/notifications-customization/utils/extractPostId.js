/**
 * Extract post ID from URL
 * @param {string} url - URL containing post ID
 * @returns {string|null} The post ID or null
 */
export function extractPostId(url) {
  const match = (url || "").match(/p=(\d+)/);
  return match ? match[1] : null;
}