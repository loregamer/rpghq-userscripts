/**
 * Load content for the selected tab
 * @param {string} tabName - The name of the tab to load
 */
export function loadTabContent(tabName) {
  const content = document.getElementById("mod-manager-content");

  // Clear previous content (except the info note)
  const infoNote = content.querySelector(".info-note");
  content.innerHTML = "";
  if (infoNote) {
    content.appendChild(infoNote);
  }

  switch (tabName) {
    case "installed":
      renderInstalledScriptsTab(content);
      break;
    case "forum":
      renderForumPreferencesTab(content);
      break;
    case "settings":
      renderSettingsTab(content);
      break;
  }
}
