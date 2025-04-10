# Script Execution Phases

The RPGHQ Userscript Manager supports executing scripts at different phases during page load. This allows scripts to be loaded at the most appropriate time based on their requirements.

## Available Execution Phases

Scripts can be executed in one of these phases:

1. `document-start` - Executed as soon as possible, before the DOM is constructed
   - Best for scripts that need to intercept network requests or modify page behavior before it loads
   - Use cautiously as DOM elements will not be available

2. `document-end` - Executed after the DOM is ready but before all resources are loaded
   - The default phase if none is specified
   - Good for most scripts that need to access the DOM but don't need all resources

3. `document-idle` - Executed after the page is fully loaded (including all resources)
   - Good for scripts that need images and other resources to be fully loaded
   - Similar to window.onload

4. `after_dom` - Executed after a short delay following page load
   - Good for UI-focused scripts that need the page to be fully rendered
   - Helps avoid race conditions with site JavaScript

## Usage in Manifest

To specify when a script should execute, add the `executionPhase` property to its entry in the manifest:

```javascript
{
  id: "example_script",
  name: "Example Script",
  // ... other properties ...
  executionPhase: "document-start" // Will execute as early as possible
}
```

If no executionPhase is specified, the script will use the default `document-end` phase.

## Implementation Details

While the overall userscript is set to run at `@run-at document-start`, the individual script modules are loaded at their specified phases using event listeners:

- Scripts with `document-start` execute immediately
- Scripts with `document-end` execute when the DOMContentLoaded event fires
- Scripts with `document-idle` execute when the window load event fires
- Scripts with `after_dom` execute after a short timeout following the load event

This approach gives fine-grained control over when each script runs without requiring separate userscripts.