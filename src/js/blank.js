import A11yDialog from "a11y-dialog";
import Croppie from "croppie";
import Picker from "vanilla-picker";
import packageJSON from "../../package.json";
import { gotop } from "./components/gotop";
import { toast } from "./components/toast";
import { pagesRoute } from "./components/pagesRoute";
import { sidebar } from "./components/sidebar";
import { aos } from "./components/aos";
import {
  random_gradient,
  selectElement,
  capitalizeF,
  diff_hours,
  getJSON,
  ls_get,
  ls_set,
  formatTime,
  jsoncat,
  dataURItoBlob,
} from "./components/utilities";
import icons from "../data/weatherIcons.json";
import "../sass/blank.sass";

// Constants
const DB_NAME = "b2ntp_DB";
const STORE_NAME = "images";
const DB_VERSION = 1;
const DEFAULT_THEME = {
  value: "",
  autoSwitch: true,
  autoSwitchType: "system",
  darkModeStart: 20,
  darkModeEnd: 6,
};
const SAFE_DATA = [
  "sb_data",
  "tlb_data",
  "wth_data",
  "ntp_theme",
  "ntp_bdy",
  "ntp_mtc",
];
const SAFE_DATA_THEME = ["ntp_theme", "ntp_bdy", "ntp_mtc"];
const SAFE_DB_THEME = ["bg_custom_d", "bg_custom_l"];

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore(STORE_NAME);
    };
  });
}
async function saveBackgroundImage(key, imageBlob) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(imageBlob, key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error(`Failed to save background image for key ${key}:`, error);
    throw error; // Re-throw the error to be caught by the caller
  }
}
async function getBackgroundImage(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      if (request.result instanceof Blob) {
        resolve(URL.createObjectURL(request.result));
      } else {
        resolve(request.result);
      }
    };
  });
}

async function listBackgroundImages() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAllKeys();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function deleteBackgroundImage(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

const dlg_color_picker = new A11yDialog(document.querySelector("#dlg_clvn"));
const dialog_support = new A11yDialog(document.querySelector("#dlg_support"));
const dialog_settings = new A11yDialog(document.querySelector("#dlg_settings"));
const dialog_changelog = new A11yDialog(
  document.querySelector("#dlg_changelog")
);

const ntp_bdy = document.body;
var ntp_theme = ls_get("ntp_theme");

const ntp_version = packageJSON.version;
var bzversion = ls_get("ntp_version");
console.log(bzversion, ntp_version);
if (bzversion !== ntp_version) {
  //Show changelog
  dialog_changelog.show();
  //Set ntp_version
  ls_set("ntp_version", ntp_version);
}

//Get bk_data from browser
function getBookmarks() {
  chrome.bookmarks.getTree(function (itemTree) {
    var fldh = itemTree.title;
    var urlh = {};
    itemTree.forEach((item) => {
      if (item.children) processFolder(item);
      else if (item.url) urlh[item.title] = [item.url, item.id];
    });
    if (Object.keys(urlh).length > 0) bk_data[fldh] = [urlh, itemTree.id];
    //Move the bar folder on top
    var lastK = Object.keys(bk_data)[Object.keys(bk_data).length - 1];
    var lastEl = {};
    lastEl[lastK] = bk_data[lastK];
    bk_data = jsoncat(lastEl, bk_data);
    //Save on local storage
    ls_set("bk_data", bk_data);
    const time = new Date();
    ls_set("bk_time", time);
    document.getElementById("last_sync").innerText = ls_get("bk_time");
    handleSearch();
    console.log("getBookmarks - > Completed");
  });
}

/* ---------------- Toast Alert --------------- */
var ntoast = new toast({
  timeout: 2000,
});

/* ------- Data Setup and Configuration ------- */
var bk_data = ls_get("bk_data");
var bk_time = ls_get("bk_time");
var sb_data = ls_get("sb_data");
var wth_data = ls_get("wth_data");
var tlb_data = ls_get("tlb_data");
document.getElementById("last_sync").innerText = bk_time;
var bg_value = getComputedStyle(ntp_bdy).getPropertyValue("--bg-img");
var grid_wrap = getComputedStyle(ntp_bdy).getPropertyValue("--grid-wrap");
var grid_width = getComputedStyle(ntp_bdy).getPropertyValue("--grid-width");
async function imgBackground(lightUrl, darkUrl) {
  const loadImage = async (url, key) => {
    try {
      const img = await new Promise((resolve, reject) => {
        const imgElement = new Image();
        imgElement.onload = () => resolve(imgElement);
        imgElement.onerror = () =>
          reject(new Error(`Failed to load image: ${url}`));
        imgElement.src = url;
      });
      return { img, url };
    } catch (error) {
      console.error(error);
      // Attempt to refetch from IndexedDB
      try {
        const refetchedUrl = await getBackgroundImage(key);
        if (refetchedUrl && refetchedUrl !== url) {
          return loadImage(refetchedUrl, key); // Recursively try with new URL
        }
      } catch (refetchError) {
        console.error("Failed to refetch from IndexedDB:", refetchError);
      }
      return { img: null, url: null };
    }
  };

  try {
    const [
      { img: lightImg, url: updatedLightUrl },
      { img: darkImg, url: updatedDarkUrl },
    ] = await Promise.all([
      loadImage(lightUrl, "bg_custom_l"),
      loadImage(darkUrl, "bg_custom_d"),
    ]);

    const bgoverlay = document.getElementById("background_overlay");
    const bglight = document.getElementById("background-light");
    const bgdark = document.getElementById("background-dark");

    if (lightImg !== null && updatedLightUrl) {
      bglight.style.backgroundImage = `url(${updatedLightUrl})`;
      ntp_bdy.style.setProperty("--bg-img-l", `url('${updatedLightUrl}')`);
    }
    if (darkImg !== null && updatedDarkUrl) {
      bgdark.style.backgroundImage = `url(${updatedDarkUrl})`;
      ntp_bdy.style.setProperty("--bg-img-d", `url('${updatedDarkUrl}')`);
    }
    bgoverlay.style.opacity = "1";

    // If URLs have changed, update localStorage
    if (updatedLightUrl !== lightUrl || updatedDarkUrl !== darkUrl) {
      f_save_bdy();
    }
  } catch (error) {
    console.error("Error loading background images:", error);
  }
}
async function applyBackground() {
  if (localStorage.ntp_bdy !== undefined) {
    ntp_bdy.setAttribute("style", localStorage.ntp_bdy.replace('"', ""));
  }
  let bg_l_value = getComputedStyle(ntp_bdy)
    .getPropertyValue("--bg-img-l")
    .trim();
  let bg_d_value = getComputedStyle(ntp_bdy)
    .getPropertyValue("--bg-img-d")
    .trim();

  bg_l_value = bg_l_value.replace(/^url\(['"]?|['"]?\)$/g, "");
  bg_d_value = bg_d_value.replace(/^url\(['"]?|['"]?\)$/g, "");

  if (bg_l_value === "-" || bg_l_value === "") {
    bg_l_value = "../assets/svg/b2ntp_bg.svg";
  } else if (bg_l_value.startsWith("bg_custom_")) {
    bg_l_value = await getBackgroundImage(bg_l_value);
  }

  if (bg_d_value === "-" || bg_d_value === "") {
    bg_d_value = "../assets/svg/b2ntp_bg_d.svg";
  } else if (bg_d_value.startsWith("bg_custom_")) {
    bg_d_value = await getBackgroundImage(bg_d_value);
  }

  ntp_bdy.style.setProperty("--bg-img-l", `url('${bg_l_value}')`);
  ntp_bdy.style.setProperty("--bg-img-d", `url('${bg_d_value}')`);

  imgBackground(bg_l_value, bg_d_value);
}

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
  ls_set("sb_data", sb_data);
}
if (!sb_data.bang) {
  sb_data.bang = "!";
  ls_set("sb_data", sb_data);
}
if (!bk_data || !bk_time || diff_hours(bk_time) > 60) {
  bk_data = {};
  getBookmarks();
  const message =
    !bk_data || !bk_time
      ? "bk_data undefined"
      : "Passed 60 minutes, updated from bookmarks";
  console.log(message);
  if (message !== "bk_data undefined") {
    ntoast.success(message);
  }
}
if (!wth_data) {
  wth_data = {
    status: false,
    api: "",
    lon: "",
    lat: "",
  };
}
if (!tlb_data) {
  tlb_data = {
    dateFormat: "auto",
    timeFormat: "24",
    seconds: false,
  };
}

function updateNtpTheme(updates) {
  ntp_theme = { ...ntp_theme, ...updates };
  const themeString = JSON.stringify(ntp_theme);
  ls_set("ntp_theme", ntp_theme);
  logWithTimestamp(`ntp_theme updated: ${themeString}`);
}

if (!ntp_theme || typeof ntp_theme !== "object" || ntp_theme === null) {
  console.log("ntp_theme invalid, resetting to default");
  ntp_theme = DEFAULT_THEME;
  ls_set("ntp_theme", ntp_theme);
}

function logWithTimestamp(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}
function toggleTheme(theme) {
  logWithTimestamp(`toggleTheme called with theme: ${theme}`);
  var newTheme;
  if (theme) {
    newTheme = theme;
  } else {
    newTheme =
      ntp_bdy.getAttribute("data-theme") === "light" ? "dark" : "light";
  }
  logWithTimestamp(`Setting theme to: ${newTheme}`);
  updateNtpTheme({ value: newTheme });
  ntp_bdy.setAttribute("data-theme", newTheme);
}

const startTimeDisplay = document.getElementById("startTime");
const endTimeDisplay = document.getElementById("endTime");
const autoSwitchCheckbox = document.getElementById("auto-switch");
const autoSwitchTypeSelect = document.getElementById("auto-switch-type");
const timeRangeContainer = document.getElementById("time-range-container");
const startTimeSlider = document.getElementById("start-time");
const endTimeSlider = document.getElementById("end-time");

// Initialize theme settings
function initializeThemeSettings() {
  logWithTimestamp(`Initializing theme settings -> ntp_theme: ${JSON.stringify(ntp_theme)}`);

  autoSwitchCheckbox.checked = ntp_theme.autoSwitch;
  autoSwitchTypeSelect.value = ntp_theme.autoSwitchType;
  startTimeSlider.value = ntp_theme.darkModeStart;
  endTimeSlider.value = ntp_theme.darkModeEnd;

  updateTimeRangeDisplay();

  // Event listeners
  autoSwitchCheckbox.addEventListener("change", () => {
    logWithTimestamp(`Auto switch changed to: ${autoSwitchCheckbox.checked}`);
    updateNtpTheme({ autoSwitch: autoSwitchCheckbox.checked });
    updateTheme();
  });

  autoSwitchTypeSelect.addEventListener("change", () => {
    updateNtpTheme({ autoSwitchType: autoSwitchTypeSelect.value });
    timeRangeContainer.style.display =
      ntp_theme.autoSwitchType === "time" ? "block" : "none";
    updateTheme();
  });

  startTimeSlider.addEventListener("input", () => {
    updateNtpTheme({ darkModeStart: parseInt(startTimeSlider.value) });
    updateTimeRangeDisplay();
    if (ntp_theme.autoSwitch && ntp_theme.autoSwitchType === "time") {
      checkTimeBased();
    }
  });

  endTimeSlider.addEventListener("input", () => {
    updateNtpTheme({ darkModeEnd: parseInt(endTimeSlider.value) });
    updateTimeRangeDisplay();
    if (ntp_theme.autoSwitch && ntp_theme.autoSwitchType === "time") {
      checkTimeBased();
    }
  });

  // Initial update
  timeRangeContainer.style.display =
    ntp_theme.autoSwitchType === "time" ? "block" : "none";
  updateTheme();

  // Listen for system theme changes
  window.matchMedia("(prefers-color-scheme: dark)").addListener(updateTheme);

  // Check theme every minute for time-based switching
  setInterval(updateTheme, 60000);
  var toggles = document.getElementsByClassName("theme-toggle");

  // Add click event listeners to theme toggles
  for (var i = 0; i < toggles.length; i++) {
    toggles[i].onclick = function () {
      toggleTheme();
    };
  }
}
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
function updateTheme() {
  logWithTimestamp(
    `updateTheme called, ntp_theme: ${JSON.stringify(ntp_theme)}`
  );
  logWithTimestamp(
    `localStorage ntp_theme: ${JSON.stringify(ls_get("ntp_theme"))}`
  );

  if (ntp_theme.autoSwitch) {
    logWithTimestamp("autoSwitch is true");
    if (ntp_theme.autoSwitchType === "system") {
      logWithTimestamp("autoSwitchType is system");
      checkSystemPreference();
    } else {
      logWithTimestamp("autoSwitchType is time");
      checkTimeBased();
    }
  } else {
    logWithTimestamp("autoSwitch is false");
  }
}
function checkSystemPreference() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  toggleTheme(prefersDark ? "dark" : "light");
}
function checkTimeBased() {
  logWithTimestamp(
    `checkTimeBased called, ntp_theme: ${JSON.stringify(ntp_theme)}`
  );
  const currentHour = new Date().getHours();
  const isDarkTime =
    ntp_theme.darkModeStart < ntp_theme.darkModeEnd
      ? currentHour >= ntp_theme.darkModeStart &&
        currentHour < ntp_theme.darkModeEnd
      : currentHour >= ntp_theme.darkModeStart ||
        currentHour < ntp_theme.darkModeEnd;

  toggleTheme(isDarkTime ? "dark" : "light");
}

applyBackground();

// General - Time&Data settings
const tlb_dateF = document.getElementById("dateFormat");
const tlb_timeF = document.getElementById("timeFormat");
const tlb_timeS = document.getElementById("timeSeconds");
tlb_dateF.value = tlb_data.dateFormat;
tlb_timeF.value = tlb_data.timeFormat;
tlb_timeS.checked = tlb_data.seconds;
tlb_dateF.addEventListener("change", () => {
  tlb_data.dateFormat = tlb_dateF.value;
  ls_set("tlb_data", tlb_data);
});
tlb_timeF.addEventListener("change", () => {
  tlb_data.timeFormat = tlb_timeF.value;
  ls_set("tlb_data", tlb_data);
});
tlb_timeS.addEventListener("change", () => {
  tlb_data.seconds = tlb_timeS.checked;
  ls_set("tlb_data", tlb_data);
});

/* ---------- Weather Settings Config --------- */
const wt_checkbox = document.getElementById("wt_status");
const wt_ik = document.getElementById("wt_ik");
const wt_ila = document.getElementById("wt_ila");
const wt_iln = document.getElementById("wt_iln");
var wth_status = wth_data.status;
wt_checkbox.checked = wth_status;
ntp_bdy.style.setProperty("--wt", wth_status ? "block" : "none");
wt_ik.value = wth_data.api;
wt_ila.value = wth_data.lat;
wt_iln.value = wth_data.lon;
wt_checkbox.onclick = () => {
  var wth_status = wt_checkbox.checked;
  ntp_bdy.style.setProperty("--wt", wth_status ? "block" : "none");
  f_save_wth();
};
wt_ik.addEventListener("blur", () => {
  f_save_wth();
});
wt_ila.addEventListener("blur", () => {
  f_save_wth();
});
wt_iln.addEventListener("blur", () => {
  f_save_wth();
});

function f_save_wth() {
  const status = document.getElementById("wt_status").checked;
  const api = document.getElementById("wt_ik").value;
  const lat = document.getElementById("wt_ila").value;
  const lon = document.getElementById("wt_iln").value;
  wth_data.status = status;
  if (api) wth_data.api = api;
  if (lon) wth_data.lon = lon;
  if (lat) wth_data.lat = lat;
  ls_set("wth_data", wth_data);
  f_setup_wth();
  ntoast.success("Weather widget configuration done");
}
function f_get_ll() {
  try {
    navigator.geolocation.getCurrentPosition(showPosition);
  } catch (e) {
    ntoast.error(e);
  }
}
function showPosition(position) {
  document.getElementById("wt_ila").value = position.coords.latitude;
  document.getElementById("wt_iln").value = position.coords.longitude;
}

async function f_setup_wth() {
  var appid = wth_data.api;
  if (appid.length <= 6 || appid === "" || !wth_status) {
    document.querySelectorAll(".wth_l").forEach((element) => {
      element.style.display = "none";
    });
    document.querySelectorAll(".wth_s").forEach((element) => {
      element.style.opacity = 1;
    });
    return;
  }

  if (
    (typeof localStorage.cachedWeatherUpdate === "undefined" ||
      Date.now() / 1000 - localStorage.cachedWeatherUpdate > 600) &&
    wth_data.lat != "" &&
    wth_data.lon != ""
  ) {
    document.querySelectorAll(".wth_s").forEach((element) => {
      element.style.display = "none";
    });

    var url = `https://api.openweathermap.org/data/2.5/find?lat=${wth_data.lat}&lon=${wth_data.lon}&cnt=1&appid=${appid}&callback=?`;
    var data = await getJSON(url);
    if (data === "") return;
    data = JSON.parse(data.substring(2, data.length - 1));

    var temp = (data.list[0].main.temp - 273.15).toFixed(0);
    var temp_f = (data.list[0].main.feels_like - 273.15).toFixed(0);
    var temp_min = (data.list[0].main.temp_min - 273.15).toFixed(0);
    var temp_max = (data.list[0].main.temp_max - 273.15).toFixed(0);
    var tt = "&#8451;";
    var windDeg = data.list[0].wind.deg;

    // Convert to Fahrenheit if needed
    if (0) {
      temp = (1.8 * temp + 32).toFixed(0);
      temp_f = (1.8 * temp_f + 32).toFixed(0);
      temp_min = (1.8 * temp_min + 32).toFixed(0);
      temp_max = (1.8 * temp_max + 32).toFixed(0);
      tt = "&#8457;";
    }

    // Apply changes to elements
    document.querySelectorAll(".wth_l").forEach((element) => {
      element.style.opacity = 1;
    });
    document.querySelectorAll(".wth_c").forEach((element) => {
      element.innerText = data.list[0].name;
    });
    document.querySelectorAll(".wth_i").forEach((element) => {
      element.innerHTML = icons[data.list[0].weather[0].icon];
    });
    document.querySelectorAll(".wth_d1").forEach((element) => {
      element.innerText = capitalizeF(data.list[0].weather[0].description);
    });
    document.querySelectorAll(".wth_t").forEach((element) => {
      element.innerHTML = temp + tt;
    });
    document.querySelectorAll(".wth_mm").forEach((element) => {
      element.innerHTML = temp_max + tt + " / " + temp_min + tt;
    });
    document.querySelectorAll(".wth_w").forEach((element) => {
      element.innerHTML = `<svg  xmlns="http://www.w3.org/2000/svg"  style="transform: rotate(${windDeg})" width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-circle-arrow-up"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 8l-4 4" /><path d="M12 8v8" /><path d="M16 12l-4 -4" /></svg> ${data.list[0].wind.speed} mps`;
    });
    document.querySelectorAll(".wth_h").forEach((element) => {
      element.innerHTML = `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-drop-circle"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.07 15.34c1.115 .88 2.74 .88 3.855 0c1.115 -.88 1.398 -2.388 .671 -3.575l-2.596 -3.765l-2.602 3.765c-.726 1.187 -.443 2.694 .672 3.575z" /><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /></svg> ${data.list[0].main.humidity}%`;
    });
  }

  // Common updates
  document.querySelectorAll(".wth_l").forEach((element) => {
    element.style.display = "none";
  });
  document.querySelectorAll(".wth_main").forEach((element) => {
    element.style.opacity = 1;
  });
}

f_setup_wth();

//Set up Search data
const sb_len = document.getElementById("sb_txt");
var sk = sb_data;
var sb_len_v = "";
for (var key in sk) {
  sb_len_v += key + " -> " + sk[key] + "\n";
}
sb_len.value = sb_len_v;
sb_len.addEventListener("blur", () => {
  f_save_sb();
});
function f_trim(s) {
  s = s.replace(/(^\s*)|(\s*$)/gi, "");
  s = s.replace(/[ ]{2,}/gi, " ");
  s = s.replace(/\n /, "\n");
  return s;
}
//Function save body style
function f_save_bdy() {
  try {
    ls_set("ntp_bdy", ntp_bdy.getAttribute("style"));
  } catch (err) {
    ntoast.error("Something gone wrong ! Info _:" + err.message);
  }
}

function f_save_sb() {
  var tlen = f_trim(document.getElementById("sb_txt").value) + "\n";
  var lines = tlen.split("\n").filter((line) => line.trim() !== "");
  var sKc = {};
  var errors = [];

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (line.startsWith("placeholder")) {
      sKc["placeholder"] = line.substring(line.indexOf("->") + 2).trim();
    } else {
      var parts = line.split("->");
      if (parts.length !== 2) {
        errors.push(`Invalid syntax on line ${i + 1}: ${line}`);
      } else {
        sKc[f_trim(parts[0])] = f_trim(parts[1]);
      }
    }
  }

  // Check for required fields
  if (!sKc.hasOwnProperty("default")) {
    errors.push("Missing required field: default");
  }
  if (!sKc.hasOwnProperty("bang")) {
    errors.push("Missing required field: bang");
  }

  // Handle placeholder
  if (!sKc.hasOwnProperty("placeholder")) {
    sKc["placeholder"] = ""; // Set to empty string if not provided
  }

  if (errors.length > 0) {
    alert(
      "Errors in search bar configuration:\n" +
        errors.join("\n") +
        "\n\nMake sure to follow the syntax:\nplaceholder -> [value]\nkey -> value"
    );
  } else {
    sb_data = sKc;
    ls_set("sb_data", sb_data);
    sb_input.placeholder = sb_data["placeholder"];
    console.log("Search bar configuration saved successfully:", sb_data);
  }
}

// ---------- BUILD PAGE ----------
var pivotmatch = 0;
var totalbookmarks = 0;
var prevregexp = "";

//Recursive function for folders
function processFolder(item) {
  let fldk = item.title;
  let urls = {};
  item.children.forEach((child) => {
    if (child.children) processFolder(child);
    else if (child.url) urls[child.title] = [child.url, child.id];
  });
  if (Object.keys(urls).length > 0) bk_data[fldk] = [urls, item.id];
}

function handleSearch(query = "") {
  const p = document.getElementById("bookmarks");
  const actionElement = document.getElementById("action");
  const actionInput = actionElement.children[0];

  // Check if the query ends with double space (search on default engine)
  if (query.endsWith("  ")) {
    p.innerHTML = ""; // Clear bookmarks
    query = query.trim();
    actionElement.action = sb_data[sb_data.default] + encodeURIComponent(query);
    actionInput.name = "q";
    return;
  }

  query = query.trim();

  // Check for custom search engine shortcuts
  for (const [shortcut, url] of Object.entries(sb_data)) {
    if (
      shortcut !== "placeholder" &&
      shortcut !== "default" &&
      shortcut !== "bang" &&
      query.startsWith(sb_data.bang + shortcut + " ")
    ) {
      const searchQuery = query.slice(
        sb_data.bang.length + shortcut.length + 1
      );
      p.innerHTML = ""; // Clear bookmarks
      actionElement.action = url + encodeURIComponent(searchQuery);
      actionInput.name = "q";
      return;
    }
  }

  // Reset bookmarks container
  p.innerHTML = "";

  // Reset counters and update regexp
  totalbookmarks = 0;
  pivotmatch = query === prevregexp ? pivotmatch : 0;
  prevregexp = query;

  const fragment = document.createDocumentFragment();
  const folderSections = {};

  // If no search term, display all bookmarks
  if (!query) {
    Object.entries(bk_data).forEach(([folderName, [urls, folderId]]) => {
      folderSections[folderName] = createSection(folderName, folderId);
      Object.entries(urls).forEach(([title, [url, id]], index) => {
        const link = createBookmarkLink(
          { folderName, title, url, id, folderId },
          index === 0
        );
        folderSections[folderName]
          .querySelector("div:not(.title)")
          .appendChild(link);
        totalbookmarks++;
      });
    });
  } else {
    // Perform simple substring search
    const matches = [];
    Object.entries(bk_data).forEach(([folderName, [urls, folderId]]) => {
      Object.entries(urls).forEach(([title, [url, id]]) => {
        if (
          title.toLowerCase().includes(query.toLowerCase()) ||
          folderName.toLowerCase().includes(query.toLowerCase())
        ) {
          matches.push({ folderName, title, url, id, folderId });
        }
      });
    });

    matches.forEach((item, index) => {
      if (!folderSections[item.folderName]) {
        folderSections[item.folderName] = createSection(
          item.folderName,
          item.folderId
        );
      }

      const link = createBookmarkLink(item, index === 0);
      folderSections[item.folderName]
        .querySelector("div:not(.title)")
        .appendChild(link);
      totalbookmarks++;
    });
  }

  Object.values(folderSections).forEach((section) => {
    if (section.querySelectorAll("a").length > 0) {
      fragment.appendChild(section);
    }
  });

  p.appendChild(fragment);

  if (totalbookmarks === 0) {
    actionElement.action = sb_data[sb_data.default];
    actionInput.name = "q";
  }

  // Scroll to selected element if exists
  const selectedElement = p.querySelector(".selected");
  if (selectedElement) {
    selectedElement.scrollIntoView({ block: "center" });
  }
}

function createSection(folderName, folderId) {
  const section = document.createElement("div");
  section.id = folderId;
  section.className = "section";

  const title = document.createElement("div");
  title.className = "title";
  title.textContent = folderName;
  section.appendChild(title);

  const inner = document.createElement("div");
  section.appendChild(inner);

  return section;
}

function createBookmarkLink(item, isFirstResult) {
  const link = document.createElement("a");
  link.id = item.id;
  link.href = item.url;
  link.textContent = item.title;

  if (isFirstResult && prevregexp !== "") {
    link.className = "selected";
    document.getElementById("action").action = item.url;
    document.getElementById("action").children[0].removeAttribute("name");
  }

  return link;
}
document.getElementById("sb_input").addEventListener("input", (event) => {
  handleSearch(event.target.value);
});
document.getElementById("action").addEventListener("submit", (event) => {
  const query = document.getElementById("sb_input").value;
  if (
    !query.endsWith("  ") &&
    document.querySelector("#bookmarks a.selected")
  ) {
    event.preventDefault();
    window.location.href = document.querySelector("#bookmarks a.selected").href;
  }
});

document.getElementById("sb_input").onkeydown = function (e) {
  const bookmarks = document.getElementById("bookmarks");
  const sections = bookmarks.querySelectorAll(".section");
  const currentSelected = bookmarks.querySelector(".selected");
  let newSelected;

  switch (e.keyCode) {
    case 38: // Up arrow
      if (currentSelected) {
        newSelected =
          currentSelected.previousElementSibling ||
          currentSelected.parentElement.lastElementChild;
        if (!newSelected || newSelected.classList.contains("title")) {
          const prevSection =
            currentSelected.closest(".section").previousElementSibling ||
            sections[sections.length - 1];
          newSelected = prevSection.querySelector("a:last-child");
        }
      } else {
        newSelected = bookmarks.querySelector("a:last-child");
      }
      break;
    case 40: // Down arrow
      if (currentSelected) {
        newSelected = currentSelected.nextElementSibling;
        if (!newSelected || newSelected.classList.contains("title")) {
          const nextSection =
            currentSelected.closest(".section").nextElementSibling ||
            sections[0];
          newSelected = nextSection.querySelector("a:first-child");
        }
      } else {
        newSelected = bookmarks.querySelector("a:first-child");
      }
      break;
    case 37: // Left arrow
      if (currentSelected) {
        const prevSection =
          currentSelected.closest(".section").previousElementSibling ||
          sections[sections.length - 1];
        newSelected = prevSection.querySelector("a:first-child");
      }
      break;
    case 39: // Right arrow
      if (currentSelected) {
        const nextSection =
          currentSelected.closest(".section").nextElementSibling || sections[0];
        newSelected = nextSection.querySelector("a:first-child");
      }
      break;
    default:
      return; // Exit for other keys
  }

  if (newSelected) {
    e.preventDefault();
    currentSelected?.classList.remove("selected");
    newSelected.classList.add("selected");
    newSelected.scrollIntoView({ block: "center" });
    document.getElementById("action").action = newSelected.href;
    document.getElementById("action").children[0].removeAttribute("name");
  }
};

document.getElementById("action").children[0].onkeypress = function (e) {
  if (e.key == "ArrowDown" || e.key == "ArrowUp") {
    return false;
  }
};

document.getElementById("get_ll").onclick = () => {
  f_get_ll();
};

document.getElementById("sync-bk").onclick = () => {
  console.log("Sync bk_data...");
  bk_data = {};
  getBookmarks();
  console.log("Sync from your bookmarks done!");
  ntoast.success("Sync from your bookmarks done !");
};
document.getElementById("btn-res").onclick = () => {
  var r = confirm(
    "You will not lose your bookmarks , only the settings !\nAre you sure you want to reset the ntp settings? "
  );
  if (r == true) {
    window.localStorage.clear();
    console.log("Reset of settings done !");
    ntoast.warn("Reset of settings done !");
    setTimeout(() => {
      location.reload();
    }, 1000);
  }
};

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

window.addEventListener("load", () => handleSearch());
var sb_input = document.getElementById("sb_input");
if (sb_data["placeholder"].length > 1) {
  sb_input.placeholder = sb_data["placeholder"];
}
sb_input.addEventListener("input", () => {
  handleSearch(sb_input.value);
});
ntp_bdy.onresize = handleSearch();
document.getElementById("action").onsubmit = function () {
  var svalue = this.children[0].value;
  if (svalue.charAt(1) == " " && sb_data.hasOwnProperty(svalue.charAt(0))) {
    this.children[0].value = svalue.substring(2);
  }
  return true;
};
displayClock();
setInterval(displayClock, 1000);

/* ----------- Config NTP Background ---------- */
//********* BG Wallpaper */
const wDevice = window.innerWidth ? window.innerWidth : screen.width;
const hDevice = window.innerHeight ? window.innerHeight + 56 : screen.height;
const bg_pld = document.getElementById("bg_pld"),
  crop = document.getElementById("crop"),
  result = document.getElementById("result"),
  imgRes = document.getElementById("imgRes"),
  crpp = document.getElementById("croppie");
var cr,
  cr_img = "",
  img_w = wDevice / 2.5,
  img_h = hDevice / 2.5,
  isCrop = 0;
while (img_w > 670) {
  img_w = img_w / 1.2;
  img_h = img_h / 1.2;
}
ntp_bdy.style.setProperty("--bg-cw", img_w + "px");
ntp_bdy.style.setProperty("--bg-ch", img_h + "px");

//Background input value
const wllp_value = document.getElementById("wllp_value");
//Input file for background
const wllp_file = document.getElementById("wllp_file");
const wllp_url = document.getElementById("wllp_url");
const wllp_gradient = document.getElementById("wllp_gradient");
const wllp_bg = document.getElementById("wllp_bg");
const wllp_custom = document.getElementById("wllp_custom");
const wllp_clearvalue = document.getElementById("wllp_clearvalue");
const wllp_default = document.getElementById("wllp_default");

wllp_value.value =
  ntp_theme.value == "dark"
    ? getComputedStyle(ntp_bdy).getPropertyValue("--bg-img-d")
    : getComputedStyle(ntp_bdy).getPropertyValue("--bg-img-l");
// Helper function to convert data URI to Blob

function revokeBackgroundUrls() {
  const bglight = document.getElementById("background-light");
  const bgdark = document.getElementById("background-dark");

  if (bglight.style.backgroundImage) {
    const lightUrl = bglight.style.backgroundImage
      .slice(4, -1)
      .replace(/['"]/g, "");
    if (lightUrl.startsWith("blob:")) URL.revokeObjectURL(lightUrl);
  }

  if (bgdark.style.backgroundImage) {
    const darkUrl = bgdark.style.backgroundImage
      .slice(4, -1)
      .replace(/['"]/g, "");
    if (darkUrl.startsWith("blob:")) URL.revokeObjectURL(darkUrl);
  }
}
function savebg_cropped() {
  const imageBlob = dataURItoBlob(imgRes.src);
  const key = `bg_custom_${ntp_theme.value == "dark" ? "d" : "l"}`;
  saveBackgroundImage(key, imageBlob)
    .then(() => {
      const blobUrl = URL.createObjectURL(imageBlob);
      ntp_bdy.style.setProperty(
        "--bg-img-" + (ntp_theme.value == "dark" ? "d" : "l"),
        `url('${blobUrl}')`
      );
      wllp_value.value = blobUrl;
      f_save_bdy();
      applyBackground(); // Apply the new background
      ntoast.success("Background saved!");
      cropCancel();
    })
    .catch((error) => {
      ntoast.error("Failed to save background");
    });
}

function f_wallp1() {
  var file = wllp_file.files[0];

  if (file && file.type.match("image.*")) {
    var reader = new FileReader();
    reader.onload = function (e) {
      bg_pld.style.display = "none";
      if (cr_img == "") {
        cr_img = e.target.result;
        cropInit();
      } else {
        cr_img = e.target.result;
        bindCropImg();
      }
      crop.style.display = "inline";
    };
    reader.readAsDataURL(file);
  }
}
function f_wallp2() {
  var url = prompt("Enter URL of the wallpaper. \nExample: ", "url");
  var img = new Image();
  img.crossOrigin = "Anonymous";
  img.onload = function (e) {
    bg_pld.style.display = "none";

    if (cr_img == "") {
      cr_img = img.src;
      cropInit();
    } else {
      cr_img = img.src;
      bindCropImg();
    }
    crop.style.display = "inline";
  };
  img.src = url;
}

function f_wallp3() {
  var rg = random_gradient();
  ntp_bdy.style.setProperty(
    "--bg-img-" + (ntp_theme.value == "dark" ? "d" : "l"),
    rg
  );
  wllp_value.value = rg;
  f_save_bdy();
  ntoast.success("Gradient background saved");
}
function isValidColor(color) {
  const colorRegex =
    /^(#[0-9A-Fa-f]{3}|#[0-9A-Fa-f]{6}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(?:0(?:\.\d+)?|1(?:\.0+)?)\s*\)|hsl\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*\)|hsla\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*,\s*(?:0(?:\.\d+)?|1(?:\.0+)?)\s*\))$/i;
  return colorRegex.test(color);
}
function f_wallp4() {
  var v = wllp_value.value;
  ntp_bdy.style.setProperty(
    "--bg-img-" + (ntp_theme.value == "dark" ? "d" : "l"),
    v
  );
  if (isValidColor(v))
    ntp_bdy.style.setProperty(
      "--bg-c" + (ntp_theme.value == "dark" ? "d" : "l"),
      v
    );
  f_save_bdy();
  ntoast.success("Background custom value saved");
}
function f_wallp5() {
  var v =
    ntp_theme.value == "dark"
      ? "url('../assets/svg/b2ntp_bg_d.svg')"
      : "url('../assets/svg/b2ntp_bg.svg')";
  wllp_value.value = v;
  ntp_bdy.style.setProperty(
    "--bg-img-" + (ntp_theme.value == "dark" ? "d" : "l"),
    v
  );
  f_save_bdy();
  ntoast.success("Default background saved");
}

wllp_file.addEventListener("change", f_wallp1);
wllp_url.addEventListener("click", f_wallp2);
wllp_gradient.addEventListener("click", f_wallp3);
wllp_bg.addEventListener("click", f_cp_bg);
wllp_custom.addEventListener("click", f_wallp4);
wllp_clearvalue.addEventListener("click", () => {
  document.getElementById("wllp_value").value = "";
});
wllp_default.addEventListener("click", f_wallp5);

const tg_r77 = document.getElementById("tg_r77");
const tg_r77vs = document.getElementById("tg_r77v");
var tg_r77v = parseInt(
  ntp_bdy.style.getPropertyValue("--bg-blur").replace("px", "")
);
tg_r77vs.innerText = tg_r77v;
if (isNaN(tg_r77v)) {
  tg_r77v = 0;
  tg_r77vs.innerText = tg_r77v;
  ntp_bdy.style.setProperty("--bg-blur", tg_r77v + "px");
  f_save_bdy();
}
tg_r77.value = tg_r77v;
tg_r77.addEventListener("input", function () {
  tg_r77v = parseInt(tg_r77.value);
  tg_r77vs.innerText = tg_r77v;
  ntp_bdy.style.setProperty("--bg-blur", tg_r77v + "px");
  f_save_bdy();
});

const tg_r777 = document.getElementById("tg_r777");
const tg_r777vs = document.getElementById("tg_r777v");
var tg_r777v = parseInt(
  ntp_bdy.style.getPropertyValue("--bg-dark").replace("%", "")
);
tg_r777vs.innerText = tg_r777v;
if (isNaN(tg_r777v)) {
  tg_r777v = 100;
  tg_r777vs.innerText = tg_r777v;
  ntp_bdy.style.setProperty("--bg-dark", tg_r777v + "%");
  f_save_bdy();
}
tg_r777.value = tg_r777v;
tg_r777.addEventListener("input", function () {
  tg_r777v = parseInt(tg_r777.value);
  tg_r777vs.innerText = tg_r777v;
  ntp_bdy.style.setProperty("--bg-dark", tg_r777v + "%");
  f_save_bdy();
});

//********* Cropping  *********/
function cropInit() {
  cr = new Croppie(crpp, {
    viewport: {
      width: img_w,
      height: img_h,
    },
    boundary: {
      width: img_w,
      height: img_h,
    },
    mouseWheelZoom: false,
    enableOrientation: true,
  });
  bindCropImg();
}

function bindCropImg() {
  cr.bind({
    url: cr_img,
  });
}

function cropCancel() {
  if (bg_pld.style.display == "none") {
    bg_pld.style.display = "inline";
    crop.style.display = "none";
    result.style.display = "none";
    wllp_file.value = "";
    isCrop = 0;
  }
}

function cropResult() {
  if (!isCrop) {
    isCrop = 1;
    cr.result({
      type: "base64", // canvas(base64)|html
      size: "{width:wDevice, height:hDevice}",
      format: "jpeg", //'jpeg'|'png'|'webp'
      quality: 1, //0~1
    }).then(function (resp) {
      crop.style.display = "none";
      imgRes.src = resp;
      result.style.display = "inline";
    });
  }
}
document.getElementById("b_cc").onclick = () => {
  cropCancel();
};
document.getElementById("b_cc2").onclick = () => {
  cropCancel();
};
document.getElementById("b_cr").onclick = () => {
  cropResult();
};
document.getElementById("b_sbgc").onclick = () => {
  savebg_cropped();
};

const t_style = document.getElementsByName("t-style");
if (grid_wrap === " wrap" && grid_width === " 33.33%") {
  t_style[1].checked = true;
} else if (grid_wrap === " none" && grid_width === " 33.33%") {
  t_style[0].checked = true;
} else {
  t_style[2].checked = true;
}
t_style.forEach((el) => {
  el.addEventListener("input", () => {
    var lv = el.value;
    if (lv == "h") {
      ntp_bdy.style.setProperty("--grid-wrap", "none");
      ntp_bdy.style.setProperty("--grid-width", "33.33%");
    } else if (lv == "v2") {
      ntp_bdy.style.setProperty("--grid-wrap", "wrap");
      ntp_bdy.style.setProperty("--grid-width", "50%");
    } else {
      ntp_bdy.style.setProperty("--grid-wrap", "wrap");
      ntp_bdy.style.setProperty("--grid-width", "33.33%");
    }
  });
});

/* ------------ Config Color Picker ----------- */
var cp_current_el;
var cp_type;
var current_color;
var initial_color;
var picker = new Picker({
  parent: document.querySelector("#cp_v"),
  popup: false,
});

/* ------------ CONTEXT MENU CONFIG ----------- */
/*
  const menu = document.querySelector(".context");
  const menuOption = document.querySelector(".context_item");
  let menuVisible = false;
  
  const toggleMenu = command => {
    menu.style.display = command === "show" ? "block" : "none";
    menuVisible = !menuVisible;
  };
  
  const setPosition = ({ top, left }) => {
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    toggleMenu("show");
  };

  window.addEventListener("click", e => {
    if (menuVisible) toggleMenu("hide");
  });
  
  menuOption.addEventListener("click", e => {
    console.log("mouse-option", e.target.innerHTML);
  });
  
  window.addEventListener("contextmenu", e => {
    e.preventDefault();
    const origin = {
      left: e.pageX,
      top: e.pageY
    };
    setPosition(origin);
    return false;
  });
*/

/* -------------- Config Croppie -------------- */
function f_cp_bg() {
  cp_type = "bgc" + (ntp_theme.value == "dark" ? "d" : "l");
  let color = getComputedStyle(ntp_bdy).getPropertyValue(
    "--bg-c" + (ntp_theme.value == "dark" ? "d" : "l")
  );
  picker.setColor(color, true);
  f_save_bdy();
  dlg_color_picker.show();
}
function f_cp_rgb(type, number) {
  cp_current_el = number;
  cp_type = "color_" + type;
  current_color = getComputedStyle(ntp_bdy).getPropertyValue(
    "--c" + (cp_type == "color_cl" ? "l" : "d") + number
  );
  console.log("f_rgb - cp_type : " + cp_type, " color : " + current_color);
  picker.setColor(current_color, true);
  dlg_color_picker.show();
}

dlg_color_picker.on("hide", () => {
  try {
    picker.setColor("#00000000", true);
  } catch (error) {
    console.error(`Failed to reset color: ${error}`);
  }
  current_color = initial_color;
});
picker.onChange = (color) => {
  current_color = color.hex;
};
// Log the color value when clicking the OK button
document.getElementById("cp_ok").addEventListener("click", () => {
  console.log(
    " OK - cp_type : ",
    cp_type,
    " cp number: ",
    cp_current_el,
    " color : ",
    current_color
  );
  if (cp_type == "color_cl" || cp_type == "color_cld") {
    ntp_bdy.style.setProperty(
      "--c" + (cp_type == "color_cl" ? "l" : "d") + cp_current_el,
      current_color
    );
  } else if (cp_type == "sb_preview_c") {
    ntp_bdy.style.setProperty("--sb_preview_c", current_color);
  } else if (cp_type == "bgcl" || cp_type == "bgcd") {
    ntp_bdy.style.setProperty(
      "--bg-img-" + (cp_type == "bgcl" ? "l" : "d"),
      "none"
    );
    ntp_bdy.style.setProperty(
      "--bg-c" + (cp_type == "bgcl" ? "l" : "d"),
      current_color
    );
    ntoast.success("Background color saved");
  } else if (cp_type == "mtcl" || cp_type == "mtcd") {
    document.getElementById("sett_" + cp_type).style.background = current_color;
    mtc[cp_type == "mtcl" ? "light" : "dark"] = current_color;
    if (
      (cp_type == "mtcl" && ntp_theme.value == "light") ||
      (cp_type == "mtcd" && ntp_theme.value == "dark")
    )
      document
        .querySelector("meta[name=theme-color]")
        .setAttribute("content", current_color);
    ls_set("ntp_mtc", mtc);
  }
  f_save_bdy();
  dlg_color_picker.hide();
});

var stt_cl = document.querySelectorAll(".stt_clfrt:not(.not_stt)");
stt_cl.forEach((el) => {
  var s = el.id;
  var s1 = s.split("_");
  el.addEventListener("click", function () {
    if (s1[2]) f_cp_rgb(s1[1], parseInt(s1[2]));
    else f_cp_mtc(s1[1]);
  });
});

async function exportIndexedDB() {
  const indexedDBData = {};
  for (const key of SAFE_DB_THEME) {
    const value = await getBackgroundImage(key);
    if (value instanceof Blob) {
      indexedDBData[key] = {
        type: "blob",
        data: await blobToBase64(value),
      };
    } else if (value !== undefined) {
      indexedDBData[key] = {
        type: "other",
        data: value,
      };
    }
  }
  return indexedDBData;
}
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

document.getElementById("export-data").onclick = async function () {
  try {
    var ls_data = {};
    Object.keys(localStorage).forEach((key) => {
      if (SAFE_DATA.includes(key)) {
        ls_data[key] = localStorage[key];
      }
    });
    const idb_data = await exportIndexedDB();
    Object.assign(ls_data, idb_data);
    const jsonString = JSON.stringify(ls_data);
    var dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(jsonString);
    var date = new Date();
    var exportFileDefaultName = `b2ntp_backup_${date.getUTCFullYear()}${date.getUTCMonth() + 1}${date.getUTCDate()}_${date.getHours()}_${date.getMinutes()}.json`;
    var linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  } catch (error) {
    console.error("Export failed:", error);
    ntoast.error("Export failed. Please try again.");
  }
};

document.getElementById("import-data").onchange = async function () {
  var file = this.files[0];
  var reader = new FileReader();
  reader.onload = async function (progressEvent) {
    try {
      var str = this.result;
      var combinedData = JSON.parse(str);
      localStorage.clear();
      Object.keys(combinedData).forEach((key) => {
        if (SAFE_DATA.includes(key)) {
          localStorage.setItem(key, combinedData[key]);
        }
      });
      await importIndexedDB(combinedData);
      console.log("Import completed");
      localStorage.ntp_version = ntp_version;
      location.reload();
    } catch (error) {
      console.error("Import failed:", error);
      ntoast.error("Import failed. Please try again.");
    }
  };
  reader.readAsText(file);
};

async function importIndexedDB(indexedDBData) {
  for (const key of SAFE_DB_THEME) {
    if (indexedDBData && indexedDBData[key]) {
      let item = indexedDBData[key];
      let value;
      if (item.type === "blob") {
        value = await base64ToBlob(item.data);
      } else {
        value = item.data;
      }
      await saveBackgroundImage(key, value);
    }
  }
}

async function base64ToBlob(base64) {
  const response = await fetch(base64);
  return await response.blob();
}

document.getElementById("default-theme").onclick = function () {
  var r = confirm(
    "Your bookmarks will be preserved, but the theme will revert to the default. b2ntp will reload.\n Are you sure you want to reset to the default b2ntp theme?"
  );
  if (r == true) {
    updateNtpTheme(DEFAULT_THEME)
    ntp_bdy.setAttribute("style", "");
    f_save_bdy();
    ntoast.success("Default b2ntp theme set.");
    setTimeout(() => {
      location.reload();
    }, 2000);
  }
};
document.getElementById("export-theme").onclick = function () {
  var dataStr = {};
  Object.keys(localStorage).forEach((key) => {
    if (SAFE_DATA_THEME.includes(key)) {
      console.log(key);
      dataStr[key] = ls_get(key);
    }
  });
  var dataUri =
    "data:application/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(dataStr));
  var date = new Date();
  var exportFileDefaultName =
    "b2ntp_theme" +
    date.getUTCFullYear() +
    "" +
    (date.getUTCMonth() + 1) +
    "" +
    date.getUTCDate() +
    "_" +
    date.getHours() +
    "_" +
    date.getMinutes() +
    ".json";
  var linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
};
document.getElementById("import-theme").onchange = function () {
  var file = this.files[0];
  var reader = new FileReader();
  reader.onload = function (progressEvent) {
    var str = this.result;
    var data = JSON.parse(str);
    Object.keys(data).forEach((key) => {
      if (SAFE_DATA_THEME.includes(key)) console.log(key);
      else delete data[key];
    });
    console.log(data);
    Object.assign(localStorage, data);
    console.log(localStorage);
    localStorage.ntp_version = ntp_version;
    location.reload();
  };
  reader.readAsText(file);
};

var ls_size = ls_get("ls_size");
const size_p = document.getElementById("size_progress");

function gen(n) {
  return new Array(n * 1024 + 1).join("a");
}

function set_maxSize() {
  var size;
  // Determine size of localStorage if it's not set
  if (!localStorage.getItem("ls_size")) {
    var i = 0;
    try {
      // Test up to 10 MB
      for (i = 0; i <= 10000; i += 250) {
        ls_set("test", gen(i));
      }
    } catch (e) {
      localStorage.removeItem("test");
      ls_set("ls_size", i ? i - 250 : 0);
    }
  }
  size = localStorage.getItem("ls_size");
  document.getElementById("size").innerHTML = size;
  size_p.setAttribute("maxValue", size);
}

function get_usedSize() {
  var _lsTotal = 0,
    _xLen,
    _x;
  for (_x in localStorage) {
    if (!localStorage.hasOwnProperty(_x)) {
      continue;
    }
    _xLen = (localStorage[_x].length + _x.length) * 2;
    _lsTotal += _xLen;
  }
  var total = (_lsTotal / 1024).toFixed(0);
  document.getElementById("size_used").innerHTML = total;
  size_p.setAttribute("value", total);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "s" && event.ctrlKey) {
    // Ctrl+S to focus search bar
    document.getElementById("sb_input").focus();
  } else if (event.key === "t" && event.ctrlKey) {
    // Ctrl+T to toggle theme
    toggleTheme();
  }
});
window.addEventListener("DOMContentLoaded", function () {
  aos();
  initializeThemeSettings();
  pagesRoute();

  let aside = document.querySelector("aside");
  let toggle = document.querySelector(".a-toggle");
  toggle.addEventListener("click", () => {
    aside.classList.toggle("active");
  });

  if (ls_size == undefined) {
    get_usedSize();
    set_maxSize();
  } else {
    document.getElementById("size").innerHTML = ls_get("ls_size");
    get_usedSize();
  }
  document.getElementById("size_calc").onclick = () => {
    get_usedSize();
    set_maxSize();
  };
});
