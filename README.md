# RPGHQ Userscript Manager

A modular implementation of the RPGHQ Userscript Manager that allows for better organization, maintenance, and extensibility of userscripts for the RPGHQ forums.

## Features

- **Modular Architecture**: Scripts are organized by execution phase and functionality
- **Script Management UI**: Enable, disable, and configure scripts through a user-friendly interface
- **Automatic Script Discovery**: New scripts are automatically detected and added to the build
- **Configurable Settings**: Each script can define its own settings that users can customize
- **Phase-Based Execution**: Scripts run at the appropriate time in the page load lifecycle
- **Shared Utilities**: Common functionality is available through shared helper functions
- **Simplified Development**: Focus on writing script logic without boilerplate code

## Project Structure

```
project-root/
├── helpers/                  # Helper functions
│   ├── Shared/               # Shared utility functions
│   │   ├── compareVersions.js
│   │   ├── getPhaseDisplayName.js
│   │   └── ...
│   └── {script-name}/        # Script-specific helpers
│       ├── helperFunction1.js
│       └── ...
├── ui/                       # UI components
│   └── modals/               # Modal dialog components
│       ├── showModal.js
│       ├── hideModal.js
│       └── ...
├── data/                     # Data files
│   ├── MANIFEST.js           # Script metadata
│   └── FORUM_PREFERENCES.js  # Forum preference definitions
├── scripts/                  # Scripts organized by execution phase
│   ├── document-start/       # Runs before DOM parsing begins
│   ├── document-ready/       # Runs when DOM is available but before resources load
│   ├── document-loaded/      # Runs after page is fully loaded
│   ├── document-idle/        # Runs after a short delay when page is idle
│   └── custom-event/         # Runs when specific custom events are triggered
├── initialization/           # Initialization functions
│   ├── init.js               # Main initialization
│   └── addMenuButton.js      # Adds UI menu button
├── order.json                # Defines the order of files to include
├── build.js                  # Combines files into a single userscript
└── rpghq-userscript-manager.user.js  # The generated userscript file
```

## Quick Start

### Installation

1. Install a userscript manager extension like Tampermonkey or Greasemonkey
2. Install the `rpghq-userscript-manager.user.js` file
3. Navigate to RPGHQ forums to see the userscript in action

### Development

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/HQ-Userscripts.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the userscript:
   ```bash
   npm run build
   ```

4. For continuous building during development:
   ```bash
   npm run watch
   ```

## Build Process

The build process combines all files into a single userscript file:

1. `order.json` defines the order of files to include
2. `build.js` reads the files and combines them based on the order
3. Missing files are automatically detected and added to `order.json`
4. Non-existent files are removed from `order.json`
5. The final userscript is written to `rpghq-userscript-manager.user.js`

## Documentation

- [Migration Guide](./MIGRATION_GUIDE.md) - Guide for migrating existing userscripts
- [Developer Guide](./DEVELOPER_GUIDE.md) - Detailed documentation for developers

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
