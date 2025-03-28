/**
 * Clean up expired storage entries
 */
export function cleanupStorage() {
  const lastCleanup = GM_getValue("last_storage_cleanup", 0);
  const now = Date.now();

  // Only cleanup if it's been more than 24 hours since last cleanup
  if (now - lastCleanup >= ONE_DAY) {
    // Get all stored keys
    const allKeys = GM_listValues ? GM_listValues() : [];

    allKeys.forEach((key) => {
      if (key === "last_storage_cleanup") return;

      const data = GM_getValue(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (parsed.timestamp && now - parsed.timestamp >= ONE_DAY) {
            GM_deleteValue(key);
          }
        } catch (e) {
          // If we can't parse the data, it's probably corrupted, so delete it
          GM_deleteValue(key);
        }
      }
    });

    // Update last cleanup timestamp
    GM_setValue("last_storage_cleanup", now);
  }
}