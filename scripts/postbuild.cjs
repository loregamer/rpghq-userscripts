const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process"); // Import execSync

const distPath = path.resolve(
  __dirname,
  "../dist/rpghq-userscript-manager.user.js",
);
const stylesPath = path.resolve(__dirname, "../src/injectStyles.js");

console.log("Running postbuild script...");

try {
  // Read the styles content
  const stylesContent = fs.readFileSync(stylesPath, "utf8");
  console.log(`Read ${stylesContent.length} bytes from ${stylesPath}`);

  // Read the built userscript content
  const distContent = fs.readFileSync(distPath, "utf8");
  console.log(`Read ${distContent.length} bytes from ${distPath}`);

  // Find the start of the main IIFE and its opening brace
  const iifeStartMarker = "!function(){"; // Adjust if Rollup output changes slightly
  const iifeStartIndex = distContent.indexOf(iifeStartMarker);

  if (iifeStartIndex === -1) {
    throw new Error("Could not find IIFE start marker in dist file.");
  }

  const insertionPoint = iifeStartIndex + iifeStartMarker.length;

  // Inject the styles content right after the IIFE's opening brace
  const newDistContent =
    distContent.slice(0, insertionPoint) +
    "\n\n" + // Add some spacing
    stylesContent +
    "\n\n" + // Add some spacing
    distContent.slice(insertionPoint);

  // Write the modified content back to the dist file
  fs.writeFileSync(distPath, newDistContent, "utf8");
  console.log(`Successfully injected styles into ${distPath}`);

  // Run Prettier on the modified dist file
  try {
    console.log(`Running Prettier on ${distPath}...`);
    execSync(`npx prettier --write ${distPath}`, { stdio: "inherit" });
    console.log(`Successfully formatted ${distPath} with Prettier.`);
  } catch (prettierError) {
    console.error(`Error running Prettier on ${distPath}:`, prettierError);
    // Don't necessarily exit, as the main task (injection) succeeded
  }
} catch (error) {
  console.error("Error during postbuild script execution:", error);
  process.exit(1); // Exit with error code
}
