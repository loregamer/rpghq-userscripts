import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distFile = path.join(__dirname, '..', 'dist', 'rpghq-userscript-manager.user.js');
const cssFile = path.join(__dirname, '..', 'src', 'styles.css');

console.log('Running post-build script...');

try {
    // Read the CSS content
    let cssContent = fs.readFileSync(cssFile, 'utf8');
    // Escape backticks and ${ sequences for template literal injection
    // Escape backticks and ${ sequences for template literal injection
    cssContent = cssContent.replace(/`/g, '\\`').replace(/\${/g, '\\${'); // Refined regex for ${

    // Read the built userscript content
    let scriptContent = fs.readFileSync(distFile, 'utf8');

    // Find the placeholder GM_addStyle(''); call block
    // Adjust the regex to match the exact placeholder, including potential surrounding whitespace/minification
    // Adjust the regex to match the exact placeholder with double quotes
    const gmAddStyleRegex = /GM_addStyle\s*\(\s*""\s*\)/;

    const match = scriptContent.match(gmAddStyleRegex);

    if (match) {
        const oldBlock = match[0];
        // Construct the new GM_addStyle call with the raw CSS content
        // Construct the new GM_addStyle call using string concatenation
        const newGmAddStyleCall = 'GM_addStyle(`' + cssContent + '`);';
        // Replace the old block with just the new call
        scriptContent = scriptContent.replace(oldBlock, newGmAddStyleCall);

        // Write the modified content back to the file
        fs.writeFileSync(distFile, scriptContent, 'utf8');
        console.log('Successfully injected CSS into GM_addStyle in dist file.');

    } else {
        console.error('Error: Could not find the target GM_addStyle block in the dist file.');
        process.exit(1); // Indicate failure
    }

} catch (error) {
    console.error('Error during post-build CSS injection:', error);
    process.exit(1); // Indicate failure
}

console.log('Post-build script finished.');
