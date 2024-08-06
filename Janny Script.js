// ==UserScript==
// @name         RPGHQ Moderator Control Panel Enhancer
// @namespace    https://rpghq.org/
// @version      1.0
// @description  Enhance the look of posts in the moderator control panel to match the forum posts, including profile pictures, fixing post width, adding a fade effect for long posts, and adding a "Show More" button
// @author       loregamer
// @match        https://rpghq.org/forums/mcp.php?*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const defaultAvatarUrl =
    "https://f.rpghq.org/98ltUBUmxF3M.png?n=Vergstarion.png";
  const avatarExtensions = [".gif", ".jpeg", ".jpg", ".png"];
  const postMaxHeight = "300px"; // Set the maximum height for a post before adding the fade effect

  // Add custom styles to make the moderator control panel posts look like forum posts
  const style = document.createElement("style");
  style.innerHTML = `
        .postbody .content blockquote {
            background-color: #171b24 !important;
            border-color: #303744 !important;
            padding: 10px !important;
            margin: 10px 0 !important;
            width: 100% !important;
            box-sizing: border-box !important;
        }

        .postbody .content blockquote blockquote {
            background-color: #242a36 !important;
        }

        .postbody .content blockquote blockquote blockquote {
            background-color: #171b24 !important;
        }

        .postbody .content blockquote blockquote blockquote blockquote {
            background-color: #242a36 !important;
        }
        .post.bg2, .post.bg1, .post.bg3 {
            background-color: #282f3c !important; /* Match forum background color */
            border: 1px solid #303744 !important; /* Match forum border color */
            padding: 10px !important; /* Add padding */
            margin-bottom: 5px !important; /* Reduced margin between posts */
            border-radius: 5px !important; /* Rounded corners */
            display: flex !important;
            flex-direction: row !important;
            position: relative !important; /* Ensure relative positioning for absolute children */
            width: calc(100% - 20px) !important; /* Set width to 100% minus padding */
            margin-right: 10px !important; /* Ensure some space on the right */
            cursor: pointer !important; /* Pointer cursor to indicate clickable */
            overflow: hidden !important; /* Hide overflow */
        }
        /* Add this new rule to override any existing styles */
        .post.bg3 {
            background-color: #282f3c !important;
        }
        .inner {
            width: 100% !important; /* Ensure inner div takes full width */
        }
        .postprofile {
            width: 150px !important; /* Fixed width for post profile */
            text-align: left !important; /* Left align */
            padding: 10px !important; /* Ensure padding for consistent spacing */
        }
        .postprofile .avatar-container {
            margin-bottom: 10px !important;
            text-align: center !important; /* Center the avatar */
        }
        .postprofile img.avatar {
            width: 128px !important;
            height: auto !important; /* Ensure image respects aspect ratio */
            display: none; /* Initially hide the avatar for lazy loading */
        }
        .postbody {
            flex-grow: 1 !important;
            padding-left: 10px !important;
            padding-right: 10px !important; /* Ensure padding on both sides */
            max-height: ${postMaxHeight}; /* Set maximum height */
            overflow: hidden; /* Hide overflow */
            position: relative; /* Ensure relative positioning */
        }
        .postbody h3, .postbody .author, .postbody .content {
            margin-bottom: 10px !important;
        }
        .postbody .author {
            font-size: 0.9em !important;
            color: #aaa !important;
        }
        a, .postlink {
            display: inline-block !important; /* Ensure the link only takes up the width of the text */
            max-width: max-content !important; /* Ensure the link only takes up the width of the text */
        }
        .username, .username-coloured {
            display: inline-block !important; /* Ensure the link only takes up the width of the text */
            text-align: left !important; /* Left align */
        }
        .post h3 a {
            color: #9cc3db !important;
        }
        .post .content {
            flex-direction: column;
            gap: 10px; /* Add gap between content elements */
        }
        .post img {
            pointer-events: none !important; /* Make images non-clickable */
            max-width: 100% !important; /* Ensure images are not upscaled */
            height: auto !important; /* Maintain aspect ratio */
        }
        .dt-layout-row, .dt-layout-table {
            display: none !important;
        }
        .dt-layout-row-placeholder, .dt-layout-table-placeholder {
            display: block !important;
            background-color: #444 !important;
            color: #fff !important;
            padding: 10px !important;
            border-radius: 5px !important;
            text-align: center !important;
            margin-bottom: 10px !important;
        }
        .post.selected {
            background-color: #ff9999 !important; /* Red highlight for selected post */
        }
        .show-more-button {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            text-align: center;
            background: linear-gradient(to bottom, rgba(23, 27, 36, 0), rgba(23, 27, 36, 0.8) 70%, rgba(23, 27, 36, 1));
            padding: 30px 10px 10px;
            cursor: pointer;
            color: #9cc3db;
        }
        .display-actions {
            position: fixed !important;
            bottom: 10px !important;
            right: 20px !important; /* Add padding to the right */
            background: rgba(0, 0, 0, 0.5) !important; /* Add semi-transparent background */
            padding: 10px !important;
            border-radius: 5px !important;
            z-index: 100 !important; /* Ensure display-actions are above other elements */
        }
        .post-buttons {
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 10;
            box-shadow: none !important; /* Remove the box shadow */
        }
        .username-loregamer {
            font-family: 'Comic Sans MS', cursive, sans-serif;
        }
        .table-placeholder, .codebox-placeholder {
            background-color: #1e2330 !important;
            color: #9cc3db !important;
            padding: 15px !important;
            border-radius: 5px !important;
            text-align: center !important;
            margin: 10px 0 !important;
            border: 1px solid #303744 !important;
            font-style: italic !important;
        }

        .table-placeholder::before, .codebox-placeholder::before {
            content: '⚠️ ';
            font-style: normal !important;
        }

        .table-placeholder::after {
            content: ' (Table content hidden because who cares)';
            font-size: 0.9em !important;
        }

        .codebox-placeholder::after {
            content: ' (Code block hidden because it is annoying)';
            font-size: 0.9em !important;
        }

        .panel.floating-panel {
            position: fixed !important;
            top: 20px !important;
            width: 16% !important;
            background-color: #171B24 !important;
            border: 1px solid #171B24 !important;
            border-radius: 8px !important;
            padding: 15px !important;
            z-index: 1000 !important;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
            transition: all 0.3s ease !important;
        }

        .panel.floating-panel * {
            text-align: left !important;
        }

        .panel.floating-panel h3 {
            margin-top: 0 !important;
            margin-bottom: 15px !important;
            font-size: 16px !important;
            color: #9cc3db !important;
            border-bottom: 1px solid #303744 !important;
            padding-bottom: 5px !important;
        }

        .panel.floating-panel label {
            display: block !important;
            margin-bottom: 5px !important;
            color: #9cc3db !important;
        }

        .panel.floating-panel select,
        .panel.floating-panel input[type="number"],
        .panel.floating-panel input[type="text"] {
            width: 100% !important;
            margin-bottom: 10px !important;
            padding: 5px !important;
            background-color: #282f3c !important;
            border: 1px solid #3b5a76 !important;
            color: #9cc3db !important;
            border-radius: 4px !important;
        }

        .panel.floating-panel .button2 {
            width: 100% !important;
            padding: 8px !important;
            background-color: #3b5a76 !important;
            color: #fff !important;
            border: none !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            transition: background-color 0.2s !important;
            margin-top: 10px !important;
        }

        .panel.floating-panel .button2:hover {
            background-color: #4c7191 !important;
        }

        .panel.floating-panel .form-group {
            margin-bottom: 15px !important;
        }

        .panel.floating-panel input[type="radio"] {
            margin-right: 5px !important;
        }

        .panel.floating-panel input[type="radio"] + img {
            vertical-align: middle !important;
            margin-right: 5px !important;
        }

        .panel.floating-panel .icon-container {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 5px !important;
            margin-bottom: 10px !important;
        }

        .panel.floating-panel .icon-container label {
            display: flex !important;
            align-items: center !important;
            margin-right: 5px !important;
            margin-bottom: 5px !important;
        }

        .panel.floating-panel .icon-container input[type="radio"] {
            margin-right: 3px !important;
        }

        .panel.floating-panel .icon-container img {
            width: 16px !important;
            height: 16px !important;
        }
    `;
  document.head.appendChild(style);

  // Function to create the post profile
  function createPostProfile(authorElement, userId, username) {
    const postProfile = document.createElement("div");
    const userColor = getComputedStyle(authorElement).color;
    const userClass = authorElement.className.includes("username-coloured")
      ? "username-coloured"
      : "username";
    postProfile.className = "postprofile";
    postProfile.innerHTML = `
            <div class="avatar-container">
                <a href="./memberlist.php?mode=viewprofile&u=${userId}" class="avatar">
                    <img class="avatar" src="${defaultAvatarUrl}" width="128" height="128" alt="User avatar">
                </a>
            </div>
            <a href="./memberlist.php?mode=viewprofile&u=${userId}" class="${userClass}" style="color:${userColor};">${username}</a>
        `;
    return postProfile;
  }

  // Function to find the correct avatar URL
  async function findAvatarUrl(userId, avatarImg) {
    for (const ext of avatarExtensions) {
      const avatarUrl = `https://rpghq.org/forums/download/file.php?avatar=${userId}${ext}`;
      try {
        const response = await fetch(avatarUrl);
        if (response.ok) {
          avatarImg.src = avatarUrl;
          avatarImg.style.display = "block"; // Display the avatar
          return;
        }
      } catch (error) {
        // Ignore the error and try the next extension
      }
    }
    avatarImg.src = defaultAvatarUrl;
    avatarImg.style.display = "block"; // Display the default avatar
  }

  // Function to toggle the selected state of a post
  function togglePostSelection(post, event) {
    const checkbox = post.querySelector('input[type="checkbox"]');
    const interactiveElements = [
      "a",
      "button",
      "input",
      "img",
      "textarea",
      "select",
    ];
    const isInteractiveElement = interactiveElements.includes(
      event.target.tagName.toLowerCase()
    );
    const hasInteractiveParent = event.target.closest(
      interactiveElements.join(",")
    );
    const isSpoilerElement = event.target.closest(
      ".spoilwrapper, .spoiltitle, .spoilbtn, .spoilcontent"
    );

    if (
      !isInteractiveElement &&
      !hasInteractiveParent &&
      !isSpoilerElement &&
      event.target.className !== "show-more-button"
    ) {
      checkbox.checked = !checkbox.checked;
      syncPostSelection(post);
    }
  }

  // Function to sync the selected state of the post with the checkbox
  function syncPostSelection(post) {
    const checkbox = post.querySelector('input[type="checkbox"]');
    if (checkbox.checked) {
      post.classList.add("selected");
      post.style.setProperty("border", "1px solid #ff6666", "important");
    } else {
      post.classList.remove("selected");
      post.style.setProperty("border", "1px solid #303744", "important");
    }
  }

  // Function to add the "Show More" button with fade effect
  function addShowMoreButton(post) {
    const postbody = post.querySelector(".postbody");
    const showMoreButton = document.createElement("div");
    showMoreButton.className = "show-more-button";
    showMoreButton.textContent = "Read more ...";
    showMoreButton.onclick = function () {
      postbody.style.maxHeight = "none";
      showMoreButton.style.display = "none";
    };
    postbody.appendChild(showMoreButton);
  }

  // Function to create placeholders for tables and codeboxes
  function createPlaceholders() {
    document.querySelectorAll(".postbody .content table").forEach((table) => {
      const placeholder = document.createElement("div");
      placeholder.className = "table-placeholder";
      placeholder.textContent = "Table placeholder";
      table.parentNode.replaceChild(placeholder, table);
    });

    document
      .querySelectorAll(".postbody .content .codebox")
      .forEach((codebox) => {
        const placeholder = document.createElement("div");
        placeholder.className = "codebox-placeholder";
        placeholder.textContent = "Code block placeholder";
        codebox.parentNode.replaceChild(placeholder, codebox);
      });
  }

  // Modify the structure of each post to match forum posts
  document.querySelectorAll(".post").forEach((post) => {
    const authorElement = post.querySelector(
      ".author strong a.username, .author strong a.username-coloured"
    );
    const postId = post.id.replace("p", "");

    if (authorElement) {
      const userId = authorElement.href.match(/u=(\d+)-/)[1];
      const username = authorElement.textContent;

      const postProfile = createPostProfile(authorElement, userId, username);
      const avatarImg = postProfile.querySelector("img.avatar");

      // Load the avatar lazily
      setTimeout(() => {
        findAvatarUrl(userId, avatarImg);
      }, 0);

      post.insertBefore(postProfile, post.firstChild);

      // Adjust post content structure
      const h3Element = post.querySelector("h3");
      if (h3Element) {
        h3Element.remove();
      }

      const postbody = post.querySelector(".postbody");
      if (postbody) {
        const postContent = postbody.querySelector(".content");
        const postAuthor = postbody.querySelector(".author");
        if (postContent && postAuthor) {
          postbody.insertBefore(postAuthor, postContent);
        }

        // Add "Show More" button if the post is too long
        if (postbody.scrollHeight > postbody.clientHeight) {
          addShowMoreButton(post);
        }
      }

      // Ensure original post buttons are visible
      const originalPostButtons = post.querySelector(".post-buttons");
      if (originalPostButtons) {
        originalPostButtons.style.display = "block";
      }

      // Make the whole post selectable
      post.addEventListener("click", (event) => {
        togglePostSelection(post, event);
      });

      // Sync the selected state with the checkbox
      syncPostSelection(post);

      // Monitor checkbox changes to sync selection
      const checkbox = post.querySelector('input[type="checkbox"]');
      checkbox.addEventListener("change", () => {
        syncPostSelection(post);
      });

      // Apply special style for "loregamer" username
      if (username === "loregamer") {
        post.querySelector(".username").classList.add("username-loregamer");
        post
          .querySelector(
            'a[href*="memberlist.php?mode=viewprofile&u=551-loregamer"]'
          )
          .classList.add("username-loregamer");
      }
    }
  });

  document
    .querySelectorAll(".post.bg2, .post.bg1, .post.bg3")
    .forEach((post) => {
      post.removeAttribute("style");
      post.style.setProperty("background-color", "#202633", "important");
      post.style.setProperty("border", "1px solid #303744", "important");
    });

  // Observe changes in the document to ensure synchronization
  const observer = new MutationObserver(() => {
    document.querySelectorAll(".post").forEach((post) => {
      syncPostSelection(post);
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Handle "Mark all" and "Unmark all" clicks
  document.querySelectorAll(".display-actions a").forEach((actionLink) => {
    actionLink.addEventListener("click", () => {
      setTimeout(() => {
        document.querySelectorAll(".post").forEach((post) => {
          syncPostSelection(post);
        });
      }, 0); // Delay to ensure checkboxes are updated first
    });
  });

  // Click "Expand View" and hide the button
  function clickExpandView() {
    const expandViewButton = document.querySelector(".right-box a");
    if (
      expandViewButton &&
      expandViewButton.textContent.includes("Expand view")
    ) {
      expandViewButton.click();
      expandViewButton.style.display = "none";
    }
  }

  window.addEventListener("load", clickExpandView);

  // Make the display actions float until they are scrolled to
  const displayActions = document.querySelector(".display-actions");
  if (displayActions) {
    window.addEventListener("scroll", () => {
      const rect = displayActions.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom >= 0) {
        displayActions.style.position = "static";
      } else {
        displayActions.style.position = "fixed";
      }
    });
  }

  // Call the function to create placeholders
  createPlaceholders();

  // Make the top panel float when scrolled past
  function createFloatingPanel() {
    const originalPanel = document.querySelector(".panel:first-of-type");
    const floatingPanel = originalPanel.cloneNode(true);
    floatingPanel.classList.add("floating-panel");
    document.body.appendChild(floatingPanel);

    // Add custom styles for the floating panel
    const style = document.createElement("style");
    style.textContent = `
        .floating-panel {
            position: fixed !important;
            top: 20px !important;
            left: 20px !important;
            width: 16% !important;
            background-color: #1e2330 !important;
            border: 1px solid #303744 !important;
            border-radius: 5px !important;
            padding: 15px !important;
            z-index: 1000 !important;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
            color: #9cc3db !important;
        }
        .floating-panel * {
            text-align: left !important;
            font-size: 14px !important;
        }
        .floating-panel h3 {
            margin-top: 0 !important;
            margin-bottom: 15px !important;
            font-size: 16px !important;
            color: #fff !important;
            border-bottom: 1px solid #303744 !important;
            padding-bottom: 5px !important;
        }
        .floating-panel input[type="number"],
        .floating-panel input[type="text"],
        .floating-panel select,
        .floating-panel .button2 {
            width: 100% !important;
            margin-bottom: 10px !important;
            background-color: #282f3c !important;
            border: 1px solid #3b5a76 !important;
            color: #9cc3db !important;
            padding: 5px !important;
            border-radius: 3px !important;
            box-sizing: border-box !important;
        }
        .floating-panel .button2 {
            margin-top: 10px !important;
            background-color: #3b5a76 !important;
            color: #fff !important;
            border: none !important;
            cursor: pointer !important;
        }
        .floating-panel dl {
            margin-bottom: 10px !important;
        }
        .floating-panel dt {
            margin-bottom: 5px !important;
        }
        .floating-panel dd {
            margin-left: 0 !important;
        }
        .floating-panel .sort-options select {
            margin-bottom: 2px !important;
        }
    `;
    document.head.appendChild(style);

    // Function to update panel content based on selected tab
    function updatePanelContent() {
      const activeTab = document.querySelector("#minitabs .tab.activetab a");
      const activePanel = activeTab
        ? activeTab.getAttribute("data-subpanel")
        : "display-panel";

      floatingPanel.querySelectorAll("fieldset").forEach((fieldset) => {
        fieldset.style.display = "none";
      });

      const activeFieldset = floatingPanel.querySelector(`#${activePanel}`);
      if (activeFieldset) {
        activeFieldset.style.display = "block";
      }
    }

    // Modify the structure of the floating panel to include all options
    const displayPanel = floatingPanel.querySelector("#display-panel");
    const splitPanel = floatingPanel.querySelector("#split-panel");
    const mergePanel = floatingPanel.querySelector("#merge-panel");

    if (displayPanel) {
      displayPanel.innerHTML = `
            <h3>DISPLAY OPTIONS</h3>
            <dl>
                <dt>Posts per page:</dt>
                <dd><input type="number" name="posts_per_page" id="posts_per_page" value="5" min="0" max="999999"></dd>
            </dl>
            <dl>
                <dt>Display posts from previous:</dt>
                <dd><select name="st" id="st">${
                  originalPanel.querySelector('select[name="st"]').innerHTML
                }</select></dd>
            </dl>
            <dl>
                <dt>Sort by</dt>
                <dd class="sort-options">
                    <select name="sk" id="sk">${
                      originalPanel.querySelector('select[name="sk"]').innerHTML
                    }</select>
                    <select name="sd" id="sd">${
                      originalPanel.querySelector('select[name="sd"]').innerHTML
                    }</select>
                </dd>
            </dl>
            <input type="submit" name="sort" value="Go" class="button2">
        `;
    }

    if (splitPanel) {
      splitPanel.innerHTML = `
            <h3>SPLIT TOPIC</h3>
            <p>Using the form below you can split a topic in two, either by selecting the posts individually or by splitting at a selected post.</p>
            <dl>
                <dt>New topic title:</dt>
                <dd><input type="text" name="subject" id="subject" maxlength="124" class="inputbox"></dd>
            </dl>
            <dl>
                <dt>Forum for new topic:</dt>
                <dd><select name="to_forum_id">${
                  originalPanel.querySelector('select[name="to_forum_id"]')
                    .innerHTML
                }</select></dd>
            </dl>
            <input type="submit" name="split_submit" value="Split topic" class="button2">
        `;
    }

    if (mergePanel) {
      mergePanel.innerHTML = `
            <h3>MOVE POSTS</h3>
            <p>Using the form below you can move selected posts into another topic. The posts will be split from this topic and merged into the other topic.</p>
            <dl>
                <dt>Destination topic ID:</dt>
                <dd><input type="number" name="to_topic_id" id="to_topic_id" min="0" max="9999999999"></dd>
            </dl>
            <input type="submit" name="merge_submit" value="Move posts" class="button2">
        `;
    }

    // Sync changes between the original panel and the floating panel
    function syncPanels() {
      const originalPanel = document.querySelector(".panel:first-of-type");
      const floatingPanel = document.querySelector(".panel.floating-panel");

      if (!originalPanel || !floatingPanel) return;

      const inputSelectors = [
        'input[name="posts_per_page"]',
        'select[name="st"]',
        'select[name="sk"]',
        'select[name="sd"]',
        'input[name="subject"]',
        'select[name="to_forum_id"]',
        'input[name="to_topic_id"]',
      ];

      inputSelectors.forEach((selector) => {
        const originalInput = originalPanel.querySelector(selector);
        const floatingInput = floatingPanel.querySelector(selector);

        if (originalInput && floatingInput) {
          originalInput.addEventListener("input", () => {
            floatingInput.value = originalInput.value;
          });
          floatingInput.addEventListener("input", () => {
            originalInput.value = floatingInput.value;
          });
        }
      });

      // Sync radio buttons for topic icons
      const iconRadios = floatingPanel.querySelectorAll('input[name="icon"]');
      iconRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
          const originalRadio = originalPanel.querySelector(
            `input[name="icon"][value="${radio.value}"]`
          );
          if (originalRadio) {
            originalRadio.checked = true;
          }
        });
      });

      // Add click events for submit buttons
      floatingPanel.querySelectorAll(".button2").forEach((button) => {
        button.addEventListener("click", (e) => {
          e.preventDefault();
          const originalButton = originalPanel.querySelector(
            `[name="${button.name}"]`
          );
          if (originalButton) {
            originalButton.click();
          }
        });
      });
    }

    syncPanels();
    updatePanelContent(); // Initial update

    // Observe changes in the minitabs to update the floating panel
    const minitabs = document.querySelector("#minitabs");
    const observer = new MutationObserver(updatePanelContent);
    observer.observe(minitabs, { attributes: true, subtree: true });

    // Show/hide floating panel based on original panel visibility
    function toggleFloatingPanelVisibility() {
      const originalPanelRect = originalPanel.getBoundingClientRect();
      if (
        originalPanelRect.top < window.innerHeight &&
        originalPanelRect.bottom >= 0
      ) {
        floatingPanel.style.display = "none";
      } else {
        floatingPanel.style.display = "block";
      }
    }

    window.addEventListener("scroll", toggleFloatingPanelVisibility);
    window.addEventListener("resize", toggleFloatingPanelVisibility);
    toggleFloatingPanelVisibility(); // Initial check
  }

  createFloatingPanel();
})();
