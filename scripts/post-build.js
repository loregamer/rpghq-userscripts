import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prettier from 'prettier';

// ES Module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distFile = path.resolve(__dirname, '../dist/rpghq-userscript-manager.user.js');
const prettierConfigPath = path.resolve(__dirname, '../.prettierrc'); // Adjust if your config has a different name

console.log(`Running post-build script on: ${distFile}`);

async function runPostBuild() {
  try {
    let content = fs.readFileSync(distFile, 'utf8');

    // Find the GM_addStyle call and its string argument
    const regex = /(GM_addStyle\(")(.*?)("\))/s; // s flag allows . to match newlines
    const match = content.match(regex);

    if (match && match[2]) {
      console.log('Found GM_addStyle call. Unescaping newlines...');
      let cssString = match[2];
      
      // Replace escaped newlines
      cssString = cssString.replace(/\\n/g, '\n'); 
      cssString = cssString.replace(/\n/g, '\n'); 

      // Reconstruct the content with unescaped CSS
      content = content.replace(regex, `$1${cssString}$3`);
      console.log('Successfully unescaped newlines in GM_addStyle.');

    } else {
      console.warn('Could not find GM_addStyle call in the built file. Skipping unescape.');
    }

    // Format the entire file content using Prettier
    console.log('Formatting file with Prettier...');
    const prettierOptions = await prettier.resolveConfig(prettierConfigPath);
    if (!prettierOptions) {
      console.warn('Could not resolve Prettier config, using defaults.');
    }
    
    // Add parser: 'babel' or 'espree' etc. if Prettier can't infer it
    const formattedContent = await prettier.format(content, {
      ...prettierOptions,
      filepath: distFile, // Helps Prettier infer the parser
    });

    // Write the formatted content back to the file
    fs.writeFileSync(distFile, formattedContent, 'utf8');
    console.log('Successfully formatted the output file.');

  } catch (error) {
    console.error('Error during post-build script:', error);
    process.exit(1);
  }

  console.log('Post-build script finished.');
}

runPostBuild();
