// ==UserScript==
// @name         Nexus Mods - Content Curator
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds warning labels to mods marked as broken or not recommended based on a GitHub-hosted database
// @author       You
// @match        https://www.nexusmods.com/*/mods/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function () {
  "use strict";

  // Configuration - Replace with your GitHub raw JSON URL
  const MOD_STATUS_URL =
    "https://raw.githubusercontent.com/loregamer/rpghq-userscripts/refs/heads/main/Nexus/Resources/mod-status.json";

  const AUTHOR_STATUS_URL =
    "https://raw.githubusercontent.com/loregamer/rpghq-userscripts/refs/heads/main/Nexus/Resources/author-status.json";
})();
