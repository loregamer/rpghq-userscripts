/**
 * Store post content for a post ID
 * @param {string} postId - The post ID to store content for
 * @param {string} content - The post content
 */
export function storePostContent(postId, content) {
  GM_setValue(
    `post_content_${postId}`,
    JSON.stringify({ content, timestamp: Date.now() })
  );
}