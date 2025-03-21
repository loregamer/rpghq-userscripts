// ==UserScript==
// @name         RPGHQ Userscript Manager (Mod Manager UI)
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

(function() {
    'use strict';

    // ===== Constants & URLs =====
    const MANIFEST_URL = 'https://raw.githubusercontent.com/loregamer/rpghq-userscripts/userscript-manager/scripts/manifest.json';
    const SCRIPT_BASE_URL = 'https://raw.githubusercontent.com/loregamer/rpghq-userscripts/userscript-manager/scripts/';
    const STORAGE_KEY = 'rpghq_userscript_manager';

    // ===== Execution Phases =====
    const ExecutionPhase = {
        DOCUMENT_START: 'document-start',
        DOCUMENT_READY: 'document-ready',
        DOCUMENT_LOADED: 'document-loaded',
        DOCUMENT_IDLE: 'document-idle',
        CUSTOM_EVENT: 'custom-event'
    };

    // ===== Storage Management =====
    const Storage = {
        STORAGE_VERSION: 1,

        init: function() {
            const data = this.getRawData();
            if (!data) {
                const initialData = {
                    version: this.STORAGE_VERSION,
                    installedScripts: {},
                    lastUpdate: Date.now()
                };
                this.saveRawData(initialData);
                return initialData;
            }
            if (data.version < this.STORAGE_VERSION) {
                data.version = this.STORAGE_VERSION;
                this.saveRawData(data);
            }
            return data;
        },

        getRawData: function() {
            const data = GM_getValue(STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        },

        // Save storage in compact format (minified JSON)
        saveRawData: function(data) {
            data.lastUpdate = Date.now();
            GM_setValue(STORAGE_KEY, JSON.stringify(data));
        },

        getData: function() {
            return this.getRawData() || this.init();
        },

        saveData: function(data) {
            const currentData = this.getData();
            data.version = currentData.version;
            this.saveRawData(data);
        },

        getScriptCodeKey: function(scriptId) {
            return `script_${scriptId}`;
        },

        saveScriptCode: function(scriptId, code) {
            GM_setValue(this.getScriptCodeKey(scriptId), code);
        },

        getScriptCode: function(scriptId) {
            return GM_getValue(this.getScriptCodeKey(scriptId), '');
        },

        deleteScriptCode: function(scriptId) {
            GM_deleteValue(this.getScriptCodeKey(scriptId));
        },

        getInstalledScripts: function() {
            return this.getData().installedScripts || {};
        },

        saveInstalledScript: function(scriptId, scriptData) {
            const data = this.getData();
            if (!data.installedScripts) {
                data.installedScripts = {};
            }
            // Save the script code (if present) by ID only
            if (scriptData.code) {
                this.saveScriptCode(scriptId, scriptData.code);
                delete scriptData.code;
            }
            if (!data.installedScripts[scriptId]) {
                scriptData.installedAt = Date.now();
            } else {
                scriptData.installedAt = data.installedScripts[scriptId].installedAt;
                scriptData.updatedAt = Date.now();
            }
            data.installedScripts[scriptId] = scriptData;
            this.saveData(data);
        },

        removeInstalledScript: function(scriptId) {
            const data = this.getData();
            if (data.installedScripts && data.installedScripts[scriptId]) {
                delete data.installedScripts[scriptId];
                this.deleteScriptCode(scriptId);
                this.saveData(data);
                return true;
            }
            return false;
        },

        getScriptSettings: function(scriptId) {
            const installedScripts = this.getInstalledScripts();
            return (installedScripts[scriptId] && installedScripts[scriptId].settings) || {};
        },

        saveScriptSettings: function(scriptId, settings) {
            const data = this.getData();
            const installedScripts = data.installedScripts;
            if (installedScripts && installedScripts[scriptId]) {
                installedScripts[scriptId].settings = settings;
                installedScripts[scriptId].settingsUpdatedAt = Date.now();
                this.saveData(data);
                return true;
            }
            return false;
        },

        // Global settings for the entire mod manager (example)
        getGlobalSettings: function() {
            const settings = GM_getValue('global_settings');
            return settings ? JSON.parse(settings) : {};
        },

        saveGlobalSettings: function(settings) {
            GM_setValue('global_settings', JSON.stringify(settings));
        }
    };

    // ===== Execution Framework =====
    const ExecutionFramework = {
        queues: {
            [ExecutionPhase.DOCUMENT_START]: [],
            [ExecutionPhase.DOCUMENT_READY]: [],
            [ExecutionPhase.DOCUMENT_LOADED]: [],
            [ExecutionPhase.DOCUMENT_IDLE]: [],
            [ExecutionPhase.CUSTOM_EVENT]: {}
        },

        register: function(phase, scriptId, scriptData, callback) {
            if (phase === ExecutionPhase.CUSTOM_EVENT) {
                if (!scriptData.eventName) {
                    console.error(`Cannot register script ${scriptId} for custom event without an event name`);
                    return false;
                }
                if (!this.queues[ExecutionPhase.CUSTOM_EVENT][scriptData.eventName]) {
                    this.queues[ExecutionPhase.CUSTOM_EVENT][scriptData.eventName] = [];
                }
                this.queues[ExecutionPhase.CUSTOM_EVENT][scriptData.eventName].push({
                    scriptId,
                    scriptData,
                    callback
                });
            } else if (this.queues[phase]) {
                this.queues[phase].push({
                    scriptId,
                    scriptData,
                    callback
                });
            } else {
                console.error(`Unknown execution phase: ${phase}`);
                return false;
            }
            return true;
        },

        execute: function(phase, eventName = null) {
            if (phase === ExecutionPhase.CUSTOM_EVENT) {
                if (!eventName || !this.queues[ExecutionPhase.CUSTOM_EVENT][eventName]) {
                    return;
                }
                this.queues[ExecutionPhase.CUSTOM_EVENT][eventName].forEach(item => {
                    try {
                        item.callback(item.scriptId, item.scriptData);
                    } catch (e) {
                        console.error(`Error executing script ${item.scriptId} for event ${eventName}:`, e);
                    }
                });
            } else if (this.queues[phase]) {
                this.queues[phase].forEach(item => {
                    try {
                        item.callback(item.scriptId, item.scriptData);
                    } catch (e) {
                        console.error(`Error executing script ${item.scriptId} for phase ${phase}:`, e);
                    }
                });
            }
        },

        triggerEvent: function(eventName, data = {}) {
            this.execute(ExecutionPhase.CUSTOM_EVENT, eventName, data);
        },

        init: function() {
            document.addEventListener('DOMContentLoaded', () => {
                this.execute(ExecutionPhase.DOCUMENT_READY);
            });
            window.addEventListener('load', () => {
                this.execute(ExecutionPhase.DOCUMENT_LOADED);
                setTimeout(() => {
                    this.execute(ExecutionPhase.DOCUMENT_IDLE);
                }, 500);
            });
            this.execute(ExecutionPhase.DOCUMENT_START);
        }
    };

    // ===== Script Management =====
    const ScriptManager = {
        manifest: null,

        fetchManifest: function() {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: MANIFEST_URL,
                    onload: function(response) {
                        if (response.status === 200) {
                            try {
                                const manifest = JSON.parse(response.responseText);
                                resolve(manifest);
                            } catch (e) {
                                reject('Failed to parse manifest: ' + e.message);
                            }
                        } else {
                            reject('Failed to fetch manifest: ' + response.statusText);
                        }
                    },
                    onerror: function(error) {
                        reject('Error fetching manifest: ' + error);
                    }
                });
            });
        },

        fetchScript: function(scriptId) {
            return new Promise((resolve, reject) => {
                const scriptInfo = this.getScriptInfoById(scriptId);
                if (!scriptInfo) {
                    reject('Script not found in manifest: ' + scriptId);
                    return;
                }
                const scriptUrl = SCRIPT_BASE_URL + scriptInfo.filename;
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: scriptUrl,
                    onload: function(response) {
                        if (response.status === 200) {
                            resolve(response.responseText);
                        } else {
                            reject('Failed to fetch script: ' + response.statusText);
                        }
                    },
                    onerror: function(error) {
                        reject('Error fetching script: ' + error);
                    }
                });
            });
        },

        getScriptInfoById: function(scriptId) {
            if (!this.manifest || !this.manifest.scripts) return null;
            return this.manifest.scripts.find(script => script.id === scriptId);
        },

        needsUpdate: function(scriptId) {
            const installedScripts = Storage.getInstalledScripts();
            const scriptInfo = this.getScriptInfoById(scriptId);
            if (!scriptInfo || !installedScripts[scriptId]) return false;
            const installedVersion = installedScripts[scriptId].version;
            const manifestVersion = scriptInfo.version;
            return this.compareVersions(manifestVersion, installedVersion) > 0;
        },

        compareVersions: function(v1, v2) {
            const v1parts = v1.split('.').map(Number);
            const v2parts = v2.split('.').map(Number);
            for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
                const v1part = v1parts[i] || 0;
                const v2part = v2parts[i] || 0;
                if (v1part > v2part) return 1;
                if (v1part < v2part) return -1;
            }
            return 0;
        },

        installScript: function(scriptId) {
            return new Promise((resolve, reject) => {
                const scriptInfo = this.getScriptInfoById(scriptId);
                if (!scriptInfo) {
                    reject('Script not found in manifest: ' + scriptId);
                    return;
                }
                this.fetchScript(scriptId)
                    .then(scriptCode => {
                        const settings = {};
                        if (scriptInfo.settings) {
                            scriptInfo.settings.forEach(setting => {
                                settings[setting.id] = setting.default;
                            });
                        }
                        Storage.saveInstalledScript(scriptId, {
                            name: scriptInfo.name,
                            version: scriptInfo.version,
                            code: scriptCode,
                            enabled: true,
                            settings: settings
                        });
                        resolve(scriptInfo);
                    })
                    .catch(reject);
            });
        },

        uninstallScript: function(scriptId) {
            return Storage.removeInstalledScript(scriptId);
        },

        executeScripts: function() {
            const installedScripts = Storage.getInstalledScripts();
            Object.keys(installedScripts).forEach(scriptId => {
                const scriptData = installedScripts[scriptId];
                if (scriptData.enabled) {
                    this.executeScript(scriptId, scriptData);
                }
            });
        },

        executeScript: function(scriptId, scriptData) {
            try {
                const scriptName = scriptData.name || scriptId;
                const code = Storage.getScriptCode(scriptId);
                if (!code) {
                    console.error(`Script code not found for ${scriptName} (${scriptId})`);
                    return;
                }
                const executionPhase = scriptData.executionPhase || ExecutionPhase.DOCUMENT_READY;
                const executeFunction = (id, data) => {
                    try {
                        const scriptCode = `
                            var scriptSettings = ${JSON.stringify(data.settings || {})};
                            ${code}
                        `;
                        const scriptElement = document.createElement('script');
                        scriptElement.textContent = scriptCode;
                        document.head.appendChild(scriptElement);
                        document.head.removeChild(scriptElement);
                        console.log(`Executed script: ${scriptName} v${data.version} at phase ${executionPhase}`);
                    } catch (e) {
                        console.error(`Error executing script ${data.name || id}:`, e);
                    }
                };
                ExecutionFramework.register(executionPhase, scriptId, scriptData, executeFunction);
                return true;
            } catch (e) {
                console.error(`Error registering script ${scriptData.name || scriptId}:`, e);
                return false;
            }
        }
    };

    // ===== UI Components =====
    const UI = {
        addStyles: function() {
            GM_addStyle(`
                /* Import Font Awesome */
                @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');

                :root {
                    --primary-color: #2196F3;
                    --primary-dark: #1976D2;
                    --text-primary: #FFFFFF;
                    --text-secondary: #B0BEC5;
                    --bg-dark: #1E1E1E;
                    --bg-card: #2D2D2D;
                    --border-color: #444444;
                    --success-color: #4CAF50;
                    --warning-color: #FFC107;
                    --danger-color: #F44336;
                }
                /* Modal container */
                .mod-manager-modal {
                    display: none;
                    position: fixed;
                    z-index: 1000;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.8);
                }
                /* Modal content box */
                .mod-manager-modal-content {
                    background-color: var(--bg-dark);
                    margin: 2% auto;
                    padding: 10px;
                    border: 1px solid var(--border-color);
                    width: 80%;
                    max-height: 90vh;
                    border-radius: 4px;
                    color: var(--text-primary);
                    display: flex;
                    flex-direction: column;
                }
                /* Header and close button */
                .mod-manager-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                .mod-manager-title {
                    margin: 0;
                    font-size: 1.8em;
                }
                .mod-manager-close {
                    font-size: 1.8em;
                    cursor: pointer;
                }
                /* Tab bar */
                .mod-manager-tabs {
                    display: flex;
                    border-bottom: 1px solid var(--border-color);
                    margin-bottom: 10px;
                }
                .mod-manager-tab {
                    padding: 8px 16px;
                    cursor: pointer;
                    font-size: 1em;
                    color: var(--text-secondary);
                }
                .mod-manager-tab.active {
                    border-bottom: 2px solid var(--primary-color);
                    color: var(--text-primary);
                }
                /* Content area */
                .mod-manager-content {
                    flex: 1;
                    overflow-y: auto;
                }
                /* Gallery filter styles */
                .mod-gallery-filters {
                    margin-bottom: 10px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .mod-gallery-filters select,
                .mod-gallery-filters input {
                    padding: 4px;
                    border: 1px solid var(--border-color);
                    border-radius: 3px;
                }
                /* Gallery view styles */
                .mod-gallery {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 10px;
                }
                .mod-gallery-item {
                    background-color: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 4px;
                    padding: 8px;
                    text-align: center;
                    position: relative;
                }
                .mod-gallery-item img {
                    width: 100%;
                    height: 100px;
                    object-fit: cover;
                    border-radius: 4px;
                }
                /* Installed banner over image */
                .installed-banner {
                    position: absolute;
                    top: 0;
                    left: 0;
                    background-color: rgba(76, 175, 80, 0.85);
                    color: #fff;
                    padding: 2px 6px;
                    font-size: 0.8em;
                    font-weight: bold;
                    border-top-left-radius: 4px;
                    border-bottom-right-radius: 4px;
                    z-index: 10;
                }
                .mod-gallery-item-title {
                    margin-top: 6px;
                    font-size: 1em;
                    font-weight: bold;
                }
                .mod-gallery-item-version {
                    font-size: 0.85em;
                    color: var(--text-secondary);
                    margin: 4px 0;
                }
                .mod-gallery-item-status {
                    font-size: 0.8em;
                    margin-bottom: 4px;
                }
                .mod-gallery-item-actions button {
                    margin: 2px;
                    font-size: 0.8em;
                    padding: 2px 4px;
                    cursor: pointer;
                    border: none;
                    border-radius: 3px;
                }
                .btn-primary {
                    background-color: var(--primary-color);
                    color: #fff;
                    border: none;
                    border-radius: 4px;
                    padding: 6px 10px;
                    cursor: pointer;
                }
                .btn-danger {
                    background-color: var(--danger-color);
                    color: #fff;
                    border: none;
                    border-radius: 4px;
                    padding: 6px 10px;
                    cursor: pointer;
                }
                .btn-warning {
                    background-color: var(--warning-color);
                    color: #fff;
                    border: none;
                    border-radius: 4px;
                    padding: 6px 10px;
                    cursor: pointer;
                }
                .btn-secondary {
                    background-color: #777;
                    color: #fff;
                    border: none;
                    border-radius: 4px;
                    padding: 6px 10px;
                    cursor: pointer;
                }
                /* List (Installed) view styles */
                .mod-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .mod-list-item {
                    display: flex;
                    align-items: center;
                    padding: 6px;
                    margin-bottom: 6px;
                    background-color: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 4px;
                }
                .mod-list-item-info {
                    flex: 1;
                    padding-left: 6px;
                }
                .mod-list-item-title {
                    margin: 0;
                    font-weight: bold;
                }
                .mod-list-item-version {
                    font-size: 0.8em;
                    color: var(--text-secondary);
                }
                .mod-list-item-actions button {
                    margin-left: 4px;
                    font-size: 0.8em;
                    padding: 2px 4px;
                    cursor: pointer;
                    border: none;
                    border-radius: 3px;
                }
                /* Enhanced Settings view styles */
                .mod-settings {
                    background-color: var(--bg-card);
                    padding: 20px;
                    border-radius: 6px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.5);
                    margin: 10px;
                }
                .mod-settings h3 {
                    font-size: 1.5em;
                    margin-bottom: 20px;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 10px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .mod-settings-content {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                .mod-setting-item {
                    display: flex;
                    flex-direction: column;
                }
                .mod-setting-item label {
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .mod-setting-item input[type="text"],
                .mod-setting-item input[type="number"] {
                    padding: 8px;
                    border: 1px solid var(--border-color);
                    border-radius: 4px;
                    background-color: var(--bg-dark);
                    color: var(--text-primary);
                }
                .mod-setting-item small {
                    color: var(--text-secondary);
                    margin-top: 5px;
                }
            `);
        },

        showModal: function() {
            let modal = document.getElementById('mod-manager-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'mod-manager-modal';
                modal.className = 'mod-manager-modal';
                modal.innerHTML = `
                    <div class="mod-manager-modal-content">
                        <div class="mod-manager-header">
                            <h2 class="mod-manager-title">Mod Manager</h2>
                            <span class="mod-manager-close">&times;</span>
                        </div>
                        <div class="mod-manager-tabs">
                            <div class="mod-manager-tab active" data-tab="gallery">Gallery</div>
                            <div class="mod-manager-tab" data-tab="installed">Installed</div>
                            <div class="mod-manager-tab" data-tab="settings">Global Settings</div>
                        </div>
                        <div class="mod-manager-content" id="mod-manager-content">
                            <!-- Content loaded dynamically -->
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
                modal.querySelector('.mod-manager-close').addEventListener('click', () => {
                    UI.hideModal();
                });
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        UI.hideModal();
                    }
                });
                modal.querySelectorAll('.mod-manager-tab').forEach(tab => {
                    tab.addEventListener('click', function() {
                        UI.switchTab(this.dataset.tab);
                    });
                });
            }
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            UI.switchTab('gallery');
        },

        hideModal: function() {
            const modal = document.getElementById('mod-manager-modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        },

        switchTab: function(tabName) {
            document.querySelectorAll('.mod-manager-tab').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.tab === tabName);
            });
            if (tabName === 'gallery') {
                UI.showGalleryView();
            } else if (tabName === 'installed') {
                UI.showInstalledView();
            } else if (tabName === 'settings') {
                UI.showGlobalSettingsView();
            }
        },

        showGalleryView: function() {
            const content = document.getElementById('mod-manager-content');
            if (!ScriptManager.manifest) {
                content.innerHTML = '<p>Loading mods...</p>';
                ScriptManager.fetchManifest()
                    .then(manifest => {
                        ScriptManager.manifest = manifest;
                        UI.renderGallery(manifest.scripts);
                    })
                    .catch(err => {
                        content.innerHTML = `<p>Error loading mods: ${err}</p>`;
                    });
            } else {
                UI.renderGallery(ScriptManager.manifest.scripts);
            }
        },

        // Renders the filter bar and gallery items.
        renderGallery: function(scripts) {
            // Store the full list for filtering
            UI.allScripts = scripts;
            const installedScripts = Storage.getInstalledScripts();
            // Build the filter bar based on categories from the manifest
            let categories = new Set();
            scripts.forEach(script => {
                if (script.category) categories.add(script.category);
            });
            let categoryOptions = '<option value="all">All Categories</option>';
            categories.forEach(cat => {
                categoryOptions += `<option value="${cat}">${cat}</option>`;
            });
            const filterHtml = `
                <div class="mod-gallery-filters">
                    <select id="gallery-category-filter">${categoryOptions}</select>
                    <input type="text" id="gallery-search-filter" placeholder="Search mods...">
                    <button id="gallery-filter-button" class="btn-primary"><i class="fa fa-filter"></i> Filter</button>
                </div>
            `;
            const galleryItemsHtml = UI.renderGalleryItems(scripts, installedScripts);
            const content = document.getElementById('mod-manager-content');
            content.innerHTML = filterHtml + `<div id="mod-gallery-items">${galleryItemsHtml}</div>`;
            document.getElementById('gallery-filter-button').addEventListener('click', function(){
                const selectedCategory = document.getElementById('gallery-category-filter').value;
                const searchQuery = document.getElementById('gallery-search-filter').value.toLowerCase();
                const filteredScripts = UI.allScripts.filter(script => {
                    const matchesCategory = selectedCategory === 'all' || script.category === selectedCategory;
                    const matchesSearch = script.name.toLowerCase().includes(searchQuery) || (script.description && script.description.toLowerCase().includes(searchQuery));
                    return matchesCategory && matchesSearch;
                });
                const newGalleryHtml = UI.renderGalleryItems(filteredScripts, installedScripts);
                document.getElementById('mod-gallery-items').innerHTML = newGalleryHtml;
                UI.addGalleryEventListeners();
            });
            UI.addGalleryEventListeners();
        },

        // Generates the HTML for the gallery items based on a (possibly filtered) scripts list.
        renderGalleryItems: function(scripts, installedScripts) {
            let html = `<div class="mod-gallery">`;
            scripts.forEach(script => {
                const isInstalled = installedScripts.hasOwnProperty(script.id);
                let needsUpdate = false;
                if (isInstalled) {
                    needsUpdate = ScriptManager.needsUpdate(script.id);
                }
                let statusHtml = isInstalled
                    ? `<span class="mod-gallery-item-status" style="color:green;"><i class="fa fa-check"></i> Installed</span>`
                    : `<span class="mod-gallery-item-status" style="color:red;"><i class="fa fa-times"></i> Not Installed</span>`;
                if (isInstalled && needsUpdate) {
                    statusHtml += `<span class="mod-gallery-item-status" style="color:orange;"> (Update available: v${script.version})</span>`;
                }
                let buttonHtml = '';
                if (!isInstalled) {
                    buttonHtml = `<button class="btn-primary mod-install" data-script-id="${script.id}"><i class="fa fa-download"></i> Install</button>`;
                } else {
                    if (needsUpdate) {
                        buttonHtml = `<button class="btn-warning mod-update" data-script-id="${script.id}"><i class="fa fa-refresh"></i> Update</button>`;
                    }
                    buttonHtml += `<button class="btn-danger mod-uninstall" data-script-id="${script.id}"><i class="fa fa-trash"></i> Uninstall</button>
                                   <button class="btn-primary mod-settings" data-script-id="${script.id}"><i class="fa fa-cog"></i> Settings</button>`;
                }
                html += `
                    <div class="mod-gallery-item" data-script-id="${script.id}" data-category="${script.category}">
                        <div class="mod-gallery-item-image">
                            <img src="${script.image || 'https://via.placeholder.com/150x100?text=No+Image'}" alt="${script.name}">
                            ${isInstalled ? '<div class="installed-banner"><i class="fa fa-check"></i> Installed</div>' : ''}
                        </div>
                        <div class="mod-gallery-item-title">${script.name}</div>
                        <div class="mod-gallery-item-version">v${script.version}</div>
                        <div class="mod-gallery-item-status">${statusHtml}</div>
                        <div class="mod-gallery-item-actions">${buttonHtml}</div>
                    </div>
                `;
            });
            html += `</div>`;
            return html;
        },

        // Attaches event listeners for install, update, uninstall, and settings buttons in the gallery view.
        addGalleryEventListeners: function() {
            document.querySelectorAll('.mod-install').forEach(btn => {
                btn.addEventListener('click', function() {
                    const scriptId = this.dataset.scriptId;
                    this.textContent = 'Installing...';
                    this.disabled = true;
                    ScriptManager.installScript(scriptId)
                        .then(() => UI.switchTab('gallery'))
                        .catch(error => {
                            alert('Error installing mod: ' + error);
                            this.textContent = 'Install';
                            this.disabled = false;
                        });
                });
            });
            document.querySelectorAll('.mod-update').forEach(btn => {
                btn.addEventListener('click', function() {
                    const scriptId = this.dataset.scriptId;
                    this.textContent = 'Updating...';
                    this.disabled = true;
                    ScriptManager.installScript(scriptId)
                        .then(() => UI.switchTab('gallery'))
                        .catch(error => {
                            alert('Error updating mod: ' + error);
                            this.textContent = 'Update';
                            this.disabled = false;
                        });
                });
            });
            document.querySelectorAll('.mod-uninstall').forEach(btn => {
                btn.addEventListener('click', function() {
                    const scriptId = this.dataset.scriptId;
                    const modName = document.querySelector(`[data-script-id="${scriptId}"] .mod-gallery-item-title`)?.innerText || 'this mod';
                    if (confirm(`Are you sure you want to uninstall ${modName}?`)) {
                        ScriptManager.uninstallScript(scriptId);
                        UI.switchTab('gallery');
                    }
                });
            });
            document.querySelectorAll('.mod-settings').forEach(btn => {
                btn.addEventListener('click', function() {
                    const scriptId = this.dataset.scriptId;
                    const script = ScriptManager.manifest.scripts.find(s => s.id === scriptId);
                    if (script) {
                        UI.showModSettingsView(script);
                    }
                });
            });
        },

        showInstalledView: function() {
            const content = document.getElementById('mod-manager-content');
            content.innerHTML = '<p>Loading installed mods...</p>';
            ScriptManager.fetchManifest()
                .then(manifest => {
                    ScriptManager.manifest = manifest;
                    const installedScripts = Storage.getInstalledScripts();
                    let html = `<ul class="mod-list">`;
                    const installedIds = Object.keys(installedScripts);
                    if (installedIds.length === 0) {
                        html += '<li>No installed mods.</li>';
                    } else {
                        installedIds.forEach(scriptId => {
                            const installedData = installedScripts[scriptId];
                            const manifestScript = manifest.scripts.find(s => s.id === scriptId);
                            const needsUpdate = manifestScript ? ScriptManager.needsUpdate(scriptId) : false;
                            const displayName = installedData.name;
                            const displayVersion = installedData.version;
                            const author = manifestScript ? manifestScript.author : 'Unknown';
                            html += `<li class="mod-list-item" data-script-id="${scriptId}">
                                        <div class="mod-list-item-info">
                                            <p class="mod-list-item-title">
                                                ${displayName} <span class="mod-list-item-version">v${displayVersion}</span>
                                                ${needsUpdate && manifestScript ? `<span class="mod-list-item-version">(Update available: v${manifestScript.version})</span>` : ''}
                                            </p>
                                            <p class="mod-list-item-author">By ${author}</p>
                                        </div>
                                        <div class="mod-list-item-actions">`;
                            if (manifestScript && needsUpdate) {
                                html += `<button class="btn-warning mod-update" data-script-id="${scriptId}"><i class="fa fa-refresh"></i> Update</button>`;
                            }
                            html += `<button class="btn-danger mod-uninstall" data-script-id="${scriptId}"><i class="fa fa-trash"></i> Uninstall</button>
                                     <button class="btn-primary mod-settings" data-script-id="${scriptId}"><i class="fa fa-cog"></i> Settings</button>`;
                            html += `   </div>
                                    </li>`;
                        });
                    }
                    html += `</ul>`;
                    content.innerHTML = html;
                    UI.addInstalledEventListeners();
                })
                .catch(error => {
                    content.innerHTML = `<p>Error loading installed mods: ${error}</p>`;
                });
        },

        showGlobalSettingsView: function() {
            const content = document.getElementById('mod-manager-content');
            let settings = Storage.getGlobalSettings();
            if (!settings || Object.keys(settings).length === 0) {
                settings = {
                    theme: 'dark',
                    notifications: true,
                    itemsPerPage: 12
                };
                Storage.saveGlobalSettings(settings);
            }
            let html = `<div class="mod-settings">
                <h3><i class="fa fa-cog"></i> Global Settings</h3>
                <div class="mod-settings-content">
                    <div class="mod-setting-item">
                        <label for="global-theme">Theme (light/dark)</label>
                        <input type="text" id="global-theme" value="${settings.theme}">
                    </div>
                    <div class="mod-setting-item">
                        <label for="global-notifications">Enable Notifications</label>
                        <input type="checkbox" id="global-notifications" ${settings.notifications ? 'checked' : ''}>
                    </div>
                    <div class="mod-setting-item">
                        <label for="global-itemsPerPage">Items per Page</label>
                        <input type="number" id="global-itemsPerPage" value="${settings.itemsPerPage}">
                    </div>
                </div>
                <button id="save-global-settings" class="btn-primary" style="width:100%; margin-top:15px;"><i class="fa fa-save"></i> Save Global Settings</button>
            </div>`;
            content.innerHTML = html;
            document.getElementById('save-global-settings').addEventListener('click', function() {
                const newSettings = {
                    theme: document.getElementById('global-theme').value,
                    notifications: document.getElementById('global-notifications').checked,
                    itemsPerPage: parseInt(document.getElementById('global-itemsPerPage').value)
                };
                Storage.saveGlobalSettings(newSettings);
                alert('Global settings saved!');
            });
        },

        // Improved settings view for an individual mod.
        showModSettingsView: function(script) {
            const content = document.getElementById('mod-manager-content');
            let installedScripts = Storage.getInstalledScripts();
            let scriptData = installedScripts[script.id] || { settings: {} };
            let settings = {};
            if (script.settings && script.settings.length > 0) {
                script.settings.forEach(setting => {
                    settings[setting.id] = (scriptData.settings && scriptData.settings[setting.id] !== undefined)
                        ? scriptData.settings[setting.id]
                        : setting.default;
                });
            }
            let html = `<div class="mod-settings">
                <h3><i class="fa fa-cog"></i> Settings for ${script.name}</h3>
                <div class="mod-settings-content">`;
            if (script.settings && script.settings.length > 0) {
                script.settings.forEach(setting => {
                    const value = settings[setting.id];
                    html += `<div class="mod-setting-item">`;
                    if (setting.type === 'boolean') {
                        // Render a row with the toggle icon on the left and the label on the right.
                        html += `<div class="mod-setting-row" style="display: flex; align-items: center; gap: 10px;">
                                    <span id="mod-setting-${script.id}-${setting.id}" class="toggle-switch" data-value="${value}" style="cursor:pointer;">
                                        ${value ? '<i class="fa fa-toggle-on"></i>' : '<i class="fa fa-toggle-off"></i>'}
                                    </span>
                                    <label for="mod-setting-${script.id}-${setting.id}" style="margin:0;">${setting.label}</label>
                                 </div>`;
                    } else if (setting.type === 'number') {
                        html += `<label for="mod-setting-${script.id}-${setting.id}">${setting.label}</label>
                                 <input type="number" id="mod-setting-${script.id}-${setting.id}" value="${value}">`;
                    } else {
                        html += `<label for="mod-setting-${script.id}-${setting.id}">${setting.label}</label>
                                 <input type="text" id="mod-setting-${script.id}-${setting.id}" value="${value}">`;
                    }
                    html += `<small>${setting.description}</small>
                    </div>`;
                });
                html += `</div>
                <button id="save-mod-settings" class="btn-primary" data-script-id="${script.id}" style="width:100%; margin-top:15px;">
                    <i class="fa fa-save"></i> Save Settings
                </button>`;
            } else {
                html += `<p>No settings available for this mod.</p>`;
            }
            html += `<button id="back-to-installed" class="btn-secondary" style="width:100%; margin-top:15px;">
                        <i class="fa fa-arrow-left"></i> Back
                     </button>
            </div>`;
            content.innerHTML = html;
            // Add event listener to toggle boolean values.
            document.querySelectorAll('.toggle-switch').forEach(el => {
                el.addEventListener('click', function() {
                    let currentValue = this.getAttribute('data-value') === 'true';
                    let newValue = !currentValue;
                    this.setAttribute('data-value', newValue);
                    this.innerHTML = newValue ? '<i class="fa fa-toggle-on"></i>' : '<i class="fa fa-toggle-off"></i>';
                });
            });
            document.getElementById('save-mod-settings')?.addEventListener('click', function() {
                let newSettings = {};
                if (script.settings && script.settings.length > 0) {
                    script.settings.forEach(setting => {
                        let inputElem = document.getElementById(`mod-setting-${script.id}-${setting.id}`);
                        if (inputElem) {
                            if (setting.type === 'boolean') {
                                // Read the value from our toggle's data attribute.
                                newSettings[setting.id] = inputElem.getAttribute('data-value') === 'true';
                            } else if (setting.type === 'number') {
                                newSettings[setting.id] = parseFloat(inputElem.value);
                            } else {
                                newSettings[setting.id] = inputElem.value;
                            }
                        }
                    });
                }
                Storage.saveScriptSettings(script.id, newSettings);
                alert('Settings saved!');
                UI.switchTab('installed');
            });
            document.getElementById('back-to-installed').addEventListener('click', function() {
                UI.switchTab('installed');
            });
        },
        

        // Event listeners for the Installed view
        addInstalledEventListeners: function() {
            document.querySelectorAll('.mod-update').forEach(btn => {
                btn.addEventListener('click', function() {
                    const scriptId = this.dataset.scriptId;
                    this.textContent = 'Updating...';
                    this.disabled = true;
                    ScriptManager.installScript(scriptId)
                        .then(() => UI.switchTab('installed'))
                        .catch(error => {
                            alert('Error updating mod: ' + error);
                            this.textContent = 'Update';
                            this.disabled = false;
                        });
                });
            });
            document.querySelectorAll('.mod-uninstall').forEach(btn => {
                btn.addEventListener('click', function() {
                    const scriptId = this.dataset.scriptId;
                    const modName = document.querySelector(`[data-script-id="${scriptId}"] .mod-list-item-title`)?.innerText || 'this mod';
                    if (confirm(`Are you sure you want to uninstall ${modName}?`)) {
                        ScriptManager.uninstallScript(scriptId);
                        UI.switchTab('installed');
                    }
                });
            });
            document.querySelectorAll('.mod-settings').forEach(btn => {
                btn.addEventListener('click', function() {
                    const scriptId = this.dataset.scriptId;
                    const script = ScriptManager.manifest.scripts.find(s => s.id === scriptId);
                    if (script) {
                        UI.showModSettingsView(script);
                    }
                });
            });
        }
    };

    // ===== Main Initialization =====
    function init() {
        Storage.init();
        UI.addStyles();
        ExecutionFramework.init();
        ScriptManager.executeScripts();
        GM_registerMenuCommand('RPGHQ Userscript Manager', () => {
            UI.showModal();
        });
        // Optionally, add a button to your page (e.g., in a dropdown)
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                addUserscriptsButtonToDropdown();
            });
        } else {
            addUserscriptsButtonToDropdown();
        }
    }

    function addUserscriptsButtonToDropdown() {
        const profileDropdown = document.querySelector('.header-profile.dropdown-container .dropdown-contents[role="menu"]');
        if (!profileDropdown) return;
        const logoutButton = Array.from(profileDropdown.querySelectorAll('li')).find(li => {
            return li.textContent.trim().includes('Logout') ||
                   li.querySelector('a[title="Logout"]');
        });
        if (!logoutButton) return;
        const userscriptsButton = document.createElement('li');
        userscriptsButton.innerHTML = `
            <a href="#" title="Manage Userscripts" role="menuitem" style="font-size:0.9em;">
                <i class="fa fa-code fa-fw"></i><span> Userscripts</span>
            </a>
        `;
        logoutButton.parentNode.insertBefore(userscriptsButton, logoutButton);
        userscriptsButton.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            UI.showModal();
        });
    }

    init();
})();
