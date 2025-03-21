// ==UserScript==
// @name         RPGHQ Userscript Manager
// @namespace    https://rpghq.org/
// @version      2.0.0
// @description  A modern, centralized manager for RPGHQ userscripts
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
        DOCUMENT_START: 'document-start',     // Before DOM parsing begins
        DOCUMENT_READY: 'document-ready',     // Basic DOM available but before resources loaded
        DOCUMENT_LOADED: 'document-loaded',   // After page fully loaded
        DOCUMENT_IDLE: 'document-idle',       // After a short delay when page is idle
        CUSTOM_EVENT: 'custom-event'          // Execute on custom events
    };
    
    // ===== Storage Management =====
    const Storage = {
        // Storage version for future compatibility
        STORAGE_VERSION: 1,
        
        // Initialize storage with default structure
        init: function() {
            const data = this.getRawData();
            if (!data) {
                // Create initial storage structure
                const initialData = {
                    version: this.STORAGE_VERSION,
                    installedScripts: {},
                    lastUpdate: Date.now()
                };
                this.saveRawData(initialData);
                return initialData;
            }
            
            // Check if we need to upgrade storage structure in the future
            if (data.version < this.STORAGE_VERSION) {
                // Handle version upgrades here when needed
                data.version = this.STORAGE_VERSION;
                this.saveRawData(data);
            }
            
            return data;
        },
        
        // Get raw data from GM storage
        getRawData: function() {
            const data = GM_getValue(STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        },
        
        // Save raw data to GM storage
        saveRawData: function(data) {
            data.lastUpdate = Date.now();
            // Use pretty-printing for better readability (2-space indentation)
            GM_setValue(STORAGE_KEY, JSON.stringify(data, null, 2));
        },
        
        // Get all stored data, initializing if needed
        getData: function() {
            return this.getRawData() || this.init();
        },
        
        // Save all data
        saveData: function(data) {
            // Ensure we preserve the version
            const currentData = this.getData();
            data.version = currentData.version;
            this.saveRawData(data);
        },
        
        // Get script code storage key
        getScriptCodeKey: function(scriptId, scriptName) {
            // Use script name for better readability if provided
            // Clean the name to ensure it's a valid storage key
            const key = scriptName ? scriptName.replace(/[^a-zA-Z0-9_]/g, '_') : scriptId;
            // Use a shorter prefix for script code storage
            return `script_${key}`;
        },
        
        // Save script code separately
        saveScriptCode: function(scriptId, scriptName, code) {
            GM_setValue(this.getScriptCodeKey(scriptId, scriptName), code);
        },
        
        // Get script code
        getScriptCode: function(scriptId, scriptName) {
            return GM_getValue(this.getScriptCodeKey(scriptId, scriptName), '');
        },
        
        // Delete script code
        deleteScriptCode: function(scriptId, scriptName) {
            GM_deleteValue(this.getScriptCodeKey(scriptId, scriptName));
        },
        
        // Get installed scripts
        getInstalledScripts: function() {
            return this.getData().installedScripts || {};
        },
        
        // Save an installed script
        saveInstalledScript: function(scriptId, scriptData) {
            const data = this.getData();
            if (!data.installedScripts) {
                data.installedScripts = {};
            }
            
            // Store script name for better readability
            const scriptName = scriptData.name || scriptId;
            
            // Store script code separately
            if (scriptData.code) {
                this.saveScriptCode(scriptId, scriptName, scriptData.code);
                // Remove code from metadata to avoid storage issues
                delete scriptData.code;
            }
            
            // Add installation timestamp if it's a new installation
            if (!data.installedScripts[scriptId]) {
                scriptData.installedAt = Date.now();
            } else {
                // Preserve installation date if updating
                scriptData.installedAt = data.installedScripts[scriptId].installedAt;
                scriptData.updatedAt = Date.now();
            }
            
            // Store script name in metadata
            scriptData.name = scriptName;
            
            data.installedScripts[scriptId] = scriptData;
            this.saveData(data);
        },
        
        // Remove an installed script
        removeInstalledScript: function(scriptId) {
            const data = this.getData();
            if (data.installedScripts && data.installedScripts[scriptId]) {
                const scriptName = data.installedScripts[scriptId].name || scriptId;
                delete data.installedScripts[scriptId];
                this.deleteScriptCode(scriptId, scriptName);
                this.saveData(data);
                return true;
            }
            return false;
        },
        
        // Get script settings
        getScriptSettings: function(scriptId) {
            const installedScripts = this.getInstalledScripts();
            return (installedScripts[scriptId] && installedScripts[scriptId].settings) || {};
        },
        
        // Save script settings
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
        
        // Get last update time
        getLastUpdateTime: function() {
            const data = this.getData();
            return data.lastUpdate || 0;
        },
        
        // Clear all data (for debugging/reset)
        clearAll: function() {
            GM_deleteValue(STORAGE_KEY);
            return this.init();
        }
    };
    
    // ===== Execution Framework =====
    const ExecutionFramework = {
        // Queue for each execution phase
        queues: {
            [ExecutionPhase.DOCUMENT_START]: [],
            [ExecutionPhase.DOCUMENT_READY]: [],
            [ExecutionPhase.DOCUMENT_LOADED]: [],
            [ExecutionPhase.DOCUMENT_IDLE]: [],
            [ExecutionPhase.CUSTOM_EVENT]: {}
        },
        
        // Register a script for execution at a specific phase
        register: function(phase, scriptId, scriptData, callback) {
            if (phase === ExecutionPhase.CUSTOM_EVENT) {
                // For custom events, we need an event name
                if (!scriptData.eventName) {
                    console.error(`Cannot register script ${scriptId} for custom event without an event name`);
                    return false;
                }
                
                // Initialize the event queue if it doesn't exist
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
        
        // Execute all scripts for a specific phase
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
        
        // Trigger a custom event
        triggerEvent: function(eventName, data = {}) {
            this.execute(ExecutionPhase.CUSTOM_EVENT, eventName, data);
        },
        
        // Initialize the execution framework
        init: function() {
            // Set up event listeners for different phases
            
            // Document ready (DOMContentLoaded)
            document.addEventListener('DOMContentLoaded', () => {
                this.execute(ExecutionPhase.DOCUMENT_READY);
            });
            
            // Document loaded (load)
            window.addEventListener('load', () => {
                this.execute(ExecutionPhase.DOCUMENT_LOADED);
                
                // Execute idle phase after a short delay
                setTimeout(() => {
                    this.execute(ExecutionPhase.DOCUMENT_IDLE);
                }, 500);
            });
            
            // Execute document-start phase immediately
            this.execute(ExecutionPhase.DOCUMENT_START);
        }
    };
    
    // ===== Script Management =====
    const ScriptManager = {
        manifest: null,
        
        // Fetch the manifest from GitHub
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
        
        // Fetch a script by ID
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
        
        // Get script info from manifest by ID
        getScriptInfoById: function(scriptId) {
            if (!this.manifest || !this.manifest.scripts) return null;
            return this.manifest.scripts.find(script => script.id === scriptId);
        },
        
        // Check if a script needs update
        needsUpdate: function(scriptId) {
            const installedScripts = Storage.getInstalledScripts();
            const scriptInfo = this.getScriptInfoById(scriptId);
            
            if (!scriptInfo || !installedScripts[scriptId]) return false;
            
            const installedVersion = installedScripts[scriptId].version;
            const manifestVersion = scriptInfo.version;
            
            return this.compareVersions(manifestVersion, installedVersion) > 0;
        },
        
        // Compare two version strings (returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal)
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
        
        // Install or update a script
        installScript: function(scriptId) {
            return new Promise((resolve, reject) => {
                const scriptInfo = this.getScriptInfoById(scriptId);
                if (!scriptInfo) {
                    reject('Script not found in manifest: ' + scriptId);
                    return;
                }
                
                this.fetchScript(scriptId)
                    .then(scriptCode => {
                        // Prepare default settings
                        const settings = {};
                        if (scriptInfo.settings) {
                            scriptInfo.settings.forEach(setting => {
                                settings[setting.id] = setting.default;
                            });
                        }
                        
                        // Save script data with name from manifest
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
        
        // Uninstall a script
        uninstallScript: function(scriptId) {
            return Storage.removeInstalledScript(scriptId);
        },
        
        // Execute all enabled scripts
        executeScripts: function() {
            const installedScripts = Storage.getInstalledScripts();
            
            Object.keys(installedScripts).forEach(scriptId => {
                const scriptData = installedScripts[scriptId];
                if (scriptData.enabled) {
                    this.executeScript(scriptId, scriptData);
                }
            });
        },
        
        // Execute a single script
        executeScript: function(scriptId, scriptData) {
            try {
                // Get the script name for better readability in logs
                const scriptName = scriptData.name || scriptId;
                
                // Get the script code from storage
                const code = Storage.getScriptCode(scriptId, scriptName);
                if (!code) {
                    console.error(`Script code not found for ${scriptName} (${scriptId})`);
                    return;
                }
                
                // Determine execution phase from script metadata or default to DOCUMENT_READY
                const executionPhase = scriptData.executionPhase || ExecutionPhase.DOCUMENT_READY;
                
                // Create the execution function
                const executeFunction = (id, data) => {
                    try {
                        // Create a global settings object for the script to access
                        const scriptCode = `
                            var scriptSettings = ${JSON.stringify(data.settings || {})};
                            ${code}
                        `;
                        
                        // Create a script element and execute it
                        const scriptElement = document.createElement('script');
                        scriptElement.textContent = scriptCode;
                        document.head.appendChild(scriptElement);
                        document.head.removeChild(scriptElement);
                        
                        console.log(`Executed script: ${scriptName} v${data.version} at phase ${executionPhase}`);
                    } catch (e) {
                        console.error(`Error executing script ${data.name || id}:`, e);
                    }
                };
                
                // Register the script with the execution framework
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
        // Add styles to the page
        addStyles: function() {
            GM_addStyle(`
                /* Variables */
                :root {
                    --rpghq-primary: #2196F3;
                    --rpghq-primary-dark: #1976D2;
                    --rpghq-primary-light: #BBDEFB;
                    --rpghq-accent: #FF4081;
                    --rpghq-text-primary: #FFFFFF;
                    --rpghq-text-secondary: #B0BEC5;
                    --rpghq-bg-dark: #1E1E1E;
                    --rpghq-bg-card: #2D2D2D;
                    --rpghq-border: #444444;
                    --rpghq-success: #4CAF50;
                    --rpghq-warning: #FFC107;
                    --rpghq-danger: #F44336;
                    --rpghq-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
                    --rpghq-transition: all 0.3s ease;
                }
                
                /* Modal styles */
                .rpghq-userscript-modal {
                    display: none;
                    position: fixed;
                    z-index: 1000;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    background-color: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(3px);
                    transition: var(--rpghq-transition);
                }
                
                .rpghq-userscript-modal-content {
                    background-color: var(--rpghq-bg-dark);
                    margin: 2% auto;
                    padding: 25px;
                    border: 1px solid var(--rpghq-border);
                    width: 85%;
                    max-width: 900px;
                    max-height: 90vh;
                    border-radius: 8px;
                    box-shadow: var(--rpghq-shadow);
                    color: var(--rpghq-text-primary);
                    display: flex;
                    flex-direction: column;
                    animation: modalFadeIn 0.3s ease;
                    overflow: hidden;
                }
                
                @keyframes modalFadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .rpghq-userscript-close {
                    color: var(--rpghq-text-secondary);
                    float: right;
                    font-size: 28px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: var(--rpghq-transition);
                }
                
                .rpghq-userscript-close:hover,
                .rpghq-userscript-close:focus {
                    color: var(--rpghq-text-primary);
                    text-decoration: none;
                    transform: scale(1.1);
                }
                
                .rpghq-userscript-header {
                    padding-bottom: 15px;
                    margin-bottom: 20px;
                    border-bottom: 1px solid var(--rpghq-border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .rpghq-userscript-title {
                    margin: 0;
                    font-size: 1.8em;
                    color: var(--rpghq-text-primary);
                    font-weight: 300;
                }
                
                /* Script list container */
                .rpghq-userscript-modal-content {
                    display: flex;
                    flex-direction: column;
                }
                
                #rpghq-userscript-loading {
                    padding: 20px;
                    text-align: center;
                    color: var(--rpghq-text-secondary);
                    font-size: 1.1em;
                }
                
                /* Scrollable list container */
                .rpghq-userscript-list-container {
                    flex: 1;
                    overflow-y: auto;
                    max-height: calc(90vh - 120px);
                    margin: 0 -10px;
                    padding: 0 10px;
                    scrollbar-width: thin;
                    scrollbar-color: var(--rpghq-border) transparent;
                }
                
                .rpghq-userscript-list-container::-webkit-scrollbar {
                    width: 8px;
                }
                
                .rpghq-userscript-list-container::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                .rpghq-userscript-list-container::-webkit-scrollbar-thumb {
                    background-color: var(--rpghq-border);
                    border-radius: 4px;
                }
                
                .rpghq-userscript-list-container::-webkit-scrollbar-thumb:hover {
                    background-color: #555;
                }
                
                /* Script list styles */
                .rpghq-userscript-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .rpghq-userscript-item {
                    padding: 18px;
                    margin-bottom: 15px;
                    background-color: var(--rpghq-bg-card);
                    border: 1px solid var(--rpghq-border);
                    border-radius: 8px;
                    box-shadow: var(--rpghq-shadow);
                    transition: var(--rpghq-transition);
                }
                
                .rpghq-userscript-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
                }
                
                .rpghq-userscript-item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                
                .rpghq-userscript-item-title {
                    font-weight: 500;
                    font-size: 1.2em;
                    margin: 0;
                    color: var(--rpghq-text-primary);
                    display: flex;
                    align-items: center;
                }
                
                .rpghq-userscript-item-version {
                    font-size: 0.85em;
                    color: var(--rpghq-text-secondary);
                    margin-left: 10px;
                    opacity: 0.8;
                }
                
                .rpghq-userscript-item-description {
                    margin: 12px 0;
                    color: var(--rpghq-text-secondary);
                    line-height: 1.5;
                }
                
                .rpghq-userscript-item-author {
                    font-size: 0.9em;
                    color: var(--rpghq-text-secondary);
                    opacity: 0.8;
                }
                
                .rpghq-userscript-item-actions {
                    margin-top: 10px;
                }
                
                /* Button styles */
                .rpghq-userscript-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px 16px;
                    margin-right: 8px;
                    margin-bottom: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    line-height: 1.4;
                    text-align: center;
                    white-space: nowrap;
                    vertical-align: middle;
                    cursor: pointer;
                    border: none;
                    border-radius: 6px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    transition: all 0.2s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                .rpghq-userscript-btn:after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 5px;
                    height: 5px;
                    background: rgba(255, 255, 255, 0.5);
                    opacity: 0;
                    border-radius: 100%;
                    transform: scale(1, 1) translate(-50%);
                    transform-origin: 50% 50%;
                }
                
                .rpghq-userscript-btn:focus:not(:active)::after {
                    animation: ripple 1s ease-out;
                }
                
                @keyframes ripple {
                    0% {
                        transform: scale(0, 0);
                        opacity: 0.5;
                    }
                    20% {
                        transform: scale(25, 25);
                        opacity: 0.3;
                    }
                    100% {
                        opacity: 0;
                        transform: scale(40, 40);
                    }
                }
                
                .rpghq-userscript-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                }
                
                .rpghq-userscript-btn:active {
                    transform: translateY(1px);
                    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
                }
                
                .rpghq-userscript-btn-primary {
                    color: #fff;
                    background-color: var(--rpghq-primary);
                }
                
                .rpghq-userscript-btn-primary:hover {
                    background-color: var(--rpghq-primary-dark);
                }
                
                .rpghq-userscript-btn-danger {
                    color: #fff;
                    background-color: var(--rpghq-danger);
                }
                
                .rpghq-userscript-btn-danger:hover {
                    background-color: #d32f2f;
                }
                
                .rpghq-userscript-btn-success {
                    color: #fff;
                    background-color: var(--rpghq-success);
                }
                
                .rpghq-userscript-btn-success:hover {
                    background-color: #388e3c;
                }
                
                .rpghq-userscript-btn-warning {
                    color: #fff;
                    background-color: var(--rpghq-warning);
                }
                
                .rpghq-userscript-btn-warning:hover {
                    background-color: #ffa000;
                }
                
                /* Settings styles */
                .rpghq-userscript-settings {
                    margin-top: 18px;
                    padding: 18px;
                    border-top: 1px solid var(--rpghq-border);
                    background-color: rgba(0, 0, 0, 0.2);
                    border-radius: 6px;
                    display: none;
                    animation: settingsFadeIn 0.3s ease;
                }
                
                @keyframes settingsFadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .rpghq-userscript-settings-title {
                    font-weight: 500;
                    font-size: 1.1em;
                    margin-bottom: 15px;
                    color: var(--rpghq-text-primary);
                    display: flex;
                    align-items: center;
                }
                
                .rpghq-userscript-settings-title:before {
                    content: "⚙️";
                    margin-right: 8px;
                    font-size: 1.1em;
                }
                
                .rpghq-userscript-setting {
                    margin-bottom: 16px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .rpghq-userscript-setting:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                    padding-bottom: 0;
                }
                
                .rpghq-userscript-setting label {
                    display: block;
                    margin-bottom: 6px;
                    font-weight: 500;
                    color: var(--rpghq-text-primary);
                }
                
                .rpghq-userscript-setting-description {
                    font-size: 0.9em;
                    color: var(--rpghq-text-secondary);
                    margin-bottom: 10px;
                    line-height: 1.4;
                }
                
                /* Toggle switch */
                .rpghq-userscript-switch {
                    position: relative;
                    display: inline-block;
                    width: 60px;
                    height: 34px;
                }
                
                .rpghq-userscript-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                
                .rpghq-userscript-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: .4s;
                    border-radius: 34px;
                }
                
                .rpghq-userscript-slider:before {
                    position: absolute;
                    content: "";
                    height: 26px;
                    width: 26px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                }
                
                input:checked + .rpghq-userscript-slider {
                    background-color: #2196F3;
                }
                
                input:focus + .rpghq-userscript-slider {
                    box-shadow: 0 0 1px #2196F3;
                }
                
                input:checked + .rpghq-userscript-slider:before {
                    transform: translateX(26px);
                }
                
                /* Status indicator */
                .rpghq-userscript-status {
                    display: inline-block;
                    padding: 3px 6px;
                    border-radius: 3px;
                    font-size: 0.8em;
                    margin-left: 5px;
                }
                
                .rpghq-userscript-status-installed {
                    background-color: #2a5934;
                    color: #a3e8b2;
                }
                
                .rpghq-userscript-status-update {
                    background-color: #5c4a1a;
                    color: #f8e9b0;
                }
                
                /* Input styles for dark mode */
                .rpghq-userscript-setting input[type="text"],
                .rpghq-userscript-setting input[type="number"] {
                    background-color: #444;
                    border: 1px solid #555;
                    color: #eee;
                    padding: 5px;
                    border-radius: 3px;
                }
                
                .rpghq-userscript-setting input[type="text"]:focus,
                .rpghq-userscript-setting input[type="number"]:focus {
                    outline: none;
                    border-color: #2196F3;
                    box-shadow: 0 0 3px rgba(33, 150, 243, 0.5);
                }
                
                /* Loading text color */
                #rpghq-userscript-loading {
                    color: #ccc;
                }
            `);
        },
        
        // Add the Userscripts button to the dropdown menu
        addUserscriptsButton: function() {
            // Try to find the dropdown menu in the user profile dropdown
            const profileDropdown = document.querySelector('.header-profile.dropdown-container .dropdown-contents[role="menu"]');
            if (!profileDropdown) return false;
            
            // Find the logout button to use as a reference point
            const logoutButton = Array.from(profileDropdown.querySelectorAll('li')).find(li => {
                return li.textContent.trim().includes('Logout') || 
                       li.querySelector('a[title="Logout"]');
            });
            
            if (!logoutButton) return false;
            
            // Create the Userscripts button
            const userscriptsButton = document.createElement('li');
            userscriptsButton.innerHTML = `
                <a href="#" title="Manage Userscripts" role="menuitem">
                    <i class="icon fa-code fa-fw" aria-hidden="true"></i><span>Userscripts</span>
                </a>
            `;
            
            // Insert before the logout button
            logoutButton.parentNode.insertBefore(userscriptsButton, logoutButton);
            
            // Add click event
            userscriptsButton.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                this.showUserscriptsModal();
            });
            
            return true;
        },
        
        // Create and show the userscripts modal
        showUserscriptsModal: function() {
            // Create modal if it doesn't exist
            let modal = document.getElementById('rpghq-userscript-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'rpghq-userscript-modal';
                modal.className = 'rpghq-userscript-modal';
                modal.innerHTML = `
                    <div class="rpghq-userscript-modal-content">
                        <div class="rpghq-userscript-header">
                            <h2 class="rpghq-userscript-title">RPGHQ Userscript Manager</h2>
                            <span class="rpghq-userscript-close">&times;</span>
                        </div>
                        <div id="rpghq-userscript-loading">Loading scripts...</div>
                        <div class="rpghq-userscript-list-container">
                            <ul id="rpghq-userscript-list" class="rpghq-userscript-list"></ul>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
                
                // Close button event
                modal.querySelector('.rpghq-userscript-close').addEventListener('click', () => {
                    modal.style.display = 'none';
                });
                
                // Close when clicking outside the modal
                window.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.style.display = 'none';
                    }
                });
                
                // Close on Escape key
                window.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && modal.style.display === 'block') {
                        modal.style.display = 'none';
                    }
                });
            }
            
            // Show the modal with animation
            modal.style.display = 'block';
            
            // Load scripts
            this.loadScripts();
        },
        
        // Load scripts into the modal
        loadScripts: function() {
            const loadingElement = document.getElementById('rpghq-userscript-loading');
            const scriptListElement = document.getElementById('rpghq-userscript-list');
            
            if (!loadingElement || !scriptListElement) return;
            
            loadingElement.style.display = 'block';
            scriptListElement.innerHTML = '';
            
            ScriptManager.fetchManifest()
                .then(manifest => {
                    ScriptManager.manifest = manifest;
                    loadingElement.style.display = 'none';
                    
                    if (!manifest.scripts || manifest.scripts.length === 0) {
                        scriptListElement.innerHTML = '<p>No scripts available.</p>';
                        return;
                    }
                    
                    const installedScripts = Storage.getInstalledScripts();
                    
                    manifest.scripts.forEach(script => {
                        const isInstalled = !!installedScripts[script.id];
                        const needsUpdate = isInstalled && ScriptManager.needsUpdate(script.id);
                        const scriptData = isInstalled ? installedScripts[script.id] : null;
                        
                        const scriptElement = document.createElement('li');
                        scriptElement.className = 'rpghq-userscript-item';
                        scriptElement.dataset.scriptId = script.id;
                        
                        let statusHtml = '';
                        if (isInstalled) {
                            if (needsUpdate) {
                                statusHtml = `<span class="rpghq-userscript-status rpghq-userscript-status-update">Update Available</span>`;
                            } else {
                                statusHtml = `<span class="rpghq-userscript-status rpghq-userscript-status-installed">Installed</span>`;
                            }
                        }
                        
                        scriptElement.innerHTML = `
                            <div class="rpghq-userscript-item-header">
                                <h3 class="rpghq-userscript-item-title">
                                    ${script.name}
                                    <span class="rpghq-userscript-item-version">v${script.version}</span>
                                    ${statusHtml}
                                </h3>
                            </div>
                            <div class="rpghq-userscript-item-description">${script.description}</div>
                            <div class="rpghq-userscript-item-author">By ${script.author}</div>
                            <div class="rpghq-userscript-item-actions">
                                ${this.getScriptActionButtons(script, isInstalled, needsUpdate, scriptData)}
                            </div>
                            ${this.getScriptSettingsHtml(script, scriptData)}
                        `;
                        
                        scriptListElement.appendChild(scriptElement);
                        
                        // Add event listeners for buttons
                        this.addScriptEventListeners(scriptElement, script);
                    });
                })
                .catch(error => {
                    loadingElement.style.display = 'none';
                    scriptListElement.innerHTML = `<p>Error loading scripts: ${error}</p>`;
                });
        },
        
        // Get HTML for script action buttons
        getScriptActionButtons: function(script, isInstalled, needsUpdate, scriptData) {
            if (!isInstalled) {
                return `<button class="rpghq-userscript-btn rpghq-userscript-btn-primary rpghq-userscript-install" data-script-id="${script.id}">Install</button>`;
            }
            
            const enabledClass = scriptData.enabled ? 'rpghq-userscript-btn-danger' : 'rpghq-userscript-btn-success';
            const enabledText = scriptData.enabled ? 'Disable' : 'Enable';
            
            let html = `
                <button class="rpghq-userscript-btn ${enabledClass} rpghq-userscript-toggle" data-script-id="${script.id}" data-enabled="${scriptData.enabled}">${enabledText}</button>
                <button class="rpghq-userscript-btn rpghq-userscript-btn-danger rpghq-userscript-uninstall" data-script-id="${script.id}">Uninstall</button>
            `;
            
            if (needsUpdate) {
                html = `<button class="rpghq-userscript-btn rpghq-userscript-btn-warning rpghq-userscript-update" data-script-id="${script.id}">Update</button>` + html;
            }
            
            if (script.settings && script.settings.length > 0) {
                html += `<button class="rpghq-userscript-btn rpghq-userscript-btn-primary rpghq-userscript-settings-toggle" data-script-id="${script.id}">Settings</button>`;
            }
            
            return html;
        },
        
        // Get HTML for script settings
        getScriptSettingsHtml: function(script, scriptData) {
            if (!script.settings || script.settings.length === 0) {
                return '';
            }
            
            const settings = scriptData ? scriptData.settings : {};
            
            let settingsHtml = `
                <div class="rpghq-userscript-settings" id="rpghq-userscript-settings-${script.id}">
                    <div class="rpghq-userscript-settings-title">Settings</div>
            `;
            
            script.settings.forEach(setting => {
                const value = settings[setting.id] !== undefined ? settings[setting.id] : setting.default;
                
                settingsHtml += `
                    <div class="rpghq-userscript-setting">
                        <label for="rpghq-setting-${script.id}-${setting.id}">${setting.label}</label>
                        <div class="rpghq-userscript-setting-description">${setting.description}</div>
                `;
                
                if (setting.type === 'boolean') {
                    settingsHtml += `
                        <label class="rpghq-userscript-switch">
                            <input type="checkbox" id="rpghq-setting-${script.id}-${setting.id}" 
                                data-script-id="${script.id}" 
                                data-setting-id="${setting.id}" 
                                data-setting-type="${setting.type}" 
                                ${value ? 'checked' : ''}>
                            <span class="rpghq-userscript-slider"></span>
                        </label>
                    `;
                } else if (setting.type === 'number') {
                    settingsHtml += `
                        <input type="number" id="rpghq-setting-${script.id}-${setting.id}" 
                            data-script-id="${script.id}" 
                            data-setting-id="${setting.id}" 
                            data-setting-type="${setting.type}" 
                            value="${value}">
                    `;
                } else {
                    settingsHtml += `
                        <input type="text" id="rpghq-setting-${script.id}-${setting.id}" 
                            data-script-id="${script.id}" 
                            data-setting-id="${setting.id}" 
                            data-setting-type="${setting.type}" 
                            value="${value}">
                    `;
                }
                
                settingsHtml += `</div>`;
            });
            
            settingsHtml += `
                <div class="rpghq-userscript-item-actions">
                    <button class="rpghq-userscript-btn rpghq-userscript-btn-primary rpghq-userscript-save-settings" data-script-id="${script.id}">Save Settings</button>
                </div>
            `;
            
            settingsHtml += `</div>`;
            
            return settingsHtml;
        },
        
        // Add event listeners for script buttons
        addScriptEventListeners: function(scriptElement, script) {
            // Install button
            const installButton = scriptElement.querySelector('.rpghq-userscript-install');
            if (installButton) {
                installButton.addEventListener('click', () => {
                    installButton.textContent = 'Installing...';
                    installButton.disabled = true;
                    
                    ScriptManager.installScript(script.id)
                        .then(() => {
                            this.loadScripts(); // Reload the script list
                        })
                        .catch(error => {
                            alert('Error installing script: ' + error);
                            installButton.textContent = 'Install';
                            installButton.disabled = false;
                        });
                });
            }
            
            // Update button
            const updateButton = scriptElement.querySelector('.rpghq-userscript-update');
            if (updateButton) {
                updateButton.addEventListener('click', () => {
                    updateButton.textContent = 'Updating...';
                    updateButton.disabled = true;
                    
                    ScriptManager.installScript(script.id)
                        .then(() => {
                            this.loadScripts(); // Reload the script list
                        })
                        .catch(error => {
                            alert('Error updating script: ' + error);
                            updateButton.textContent = 'Update';
                            updateButton.disabled = false;
                        });
                });
            }
            
            // Uninstall button
            const uninstallButton = scriptElement.querySelector('.rpghq-userscript-uninstall');
            if (uninstallButton) {
                uninstallButton.addEventListener('click', () => {
                    if (confirm(`Are you sure you want to uninstall ${script.name}?`)) {
                        ScriptManager.uninstallScript(script.id);
                        this.loadScripts(); // Reload the script list
                    }
                });
            }
            
            // Toggle button
            const toggleButton = scriptElement.querySelector('.rpghq-userscript-toggle');
            if (toggleButton) {
                toggleButton.addEventListener('click', () => {
                    const enabled = toggleButton.dataset.enabled === 'true';
                    const installedScripts = Storage.getInstalledScripts();
                    
                    if (installedScripts[script.id]) {
                        installedScripts[script.id].enabled = !enabled;
                        Storage.saveData({ installedScripts });
                        this.loadScripts(); // Reload the script list
                    }
                });
            }
            
            // Settings toggle button
            const settingsToggleButton = scriptElement.querySelector('.rpghq-userscript-settings-toggle');
            if (settingsToggleButton) {
                settingsToggleButton.addEventListener('click', () => {
                    const settingsElement = document.getElementById(`rpghq-userscript-settings-${script.id}`);
                    if (settingsElement) {
                        const isVisible = settingsElement.style.display === 'block';
                        settingsElement.style.display = isVisible ? 'none' : 'block';
                        settingsToggleButton.textContent = isVisible ? 'Settings' : 'Hide Settings';
                    }
                });
            }
            
            // Save settings button
            const saveSettingsButton = scriptElement.querySelector('.rpghq-userscript-save-settings');
            if (saveSettingsButton) {
                saveSettingsButton.addEventListener('click', () => {
                    const settings = {};
                    const settingInputs = scriptElement.querySelectorAll('[data-setting-id]');
                    
                    settingInputs.forEach(input => {
                        const settingId = input.dataset.settingId;
                        const settingType = input.dataset.settingType;
                        
                        if (settingType === 'boolean') {
                            settings[settingId] = input.checked;
                        } else if (settingType === 'number') {
                            settings[settingId] = parseFloat(input.value);
                        } else {
                            settings[settingId] = input.value;
                        }
                    });
                    
                    Storage.saveScriptSettings(script.id, settings);
                    alert('Settings saved!');
                });
            }
        }
    };
    
    // ===== Main Initialization =====
    function init() {
        // Add styles
        UI.addStyles();
        
        // Initialize the execution framework
        ExecutionFramework.init();
        
        // Execute installed scripts
        ScriptManager.executeScripts();
        
        // Register menu command
        GM_registerMenuCommand('RPGHQ Userscript Manager', () => {
            UI.showUserscriptsModal();
        });
        
        // Add Userscripts button to dropdown menu when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                UI.addUserscriptsButton();
            });
        } else {
            UI.addUserscriptsButton();
        }
    }
    
    // Initialize immediately since we're running at document-start
    init();
})();
