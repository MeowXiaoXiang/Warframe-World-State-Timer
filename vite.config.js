import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["images/cycle_icon.svg", "images/cycle_icon.png"],
			manifest: {
				name: "Warframe 世界循環時間表",
				short_name: "Warframe 計時器",
				description:
					"Warframe 世界循環追蹤工具，支援夜靈平野、奧布山谷、魔裔禁地與扎日曼號。",
				theme_color: "#333333",
				background_color: "#121212",
				display: "standalone",
				start_url: "/Warframe-World-State-Timer/",
				scope: "/Warframe-World-State-Timer/",
				icons: [
					{
						src: "images/pwa-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "images/pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
					},
				],
			},
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"],
				runtimeCaching: [
					{
						urlPattern: ({ url }) =>
							url.pathname.endsWith("/data/world_cycles.json"),
						handler: "StaleWhileRevalidate",
						options: {
							cacheName: "world-cycles-data",
						},
					},
				],
			},
		}),
	],
	base: process.env.NODE_ENV === 'production' ? "/Warframe-World-State-Timer/" : "/",
	// 防止在測試狀態下路徑跑掉
});
