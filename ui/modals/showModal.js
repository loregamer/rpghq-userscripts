/**
 * Create and show the modal with script information
 */
function showModal() {
  let modal = document.getElementById("mod-manager-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "mod-manager-modal";
    modal.className = "mod-manager-modal";
    modal.innerHTML = `
      <div class="mod-manager-modal-content">
        <div class="mod-manager-header">
          <h2 class="mod-manager-title">RPGHQ Userscript Manager</h2>
          <span class="mod-manager-close">&times;</span>
        </div>
        <div class="mod-manager-tabs">
          <div class="mod-manager-tab active" data-tab="installed">
            <i class="fa fa-puzzle-piece"></i> Installed Scripts
          </div>
          <div class="mod-manager-tab" data-tab="forum">
            <i class="fa fa-sliders-h"></i> Forum Preferences
          </div>
          <div class="mod-manager-tab" data-tab="settings">
            <i class="fa fa-cog"></i> Settings
          </div>
        </div>
        <div class="mod-manager-content" id="mod-manager-content">
          <div class="info-note">
            <strong>Note:</strong> This is a view-only display of available userscripts. No scripts will be installed or executed.
          </div>
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

  modal.style.display = "block";
  document.body.style.overflow = "hidden";

  // Initial view - load the first tab (Installed Scripts)
  loadTabContent("installed");
}
