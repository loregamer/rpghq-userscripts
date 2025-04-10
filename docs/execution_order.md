# Execution Order

This document outlines the planned execution order for the RPGHQ Userscript Manager.

## Core Principle

The manager aims to execute functionality in a predictable sequence to ensure dependencies are met and potential conflicts are minimized.

## Execution Sequence

1.  **Initialization:** The core manager initializes, loads settings, and prepares the UI.
2.  **`document-start` Scripts:** Enabled scripts marked with `executionPhase: 'document-start'` are loaded and executed immediately.
3.  **DOM Ready (`document-end` phase begins):**
    - **Caching Logic (Conceptual):** Functions responsible for identifying and caching data from the current page (e.g., posts, topics) will run first. (Implementation TBD in `sharedUtils.js` or dedicated modules).
    - **Preference Logic (Conceptual):** Functions applying user or thread-specific preferences (e.g., hiding elements, applying highlights based on stored settings) will run next. (Implementation TBD).
    - **`document-end` Scripts:** Enabled scripts marked with `executionPhase: 'document-end'` (or no phase specified, as it's the default) are loaded and executed.
4.  **Page Idle (`document-idle` phase):**
    - **`document-idle` Scripts:** Enabled scripts marked with `executionPhase: 'document-idle'` are loaded and executed.
5.  **Delayed Execution (`after_dom` phase):**
    - **`after_dom` Scripts:** Enabled scripts marked with `executionPhase: 'after_dom'` are loaded and executed after a short delay.

## Rationale

- **`document-start`:** For critical, early modifications or event listeners.
- **Caching:** Needs to happen early after the DOM is available to gather data before other scripts potentially modify the structure.
- **Preferences:** Applied after caching, using potentially cached data and modifying the DOM based on user settings before main script functionalities run.
- **`document-end`:** Standard execution time for most DOM manipulations.
- **`document-idle`:** For less critical tasks that can wait until the page is fully loaded.
- **`after_dom`:** For scripts that need to run after potentially asynchronous operations or initial rendering is fully complete.

## Implementation Note

The actual implementation in `main.js` will involve checking the current `document.readyState` or using event listeners (`DOMContentLoaded`, `load`) combined with `setTimeout` for the `after_dom` phase to trigger the loading of scripts associated with each phase.
