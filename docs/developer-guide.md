# RPGHQ Userscript Manager Developer Guide

This comprehensive guide provides detailed documentation for developers who want to create new scripts or contribute to the RPGHQ Userscript Manager project.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Script Development Workflow](#script-development-workflow)
- [Script Execution Lifecycle](#script-execution-lifecycle)
- [Helper Functions Reference](#helper-functions-reference)
- [UI Components](#ui-components)
- [Best Practices](#best-practices)
- [Advanced Features](#advanced-features)
- [Debugging Techniques](#debugging-techniques)
- [Contributing Guidelines](#contributing-guidelines)

## Architecture Overview

The RPGHQ Userscript Manager uses a modular architecture with several key components:

1. **Core Framework**: Handles script loading, execution, and management
2. **Script Registry (MANIFEST)**: Central registry of available scripts and their metadata
3. **User Interface**: UI components for script management and settings
4. **Helper Library**: Shared utility functions for common tasks
5. **Build System**: Combines all modules into a single userscript

The architecture follows these design principles:

- **Modularity**: Each script is a self-contained module
- **Separation of Concerns**: UI, data, and functionality are separated
- **Progressive Enhancement**: Scripts enhance the existing forum interface
- **Configuration Over Code**: Scripts declare metadata and settings in a standard way
- **Don't Repeat Yourself (DRY)**: Common functionality is shared via helper functions

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

## Script Development Workflow

### Setting Up Your Development Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/HQ-Userscripts.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development watcher:
   ```bash
   npm run watch
   ```

### Creating a New Script

1. Determine the appropriate execution phase for your script
2. Create the script directory structure:
   ```
   scripts/
   └── {execution-phase}/
       └── {script-name}/
           ├── {script-name}.js
           └── metadata.json   # Optional, can be in MANIFEST instead
   ```

3. Create helper functions if needed:
   ```
   helpers/
   └── {script-name}/
       ├── helperFunction1.js
       ├── helperFunction2.js
       └── ...
   ```

4. Add your script to the MANIFEST.js file:
   ```javascript
   const MANIFEST = {
     scripts: [
       // ... other scripts ...
       {
         id: "your-script-id",
         name: "Your Script Name",
         version: "1.0.0",
         description: "Description of your script",
         category: "Category",
         executionPhase: "document-ready",
         matches: ["https://rpghq.org/forums/*"],
         settings: [
           // Your script settings
         ]
       }
       // ... other scripts ...
     ]
   };
   ```

5. Build your script:
   ```bash
   npm run build
   ```

### Testing Your Script

1. Install the generated userscript in your browser
2. Navigate to the RPGHQ forums
3. Check the console for any errors
4. Verify that your script is functioning as expected
5. Test your script with different settings configurations

### Debugging Tools

- Browser Developer Tools
- Console logging (`logInfo`, `logWarning`, `logError`)
- Setting debug flags (`GM_setValue('debug', true)`)
- Testing specific components in isolation

## Script Execution Lifecycle

The userscript manager executes scripts at different phases of the page load lifecycle:

### document-start

- Runs before DOM parsing begins
- Use for style injection that needs to be applied immediately
- Example: Theme overrides, critical CSS changes

### document-ready

- Runs when DOM is available but before resources are loaded
- Equivalent to jQuery's `$(document).ready()`
- Most common for DOM manipulations
- Example: UI enhancements, content modification

### document-loaded

- Runs after page is fully loaded (all resources)
- Equivalent to `window.onload`
- Use for scripts that need all resources to be loaded
- Example: Image processing, analytics

### document-idle

- Runs after a short delay when page is idle
- Use for non-critical scripts that can wait
- Example: Background tasks, prefetching

### custom-event

- Runs when specific custom events are triggered
- Use for scripts that respond to specific actions
- Example: New message notification, user action handlers

## Helper Functions Reference

### Shared Helpers

#### compareVersions.js

```javascript
/**
 * Compare two version strings
 * @param {string} a - First version (e.g., '1.2.3')
 * @param {string} b - Second version (e.g., '1.3.0')
 * @returns {number} -1 if a < b, 0 if a = b, 1 if a > b
 */
function compareVersions(a, b) {
  // Implementation details
}
```

#### getPhaseDisplayName.js

```javascript
/**
 * Get a human-readable name for an execution phase
 * @param {string} phase - The execution phase
 * @returns {string} Human-readable phase name
 */
function getPhaseDisplayName(phase) {
  // Implementation details
}
```

#### isScriptEnabled.js

```javascript
/**
 * Check if a script is enabled
 * @param {string} scriptId - The script ID to check
 * @returns {boolean} Whether the script is enabled
 */
function isScriptEnabled(scriptId) {
  // Implementation details
}
```

#### toggleScriptEnabled.js

```javascript
/**
 * Toggle a script's enabled state
 * @param {string} scriptId - The script ID to toggle
 * @returns {boolean} The new enabled state
 */
function toggleScriptEnabled(scriptId) {
  // Implementation details
}
```

#### addStyles.js

```javascript
/**
 * Add global styles to the page
 */
function addStyles() {
  // Implementation details
}
```

### Creating Your Own Helper Functions

Helper functions should:

1. Have a single responsibility
2. Be well-documented with JSDoc comments
3. Be exported consistently
4. Have meaningful names
5. Be placed in the appropriate directory

Example:

```javascript
/**
 * Process a forum post element
 * @param {Element} postElement - The post element to process
 * @param {Object} options - Processing options
 * @returns {Object} Processing results
 */
function processPostElement(postElement, options = {}) {
  // Implementation
  return results;
}
```

## UI Components

The userscript manager provides several UI components for creating a consistent user experience:

### Modal Dialogs

```javascript
/**
 * Show the main userscript manager modal
 */
function showModal() {
  // Implementation details
}

/**
 * Hide the active modal
 */
function hideModal() {
  // Implementation details
}
```

### Script Settings UI

```javascript
/**
 * Show settings for a specific script
 * @param {Object} script - The script object
 */
function showScriptSettings(script) {
  // Implementation details
}

/**
 * Render script settings content
 * @param {Object} script - The script object
 * @returns {string} HTML content
 */
function renderScriptSettingsContent(script) {
  // Implementation details
}
```

### Creating Custom UI Components

When creating custom UI components:

1. Follow the existing design patterns
2. Use consistent CSS class naming
3. Ensure accessibility
4. Provide appropriate event handlers
5. Clean up when components are removed

Example:

```javascript
/**
 * Create a custom tooltip
 * @param {Element} element - The element to attach the tooltip to
 * @param {string} text - The tooltip text
 */
function createTooltip(element, text) {
  const tooltip = document.createElement('div');
  tooltip.className = 'my-script-tooltip';
  tooltip.textContent = text;
  
  element.addEventListener('mouseenter', () => {
    document.body.appendChild(tooltip);
    // Position the tooltip
  });
  
  element.addEventListener('mouseleave', () => {
    if (tooltip.parentNode) {
      tooltip.parentNode.removeChild(tooltip);
    }
  });
}
```

## Best Practices

### Code Style

- Use consistent indentation (2 spaces)
- Use meaningful variable and function names
- Add JSDoc comments to functions
- Keep functions small and focused
- Use const and let instead of var
- Prefer arrow functions for callbacks

### Performance

- Minimize DOM manipulation
- Batch DOM operations
- Use event delegation
- Avoid tight loops
- Defer non-critical operations
- Use requestAnimationFrame for animations

### Compatibility

- Test in multiple browsers
- Avoid browser-specific APIs without feature detection
- Use polyfills when necessary
- Handle error cases gracefully

### Security

- Sanitize user input
- Avoid eval() and innerHTML when possible
- Validate data from external sources
- Use secure storage for sensitive information

### Maintainability

- Keep files small and focused
- Use consistent naming conventions
- Document complex logic
- Add comments for non-obvious code
- Follow the project's architectural patterns

## Advanced Features

### Script Dependencies

Scripts can depend on other scripts in these ways:

1. **Execution phase**: Later phases can use functionality from earlier phases
2. **Custom events**: Scripts can communicate via custom events
3. **Shared storage**: Scripts can share data via GM_setValue/GM_getValue

Example of using custom events:

```javascript
// Script A: Fires an event
document.dispatchEvent(new CustomEvent('scriptA:dataReady', { 
  detail: { data: processedData } 
}));

// Script B: Listens for the event
document.addEventListener('scriptA:dataReady', (event) => {
  const data = event.detail.data;
  // Use the data
});
```

### Dynamic Script Loading

For advanced scenarios, scripts can be loaded dynamically:

```javascript
/**
 * Dynamically load a script based on page conditions
 */
function dynamicScriptLoader() {
  // Check conditions
  if (document.querySelector('.specific-page-element')) {
    // Load a specific script for this page
    loadSpecificScript();
  }
}

function loadSpecificScript() {
  // Implementation
}
```

### Forum API Integration

Some scripts may need to interact with the forum's API:

```javascript
/**
 * Fetch data from the forum API
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} API response
 */
async function fetchFromForumApi(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `/forums/api/${endpoint}?${queryString}`;
  
  const response = await fetch(url, {
    credentials: 'same-origin',
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  });
  
  return response.json();
}
```

## Debugging Techniques

### Console Logging

Use the provided logging functions:

```javascript
logInfo('Script initialized');
logWarning('Setting not found, using default');
logError('Failed to process element', element);
```

### Testing Specific Components

Isolate components for testing:

```javascript
// Test a specific helper function
function testHelperFunction() {
  const testElement = document.createElement('div');
  testElement.innerHTML = '<span class="test-class">Test</span>';
  document.body.appendChild(testElement);
  
  processElement(testElement);
  
  console.log('Processed element:', testElement.innerHTML);
  
  document.body.removeChild(testElement);
}
```

### DOM Inspection

Add visual indicators for debugging:

```javascript
function addDebugOverlay(element, info) {
  element.dataset.debug = info;
  element.style.outline = '2px solid red';
  
  const debugLabel = document.createElement('span');
  debugLabel.className = 'debug-label';
  debugLabel.textContent = info;
  
  element.appendChild(debugLabel);
}
```

## Contributing Guidelines

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run the build process
5. Test your changes
6. Submit a pull request

### Code Review Criteria

Pull requests will be reviewed based on:

1. Code quality and style
2. Adherence to project architecture
3. Documentation quality
4. Test coverage
5. Performance implications

### Documentation Standards

- Update README.md for significant changes
- Add JSDoc comments to functions
- Update MIGRATION_GUIDE.md if relevant
- Include examples for new features

### Version Control Conventions

- Use descriptive commit messages
- Reference issue numbers when applicable
- Keep commits focused on single changes
- Follow semantic versioning

### Testing Requirements

- Test in multiple browsers
- Verify script works with different forum themes
- Check performance impact
- Ensure compatibility with other scripts

By following these guidelines, you'll contribute effectively to the RPGHQ Userscript Manager project while maintaining code quality and consistency.
