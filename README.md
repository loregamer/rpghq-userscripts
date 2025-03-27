# RPGHQ Userscripts

A collection of userscripts for the RPGHQ forums, using a modular architecture with a build process.

## Project Structure

- `src/` - Source code for userscripts
  - `manager/` - Modular components for the userscript manager
  - `scripts/` - Individual userscripts
  - `manifest.json` - Configuration for all scripts
- `dist/` - Generated output (after build)
- `build.js` - Build script to combine modules

## Development

1. Edit or create scripts in the `src/scripts/` directory
2. Update `src/manifest.json` to register new scripts
3. Run the build process to generate a single script

## Scripts

Scripts are written in a modular format and executed through the userscript manager. Each script is wrapped in a function that receives:

- `scriptId`: The unique identifier for the script
- `scriptData`: Metadata about the script from the manifest
- `scriptSettings`: User-configured settings for the script

### Example Script

```javascript
// MyScript
// Version: 1.0.0

(function (scriptId, scriptData, scriptSettings) {
  "use strict";

  // Your script code here
  console.log(`Running ${scriptData.name} v${scriptData.version}`);

  // Using settings
  const mySetting = scriptSettings.mySetting || "default";

  // Script implementation
  function doSomething() {
    // ...
  }

  // Execution
  doSomething();
});
```

## Build Process

To build the project:

```
npm run build
```

This will:

1. Combine all manager modules into a single userscript
2. Copy scripts to the dist directory
3. Copy the manifest to the dist directory

Install the generated `dist/rpghq-userscript-manager.user.js` in your userscript manager (Tampermonkey, Greasemonkey, etc.).
