import packageJSON from "../../package.json";
import { toast } from "./components/toast";
import { aos } from "./components/aos";
import { gotop } from "./components/gotop";
import { storage } from "./components/localStorage";
import { settingsState, DEFAULTS } from "./settings/state";
import "../css/blank.css";

import { applyBackground } from "./blank/background/apply";
import { BackgroundStore } from "./blank/BackgroundStore";
import { getTabs } from "./blank/tabs";
import { WIDGETS } from "./widgets/registry";
import { mountRegion, mountMain } from "./widgets/panelHost";
import { ensureWidgetsSeeded } from "./widgets/resolver";

await storage.init();
await settingsState.init(storage);
ensureWidgetsSeeded(WIDGETS);
settingsState.subscribeExternalChanges(storage);

const dialog_changelog = document.querySelector("#dlg_changelog");

const ntp_bdy = document.body;
var ntp_theme = settingsState.getNtpTheme();

// Apply the stored theme on load, mirroring options.js. The onChange handler
// below only fires on a *change*, so without this the NTP started with no
// data-theme at all: a stored dark theme rendered light until something
// toggled it, and the DaisyUI theme tokens (keyed to [data-theme]) never
// resolved, leaving migrated components unstyled.
ntp_bdy.setAttribute("data-theme", ntp_theme.value || "light");

const ntp_version = packageJSON.version;
var bzversion = storage.get("ntp_version");
if (bzversion !== ntp_version) {
  dialog_changelog.showModal();
  storage.set("ntp_version", ntp_version);
}

var ntoast = toast({ timeout: 2000 });
var tlb_data = settingsState.getTlbData();

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
    ntoast.error("Something gone wrong ! Info _:" + err.message);
  }
}

function toggleTheme(theme) {
  const newTheme =
    theme ||
    (ntp_bdy.getAttribute("data-theme") === "light" ? "dark" : "light");
  updateNtpTheme({ value: newTheme });
}

function updateTheme() {
  if (!ntp_theme.autoSwitch) return;
  if (ntp_theme.autoSwitchType === "system") {
    toggleTheme(
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light",
    );
  } else {
    const h = new Date().getHours();
    const isDark =
      ntp_theme.darkModeStart < ntp_theme.darkModeEnd
        ? h >= ntp_theme.darkModeStart && h < ntp_theme.darkModeEnd
        : h >= ntp_theme.darkModeStart || h < ntp_theme.darkModeEnd;
    toggleTheme(isDark ? "dark" : "light");
  }
}

BackgroundStore.apply(settingsState.getBackgroundConfig(), ntp_bdy);
applyBackground(ntp_bdy);

function displayClock() {
  const now = new Date();
  const userLocale =
    tlb_data.dateFormat === "auto" ? navigator.language || "en-US" : "en-US";
  const formattedDate = now.toLocaleDateString(userLocale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = now.toLocaleTimeString(userLocale, {
    hour: "2-digit",
    minute: "2-digit",
    second: tlb_data.seconds ? "2-digit" : undefined,
    hour12: tlb_data.timeFormat === "12",
  });
  document.getElementById("clock").textContent = formattedTime;
  document.getElementById("date").textContent = formattedDate;
}
displayClock();
setInterval(displayClock, 1000);

document.getElementById("open-options").onclick = () =>
  chrome.runtime.openOptionsPage();

document.addEventListener("keydown", (event) => {
  if (event.code === "KeyS" && event.ctrlKey) {
    document.getElementById("sb_input").focus();
  } else if (event.code === "KeyT" && event.altKey) {
    toggleTheme();
  }
});

function onDOMReady() {
  aos();
  gotop();

  // Apply auto-switch theme
  updateTheme();
  window.matchMedia("(prefers-color-scheme: dark)").addListener(updateTheme);
  setInterval(updateTheme, 60000);

  const toggles = document.getElementsByClassName("theme-toggle");
  for (var i = 0; i < toggles.length; i++) {
    toggles[i].onclick = function () {
      toggleTheme();
    };
  }

  // Mount rails + main (search/bookmarks)
  const railLeft = document.getElementById("rail-l");
  const railRight = document.getElementById("rail-r");
  const mainWidgets = document.getElementById("main-widgets");

  function renderWidgets() {
    const widgetsCfg = settingsState.getWidgets();
    mountRegion(railLeft, widgetsCfg.layout.left, WIDGETS, { ntoast, getTabs });
    mountRegion(railRight, widgetsCfg.layout.right, WIDGETS, { ntoast });
    mountMain(mainWidgets, widgetsCfg.layout.main, WIDGETS, { ntoast, getTabs });
  }

  renderWidgets();

  settingsState.onChange('widgets', () => {
    document.body.classList.remove('clock-widget-active');
    renderWidgets();
  });
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", onDOMReady);
} else {
  onDOMReady();
}
