// Manifest defining scripts and their metadata
/**
 * SCRIPT_MANIFEST contains the configuration for all scripts in the manager
 * 
 * Each script entry can have the following properties:
 * @property {string} id - Unique identifier for the script
 * @property {string} name - Display name of the script
 * @property {string} version - Version number
 * @property {string} description - Brief description of what the script does
 * @property {string} author - Author's name
 * @property {string} image - URL to an image icon representing the script
 * @property {string} path - Reference path to the script file (for documentation purposes)
 * @property {boolean} enabledByDefault - Whether the script should be enabled when first installed
 * @property {string[]} urlPatterns - Array of URL patterns where the script should run (empty for all URLs)
 * @property {Object[]} settings - Array of setting objects for the script
 * @property {string[]} categories - Categories the script belongs to
 * @property {string} executionPhase - When the script should execute, one of:
 *   - "document-start" - As soon as possible in page load
 *   - "document-end" - When DOM is ready but before all resources loaded (default if not specified)
 *   - "document-idle" - After page is fully loaded
 *   - "after_dom" - Small delay after the page is loaded (for UI scripts)
 */
export const SCRIPT_MANIFEST = [
  {
    id: "bbcode",
    name: "BBCode Highlighting",
    version: "1.0.0",
    description:
      "Adds BBCode highlighting and other QOL improvements to the text editor",
    author: "loregamer",
    path: "./scripts/bbcode.js",
    enabledByDefault: true,
    image: "https://f.rpghq.org/9Fl4tjANOkgO.png?n=pasted-file.png",
    urlPatterns: [
      "https://rpghq.org/forums/posting.php?mode=post*",
      "https://rpghq.org/forums/posting.php?mode=quote*",
      "https://rpghq.org/forums/posting.php?mode=reply*",
      "https://rpghq.org/forums/posting.php?mode=edit*",
    ],
    settings: [
      // Add settings here
    ],
    categories: ["UI"],
    executionPhase: "after_dom",
  },
  {
    id: "commaFormatter",
    name: "Thousands Comma Formatter",
    version: "2.1.2",
    description: "Add commas to large numbers in forum posts and statistics.",
    author: "loregamer",
    image: "https://f.rpghq.org/olnCVAbEzbkt.png?n=pasted-file.png",
    path: "./scripts/commaFormatter.js", // Path is kept for reference but not used for loading
    enabledByDefault: true,
    urlPatterns: [], // Empty array means run on all URLs
    settings: [
      {
        id: "formatFourDigits",
        label: "Format 4-digit numbers",
        type: "checkbox",
        defaultValue: false,
        description:
          "Enable to add commas to 4-digit numbers (1,000+). Disable to only format 5-digit numbers (10,000+).",
      }
];
