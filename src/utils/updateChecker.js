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

export async function checkForUpdates(options = {}) {
  const currentVersion = GM_info.script.version;
  // Prefer updateURL, fallback to downloadURL for fetching metadata
  const metaUrl = GM_info.script.updateURL || GM_info.script.downloadURL;
  const downloadUrl = GM_info.script.downloadURL || GM_info.script.updateURL; // URL to open on click

  if (!metaUrl) {
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

            if (compareVersions(latestVersion, currentVersion) > 0) {
              // Call the notification function (currently commented out)
              showUpdateNotification(latestVersion, downloadUrl);
              // Open download link in new tab if triggered manually (through options parameter)
              if (options && typeof options === "object") {
                window.open(downloadUrl, "_blank");
              }
            } else {
              // Call onNoUpdate callback if provided
              if (options && typeof options.onNoUpdate === "function") {
                options.onNoUpdate();
              }
            }
          } else {
          }
        } else {
          if (options && typeof options.onError === "function") {
            options.onError();
          }
        }
      },
      onerror: function (response) {
        if (options && typeof options.onError === "function") {
          options.onError();
        }
      },
    });
  } catch (err) {}
}
