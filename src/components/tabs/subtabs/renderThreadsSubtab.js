/**
 * Renders the "Threads" subtab content within the Forum Preferences tab.
 *
 * @param {HTMLElement} container - The container element to render into
 */
import { log } from "../../../utils/logger.js";
import { gmGetValue, gmSetValue } from "../../../main.js";
export function renderThreadsSubtab(container) {
  // Get current preference values from storage
  const disableYouTubeEmbeds = gmGetValue("disable-youtube-embeds", false); // Default: OFF
  const disableRedditEmbeds = gmGetValue("disable-reddit-embeds", false); // Default: OFF

  container.innerHTML = `
    <div class="preferences-section">
      <div class="preferences-section-header">
        <h3 class="preferences-section-title">Embeds</h3>
      </div>
      <div class="preferences-section-body">
        <div class="preference-item">
          <div class="preference-header">
            <h4 class="preference-name">Disable YouTube Embeds</h4>
            <div class="preference-control">
              <input type="checkbox" id="disable-youtube-embeds" ${disableYouTubeEmbeds ? "checked" : ""}>
            </div>
          </div>
          <p class="preference-description">Replace YouTube embeds with plain links</p>
        </div>
      
        <div class="preference-item">
          <div class="preference-header">
            <h4 class="preference-name">Disable Reddit Embeds</h4>
            <div class="preference-control">
              <input type="checkbox" id="disable-reddit-embeds" ${disableRedditEmbeds ? "checked" : ""}>
            </div>
          </div>
          <p class="preference-description">Replace Reddit embeds with plain links</p>
        </div>
      </div>
    </div>
    <div class="info-note">
      <strong>Note:</strong> Changes take effect immediately. Reload the page to see them applied to existing content.
    </div>
  `;

  // Add event listeners for the checkboxes
  const youtubeCheckbox = container.querySelector("#disable-youtube-embeds");
  const redditCheckbox = container.querySelector("#disable-reddit-embeds");

  youtubeCheckbox.addEventListener("change", function () {
    gmSetValue("disable-youtube-embeds", this.checked);

    // Show message about page reload needed
    const reloadMsg = document.createElement("div");
    reloadMsg.className = "info-note reload-message";
    reloadMsg.innerHTML =
      "<strong>Action Required:</strong> Please reload the page to apply changes to existing embeds.";
    container.appendChild(reloadMsg);

    // Remove the message after 5 seconds
    setTimeout(() => {
      if (reloadMsg.parentNode) {
        reloadMsg.parentNode.removeChild(reloadMsg);
      }
    }, 5000);
  });

  redditCheckbox.addEventListener("change", function () {
    gmSetValue("disable-reddit-embeds", this.checked);

    // Show message about page reload needed
    const reloadMsg = document.createElement("div");
    reloadMsg.className = "info-note reload-message";
    reloadMsg.innerHTML =
      "<strong>Action Required:</strong> Please reload the page to apply changes to existing embeds.";
    container.appendChild(reloadMsg);

    // Remove the message after 5 seconds
    setTimeout(() => {
      if (reloadMsg.parentNode) {
        reloadMsg.parentNode.removeChild(reloadMsg);
      }
    }, 5000);
  });
}
