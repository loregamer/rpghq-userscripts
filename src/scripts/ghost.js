/**
 * Ghost functionality integration for RPGHQ Userscript Manager
 * Provides Ghost features for hiding and managing ghosted users
 */

import { initGhost } from "../utils/ghost/ghost.js";

export function init() {
  return initGhost();
}
