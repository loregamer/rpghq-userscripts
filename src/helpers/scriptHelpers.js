// src/helpers/scriptHelpers.js
import { scriptState } from './Core/settings/scriptState.js';
// Import other general script logic helpers here if needed

export const scriptHelpers = {
  isScriptEnabled: scriptState.isScriptEnabled,
  setScriptEnabled: scriptState.setScriptEnabled,
  // Add other script helpers as needed, e.g.:
  // getScriptSetting: someOtherModule.getScriptSetting,
};
