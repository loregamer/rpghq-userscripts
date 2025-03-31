const extractVideoUrl = (text) => {
  console.log("Extracting video URL from text:", text);
  const trimmedText = text.trim();

  // Handle [webm] tags
  if (trimmedText.startsWith("[webm]") && trimmedText.endsWith("[/webm]")) {
    console.log("Text is a single webm tag");
    const url = trimmedText.slice(6, -7).trim();
    console.log("Extracted webm URL:", url);
    return { url, type: "webm" };
  }

  // Handle [media] tags
  if (trimmedText.startsWith("[media]") && trimmedText.endsWith("[/media]")) {
    console.log("Text is a single media tag");
    const url = trimmedText.slice(7, -8).trim();
    console.log("Extracted media URL:", url);
    return { url, type: "media" };
  }

  // Find all video tags
  const webmMatch = text.match(/\[webm\](.*?)\[\/webm\]/i);
  if (webmMatch) {
    console.log("Found webm tag");
    return { url: webmMatch[1].trim(), type: "webm" };
  }

  const mediaMatch = text.match(/\[media\](.*?)\[\/media\]/i);
  if (mediaMatch) {
    console.log("Found media tag");
    return { url: mediaMatch[1].trim(), type: "media" };
  }

  console.log("No valid video URL found");
  return null;
};
