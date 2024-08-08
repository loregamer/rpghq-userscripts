// ==UserScript==
// @name         RPGHQ Moderator Control Panel Enhancer
// @namespace    https://rpghq.org/
// @version      2.1.2
// @description  Enhance the look of posts in the moderator control panel to match the forum posts, including profile pictures, fixing post width, adding a fade effect for long posts, and adding a "Show More" button
// @author       loregamer
// @match        https://rpghq.org/forums/mcp.php?*mode=topic_view*
// @updateURL    https://raw.githubusercontent.com/loregamer/rpghq-userscripts/main/Janny%20Script.js
// @downloadURL  https://raw.githubusercontent.com/loregamer/rpghq-userscripts/main/Janny%20Script.js
// @grant        GM_getResourceText
// @grant        GM_xmlhttpRequest
// @grant        GM_info
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
    .post.bg2,
    .post.bg1,
    .post.bg3 {
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
    .postbody h3,
    .postbody .author,
    .postbody .content {
      margin-bottom: 10px !important;
    }
    .postbody .author {
      font-size: 0.9em !important;
      color: #aaa !important;
    }
    a,
    .postlink {
      display: inline-block !important; /* Ensure the link only takes up the width of the text */
      max-width: max-content !important; /* Ensure the link only takes up the width of the text */
    }
    .username,
    .username-coloured {
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
    .dt-layout-row,
    .dt-layout-table {
      display: none !important;
    }
    .dt-layout-row-placeholder,
    .dt-layout-table-placeholder {
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
      background: linear-gradient(
        to bottom,
        rgba(23, 27, 36, 0),
        rgba(23, 27, 36, 0.8) 70%,
        rgba(23, 27, 36, 1)
      );
      padding: 30px 10px 10px;
      cursor: pointer;
      color: #9cc3db;
    }
    .display-actions {
      position: fixed !important;
      bottom: 10px !important;
      right: 20px !important; /* Add padding to the right */
      background: rgba(
        0,
        0,
        0,
        0.5
      ) !important; /* Add semi-transparent background */
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
      font-family: "Comic Sans MS", cursive, sans-serif;
    }
    .table-placeholder,
    .codebox-placeholder {
      background-color: #1e2330 !important;
      color: #9cc3db !important;
      padding: 15px !important;
      border-radius: 5px !important;
      text-align: center !important;
      margin: 10px 0 !important;
      border: 1px solid #303744 !important;
      font-style: italic !important;
    }

    .table-placeholder::before,
    .codebox-placeholder::before {
      content: "⚠️ ";
      font-style: normal !important;
    }

    .table-placeholder::after {
      content: " (Table content hidden because who cares)";
      font-size: 0.9em !important;
    }

    .codebox-placeholder::after {
      content: " (Code block hidden because it is annoying)";
      font-size: 0.9em !important;
    }
    .floating-panel {
      background-color: #171b24 !important;
      border: 1px solid #303744 !important;
      border-radius: 5px !important;
      color: #9cc3db !important;
      overflow: hidden !important;
    }
    .floating-panel * {
      text-align: left !important;
    }
    .floating-panel .inner {
      padding: 10px !important;
      box-sizing: border-box !important;
    }
    .floating-panel h3 {
      margin-top: 0 !important;
      margin-bottom: 10px !important;
      font-size: 16px !important;
      color: #9cc3db !important;
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
    floating-panel label {
      display: block !important;
      margin-bottom: 5px !important;
      color: #9cc3db !important;
    }
    .floating-panel-wrapper {
      display: none; /* Initially hidden */
      position: absolute;
      top: 0;
      right: 0;
      width: 100%;
      max-width: 300px; /* Adjust width as needed */
      z-index: 1000; /* Ensure it stays on top */
      border-radius: 5px;
      padding: 10px;
      box-sizing: border-box;
    }
    .floating-minitabs-override {
      margin: 0 !important;
      padding: 0 !important;
      max-width: 100% !important;
      width: 100% !important;
      box-sizing: border-box !important;
      position: relative !important; /* Add this */
      top: 1px !important; /* Move down by 1px */
      z-index: 1 !important; /* Ensure tabs are above the panel */
    }

    .floating-minitabs-override ul {
      display: flex !important;
      flex-wrap: nowrap !important;
      width: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
      list-style-type: none !important;
      gap: 5px !important; 
      justify-content: flex-end !important;
    }

    .floating-minitabs-override li {
      margin: 0 !important;
      padding: 0 !important;
    }

    .floating-minitabs-override a {
      position: relative !important; /* Add this */
      top: 1px !important; /* Move active tab down slightly */
      display: block !important;
      padding: 8px 4px !important;
      text-align: center !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }

    .floating-minitabs-override .activetab a {
    }

    .post-details-link {
      color: inherit;
      text-decoration: none;
      transition: color 0.3s ease;
    }
    .post-details-link:hover {
      color: #9cc3db;
      text-decoration: underline;
    }
    .author {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 5px;
    }
    .post-buttons {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 10;
    }
    .post-buttons label {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
    .post-buttons input[type="checkbox"] {
      margin-left: 5px;
    }
    .post-details-link {
      color: inherit;
      text-decoration: none;
      transition: color 0.3s ease;
      display: inline-flex;
      align-items: center;
      vertical-align: middle;
    }
    .post-details-link:hover {
      color: #9cc3db;
      text-decoration: underline;
    }
    .author {
      white-space: nowrap;
    }
    .author > * {
      vertical-align: middle;
    }
    .post-buttons {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 10;
    }
    .post-buttons label {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
    .post-buttons input[type="checkbox"] {
      margin-left: 5px;
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

  function saveSelectedPosts() {
    const selectedPosts = Array.from(
      document.querySelectorAll('.post input[type="checkbox"]:checked')
    ).map((checkbox) => checkbox.value);
    localStorage.setItem("selectedPosts", JSON.stringify(selectedPosts));
  }

  function loadSelectedPosts() {
    const selectedPosts =
      JSON.parse(localStorage.getItem("selectedPosts")) || [];
    selectedPosts.forEach((postId) => {
      const checkbox = document.querySelector(
        `.post input[type="checkbox"][value="${postId}"]`
      );
      if (checkbox) {
        const post = checkbox.closest(".post");
        if (post) {
          checkbox.checked = true;
          syncPostSelection(post);
        }
      }
    });
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
      saveSelectedPosts();
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
    saveSelectedPosts();
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

  // Function to update the "Show More" button
  function updateShowMoreButton(post) {
    const postbody = post.querySelector(".postbody");
    let showMoreButton = postbody.querySelector(".show-more-button");

    if (postbody.scrollHeight > postbody.clientHeight) {
      if (!showMoreButton) {
        showMoreButton = document.createElement("div");
        showMoreButton.className = "show-more-button";
        showMoreButton.textContent = "Read more ...";
        showMoreButton.onclick = function () {
          postbody.style.maxHeight = "none";
          showMoreButton.style.display = "none";
        };
        postbody.appendChild(showMoreButton);
      }
      showMoreButton.style.display = "block";
    } else if (showMoreButton) {
      showMoreButton.style.display = "none";
    }
  }

  // Function to move the post details button
  function modifyPostAuthorLine(post) {
    const authorLine = post.querySelector(".author");
    if (authorLine) {
      // Hide the "Select:" text
      const selectLabel = post.querySelector(".post-buttons label");
      if (selectLabel) {
        selectLabel.innerHTML = selectLabel.innerHTML.replace("Select:", "");
        selectLabel.style.display = "flex";
        selectLabel.style.alignItems = "center";
        selectLabel.style.justifyContent = "flex-end";
      }

      // Find the original post details button
      const originalPostDetailsButton = post.querySelector(
        'a[title="Post details"]'
      );
      if (originalPostDetailsButton) {
        // Modify the date link
        const dateRegex = /(Posted .*?) by/;
        const match = authorLine.innerHTML.match(dateRegex);
        if (match) {
          const dateText = match[1];
          const detailsLink = document.createElement("a");
          detailsLink.href = originalPostDetailsButton.href;
          detailsLink.title = "Post details";
          detailsLink.className = "post-details-link";
          detailsLink.textContent = dateText;

          // Copy the onclick event from the original button
          detailsLink.onclick = function (e) {
            e.preventDefault();
            originalPostDetailsButton.click();
          };

          authorLine.innerHTML = authorLine.innerHTML.replace(
            dateRegex,
            `${detailsLink.outerHTML} by`
          );
        }

        // Hide the original button instead of removing it
        originalPostDetailsButton.style.display = "none";
      }
    }
  }

  // Modify the structure of each post to match forum posts
  function modifyPostStructure() {
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
        modifyPostAuthorLine(post);

        const originalPostDetailsButton = post.querySelector(
          'a[title="Post details"]'
        );
        if (originalPostDetailsButton) {
          originalPostDetailsButton.remove();
        }

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
        syncPostSelection(post);
      });
  }

  // Handle "Mark all" and "Unmark all" clicks
  function handleMarkAllClicks() {
    document.querySelectorAll(".display-actions a").forEach((actionLink) => {
      actionLink.addEventListener("click", () => {
        setTimeout(() => {
          document.querySelectorAll(".post").forEach((post) => {
            syncPostSelection(post);
          });
        }, 0); // Delay to ensure checkboxes are updated first
      });
    });
  }

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

  // Make the display actions float until they are scrolled to
  function makeDisplayActionsFloat() {
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
  }

  // Call the function to create placeholders

  // Make the top panel float when scrolled past// ... existing code ...

  function createFloatingPanel() {
    const originalPanel = document.querySelector(".panel:first-of-type");
    const firstCpMenu = document.querySelector("#cp-menu"); // Define firstCpMenu
    const floatingPanelWrapper = document.createElement("div");
    floatingPanelWrapper.classList.add("floating-panel-wrapper");

    const floatingPanel = document.createElement("div");
    floatingPanel.classList.add("panel", "floating-panel");

    // Create minitabs for the floating panel
    const originalMinitabs = document.querySelector("#minitabs");
    const minitabs = originalMinitabs.cloneNode(true);
    minitabs.classList.remove("sub-panels");
    minitabs.id = "floating-minitabs";
    minitabs.classList.add("floating-minitabs-override");
    minitabs.querySelectorAll("a").forEach((a) => {
      a.id = "floating-" + a.id;
      a.classList.remove("tab");
    });

    // Clone the content of the original panel
    const panelContent = originalPanel.querySelector(".inner").cloneNode(true);

    // Append elements to the floating panel wrapper in the correct order
    floatingPanelWrapper.appendChild(minitabs);
    floatingPanelWrapper.appendChild(floatingPanel);
    floatingPanel.appendChild(panelContent);

    // Append the floating panel wrapper to the cp-menu
    firstCpMenu.appendChild(floatingPanelWrapper);

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
      <dl>
        <dt>New topic title:</dt>
        <dd><input type="text" name="subject" id="subject" maxlength="124" class="inputbox"></dd>
      </dl>
      <dl>
        <dt>Forum for new topic:</dt>
        <dd><select name="to_forum_id">${
          originalPanel.querySelector('select[name="to_forum_id"]').innerHTML
        }</select></dd>
      `;
    }

    if (mergePanel) {
      mergePanel.innerHTML = `
      <h3>MOVE POSTS</h3>
      <dl>
        <dt><label for="to_topic_id">Destination topic ID:</label></dt>
        <dd>
          <input type="number" name="to_topic_id" id="to_topic_id" min="0" max="9999999999">
          <a href="#" id="floating-select-topic" class="button2">Select topic</a>
        </dd>
      </dl>
    `;
    }

    // Function to sync tab clicks and panel visibility
    function syncTabsAndPanels(clickedTab, isFloating) {
      const subpanel = clickedTab.getAttribute("data-subpanel");
      const panels = [originalPanel, floatingPanel];
      const tabLists = [originalMinitabs, minitabs];

      panels.forEach((panel) => {
        panel.querySelectorAll("fieldset").forEach((fieldset) => {
          fieldset.style.display = fieldset.id === subpanel ? "block" : "none";
        });
      });

      tabLists.forEach((tabList) => {
        tabList.querySelectorAll("li").forEach((li) => {
          li.classList.remove("activetab");
        });
        const activeTab = tabList.querySelector(
          `[data-subpanel="${subpanel}"]`
        );
        if (activeTab) {
          activeTab.closest("li").classList.add("activetab");
        }
      });

      if (isFloating) {
        // If floating tab was clicked, trigger click on original tab
        const originalTab = originalMinitabs.querySelector(
          `[data-subpanel="${subpanel}"]`
        );
        if (originalTab) {
          originalTab.click();
        }
      }
    }

    // Add event listener for the new Select Topic button
    const selectTopicButton = mergePanel.querySelector(
      "#floating-select-topic"
    );
    selectTopicButton.addEventListener("click", (e) => {
      e.preventDefault();
      const originalSelectTopicButton = document.querySelector(
        'a[href*="action=merge_select"]'
      );
      if (originalSelectTopicButton) {
        originalSelectTopicButton.click();
      }
    });

    // Add click events for floating panel tabs
    minitabs.querySelectorAll("a").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        syncTabsAndPanels(tab, true);
      });
    });

    // Add click events for original panel tabs
    originalMinitabs.querySelectorAll("a").forEach((tab) => {
      tab.addEventListener("click", () => {
        syncTabsAndPanels(tab, false);
      });
    });

    // Sync changes between the original panel and the floating panel
    function syncPanels() {
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

    // Show/hide floating panel based on original panel visibility
    function toggleFloatingPanelVisibility() {
      const originalPanelRect = originalPanel.getBoundingClientRect();
      const cpMenuRect = firstCpMenu.getBoundingClientRect();

      if (originalPanelRect.bottom > 0) {
        // Original panel is visible
        floatingPanelWrapper.style.display = "none";
      } else {
        // Original panel is not visible
        floatingPanelWrapper.style.display = "block";
        floatingPanelWrapper.style.top = `${window.scrollY}px`;
        floatingPanelWrapper.style.left = `${cpMenuRect.left}px`;
        floatingPanelWrapper.style.width = `${cpMenuRect.width}px`;
      }
    }

    window.addEventListener("scroll", toggleFloatingPanelVisibility);
    window.addEventListener("resize", toggleFloatingPanelVisibility);
    toggleFloatingPanelVisibility(); // Initial check

    // Initial sync of tab states
    const initialActiveTab = originalMinitabs.querySelector(".activetab a");
    if (initialActiveTab) {
      syncTabsAndPanels(initialActiveTab, false);
    }
  }

  // Observe changes in the document to ensure synchronization
  function observeDocumentChanges() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" || mutation.type === "subtree") {
          // Sync post selection
          document.querySelectorAll(".post").forEach((post) => {
            syncPostSelection(post);
          });

          // Update "Show More" button if content height increased
          const post = mutation.target.closest(".post");
          if (post) {
            const postbody = post.querySelector(".postbody");
            if (postbody && postbody.scrollHeight > postbody.clientHeight) {
              updateShowMoreButton(post);
            }
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });

    // Add a window resize listener to update all posts
    window.addEventListener("resize", () => {
      document.querySelectorAll(".post").forEach(updateShowMoreButton);
    });

    // Add click event listener for spoiler buttons
    document.body.addEventListener("click", (event) => {
      if (event.target.classList.contains("spoilbtn")) {
        const post = event.target.closest(".post");
        if (post) {
          setTimeout(() => updateShowMoreButton(post), 0);
        }
      }
    });
  }

  window.addEventListener("load", function () {
    loadSelectedPosts();
    modifyPostStructure();
    clickExpandView();
    createPlaceholders();
    createFloatingPanel();
    makeDisplayActionsFloat();
    handleMarkAllClicks();
    observeDocumentChanges();
  });
})();
