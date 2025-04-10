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
    image: "https://f.rpghq.org/bEm69Td9mEGU.png?n=pasted-file.png",
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
  },
  {
    id: "kalareact",
    name: "Kalarion Reaction Auto-Marker",
    version: "1.0.0",
    description:
      "Auto marks Kalarion rape notifs as read (I will move this to user preferences and make it squashed instead)",
    author: "loregamer",
    image: "https://f.rpghq.org/OA0rQkkRSSVq.png?n=pasted-file.png", // Add an image URL if available
    path: "./scripts/kalareact.js",
    enabledByDefault: false,
    settings: [
      // Add settings here
    ],
    categories: ["General"],
  },
  {
    id: "memberSearch",
    name: "Member Search Button",
    version: "1.0.0",
    description: "Adds a quick member search button next to Unread posts",
    author: "loregamer",
    image: "https://f.rpghq.org/Rjsn2V3CLLOU.png?n=pasted-file.png", // Add an image URL if available
    path: "./scripts/memberSearch.js",
    enabledByDefault: true,
    settings: [
      // Add settings here
    ],
    categories: ["Fun"],
  },
  {
    id: "notifications",
    name: "Notification Improver",
    version: "1.0.0",
    description:
      "Adds smileys to reacted notifs, adds colors, idk just makes em cooler I guess",
    author: "loregamer",
    image: "https://f.rpghq.org/rso7uNB6S4H9.png", // Add an image URL if available
    path: "./scripts/notifications.js",
    enabledByDefault: true,
    settings: [],
    categories: ["UI"],
  },
  {
    id: "pinThreads",
    name: "Pin Threads",
    version: "1.0.0",
    description:
      "Adds a Pin button to threads so you can see them in board index",
    author: "loregamer",
    image: "https://f.rpghq.org/HTYypNZVXaOt.png?n=pasted-file.png", // Add an image URL if available
    path: "./scripts/pinThreads.js",
    enabledByDefault: true,
    settings: [
      // Add settings here
    ],
    categories: ["UI"],
  },
  {
    id: "randomTopic",
    name: "Random Topic Button",
    version: "1.0.0",
    description: "Adds a Random Topic button, for funsies",
    author: "loregamer",
    image: "https://f.rpghq.org/LzsLP40AK6Ut.png?n=pasted-file.png", // Add an image URL if available
    path: "./scripts/randomTopic.js",
    enabledByDefault: true,
    settings: [
      // Add settings here
    ],
    categories: ["Fun"],
  },
  {
    id: "separateReactions",
    name: "Reaction List Separated",
    version: "1.0.0",
    description: "Makes smiley reactions and counts separated",
    author: "loregamer",
    image:
      "https://f.rpghq.org/H6zBOaMtu9i2.gif?n=Separated%20Reactions%20(2).gif", // Add an image URL if available
    path: "./scripts/separateReactions.js",
    enabledByDefault: false,
    settings: [
      // Add settings here
    ],
    categories: ["UI"],
  },
  {
    id: "recentTopicsFormat",
    name: "Slightly Formatted Thread Titles in Recent Topics",
    version: "1.0.0",
    description:
      "Adds some minor formatting to thread titles, like unbolding stuff in parantheses, add line wrapping, or reformatting the AG threads",
    author: "loregamer",
    image: "https://f.rpghq.org/97x4ryHzRbVf.png?n=pasted-file.png", // Add an image URL if available
    path: "./scripts/recentTopicsFormat.js",
    enabledByDefault: false,
    settings: [
      // Add settings here
    ],
    categories: ["UI"],
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
  },
  {
    id: "threadPreferences",
    name: "Thread Preferences (Pin/Hide/Highlight)",
    version: "1.0.0",
    description:
      "Allows pinning, hiding, and highlighting individual threads on forum view pages.",
    author: "loregamer",
    path: "./scripts/threadPreferences.js",
    enabledByDefault: true,
    urlPatterns: ["*://*.rpghq.org/forums/viewforum.php*"], // Only run on viewforum pages
    settings: [], // Settings might be managed within the script or a dedicated UI later
    categories: ["Forum", "UI"],
    // Note: Execution phase will be handled by load_order.json
  }
];;
