import { settingsState } from "../../settings/state";

export function initWeatherSettings({ ntoast }) {
  const wth_data = settingsState.getWeatherConfig();

  const wt_checkbox = document.getElementById("wt_status");
  const wt_loc = document.getElementById("wt_loc");

  wt_checkbox.checked = wth_data.status;
  wt_loc.value = wth_data.location;

  function save() {
    const data = settingsState.getWeatherConfig();
    data.status = wt_checkbox.checked;
    const loc = wt_loc.value.trim();
    if (loc) data.location = loc;
    settingsState.setWeatherConfig(data);
    ntoast.success("Weather widget configuration done");
  }

  wt_checkbox.onclick = save;
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
