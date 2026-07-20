import A11yDialog from "a11y-dialog";
import packageJSON from "../../package.json";
import { toast } from "./components/toast";
import { pagesRoute } from "./components/pagesRoute";
import { aos } from "./components/aos";
import { formatTime } from "./components/utilities";
import { storage } from "./components/localStorage";
import { settingsState, DEFAULTS } from "./settings/state";
import { initBackgroundSettings } from "./blank/background/settings";
import { initWeatherSettings } from "./blank/weather/settings";
import { initWidgetSettings } from "./settings/widgetSettings";
import { getBookmarks } from "./blank/bookmarks";
import { BackgroundStore } from "./blank/BackgroundStore";
import "../sass/options.sass";

await storage.init();
await settingsState.init(storage);

const ntp_bdy = document.body;
const ntp_version = packageJSON.version;

var ntp_theme = settingsState.getNtpTheme();
var tlb_data = settingsState.getTlbData();

ntp_bdy.setAttribute("data-theme", ntp_theme.value || "light");
BackgroundStore.apply(settingsState.getBackgroundConfig(), ntp_bdy);

function initDialog(id) {
  const el = document.querySelector(id);
  if (!el) { console.warn(`[options] dialog element not found: ${id} — partial may not be included`); return null; }
  return new A11yDialog(el);
}

const dlg_color_picker = initDialog("#dlg_clvn");
const dialog_changelog = initDialog("#dlg_changelog");
const dialog_support = initDialog("#dlg_support");

var ntoast = toast({ timeout: 2000 });

// Apply theme to DOM whenever ntpTheme changes (fired synchronously by set*)
settingsState.onChange("ntpTheme", (theme) => {
  ntp_bdy.setAttribute("data-theme", theme.value || "light");
});

function updateNtpTheme(updates) {
  if (updates === undefined) {
    ntp_theme = { ...DEFAULTS.ntpTheme };
  } else {
    ntp_theme = { ...ntp_theme, ...updates };
  }
  settingsState.setNtpTheme(ntp_theme);
}

function f_save_bdy() {
  try {
    settingsState.setBackgroundConfig(ntp_bdy.getAttribute("style"));
  } catch (err) {
    ntoast.error("Something went wrong: " + err.message);
  }
}

function toggleTheme(theme) {
  const newTheme = theme || (ntp_bdy.getAttribute("data-theme") === "light" ? "dark" : "light");
  updateNtpTheme({ value: newTheme });
}

// Time/Date settings
const tlb_dateF = document.getElementById("dateFormat");
const tlb_timeF = document.getElementById("timeFormat");
const tlb_timeS = document.getElementById("timeSeconds");
tlb_dateF.value = tlb_data.dateFormat;
tlb_timeF.value = tlb_data.timeFormat;
tlb_timeS.checked = tlb_data.seconds;
tlb_dateF.addEventListener("change", () => {
  tlb_data.dateFormat = tlb_dateF.value;
  settingsState.setTlbData(tlb_data);
});
tlb_timeF.addEventListener("change", () => {
  tlb_data.timeFormat = tlb_timeF.value;
  settingsState.setTlbData(tlb_data);
});
tlb_timeS.addEventListener("change", () => {
  tlb_data.seconds = tlb_timeS.checked;
  settingsState.setTlbData(tlb_data);
});

document.getElementById("btn-res").onclick = () => {
  const r = confirm(
    "You will not lose your bookmarks, only the settings!\nAre you sure you want to reset the NTP settings?"
  );
  if (r) {
    storage.clear();
    ntoast.warn("Reset of settings done!");
    setTimeout(() => location.reload(), 1000);
  }
};

// Version label
const vLabel = document.getElementById("vLabel");
if (vLabel) vLabel.textContent = `v${ntp_version}`;

// Theme auto-switch settings
const startTimeDisplay = document.getElementById("startTime");
const endTimeDisplay = document.getElementById("endTime");
const autoSwitchCheckbox = document.getElementById("auto-switch");
const autoSwitchTypeSelect = document.getElementById("auto-switch-type");
const timeRangeContainer = document.getElementById("time-range-container");
const startTimeSlider = document.getElementById("start-time");
const endTimeSlider = document.getElementById("end-time");

function updateTimeRangeDisplay() {
  startTimeDisplay.textContent =
    tlb_data.timeFormat == 24
      ? `${startTimeSlider.value.padStart(2, "0")}:00`
      : formatTime(startTimeSlider.value);
  endTimeDisplay.textContent =
    tlb_data.timeFormat == 24
      ? `${endTimeSlider.value.padStart(2, "0")}:00`
      : formatTime(endTimeSlider.value);
}

function checkSystemPreference() {
  toggleTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}

function checkTimeBased() {
  const h = new Date().getHours();
  const isDark =
    ntp_theme.darkModeStart < ntp_theme.darkModeEnd
      ? h >= ntp_theme.darkModeStart && h < ntp_theme.darkModeEnd
      : h >= ntp_theme.darkModeStart || h < ntp_theme.darkModeEnd;
  toggleTheme(isDark ? "dark" : "light");
}

function updateTheme() {
  if (!ntp_theme.autoSwitch) return;
  ntp_theme.autoSwitchType === "system" ? checkSystemPreference() : checkTimeBased();
}

function initializeThemeSettings() {
  autoSwitchCheckbox.checked = ntp_theme.autoSwitch;
  autoSwitchTypeSelect.value = ntp_theme.autoSwitchType;
  startTimeSlider.value = ntp_theme.darkModeStart;
  endTimeSlider.value = ntp_theme.darkModeEnd;
  updateTimeRangeDisplay();

  const sysPrefLabel = document.getElementById("system-preference-label");
  const darkMQ = window.matchMedia("(prefers-color-scheme: dark)");
  function updateSysPrefLabel() {
    sysPrefLabel.textContent = darkMQ.matches ? "Dark" : "Light";
  }
  updateSysPrefLabel();
  darkMQ.addEventListener("change", updateSysPrefLabel);

  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  const shortcutEl = document.getElementById("theme-shortcut-label");
  if (isMac) {
    shortcutEl.innerHTML = "<kbd>⌥</kbd> + <kbd>T</kbd>";
  }

  autoSwitchCheckbox.addEventListener("change", () => {
    updateNtpTheme({ autoSwitch: autoSwitchCheckbox.checked });
    updateTheme();
  });

  autoSwitchTypeSelect.addEventListener("change", () => {
    updateNtpTheme({ autoSwitchType: autoSwitchTypeSelect.value });
    timeRangeContainer.style.display = ntp_theme.autoSwitchType === "time" ? "block" : "none";
    updateTheme();
  });

  startTimeSlider.addEventListener("input", () => {
    updateNtpTheme({ darkModeStart: parseInt(startTimeSlider.value) });
    updateTimeRangeDisplay();
    if (ntp_theme.autoSwitch && ntp_theme.autoSwitchType === "time") checkTimeBased();
  });

  endTimeSlider.addEventListener("input", () => {
    updateNtpTheme({ darkModeEnd: parseInt(endTimeSlider.value) });
    updateTimeRangeDisplay();
    if (ntp_theme.autoSwitch && ntp_theme.autoSwitchType === "time") checkTimeBased();
  });

  timeRangeContainer.style.display = ntp_theme.autoSwitchType === "time" ? "block" : "none";
  updateTheme();

  window.matchMedia("(prefers-color-scheme: dark)").addListener(updateTheme);
  setInterval(updateTheme, 60000);

  const toggles = document.getElementsByClassName("theme-toggle");
  for (var i = 0; i < toggles.length; i++) {
    toggles[i].onclick = function () {
      toggleTheme();
    };
  }
}

function initBookmarksSettings() {
  const bk_time = storage.get("bk_time");
  document.getElementById("last_sync").innerText = bk_time || "Never";

  document.getElementById("sync-bk").onclick = () => {
    getBookmarks();
    ntoast.success("Bookmarks sync started.");
  };

  let sb_data = storage.get("sb_data");
  if (!sb_data) {
    sb_data = {
      placeholder: "Search with ddg..",
      default: "d",
      bang: "!",
      b: "https://bing.com/search?q=",
      g: "https://google.com/search?q=",
      d: "https://duckduckgo.com/?q=",
      r: "https://www.reddit.com/search?q=",
      y: "https://www.youtube.com/results?q=",
    };
    storage.set("sb_data", sb_data);
  }

  const sb_len = document.getElementById("sb_txt");
  let sb_len_v = "";
  for (var key in sb_data) {
    sb_len_v += key + " -> " + sb_data[key] + "\n";
  }
  sb_len.value = sb_len_v;
  sb_len.addEventListener("blur", () => {
    const trim = (s) =>
      s.replace(/(^\s*)|(\s*$)/gi, "").replace(/[ ]{2,}/gi, " ").replace(/\n /, "\n");
    const tlen = trim(sb_len.value) + "\n";
    const lines = tlen.split("\n").filter((l) => l.trim() !== "");
    const sKc = {};
    const errors = [];
    for (var i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("placeholder")) {
        sKc["placeholder"] = line.substring(line.indexOf("->") + 2).trim();
      } else {
        const parts = line.split("->");
        if (parts.length !== 2) {
          errors.push(`Invalid syntax on line ${i + 1}: ${line}`);
        } else {
          sKc[trim(parts[0])] = trim(parts[1]);
        }
      }
    }
    if (!sKc.hasOwnProperty("default")) errors.push("Missing required field: default");
    if (!sKc.hasOwnProperty("bang")) errors.push("Missing required field: bang");
    if (!sKc.hasOwnProperty("placeholder")) sKc["placeholder"] = "";
    if (errors.length > 0) {
      alert("Errors in search bar configuration:\n" + errors.join("\n"));
    } else {
      storage.set("sb_data", sKc);
    }
  });
}

function initSidebarSettings() {
  const sidebar_config = settingsState.getSidebarConfig();
  const sidebarEnabledToggle = document.getElementById("sidebar-enabled");
  if (sidebarEnabledToggle) {
    sidebarEnabledToggle.checked = sidebar_config.left.enabled !== false;
    sidebarEnabledToggle.addEventListener("change", () => {
      const cfg = structuredClone(settingsState.getSidebarConfig());
      cfg.left.enabled = sidebarEnabledToggle.checked;
      settingsState.setSidebarConfig(cfg);
    });
  }
}

function initStorageStats() {
  const size_p = document.getElementById("size_progress");

  function gen(n) {
    return new Array(n * 1024 + 1).join("a");
  }

  function set_maxSize() {
    const quotaKb = storage.quotaKb;
    if (quotaKb) {
      if (!storage.get("ls_size")) storage.set("ls_size", quotaKb);
    } else if (!storage.get("ls_size")) {
      let i = 0;
      try {
        for (i = 0; i <= 10000; i += 250) {
          storage.set("test", gen(i));
        }
      } catch (e) {
        storage.remove("test");
        storage.set("ls_size", i ? i - 250 : 0);
      }
    }
    const size = storage.get("ls_size");
    document.getElementById("size").innerHTML = size;
    size_p.setAttribute("maxValue", size);
  }

  function get_usedSize() {
    const all = storage.getAll();
    let bytes = 0;
    for (const key in all) {
      bytes += (JSON.stringify(all[key]).length + key.length) * 2;
    }
    const total = (bytes / 1024).toFixed(0);
    document.getElementById("size_used").innerHTML = total;
    size_p.setAttribute("value", total);
  }

  const ls_size = storage.get("ls_size");
  if (ls_size == undefined) {
    get_usedSize();
    set_maxSize();
  } else {
    document.getElementById("size").innerHTML = storage.get("ls_size");
    get_usedSize();
  }

  document.getElementById("size_calc").onclick = () => {
    get_usedSize();
    set_maxSize();
  };
}

function initWidgetTabs() {
  const tabs = document.querySelectorAll(".wdg-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".wdg-tab-panel").forEach((p) => { p.hidden = true; });
      tab.classList.add("active");
      const panel = document.getElementById(tab.dataset.tab);
      if (panel) panel.hidden = false;
    });
  });
}

function onReady() {
  aos();
  pagesRoute();
  initializeThemeSettings();
  initBookmarksSettings();
  initSidebarSettings();
  initWidgetTabs();
  initWidgetSettings();
  initWeatherSettings({ ntoast });
  initBackgroundSettings({
    ntp_bdy,
    ntoast,
    getNtpTheme: () => ntp_theme,
    f_save_bdy,
    updateNtpTheme,
    ntp_version,
    dlg_color_picker,
  });
  initStorageStats();
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", onReady);
} else {
  onReady();
}
