# Migration Guide: Converting Standalone Userscripts to the RPGHQ Manager

This guide outlines the process for converting existing standalone userscripts to work with the RPGHQ Userscript Manager framework.

## Overview

Converting a standalone userscript involves:
1. Creating a module-based script that exports an `init` function
2. Adding the script to the manager's manifest
3. Adapting script settings to use the manager's settings system
4. Adding proper cleanup functionality

## Step 1: Convert Userscript to Module Format

### Original Standalone Format
Standalone userscripts typically use an IIFE (Immediately Invoked Function Expression):

```javascript
// ==UserScript==
// @name         My Script
// @description  Does something useful
// ...more metadata...
// ==/UserScript==

(function() {
  "use strict";
  
  // Script variables and functions
  const someSetting = GM_getValue("mySetting", defaultValue);
  
  function doSomething() {
    // Function logic
  }
  
  // Script initialization
  doSomething();
  setupEventListeners();
})();
```

### New Module Format
For the manager, convert to an ES module that exports an `init` function:

```javascript
// My Script
/**
 * Description of what the script does
 * Original by: Original author
 */

export function init() {
  console.log("My Script initialized!");
  
  // Get settings via manager's system
  const someSetting = GM_getValue("RPGHQ_Manager_scriptId_settingId", defaultValue);
  
  function doSomething() {
    // Function logic
  }
  
  // Do initialization
  doSomething();
  
  // Set up event listeners, observers, etc.
  const observer = new MutationObserver(() => { /* ... */ });
  observer.observe(document.body, { /* ... */ });
  
  // Return cleanup function
  return {
    cleanup: () => {
      // Remove event listeners, observers, DOM elements added by the script
      observer.disconnect();
      // Remove DOM elements
      const addedElements = document.querySelectorAll('.my-script-element');
      addedElements.forEach(el => el.remove());
    }
  };
}
```

## Step 2: Add Script to Manifest

Add your script to the `SCRIPT_MANIFEST` array in `src/manifest.js`:

```javascript
export const SCRIPT_MANIFEST = [
  {
    id: "uniqueScriptId",          // Unique identifier used in settings storage
    name: "My Script",             // Display name
    version: "1.0.0",              // Version number
    description: "Script description...", // Brief description
    author: "Original Author",     // Original author
    path: "./scripts/myScript.js", // Path for reference only
    enabledByDefault: true,        // Should script be enabled by default?
    settings: [                    // Array of settings objects (see below)
      {
        id: "settingId",
        label: "Setting Display Name",
        type: "checkbox",          // checkbox, text, select, etc.
        defaultValue: true,
        description: "Description of what this setting does"
      }
    ],
    categories: ["UI Enhancement"], // Category for filtering in manager
    executionPhase: "after_dom"     // When script should run
  },
  // ... other scripts
];
```

## Step 3: Update Settings Usage

Settings in standalone scripts:
```javascript
const mySetting = GM_getValue("mySetting", defaultValue);
GM_setValue("mySetting", newValue);
```

Settings in manager scripts:
```javascript
// Prefix with RPGHQ_Manager_scriptId_settingId
const mySetting = GM_getValue("RPGHQ_Manager_uniqueScriptId_settingId", defaultValue);
```

The manager handles saving settings through its UI, so you generally don't need to call `GM_setValue` directly.

## Step 4: Import the Script

Update the import list in `main.js`:

```javascript
// Import scripts directly
import * as exampleScript1 from "./scripts/example_script1.js";
import * as exampleScript2 from "./scripts/example_script2.js";
import * as commaFormatter from "./scripts/commaFormatter.js";
import * as myScript from "./scripts/myScript.js"; // Add your script here

// Map of script ids to their modules
const scriptModules = {
  script1: exampleScript1,
  script2: exampleScript2,
  commaFormatter: commaFormatter,
  uniqueScriptId: myScript // Add mapping using the ID from manifest
};
```

## Real Example: Thousands Comma Formatter

### Original:
```javascript
(function () {
  "use strict";

  const formatFourDigits = GM_getValue("formatFourDigits", false);
  const numberRegex = formatFourDigits ? /\b\d{4,}\b/g : /\b\d{5,}\b/g;

  function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function processElements() {
    // Implementation
  }

  // Run initial processing
  processElements();
  
  // Set up observer
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        processElements();
      }
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
```

### Converted:
```javascript
// RPGHQ - Thousands Comma Formatter
/**
 * Adds commas to large numbers in forum posts and statistics.
 * Original script by loregamer, adapted for the RPGHQ Userscript Manager.
 */

export function init() {
  console.log("Thousands Comma Formatter initialized!");

  // Get user settings
  const formatFourDigits = GM_getValue("RPGHQ_Manager_commaFormatter_formatFourDigits", false);
  const numberRegex = formatFourDigits ? /\b\d{4,}\b/g : /\b\d{5,}\b/g;

  function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function processElements() {
    // Same implementation
  }

  // Run initial processing
  processElements();
  
  // Set up same observer
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        processElements();
      }
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Return cleanup function
  return {
    cleanup: () => {
      console.log("Thousands Comma Formatter cleanup");
      observer.disconnect();
    },
  };
}
```

### Manifest Entry:
```javascript
{
  id: "commaFormatter",
  name: "Thousands Comma Formatter",
  version: "2.1.2",
  description: "Add commas to large numbers in forum posts and statistics.",
  author: "loregamer",
  path: "./scripts/commaFormatter.js",
  enabledByDefault: true,
  settings: [
    {
      id: "formatFourDigits",
      label: "Format 4-digit numbers",
      type: "checkbox",
      defaultValue: false,
      description: "Enable to add commas to 4-digit numbers (1,000+). Disable to only format 5-digit numbers (10,000+)."
    },
  ],
  categories: ["UI Enhancement"],
  executionPhase: "after_dom"
}
```

## Best Practices

1. **Namespace Consideration**: Use `RPGHQ_Manager_` prefix for all GM_getValue/GM_setValue operations
2. **Cleanup Function**: Always return a cleanup function to properly handle script disable
3. **Error Handling**: Wrap main functionality in try/catch blocks
4. **Documentation**: Add a comment section at the top with author attribution and brief description
5. **Settings**: Convert all script settings to use the manifest settings system
6. **Testing**: Test the script with both enabled and disabled states

## Documentation

Create a markdown file in `docs/scripts/` with details about your script:
- Overview
- Features
- Settings explanation
- Technical details
- Original script information