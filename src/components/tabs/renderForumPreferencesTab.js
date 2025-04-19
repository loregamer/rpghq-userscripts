/**
 * Renders the "Forum Preferences" tab content with subtabs.
 *
 * @param {HTMLElement} container - The container element to render into
 */
import { renderThreadsSubtab } from "./subtabs/renderThreadsSubtab.js";
import { renderUsersSubtab } from "./subtabs/renderUsersSubtab.js";
import { log } from "../../utils/logger.js";
// Import GM wrappers for settings
import { gmGetValue, gmSetValue } from "../../main.js";

// Keys from main.js
const THEME_LINK_COLOR_KEY = "theme_linkColor";
// const THEME_VISITED_COLOR_KEY = "theme_visitedColor"; // Removed
// const THEME_ACTIVE_COLOR_KEY = "theme_activeColor"; // Removed
const THEME_HOVER_COLOR_KEY = "theme_hoverColor";

export function renderForumPreferencesTab(container) {
  log("Rendering Forum Preferences tab with subtabs...");

  container.innerHTML = `<h2>Forum Preferences</h2>`;

  // --- Theme Customizer Section ---
  const themeSection = document.createElement("div");
  themeSection.className = "preferences-section";
  themeSection.innerHTML = `
    <div class="preferences-section-header">
      <h3 class="preferences-section-title">Theme Customizer</h3>
    </div>
    <div class="preferences-section-body"></div>
  `;
  const themeBody = themeSection.querySelector(".preferences-section-body");

  // Helper function to create color input
  const createColorInput = (label, key, defaultValue = "#000000") => {
    const id = `theme-color-${key}`;
    const currentValue = gmGetValue(key, ""); // Get current value or empty string

    const item = document.createElement("div");
    item.className = "preference-item theme-color-item";
    item.innerHTML = `
      <div class="preference-header">
        <label for="${id}" class="preference-name">${label}</label>
        <div class="preference-control">
          <input type="color" id="${id}" value="${currentValue || defaultValue}">
          <button class="btn btn-secondary btn-small reset-color-btn" title="Reset to default">Reset</button>
        </div>
      </div>
      <p class="preference-description">Current: <code class="current-color-value">${currentValue || "(default)"}</code></p>
    `;

    const colorInput = item.querySelector("input[type='color']");
    const resetButton = item.querySelector(".reset-color-btn");
    const valueDisplay = item.querySelector(".current-color-value");

    // Load initial value or set default appearance
    if (currentValue) {
      colorInput.value = currentValue;
    } else {
      // Visually indicate default is used (e.g., different style or placeholder)
      colorInput.value = defaultValue; // Show default in picker
    }

    colorInput.addEventListener("input", (event) => {
      const newValue = event.target.value;
      gmSetValue(key, newValue);
      valueDisplay.textContent = newValue;
      // Maybe add a slight delay or debounce if performance is an issue
      // applyCustomThemeStyles(); // We might need to re-apply styles live, requires importing applyCustomThemeStyles
    });

    resetButton.addEventListener("click", () => {
      gmSetValue(key, ""); // Clear the setting
      colorInput.value = defaultValue; // Reset picker to visual default
      valueDisplay.textContent = "(default)";
      // applyCustomThemeStyles(); // Re-apply styles after reset
    });

    return item;
  };

  // Add color inputs
  themeBody.appendChild(
    createColorInput(
      "Link Color (Link, Active, Visited)",
      THEME_LINK_COLOR_KEY,
      "#2a8ff7",
    ),
  );
  // themeBody.appendChild(
  //   createColorInput("Visited Link Color", THEME_VISITED_COLOR_KEY, "#2a8ff7"),
  // ); // Removed
  // themeBody.appendChild(
  //   createColorInput("Active Link Color", THEME_ACTIVE_COLOR_KEY, "#2a8ff7"),
  // ); // Removed
  themeBody.appendChild(
    createColorInput("Hover Link Color", THEME_HOVER_COLOR_KEY, "#399bff"),
  );

  container.appendChild(themeSection);

  // --- Sub-Tabs Section ---
  // Add sub-tabs for Threads and Users
  const subTabsContainer = document.createElement("div");
  subTabsContainer.className = "sub-tabs";
  subTabsContainer.innerHTML = `
    <div class="sub-tab active" data-subtab="threads">
      <i class="fa fa-comments"></i> Threads
    </div>
    <div class="sub-tab" data-subtab="users">
      <i class="fa fa-users"></i> Users
    </div>
  `;
  container.appendChild(subTabsContainer);

  // Add container for sub-tab content
  const subTabContent = document.createElement("div");
  subTabContent.id = "forum-subtab-content";
  container.appendChild(subTabContent);

  // Load initial sub-tab (Threads)
  renderThreadsSubtab(subTabContent);

  // Add event listeners for sub-tabs
  subTabsContainer.querySelectorAll(".sub-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      // Update active state
      subTabsContainer.querySelectorAll(".sub-tab").forEach((t) => {
        t.classList.remove("active");
      });
      tab.classList.add("active");

      // Load content
      if (tab.dataset.subtab === "threads") {
        renderThreadsSubtab(subTabContent);
      } else if (tab.dataset.subtab === "users") {
        renderUsersSubtab(subTabContent);
      }
    });
  });
}
