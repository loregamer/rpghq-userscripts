# Utilities

This directory contains utility functions that are used across the userscript manager.

## URL Matcher (`urlMatcher.js`)

The URL Matcher utility provides functions to check if the current URL matches a pattern or set of patterns.

### Functions

#### `matchesUrl(patterns)`

Checks if the current URL matches any of the provided patterns.

- **Parameters:**
  - `patterns` (string or array of strings): URL pattern(s) to match against
- **Returns:**
  - Boolean: true if the current URL matches any pattern, false otherwise
- **Behavior:**
  - If no patterns are provided, it returns true (matches all URLs)
  - An empty array also matches all URLs
  - Supports wildcard (\*) characters in patterns

#### `shouldLoadScript(script)`

Checks if a script should be loaded based on its URL patterns and the current URL.

- **Parameters:**
  - `script` (object): A script manifest object with optional `urlPatterns` property
- **Returns:**
  - Boolean: true if the script should be loaded, false otherwise
- **Behavior:**
  - If the script has no urlPatterns property or it's an empty array, returns true
  - Otherwise, checks each pattern in the array using `matchesUrl`

### Example

```js
import { shouldLoadScript } from "./utils/urlMatcher.js";

const script = {
  id: "example",
  name: "Example Script",
  urlPatterns: [
    "https://rpghq.org/forums/posting.php?mode=post*",
    "https://rpghq.org/forums/posting.php?mode=reply*",
  ],
};

if (shouldLoadScript(script)) {
  // Load the script
}
```

See the [URL Matching documentation](/docs/url-matching.md) for more details on pattern format and usage.
