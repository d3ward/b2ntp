import { storage as _defaultStorage } from "../components/localStorage";

export const DEFAULTS = {
  ntpTheme: { value: "", autoSwitch: true, autoSwitchType: "system", darkModeStart: 20, darkModeEnd: 6 },
  tlbData: { dateFormat: "auto", timeFormat: "24", seconds: false },
  widgets: {
    // layout starts empty; ensureWidgetsSeeded (widgets/resolver.js) fills it from each
    // registry descriptor's placement so registry.js stays the single source of truth.
    layout: { left: [], right: [] },
    settings: { clock: { enabled: false }, qnote: { enabled: false } },
  },
  weatherConfig: { location: "" },
  backgroundConfig: null,
};

const STORAGE_KEYS = {
  ntpTheme: "ntp_theme",
  tlbData: "tlb_data",
  widgets: "widgets_config",
  weatherConfig: "wth_data",
  backgroundConfig: "ntp_bdy",
};

const _listeners = {};
let _adapter = _defaultStorage;

function _get(key) {
  const val = _adapter.get(STORAGE_KEYS[key]);
  return val !== null ? val : DEFAULTS[key];
}

function _set(key, value) {
  _adapter.set(STORAGE_KEYS[key], value);
  (_listeners[key] || []).forEach((fn) => fn(value));
}

export const settingsState = {
  async init(adapter = _defaultStorage) {
    _adapter = adapter;
    for (const [logicalKey, storageKey] of Object.entries(STORAGE_KEYS)) {
      const def = DEFAULTS[logicalKey];
      if (def === null) continue;
      const stored = _adapter.get(storageKey);
      if (stored === null || typeof stored !== typeof def) {
        _adapter.set(storageKey, def);
      }
    }
    const storedWeather = _adapter.get(STORAGE_KEYS.weatherConfig);
    if (storedWeather && typeof storedWeather === "object" && "lat" in storedWeather && !("location" in storedWeather)) {
      _adapter.set(STORAGE_KEYS.weatherConfig, {
        location: storedWeather.lat && storedWeather.lon ? `${storedWeather.lat},${storedWeather.lon}` : "",
      });
    }
  },

  getNtpTheme: () => _get("ntpTheme"),
  setNtpTheme: (v) => _set("ntpTheme", v),
  getTlbData: () => _get("tlbData"),
  setTlbData: (v) => _set("tlbData", v),
  getWidgets: () => _get("widgets"),
  setWidgets: (v) => _set("widgets", v),
  getWeatherConfig: () => _get("weatherConfig"),
  setWeatherConfig: (v) => _set("weatherConfig", v),
  getBackgroundConfig: () => _get("backgroundConfig"),
  setBackgroundConfig: (v) => _set("backgroundConfig", v),

  onChange(key, fn) {
    if (!_listeners[key]) _listeners[key] = [];
    _listeners[key].push(fn);
    return () => {
      _listeners[key] = _listeners[key].filter((f) => f !== fn);
    };
  },

  subscribeExternalChanges(adapter = _defaultStorage) {
    adapter.watchExternal((storageKey, value) => {
      for (const [logicalKey, sk] of Object.entries(STORAGE_KEYS)) {
        if (sk === storageKey) {
          (_listeners[logicalKey] || []).forEach((fn) => fn(value));
        }
      }
    });
  },
};
