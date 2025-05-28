/**
 * Renders the "Forum Preferences" tab content with subtabs.
 *
 * @param {HTMLElement} container - The container element to render into
 */
import { renderThreadsSubtab } from "./subtabs/renderThreadsSubtab.js";
import { renderUsersSubtab } from "./subtabs/renderUsersSubtab.js";
// Import the new Theme subtab renderer
import { renderThemeSubtab } from "./subtabs/renderThemeSubtab.js";
import { log } from "../../utils/logger.js";
// Removed GM imports as they are handled in the subtab now
// import { gmGetValue, gmSetValue } from "../../main.js";

// Removed Theme keys as they are handled in the subtab now
// const THEME_LINK_COLOR_KEY = "theme_linkColor";
// const THEME_HOVER_COLOR_KEY = "theme_hoverColor";

export function renderForumPreferencesTab(container) {
  // container.innerHTML = `<h2>Forum Preferences</h2>`; // Removed title

  // --- REMOVED Theme Customizer Section ---
  // const themeSection = document.createElement("div");
  // ... (entire theme section removed) ...
  // container.appendChild(themeSection);

  // --- Sub-Tabs Section ---
  // Add sub-tabs for Theme, Threads, and Users
  const subTabsContainer = document.createElement("div");
  subTabsContainer.className = "sub-tabs";
  subTabsContainer.innerHTML = `
    <div class="sub-tab active" data-subtab="theme">
      <i class="fa fa-paint-brush"></i> Theme
    </div>
    <div class="sub-tab" data-subtab="threads">
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

  // Load initial sub-tab (Theme)
  renderThemeSubtab(subTabContent); // Load Theme by default

  // Add event listeners for sub-tabs
  subTabsContainer.querySelectorAll(".sub-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      // Update active state
      subTabsContainer.querySelectorAll(".sub-tab").forEach((t) => {
        t.classList.remove("active");
      });
      tab.classList.add("active");

      // Load content based on data-subtab attribute
      const subtabName = tab.dataset.subtab;

      if (subtabName === "theme") {
        renderThemeSubtab(subTabContent);
      } else if (subtabName === "threads") {
        renderThreadsSubtab(subTabContent);
      } else if (subtabName === "users") {
        renderUsersSubtab(subTabContent);
      }
    });
  });
}
