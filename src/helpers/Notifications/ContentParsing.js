/**
 * @module helpers/Notifications/ContentParsing
 * @description Utilities for parsing and cleaning notification/post content, including BBCode removal and media extraction.
 */

import { Logger } from "../Core/Logger.js";

const log = new Logger("Notifications ContentParsing");

/**
 * Aggressively removes nested quote blocks from text.
 * @param {string} text - The input text.
 * @returns {string} Text with inner quote blocks removed.
 */
function aggressiveRemoveInnerQuotes(text) {
  let result = "";
  let i = 0;
  let depth = 0;

  while (i < text.length) {
    // Check for an opening quote tag (simplified, assumes [quote=...]).
    if (text.startsWith("[quote=", i)) {
      depth++;
      const endBracket = text.indexOf("]", i);
      if (endBracket === -1) break; // Malformed
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

/**
 * Cleans up raw post content fetched from the quote page.
 * Removes outer quote tags and any nested quote blocks.
 * @param {string} content - The raw post content.
 * @returns {string} Cleaned post content.
 */
export function cleanupPostContent(content) {
  if (!content) return "";

  // 1. Normalize any [quote="..."] tags to [quote=...]
  let cleaned = content.replace(/\[quote="([^"]+)"\]/g, "[quote=$1]");

  // 2. Remove ONLY the first occurrence of an opening quote tag.
  const firstOpenIdx = cleaned.indexOf("[quote=");
  if (firstOpenIdx !== -1) {
    const firstCloseBracket = cleaned.indexOf("]", firstOpenIdx);
    if (firstCloseBracket !== -1) {
      cleaned =
        cleaned.slice(0, firstOpenIdx) + cleaned.slice(firstCloseBracket + 1);
    }
  }

  // 3. Remove ONLY the last occurrence of a closing quote tag.
  const lastCloseIdx = cleaned.lastIndexOf("[/quote]");
  if (lastCloseIdx !== -1) {
    cleaned = cleaned.slice(0, lastCloseIdx) + cleaned.slice(lastCloseIdx + 8);
  }

  // 4. Aggressively remove any remaining inner quote blocks.
  cleaned = aggressiveRemoveInnerQuotes(cleaned);

  return cleaned.trim();
}

/**
 * Removes common BBCode tags from text, preserving content.
 * @param {string} text - The input text.
 * @returns {string} Text with BBCode tags removed.
 */
export function removeBBCode(text) {
  if (!text) return "";
  return text
    .replace(/\[(color|size|font)=[^]]*\](.*?)\[\/\1\]/gi, "$2") // color, size, font
    .replace(/\[(b|i|u|s)\](.*?)\[\/\1\]/gi, "$2") // b, i, u, s
    .replace(/\[url=[^]]*\](.*?)\[\/url\]/gi, "$1") // url with attr
    .replace(/\[url\](.*?)\[\/url\]/gi, "$1") // simple url
    .replace(/\[img(?:\s+[^=\]]+=[^\]]+)?\](.*?)\[\/img\]/gi, "") // img tags (remove content)
    .replace(/\[(media|webm)\](.*?)\[\/\1\]/gi, "") // media, webm (remove content)
    .replace(/\[code(?:=[^]]*)?\](.*?)\[\/code\]/gis, "$1") // code (keep content)
    .replace(/\[list(?:=[^]]*)?\](.*?)\[\/list\]/gis, "$1") // list (keep content)
    .replace(/\[\*\]/gi, " ") // list items
    .replace(/\[quote(?:=[^]]*)?\](.*?)\[\/quote\]/gis, "") // quote (remove content, handles nested aggression already)
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}

/**
 * Removes URLs (http, https, ftp, www) from text.
 * @param {string} text - The input text.
 * @returns {string} Text with URLs removed.
 */
export function removeURLs(text) {
  if (!text) return "";
  return text
    .replace(/(?:https?|ftp):\/\/[^\s]+/gi, "")
    .replace(/www\.[^\s]+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts the URL from the first image tag ([img]...[/img] or [img attr=...]...[/img]) found in the text.
 * @param {string} text - The text containing potential image tags.
 * @returns {string|null} The extracted image URL or null if none found.
 */
export function extractFirstImageUrl(text) {
  if (!text) return null;

  // Match [img]url[/img]
  let match = text.match(/\[img\](.*?)\[\/img\]/i);
  if (match && match[1]) {
    return match[1].trim();
  }

  // Match [img attr=val]url[/img]
  match = text.match(/\[img\s+[^=\]]+=[^\]]+\](.*?)\[\/img\]/i);
  if (match && match[1]) {
    return match[1].trim();
  }

  return null;
}

/**
 * Checks if the entire string consists of just a single image tag.
 * @param {string} text - The input text.
 * @returns {boolean} True if the text is only a single image tag.
 */
export function isSingleImageTag(text) {
  if (!text) return false;
  const trimmed = text.trim();
  return (
    (trimmed.startsWith("[img]") && trimmed.endsWith("[/img]")) ||
    !!trimmed.match(/^\[img\s+[^=\]]+=[^\]]+\](.*?)\[\/img\]$/i)
  );
}

/**
 * Extracts the URL and type from the first video tag ([webm]...[/webm] or [media]...[/media]) found.
 * @param {string} text - The text containing potential video tags.
 * @returns {{url: string, type: 'webm'|'media'}|null} The extracted video data or null.
 */
export function extractFirstVideoUrl(text) {
  if (!text) return null;

  let match = text.match(/\[webm\](.*?)\[\/webm\]/i);
  if (match && match[1]) {
    return { url: match[1].trim(), type: "webm" };
  }

  match = text.match(/\[media\](.*?)\[\/media\]/i);
  if (match && match[1]) {
    return { url: match[1].trim(), type: "media" };
  }

  return null;
}

/**
 * Checks if the entire string consists of just a single video tag.
 * @param {string} text - The input text.
 * @returns {boolean} True if the text is only a single video tag.
 */
export function isSingleVideoTag(text) {
  if (!text) return false;
  const trimmed = text.trim();
  return (
    (trimmed.startsWith("[webm]") && trimmed.endsWith("[/webm]")) ||
    (trimmed.startsWith("[media]") && trimmed.endsWith("[/media]"))
  );
}

/**
 * Extracts the post ID from a URL string.
 * @param {string | null | undefined} url - The URL to parse.
 * @returns {string|null} The extracted post ID or null.
 */
export function extractPostIdFromUrl(url) {
  if (!url) return null;
  // Look for p=NUMBER or #pNUMBER
  const match = url.match(/[?&]p=(\d+)|#p(\d+)/);
  return match ? match[1] || match[2] : null;
}
