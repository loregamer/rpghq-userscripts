// ==UserScript==
// @name         RPGHQ - Avatar Replacer
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Replaces user avatars
// @author       You
// @match        https://rpghq.org/*/*
// @run-at       document-start
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @grant        GM_setValue
// @grant        GM_getValue
// @license      MIT
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/main/Avatar-Replacer.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/main/Avatar-Replacer.user.js
// ==/UserScript==

(function () {
  "use strict";

  //----------------------------------------------------------------------
  // 1) DATA LOAD
  //----------------------------------------------------------------------

  // Default avatar replacements
  const defaultAvatars = {
    256: "https://f.rpghq.org/sfium5E49qiZ.png?n=pasted-file.png",
    3301: "https://f.rpghq.org/ClFMmeBrDSeF.png?n=pasted-file.png",
  };

  // Check if this is the first time running the script
  const isFirstRun = GM_getValue("replacedAvatars") === undefined;

  // Map userId -> custom avatar URL
  // If first run, use the default avatars
  let replacedAvatars = isFirstRun
    ? defaultAvatars
    : GM_getValue("replacedAvatars", {});

  // Save the default avatars if this is the first run
  if (isFirstRun) {
    GM_setValue("replacedAvatars", replacedAvatars);
  }

  //----------------------------------------------------------------------
  // 2) AVATAR REPLACEMENT
  //----------------------------------------------------------------------

  // Check all <img> with "avatar=USER_ID" in src and swap if replaced
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

  // Validate the new image is <= 128x128, then store & refresh
  function validateAndReplaceAvatar(userId, url) {
    const testImg = new Image();
    testImg.onload = function () {
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
      alert("Could not load image from the provided URL.");
    };
    testImg.src = url;
  }

  //----------------------------------------------------------------------
  // 3) OYSTER SAUCE COLOR
  //----------------------------------------------------------------------

  // Force "Oyster Sauce" to always appear green
  function colorOysterSauce() {
    document.querySelectorAll("a.username-coloured").forEach((link) => {
      if (link.textContent.trim() === "Oyster Sauce") {
        link.style.color = "#00AA00";
      }
      if (link.textContent.trim() === "rusty_shackleford") {
        link.style.color = "#F5575D";
      }
    });
  }

  //----------------------------------------------------------------------
  // 4) PROFILE POPUP FOR AVATAR REPLACEMENT
  //----------------------------------------------------------------------

  // Extract user ID from "u=1234" in URL
  function getUserIdFromUrl() {
    const match = window.location.href.match(/u=(\d+)/);
    return match ? match[1] : null;
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
    title.style.margin = "0 0 15px 0";
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
      b.addEventListener("mouseover", () => {
        b.style.backgroundColor = "#4a4a4a";
      });
      b.addEventListener("mouseout", () => {
        b.style.backgroundColor = "#3a3a3a";
      });
      return b;
    }

    const replaceB = makeBtn("Replace");
    replaceB.addEventListener("click", () => {
      validateAndReplaceAvatar(userId, input.value);
      document.body.removeChild(popup);
    });

    const resetB = makeBtn("Reset");
    resetB.addEventListener("click", () => {
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

  function addReplaceAvatarButtonToProfile() {
    const memberlistTitle = document.querySelector(".memberlist-title");
    if (!memberlistTitle || document.getElementById("replace-avatar-button"))
      return;

    const userId = getUserIdFromUrl();
    if (!userId) return;

    const container = document.createElement("div");
    container.style.display = "inline-block";
    container.style.marginLeft = "10px";

    const replaceBtn = document.createElement("a");
    replaceBtn.id = "replace-avatar-button";
    replaceBtn.className = "button button-secondary";
    replaceBtn.href = "#";
    replaceBtn.textContent = "Replace Avatar";

    container.appendChild(replaceBtn);
    memberlistTitle.appendChild(container);

    replaceBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showReplaceAvatarPopup(userId);
    });
  }

  //----------------------------------------------------------------------
  // 5) MUTATION OBSERVER (so we can replace avatars & recolor OS early)
  //----------------------------------------------------------------------

  // Whenever new DOM nodes appear, re-check for avatars and "Oyster Sauce"
  const observer = new MutationObserver(() => {
    replaceUserAvatars();
    colorOysterSauce();
  });

  // Start the observer at document-start
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // Also do a quick pass once DOM is ready (in case something was missed)
  document.addEventListener("DOMContentLoaded", () => {
    replaceUserAvatars();
    colorOysterSauce();
    addReplaceAvatarButtonToProfile();
  });
})();
