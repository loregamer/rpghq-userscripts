/**
 * Get stored post content for a post ID
 * @param {string} postId - The post ID to get content for
 * @returns {string|null} Post content or null if not found/expired
 */
export function getStoredPostContent(postId) {
  const storedData = GM_getValue(`post_content_${postId}`);
  if (storedData) {
    const { content, timestamp } = JSON.parse(storedData);
    if (Date.now() - timestamp < ONE_DAY) return content;
    GM_deleteValue(`post_content_${postId}`);
  }
  return null;
}