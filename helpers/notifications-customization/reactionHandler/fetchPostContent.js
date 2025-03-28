/**
 * Fetch post content
 * @param {string} postId - The post ID to fetch content for
 * @returns {Promise<string|null>} Post content or null on error
 */
export async function fetchPostContent(postId) {
  const cachedContent = getStoredPostContent(postId);
  if (cachedContent) return cachedContent;

  try {
    const response = await fetch(
      `https://rpghq.org/forums/posting.php?mode=quote&p=${postId}`,
      {
        headers: { "X-Requested-With": "XMLHttpRequest" },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    const messageArea = tempDiv.querySelector("#message");
    if (!messageArea) throw new Error("Could not find message content");

    let content = cleanupPostContent(messageArea.value);
    storePostContent(postId, content);
    return content;
  } catch (error) {
    console.error("Error fetching post content:", error);
    return null;
  }
}