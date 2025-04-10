# CSS Style Injection

## Overview

This document explains how CSS styles are injected into the RPGHQ Userscript Manager.

Rather than bundling the CSS directly with Rollup, we use a post-build script to inject the styles. This approach has several advantages:

1. Keeps the bundle size smaller during development
2. Allows for easier styling updates without rebuilding the entire bundle
3. Makes the CSS more maintainable as a separate file

## How It Works

1. CSS styles are defined in `src/injectStyles.js`
2. The main build process compiles the JavaScript code without the styles
3. A post-build script (`scripts/inject-styles.js`) extracts the CSS from `injectStyles.js`
4. The script injects the CSS into the final userscript using `GM_addStyle`

## Files Involved

- `src/injectStyles.js` - Contains all the CSS styles wrapped in a `GM_addStyle` call
- `scripts/inject-styles.js` - Post-build script that extracts styles and injects them
- `package.json` - Defines the build pipeline including the post-build script

## Updating Styles

To update styles:

1. Edit the CSS in `src/injectStyles.js`
2. Run `npm run build` to rebuild the userscript with the updated styles

## Notes

- The `injectStyles.js` file is not directly imported into the main codebase
- The post-build script handles extracting and injecting the styles
- The script maintains the structure of the CSS, including comments and formatting
