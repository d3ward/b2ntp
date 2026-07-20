import { settingsState } from "../../settings/state";
import { initWeather } from "./widget";

export function initWeatherSettings({ ntoast }) {
  const wth_data = settingsState.getWeatherConfig();

  const wt_loc = document.getElementById("wt_loc");
  const wth_preview = document.getElementById("wth_stt");

  wt_loc.value = wth_data.location;

  if (wth_preview) {
    initWeather({ container: wth_preview });
  }

  function save() {
    const data = settingsState.getWeatherConfig();
    const loc = wt_loc.value.trim();
    if (loc) data.location = loc;
    settingsState.setWeatherConfig(data);
    ntoast.success("Weather widget configuration done");
  }

  wt_loc.addEventListener("blur", save);

  document.getElementById("get_ll").onclick = () => {
    try {
      navigator.geolocation.getCurrentPosition((position) => {
        wt_loc.value = `${position.coords.latitude},${position.coords.longitude}`;
        save();
      });
    } catch (e) {
      ntoast.error(e);
    }
  };
}
