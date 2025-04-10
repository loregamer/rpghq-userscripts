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
  // Step 1: Initial Prettier format on the dist file
  console.log(`Running initial Prettier format on ${distFile}...`);
  try {
    execSync(`npx prettier --write ${distFile}`, { stdio: "inherit" });
    console.log("Initial Prettier format completed.");
  } catch (prettierError) {
    console.error("Initial Prettier formatting failed:", prettierError.message);
    process.exit(1);
  }

  // Step 2: Read the formatted content
  let scriptContent = fs.readFileSync(distFile, "utf8");

  // Step 3: Find and remove the `css` tag
  const oldGmAddStyleCall = "GM_addStyle(css`";
  const newGmAddStyleCall = "GM_addStyle(`";

  if (scriptContent.includes(oldGmAddStyleCall)) {
    // Step 4: Replace the `css` tag
    scriptContent = scriptContent.replace(oldGmAddStyleCall, newGmAddStyleCall);

    // Step 5: Write the modified content back
    fs.writeFileSync(distFile, scriptContent, "utf8");
    console.log(
      "Successfully removed `css` tag from GM_addStyle in dist file.",
    );

    // Step 6: Run final lint check (which includes Prettier check)
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
