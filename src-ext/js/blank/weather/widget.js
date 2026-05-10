import { storage } from "../../components/localStorage";
import { settingsState } from "../../settings/state";
import { getJSON, capitalizeF } from "../../components/utilities";
import icons from "../../../data/weatherIcons.json";

let _container = null;

export function initWeather({ container }) {
  _container = container;
  _container.innerHTML = `
    <div class="wth_s">Missing OpenWeatherMap Key</div>
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

async function _renderWeather() {
  if (!_container) return;
  const wth_data = settingsState.getWeatherConfig();
  const appid = wth_data.api;

  if (appid.length <= 6 || appid === "" || !wth_data.status) {
    _container.querySelectorAll(".wth_l").forEach((el) => {
      el.style.display = "none";
    });
    _container.querySelectorAll(".wth_s").forEach((el) => {
      el.style.opacity = 1;
    });
    return;
  }

  const lastUpdate = storage.get("cachedWeatherUpdate");
  if (
    (lastUpdate === null || Date.now() / 1000 - lastUpdate > 600) &&
    wth_data.lat !== "" &&
    wth_data.lon !== ""
  ) {
    _container.querySelectorAll(".wth_s").forEach((el) => {
      el.style.display = "none";
    });

    const url = `https://api.openweathermap.org/data/2.5/find?lat=${wth_data.lat}&lon=${wth_data.lon}&cnt=1&appid=${appid}&callback=?`;
    let data = await getJSON(url);
    if (data === "") return;
    data = JSON.parse(data.substring(2, data.length - 1));

    const temp = (data.list[0].main.temp - 273.15).toFixed(0);
    const temp_min = (data.list[0].main.temp_min - 273.15).toFixed(0);
    const temp_max = (data.list[0].main.temp_max - 273.15).toFixed(0);
    const tt = "&#8451;";
    const windDeg = data.list[0].wind.deg;

    _container.querySelectorAll(".wth_l").forEach((el) => {
      el.style.opacity = 1;
    });
    _container.querySelectorAll(".wth_c").forEach((el) => {
      el.innerText = data.list[0].name;
    });
    _container.querySelectorAll(".wth_i").forEach((el) => {
      el.innerHTML = icons[data.list[0].weather[0].icon];
    });
    _container.querySelectorAll(".wth_d1").forEach((el) => {
      el.innerText = capitalizeF(data.list[0].weather[0].description);
    });
    _container.querySelectorAll(".wth_t").forEach((el) => {
      el.innerHTML = temp + tt;
    });
    _container.querySelectorAll(".wth_mm").forEach((el) => {
      el.innerHTML = temp_max + tt + " / " + temp_min + tt;
    });
    _container.querySelectorAll(".wth_w").forEach((el) => {
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" style="transform: rotate(${windDeg})" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-circle-arrow-up"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 8l-4 4" /><path d="M12 8v8" /><path d="M16 12l-4 -4" /></svg> ${data.list[0].wind.speed} mps`;
    });
    _container.querySelectorAll(".wth_h").forEach((el) => {
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-drop-circle"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.07 15.34c1.115 .88 2.74 .88 3.855 0c1.115 -.88 1.398 -2.388 .671 -3.575l-2.596 -3.765l-2.602 3.765c-.726 1.187 -.443 2.694 .672 3.575z" /><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /></svg> ${data.list[0].main.humidity}%`;
    });
    storage.set("cachedWeatherUpdate", Math.floor(Date.now() / 1000));
  }

  _container.querySelectorAll(".wth_l").forEach((el) => {
    el.style.display = "none";
  });
  _container.querySelectorAll(".wth_main").forEach((el) => {
    el.style.opacity = 1;
  });
}
