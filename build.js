const fs = require("fs-extra");
const path = require("path");
const concat = require("concat");

async function build() {
  console.log("Building RPGHQ Userscript Manager...");

  // Ensure directories exist
  await fs.ensureDir(path.join(__dirname, "dist"));
  await fs.ensureDir(path.join(__dirname, "src"));

  // Read manifest.json to get script configurations
  const manifestPath = path.join(__dirname, "src", "manifest.json");
  const manifestExists = await fs.pathExists(manifestPath);

  if (!manifestExists) {
    console.error("Error: manifest.json not found in src directory");
    process.exit(1);
  }

  const manifest = require(manifestPath);

  // Build main userscript manager
  await buildUserscriptManager();

  console.log("Build completed successfully!");
}

async function buildUserscriptManager() {
  const headerPath = path.join(__dirname, "src", "manager", "header.js");
  const footerPath = path.join(__dirname, "src", "manager", "footer.js");

  // Core files in specific order
  const coreFiles = [
    headerPath,
    path.join(__dirname, "src", "manager", "constants.js"),
    path.join(__dirname, "src", "manager", "storage.js"),
    path.join(__dirname, "src", "manager", "execution-framework.js"),
    path.join(__dirname, "src", "manager", "script-loader.js"),
    path.join(__dirname, "src", "manager", "ui.js"),
    path.join(__dirname, "src", "manager", "init.js"),
    footerPath,
  ];

  // Check that all required files exist
  for (const file of coreFiles) {
    if (!(await fs.pathExists(file))) {
      console.error(`Error: Required file not found: ${file}`);
      process.exit(1);
    }
  }

  // Concatenate all files
  await concat(
    coreFiles,
    path.join(__dirname, "dist", "rpghq-userscript-manager.user.js")
  );
  console.log("Userscript manager built successfully!");

  // Copy scripts to dist directory
  const scriptsDir = path.join(__dirname, "src", "scripts");
  if (await fs.pathExists(scriptsDir)) {
    await fs.copy(scriptsDir, path.join(__dirname, "dist", "scripts"));
    console.log("Scripts copied to dist directory");
  }

  // Copy manifest to dist directory
  await fs.copy(
    path.join(__dirname, "src", "manifest.json"),
    path.join(__dirname, "dist", "scripts", "manifest.json")
  );
  console.log("Manifest copied to dist directory");
}

// Run the build process
build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
