// ==UserScript==
// @name         Nammu Revitalized
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Changes all "Serjo" references to "Nammu Archag" on rpghq.org and adds a custom rank
// @match        https://rpghq.org/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  let isUpdating = false;

  function replaceSerjoReferences() {
    const elements = document.querySelectorAll("*:not([data-nammu-processed])");
    elements.forEach((element) => {
      if (
        element.childNodes.length === 1 &&
        element.childNodes[0].nodeType === Node.TEXT_NODE
      ) {
        element.textContent = element.textContent.replace(
          /Serjo/g,
          "Nammu Archag"
        );
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
          customRankElement.textContent = "who the hell is serjo?";
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
