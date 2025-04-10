/**
 * Renders an empty state message when no scripts are found.
 *
 * @param {HTMLElement} container - The container element to render into
 * @param {string} message - The message to display (optional)
 * @param {string} iconClass - The Font Awesome icon class to use (optional)
 */
export function renderEmptyState(
  container,
  message = "No scripts found.",
  iconClass = "fa-search",
) {
  log("Rendering empty state...");

  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">
        <i class="fa ${iconClass}"></i>
      </div>
      <div class="empty-state-message">${message}</div>
    </div>
  `;
}
