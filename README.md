# RPGHQ Userscript Manager

All-in-one manager for RPGHQ userscripts.

## Setup

```bash
npm install
```

## Build

```bash
npm run build
```

## Development Tools

### Adding a New Script

To add a new script to the userscript manager, use the add-script tool:

```bash
npm run add-script scriptId "Script Name" "Description" "Author Name"
```

This will:
- Create a new script file in src/scripts/
- Add the script to the manifest
- Update imports in main.js
- Create documentation in docs/scripts/

For more details, see [Add Script Tool Documentation](docs/tools/add-script.md).
