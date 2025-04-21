# Plan: User-Specific Rules Feature

This document outlines the plan for implementing a feature allowing users to define rules that modify the appearance of specific users' content on the forum.

## 1. Goal

To allow the script user to define custom rules (e.g., hide signatures, highlight posts) and settings (e.g., username color) for specific forum users they encounter. These rules will be applied dynamically across the forum.

## 2. Data Storage

- **Mechanism:** Greasemonkey's asynchronous storage API (`GM.setValue` and `GM.getValue`).
- **Storage Key:** A single key will be used to store all user-specific data, e.g., `'hqUserRules'`.

## 3. Data Structure

- The value stored under the `'hqUserRules'` key will be a JavaScript object.
- The **keys** of this main object will be the **User IDs** (as strings) of the forum users for whom rules are defined.
- The **value** associated with each User ID key will be an object containing:
  - `username`: (String) The user's current username (stored for display purposes, can be updated).
  - `usernameColor`: (String | null) An optional hex color code (e.g., `'#56215'`) for highlighting the username, or `null` if no color is set.
  - `rules`: (Array) An array containing rule objects specific to this user.

### 3.1. Rule Object Structure

Each object within the `rules` array will have the following properties:

- `id`: (String) A unique identifier for the rule (e.g., generated via timestamp or UUID).
- `action`: (String) The action to perform. Initial values: `'HIDE'`, `'HIGHLIGHT'`.
- `subject`: (String) What the action applies to. Initial values: `'POST_BODY'`, `'SIGNATURE'`, `'AVATAR'`, `'USERNAME'`.
- `scope`: (String) Where the action should be applied. Initial values: `'ALL'`, `'TOPIC_VIEW'`, `'PROFILE_VIEW'`, `'RECENT_TOPICS_LIST'`, `'SEARCH_RESULTS'`.
- `params`: (Object) Optional parameters specific to the action. Example: `{ color: '#FFFF00' }` for `HIGHLIGHT` action.

### 3.2. Example Data Structure

```json
// Example stored in GM under 'hqUserRules'
{
  "551": {
    "username": "loregamer",
    "usernameColor": "#56215",
    "rules": [
      {
        "id": "rule_abc1",
        "action": "HIDE",
        "subject": "SIGNATURE",
        "scope": "ALL",
        "params": {}
      },
      {
        "id": "rule_def2",
        "action": "HIGHLIGHT",
        "subject": "POST_BODY",
        "scope": "TOPIC_VIEW",
        "params": { "color": "#FFEEAA" }
      }
    ]
  },
  "123": {
    "username": "SomeOtherUser",
    "usernameColor": null,
    "rules": [
      {
        "id": "rule_ghi3",
        "action": "HIDE",
        "subject": "AVATAR",
        "scope": "RECENT_TOPICS_LIST",
        "params": {}
      }
    ]
  }
}
```

## 4. UI Integration

- The UI for managing these user-specific rules will be integrated into the script's existing settings panel, specifically within the **"Users" sub-tab**.
- This sub-tab is rendered by `src/components/tabs/subtabs/renderUsersSubtab.js`.

### 4.1. UI Structure within "Users" Sub-tab

1.  **User Selection Area:**
    - Input Field: "Enter Username or User ID:"
    - Button: "Find User"
    - Display Area: Shows status (e.g., "Editing rules for: loregamer (ID: 551)" or "User not found...")
2.  **User Settings Area** (Visible after user selection):
    - **Username Color Setting:**
      - Label: "Username Highlight Color:"
      - Color Input: `<input type="color">`
    - **Rules Management:**
      - Heading: "Rules for [Selected Username]"
      - **Rules List/Table:** Displays existing rules.
        - _Each Row:_ Rule Details (Action, Subject, Scope, Params), "Edit" Button, "Delete" Button.
      - Button: "Add New Rule" (Opens Rule Editor Modal).
    - **Save Button:**
      - Button: "Save All Changes for [Selected Username]" (Persists changes for the selected user to GM storage).

### 4.2. Rule Editor (Modal Dialog)

- Opens via "Add New Rule" or "Edit" button clicks.
- **Form Fields:**
  - Dropdown: Action (HIDE, HIGHLIGHT)
  - Dropdown: Subject (POST_BODY, SIGNATURE, AVATAR, USERNAME)
  - Dropdown: Scope (ALL, TOPIC_VIEW, etc.)
  - Conditional Input: Parameters (e.g., Color picker if Action is HIGHLIGHT).
- **Buttons:**
  - "Save Rule" (Updates the visual list in the main UI).
  - "Cancel".

## 5. Rule Application Logic

- The userscript will execute on relevant forum pages (topic views, profile views, recent topics lists, etc.).
- It will fetch the `hqUserRules` object from GM storage.
- On encountering user-related elements (posts, links), it will extract the User ID.
- It will look up the data for that User ID in the fetched `hqUserRules` object.
- If rules exist for that user, it will check the `scope` of each rule against the current page context.
- Matching rules will be applied (e.g., hiding elements via CSS, adding highlight styles).

## 6. Files to Edit (Preliminary)

Based on this plan, the following files are likely to require modification or creation:

- **`src/components/tabs/subtabs/renderUsersSubtab.js`**: Primary file for implementing the user rule management UI within the settings panel.
- **New File (e.g., `src/userRulesManager.js` or `src/utils/userRulesStorage.js`)**: To encapsulate the logic for reading, writing, and updating the user rules data in Greasemonkey storage.
- **`src/main.js` (and/or related modules)**: To integrate the rule application logic. This involves detecting relevant forum pages, identifying user elements, fetching rules, and applying the necessary DOM manipulations (hiding/styling).
- **CSS Files (if applicable)**: May need additions to support highlighting or specific hiding styles if not done purely via inline styles or element removal.
