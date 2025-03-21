// ==UserScript==
// @name         RPGHQ Userscript Manager
// @namespace    https://rpgmaker.net/
// @version      1.0.0
// @description  A comprehensive userscript manager for RPGHQ with dark theme
// @author       You
// @match        https://rpgmaker.net/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_notification
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_setClipboard
// @grant        GM_openInTab
// @grant        unsafeWindow
// @connect      github.com
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function() {
    'use strict';

    // =========================================================
    // Constants and Configuration
    // =========================================================
    
    const CONFIG = {
        MANIFEST_URL: 'https://raw.githubusercontent.com/loregamer/rpghq-userscripts/main/manifest.json',
        UPDATE_CHECK_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        STORAGE_KEYS: {
            INSTALLED_SCRIPTS: 'rpghq_installed_scripts',
            PREFERENCES: 'rpghq_preferences',
            SCRIPT_SETTINGS_PREFIX: 'script_settings_'
        },
        DEFAULT_PREFERENCES: {
            checkFrequency: 'daily',
            batchUpdateEnabled: true,
            notifications: true,
            darkTheme: true
        }
    };

    // =========================================================
    // Utility Functions
    // =========================================================
    
    const Util = {
        /**
         * Compare two version strings
         * @param {string} v1 - First version
         * @param {string} v2 - Second version
         * @returns {number} - 1 if v1 > v2, -1 if v1 < v2, 0 if equal
         */
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
        
        /**
         * Format a date as a readable string
         * @param {Date|string} date - Date to format
         * @returns {string} - Formatted date string
         */
        formatDate: function(date) {
            if (typeof date === 'string') {
                date = new Date(date);
            }
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        },
        
        /**
         * Create a DOM element with attributes and children
         * @param {string} tag - Element tag name
         * @param {Object} attrs - Element attributes
         * @param {Array|string} children - Child elements or text content
         * @returns {HTMLElement} - Created element
         */
        createElement: function(tag, attrs = {}, children = []) {
            const element = document.createElement(tag);
            
            for (const [key, value] of Object.entries(attrs)) {
                if (key === 'style' && typeof value === 'object') {
                    Object.assign(element.style, value);
                } else if (key === 'className') {
                    element.className = value;
                } else if (key === 'dataset') {
                    Object.assign(element.dataset, value);
                } else if (key.startsWith('on') && typeof value === 'function') {
                    element.addEventListener(key.substring(2).toLowerCase(), value);
                } else {
                    element.setAttribute(key, value);
                }
            }
            
            if (typeof children === 'string') {
                element.textContent = children;
            } else if (Array.isArray(children)) {
                for (const child of children) {
                    if (child instanceof Node) {
                        element.appendChild(child);
                    } else if (typeof child === 'string') {
                        element.appendChild(document.createTextNode(child));
                    }
                }
            }
            
            return element;
        },
        
        /**
         * Debounce a function
         * @param {Function} func - Function to debounce
         * @param {number} wait - Debounce wait time in milliseconds
         * @returns {Function} - Debounced function
         */
        debounce: function(func, wait) {
            let timeout;
            return function(...args) {
                const context = this;
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(context, args), wait);
            };
        }
    };

    // =========================================================
    // Core Components
    // =========================================================
    
    /**
     * Script Registry - Manages the list of installed scripts
     */
    const ScriptRegistry = {
        /**
         * Get all installed scripts
         * @returns {Object} - Object with script IDs as keys and script data as values
         */
        getInstalledScripts: function() {
            const data = GM_getValue(CONFIG.STORAGE_KEYS.INSTALLED_SCRIPTS, { scripts: {}, lastUpdateCheck: null, preferences: CONFIG.DEFAULT_PREFERENCES });
            return data.scripts || {};
        },
        
        /**
         * Get a specific installed script
         * @param {string} scriptId - Script ID
         * @returns {Object|null} - Script data or null if not installed
         */
        getScript: function(scriptId) {
            const scripts = this.getInstalledScripts();
            return scripts[scriptId] || null;
        },
        
        /**
         * Check if a script is installed
         * @param {string} scriptId - Script ID
         * @returns {boolean} - True if installed, false otherwise
         */
        isInstalled: function(scriptId) {
            return this.getScript(scriptId) !== null;
        },
        
        /**
         * Add or update a script in the registry
         * @param {string} scriptId - Script ID
         * @param {Object} scriptData - Script data
         */
        updateScript: function(scriptId, scriptData) {
            const data = GM_getValue(CONFIG.STORAGE_KEYS.INSTALLED_SCRIPTS, { scripts: {}, lastUpdateCheck: null, preferences: CONFIG.DEFAULT_PREFERENCES });
            data.scripts[scriptId] = scriptData;
            GM_setValue(CONFIG.STORAGE_KEYS.INSTALLED_SCRIPTS, data);
        },
        
        /**
         * Remove a script from the registry
         * @param {string} scriptId - Script ID
         */
        removeScript: function(scriptId) {
            const data = GM_getValue(CONFIG.STORAGE_KEYS.INSTALLED_SCRIPTS, { scripts: {}, lastUpdateCheck: null, preferences: CONFIG.DEFAULT_PREFERENCES });
            delete data.scripts[scriptId];
            GM_setValue(CONFIG.STORAGE_KEYS.INSTALLED_SCRIPTS, data);
            
            // Also remove script settings
            GM_deleteValue(CONFIG.STORAGE_KEYS.SCRIPT_SETTINGS_PREFIX + scriptId);
        },
        
        /**
         * Enable or disable a script
         * @param {string} scriptId - Script ID
         * @param {boolean} enabled - Whether to enable or disable
         */
        setScriptEnabled: function(scriptId, enabled) {
            const script = this.getScript(scriptId);
            if (script) {
                script.enabled = enabled;
                this.updateScript(scriptId, script);
            }
        },
        
        /**
         * Check if a script is enabled
         * @param {string} scriptId - Script ID
         * @returns {boolean} - True if enabled, false otherwise
         */
        isScriptEnabled: function(scriptId) {
            const script = this.getScript(scriptId);
            return script ? script.enabled : false;
        },
        
        /**
         * Get user preferences
         * @returns {Object} - User preferences
         */
        getPreferences: function() {
            const data = GM_getValue(CONFIG.STORAGE_KEYS.INSTALLED_SCRIPTS, { scripts: {}, lastUpdateCheck: null, preferences: CONFIG.DEFAULT_PREFERENCES });
            return data.preferences || CONFIG.DEFAULT_PREFERENCES;
        },
        
        /**
         * Update user preferences
         * @param {Object} preferences - New preferences
         */
        updatePreferences: function(preferences) {
            const data = GM_getValue(CONFIG.STORAGE_KEYS.INSTALLED_SCRIPTS, { scripts: {}, lastUpdateCheck: null, preferences: CONFIG.DEFAULT_PREFERENCES });
            data.preferences = { ...data.preferences, ...preferences };
            GM_setValue(CONFIG.STORAGE_KEYS.INSTALLED_SCRIPTS, data);
        },
        
        /**
         * Update the last update check timestamp
         */
        updateLastCheckTime: function() {
            const data = GM_getValue(CONFIG.STORAGE_KEYS.INSTALLED_SCRIPTS, { scripts: {}, lastUpdateCheck: null, preferences: CONFIG.DEFAULT_PREFERENCES });
            data.lastUpdateCheck = new Date().toISOString();
            GM_setValue(CONFIG.STORAGE_KEYS.INSTALLED_SCRIPTS, data);
        },
        
        /**
         * Get the last update check timestamp
         * @returns {string|null} - ISO timestamp or null if never checked
         */
        getLastCheckTime: function() {
            const data = GM_getValue(CONFIG.STORAGE_KEYS.INSTALLED_SCRIPTS, { scripts: {}, lastUpdateCheck: null, preferences: CONFIG.DEFAULT_PREFERENCES });
            return data.lastUpdateCheck;
        }
    };
    
    /**
     * Version Manager - Handles version checking and updates
     */
    const VersionManager = {
        /**
         * Check if updates are available for installed scripts
         * @param {Object} manifest - Script manifest from server
         * @returns {Array} - Array of scripts with updates available
         */
        checkForUpdates: function(manifest) {
            const installedScripts = ScriptRegistry.getInstalledScripts();
            const updatesAvailable = [];
            
            for (const scriptId in installedScripts) {
                const installedScript = installedScripts[scriptId];
                const manifestScript = manifest.scripts.find(s => s.id === scriptId);
                
                if (manifestScript && Util.compareVersions(manifestScript.version, installedScript.version) > 0) {
                    updatesAvailable.push({
                        id: scriptId,
                        currentVersion: installedScript.version,
                        newVersion: manifestScript.version,
                        script: manifestScript
                    });
                }
            }
            
            return updatesAvailable;
        },
        
        /**
         * Schedule automatic update checks
         */
        scheduleUpdateChecks: function() {
            const preferences = ScriptRegistry.getPreferences();
            const lastCheck = ScriptRegistry.getLastCheckTime();
            
            if (!lastCheck || new Date() - new Date(lastCheck) > CONFIG.UPDATE_CHECK_INTERVAL) {
                this.performUpdateCheck();
            }
            
            // Schedule next check
            setTimeout(() => this.scheduleUpdateChecks(), CONFIG.UPDATE_CHECK_INTERVAL);
        },
        
        /**
         * Perform an update check
         * @returns {Promise<Array>} - Promise resolving to array of available updates
         */
        performUpdateCheck: async function() {
            try {
                const manifest = await APILayer.fetchManifest();
                const updates = this.checkForUpdates(manifest);
                
                ScriptRegistry.updateLastCheckTime();
                
                if (updates.length > 0 && ScriptRegistry.getPreferences().notifications) {
                    NotificationSystem.showUpdateNotification(updates);
                }
                
                return updates;
            } catch (error) {
                console.error('Error checking for updates:', error);
                return [];
            }
        }
    };
    
    /**
     * Settings Manager - Handles script settings
     */
    const SettingsManager = {
        /**
         * Get settings for a script
         * @param {string} scriptId - Script ID
         * @param {Array} defaultSettings - Default settings from manifest
         * @returns {Object} - Script settings
         */
        getScriptSettings: function(scriptId, defaultSettings = []) {
            const storedSettings = GM_getValue(CONFIG.STORAGE_KEYS.SCRIPT_SETTINGS_PREFIX + scriptId, {});
            const settings = {};
            
            // Apply defaults for any missing settings
            for (const setting of defaultSettings) {
                if (storedSettings.hasOwnProperty(setting.id)) {
                    settings[setting.id] = storedSettings[setting.id];
                } else {
                    settings[setting.id] = setting.default;
                }
            }
            
            return settings;
        },
        
        /**
         * Save settings for a script
         * @param {string} scriptId - Script ID
         * @param {Object} settings - Settings to save
         */
        saveScriptSettings: function(scriptId, settings) {
            GM_setValue(CONFIG.STORAGE_KEYS.SCRIPT_SETTINGS_PREFIX + scriptId, settings);
        },
        
        /**
         * Reset settings for a script to defaults
         * @param {string} scriptId - Script ID
         * @param {Array} defaultSettings - Default settings from manifest
         */
        resetScriptSettings: function(scriptId, defaultSettings = []) {
            const settings = {};
            
            for (const setting of defaultSettings) {
                settings[setting.id] = setting.default;
            }
            
            this.saveScriptSettings(scriptId, settings);
        },
        
        /**
         * Export all settings to JSON
         * @returns {string} - JSON string of all settings
         */
        exportSettings: function() {
            const data = {
                installedScripts: GM_getValue(CONFIG.STORAGE_KEYS.INSTALLED_SCRIPTS),
                scriptSettings: {}
            };
            
            // Get all script settings
            const installedScripts = ScriptRegistry.getInstalledScripts();
            for (const scriptId in installedScripts) {
                data.scriptSettings[scriptId] = GM_getValue(CONFIG.STORAGE_KEYS.SCRIPT_SETTINGS_PREFIX + scriptId, {});
            }
            
            return JSON.stringify(data, null, 2);
        },
        
        /**
         * Import settings from JSON
         * @param {string} json - JSON string of settings
         * @returns {boolean} - True if import successful, false otherwise
         */
        importSettings: function(json) {
            try {
                const data = JSON.parse(json);
                
                if (data.installedScripts) {
                    GM_setValue(CONFIG.STORAGE_KEYS.INSTALLED_SCRIPTS, data.installedScripts);
                }
                
                if (data.scriptSettings) {
                    for (const scriptId in data.scriptSettings) {
                        GM_setValue(CONFIG.STORAGE_KEYS.SCRIPT_SETTINGS_PREFIX + scriptId, data.scriptSettings[scriptId]);
                    }
                }
                
                return true;
            } catch (error) {
                console.error('Error importing settings:', error);
                return false;
            }
        }
    };
    
    /**
     * Install Manager - Handles script installation and uninstallation
     */
    const InstallManager = {
        /**
         * Install a script
         * @param {Object} script - Script data from manifest
         * @returns {Promise<boolean>} - Promise resolving to true if installation successful
         */
        installScript: async function(script) {
            try {
                // Download the script
                const scriptContent = await APILayer.downloadScript(script.downloadURL);
                
                // Install the script using GM_openInTab
                const blob = new Blob([scriptContent], { type: 'text/javascript' });
                const url = URL.createObjectURL(blob);
                GM_openInTab(url, { active: true });
                
                // Register the script in the registry
                ScriptRegistry.updateScript(script.id, {
                    version: script.version,
                    enabled: true,
                    installDate: new Date().toISOString(),
                    lastChecked: new Date().toISOString()
                });
                
                // Initialize script settings with defaults
                if (script.settings && script.settings.length > 0) {
                    SettingsManager.resetScriptSettings(script.id, script.settings);
                }
                
                return true;
            } catch (error) {
                console.error('Error installing script:', error);
                return false;
            }
        },
        
        /**
         * Uninstall a script
         * @param {string} scriptId - Script ID
         * @returns {boolean} - True if uninstallation successful
         */
        uninstallScript: function(scriptId) {
            try {
                // Remove from registry
                ScriptRegistry.removeScript(scriptId);
                
                // Notify user to manually remove from userscript manager
                NotificationSystem.showNotification(
                    'Script Uninstalled',
                    `${scriptId} has been uninstalled from the registry. Please remove it from your userscript manager as well.`,
                    'info'
                );
                
                return true;
            } catch (error) {
                console.error('Error uninstalling script:', error);
                return false;
            }
        },
        
        /**
         * Update a script
         * @param {Object} script - Script data from manifest
         * @returns {Promise<boolean>} - Promise resolving to true if update successful
         */
        updateScript: async function(script) {
            try {
                // Download the script
                const scriptContent = await APILayer.downloadScript(script.downloadURL);
                
                // Install the script using GM_openInTab
                const blob = new Blob([scriptContent], { type: 'text/javascript' });
                const url = URL.createObjectURL(blob);
                GM_openInTab(url, { active: true });
                
                // Update the script in the registry
                const existingScript = ScriptRegistry.getScript(script.id);
                ScriptRegistry.updateScript(script.id, {
                    ...existingScript,
                    version: script.version,
                    lastChecked: new Date().toISOString()
                });
                
                return true;
            } catch (error) {
                console.error('Error updating script:', error);
                return false;
            }
        },
        
        /**
         * Batch install multiple scripts
         * @param {Array} scripts - Array of script data from manifest
         * @returns {Promise<Array>} - Promise resolving to array of results
         */
        batchInstall: async function(scripts) {
            const results = [];
            
            for (const script of scripts) {
                const success = await this.installScript(script);
                results.push({ script, success });
            }
            
            return results;
        },
        
        /**
         * Batch update multiple scripts
         * @param {Array} updates - Array of update data
         * @returns {Promise<Array>} - Promise resolving to array of results
         */
        batchUpdate: async function(updates) {
            const results = [];
            
            for (const update of updates) {
                const success = await this.updateScript(update.script);
                results.push({ script: update.script, success });
            }
            
            return results;
        }
    };

    // =========================================================
    // API Layer
    // =========================================================
    
    /**
     * API Layer - Handles communication with external services
     */
    const APILayer = {
        /**
         * Fetch the script manifest from GitHub
         * @returns {Promise<Object>} - Promise resolving to manifest data
         */
        fetchManifest: function() {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: CONFIG.MANIFEST_URL,
                    responseType: 'json',
                    onload: function(response) {
                        if (response.status === 200) {
                            resolve(response.response);
                        } else {
                            reject(new Error(`Failed to fetch manifest: ${response.statusText}`));
                        }
                    },
                    onerror: function(error) {
                        reject(new Error(`Failed to fetch manifest: ${error}`));
                    }
                });
            });
        },
        
        /**
         * Download a script from URL
         * @param {string} url - Script URL
         * @returns {Promise<string>} - Promise resolving to script content
         */
        downloadScript: function(url) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: url,
                    responseType: 'text',
                    onload: function(response) {
                        if (response.status === 200) {
                            resolve(response.responseText);
                        } else {
                            reject(new Error(`Failed to download script: ${response.statusText}`));
                        }
                    },
                    onerror: function(error) {
                        reject(new Error(`Failed to download script: ${error}`));
                    }
                });
            });
        }
    };

    // =========================================================
    // UI Components
    // =========================================================
    
    /**
     * UI - Handles user interface components
     */
    const UI = {
        /**
         * Initialize the UI
         */
        init: function() {
            this.addStyles();
            this.createMenuButton();
            
            // Register menu commands
            GM_registerMenuCommand('RPGHQ Userscript Manager', () => this.openMainPopup());
            GM_registerMenuCommand('Check for Updates', async () => {
                const updates = await VersionManager.performUpdateCheck();
                if (updates.length === 0) {
                    NotificationSystem.showNotification('No Updates Available', 'All scripts are up to date.', 'info');
                }
            });
        },
        
        /**
         * Add CSS styles to the page
         */
        addStyles: function() {
            const styles = `
                /* RPGHQ Userscript Manager Styles */
                .rpghq-usm-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: 9998;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                
                .rpghq-usm-popup {
                    background-color: #1e1e1e;
                    color: #e0e0e0;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                    width: 800px;
                    max-width: 90%;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    z-index: 9999;
                }
                
                .rpghq-usm-header {
                    padding: 15px;
                    border-bottom: 1px solid #333;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .rpghq-usm-title {
                    font-size: 18px;
                    font-weight: bold;
                    margin: 0;
                }
                
                .rpghq-usm-close {
                    background: none;
                    border: none;
                    color: #999;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 0;
                }
                
                .rpghq-usm-close:hover {
                    color: #e0e0e0;
                }
                
                .rpghq-usm-tabs {
                    display: flex;
                    border-bottom: 1px solid #333;
                }
                
                .rpghq-usm-tab {
                    padding: 10px 15px;
                    cursor: pointer;
                    background: none;
                    border: none;
                    color: #999;
                    font-size: 14px;
                    border-bottom: 2px solid transparent;
                }
                
                .rpghq-usm-tab:hover {
                    color: #e0e0e0;
                }
                
                .rpghq-usm-tab.active {
                    color: #e0e0e0;
                    border-bottom-color: #0078d7;
                }
                
                .rpghq-usm-content {
                    padding: 15px;
                    overflow-y: auto;
                    flex: 1;
                }
                
                .rpghq-usm-tab-content {
                    display: none;
                }
                
                .rpghq-usm-tab-content.active {
                    display: block;
                }
                
                .rpghq-usm-script-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                .rpghq-usm-script-item {
                    background-color: #252525;
                    border-radius: 5px;
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                .rpghq-usm-script-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .rpghq-usm-script-title {
                    font-weight: bold;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .rpghq-usm-script-version {
                    color: #999;
                    font-size: 12px;
                }
                
                .rpghq-usm-script-description {
                    color: #ccc;
                    font-size: 14px;
                }
                
                .rpghq-usm-script-meta {
                    display: flex;
                    gap: 15px;
                    font-size: 12px;
                    color: #999;
                }
                
                .rpghq-usm-script-categories {
                    display: flex;
                    gap: 5px;
                }
                
                .rpghq-usm-category {
                    background-color: #333;
                    color: #ccc;
                    padding: 3px 8px;
                    border-radius: 3px;
                    font-size: 12px;
                }
                
                .rpghq-usm-script-actions {
                    display: flex;
                    gap: 10px;
                }
                
                .rpghq-usm-button {
                    background-color: #0078d7;
                    color: white;
                    border: none;
                    border-radius: 3px;
                    padding: 5px 10px;
                    cursor: pointer;
                    font-size: 14px;
                }
                
                .rpghq-usm-button:hover {
                    background-color: #0086f0;
                }
                
                .rpghq-usm-button.secondary {
                    background-color: #333;
                    color: #e0e0e0;
                }
                
                .rpghq-usm-button.secondary:hover {
                    background-color: #444;
                }
                
                .rpghq-usm-button.danger {
                    background-color: #d73a49;
                }
                
                .rpghq-usm-button.danger:hover {
                    background-color: #e25563;
                }
                
                .rpghq-usm-footer {
                    padding: 15px;
                    border-top: 1px solid #333;
                    display: flex;
                    justify-content: space-between;
                }
                
                .rpghq-usm-settings-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }
                
                .rpghq-usm-setting-item {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                
                .rpghq-usm-setting-label {
                    font-weight: bold;
                    font-size: 14px;
                }
                
                .rpghq-usm-setting-description {
                    color: #999;
                    font-size: 12px;
                }
                
                .rpghq-usm-checkbox {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .rpghq-usm-input {
                    background-color: #333;
                    color: #e0e0e0;
                    border: 1px solid #444;
                    border-radius: 3px;
                    padding: 5px 10px;
                    font-size: 14px;
                }
                
                .rpghq-usm-select {
                    background-color: #333;
                    color: #e0e0e0;
                    border: 1px solid #444;
                    border-radius: 3px;
                    padding: 5px 10px;
                    font-size: 14px;
                }
                
                .rpghq-usm-notification {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background-color: #1e1e1e;
                    color: #e0e0e0;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                    padding: 15px;
                    z-index: 9999;
                    max-width: 300px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                .rpghq-usm-notification-title {
                    font-weight: bold;
                    font-size: 16px;
                }
                
                .rpghq-usm-notification-message {
                    font-size: 14px;
                }
                
                .rpghq-usm-badge {
                    background-color: #d73a49;
                    color: white;
                    border-radius: 10px;
                    padding: 2px 6px;
                    font-size: 12px;
                    font-weight: bold;
                }
            `;
            
            GM_addStyle(styles);
        },
        
        /**
         * Create the menu button in the forum header
         */
        createMenuButton: function() {
            // Wait for the forum header to be available
            const checkForHeader = setInterval(() => {
                const header = document.querySelector('.p-navgroup.p-account');
                if (header) {
                    clearInterval(checkForHeader);
                    
                    // Create the menu button
                    const menuButton = Util.createElement('a', {
                        className: 'p-navgroup-link',
                        href: 'javascript:void(0)',
                        title: 'RPGHQ Userscript Manager',
                        onclick: () => this.openMainPopup()
                    }, [
                        Util.createElement('i', { className: 'fa fa-puzzle-piece' }),
                        Util.createElement('span', { className: 'p-navgroup-linkText' }, 'Userscripts')
                    ]);
                    
                    // Add the button to the header
                    const navLinks = header.querySelector('.p-navgroup-links');
                    if (navLinks) {
                        navLinks.appendChild(menuButton);
                    }
                }
            }, 500);
        },
        
        /**
         * Open the main popup
         */
        openMainPopup: async function() {
            // Create overlay
            const overlay = Util.createElement('div', { className: 'rpghq-usm-overlay' });
            document.body.appendChild(overlay);
            
            // Create popup
            const popup = Util.createElement('div', { className: 'rpghq-usm-popup' });
            overlay.appendChild(popup);
            
            // Create header
            const header = Util.createElement('div', { className: 'rpghq-usm-header' }, [
                Util.createElement('h2', { className: 'rpghq-usm-title' }, 'RPGHQ Userscript Manager'),
                Util.createElement('button', {
                    className: 'rpghq-usm-close',
                    onclick: () => overlay.remove()
                }, '×')
            ]);
            popup.appendChild(header);
            
            // Create tabs
            const tabs = Util.createElement('div', { className: 'rpghq-usm-tabs' }, [
                Util.createElement('button', {
                    className: 'rpghq-usm-tab active',
                    dataset: { tab: 'available' },
                    onclick: (e) => this.switchTab(e.target)
                }, 'Available'),
                Util.createElement('button', {
                    className: 'rpghq-usm-tab',
                    dataset: { tab: 'installed' },
                    onclick: (e) => this.switchTab(e.target)
                }, 'Installed'),
                Util.createElement('button', {
                    className: 'rpghq-usm-tab',
                    dataset: { tab: 'categories' },
                    onclick: (e) => this.switchTab(e.target)
                }, 'Categories'),
                Util.createElement('button', {
                    className: 'rpghq-usm-tab',
                    dataset: { tab: 'settings' },
                    onclick: (e) => this.switchTab(e.target)
                }, 'Settings')
            ]);
            popup.appendChild(tabs);
            
            // Create content
            const content = Util.createElement('div', { className: 'rpghq-usm-content' });
            popup.appendChild(content);
            
            // Create tab contents
            const availableContent = Util.createElement('div', { className: 'rpghq-usm-tab-content active', dataset: { tab: 'available' } });
            const installedContent = Util.createElement('div', { className: 'rpghq-usm-tab-content', dataset: { tab: 'installed' } });
            const categoriesContent = Util.createElement('div', { className: 'rpghq-usm-tab-content', dataset: { tab: 'categories' } });
            const settingsContent = Util.createElement('div', { className: 'rpghq-usm-tab-content', dataset: { tab: 'settings' } });
            
            content.appendChild(availableContent);
            content.appendChild(installedContent);
            content.appendChild(categoriesContent);
            content.appendChild(settingsContent);
            
            // Create footer
            const footer = Util.createElement('div', { className: 'rpghq-usm-footer' });
            popup.appendChild(footer);
            
            // Load data
            try {
                availableContent.textContent = 'Loading scripts...';
                
                const manifest = await APILayer.fetchManifest();
                
                // Populate available scripts tab
                this.populateAvailableScripts(availableContent, manifest, footer);
                
                // Populate installed scripts tab
                this.populateInstalledScripts(installedContent, manifest, footer);
                
                // Populate categories tab
                this.populateCategories(categoriesContent, manifest);
                
                // Populate settings tab
                this.populateSettings(settingsContent);
            } catch (error) {
                availableContent.textContent = `Error loading scripts: ${error.message}`;
                console.error('Error loading scripts:', error);
            }
        },
        
        /**
         * Switch between tabs
         * @param {HTMLElement} tabButton - Tab button that was clicked
         */
        switchTab: function(tabButton) {
            // Update active tab button
            const tabs = document.querySelectorAll('.rpghq-usm-tab');
            tabs.forEach(tab => tab.classList.remove('active'));
            tabButton.classList.add('active');
            
            // Update active tab content
            const tabName = tabButton.dataset.tab;
            const tabContents = document.querySelectorAll('.rpghq-usm-tab-content');
            tabContents.forEach(content => {
                if (content.dataset.tab === tabName) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        },
        
        /**
         * Populate the available scripts tab
         * @param {HTMLElement} container - Tab content container
         * @param {Object} manifest - Script manifest
         * @param {HTMLElement} footer - Footer element
         */
        populateAvailableScripts: function(container, manifest, footer) {
            container.innerHTML = '';
            
            const scriptList = Util.createElement('div', { className: 'rpghq-usm-script-list' });
            container.appendChild(scriptList);
            
            // Add scripts
            const installedScripts = ScriptRegistry.getInstalledScripts();
            
            for (const script of manifest.scripts) {
                const isInstalled = !!installedScripts[script.id];
                
                const scriptItem = Util.createElement('div', { className: 'rpghq-usm-script-item' });
                
                const scriptHeader = Util.createElement('div', { className: 'rpghq-usm-script-header' });
                scriptItem.appendChild(scriptHeader);
                
                const scriptTitle = Util.createElement('div', { className: 'rpghq-usm-script-title' }, [
                    script.name,
                    Util.createElement('span', { className: 'rpghq-usm-script-version' }, `v${script.version}`)
                ]);
                scriptHeader.appendChild(scriptTitle);
                
                const scriptActions = Util.createElement('div', { className: 'rpghq-usm-script-actions' });
                scriptHeader.appendChild(scriptActions);
                
                if (isInstalled) {
                    const installedButton = Util.createElement('button', {
                        className: 'rpghq-usm-button secondary',
                        disabled: true
                    }, 'Installed');
                    scriptActions.appendChild(installedButton);
                } else {
                    const installButton = Util.createElement('button', {
                        className: 'rpghq-usm-button',
                        onclick: async () => {
                            installButton.disabled = true;
                            installButton.textContent = 'Installing...';
                            
                            const success = await InstallManager.installScript(script);
                            
                            if (success) {
                                installButton.textContent = 'Installed';
                                NotificationSystem.showNotification('Script Installed', `${script.name} has been installed successfully.`, 'success');
                            } else {
                                installButton.disabled = false;
                                installButton.textContent = 'Install';
                                NotificationSystem.showNotification('Installation Failed', `Failed to install ${script.name}.`, 'error');
                            }
                        }
                    }, 'Install');
                    scriptActions.appendChild(installButton);
                }
                
                const scriptDescription = Util.createElement('div', { className: 'rpghq-usm-script-description' }, script.description);
                scriptItem.appendChild(scriptDescription);
                
                const scriptMeta = Util.createElement('div', { className: 'rpghq-usm-script-meta' });
                scriptItem.appendChild(scriptMeta);
                
                if (script.author) {
                    const scriptAuthor = Util.createElement('div', { className: 'rpghq-usm-script-author' }, `Author: ${script.author}`);
                    scriptMeta.appendChild(scriptAuthor);
                }
                
                if (script.categories && script.categories.length > 0) {
                    const scriptCategories = Util.createElement('div', { className: 'rpghq-usm-script-categories' });
                    scriptMeta.appendChild(scriptCategories);
                    
                    const categoriesLabel = Util.createElement('span', {}, 'Categories: ');
                    scriptCategories.appendChild(categoriesLabel);
                    
                    for (const category of script.categories) {
                        const categoryBadge = Util.createElement('span', { className: 'rpghq-usm-category' }, category);
                        scriptCategories.appendChild(categoryBadge);
                    }
                }
                
                scriptList.appendChild(scriptItem);
            }
            
            // Update footer
            footer.innerHTML = '';
            
            const installAllButton = Util.createElement('button', {
                className: 'rpghq-usm-button',
                onclick: async () => {
                    installAllButton.disabled = true;
                    installAllButton.textContent = 'Installing...';
                    
                    const notInstalledScripts = manifest.scripts.filter(script => !ScriptRegistry.isInstalled(script.id));
                    const results = await InstallManager.batchInstall(notInstalledScripts);
                    
                    const successCount = results.filter(result => result.success).length;
                    
                    NotificationSystem.showNotification(
                        'Batch Installation Complete',
                        `${successCount} of ${notInstalledScripts.length} scripts installed successfully.`,
                        successCount === notInstalledScripts.length ? 'success' : 'warning'
                    );
                    
                    installAllButton.disabled = false;
                    installAllButton.textContent = 'Install All';
                    
                    // Refresh the UI
                    this.populateAvailableScripts(container, manifest, footer);
                }
            }, 'Install All');
            
            const refreshButton = Util.createElement('button', {
                className: 'rpghq-usm-button secondary',
                onclick: async () => {
                    refreshButton.disabled = true;
                    refreshButton.textContent = 'Refreshing...';
                    
                    try {
                        const newManifest = await APILayer.fetchManifest();
                        this.populateAvailableScripts(container, newManifest, footer);
                        NotificationSystem.showNotification('Refresh Complete', 'Script list has been refreshed.', 'info');
                    } catch (error) {
                        NotificationSystem.showNotification('Refresh Failed', `Failed to refresh script list: ${error.message}`, 'error');
                    }
                    
                    refreshButton.disabled = false;
                    refreshButton.textContent = 'Refresh List';
                }
            }, 'Refresh List');
            
            footer.appendChild(installAllButton);
            footer.appendChild(refreshButton);
        },
        
        /**
         * Populate the installed scripts tab
         * @param {HTMLElement} container - Tab content container
         * @param {Object} manifest - Script manifest
         * @param {HTMLElement} footer - Footer element
         */
        populateInstalledScripts: function(container, manifest, footer) {
            container.innerHTML = '';
            
            const scriptList = Util.createElement('div', { className: 'rpghq-usm-script-list' });
            container.appendChild(scriptList);
            
            // Add scripts
            const installedScripts = ScriptRegistry.getInstalledScripts();
            const updates = VersionManager.checkForUpdates(manifest);
            
            if (Object.keys(installedScripts).length === 0) {
                const noScripts = Util.createElement('div', { className: 'rpghq-usm-script-item' }, 'No scripts installed.');
                scriptList.appendChild(noScripts);
            } else {
                for (const scriptId in installedScripts) {
                    const installedScript = installedScripts[scriptId];
                    const manifestScript = manifest.scripts.find(s => s.id === scriptId);
                    
                    if (!manifestScript) continue; // Skip if not in manifest
                    
                    const scriptItem = Util.createElement('div', { className: 'rpghq-usm-script-item' });
                    
                    const scriptHeader = Util.createElement('div', { className: 'rpghq-usm-script-header' });
                    scriptItem.appendChild(scriptHeader);
                    
                    const scriptTitle = Util.createElement('div', { className: 'rpghq-usm-script-title' }, [
                        manifestScript.name,
                        Util.createElement('span', { className: 'rpghq-usm-script-version' }, `v${installedScript.version}`),
                        Util.createElement('input', {
                            type: 'checkbox',
                            checked: installedScript.enabled,
                            onchange: (e) => {
                                ScriptRegistry.setScriptEnabled(scriptId, e.target.checked);
                                NotificationSystem.showNotification(
                                    e.target.checked ? 'Script Enabled' : 'Script Disabled',
                                    `${manifestScript.name} has been ${e.target.checked ? 'enabled' : 'disabled'}.`,
                                    'info'
                                );
                            }
                        })
                    ]);
                    scriptHeader.appendChild(scriptTitle);
                    
                    const scriptActions = Util.createElement('div', { className: 'rpghq-usm-script-actions' });
                    scriptHeader.appendChild(scriptActions);
                    
                    const settingsButton = Util.createElement('button', {
                        className: 'rpghq-usm-button secondary',
                        onclick: () => this.openScriptSettings(scriptId, manifestScript)
                    }, 'Settings');
                    scriptActions.appendChild(settingsButton);
                    
                    const uninstallButton = Util.createElement('button', {
                        className: 'rpghq-usm-button danger',
                        onclick: () => {
                            if (confirm(`Are you sure you want to uninstall ${manifestScript.name}?`)) {
                                InstallManager.uninstallScript(scriptId);
                                this.populateInstalledScripts(container, manifest, footer);
                            }
                        }
                    }, 'Uninstall');
                    scriptActions.appendChild(uninstallButton);
                    
                    const scriptDescription = Util.createElement('div', { className: 'rpghq-usm-script-description' }, manifestScript.description);
                    scriptItem.appendChild(scriptDescription);
                    
                    const scriptMeta = Util.createElement('div', { className: 'rpghq-usm-script-meta' });
                    scriptItem.appendChild(scriptMeta);
                    
                    const update = updates.find(u => u.id === scriptId);
                    if (update) {
                        const updateInfo = Util.createElement('div', { className: 'rpghq-usm-script-update' }, [
                            'Update available: ',
                            Util.createElement('strong', {}, `v${update.newVersion}`),
                            ' ',
                            Util.createElement('button', {
                                className: 'rpghq-usm-button',
                                onclick: async () => {
                                    const success = await InstallManager.updateScript(update.script);
                                    if (success) {
                                        NotificationSystem.showNotification('Script Updated', `${manifestScript.name} has been updated to v${update.newVersion}.`, 'success');
                                        this.populateInstalledScripts(container, manifest, footer);
                                    } else {
                                        NotificationSystem.showNotification('Update Failed', `Failed to update ${manifestScript.name}.`, 'error');
                                    }
                                }
                            }, 'Update')
                        ]);
                        scriptMeta.appendChild(updateInfo);
                    } else {
                        const statusInfo = Util.createElement('div', { className: 'rpghq-usm-script-status' }, 'Status: Up to date');
                        scriptMeta.appendChild(statusInfo);
                    }
                    
                    if (installedScript.installDate) {
                        const installDate = Util.createElement('div', { className: 'rpghq-usm-script-date' }, `Installed: ${Util.formatDate(installedScript.installDate)}`);
                        scriptMeta.appendChild(installDate);
                    }
                    
                    scriptList.appendChild(scriptItem);
                }
            }
            
            // Update footer
            footer.innerHTML = '';
            
            if (updates.length > 0) {
                const updateAllButton = Util.createElement('button', {
                    className: 'rpghq-usm-button',
                    onclick: async () => {
                        updateAllButton.disabled = true;
                        updateAllButton.textContent = 'Updating...';
                        
                        const results = await InstallManager.batchUpdate(updates);
                        
                        const successCount = results.filter(result => result.success).length;
                        
                        NotificationSystem.showNotification(
                            'Batch Update Complete',
                            `${successCount} of ${updates.length} scripts updated successfully.`,
                            successCount === updates.length ? 'success' : 'warning'
                        );
                        
                        updateAllButton.disabled = false;
                        updateAllButton.textContent = 'Update All';
                        
                        // Refresh the UI
                        this.populateInstalledScripts(container, manifest, footer);
                    }
                }, 'Update All');
                footer.appendChild(updateAllButton);
            }
            
            const exportButton = Util.createElement('button', {
                className: 'rpghq-usm-button secondary',
                onclick: () => {
                    const settings = SettingsManager.exportSettings();
                    GM_setClipboard(settings);
                    NotificationSystem.showNotification('Settings Exported', 'Settings have been copied to clipboard.', 'info');
                }
            }, 'Export Settings');
            footer.appendChild(exportButton);
            
            const importButton = Util.createElement('button', {
                className: 'rpghq-usm-button secondary',
                onclick: () => {
                    const settings = prompt('Paste settings JSON:');
                    if (settings) {
                        const success = SettingsManager.importSettings(settings);
                        if (success) {
                            NotificationSystem.showNotification('Settings Imported', 'Settings have been imported successfully.', 'success');
                            this.populateInstalledScripts(container, manifest, footer);
                        } else {
                            NotificationSystem.showNotification('Import Failed', 'Failed to import settings. Invalid JSON format.', 'error');
                        }
                    }
                }
            }, 'Import Settings');
            footer.appendChild(importButton);
        },
        
        /**
         * Populate the categories tab
         * @param {HTMLElement} container - Tab content container
         * @param {Object} manifest - Script manifest
         */
        populateCategories: function(container, manifest) {
            container.innerHTML = '';
            
            if (!manifest.categories || manifest.categories.length === 0) {
                container.textContent = 'No categories available.';
                return;
            }
            
            const categoryList = Util.createElement('div', { className: 'rpghq-usm-category-list' });
            container.appendChild(categoryList);
            
            for (const category of manifest.categories) {
                const categoryItem = Util.createElement('div', { className: 'rpghq-usm-category-item' });
                
                const categoryHeader = Util.createElement('h3', { className: 'rpghq-usm-category-header' }, category);
                categoryItem.appendChild(categoryHeader);
                
                const categoryScripts = manifest.scripts.filter(script => script.categories && script.categories.includes(category));
                
                if (categoryScripts.length === 0) {
                    const noScripts = Util.createElement('div', { className: 'rpghq-usm-category-empty' }, 'No scripts in this category.');
                    categoryItem.appendChild(noScripts);
                } else {
                    const scriptList = Util.createElement('div', { className: 'rpghq-usm-script-list' });
                    categoryItem.appendChild(scriptList);
                    
                    for (const script of categoryScripts) {
                        const scriptItem = Util.createElement('div', { className: 'rpghq-usm-script-item' });
                        
                        const scriptHeader = Util.createElement('div', { className: 'rpghq-usm-script-header' });
                        scriptItem.appendChild(scriptHeader);
                        
                        const scriptTitle = Util.createElement('div', { className: 'rpghq-usm-script-title' }, [
                            script.name,
                            Util.createElement('span', { className: 'rpghq-usm-script-version' }, `v${script.version}`)
                        ]);
                        scriptHeader.appendChild(scriptTitle);
                        
                        const scriptDescription = Util.createElement('div', { className: 'rpghq-usm-script-description' }, script.description);
                        scriptItem.appendChild(scriptDescription);
                        
                        scriptList.appendChild(scriptItem);
                    }
                }
                
                categoryList.appendChild(categoryItem);
            }
        },
        
        /**
         * Populate the settings tab
         * @param {HTMLElement} container - Tab content container
         */
        populateSettings: function(container) {
            container.innerHTML = '';
            
            const preferences = ScriptRegistry.getPreferences();
            
            const settingsGrid = Util.createElement('div', { className: 'rpghq-usm-settings-grid' });
            container.appendChild(settingsGrid);
            
            // Update frequency
            const updateFrequency = Util.createElement('div', { className: 'rpghq-usm-setting-item' });
            settingsGrid.appendChild(updateFrequency);
            
            const updateFrequencyLabel = Util.createElement('label', { className: 'rpghq-usm-setting-label' }, 'Update Check Frequency');
            updateFrequency.appendChild(updateFrequencyLabel);
            
            const updateFrequencyDescription = Util.createElement('div', { className: 'rpghq-usm-setting-description' }, 'How often to check for script updates');
            updateFrequency.appendChild(updateFrequencyDescription);
            
            const updateFrequencySelect = Util.createElement('select', {
                className: 'rpghq-usm-select',
                onchange: (e) => {
                    ScriptRegistry.updatePreferences({ checkFrequency: e.target.value });
                }
            }, [
                Util.createElement('option', { value: 'daily', selected: preferences.checkFrequency === 'daily' }, 'Daily'),
                Util.createElement('option', { value: 'weekly', selected: preferences.checkFrequency === 'weekly' }, 'Weekly'),
                Util.createElement('option', { value: 'manual', selected: preferences.checkFrequency === 'manual' }, 'Manual Only')
            ]);
            updateFrequency.appendChild(updateFrequencySelect);
            
            // Batch update
            const batchUpdate = Util.createElement('div', { className: 'rpghq-usm-setting-item' });
            settingsGrid.appendChild(batchUpdate);
            
            const batchUpdateLabel = Util.createElement('label', { className: 'rpghq-usm-setting-label' }, 'Batch Update');
            batchUpdate.appendChild(batchUpdateLabel);
            
            const batchUpdateDescription = Util.createElement('div', { className: 'rpghq-usm-setting-description' }, 'Enable batch updating of scripts');
            batchUpdate.appendChild(batchUpdateDescription);
            
            const batchUpdateCheckbox = Util.createElement('div', { className: 'rpghq-usm-checkbox' }, [
                Util.createElement('input', {
                    type: 'checkbox',
                    checked: preferences.batchUpdateEnabled,
                    onchange: (e) => {
                        ScriptRegistry.updatePreferences({ batchUpdateEnabled: e.target.checked });
                    }
                }),
                Util.createElement('span', {}, 'Enable batch updates')
            ]);
            batchUpdate.appendChild(batchUpdateCheckbox);
            
            // Notifications
            const notifications = Util.createElement('div', { className: 'rpghq-usm-setting-item' });
            settingsGrid.appendChild(notifications);
            
            const notificationsLabel = Util.createElement('label', { className: 'rpghq-usm-setting-label' }, 'Notifications');
            notifications.appendChild(notificationsLabel);
            
            const notificationsDescription = Util.createElement('div', { className: 'rpghq-usm-setting-description' }, 'Show notifications for updates and events');
            notifications.appendChild(notificationsDescription);
            
            const notificationsCheckbox = Util.createElement('div', { className: 'rpghq-usm-checkbox' }, [
                Util.createElement('input', {
                    type: 'checkbox',
                    checked: preferences.notifications,
                    onchange: (e) => {
                        ScriptRegistry.updatePreferences({ notifications: e.target.checked });
                    }
                }),
                Util.createElement('span', {}, 'Enable notifications')
            ]);
            notifications.appendChild(notificationsCheckbox);
            
            // Dark theme
            const darkTheme = Util.createElement('div', { className: 'rpghq-usm-setting-item' });
            settingsGrid.appendChild(darkTheme);
            
            const darkThemeLabel = Util.createElement('label', { className: 'rpghq-usm-setting-label' }, 'Dark Theme');
            darkTheme.appendChild(darkThemeLabel);
            
            const darkThemeDescription = Util.createElement('div', { className: 'rpghq-usm-setting-description' }, 'Use dark theme for the userscript manager');
            darkTheme.appendChild(darkThemeDescription);
            
            const darkThemeCheckbox = Util.createElement('div', { className: 'rpghq-usm-checkbox' }, [
                Util.createElement('input', {
                    type: 'checkbox',
                    checked: preferences.darkTheme,
                    onchange: (e) => {
                        ScriptRegistry.updatePreferences({ darkTheme: e.target.checked });
                    }
                }),
                Util.createElement('span', {}, 'Enable dark theme')
            ]);
            darkTheme.appendChild(darkThemeCheckbox);
            
            // Last update check
            const lastCheck = ScriptRegistry.getLastCheckTime();
            if (lastCheck) {
                const lastCheckItem = Util.createElement('div', { className: 'rpghq-usm-setting-item' });
                settingsGrid.appendChild(lastCheckItem);
                
                const lastCheckLabel = Util.createElement('div', { className: 'rpghq-usm-setting-label' }, 'Last Update Check');
                lastCheckItem.appendChild(lastCheckLabel);
                
                const lastCheckValue = Util.createElement('div', { className: 'rpghq-usm-setting-value' }, Util.formatDate(lastCheck));
                lastCheckItem.appendChild(lastCheckValue);
            }
            
            // Save button
            const saveButton = Util.createElement('button', {
                className: 'rpghq-usm-button',
                onclick: () => {
                    NotificationSystem.showNotification('Settings Saved', 'Your preferences have been saved.', 'success');
                }
            }, 'Save Settings');
            container.appendChild(saveButton);
        },
        
        /**
         * Open script settings panel
         * @param {string} scriptId - Script ID
         * @param {Object} script - Script data from manifest
         */
        openScriptSettings: function(scriptId, script) {
            // Create overlay
            const overlay = Util.createElement('div', { className: 'rpghq-usm-overlay' });
            document.body.appendChild(overlay);
            
            // Create popup
            const popup = Util.createElement('div', { className: 'rpghq-usm-popup' });
            overlay.appendChild(popup);
            
            // Create header
            const header = Util.createElement('div', { className: 'rpghq-usm-header' }, [
                Util.createElement('h2', { className: 'rpghq-usm-title' }, `Script Settings: ${script.name}`),
                Util.createElement('button', {
                    className: 'rpghq-usm-close',
                    onclick: () => overlay.remove()
                }, '×')
            ]);
            popup.appendChild(header);
            
            // Create content
            const content = Util.createElement('div', { className: 'rpghq-usm-content' });
            popup.appendChild(content);
            
            // Script info
            const scriptInfo = Util.createElement('div', { className: 'rpghq-usm-script-info' }, [
                Util.createElement('div', {}, `Version: ${script.version}`),
                script.author ? Util.createElement('div', {}, `Author: ${script.author}`) : null
            ]);
            content.appendChild(scriptInfo);
            
            // Settings container
            const settingsContainer = Util.createElement('div', { className: 'rpghq-usm-settings-container' });
            content.appendChild(settingsContainer);
            
            if (!script.settings || script.settings.length === 0) {
                settingsContainer.textContent = 'No settings available for this script.';
            } else {
                const settingsTitle = Util.createElement('h3', { className: 'rpghq-usm-settings-title' }, 'Settings');
                settingsContainer.appendChild(settingsTitle);
                
                const settings = SettingsManager.getScriptSettings(scriptId, script.settings);
                const settingsForm = Util.createElement('div', { className: 'rpghq-usm-settings-form' });
                settingsContainer.appendChild(settingsForm);
                
                for (const setting of script.settings) {
                    const settingItem = Util.createElement('div', { className: 'rpghq-usm-setting-item' });
                    settingsForm.appendChild(settingItem);
                    
                    const settingLabel = Util.createElement('label', { className: 'rpghq-usm-setting-label' }, setting.label);
                    settingItem.appendChild(settingLabel);
                    
                    if (setting.description) {
                        const settingDescription = Util.createElement('div', { className: 'rpghq-usm-setting-description' }, setting.description);
                        settingItem.appendChild(settingDescription);
                    }
                    
                    let settingInput;
                    
                    switch (setting.type) {
                        case 'boolean':
                            settingInput = Util.createElement('div', { className: 'rpghq-usm-checkbox' }, [
                                Util.createElement('input', {
                                    type: 'checkbox',
                                    id: `setting-${setting.id}`,
                                    checked: settings[setting.id],
                                    dataset: { settingId: setting.id }
                                }),
                                Util.createElement('span', {}, setting.label)
                            ]);
                            break;
                            
                        case 'select':
                            settingInput = Util.createElement('select', {
                                className: 'rpghq-usm-select',
                                id: `setting-${setting.id}`,
                                dataset: { settingId: setting.id }
                            });
                            
                            for (const option of setting.options || []) {
                                const optionElement = Util.createElement('option', {
                                    value: option.value,
                                    selected: settings[setting.id] === option.value
                                }, option.label);
                                settingInput.appendChild(optionElement);
                            }
                            break;
                            
                        case 'text':
                        default:
                            settingInput = Util.createElement('input', {
                                className: 'rpghq-usm-input',
                                type: 'text',
                                id: `setting-${setting.id}`,
                                value: settings[setting.id],
                                dataset: { settingId: setting.id }
                            });
                            break;
                    }
                    
                    settingItem.appendChild(settingInput);
                }
                
                // Footer with save and reset buttons
                const settingsFooter = Util.createElement('div', { className: 'rpghq-usm-settings-footer' });
                settingsContainer.appendChild(settingsFooter);
                
                const saveButton = Util.createElement('button', {
                    className: 'rpghq-usm-button',
                    onclick: () => {
                        const newSettings = {};
                        
                        for (const setting of script.settings) {
                            const input = document.getElementById(`setting-${setting.id}`);
                            
                            if (setting.type === 'boolean') {
                                newSettings[setting.id] = input.checked;
                            } else if (setting.type === 'select') {
                                newSettings[setting.id] = input.value;
                            } else {
                                newSettings[setting.id] = input.value;
                            }
                        }
                        
                        SettingsManager.saveScriptSettings(scriptId, newSettings);
                        NotificationSystem.showNotification('Settings Saved', `Settings for ${script.name} have been saved.`, 'success');
                    }
                }, 'Save Settings');
                settingsFooter.appendChild(saveButton);
                
                const resetButton = Util.createElement('button', {
                    className: 'rpghq-usm-button secondary',
                    onclick: () => {
                        if (confirm(`Are you sure you want to reset ${script.name} settings to defaults?`)) {
                            SettingsManager.resetScriptSettings(scriptId, script.settings);
                            NotificationSystem.showNotification('Settings Reset', `Settings for ${script.name} have been reset to defaults.`, 'info');
                            overlay.remove();
                            this.openScriptSettings(scriptId, script);
                        }
                    }
                }, 'Reset to Defaults');
                settingsFooter.appendChild(resetButton);
            }
        }
    };
    
    /**
     * Notification System - Handles notifications
     */
    const NotificationSystem = {
        /**
         * Show a notification
         * @param {string} title - Notification title
         * @param {string} message - Notification message
         * @param {string} type - Notification type (success, error, info, warning)
         */
        showNotification: function(title, message, type = 'info') {
            // Create notification element
            const notification = Util.createElement('div', { className: 'rpghq-usm-notification' });
            
            // Add title
            const notificationTitle = Util.createElement('div', { className: 'rpghq-usm-notification-title' }, title);
            notification.appendChild(notificationTitle);
            
            // Add message
            const notificationMessage = Util.createElement('div', { className: 'rpghq-usm-notification-message' }, message);
            notification.appendChild(notificationMessage);
            
            // Add to document
            document.body.appendChild(notification);
            
            // Remove after 5 seconds
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.5s';
                setTimeout(() => notification.remove(), 500);
            }, 5000);
            
            // Also use GM_notification if available
            if (typeof GM_notification !== 'undefined') {
                GM_notification({
                    title: title,
                    text: message,
                    timeout: 5000
                });
            }
        },
        
        /**
         * Show update notification
         * @param {Array} updates - Array of available updates
         */
        showUpdateNotification: function(updates) {
            if (updates.length === 0) return;
            
            const title = updates.length === 1
                ? 'Script Update Available'
                : 'Script Updates Available';
                
            const message = updates.length === 1
                ? `${updates[0].script.name} can be updated to v${updates[0].newVersion}.`
                : `${updates.length} scripts can be updated.`;
                
            this.showNotification(title, message, 'info');
        }
    };
    
    // =========================================================
    // Initialization
    // =========================================================
    
    // Initialize the UI
    UI.init();
    
    // Schedule update checks
    VersionManager.scheduleUpdateChecks();
    
})();
