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
    id: "quotes",
    name: "Better Quotes",
    version: "1.0.0",
    description:
      "Improves quote functionality with styling, avatars, read more/less, and nested quote toggles.",
    author: "loregamer",
    image: "https://f.rpghq.org/mqbRTIvY56fp.png?n=pasted-file.png", // Add an image URL if available
    path: "./scripts/quotes.js",
    enabledByDefault: true,
    settings: [],
    categories: ["UI"],
  },
  {
    id: "disableEmbeds",
    name: "Disable Media Embeds",
    version: "1.0.0",
    description: "Replaces YouTube and Reddit embeds with plain links",
    author: "loregamer",
    image: "https://f.rpghq.org/olnCVAbEzbkt.png?n=pasted-file.png", // Placeholder image
    path: "./scripts/disableEmbeds.js",
    enabledByDefault: true,
    settings: [
      // Settings are controlled through Forum Preferences
    ],
    categories: ["UI"],
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
        id: "hideReadNotifications",
        label: "Hide Read Notifications",
        type: "checkbox",
        defaultValue: false,
        description:
          "Completely hide read notifications instead of making them transparent.",
      },
      {
        id: "readOpacity",
        label: "Read Notification Opacity",
        type: "number",
        min: 0.1,
        max: 1,
        step: 0.05,
        default: 0.8,
        description:
          "How transparent read notifications should be (1 = fully opaque). Only applies when 'Hide Read Notifications' is disabled.",
      },
      {
        id: "readTintColor",
        label: "Read Notification Tint Color",
        type: "color",
        default: "rgba(0, 0, 0, 0.05)",
        description: "A subtle color tint applied to read notifications.",
      },

      {
        id: "enableNotificationColors",
        label: "Enable Notification Type Colors",
        type: "checkbox",
        defaultValue: true,
        description:
          "Define custom background colors for notification types using JSON format (hex codes). Requires 'Enable Notification Type Colors' to be active.",
      },
      {
        id: "quoteColor",
        label: "Quote Notification Color",
        type: "color",
        defaultValue: "#F5575D",
        description: "Set the text color for quote notifications.",
        dependsOn: { settingId: "enableNotificationColors", value: true },
      },
      {
        id: "replyColor",
        label: "Reply Notification Color",
        type: "color",
        defaultValue: "#2E8B57", // SeaGreen - Default Reply Color
        description: "Set the text color for reply notifications.",
        dependsOn: { settingId: "enableNotificationColors", value: true },
      },
      {
        id: "reactionColor",
        label: "Reaction Notification Color",
        type: "color",
        defaultValue: "#3889ED", // Default Reaction Color
        description: "Set the text color for reaction notifications.",
        dependsOn: { settingId: "enableNotificationColors", value: true },
      },
      {
        id: "mentionColor",
        label: "Mention Notification Color",
        type: "color",
        defaultValue: "#FFC107",
        description: "Set the text color for mention notifications.",
        dependsOn: { settingId: "enableNotificationColors", value: true },
      },
      {
        id: "editColor",
        label: "Edit Notification Color",
        type: "color",
        defaultValue: "#fafad2", // LightGoldenrodYellow
        description: "Set the background color for edit notifications.",
        dependsOn: { settingId: "enableNotificationColors", value: true },
      },
      {
        id: "approvalColor",
        label: "Approval Notification Color",
        type: "color",
        defaultValue: "#00AA00",
        description: "Set the text color for approval notifications.",
        dependsOn: { settingId: "enableNotificationColors", value: true },
      },
      {
        id: "reportColor",
        label: "Report Notification Color",
        type: "color",
        defaultValue: "#f58c05",
        description: "Set the text color for report notifications.",
        dependsOn: { settingId: "enableNotificationColors", value: true },
      },
      {
        id: "warningColor",
        label: "Warning Notification Color",
        type: "color",
        defaultValue: "#D31141",
        description: "Set the text color for warning notifications.",
        dependsOn: { settingId: "enableNotificationColors", value: true },
      },
      {
        id: "timestampColor",
        label: "Timestamp Color",
        type: "color",
        defaultValue: "#888888",
        description: "Set the text color for notification timestamps.",
      },
      {
        id: "referenceBackgroundColor",
        label: "Reference Background Color",
        type: "color",
        defaultValue: "rgba(23, 27, 36, 0.5)",
        description: "Set the background color for the post reference preview.",
      },
      {
        id: "referenceTextColor",
        label: "Reference Text Color",
        type: "color",
        defaultValue: "#ffffff",
        description: "Set the text color for the post reference preview.",
      },
      {
        id: "defaultColor",
        label: "Default Notification Row Background",
        type: "color",
        defaultValue: "#ffffff",
        description:
          "Set the default background color for notification rows on the main page (used if type-specific colors are off or not set).",
      },
      {
        id: "enableImagePreviews",
        label: "Enable Image Previews",
        type: "checkbox",
        defaultValue: true,
        description: "Shows image previews in 'Post replied to' notifications.",
        previewImage: "https://f.rpghq.org/X4oQJRUQ0Avb.png?n=pasted-file.png", // https://f.rpghq.org/DVH4QZTYWIZg.png?n=pasted-file.png
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
        previewImage: "https://f.rpghq.org/DVH4QZTYWIZg.png?n=pasted-file.png", // https://f.rpghq.org/DVH4QZTYWIZg.png?n=pasted-file.png
      },
      {
        id: "resizeFillerWords",
        label: "Resize Filler Words",
        type: "checkbox",
        defaultValue: true,
        description:
          "Makes common filler words like 'and', 'by', 'in' smaller in notification text for better readability.",
        previewImage: "https://f.rpghq.org/xDtPAZ1xQxLL.png?n=pasted-file.png",
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
      {
        id: "addSupportSymbol",
        label: "Mark Support Threads",
        type: "checkbox",
        defaultValue: true,
        description:
          "Adds ⚒ symbol to thread titles in support categories/forums.",
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
