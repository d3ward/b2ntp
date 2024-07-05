import './css/main.css';
import { navbar } from "./js/navbar";
import { modal } from "./js/modal";
import {themeManager} from "./js/themeManager";
import {carousel} from "./js/carousel";
import {gotop} from "./js/gotop";
import {pagesRoute} from "./js/pagesRoute";
import {aos} from "./js/aos";

// Call the function when the DOM is loaded
document.addEventListener("DOMContentLoaded", ()=>{
  new themeManager();
  new navbar();
  new gotop();
  new aos();
  new modal("#mdl1");
  new pagesRoute();

});