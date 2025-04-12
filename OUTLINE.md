# Project Outline

```
HQ-Userscripts
├── build
│   └── lsf_lsx_converter
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
│   │        - indexOf
│   │        - substring
│   │    └─> **extractName**
│   │        - match
│   │        - toLowerCase
│   │    └─> **extractScriptObjects**
│   │        - push
│   │        - replace
│   │        - substring
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
│   │   │   │        - add
│   │   │   │        - addEventListener
│   │   │   │        - appendChild
│   │   │   │        - createElement
│   │   │   │        - forEach
│   │   │   │        - log
│   │   │   │        - querySelectorAll
│   │   │   │        - remove
│   │   │   │        - renderThreadsSubtab
│   │   │   │        - renderUsersSubtab
│   │   │   ├── renderInstalledScriptsTab.js
│   │   │   │    └─> **renderInstalledScriptsTab**
│   │   │   │        - appendChild
│   │   │   │        - createElement
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
│   │   │        - getElementById
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
│   │   │        - join
│   │   │        - map
│   │   ├── renderScriptSettingsContent.js
│   │   │    └─> **renderScriptSettingsContent**
│   │   │        - getScriptSetting
│   │   │        - join
│   │   │        - log
│   │   │        - map
│   │   │        - renderSettingControl
│   │   ├── renderScriptsGridView.js
│   │   │    └─> **renderScriptsGridView**
│   │   │        - add
│   │   │        - addEventListener
│   │   │        - appendChild
│   │   │        - closest
│   │   │        - contains
│   │   │        - createElement
│   │   │        - dispatchEvent
│   │   │        - find
│   │   │        - forEach
│   │   │        - log
│   │   │        - querySelectorAll
│   │   │        - remove
│   │   │        - renderEmptyState
│   │   │        - showScriptSettings
│   │   ├── renderScriptsListView.js
│   │   │    └─> **renderScriptsListView**
│   │   │        - addEventListener
│   │   │        - appendChild
│   │   │        - createElement
│   │   │        - find
│   │   │        - forEach
│   │   │        - join
│   │   │        - log
│   │   │        - map
│   │   │        - querySelectorAll
│   │   │        - renderEmptyState
│   │   │        - showScriptSettings
│   │   ├── renderSettingControl.js
│   │   │    └─> **renderSettingControl**
│   │   │        - getScriptSetting
│   │   │        - join
│   │   │        - map
│   │   ├── showModal.js
│   │   │    └─> **showModal**
│   │   │        - add
│   │   │        - addEventListener
│   │   │        - appendChild
│   │   │        - createElement
│   │   │        - forEach
│   │   │        - getElementById
│   │   │        - hideModal
│   │   │        - loadTabContent
│   │   │        - log
│   │   │        - querySelector
│   │   │        - querySelectorAll
│   │   │        - remove
│   │   ├── showScriptSettings.js
│   │   │    └─> **showScriptSettings**
│   │   │        - addEventListener
│   │   │        - appendChild
│   │   │        - cloneNode
│   │   │        - createElement
│   │   │        - forEach
│   │   │        - getElementById
│   │   │        - join
│   │   │        - log
│   │   │        - querySelector
│   │   │        - querySelectorAll
│   │   │        - renderEmptyState
│   │   │        - renderScriptSettingsContent
│   │   │        - replaceChild
│   │   │        - saveScriptSetting
│   │   │        - setTimeout
│   │   │        - warn
│   │   └── toggleScriptEnabled.js
│   │        └─> **toggleScriptEnabled**
│   │            - error
│   │            - find
│   │            - gmSetValue
│   │            - loadScript
│   │            - log
│   │            - unloadScript
│   ├── scripts
│   │   ├── bbcode.js
│   │   │    └─> **addColorButtonListeners**
│   │   │        - addCustomColorsToExistingPalette
│   │   │        - addEventListener
│   │   │        - forEach
│   │   │        - querySelector
│   │   │        - querySelectorAll
│   │   │        - setTimeout
│   │   │    └─> **addCustomButtons**
│   │   │        - addEventListener
│   │   │        - getElementById
│   │   │        - insertBloomeryPing
│   │   │        - insertModTemplate
│   │   │        - insertTable
│   │   │        - preventDefault
│   │   │        - querySelector
│   │   │        - trim
│   │   │    └─> **addCustomColorsToExistingPalette**
│   │   │        - adjustTextareaAndHighlight
│   │   │        - appendChild
│   │   │        - click
│   │   │        - createElement
│   │   │        - every
│   │   │        - forEach
│   │   │        - from
│   │   │        - getAttribute
│   │   │        - getElementById
│   │   │        - includes
│   │   │        - map
│   │   │        - preventDefault
│   │   │        - querySelector
│   │   │        - querySelectorAll
│   │   │        - setAttribute
│   │   │        - stopPropagation
│   │   │        - substring
│   │   │        - toUpperCase
│   │   │        - updateHighlight
│   │   │        - wrapSelectedText
│   │   │    └─> **addCustomColorsToPalette**
│   │   │        - addColorButtonListeners
│   │   │        - addCustomColorsToExistingPalette
│   │   │        - addEventListener
│   │   │        - clearInterval
│   │   │        - contains
│   │   │        - forEach
│   │   │        - observe
│   │   │        - querySelector
│   │   │        - querySelectorAll
│   │   │        - setInterval
│   │   │        - setTimeout
│   │   │    └─> **addCustomSmileyButtons**
│   │   │        - addEventListener
│   │   │        - appendChild
│   │   │        - createElement
│   │   │        - forEach
│   │   │        - from
│   │   │        - getElementById
│   │   │        - insertBefore
│   │   │        - insertSmiley
│   │   │        - join
│   │   │        - preventDefault
│   │   │        - push
│   │   │        - querySelector
│   │   │        - querySelectorAll
│   │   │        - remove
│   │   │        - slice
│   │   │        - split
│   │   │        - startsWith
│   │   │        - values
│   │   │    └─> **addStyles**
│   │   │        - appendChild
│   │   │        - createElement
│   │   │    └─> **adjustTextareaAndHighlight**
│   │   │        - assign
│   │   │        - getComputedStyle
│   │   │        - getElementById
│   │   │        - positionEditorHeader
│   │   │        - positionSmileyBox
│   │   │    └─> **checkForUpdates**
│   │   │        - adjustTextareaAndHighlight
│   │   │        - setTimeout
│   │   │        - updateHighlight
│   │   │    └─> **escapeHTML**
│   │   │    └─> **getColorIndex**
│   │   │        - keys
│   │   │    └─> **getContrastColor**
│   │   │        - parseInt
│   │   │        - slice
│   │   │    └─> **highlightBBCode**
│   │   │        - escapeHTML
│   │   │        - getColorIndex
│   │   │        - getContrastColor
│   │   │        - match
│   │   │        - replace
│   │   │        - slice
│   │   │        - startsWith
│   │   │        - toLowerCase
│   │   │        - trim
│   │   │    └─> **init**
│   │   │        - $
│   │   │        - GM_getValue
│   │   │        - GM_setValue
│   │   │        - add
│   │   │        - addColorButtonListeners
│   │   │        - addCustomButtons
│   │   │        - addCustomColorsToExistingPalette
│   │   │        - addCustomColorsToPalette
│   │   │        - addCustomSmileyButtons
│   │   │        - addEventListener
│   │   │        - addStyles
│   │   │        - adjustTextareaAndHighlight
│   │   │        - append
│   │   │        - appendChild
│   │   │        - assign
│   │   │        - checkForUpdates
│   │   │        - clearInterval
│   │   │        - clearTimeout
│   │   │        - click
│   │   │        - contains
│   │   │        - createElement
│   │   │        - escapeHTML
│   │   │        - every
│   │   │        - focus
│   │   │        - forEach
│   │   │        - from
│   │   │        - get
│   │   │        - getAttribute
│   │   │        - getBoundingClientRect
│   │   │        - getColorIndex
│   │   │        - getComputedStyle
│   │   │        - getContrastColor
│   │   │        - getElementById
│   │   │        - highlightBBCode
│   │   │        - includes
│   │   │        - initialize
│   │   │        - insertBefore
│   │   │        - insertBloomeryPing
│   │   │        - insertModTemplate
│   │   │        - insertSmiley
│   │   │        - insertTable
│   │   │        - insertTextAtCursor
│   │   │        - isArray
│   │   │        - isSingleEmoji
│   │   │        - join
│   │   │        - keys
│   │   │        - map
│   │   │        - match
│   │   │        - min
│   │   │        - observe
│   │   │        - off
│   │   │        - open
│   │   │        - parse
│   │   │        - parseInt
│   │   │        - positionEditorHeader
│   │   │        - positionSmileyBox
│   │   │        - preventDefault
│   │   │        - push
│   │   │        - querySelector
│   │   │        - querySelectorAll
│   │   │        - remove
│   │   │        - removeInterferingEventListeners
│   │   │        - replace
│   │   │        - replaceChild
│   │   │        - saveCustomSmileys
│   │   │        - saveFormData
│   │   │        - setAttribute
│   │   │        - setInterval
│   │   │        - setSelectionRange
│   │   │        - setTimeout
│   │   │        - setupFormSubmitTracking
│   │   │        - slice
│   │   │        - splice
│   │   │        - split
│   │   │        - startsWith
│   │   │        - stopPropagation
│   │   │        - stringify
│   │   │        - substring
│   │   │        - test
│   │   │        - toLowerCase
│   │   │        - toUpperCase
│   │   │        - trim
│   │   │        - updateHighlight
│   │   │        - updatePageTitle
│   │   │        - updateSmileyList
│   │   │        - values
│   │   │        - wrapSelectedText
│   │   │    └─> **initialize**
│   │   │        - GM_getValue
│   │   │        - GM_setValue
│   │   │        - addCustomButtons
│   │   │        - addCustomSmileyButtons
│   │   │        - addEventListener
│   │   │        - adjustTextareaAndHighlight
│   │   │        - append
│   │   │        - appendChild
│   │   │        - assign
│   │   │        - checkForUpdates
│   │   │        - clearTimeout
│   │   │        - createElement
│   │   │        - forEach
│   │   │        - from
│   │   │        - getElementById
│   │   │        - includes
│   │   │        - insertBefore
│   │   │        - isArray
│   │   │        - join
│   │   │        - open
│   │   │        - parse
│   │   │        - positionEditorHeader
│   │   │        - positionSmileyBox
│   │   │        - preventDefault
│   │   │        - push
│   │   │        - querySelector
│   │   │        - querySelectorAll
│   │   │        - remove
│   │   │        - removeInterferingEventListeners
│   │   │        - replaceChild
│   │   │        - saveFormData
│   │   │        - setTimeout
│   │   │        - stopPropagation
│   │   │        - stringify
│   │   │        - substring
│   │   │        - trim
│   │   │        - updateHighlight
│   │   │        - updatePageTitle
│   │   │        - wrapSelectedText
│   │   │    └─> **insertBloomeryPing**
│   │   │        - insertTextAtCursor
│   │   │    └─> **insertModTemplate**
│   │   │        - insertTextAtCursor
│   │   │    └─> **insertSmiley**
│   │   │        - adjustTextareaAndHighlight
│   │   │        - focus
│   │   │        - getElementById
│   │   │        - setSelectionRange
│   │   │        - startsWith
│   │   │        - substring
│   │   │        - updateHighlight
│   │   │    └─> **insertTable**
│   │   │        - insertTextAtCursor
│   │   │    └─> **insertTextAtCursor**
│   │   │        - adjustTextareaAndHighlight
│   │   │        - focus
│   │   │        - getElementById
│   │   │        - setSelectionRange
│   │   │        - substring
│   │   │        - updateHighlight
│   │   │    └─> **isSingleEmoji**
│   │   │        - test
│   │   │    └─> **positionEditorHeader**
│   │   │        - add
│   │   │        - assign
│   │   │        - contains
│   │   │        - createElement
│   │   │        - forEach
│   │   │        - getBoundingClientRect
│   │   │        - getElementById
│   │   │        - insertBefore
│   │   │        - querySelectorAll
│   │   │        - remove
│   │   │    └─> **positionSmileyBox**
│   │   │        - assign
│   │   │        - getBoundingClientRect
│   │   │        - getElementById
│   │   │        - min
│   │   │    └─> **removeInterferingEventListeners**
│   │   │        - $
│   │   │        - getElementById
│   │   │        - off
│   │   │        - remove
│   │   │    └─> **saveCustomSmileys**
│   │   │        - GM_setValue
│   │   │        - addCustomSmileyButtons
│   │   │        - stringify
│   │   │    └─> **saveFormData**
│   │   │        - GM_setValue
│   │   │        - appendChild
│   │   │        - assign
│   │   │        - createElement
│   │   │        - forEach
│   │   │        - getElementById
│   │   │        - push
│   │   │        - querySelectorAll
│   │   │        - remove
│   │   │        - setTimeout
│   │   │        - stringify
│   │   │    └─> **setupFormSubmitTracking**
│   │   │        - addEventListener
│   │   │        - getElementById
│   │   │    └─> **showCustomSmileysPopup**
│   │   │        - addEventListener
│   │   │        - append
│   │   │        - appendChild
│   │   │        - assign
│   │   │        - createElement
│   │   │        - forEach
│   │   │        - isSingleEmoji
│   │   │        - preventDefault
│   │   │        - push
│   │   │        - remove
│   │   │        - saveCustomSmileys
│   │   │        - splice
│   │   │        - trim
│   │   │        - updateSmileyList
│   │   │    └─> **updateHighlight**
│   │   │        - getElementById
│   │   │        - highlightBBCode
│   │   │    └─> **updatePageTitle**
│   │   │        - get
│   │   │        - querySelector
│   │   │        - trim
│   │   │    └─> **updateSmileyList**
│   │   │        - append
│   │   │        - appendChild
│   │   │        - assign
│   │   │        - createElement
│   │   │        - forEach
│   │   │        - isSingleEmoji
│   │   │        - saveCustomSmileys
│   │   │        - splice
│   │   │        - updateSmileyList
│   │   │    └─> **wrapSelectedText**
│   │   │        - includes
│   │   │        - setSelectionRange
│   │   │        - split
│   │   │        - substring
│   │   ├── commaFormatter.js
│   │   │    └─> **calculateForumStatistics**
│   │   │        - endsWith
│   │   │        - forEach
│   │   │        - formatNumberWithCommas
│   │   │        - formatStatNumber
│   │   │        - isNaN
│   │   │        - match
│   │   │        - parseInt
│   │   │        - querySelector
│   │   │        - querySelectorAll
│   │   │        - replace
│   │   │        - toString
│   │   │        - trim
│   │   │    └─> **formatNumberWithCommas**
│   │   │        - replace
│   │   │        - toString
│   │   │    └─> **formatStatNumber**
│   │   │        - formatNumberWithCommas
│   │   │        - toString
│   │   │    └─> **init**
│   │   │        - GM_getValue
│   │   │        - calculateForumStatistics
│   │   │        - contains
│   │   │        - disconnect
│   │   │        - endsWith
│   │   │        - forEach
│   │   │        - formatNumberWithCommas
│   │   │        - formatStatNumber
│   │   │        - isNaN
│   │   │        - log
│   │   │        - match
│   │   │        - observe
│   │   │        - parseInt
│   │   │        - processElements
│   │   │        - querySelector
│   │   │        - querySelectorAll
│   │   │        - replace
│   │   │        - test
│   │   │        - toString
│   │   │        - trim
│   │   │    └─> **processElements**
│   │   │        - contains
│   │   │        - forEach
│   │   │        - formatNumberWithCommas
│   │   │        - querySelector
│   │   │        - querySelectorAll
│   │   │        - replace
│   │   │        - test
│   │   │        - trim
│   │   ├── kalareact.js
│   │   │    └─> **init**
│   │   │        - click
│   │   │        - forEach
│   │   │        - log
│   │   │        - querySelector
│   │   │        - querySelectorAll
│   │   │        - remove
│   │   │        - startsWith
│   │   │        - trim
│   │   ├── memberSearch.js
│   │   │    └─> **addMemberSearchButton**
│   │   │        - add
│   │   │        - addEventListener
│   │   │        - appendChild
│   │   │        - createElement
│   │   │        - createMemberSearchModal
│   │   │        - find
│   │   │        - focus
│   │   │        - from
│   │   │        - getElementById
│   │   │        - includes
│   │   │        - insertBefore
│   │   │        - preventDefault
│   │   │        - querySelector
│   │   │        - setAttribute
│   │   │        - setTimeout
│   │   │        - trim
│   │   │    └─> **createMemberSearchModal**
│   │   │        - addEventListener
│   │   │        - appendChild
│   │   │        - createElement
│   │   │        - querySelector
│   │   │        - remove
│   │   │        - setupSearchFunctionality
│   │   │    └─> **displaySearchResults**
│   │   │        - addEventListener
│   │   │        - appendChild
│   │   │        - createDocumentFragment
│   │   │        - createElement
│   │   │        - filter
│   │   │        - forEach
│   │   │        - getAttribute
│   │   │        - setAttribute
│   │   │    └─> **init**
│   │   │        - GM_addStyle
│   │   │        - add
│   │   │        - addEventListener
│   │   │        - addMemberSearchButton
│   │   │        - appendChild
│   │   │        - catch
│   │   │        - clearTimeout
│   │   │        - contains
│   │   │        - createDocumentFragment
│   │   │        - createElement
│   │   │        - createMemberSearchModal
│   │   │        - displaySearchResults
│   │   │        - encodeURIComponent
│   │   │        - error
│   │   │        - fetch
│   │   │        - filter
│   │   │        - find
│   │   │        - focus
│   │   │        - forEach
│   │   │        - from
│   │   │        - getAttribute
│   │   │        - getElementById
│   │   │        - includes
│   │   │        - insertBefore
│   │   │        - json
│   │   │        - observe
│   │   │        - preventDefault
│   │   │        - querySelector
│   │   │        - remove
│   │   │        - searchMembers
│   │   │        - setAttribute
│   │   │        - setTimeout
│   │   │        - setupSearchFunctionality
│   │   │        - then
│   │   │        - trim
│   │   │    └─> **searchMembers**
│   │   │        - catch
│   │   │        - displaySearchResults
│   │   │        - encodeURIComponent
│   │   │        - error
│   │   │        - fetch
│   │   │        - json
│   │   │        - then
│   │   │    └─> **setupSearchFunctionality**
│   │   │        - addEventListener
│   │   │        - clearTimeout
│   │   │        - contains
│   │   │        - focus
│   │   │        - forEach
│   │   │        - observe
│   │   │        - querySelector
│   │   │        - searchMembers
│   │   │        - setTimeout
│   │   │        - trim
│   │   ├── notifications.js
│   │   │    └─> **debouncedCustomize**
│   │   │        - clearTimeout
│   │   │        - customizeNotificationPanel
│   │   │        - setTimeout
│   │   │    └─> **init**
│   │   │        - GM_deleteValue
│   │   │        - GM_getValue
│   │   │        - GM_listValues
│   │   │        - GM_setValue
│   │   │        - GM_xmlhttpRequest
│   │   │        - addEventListener
│   │   │        - aggressiveRemoveInnerQuotes
│   │   │        - appendChild
│   │   │        - assign
│   │   │        - bind
│   │   │        - checkAndMarkNotifications
│   │   │        - cleanupPostContent
│   │   │        - cleanupStorage
│   │   │        - clearTimeout
│   │   │        - createElement
│   │   │        - customizeMentionNotification
│   │   │        - customizeNotificationPage
│   │   │        - customizeNotificationPanel
│   │   │        - customizePrivateMessageNotification
│   │   │        - customizeReactionNotification
│   │   │        - debouncedCustomize
│   │   │        - endsWith
│   │   │        - error
│   │   │        - extractPostId
│   │   │        - extractVideoUrl
│   │   │        - fetch
│   │   │        - fetchPostContent
│   │   │        - fetchReactions
│   │   │        - filter
│   │   │        - forEach
│   │   │        - formatReactions
│   │   │        - from
│   │   │        - getAttribute
│   │   │        - getDisplayedPostIds
│   │   │        - getNotificationData
│   │   │        - getStoredPostContent
│   │   │        - getStoredReactions
│   │   │        - includes
│   │   │        - indexOf
│   │   │        - init
│   │   │        - insertAdjacentElement
│   │   │        - insertBefore
│   │   │        - join
│   │   │        - json
│   │   │        - lastIndexOf
│   │   │        - log
│   │   │        - map
│   │   │        - markNotificationAsRead
│   │   │        - match
│   │   │        - now
│   │   │        - observe
│   │   │        - parse
│   │   │        - parseFromString
│   │   │        - querySelector
│   │   │        - querySelectorAll
│   │   │        - queuePostContentFetch
│   │   │        - remove
│   │   │        - removeBBCode
│   │   │        - removeURLs
│   │   │        - replace
│   │   │        - setTimeout
│   │   │        - sleep
│   │   │        - slice
│   │   │        - some
│   │   │        - split
│   │   │        - startsWith
│   │   │        - storePostContent
│   │   │        - storeReactions
│   │   │        - stringify
│   │   │        - styleReference
│   │   │        - substring
│   │   │        - text
│   │   │        - trim
│   │   ├── pinThreads.js
│   │   │    └─> **addForumPinButton**
│   │   │        - addResponsiveStyle
│   │   │        - appendChild
│   │   │        - createDropdownContainer
│   │   │        - createForumPinButton
│   │   │        - getElementById
│   │   │        - getForumId
│   │   │        - getForumName
│   │   │        - insertBefore
│   │   │        - querySelector
│   │   │    └─> **addPinButton**
│   │   │        - addThreadPinButton
│   │   │    └─> **addResponsiveStyle**
│   │   │        - addStyle
│   │   │    └─> **addThreadPinButton**
│   │   │        - addResponsiveStyle
│   │   │        - appendChild
│   │   │        - createDropdownContainer
│   │   │        - createThreadPinButton
│   │   │        - getElementById
│   │   │        - getThreadId
│   │   │        - insertBefore
│   │   │        - querySelector
│   │   │    └─> **createCustomThreadRowHTML**
│   │   │    └─> **createDropdownContainer**
│   │   │        - createElement
│   │   │    └─> **createErrorListItemHTML**
│   │   │    └─> **createForumListItemHTML**
│   │   │    └─> **createForumPinButton**
│   │   │        - addEventListener
│   │   │        - createElement
│   │   │        - getPinnedForums
│   │   │        - hasOwnProperty
│   │   │        - preventDefault
│   │   │        - togglePinForum
│   │   │        - updatePinButtonState
│   │   │    └─> **createLoadingListItem**
│   │   │    └─> **createPinButton**
│   │   │        - createThreadPinButton
│   │   │    └─> **createPinnedForumsSectionElement**
│   │   │        - createElement
│   │   │    └─> **createPinnedSectionsContainer**
│   │   │        - createElement
│   │   │    └─> **createPinnedThreadsSection**
│   │   │        - contains
│   │   │        - createPinnedForumsSectionElement
│   │   │        - createPinnedThreadsSectionElement
│   │   │        - findSearchPageInsertionPoint
│   │   │        - getElementById
│   │   │        - getPinnedForums
│   │   │        - getPinnedThreads
│   │   │        - includes
│   │   │        - insertAdjacentElement
│   │   │        - insertBefore
│   │   │        - keys
│   │   │        - populatePinnedForumsSection
│   │   │        - populatePinnedThreadsSection
│   │   │        - querySelector
│   │   │    └─> **createPinnedThreadsSectionElement**
│   │   │        - createElement
│   │   │    └─> **createThreadPinButton**
│   │   │        - addEventListener
│   │   │        - createElement
│   │   │        - getPinnedThreads
│   │   │        - hasOwnProperty
│   │   │        - preventDefault
│   │   │        - togglePinThread
│   │   │        - updatePinButtonState
│   │   │    └─> **createZomboidStatusHTML**
│   │   │        - join
│   │   │    └─> **fetchAllThreadsData**
│   │   │        - all
│   │   │        - entries
│   │   │        - fetchThreadData
│   │   │        - map
│   │   │    └─> **fetchThreadData**
│   │   │        - createCustomThreadRowHTML
│   │   │        - fetchThreadRowFromForum
│   │   │        - fetchThreadTitleAndForum
│   │   │        - modifyRowHTML
│   │   │        - replace
│   │   │    └─> **fetchThreadRowFromForum**
│   │   │        - fetchHtml
│   │   │        - fetchThreadRowFromForum
│   │   │        - parseHtml
│   │   │        - querySelector
│   │   │        - querySelectorAll
│   │   │        - trim
│   │   │    └─> **fetchThreadTitleAndForum**
│   │   │        - fetchHtml
│   │   │        - fetchZomboidStatus
│   │   │        - parseHtml
│   │   │        - querySelector
│   │   │        - querySelectorAll
│   │   │        - trim
│   │   │    └─> **fetchZomboidStatus**
│   │   │        - closest
│   │   │        - from
│   │   │        - map
│   │   │        - querySelector
│   │   │        - querySelectorAll
│   │   │    └─> **findExistingForumRow**
│   │   │        - closest
│   │   │        - contains
│   │   │        - createElement
│   │   │        - includes
│   │   │        - querySelector
│   │   │        - querySelectorAll
│   │   │        - trim
│   │   │    └─> **findExistingThreadRows**
│   │   │        - includes
│   │   │        - querySelector
│   │   │        - querySelectorAll
│   │   │        - set
│   │   │    └─> **findSearchPageInsertionPoint**
│   │   │        - querySelector
│   │   │    └─> **getForumInfo**
│   │   │        - filter
│   │   │        - from
│   │   │        - getForumName
│   │   │        - join
│   │   │        - map
│   │   │        - querySelector
│   │   │        - querySelectorAll
│   │   │        - split
│   │   │        - trim
│   │   │    └─> **getThreadInfo**
│   │   │        - getAttribute
│   │   │        - querySelector
│   │   │        - trim
│   │   │    └─> **init**
│   │   │        - GM_addStyle
│   │   │        - GM_getValue
│   │   │        - GM_registerMenuCommand
│   │   │        - GM_setValue
│   │   │        - GM_unregisterMenuCommand
│   │   │        - GM_xmlhttpRequest
│   │   │        - add
│   │   │        - addEventListener
│   │   │        - addForumPinButton
│   │   │        - addResponsiveStyle
│   │   │        - addStyle
│   │   │        - addThreadPinButton
│   │   │        - all
│   │   │        - appendChild
│   │   │        - catch
│   │   │        - cloneNode
│   │   │        - closest
│   │   │        - contains
│   │   │        - createCustomThreadRowHTML
│   │   │        - createDropdownContainer
│   │   │        - createElement
│   │   │        - createErrorListItemHTML
│   │   │        - createForumListItemHTML
│   │   │        - createForumPinButton
│   │   │        - createLoadingListItem
│   │   │        - createPinnedForumsSectionElement
│   │   │        - createPinnedThreadsSection
│   │   │        - createPinnedThreadsSectionElement
│   │   │        - createTextNode
│   │   │        - createThreadPinButton
│   │   │        - createTreeWalker
│   │   │        - disconnect
│   │   │        - endsWith
│   │   │        - entries
│   │   │        - fetchHtml
│   │   │        - fetchThreadData
│   │   │        - fetchThreadRowFromForum
│   │   │        - fetchThreadTitleAndForum
│   │   │        - fetchZomboidStatus
│   │   │        - filter
│   │   │        - findExistingForumRow
│   │   │        - findExistingThreadRows
│   │   │        - findSearchPageInsertionPoint
│   │   │        - forEach
│   │   │        - from
│   │   │        - getAttribute
│   │   │        - getElementById
│   │   │        - getForumId
│   │   │        - getForumInfo
│   │   │        - getForumName
│   │   │        - getPinnedForums
│   │   │        - getPinnedThreads
│   │   │        - getShowOnNewPosts
│   │   │        - getThreadId
│   │   │        - getThreadInfo
│   │   │        - has
│   │   │        - hasOwnProperty
│   │   │        - includes
│   │   │        - insertAdjacentElement
│   │   │        - insertAdjacentHTML
│   │   │        - insertAdjacentText
│   │   │        - insertBefore
│   │   │        - join
│   │   │        - keys
│   │   │        - localeCompare
│   │   │        - map
│   │   │        - match
│   │   │        - modifyRowHTML
│   │   │        - nextNode
│   │   │        - observe
│   │   │        - parseFromString
│   │   │        - parseHtml
│   │   │        - populatePinnedForumsSection
│   │   │        - populatePinnedThreadsSection
│   │   │        - preventDefault
│   │   │        - push
│   │   │        - querySelector
│   │   │        - querySelectorAll
│   │   │        - reject
│   │   │        - reload
│   │   │        - remove
│   │   │        - replace
│   │   │        - replaceChild
│   │   │        - resolve
│   │   │        - scrollBy
│   │   │        - set
│   │   │        - setAttribute
│   │   │        - setPinnedForums
│   │   │        - setPinnedThreads
│   │   │        - setShowOnNewPosts
│   │   │        - sort
│   │   │        - split
│   │   │        - test
│   │   │        - togglePinForum
│   │   │        - togglePinThread
│   │   │        - trim
│   │   │        - updateMenuCommand
│   │   │        - updatePinButtonState
│   │   │    └─> **modifyRowHTML**
│   │   │        - add
│   │   │        - contains
│   │   │        - createElement
│   │   │        - createTextNode
│   │   │        - forEach
│   │   │        - getAttribute
│   │   │        - insertAdjacentElement
│   │   │        - insertAdjacentText
│   │   │        - parseFromString
│   │   │        - querySelector
│   │   │        - querySelectorAll
│   │   │        - remove
│   │   │        - replace
│   │   │        - setAttribute
│   │   │    └─> **populatePinnedForumsSection**
│   │   │        - add
│   │   │        - appendChild
│   │   │        - cloneNode
│   │   │        - contains
│   │   │        - createForumListItemHTML
│   │   │        - createTreeWalker
│   │   │        - entries
│   │   │        - findExistingForumRow
│   │   │        - forEach
│   │   │        - getPinnedForums
│   │   │        - includes
│   │   │        - insertAdjacentHTML
│   │   │        - localeCompare
│   │   │        - nextNode
│   │   │        - push
│   │   │        - querySelector
│   │   │        - querySelectorAll
│   │   │        - remove
│   │   │        - replace
│   │   │        - sort
│   │   │        - test
│   │   │        - trim
│   │   │    └─> **populatePinnedThreadsSection**
│   │   │        - add
│   │   │        - all
│   │   │        - appendChild
│   │   │        - catch
│   │   │        - cloneNode
│   │   │        - createErrorListItemHTML
│   │   │        - createLoadingListItem
│   │   │        - disconnect
│   │   │        - entries
│   │   │        - fetchThreadData
│   │   │        - filter
│   │   │        - findExistingThreadRows
│   │   │        - forEach
│   │   │        - from
│   │   │        - getPinnedThreads
│   │   │        - has
│   │   │        - insertAdjacentHTML
│   │   │        - keys
│   │   │        - localeCompare
│   │   │        - map
│   │   │        - observe
│   │   │        - querySelector
│   │   │        - querySelectorAll
│   │   │        - remove
│   │   │        - replaceChild
│   │   │        - scrollBy
│   │   │        - sort
│   │   │    └─> **toggleNewPostsDisplay**
│   │   │        - getShowOnNewPosts
│   │   │        - reload
│   │   │        - setShowOnNewPosts
│   │   │        - updateMenuCommand
│   │   │    └─> **togglePinForum**
│   │   │        - getForumInfo
│   │   │        - getPinnedForums
│   │   │        - hasOwnProperty
│   │   │        - setPinnedForums
│   │   │        - updatePinButtonState
│   │   │    └─> **togglePinThread**
│   │   │        - getPinnedThreads
│   │   │        - getThreadInfo
│   │   │        - hasOwnProperty
│   │   │        - setPinnedThreads
│   │   │        - updatePinButtonState
│   │   │    └─> **updateMenuCommand**
│   │   │        - GM_registerMenuCommand
│   │   │        - GM_unregisterMenuCommand
│   │   │        - getShowOnNewPosts
│   │   │    └─> **updatePinButtonState**
│   │   ├── randomTopic.js
│   │   │    └─> **addRandomTopicButton**
│   │   │        - appendChild
│   │   │        - closest
│   │   │        - createElement
│   │   │        - error
│   │   │        - getElementById
│   │   │        - getValidRandomTopic
│   │   │        - insertBefore
│   │   │        - preventDefault
│   │   │        - querySelector
│   │   │        - setTimeout
│   │   │    └─> **checkTopicExists**
│   │   │        - GM_xmlhttpRequest
│   │   │        - reject
│   │   │        - resolve
│   │   │    └─> **getRandomTopicId**
│   │   │        - floor
│   │   │        - random
│   │   │    └─> **getValidRandomTopic**
│   │   │        - checkTopicExists
│   │   │        - getRandomTopicId
│   │   │    └─> **handleRandomTopicClick**
│   │   │        - catch
│   │   │        - error
│   │   │        - getValidRandomTopic
│   │   │        - preventDefault
│   │   │        - then
│   │   │    └─> **init**
│   │   │        - GM_xmlhttpRequest
│   │   │        - addRandomTopicButton
│   │   │        - appendChild
│   │   │        - catch
│   │   │        - checkTopicExists
│   │   │        - closest
│   │   │        - createElement
│   │   │        - error
│   │   │        - floor
│   │   │        - getElementById
│   │   │        - getRandomTopicId
│   │   │        - getValidRandomTopic
│   │   │        - insertBefore
│   │   │        - preventDefault
│   │   │        - querySelector
│   │   │        - random
│   │   │        - reject
│   │   │        - resolve
│   │   │        - setTimeout
│   │   │        - then
│   │   ├── recentTopicsFormat.js
│   │   │    └─> **init**
│   │   │        - appendChild
│   │   │        - cloneNode
│   │   │        - closest
│   │   │        - createElement
│   │   │        - createTextNode
│   │   │        - disconnect
│   │   │        - forEach
│   │   │        - getScriptSetting
│   │   │        - includes
│   │   │        - insertBefore
│   │   │        - log
│   │   │        - match
│   │   │        - matches
│   │   │        - observe
│   │   │        - processTitle
│   │   │        - processTitlesInContainer
│   │   │        - querySelector
│   │   │        - querySelectorAll
│   │   │        - removeChild
│   │   │        - replace
│   │   │        - replaceChild
│   │   │        - slice
│   │   │        - styleAdventurersGuildTitle
│   │   │        - styleEverythingAfterFirstDash
│   │   │        - styleParentheses
│   │   │        - styleVersionNumbers
│   │   │        - trim
│   │   │    └─> **processTitle**
│   │   │        - getScriptSetting
│   │   │        - styleAdventurersGuildTitle
│   │   │        - styleEverythingAfterFirstDash
│   │   │        - styleParentheses
│   │   │        - styleVersionNumbers
│   │   │    └─> **processTitlesInContainer**
│   │   │        - forEach
│   │   │        - querySelectorAll
│   │   │    └─> **styleAdventurersGuildTitle**
│   │   │        - closest
│   │   │        - includes
│   │   │        - match
│   │   │        - trim
│   │   │    └─> **styleEverythingAfterFirstDash**
│   │   │        - appendChild
│   │   │        - cloneNode
│   │   │        - closest
│   │   │        - createElement
│   │   │        - createTextNode
│   │   │        - includes
│   │   │        - insertBefore
│   │   │        - match
│   │   │        - removeChild
│   │   │        - replaceChild
│   │   │        - slice
│   │   │    └─> **styleParentheses**
│   │   │        - includes
│   │   │        - replace
│   │   │    └─> **styleVersionNumbers**
│   │   │        - includes
│   │   │        - replace
│   │   └── separateReactions.js
│   │        └─> **addToggleLeftModeOption**
│   │            - GM_getValue
│   │            - addEventListener
│   │            - appendChild
│   │            - createElement
│   │            - getElementById
│   │            - insertBefore
│   │            - preventDefault
│   │            - querySelector
│   │            - toggleLeftMode
│   │        └─> **applyLeftMode**
│   │            - GM_getValue
│   │            - appendChild
│   │            - createElement
│   │            - forEach
│   │            - getElementById
│   │            - insertBefore
│   │            - querySelector
│   │            - querySelectorAll
│   │        └─> **createReactionList**
│   │            - getPollVotes
│   │            - join
│   │            - log
│   │            - map
│   │            - toLowerCase
│   │        └─> **fetchReactions**
│   │            - catch
│   │            - error
│   │            - fetch
│   │            - json
│   │            - parseReactions
│   │            - then
│   │        └─> **getPollVotes**
│   │            - contains
│   │            - forEach
│   │            - getAttribute
│   │            - log
│   │            - push
│   │            - querySelector
│   │            - querySelectorAll
│   │            - toLowerCase
│   │            - trim
│   │        └─> **hidePopup**
│   │        └─> **init**
│   │            - GM_getValue
│   │            - GM_registerMenuCommand
│   │            - GM_setValue
│   │            - add
│   │            - addEventListener
│   │            - addToggleLeftModeOption
│   │            - appendChild
│   │            - applyLeftMode
│   │            - catch
│   │            - closest
│   │            - contains
│   │            - createElement
│   │            - createReactionList
│   │            - error
│   │            - fetch
│   │            - fetchReactions
│   │            - forEach
│   │            - getAttribute
│   │            - getBoundingClientRect
│   │            - getElementById
│   │            - getPollVotes
│   │            - hidePopup
│   │            - insertAdjacentHTML
│   │            - insertBefore
│   │            - join
│   │            - json
│   │            - log
│   │            - map
│   │            - observe
│   │            - observePosts
│   │            - parseFromString
│   │            - parseReactions
│   │            - preventDefault
│   │            - processPost
│   │            - push
│   │            - querySelector
│   │            - querySelectorAll
│   │            - reload
│   │            - remove
│   │            - showPopup
│   │            - substring
│   │            - then
│   │            - toLowerCase
│   │            - toggleLeftMode
│   │            - trim
│   │            - updateReactions
│   │        └─> **observePosts**
│   │            - addToggleLeftModeOption
│   │            - appendChild
│   │            - applyLeftMode
│   │            - closest
│   │            - contains
│   │            - createElement
│   │            - forEach
│   │            - observe
│   │            - processPost
│   │            - querySelectorAll
│   │        └─> **parseReactions**
│   │            - contains
│   │            - forEach
│   │            - getAttribute
│   │            - parseFromString
│   │            - push
│   │            - querySelector
│   │            - querySelectorAll
│   │        └─> **processPost**
│   │            - querySelector
│   │            - substring
│   │            - updateReactions
│   │        └─> **showPopup**
│   │            - getBoundingClientRect
│   │        └─> **toggleLeftMode**
│   │            - GM_getValue
│   │            - GM_setValue
│   │            - reload
│   │        └─> **updateReactions**
│   │            - GM_getValue
│   │            - add
│   │            - addEventListener
│   │            - catch
│   │            - closest
│   │            - createReactionList
│   │            - error
│   │            - fetchReactions
│   │            - forEach
│   │            - hidePopup
│   │            - insertAdjacentHTML
│   │            - querySelector
│   │            - querySelectorAll
│   │            - remove
│   │            - showPopup
│   │            - then
│   ├── utils
│   │   ├── compareVersions.js
│   │   │    └─> **compareVersions**
│   │   │        - map
│   │   │        - max
│   │   │        - split
│   │   ├── filterScripts.js
│   │   │    └─> **filterScripts**
│   │   │        - compareVersions
│   │   │        - filter
│   │   │        - getElementById
│   │   │        - includes
│   │   │        - localeCompare
│   │   │        - sort
│   │   │        - toLowerCase
│   │   ├── getCategoryOptions.js
│   │   │    └─> **getCategoryOptions**
│   │   │        - add
│   │   │        - forEach
│   │   │        - from
│   │   │        - join
│   │   │        - map
│   │   │        - sort
│   │   ├── getExecutionPhaseOptions.js
│   │   │    └─> **getExecutionPhaseOptions**
│   │   │        - join
│   │   │        - map
│   │   ├── getPhaseDisplayName.js
│   │   │    └─> **getPhaseDisplayName**
│   │   ├── logger.js
│   │   │    (Error parsing: [object Object])
│   │   ├── README.md
│   │   ├── sharedUtils.js
│   │   └── urlMatcher.js
│   │        └─> **matchesUrl**
│   │            - isArray
│   │            - replace
│   │            - some
│   │            - test
│   │        └─> **shouldLoadScript**
│   │            - matchesUrl
│   ├── forumPreferences.js
│   ├── injectStyles.js
│   ├── main.js
│   │    └─> **addMenuButton**
│   │        - createElement
│   │        - ensureFontAwesome
│   │        - find
│   │        - from
│   │        - getAttribute
│   │        - includes
│   │        - insertBefore
│   │        - log
│   │        - preventDefault
│   │        - querySelector
│   │        - querySelectorAll
│   │        - toggleVisibilityCallback
│   │        - trim
│   │        - warn
│   │    └─> **ensureFontAwesome**
│   │        - appendChild
│   │        - createElement
│   │        - log
│   │        - querySelector
│   │    └─> **executeLoadOrderForPhase**
│   │        - error
│   │        - findScriptById
│   │        - forEach
│   │        - item
│   │        - loadScript
│   │        - log
│   │        - warn
│   │    └─> **findScriptById**
│   │        - find
│   │    └─> **getScriptSetting**
│   │        - gmGetValue
│   │    └─> **gmGetValue**
│   │        - GM_getValue
│   │    └─> **gmSetValue**
│   │        - GM_setValue
│   │    └─> **handleLoadTabContent**
│   │        - getElementById
│   │        - loadTabContent
│   │    └─> **handleRenderScriptsGridView**
│   │        - renderScriptsGridView
│   │    └─> **handleRenderScriptsListView**
│   │        - renderScriptsListView
│   │    └─> **handleShowScriptSettings**
│   │        - showScriptSettings
│   │    └─> **init**
│   │        - addEventListener
│   │        - addMenuButton
│   │        - executeLoadOrderForPhase
│   │        - initializeScriptStates
│   │        - log
│   │        - preventDefault
│   │        - setTimeout
│   │        - toggleModalVisibility
│   │    └─> **initializeScriptStates**
│   │        - forEach
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
│   │        - getElementById
│   │        - hideModal
│   │        - log
│   │        - showModal
│   │    └─> **unloadScript**
│   │        - cleanup
│   │        - error
│   │        - log
│   ├── manifest.js
│   └── meta.js
├── tools
│   └── add-script.js
│        └─> **createScript**
│            - close
│            - error
│            - exit
│            - isValidScriptId
│            - log
│            - prompt
│            - toLowerCase
│        └─> **isValidScriptId**
│            - test
│        └─> **processFiles**
│            - error
│            - existsSync
│            - exit
│            - includes
│            - indexOf
│            - join
│            - lastIndexOf
│            - localeCompare
│            - log
│            - match
│            - mkdirSync
│            - push
│            - readFileSync
│            - slice
│            - sort
│            - substring
│            - trim
│            - writeFileSync
│        └─> **prompt**
│            - question
│            - resolve
├── .gitattributes
├── .gitignore
├── load_order.json
├── package-lock.json
├── package.json
├── README.md
└── rollup.config.js
     └─> **generateMetadata**
         - join
         - replace

```
