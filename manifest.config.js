/**
 * Central configuration for HQ-Userscripts.
 * Defines available scripts, their settings, and execution order.
 */

// Scripts are executed in the order they appear in this array.
export const scripts = [
  // {
  //   id: 'CoreSetup', // Placeholder for core service initialization (like caching)
  //   name: 'Core Services Setup',
  //   description: 'Initializes shared services used by other scripts.',
  //   path: null, // No specific init.js, handled by initCore.js
  //   enabled: true,
  //   category: 'Core',
  //   settings: [],
  // },
  {
    id: "notifications",
    name: "Notifications Improved",
    version: "1.1.0",
    description:
      "Adds reaction smileys to notifications and makes them formatted better",
    //filename: "notifications.js", // filename is less relevant now, path is key
    path: "scripts/Notifications/init.js", // Path relative to src/ for dynamic import
    matches: ["https://rpghq.org/forums/*"],
    executionPhase: "document-ready", // This might be less critical if initCore handles timing, but keep for info
    category: "Aesthetic",
    image: "https://f.rpghq.org/rso7uNB6S4H9.png",
    enabled: true, // Control if the script runs
    settings: [],
  },
  // Add other scripts here in desired execution order
  // {
  //   id: 'ScriptManager',
  //   name: 'Userscript Manager UI',
  //   path: 'scripts/ScriptManager/init.js',
  //   enabled: true,
  //   category: 'Core',
  //   settings: {...},
  // },
];

// Schema information, potentially used by the Script Manager UI
export const schema = {
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
  // Add other schema details if needed (e.g., categories)
  categories: [
      "Core",
      "Aesthetic",
      // ... other categories
  ]
};
