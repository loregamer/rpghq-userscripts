/**
 * Store reactions for a post ID
 * @param {string} postId - The post ID to store reactions for
 * @param {Array} reactions - Array of reaction objects
 */
export function storeReactions(postId, reactions) {
  GM_setValue(
    `reactions_${postId}`,
    JSON.stringify({ reactions, timestamp: Date.now() })
  );
}