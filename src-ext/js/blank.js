import A11yDialog from "a11y-dialog";
import packageJSON from "../../package.json";
import { toast } from "./components/toast";
import { aos } from "./components/aos";
import { storage } from "./components/localStorage";
import { settingsState, DEFAULTS } from "./settings/state";
import "../sass/blank.sass";

import { initBookmarks } from "./blank/bookmarks";
import { applyBackground } from "./blank/background/apply";
import { BackgroundStore } from "./blank/BackgroundStore";
import { getTabs } from "./blank/tabs";
import { WIDGETS } from "./widgets/registry";
import { mountSidebar } from "./widgets/panelHost";

await storage.init();
await settingsState.init(storage);
settingsState.subscribeExternalChanges(storage);

const dialog_changelog = new A11yDialog(
  document.querySelector("#dlg_changelog"),
);

const ntp_bdy = document.body;
var ntp_theme = settingsState.getNtpTheme();

const ntp_version = packageJSON.version;
var bzversion = storage.get("ntp_version");
if (bzversion !== ntp_version) {
  dialog_changelog.show();
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
  if (event.key === "s" && event.ctrlKey) {
    document.getElementById("sb_input").focus();
  } else if (event.key === "t" && event.ctrlKey) {
    toggleTheme();
  }
});

await initBookmarks({ ntoast, getTabs });

function onDOMReady() {
  aos();

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

  // Mount sidebars
  const sidebar_config = settingsState.getSidebarConfig();
  const ntpSidebar = document.getElementById("tabs");
  const rightSidebar = document.getElementById("right-sidebar");

  if (!sidebar_config.left.enabled) ntpSidebar.hidden = true;

  mountSidebar(ntpSidebar, 'left', WIDGETS, { ntoast, getTabs });
  mountSidebar(rightSidebar, 'right', WIDGETS, { ntoast });

  settingsState.onChange('sidebarConfig', () => {
    const cfg = settingsState.getSidebarConfig();
    ntpSidebar.hidden = !cfg.left.enabled;
    document.body.classList.remove('clock-widget-active');
    mountSidebar(ntpSidebar, 'left', WIDGETS, { ntoast, getTabs });
    mountSidebar(rightSidebar, 'right', WIDGETS, { ntoast });
  });
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", onDOMReady);
} else {
  onDOMReady();
}
