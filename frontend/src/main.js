import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { setDefaultBaseUrl, setDefaultHeaders } from "./libs/fetchJson";
import VueApexCharts from "vue3-apexcharts";

setDefaultBaseUrl(import.meta.env.VITE_API_BASE_URL);

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

