import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process"; // Import execSync

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distFile = path.join(
  __dirname,
  "..",
  "dist",
  "rpghq-userscript-manager.user.js",
);


console.log("Running post-build script...");

try {

  // Read the built userscript content
  let scriptContent = fs.readFileSync(distFile, "utf8");

  // Find the GM_addStyle(css`...`); call
  // Use a simple string replacement for robustness
  const oldGmAddStyleCall = "GM_addStyle(css`";



  if (scriptContent.includes(oldGmAddStyleCall)) {

    // Construct the new GM_addStyle call without the `css` tag
    const newGmAddStyleCall = "GM_addStyle(`";
    // Replace the beginning of the GM_addStyle call
    scriptContent = scriptContent.replace(oldGmAddStyleCall, newGmAddStyleCall);

    // Write the modified content back to the file
    fs.writeFileSync(distFile, scriptContent, "utf8");
    console.log("Successfully removed `css` tag from GM_addStyle in dist file.");

    // Run lint check at the very end of the script, after successful injection
    console.log("Running final lint check from post-build script...");
    try {
      execSync("npm run lint", { stdio: "inherit" });
      console.log("Final lint check passed.");
    } catch (lintError) {
      console.error("Final lint check failed:", lintError.message);
      // Optionally exit if lint fails
      process.exit(1); // Exit if lint fails to prevent potentially broken script release
    }
  } else {
    console.error(
      "Error: Could not find the target GM_addStyle(css` block in the dist file.",
    );
    process.exit(1); // Indicate failure
  }
} catch (error) {
  console.error("Error during post-build CSS modification:", error);
  process.exit(1); // Indicate failure
}

console.log("Post-build script finished.");
