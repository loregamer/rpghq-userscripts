/**
 * Fetch reactions for a post
 * @param {string} postId - The post ID to fetch reactions for
 * @param {boolean} isUnread - Whether the notification is unread
 * @returns {Promise<Array>} Array of reaction objects
 */
export async function fetchReactions(postId, isUnread) {
  if (!isUnread) {
    const storedReactions = getStoredReactions(postId);
    if (storedReactions) return storedReactions;
  }
  try {
    const response = await fetch(
      `https://rpghq.org/forums/reactions?mode=view&post=${postId}`,
      {
        method: "POST",
        headers: {
          accept: "application/json, text/javascript, */*; q=0.01",
          "x-requested-with": "XMLHttpRequest",
        },
        credentials: "include",
      }
    );
    const data = await response.json();
    const doc = new DOMParser().parseFromString(
      data.htmlContent,
      "text/html"
    );
    const reactions = Array.from(
      doc.querySelectorAll('.tab-content[data-id="0"] li')
    ).map((li) => ({
      username: li.querySelector(".cbb-helper-text a").textContent,
      image: li.querySelector(".reaction-image").src,
      name: li.querySelector(".reaction-image").alt,
    }));

    storeReactions(postId, reactions);
    return reactions;
  } catch (error) {
    console.error("Error fetching reactions:", error);
    return [];
  }
}