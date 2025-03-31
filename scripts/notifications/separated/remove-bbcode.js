const removeBBCode = (text) => {
  // Remove all BBCode tags
  let result = text
    // Remove color tags
    .replace(/\[color=[^\]]*\](.*?)\[\/color\]/gi, "$1")
    // Remove size tags
    .replace(/\[size=[^\]]*\](.*?)\[\/size\]/gi, "$1")
    // Remove bold tags
    .replace(/\[b\](.*?)\[\/b\]/gi, "$1")
    // Remove italic tags
    .replace(/\[i\](.*?)\[\/i\]/gi, "$1")
    // Remove underline tags
    .replace(/\[u\](.*?)\[\/u\]/gi, "$1")
    // Remove strike tags
    .replace(/\[s\](.*?)\[\/s\]/gi, "$1")
    // Remove url tags with attributes
    .replace(/\[url=[^\]]*\](.*?)\[\/url\]/gi, "$1")
    // Remove simple url tags
    .replace(/\[url\](.*?)\[\/url\]/gi, "$1")
    // Remove img tags with parameters
    .replace(/\[img\s+[^=\]]+=[^\]]+\](.*?)\[\/img\]/gi, "")
    // Remove simple img tags
    .replace(/\[img\](.*?)\[\/img\]/gi, "")
    // Remove media tags
    .replace(/\[media\](.*?)\[\/media\]/gi, "")
    .replace(/\[webm\](.*?)\[\/webm\]/gi, "")
    // Remove code tags
    .replace(/\[code\](.*?)\[\/code\]/gi, "$1")
    // Remove list tags
    .replace(/\[list\](.*?)\[\/list\]/gi, "$1")
    .replace(/\[\*\]/gi, "")
    // Remove quote tags (in case any remain)
    .replace(/\[quote(?:=[^\]]*?)?\](.*?)\[\/quote\]/gi, "")
    // Remove any remaining BBCode tags
    .replace(/\[[^\]]*\]/g, "")
    // Normalize whitespace
    .replace(/\s+/g, " ")
    .trim();

  return result;
};
