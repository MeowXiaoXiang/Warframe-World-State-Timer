import { createApp } from "vue";
import { registerSW } from "virtual:pwa-register";
import App from "./App.vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";

import { createI18n } from "vue-i18n";
import tw from "./locales/zh-TW.json";
import en from "./locales/en.json";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";

import { initTheme } from "./utils/themeManager";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

initTheme();

registerSW({ immediate: true });

const savedLocale = localStorage.getItem("locale") || "zh-TW";
const i18n = createI18n({
    legacy: false,
    locale: savedLocale,
    fallbackLocale: "zh-TW",
    messages: {
        "zh-TW": tw,
        "en-US": en,
    },
});

const app = createApp(App);

app.use(i18n);
app.mount("#app");
