import { describe, expect, it } from "vitest";
import type { ComposerTranslation } from "vue-i18n";
import { normalizeWorldCycle } from "./normalize";

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

function createTranslator(messages: Record<string, string>): ComposerTranslation {
	return ((key: string) => messages[key] ?? key) as ComposerTranslation;
}

describe("normalizeWorldCycle", () => {
	it("adds localized world and state labels", () => {
		const world = normalizeWorldCycle(
			"test_world",
			{
				epochMs: 1000,
				states: [
					{ key: "alpha", durationMs: 2000, icon: "A", theme: testTheme },
					{ key: "beta", durationMs: 3000, theme: testTheme },
				],
			},
			{
				t: createTranslator({
					"worlds.test_world.name": "Test World",
					"worlds.test_world.states.alpha": "Alpha",
					"worlds.test_world.states.beta": "Beta",
				}),
			}
		);

		expect(world.name).toBe("Test World");
		expect(world.loopDurationMs).toBe(5000);
		expect(world.states.map((state) => state.label)).toEqual(["Alpha", "Beta"]);
		expect(world.states[0].icon).toBe("A");
		expect(world.states[0].theme).toBe(testTheme);
	});

	it("falls back to ids and state keys when translations are missing", () => {
		const world = normalizeWorldCycle(
			"missing_world",
			{
				epochMs: 1000,
				states: [{ key: "unknown", durationMs: 2000, theme: testTheme }],
			},
			{ t: createTranslator({}) }
		);

		expect(world.name).toBe("missing_world");
		expect(world.states[0].label).toBe("unknown");
	});
});
