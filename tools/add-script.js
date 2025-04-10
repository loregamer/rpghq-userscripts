/**
 * Add script command
 * 
 * This script automates adding a new userscript to the manifest.js file and updating the imports in main.js
 * 
 * Usage: 
 *   node tools/add-script.js scriptId "Script Name" "Description" "Author Name"
 * 
 * Example:
 *   node tools/add-script.js myNewScript "My New Script" "This script does something awesome" "YourName"
 */

const fs = require('fs');
const path = require('path');

// Function to validate script ID format
function isValidScriptId(id) {
  return /^[a-zA-Z][a-zA-Z0-9]*$/.test(id);
}

// Command line arguments
const scriptId = process.argv[2];
const scriptName = process.argv[3];
const description = process.argv[4] || '';
const author = process.argv[5] || '';

// Validate inputs
if (!scriptId || !scriptName) {
  console.error('Error: Missing required parameters');
  console.log('Usage: node tools/add-script.js scriptId "Script Name" "Description" "Author Name"');
  process.exit(1);
}

if (!isValidScriptId(scriptId)) {
  console.error('Error: Script ID must start with a letter and contain only alphanumeric characters');
  process.exit(1);
}

// File paths
const manifestPath = path.join(__dirname, '../src/manifest.js');
const mainJsPath = path.join(__dirname, '../src/main.js');
const scriptsDirPath = path.join(__dirname, '../src/scripts');
const newScriptPath = path.join(scriptsDirPath, `${scriptId}.js`);
const docsPath = path.join(__dirname, '../docs/scripts');

// Check if the script already exists
if (fs.existsSync(newScriptPath)) {
  console.error(`Error: Script with ID "${scriptId}" already exists at ${newScriptPath}`);
  process.exit(1);
}

// Ensure docs directory exists
if (!fs.existsSync(docsPath)) {
  fs.mkdirSync(docsPath, { recursive: true });
}

// Create the script documentation file
const docsFilePath = path.join(docsPath, `${scriptId}.md`);
const docContent = `# ${scriptName}

## Description
${description}

## Author
${author}

## Features
- Feature 1
- Feature 2

## Settings
| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| setting1 | checkbox | false | Description of setting 1 |

## Implementation Details
Details about how the script works and any important implementation notes.
`;

fs.writeFileSync(docsFilePath, docContent);
console.log(`Created documentation file at ${docsFilePath}`);

// Create the new script file
const scriptTemplate = `// RPGHQ - ${scriptName}
/**
 * ${description}
 * Original script by ${author}, adapted for the RPGHQ Userscript Manager.
 * License: MIT
 *
 * @see G:/Modding/_Github/HQ-Userscripts/docs/scripts/${scriptId}.md for documentation
 */

export function init() {
  console.log("${scriptName} initialized!");

  // Your script implementation goes here
  
  // Return cleanup function
  return {
    cleanup: () => {
      console.log("${scriptName} cleanup");
      // Add cleanup code here
    },
  };
}
`;

fs.writeFileSync(newScriptPath, scriptTemplate);
console.log(`Created script file at ${newScriptPath}`);

// Update manifest.js
let manifestContent = fs.readFileSync(manifestPath, 'utf8');
const manifestEntry = `  {
    id: "${scriptId}",
    name: "${scriptName}",
    version: "1.0.0",
    description: "${description}",
    author: "${author}",
    image: "", // Add an image URL if available
    path: "./scripts/${scriptId}.js",
    enabledByDefault: false,
    settings: [
      // Add settings here
    ],
    categories: ["General"],
    executionPhase: "after_dom",
  },`;

// Find the array start and insert the new entry after it
const arrayStart = manifestContent.indexOf('export const SCRIPT_MANIFEST = [');
if (arrayStart !== -1) {
  const insertPos = arrayStart + 'export const SCRIPT_MANIFEST = ['.length;
  manifestContent = manifestContent.slice(0, insertPos) + '\n' + manifestEntry + manifestContent.slice(insertPos);
  fs.writeFileSync(manifestPath, manifestContent);
  console.log(`Updated manifest.js with new script entry for ${scriptId}`);
} else {
  console.error('Error: Could not locate SCRIPT_MANIFEST array in manifest.js');
  process.exit(1);
}

// Update main.js
let mainJsContent = fs.readFileSync(mainJsPath, 'utf8');

// Find the import section for script modules
const importSection = mainJsContent.indexOf('// Import scripts directly');
if (importSection !== -1) {
  // Find the end of import section
  const nextLineAfterImports = mainJsContent.indexOf('\n', importSection);
  
  // Add the new import
  const importLine = `\nimport * as ${scriptId} from "./scripts/${scriptId}.js";`;
  mainJsContent = mainJsContent.slice(0, nextLineAfterImports) + importLine + mainJsContent.slice(nextLineAfterImports);
  
  // Find the script modules mapping
  const scriptModulesSection = mainJsContent.indexOf('const scriptModules = {');
  if (scriptModulesSection !== -1) {
    // Find the end of the object
    const modulesMappingEnd = mainJsContent.indexOf('};', scriptModulesSection);
    
    // Add the new module mapping
    const moduleMapLine = `\n  ${scriptId}: ${scriptId},`;
    mainJsContent = mainJsContent.slice(0, modulesMappingEnd) + moduleMapLine + mainJsContent.slice(modulesMappingEnd);
    
    fs.writeFileSync(mainJsPath, mainJsContent);
    console.log(`Updated main.js with import and module mapping for ${scriptId}`);
  } else {
    console.error('Error: Could not locate scriptModules mapping in main.js');
    process.exit(1);
  }
} else {
  console.error('Error: Could not locate script import section in main.js');
  process.exit(1);
}

console.log(`\nSuccessfully added script "${scriptName}" (${scriptId})!`);
console.log(`\nNext steps:`);
console.log(`1. Edit ${newScriptPath} to implement your script`);
console.log(`2. Update ${docsFilePath} with complete documentation`);
console.log(`3. Add an image URL to the manifest entry if desired`);
console.log(`4. Add settings to the manifest entry if needed`);