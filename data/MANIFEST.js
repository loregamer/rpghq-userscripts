/**
 * Hard-coded manifest - just for display purposes
 */
const MANIFEST = {
  scripts: [
    {
      id: "notifications",
      name: "Notifications Improved",
      version: "1.1.0",
      description:
        "Adds reaction smileys to notifications and makes them formatted better",
      filename: "notifications.js",
      matches: ["https://rpghq.org/forums/*"],
      executionPhase: "document-ready",
      category: "Aesthetic",
      image: "https://f.rpghq.org/rso7uNB6S4H9.png",
      settings: [],
    },
  ],
  schema: {
    version: "1.0.0",
    executionPhases: [
      {
        id: "document-start",
        name: "Document Start",
        description: "Executes before DOM parsing begins",
      },
      {
        id: "document-ready",
        name: "Document Ready",
        description:
          "Executes when basic DOM is available but before resources are loaded",
      },
      {
        id: "document-loaded",
        name: "Document Loaded",
        description: "Executes after page is fully loaded",
      },
      {
        id: "document-idle",
        name: "Document Idle",
        description: "Executes after a short delay when page is idle",
      },
      {
        id: "custom-event",
        name: "Custom Event",
        description: "Executes when a specific custom event is triggered",
      },
    ],
  },
};
