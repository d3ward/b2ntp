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
} from "./components/utilities";
import icons from '../data/weatherIcons.json'
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
  darkModeEnd: 6
};

const SAFE_DATA = [
  "sb_data",
  "tlb_data",
  "wth_data",
  "ntp_theme",
  "ntp_bdy",
  "ntp_mtc"
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
  dialog_changelog.show()
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
    matchbookmarks();
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
        imgElement.onerror = () => reject(new Error(`Failed to load image: ${url}`));
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
    const [{ img: lightImg, url: updatedLightUrl }, { img: darkImg, url: updatedDarkUrl }] = await Promise.all([
      loadImage(lightUrl, 'bg_custom_l'),
      loadImage(darkUrl, 'bg_custom_d')
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
    bg_l_value = "../assets/b2ntp_bg.svg";
  } else if (bg_l_value.startsWith("bg_custom_")) {
    bg_l_value = await getBackgroundImage(bg_l_value);
  }

  if (bg_d_value === "-" || bg_d_value === "") {
    bg_d_value = "../assets/b2ntp_bg_d.svg";
  } else if (bg_d_value.startsWith("bg_custom_")) {
    bg_d_value = await getBackgroundImage(bg_d_value);
  }

  ntp_bdy.style.setProperty("--bg-img-l", `url('${bg_l_value}')`);
  ntp_bdy.style.setProperty("--bg-img-d", `url('${bg_d_value}')`);

  imgBackground(bg_l_value, bg_d_value);
}

// Call this function when the page loads
applyBackground();

if (!sb_data) {
  sb_data = {
    placeholder: "Search with ddg..",
    default: "d",
    b: "https://bing.com/search?q=",
    g: "https://google.com/search?q=",
    d: "https://duckduckgo.com/?q=",
    r: "https://www.reddit.com/search?q=",
    y: "https://www.youtube.com/results?q=",
  };
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
  };
}
if (!tlb_data) {
  tlb_data = {
    dateFormat: "auto",
    timeFormat: "24",
  };
}

if (!ntp_theme || typeof ntp_theme !== 'object' || ntp_theme === null) {
  ntp_theme = DEFAULT_THEME;
} else {
  ntp_theme = { ...DEFAULT_THEME, ...ntp_theme };
}
function toggleTheme(theme) {
  var tTheme;
  if (theme) {
    tTheme = theme;
  } else {
    var cTheme = ntp_bdy.getAttribute("data-theme");
    if (cTheme === "light") {
      tTheme = "dark";
      wllp_value.value =
        getComputedStyle(ntp_bdy).getPropertyValue("--bg-img-d");
    } else {
      tTheme = "light";
      wllp_value.value =
        getComputedStyle(ntp_bdy).getPropertyValue("--bg-img-l");
    }
  }
  ntp_theme.value = tTheme;
  ntp_bdy.setAttribute("data-theme", tTheme);
  ls_set("ntp_theme", ntp_theme);
  document.getElementById("background-light").style.opacity =
    tTheme === "light" ? "1" : "0";
  document.getElementById("background-dark").style.opacity =
    tTheme === "dark" ? "1" : "0";
}
function themeManager_ntp() {
  var toggles = document.getElementsByClassName("theme-toggle");
  if (window.CSS && CSS.supports("color", "var(--bg)") && toggles) {
    var storedTheme =
      ls_get("ntp_theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    if (storedTheme) ntp_bdy.setAttribute("data-theme", storedTheme.value);
    ntp_theme.value = storedTheme;
    for (var i = 0; i < toggles.length; i++) {
      toggles[i].onclick = function () {
        toggleTheme();
      };
    }
  }
}
const startTimeDisplay = document.getElementById('startTime');
const endTimeDisplay = document.getElementById('endTime');
const autoSwitchCheckbox = document.getElementById("auto-switch");
const autoSwitchTypeSelect = document.getElementById("auto-switch-type");
const timeRangeContainer = document.getElementById("time-range-container");
const startTimeSlider = document.getElementById("start-time");
const endTimeSlider = document.getElementById("end-time");

function initializeThemeSettings() {
  autoSwitchCheckbox.checked = ntp_theme.autoSwitch;
  autoSwitchTypeSelect.value = ntp_theme.autoSwitchType;
  startTimeSlider.value = ntp_theme.darkModeStart;
  endTimeSlider.value = ntp_theme.darkModeEnd;

  updateTimeRangeDisplay();

  autoSwitchCheckbox.addEventListener("change", () => {
    ntp_theme.autoSwitch = autoSwitchCheckbox.checked;
    ls_set("ntp_theme", ntp_theme);
    updateTheme();
  });

  autoSwitchTypeSelect.addEventListener("change", () => {
    ntp_theme.autoSwitchType = autoSwitchTypeSelect.value;
    ls_set("ntp_theme", ntp_theme);
    timeRangeContainer.style.display = ntp_theme.autoSwitchType === "time" ? "block" : "none";
    updateTheme();
  });
  startTimeSlider.value = ntp_theme.darkModeStart;
  endTimeSlider.value = ntp_theme.darkModeEnd;

  startTimeSlider.addEventListener("input", () => {
    ntp_theme.darkModeStart = parseInt(startTimeSlider.value);
    ls_set("ntp_theme", ntp_theme);
    updateTimeRangeDisplay();
    if (ntp_theme.autoSwitch && ntp_theme.autoSwitchType === "time") {
      checkTimeBased();
    }
  });

  endTimeSlider.addEventListener("input", () => {
    ntp_theme.darkModeEnd = parseInt(endTimeSlider.value);
    ls_set("ntp_theme", ntp_theme);
    updateTimeRangeDisplay();
    if (ntp_theme.autoSwitch && ntp_theme.autoSwitchType === "time") {
      checkTimeBased();
    }
  });

  // Initial update
  timeRangeContainer.style.display =
    ntp_theme.autoSwitchType === "time" ? "block" : "none";
  updateTheme();
}

function updateTimeRangeDisplay() {
  startTimeDisplay.textContent = tlb_data.timeFormat == 24 ? `${startTimeSlider.value.padStart(2, '0')}:00`: formatTime(startTimeSlider.value);
  endTimeDisplay.textContent = tlb_data.timeFormat == 24 ? `${endTimeSlider.value.padStart(2, '0')}:00`: formatTime(endTimeSlider.value);
}

function formatTime(hour) {
  const period = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:00 ${period}`;
}

function updateTheme() {
  if (ntp_theme.autoSwitch) {
    if (ntp_theme.autoSwitchType === "system") {
      checkSystemPreference();
    } else {
      checkTimeBased();
    }
  }
}

function checkSystemPreference() {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
   toggleTheme("dark");
  } else {
   toggleTheme("light");
  }
}

function checkTimeBased() {
  const currentHour = new Date().getHours();
  if (ntp_theme.darkModeStart < ntp_theme.darkModeEnd) {
    if (currentHour >= ntp_theme.darkModeStart && currentHour < ntp_theme.darkModeEnd) {
     toggleTheme("dark");
    } else {
     toggleTheme("light");
    }
  } else {
    if (currentHour >= ntp_theme.darkModeStart || currentHour < ntp_theme.darkModeEnd) {
     toggleTheme("dark");
    } else {
     toggleTheme("light");
    }
  }
}

// Listen for system theme changes
window.matchMedia("(prefers-color-scheme: dark)").addListener(updateTheme);
// Check theme every minute for time-based switching
setInterval(updateTheme, 60000);
// Initialize theme settings when the page loads
document.addEventListener("DOMContentLoaded", initializeThemeSettings);
// General - Time&Data settings
const tlb_dateF = document.getElementById("dateFormat");
const tlb_timeF = document.getElementById("timeFormat");
tlb_dateF.value = tlb_data.dateFormat;
tlb_timeF.value = tlb_data.timeFormat;
tlb_dateF.addEventListener("change", (value) => {
  tlb_data.dateFormat = tlb_dateF.value;
  ls_set("tlb_data", tlb_data);
});
tlb_timeF.addEventListener("change", (value) => {
  tlb_data.timeFormat = tlb_timeF.value;
  ls_set("tlb_data", tlb_data);
});

/* ---------- Weather Settings Config --------- */
const wt_checkbox = document.getElementById("wt_status");
const wt_ik = document.getElementById("wt_ik")
const wt_ila = document.getElementById("wt_ila")
const wt_iln = document.getElementById("wt_iln")
var wth_status = wth_data.status;
wt_checkbox.checked = wth_status;
ntp_bdy.style.setProperty("--wt", wth_status ? "block" : "none");
wt_ik.value = wth_data.api;
wt_ila.value = wth_data.lat;
wt_iln.value = wth_data.lon;
wt_checkbox.onclick = () => {
  var wth_status = wt_checkbox.checked;
  ntp_bdy.style.setProperty("--wt", wth_status ? "block" : "none");
  f_save_wth()
};
wt_ik.addEventListener("blur",()=>{f_save_wth()})
wt_ila.addEventListener("blur",()=>{f_save_wth()})
wt_iln.addEventListener("blur",()=>{f_save_wth()})

function f_save_wth() {
  const status = document.getElementById("wt_status").checked;
  const api = document.getElementById("wt_ik").value;
  const lat = document.getElementById("wt_ila").value;
  const lon = document.getElementById("wt_iln").value;
  wth_data.status = status;
  if (api && lat && lon) {
    wth_data.api = api;
    wth_data.lon = lon;
    wth_data.lat = lat;
  }
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
    typeof localStorage.cachedWeatherUpdate === "undefined" ||
    Date.now() / 1000 - localStorage.cachedWeatherUpdate > 600
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
sb_len.addEventListener("blur", ()=>{
  f_save_sb()
})
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

/* ---- Function to save search bar config ---- */
function f_save_sb() {
  var tlen = f_trim(document.getElementById("sb_txt").value) + "\n";
  var error = false;
  var lines = tlen.split("\n");
  lines.splice(-1, 1);
  lines = lines.filter(function (e) {
    return e.replace(/(\r\n|\n|\r)/gm, "");
  });
  var sKc = {};
  for (var i = 0; i < lines.length; i++) {
    var zlen = lines[i].split("->");
    if (zlen.length != 2) {
      i = lines.length;
      error = true;
    } else {
      sKc[f_trim(zlen[0])] = f_trim(zlen[1]);
    }
  }
  error = error || !sKc["default"];
  if (error) {
    alert(
      "Looks like you removed important keywords like \n-placeholder\n-key\n-default\n Make sure to follow the syntax too :'k' -> 'value'"
    );
  } else {
    sb_data = sKc;
    ls_set("sb_data", sb_data);
  }
}


// ---------- BUILD PAGE ----------
var pivotmatch = 0;
var totalbookmarks = 0;
var prevregexp = "";
//Concatenate 2 json objects
function jsoncat(o1, o2) {
  for (var key in o2) o1[key] = o2[key];
  return o1;
}

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

function fuzzyMatch(pattern, str) {
  pattern = pattern.toLowerCase();
  str = str.toLowerCase();
  let patternIdx = 0;
  let strIdx = 0;
  let score = 0;
  let lastMatchingCharIdx = -1;

  while (patternIdx < pattern.length && strIdx < str.length) {
    if (pattern[patternIdx] === str[strIdx]) {
      score += 1;
      if (lastMatchingCharIdx === strIdx - 1) {
        score += 2; // Bonus for consecutive matches
      }
      lastMatchingCharIdx = strIdx;
      patternIdx++;
    }
    strIdx++;
  }

  // If we matched all characters in the pattern
  if (patternIdx === pattern.length) {
    // Calculate how close the matches were to the start of the string
    const percentageMatched = patternIdx / strIdx;
    return (score / pattern.length) * percentageMatched;
  } else {
    return 0; // Return 0 if not all pattern characters were found
  }
}

function matchbookmarks(regex = prevregexp) {
  const p = document.getElementById("bookmarks");
  const actionElement = document.getElementById("action");
  const actionInput = actionElement.children[0];

  // Reset bookmarks container
  p.innerHTML = '';
  
  // Reset counters and update regexp
  totalbookmarks = 0;
  pivotmatch = regex === prevregexp ? pivotmatch : 0;
  prevregexp = regex;

  // Improved shortcut detection
  const shortcutMatch = regex.match(/^(\S+)\s{2,}(.*)$/);
  if (shortcutMatch && sb_data.hasOwnProperty(shortcutMatch[1])) {
    actionElement.action = sb_data[shortcutMatch[1]];
    actionInput.name = "q";
    return; // Exit early as we've handled the shortcut case
  }

  if (!regex) {
    // If no search term, don't display any results
    return;
  }

  const fragment = document.createDocumentFragment();
  const folderSections = {};

  // Perform fuzzy search
  const matches = [];
  Object.entries(bk_data).forEach(([folderName, [urls, folderId]]) => {
    Object.entries(urls).forEach(([title, [url, id]]) => {
      const score = fuzzyMatch(regex, title) + fuzzyMatch(regex, folderName) * 0.5;
      if (score > 0) {
        matches.push({ folderName, title, url, id, folderId, score });
      }
    });
  });

  // Sort matches by score
  matches.sort((a, b) => b.score - a.score);

  matches.forEach((item, index) => {
    if (!folderSections[item.folderName]) {
      folderSections[item.folderName] = createSection(item.folderName, item.folderId);
    }
    
    const link = createBookmarkLink(item, index === 0);
    folderSections[item.folderName].querySelector('div:not(.title)').appendChild(link);
    totalbookmarks++;
  });

  Object.values(folderSections).forEach(section => {
    if (section.querySelectorAll('a').length > 0) {
      fragment.appendChild(section);
    }
  });

  p.appendChild(fragment);

  if (totalbookmarks === 0) {
    actionElement.action = sb_data[sb_data.default];
    actionInput.name = "q";
  }

  // Scroll to selected element if exists
  const selectedElement = p.querySelector('.selected');
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

document.getElementById("sb_input").onkeydown = function (e) {
  switch (e.keyCode) {
    case 38:
      pivotmatch = pivotmatch >= 0 ? 0 : pivotmatch + 1;
      matchbookmarks();
      break;
    case 40:
      pivotmatch =
        pivotmatch <= -totalbookmarks + 1
          ? -totalbookmarks + 1
          : pivotmatch - 1;
      matchbookmarks();
      break;
    default:
      break;
  }
  document.getElementById("action").children[0].focus();
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
    second: "2-digit",
    hour12: tlb_data.timeFormat === "12",
  });

  document.getElementById("clock").textContent = formattedTime;
  document.getElementById("date").textContent = formattedDate;
}

//window.onload = matchbookmarks();
var sb_input = document.getElementById("sb_input");
if (sb_data["placeholder"].length > 1) {
  sb_input.placeholder = sb_data["placeholder"];
}
sb_input.addEventListener("input", () => {
  matchbookmarks(sb_input.value);
});
ntp_bdy.onresize = matchbookmarks();
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
function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(",")[1]);
  const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}
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
  ntp_bdy.style.setProperty("--bg-img-" + (ntp_theme.value == "dark" ? "d" : "l"), v);
  if (isValidColor(v))
    ntp_bdy.style.setProperty("--bg-c" + (ntp_theme.value == "dark" ? "d" : "l"), v);
  f_save_bdy();
  ntoast.success("Background custom value saved");
}
function f_wallp5() {
  var v =
    ntp_theme.value == "dark"
      ? "url('../assets/b2ntp_bg_d.svg')"
      : "url('../assets/b2ntp_bg.svg')";
  wllp_value.value = v;
  ntp_bdy.style.setProperty("--bg-img-" + (ntp_theme.value == "dark" ? "d" : "l"), v);
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

window.addEventListener("DOMContentLoaded", function () {
  aos();
  themeManager_ntp();
  pagesRoute();

  let aside = document.querySelector("aside");
  let toggle = document.querySelector(".a-toggle");
  toggle.addEventListener("click", () => {
    aside.classList.toggle("active");
  });
});

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

document.addEventListener("keydown", (event) => {
  if (event.key === "s" && event.ctrlKey) {
    // Ctrl+S to focus search bar
    document.getElementById("sb_input").focus();
  } else if (event.key === "t" && event.ctrlKey) {
    // Ctrl+T to toggle theme
    toggleTheme();
  }
});
