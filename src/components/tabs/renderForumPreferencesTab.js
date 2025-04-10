/**
 * Renders the "Forum Preferences" tab content with subtabs.
 * 
 * @param {HTMLElement} container - The container element to render into
 */
import { renderThreadsSubtab } from './subtabs/renderThreadsSubtab.js';
import { renderUsersSubtab } from './subtabs/renderUsersSubtab.js';

export function renderForumPreferencesTab(container) {
  console.log("Rendering Forum Preferences tab with subtabs...");
  
  container.innerHTML = `<h2>Forum Preferences</h2>`;

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