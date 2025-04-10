# URL Matching System

The URL matching system allows you to specify which webpages your scripts will run on. This helps to avoid running scripts on pages where they aren't needed or might cause issues.

## How to Use URL Matching

In the script manifest (`src/manifest.js`), each script entry can include a `urlPatterns` property:

```js
{
  id: "example-script",
  name: "Example Script",
  // ... other properties ...
  urlPatterns: [
    "https://rpghq.org/forums/posting.php?mode=post*",
    "https://rpghq.org/forums/posting.php?mode=reply*",
  ],
}
```

## Pattern Format

URL patterns use wildcard matching:

- `*` - Matches any sequence of characters (including none)
- Patterns are matched against the full URL
- If a pattern doesn't include a wildcard, it will only match an exact URL
- Case sensitivity follows the browser's URL handling

## Examples

- `https://rpghq.org/forums/*` - Matches all forum pages
- `https://rpghq.org/forums/posting.php?mode=post*` - Matches new post pages
- `https://rpghq.org/forums/posting.php?mode=reply*` - Matches reply pages
- `https://rpghq.org/forums/posting.php?mode=edit*` - Matches edit pages
- `https://rpghq.org/forums/viewtopic.php*` - Matches all topic pages

## Default Behavior

- If `urlPatterns` is an empty array (`[]`), the script will run on all pages.
- If `urlPatterns` is not specified at all, the script will run on all pages.

## How It Works

The URL matching system works by:

1. When a script is about to be loaded, the system checks the current page URL
2. If the script has URL patterns, it tests each pattern against the current URL
3. If any pattern matches, the script is loaded; otherwise, it's skipped

This ensures that scripts only run where they're meant to run, improving performance and avoiding potential conflicts.
