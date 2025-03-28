/**
 * Extract video URL from text
 * @param {string} text - Text to process
 * @returns {Object|null} Video URL and type or null
 */
export function extractVideoUrl(text) {
  const trimmedText = text.trim();

  // Handle [webm] tags
  if (trimmedText.startsWith("[webm]") && trimmedText.endsWith("[/webm]")) {
    const url = trimmedText.slice(6, -7).trim();
    return { url, type: "webm" };
  }

  // Handle [media] tags
  if (
    trimmedText.startsWith("[media]") &&
    trimmedText.endsWith("[/media]")
  ) {
    const url = trimmedText.slice(7, -8).trim();
    return { url, type: "media" };
  }

  // Find all video tags
  const webmMatch = text.match(/\[webm\](.*?)\[\/webm\]/i);
  if (webmMatch) {
    return { url: webmMatch[1].trim(), type: "webm" };
  }

  const mediaMatch = text.match(/\[media\](.*?)\[\/media\]/i);
  if (mediaMatch) {
    return { url: mediaMatch[1].trim(), type: "media" };
  }

  return null;
}