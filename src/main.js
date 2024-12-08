import { createApp } from "vue";
import App from "./App.vue";
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap CSS
import "./style.css"; // 全域樣式

// Vue I18n
import { createI18n } from "vue-i18n";
import tw from "./locales/zh-TW.json";
import en from "./locales/en.json";

// Day.js plugins
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";

// 主題管理
import { initTheme } from "./utils/themeManager";

// 初始化 Day.js 插件
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

// 初始化主題
initTheme();

// Vue I18n
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

// 創建 Vue 應用
const app = createApp(App);

app.use(i18n); // 使用 I18n
app.mount("#app");
