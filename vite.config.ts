import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

function getWorldCyclesDataHash(): string {
	const data = readFileSync("public/data/world_cycles.json");
	return createHash("sha256").update(data).digest("hex").slice(0, 12);
}

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
	define: {
		__WORLD_CYCLES_DATA_HASH__: JSON.stringify(getWorldCyclesDataHash()),
	},
	base: process.env.NODE_ENV === "production" ? "/Warframe-World-State-Timer/" : "/",
	// 防止在測試狀態下路徑跑掉
});
