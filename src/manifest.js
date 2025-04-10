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
    id: "kalareact",
    name: "Kalarion Reaction Auto-Marker",
    version: "1.0.0",
    description:
      "Auto marks Kalarion rape notifs as read (I will move this to user preferences and make it squashed instead)",
    author: "loregamer",
    image: "https://f.rpghq.org/tTMdhnqxh1kW.gif", // Add an image URL if available
    path: "./scripts/kalareact.js",
    enabledByDefault: false,
    settings: [
      // Add settings here
    ],
    categories: ["General"],
    executionPhase: "after_dom",
  },
  {
    id: "commaFormatter",
    name: "Thousands Comma Formatter",
    version: "2.1.2",
    description: "Add commas to large numbers in forum posts and statistics.",
    author: "loregamer",
    image: "https://f.rpghq.org/olnCVAbEzbkt.png?n=pasted-file.png",
    path: "./scripts/commaFormatter.js",
    enabledByDefault: true,
    urlPatterns: [],
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
  }
];;
