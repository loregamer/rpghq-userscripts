# Roadmap: RPGHQ Userscript Manager

This document outlines the development checkpoints and actionable steps for creating the all-in-one userscript manager.

## Phase 1: Project Setup & Core Structure

- **Checkpoint:** Basic project environment is ready.
  - [x] Initialize `npm` project (`npm init -y`).
  - [x] Install development dependencies: `rollup`, `rollup-plugin-terser` (for minification), `@rollup/plugin-node-resolve`, `@rollup/plugin-commonjs`, `rollup-plugin-import-css` (or similar for CSS handling), `rollup-plugin-userscript-metablock` (or manual header generation).
  - [x] Create initial folder structure based on `docs/folder_structure.md`:
    - [x] `dist/`
    - [ ] `docs/` (already exists)
    - [x] `src/`
    - [x] `src/scripts/`
  - [x] Create empty placeholder files:
    - [x] `src/main.js`
    - [x] `src/scripts/placeholder_script.js`
    - [x] `src/styles.css`
    - [x] `src/manifest.js`
    - [x] `rollup.config.js`
    - [x] `README.md`
    - [x] `.gitignore` (add `node_modules/`, `dist/`)

## Phase 2: Core Manager Logic (`src/main.js`)

- **Checkpoint:** Basic manager can initialize, load manifest, and manage basic state.
  - [x] Define initial `SCRIPT_MANIFEST` array structure in `src/manifest.js` (with 1-2 placeholder script definitions).
  - [x] Implement basic `GM_getValue` / `GM_setValue` wrappers (in `main.js` or a small `gmUtils.js` if preferred) for script enabled states and settings.
  - [x] Load script enabled/disabled states from storage on startup. If not found, use `enabledByDefault` from the manifest.
  - [x] Implement basic script loading logic:
    - [x] Read `SCRIPT_MANIFEST` array.
    - [x] Iterate through the manifest in order.
    - [x] For each script, check if it's enabled in storage.
    - [x] (Placeholder) Log the name of the enabled script that would be loaded.

## Phase 3: Build Process (`rollup.config.js`)

- **Checkpoint:** Rollup can bundle the source files into a functional userscript.
  - [x] Configure `rollup.config.js` for basic bundling:
    - [x] Set `src/main.js` as input.
    - [x] Set `dist/rpghq-userscript-manager.user.js` as output (`iife` format).
    - [x] Include necessary plugins (`node-resolve`, `commonjs`).
  - [x] Configure Rollup to handle styles (using a postbuild script to inject CSS into the built userscript).
  - [x] Configure Rollup to generate the Userscript Metadata Block:
    - [x] Use `rollup-plugin-userscript-metablock` or manually construct the header string.
    - [x] Include essential `@name`, `@version` (from `package.json`), `@namespace`, `@match` (e.g., `*://*.rpghq.org/*`), `@grant` (start with `GM_getValue`, `GM_setValue`, `GM_registerMenuCommand`), `@run-at`.
  - [x] Add build script to `package.json` (e.g., `"build": "rollup -c"`).
  - [x] Run the build and verify the output `dist/rpghq-userscript-manager.user.js` has the metablock and bundled code.

## Phase 4: UI Implementation (`src/main.js` & `src/styles.css`)

- **Checkpoint:** The core UI modal is functional and displays script information.
  - [x] Implement HTML structure creation for the main modal (`mod-manager-modal`) within `main.js`.
  - [x] Implement CSS in `src/styles.css` for the modal, overlay, header, tabs, and content area (based on `docs/ui_description_popup_only.md`).
  - [x] Implement basic modal visibility logic (show/hide on command/shortcut).
    - [x] `GM_registerMenuCommand` to open the modal.
    - [x] Keyboard shortcut listener (`Insert` key) to toggle visibility.
    - [x] Close button functionality.
  - [x] Implement tab switching logic.
  - [x] Implement the "Installed Scripts" tab:
    - [x] Render scripts from the `SCRIPT_MANIFEST`.
    - [x] Implement Grid View (`renderScriptsGridView`).
    - [x] Implement List View (`renderScriptsListView`).
    - [x] Implement view switcher (Grid/List buttons).
    - [x] Implement enable/disable toggle switches for each script.
      - [x] Update the UI state visually.
      - [x] Save the state using `GM_setValue`.
      - [ ] Trigger necessary logic to load/unload the actual script functionality (Phase 5).
  - [x] Implement placeholder content for "Forum Preferences" and "Settings" tabs.
  - [x] Implement the Script Settings modal (`settings-modal`):
    - [x] Basic modal structure and styling.
    - [x] Function to dynamically render settings controls based on script's manifest definition (`renderScriptSettingsContent`) (placeholder implemented).
    - [x] Display script metadata (`script-info`).
    - [x] Functionality for "Settings" button on script card/row to open this modal for the correct script.
    - [ ] (Later) Hook up controls to save settings via `GM_setValue`.

## Phase 4.1: UI Activation (`src/main.js` & `src/styles.css`)

- **Checkpoint:** The UI modal appears correctly when triggered.
  - [x] Inject CSS from `src/styles.css` into the page using `GM_addStyle` or similar.
  - [x] Re-implement `addMenuButton` logic to add the "View Userscripts" button to the profile dropdown menu.
  - [x] Fix visibility issues with modals by using direct style.display instead of class toggling.

## Phase 5: Dynamic Script Execution

- **Checkpoint:** Enabled scripts are actually loaded and executed.
  - [x] Refine the script loading logic in `main.js`.
  - [x] Instead of just logging, use dynamic `import()` or another suitable mechanism (considering userscript environment limitations) to load and execute the code from the script's `path` specified in the manifest _if_ it is enabled.
  - [x] Ensure scripts are loaded in the order defined by the `SCRIPT_MANIFEST` array.
  - [x] Handle potential errors during script loading/execution gracefully.
  - [x] Implement logic for _unloading_ or disabling a script when toggled off (this can be complex, might initially require a page reload).

## Phase 6: Populate with Initial Scripts (`src/scripts/`)

- **Checkpoint:** Add 1-2 actual example scripts.
  - [x] Create a simple script (e.g., `example_script1.js`) that logs a message or makes a trivial DOM change. Add its definition to `manifest.js`.
  - [x] Create a script with settings (e.g., `example_script2.js`) that uses a boolean setting from the manifest.
    - [x] Implement the script logic to read its setting via `GM_getValue`.
    - [x] Define its settings in `manifest.js`.
    - [x] Verify the settings UI renders correctly and saving works.
  - [x] Test enabling/disabling these scripts and confirming their functionality starts/stops (or requires reload).

## Phase 7: Match UI with Deprecated Manager

- **Checkpoint:** UI matches exactly with the deprecated-userscript-manager.user.js.
  - [x] Implement full tab functionality with all three tabs working properly:
    - [x] "Installed Scripts" tab with both Grid and List views
    - [x] "Forum Preferences" tab with settings sections and preferences
    - [x] "Settings" tab with global manager settings
  - [x] Ensure correct styling and layout matching the deprecated manager G:\Modding_Github\HQ-Userscripts\deprecated-userscript-manager.user.js:
    - [x] Implement proper CSS variables for theming
    - [x] Match modal dimensions and positions
    - [x] Match font styles, buttons, and input controls
  - [x] Implement filter panel functionality for filtering scripts
  - [x] Implement category and execution phase filtering
  - [x] Ensure settings modal matches deprecated version with correct layout for settings controls
  - [x] Implement Forum Preferences from FORUM_PREFERENCES object in deprecated manager
  - [x] Add proper empty state messaging when no scripts are found
  - [x] Match all animations and transitions from the deprecated manager
  - [x] Ensure responsive behavior matches deprecated version

## Phase 8: Refinement & Documentation

- **Checkpoint:** Project is stable and well-documented.
  - [x] Refine UI/UX based on testing.
  - [ ] Add error handling and logging.
  - [ ] Complete placeholder tabs ("Forum Preferences", "Settings") if desired, or remove them.
  - [ ] Write comprehensive `README.md` including setup, build, and usage instructions.
  - [ ] Add comments to code where necessary.
  - [ ] Consider adding linters/formatters (e.g., ESLint, Prettier).
  - [ ] Final testing across different browsers/userscript managers if possible.
