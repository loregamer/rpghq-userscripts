# BBCode Script Execution Phase

The BBCode script is configured to run in the `after_dom` execution phase, which is defined in the manifest as:

```js
{
  id: "bbcode",
  name: "BBCode Highlighting",
  // ...other properties
  executionPhase: "after_dom",
}
```

## Important Implementation Details

- The script previously relied on `window.addEventListener("load", ...)` to initialize.
- When using the `after_dom` execution phase, the script now initializes immediately when loaded rather than waiting for the window load event.
- This ensures that the script will work correctly even if it's loaded after the window load event has already fired.

## Troubleshooting

If the BBCode script is not working with execution phases:

1. Ensure that the script is initialized directly in the `init()` function rather than waiting for the window load event
2. Check that the `executionPhase` in the manifest is set to `after_dom`
3. Verify that the DOM elements the script needs (like `#message` textarea) are available when the script runs
