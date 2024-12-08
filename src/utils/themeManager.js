import { ref, computed, watchEffect } from "vue";

// 響應式主題狀態
const theme = ref(localStorage.getItem("theme") || "light");

// 切換主題
const toggleTheme = () => {
    theme.value = theme.value === "dark" ? "light" : "dark";
    localStorage.setItem("theme", theme.value);
};

// 判斷是否為深色模式
const isDarkTheme = computed(() => theme.value === "dark");

// 初始化主題
const initTheme = () => {
    watchEffect(() => {
        // 使用 data-theme 動態更新主題
        document.documentElement.setAttribute("data-theme", theme.value);
    });
};

export { isDarkTheme, toggleTheme, initTheme };
