// ==UserScript==
// @name         Mod.io Guidify
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Adds a Guidify button to clean up mod.io guide pages
// @author       You
// @match        https://mod.io/g/baldursgate3/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  "use strict";

  // Function to clean up the page
  function guidifyPage() {
    console.log("Guidify button clicked");

    // Find the Guide heading
    const guideHeading = Array.from(document.querySelectorAll("h2")).find(
      (h2) => h2.textContent.trim() === "Guide"
    );

    if (!guideHeading) {
      console.error("Guide heading not found");
      return;
    }

    // Find the correct content container
    let guideContent = guideHeading.closest(".tw-flex-1");
    if (!guideContent) {
      console.error("Guide content container not found");
      return;
    }

    // Create a new container for the guide content
    const newContainer = document.createElement("div");
    newContainer.style.padding = "20px";
    newContainer.style.maxWidth = "800px";
    newContainer.style.margin = "0 auto";
    newContainer.style.background = "#fff";
    newContainer.style.color = "#000";
    newContainer.style.fontFamily = "Arial, sans-serif";

    // Clone the guide content
    newContainer.appendChild(guideContent.cloneNode(true));

    // Clear the page and add only our container
    document.body.innerHTML = "";
    document.body.appendChild(newContainer);
  }

  // Function to add the Guidify button
  function addGuidifyButton() {
    // Try several selectors to find a suitable container for our button
    const possibleContainers = [
      // Main buttons container
      document.querySelector(".tw-hidden.md\\:tw-flex.tw-ml-auto.tw-gap-x-2"),
      // Secondary options
      document.querySelector(
        ".tw-flex.md\\:tw-flex-row.tw-flex-row-reverse.tw-w-full.tw-gap-2"
      ),
      // Fallback to any header button container
      document.querySelector("header .tw-flex"),
    ];

    // Find the first valid container
    const buttonContainer = possibleContainers.find(
      (container) => container !== null
    );

    if (!buttonContainer) {
      console.error("No suitable container found for the Guidify button");

      // Last resort: create a floating button
      createFloatingButton();
      return;
    }

    console.log("Found container for Guidify button", buttonContainer);

    // Create the button
    const guidifyButton = document.createElement("button");
    guidifyButton.className =
      "tw-flex tw-items-center tw-justify-center tw-overflow-hidden tw-button-transition tw-outline-none tw-shrink-0 tw-space-x-2 tw-font-medium tw-text-sm tw-global--border-radius tw-cursor-pointer tw-input--height-large tw-input--width-large tw-bg-primary tw-text-primary-text tw-border-primary hover:tw-bg-primary-hover focus:tw-bg-primary-hover hover:tw-border-primary-hover focus:tw-border-primary-hover tw-border-2";
    guidifyButton.innerHTML = `
            <svg class="svg-inline--fa fa-fw tw-fill-current tw-text-sm" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                <path fill="currentColor" d="M542.22 32.05c-54.8 3.11-163.72 14.43-230.96 55.59-4.64 2.84-7.27 7.89-7.27 13.17v363.87c0 11.55 12.63 18.85 23.28 13.49 69.18-34.82 169.23-44.32 218.7-46.92 16.89-.89 30.02-14.43 30.02-30.66V62.75c.01-17.71-15.35-31.74-33.77-30.7zM264.73 87.64C197.5 46.48 88.58 35.17 33.78 32.05 15.36 31.01 0 45.04 0 62.75V400.6c0 16.24 13.13 29.78 30.02 30.66 49.49 2.6 149.59 12.11 218.77 46.95 10.62 5.35 23.21-1.94 23.21-13.46V100.63c0-5.29-2.62-10.14-7.27-12.99z"></path>
            </svg>
            <span>Guidify</span>
        `;

    // Add click event
    guidifyButton.addEventListener("click", guidifyPage);

    // Add the button to the container
    buttonContainer.insertBefore(guidifyButton, buttonContainer.firstChild);
  }

  // Fallback: create a floating button if we can't find a suitable container
  function createFloatingButton() {
    const floatingButton = document.createElement("button");

    floatingButton.textContent = "Guidify";
    floatingButton.style.position = "fixed";
    floatingButton.style.top = "10px";
    floatingButton.style.right = "10px";
    floatingButton.style.zIndex = "9999";
    floatingButton.style.padding = "8px 16px";
    floatingButton.style.backgroundColor = "#c19976";
    floatingButton.style.color = "#0E101A";
    floatingButton.style.border = "none";
    floatingButton.style.borderRadius = "4px";
    floatingButton.style.cursor = "pointer";
    floatingButton.style.fontWeight = "bold";

    floatingButton.addEventListener("click", guidifyPage);

    document.body.appendChild(floatingButton);
  }

  // Add a small delay to ensure the page is fully loaded
  setTimeout(addGuidifyButton, 1000);
})();
