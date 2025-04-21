/**
 * Renders the "Theme" subtab content.
 *
 * @param {HTMLElement} container - The container element to render into
 */
import { log } from "../../../utils/logger.js";
// Import GM wrappers and theme application function
import {
  gmGetValue,
  gmSetValue,
  applyCustomThemeStyles,
} from "../../../main.js";

// Keys from main.js (redundant but good for clarity)
const THEME_LINK_COLOR_KEY = "theme_linkColor";
const THEME_HOVER_COLOR_KEY = "theme_hoverColor";
const THEME_BACKGROUND_IMAGE_URL_KEY = "theme_backgroundImageUrl";

export function renderThemeSubtab(container) {
  log("Rendering Theme subtab...");

  // Clear previous content
  container.innerHTML = "";

  // --- Theme Customizer Section ---
  const themeSection = document.createElement("div");
  themeSection.className = "preferences-section"; // Use the same class for consistent styling
  themeSection.innerHTML = `
    <div class="preferences-section-header">
      <h3 class="preferences-section-title">Theme Colors</h3>
      <p class="preferences-section-description">
        Customize the colors of links on the forum. Changes are applied live.
      </p>
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
      // Visually indicate default is used
      colorInput.value = defaultValue; // Show default in picker
    }

    colorInput.addEventListener("input", (event) => {
      const newValue = event.target.value;
      log(`Setting ${key} to ${newValue}`);
      gmSetValue(key, newValue);
      valueDisplay.textContent = newValue;
      applyCustomThemeStyles(); // Apply styles live
    });

    resetButton.addEventListener("click", () => {
      log(`Resetting ${key} to default`);
      gmSetValue(key, ""); // Clear the setting
      colorInput.value = defaultValue; // Reset picker to visual default
      valueDisplay.textContent = "(default)";
      applyCustomThemeStyles(); // Re-apply styles after reset
    });

    return item;
  };

  // Helper function to create text input
  const createTextInput = (label, key, placeholder = "") => {
    const id = `theme-text-${key}`;
    const currentValue = gmGetValue(key, ""); // Get current value or empty string

    const item = document.createElement("div");
    item.className = "preference-item theme-text-item"; // Consistent class naming
    item.innerHTML = `
      <div class="preference-header">
        <label for="${id}" class="preference-name">${label}</label>
        <div class="preference-control">
          <input type="text" id="${id}" value="${currentValue}" placeholder="${placeholder}" class="input-text">
          <button class="btn btn-secondary btn-small reset-text-btn" title="Reset to default">Reset</button>
        </div>
      </div>
      <p class="preference-description">Enter a valid URL for the background image.</p>
    `;

    const textInput = item.querySelector("input[type='text']");
    const resetButton = item.querySelector(".reset-text-btn");

    textInput.addEventListener("input", (event) => {
      const newValue = event.target.value.trim();
      log(`Setting ${key} to ${newValue}`);
      gmSetValue(key, newValue);
      applyCustomThemeStyles(); // Apply styles live
    });

    resetButton.addEventListener("click", () => {
      log(`Resetting ${key} to default`);
      gmSetValue(key, ""); // Clear the setting
      textInput.value = ""; // Clear input field
      applyCustomThemeStyles(); // Re-apply styles after reset
    });

    return item;
  };

  // Add color inputs
  themeBody.appendChild(
    createColorInput(
      "Link Color (Link, Active, Visited)",
      THEME_LINK_COLOR_KEY,
      "#2a8ff7", // Example default, adjust if needed
    ),
  );
  themeBody.appendChild(
    createColorInput(
      "Hover Link Color",
      THEME_HOVER_COLOR_KEY,
      "#399bff", // Example default, adjust if needed
    ),
  );

  // Add background image input
  themeBody.appendChild(
    createTextInput(
      "Background Image URL",
      THEME_BACKGROUND_IMAGE_URL_KEY,
      "e.g., https://example.com/image.png",
    ),
  );

  container.appendChild(themeSection);
}
