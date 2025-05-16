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
npm run add-script
```

You'll be prompted to enter all needed information interactively. This will:

- Create a new script file in src/scripts/
- Add the script to the manifest (sorted alphabetically by name)
- Update imports in main.js
- Create documentation in docs/scripts/

For more details, see [Add Script Tool Documentation](docs/tools/add-script.md).

## User Preferences & Settings

The RPGHQ Userscript Manager handles two types of settings:

1. **Script Settings**: Specific to individual userscripts, defined in the script's manifest
2. **Forum Preferences**: Global preferences that affect the forum appearance and behavior

### Script Settings Types

The userscript manager supports these setting types for individual scripts:

- **checkbox** (or **toggle**): Boolean toggle
- **number**: Numeric input with optional min/max/step
- **text**: Text input field
- **color**: Color picker with preview
- **select**: Dropdown with options
- **textarea**: Multi-line text input
- **radio**: Radio button selection

### Setting Structure in Script Manifest

Settings are defined in the script's manifest entry:

```javascript
settings: [
  {
    id: "settingId", // Unique identifier within the script
    label: "Setting Display Name", // Displayed to the user
    type: "checkbox", // Setting type (checkbox, color, etc.)
    defaultValue: true, // Default value
    description: "Help text", // Explanatory text for the user
    min: 1, // For number type (optional)
    max: 100, // For number type (optional)
    step: 5, // For number type (optional)
    options: ["Option1", "Option2"], // For select type (optional)
    previewImage: "url", // Optional image preview (optional)
  },
];
```

### Accessing Settings in Scripts

Settings are accessed using the GM wrapper functions:

```javascript
import { gmGetValue } from "../main.js";

export function init() {
  // Values are automatically prefixed with RPGHQ_Manager_
  const highlightColor = gmGetValue("yourScriptId_colorSetting", "#ffff00");
  const enableFeature = gmGetValue("yourScriptId_enableFeature", true);

  // Use settings in your implementation...
}
```

### Dependent Settings

You can create settings that depend on other settings, which are only shown when the parent setting has a specific value:

```javascript
settings: [
  {
    id: "enableHighlighting",
    label: "Enable Highlighting",
    type: "checkbox",
    defaultValue: true,
  },
  {
    id: "highlightColor",
    label: "Highlight Color",
    type: "color",
    defaultValue: "#ffff00",
    dependsOn: {
      settingId: "enableHighlighting",
      value: true,
    },
  },
];
```

In this example, "Highlight Color" is only shown when "Enable Highlighting" is checked.

### Forum Preferences

Forum preferences are organized in a separate tab with multiple subtabs:

1. **Theme**: Controls forum appearance, including link colors, background colors, and images
2. **Threads**: Thread-specific settings
3. **Users**: User-related preferences

Forum preferences are defined in `src/forumPreferences.js` and organized by sections:

```javascript
export const FORUM_PREFERENCES = {
  sections: [
    {
      name: "Display Settings",
      preferences: [
        {
          id: "theme",
          name: "Theme",
          description: "Choose your preferred theme",
          type: "select",
          options: ["Default", "Dark", "Light", "High Contrast"],
          default: "Default",
        },
        // More preferences...
      ],
    },
    // More sections...
  ],
};
```

Forum preferences are rendered in `src/components/tabs/renderForumPreferencesTab.js` with dedicated subtabs in `src/components/tabs/subtabs/`.
