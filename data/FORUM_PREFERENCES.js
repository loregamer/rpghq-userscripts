/**
 * Forum preferences (mock data for display)
 */
const FORUM_PREFERENCES = {
  sections: [
    {
      name: "Display Settings",
      preferences: [
        {
          id: "theme",
          name: "Theme",
          description: "Choose your preferred theme",
          type: "select",
          options: ["Default", "Dark", "Light", "High Contrast"],
          default: "Default",
        },
        {
          id: "font_size",
          name: "Font Size",
          description: "Base font size for forum text",
          type: "select",
          options: ["Small", "Medium", "Large", "Extra Large"],
          default: "Medium",
        },
        {
          id: "show_avatars",
          name: "Show Avatars",
          description: "Display user avatars in posts",
          type: "toggle",
          default: true,
        },
      ],
    },
    {
      name: "Notification Settings",
      preferences: [
        {
          id: "email_notifications",
          name: "Email Notifications",
          description: "Receive email notifications for important events",
          type: "toggle",
          default: true,
        },
        {
          id: "notification_frequency",
          name: "Notification Frequency",
          description: "How often to receive notifications",
          type: "select",
          options: ["Immediately", "Daily Digest", "Weekly Digest"],
          default: "Immediately",
        },
      ],
    },
    {
      name: "Privacy Settings",
      preferences: [
        {
          id: "online_status",
          name: "Online Status",
          description: "Show your online status to other users",
          type: "toggle",
          default: true,
        },
        {
          id: "profile_visibility",
          name: "Profile Visibility",
          description: "Who can see your profile details",
          type: "select",
          options: ["Everyone", "Members Only", "Friends Only", "Nobody"],
          default: "Members Only",
        },
      ],
    },
  ],
};

// Export the object if in Node.js environment
module.exports = FORUM_PREFERENCES;
