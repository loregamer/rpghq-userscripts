/**
 * Shows the userscript manager modal and sets up tab functionality.
 *
 * @param {Object} options - Configuration options
 * @param {Function} options.loadTabContent - Function to load tab content
 * @param {Function} options.hideModal - Function to hide the modal
 * @param {string} [options.initialTabName="installed"] - The name of the tab to show initially.
 */
import { log } from "../utils/logger.js";
export function showModal({
  loadTabContent,
  hideModal,
  initialTabName = "installed", // Default if not provided
}) {
  log("Showing userscript manager modal...");

  let modal = document.getElementById("mod-manager-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "mod-manager-modal";
    modal.className = "mod-manager-modal";
    modal.innerHTML = `
      <div class="mod-manager-modal-content">
        <div class="mod-manager-header">
          <h2 class="mod-manager-title">RPGHQ Userscript Manager <span style="font-size: x-small;">v${GM_info.script.version}</span></h2>
          <span class="mod-manager-close">&times;</span>
        </div>
        <div class="mod-manager-tabs">
          <div class="mod-manager-tab active" data-tab="installed">
            <i class="fa fa-puzzle-piece"></i> Installed Scripts
          </div>
          <div class="mod-manager-tab" data-tab="forum">
            <i class="fa fa-sliders"></i> Forum Preferences
          </div>
          <div class="mod-manager-tab" data-tab="settings">
            <i class="fa fa-cog"></i> Settings
          </div>
        </div>
        <div class="mod-manager-content" id="mod-manager-content">
          <!-- Content loaded dynamically -->
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Add event listeners
    modal.querySelector(".mod-manager-close").addEventListener("click", () => {
      hideModal();
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        hideModal();
      }
    });

    // Tab switching
    modal.querySelectorAll(".mod-manager-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".mod-manager-tab").forEach((t) => {
          t.classList.remove("active");
        });
        tab.classList.add("active");
        loadTabContent(tab.dataset.tab);
      });
    });
  }

  // Set the active tab visually
  modal.querySelectorAll(".mod-manager-tab").forEach((tab) => {
    if (tab.dataset.tab === initialTabName) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  modal.style.display = "block";
  document.body.style.overflow = "hidden";

  // Load the initial or last selected tab content
  loadTabContent(initialTabName);
}
