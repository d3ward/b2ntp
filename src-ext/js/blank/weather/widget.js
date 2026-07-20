import { storage } from "../../components/localStorage";
import { settingsState } from "../../settings/state";
import { capitalizeF } from "../../components/utilities";
import icons from "../../../data/weatherIcons.json";

let _container = null;

export function initWeather({ container }) {
  _container = container;
  _container.innerHTML = `
    <div class="wth_s">Set a location to enable weather</div>
    <div class="wth_main">
      <div class="wth_i"></div>
      <div class="wth_t"></div>
      <div class="wth_d">
        <div class="wth_mm"></div>
        <div class="wth_w"></div>
        <div class="wth_h"></div>
      </div>
      <div class="wth_d1"></div>
      <div class="wth_c"></div>
    </div>
    <div class="wth_l">Loading...</div>
  `;

  settingsState.onChange("weatherConfig", () => {
    _renderWeather();
  });

  _renderWeather();
}

function _wttrIcon(code) {
  const c = parseInt(code);
  const sfx = (new Date().getHours() < 6 || new Date().getHours() >= 20) ? "n" : "d";
  if (c === 113) return `01${sfx}`;
  if (c === 116) return `02${sfx}`;
  if (c === 119) return `03${sfx}`;
  if (c === 122) return `04${sfx}`;
  if ([143, 248, 260].includes(c)) return `50${sfx}`;
  if ([200, 386, 389, 392, 395].includes(c)) return `11${sfx}`;
  if ([227, 230, 323, 326, 329, 332, 335, 338, 368, 371].includes(c)) return `13${sfx}`;
  if ([281, 284, 317, 320, 350, 362, 365, 374, 377].includes(c)) return `09${sfx}`;
  return `10${sfx}`;
}

function _updateDOM(data) {
  const cur = data.current_condition[0];
  const day = data.weather[0];
  const area = data.nearest_area[0];
  const tt = "&#8451;";

  _container.querySelectorAll(".wth_c").forEach((el) => { el.innerText = area.areaName[0].value; });
  _container.querySelectorAll(".wth_i").forEach((el) => { el.innerHTML = icons[_wttrIcon(cur.weatherCode)] || ""; });
  _container.querySelectorAll(".wth_d1").forEach((el) => { el.innerText = capitalizeF(cur.weatherDesc[0].value); });
  _container.querySelectorAll(".wth_t").forEach((el) => { el.innerHTML = cur.temp_C + tt; });
  _container.querySelectorAll(".wth_mm").forEach((el) => { el.innerHTML = day.maxtempC + tt + " / " + day.mintempC + tt; });
  _container.querySelectorAll(".wth_w").forEach((el) => {
    el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" style="transform: rotate(${cur.winddirDegree})" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-circle-arrow-up"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 8l-4 4" /><path d="M12 8v8" /><path d="M16 12l-4 -4" /></svg> ${cur.windspeedKmph} km/h`;
  });
  _container.querySelectorAll(".wth_h").forEach((el) => {
    el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-drop-circle"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.07 15.34c1.115 .88 2.74 .88 3.855 0c1.115 -.88 1.398 -2.388 .671 -3.575l-2.596 -3.765l-2.602 3.765c-.726 1.187 -.443 2.694 .672 3.575z" /><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /></svg> ${cur.humidity}%`;
  });
}

async function _renderWeather() {
  if (!_container) return;
  const wth_data = settingsState.getWeatherConfig();

  if (!wth_data.location) {
    _container.querySelectorAll(".wth_l").forEach((el) => { el.style.display = "none"; });
    _container.querySelectorAll(".wth_s").forEach((el) => { el.style.opacity = 1; });
    return;
  }

  _container.querySelectorAll(".wth_s").forEach((el) => { el.style.display = "none"; });

  const lastUpdate = storage.get("cachedWeatherUpdate");
  const cachedData = storage.get("cachedWeatherData");

  if (lastUpdate !== null && Date.now() / 1000 - lastUpdate <= 600 && cachedData) {
    _updateDOM(cachedData);
  } else {
    try {
      const resp = await fetch(`https://wttr.in/${encodeURIComponent(wth_data.location)}?format=j1`);
      const data = await resp.json();
      storage.set("cachedWeatherData", data);
      storage.set("cachedWeatherUpdate", Math.floor(Date.now() / 1000));
      _updateDOM(data);
    } catch (e) {
      console.error("Weather fetch failed", e);
    }
  }

  _container.querySelectorAll(".wth_l").forEach((el) => { el.style.display = "none"; });
  _container.querySelectorAll(".wth_main").forEach((el) => { el.style.opacity = 1; });
}
