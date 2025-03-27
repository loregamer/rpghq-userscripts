# RPGHQ Userscript Manager

A modular implementation of the RPGHQ Userscript Manager.

## Project Structure

The project has been restructured for better maintainability:

- `/helpers/` - Contains helper functions
  - `/helpers/Shared/` - Shared utility functions used across scripts
- `/ui/modals/` - UI components for the modals
- `/data/` - Data files (MANIFEST and FORUM_PREFERENCES)
- `/scripts/` - Scripts organized by execution phase
  - `/scripts/document-start/`
  - `/scripts/document-ready/`
  - `/scripts/document-loaded/`
  - `/scripts/document-idle/`
  - `/scripts/custom-event/`
- `/initialization/` - Initialization functions

## Build Process

The project uses a simple build process to combine all files into a single userscript:

1. `order.json` defines the order of files to include
2. `build.js` reads the files and combines them based on the order
3. The final userscript is written to `rpghq-userscript-manager.user.js`

## Development

To develop:

1. Install dependencies: `npm install`
2. Build the userscript: `npm run build`
3. For continuous building during development: `npm run watch`

### Adding New Features

To add a new feature:

1. Add helper functions to the appropriate folder
2. Add UI components if needed
3. Update the `order.json` file to include the new files
4. Run `npm run build` to generate the updated userscript

## File Structure

```
project-root/
├── helpers/
│   └── Shared/
│       ├── compareVersions.js
│       ├── getPhaseDisplayName.js
│       └── ...
├── ui/
│   └── modals/
│       ├── showModal.js
│       ├── hideModal.js
│       └── ...
├── data/
│   ├── MANIFEST.js
│   └── FORUM_PREFERENCES.js
├── scripts/
│   ├── document-start/
│   ├── document-ready/
│   └── ...
├── initialization/
│   ├── init.js
│   └── addMenuButton.js
├── order.json
├── build.js
├── package.json
└── rpghq-userscript-manager.user.js (generated)
```
