# Project Outline

```
HQ-Userscripts
├── docs
│   ├── scripts
│   │   ├── bbcode.md
│   │   ├── commaFormatter.md
│   │   ├── kalareact.md
│   │   ├── memberSearch.md
│   │   ├── notifications.md
│   │   ├── pinThreads.md
│   │   ├── randomTopic.md
│   │   ├── recentTopicsFormat.md
│   │   ├── scriptId.md
│   │   └── separateReactions.md
│   ├── tools
│   │   └── add-script.md
│   ├── ui
│   │   └── phase7-implementation.md
│   ├── bbcode_execution_phase.md
│   ├── checkbox-styling.md
│   ├── execution_order.md
│   ├── execution_phases.md
│   ├── folder_structure.md
│   ├── migration_guide.md
│   ├── roadmap.md
│   ├── style-injection.md
│   ├── ui_description_popup_only.md
│   └── url-matching.md
├── scripts
│   ├── generate-outline.cjs
│   ├── inject-styles.js
│   ├── sort-manifest.js
│   │    └─> **extractBalancedContent**
│   │    └─> **extractName**
│   │    └─> **extractScriptObjects**
│   └── update-load-order.cjs
├── src
│   ├── components
│   │   ├── tabs
│   │   │   ├── subtabs
│   │   │   │   ├── renderThreadsSubtab.js
│   │   │   │   │    └─> **renderThreadsSubtab**
│   │   │   │   │        - log (from src/utils/logger.js)
│   │   │   │   └── renderUsersSubtab.js
│   │   │   │        └─> **renderUsersSubtab**
│   │   │   │            - log (from src/utils/logger.js)
│   │   │   ├── renderForumPreferencesTab.js
│   │   │   │    └─> **renderForumPreferencesTab**
│   │   │   │        - log (from src/utils/logger.js)
│   │   │   │        - renderThreadsSubtab (from src/components/tabs/subtabs/renderThreadsSubtab.js)
│   │   │   │        - renderUsersSubtab (from src/components/tabs/subtabs/renderUsersSubtab.js)
│   │   │   ├── renderInstalledScriptsTab.js
│   │   │   │    └─> **renderInstalledScriptsTab**
│   │   │   │        - log (from src/utils/logger.js)
│   │   │   │        - renderScriptsGridView (from src/components/renderScriptsGridView.js)
│   │   │   └── renderSettingsTab.js
│   │   │        └─> **renderSettingsTab**
│   │   │            - log (from src/utils/logger.js)
│   │   ├── emptyState.js
│   │   │    └─> **renderEmptyState**
│   │   │        - log (from src/utils/logger.js)
│   │   ├── hideModal.js
│   │   │    └─> **hideModal**
│   │   │        - log (from src/utils/logger.js)
│   │   ├── loadTabContent.js
│   │   │    └─> **loadTabContent**
│   │   │        - error (from src/utils/logger.js)
│   │   │        - log (from src/utils/logger.js)
│   │   │        - renderForumPreferencesTab (from src/components/tabs/renderForumPreferencesTab.js)
│   │   │        - renderInstalledScriptsTab (from src/components/tabs/renderInstalledScriptsTab.js)
│   │   │        - renderSettingsTab (from src/components/tabs/renderSettingsTab.js)
│   │   ├── renderPreferenceControl.js
│   │   │    └─> **renderPreferenceControl**
│   │   ├── renderScriptSettingsContent.js
│   │   │    └─> **renderScriptSettingsContent**
│   │   │        - getScriptSetting (from src/main.js)
│   │   │        - log (from src/utils/logger.js)
│   │   │        - renderSettingControl (from src/components/renderSettingControl.js)
│   │   ├── renderScriptsGridView.js
│   │   │    └─> **renderScriptsGridView**
│   │   │        - log (from src/utils/logger.js)
│   │   │        - renderEmptyState (from src/components/emptyState.js)
│   │   │        - showScriptSettings (from src/components/showScriptSettings.js)
│   │   ├── renderScriptsListView.js
│   │   │    └─> **renderScriptsListView**
│   │   │        - log (from src/utils/logger.js)
│   │   │        - renderEmptyState (from src/components/emptyState.js)
│   │   │        - showScriptSettings (from src/components/showScriptSettings.js)
│   │   ├── renderSettingControl.js
│   │   │    └─> **renderSettingControl**
│   │   │        - getScriptSetting (from src/main.js)
│   │   ├── showModal.js
│   │   │    └─> **showModal**
│   │   │        - hideModal (from src/components/hideModal.js)
│   │   │        - loadTabContent (from src/components/loadTabContent.js)
│   │   │        - log (from src/utils/logger.js)
│   │   ├── showScriptSettings.js
│   │   │    └─> **showScriptSettings**
│   │   │        - log (from src/utils/logger.js)
│   │   │        - renderEmptyState (from src/components/emptyState.js)
│   │   │        - renderScriptSettingsContent (from src/components/renderScriptSettingsContent.js)
│   │   │        - saveScriptSetting (from src/main.js)
│   │   │        - warn (from src/utils/logger.js)
│   │   └── toggleScriptEnabled.js
│   │        └─> **toggleScriptEnabled**
│   │            - error (from src/utils/logger.js)
│   │            - gmSetValue (from src/main.js)
│   │            - loadScript (from src/main.js)
│   │            - log (from src/utils/logger.js)
│   │            - unloadScript (from src/main.js)
│   ├── scripts
│   │   ├── bbcode.js
│   │   │    └─> **addColorButtonListeners**
│   │   │        - addCustomColorsToExistingPalette (from src/scripts/bbcode.js)
│   │   │    └─> **addCustomButtons**
│   │   │        - insertBloomeryPing (from src/scripts/bbcode.js)
│   │   │        - insertModTemplate (from src/scripts/bbcode.js)
│   │   │        - insertTable (from src/scripts/bbcode.js)
│   │   │    └─> **addCustomColorsToExistingPalette**
│   │   │        - adjustTextareaAndHighlight (from src/scripts/bbcode.js)
│   │   │        - updateHighlight (from src/scripts/bbcode.js)
│   │   │        - wrapSelectedText (from src/scripts/bbcode.js)
│   │   │    └─> **addCustomColorsToPalette**
│   │   │        - addColorButtonListeners (from src/scripts/bbcode.js)
│   │   │        - addCustomColorsToExistingPalette (from src/scripts/bbcode.js)
│   │   │    └─> **addCustomSmileyButtons**
│   │   │        - insertSmiley (from src/scripts/bbcode.js)
│   │   │    └─> **addStyles**
│   │   │    └─> **adjustTextareaAndHighlight**
│   │   │        - positionEditorHeader (from src/scripts/bbcode.js)
│   │   │        - positionSmileyBox (from src/scripts/bbcode.js)
│   │   │    └─> **checkForUpdates**
│   │   │        - adjustTextareaAndHighlight (from src/scripts/bbcode.js)
│   │   │        - updateHighlight (from src/scripts/bbcode.js)
│   │   │    └─> **escapeHTML**
│   │   │    └─> **getColorIndex**
│   │   │    └─> **getContrastColor**
│   │   │    └─> **highlightBBCode**
│   │   │        - escapeHTML (from src/scripts/bbcode.js)
│   │   │        - getColorIndex (from src/scripts/bbcode.js)
│   │   │        - getContrastColor (from src/scripts/bbcode.js)
│   │   │    └─> **init**
│   │   │        - addColorButtonListeners (from src/scripts/bbcode.js)
│   │   │        - addCustomButtons (from src/scripts/bbcode.js)
│   │   │        - addCustomColorsToExistingPalette (from src/scripts/bbcode.js)
│   │   │        - addCustomColorsToPalette (from src/scripts/bbcode.js)
│   │   │        - addCustomSmileyButtons (from src/scripts/bbcode.js)
│   │   │        - addStyles (from src/scripts/bbcode.js)
│   │   │        - adjustTextareaAndHighlight (from src/scripts/bbcode.js)
│   │   │        - checkForUpdates (from src/scripts/bbcode.js)
│   │   │        - escapeHTML (from src/scripts/bbcode.js)
│   │   │        - getColorIndex (from src/scripts/bbcode.js)
│   │   │        - getContrastColor (from src/scripts/bbcode.js)
│   │   │        - highlightBBCode (from src/scripts/bbcode.js)
│   │   │        - initialize (from src/scripts/bbcode.js)
│   │   │        - insertBloomeryPing (from src/scripts/bbcode.js)
│   │   │        - insertModTemplate (from src/scripts/bbcode.js)
│   │   │        - insertSmiley (from src/scripts/bbcode.js)
│   │   │        - insertTable (from src/scripts/bbcode.js)
│   │   │        - insertTextAtCursor (from src/scripts/bbcode.js)
│   │   │        - isSingleEmoji (from src/scripts/bbcode.js)
│   │   │        - positionEditorHeader (from src/scripts/bbcode.js)
│   │   │        - positionSmileyBox (from src/scripts/bbcode.js)
│   │   │        - removeInterferingEventListeners (from src/scripts/bbcode.js)
│   │   │        - saveCustomSmileys (from src/scripts/bbcode.js)
│   │   │        - saveFormData (from src/scripts/bbcode.js)
│   │   │        - setupFormSubmitTracking (from src/scripts/bbcode.js)
│   │   │        - updateHighlight (from src/scripts/bbcode.js)
│   │   │        - updatePageTitle (from src/scripts/bbcode.js)
│   │   │        - updateSmileyList (from src/scripts/bbcode.js)
│   │   │        - wrapSelectedText (from src/scripts/bbcode.js)
│   │   │    └─> **initialize**
│   │   │        - addCustomButtons (from src/scripts/bbcode.js)
│   │   │        - addCustomSmileyButtons (from src/scripts/bbcode.js)
│   │   │        - adjustTextareaAndHighlight (from src/scripts/bbcode.js)
│   │   │        - checkForUpdates (from src/scripts/bbcode.js)
│   │   │        - positionEditorHeader (from src/scripts/bbcode.js)
│   │   │        - positionSmileyBox (from src/scripts/bbcode.js)
│   │   │        - removeInterferingEventListeners (from src/scripts/bbcode.js)
│   │   │        - saveFormData (from src/scripts/bbcode.js)
│   │   │        - updateHighlight (from src/scripts/bbcode.js)
│   │   │        - updatePageTitle (from src/scripts/bbcode.js)
│   │   │        - wrapSelectedText (from src/scripts/bbcode.js)
│   │   │    └─> **insertBloomeryPing**
│   │   │        - insertTextAtCursor (from src/scripts/bbcode.js)
│   │   │    └─> **insertModTemplate**
│   │   │        - insertTextAtCursor (from src/scripts/bbcode.js)
│   │   │    └─> **insertSmiley**
│   │   │        - adjustTextareaAndHighlight (from src/scripts/bbcode.js)
│   │   │        - updateHighlight (from src/scripts/bbcode.js)
│   │   │    └─> **insertTable**
│   │   │        - insertTextAtCursor (from src/scripts/bbcode.js)
│   │   │    └─> **insertTextAtCursor**
│   │   │        - adjustTextareaAndHighlight (from src/scripts/bbcode.js)
│   │   │        - updateHighlight (from src/scripts/bbcode.js)
│   │   │    └─> **isSingleEmoji**
│   │   │    └─> **positionEditorHeader**
│   │   │    └─> **positionSmileyBox**
│   │   │    └─> **removeInterferingEventListeners**
│   │   │    └─> **saveCustomSmileys**
│   │   │        - addCustomSmileyButtons (from src/scripts/bbcode.js)
│   │   │    └─> **saveFormData**
│   │   │    └─> **setupFormSubmitTracking**
│   │   │    └─> **showCustomSmileysPopup**
│   │   │        - isSingleEmoji (from src/scripts/bbcode.js)
│   │   │        - saveCustomSmileys (from src/scripts/bbcode.js)
│   │   │        - updateSmileyList (from src/scripts/bbcode.js)
│   │   │    └─> **updateHighlight**
│   │   │        - highlightBBCode (from src/scripts/bbcode.js)
│   │   │    └─> **updatePageTitle**
│   │   │    └─> **updateSmileyList**
│   │   │        - isSingleEmoji (from src/scripts/bbcode.js)
│   │   │        - saveCustomSmileys (from src/scripts/bbcode.js)
│   │   │        - updateSmileyList (from src/scripts/bbcode.js)
│   │   │    └─> **wrapSelectedText**
│   │   ├── commaFormatter.js
│   │   │    └─> **calculateForumStatistics**
│   │   │        - formatNumberWithCommas (from src/scripts/commaFormatter.js)
│   │   │        - formatStatNumber (from src/scripts/commaFormatter.js)
│   │   │    └─> **formatNumberWithCommas**
│   │   │    └─> **formatStatNumber**
│   │   │        - formatNumberWithCommas (from src/scripts/commaFormatter.js)
│   │   │    └─> **init**
│   │   │        - calculateForumStatistics (from src/scripts/commaFormatter.js)
│   │   │        - formatNumberWithCommas (from src/scripts/commaFormatter.js)
│   │   │        - formatStatNumber (from src/scripts/commaFormatter.js)
│   │   │        - log (from src/utils/logger.js)
│   │   │        - processElements (from src/scripts/commaFormatter.js)
│   │   │    └─> **processElements**
│   │   │        - formatNumberWithCommas (from src/scripts/commaFormatter.js)
│   │   ├── kalareact.js
│   │   │    └─> **init**
│   │   │        - log (from src/utils/logger.js)
│   │   ├── memberSearch.js
│   │   │    └─> **addMemberSearchButton**
│   │   │        - createMemberSearchModal (from src/scripts/memberSearch.js)
│   │   │    └─> **createMemberSearchModal**
│   │   │        - setupSearchFunctionality (from src/scripts/memberSearch.js)
│   │   │    └─> **displaySearchResults**
│   │   │    └─> **init**
│   │   │        - addMemberSearchButton (from src/scripts/memberSearch.js)
│   │   │        - createMemberSearchModal (from src/scripts/memberSearch.js)
│   │   │        - displaySearchResults (from src/scripts/memberSearch.js)
│   │   │        - error (from src/utils/logger.js)
│   │   │        - searchMembers (from src/scripts/memberSearch.js)
│   │   │        - setupSearchFunctionality (from src/scripts/memberSearch.js)
│   │   │    └─> **searchMembers**
│   │   │        - displaySearchResults (from src/scripts/memberSearch.js)
│   │   │        - error (from src/utils/logger.js)
│   │   │    └─> **setupSearchFunctionality**
│   │   │        - searchMembers (from src/scripts/memberSearch.js)
│   │   ├── notifications.js
│   │   │    └─> **debouncedCustomize**
│   │   │    └─> **init**
│   │   │        - debouncedCustomize (from src/scripts/notifications.js)
│   │   │        - error (from src/utils/logger.js)
│   │   │        - fetchReactions (from src/scripts/separateReactions.js)
│   │   │        - init (from src/main.js, src/scripts/bbcode.js, src/scripts/commaFormatter.js, src/scripts/kalareact.js, src/scripts/memberSearch.js, src/scripts/notifications.js, src/scripts/pinThreads.js, src/scripts/randomTopic.js, src/scripts/recentTopicsFormat.js, src/scripts/separateReactions.js)
│   │   │        - log (from src/utils/logger.js)
│   │   ├── pinThreads.js
│   │   │    └─> **addForumPinButton**
│   │   │        - addResponsiveStyle (from src/scripts/pinThreads.js)
│   │   │        - createDropdownContainer (from src/scripts/pinThreads.js)
│   │   │        - createForumPinButton (from src/scripts/pinThreads.js)
│   │   │    └─> **addPinButton**
│   │   │        - addThreadPinButton (from src/scripts/pinThreads.js)
│   │   │    └─> **addResponsiveStyle**
│   │   │    └─> **addThreadPinButton**
│   │   │        - addResponsiveStyle (from src/scripts/pinThreads.js)
│   │   │        - createDropdownContainer (from src/scripts/pinThreads.js)
│   │   │        - createThreadPinButton (from src/scripts/pinThreads.js)
│   │   │    └─> **createCustomThreadRowHTML**
│   │   │    └─> **createDropdownContainer**
│   │   │    └─> **createErrorListItemHTML**
│   │   │    └─> **createForumListItemHTML**
│   │   │    └─> **createForumPinButton**
│   │   │        - togglePinForum (from src/scripts/pinThreads.js)
│   │   │        - updatePinButtonState (from src/scripts/pinThreads.js)
│   │   │    └─> **createLoadingListItem**
│   │   │    └─> **createPinButton**
│   │   │        - createThreadPinButton (from src/scripts/pinThreads.js)
│   │   │    └─> **createPinnedForumsSectionElement**
│   │   │    └─> **createPinnedSectionsContainer**
│   │   │    └─> **createPinnedThreadsSection**
│   │   │        - createPinnedForumsSectionElement (from src/scripts/pinThreads.js)
│   │   │        - createPinnedThreadsSectionElement (from src/scripts/pinThreads.js)
│   │   │        - findSearchPageInsertionPoint (from src/scripts/pinThreads.js)
│   │   │        - populatePinnedForumsSection (from src/scripts/pinThreads.js)
│   │   │        - populatePinnedThreadsSection (from src/scripts/pinThreads.js)
│   │   │    └─> **createPinnedThreadsSectionElement**
│   │   │    └─> **createThreadPinButton**
│   │   │        - togglePinThread (from src/scripts/pinThreads.js)
│   │   │        - updatePinButtonState (from src/scripts/pinThreads.js)
│   │   │    └─> **createZomboidStatusHTML**
│   │   │    └─> **fetchAllThreadsData**
│   │   │        - fetchThreadData (from src/scripts/pinThreads.js)
│   │   │    └─> **fetchThreadData**
│   │   │        - createCustomThreadRowHTML (from src/scripts/pinThreads.js)
│   │   │        - fetchThreadRowFromForum (from src/scripts/pinThreads.js)
│   │   │        - fetchThreadTitleAndForum (from src/scripts/pinThreads.js)
│   │   │        - modifyRowHTML (from src/scripts/pinThreads.js)
│   │   │    └─> **fetchThreadRowFromForum**
│   │   │        - fetchThreadRowFromForum (from src/scripts/pinThreads.js)
│   │   │    └─> **fetchThreadTitleAndForum**
│   │   │        - fetchZomboidStatus (from src/scripts/pinThreads.js)
│   │   │    └─> **fetchZomboidStatus**
│   │   │    └─> **findExistingForumRow**
│   │   │    └─> **findExistingThreadRows**
│   │   │    └─> **findSearchPageInsertionPoint**
│   │   │    └─> **getForumInfo**
│   │   │    └─> **getThreadInfo**
│   │   │    └─> **init**
│   │   │        - addForumPinButton (from src/scripts/pinThreads.js)
│   │   │        - addResponsiveStyle (from src/scripts/pinThreads.js)
│   │   │        - addThreadPinButton (from src/scripts/pinThreads.js)
│   │   │        - createCustomThreadRowHTML (from src/scripts/pinThreads.js)
│   │   │        - createDropdownContainer (from src/scripts/pinThreads.js)
│   │   │        - createErrorListItemHTML (from src/scripts/pinThreads.js)
│   │   │        - createForumListItemHTML (from src/scripts/pinThreads.js)
│   │   │        - createForumPinButton (from src/scripts/pinThreads.js)
│   │   │        - createLoadingListItem (from src/scripts/pinThreads.js)
│   │   │        - createPinnedForumsSectionElement (from src/scripts/pinThreads.js)
│   │   │        - createPinnedThreadsSection (from src/scripts/pinThreads.js)
│   │   │        - createPinnedThreadsSectionElement (from src/scripts/pinThreads.js)
│   │   │        - createThreadPinButton (from src/scripts/pinThreads.js)
│   │   │        - fetchThreadData (from src/scripts/pinThreads.js)
│   │   │        - fetchThreadRowFromForum (from src/scripts/pinThreads.js)
│   │   │        - fetchThreadTitleAndForum (from src/scripts/pinThreads.js)
│   │   │        - fetchZomboidStatus (from src/scripts/pinThreads.js)
│   │   │        - findExistingForumRow (from src/scripts/pinThreads.js)
│   │   │        - findExistingThreadRows (from src/scripts/pinThreads.js)
│   │   │        - findSearchPageInsertionPoint (from src/scripts/pinThreads.js)
│   │   │        - getForumInfo (from src/scripts/pinThreads.js)
│   │   │        - getThreadInfo (from src/scripts/pinThreads.js)
│   │   │        - modifyRowHTML (from src/scripts/pinThreads.js)
│   │   │        - populatePinnedForumsSection (from src/scripts/pinThreads.js)
│   │   │        - populatePinnedThreadsSection (from src/scripts/pinThreads.js)
│   │   │        - togglePinForum (from src/scripts/pinThreads.js)
│   │   │        - togglePinThread (from src/scripts/pinThreads.js)
│   │   │        - updateMenuCommand (from src/scripts/pinThreads.js)
│   │   │        - updatePinButtonState (from src/scripts/pinThreads.js)
│   │   │    └─> **modifyRowHTML**
│   │   │    └─> **populatePinnedForumsSection**
│   │   │        - createForumListItemHTML (from src/scripts/pinThreads.js)
│   │   │        - findExistingForumRow (from src/scripts/pinThreads.js)
│   │   │    └─> **populatePinnedThreadsSection**
│   │   │        - createErrorListItemHTML (from src/scripts/pinThreads.js)
│   │   │        - createLoadingListItem (from src/scripts/pinThreads.js)
│   │   │        - fetchThreadData (from src/scripts/pinThreads.js)
│   │   │        - findExistingThreadRows (from src/scripts/pinThreads.js)
│   │   │    └─> **toggleNewPostsDisplay**
│   │   │        - updateMenuCommand (from src/scripts/pinThreads.js)
│   │   │    └─> **togglePinForum**
│   │   │        - getForumInfo (from src/scripts/pinThreads.js)
│   │   │        - updatePinButtonState (from src/scripts/pinThreads.js)
│   │   │    └─> **togglePinThread**
│   │   │        - getThreadInfo (from src/scripts/pinThreads.js)
│   │   │        - updatePinButtonState (from src/scripts/pinThreads.js)
│   │   │    └─> **updateMenuCommand**
│   │   │    └─> **updatePinButtonState**
│   │   ├── randomTopic.js
│   │   │    └─> **addRandomTopicButton**
│   │   │        - error (from src/utils/logger.js)
│   │   │        - getValidRandomTopic (from src/scripts/randomTopic.js)
│   │   │    └─> **checkTopicExists**
│   │   │    └─> **getRandomTopicId**
│   │   │    └─> **getValidRandomTopic**
│   │   │        - checkTopicExists (from src/scripts/randomTopic.js)
│   │   │        - getRandomTopicId (from src/scripts/randomTopic.js)
│   │   │    └─> **handleRandomTopicClick**
│   │   │        - error (from src/utils/logger.js)
│   │   │        - getValidRandomTopic (from src/scripts/randomTopic.js)
│   │   │    └─> **init**
│   │   │        - addRandomTopicButton (from src/scripts/randomTopic.js)
│   │   │        - checkTopicExists (from src/scripts/randomTopic.js)
│   │   │        - error (from src/utils/logger.js)
│   │   │        - getRandomTopicId (from src/scripts/randomTopic.js)
│   │   │        - getValidRandomTopic (from src/scripts/randomTopic.js)
│   │   ├── recentTopicsFormat.js
│   │   │    └─> **init**
│   │   │        - getScriptSetting (from src/main.js)
│   │   │        - log (from src/utils/logger.js)
│   │   │        - processTitle (from src/scripts/recentTopicsFormat.js)
│   │   │        - processTitlesInContainer (from src/scripts/recentTopicsFormat.js)
│   │   │        - styleAdventurersGuildTitle (from src/scripts/recentTopicsFormat.js)
│   │   │        - styleEverythingAfterFirstDash (from src/scripts/recentTopicsFormat.js)
│   │   │        - styleParentheses (from src/scripts/recentTopicsFormat.js)
│   │   │        - styleVersionNumbers (from src/scripts/recentTopicsFormat.js)
│   │   │    └─> **processTitle**
│   │   │        - getScriptSetting (from src/main.js)
│   │   │        - styleAdventurersGuildTitle (from src/scripts/recentTopicsFormat.js)
│   │   │        - styleEverythingAfterFirstDash (from src/scripts/recentTopicsFormat.js)
│   │   │        - styleParentheses (from src/scripts/recentTopicsFormat.js)
│   │   │        - styleVersionNumbers (from src/scripts/recentTopicsFormat.js)
│   │   │    └─> **processTitlesInContainer**
│   │   │    └─> **styleAdventurersGuildTitle**
│   │   │    └─> **styleEverythingAfterFirstDash**
│   │   │    └─> **styleParentheses**
│   │   │    └─> **styleVersionNumbers**
│   │   └── separateReactions.js
│   │        └─> **addToggleLeftModeOption**
│   │            - toggleLeftMode (from src/scripts/separateReactions.js)
│   │        └─> **applyLeftMode**
│   │        └─> **createReactionList**
│   │            - getPollVotes (from src/scripts/separateReactions.js)
│   │            - log (from src/utils/logger.js)
│   │        └─> **fetchReactions**
│   │            - error (from src/utils/logger.js)
│   │            - parseReactions (from src/scripts/separateReactions.js)
│   │        └─> **getPollVotes**
│   │            - log (from src/utils/logger.js)
│   │        └─> **hidePopup**
│   │        └─> **init**
│   │            - addToggleLeftModeOption (from src/scripts/separateReactions.js)
│   │            - applyLeftMode (from src/scripts/separateReactions.js)
│   │            - createReactionList (from src/scripts/separateReactions.js)
│   │            - error (from src/utils/logger.js)
│   │            - fetchReactions (from src/scripts/separateReactions.js)
│   │            - getPollVotes (from src/scripts/separateReactions.js)
│   │            - hidePopup (from src/scripts/separateReactions.js)
│   │            - log (from src/utils/logger.js)
│   │            - observePosts (from src/scripts/separateReactions.js)
│   │            - parseReactions (from src/scripts/separateReactions.js)
│   │            - processPost (from src/scripts/separateReactions.js)
│   │            - showPopup (from src/scripts/separateReactions.js)
│   │            - toggleLeftMode (from src/scripts/separateReactions.js)
│   │            - updateReactions (from src/scripts/separateReactions.js)
│   │        └─> **observePosts**
│   │            - addToggleLeftModeOption (from src/scripts/separateReactions.js)
│   │            - applyLeftMode (from src/scripts/separateReactions.js)
│   │            - processPost (from src/scripts/separateReactions.js)
│   │        └─> **parseReactions**
│   │        └─> **processPost**
│   │            - updateReactions (from src/scripts/separateReactions.js)
│   │        └─> **showPopup**
│   │        └─> **toggleLeftMode**
│   │        └─> **updateReactions**
│   │            - createReactionList (from src/scripts/separateReactions.js)
│   │            - error (from src/utils/logger.js)
│   │            - fetchReactions (from src/scripts/separateReactions.js)
│   │            - hidePopup (from src/scripts/separateReactions.js)
│   │            - showPopup (from src/scripts/separateReactions.js)
│   ├── utils
│   │   ├── compareVersions.js
│   │   │    └─> **compareVersions**
│   │   ├── filterScripts.js
│   │   │    └─> **filterScripts**
│   │   │        - compareVersions (from src/utils/compareVersions.js)
│   │   ├── getCategoryOptions.js
│   │   │    └─> **getCategoryOptions**
│   │   ├── getExecutionPhaseOptions.js
│   │   │    └─> **getExecutionPhaseOptions**
│   │   ├── getPhaseDisplayName.js
│   │   │    └─> **getPhaseDisplayName**
│   │   ├── logger.js
│   │   │    (Error parsing: [object Object])
│   │   ├── README.md
│   │   ├── sharedUtils.js
│   │   └── urlMatcher.js
│   │        └─> **matchesUrl**
│   │        └─> **shouldLoadScript**
│   │            - matchesUrl (from src/utils/urlMatcher.js)
│   ├── forumPreferences.js
│   ├── injectStyles.js
│   ├── main.js
│   │    └─> **addMenuButton**
│   │        - ensureFontAwesome (from src/main.js)
│   │        - log (from src/utils/logger.js)
│   │        - warn (from src/utils/logger.js)
│   │    └─> **ensureFontAwesome**
│   │        - log (from src/utils/logger.js)
│   │    └─> **executeLoadOrderForPhase**
│   │        - error (from src/utils/logger.js)
│   │        - findScriptById (from src/main.js)
│   │        - loadScript (from src/main.js)
│   │        - log (from src/utils/logger.js)
│   │        - warn (from src/utils/logger.js)
│   │    └─> **findScriptById**
│   │    └─> **getScriptSetting**
│   │        - gmGetValue (from src/main.js)
│   │    └─> **gmGetValue**
│   │    └─> **gmSetValue**
│   │    └─> **handleLoadTabContent**
│   │        - loadTabContent (from src/components/loadTabContent.js)
│   │    └─> **handleRenderScriptsGridView**
│   │        - renderScriptsGridView (from src/components/renderScriptsGridView.js)
│   │    └─> **handleRenderScriptsListView**
│   │        - renderScriptsListView (from src/components/renderScriptsListView.js)
│   │    └─> **handleShowScriptSettings**
│   │        - showScriptSettings (from src/components/showScriptSettings.js)
│   │    └─> **init**
│   │        - addMenuButton (from src/main.js)
│   │        - executeLoadOrderForPhase (from src/main.js)
│   │        - initializeScriptStates (from src/main.js)
│   │        - log (from src/utils/logger.js)
│   │        - toggleModalVisibility (from src/main.js)
│   │    └─> **initializeScriptStates**
│   │        - gmGetValue (from src/main.js)
│   │        - log (from src/utils/logger.js)
│   │    └─> **loadScript**
│   │        - error (from src/utils/logger.js)
│   │        - init (from src/main.js, src/scripts/bbcode.js, src/scripts/commaFormatter.js, src/scripts/kalareact.js, src/scripts/memberSearch.js, src/scripts/notifications.js, src/scripts/pinThreads.js, src/scripts/randomTopic.js, src/scripts/recentTopicsFormat.js, src/scripts/separateReactions.js)
│   │        - log (from src/utils/logger.js)
│   │        - shouldLoadScript (from src/utils/urlMatcher.js)
│   │        - warn (from src/utils/logger.js)
│   │    └─> **saveScriptSetting**
│   │        - gmSetValue (from src/main.js)
│   │        - log (from src/utils/logger.js)
│   │    └─> **toggleModalVisibility**
│   │        - hideModal (from src/components/hideModal.js)
│   │        - log (from src/utils/logger.js)
│   │        - showModal (from src/components/showModal.js)
│   │    └─> **unloadScript**
│   │        - error (from src/utils/logger.js)
│   │        - log (from src/utils/logger.js)
│   ├── manifest.js
│   └── meta.js
└── tools
    └── add-script.js
         └─> **createScript**
             - error (from src/utils/logger.js)
             - isValidScriptId (from tools/add-script.js)
             - log (from src/utils/logger.js)
             - prompt (from tools/add-script.js)
         └─> **isValidScriptId**
         └─> **processFiles**
             - error (from src/utils/logger.js)
             - log (from src/utils/logger.js)
         └─> **prompt**

```
