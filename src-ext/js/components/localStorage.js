const _useChrome = typeof chrome !== 'undefined' && !!chrome.storage?.local;

class StorageManager {
  constructor() {
    this._cache = {};
  }

  async init() {
    if (_useChrome) {
      const data = await chrome.storage.local.get(null);
      this._cache = data ?? {};
    } else {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        const raw = window.localStorage.getItem(key);
        try { this._cache[key] = JSON.parse(raw); }
        catch { this._cache[key] = raw; }
      }
    }
  }

  get(key) {
    const v = this._cache[key];
    return v !== undefined ? v : null;
  }

  set(key, value) {
    this._cache[key] = value;
    if (_useChrome) {
      chrome.storage.local.set({ [key]: value });
    } else {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  }

  remove(key) {
    delete this._cache[key];
    if (_useChrome) {
      chrome.storage.local.remove(key);
    } else {
      window.localStorage.removeItem(key);
    }
  }

  getAll() {
    return { ...this._cache };
  }

  clear() {
    this._cache = {};
    if (_useChrome) {
      chrome.storage.local.clear();
    } else {
      window.localStorage.clear();
    }
  }

  get quotaKb() {
    if (_useChrome) {
      return Math.floor((chrome.storage.local.QUOTA_BYTES ?? 5242880) / 1024);
    }
    return null;
  }

  watchExternal(fn) {
    if (!_useChrome) return;
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;
      for (const [key, { newValue }] of Object.entries(changes)) {
        this._cache[key] = newValue;
        fn(key, newValue);
      }
    });
  }
}

export const storage = new StorageManager();
