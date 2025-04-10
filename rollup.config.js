/**
 * @fileoverview Rollup configuration for RPGHQ Userscript Manager
 * This configuration file handles the build process for the userscript.
 */

import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import userscript from 'rollup-plugin-userscript';
import { string } from 'rollup-plugin-string'; // Import the string plugin
import { readFileSync } from 'fs';
import { resolve as pathResolve } from 'path';

// Read package.json
let pkg;
try {
  pkg = JSON.parse(readFileSync(pathResolve('./package.json'), 'utf-8'));
} catch (error) {
  console.error('Error reading package.json:', error);
  process.exit(1);
}

/**
 * Generates userscript metadata block
 * @returns {string} Formatted metadata block
 */
const generateMetadata = () => {
  const baseUrl = (pkg.homepage || '').replace('#readme', '');
  const distPath = '/raw/main/dist/rpghq-userscript-manager.user.js';
  
  return [
    '// ==UserScript==',
    `// @name         ${pkg.name}`,
    '// @namespace    rpghq-userscripts',
    `// @version      ${pkg.version}`,
    `// @description  ${pkg.description}`,
    `// @author       ${pkg.author}`,
    '// @match        *://*.rpghq.org/*',
    '// @grant        GM_getValue',
    '// @grant        GM_setValue',
    '// @grant        GM_registerMenuCommand',
    '// @run-at       document-end',
    `// @homepage     ${pkg.homepage || ''}`,
    `// @downloadURL  ${baseUrl}${distPath}`,
    `// @updateURL    ${baseUrl}${distPath}`,
    '// ==/UserScript==',
  ].join('\n');
};

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/rpghq-userscript-manager.user.js',
    format: 'iife',
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
    // Ensure terser doesn't minify the CSS string further if needed
    terser({
      format: {
        comments: function(node, comment) {
          if (comment.type === "comment2") {
            // Keep userscript header comments
            return /@(name|namespace|version|description|author|match|grant|run-at|homepage|downloadURL|updateURL)/.test(comment.value);
          }
          return false;
        },
        // Optionally, prevent compression of strings if it still causes issues
        // Although rollup-plugin-string should handle this.
        // compress: {
        //   strings: false 
        // }
      },
      // Important: Ensure mangling doesn't break GM_addStyle or variable names if necessary
      mangle: true, 
    }),
    
    // Generate userscript header
    userscript(generateMetadata),
  ],
};