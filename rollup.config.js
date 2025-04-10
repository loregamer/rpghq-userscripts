/**
 * @fileoverview Rollup configuration for RPGHQ Userscript Manager
 * This configuration file handles the build process for the userscript.
 */

import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
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
    `// @name         ${pkg.name}`,
    "// @namespace    rpghq-userscripts",
    `// @version      ${pkg.version}`,
    `// @description  ${pkg.description}`,
    `// @author       ${pkg.author}`,
    "// @match        *://*.rpghq.org/*",
    "// @grant        GM_getValue",
    "// @grant        GM_setValue",
    "// @grant        GM_listValues",
    "// @grant        GM_xmlhttpRequest",
    "// @grant        GM_registerMenuCommand",
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
