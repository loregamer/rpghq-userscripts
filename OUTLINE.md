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
│   │   │   │   │        - log
│   │   │   │   └── renderUsersSubtab.js
│   │   │   │        └─> **renderUsersSubtab**
│   │   │   │            - log
│   │   │   ├── renderForumPreferencesTab.js
│   │   │   │    └─> **renderForumPreferencesTab**
│   │   │   │        - log
│   │   │   │        - renderThreadsSubtab
│   │   │   │        - renderUsersSubtab
│   │   │   ├── renderInstalledScriptsTab.js
│   │   │   │    └─> **renderInstalledScriptsTab**
│   │   │   │        - log
│   │   │   │        - renderScriptsGridView
│   │   │   └── renderSettingsTab.js
│   │   │        └─> **renderSettingsTab**
│   │   │            - log
│   │   ├── emptyState.js
│   │   │    └─> **renderEmptyState**
│   │   │        - log
│   │   ├── hideModal.js
│   │   │    └─> **hideModal**
│   │   │        - log
│   │   ├── loadTabContent.js
│   │   │    └─> **loadTabContent**
│   │   │        - error
│   │   │        - log
│   │   │        - renderForumPreferencesTab
│   │   │        - renderInstalledScriptsTab
│   │   │        - renderSettingsTab
│   │   ├── renderPreferenceControl.js
│   │   │    └─> **renderPreferenceControl**
│   │   ├── renderScriptSettingsContent.js
│   │   │    └─> **renderScriptSettingsContent**
│   │   │        - getScriptSetting
│   │   │        - log
│   │   │        - renderSettingControl
│   │   ├── renderScriptsGridView.js
│   │   │    └─> **renderScriptsGridView**
│   │   │        - log
│   │   │        - renderEmptyState
│   │   │        - showScriptSettings
│   │   ├── renderScriptsListView.js
│   │   │    └─> **renderScriptsListView**
│   │   │        - log
│   │   │        - renderEmptyState
│   │   │        - showScriptSettings
│   │   ├── renderSettingControl.js
│   │   │    └─> **renderSettingControl**
│   │   │        - getScriptSetting
│   │   ├── showModal.js
│   │   │    └─> **showModal**
│   │   │        - hideModal
│   │   │        - loadTabContent
│   │   │        - log
│   │   ├── showScriptSettings.js
│   │   │    └─> **showScriptSettings**
│   │   │        - log
│   │   │        - renderEmptyState
│   │   │        - renderScriptSettingsContent
│   │   │        - saveScriptSetting
│   │   │        - warn
│   │   └── toggleScriptEnabled.js
│   │        └─> **toggleScriptEnabled**
│   │            - error
│   │            - gmSetValue
│   │            - loadScript
│   │            - log
│   │            - unloadScript
│   ├── scripts
│   │   ├── bbcode.js
│   │   │    └─> **addColorButtonListeners**
│   │   │        - addCustomColorsToExistingPalette
│   │   │    └─> **addCustomButtons**
│   │   │        - insertBloomeryPing
│   │   │        - insertModTemplate
│   │   │        - insertTable
│   │   │    └─> **addCustomColorsToExistingPalette**
│   │   │        - adjustTextareaAndHighlight
│   │   │        - updateHighlight
│   │   │        - wrapSelectedText
│   │   │    └─> **addCustomColorsToPalette**
│   │   │        - addColorButtonListeners
│   │   │        - addCustomColorsToExistingPalette
│   │   │    └─> **addCustomSmileyButtons**
│   │   │        - insertSmiley
│   │   │    └─> **addStyles**
│   │   │    └─> **adjustTextareaAndHighlight**
│   │   │        - positionEditorHeader
│   │   │        - positionSmileyBox
│   │   │    └─> **checkForUpdates**
│   │   │        - adjustTextareaAndHighlight
│   │   │        - updateHighlight
│   │   │    └─> **escapeHTML**
│   │   │    └─> **getColorIndex**
│   │   │    └─> **getContrastColor**
│   │   │    └─> **highlightBBCode**
│   │   │        - escapeHTML
│   │   │        - getColorIndex
│   │   │        - getContrastColor
│   │   │    └─> **init**
│   │   │        - addColorButtonListeners
│   │   │        - addCustomButtons
│   │   │        - addCustomColorsToExistingPalette
│   │   │        - addCustomColorsToPalette
│   │   │        - addCustomSmileyButtons
│   │   │        - addStyles
│   │   │        - adjustTextareaAndHighlight
│   │   │        - checkForUpdates
│   │   │        - escapeHTML
│   │   │        - getColorIndex
│   │   │        - getContrastColor
│   │   │        - highlightBBCode
│   │   │        - initialize
│   │   │        - insertBloomeryPing
│   │   │        - insertModTemplate
│   │   │        - insertSmiley
│   │   │        - insertTable
│   │   │        - insertTextAtCursor
│   │   │        - isSingleEmoji
│   │   │        - positionEditorHeader
│   │   │        - positionSmileyBox
│   │   │        - removeInterferingEventListeners
│   │   │        - saveCustomSmileys
│   │   │        - saveFormData
│   │   │        - setupFormSubmitTracking
│   │   │        - updateHighlight
│   │   │        - updatePageTitle
│   │   │        - updateSmileyList
│   │   │        - wrapSelectedText
│   │   │    └─> **initialize**
│   │   │        - addCustomButtons
│   │   │        - addCustomSmileyButtons
│   │   │        - adjustTextareaAndHighlight
│   │   │        - checkForUpdates
│   │   │        - positionEditorHeader
│   │   │        - positionSmileyBox
│   │   │        - removeInterferingEventListeners
│   │   │        - saveFormData
│   │   │        - updateHighlight
│   │   │        - updatePageTitle
│   │   │        - wrapSelectedText
│   │   │    └─> **insertBloomeryPing**
│   │   │        - insertTextAtCursor
│   │   │    └─> **insertModTemplate**
│   │   │        - insertTextAtCursor
│   │   │    └─> **insertSmiley**
│   │   │        - adjustTextareaAndHighlight
│   │   │        - updateHighlight
│   │   │    └─> **insertTable**
│   │   │        - insertTextAtCursor
│   │   │    └─> **insertTextAtCursor**
│   │   │        - adjustTextareaAndHighlight
│   │   │        - updateHighlight
│   │   │    └─> **isSingleEmoji**
│   │   │    └─> **positionEditorHeader**
│   │   │    └─> **positionSmileyBox**
│   │   │    └─> **removeInterferingEventListeners**
│   │   │    └─> **saveCustomSmileys**
│   │   │        - addCustomSmileyButtons
│   │   │    └─> **saveFormData**
│   │   │    └─> **setupFormSubmitTracking**
│   │   │    └─> **showCustomSmileysPopup**
│   │   │        - isSingleEmoji
│   │   │        - saveCustomSmileys
│   │   │        - updateSmileyList
│   │   │    └─> **updateHighlight**
│   │   │        - highlightBBCode
│   │   │    └─> **updatePageTitle**
│   │   │    └─> **updateSmileyList**
│   │   │        - isSingleEmoji
│   │   │        - saveCustomSmileys
│   │   │        - updateSmileyList
│   │   │    └─> **wrapSelectedText**
│   │   ├── commaFormatter.js
│   │   │    └─> **calculateForumStatistics**
│   │   │        - formatNumberWithCommas
│   │   │        - formatStatNumber
│   │   │    └─> **formatNumberWithCommas**
│   │   │    └─> **formatStatNumber**
│   │   │        - formatNumberWithCommas
│   │   │    └─> **init**
│   │   │        - calculateForumStatistics
│   │   │        - formatNumberWithCommas
│   │   │        - formatStatNumber
│   │   │        - log
│   │   │        - processElements
│   │   │    └─> **processElements**
│   │   │        - formatNumberWithCommas
│   │   ├── kalareact.js
│   │   │    └─> **init**
│   │   │        - log
│   │   ├── memberSearch.js
│   │   │    └─> **addMemberSearchButton**
│   │   │        - createMemberSearchModal
│   │   │    └─> **createMemberSearchModal**
│   │   │        - setupSearchFunctionality
│   │   │    └─> **displaySearchResults**
│   │   │    └─> **init**
│   │   │        - addMemberSearchButton
│   │   │        - createMemberSearchModal
│   │   │        - displaySearchResults
│   │   │        - error
│   │   │        - searchMembers
│   │   │        - setupSearchFunctionality
│   │   │    └─> **searchMembers**
│   │   │        - displaySearchResults
│   │   │        - error
│   │   │    └─> **setupSearchFunctionality**
│   │   │        - searchMembers
│   │   ├── notifications.js
│   │   │    └─> **debouncedCustomize**
│   │   │    └─> **init**
│   │   │        - debouncedCustomize
│   │   │        - error
│   │   │        - fetchReactions
│   │   │        - init
│   │   │        - log
│   │   ├── pinThreads.js
│   │   │    └─> **addForumPinButton**
│   │   │        - addResponsiveStyle
│   │   │        - createDropdownContainer
│   │   │        - createForumPinButton
│   │   │    └─> **addPinButton**
│   │   │        - addThreadPinButton
│   │   │    └─> **addResponsiveStyle**
│   │   │    └─> **addThreadPinButton**
│   │   │        - addResponsiveStyle
│   │   │        - createDropdownContainer
│   │   │        - createThreadPinButton
│   │   │    └─> **createCustomThreadRowHTML**
│   │   │    └─> **createDropdownContainer**
│   │   │    └─> **createErrorListItemHTML**
│   │   │    └─> **createForumListItemHTML**
│   │   │    └─> **createForumPinButton**
│   │   │        - togglePinForum
│   │   │        - updatePinButtonState
│   │   │    └─> **createLoadingListItem**
│   │   │    └─> **createPinButton**
│   │   │        - createThreadPinButton
│   │   │    └─> **createPinnedForumsSectionElement**
│   │   │    └─> **createPinnedSectionsContainer**
│   │   │    └─> **createPinnedThreadsSection**
│   │   │        - createPinnedForumsSectionElement
│   │   │        - createPinnedThreadsSectionElement
│   │   │        - findSearchPageInsertionPoint
│   │   │        - populatePinnedForumsSection
│   │   │        - populatePinnedThreadsSection
│   │   │    └─> **createPinnedThreadsSectionElement**
│   │   │    └─> **createThreadPinButton**
│   │   │        - togglePinThread
│   │   │        - updatePinButtonState
│   │   │    └─> **createZomboidStatusHTML**
│   │   │    └─> **fetchAllThreadsData**
│   │   │        - fetchThreadData
│   │   │    └─> **fetchThreadData**
│   │   │        - createCustomThreadRowHTML
│   │   │        - fetchThreadRowFromForum
│   │   │        - fetchThreadTitleAndForum
│   │   │        - modifyRowHTML
│   │   │    └─> **fetchThreadRowFromForum**
│   │   │        - fetchThreadRowFromForum
│   │   │    └─> **fetchThreadTitleAndForum**
│   │   │        - fetchZomboidStatus
│   │   │    └─> **fetchZomboidStatus**
│   │   │    └─> **findExistingForumRow**
│   │   │    └─> **findExistingThreadRows**
│   │   │    └─> **findSearchPageInsertionPoint**
│   │   │    └─> **getForumInfo**
│   │   │    └─> **getThreadInfo**
│   │   │    └─> **init**
│   │   │        - addForumPinButton
│   │   │        - addResponsiveStyle
│   │   │        - addThreadPinButton
│   │   │        - createCustomThreadRowHTML
│   │   │        - createDropdownContainer
│   │   │        - createErrorListItemHTML
│   │   │        - createForumListItemHTML
│   │   │        - createForumPinButton
│   │   │        - createLoadingListItem
│   │   │        - createPinnedForumsSectionElement
│   │   │        - createPinnedThreadsSection
│   │   │        - createPinnedThreadsSectionElement
│   │   │        - createThreadPinButton
│   │   │        - fetchThreadData
│   │   │        - fetchThreadRowFromForum
│   │   │        - fetchThreadTitleAndForum
│   │   │        - fetchZomboidStatus
│   │   │        - findExistingForumRow
│   │   │        - findExistingThreadRows
│   │   │        - findSearchPageInsertionPoint
│   │   │        - getForumInfo
│   │   │        - getThreadInfo
│   │   │        - modifyRowHTML
│   │   │        - populatePinnedForumsSection
│   │   │        - populatePinnedThreadsSection
│   │   │        - togglePinForum
│   │   │        - togglePinThread
│   │   │        - updateMenuCommand
│   │   │        - updatePinButtonState
│   │   │    └─> **modifyRowHTML**
│   │   │    └─> **populatePinnedForumsSection**
│   │   │        - createForumListItemHTML
│   │   │        - findExistingForumRow
│   │   │    └─> **populatePinnedThreadsSection**
│   │   │        - createErrorListItemHTML
│   │   │        - createLoadingListItem
│   │   │        - fetchThreadData
│   │   │        - findExistingThreadRows
│   │   │    └─> **toggleNewPostsDisplay**
│   │   │        - updateMenuCommand
│   │   │    └─> **togglePinForum**
│   │   │        - getForumInfo
│   │   │        - updatePinButtonState
│   │   │    └─> **togglePinThread**
│   │   │        - getThreadInfo
│   │   │        - updatePinButtonState
│   │   │    └─> **updateMenuCommand**
│   │   │    └─> **updatePinButtonState**
│   │   ├── randomTopic.js
│   │   │    └─> **addRandomTopicButton**
│   │   │        - error
│   │   │        - getValidRandomTopic
│   │   │    └─> **checkTopicExists**
│   │   │    └─> **getRandomTopicId**
│   │   │    └─> **getValidRandomTopic**
│   │   │        - checkTopicExists
│   │   │        - getRandomTopicId
│   │   │    └─> **handleRandomTopicClick**
│   │   │        - error
│   │   │        - getValidRandomTopic
│   │   │    └─> **init**
│   │   │        - addRandomTopicButton
│   │   │        - checkTopicExists
│   │   │        - error
│   │   │        - getRandomTopicId
│   │   │        - getValidRandomTopic
│   │   ├── recentTopicsFormat.js
│   │   │    └─> **init**
│   │   │        - getScriptSetting
│   │   │        - log
│   │   │        - processTitle
│   │   │        - processTitlesInContainer
│   │   │        - styleAdventurersGuildTitle
│   │   │        - styleEverythingAfterFirstDash
│   │   │        - styleParentheses
│   │   │        - styleVersionNumbers
│   │   │    └─> **processTitle**
│   │   │        - getScriptSetting
│   │   │        - styleAdventurersGuildTitle
│   │   │        - styleEverythingAfterFirstDash
│   │   │        - styleParentheses
│   │   │        - styleVersionNumbers
│   │   │    └─> **processTitlesInContainer**
│   │   │    └─> **styleAdventurersGuildTitle**
│   │   │    └─> **styleEverythingAfterFirstDash**
│   │   │    └─> **styleParentheses**
│   │   │    └─> **styleVersionNumbers**
│   │   └── separateReactions.js
│   │        └─> **addToggleLeftModeOption**
│   │            - toggleLeftMode
│   │        └─> **applyLeftMode**
│   │        └─> **createReactionList**
│   │            - getPollVotes
│   │            - log
│   │        └─> **fetchReactions**
│   │            - error
│   │            - parseReactions
│   │        └─> **getPollVotes**
│   │            - log
│   │        └─> **hidePopup**
│   │        └─> **init**
│   │            - addToggleLeftModeOption
│   │            - applyLeftMode
│   │            - createReactionList
│   │            - error
│   │            - fetchReactions
│   │            - getPollVotes
│   │            - hidePopup
│   │            - log
│   │            - observePosts
│   │            - parseReactions
│   │            - processPost
│   │            - showPopup
│   │            - toggleLeftMode
│   │            - updateReactions
│   │        └─> **observePosts**
│   │            - addToggleLeftModeOption
│   │            - applyLeftMode
│   │            - processPost
│   │        └─> **parseReactions**
│   │        └─> **processPost**
│   │            - updateReactions
│   │        └─> **showPopup**
│   │        └─> **toggleLeftMode**
│   │        └─> **updateReactions**
│   │            - createReactionList
│   │            - error
│   │            - fetchReactions
│   │            - hidePopup
│   │            - showPopup
│   ├── utils
│   │   ├── compareVersions.js
│   │   │    └─> **compareVersions**
│   │   ├── filterScripts.js
│   │   │    └─> **filterScripts**
│   │   │        - compareVersions
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
│   │            - matchesUrl
│   ├── forumPreferences.js
│   ├── injectStyles.js
│   ├── main.js
│   │    └─> **addMenuButton**
│   │        - ensureFontAwesome
│   │        - log
│   │        - warn
│   │    └─> **ensureFontAwesome**
│   │        - log
│   │    └─> **executeLoadOrderForPhase**
│   │        - error
│   │        - findScriptById
│   │        - loadScript
│   │        - log
│   │        - warn
│   │    └─> **findScriptById**
│   │    └─> **getScriptSetting**
│   │        - gmGetValue
│   │    └─> **gmGetValue**
│   │    └─> **gmSetValue**
│   │    └─> **handleLoadTabContent**
│   │        - loadTabContent
│   │    └─> **handleRenderScriptsGridView**
│   │        - renderScriptsGridView
│   │    └─> **handleRenderScriptsListView**
│   │        - renderScriptsListView
│   │    └─> **handleShowScriptSettings**
│   │        - showScriptSettings
│   │    └─> **init**
│   │        - addMenuButton
│   │        - executeLoadOrderForPhase
│   │        - initializeScriptStates
│   │        - log
│   │        - toggleModalVisibility
│   │    └─> **initializeScriptStates**
│   │        - gmGetValue
│   │        - log
│   │    └─> **loadScript**
│   │        - error
│   │        - init
│   │        - log
│   │        - shouldLoadScript
│   │        - warn
│   │    └─> **saveScriptSetting**
│   │        - gmSetValue
│   │        - log
│   │    └─> **toggleModalVisibility**
│   │        - hideModal
│   │        - log
│   │        - showModal
│   │    └─> **unloadScript**
│   │        - error
│   │        - log
│   ├── manifest.js
│   └── meta.js
└── tools
    └── add-script.js
         └─> **createScript**
             - error
             - isValidScriptId
             - log
             - prompt
         └─> **isValidScriptId**
         └─> **processFiles**
             - error
             - log
         └─> **prompt**

```
