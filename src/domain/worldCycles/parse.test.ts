import { describe, expect, it } from "vitest";
import {
	parseWorldCyclesData,
	WorldCyclesDataValidationError,
} from "./parse";

const validTheme = {
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

interface TestRawWorldState {
	key: unknown;
	durationMs: unknown;
	icon?: unknown;
	theme: unknown;
}

interface TestRawWorldCyclesData {
	version: unknown;
	worlds: Record<string, {
		epochMs: unknown;
		states: TestRawWorldState[];
	}>;
}

const createValidData = (): TestRawWorldCyclesData => ({
	version: 2,
	worlds: {
		test_world: {
			epochMs: 1000,
			states: [
				{
					key: "alpha",
					durationMs: 2000,
					icon: "A",
					theme: validTheme,
				},
			],
		},
	},
});

describe("parseWorldCyclesData", () => {
	it("accepts valid v2 data", () => {
		const parsed = parseWorldCyclesData(createValidData());

		expect(parsed.version).toBe(2);
		expect(parsed.worlds.test_world.states[0].key).toBe("alpha");
	});

	it("rejects schema version mismatches", () => {
		const data = createValidData();
		data.version = 1;

		expect(() => parseWorldCyclesData(data)).toThrow(
			WorldCyclesDataValidationError,
		);
		expect(() => parseWorldCyclesData(data)).toThrow("version");
	});

	it("rejects empty worlds", () => {
		const data = createValidData();
		data.worlds = {};

		expect(() => parseWorldCyclesData(data)).toThrow("worlds");
	});

	it("rejects empty states", () => {
		const data = createValidData();
		data.worlds.test_world.states = [];

		expect(() => parseWorldCyclesData(data)).toThrow(
			"worlds.test_world.states",
		);
	});

	it.each([Number.NaN, Number.POSITIVE_INFINITY, "1000"])(
		"rejects invalid epochMs values: %s",
		(epochMs) => {
			const data = createValidData();
			data.worlds.test_world.epochMs = epochMs;

			expect(() => parseWorldCyclesData(data)).toThrow(
				"worlds.test_world.epochMs",
			);
		},
	);

	it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, "2000"])(
		"rejects invalid durationMs values: %s",
		(durationMs) => {
			const data = createValidData();
			data.worlds.test_world.states[0].durationMs = durationMs;

			expect(() => parseWorldCyclesData(data)).toThrow(
				"worlds.test_world.states[0].durationMs",
			);
		},
	);

	it.each([
		["theme.light.accent", { ...validTheme, light: { ...validTheme.light, accent: "" } }],
		["theme.light.surface", { ...validTheme, light: { ...validTheme.light, surface: "" } }],
		["theme.light.text", { ...validTheme, light: { ...validTheme.light, text: "" } }],
		["theme.dark.accent", { ...validTheme, dark: { ...validTheme.dark, accent: "" } }],
		["theme.dark.surface", { ...validTheme, dark: { ...validTheme.dark, surface: "" } }],
		["theme.dark.text", { ...validTheme, dark: { ...validTheme.dark, text: "" } }],
	])("rejects missing or empty %s", (_path, theme) => {
		const data = createValidData();
		data.worlds.test_world.states[0].theme = theme;

		expect(() => parseWorldCyclesData(data)).toThrow(
			"worlds.test_world.states[0]",
		);
	});

	it("rejects empty state keys", () => {
		const data = createValidData();
		data.worlds.test_world.states[0].key = "";

		expect(() => parseWorldCyclesData(data)).toThrow(
			"worlds.test_world.states[0].key",
		);
	});

	it("rejects non-string icons", () => {
		const data = createValidData();
		data.worlds.test_world.states[0].icon = 42;

		expect(() => parseWorldCyclesData(data)).toThrow(
			"worlds.test_world.states[0].icon",
		);
	});
});
