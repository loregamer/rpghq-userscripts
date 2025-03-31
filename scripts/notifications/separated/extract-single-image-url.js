const extractSingleImageUrl = (text) => {
  console.log("Extracting image URL from text:", text);

  // If the entire text is just an image tag, extract it
  const trimmedText = text.trim();
  console.log("Trimmed text:", trimmedText);

  // Handle standard [img]url[/img] format
  if (trimmedText.startsWith("[img]") && trimmedText.endsWith("[/img]")) {
    console.log("Text is a single image tag");
    const url = trimmedText.slice(5, -6).trim();
    console.log("Extracted URL:", url);
    return url;
  }

  // Handle [img size=X]url[/img] format with parameters
  const paramImgMatch = trimmedText.match(
    /^\[img\s+([^=\]]+)=([^\]]+)\](.*?)\[\/img\]$/i
  );
  if (paramImgMatch) {
    console.log("Text is a single image tag with parameters");
    const url = paramImgMatch[3].trim();
    console.log("Extracted URL:", url);
    return url;
  }

  // Find all image tags (both with and without parameters)
  const imageUrls = text.match(/\[img(?:\s+[^=\]]+=[^\]]+)?\](.*?)\[\/img\]/gi);
  console.log("Found image tags:", imageUrls);

  if (imageUrls && imageUrls.length > 0) {
    console.log("Using first image tag");
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

    console.log("Extracted URL:", url);
    return url;
  }

  console.log("No valid image URL found");
  return null;
};
