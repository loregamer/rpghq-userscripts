// Core logic for managing thread preferences: Pin, Ignore, Highlight
import { gmGetValue, gmSetValue } from "../utils/gmUtils.js";
import { log, error } from "../utils/logger.js";

const PREF_ID = "core_threadPrefs"; // Identifier for logging
const STORAGE_KEY_THREADS = "thread_prefs"; // Key for storing thread preferences

// --- Initialization Function (called by main.js) ---
export function initializeThreadPrefs() {
  const href = window.location.href;
  const isOnViewForum = href.includes("viewforum.php");
  // More specific check for viewtopic, ensuring it's the file name with parameters
  const isOnViewTopic =
    href.includes("viewtopic.php?") || href.endsWith("viewtopic.php");

  if (!isOnViewForum && !isOnViewTopic) {
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

  // No cleanup function needed here as it's core functionality
}

// Mutation Observer Callback for ViewForum
function handleMutations(mutationsList, observer) {
  let needsReapply = false;

  for (const mutation of mutationsList) {
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach((node) => {
        // Check if the added node is a thread row element
        if (node.nodeType === Node.ELEMENT_NODE && node.matches("li.row")) {
          // Add controls if they don't exist
          if (!node.querySelector(".rpghq-thread-controls")) {
            const topicId = getTopicId(node);
            if (topicId) {
              addControlsToSingleThread(node, topicId); // Add controls
              applyPreferencesToSingleRow(node, topicId); // Apply ignore/highlight
              needsReapply = true; // Mark that pinning might need recalculation
            } else {
            }
          } else {
          }
        }
      });
    }
  }

  // If rows were added, re-apply pinning as order might change
  if (needsReapply) {
    applyPinning(); // Separated pinning logic
  }
}

// --- Helper Functions ---

// Get Topic ID from row element (viewforum) or URL (viewtopic)
function getTopicId(element = null /* li.row or null */) {
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

  return null;
}

// Get Topic Title from row element or page title
function getTopicTitle(element = null /* li.row or null */) {
  // Try from row element first (viewforum)
  if (element) {
    const topicLink = element.querySelector("a.topictitle");
    if (topicLink) {
      return topicLink.textContent.trim();
    }
  }

  // Fallback to document title (viewtopic)
  // Often looks like "View topic - Forum Name - Topic Title"
  const titleParts = document.title.split(" - ");
  if (titleParts.length >= 3) {
    return titleParts[titleParts.length - 1].trim(); // Get the last part
  }

  return "Unknown Title"; // Provide a default
}

// Get Topic Section/Forum Name from breadcrumbs
function getTopicSection() {
  const breadcrumbLinks = document.querySelectorAll(".breadcrumbs .crumb a");
  if (breadcrumbLinks.length >= 2) {
    // Usually the second-to-last link is the specific forum
    return breadcrumbLinks[breadcrumbLinks.length - 1].textContent.trim();
  }

  return "Unknown Section"; // Provide a default
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
  const prefs = getStoredPreferences();
  const rows = getThreadRowElements();

  rows.forEach((row) => {
    const topicId = getTopicId(row); // Pass the row element
    applyPreferencesToSingleRow(row, topicId, prefs); // Use helper
  });

  applyPinning(prefs); // Apply pinning separately
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
    //
  } else {
    row.style.display = ""; // Ensure it's visible if not ignored
  }

  // Apply Highlight
  if (topicPrefs.highlight && topicPrefs.highlight !== "none") {
    row.style.backgroundColor = topicPrefs.highlight;
    //
  } else {
    row.style.backgroundColor = ""; // Remove background if no highlight
  }
}

// Helper to apply pinning logic
function applyPinning(prefs = null) {
  if (!prefs) prefs = getStoredPreferences(); // Get prefs if not passed

  const rows = getThreadRowElements();
  const pinnedRows = [];

  rows.forEach((row) => {
    const topicId = getTopicId(row);
    if (topicId && prefs[topicId] && prefs[topicId].pinned) {
      pinnedRows.push(row);
      //
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
  const rows = getThreadRowElements();

  rows.forEach((row) => {
    const topicId = getTopicId(row);
    if (!topicId) return;

    addControlsToSingleThread(row, topicId);
  });
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
}

// --- Shared Control Creation (Dropdown) ---
function createControlContainer(
  topicId,
  rowElement = null /* li.row or null */,
) {
  const controlContainer = document.createElement("div"); // Use div for easier dropdown structure
  controlContainer.className = "rpghq-thread-controls rpghq-dropdown"; // Add dropdown class
  controlContainer.style.position = "relative"; // Needed for dropdown positioning
  controlContainer.style.display = "inline-block"; // Keep it inline
  controlContainer.style.marginLeft = "5px";
  controlContainer.style.verticalAlign = "middle"; // Align with surrounding text/buttons

  // Get current preferences to set initial button states if needed (e.g., show Unpin/Unignore)
  const prefs = getStoredPreferences();
  const topicPrefs = prefs[topicId] || {};

  // Create the main button that opens the dropdown using phpBB style
  const dropdownButton = document.createElement("span");
  dropdownButton.title = "Thread Tools";
  dropdownButton.className =
    "button button-secondary dropdown-trigger dropdown-select dropdown-toggle rpghq-dropdown-toggle"; // Added our class too
  dropdownButton.innerHTML = `
			<i class="icon fa-wrench fa-fw" aria-hidden="true"></i>
			<span class="caret"><i class="icon fa-sort-down fa-fw" aria-hidden="true"></i></span>
		`;
  // Remove direct styling as phpBB classes should handle it
  // styleControlButton(dropdownButton); // Remove this line
  dropdownButton.setAttribute("aria-haspopup", "true");
  dropdownButton.setAttribute("aria-expanded", "false");
  controlContainer.appendChild(dropdownButton);

  // Create the dropdown menu itself (no change here)
  const dropdownMenu = document.createElement("ul");
  dropdownMenu.className = "rpghq-dropdown-menu";
  dropdownMenu.setAttribute("role", "menu");
  // Basic dropdown styling (can be enhanced in CSS)
  dropdownMenu.style.position = "absolute";
  dropdownMenu.style.top = "100%";
  dropdownMenu.style.left = "0";
  dropdownMenu.style.backgroundColor = "var(--rpghq-modal-bg-color, white)"; // Use theme variable
  dropdownMenu.style.border = "1px solid #ccc";
  dropdownMenu.style.borderRadius = "3px";
  dropdownMenu.style.padding = "5px 0";
  dropdownMenu.style.margin = "2px 0 0";
  dropdownMenu.style.zIndex = "100"; // Ensure it's above other content
  dropdownMenu.style.minWidth = "120px";
  dropdownMenu.style.listStyle = "none";
  dropdownMenu.style.display = "none"; // Initially hidden
  controlContainer.appendChild(dropdownMenu);

  // Toggle dropdown visibility
  dropdownButton.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent clicks from closing it immediately
    const isExpanded = dropdownMenu.style.display === "block";
    dropdownMenu.style.display = isExpanded ? "none" : "block";
    dropdownButton.setAttribute("aria-expanded", !isExpanded);
  };

  // Close dropdown when clicking outside
  document.addEventListener(
    "click",
    (e) => {
      if (!controlContainer.contains(e.target)) {
        dropdownMenu.style.display = "none";
        dropdownButton.setAttribute("aria-expanded", "false");
      }
    },
    true, // Use capture phase to catch clicks early
  );

  // --- Populate Dropdown Menu Items ---
  // Helper function to create menu items
  const createMenuItem = (text, title, onClickHandler) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.textContent = text;
    button.title = title;
    button.style.display = "block";
    button.style.width = "100%";
    button.style.padding = "4px 10px";
    button.style.border = "none";
    button.style.background = "none";
    button.style.textAlign = "left";
    button.style.cursor = "pointer";
    button.style.fontSize = "inherit"; // Inherit font size
    button.style.color = "var(--rpghq-text-color, black)"; // Use theme variable

    button.onmouseover = () =>
      (button.style.backgroundColor = "var(--rpghq-hover-bg-color, #eee)");
    button.onmouseout = () => (button.style.backgroundColor = "transparent");

    button.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      onClickHandler();
      dropdownMenu.style.display = "none"; // Close menu after action
      dropdownButton.setAttribute("aria-expanded", "false");
    };
    li.appendChild(button);
    return li;
  };

  // Pin menu item
  dropdownMenu.appendChild(
    createMenuItem(
      topicPrefs.pinned ? "Unpin" : "Pin",
      topicPrefs.pinned
        ? "Remove from pinned list"
        : "Pin thread to top of list",
      () => handlePinToggle(topicId, rowElement),
    ),
  );

  // Ignore menu item
  dropdownMenu.appendChild(
    createMenuItem(
      topicPrefs.ignored ? "Unignore" : "Ignore",
      topicPrefs.ignored
        ? "Stop ignoring this thread"
        : "Hide this thread from lists",
      () => handleIgnoreToggle(topicId, rowElement),
    ),
  );

  // Highlight menu item
  dropdownMenu.appendChild(
    createMenuItem(
      "Highlight", // Could add current color indicator later
      "Cycle highlight color for this thread",
      () => handleHighlight(topicId, rowElement),
    ),
  );

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

// Helper to get or create preference object, including title and section
function getOrCreateTopicPrefs(topicId, rowElement = null) {
  const prefs = getStoredPreferences();
  if (!prefs[topicId]) {
    // If creating, grab title and section
    const title = getTopicTitle(rowElement);
    const section = getTopicSection(); // Section depends on current page
    prefs[topicId] = {
      pinned: false,
      ignored: false,
      highlight: "none",
      title: title,
      section: section,
    };
    log(
      `${PREF_ID}: Created initial prefs for ${topicId}: Title='${title}', Section='${section}'`,
    );
  } else {
    // Ensure title and section are present, update if necessary (e.g., if they were added later)
    if (!prefs[topicId].title || prefs[topicId].title === "Unknown Title") {
      prefs[topicId].title = getTopicTitle(rowElement);
    }
    if (
      !prefs[topicId].section ||
      prefs[topicId].section === "Unknown Section"
    ) {
      prefs[topicId].section = getTopicSection();
    }
  }
  return prefs;
}
function handlePinToggle(topicId, rowElement) {
  const prefs = getOrCreateTopicPrefs(topicId, rowElement);

  prefs[topicId].pinned = !prefs[topicId].pinned;
  log(
    `${PREF_ID}: Topic ${topicId} pin status set to ${prefs[topicId].pinned}`,
  );

  saveStoredPreferences(prefs);

  // Re-apply only if on the list view where visual order matters
  if (window.location.href.includes("viewforum.php")) {
    applyPinning(); // Only re-apply pinning, not all list prefs
  }
}

function handleIgnoreToggle(topicId, rowElement) {
  const prefs = getOrCreateTopicPrefs(topicId, rowElement);

  prefs[topicId].ignored = !prefs[topicId].ignored;
  log(
    `${PREF_ID}: Topic ${topicId} ignore status set to ${prefs[topicId].ignored}`,
  );

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
  const prefs = getOrCreateTopicPrefs(topicId, rowElement);

  const currentHighlight = prefs[topicId].highlight || "none"; // Default if undefined
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
