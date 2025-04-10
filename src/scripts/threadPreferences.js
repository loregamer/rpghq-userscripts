// Script for managing thread preferences: Pin, Hide, Highlight
import { gmGetValue, gmSetValue } from "../utils/gmUtils.js"; // Assuming gmUtils exists or will be created
import { log, error } from "../utils/logger.js";

const SCRIPT_ID = "threadPreferences";
const STORAGE_KEY_THREADS = "thread_prefs"; // Key for storing thread preferences

// --- Initialization ---
function init() {
  log(`${SCRIPT_ID}: Initializing...`);
  if (!isViewForumPage()) {
    log(`${SCRIPT_ID}: Not on a viewforum page, exiting.`);
    return null; // Return null or an object with no cleanup if not applicable
  }

  applyPreferences();
  addControlsToThreads();

  // Optional: Add MutationObserver if dynamic content loading needs handling
  // const observer = new MutationObserver(mutations => { ... });
  // observer.observe(document.querySelector('.forumbg'), { childList: true, subtree: true });

  log(`${SCRIPT_ID}: Initialized successfully.`);

  // Return a cleanup function if needed
  return {
    cleanup: () => {
      log(`${SCRIPT_ID}: Cleaning up...`);
      // Remove event listeners, observers, or added elements if necessary
      // observer.disconnect();
    },
  };
}

// --- Helper Functions ---
function isViewForumPage() {
  return window.location.href.includes("viewforum.php");
}

function getTopicIdFromRow(rowElement) {
  const topicLink = rowElement.querySelector("a.topictitle");
  if (topicLink && topicLink.href) {
    const match = topicLink.href.match(/t=(\d+)/);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

function getStoredPreferences() {
  return gmGetValue(STORAGE_KEY_THREADS, {});
}

function saveStoredPreferences(prefs) {
  gmSetValue(STORAGE_KEY_THREADS, prefs);
}

function getThreadRowElements() {
  // Adjust selector based on actual HTML structure (e.g., li.row.bg1, li.row.bg2)
  return document.querySelectorAll(".forumbg ul.topiclist li.row");
}

// --- Core Logic ---
function applyPreferences() {
  log(`${SCRIPT_ID}: Applying preferences...`);
  const prefs = getStoredPreferences();
  const rows = getThreadRowElements();
  const pinnedRows = [];

  rows.forEach((row) => {
    const topicId = getTopicIdFromRow(row);
    if (!topicId || !prefs[topicId]) return; // Skip if no ID or no prefs

    const topicPrefs = prefs[topicId];

    // Apply Hide
    if (topicPrefs.hidden) {
      row.style.display = "none";
      log(`${SCRIPT_ID}: Hiding topic ${topicId}`);
    } else {
      row.style.display = ""; // Ensure it's visible if not hidden
    }

    // Apply Highlight
    if (topicPrefs.highlight && topicPrefs.highlight !== "none") {
      row.style.backgroundColor = topicPrefs.highlight;
      log(
        `${SCRIPT_ID}: Highlighting topic ${topicId} with ${topicPrefs.highlight}`,
      );
    } else {
      row.style.backgroundColor = ""; // Remove background if no highlight
    }

    // Collect Pinned
    if (topicPrefs.pinned) {
      pinnedRows.push(row);
      log(`${SCRIPT_ID}: Marking topic ${topicId} for pinning`);
    }
  });

  // Apply Pin (move pinned rows to the top)
  if (pinnedRows.length > 0) {
    const topicList = document.querySelector(".forumbg ul.topiclist.topics");
    if (topicList) {
      // Move pinned rows to the top, preserving their relative order among themselves
      pinnedRows.reverse().forEach((row) => {
        // Reverse to insert in correct order
        topicList.insertBefore(
          row,
          topicList.querySelector("li.header").nextSibling,
        ); // Insert after header
      });
      log(`${SCRIPT_ID}: Moved ${pinnedRows.length} pinned topics to top.`);
    } else {
      error(
        `${SCRIPT_ID}: Could not find topic list container to move pinned threads.`,
      );
    }
  }

  log(`${SCRIPT_ID}: Preferences applied.`);
}

function addControlsToThreads() {
  log(`${SCRIPT_ID}: Adding controls to threads...`);
  const rows = getThreadRowElements();

  rows.forEach((row) => {
    const topicId = getTopicIdFromRow(row);
    if (!topicId) return;

    const controlContainer = document.createElement("span");
    controlContainer.className = "rpghq-thread-controls";
    controlContainer.style.marginLeft = "10px"; // Basic styling

    // TODO: Create Pin button
    const pinButton = document.createElement("button");
    pinButton.textContent = "Pin";
    pinButton.onclick = () => handlePinToggle(topicId, row);
    controlContainer.appendChild(pinButton);

    // TODO: Create Hide button
    const hideButton = document.createElement("button");
    hideButton.textContent = "Hide";
    hideButton.onclick = () => handleHideToggle(topicId, row);
    controlContainer.appendChild(hideButton);

    // TODO: Create Highlight button/dropdown
    const highlightButton = document.createElement("button");
    highlightButton.textContent = "Highlight";
    highlightButton.onclick = () => handleHighlight(topicId, row);
    controlContainer.appendChild(highlightButton);

    // Add container to a suitable place in the row (e.g., after topic title)
    // This might need adjustment based on the actual HTML structure
    const topicTitleElement = row.querySelector("a.topictitle");
    if (topicTitleElement && topicTitleElement.parentElement) {
      topicTitleElement.parentElement.appendChild(controlContainer);
    } else {
      // Fallback: append to the row itself or a specific cell if available
      const firstDt = row.querySelector("dl > dt");
      if (firstDt) {
        firstDt.appendChild(controlContainer);
      } else {
        row.appendChild(controlContainer); // Less ideal placement
      }
    }
  });
  log(`${SCRIPT_ID}: Controls added.`);
}

// --- Event Handlers ---
function handlePinToggle(topicId, rowElement) {
  log(`${SCRIPT_ID}: Toggling Pin for topic ${topicId}`);
  const prefs = getStoredPreferences();
  if (!prefs[topicId]) prefs[topicId] = {};

  prefs[topicId].pinned = !prefs[topicId].pinned; // Toggle pin state

  saveStoredPreferences(prefs);
  applyPreferences(); // Re-apply to reflect changes immediately
}

function handleHideToggle(topicId, rowElement) {
  log(`${SCRIPT_ID}: Toggling Hide for topic ${topicId}`);
  const prefs = getStoredPreferences();
  if (!prefs[topicId]) prefs[topicId] = {};

  prefs[topicId].hidden = !prefs[topicId].hidden; // Toggle hidden state

  saveStoredPreferences(prefs);
  applyPreferences(); // Re-apply to reflect changes immediately
}

function handleHighlight(topicId, rowElement) {
  log(`${SCRIPT_ID}: Handling Highlight for topic ${topicId}`);
  const prefs = getStoredPreferences();
  if (!prefs[topicId]) prefs[topicId] = {};

  // Basic implementation: Cycle through a few colors or use a prompt
  // A proper implementation would use a color picker or dropdown
  const currentHighlight = prefs[topicId].highlight;
  let nextHighlight;

  // Example cycling logic
  if (!currentHighlight || currentHighlight === "none") {
    nextHighlight = "#fffbcc"; // Light yellow
  } else if (currentHighlight === "#fffbcc") {
    nextHighlight = "#e0ffe0"; // Light green
  } else if (currentHighlight === "#e0ffe0") {
    nextHighlight = "#ffe0e0"; // Light red
  } else {
    nextHighlight = "none"; // Cycle back to none
  }

  prefs[topicId].highlight = nextHighlight;

  saveStoredPreferences(prefs);
  applyPreferences(); // Re-apply to reflect changes immediately
}

// Export the init function for the manager
export { init };
