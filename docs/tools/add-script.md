# Add Script Tool

The `add-script.js` tool automates the process of adding a new userscript to the RPGHQ Userscript Manager. It handles all the necessary file creation and code updates required to integrate a new script into the system.

## Features

- Creates a new script file with boilerplate code
- Adds the script to the manifest
- Updates imports and module mapping in main.js
- Creates documentation template for the script

## Usage

```bash
node tools/add-script.js scriptId "Script Name" "Description" "Author Name"
```

### Parameters

- `scriptId`: The identifier for the script. Must start with a letter and contain only alphanumeric characters. This is used for file names and internal references.
- `Script Name`: The display name of the script (in quotes).
- `Description` (optional): A brief description of what the script does (in quotes).
- `Author Name` (optional): The name of the script author (in quotes).

### Example

```bash
node tools/add-script.js postPreview "Post Preview" "Preview posts before submitting" "johnsmith"
```

## What the Tool Does

1. Validates the script ID format
2. Creates a new script file at `src/scripts/[scriptId].js` with boilerplate code
3. Creates documentation at `docs/scripts/[scriptId].md`
4. Adds an entry to the script manifest in `src/manifest.js`
5. Updates `src/main.js` to import the script and add it to the script modules mapping

## After Running the Tool

After running the tool, you'll need to:

1. Implement your script in the newly created file
2. Complete the documentation
3. Add an image URL to the manifest entry if desired
4. Add settings to the manifest entry if needed

## Notes

- The script is created with `enabledByDefault` set to `false`
- The script is initially assigned to the "General" category
- The execution phase is set to "after_dom" by default