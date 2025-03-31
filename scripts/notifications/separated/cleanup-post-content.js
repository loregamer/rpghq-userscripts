const cleanupPostContent = (content) => {
  // 1. Normalize any [quote="..."] tags to [quote=...]
  content = content.replace(/\[quote="([^"]+)"\]/g, "[quote=$1]");

  // 2. Remove ONLY the first occurrence of an opening quote tag.
  const firstOpenIdx = content.indexOf("[quote=");
  if (firstOpenIdx !== -1) {
    const firstCloseBracket = content.indexOf("]", firstOpenIdx);
    if (firstCloseBracket !== -1) {
      // Remove the tag from [quote= ... ]
      content =
        content.slice(0, firstOpenIdx) + content.slice(firstCloseBracket + 1);
    }
  }

  // 3. Remove ONLY the last occurrence of a closing quote tag.
  const lastCloseIdx = content.lastIndexOf("[/quote]");
  if (lastCloseIdx !== -1) {
    // Remove that closing tag (8 characters long).
    content = content.slice(0, lastCloseIdx) + content.slice(lastCloseIdx + 8);
  }

  // 4. Aggressively remove any inner quote blocks.
  content = Utils.aggressiveRemoveInnerQuotes(content);

  return content.trim();
};
