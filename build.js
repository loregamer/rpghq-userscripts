const fs = require("fs");
const path = require("path");

// Use absolute paths for reliability
const projectRoot = __dirname;

// Read the order config
const orderConfig = JSON.parse(fs.readFileSync(path.join(projectRoot, "order.json"), "utf8"));

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
    .replace(/if\s*\(typeof\s*module[^\n]*\s*{[^}]*}\s*/gm, "")
    .replace(/\s*if\s*\(typeof\s*module[^{]*{[^}]*}\s*/g, "")
    .replace(/module\.exports\s*=.*$/gm, "")
    .replace(/^export\s+/gm, ""); // Remove the export keyword from function declarations
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
    .replace(/^(\s*)if /gm, `${indent}if `)
    .replace(/^(\s*)export\s+/gm, `${indent}`); // Handle indented export statements

  // Clean Node.js export statements
  processed = cleanNodeJSExports(processed);

  return processed;
}

// Check for missing files in order.json and non-existent files
function validateOrderConfig() {
  let configUpdated = false;
  const missingFiles = [];

  // Check helpers directory
  fs.readdirSync(path.join(projectRoot, "helpers"), { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .forEach(dir => {
      const dirPath = path.join(projectRoot, "helpers", dir.name);
      fs.readdirSync(dirPath, { withFileTypes: true })
        .filter(file => file.isFile() && file.name.endsWith('.js'))
        .forEach(file => {
          // Normalize path to use forward slashes consistently
          const relativePath = path.join(dir.name, file.name).replace(/\\/g, '/');
          
          // Check for the path and also check for alternative path separator
          const exists = orderConfig.helpers.some(helper => 
            helper === relativePath || helper === relativePath.replace(/\//g, '\\'));
          
          if (!exists) {
            missingFiles.push({ type: "helper", path: relativePath });
            orderConfig.helpers.push(relativePath);
            configUpdated = true;
          }
        });
    });

  // Check UI modals
  fs.readdirSync(path.join(projectRoot, "ui/modals"), { withFileTypes: true })
    .filter(file => file.isFile() && file.name.endsWith('.js'))
    .forEach(file => {
      if (!orderConfig.ui.modals.includes(file.name)) {
        missingFiles.push({ type: "ui modal", path: file.name });
        orderConfig.ui.modals.push(file.name);
        configUpdated = true;
      }
    });

  // Check initialization files
  fs.readdirSync(path.join(projectRoot, "initialization"), { withFileTypes: true })
    .filter(file => file.isFile() && file.name.endsWith('.js'))
    .forEach(file => {
      if (!orderConfig.initialization.includes(file.name)) {
        missingFiles.push({ type: "initialization", path: file.name });
        orderConfig.initialization.push(file.name);
        configUpdated = true;
      }
    });

  // Check data files
  fs.readdirSync(path.join(projectRoot, "data"), { withFileTypes: true })
    .filter(file => file.isFile() && file.name.endsWith('.js'))
    .forEach(file => {
      if (!orderConfig.data.includes(file.name)) {
        missingFiles.push({ type: "data", path: file.name });
        orderConfig.data.push(file.name);
        configUpdated = true;
      }
    });

  // Check scripts by phase
  for (const phase of ["document-start", "document-ready", "document-loaded", "document-idle", "custom-event"]) {
    const phasePath = path.join(projectRoot, "scripts", phase);
    
    if (fs.existsSync(phasePath)) {
      // Get all subdirectories (script packages)
      fs.readdirSync(phasePath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .forEach(dir => {
          const scriptPath = path.join(phasePath, dir.name);
          
          // Look for main script file (.js)
          fs.readdirSync(scriptPath, { withFileTypes: true })
            .filter(file => file.isFile() && file.name.endsWith('.js') && file.name !== "metadata.json")
            .forEach(file => {
              // Normalize path to use forward slashes consistently
              const scriptFile = path.join(dir.name, file.name).replace(/\\/g, '/');
              
              // Check for the path and also check for alternative path separator
              const exists = orderConfig.scripts[phase].some(script => 
                script === scriptFile || script === scriptFile.replace(/\//g, '\\'));
              
              if (!exists) {
                missingFiles.push({ type: `${phase} script`, path: scriptFile });
                orderConfig.scripts[phase].push(scriptFile);
                configUpdated = true;
              }
            });
        });
    }
  }

  // Check for non-existent files
  let nonExistentFiles = [];

  // Helper function to check if a file exists (normalizing path separators)
  const fileExists = (basePath, filePath) => {
    // Try with forward slashes
    if (fs.existsSync(path.join(projectRoot, basePath, filePath))) {
      return true;
    }
    
    // Try with backslashes
    const altPath = filePath.replace(/\//g, '\\');
    if (fs.existsSync(path.join(projectRoot, basePath, altPath))) {
      return true;
    }
    
    return false;
  };

  // Check helpers
  nonExistentFiles = nonExistentFiles.concat(
    orderConfig.helpers.filter(helperFile => {
      return !fileExists("helpers", helperFile);
    }).map(file => ({ type: "helper", path: file }))
  );

  // Check UI modals
  nonExistentFiles = nonExistentFiles.concat(
    orderConfig.ui.modals.filter(modalFile => {
      return !fileExists("ui/modals", modalFile);
    }).map(file => ({ type: "ui modal", path: file }))
  );

  // Check initialization
  nonExistentFiles = nonExistentFiles.concat(
    orderConfig.initialization.filter(initFile => {
      return !fileExists("initialization", initFile);
    }).map(file => ({ type: "initialization", path: file }))
  );

  // Check data
  nonExistentFiles = nonExistentFiles.concat(
    orderConfig.data.filter(dataFile => {
      return !fileExists("data", dataFile);
    }).map(file => ({ type: "data", path: file }))
  );

  // Check scripts by phase
  for (const phase in orderConfig.scripts) {
    nonExistentFiles = nonExistentFiles.concat(
      orderConfig.scripts[phase].filter(scriptFile => {
        return !fileExists(path.join("scripts", phase), scriptFile);
      }).map(file => ({ type: `${phase} script`, path: file }))
    );
  }

  // Function to normalize path separators across the config
  const normalizeConfigPaths = () => {
    // Helper to normalize a path
    const normalizePath = (p) => p.replace(/\\/g, '/');
    
    // Normalize all paths in the config
    orderConfig.helpers = orderConfig.helpers.map(normalizePath);
    orderConfig.ui.modals = orderConfig.ui.modals.map(normalizePath);
    orderConfig.initialization = orderConfig.initialization.map(normalizePath);
    orderConfig.data = orderConfig.data.map(normalizePath);
    
    for (const phase in orderConfig.scripts) {
      orderConfig.scripts[phase] = orderConfig.scripts[phase].map(normalizePath);
    }
    
    // Remove duplicate entries
    orderConfig.helpers = [...new Set(orderConfig.helpers)];
    orderConfig.ui.modals = [...new Set(orderConfig.ui.modals)];
    orderConfig.initialization = [...new Set(orderConfig.initialization)];
    orderConfig.data = [...new Set(orderConfig.data)];
    
    for (const phase in orderConfig.scripts) {
      orderConfig.scripts[phase] = [...new Set(orderConfig.scripts[phase])];
    }
    
    configUpdated = true;
  };
  
  // Normalize paths to avoid duplicates with different separators
  normalizeConfigPaths();

  // Remove non-existent files from config
  nonExistentFiles.forEach(file => {
    console.log(`Non-existent file found: ${file.type} - ${file.path}`);
    
    if (file.type === "helper") {
      orderConfig.helpers = orderConfig.helpers.filter(f => f !== file.path);
      configUpdated = true;
    } else if (file.type === "ui modal") {
      orderConfig.ui.modals = orderConfig.ui.modals.filter(f => f !== file.path);
      configUpdated = true;
    } else if (file.type === "initialization") {
      orderConfig.initialization = orderConfig.initialization.filter(f => f !== file.path);
      configUpdated = true;
    } else if (file.type === "data") {
      orderConfig.data = orderConfig.data.filter(f => f !== file.path);
      configUpdated = true;
    } else if (file.type.includes("script")) {
      const phase = file.type.replace(" script", "");
      orderConfig.scripts[phase] = orderConfig.scripts[phase].filter(f => f !== file.path);
      configUpdated = true;
    }
  });

  // Write updated config back if changes were made
  if (configUpdated) {
    fs.writeFileSync(path.join(projectRoot, "order.json"), JSON.stringify(orderConfig, null, 2));
    console.log("order.json has been updated with the following changes:");
    
    if (missingFiles.length > 0) {
      console.log("Added missing files:");
      missingFiles.forEach(file => {
        console.log(`  - Added ${file.type}: ${file.path}`);
      });
    }
    
    if (nonExistentFiles.length > 0) {
      console.log("Removed non-existent files:");
      nonExistentFiles.forEach(file => {
        console.log(`  - Removed ${file.type}: ${file.path}`);
      });
    }
    
    console.log("\nNOTE: You may need to reorder the files in order.json for proper dependency management.");
  }

  return { missingFiles, nonExistentFiles, configUpdated };
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
        const scriptFilePath = path.join(projectRoot, "scripts", phase, scriptFile);

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
    // Get the script name, ignoring the directory structure
    const scriptPath = scriptFile.split(/[\/\\]/);
    const scriptName = scriptPath[scriptPath.length - 1].replace('.js', '');
    
    // Replace hyphens with underscores for valid function names
    const functionName = scriptName.replace(/-/g, '_');
    
    // Check if script is enabled before executing
    content += `    if (isScriptEnabled("${scriptName}")) { try { ${functionName}(); } catch(e) { console.error("Error executing ${scriptName}:", e); } }\n`;
  }

  content += `  });\n\n`;

  // Add code for other execution phases
  content += `  // Execute document-start scripts\n`;
  for (const scriptFile of orderConfig.scripts["document-start"] || []) {
    // Get the script name, ignoring the directory structure
    const scriptPath = scriptFile.split(/[\/\\]/);
    const scriptName = scriptPath[scriptPath.length - 1].replace('.js', '');
    
    // Replace hyphens with underscores for valid function names
    const functionName = scriptName.replace(/-/g, '_');
    
    content += `  if (isScriptEnabled("${scriptName}")) { try { ${functionName}(); } catch(e) { console.error("Error executing ${scriptName}:", e); } }\n`;
  }
  content += `\n`;

  content += `  // Add handlers for other phases\n`;
  content += `  window.addEventListener("load", function() {\n`;
  content += `    // Execute document-loaded scripts\n`;
  for (const scriptFile of orderConfig.scripts["document-loaded"] || []) {
    // Get the script name, ignoring the directory structure
    const scriptPath = scriptFile.split(/[\/\\]/);
    const scriptName = scriptPath[scriptPath.length - 1].replace('.js', '');
    
    // Replace hyphens with underscores for valid function names
    const functionName = scriptName.replace(/-/g, '_');
    
    content += `    if (isScriptEnabled("${scriptName}")) { try { ${functionName}(); } catch(e) { console.error("Error executing ${scriptName}:", e); } }\n`;
  }
  content += `  });\n\n`;

  content += `  // Execute document-idle scripts after a short delay\n`;
  content += `  window.addEventListener("load", function() {\n`;
  content += `    setTimeout(function() {\n`;
  content += `      // Execute document-idle scripts\n`;
  for (const scriptFile of orderConfig.scripts["document-idle"] || []) {
    // Get the script name, ignoring the directory structure
    const scriptPath = scriptFile.split(/[\/\\]/);
    const scriptName = scriptPath[scriptPath.length - 1].replace('.js', '');
    
    // Replace hyphens with underscores for valid function names
    const functionName = scriptName.replace(/-/g, '_');
    
    content += `      if (isScriptEnabled("${scriptName}")) { try { ${functionName}(); } catch(e) { console.error("Error executing ${scriptName}:", e); } }\n`;
  }
  content += `    }, 500);\n`;
  content += `  });\n\n`;

  // Add code for custom event scripts
  content += `  // Setup handlers for custom event scripts\n`;
  for (const scriptFile of orderConfig.scripts["custom-event"] || []) {
    // Get the script name, ignoring the directory structure
    const scriptPath = scriptFile.split(/[\/\\]/);
    const scriptName = scriptPath[scriptPath.length - 1].replace('.js', '');
    
    // Extract event name from filename if possible (assumes format: eventName-handler.js)
    const eventNameMatch = scriptName.match(/(.*?)-handler$/);
    const eventName = eventNameMatch ? eventNameMatch[1] : scriptName;
    
    // Replace hyphens with underscores for valid function names
    const functionName = scriptName.replace(/-/g, '_');

    content += `  document.addEventListener("${eventName}", function(event) {\n`;
    content += `    if (isScriptEnabled("${scriptName}")) { try { ${functionName}(event); } catch(e) { console.error("Error executing ${scriptName}:", e); } }\n`;
    content += `  });\n`;
  }
  content += `\n`;

  // Add call to init function
  content += `  // Run initialization\n`;
  content += `  init();\n`;

  // End IIFE
  content += `})();\n`;

  // Write the combined file
  fs.writeFileSync(path.join(projectRoot, "rpghq-userscript-manager.user.js"), content);
  console.log("Build completed: rpghq-userscript-manager.user.js");
}

// Run validation and then build
const { missingFiles, nonExistentFiles, configUpdated } = validateOrderConfig();
buildUserscript();

// Provide a summary of changes
if (configUpdated) {
  console.log("\n=== Build Summary ===");
  console.log("order.json was automatically updated!");
  
  if (missingFiles.length > 0) {
    console.log("\nThe following files were added to order.json:");
    missingFiles.forEach(file => {
      console.log(`  - ${file.type}: ${file.path}`);
    });
  }
  
  if (nonExistentFiles.length > 0) {
    console.log("\nThe following non-existent files were removed from order.json:");
    nonExistentFiles.forEach(file => {
      console.log(`  - ${file.type}: ${file.path}`);
    });
  }
  
  console.log("\nIMPORTANT: You may need to manually reorder files in order.json for proper dependency loading.");
}