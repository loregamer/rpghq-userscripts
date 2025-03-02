// ==UserScript==
// @name         Avatar Replacer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Allows replacing user avatars with custom images
// @author       You
// @match        https://rpghq.org/*/*
// @run-at       document-start
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @grant        GM_setValue
// @grant        GM_getValue
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  //----------------------------------------------------------------------
  // 1) DATA LOAD
  //----------------------------------------------------------------------

  // Holds userId => custom avatar URL
  let replacedAvatars = GM_getValue("replacedAvatars", {});

  //----------------------------------------------------------------------
  // 2) COMMON FUNCTIONS
  //----------------------------------------------------------------------

  // Extract user ID (number) from profile URLs like .../memberlist.php?mode=viewprofile&u=123-Username
  function getUserIdFromUrl() {
    const match = window.location.href.match(/u=(\d+)/);
    return match ? match[1] : null;
  }

  //----------------------------------------------------------------------
  // 3) AVATAR REPLACEMENT
  //----------------------------------------------------------------------

  // Check for images with "avatar=###" in src, replace if we have a stored override
  function replaceUserAvatars() {
    document.querySelectorAll("img").forEach((img) => {
      const match = img.src.match(/avatar=(\d+)/);
      if (match) {
        const userId = match[1];
        if (replacedAvatars.hasOwnProperty(userId)) {
          img.src = replacedAvatars[userId];
        }
      }
    });
  }

  // Validate and save the custom URL in storage, then refresh the current page’s avatars
  function validateAndReplaceAvatar(userId, url) {
    const testImg = new Image();
    testImg.onload = function () {
      // Example constraint: must be 128x128 or smaller
      if (this.width <= 128 && this.height <= 128) {
        replacedAvatars[userId] = url;
        GM_setValue("replacedAvatars", replacedAvatars);
        alert("Avatar replaced!");
        replaceUserAvatars();
      } else {
        alert("Image must be 128×128 or smaller.");
      }
    };
    testImg.onerror = function () {
      alert("Failed to load image from the provided URL.");
    };
    testImg.src = url;
  }

  //----------------------------------------------------------------------
  // 4) USER PROFILE PAGE: ADD BUTTONS
  //----------------------------------------------------------------------

  // Pop-up UI to prompt for custom avatar URL or reset back to default
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
    input.placeholder = "Enter image URL (128×128 or smaller)";
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
      return b;
    }

    // "Replace" button
    const replaceB = makeBtn("Replace");
    replaceB.addEventListener("click", () => {
      validateAndReplaceAvatar(userId, input.value);
      document.body.removeChild(popup);
    });

    // "Reset to Default" button
    const resetB = makeBtn("Reset to Default");
    resetB.addEventListener("click", () => {
      delete replacedAvatars[userId];
      GM_setValue("replacedAvatars", replacedAvatars);
      alert("Avatar reset to default.");
      replaceUserAvatars();
      document.body.removeChild(popup);
    });

    // "Cancel" button
    const cancelB = makeBtn("Cancel");
    cancelB.addEventListener("click", () => {
      document.body.removeChild(popup);
    });

    // Put all buttons in the container
    btnContainer.appendChild(replaceB);
    btnContainer.appendChild(resetB);
    btnContainer.appendChild(cancelB);

    // Insert popup into body
    document.body.appendChild(popup);
  }

  // If we’re on a user profile page, add a “Replace Avatar” button
  function addAvatarReplaceButtonIfOnProfile() {
    const memberlistTitle = document.querySelector(".memberlist-title");
    if (!memberlistTitle || document.getElementById("replace-avatar-button"))
      return;

    // Attempt to get the user’s ID from the URL
    const userId = getUserIdFromUrl();
    if (!userId) return;

    // Create container for the button
    const container = document.createElement("div");
    container.style.display = "inline-block";
    container.style.marginLeft = "10px";

    // The actual button
    const replaceBtn = document.createElement("a");
    replaceBtn.id = "replace-avatar-button";
    replaceBtn.className = "button button-secondary";
    replaceBtn.href = "#";
    replaceBtn.textContent = "Replace Avatar";
    replaceBtn.style.marginLeft = "5px";

    container.appendChild(replaceBtn);
    memberlistTitle.appendChild(container);

    // On click, show the popup
    replaceBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showReplaceAvatarPopup(userId);
    });
  }

  //----------------------------------------------------------------------
  // 5) INIT
  //----------------------------------------------------------------------

  document.addEventListener("DOMContentLoaded", () => {
    // Replace any existing avatars now
    replaceUserAvatars();

    // Periodically re-check for newly loaded images (e.g., infinite scroll)
    setInterval(replaceUserAvatars, 1500);

    // If we are on a user’s profile page, add the “Replace Avatar” button
    addAvatarReplaceButtonIfOnProfile();
  });
})();
