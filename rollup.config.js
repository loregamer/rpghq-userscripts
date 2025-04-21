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
import inquirer from "inquirer"; // <-- Add inquirer import
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
 * @param {string} version - The version string to use
 * @returns {string} Formatted metadata block
 */
const generateMetadata = (version) => {
  // <-- Add version parameter
  const baseUrl = (pkg.homepage || "").replace("#readme", "");
  const distPath = "/raw/main/dist/rpghq-userscript-manager.user.js";

  return [
    "// ==UserScript==",
    `// @name         RPGHQ Userscript Manager`,
    "// @namespace    rpghq-userscripts",
    `// @version      ${version}`, // <-- Use the version parameter
    `// @description  ${pkg.description}`,
    `// @author       ${pkg.author}`,
    "// @match        https://rpghq.org/*",
    "// @match        https://vault.rpghq.org/*",
    "// @match        *://*.rpghq.org/*",
    "// @grant        GM_getValue",
    "// @grant        GM_setValue",
    "// @grant        GM_deleteValue",
    "// @grant        GM_listValues",
    "// @grant        GM_xmlhttpRequest",
    "// @grant        GM_registerMenuCommand",
    "// @icon         data:image/png;base64,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",
    "// @grant        GM_addStyle",
    "// @connect      rpghq.org",
    "// @run-at       document-start",
    `// @homepage     ${pkg.homepage || ""}`,
    `// @downloadURL  ${baseUrl}${distPath}`,
    `// @updateURL    ${baseUrl}${distPath}`,
    "// ==/UserScript==",
  ].join("\n");
};

// Wrap export in an async function to use await for inquirer
export default async () => {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "version",
      message: "Enter the userscript version:",
      default: pkg.version, // Suggest current package.json version
      validate: (input) => {
        // Basic semver validation (adjust regex as needed)
        if (/^\d+\.\d+\.\d+$/.test(input)) {
          return true;
        }
        return "Please enter a valid version number (e.g., 1.2.3)";
      },
    },
  ]);

  const scriptVersion = answers.version;

  return {
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
      userscript(() => generateMetadata(scriptVersion)), // <-- Pass version here
    ],
  };
};
