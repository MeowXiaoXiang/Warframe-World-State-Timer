import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
	plugins: [vue()],
	base: process.env.NODE_ENV === 'production' ? "/Warframe-World-State-Timer/" : "/",
	// 防止在測試狀態下路徑跑掉
});
