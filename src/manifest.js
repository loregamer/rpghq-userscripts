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
    settings: [
      {
        id: "enableNotificationColors",
        label: "Enable Notification Type Colors",
        type: "checkbox",
        defaultValue: true,
        description:
          "Applies different background colors based on notification type.",
      },
      {
        id: "notificationColors",
        label: "Notification Colors (JSON)",
        type: "text", // Consider a more advanced color picker type later
        defaultValue: JSON.stringify(
          {
            quote: "#f0f8ff", // AliceBlue
            reply: "#f5fffa", // MintCream
            reaction: "#fffafa", // Snow
            mention: "#fff0f5", // LavenderBlush
            edit: "#fafad2", // LightGoldenrodYellow
            default: "#ffffff", // White
          },
          null,
          2,
        ),
        description:
          "Define custom background colors for notification types using JSON format (hex codes). Requires 'Enable Notification Type Colors' to be active.",
      },
      {
        id: "enableImagePreviews",
        label: "Enable Image Previews",
        type: "checkbox",
        defaultValue: true,
        description: "Shows image previews in 'Post replied to' notifications.",
      },
      {
        id: "enableVideoPreviews",
        label: "Enable Video Previews",
        type: "checkbox",
        defaultValue: false, // Off by default
        description:
          "Shows video previews in 'Post replied to' notifications. Warning: This might impact performance.",
      },
      {
        id: "enableReactionSmileys",
        label: "Show Reaction Smileys",
        type: "checkbox",
        defaultValue: true,
        description:
          "Fetches and displays reaction smileys within reaction notifications.",
      },
      {
        id: "resizeFillerWords",
        label: "Resize Filler Words",
        type: "checkbox",
        defaultValue: true,
        description:
          "Makes common filler words like 'and', 'by', 'in' smaller in notification text for better readability.",
      },
      // Keep existing unrelated settings if any, e.g., quote previews
      {
        id: "enableQuotePreviews",
        label: "Enable Quote Previews",
        type: "checkbox",
        defaultValue: true,
        description:
          "Shows a preview of the quoted text in 'Post quoted' notifications.",
      },
    ],
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
      {
        id: "unboldParentheses",
        label: "Unbold Text in Parentheses",
        type: "checkbox",
        defaultValue: true,
        description:
          "Removes bold formatting from text within parentheses in recent topics titles.",
      },
      {
        id: "wrapTitles",
        label: "Wrap Long Titles",
        type: "checkbox",
        defaultValue: true,
        description:
          "Allows long thread titles in recent topics to wrap instead of being cut off.",
      },
      {
        id: "reformatAGThreads",
        label: "Reformat AG Thread Titles",
        type: "checkbox",
        defaultValue: true,
        description:
          "Reformats 'All Games' thread titles for better readability (e.g., moves chapter number).",
      },
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
  }
];;
