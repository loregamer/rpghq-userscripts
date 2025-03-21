// ==UserScript==
// @name         RPGHQ Userscript Manager
// @namespace    https://rpghq.org/
// @version      2.3.2
// @description  A centralized manager for RPGHQ userscripts with a larger popup that blocks background scrolling, toggle buttons with Font Awesome icons, and displays the stored version along with update info. Script code is stored by ID and the storage data is saved in a compact format.
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

    // ===== Constants =====
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

        // Always use the script ID for storing code
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
            // Preserve the script's name from the manifest for display purposes
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
                :root {
                    --rpghq-primary: #2196F3;
                    --rpghq-primary-dark: #1976D2;
                    --rpghq-text-primary: #FFFFFF;
                    --rpghq-text-secondary: #B0BEC5;
                    --rpghq-bg-dark: #1E1E1E;
                    --rpghq-bg-card: #2D2D2D;
                    --rpghq-border: #444444;
                    --rpghq-success: #4CAF50;
                    --rpghq-warning: #FFC107;
                    --rpghq-danger: #F44336;
                }
                
                /* Bigger modal that blocks background scrolling */
                .rpghq-userscript-modal {
                    display: none;
                    position: fixed;
                    z-index: 1000;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.8);
                }
                
                .rpghq-userscript-modal-content {
                    background-color: var(--rpghq-bg-dark);
                    margin: 5% auto;
                    padding: 10px;
                    border: 1px solid var(--rpghq-border);
                    width: 600px;
                    max-height: 80vh;
                    border-radius: 4px;
                    color: var(--rpghq-text-primary);
                    display: flex;
                    flex-direction: column;
                    overflow: auto;
                }
                
                .rpghq-userscript-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                
                .rpghq-userscript-title {
                    margin: 0;
                    font-size: 1.4em;
                }
                
                .rpghq-userscript-back-button {
                    background: none;
                    border: none;
                    color: var(--rpghq-primary);
                    font-size: 1em;
                    cursor: pointer;
                    display: none;
                }
                
                .rpghq-userscript-close {
                    font-size: 1.4em;
                    cursor: pointer;
                }
                
                .rpghq-userscript-list-container {
                    overflow-y: auto;
                }
                
                .rpghq-userscript-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .rpghq-userscript-item {
                    display: flex;
                    align-items: center;
                    padding: 6px;
                    margin-bottom: 6px;
                    background-color: var(--rpghq-bg-card);
                    border: 1px solid var(--rpghq-border);
                    border-radius: 4px;
                    font-size: 0.9em;
                }
                
                .rpghq-userscript-item-info {
                    flex: 1;
                    padding-left: 6px;
                }
                
                .rpghq-userscript-item-title {
                    margin: 0;
                    font-weight: bold;
                }
                
                .rpghq-userscript-item-version {
                    font-size: 0.8em;
                    color: var(--rpghq-text-secondary);
                }
                
                .rpghq-userscript-status-update {
                    color: var(--rpghq-warning);
                    font-size: 0.8em;
                    margin-left: 4px;
                }
                
                .rpghq-userscript-item-actions button {
                    margin-left: 4px;
                    font-size: 0.8em;
                    padding: 2px 4px;
                    cursor: pointer;
                    border: none;
                    border-radius: 3px;
                }
                
                .rpghq-userscript-btn-primary {
                    background-color: var(--rpghq-primary);
                    color: #fff;
                }
                
                .rpghq-userscript-btn-danger {
                    background-color: var(--rpghq-danger);
                    color: #fff;
                }
                
                .rpghq-userscript-btn-warning {
                    background-color: var(--rpghq-warning);
                    color: #fff;
                }
                
                /* Toggle button using Font Awesome icons */
                .rpghq-userscript-toggle {
                    border: none;
                    background: none;
                    cursor: pointer;
                    padding: 0;
                }
            `);
        },

        showUserscriptsModal: function() {
            let modal = document.getElementById('rpghq-userscript-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'rpghq-userscript-modal';
                modal.className = 'rpghq-userscript-modal';
                modal.innerHTML = `
                    <div class="rpghq-userscript-modal-content">
                        <div class="rpghq-userscript-header">
                            <button id="rpghq-back-button" class="rpghq-userscript-back-button">←</button>
                            <h2 class="rpghq-userscript-title">Userscripts</h2>
                            <span class="rpghq-userscript-close">&times;</span>
                        </div>
                        <div id="rpghq-userscript-content"></div>
                    </div>
                `;
                document.body.appendChild(modal);
                modal.querySelector('.rpghq-userscript-close').addEventListener('click', () => {
                    UI.hideModal();
                });
                window.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        UI.hideModal();
                    }
                });
                document.getElementById('rpghq-back-button').addEventListener('click', () => {
                    UI.showListView();
                });
            }
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            UI.showListView();
        },

        hideModal: function() {
            const modal = document.getElementById('rpghq-userscript-modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        },

        showListView: function() {
            const content = document.getElementById('rpghq-userscript-content');
            const backButton = document.getElementById('rpghq-back-button');
            backButton.style.display = 'none';
            content.innerHTML = `<div id="rpghq-userscript-loading">Loading scripts...</div>`;
            ScriptManager.fetchManifest()
                .then(manifest => {
                    ScriptManager.manifest = manifest;
                    const installedScripts = Storage.getInstalledScripts();
                    let html = `<div class="rpghq-userscript-list-container">
                        <ul class="rpghq-userscript-list">`;
                    if (!manifest.scripts || manifest.scripts.length === 0) {
                        html += '<li>No scripts available.</li>';
                    } else {
                        manifest.scripts.forEach(script => {
                            const isInstalled = !!installedScripts[script.id];
                            const needsUpdate = isInstalled && ScriptManager.needsUpdate(script.id);
                            const scriptData = isInstalled ? installedScripts[script.id] : null;
                            // Use stored name and version if installed; otherwise use manifest values.
                            const displayName = isInstalled ? scriptData.name : script.name;
                            const displayVersion = isInstalled ? scriptData.version : script.version;
                            
                            html += `<li class="rpghq-userscript-item" data-script-id="${script.id}">
                                <button class="rpghq-userscript-toggle" data-script-id="${script.id}">
                                    <i class="${isInstalled && scriptData.enabled ? 'icon fa-toggle-on fa-fw' : 'icon fa-toggle-off fa-fw'}"></i>
                                </button>
                                <div class="rpghq-userscript-item-info">
                                    <p class="rpghq-userscript-item-title">
                                        ${displayName} <span class="rpghq-userscript-item-version">v${displayVersion}</span>
                                        ${needsUpdate ? `<span class="rpghq-userscript-status-update">(Update: v${script.version} available)</span>` : ''}
                                    </p>
                                    <p class="rpghq-userscript-item-author">By ${script.author}</p>
                                </div>
                                <div class="rpghq-userscript-item-actions">`;
                            if (!isInstalled) {
                                html += `<button class="rpghq-userscript-btn-primary rpghq-userscript-install" data-script-id="${script.id}">Install</button>`;
                            } else {
                                if (needsUpdate) {
                                    html += `<button class="rpghq-userscript-btn-warning rpghq-userscript-update" data-script-id="${script.id}">Update</button>`;
                                }
                                html += `<button class="rpghq-userscript-btn-danger rpghq-userscript-uninstall" data-script-id="${script.id}">Uninstall</button>
                                         <button class="rpghq-userscript-btn-primary rpghq-userscript-settings" data-script-id="${script.id}">Settings</button>`;
                            }
                            html += `   </div>
                            </li>`;
                        });
                    }
                    html += `</ul></div>`;
                    content.innerHTML = html;
                    UI.addListEventListeners();
                })
                .catch(error => {
                    document.getElementById('rpghq-userscript-loading').innerHTML = `Error loading scripts: ${error}`;
                });
        },

        addListEventListeners: function() {
            document.querySelectorAll('.rpghq-userscript-install').forEach(btn => {
                btn.addEventListener('click', function() {
                    const scriptId = this.dataset.scriptId;
                    this.textContent = 'Installing...';
                    this.disabled = true;
                    ScriptManager.installScript(scriptId)
                        .then(() => UI.showListView())
                        .catch(error => {
                            alert('Error installing script: ' + error);
                            this.textContent = 'Install';
                            this.disabled = false;
                        });
                });
            });
            document.querySelectorAll('.rpghq-userscript-update').forEach(btn => {
                btn.addEventListener('click', function() {
                    const scriptId = this.dataset.scriptId;
                    this.textContent = 'Updating...';
                    this.disabled = true;
                    ScriptManager.installScript(scriptId)
                        .then(() => UI.showListView())
                        .catch(error => {
                            alert('Error updating script: ' + error);
                            this.textContent = 'Update';
                            this.disabled = false;
                        });
                });
            });
            document.querySelectorAll('.rpghq-userscript-uninstall').forEach(btn => {
                btn.addEventListener('click', function() {
                    const scriptId = this.dataset.scriptId;
                    const scriptName = document.querySelector(`li[data-script-id="${scriptId}"] .rpghq-userscript-item-title`).innerText;
                    if (confirm(`Are you sure you want to uninstall ${scriptName}?`)) {
                        ScriptManager.uninstallScript(scriptId);
                        UI.showListView();
                    }
                });
            });
            document.querySelectorAll('.rpghq-userscript-toggle').forEach(btn => {
                btn.addEventListener('click', function() {
                    const scriptId = this.dataset.scriptId;
                    let installedScripts = Storage.getInstalledScripts();
                    if (installedScripts[scriptId]) {
                        installedScripts[scriptId].enabled = !installedScripts[scriptId].enabled;
                        Storage.saveData({ installedScripts });
                        UI.showListView();
                    }
                });
            });
            document.querySelectorAll('.rpghq-userscript-settings').forEach(btn => {
                btn.addEventListener('click', function() {
                    const scriptId = this.dataset.scriptId;
                    const script = ScriptManager.manifest.scripts.find(s => s.id === scriptId);
                    if (script) {
                        UI.showSettingsView(script);
                    }
                });
            });
        },

        showSettingsView: function(script) {
            const content = document.getElementById('rpghq-userscript-content');
            document.getElementById('rpghq-back-button').style.display = 'inline-block';
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
            let html = `<div>
                <h3 style="font-size:1em; margin-bottom:4px;">Settings for ${script.name}</h3>`;
            if (script.settings && script.settings.length > 0) {
                script.settings.forEach(setting => {
                    const value = settings[setting.id];
                    html += `<div style="margin-bottom:6px;">
                        <label style="display:block; font-size:0.9em;">${setting.label}</label>`;
                    if (setting.type === 'boolean') {
                        html += `<input type="checkbox" id="rpghq-setting-${script.id}-${setting.id}" ${value ? 'checked' : ''}>`;
                    } else if (setting.type === 'number') {
                        html += `<input type="number" id="rpghq-setting-${script.id}-${setting.id}" value="${value}" style="width:100%;">`;
                    } else {
                        html += `<input type="text" id="rpghq-setting-${script.id}-${setting.id}" value="${value}" style="width:100%;">`;
                    }
                    html += `<small style="color: var(--rpghq-text-secondary); font-size:0.8em;">${setting.description}</small>
                    </div>`;
                });
                html += `<button id="rpghq-save-settings" class="rpghq-userscript-btn-primary" data-script-id="${script.id}" style="width:100%; padding:4px;">Save Settings</button>`;
            } else {
                html += `<p style="font-size:0.9em;">No settings available for this script.</p>`;
            }
            html += `</div>`;
            content.innerHTML = html;
            document.getElementById('rpghq-save-settings').addEventListener('click', function() {
                let newSettings = {};
                if (script.settings && script.settings.length > 0) {
                    script.settings.forEach(setting => {
                        let inputElem = document.getElementById(`rpghq-setting-${script.id}-${setting.id}`);
                        if (inputElem) {
                            if (setting.type === 'boolean') {
                                newSettings[setting.id] = inputElem.checked;
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
                UI.showListView();
            });
        }
    };

    // ===== Main Initialization =====
    function init() {
        UI.addStyles();
        ExecutionFramework.init();
        ScriptManager.executeScripts();
        GM_registerMenuCommand('RPGHQ Userscript Manager', () => {
            UI.showUserscriptsModal();
        });
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
                <i class="icon fa-code fa-fw" aria-hidden="true"></i><span>Userscripts</span>
            </a>
        `;
        logoutButton.parentNode.insertBefore(userscriptsButton, logoutButton);
        userscriptsButton.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            UI.showUserscriptsModal();
        });
    }
    
    init();
})();
