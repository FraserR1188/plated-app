if (typeof globalThis.PerformanceEntry === 'undefined') {
  class PerformanceEntry {
    constructor(init = {}) {
      this.name = init.name ?? '';
      this.entryType = init.entryType ?? 'mark';
      this.startTime = init.startTime ?? 0;
      this.duration = init.duration ?? 0;
    }

    toJSON() {
      return {
        name: this.name,
        entryType: this.entryType,
        startTime: this.startTime,
        duration: this.duration,
      };
    }
  }

  Object.defineProperty(globalThis, 'PerformanceEntry', {
    configurable: true,
    writable: true,
    value: PerformanceEntry,
  });
}

const PerformanceEntryBase = globalThis.PerformanceEntry;

if (typeof globalThis.PerformanceObserverEntryList === 'undefined') {
  class PerformanceObserverEntryList {
    constructor(entries = []) {
      this._entries = entries;
    }

    getEntries() {
      return this._entries;
    }

    getEntriesByType(type) {
      return this._entries.filter((entry) => entry.entryType === type);
    }

    getEntriesByName(name, type) {
      return this._entries.filter(
        (entry) => entry.name === name && (type == null || entry.entryType === type),
      );
    }
  }

  Object.defineProperty(globalThis, 'PerformanceObserverEntryList', {
    configurable: true,
    writable: true,
    value: PerformanceObserverEntryList,
  });
}

if (typeof globalThis.PerformanceObserver === 'undefined') {
  class PerformanceObserver {
    constructor(callback) {
      this._callback = callback;
    }

    observe() {}

    disconnect() {}

    takeRecords() {
      return [];
    }
  }

  PerformanceObserver.supportedEntryTypes = [];

  Object.defineProperty(globalThis, 'PerformanceObserver', {
    configurable: true,
    writable: true,
    value: PerformanceObserver,
  });
}

if (typeof globalThis.PerformanceMark === 'undefined') {
  class PerformanceMark extends PerformanceEntryBase {}
  Object.defineProperty(globalThis, 'PerformanceMark', {
    configurable: true,
    writable: true,
    value: PerformanceMark,
  });
}

if (typeof globalThis.PerformanceMeasure === 'undefined') {
  class PerformanceMeasure extends PerformanceEntryBase {}
  Object.defineProperty(globalThis, 'PerformanceMeasure', {
    configurable: true,
    writable: true,
    value: PerformanceMeasure,
  });
}

if (typeof globalThis.PerformanceEventTiming === 'undefined') {
  class PerformanceEventTiming extends PerformanceEntryBase {}
  Object.defineProperty(globalThis, 'PerformanceEventTiming', {
    configurable: true,
    writable: true,
    value: PerformanceEventTiming,
  });
}

if (typeof globalThis.PerformanceResourceTiming === 'undefined') {
  class PerformanceResourceTiming extends PerformanceEntryBase {}
  Object.defineProperty(globalThis, 'PerformanceResourceTiming', {
    configurable: true,
    writable: true,
    value: PerformanceResourceTiming,
  });
}

if (typeof globalThis.TaskAttributionTiming === 'undefined') {
  class TaskAttributionTiming extends PerformanceEntryBase {}
  Object.defineProperty(globalThis, 'TaskAttributionTiming', {
    configurable: true,
    writable: true,
    value: TaskAttributionTiming,
  });
}

if (typeof globalThis.PerformanceLongTaskTiming === 'undefined') {
  class PerformanceLongTaskTiming extends PerformanceEntryBase {}
  Object.defineProperty(globalThis, 'PerformanceLongTaskTiming', {
    configurable: true,
    writable: true,
    value: PerformanceLongTaskTiming,
  });
}