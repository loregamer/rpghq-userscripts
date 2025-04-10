// Manifest defining scripts and their metadata
export const SCRIPT_MANIFEST = [
  {
    id: 'script1',
    name: 'Example Script 1',
    version: '0.1.0',
    description: 'A basic example script.',
    author: 'Your Name',
    path: './scripts/example_script1.js', // Path relative to main.js
    enabledByDefault: true,
    settings: [
      {
        id: 'setting1',
        label: 'Enable Feature X',
        type: 'checkbox',
        defaultValue: true,
      },
    ],
  },
  {
    id: 'script2',
    name: 'Example Script 2 (Disabled)',
    version: '0.2.0',
    description: 'Another example, disabled by default.',
    author: 'Your Name',
    path: './scripts/example_script2.js',
    enabledByDefault: false,
    settings: [], // No settings for this one
  },
];