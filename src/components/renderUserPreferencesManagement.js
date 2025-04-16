// import { GM_setValue, GM_getValue } from "$common"; // Use global GM_ functions instead
import { log, error } from "../utils/logger.js";

// Storage key for user preferences
const STORAGE_KEY = "RPGHQ_Manager_user_preferences";

/**
 * Fetches member search results and displays them.
 * @param {string} query - The search query.
 * @param {HTMLElement} resultsContainer - The container to display results in.
 * @param {HTMLElement} listContainer - The main list container (to pass to addUserPreference).
 */
async function searchMembersAndDisplay(query, resultsContainer, listContainer) {
  log(`Fetching members for query: ${query}`);
  try {
    const response = await fetch(
      `https://rpghq.org/forums/mentionloc?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          accept: "application/json, text/javascript, */*; q=0.01",
          "x-requested-with": "XMLHttpRequest",
        },
        credentials: "include", // Important for session context
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    log("Received member search results:", data);

    displaySearchResults(data, resultsContainer, listContainer);
  } catch (err) {
    error("Error searching for members:", err);
    resultsContainer.innerHTML = "<li><i>Error searching for members.</i></li>";
    resultsContainer.style.display = "block"; // Keep visible to show error
  }
}

/**
 * Displays the filtered search results in the dropdown.
 * @param {Array} data - The raw data array from the API.
 * @param {HTMLElement} resultsContainer - The container to display results in.
 * @param {HTMLElement} listContainer - The main list container.
 */
function displaySearchResults(data, resultsContainer, listContainer) {
  resultsContainer.innerHTML = ""; // Clear previous (e.g., loading message)

  const filteredData = data.filter((item) => item.type === "user");

  if (!filteredData || filteredData.length === 0) {
    resultsContainer.innerHTML = "<li><i>No matching members found.</i></li>";
    resultsContainer.style.display = "block"; // Keep visible
    return;
  }

  const ul = document.createElement("ul");
  ul.className = "user-prefs-search-results-list"; // Add class for styling

  filteredData.forEach((item) => {
    const li = document.createElement("li");
    li.className = "user-prefs-search-result-item"; // Add class for styling

    const userId = item.user_id;
    const username = item.value || item.key || "Unknown User";

    // Store data attributes for the click handler
    li.dataset.userId = userId;
    li.dataset.username = username;

    // Simple display: username
    // Could add avatar later if needed
    li.textContent = username;
    li.style.cursor = "pointer"; // Indicate clickable

    ul.appendChild(li);
  });

  resultsContainer.appendChild(ul);
  resultsContainer.style.display = "block"; // Ensure it's visible
}

/**
 * Renders the UI for managing user-specific preferences.
 *
 * @param {HTMLElement} container - The container element to render the UI into.
 */
export function renderUserPreferencesManagement(container) {
  log("Rendering User Preferences Management UI");
  container.innerHTML = ""; // Clear previous content

  // Create main wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "user-prefs-management";
  wrapper.innerHTML = "<h3>User Preferences Management</h3>"; // Temporary title

  // --- 1. Member Search Section ---
  const searchSection = document.createElement("div");
  searchSection.className = "user-prefs-search-section";
  searchSection.innerHTML = `
    <label for="user-prefs-member-search">Add/Find User:</label>
    <input type="text" id="user-prefs-member-search" placeholder="Search username...">
    <div id="user-prefs-search-results" class="search-results-dropdown"></div>
  `;
  wrapper.appendChild(searchSection);

  // --- 2. Managed Users List Section ---
  const listSection = document.createElement("div");
  listSection.className = "user-prefs-list-section";
  listSection.innerHTML = "<h4>Managed Users</h4>";
  const userListContainer = document.createElement("div");
  userListContainer.id = "user-prefs-managed-list";
  listSection.appendChild(userListContainer);
  wrapper.appendChild(listSection);

  container.appendChild(wrapper);

  // Initial rendering of the list
  renderManagedUsersList(userListContainer);

  // Add event listeners (e.g., for search input)
  setupEventListeners(searchSection, userListContainer);
}

/**
 * Renders the list of users whose preferences are being managed.
 * @param {HTMLElement} listContainer - The container for the list.
 */
async function renderManagedUsersList(listContainer) {
  listContainer.innerHTML = "Loading..."; // Placeholder
  const userPrefs = await GM_getValue(STORAGE_KEY, {});
  log("Loaded user preferences for list:", userPrefs);

  listContainer.innerHTML = ""; // Clear loading message

  if (Object.keys(userPrefs).length === 0) {
    listContainer.innerHTML = "<p>No users currently managed.</p>";
    return;
  }

  const ul = document.createElement("ul");
  ul.className = "managed-users-list";

  for (const username in userPrefs) {
    if (Object.hasOwnProperty.call(userPrefs, username)) {
      const userData = userPrefs[username];
      const li = document.createElement("li");
      li.dataset.username = username; // Store username for easy access

      // User Info
      const userInfo = document.createElement("div");
      userInfo.className = "user-info";
      userInfo.innerHTML = `<strong>${username}</strong> (ID: ${userData.user_id})`; // Display username and ID

      // Preference Controls (Placeholders for now)
      const controls = document.createElement("div");
      controls.className = "user-prefs-controls";
      controls.innerHTML = `
        <label>
          Hide Posts:
          <input type="checkbox" class="pref-toggle" data-pref="hidePosts" ${userData.hidePosts ? "checked" : ""}>
        </label>
        <label>
          Avatar URL:
          <input type="text" class="pref-input" data-pref="avatarUrl" value="${userData.avatarUrl || ""}" placeholder="Default">
        </label>
        <label>
          Username Color:
          <input type="color" class="pref-color" data-pref="usernameColor" value="${userData.usernameColor || "#000000"}">
        </label>
        <button class="remove-user-button">Remove</button>
      `;

      li.appendChild(userInfo);
      li.appendChild(controls);
      ul.appendChild(li);
    }
  }
  listContainer.appendChild(ul);
}

/**
 * Sets up event listeners for the search input and managed list controls.
 * @param {HTMLElement} searchContainer - The container for the search elements.
 * @param {HTMLElement} listContainer - The container for the managed users list.
 */
function setupEventListeners(searchContainer, listContainer) {
  const searchInput = searchContainer.querySelector(
    "#user-prefs-member-search",
  );
  const searchResultsContainer = searchContainer.querySelector(
    "#user-prefs-search-results",
  );
  const managedList = listContainer.querySelector("#user-prefs-managed-list");

  // Debounce timer for search input
  let searchDebounceTimer;

  // --- Search Input Listener ---
  searchInput.addEventListener("input", (event) => {
    clearTimeout(searchDebounceTimer);
    const query = event.target.value.trim();
    searchResultsContainer.innerHTML = ""; // Clear previous results
    searchResultsContainer.style.display = "none";

    if (query.length < 3) {
      // Minimum length for search
      return;
    }

    searchResultsContainer.innerHTML = "<li><i>Searching...</i></li>"; // Show loading indicator
    searchResultsContainer.style.display = "block";

    log(`Debouncing member search for query: ${query}`);
    searchDebounceTimer = setTimeout(() => {
      // Use the new helper function
      searchMembersAndDisplay(query, searchResultsContainer, listContainer);
    }, 300); // 300ms debounce
  });

  // Add click listener to results container (event delegation)
  searchResultsContainer.addEventListener("click", (event) => {
    const target = event.target;
    // Ensure the clicked element is one of our results
    const resultItem = target.closest("li[data-user-id][data-username]");
    if (resultItem) {
      const userId = resultItem.dataset.userId;
      const username = resultItem.dataset.username;
      log(`Search result clicked: ${username} (ID: ${userId})`);
      // Call the function to add/update the preference
      addUserPreference(username, userId, listContainer);
      // Clear search input and results after selection
      searchInput.value = "";
      searchResultsContainer.innerHTML = "";
      searchResultsContainer.style.display = "none";
    }
  });

  // Hide results when clicking outside the search input/results area
  document.addEventListener("click", (event) => {
    if (!searchContainer.contains(event.target)) {
      searchResultsContainer.style.display = "none";
    }
  });

  // --- Managed List Event Listener (Delegation) ---
  if (managedList) {
    managedList.addEventListener("click", async (event) => {
      const target = event.target;
      const li = target.closest("li[data-username]");
      if (!li) return;

      const username = li.dataset.username;

      // Handle Remove Button
      if (target.classList.contains("remove-user-button")) {
        log(`Removing user: ${username}`);
        const userPrefs = await GM_getValue(STORAGE_KEY, {});
        if (userPrefs[username]) {
          delete userPrefs[username];
          await GM_setValue(STORAGE_KEY, userPrefs);
          log("User removed, updating list.");
          renderManagedUsersList(listContainer); // Re-render the list
        } else {
          error(`User ${username} not found in preferences for removal.`);
        }
      }
    });

    managedList.addEventListener("change", async (event) => {
      const target = event.target;
      const li = target.closest("li[data-username]");
      if (!li) return;

      const username = li.dataset.username;
      const prefKey = target.dataset.pref;

      if (target.classList.contains("pref-toggle") && prefKey) {
        updatePreference(username, prefKey, target.checked, listContainer);
      } else if (target.classList.contains("pref-input") && prefKey) {
        updatePreference(
          username,
          prefKey,
          target.value || null,
          listContainer,
        ); // Store null if empty
      } else if (target.classList.contains("pref-color") && prefKey) {
        updatePreference(username, prefKey, target.value, listContainer);
      }
    });
  }
}

/**
 * Updates a specific preference for a user in storage.
 * @param {string} username - The username of the user to update.
 * @param {string} prefKey - The preference key ('hidePosts', 'avatarUrl', 'usernameColor').
 * @param {*} value - The new value for the preference.
 * @param {HTMLElement} listContainer - The list container to re-render (optional).
 */
async function updatePreference(
  username,
  prefKey,
  value,
  listContainer = null,
) {
  log(`Updating preference '${prefKey}' for ${username} to:`, value);
  try {
    const userPrefs = await GM_getValue(STORAGE_KEY, {});
    if (!userPrefs[username]) {
      error(`Cannot update preference for non-managed user: ${username}`);
      // Optionally, handle this case by adding the user first, but the
      // current flow expects users to be added via search.
      return;
    }
    userPrefs[username][prefKey] = value;
    await GM_setValue(STORAGE_KEY, userPrefs);
    log("Preference saved.");
    // No re-render needed on individual change unless explicitly passed listContainer
    // This prevents jarring list refresh on every input change.
    // We might want a dedicated save button later or re-render on blur.
  } catch (err) {
    error("Error updating preference:", err);
  }
}

// Helper function to add a user (called from search result click)
// Needs to be integrated with the actual search implementation
async function addUserPreference(username, userId, listContainer) {
  log(`Adding user preference entry for: ${username} (ID: ${userId})`);
  try {
    const userPrefs = await GM_getValue(STORAGE_KEY, {});
    if (userPrefs[username]) {
      log(`User ${username} already exists.`);
      // Optionally highlight the existing entry or show a message
      return;
    }
    userPrefs[username] = {
      user_id: userId,
      hidePosts: null,
      avatarUrl: null,
      usernameColor: null,
    };
    await GM_setValue(STORAGE_KEY, userPrefs);
    log("User added, updating list.");
    renderManagedUsersList(listContainer); // Re-render the list
  } catch (err) {
    error("Error adding user preference:", err);
  }
}
