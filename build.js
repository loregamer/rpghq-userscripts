const fs = require('fs');
const path = require('path');

// Read the order config
const orderConfig = JSON.parse(fs.readFileSync('./order.json', 'utf8'));

// Function to read a file
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
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
    header.match.forEach(match => {
      headerText += `// @match        ${match}\n`;
    });
  } else {
    headerText += `// @match        ${header.match}\n`;
  }
  
  // Add run-at
  headerText += `// @run-at       ${header['run-at']}\n`;
  
  // Add grants
  if (Array.isArray(header.grants)) {
    header.grants.forEach(grant => {
      headerText += `// @grant        ${grant}\n`;
    });
  }
  
  headerText += `// ==/UserScript==\n\n`;
  return headerText;
}

// Combine all files according to the order specified in order.json
function buildUserscript() {
  let content = createHeader();
  
  // Start IIFE
  content += `(function () {\n`;
  content += `  "use strict";\n\n`;
  
  // Add data files
  console.log('Adding data files...');
  for (const dataFile of orderConfig.data) {
    console.log(`  - ${dataFile}`);
    content += `  // Data from ${dataFile}\n`;
    content += readFile(path.join('./data', dataFile)).replace(/^const /m, '  const ').replace(/^if.*module.*\n/m, '');
    content += '\n\n';
  }
  
  // Add helper files
  console.log('Adding helper files...');
  for (const helperFile of orderConfig.helpers) {
    console.log(`  - ${helperFile}`);
    content += `  // Helper function from ${helperFile}\n`;
    content += readFile(path.join('./helpers', helperFile)).replace(/^function /m, '  function ').replace(/^\/\*\*[\s\S]*?\*\//m, '').replace(/^if.*module.*\n/m, '');
    content += '\n\n';
  }
  
  // Add UI modal functions
  console.log('Adding UI modal functions...');
  for (const modalFile of orderConfig.ui.modals) {
    console.log(`  - ${modalFile}`);
    content += `  // UI function from ${modalFile}\n`;
    content += readFile(path.join('./ui/modals', modalFile)).replace(/^function /m, '  function ').replace(/^\/\*\*[\s\S]*?\*\//m, '').replace(/^if.*module.*\n/m, '');
    content += '\n\n';
  }
  
  // Add initialization functions
  console.log('Adding initialization functions...');
  for (const initFile of orderConfig.initialization) {
    console.log(`  - ${initFile}`);
    content += `  // Initialization from ${initFile}\n`;
    content += readFile(path.join('./initialization', initFile)).replace(/^function /m, '  function ').replace(/^\/\*\*[\s\S]*?\*\//m, '').replace(/^if.*module.*\n/m, '');
    content += '\n\n';
  }
  
  // Add call to init function
  content += `  // Run initialization\n`;
  content += `  init();\n`;
  
  // End IIFE
  content += `})();\n`;
  
  // Write the combined file
  fs.writeFileSync('./rpghq-userscript-manager.user.js', content);
  console.log('Build completed: rpghq-userscript-manager.user.js');
}

buildUserscript();
