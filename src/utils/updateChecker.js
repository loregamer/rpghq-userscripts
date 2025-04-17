// G:/Modding/_Github/HQ-Userscripts/src/utils/updateChecker.js
import { log, warn, error } from "./logger.js";
// Placeholder for the notification function - will be created later
import { showUpdateNotification } from "../components/updateNotification.js";

// Simple version comparison (e.g., "1.10.1" > "1.2.3")
function compareVersions(v1, v2) {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);
  const len = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < len; i++) {
    const n1 = parts1[i] || 0;
    const n2 = parts2[i] || 0;
    if (n1 > n2) return 1;
    if (n1 < n2) return -1;
  }
  return 0;
}

export async function checkForUpdates() {
  log("Checking for userscript updates...");

  const currentVersion = GM_info.script.version;
  // Prefer updateURL, fallback to downloadURL for fetching metadata
  const metaUrl = GM_info.script.updateURL || GM_info.script.downloadURL;
  const downloadUrl = GM_info.script.downloadURL || GM_info.script.updateURL; // URL to open on click

  if (!metaUrl) {
    warn(
      "No updateURL or downloadURL found in script metadata. Cannot check for updates.",
    );
    return;
  }

  try {
    // eslint-disable-next-line no-undef
    GM_xmlhttpRequest({
      method: "GET",
      url: metaUrl,
      onload: function (response) {
        if (response.status >= 200 && response.status < 300) {
          const metaText = response.responseText;
          // Extract version using regex
          const versionMatch = metaText.match(/@version\s+([\d.]+)/);
          if (versionMatch && versionMatch[1]) {
            const latestVersion = versionMatch[1];
            log(
              `Current version: ${currentVersion}, Latest version: ${latestVersion}`,
            );
            if (compareVersions(latestVersion, currentVersion) > 0) {
              log(`Update available: ${latestVersion}`);
              // Call the notification function (currently commented out)
              showUpdateNotification(latestVersion, downloadUrl);
            } else {
              log("Script is up to date.");
            }
          } else {
            warn("Could not find @version tag in metadata file:", metaUrl);
          }
        } else {
          warn(`Failed to fetch metadata. Status: ${response.status}`, metaUrl);
        }
      },
      onerror: function (response) {
        error("Error fetching metadata:", response);
      },
    });
  } catch (err) {
    error("Error during GM_xmlhttpRequest setup:", err);
  }
}
