/**
 * Renders the "Threads" subtab content within the Forum Preferences tab,
 * allowing users to view and manage ignored and highlighted threads.
 *
 * @param {HTMLElement} container - The container element to render into
 */
import { log } from "../../../utils/logger.js";
import { gmGetValue, gmSetValue } from "../../../utils/gmUtils.js";

const STORAGE_KEY_THREADS = "thread_prefs"; // Key for storing thread preferences

// Function to render the list of managed threads
function renderManagedThreadsList(listContainer) {
  const prefs = gmGetValue(STORAGE_KEY_THREADS, {});
  const managedThreads = Object.entries(prefs)
    .map(([topicId, topicPrefs]) => ({ topicId, ...topicPrefs }))
    .filter((p) => p.ignored || (p.highlight && p.highlight !== "none"));

  listContainer.innerHTML = ""; // Clear previous list

  if (managedThreads.length === 0) {
    listContainer.innerHTML =
      '<p class="info-note">No threads are currently ignored or highlighted.</p>';
    return;
  }

  const ul = document.createElement("ul");
  ul.className = "managed-threads-list";

  managedThreads.forEach((thread) => {
    const li = document.createElement("li");
    li.className = "managed-thread-item";

    let statusText = "";
    let actionButton = null;

    if (thread.ignored) {
      statusText = "Ignored";
      actionButton = document.createElement("button");
      actionButton.textContent = "Remove Ignore";
      actionButton.onclick = () =>
        handleRemoveIgnore(thread.topicId, listContainer);
    } else if (thread.highlight && thread.highlight !== "none") {
      statusText = `Highlighted (<span style="background-color: ${thread.highlight}; padding: 1px 3px; border: 1px solid #ccc;">Color</span>)`;
      actionButton = document.createElement("button");
      actionButton.textContent = "Remove Highlight";
      actionButton.onclick = () =>
        handleRemoveHighlight(thread.topicId, listContainer);
    }

    // Basic styling for the button
    if (actionButton) {
      actionButton.style.marginLeft = "10px";
      actionButton.style.padding = "2px 5px";
      actionButton.style.fontSize = "0.9em";
      actionButton.style.cursor = "pointer";
    }

    li.innerHTML = `
      <span class="managed-thread-id">Topic ID: ${thread.topicId}</span>
      <span class="managed-thread-status">- ${statusText}</span>
    `;
    if (actionButton) {
      li.appendChild(actionButton);
    }

    ul.appendChild(li);
  });

  listContainer.appendChild(ul);
}

// Handler to remove the 'ignored' status
function handleRemoveIgnore(topicId, listContainer) {
  const prefs = gmGetValue(STORAGE_KEY_THREADS, {});
  if (prefs[topicId]) {
    prefs[topicId].ignored = false;
    // Clean up the entry if no other prefs exist
    if (
      !prefs[topicId].pinned &&
      (!prefs[topicId].highlight || prefs[topicId].highlight === "none")
    ) {
      delete prefs[topicId];
    } else {
      // Explicitly ensure ignored is false if other prefs exist
      prefs[topicId].ignored = false;
    }
    gmSetValue(STORAGE_KEY_THREADS, prefs);
    renderManagedThreadsList(listContainer); // Re-render the list
  } else {
  }
}

// Handler to remove the 'highlight' status
function handleRemoveHighlight(topicId, listContainer) {
  const prefs = gmGetValue(STORAGE_KEY_THREADS, {});
  if (prefs[topicId]) {
    prefs[topicId].highlight = "none";
    // Clean up the entry if no other prefs exist
    if (!prefs[topicId].pinned && !prefs[topicId].ignored) {
      delete prefs[topicId];
    }
    gmSetValue(STORAGE_KEY_THREADS, prefs);
    renderManagedThreadsList(listContainer); // Re-render the list
  } else {
  }
}

// Main function to render the subtab
export function renderThreadsSubtab(container) {
  container.innerHTML = `
    <div class="preferences-section">
      <div class="preferences-section-header">
        <h3 class="preferences-section-title">Managed Threads</h3>
      </div>
      <div class="preferences-section-body" id="managed-threads-list-container">
        <!-- List will be rendered here -->
      </div>
    </div>
    <div class="info-note">
      <strong>Note:</strong> This section shows threads you've ignored or highlighted using the controls on forum/topic pages. 
      Pinned threads are managed automatically and not listed here. Topic titles will be added in a future update.
    </div>
  `;

  const listContainer = container.querySelector(
    "#managed-threads-list-container",
  );
  if (listContainer) {
    renderManagedThreadsList(listContainer);
  }
}
