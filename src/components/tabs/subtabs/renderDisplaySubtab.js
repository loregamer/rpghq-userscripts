/**
 * Renders the "Display" subtab content within the Forum Preferences tab.
 * This handles preferences that control visual display options like comma formatting.
 *
 * @param {HTMLElement} container - The container element to render into
 */
import { log } from "../../../utils/logger.js";
import { gmGetValue, gmSetValue } from "../../../main.js";
import { reinitializeForumPreferences } from "../../../forumPreferenceHandlers.js";

export function renderDisplaySubtab(container) {
  // Get current preference values from storage
  const commaFormattingEnabled = gmGetValue(
    "display_commaFormatting_enabled",
    true, // Default: ON
  );
  const formatFourDigits = gmGetValue(
    "display_commaFormatting_formatFourDigits",
    false, // Default: OFF
  );

  container.innerHTML = `
    <div class="preferences-section">
      <div class="preferences-section-header">
        <h3 class="preferences-section-title">Number Formatting</h3>
      </div>
      <div class="preferences-section-body">
        <div class="preference-item">
          <div class="preference-header">
            <h4 class="preference-name">Enable Comma Formatting</h4>
            <div class="preference-control">
              <input type="checkbox" id="comma-formatting-enabled" ${commaFormattingEnabled ? "checked" : ""}>
            </div>
          </div>
          <p class="preference-description">Add commas to large numbers in forum posts and statistics</p>
        </div>
      
        <div class="preference-item ${!commaFormattingEnabled ? "disabled" : ""}">
          <div class="preference-header">
            <h4 class="preference-name">Format 4-digit numbers</h4>
            <div class="preference-control">
              <input type="checkbox" id="format-four-digits" ${formatFourDigits ? "checked" : ""} ${!commaFormattingEnabled ? "disabled" : ""}>
            </div>
          </div>
          <p class="preference-description">Enable to add commas to 4-digit numbers (1,000+). Disable to only format 5-digit numbers (10,000+)</p>
        </div>
      </div>
    </div>
    
    <div class="info-note">
      <strong>Note:</strong> Changes take effect immediately. Reload the page to see them applied to existing content.
    </div>
  `;

  // Add styles for disabled state
  const style = document.createElement("style");
  style.textContent = `
    .preference-item.disabled {
      opacity: 0.5;
      pointer-events: none;
    }
  `;
  container.appendChild(style);

  // Add event listeners for the checkboxes
  const enabledCheckbox = container.querySelector("#comma-formatting-enabled");
  const fourDigitsCheckbox = container.querySelector("#format-four-digits");

  enabledCheckbox.addEventListener("change", function () {
    gmSetValue("display_commaFormatting_enabled", this.checked);

    // Enable/disable the dependent checkbox
    const fourDigitsItem = container.querySelector(
      ".preference-item:nth-child(2)",
    );
    if (this.checked) {
      fourDigitsCheckbox.disabled = false;
      fourDigitsItem.classList.remove("disabled");
    } else {
      fourDigitsCheckbox.disabled = true;
      fourDigitsItem.classList.add("disabled");
    }

    // Reinitialize forum preferences to apply changes
    reinitializeForumPreferences();

    // Show message about page reload needed
    showReloadMessage(container);
  });

  fourDigitsCheckbox.addEventListener("change", function () {
    gmSetValue("display_commaFormatting_formatFourDigits", this.checked);

    // Reinitialize forum preferences to apply changes
    reinitializeForumPreferences();

    // Show message about page reload needed
    showReloadMessage(container);
  });
}

function showReloadMessage(container) {
  // Remove any existing reload message
  const existingMsg = container.querySelector(".reload-message");
  if (existingMsg) {
    existingMsg.remove();
  }

  const reloadMsg = document.createElement("div");
  reloadMsg.className = "info-note reload-message";
  reloadMsg.style.marginTop = "10px";
  reloadMsg.style.backgroundColor = "#ffeaa7";
  reloadMsg.style.color = "#2d3436";
  reloadMsg.innerHTML =
    "<strong>Action Required:</strong> Please reload the page to see changes applied to existing content.";
  container.appendChild(reloadMsg);

  // Remove the message after 5 seconds
  setTimeout(() => {
    if (reloadMsg.parentNode) {
      reloadMsg.parentNode.removeChild(reloadMsg);
    }
  }, 5000);
}
