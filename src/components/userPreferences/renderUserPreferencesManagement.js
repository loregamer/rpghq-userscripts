// /docs/planning/user-preferences.md
import { log, error } from "../../utils/logger.js";
// import { GM_setValue, GM_getValue } from "../../utils/tampermonkey.js"; // Incorrect path - use global GM_* functions
// import { showMemberSearch } from "../../scripts/memberSearch.js"; // This script doesn't export the required function

const STORAGE_KEY = "RPGHQ_Manager_user_preferences";

/**
 * Renders the user preferences management UI.
 * @param {HTMLElement} container - The container element to render the UI into.
 */
export function renderUserPreferencesManagement(container) {
  // TODO: Implement UI rendering logic based on Phase 2, Step 3
  container.innerHTML = `
        <div class="hq-usm-user-prefs-container">
            <h2>User Preferences Management</h2>
            <div class="hq-usm-user-prefs-controls">
                <input type="text" id="hq-usm-user-prefs-filter" placeholder="Filter users..." class="hq-usm-input">
                <button id="hq-usm-user-prefs-add" class="hq-usm-button">Add User</button>
            </div>
            <div id="hq-usm-user-prefs-grid" class="hq-usm-user-prefs-grid">
                <!-- User tiles will be rendered here -->
                <p>Loading user preferences...</p>
            </div>
        </div>
    `;

  const filterInput = document.getElementById("hq-usm-user-prefs-filter");
  const addButton = document.getElementById("hq-usm-user-prefs-add");
  const gridContainer = document.getElementById("hq-usm-user-prefs-grid");

  let allUserPrefs = {}; // To store the loaded preferences

  /**
   * Renders the user tiles in the grid.
   * @param {Object} prefsToShow - The preferences object to display (potentially filtered).
   */
  function displayUserTiles(prefsToShow) {
    gridContainer.innerHTML = ""; // Clear existing content

    const usernames = Object.keys(prefsToShow);

    if (usernames.length === 0) {
      gridContainer.innerHTML =
        "<p>No users added yet. Click 'Add User' to start.</p>";
      return;
    }

    usernames.forEach((username) => {
      const userPref = prefsToShow[username];
      const tile = document.createElement("div");
      tile.className = "hq-usm-user-prefs-tile hq-usm-tile"; // Added base tile class
      tile.dataset.username = username; // Add username for reference

      // Avatar
      const avatar = document.createElement("img");
      avatar.className = "hq-usm-user-tile-avatar";
      // TODO: Implement proper avatar fetching/fallback
      avatar.src = userPref.avatarUrl || "https://via.placeholder.com/50"; // Placeholder
      avatar.alt = `${username}'s avatar`;

      // Username
      const nameSpan = document.createElement("span");
      nameSpan.className = "hq-usm-user-tile-name";
      nameSpan.textContent = username;
      // TODO: Apply usernameColor if set

      // Settings Button
      const settingsButton = document.createElement("button");
      settingsButton.className = "hq-usm-button hq-usm-user-tile-settings";
      settingsButton.textContent = "Settings";
      settingsButton.dataset.username = username; // Link button to username
      // TODO: Add event listener for settings button

      tile.appendChild(avatar);
      tile.appendChild(nameSpan);
      tile.appendChild(settingsButton);

      gridContainer.appendChild(tile);
    });
  }

  /**
   * Shows the settings popup/modal for a specific user.
   * @param {string} username - The username of the user to configure.
   */
  function showUserSettingsPopup(username) {
    log(`Showing settings for user: ${username}`);
    const userPref = allUserPrefs[username];
    if (!userPref) {
      error(
        `Cannot show settings: User "${username}" not found in preferences.`,
      );
      return;
    }

    // --- Modal Creation/Retrieval ---
    const modalId = "hq-usm-user-settings-modal";
    let modal = document.getElementById(modalId);
    if (!modal) {
      modal = document.createElement("div");
      modal.id = modalId;
      // Add classes similar to existing modals for potential styling reuse
      modal.className = "mod-manager-modal settings-modal"; // Combine classes
      document.body.appendChild(modal);
    }

    // --- Save Helper ---
    const saveChanges = async () => {
      try {
        await GM_setValue(STORAGE_KEY, allUserPrefs);
        log(`Preferences saved for ${username}.`);
        // Optional: Add visual feedback
        // Refresh the specific tile in the main grid if needed (e.g., avatar change)
        displayUserTiles(allUserPrefs); // Simple refresh for now
      } catch (err) {
        error(`Error saving preferences for ${username}:`, err);
        alert("Failed to save preferences.");
      }
    };

    // --- Modal Content ---
    modal.innerHTML = `
            <div class="mod-manager-modal-content settings-modal-content">
                <div class="mod-manager-header settings-modal-header">
                    <h2 class="mod-manager-title settings-modal-title">Settings for ${username}</h2>
                    <span class="mod-manager-close settings-modal-close">&times;</span>
                </div>
                <div class="mod-manager-content settings-modal-body">
                    <div class="hq-usm-setting-item">
                        <label for="user-prefs-hide-${username}">Hide Posts:</label>
                        <input type="checkbox" id="user-prefs-hide-${username}" ${userPref.hidePosts ? "checked" : ""}>
                    </div>
                    <div class="hq-usm-setting-item">
                        <label for="user-prefs-avatar-${username}">Custom Avatar URL:</label>
                        <input type="text" id="user-prefs-avatar-${username}" class="hq-usm-input" value="${userPref.avatarUrl || ""}" placeholder="https://example.com/avatar.png">
                    </div>
                    <div class="hq-usm-setting-item">
                        <label for="user-prefs-color-${username}">Username Color:</label>
                        <input type="color" id="user-prefs-color-${username}" value="${userPref.usernameColor || "#000000"}">
                        <button id="user-prefs-color-reset-${username}" class="hq-usm-button hq-usm-button-small" style="margin-left: 5px;" title="Reset to default">&#x21BA;</button> <!-- Reset arrow -->
                    </div>
                     <p style="font-size: 0.9em; color: grey;">User ID: ${userPref.user_id}</p>
                </div>
                <div class="settings-modal-footer" style="display: flex; justify-content: space-between; padding: 15px; border-top: 1px solid #ccc;">
                    <button id="user-prefs-remove-${username}" class="hq-usm-button hq-usm-button-danger">Remove User</button>
                    <button id="user-prefs-close-${username}" class="hq-usm-button">Close</button>
                </div>
            </div>
        `;

    // --- Event Listeners ---
    const closeModal = () => {
      modal.style.display = "none";
    };

    modal
      .querySelector(".settings-modal-close")
      .addEventListener("click", closeModal);
    modal
      .querySelector(`#user-prefs-close-${username}`)
      .addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      // Close if clicking on the modal background (overlay)
      if (e.target === modal) {
        closeModal();
      }
    });

    // --- Control Listeners ---
    const hideCheckbox = modal.querySelector(`#user-prefs-hide-${username}`);
    hideCheckbox.addEventListener("change", () => {
      allUserPrefs[username].hidePosts = hideCheckbox.checked;
      saveChanges();
    });

    const avatarInput = modal.querySelector(`#user-prefs-avatar-${username}`);
    avatarInput.addEventListener("input", () => {
      // Use input for immediate feedback, or change/blur
      const url = avatarInput.value.trim();
      allUserPrefs[username].avatarUrl = url || null; // Store null if empty
      saveChanges();
    });

    const colorInput = modal.querySelector(`#user-prefs-color-${username}`);
    colorInput.addEventListener("input", () => {
      // Use input for live update
      allUserPrefs[username].usernameColor = colorInput.value;
      saveChanges();
    });

    const colorResetButton = modal.querySelector(
      `#user-prefs-color-reset-${username}`,
    );
    colorResetButton.addEventListener("click", () => {
      allUserPrefs[username].usernameColor = null;
      colorInput.value = "#000000"; // Reset visually
      saveChanges();
    });

    // --- Remove User Listener ---
    const removeButton = modal.querySelector(`#user-prefs-remove-${username}`);
    removeButton.addEventListener("click", async () => {
      if (
        confirm(
          `Are you sure you want to remove user "${username}" from your preferences?`,
        )
      ) {
        log(`Removing user: ${username}`);
        delete allUserPrefs[username];
        try {
          await GM_setValue(STORAGE_KEY, allUserPrefs);
          log(`User "${username}" removed successfully.`);
          closeModal();
          // Refresh grid - use current filter state if applicable
          const currentFilter = filterInput.value.toLowerCase();
          if (currentFilter) {
            filterInput.dispatchEvent(new Event("input")); // Trigger filter redraw
          } else {
            displayUserTiles(allUserPrefs); // Refresh with all prefs
          }
        } catch (err) {
          error(
            `Error saving preferences after removing user "${username}":`,
            err,
          );
          alert("Failed to save preferences after removing user.");
          // Optional: Re-add the user to memory if save fails?
          // allUserPrefs[username] = userPref; // Might need deep copy
        }
      }
    });

    // --- Display Modal ---
    modal.style.display = "block";
    // Prevent body scrolling while modal is open
    // document.body.style.overflow = "hidden"; // Re-enable scrolling on close

    // TODO: Re-enable body scrolling when modal closes
  }

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
        await GM_setValue(STORAGE_KEY, allUserPrefs);
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

    // Add event listener for settings buttons (using event delegation)
    gridContainer.addEventListener("click", (event) => {
      const target = event.target;
      if (target.classList.contains("hq-usm-user-tile-settings")) {
        const username = target.dataset.username;
        if (username) {
          showUserSettingsPopup(username);
        }
      }
    });
  }

  loadAndRender();
}
