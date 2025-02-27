// ==UserScript==
// @name         RPGHQ - Member Search
// @namespace    https://rpghq.org/
// @version      1.0
// @description  Adds a member search button to quickly find and navigate to member profiles
// @author       loregamer
// @match        https://rpghq.org/forums/*
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function () {
  "use strict";

  // Add CSS styles
  GM_addStyle(`
        .member-search-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 1000;
            justify-content: center;
            align-items: center;
        }
        .member-search-modal.active {
            display: flex;
        }
        .member-search-container {
            background-color: #1e232b;
            border: 1px solid #292e37;
            border-radius: 4px;
            width: 400px;
            max-width: 90%;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            padding: 20px;
            position: relative;
        }
        .member-search-close {
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 20px;
            color: #888;
            cursor: pointer;
        }
        .member-search-close:hover {
            color: #fff;
        }
        .member-search-title {
            font-size: 18px;
            margin-bottom: 15px;
            color: #fff;
            text-align: center;
        }
        .member-search-input {
            width: 100%;
            padding: 8px 10px;
            border: 1px solid #292e37;
            border-radius: 4px;
            background-color: #171b24;
            color: #fff;
            margin-bottom: 10px;
            font-size: 14px;
        }
        .member-search-input:focus {
            outline: none;
            border-color: #8698b3;
        }
        .member-search-results {
            max-height: 300px;
            overflow-y: auto;
        }
        .member-search-result {
            display: flex;
            align-items: center;
            padding: 8px 10px;
            cursor: pointer;
            border-radius: 4px;
        }
        .member-search-result:hover {
            background-color: #292e37;
        }
        .member-search-result img {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            margin-right: 10px;
        }
        .member-search-result span {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .member-search-no-results {
            padding: 10px;
            color: #8a8a8a;
            text-align: center;
        }
        .member-search-loading {
            text-align: center;
            padding: 10px;
            color: #8a8a8a;
        }
        .member-search-group {
            background-color: #272e38;
            padding: 2px 6px;
            border-radius: 3px;
            margin-left: 6px;
            font-size: 0.8em;
            color: #aaa;
        }
    `);

  // Create member search modal
  function createMemberSearchModal() {
    const modal = document.createElement("div");
    modal.className = "member-search-modal";
    modal.innerHTML = `
            <div class="member-search-container">
                <div class="member-search-close">&times;</div>
                <div class="member-search-title">Find Member</div>
                <input type="text" class="member-search-input" placeholder="Search for a member...">
                <div class="member-search-results"></div>
            </div>
        `;

    document.body.appendChild(modal);

    // Close modal when clicking the close button
    const closeButton = modal.querySelector(".member-search-close");
    closeButton.addEventListener("click", function () {
      modal.classList.remove("active");
    });

    // Close modal when clicking outside of the search container
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        modal.classList.remove("active");
      }
    });

    // Setup search functionality
    setupSearchFunctionality(modal);

    return modal;
  }

  // Function to setup search functionality
  function setupSearchFunctionality(modal) {
    const searchInput = modal.querySelector(".member-search-input");
    const searchResults = modal.querySelector(".member-search-results");

    // Handle input changes for search
    let debounceTimer;
    searchInput.addEventListener("input", function () {
      clearTimeout(debounceTimer);

      const query = this.value.trim();

      if (query.length < 2) {
        searchResults.innerHTML = "";
        return;
      }

      searchResults.innerHTML =
        '<div class="member-search-loading">Searching...</div>';

      debounceTimer = setTimeout(() => {
        searchMembers(query, searchResults);
      }, 300);
    });

    // Focus input when modal is opened
    modal.addEventListener("transitionend", function () {
      if (modal.classList.contains("active")) {
        searchInput.focus();
      }
    });

    // Also try to focus right away when modal is shown
    // This helps in browsers that don't fire transitionend properly
    const activeObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (
          mutation.attributeName === "class" &&
          modal.classList.contains("active")
        ) {
          searchInput.focus();
        }
      });
    });

    activeObserver.observe(modal, { attributes: true });
  }

  // Function to search for members using the API
  function searchMembers(query, resultsContainer) {
    fetch(
      `https://rpghq.org/forums/mentionloc?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          accept: "application/json, text/javascript, */*; q=0.01",
          "x-requested-with": "XMLHttpRequest",
        },
        credentials: "include",
      }
    )
      .then((response) => response.json())
      .then((data) => {
        displaySearchResults(data, resultsContainer);
      })
      .catch((error) => {
        console.error("Error searching for members:", error);
        resultsContainer.innerHTML =
          '<div class="member-search-no-results">Error searching for members</div>';
      });
  }

  // Function to display search results
  function displaySearchResults(data, resultsContainer) {
    resultsContainer.innerHTML = "";

    // Filter to only include users, exclude groups
    const filteredData = data.filter((item) => item.type === "user");

    if (!filteredData || filteredData.length === 0) {
      resultsContainer.innerHTML =
        '<div class="member-search-no-results">No members found</div>';
      return;
    }

    const fragment = document.createDocumentFragment();

    // No need to sort since we're only showing users now

    filteredData.forEach((item) => {
      const resultItem = document.createElement("div");
      resultItem.className = "member-search-result";

      // User entry
      resultItem.setAttribute("data-user-id", item.user_id);

      // Create avatar URL with proper format
      const userId = item.user_id;
      const username = item.value || item.key || "Unknown User";

      // Default fallback avatar
      const defaultAvatar =
        "https://f.rpghq.org/OhUxAgzR9avp.png?n=pasted-file.png";

      // Create the result item with image that tries multiple extensions
      resultItem.innerHTML = `
        <img 
          src="https://rpghq.org/forums/download/file.php?avatar=${userId}.jpg" 
          alt="${username}'s avatar" 
          onerror="if(this.src.endsWith('.jpg')){this.src='https://rpghq.org/forums/download/file.php?avatar=${userId}.png';}else if(this.src.endsWith('.png')){this.src='https://rpghq.org/forums/download/file.php?avatar=${userId}.gif';}else{this.src='${defaultAvatar}';}"
        >
        <span>${username}</span>
      `;

      resultItem.addEventListener("click", function () {
        const userId = this.getAttribute("data-user-id");
        window.location.href = `https://rpghq.org/forums/memberlist.php?mode=viewprofile&u=${userId}`;
      });

      fragment.appendChild(resultItem);
    });

    resultsContainer.appendChild(fragment);
  }

  // Add the member search button to the navigation bar
  function addMemberSearchButton() {
    const navMain = document.getElementById("nav-main");
    if (!navMain) return;

    // Create the modal first
    const searchModal = createMemberSearchModal();

    // Create the navigation button
    const li = document.createElement("li");
    li.setAttribute("data-skip-responsive", "true");
    const a = document.createElement("a");
    a.href = "#";
    a.role = "menuitem";
    a.innerHTML =
      '<i class="icon fa-user-plus fa-fw" aria-hidden="true"></i><span>Find Member</span>';

    // Add custom styles to the anchor and icon
    a.style.cssText = `
            display: flex;
            align-items: center;
            height: 100%;
            text-decoration: none;
        `;

    // Apply styles after a short delay to ensure the icon is loaded
    setTimeout(() => {
      const icon = a.querySelector(".icon");
      if (icon) {
        icon.style.cssText = `
                    font-size: 14px;
                `;
      }
    }, 100);

    // Add click event to open the search modal
    a.addEventListener("click", function (e) {
      e.preventDefault();
      searchModal.classList.add("active");
      const searchInput = searchModal.querySelector(".member-search-input");
      searchInput.value = "";
      searchInput.focus();
      searchModal.querySelector(".member-search-results").innerHTML = "";
    });

    li.appendChild(a);

    // Try a different approach for inserting the button in the navigation
    // Find a good position for the button, like after Chat or near Members
    const chatItem = Array.from(navMain.children).find(
      (el) =>
        el.textContent.trim().includes("Chat") ||
        el.textContent.trim().includes("IRC")
    );

    // Try to find the Members item again, but look for direct children of navMain
    const membersItem = Array.from(navMain.children).find((el) =>
      el.textContent.trim().includes("Members")
    );

    // Try to insert it after Chat, or Members, or just append to navMain
    if (chatItem && chatItem.parentNode === navMain) {
      navMain.insertBefore(li, chatItem.nextSibling);
    } else if (membersItem && membersItem.parentNode === navMain) {
      navMain.insertBefore(li, membersItem.nextSibling);
    } else {
      // Just append it to the navMain as a safe fallback
      navMain.appendChild(li);
    }
  }

  // Initialize the member search functionality
  addMemberSearchButton();
})();
