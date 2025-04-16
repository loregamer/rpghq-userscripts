// /docs/planning/user-preferences.md
import { log, error } from "../../utils/logger.js";
// import { GM_setValue, GM_getValue } from "../../utils/tampermonkey.js"; // Incorrect path - use global GM_*
// We rely on the global GM_xmlhttpRequest provided by the userscript manager via @grant

const STORAGE_KEY = "RPGHQ_Manager_user_preferences";
const DEFAULT_AVATAR_PLACEHOLDER = "https://via.placeholder.com/50"; // Consistent placeholder

/**
 * Fetches the user's current avatar URL from their profile page using GM_xmlhttpRequest.
 * @param {string} userId - The user ID.
 * @returns {Promise<string>} - Resolves with the avatar URL or rejects if not found/error occurs.
 */
function fetchUserAvatarUrl(userId) {
  return new Promise((resolve, reject) => {
    if (!userId) {
      return reject(new Error("User ID is required for fetching avatar."));
    }
    const profileUrl = `https://rpghq.org/forums/memberlist.php?mode=viewprofile&u=${userId}`;
    log(`Fetching avatar via GM_xmlhttpRequest from: ${profileUrl}`);

    GM_xmlhttpRequest({
      method: "GET",
      url: profileUrl,
      onload: function (response) {
        if (response.status >= 200 && response.status < 300) {
          try {
            const html = response.responseText;
            const match = html.match(
              /<dt class="profile-avatar">.*?<img class="avatar" src="([^"]+)"/s,
            );
            if (match && match[1]) {
              const rawSrc = match[1];
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
            reject(parseError);
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
        reject(new Error("Network error during fetch."));
      },
    });
  });
}

/**
 * Renders the user preferences management UI.
 * @param {HTMLElement} container - The container element to render the UI into.
 */
export function renderUserPreferencesManagement(container) {
  // TODO: Implement UI rendering logic based on Phase 2, Step 3
  container.innerHTML = `
        <div class="hq-usm-user-prefs-container">
            <h2>User Preferences Management</h2>
            <div class="hq-usm-user-prefs-controls" style="margin-bottom: 15px;">
                <input type="text" id="hq-usm-user-prefs-filter" placeholder="Filter users..." class="hq-usm-input">
                <button id="hq-usm-user-prefs-add" class="hq-usm-button">Add User</button>
            </div>
            <div id="hq-usm-user-prefs-grid" class="hq-usm-user-prefs-grid-container">
                <!-- User tiles will be rendered here -->
                <p>Loading user preferences...</p>
            </div>
        </div>
    `;

  const filterInput = document.getElementById("hq-usm-user-prefs-filter");
  const addButton = document.getElementById("hq-usm-user-prefs-add");
  const gridContainer = document.getElementById("hq-usm-user-prefs-grid"); // Now uses script-grid class

  let allUserPrefs = {}; // To store the loaded preferences

  /**
   * Saves the entire user preferences object to storage.
   * @param {string} contextUsername - Username for logging context (optional).
   */
  async function savePreferences(contextUsername = null) {
    try {
      await GM_setValue(STORAGE_KEY, allUserPrefs);
      if (contextUsername) {
        log(`Preferences saved (context: ${contextUsername}).`);
      } else {
        log(`Preferences saved.`);
      }
      // Optionally, add global visual feedback if needed
    } catch (err) {
      error(
        `Error saving preferences (context: ${contextUsername || "global"}):`,
        err,
      );
      alert("Failed to save preferences.");
    }
  }

  /**
   * Renders the user tiles in the grid.
   * @param {Object} prefsToShow - The preferences object to display (potentially filtered).
   */
  function displayUserTiles(prefsToShow) {
    gridContainer.innerHTML = ""; // Clear existing content

    const usernames = Object.keys(prefsToShow);

    usernames.forEach((username) => {
      const userPref = prefsToShow[username];
      const tile = document.createElement("div");
      tile.className = "script-card hq-usm-user-card"; // Use script-card and a specific user-card class
      // tile.style.cursor = "pointer"; // Remove pointer cursor, no longer opens modal
      tile.dataset.username = username; // Add username for reference

      // --- Container for Avatar and Name (Flexbox) ---
      const topRow = document.createElement("div");
      topRow.style.display = "flex";
      topRow.style.alignItems = "center";
      topRow.style.marginBottom = "10px";

      // Avatar
      const avatar = document.createElement("img");
      avatar.className = "script-card-icon hq-usm-user-tile-avatar"; // Use specific avatar class
      avatar.alt = `${username}'s avatar`;
      avatar.style.flexShrink = "0"; // Prevent avatar from shrinking
      avatar.style.marginRight = "10px";

      // --- Avatar Loading Logic ---
      avatar.src = DEFAULT_AVATAR_PLACEHOLDER; // Start with placeholder
      avatar.classList.add("loading"); // Indicate loading state

      const setAvatarSrc = (url) => {
        avatar.src = url;
        avatar.onerror = () => {
          log(
            `Error loading avatar for ${username} from URL: ${url}. Falling back to placeholder.`,
          );
          avatar.src = DEFAULT_AVATAR_PLACEHOLDER;
          avatar.classList.remove("loading");
          avatar.onerror = null;
        };
        avatar.onload = () => {
          avatar.classList.remove("loading");
          avatar.onerror = null;
          avatar.onload = null;
        };
      };

      if (userPref.avatarUrl) {
        log(`Using custom avatar URL for ${username}: ${userPref.avatarUrl}`);
        setAvatarSrc(userPref.avatarUrl);
      } else {
        fetchUserAvatarUrl(userPref.user_id)
          .then((fetchedUrl) => {
            log(`Successfully fetched avatar for ${username}: ${fetchedUrl}`);
            setAvatarSrc(fetchedUrl);
          })
          .catch((fetchError) => {
            error(
              `Failed to fetch avatar for ${username} (ID: ${userPref.user_id}):`,
              fetchError,
            );
            avatar.classList.remove("loading"); // Keep placeholder
          });
      }
      // --- End Avatar Loading Logic ---

      // Username Span
      const nameSpan = document.createElement("span");
      nameSpan.className = "script-card-title hq-usm-user-tile-name"; // Use specific name class
      nameSpan.textContent = username;
      if (userPref.usernameColor) {
        nameSpan.style.color = userPref.usernameColor;
      }

      topRow.appendChild(avatar);
      topRow.appendChild(nameSpan);
      tile.appendChild(topRow);

      // --- Settings Controls Container ---
      const controlsContainer = document.createElement("div");
      controlsContainer.className = "hq-usm-user-card-controls";
      controlsContainer.style.marginTop = "auto"; // Push controls to the bottom if card height varies
      controlsContainer.style.paddingTop = "10px";
      controlsContainer.style.borderTop = "1px solid #444"; // Separator

      // Hide Posts Checkbox
      const hideDiv = document.createElement("div");
      hideDiv.className = "hq-usm-setting-item-inline"; // For inline layout
      const hideLabel = document.createElement("label");
      hideLabel.textContent = "Hide Posts:";
      hideLabel.htmlFor = `user-prefs-hide-${username}`;
      const hideCheckbox = document.createElement("input");
      hideCheckbox.type = "checkbox";
      hideCheckbox.id = `user-prefs-hide-${username}`;
      hideCheckbox.checked = userPref.hidePosts || false;
      hideCheckbox.addEventListener("change", () => {
        allUserPrefs[username].hidePosts = hideCheckbox.checked;
        savePreferences(username);
      });
      hideDiv.appendChild(hideLabel);
      hideDiv.appendChild(hideCheckbox);
      controlsContainer.appendChild(hideDiv);

      // Custom Avatar URL Input
      const avatarDiv = document.createElement("div");
      avatarDiv.className = "hq-usm-setting-item";
      const avatarLabel = document.createElement("label");
      avatarLabel.textContent = "Avatar URL:";
      avatarLabel.htmlFor = `user-prefs-avatar-${username}`;
      const avatarInput = document.createElement("input");
      avatarInput.type = "text";
      avatarInput.id = `user-prefs-avatar-${username}`;
      avatarInput.className = "hq-usm-input hq-usm-input-small"; // Smaller input
      avatarInput.value = userPref.avatarUrl || "";
      avatarInput.placeholder = "Optional custom URL";
      avatarInput.addEventListener("input", () => {
        const url = avatarInput.value.trim();
        allUserPrefs[username].avatarUrl = url || null; // Store null if empty
        setAvatarSrc(url || DEFAULT_AVATAR_PLACEHOLDER); // Update avatar preview
        savePreferences(username);
      });
      avatarDiv.appendChild(avatarLabel);
      avatarDiv.appendChild(avatarInput);
      controlsContainer.appendChild(avatarDiv);

      // Username Color Input
      const colorDiv = document.createElement("div");
      colorDiv.className = "hq-usm-setting-item-inline"; // Inline layout
      const colorLabel = document.createElement("label");
      colorLabel.textContent = "Color:";
      colorLabel.htmlFor = `user-prefs-color-${username}`;
      const colorInput = document.createElement("input");
      colorInput.type = "color";
      colorInput.id = `user-prefs-color-${username}`;
      colorInput.value = userPref.usernameColor || "#ffffff"; // Default to white for picker
      colorInput.style.marginLeft = "5px";
      colorInput.addEventListener("input", () => {
        allUserPrefs[username].usernameColor = colorInput.value;
        nameSpan.style.color = colorInput.value;
        savePreferences(username);
      });
      const colorResetButton = document.createElement("button");
      colorResetButton.className = "hq-usm-button hq-usm-button-icon"; // Icon button style
      colorResetButton.innerHTML = "&#x21BA;"; // Reset arrow
      colorResetButton.title = "Reset color";
      colorResetButton.style.marginLeft = "5px";
      colorResetButton.addEventListener("click", () => {
        allUserPrefs[username].usernameColor = null;
        colorInput.value = "#ffffff"; // Reset visually
        nameSpan.style.color = ""; // Reset name color to default
        savePreferences(username);
      });
      colorDiv.appendChild(colorLabel);
      colorDiv.appendChild(colorInput);
      colorDiv.appendChild(colorResetButton);
      controlsContainer.appendChild(colorDiv);

      // User ID Display (subtle)
      const userIdP = document.createElement("p");
      userIdP.textContent = `ID: ${userPref.user_id}`;
      userIdP.style.fontSize = "0.8em";
      userIdP.style.color = "#888";
      userIdP.style.marginTop = "8px";
      userIdP.style.textAlign = "center";
      controlsContainer.appendChild(userIdP);

      // Remove User Button
      const removeButton = document.createElement("button");
      removeButton.className =
        "hq-usm-button hq-usm-button-danger hq-usm-button-small"; // Danger, small button
      removeButton.textContent = "Remove";
      removeButton.style.marginTop = "10px";
      removeButton.style.width = "100%"; // Full width
      removeButton.addEventListener("click", async () => {
        if (confirm(`Are you sure you want to remove user "${username}"?`)) {
          log(`Removing user: ${username}`);
          delete allUserPrefs[username];
          await savePreferences(); // Save the updated full list
          // Refresh grid - use current filter state if applicable
          const currentFilter = filterInput.value.toLowerCase();
          if (currentFilter) {
            filterInput.dispatchEvent(new Event("input")); // Trigger filter redraw
          } else {
            displayUserTiles(allUserPrefs); // Refresh with all prefs
          }
        }
      });
      controlsContainer.appendChild(removeButton);

      // Append Controls
      tile.appendChild(controlsContainer);

      gridContainer.appendChild(tile);
    });
  }

  // --- showUserSettingsPopup function removed as settings are now inline ---

  // --- Member Search Modal Logic (Adapted from memberSearch.js) ---

  let userSearchModal = null; // Reference to the modal element

  /** Creates the Member Search Modal and appends to body if it doesn't exist */
  function _createUserSearchModal() {
    if (document.getElementById("hq-usm-user-search-modal")) {
      return document.getElementById("hq-usm-user-search-modal");
    }

    log("Creating user search modal for preferences tab.");

    const modal = document.createElement("div");
    modal.id = "hq-usm-user-search-modal";
    modal.className = "hq-usm-user-search-modal"; // Use namespaced class
    // modal.style.zIndex = "1051"; // Z-index handled by CSS class now
    modal.innerHTML = `
          <div class="member-search-container">
              <div class="member-search-close">&times;</div>
              <div class="member-search-title">Add User to Preferences</div>
              <input type="text" class="member-search-input hq-usm-input" placeholder="Search for member...">
              <div class="member-search-results" style="max-height: 250px; overflow-y: auto;"></div>
          </div>
      `;
    document.body.appendChild(modal);

    const closeButton = modal.querySelector(".member-search-close");
    closeButton.addEventListener("click", () => _hideUserSearchModal());

    // Close on overlay click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        _hideUserSearchModal();
      }
    });

    _setupUserSearchFunctionality(modal);
    userSearchModal = modal;
    return modal;
  }

  /** Hides the user search modal */
  function _hideUserSearchModal() {
    if (userSearchModal) {
      userSearchModal.classList.remove("active");
    }
  }

  /** Sets up the input listeners and result click handler for the search modal */
  function _setupUserSearchFunctionality(modal) {
    const searchInput = modal.querySelector(".member-search-input");
    const searchResultsContainer = modal.querySelector(
      ".member-search-results",
    );
    let debounceTimer;

    searchInput.addEventListener("input", function () {
      clearTimeout(debounceTimer);
      const query = this.value.trim();

      if (query.length < 2) {
        searchResultsContainer.innerHTML = "";
        return;
      }
      searchResultsContainer.innerHTML =
        '<div class="member-search-loading">Searching...</div>';
      debounceTimer = setTimeout(() => {
        _searchMembersApi(query, searchResultsContainer);
      }, 300);
    });

    // Handle clicks on search results (delegation)
    searchResultsContainer.addEventListener("click", async (event) => {
      const resultItem = event.target.closest(
        ".member-search-result[data-user-id][data-username]",
      );
      if (!resultItem) return;

      const username = resultItem.dataset.username;
      const user_id = resultItem.dataset.userId;
      log(`User selected from search: ${username} (ID: ${user_id})`);

      if (allUserPrefs[username]) {
        alert(`User "${username}" is already in your preferences.`);
        log(`User "${username}" already exists.`);
        return;
      }

      // Add new user with default null preferences
      allUserPrefs[username] = {
        user_id: String(user_id), // Ensure user_id is string
        hidePosts: null,
        avatarUrl: null,
        usernameColor: null,
      };

      try {
        await savePreferences(username); // Use the standalone save function
        log(`User "${username}" (ID: ${user_id}) added successfully.`);
        _hideUserSearchModal();
        // Refresh grid - use current filter state if applicable
        const currentFilter = filterInput.value.toLowerCase();
        if (currentFilter) {
          filterInput.dispatchEvent(new Event("input")); // Trigger filter redraw
        } else {
          displayUserTiles(allUserPrefs); // Refresh with all prefs
        }
      } catch (saveErr) {
        error(
          `Error saving preferences after adding user "${username}":`,
          saveErr,
        );
        alert(`Failed to save preferences after adding user "${username}".`);
        // Optional: revert the change in memory if save fails?
        delete allUserPrefs[username];
      }
    });

    // Focus input when modal becomes active (slightly simplified)
    const observer = new MutationObserver(() => {
      if (modal.classList.contains("active")) {
        searchInput.focus();
      }
    });
    observer.observe(modal, { attributes: true, attributeFilter: ["class"] });
  }

  /** Calls the mentionloc API */
  function _searchMembersApi(query, resultsContainer) {
    fetch(
      `https://rpghq.org/forums/mentionloc?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          accept: "application/json, text/javascript, */*; q=0.01",
          "x-requested-with": "XMLHttpRequest",
        },
        credentials: "include",
      },
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        _displayUserSearchResults(data, resultsContainer);
      })
      .catch((error) => {
        error("Error searching for members:", error);
        resultsContainer.innerHTML =
          '<div class="member-search-no-results">Error searching for members</div>';
      });
  }

  /** Displays the API results in the search modal */
  function _displayUserSearchResults(data, resultsContainer) {
    resultsContainer.innerHTML = ""; // Clear previous results/loading
    const filteredData = data.filter((item) => item.type === "user");

    if (!filteredData || filteredData.length === 0) {
      resultsContainer.innerHTML =
        '<div class="member-search-no-results">No members found</div>';
      return;
    }

    const fragment = document.createDocumentFragment();
    filteredData.forEach((item) => {
      const userId = item.user_id;
      const username = item.value || item.key || "Unknown User";
      const defaultAvatar =
        "https://f.rpghq.org/OhUxAgzR9avp.png?n=pasted-file.png";

      const resultItem = document.createElement("div");
      resultItem.className = "member-search-result";
      resultItem.dataset.userId = userId;
      resultItem.dataset.username = username;
      resultItem.innerHTML = `
              <img
                  src="https://rpghq.org/forums/download/file.php?avatar=${userId}.jpg"
                  alt="${username}'s avatar"
                  onerror="if(this.src.endsWith('.jpg')){this.src='https://rpghq.org/forums/download/file.php?avatar=${userId}.png';}else if(this.src.endsWith('.png')){this.src='https://rpghq.org/forums/download/file.php?avatar=${userId}.gif';}else{this.src='${defaultAvatar}';}"
                  style="width: 32px; height: 32px; border-radius: 50%; margin-right: 10px;"
              >
              <span>${username}</span>
          `;
      // Click handled by delegation in _setupUserSearchFunctionality
      fragment.appendChild(resultItem);
    });
    resultsContainer.appendChild(fragment);
  }

  // --- End Member Search Modal Logic ---

  /** Loads preferences and renders the initial grid */
  async function loadAndRender() {
    try {
      allUserPrefs = await GM_getValue(STORAGE_KEY, {});
      log("Loaded user preferences:", allUserPrefs);
      displayUserTiles(allUserPrefs); // Initial display
    } catch (err) {
      error("Error loading user preferences:", err);
      gridContainer.innerHTML =
        '<p class="hq-usm-error">Error loading preferences.</p>';
    }

    // Add event listener for filter input
    filterInput.addEventListener("input", () => {
      const filterText = filterInput.value.toLowerCase();
      const filteredPrefs = Object.keys(allUserPrefs)
        .filter((username) => username.toLowerCase().includes(filterText))
        .reduce((obj, key) => {
          obj[key] = allUserPrefs[key];
          return obj;
        }, {});
      displayUserTiles(filteredPrefs);
    });

    // Add event listener for add button
    addButton.addEventListener("click", () => {
      log("Add User button clicked - showing search modal");
      const modal = _createUserSearchModal(); // Ensure modal exists
      modal.classList.add("active");
      // Clear previous search results and focus input
      modal.querySelector(".member-search-input").value = "";
      modal.querySelector(".member-search-results").innerHTML = "";
      // Focus is handled by MutationObserver in _setupUserSearchFunctionality
    });

    // Modal related listeners removed
  }

  loadAndRender();
}
