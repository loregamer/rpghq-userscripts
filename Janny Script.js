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
            background-color: #444 !important;
            color: #fff !important;
            padding: 10px !important;
            border-radius: 5px !important;
            text-align: center !important;
            margin: 10px 0 !important;
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
})();
