(function () {
  "use strict";

  // ---------------------------------------------------------------------
  // 1) SETTINGS
  // ---------------------------------------------------------------------

  const defaultSettings = {
    global: {
      defaultHighlightColor: "#FFFF00",
      defaultAvatar: "",
      toggleButtonVisibility: true,
      keyboardShortcut: "\\",
    },
    users: {},
  };

  let scriptSettings = {
    global: {},
    users: {},
  };

  function loadSettings() {
    scriptSettings = {
      global: GM_getValue("globalSettings", defaultSettings.global),
      users: GM_getValue("userSettings", defaultSettings.users),
    };
  }

  function saveSettings() {
    GM_setValue("globalSettings", scriptSettings.global);
    GM_setValue("userSettings", scriptSettings.users);
  }

  // ---------------------------------------------------------------------
  // 2) CORE FUNCTIONS
  // ---------------------------------------------------------------------

  function isUserIgnored(usernameOrId) {
    if (!usernameOrId) return false;

    const users = scriptSettings.users;

    if (users.hasOwnProperty(usernameOrId)) return true;

    const lowerUsernameOrId = String(usernameOrId).toLowerCase();

    for (const userId in users) {
      if (users[userId].username && users[userId].username.toLowerCase() === lowerUsernameOrId) {
        return true;
      }
    }

    return false;
  }

  // ---------------------------------------------------------------------
  // 3) DOM MANIPULATION
  // ---------------------------------------------------------------------

  function processPost(post) {
    const usernameEl = post.querySelector(".username, .username-coloured");
    if (!usernameEl) return;

    const username = usernameEl.textContent.trim();
    if (isUserIgnored(username)) {
      post.style.display = "none";
    }
  }

  // ---------------------------------------------------------------------
  // 4) UI
  // ---------------------------------------------------------------------

  function addSettingsUI() {
    // Add a button to the user dropdown menu
    const dropdown = document.querySelector("#username_logged_in .dropdown-contents");
    if (dropdown && !document.getElementById("show-ignored-users-button")) {
      const listItem = document.createElement("li");
      const showButton = document.createElement("a");
      showButton.id = "show-ignored-users-button";
      showButton.href = "#";
      showButton.title = "Ghosted Users";
      showButton.role = "menuitem";
      showButton.innerHTML =
        '<i class="icon fa-ban fa-fw" aria-hidden="true"></i><span>Ghosted Users</span>';

      showButton.addEventListener("click", function (e) {
        e.preventDefault();
        showIgnoredUsersPopup();
      });

      listItem.appendChild(showButton);
      dropdown.insertBefore(listItem, dropdown.lastElementChild);
    }
  }

  function showIgnoredUsersPopup() {
    // Create popup container
    const popup = document.createElement("div");
    popup.id = "ignored-users-popup";
    popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #2a2e36;
      border: 1px solid #3a3f4b;
      border-radius: 5px;
      width: 80%;
      max-width: 600px;
      height: 80%;
      max-height: 600px;
      display: flex;
      flex-direction: column;
      z-index: 9999;
      font-family: 'Open Sans', 'Droid Sans', Arial, Verdana, sans-serif;
    `;

    // Header with title and close button
    const header = document.createElement("div");
    header.style.cssText = `
      padding: 10px;
      background-color: #2a2e36;
      border-bottom: 1px solid #3a3f4b;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    const title = document.createElement("h2");
    title.textContent = "Ghosted Users";
    title.style.cssText = "margin: 0; color: #c5d0db; font-size: 1.2em;";
    const closeButton = document.createElement("button");
    closeButton.textContent = "×";
    closeButton.style.cssText = `
      background-color: transparent;
      color: #c5d0db;
      border: none;
      font-size: 1.5em;
      cursor: pointer;
    `;
    closeButton.onclick = () => document.body.removeChild(popup);
    header.appendChild(title);
    header.appendChild(closeButton);

    // Content area for the user list
    const content = document.createElement("div");
    content.style.cssText = `
      padding: 10px;
      overflow-y: auto;
      flex-grow: 1;
      background-color: #2a2e36;
    `;
    const userList = document.createElement("ul");
    userList.style.cssText = `
      list-style-type: none;
      padding: 0;
      margin: 0;
    `;

    // Render user list
    const userEntries = Object.entries(scriptSettings.users).map(
      ([userId, user]) => ({
        userId,
        username: user.username || "Unknown User",
      })
    );

    userEntries.sort((a, b) => a.username.localeCompare(b.username));

    userEntries.forEach(({ userId, username }) => {
      const listItem = document.createElement("li");
      listItem.style.cssText = `
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        padding: 5px;
        border-bottom: 1px solid #3a3f4b;
      `;

      const unghostedButton = document.createElement("button");
      unghostedButton.textContent = "Unghost";
      unghostedButton.style.cssText = `
        background-color: #4a5464;
        color: #c5d0db;
        border: none;
        padding: 2px 5px;
        border-radius: 3px;
        cursor: pointer;
        margin-right: 10px;
        font-size: 0.8em;
      `;
      unghostedButton.onclick = () => {
        delete scriptSettings.users[userId];
        saveSettings();
        listItem.remove();
        if (userList.children.length === 0) {
          userList.innerHTML =
            '<p style="color: #c5d0db;">No ghosted users.</p>';
        }
      };

      const userLink = document.createElement("a");
      userLink.href = `https://rpghq.org/forums/memberlist.php?mode=viewprofile&u=${userId}`;
      userLink.textContent = username;
      userLink.style.cssText =
        "color: #4a90e2; text-decoration: none; flex-grow: 1;";

      listItem.appendChild(unghostedButton);
      listItem.appendChild(userLink);
      userList.appendChild(listItem);
    });

    if (Object.keys(scriptSettings.users).length === 0) {
      userList.innerHTML = '<p style="color: #c5d0db;">No ghosted users.</p>';
    }

    content.appendChild(userList);

    // Bottom controls with buttons
    const bottomControls = document.createElement("div");
    bottomControls.style.cssText = `
      padding: 10px;
      background-color: #2a2e36;
      border-top: 1px solid #3a3f4b;
      text-align: center;
      display: flex;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
    `;

    // Mass Unghost button
    const massUnghostButton = document.createElement("button");
    massUnghostButton.innerHTML =
      '<i class="icon fa-trash fa-fw" aria-hidden="true"></i> Unghost All';
    massUnghostButton.style.cssText = `
      background-color: #4a5464;
      color: #c5d0db;
      border: none;
      padding: 5px 10px;
      border-radius: 3px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
    `;
    massUnghostButton.onclick = () => {
      if (confirm("Are you sure you want to unghost all users?")) {
        scriptSettings.users = {};
        saveSettings();
        userList.innerHTML = '<p style="color: #c5d0db;">No ghosted users.</p>';
        alert("All users have been unghosted.");
      }
    };

    bottomControls.appendChild(massUnghostButton);

    // Assemble the popup
    popup.appendChild(header);
    popup.appendChild(content);
    popup.appendChild(bottomControls);
    document.body.appendChild(popup);
  }

  function addGhostButtonsIfOnProfile() {
    const memberlistTitle = document.querySelector(".memberlist-title");
    if (!memberlistTitle || document.getElementById("ghost-user-button"))
      return;
    const userId = getUserIdFromUrl();

    // Get just the direct text content, not including child divs
    const titleText = Array.from(memberlistTitle.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent.trim())
      .join(" ");

    // Extract the username after the dash
    const parts = titleText.split("-");
    let username = parts[1]?.trim() || "Unknown User";

    // Clean the username to remove any button text that might have been included
    username = cleanUsername(username);

    if (!userId) return;
    const container = document.createElement("div");
    container.style.display = "inline-block";
    container.style.marginLeft = "10px";
    const ghostBtn = document.createElement("a");
    ghostBtn.id = "ghost-user-button";
    ghostBtn.className = "button button-secondary";
    ghostBtn.href = "#";
    const replaceBtn = document.createElement("a");
    replaceBtn.id = "replace-avatar-button";
    replaceBtn.className = "button button-secondary";
    replaceBtn.href = "#";
    replaceBtn.textContent = "Replace Avatar";
    replaceBtn.style.marginLeft = "5px";
    container.appendChild(ghostBtn);
    container.appendChild(replaceBtn);
    memberlistTitle.appendChild(container);
    function refreshGhostBtn() {
      const isGhosted = scriptSettings.users.hasOwnProperty(userId);
      ghostBtn.textContent = isGhosted ? "Unghost User" : "Ghost User";
      ghostBtn.title = isGhosted
        ? "Stop ignoring this user"
        : "Ignore this user";
    }
    refreshGhostBtn();
    ghostBtn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleUserGhost(userId, username);
      refreshGhostBtn();
    });
    replaceBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showReplaceAvatarPopup(userId);
    });
  }

  function getUserIdFromUrl() {
    const match = window.location.href.match(/u=(\d+)/);
    return match ? match[1] : null;
  }

  function toggleUserGhost(userId, username) {
    if (scriptSettings.users.hasOwnProperty(userId)) {
      delete scriptSettings.users[userId];
      saveSettings();
    } else {
      scriptSettings.users[userId] = { username: username };
      saveSettings();
    }
  }

  function cleanUsername(username) {
    if (!username) return "";

    // First remove any HTML tags that might be in the username
    let cleaned = username.replace(/<[^>]*>/g, "");

    // Remove "Never Iggy" and other button text that might be in the username
    cleaned = cleaned.replace(
      /never iggy|unghost user|replace avatar|ghost user/gi,
      ""
    );

    // Remove any extra whitespace
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    return cleaned;
  }

  let replacedAvatars = GM_getValue("replacedAvatars", {});

  function validateAndReplaceAvatar(userId, url) {
    const testImg = new Image();
    testImg.onload = function () {
      if (this.width <= 128 && this.height <= 128) {
        replacedAvatars[userId] = url;
        GM_setValue("replacedAvatars", replacedAvatars);
        alert("Avatar replaced!");
        replaceUserAvatars();
      } else {
        alert("Image must be 128x128 or smaller.");
      }
    };
    testImg.onerror = function () {
      alert("Could not load image from the provided URL.");
    };
    testImg.src = url;
  }

  function replaceUserAvatars() {
    document.querySelectorAll("img").forEach((img) => {
      const match = img.src.match(/avatar=(\d+)/);
      if (match) {
        const uid = match[1];
        if (replacedAvatars.hasOwnProperty(uid)) {
          img.src = replacedAvatars[uid];
        }
      }
    });
  }

  function startPeriodicAvatarCheck() {
    replaceUserAvatars();
    setInterval(replaceUserAvatars, 1500);
  }

  function showReplaceAvatarPopup(userId) {
    const popup = document.createElement("div");
    popup.style.cssText = `
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background-color: #2a2a2a; color: #e0e0e0; padding: 20px;
      border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.5); z-index: 9999;
      width: 300px;
    `;
    const title = document.createElement("h3");
    title.textContent = "Replace Avatar";
    title.style.marginTop = "0";
    title.style.marginBottom = "15px";
    popup.appendChild(title);
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter image URL (128x128 or smaller)";
    input.style.cssText = `
      width: 100%; padding: 5px; margin-bottom: 15px; background: #3a3a3a;
      border: 1px solid #4a4a4a; color: #e0e0e0; border-radius: 3px;
    `;
    popup.appendChild(input);
    const btnContainer = document.createElement("div");
    btnContainer.style.display = "flex";
    btnContainer.style.justifyContent = "space-between";
    popup.appendChild(btnContainer);
    function makeBtn(label) {
      const b = document.createElement("button");
      b.textContent = label;
      b.style.cssText = `
        background-color: #3a3a3a; color: #e0e0e0; border: none;
        padding: 5px 10px; border-radius: 3px; cursor: pointer;
      `;
      b.addEventListener(
        "mouseover",
        () => (b.style.backgroundColor = "#4a4a4a")
      );
      b.addEventListener(
        "mouseout",
        () => (b.style.backgroundColor = "#3a3a3a")
      );
      return b;
    }
    const replaceB = makeBtn("Replace");
    replaceB.addEventListener("click", () => {
      validateAndReplaceAvatar(userId, input.value);
      document.body.removeChild(popup);
    });
    const resetB = makeBtn("Reset to Default");
    resetB.addEventListener("click", () => {
      replacedAvatars = GM_getValue("replacedAvatars", {});
      delete replacedAvatars[userId];
      GM_setValue("replacedAvatars", replacedAvatars);
      alert("Avatar reset to default.");
      replaceUserAvatars();
      document.body.removeChild(popup);
    });
    const cancelB = makeBtn("Cancel");
    cancelB.addEventListener("click", () => {
      document.body.removeChild(popup);
    });
    btnContainer.appendChild(replaceB);
    btnContainer.appendChild(resetB);
    btnContainer.appendChild(cancelB);
    document.body.appendChild(popup);
  }

  // ---------------------------------------------------------------------
  // 5) INITIALIZATION
  // ---------------------------------------------------------------------

  function initialize() {
    loadSettings();
    addSettingsUI();
    addGhostButtonsIfOnProfile();
    startPeriodicAvatarCheck();

    // Observe DOM and process content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.classList.contains("post")) {
              processPost(node);
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ---------------------------------------------------------------------
  // 6) RUN ON DOMContentLoaded
  // ---------------------------------------------------------------------

  document.addEventListener("DOMContentLoaded", initialize);
})();
