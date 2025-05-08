/**
 * Shows the userscript manager modal and sets up tab functionality.
 *
 * @param {Object} options - Configuration options
 * @param {Function} options.loadTabContent - Function to load tab content
 * @param {Function} options.hideModal - Function to hide the modal
 * @param {string} [options.initialTabName="installed"] - The name of the tab to show initially.
 */
import { log } from "../utils/logger.js";
import { gmGetValue } from "../main.js";
import { checkForUpdates } from "../utils/updateChecker.js";
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
          <h2 class="mod-manager-title">RPGHQ Userscript Manager <span style="font-size: x-small;">v${GM_info.script.version}</span> ${!gmGetValue("auto_update_check", true) ? '<button id="check-update-btn" style="margin-left: 10px; cursor: pointer; background-color: #C62D51; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; padding: 0; position: relative; top: -1px;"><i class="fa fa-refresh" aria-hidden="true"></i></button>' : ""}</h2>
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

    // Add event listener for the update check button if it exists
    const updateButton = modal.querySelector("#check-update-btn");
    if (updateButton) {
      updateButton.addEventListener("click", () => {
        log("Manual update check triggered");

        // Save original button content
        const originalContent = updateButton.innerHTML;

        // Show checking state
        updateButton.innerHTML =
          '<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>';
        updateButton.title = "Checking...";
        updateButton.disabled = true;

        // Create a custom update checker that handles the button states
        checkForUpdates({
          onNoUpdate: () => {
            // Show no update found state
            updateButton.innerHTML =
              '<i class="fa fa-check" aria-hidden="true"></i>';
            updateButton.title = "No update found";
            updateButton.disabled = false;

            // Reset after 3 seconds
            setTimeout(() => {
              updateButton.innerHTML = originalContent;
              updateButton.title = "Check for update";
            }, 3000);
          },
          onError: () => {
            // Show error state
            updateButton.innerHTML =
              '<i class="fa fa-exclamation" aria-hidden="true"></i>';
            updateButton.title = "Check failed";
            updateButton.disabled = false;

            // Reset after 3 seconds
            setTimeout(() => {
              updateButton.innerHTML = originalContent;
              updateButton.title = "Check for update";
            }, 3000);
          },
          // For update found case, showUpdateNotification will handle it
        });
      });
    }

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
