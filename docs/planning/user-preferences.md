**Phase 1: Setup & Data Structure**

1.  **Storage:**
    - We will use a single storage key: `RPGHQ_Manager_user_preferences`.
    - The data stored under this key will be a single JavaScript object.
    - **This object will use the forum `username` as keys.** Each key will map to another object containing the `user_id` and the specific preferences for that user:
      ```javascript
      // Example structure stored via gmSetValue('RPGHQ_Manager_user_preferences', userPrefs);
      const userPrefs = {
        ExampleUser1: {
          // username (primary key)
          user_id: "123", // Store user_id
          hidePosts: true,
          avatarUrl: "https://example.com/new_avatar.png",
          usernameColor: "#FF5733",
        },
        AnotherUser: {
          user_id: "456",
          hidePosts: null,
          avatarUrl: null,
          usernameColor: null,
        },
        ColoredUser: {
          user_id: "789",
          hidePosts: null,
          avatarUrl: null,
          usernameColor: "#33FF57",
        },
        // ... more users
      };
      ```
    - Using `null` for a setting indicates that no specific preference is set for that user for that option. We store both `username` (as the key) and `user_id`.

**Phase 2: User Interface (Management)**

2.  **Integrate into Forum Preferences Tab:** (No change)
    - Leverage the existing, currently non-functional "Forum Preferences" tab in the manager modal.
    - Modify `src/components/loadTabContent.js` to render a new UI section dedicated to user preference management within this tab.
3.  **User Management UI Component:** (Minor change in data handling)
    - Create a new UI component (e.g., `renderUserPreferencesManagement.js`).
    - **Member Search Integration:**
      - Include an input field to search for members.
      - Adapt the functionality from `src/scripts/memberSearch.js`.
      - Modify the result click action: Clicking a user will add an entry to the `userPrefs` object using the fetched **`username` as the key**, storing the fetched **`user_id`** and default preference values (e.g., all `null`) within the nested object. Update the displayed list. Prevent adding duplicate usernames.
    - **Managed Users List:**
      - Display a list of all users currently present as keys in the `userPrefs` object (i.e., list by username).
      - For each user listed:
        - Show their `username`.
        - Display controls (toggle, URL input, color picker) for their preferences (`hidePosts`, `avatarUrl`, `usernameColor`).
        - Include a "Remove" button to delete the user's entry (keyed by their username) from the `userPrefs` object.
    - **Saving:** All changes will immediately update the `userPrefs` object and save it using `gmSetValue`.

**Phase 3: Applying Preferences on Forum Pages**

4.  **Preference Application Logic:** (Adjustment in how data is accessed)
    - Create a new script module (e.g., `src/scripts/applyUserPreferences.js`).
    - This script will run at an appropriate stage (e.g., `document-idle` or `after_dom`).
    - **Functionality:**
      - Load the `userPrefs` object using `gmGetValue('RPGHQ_Manager_user_preferences')`.
      - If the object exists, iterate through its **values** (the nested objects containing `user_id` and preferences).
      - For each user preference object, use the stored **`user_id`** to find corresponding elements on the page (posts, profile links, etc.). Relying on `user_id` for matching DOM elements is more robust than using username.
      - Apply the preferences (`hidePosts`, `avatarUrl`, `usernameColor`) to the matched elements based on the `user_id`.
5.  **Integration into Manager:** (No change)
    - Add `applyUserPreferences.js` to imports and `scriptModules` in `src/main.js`.
    - Define in `src/manifest.js`.
    - Add to `load_order.json`.

---

**Diagram (Mermaid):** (Remains conceptually the same, data structure detail updated)

```mermaid
graph LR
    subgraph User Interaction (Manager Modal)
        A[Forum Prefs Tab] --> B(User Mgmt UI);
        B --> C{Member Search Input};
        C -- Search --> D[/forums/mentionloc API];
        D -- Results (username, user_id) --> B;
        B -- Add/Edit/Remove User --> E[User Prefs List UI (by Username)];
        E -- Save Changes --> F[(GM Storage: user_preferences {username: {user_id, prefs...}})];
    end

    subgraph Page Modification (Forum Pages)
        G[applyUserPreferences.js] -- Runs on page load --> H{Load Prefs};
        H -- Read --> F;
        H -- Iterate Values --> I{Get user_id & prefs};
        I -- Find Elements by user_id --> J{Apply Prefs};
        J -- Hide/Change Avatar/Change Color --> K([DOM Elements]);
    end

    F -- Used By --> G;
```

---

This revised plan uses the `username` as the primary key in the storage object while retaining the `user_id` for reliable identification when applying the preferences on the forum pages.
