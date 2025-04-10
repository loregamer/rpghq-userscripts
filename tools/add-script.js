/**
 * Add script command
 * 
 * This script automates adding a new userscript to the manifest.js file and updating the imports in main.js
 * It prompts for each field and sorts the manifest by script name
 * 
 * Usage: 
 *   npm run add-script
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Get current file's directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to validate script ID format
function isValidScriptId(id) {
  return /^[a-zA-Z][a-zA-Z0-9]*$/.test(id);
}

// Function to prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
  });
}

// Main async function to handle the script creation process
async function createScript() {
  console.log('\n=== RPGHQ Userscript Manager - Add New Script ===\n');
  
  // Prompt for script details
  let scriptId;
  do {
    scriptId = await prompt('Enter Script ID (alphanumeric, start with letter): ');
    if (!isValidScriptId(scriptId)) {
      console.error('Error: Script ID must start with a letter and contain only alphanumeric characters');
    }
  } while (!isValidScriptId(scriptId));
  
  const scriptName = await prompt('Enter Script Name: ');
  if (!scriptName) {
    console.error('Error: Script name is required');
    rl.close();
    process.exit(1);
  }
  
  const description = await prompt('Enter Description: ');
  const author = await prompt('Enter Author Name: ');
  const category = await prompt('Enter Category (default: "General"): ') || 'General';
  const enabledByDefault = (await prompt('Enable by default? (y/n): ')).toLowerCase() === 'y';
  
  // Close the readline interface
  rl.close();
  
  return {
    scriptId,
    scriptName,
    description,
    author,
    category,
    enabledByDefault
  };
}

async function processFiles(scriptId, scriptName, description, author, category, enabledByDefault) {
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

  // Update manifest.js by parsing and modifying the content as JavaScript
  let manifestContent = fs.readFileSync(manifestPath, 'utf8');
  
  // Find the array declaration
  const arrayStart = manifestContent.indexOf('export const SCRIPT_MANIFEST = [');
  const arrayEnd = manifestContent.lastIndexOf('];');
  
  if (arrayStart === -1 || arrayEnd === -1) {
    console.error('Error: Could not locate SCRIPT_MANIFEST array in manifest.js');
    process.exit(1);
  }
  
  // Extract the array content
  const arrayContent = manifestContent.substring(
    arrayStart + 'export const SCRIPT_MANIFEST = ['.length,
    arrayEnd
  );
  
  // Split the array into individual objects by looking for object boundaries
  // This is a simple parser that looks for complete objects with matching braces
  const objects = [];
  let currentObject = '';
  let braceCount = 0;
  
  for (let i = 0; i < arrayContent.length; i++) {
    const char = arrayContent[i];
    
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
    
    currentObject += char;
    
    // If we have a complete object (braces are balanced) and we've seen at least one opening brace
    if (braceCount === 0 && currentObject.includes('{')) {
      // Check if object ends with comma
      if (i + 1 < arrayContent.length && arrayContent[i + 1] === ',') {
        currentObject += ',';
        i++;
      }
      
      objects.push(currentObject.trim());
      currentObject = '';
    }
  }
  
  // Create the new script entry
  const newEntry = `  {
    id: "${scriptId}",
    name: "${scriptName}",
    version: "1.0.0",
    description: "${description}",
    author: "${author}",
    image: "", // Add an image URL if available
    path: "./scripts/${scriptId}.js",
    enabledByDefault: ${enabledByDefault},
    settings: [
      // Add settings here
    ],
    categories: ["${category}"],
    executionPhase: "after_dom",
  }`;
  
  // Add the new entry to the array
  objects.push(newEntry);
  
  // Sort the objects by name property
  objects.sort((a, b) => {
    const nameA = a.match(/name:\s*"([^"]+)"/)?.[1] || '';
    const nameB = b.match(/name:\s*"([^"]+)"/)?.[1] || '';
    return nameA.localeCompare(nameB);
  });
  
  // Join the objects with commas and newlines
  const sortedArrayContent = objects.join(',\n');
  
  // Rebuild the manifest content
  const newManifestContent = 
    manifestContent.substring(0, arrayStart) + 
    'export const SCRIPT_MANIFEST = [\n' + 
    sortedArrayContent + 
    '\n];' + 
    manifestContent.substring(arrayEnd + 2);
  
  fs.writeFileSync(manifestPath, newManifestContent);
  console.log(`Updated manifest.js with new script entry for ${scriptId} (sorted alphabetically)`);
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
  
  return { newScriptPath, docsFilePath };
}

// Run the script
(async () => {
  try {
    const scriptDetails = await createScript();
    await processFiles(
      scriptDetails?.scriptId,
      scriptDetails?.scriptName,
      scriptDetails?.description,
      scriptDetails?.author,
      scriptDetails?.category,
      scriptDetails?.enabledByDefault
    );
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();