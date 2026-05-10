import { settingsState } from "../../settings/state";
import { BackgroundStore } from "../BackgroundStore";

export async function applyBackground(ntp_bdy) {
  const saved_bdy = settingsState.getBackgroundConfig();
  BackgroundStore.apply(saved_bdy, ntp_bdy);

  let bg_l_value = getComputedStyle(ntp_bdy).getPropertyValue("--bg-img-l").trim();
  let bg_d_value = getComputedStyle(ntp_bdy).getPropertyValue("--bg-img-d").trim();

  bg_l_value = bg_l_value.replace(/^url\(['"]?|['"]?\)$/g, "");
  bg_d_value = bg_d_value.replace(/^url\(['"]?|['"]?\)$/g, "");

  if (bg_l_value === "-" || bg_l_value === "") {
    bg_l_value = "../assets/svg/b2ntp_bg.svg";
  } else if (bg_l_value.startsWith("bg_custom_")) {
    bg_l_value = await BackgroundStore.load(bg_l_value);
  }

  if (bg_d_value === "-" || bg_d_value === "") {
    bg_d_value = "../assets/svg/b2ntp_bg_d.svg";
  } else if (bg_d_value.startsWith("bg_custom_")) {
    bg_d_value = await BackgroundStore.load(bg_d_value);
  }

  BackgroundStore.setImageVar(ntp_bdy, "l", bg_l_value);
  BackgroundStore.setImageVar(ntp_bdy, "d", bg_d_value);

  await _imgBackground(ntp_bdy, bg_l_value, bg_d_value);
}

async function _imgBackground(ntp_bdy, lightUrl, darkUrl) {
  const loadImage = async (url, key) => {
    try {
      const img = await new Promise((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        el.src = url;
      });
      return { img, url };
    } catch (error) {
      console.error(error);
      try {
        const refetchedUrl = await BackgroundStore.load(key);
        if (refetchedUrl && refetchedUrl !== url) return loadImage(refetchedUrl, key);
      } catch (e) {
        console.error("Failed to refetch from IndexedDB:", e);
      }
      return { img: null, url: null };
    }
  };

  try {
    const [{ img: li, url: lu }, { img: di, url: du }] = await Promise.all([
      loadImage(lightUrl, "bg_custom_l"),
      loadImage(darkUrl, "bg_custom_d"),
    ]);
    const bgoverlay = document.getElementById("background_overlay");
    const bglight = document.getElementById("background-light");
    const bgdark = document.getElementById("background-dark");
    if (bglight && li !== null && lu) {
      bglight.style.backgroundImage = `url(${lu})`;
      BackgroundStore.setImageVar(ntp_bdy, "l", lu);
    }
    if (bgdark && di !== null && du) {
      bgdark.style.backgroundImage = `url(${du})`;
      BackgroundStore.setImageVar(ntp_bdy, "d", du);
    }
    if (bgoverlay) bgoverlay.style.opacity = "1";
    if (lu !== lightUrl || du !== darkUrl) {
      settingsState.setBackgroundConfig(ntp_bdy.getAttribute("style"));
    }
  } catch (error) {
    console.error("Error loading background images:", error);
  }
}
