// Manifest defining scripts and their metadata
export const SCRIPT_MANIFEST = [
  {
    id: "commaFormatter",
    name: "Thousands Comma Formatter",
    version: "2.1.2",
    description: "Add commas to large numbers in forum posts and statistics.",
    author: "loregamer",
    image: "https://f.rpghq.org/olnCVAbEzbkt.png?n=pasted-file.png",
    path: "./scripts/commaFormatter.js", // Path is kept for reference but not used for loading
    enabledByDefault: true,
    settings: [
      {
        id: "formatFourDigits",
        label: "Format 4-digit numbers",
        type: "checkbox",
        defaultValue: false,
        description:
          "Enable to add commas to 4-digit numbers (1,000+). Disable to only format 5-digit numbers (10,000+).",
      },
    ],
    categories: ["UI Enhancement"],
    executionPhase: "after_dom",
  },
  ,
  {
    id: "bbcode",
    name: "BBCode Highlighting",
    version: "1.0.0",
    description:
      "Adds BBCode highlighting and other QOL improvements to the text editor",
    author: "loregamer",
    image: "",
    path: "./scripts/bbcode.js",
    enabledByDefault: true,
    settings: [
      // Add settings here
    ],
    categories: ["UI"],
    executionPhase: "after_dom",
  },
];
