/**
 * Post-build script to inject styles into the userscript
 * This script reads the injectStyles.js file and appends its content to the built userscript
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to the built userscript
const userscriptPath = path.resolve(
  __dirname,
  "../dist/rpghq-userscript-manager.user.js",
);
// Path to the styles file
const stylesPath = path.resolve(__dirname, "../src/injectStyles.js");

// Read the built userscript
let userscriptContent = fs.readFileSync(userscriptPath, "utf8");
// Read the styles file (only extract the CSS content)
const stylesContent = fs.readFileSync(stylesPath, "utf8");

// Extract just the CSS content from the GM_addStyle call
const cssRegex = /GM_addStyle\(`([\s\S]*)`\);/;
const cssMatch = stylesContent.match(cssRegex);

if (!cssMatch || !cssMatch[1]) {
  console.error("Could not extract CSS from injectStyles.js");
  process.exit(1);
}

const cssContent = cssMatch[1];

// Find the position right after "use strict";
const useStrictIndex = userscriptContent.indexOf('"use strict";');
if (useStrictIndex === -1) {
  console.error('Could not find "use strict"; statement in userscript');
  process.exit(1);
}

const insertPosition = useStrictIndex + '"use strict";'.length;

// Split the content at the insertion point
const beforeInsert = userscriptContent.substring(0, insertPosition);
const afterInsert = userscriptContent.substring(insertPosition);

// Insert GM_addStyle call right after "use strict";
const updatedUserscript =
  beforeInsert +
  "\n  // Inject styles\n  GM_addStyle(`" +
  cssContent +
  "`);" +
  afterInsert;

// Write the updated userscript back to the file
fs.writeFileSync(userscriptPath, updatedUserscript, "utf8");

console.log("✅ Styles successfully injected into userscript");
