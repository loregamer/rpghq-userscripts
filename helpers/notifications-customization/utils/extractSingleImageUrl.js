/**
 * Extract a single image URL from text
 * @param {string} text - Text to process
 * @returns {string|null} Image URL or null
 */
export function extractSingleImageUrl(text) {
  // If the entire text is just an image tag, extract it
  const trimmedText = text.trim();

  // Handle standard [img]url[/img] format
  if (trimmedText.startsWith("[img]") && trimmedText.endsWith("[/img]")) {
    return trimmedText.slice(5, -6).trim();
  }

  // Handle [img size=X]url[/img] format with parameters
  const paramImgMatch = trimmedText.match(
    /^\[img\s+([^=\]]+)=([^\]]+)\](.*?)\[\/img\]$/i
  );
  if (paramImgMatch) {
    return paramImgMatch[3].trim();
  }

  // Find all image tags (both with and without parameters)
  const imageUrls = text.match(
    /\[img(?:\s+[^=\]]+=[^\]]+)?\](.*?)\[\/img\]/gi
  );

  if (imageUrls && imageUrls.length > 0) {
    // Extract URL from the first image tag, handling both formats
    const firstTag = imageUrls[0];
    let url;

    if (firstTag.startsWith("[img]")) {
      // Standard format
      url = firstTag.replace(/\[img\](.*?)\[\/img\]/i, "$1").trim();
    } else {
      // Format with parameters
      url = firstTag
        .replace(/\[img\s+[^=\]]+=[^\]]+\](.*?)\[\/img\]/i, "$1")
        .trim();
    }

    return url;
  }

  return null;
}