import Croppie from "croppie";
import Picker from "vanilla-picker";
import { storage } from "../../components/localStorage";
import { random_gradient, dataURItoBlob } from "../../components/utilities";
import { BackgroundStore } from "../BackgroundStore";
import { applyBackground } from "./apply";

const SAFE_DATA = ["sb_data", "tlb_data", "wth_data", "ntp_theme", "ntp_bdy", "ntp_mtc"];
const SAFE_DATA_THEME = ["ntp_theme", "ntp_bdy", "ntp_mtc"];
const SAFE_DB_THEME = ["bg_custom_d", "bg_custom_l"];

let _ntp_bdy;
let _ntoast;
let _getNtpTheme;
let _f_save_bdy;
let _updateNtpTheme;
let _ntp_version;
let _dlg_color_picker;

const wDevice = window.innerWidth ? window.innerWidth : screen.width;
const hDevice = window.innerHeight ? window.innerHeight + 56 : screen.height;
let cr,
  cr_img = "",
  img_w = wDevice / 2.5,
  img_h = hDevice / 2.5,
  isCrop = 0;
while (img_w > 670) {
  img_w = img_w / 1.2;
  img_h = img_h / 1.2;
}

var cp_current_el;
var cp_type;
var current_color;
var initial_color;

export function initBackgroundSettings({
  ntp_bdy,
  ntoast,
  getNtpTheme,
  f_save_bdy,
  updateNtpTheme,
  ntp_version,
  dlg_color_picker,
}) {
  _ntp_bdy = ntp_bdy;
  _ntoast = ntoast;
  _getNtpTheme = getNtpTheme;
  _f_save_bdy = f_save_bdy;
  _updateNtpTheme = updateNtpTheme;
  _ntp_version = ntp_version;
  _dlg_color_picker = dlg_color_picker;

  ntp_bdy.style.setProperty("--bg-cw", img_w + "px");
  ntp_bdy.style.setProperty("--bg-ch", img_h + "px");

  const bg_pld = document.getElementById("bg_pld"),
    crop = document.getElementById("crop"),
    result = document.getElementById("result"),
    imgRes = document.getElementById("imgRes"),
    crpp = document.getElementById("croppie");

  const wllp_value = document.getElementById("wllp_value");
  const wllp_file = document.getElementById("wllp_file");
  const wllp_url = document.getElementById("wllp_url");
  const wllp_gradient = document.getElementById("wllp_gradient");
  const wllp_bg = document.getElementById("wllp_bg");
  const wllp_custom = document.getElementById("wllp_custom");
  const wllp_clearvalue = document.getElementById("wllp_clearvalue");
  const wllp_default = document.getElementById("wllp_default");

  const ntp_theme = getNtpTheme();
  wllp_value.value =
    ntp_theme.value == "dark"
      ? getComputedStyle(ntp_bdy).getPropertyValue("--bg-img-d")
      : getComputedStyle(ntp_bdy).getPropertyValue("--bg-img-l");

  // Blur slider
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

  // Darkness slider
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

  // Grid layout
  const grid_wrap = getComputedStyle(ntp_bdy).getPropertyValue("--grid-wrap").trim();
  const grid_width = getComputedStyle(ntp_bdy).getPropertyValue("--grid-width").trim();
  const t_style = document.getElementsByName("t-style");
  if (grid_wrap === "nowrap" && grid_width === "33.33%") {
    t_style[0].checked = true;
  } else if (grid_wrap === "wrap" && grid_width === "50%") {
    t_style[2].checked = true;
  } else {
    t_style[1].checked = true;
  }
  t_style.forEach((el) => {
    el.addEventListener("input", () => {
      var lv = el.value;
      if (lv == "h") {
        ntp_bdy.style.setProperty("--grid-wrap", "nowrap");
        ntp_bdy.style.setProperty("--grid-width", "33.33%");
      } else if (lv == "v2") {
        ntp_bdy.style.setProperty("--grid-wrap", "wrap");
        ntp_bdy.style.setProperty("--grid-width", "50%");
      } else {
        ntp_bdy.style.setProperty("--grid-wrap", "wrap");
        ntp_bdy.style.setProperty("--grid-width", "33.33%");
      }
      f_save_bdy();
    });
  });

  // Color picker
  const picker = new Picker({
    parent: document.querySelector("#cp_v"),
    popup: false,
  });

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

  document.getElementById("cp_ok").addEventListener("click", () => {
    const theme = getNtpTheme();
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
        (cp_type == "mtcl" && theme.value == "light") ||
        (cp_type == "mtcd" && theme.value == "dark")
      )
        document
          .querySelector("meta[name=theme-color]")
          .setAttribute("content", current_color);
      storage.set("ntp_mtc", mtc);
    }
    f_save_bdy();
    dlg_color_picker.hide();
  });

  var stt_cl = document.querySelectorAll(".stt_clfrt:not(.not_stt)");
  stt_cl.forEach((el) => {
    var s = el.id;
    var s1 = s.split("_");
    el.addEventListener("click", function () {
      if (s1[2]) f_cp_rgb(ntp_bdy, picker, s1[1], parseInt(s1[2]));
      else f_cp_mtc(s1[1]);
    });
  });

  // Wallpaper buttons
  function f_wallp1() {
    var file = wllp_file.files[0];
    if (file && file.type.match("image.*")) {
      var reader = new FileReader();
      reader.onload = function (e) {
        bg_pld.style.display = "none";
        if (cr_img == "") {
          cr_img = e.target.result;
          cropInit(crpp);
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
        cropInit(crpp);
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
    const theme = getNtpTheme();
    ntp_bdy.style.setProperty(
      "--bg-img-" + (theme.value == "dark" ? "d" : "l"),
      rg
    );
    wllp_value.value = rg;
    f_save_bdy();
    ntoast.success("Gradient background saved");
  }

  function f_wallp4() {
    const theme = getNtpTheme();
    var v = wllp_value.value;
    ntp_bdy.style.setProperty(
      "--bg-img-" + (theme.value == "dark" ? "d" : "l"),
      v
    );
    if (isValidColor(v))
      ntp_bdy.style.setProperty(
        "--bg-c" + (theme.value == "dark" ? "d" : "l"),
        v
      );
    f_save_bdy();
    ntoast.success("Background custom value saved");
  }

  function f_wallp5() {
    const theme = getNtpTheme();
    var v =
      theme.value == "dark"
        ? "url('../assets/svg/b2ntp_bg_d.svg')"
        : "url('../assets/svg/b2ntp_bg.svg')";
    wllp_value.value = v;
    ntp_bdy.style.setProperty(
      "--bg-img-" + (theme.value == "dark" ? "d" : "l"),
      v
    );
    f_save_bdy();
    ntoast.success("Default background saved");
  }

  function savebg_cropped() {
    const theme = getNtpTheme();
    const imageBlob = dataURItoBlob(imgRes.src);
    const key = `bg_custom_${theme.value == "dark" ? "d" : "l"}`;
    BackgroundStore.save(key, imageBlob)
      .then(() => {
        const blobUrl = URL.createObjectURL(imageBlob);
        ntp_bdy.style.setProperty(
          "--bg-img-" + (theme.value == "dark" ? "d" : "l"),
          `url('${blobUrl}')`
        );
        wllp_value.value = blobUrl;
        f_save_bdy();
        applyBackground(ntp_bdy);
        ntoast.success("Background saved!");
        cropCancel(bg_pld, crop, result, wllp_file);
      })
      .catch(() => {
        ntoast.error("Failed to save background");
      });
  }

  wllp_file.addEventListener("change", f_wallp1);
  wllp_url.addEventListener("click", f_wallp2);
  wllp_gradient.addEventListener("click", f_wallp3);
  wllp_bg.addEventListener("click", () =>
    f_cp_bg(ntp_bdy, picker, dlg_color_picker)
  );
  wllp_custom.addEventListener("click", f_wallp4);
  wllp_clearvalue.addEventListener("click", () => {
    document.getElementById("wllp_value").value = "";
  });
  wllp_default.addEventListener("click", f_wallp5);

  document.getElementById("b_cc").onclick = () =>
    cropCancel(bg_pld, crop, result, wllp_file);
  document.getElementById("b_cc2").onclick = () =>
    cropCancel(bg_pld, crop, result, wllp_file);
  document.getElementById("b_cr").onclick = () => cropResult(crop, imgRes, result);
  document.getElementById("b_sbgc").onclick = () => savebg_cropped();

  // Import / Export
  document.getElementById("default-theme").onclick = function () {
    var r = confirm(
      "Your bookmarks will be preserved, but the theme will revert to the default. b2ntp will reload.\n Are you sure you want to reset to the default b2ntp theme?"
    );
    if (r == true) {
      updateNtpTheme(undefined);
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
    const all = storage.getAll();
    Object.keys(all).forEach((key) => {
      if (SAFE_DATA_THEME.includes(key)) {
        dataStr[key] = all[key];
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
      Object.keys(data).forEach((key) => storage.set(key, data[key]));
      storage.set("ntp_version", ntp_version);
      location.reload();
    };
    reader.readAsText(file);
  };

  document.getElementById("export-data").onclick = async function () {
    try {
      var ls_data = {};
      const all = storage.getAll();
      Object.keys(all).forEach((key) => {
        if (SAFE_DATA.includes(key)) {
          ls_data[key] = all[key];
        }
      });
      const idb_data = await exportIndexedDB();
      Object.assign(ls_data, idb_data);
      const jsonString = JSON.stringify(ls_data);
      var dataUri =
        "data:application/json;charset=utf-8," +
        encodeURIComponent(jsonString);
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
        storage.clear();
        Object.keys(combinedData).forEach((key) => {
          if (SAFE_DATA.includes(key)) {
            storage.set(key, combinedData[key]);
          }
        });
        await importIndexedDB(combinedData);
        console.log("Import completed");
        storage.set("ntp_version", ntp_version);
        location.reload();
      } catch (error) {
        console.error("Import failed:", error);
        ntoast.error("Import failed. Please try again.");
      }
    };
    reader.readAsText(file);
  };
}

function f_cp_bg(ntp_bdy, picker, dlg_color_picker) {
  const theme = _getNtpTheme();
  cp_type = "bgc" + (theme.value == "dark" ? "d" : "l");
  let color = getComputedStyle(ntp_bdy).getPropertyValue(
    "--bg-c" + (theme.value == "dark" ? "d" : "l")
  );
  picker.setColor(color, true);
  _f_save_bdy();
  dlg_color_picker.show();
}

function f_cp_rgb(ntp_bdy, picker, type, number) {
  cp_current_el = number;
  cp_type = "color_" + type;
  current_color = getComputedStyle(ntp_bdy).getPropertyValue(
    "--c" + (cp_type == "color_cl" ? "l" : "d") + number
  );
  console.log("f_rgb - cp_type : " + cp_type, " color : " + current_color);
  picker.setColor(current_color, true);
  _dlg_color_picker.show();
}

function isValidColor(color) {
  const colorRegex =
    /^(#[0-9A-Fa-f]{3}|#[0-9A-Fa-f]{6}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(?:0(?:\.\d+)?|1(?:\.0+)?)\s*\)|hsl\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*\)|hsla\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*,\s*(?:0(?:\.\d+)?|1(?:\.0+)?)\s*\))$/i;
  return colorRegex.test(color);
}

function cropInit(crpp) {
  cr = new Croppie(crpp, {
    viewport: { width: img_w, height: img_h },
    boundary: { width: img_w, height: img_h },
    mouseWheelZoom: false,
    enableOrientation: true,
  });
  bindCropImg();
}

function bindCropImg() {
  cr.bind({ url: cr_img });
}

function cropCancel(bg_pld, crop, result, wllp_file) {
  if (bg_pld.style.display == "none") {
    bg_pld.style.display = "inline";
    crop.style.display = "none";
    result.style.display = "none";
    wllp_file.value = "";
    isCrop = 0;
  }
}

function cropResult(crop, imgRes, result) {
  if (!isCrop) {
    isCrop = 1;
    cr.result({
      type: "base64",
      size: "{width:wDevice, height:hDevice}",
      format: "jpeg",
      quality: 1,
    }).then(function (resp) {
      crop.style.display = "none";
      imgRes.src = resp;
      result.style.display = "inline";
    });
  }
}

async function exportIndexedDB() {
  const indexedDBData = {};
  for (const key of SAFE_DB_THEME) {
    const value = await BackgroundStore.load(key);
    if (value instanceof Blob) {
      indexedDBData[key] = {
        type: "blob",
        data: await blobToBase64(value),
      };
    } else if (value !== undefined) {
      indexedDBData[key] = { type: "other", data: value };
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
      await BackgroundStore.save(key, value);
    }
  }
}

async function base64ToBlob(base64) {
  const response = await fetch(base64);
  return await response.blob();
}
