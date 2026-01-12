import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { setDefaultBaseUrl, setDefaultHeaders } from "./libs/fetchJson";
import VueApexCharts from "vue3-apexcharts";

// Fallbacks pour les variables d'environnement si non définies au build
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin;
const WS_HOST = import.meta.env.VITE_WS_HOST || window.location.hostname;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dqbyulp69';

console.log('🔧 Environment variables:');
console.log('VITE_API_BASE_URL:', API_BASE_URL);
console.log('VITE_WS_HOST:', WS_HOST);
console.log('VITE_CLOUDINARY_CLOUD_NAME:', CLOUDINARY_CLOUD_NAME);

setDefaultBaseUrl(API_BASE_URL);

const token = localStorage.getItem("token");
if (token) {
  setDefaultHeaders({ Authorization: `Bearer ${token}` });
}

let theme = localStorage.getItem("theme");

if (!theme) {
  theme = "dark";
  localStorage.setItem("theme", theme);
  document.querySelector("body").classList.add("dark");
} else {
  if (theme == "light") {
    document.querySelector("body").classList.remove("dark");
  } else if (theme == "dark") {
    document.querySelector("body").classList.add("dark");
  }
}
const app = createApp(App).use(router)
app.use(VueApexCharts);
app.mount("#app");

