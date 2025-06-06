/**
 * Migration handler for converting scripts to forum preferences
 * This runs once to migrate users' existing script settings to the new preference system
 */

import { gmGetValue, gmSetValue } from "../main.js";
import { log } from "../utils/logger.js";

const MIGRATION_KEY = "forum_preferences_migration_v1";

export function runMigration() {
  // Check if migration has already been run
  if (gmGetValue(MIGRATION_KEY, false)) {
    log("Forum preferences migration already completed");
    return;
  }

  log("Starting forum preferences migration...");
  let migrationCount = 0;

  // Migrate comma formatter settings
  const scriptWasEnabled = gmGetValue("script_enabled_commaFormatter", null);
  // The original script used GM_getValue directly, not our wrapped version
  // So we need to check the unprefixed key
  const originalFormatFourDigits =
    typeof GM_getValue !== "undefined"
      ? GM_getValue("formatFourDigits", null)
      : null;

  if (scriptWasEnabled !== null || originalFormatFourDigits !== null) {
    // Check if the script was enabled (default to true if not set, as it was enabledByDefault)
    const wasEnabled = scriptWasEnabled !== null ? scriptWasEnabled : true;

    // Get the formatFourDigits setting from the original location
    const formatFourDigits =
      originalFormatFourDigits !== null ? originalFormatFourDigits : false;

    // Set the new preference values
    gmSetValue("display_commaFormatting_enabled", wasEnabled);
    gmSetValue("display_commaFormatting_formatFourDigits", formatFourDigits);

    // Clean up old values
    if (scriptWasEnabled !== null) {
      gmSetValue("script_enabled_commaFormatter", undefined);
    }
    if (
      originalFormatFourDigits !== null &&
      typeof GM_deleteValue !== "undefined"
    ) {
      GM_deleteValue("formatFourDigits");
    }
    gmSetValue("script_setting_commaFormatter_formatFourDigits", undefined);

    log(
      `Migrated comma formatter: enabled=${wasEnabled}, formatFourDigits=${formatFourDigits}`,
    );
    migrationCount++;
  }

  // Migrate disable embeds settings
  if (gmGetValue("script_enabled_disableEmbeds", null) !== null) {
    const wasEnabled = gmGetValue("script_enabled_disableEmbeds", false);

    // The individual embed preferences already exist (disable-youtube-embeds, disable-reddit-embeds)
    // so we don't need to migrate those, but we can clean up the script enabled state
    gmSetValue("script_enabled_disableEmbeds", undefined);

    log(
      `Cleaned up disableEmbeds script state (was ${wasEnabled ? "enabled" : "disabled"})`,
    );
    migrationCount++;
  }

  // Mark migration as complete
  gmSetValue(MIGRATION_KEY, true);

  if (migrationCount > 0) {
    log(
      `Forum preferences migration completed. Migrated ${migrationCount} scripts.`,
    );

    // Show a notification to the user (if we have a notification system)
    // This could be enhanced to show a UI notification
    console.info(
      `RPGHQ Userscript Manager: Migrated ${migrationCount} scripts to forum preferences. ` +
        `These features are now controlled through Forum Preferences instead of the Scripts tab.`,
    );
  } else {
    log("No scripts needed migration");
  }
}
