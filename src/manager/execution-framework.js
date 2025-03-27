// ===== Execution Framework =====
const ExecutionFramework = {
  queues: {
    [ExecutionPhase.DOCUMENT_START]: [],
    [ExecutionPhase.DOCUMENT_READY]: [],
    [ExecutionPhase.DOCUMENT_LOADED]: [],
    [ExecutionPhase.DOCUMENT_IDLE]: [],
    [ExecutionPhase.CUSTOM_EVENT]: {},
  },

  register: function (phase, scriptId, scriptData, callback) {
    if (phase === ExecutionPhase.CUSTOM_EVENT) {
      if (!scriptData.eventName) {
        console.error(
          `Cannot register script ${scriptId} for custom event without an event name`
        );
        return false;
      }
      if (!this.queues[ExecutionPhase.CUSTOM_EVENT][scriptData.eventName]) {
        this.queues[ExecutionPhase.CUSTOM_EVENT][scriptData.eventName] = [];
      }
      this.queues[ExecutionPhase.CUSTOM_EVENT][scriptData.eventName].push({
        scriptId,
        scriptData,
        callback,
      });
    } else if (this.queues[phase]) {
      this.queues[phase].push({
        scriptId,
        scriptData,
        callback,
      });
    } else {
      console.error(`Unknown execution phase: ${phase}`);
      return false;
    }
    return true;
  },

  execute: function (phase, eventName = null) {
    if (phase === ExecutionPhase.CUSTOM_EVENT) {
      if (!eventName || !this.queues[ExecutionPhase.CUSTOM_EVENT][eventName]) {
        return;
      }
      this.queues[ExecutionPhase.CUSTOM_EVENT][eventName].forEach((item) => {
        try {
          item.callback(item.scriptId, item.scriptData);
        } catch (e) {
          console.error(
            `Error executing script ${item.scriptId} for event ${eventName}:`,
            e
          );
        }
      });
    } else if (this.queues[phase]) {
      this.queues[phase].forEach((item) => {
        try {
          item.callback(item.scriptId, item.scriptData);
        } catch (e) {
          console.error(
            `Error executing script ${item.scriptId} for phase ${phase}:`,
            e
          );
        }
      });
    }
  },

  triggerEvent: function (eventName, data = {}) {
    this.execute(ExecutionPhase.CUSTOM_EVENT, eventName, data);
  },

  init: function () {
    document.addEventListener("DOMContentLoaded", () => {
      this.execute(ExecutionPhase.DOCUMENT_READY);
    });
    window.addEventListener("load", () => {
      this.execute(ExecutionPhase.DOCUMENT_LOADED);
      setTimeout(() => {
        this.execute(ExecutionPhase.DOCUMENT_IDLE);
      }, 500);
    });
    this.execute(ExecutionPhase.DOCUMENT_START);
  },
};
