/**
 * Renders the "Threads" subtab content within the Forum Preferences tab.
 *
 * @param {HTMLElement} container - The container element to render into
 */
import { log } from "../../../utils/logger.js";
import { gmGetValue, gmSetValue } from "../../../main.js";
export function renderThreadsSubtab(container) {
  log("Rendering Threads subtab...");

  // Get current preference values from storage
  const disableYouTubeEmbeds = gmGetValue("disable-youtube-embeds", false);
  const disableRedditEmbeds = gmGetValue("disable-reddit-embeds", false);

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
    log(`YouTube embeds ${this.checked ? "disabled" : "enabled"}`);
  });

  redditCheckbox.addEventListener("change", function () {
    gmSetValue("disable-reddit-embeds", this.checked);
    log(`Reddit embeds ${this.checked ? "disabled" : "enabled"}`);
  });
}
