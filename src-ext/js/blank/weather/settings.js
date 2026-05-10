import { settingsState } from "../../settings/state";

export function initWeatherSettings({ ntoast }) {
  const wth_data = settingsState.getWeatherConfig();

  const wt_checkbox = document.getElementById("wt_status");
  const wt_ik = document.getElementById("wt_ik");
  const wt_ila = document.getElementById("wt_ila");
  const wt_iln = document.getElementById("wt_iln");

  wt_checkbox.checked = wth_data.status;
  wt_ik.value = wth_data.api;
  wt_ila.value = wth_data.lat;
  wt_iln.value = wth_data.lon;

  function save() {
    const data = settingsState.getWeatherConfig();
    data.status = wt_checkbox.checked;
    const api = wt_ik.value;
    const lat = wt_ila.value;
    const lon = wt_iln.value;
    if (api) data.api = api;
    if (lat) data.lat = lat;
    if (lon) data.lon = lon;
    settingsState.setWeatherConfig(data);
    ntoast.success("Weather widget configuration done");
  }

  wt_checkbox.onclick = save;
  wt_ik.addEventListener("blur", save);
  wt_ila.addEventListener("blur", save);
  wt_iln.addEventListener("blur", save);

  document.getElementById("get_ll").onclick = () => {
    try {
      navigator.geolocation.getCurrentPosition((position) => {
        wt_ila.value = position.coords.latitude;
        wt_iln.value = position.coords.longitude;
      });
    } catch (e) {
      ntoast.error(e);
    }
  };
}
