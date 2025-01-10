// ==UserScript==
// @name         Nammu Revitalized
// @version      1.1
// @description  Changes displayed "Serjo" references to "Nammu Archag" on rpghq.org and adds a custom rank
// @match        https://rpghq.org/*
// @grant        none
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURfxKZ/9KZutQcjeM5/tLaP5KZokNEhggKnoQFYEPExgfKYYOEhkfKYgOEhsfKYgNEh8eKCIeJyYdJikdJqYJDCocJiodJiQdJyAeKBwfKToaIgAAAKuw7XoAAAAcdFJOU////////////////////////////////////wAXsuLXAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABEUlEQVRIS92S3VLCMBBG8YcsohhARDHv/55uczZbYBra6DjT8bvo7Lc95yJtFqkx/0JY3HWxllJu98wPl2EJfyU8MhtYwnJQWDIbWMLShCBCp65EgKSEWhWeZA1h+KjwLC8Qho8KG3mFUJS912EhytYJ9l6HhSA7J9h7rQl7J9h7rQlvTrD3asIhBF5Qg7w7wd6rCVf5gXB0YqIw4Qw5B+qkr5QTSv1wYpIQW39clE8n2HutCY13aSMnJ9h7rQn99dbnHwixXejPwEBuCP1XYiA3hP7HMZCqEOSks1ElSleFmKuBJSYsM9Eg6Au91l9F0JxXIBd00wlsM9DlvDL/WhgNgkbnmQgaDqOZj+CZnZDSN2ZJgWZx++q1AAAAAElFTkSuQmCC
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/main/Nammu-Revitalized.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/main/Nammu-Revitalized.user.js
// ==/UserScript==

(function () {
  "use strict";

  let isUpdating = false;

  function replaceSerjoReferences() {
    const elements = document.querySelectorAll("a:not([data-nammu-processed])");
    elements.forEach((element) => {
      if (
        element.childNodes.length === 1 &&
        element.childNodes[0].nodeType === Node.TEXT_NODE &&
        element.textContent.includes("Serjo")
      ) {
        const clone = element.cloneNode(true);
        clone.textContent = clone.textContent.replace(/Serjo/g, "Nammu Archag");
        clone.style.display = "";
        element.style.display = "none";
        element.parentNode.insertBefore(clone, element.nextSibling);
      }
      element.setAttribute("data-nammu-processed", "true");
    });
  }

  function addCustomRankToSerjo() {
    const profileElements = document.querySelectorAll(
      ".postprofile:not([data-nammu-rank-processed])"
    );
    profileElements.forEach((profile) => {
      const usernameElement = profile.querySelector(
        "a.username, a.username-coloured"
      );
      if (
        usernameElement &&
        (usernameElement.textContent.trim() === "Nammu Archag" ||
          usernameElement.textContent.trim() === "Serjo")
      ) {
        const postsElement = profile.querySelector(".profile-posts");
        if (
          postsElement &&
          !profile.querySelector(".profile-rank[data-nammu-custom]")
        ) {
          const customRankElement = document.createElement("dd");
          customRankElement.className = "profile-rank";
          customRankElement.textContent = 'who the hell is "serjo"?';
          customRankElement.setAttribute("data-nammu-custom", "true");
          postsElement.parentNode.insertBefore(customRankElement, postsElement);
        }
      }
      profile.setAttribute("data-nammu-rank-processed", "true");
    });
  }

  function updateContent() {
    if (isUpdating) return;
    isUpdating = true;
    replaceSerjoReferences();
    addCustomRankToSerjo();
    isUpdating = false;
  }

  // Run the functions when the page loads
  updateContent();

  // Use a MutationObserver to handle dynamically loaded content
  const observer = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.addedNodes.length > 0)) {
      updateContent();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
