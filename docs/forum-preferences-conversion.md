# Converting Scripts to Forum Preferences - Implementation Summary

## Overview

This document summarizes the implementation of a system to convert certain userscripts into forum preferences that run automatically without requiring enable/disable toggles.

## What Was Implemented

### 1. Forum Preference Handler System

Created a new system in `src/forumPreferenceHandlers.js` that:

- Manages features that run automatically based on forum preferences
- Provides initialization and cleanup functions for each preference handler
- Supports dynamic reinitialization when preferences change

### 2. Preference Handlers Created

- **Comma Formatting** (`src/preferenceHandlers/commaFormatting.js`)

  - Adds commas to large numbers in forum posts
  - Configurable for 4-digit or 5-digit numbers
  - Runs automatically based on display preferences

- **Media Embeds** (`src/preferenceHandlers/mediaEmbeds.js`)
  - Controls YouTube and Reddit embed display
  - Replaces embeds with plain links when disabled
  - Already had UI in Forum Preferences → Threads

### 3. UI Updates

- Added new "Display" subtab in Forum Preferences (`src/components/tabs/subtabs/renderDisplaySubtab.js`)
- Updated Forum Preferences tab to include 4 subtabs: Theme, Display, Threads, Users
- Comma formatting settings now appear under Display preferences
- Media embed settings remain under Threads preferences

### 4. Migration System

Created `src/utils/migrationHandler.js` to:

- Automatically migrate existing user settings from scripts to preferences
- Clean up old script-related storage keys
- Run once per user to ensure smooth transition

### 5. Files Modified

- **Removed from manifest.js**: `disableEmbeds` and `commaFormatter` scripts
- **Updated main.js**:
  - Added forum preference initialization
  - Removed imports for converted scripts
  - Added migration handler
- **Updated load_order.json**: Removed references to converted scripts
- **Updated renderThreadsSubtab.js**: Removed script enabling logic

### 6. Cleanup

- Script files remain in place but are no longer referenced
- Documentation files marked for removal but preserved with .removed extension

## Benefits

1. **Cleaner UI**: Basic display preferences no longer appear as "scripts"
2. **Always Active**: Preferences apply automatically without enable/disable toggles
3. **Better Organization**: Settings grouped logically by type
4. **Easier Maintenance**: Clear separation between features and preferences
5. **Better Performance**: No need to check script enabled state

## Next Steps

To convert additional scripts to forum preferences:

1. **Identify Candidates**: Scripts that are display/UI preferences rather than features

   - Better Quotes
   - Separate Reactions
   - Recent Topics Format

2. **For Each Script**:

   - Create a preference handler in `src/preferenceHandlers/`
   - Add to `PREFERENCE_HANDLERS` in `forumPreferenceHandlers.js`
   - Create/update UI in appropriate subtab
   - Add migration logic
   - Remove from manifest and imports

3. **Testing Checklist**:
   - [ ] Preference handler initializes correctly
   - [ ] Settings UI works properly
   - [ ] Changes apply without page reload (where possible)
   - [ ] Migration preserves user settings
   - [ ] No console errors
   - [ ] Script no longer appears in Scripts tab

## Technical Notes

- Preference keys follow pattern: `category_feature_setting`
  - Example: `display_commaFormatting_enabled`
- Handlers must export `shouldRun()` and `init()` functions
- `init()` can return a cleanup function for proper teardown
- Use `reinitializeForumPreferences()` when settings change

## Migration Strategy

The migration handler:

1. Checks for old script settings
2. Copies values to new preference keys
3. Cleans up old keys
4. Marks migration as complete
5. Shows console message to user

This ensures users don't lose their settings during the transition.
