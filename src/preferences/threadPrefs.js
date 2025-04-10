// Core logic for managing thread preferences: Pin, Ignore, Highlight
import { gmGetValue, gmSetValue } from "../utils/gmUtils.js";
import { log, error } from "../utils/logger.js";

const PREF_ID = "core_threadPrefs"; // Identifier for logging
const STORAGE_KEY_THREADS = "thread_prefs"; // Key for storing thread preferences

// --- Initialization Function (called by main.js) ---
export function initializeThreadPrefs() {
  const href = window.location.href;
  const pathname = window.location.pathname; // Get the path part of the URL

  // Check if on a list view (forum view or index page)
  const isListView =
    href.includes("viewforum.php") ||
    pathname === "/forums/" ||
    pathname === "/forums/index.php";

  // Check if on a topic view
  const isTopicView =
    href.includes("viewtopic.php?") || href.endsWith("viewtopic.php");

  // Exit if not on a relevant page
  if (!isListView && !isTopicView) {
    return;
  }

  if (isListView) {
    // Apply preferences that affect the list view (Pin, Ignore, Highlight)
    applyListPreferences();
    // Add controls to each thread row initially
    addListControlsToThreads();

    // Set up MutationObserver for dynamic content loading (only on viewforum)
    if (href.includes("viewforum.php")) {
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
          `${PREF_ID}: Could not find topic list container for MutationObserver on viewforum.php.`,
        );
      }
    }
  } else if (isTopicView) {
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
  // More general selector to find rows in both viewforum and index
  // It targets list items with both 'row' and 'topic' classes within any '.forumbg'
  return document.querySelectorAll(".forumbg li.row.topic");
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

// Helper function to create the dropdown trigger button
function createDropdownTrigger(topicId) {
  const button = document.createElement("button"); // Use button for accessibility
  button.title = "Thread Tools";
  button.className =
    "button button-secondary icon-only rpghq-thread-prefs-trigger"; // Use standard phpBB classes + custom one
  button.setAttribute("type", "button"); // Explicitly set type
  button.innerHTML = `
    <i class="icon fa-puzzle-piece fa-fw" aria-hidden="true"></i>
    <span class="sr-only">Thread Preferences</span>
  `;
  button.dataset.topicId = topicId; // Store topicId for easy access

  button.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent default action and bubbling

    // Find the associated dropdown menu using the data attribute
    const associatedDropdown = document.querySelector(
      `.rpghq-thread-prefs-dropdown[data-topic-id="${topicId}"]`,
    );
    if (!associatedDropdown) return;

    const isExpanded = associatedDropdown.style.display === "block";
    associatedDropdown.style.display = isExpanded ? "none" : "block";
    // Optional: Add aria-expanded to the button if needed, although phpBB might handle this via parent classes
    // button.setAttribute('aria-expanded', !isExpanded);
  };

  return button;
}

// Main function to create the whole control set (trigger + dropdown)
function createControlContainer(
  topicId,
  rowElement = null /* li.row or null */,
) {
  const outerContainer = document.createElement("span"); // Inline container for button + dropdown
  outerContainer.className = "rpghq-thread-controls"; // Main identifier
  outerContainer.dataset.topicId = topicId; // Add topic ID for easy reference
  outerContainer.style.position = "relative"; // For dropdown positioning
  outerContainer.style.display = "inline-block";
  outerContainer.style.marginLeft = "5px";
  outerContainer.style.verticalAlign = "middle";

  // 1. Create the trigger button
  const dropdownTrigger = createDropdownTrigger(topicId);
  outerContainer.appendChild(dropdownTrigger);

  // 2. Create the dropdown container itself (mimics phpBB structure)
  const dropdownContainer = document.createElement("div");
  dropdownContainer.className = "dropdown rpghq-thread-prefs-dropdown"; // phpBB class + custom
  dropdownContainer.dataset.topicId = topicId; // Link to trigger
  dropdownContainer.style.display = "none"; // Initially hidden
  dropdownContainer.style.position = "absolute"; // Position relative to outerContainer
  dropdownContainer.style.left = "0"; // Align with trigger
  dropdownContainer.style.top = "100%"; // Position below trigger
  dropdownContainer.style.marginTop = "2px"; // Small gap
  dropdownContainer.style.zIndex = "110"; // Ensure above most elements

  // 3. Add the pointer element (phpBB style)
  const pointerDiv = document.createElement("div");
  pointerDiv.className = "pointer";
  pointerDiv.innerHTML = '<div class="pointer-inner"></div>';
  dropdownContainer.appendChild(pointerDiv);

  // 4. Create the dropdown menu list
  const dropdownMenu = document.createElement("ul");
  dropdownMenu.className = "dropdown-contents"; // Use phpBB class
  dropdownMenu.setAttribute("role", "menu");
  // Remove direct styling - rely on phpBB CSS for .dropdown-contents
  dropdownContainer.appendChild(dropdownMenu);

  // 5. Add the dropdown to the outer container
  outerContainer.appendChild(dropdownContainer);

  // 6. Get current preferences
  const prefs = getStoredPreferences();
  const topicPrefs = prefs[topicId] || {};

  // 7. Populate the initial dropdown items
  updateDropdownItems(topicId, dropdownMenu, rowElement); // Call helper to populate

  // 8. Add listener to close dropdown when clicking outside
  // Store the handler reference to remove it later if the element is destroyed
  const outsideClickListener = (e) => {
    // Check if the click is outside the *outer* container and the dropdown is visible
    if (
      !outerContainer.contains(e.target) &&
      dropdownContainer.style.display === "block"
    ) {
      dropdownContainer.style.display = "none";
      // dropdownTrigger.setAttribute('aria-expanded', 'false');
    }
  };
  document.addEventListener("click", outsideClickListener, true);
  // Optional: Store listener ref on element for cleanup if needed: outerContainer._outsideClickListener = outsideClickListener;

  return outerContainer; // Return the main span containing button and dropdown
}

// --- Update Dropdown Menu Items ---
// This function clears and refills the dropdown menu based on current prefs
function updateDropdownItems(topicId, dropdownMenuElement, rowElement = null) {
  dropdownMenuElement.innerHTML = ""; // Clear existing items

  const prefs = getStoredPreferences();
  const topicPrefs = prefs[topicId] || {}; // Get latest prefs

  // Pin menu item
  dropdownMenuElement.appendChild(
    createMenuItem(
      topicId,
      topicPrefs,
      "pin",
      rowElement,
      dropdownMenuElement, // Pass dropdown menu to handlers
    ),
  );

  // Ignore menu item
  dropdownMenuElement.appendChild(
    createMenuItem(
      topicId,
      topicPrefs,
      "ignore",
      rowElement,
      dropdownMenuElement,
    ),
  );

  // Highlight menu item
  dropdownMenuElement.appendChild(
    createMenuItem(
      topicId,
      topicPrefs,
      "highlight",
      rowElement,
      dropdownMenuElement,
    ),
  );
}

// --- Populate Dropdown Menu Items (Refactored) ---
// Helper function to create individual menu items (<a> tags)
const createMenuItem = (
  topicId,
  topicPrefs,
  actionType, // 'pin', 'ignore', 'highlight'
  rowElement,
  dropdownMenuElement, // Pass the UL element
) => {
  const li = document.createElement("li");
  const link = document.createElement("a");
  link.href = "#"; // Prevent navigation
  link.title = ""; // Set specific title below
  link.style.cursor = "pointer"; // Ensure pointer cursor

  const icon = document.createElement("i");
  icon.setAttribute("aria-hidden", "true");
  icon.className = "icon fa-fw"; // Base classes

  const textSpan = document.createElement("span");

  let isDisabled = false;
  let clickHandler = () => {};

  // Configure based on actionType
  switch (actionType) {
    case "pin":
      icon.classList.add(topicPrefs.pinned ? "fa-thumb-tack" : "fa-thumb-tack"); // Using same icon, style might change if pinned
      textSpan.textContent = topicPrefs.pinned ? " Unpin" : " Pin";
      link.title = topicPrefs.pinned
        ? "Remove from pinned list"
        : "Pin thread to top of list";
      if (topicPrefs.ignored) {
        isDisabled = true; // Disable Pin if Ignored
        link.title += " (Disabled while ignored)";
      }
      // Pass dropdownMenuElement to the handler
      clickHandler = () =>
        handlePinToggle(topicId, rowElement, dropdownMenuElement);
      break;
    case "ignore":
      icon.classList.add(topicPrefs.ignored ? "fa-eye-slash" : "fa-eye");
      textSpan.textContent = topicPrefs.ignored ? " Unignore" : " Ignore";
      link.title = topicPrefs.ignored
        ? "Stop ignoring this thread"
        : "Hide this thread from lists";
      if (topicPrefs.pinned) {
        isDisabled = true; // Disable Ignore if Pinned
        link.title += " (Disabled while pinned)";
      }
      // Pass dropdownMenuElement to the handler
      clickHandler = () =>
        handleIgnoreToggle(topicId, rowElement, dropdownMenuElement);
      break;
    case "highlight":
      icon.classList.add("fa-paint-brush");
      textSpan.textContent = " Highlight";
      link.title = "Cycle highlight color for this thread";
      // Highlight is never disabled by pin/ignore
      // Pass dropdownMenuElement to the handler
      clickHandler = () =>
        handleHighlight(topicId, rowElement, dropdownMenuElement);
      break;
  }

  link.appendChild(icon);
  link.appendChild(textSpan);

  // Apply disabled state
  if (isDisabled) {
    li.classList.add("disabled"); // Add class for styling
    link.style.opacity = "0.5"; // Dim the link
    link.style.pointerEvents = "none"; // Prevent clicks
    link.removeAttribute("href"); // Remove href for disabled state
    // Add specific class for disabled items based on phpBB structure if needed
    // Example: li.classList.add('disabled-option');
  } else {
    // Attach click handler only if not disabled
    link.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation(); // Stop propagation
      clickHandler(); // Call the specific handler
      // Close the dropdown after clicking an action
      const dropdownContainer = dropdownMenuElement.closest(
        ".rpghq-thread-prefs-dropdown",
      );
      if (dropdownContainer) {
        dropdownContainer.style.display = "none";
      }
    };
  }

  li.appendChild(link);
  return li;
};

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

// Modified handler: Accepts dropdownMenuElement to update it
function handlePinToggle(topicId, rowElement, dropdownMenuElement) {
  const prefs = getOrCreateTopicPrefs(topicId, rowElement);
  const currentPrefs = prefs[topicId];

  // Toggle pin status
  currentPrefs.pinned = !currentPrefs.pinned;
  // If pinning, ensure ignore is false (mutual exclusion)
  if (currentPrefs.pinned) {
    currentPrefs.ignored = false;
  }

  log(`${PREF_ID}: Topic ${topicId} pin status set to ${currentPrefs.pinned}`);

  saveStoredPreferences(prefs);

  // Update the dropdown items immediately to reflect the new state
  if (dropdownMenuElement) {
    updateDropdownItems(topicId, dropdownMenuElement, rowElement);
  }

  // Re-apply page view changes (pinning order and ignore visibility)
  if (window.location.href.includes("viewforum.php")) {
    applyPinning(); // Re-apply pinning order
    // Re-apply ignore/highlight to the specific row if possible
    if (rowElement) {
      const latestPrefs = getStoredPreferences(); // Get fresh prefs after potential ignore change
      applyPreferencesToSingleRow(rowElement, topicId, latestPrefs);
    } else {
      // Fallback to full list refresh if row isn't available (less likely here)
      applyListPreferences();
    }
  }
}

// Modified handler: Accepts dropdownMenuElement to update it
function handleIgnoreToggle(topicId, rowElement, dropdownMenuElement) {
  const prefs = getOrCreateTopicPrefs(topicId, rowElement);
  const currentPrefs = prefs[topicId];

  // Toggle ignore status
  currentPrefs.ignored = !currentPrefs.ignored;
  // If ignoring, ensure pin is false (mutual exclusion)
  if (currentPrefs.ignored) {
    currentPrefs.pinned = false;
  }

  log(
    `${PREF_ID}: Topic ${topicId} ignore status set to ${currentPrefs.ignored}`,
  );

  saveStoredPreferences(prefs);

  // Update the dropdown items immediately
  if (dropdownMenuElement) {
    updateDropdownItems(topicId, dropdownMenuElement, rowElement);
  }

  // Re-apply page view changes (pinning order and ignore visibility)
  if (window.location.href.includes("viewforum.php")) {
    // Re-apply ignore/highlight first
    if (rowElement) {
      const latestPrefs = getStoredPreferences(); // Get fresh prefs
      applyPreferencesToSingleRow(rowElement, topicId, latestPrefs);
    } else {
      applyListPreferences(); // Fallback
    }
    applyPinning(); // Re-apply pinning as ignore might have unpinned
  }
}

// Modified handler: Accepts dropdownMenuElement to update it
function handleHighlight(topicId, rowElement, dropdownMenuElement) {
  const prefs = getOrCreateTopicPrefs(topicId, rowElement);
  const currentPrefs = prefs[topicId];

  const currentHighlight = currentPrefs.highlight || "none"; // Default if undefined
  let nextHighlight;

  // Basic cycling implementation (TODO: Improve with picker/presets)
  const highlightColors = ["none", "#fffbcc", "#e0ffe0", "#ffe0e0"]; // Consider theme vars
  const currentIndex = highlightColors.indexOf(currentHighlight);
  nextHighlight = highlightColors[(currentIndex + 1) % highlightColors.length];

  currentPrefs.highlight = nextHighlight;
  log(
    `${PREF_ID}: Topic ${topicId} highlight set to ${currentPrefs.highlight}`,
  );

  saveStoredPreferences(prefs);

  // Update the dropdown items immediately (though highlight doesn't change text/disabled state)
  if (dropdownMenuElement) {
    updateDropdownItems(topicId, dropdownMenuElement, rowElement);
  }

  // Re-apply only if on the list view where background color matters
  if (window.location.href.includes("viewforum.php")) {
    // Apply directly to the row if provided
    if (rowElement) {
      const latestPrefs = getStoredPreferences(); // Get latest prefs
      applyPreferencesToSingleRow(rowElement, topicId, latestPrefs);
    } else {
      applyListPreferences(); // Full rescan if row element isn't available
    }
  } else if (window.location.href.includes("viewtopic.php")) {
    // Apply highlight to the rowElement if provided (viewforum)
    // or find the relevant element to highlight on viewtopic if needed
    // Currently, this doesn't apply visual highlight on viewtopic page itself
    // if (rowElement) { ... }
  }
}

// No need to export init anymore
