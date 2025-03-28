/**
 * Aggressively remove inner quote blocks from text
 * @param {string} text - Text to process
 * @returns {string} Text with inner quotes removed
 */
export function aggressiveRemoveInnerQuotes(text) {
  let result = "";
  let i = 0;
  let depth = 0;

  while (i < text.length) {
    // Check for an opening quote tag.
    if (text.startsWith("[quote=", i)) {
      depth++;
      const endBracket = text.indexOf("]", i);
      if (endBracket === -1) {
        // Malformed tag; break out.
        break;
      }
      i = endBracket + 1;
      continue;
    }

    // Check for a closing quote tag.
    if (text.startsWith("[/quote]", i)) {
      if (depth > 0) {
        depth--;
      }
      i += 8; // Skip "[/quote]"
      continue;
    }

    // Only append characters that are NOT inside a quote block.
    if (depth === 0) {
      result += text[i];
    }
    i++;
  }

  return result;
}