/**
 * Renders the "Threads" subtab content within the Forum Preferences tab.
 *
 * @param {HTMLElement} container - The container element to render into
 */
import { log } from "../../../utils/logger.js";
export function renderThreadsSubtab(container) {
  log("Rendering Threads subtab...");

  container.innerHTML = `
    <div class="wip-banner">
      <i class="fa fa-wrench"></i> Thread Preferences - Work In Progress
    </div>
  
    <div class="preferences-section">
      <div class="preferences-section-header">
        <h3 class="preferences-section-title">Thread Display</h3>
      </div>
      <div class="preferences-section-body">
        <div class="preference-item">
          <div class="preference-header">
            <h4 class="preference-name">Thread Layout</h4>
            <div class="preference-control">
              <select>
                <option selected>Compact</option>
                <option>Standard</option>
                <option>Expanded</option>
              </select>
            </div>
          </div>
          <p class="preference-description">Choose how thread listings are displayed</p>
        </div>
      
        <div class="preference-item">
          <div class="preference-header">
            <h4 class="preference-name">Threads Per Page</h4>
            <div class="preference-control">
              <select>
                <option>10</option>
                <option selected>20</option>
                <option>30</option>
                <option>50</option>
              </select>
            </div>
          </div>
          <p class="preference-description">Number of threads to display per page</p>
        </div>
      </div>
    </div>
  
    <div class="info-note">
      <strong>Note:</strong> This is a view-only display. Additional Thread preferences will be added in future updates.
    </div>
  `;
}
