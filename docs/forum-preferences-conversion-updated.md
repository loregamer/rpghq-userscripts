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
  - **Default: ON** (enabled by default)

- **Media Embeds** (`src/preferenceHandlers/mediaEmbeds.js`)
  - Controls YouTube and Reddit embed display
  - Replaces embeds with plain links when disabled
  - Already had UI in Forum Preferences → Threads
  - **Default: OFF** (both YouTube and Reddit embeds show by default)

### 3. UI Updates
- Added new "Display" subtab in Forum Preferences (`src/components/tabs/subtabs/renderDisplaySubtab.js`)
- Updated Forum Preferences tab to include 4 subtabs: Theme, Display, Threads, Users
- Comma formatting settings now appear under Display preferences
- Media embed settings remain under Threads preferences

### 4. Default Settings
- **Comma Formatting**: Enabled by default (users see formatted numbers immediately)
- **Disable YouTube Embeds**: Off by default (embeds show normally)
- **Disable Reddit Embeds**: Off by default (embeds show normally)
- **Format 4-digit numbers**: Off by default (only 5+ digit numbers get commas)

### 5. Files Modified
- **Removed from manifest.js**: `disableEmbeds` and `commaFormatter` scripts
- **Updated main.js**: 
  - Added forum preference initialization
  - Removed imports for converted scripts
- **Updated load_order.json**: Removed references to converted scripts
- **Updated renderThreadsSubtab.js**: Removed script enabling logic

### 6. Cleanup
- Script files remain in place but are no longer referenced
- Documentation files marked for removal but preserved with .removed extension
- Migration handler removed - clean install approach with sensible defaults

## Benefits

1. **Cleaner UI**: Basic display preferences no longer appear as "scripts"
2. **Always Active**: Preferences apply automatically without enable/disable toggles
3. **Better Organization**: Settings grouped logically by type
4. **Easier Maintenance**: Clear separation between features and preferences
5. **Better Performance**: No need to check script enabled state
6. **Better Defaults**: Comma formatting on by default for better UX

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
   - Remove from manifest and imports

3. **Testing Checklist**:
   - [ ] Preference handler initializes correctly
   - [ ] Settings UI works properly
   - [ ] Changes apply without page reload (where possible)
   - [ ] Default values are sensible
   - [ ] No console errors
   - [ ] Script no longer appears in Scripts tab

## Technical Notes

- Preference keys follow pattern: `category_feature_setting`
  - Example: `display_commaFormatting_enabled`
- Handlers must export `shouldRun()` and `init()` functions
- `init()` can return a cleanup function for proper teardown
- Use `reinitializeForumPreferences()` when settings change

## Default Values

The system uses sensible defaults for a better out-of-box experience:
- **Comma Formatting**: ON - Most users want numbers formatted
- **Media Embeds**: Show by default - Users can disable if they prefer
- **4-digit formatting**: OFF - Less visual clutter, 5+ digits only
