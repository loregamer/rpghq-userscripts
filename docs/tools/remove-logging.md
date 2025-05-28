# Remove Logging Tool

This tool removes all console.log statements and logger utility function calls from the source code that gets bundled into the userscript.

## Usage

```bash
# First, install the new dependency (only needed once)
npm install

# Remove all logging statements
npm run remove-logs
```

## What it removes

1. **Console calls**:
   - `console.log(...)`
   - `console.warn(...)`
   - `console.error(...)`
   - `console.debug(...)`
   - `console.info(...)`
   - `console.trace(...)`

2. **Logger utility calls** (from `utils/logger.js`):
   - `log(...)`
   - `warn(...)`
   - `error(...)`
   - `debug(...)`

3. **Unused imports**:
   - Automatically removes logger imports that are no longer used
   - Keeps other imports intact

## How it works

The tool uses Babel's AST (Abstract Syntax Tree) to safely parse and transform JavaScript code:

1. Parses all `.js` files in the `src/` directory
2. Identifies and removes console and logger calls
3. Cleans up unused imports
4. Preserves all other code structure
5. Runs prettier to ensure consistent formatting

## Example transformation

**Before:**
```javascript
import { log, warn } from '../utils/logger';
import { someUtil } from '../utils/someUtil';

export function init() {
  log('Initializing feature');
  console.log('Debug info');
  
  const result = someUtil();
  warn('Processing result:', result);
  
  return result;
}
```

**After:**
```javascript
import { someUtil } from '../utils/someUtil';

export function init() {
  const result = someUtil();
  
  return result;
}
```

## Benefits

- ✅ **Lint-safe**: AST transformation preserves valid syntax
- ✅ **Smart import cleanup**: Removes only unused logger imports
- ✅ **Handles edge cases**: Multiline calls, nested expressions, etc.
- ✅ **Non-destructive**: Only modifies logging statements
- ✅ **Automatic formatting**: Runs prettier after transformation

## Workflow

1. Run `npm run remove-logs` to clean all logging
2. Add new targeted console.log/logger calls for current testing
3. Build and test: `npm run build`
4. Repeat as needed

## Notes

- The `utils/logger.js` file is preserved for future use
- Only affects files that get bundled into the userscript
- Build tools and scripts in `tools/` and `scripts/` are not affected
