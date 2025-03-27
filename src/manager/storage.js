// ===== Storage Management =====
const Storage = {
  STORAGE_VERSION: 1,

  init: function () {
    const data = this.getRawData();
    if (!data) {
      const initialData = {
        version: this.STORAGE_VERSION,
        installedScripts: {},
        lastUpdate: Date.now(),
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

  getRawData: function () {
    const data = GM_getValue(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  },

  // Save storage in compact format (minified JSON)
  saveRawData: function (data) {
    data.lastUpdate = Date.now();
    GM_setValue(STORAGE_KEY, JSON.stringify(data));
  },

  getData: function () {
    return this.getRawData() || this.init();
  },

  saveData: function (data) {
    const currentData = this.getData();
    data.version = currentData.version;
    this.saveRawData(data);
  },

  getScriptCodeKey: function (scriptId) {
    return `script_${scriptId}`;
  },

  getInstalledScripts: function () {
    return this.getData().installedScripts || {};
  },

  getScriptSettings: function (scriptId) {
    const installedScripts = this.getInstalledScripts();
    return (
      (installedScripts[scriptId] && installedScripts[scriptId].settings) || {}
    );
  },

  saveScriptSettings: function (scriptId, settings) {
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

  // Global settings for the entire mod manager
  getGlobalSettings: function () {
    const settings = GM_getValue("global_settings");
    return settings ? JSON.parse(settings) : {};
  },

  saveGlobalSettings: function (settings) {
    GM_setValue("global_settings", JSON.stringify(settings));
  },
};
