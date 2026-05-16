import { ref, computed, watchEffect } from "vue";

type Theme = "dark" | "light";

const savedTheme = localStorage.getItem("theme");
const theme = ref<Theme>(savedTheme === "light" ? "light" : "dark");

const toggleTheme = () => {
    theme.value = theme.value === "dark" ? "light" : "dark";
    localStorage.setItem("theme", theme.value);
};

const isDarkTheme = computed(() => theme.value === "dark");

const initTheme = () => {
    watchEffect(() => {
        document.documentElement.setAttribute("data-theme", theme.value);
    });
};

export { isDarkTheme, toggleTheme, initTheme };
