// ==UserScript==
// @name         RPGHQ Userscript Manager
// @namespace    https://rpghq.org/
// @version      3.0.0
// @description  A reimagined userscript manager popup featuring an enhanced gallery (with filters, version display, install buttons, and installed banners), an installed mods view, and a much-improved settings UI with Font Awesome icons.
// @author       loregamer
// @match        https://rpghq.org/forums/*
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @connect      github.com
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function () {
  "use strict";
