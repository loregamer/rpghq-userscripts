/**
 * Get stored reactions for a post ID
 * @param {string} postId - The post ID to get reactions for
 * @returns {Array|null} Array of reactions or null if not found/expired
 */
export function getStoredReactions(postId) {
  const storedData = GM_getValue(`reactions_${postId}`);
  if (storedData) {
    const { reactions, timestamp } = JSON.parse(storedData);
    if (Date.now() - timestamp < ONE_DAY) return reactions;
    GM_deleteValue(`reactions_${postId}`);
  }
  return null;
}