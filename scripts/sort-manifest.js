/**
 * Script to sort the SCRIPT_MANIFEST array by name
 * This is used during the build process to keep the manifest organized
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to the manifest file
const manifestPath = path.resolve(__dirname, "../src/manifest.js");

// Read the manifest file
let manifestContent = fs.readFileSync(manifestPath, "utf8");

// Fix the current manifest file first if it has issues
// Look for any hanging syntax issues like missing braces
// First, let's normalize line endings
manifestContent = manifestContent.replace(/\r\n/g, "\n");

// Find the position where the manifest array starts
const startPos = manifestContent.indexOf("export const SCRIPT_MANIFEST = [");
if (startPos === -1) {
  console.error("Could not find SCRIPT_MANIFEST array");
  process.exit(1);
}

// Extract the full manifest content
const extractedContent = extractBalancedContent(
  manifestContent.substring(startPos),
  "[",
);

if (!extractedContent) {
  console.error("Failed to extract balanced content from manifest");
  process.exit(1);
}

// The full array content including the declaration and brackets
const fullArrayText = extractedContent;

// Extract just the array items (without brackets and declaration)
const arrayContentMatch = fullArrayText.match(
  /export const SCRIPT_MANIFEST = \[([\s\S]*)\]/,
);
if (!arrayContentMatch || !arrayContentMatch[1]) {
  console.error("Could not extract array content");
  process.exit(1);
}

const arrayContent = arrayContentMatch[1];

// Split array items into individual objects
const objects = extractScriptObjects(arrayContent);

// Extract the name from each script object for sorting
const extractName = (scriptObject) => {
  const nameMatch = scriptObject.match(/name:\s*"([^"]*)"/);
  return nameMatch ? nameMatch[1].toLowerCase() : "";
};

// Sort the objects by name
objects.sort((a, b) => {
  const nameA = extractName(a);
  const nameB = extractName(b);
  return nameA.localeCompare(nameB);
});

// Reconstruct the array with sorted objects
const sortedArrayContent = objects.join(",\n  ");
const sortedFullArray = `export const SCRIPT_MANIFEST = [\n  ${sortedArrayContent}\n];`;

// Replace the original array in the file
const updatedContent = manifestContent.replace(fullArrayText, sortedFullArray);

// Write the updated content back to the file
fs.writeFileSync(manifestPath, updatedContent, "utf8");

console.log("✅ SCRIPT_MANIFEST successfully sorted by name");

/**
 * Extract content with balanced brackets/braces/parentheses
 * @param {string} text - Text to extract from
 * @param {string} openChar - Opening character ("[", "{", "(")
 * @returns {string|null} - Extracted content or null if unbalanced
 */
function extractBalancedContent(text, openChar) {
  const closeChar = { "[": "]", "{": "}", "(": ")" }[openChar];
  let depth = 0;
  let startPos = text.indexOf(openChar);

  if (startPos === -1) return null;

  for (let i = startPos; i < text.length; i++) {
    if (text[i] === openChar) depth++;
    else if (text[i] === closeChar) {
      depth--;
      if (depth === 0) {
        return text.substring(0, i + 1);
      }
    }
  }

  return null; // Unbalanced
}

/**
 * Extract complete script objects from text
 * @param {string} text - Text containing script objects
 * @returns {string[]} - Array of script object strings
 */
function extractScriptObjects(text) {
  const objects = [];
  let depth = 0;
  let start = -1;
  let inObject = false;

  // Clean up any stray commas
  text = text.replace(/,\s*,/g, ",");

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === "{") {
      if (depth === 0) {
        start = i;
        inObject = true;
      }
      depth++;
    } else if (char === "}") {
      depth--;
      if (depth === 0 && inObject) {
        // We've found a complete object
        const objectText = text.substring(start, i + 1);
        objects.push(objectText);
        inObject = false;
      }
    }
  }

  return objects;
}
