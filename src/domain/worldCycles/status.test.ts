import { describe, expect, it } from "vitest";
import type { ComposerTranslation } from "vue-i18n";
import { calculateWorldStatus } from "./status";
import type { WorldCycle } from "./types";

const testTheme = {
	light: {
		accent: "#999999",
		surface: "#eeeeee",
		text: "#111111",
	},
	dark: {
		accent: "#bbbbbb",
		surface: "#333333",
		text: "#f5f5f5",
	},
};

const t = ((key: string) => {
	const messages: Record<string, string> = {
		"time.hours": "h",
		"time.minutes": "m",
		"time.seconds": "s",
	};
	return messages[key] ?? key;
}) as ComposerTranslation;

const world: WorldCycle = {
	id: "test_status",
	name: "Test Status",
	epochMs: 1000,
	loopDurationMs: 5000,
	states: [
		{ key: "alpha", label: "Alpha", durationMs: 2000, icon: "A", theme: testTheme },
		{ key: "beta", label: "Beta", durationMs: 3000, icon: "B", theme: testTheme },
	],
};

describe("calculateWorldStatus", () => {
	it("formats current state, next state, icon, theme, and remaining time", () => {
		const status = calculateWorldStatus([world], { t }, 2000).test_status;

		expect(status.status).toBe("Alpha");
		expect(status.icon).toBe("A");
		expect(status.theme).toBe(testTheme);
		expect(status.timeLeft).toBe("1 s");
		expect(status.stateKey).toBe("alpha");
		expect(status.nextStateKey).toBe("beta");
	});

	it("falls back to a placeholder icon when the active state has no icon", () => {
		const worldWithoutIcon: WorldCycle = {
			...world,
			states: [
				{ key: "alpha", label: "Alpha", durationMs: 2000, theme: testTheme },
				world.states[1],
			],
		};

		const status = calculateWorldStatus([worldWithoutIcon], { t }, 2000).test_status;
		expect(status.icon).toBe("❓");
	});
});
