export function getEventListeners() {
  const isTouchDevice = "ontouchstart" in window;

  const events = {
    start: isTouchDevice ? "touchstart" : "mousedown",
    move: isTouchDevice ? "touchmove" : "mousemove",
    end: isTouchDevice ? "touchend" : "mouseup",
  };

  return events;
}
export function generateID() {
  return "_" + Math.random().toString(36).substr(2, 5);
}

//Function to generate gradient color
export function random_gradient() {
  var colorOne = {
    R: Math.floor(Math.random() * 255),
    G: Math.floor(Math.random() * 255),
    B: Math.floor(Math.random() * 255),
  };
  var colorTwo = {
    R: Math.floor(Math.random() * 255),
    G: Math.floor(Math.random() * 255),
    B: Math.floor(Math.random() * 255),
  };
  colorOne.rgb =
    "rgb(" + colorOne.R + "," + colorOne.G + "," + colorOne.B + ")";
  colorTwo.rgb =
    "rgb(" + colorTwo.R + "," + colorTwo.G + "," + colorTwo.B + ")";
  return (
    "radial-gradient(at top left, " + colorOne.rgb + ", " + colorTwo.rgb + ")"
  );
}

//Functions for localstorage store and get
function localStore(key, obj) {
  return window.localStorage.setItem(key, JSON.stringify(obj));
}
function localGet(key) {
  return JSON.parse(window.localStorage.getItem(key));
}
//Get elapsed minutes to date
export function diff_hours(dt) {
  var now = new Date();
  var diff = (new Date(dt) - now.getTime()) / 1000;
  diff /= 60;
  return Math.abs(Math.round(diff));
}
//Capitalize first letter of string
export function capitalizeF(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
//Get json from url
export function getJSON(url) {
  var resp = "";
  var xmlHttp = new XMLHttpRequest();
  if (xmlHttp != null) {
    xmlHttp.open("GET", url, false, {
      async: true,
    });
    try {
      xmlHttp.send(null);
    } catch {
      console.error("xmlHttp send failed");
    }
    resp = xmlHttp.responseText;
  }
  return resp;
}
//Function to select an option
export function selectElement(id, valueToSelect) {
  let el = document.getElementById(id);
  el.value = valueToSelect;
}
