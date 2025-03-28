// ==UserScript==
// @name         Mod.io Guidify
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Adds a Guidify button to clean up mod.io guide pages
// @author       loregamer
// @match        https://mod.io/g/baldursgate3/*
// @grant        none
// @icon         https://mod.io/favicon.ico
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

    // Remove discussion section if it exists
    const discussionSection = document.querySelector('div[id="discussion"]');
    if (discussionSection) {
      const discussionContainer =
        discussionSection.closest("[data-v-6576c276]");
      if (discussionContainer) {
        discussionContainer.remove();
      }
    }

    // Extract the original page theme colors
    const originalThemeColors = {
      primary:
        getComputedStyle(document.documentElement).getPropertyValue(
          "--primary"
        ) || "#c19976",
      lightBg:
        getComputedStyle(document.documentElement).getPropertyValue(
          "--light-1"
        ) || "#f8f8f8",
      darkBg:
        getComputedStyle(document.documentElement).getPropertyValue(
          "--dark-1"
        ) || "#1e1e24",
      lightText:
        getComputedStyle(document.documentElement).getPropertyValue(
          "--light-text"
        ) || "#32383c",
      darkText:
        getComputedStyle(document.documentElement).getPropertyValue(
          "--dark-text"
        ) || "#e9e9f0",
      accentColor:
        getComputedStyle(document.documentElement).getPropertyValue(
          "--accent"
        ) || "#2568ef",
    };

    // Add custom styling to the page
    const styleTag = document.createElement("style");
    styleTag.textContent = `
      body {
        background-color: #121212;
        color: #e0e0e0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 0;
        line-height: 1.5;
      }
      
      .guide-container {
        background-color: #1e1e1e;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        padding: 30px;
        max-width: 900px;
        margin: 40px auto;
      }
      
      .guide-header {
        margin-bottom: 24px;
        border-bottom: 1px solid #333;
        padding-bottom: 16px;
      }
      
      .guide-title {
        color: ${originalThemeColors.primary};
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 8px;
      }
      
      .guide-content {
        font-size: 16px;
      }
      
      .guide-content h1, .guide-content h2, .guide-content h3 {
        color: #f0f0f0;
        margin-top: 28px;
        margin-bottom: 16px;
      }
      
      .guide-content h2 {
        font-size: 24px;
        border-bottom: 1px solid #333;
        padding-bottom: 8px;
      }
      
      .guide-content h3 {
        font-size: 20px;
      }
      
      .guide-content p {
        margin-bottom: 16px;
        line-height: 1.6;
        color: #cccccc;
      }
      
      .guide-content a {
        color: #70a9ff;
        text-decoration: none;
      }
      
      .guide-content a:hover {
        text-decoration: underline;
        color: #90c2ff;
      }
      
      .guide-content img {
        max-width: 100%;
        border-radius: 4px;
        margin: 16px 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
      }
      
      .guide-content pre, .guide-content code {
        background-color: #252525;
        border-radius: 4px;
        padding: 2px 6px;
        font-family: monospace;
        color: #d7ba7d;
      }
      
      .guide-content pre {
        padding: 16px;
        overflow-x: auto;
        border: 1px solid #333;
      }
      
      .guide-content blockquote {
        border-left: 4px solid ${originalThemeColors.primary};
        padding-left: 16px;
        margin-left: 0;
        color: #b0b0b0;
        background-color: rgba(255, 255, 255, 0.05);
        padding: 10px 16px;
        border-radius: 0 4px 4px 0;
      }
      
      .guide-content ul, .guide-content ol {
        padding-left: 24px;
        margin-bottom: 16px;
        color: #cccccc;
      }
      
      .guide-content li {
        margin-bottom: 8px;
      }
      
      .guide-footer {
        margin-top: 40px;
        text-align: center;
        color: #888;
        font-size: 14px;
        padding-top: 20px;
        border-top: 1px solid #333;
      }
      
      .guide-footer a {
        color: #70a9ff;
      }
      
      /* Dark mode scrollbar */
      ::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }
      
      ::-webkit-scrollbar-track {
        background: #1e1e1e;
      }
      
      ::-webkit-scrollbar-thumb {
        background: #444;
        border-radius: 5px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
      
      /* Selection color */
      ::selection {
        background-color: rgba(100, 150, 255, 0.3);
        color: #fff;
      }
    `;
    document.head.appendChild(styleTag);

    // Get the page title
    const pageTitle = document.title || "Guide";

    // Create a new container for the guide content
    const newContainer = document.createElement("div");
    newContainer.className = "guide-container";

    // Create header section
    const headerSection = document.createElement("div");
    headerSection.className = "guide-header";

    const guideTitle = document.createElement("h1");
    guideTitle.className = "guide-title";
    guideTitle.textContent = pageTitle.replace(" | mod.io", "");

    headerSection.appendChild(guideTitle);
    newContainer.appendChild(headerSection);

    // Create content section
    const contentSection = document.createElement("div");
    contentSection.className = "guide-content";

    // Clone the guide content
    contentSection.appendChild(guideContent.cloneNode(true));
    newContainer.appendChild(contentSection);

    // Clear the page and add our container
    document.body.innerHTML = "";
    document.body.appendChild(newContainer);

    // Fix HTML entities in headings and paragraphs
    const textElements = document.querySelectorAll(
      "h1, h2, h3, h4, h5, h6, p, li, a"
    );
    textElements.forEach((element) => {
      if (element.innerHTML.includes("&amp;")) {
        element.innerHTML = element.innerHTML.replace(/&amp;/g, "&");
      }
    });

    // Fix links so they open in new tabs
    const allLinks = document.querySelectorAll("a");
    allLinks.forEach((link) => {
      if (
        link.getAttribute("href") &&
        !link.getAttribute("href").startsWith("#")
      ) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
    });
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
    floatingButton.style.backgroundColor = "var(--primary, #c19976)";
    floatingButton.style.color = "var(--primary-text, #0E101A)";
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
