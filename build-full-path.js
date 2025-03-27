const fs = require("fs");
const path = require("path");

// Define the project root
const projectRoot = "G:/Modding/_Github/HQ-Userscripts";

// Read the order config
const orderConfig = JSON.parse(
  fs.readFileSync(path.join(projectRoot, "order.json"), "utf8")
);

// Function to read a file
function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

// Create userscript header
function createHeader() {
  const header = orderConfig.header;
  let headerText = `// ==UserScript==\n`;

  // Add standard properties
  headerText += `// @name         ${header.name}\n`;
  headerText += `// @namespace    ${header.namespace}\n`;
  headerText += `// @version      ${header.version}\n`;
  headerText += `// @description  ${header.description}\n`;
  headerText += `// @author       ${header.author}\n`;

  // Add match pattern(s)
  if (Array.isArray(header.match)) {
    header.match.forEach((match) => {
      headerText += `// @match        ${match}\n`;
    });
  } else {
    headerText += `// @match        ${header.match}\n`;
  }

  // Add run-at
  headerText += `// @run-at       ${header["run-at"]}\n`;

  // Add grants
  if (Array.isArray(header.grants)) {
    header.grants.forEach((grant) => {
      headerText += `// @grant        ${grant}\n`;
    });
  }

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

// Process a file for inclusion in the final script
function processFile(filePath, indent = "  ") {
  const fileContent = readFile(filePath);
  // Remove JSDoc blocks
  let processed = fileContent.replace(/\/\*\*[\s\S]*?\*\//gm, "");

  // Apply indentation to function declarations and improve formatting
  processed = processed
    .replace(/^function /m, `${indent}function `)
    .replace(/^(\s*)const /gm, `${indent}const `)
    .replace(/^(\s*)let /gm, `${indent}let `)
    .replace(/^(\s*)var /gm, `${indent}var `)
    .replace(/^(\s*)if /gm, `${indent}if `);

  // Clean Node.js export statements
  processed = cleanNodeJSExports(processed);

  return processed;
}

// Combine all files according to the order specified in order.json
function buildUserscript() {
  let content = createHeader();

  // Start IIFE
  content += `(function () {\n`;
  content += `  "use strict";\n\n`;

  // Add data files
  console.log("Adding data files...");
  for (const dataFile of orderConfig.data) {
    console.log(`  - ${dataFile}`);
    content += `  // Data from ${dataFile}\n`;
    const fileContent = readFile(path.join(projectRoot, "data", dataFile));
    content += fileContent
      .replace(/^const /m, "  const ")
      .replace(/\/\*\*[\s\S]*?\*\//m, "");
    content = cleanNodeJSExports(content);
    content += "\n\n";
  }

  // Add helper files
  console.log("Adding helper files...");
  for (const helperFile of orderConfig.helpers) {
    console.log(`  - ${helperFile}`);
    content += `  // Helper function from ${helperFile}\n`;
    content += processFile(path.join(projectRoot, "helpers", helperFile));
    content += "\n\n";
  }

  // Add UI modal functions
  console.log("Adding UI modal functions...");
  for (const modalFile of orderConfig.ui.modals) {
    console.log(`  - ${modalFile}`);
    content += `  // UI function from ${modalFile}\n`;
    content += processFile(path.join(projectRoot, "ui/modals", modalFile));
    content += "\n\n";
  }

  // Add scripts by execution phase
  console.log("Adding scripts...");
  // Loop through each phase
  for (const phase in orderConfig.scripts) {
    if (orderConfig.scripts[phase].length > 0) {
      console.log(`  Adding ${phase} scripts...`);

      // Loop through each script in the phase
      for (const scriptFile of orderConfig.scripts[phase]) {
        console.log(`    - ${scriptFile}`);

        // Process the script file
        content += `  // Script function from ${phase}/${scriptFile}\n`;
        const scriptFilePath = path.join(
          projectRoot,
          "scripts",
          phase,
          scriptFile
        );

        // Check if the file exists
        if (fs.existsSync(scriptFilePath)) {
          content += processFile(scriptFilePath);
        } else {
          console.log(
            `      WARNING: Script file not found: ${scriptFilePath}`
          );
        }

        content += "\n\n";
      }
    }
  }

  // Add initialization functions
  console.log("Adding initialization functions...");
  for (const initFile of orderConfig.initialization) {
    console.log(`  - ${initFile}`);
    content += `  // Initialization from ${initFile}\n`;
    content += processFile(path.join(projectRoot, "initialization", initFile));
    content += "\n\n";
  }

  // Add script execution code
  content += `  // Execute scripts by phase\n`;
  content += `  document.addEventListener("DOMContentLoaded", function() {\n`;
  content += `    // Execute document-ready scripts\n`;

  // Add document-ready script execution
  for (const scriptFile of orderConfig.scripts["document-ready"]) {
    const scriptName = path.basename(scriptFile, ".js");
    // Check if script is enabled before executing
    content += `    if (isScriptEnabled("${scriptName}")) { try { ${scriptName}(); } catch(e) { console.error("Error executing ${scriptName}:", e); } }\n`;
  }

  content += `  });\n\n`;

  // Add code for other execution phases
  content += `  // Execute document-start scripts\n`;
  for (const scriptFile of orderConfig.scripts["document-start"] || []) {
    const scriptName = path.basename(scriptFile, ".js");
    content += `  if (isScriptEnabled("${scriptName}")) { try { ${scriptName}(); } catch(e) { console.error("Error executing ${scriptName}:", e); } }\n`;
  }
  content += `\n`;

  content += `  // Add handlers for other phases\n`;
  content += `  window.addEventListener("load", function() {\n`;
  content += `    // Execute document-loaded scripts\n`;
  for (const scriptFile of orderConfig.scripts["document-loaded"] || []) {
    const scriptName = path.basename(scriptFile, ".js");
    content += `    if (isScriptEnabled("${scriptName}")) { try { ${scriptName}(); } catch(e) { console.error("Error executing ${scriptName}:", e); } }\n`;
  }
  content += `  });\n\n`;

  content += `  // Execute document-idle scripts after a short delay\n`;
  content += `  window.addEventListener("load", function() {\n`;
  content += `    setTimeout(function() {\n`;
  content += `      // Execute document-idle scripts\n`;
  for (const scriptFile of orderConfig.scripts["document-idle"] || []) {
    const scriptName = path.basename(scriptFile, ".js");
    content += `      if (isScriptEnabled("${scriptName}")) { try { ${scriptName}(); } catch(e) { console.error("Error executing ${scriptName}:", e); } }\n`;
  }
  content += `    }, 500);\n`;
  content += `  });\n\n`;

  // Add code for custom event scripts
  content += `  // Setup handlers for custom event scripts\n`;
  for (const scriptFile of orderConfig.scripts["custom-event"] || []) {
    const scriptName = path.basename(scriptFile, ".js");
    // Extract event name from filename if possible (assumes format: eventName-handler.js)
    const eventNameMatch = scriptName.match(/(.*?)-handler$/);
    const eventName = eventNameMatch ? eventNameMatch[1] : scriptName;

    content += `  document.addEventListener("${eventName}", function(event) {\n`;
    content += `    if (isScriptEnabled("${scriptName}")) { try { ${scriptName}(event); } catch(e) { console.error("Error executing ${scriptName}:", e); } }\n`;
    content += `  });\n`;
  }
  content += `\n`;

  // Add call to init function
  content += `  // Run initialization\n`;
  content += `  init();\n`;

  // End IIFE
  content += `})();\n`;

  // Write the combined file
  fs.writeFileSync(
    path.join(projectRoot, "rpghq-userscript-manager.user.js"),
    content
  );
  console.log("Build completed: rpghq-userscript-manager.user.js");
}

buildUserscript();
