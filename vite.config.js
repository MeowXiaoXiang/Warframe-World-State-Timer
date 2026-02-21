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
			manifest: false,
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg,json,webmanifest}"],
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
