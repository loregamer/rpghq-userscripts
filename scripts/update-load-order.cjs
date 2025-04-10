// scripts/update-load-order.cjs
const fs = require("fs");
const path = require("path");

const manifestPath = path.resolve(__dirname, "../src/manifest.js");
const loadOrderPath = path.resolve(__dirname, "../load_order.json");

// Convert manifest path to a file URL for dynamic import
const manifestFileURL = "file:///" + manifestPath.replace(/\\/g, "/");

console.log("Updating load_order.json...");

async function updateLoadOrder() {
  try {
    // --- Read Manifest using dynamic import() ---
    console.log(`Dynamically importing manifest from: ${manifestFileURL}`);
    const manifestModule = await import(manifestFileURL);
    const SCRIPT_MANIFEST = manifestModule.SCRIPT_MANIFEST;

    if (!SCRIPT_MANIFEST || !Array.isArray(SCRIPT_MANIFEST)) {
      throw new Error(
        "Could not extract SCRIPT_MANIFEST array from manifest.js using dynamic import",
      );
    }
    console.log(`Read ${SCRIPT_MANIFEST.length} scripts from manifest.`);

    // --- Read Load Order ---
    let loadOrder = {};
    if (fs.existsSync(loadOrderPath)) {
      loadOrder = JSON.parse(fs.readFileSync(loadOrderPath, "utf8"));
      console.log("Read existing load_order.json.");
    } else {
      console.log("load_order.json not found, creating new one.");
      loadOrder = {
        "document-start": [],
        "document-end": [],
        "document-idle": [],
        after_dom: [],
      };
    }

    // --- Process Scripts and Update Load Order ---
    let updated = false;
    const manifestScriptIds = new Set(SCRIPT_MANIFEST.map((s) => s.id));
    const allLoadOrderItems = new Set();
    for (const phase in loadOrder) {
      loadOrder[phase].forEach((item) => allLoadOrderItems.add(item));
    }

    SCRIPT_MANIFEST.forEach((script) => {
      // If script ID from manifest is not found anywhere in load_order.json,
      // add it to the default 'document-end' phase.
      if (!allLoadOrderItems.has(script.id)) {
        const defaultPhase = "document-end"; // Default phase for new scripts
        if (!loadOrder[defaultPhase]) {
          console.warn(
            `Default phase "${defaultPhase}" not found in load_order.json. Initializing.`,
          );
          loadOrder[defaultPhase] = [];
        }
        loadOrder[defaultPhase].push(script.id);
        console.log(
          `Added missing script "${script.id}" to default phase "${defaultPhase}" in load_order.json. You may need to adjust its position manually.`,
        );
        updated = true;
        allLoadOrderItems.add(script.id); // Add to our set to track it
      }
    });

    // --- (Optional but recommended) Remove script IDs from load order if no longer in manifest ---
    for (const phase in loadOrder) {
      const originalLength = loadOrder[phase].length;
      loadOrder[phase] = loadOrder[phase].filter((item) => {
        // Keep if it's a script in the current manifest OR if it doesn't exist in the manifest set (assume shared func)
        const isManifestScript = manifestScriptIds.has(item);
        const likelySharedFunc = !isManifestScript; // Basic assumption
        if (isManifestScript || likelySharedFunc) {
          return true;
        } else {
          console.log(
            `Removing script "${item}" from phase "${phase}" in load_order.json (not found in manifest).`,
          );
          updated = true;
          return false;
        }
      });
      if (loadOrder[phase].length < originalLength) {
        updated = true; // Mark as updated if items were removed
      }
    }

    // --- Write Updated Load Order ---
    if (updated) {
      fs.writeFileSync(
        loadOrderPath,
        JSON.stringify(loadOrder, null, 2) + "\n",
        "utf8",
      ); // Add newline at end
      console.log("Successfully updated load_order.json.");
    } else {
      console.log("load_order.json is already up-to-date.");
    }
  } catch (error) {
    console.error("Error updating load_order.json:", error);
    process.exit(1); // Exit with error code
  }
}

// Execute the async function
updateLoadOrder();
