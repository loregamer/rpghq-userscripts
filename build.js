const fs = require("fs");
const path = require("path");

// Function to read a file
function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

// Function to get all JavaScript files in a directory and its subdirectories
function getJsFilesInDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.warn(`Directory not found: ${dirPath}`);
    return [];
  }

  const results = [];

  // Get all items in the directory
  const items = fs.readdirSync(dirPath);

  // Process each item
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      // If it's a directory, recursively get files from it
      const subFiles = getJsFilesInDir(itemPath);
      // Add the subdirectory path to each file
      for (const subFile of subFiles) {
        results.push(path.join(item, subFile));
      }
    } else if (stat.isFile() && item.endsWith(".js")) {
      // If it's a JavaScript file, add it to results
      results.push(item);
    }
  }

  return results;
}

// Create userscript header with hardcoded values from the old order.json
function createHeader() {
  let headerText = `// ==UserScript==\n`;

  // Add standard properties
  headerText += `// @name         RPGHQ Userscript Manager (Popup Only)\n`;
  headerText += `// @namespace    https://rpghq.org/\n`;
  headerText += `// @version      3.0.2\n`;
  headerText += `// @description  A simple popup that displays the MANIFEST of available scripts without any functional components\n`;
  headerText += `// @author       loregamer\n`;
  headerText += `// @match        https://rpghq.org/forums/*\n`;
  headerText += `// @run-at       document-start\n`;

  // Add grants
  headerText += `// @grant        GM_addStyle\n`;
  headerText += `// @grant        GM_registerMenuCommand\n`;

  headerText += `// ==/UserScript==\n\n`;
  return headerText;
}

// Function to clean the module.exports and Node.js related code
function cleanNodeJSExports(content) {
  return content
    .replace(/\/\/\s*Export.*$/gm, "")
    .replace(/\/\/\s*Export the .*$/gm, "")
    .replace(/if\s*\(typeof\s*module.*\n.*\n.*\}/gm, "")
    .replace(/if\s*\(typeof\s*module.*\n.*\}/gm, "")
    .replace(/module\.exports\s*=.*$/gm, "");
}

// Process content based on file path and type
function processFileContent(filePath, content) {
  // Clean Node.js exports
  let processedContent = cleanNodeJSExports(content);

  // Remove JSDoc comments
  processedContent = processedContent.replace(/\/\*\*[\s\S]*?\*\//gm, "");

  // Check if the file starts with a function or const declaration and add proper indentation
  if (processedContent.trim().startsWith("function ")) {
    processedContent = processedContent.replace(/^function /m, "  function ");
  } else if (processedContent.trim().startsWith("const ")) {
    processedContent = processedContent.replace(/^const /m, "  const ");
  }

  // If the file doesn't have any indentation, add it to all lines
  if (!processedContent.startsWith("  ")) {
    processedContent = processedContent
      .split("\n")
      .map((line) => (line.trim() ? `  ${line}` : line))
      .join("\n");
  }

  return processedContent;
}

// New build function that scans directories and includes all files
function buildUserscript() {
  let content = createHeader();

  // Start IIFE
  content += `(function () {\n`;
  content += `  "use strict";\n\n`;

  // Define directories to scan
  const directories = [
    { path: "./data", comment: "Data from" },
    { path: "./helpers", comment: "Helper function from" },
    { path: "./ui", comment: "UI function from" },
    { path: "./initialization", comment: "Initialization from" },
  ];

  // Process each directory
  directories.forEach((dir) => {
    console.log(`Adding files from ${dir.path}...`);

    // Get all JS files in the directory and its subdirectories
    const files = getJsFilesInDir(dir.path);

    // Process each file
    files.forEach((file) => {
      const filePath = path.join(dir.path, file);
      console.log(`  - ${file}`);

      try {
        // Read the file content
        const fileContent = readFile(filePath);

        // Add a comment indicating the source file
        content += `  // ${dir.comment} ${file}\n`;

        // Process and add the content
        content += processFileContent(filePath, fileContent);

        // Add separation between files
        content += "\n\n";
      } catch (error) {
        console.error(`Error processing file ${filePath}: ${error.message}`);
      }
    });
  });

  // Add call to init function
  content += `  // Run initialization\n`;
  content += `  init();\n`;

  // End IIFE
  content += `})();\n`;

  // Write the combined file
  fs.writeFileSync("./rpghq-userscript-manager.user.js", content);
  console.log("Build completed: rpghq-userscript-manager.user.js");
}

buildUserscript();
