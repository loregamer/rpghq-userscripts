/**
 * @fileoverview Rollup configuration for RPGHQ Userscript Manager
 * This configuration file handles the build process for the userscript.
 */

import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json"; // Import the JSON plugin
import terser from "@rollup/plugin-terser";
import userscript from "rollup-plugin-userscript";
import { string } from "rollup-plugin-string"; // Import the string plugin
import { readFileSync } from "fs";
import { resolve as pathResolve } from "path";

// Read package.json
let pkg;
try {
  pkg = JSON.parse(readFileSync(pathResolve("./package.json"), "utf-8"));
} catch (error) {
  console.error("Error reading package.json:", error);
  process.exit(1);
}

/**
 * Generates userscript metadata block
 * @returns {string} Formatted metadata block
 */
const generateMetadata = () => {
  const baseUrl = (pkg.homepage || "").replace("#readme", "");
  const distPath = "/raw/main/dist/rpghq-userscript-manager.user.js";

  return [
    "// ==UserScript==",
    `// @name         RPGHQ Userscript Manager`,
    "// @namespace    rpghq-userscripts",
    `// @version      VERSIONHERE`,
    `// @description  ${pkg.description}`,
    `// @author       ${pkg.author}`,
    "// @match        https://rpghq.org/*",
    "// @match        https://vault.rpghq.org/*",
    "// @match        *://*.rpghq.org/*",
    "// @grant        GM_getValue",
    "// @grant        GM_setValue",
    "// @grant        GM_listValues",
    "// @grant        GM_xmlhttpRequest",
    "// @grant        GM_registerMenuCommand",
    "// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC",
    "// @grant        GM_addStyle",
    "// @run-at       document-start",
    `// @homepage     ${pkg.homepage || ""}`,
    `// @downloadURL  ${baseUrl}${distPath}`,
    `// @updateURL    ${baseUrl}${distPath}`,
    "// ==/UserScript==",
  ].join("\n");
};

export default {
  input: "src/main.js",
  output: {
    file: "dist/rpghq-userscript-manager.user.js",
    format: "iife",
  },
  plugins: [
    // Import CSS files as strings
    string({
      include: "**/*.css",
    }),
    // Import JSON files
    json(),
    // Resolve node modules
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),

    // Convert CommonJS modules to ES6
    commonjs(),

    // Minification with preserved userscript header
    terser({
      format: {
        comments: true, // Keep comments in the output
        beautify: true, // Format the output for better readability
      },
      mangle: false,
      compress: {}, // Re-enable compression, as CSS is handled separately
    }),

    // Generate userscript header
    userscript(generateMetadata),
  ],
};
