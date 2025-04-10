// Core logic for managing thread preferences: Pin, Ignore, Highlight
import { gmGetValue, gmSetValue } from "../utils/gmUtils.js";
import { log, error } from "../utils/logger.js";

const PREF_ID = "core_threadPrefs"; // Identifier for logging
const STORAGE_KEY_THREADS = "thread_prefs"; // Key for storing thread preferences

// --- Initialization Function (called by main.js) ---
export function initializeThreadPrefs() {
  log(`${PREF_ID}: Initializing...`);

  const isOnViewForum = window.location.href.includes("viewforum.php");
  const isOnViewTopic = window.location.href.includes("viewtopic.php");

  if (!isOnViewForum && !isOnViewTopic) {
    log(`${PREF_ID}: Not on a relevant page, exiting.`);
    return; // Do nothing if not on viewforum or viewtopic
  }

  if (isOnViewForum) {
    // Apply preferences that affect the list view (Pin, Ignore, Highlight)
    applyListPreferences();
    // Add controls to each thread row initially
    addListControlsToThreads();

    // Set up MutationObserver for dynamic content loading
    const topicListContainer = document.querySelector(
      ".forumbg .topiclist.topics",
    ); // Target the specific list
    if (topicListContainer) {
      log(`${PREF_ID}: Setting up MutationObserver for topic list.`);
      const observer = new MutationObserver(handleMutations);
      observer.observe(topicListContainer, {
        childList: true, // Watch for added/removed child nodes (li.row)
        subtree: false, // No need to watch deeper than the direct children (li elements)
      });
    } else {
      error(
        `${PREF_ID}: Could not find topic list container for MutationObserver.`,
      );
    }
  } else if (isOnViewTopic) {
    // Add controls to the topic action bar
    addTopicControls();
    // Potentially apply highlight to the topic itself if desired in the future
  }

  log(`${PREF_ID}: Initialized successfully.`);

  // No cleanup function needed here as it's core functionality
}

// Mutation Observer Callback for ViewForum
function handleMutations(mutationsList, observer) {
  log(`${PREF_ID}: MutationObserver detected changes in topic list.`);
  let needsReapply = false;

  for (const mutation of mutationsList) {
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
      log(`${PREF_ID}: Nodes added to the list.`);
      mutation.addedNodes.forEach((node) => {
        // Check if the added node is a thread row element
        if (node.nodeType === Node.ELEMENT_NODE && node.matches("li.row")) {
          log(`${PREF_ID}: Processing added row:`, node);
          // Add controls if they don't exist
          if (!node.querySelector(".rpghq-thread-controls")) {
            const topicId = getTopicId(node);
            if (topicId) {
              addControlsToSingleThread(node, topicId); // Add controls
              applyPreferencesToSingleRow(node, topicId); // Apply ignore/highlight
              needsReapply = true; // Mark that pinning might need recalculation
            } else {
              log(`${PREF_ID}: Could not get topic ID for added row.`, node);
            }
          } else {
            log(`${PREF_ID}: Controls already exist on added row.`, node);
          }
        }
      });
    }
  }

  // If rows were added, re-apply pinning as order might change
  if (needsReapply) {
    log(`${PREF_ID}: Re-applying pinning due to added rows.`);
    applyPinning(); // Separated pinning logic
  }
}

// --- Helper Functions ---

// Renamed and updated to get ID from row or URL
function getTopicId(element = null) {
  // Try from row element first (viewforum)
  if (element) {
    const topicLink = element.querySelector("a.topictitle");
    if (topicLink && topicLink.href) {
      const match = topicLink.href.match(/t=(\d+)/);
      if (match && match[1]) {
        return match[1];
      }
    }
  }

  // If not found in element, try from URL (viewtopic)
  const urlMatch = window.location.href.match(/[?&]t=(\d+)/);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }

  log(`${PREF_ID}: Could not determine Topic ID.`);
  return null;
}

function getStoredPreferences() {
  return gmGetValue(STORAGE_KEY_THREADS, {});
}

function saveStoredPreferences(prefs) {
  gmSetValue(STORAGE_KEY_THREADS, prefs);
}

function getThreadRowElements() {
  // Selector for viewforum page
  return document.querySelectorAll(".forumbg ul.topiclist.topics li.row"); // More specific selector
}

// --- Core Logic for ViewForum ---

// Renamed from applyPreferences - separated pinning
function applyListPreferences() {
  log(`${PREF_ID}: Applying list preferences (Ignore/Highlight)...`);
  const prefs = getStoredPreferences();
  const rows = getThreadRowElements();

  rows.forEach((row) => {
    const topicId = getTopicId(row); // Pass the row element
    applyPreferencesToSingleRow(row, topicId, prefs); // Use helper
  });

  applyPinning(prefs); // Apply pinning separately

  log(`${PREF_ID}: List preferences applied.`);
}

// Helper to apply ignore/highlight to a single row
function applyPreferencesToSingleRow(row, topicId, prefs = null) {
  if (!topicId) return; // Need topic ID
  if (!prefs) prefs = getStoredPreferences(); // Get prefs if not passed
  if (!prefs[topicId]) return; // Skip if no prefs for this topic

  const topicPrefs = prefs[topicId];

  // Apply Ignore
  if (topicPrefs.ignored) {
    row.style.display = "none";
    // log(`${PREF_ID}: Ignoring topic ${topicId} (single row)`);
  } else {
    row.style.display = ""; // Ensure it's visible if not ignored
  }

  // Apply Highlight
  if (topicPrefs.highlight && topicPrefs.highlight !== "none") {
    row.style.backgroundColor = topicPrefs.highlight;
    // log(`${PREF_ID}: Highlighting topic ${topicId} with ${topicPrefs.highlight} (single row)`);
  } else {
    row.style.backgroundColor = ""; // Remove background if no highlight
  }
}

// Helper to apply pinning logic
function applyPinning(prefs = null) {
  log(`${PREF_ID}: Applying pinning...`);
  if (!prefs) prefs = getStoredPreferences(); // Get prefs if not passed

  const rows = getThreadRowElements();
  const pinnedRows = [];

  rows.forEach((row) => {
    const topicId = getTopicId(row);
    if (topicId && prefs[topicId] && prefs[topicId].pinned) {
      pinnedRows.push(row);
      // log(`${PREF_ID}: Marking topic ${topicId} for pinning`);
    }
  });

  // Apply Pin (move pinned rows to the top on viewforum)
  if (pinnedRows.length > 0) {
    const topicList = document.querySelector(".forumbg ul.topiclist.topics");
    if (topicList) {
      const headerRow = topicList.querySelector("li.header");
      if (headerRow) {
        // Move pinned rows to the top, preserving their relative order among themselves
        pinnedRows.reverse().forEach((row) => {
          // Reverse to insert in correct order
          topicList.insertBefore(row, headerRow.nextSibling); // Insert after header
        });
        log(`${PREF_ID}: Moved ${pinnedRows.length} pinned topics to top.`);
      } else {
        error(`${PREF_ID}: Could not find header row in topic list.`);
      }
    } else {
      error(
        `${PREF_ID}: Could not find topic list container to move pinned threads.`,
      );
    }
  }
}

// Renamed from addControlsToThreads
function addListControlsToThreads() {
  log(`${PREF_ID}: Adding list controls to threads...`);
  const rows = getThreadRowElements();

  rows.forEach((row) => {
    const topicId = getTopicId(row);
    if (!topicId) return;

    addControlsToSingleThread(row, topicId);
  });
  log(`${PREF_ID}: List controls added.`);
}

// Helper to add controls to a single thread row
function addControlsToSingleThread(row, topicId) {
  // Prevent adding controls multiple times
  if (row.querySelector(".rpghq-thread-controls")) return;

  const controlContainer = createControlContainer(topicId, row);

  // Add container to a suitable place in the row (e.g., after topic title)
  const topicTitleElement = row.querySelector("a.topictitle");
  if (topicTitleElement && topicTitleElement.parentElement) {
    // Insert after the topic title link itself
    topicTitleElement.parentElement.insertBefore(
      controlContainer,
      topicTitleElement.nextSibling,
    );
  } else {
    // Fallback: append to the first <dt> which usually contains the title
    const firstDt = row.querySelector("dl > dt");
    if (firstDt) {
      firstDt.appendChild(controlContainer);
    } else {
      error(
        `${PREF_ID}: Could not find suitable location for controls in row for topic ${topicId}`,
      );
    }
  }
}

// --- Core Logic for ViewTopic ---
function addTopicControls() {
  log(`${PREF_ID}: Adding controls to topic view...`);
  const topicId = getTopicId(); // Get ID from URL
  if (!topicId) return;

  const actionBar = document.querySelector(".action-bar.bar-top"); // Target the top action bar
  if (!actionBar) {
    error(`${PREF_ID}: Could not find action bar on topic page.`);
    return;
  }

  // Prevent adding controls multiple times
  if (actionBar.querySelector(".rpghq-thread-controls")) return;

  const controlContainer = createControlContainer(topicId);
  controlContainer.style.display = "inline-block"; // Adjust styling for action bar
  controlContainer.style.marginLeft = "5px";
  controlContainer.style.verticalAlign = "middle";

  // Insert into action bar, perhaps before the Post Reply button?
  const postReplyButton = actionBar.querySelector(
    'a[href*="posting.php?mode=reply"]',
  );
  if (postReplyButton) {
    actionBar.insertBefore(controlContainer, postReplyButton);
  } else {
    actionBar.appendChild(controlContainer); // Fallback placement
  }

  log(`${PREF_ID}: Topic controls added.`);
}

// --- Shared Control Creation ---
function createControlContainer(topicId, rowElement = null) {
  const controlContainer = document.createElement("span");
  controlContainer.className = "rpghq-thread-controls";
  controlContainer.style.marginLeft = "5px"; // Consistent basic styling
  controlContainer.style.fontSize = "0.9em"; // Make buttons slightly smaller

  // Get current preferences to set initial button states if needed (e.g., show Unpin/Unignore)
  const prefs = getStoredPreferences();
  const topicPrefs = prefs[topicId] || {};

  // Pin button
  const pinButton = document.createElement("button");
  pinButton.textContent = topicPrefs.pinned ? "Unpin" : "Pin";
  pinButton.title = topicPrefs.pinned
    ? "Remove from pinned list"
    : "Pin thread to top of list";
  pinButton.onclick = (e) => {
    e.preventDefault(); // Prevent link navigation if controls are inside <a>
    handlePinToggle(topicId, rowElement);
    // Update button text immediately
    pinButton.textContent = !topicPrefs.pinned ? "Unpin" : "Pin";
    pinButton.title = !topicPrefs.pinned
      ? "Remove from pinned list"
      : "Pin thread to top of list";
  };
  styleControlButton(pinButton);
  controlContainer.appendChild(pinButton);

  // Ignore button
  const ignoreButton = document.createElement("button");
  ignoreButton.textContent = topicPrefs.ignored ? "Unignore" : "Ignore";
  ignoreButton.title = topicPrefs.ignored
    ? "Stop ignoring this thread"
    : "Hide this thread from lists";
  ignoreButton.onclick = (e) => {
    e.preventDefault();
    handleIgnoreToggle(topicId, rowElement);
    // Update button text immediately
    ignoreButton.textContent = !topicPrefs.ignored ? "Unignore" : "Ignore";
    ignoreButton.title = !topicPrefs.ignored
      ? "Stop ignoring this thread"
      : "Hide this thread from lists";
  };
  styleControlButton(ignoreButton);
  controlContainer.appendChild(ignoreButton);

  // Highlight button
  const highlightButton = document.createElement("button");
  highlightButton.textContent = "Highlight";
  highlightButton.title = "Cycle highlight color for this thread";
  highlightButton.onclick = (e) => {
    e.preventDefault();
    handleHighlight(topicId, rowElement);
    // No immediate text update needed unless showing current color
  };
  styleControlButton(highlightButton);
  controlContainer.appendChild(highlightButton);

  return controlContainer;
}

function styleControlButton(button) {
  // Basic styling to make them less intrusive than default buttons
  button.style.marginLeft = "3px";
  button.style.padding = "2px 5px";
  button.style.fontSize = "inherit";
  button.style.border = "1px solid #ccc";
  button.style.background = "#f0f0f0";
  button.style.cursor = "pointer";
  button.style.borderRadius = "3px";
}

// --- Event Handlers (Shared) ---
function handlePinToggle(topicId, rowElement) {
  log(`${PREF_ID}: Toggling Pin for topic ${topicId}`);
  const prefs = getStoredPreferences();
  if (!prefs[topicId]) prefs[topicId] = {};

  prefs[topicId].pinned = !prefs[topicId].pinned;

  saveStoredPreferences(prefs);

  // Re-apply only if on the list view where visual order matters
  if (window.location.href.includes("viewforum.php")) {
    applyPinning(); // Only re-apply pinning, not all list prefs
  }
}

function handleIgnoreToggle(topicId, rowElement) {
  log(`${PREF_ID}: Toggling Ignore for topic ${topicId}`);
  const prefs = getStoredPreferences();
  if (!prefs[topicId]) prefs[topicId] = {};

  prefs[topicId].ignored = !prefs[topicId].ignored;

  saveStoredPreferences(prefs);

  // Re-apply only if on the list view where visibility matters
  if (window.location.href.includes("viewforum.php")) {
    // Apply directly to the row if provided, otherwise re-scan
    if (rowElement) {
      const prefs = getStoredPreferences(); // Get latest prefs
      applyPreferencesToSingleRow(rowElement, topicId, prefs);
    } else {
      applyListPreferences(); // Full rescan if row element isn't available
    }
  }
}

function handleHighlight(topicId, rowElement) {
  log(`${PREF_ID}: Handling Highlight for topic ${topicId}`);
  const prefs = getStoredPreferences();
  if (!prefs[topicId]) prefs[topicId] = {};

  const currentHighlight = prefs[topicId].highlight;
  let nextHighlight;

  // Basic cycling implementation (TODO: Improve with picker/presets)
  const highlightColors = ["none", "#fffbcc", "#e0ffe0", "#ffe0e0"];
  const currentIndex = highlightColors.indexOf(currentHighlight);
  nextHighlight = highlightColors[(currentIndex + 1) % highlightColors.length];

  prefs[topicId].highlight = nextHighlight;

  saveStoredPreferences(prefs);

  // Re-apply only if on the list view where background color matters
  if (window.location.href.includes("viewforum.php")) {
    // Apply directly to the row if provided
    if (rowElement) {
      const prefs = getStoredPreferences(); // Get latest prefs
      applyPreferencesToSingleRow(rowElement, topicId, prefs);
    } else {
      applyListPreferences(); // Full rescan if row element isn't available
    }
  } else if (window.location.href.includes("viewtopic.php")) {
    // Apply highlight to the rowElement if provided (viewforum)
    // or find the relevant element to highlight on viewtopic if needed
    if (rowElement) {
      // This condition might be redundant if only called from viewforum context in this handler
      rowElement.style.backgroundColor =
        nextHighlight === "none" ? "" : nextHighlight;
    }
    // Potentially highlight topic title or background on viewtopic itself?
  }
}

// No need to export init anymore
