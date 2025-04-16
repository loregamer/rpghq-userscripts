// import { GM_setValue, GM_getValue } from "$common"; // Use global GM_ functions instead
import { log, error } from "../utils/logger.js";
// @ts-ignore
// eslint-disable-next-line no-unused-vars
import { GM_xmlhttpRequest } from "$common";

const DEFAULT_AVATAR_PLACEHOLDER = "https://via.placeholder.com/40";

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

/**
 * Fetches the user's current avatar URL from their profile page using GM_xmlhttpRequest.
 * @param {string} userId - The user ID.
 * @returns {Promise<string>} - Resolves with the avatar URL or rejects if not found/error occurs.
 */
function fetchUserAvatarUrl(userId) {
  return new Promise((resolve, reject) => {
    const profileUrl = `https://rpghq.org/forums/memberlist.php?mode=viewprofile&u=${userId}`;
    log(`Fetching avatar via GM_xmlhttpRequest from: ${profileUrl}`);

    GM_xmlhttpRequest({
      method: "GET",
      url: profileUrl,
      onload: function (response) {
        if (response.status >= 200 && response.status < 300) {
          try {
            const html = response.responseText;
            // Simple parsing using regex (could be fragile)
            const match = html.match(
              /<dt class="profile-avatar">.*?<img class="avatar" src="([^"]+)"/s,
            );
            if (match && match[1]) {
              // The src might be relative (e.g., './download/file.php?avatar=...'), resolve it
              const rawSrc = match[1];
              // Ensure the URL is absolute
              const absoluteSrc = new URL(
                rawSrc.startsWith("//") ? `https:${rawSrc}` : rawSrc,
                profileUrl,
              ).href;
              log(`Found avatar src for ${userId}: ${absoluteSrc}`);
              resolve(absoluteSrc);
            } else {
              log(
                `Could not find avatar img tag for ${userId} in profile HTML.`,
              );
              reject(new Error("Avatar image tag not found in profile HTML."));
            }
          } catch (parseError) {
            error(
              `Error parsing profile HTML for avatar (${userId}):`,
              parseError,
            );
            reject(parseError); // Reject promise on parsing error
          }
        } else {
          error(
            `HTTP error fetching profile for avatar (${userId}): ${response.status} ${response.statusText}`,
          );
          reject(
            new Error(`HTTP error: ${response.status} ${response.statusText}`),
          );
        }
      },
      onerror: function (errorResponse) {
        error(
          `Network error fetching profile for avatar (${userId}):`,
          errorResponse,
        );
        reject(new Error("Network error during fetch.")); // Reject promise on network error
      },
    });
  });
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

  // --- Managed Users List Section ---
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

  // Add event listeners
  setupEventListeners(null, userListContainer); // Pass null for searchContainer
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
  ul.className = "managed-users-list user-prefs-grid"; // Add grid class

  for (const username in userPrefs) {
    if (Object.hasOwnProperty.call(userPrefs, username)) {
      const userData = userPrefs[username];
      const li = document.createElement("li");
      li.className = "user-prefs-tile"; // Add tile class
      li.dataset.username = username; // Store username for easy access

      // User Info
      const userInfo = document.createElement("div");
      userInfo.className = "user-info";

      // Avatar Image
      const avatarImg = document.createElement("img");
      avatarImg.className = "user-prefs-tile-avatar"; // Class for styling
      avatarImg.alt = `${username}'s avatar`;

      // Set initial state
      avatarImg.src = DEFAULT_AVATAR_PLACEHOLDER;
      avatarImg.classList.add("loading"); // Add loading class

      const setAvatarSrc = (url) => {
        avatarImg.src = url;
        avatarImg.onerror = () => {
          log(
            `Error loading avatar for ${username} from URL: ${url}. Falling back to placeholder.`,
          );
          avatarImg.src = DEFAULT_AVATAR_PLACEHOLDER;
          avatarImg.classList.remove("loading");
          avatarImg.onerror = null; // Prevent infinite error loops
        };
        avatarImg.onload = () => {
          avatarImg.classList.remove("loading");
          avatarImg.onerror = null; // Clear error handler on successful load
          avatarImg.onload = null; // Clear onload handler
        };
      };

      // Prioritize custom URL if available
      if (userData.avatarUrl) {
        log(`Using custom avatar URL for ${username}: ${userData.avatarUrl}`);
        setAvatarSrc(userData.avatarUrl);
      } else {
        // Otherwise, try fetching from profile
        fetchUserAvatarUrl(userData.user_id)
          .then((fetchedUrl) => {
            log(`Successfully fetched avatar for ${username}: ${fetchedUrl}`);
            setAvatarSrc(fetchedUrl);
          })
          .catch((fetchError) => {
            error(
              `Failed to fetch avatar for ${username} (ID: ${userData.user_id}):`,
              fetchError,
            );
            // Already showing placeholder, just remove loading state
            avatarImg.classList.remove("loading");
          });
      }

      userInfo.appendChild(avatarImg); // Add avatar first

      // Username and ID
      const userNameSpan = document.createElement("span");
      userNameSpan.innerHTML = `<strong>${username}</strong> (ID: ${userData.user_id})`;
      userInfo.appendChild(userNameSpan);

      // Preference Controls
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

  // --- Add "Add User" Tile ---
  const addTile = document.createElement("li");
  addTile.className = "user-prefs-tile add-user-tile"; // Add specific class
  addTile.innerHTML = `
    <div class="add-user-content">
      <span class="add-user-plus">+</span>
      <span class="add-user-text">Add User</span>
    </div>
  `;
  ul.appendChild(addTile);
  // --------------------------

  listContainer.appendChild(ul);
}

/**
 * Sets up event listeners for the search input and managed list controls.
 * @param {HTMLElement} searchContainer - The container for the search elements.
 * @param {HTMLElement} listContainer - The container for the managed users list.
 */
function setupEventListeners(searchContainer, listContainer) {
  // REMOVED: Old search input/results logic
  // const searchInput = searchContainer?.querySelector(...)
  // const searchResultsContainer = searchContainer?.querySelector(...)

  const managedList = listContainer.querySelector(".managed-users-list"); // Target the UL

  // REMOVED: Old search input listener
  // searchInput?.addEventListener("input", ...);

  // REMOVED: Old search results click listener
  // searchResultsContainer?.addEventListener("click", ...);

  // REMOVED: Old click-outside-to-hide listener
  // document.addEventListener("click", ...);

  // Keep a reference to the dynamically created search elements
  let dynamicSearchInput = null;
  let dynamicResultsContainer = null;
  let searchDebounceTimer = null; // Debounce for dynamic search

  // --- Managed List Event Listener (Delegation) ---
  if (managedList) {
    managedList.addEventListener("click", async (event) => {
      const target = event.target;
      const tile = target.closest(".user-prefs-tile"); // Find the closest tile (user or add)
      if (!tile) return;

      // --- Handle "Add User" Tile Click ---
      if (tile.classList.contains("add-user-tile")) {
        log("Add User tile clicked");

        // Prevent creating multiple search inputs if already clicked
        if (tile.querySelector(".add-user-search-input")) {
          tile.querySelector(".add-user-search-input").focus();
          return;
        }

        // Clear previous results if any exist elsewhere
        if (dynamicResultsContainer) {
          dynamicResultsContainer.remove();
          dynamicResultsContainer = null;
        }
        // Remove previous input if exists in another tile (unlikely but safe)
        if (dynamicSearchInput && dynamicSearchInput.parentElement !== tile) {
          dynamicSearchInput.remove();
          dynamicSearchInput = null;
        }

        // Create search input dynamically inside the tile
        tile.innerHTML = ""; // Clear the '+' content
        dynamicSearchInput = document.createElement("input");
        dynamicSearchInput.type = "text";
        dynamicSearchInput.placeholder = "Search username...";
        dynamicSearchInput.className = "add-user-search-input";
        tile.appendChild(dynamicSearchInput);

        // Create results container dynamically (positioned absolutely via CSS)
        dynamicResultsContainer = document.createElement("div");
        dynamicResultsContainer.className = "search-results-dropdown"; // Reuse styling
        // Style needs to position it relative to the tile
        dynamicResultsContainer.style.display = "none";
        tile.appendChild(dynamicResultsContainer); // Append to tile for relative positioning

        dynamicSearchInput.focus();

        // Add input listener to the dynamic input
        dynamicSearchInput.addEventListener("input", (e) => {
          clearTimeout(searchDebounceTimer);
          const query = e.target.value.trim();
          dynamicResultsContainer.innerHTML = "";
          dynamicResultsContainer.style.display = "none";

          if (query.length < 3) return;

          dynamicResultsContainer.innerHTML = "<li><i>Searching...</i></li>";
          dynamicResultsContainer.style.display = "block";

          searchDebounceTimer = setTimeout(() => {
            searchMembersAndDisplay(
              query,
              dynamicResultsContainer,
              listContainer,
            );
          }, 300);
        });

        // Add results click listener to the dynamic container
        dynamicResultsContainer.addEventListener("click", (e) => {
          const resultItem = e.target.closest(
            "li[data-user-id][data-username]",
          );
          if (resultItem) {
            const userId = resultItem.dataset.userId;
            const username = resultItem.dataset.username;
            addUserPreference(username, userId, listContainer); // Adds user and re-renders list
            // The re-render will remove the dynamic input/results
          }
        });

        // Add listener to hide results/remove input when clicking outside
        // Use a temporary listener that removes itself
        const clickOutsideHandler = (clickEvent) => {
          if (
            !tile.contains(clickEvent.target) &&
            dynamicSearchInput // Check if the input still exists
          ) {
            log("Clicked outside add user search, reverting tile.");
            // Re-render the list to reset the add tile cleanly
            renderManagedUsersList(listContainer);
            document.removeEventListener("click", clickOutsideHandler, true); // Clean up listener
          }
        };
        // Use capture phase to catch clicks before they might be stopped
        document.addEventListener("click", clickOutsideHandler, true);

        return; // Stop further processing for this click
      }

      // --- Handle Regular User Tile Clicks (e.g., Remove Button) ---
      const username = tile.dataset.username;
      if (!username) return; // Should not happen on regular tiles, but safety check

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

    // --- Managed List CHANGE Event Listener (for inputs/checkboxes/color) ---
    managedList.addEventListener("change", async (event) => {
      const target = event.target;
      const tile = target.closest("li.user-prefs-tile[data-username]"); // Ensure it's a user tile
      if (!tile) return;

      const username = tile.dataset.username;
      const prefKey = target.dataset.pref;

      if (target.classList.contains("pref-toggle") && prefKey) {
        updatePreference(username, prefKey, target.checked);
      } else if (target.classList.contains("pref-input") && prefKey) {
        updatePreference(username, prefKey, target.value || null); // Store null if empty
      } else if (target.classList.contains("pref-color") && prefKey) {
        updatePreference(username, prefKey, target.value);
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
