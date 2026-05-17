import { describe, expect, it } from "vitest";
import {
	assertValidWorldCycle,
	getActiveWorldState,
	getLoopDurationMs,
	positiveModulo,
} from "./engine";
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

const twoStateWorld: WorldCycle = {
	id: "test_two_state",
	name: "Test Two State",
	epochMs: 1000,
	loopDurationMs: 5000,
	states: [
		{
			key: "alpha",
			label: "Alpha",
			durationMs: 2000,
			theme: testTheme,
		},
		{
			key: "beta",
			label: "Beta",
			durationMs: 3000,
			theme: testTheme,
		},
	],
};

const duviriWorld: WorldCycle = {
	id: "duviri",
	name: "Duviri",
	epochMs: 1766138452676,
	loopDurationMs: 36000000,
	states: [
		{ key: "joy", label: "Joy", durationMs: 7200000, theme: testTheme },
		{ key: "anger", label: "Anger", durationMs: 7200000, theme: testTheme },
		{ key: "envy", label: "Envy", durationMs: 7200000, theme: testTheme },
		{ key: "sorrow", label: "Sorrow", durationMs: 7200000, theme: testTheme },
		{ key: "fear", label: "Fear", durationMs: 7200000, theme: testTheme },
	],
};

describe("positiveModulo", () => {
	it("keeps modulo values positive before the epoch", () => {
		expect(positiveModulo(-1, 5000)).toBe(4999);
		expect(positiveModulo(-5000, 5000)).toBe(0);
		expect(positiveModulo(-5001, 5000)).toBe(4999);
	});

	it("rejects invalid divisors", () => {
		expect(() => positiveModulo(1, 0)).toThrow();
		expect(() => positiveModulo(1, -1)).toThrow();
	});
});

describe("getLoopDurationMs", () => {
	it("sums state durations", () => {
		expect(getLoopDurationMs(twoStateWorld.states)).toBe(5000);
		expect(getLoopDurationMs(duviriWorld.states)).toBe(36000000);
	});
});

describe("assertValidWorldCycle", () => {
	it("accepts a valid cycle", () => {
		expect(() => assertValidWorldCycle(twoStateWorld)).not.toThrow();
	});

	it("rejects empty states", () => {
		expect(() =>
			assertValidWorldCycle({
				...twoStateWorld,
				states: [],
				loopDurationMs: 0,
			})
		).toThrow();
	});

	it("rejects mismatched loop duration", () => {
		expect(() =>
			assertValidWorldCycle({
				...twoStateWorld,
				loopDurationMs: 4999,
			})
		).toThrow();
	});
});

describe("getActiveWorldState", () => {
	it("resolves exact state boundaries for a two-state cycle", () => {
		expect(getActiveWorldState(twoStateWorld, 1000).state.key).toBe("alpha");
		expect(getActiveWorldState(twoStateWorld, 2999).state.key).toBe("alpha");
		expect(getActiveWorldState(twoStateWorld, 3000).state.key).toBe("beta");
		expect(getActiveWorldState(twoStateWorld, 5999).state.key).toBe("beta");
		expect(getActiveWorldState(twoStateWorld, 6000).state.key).toBe("alpha");
	});

	it("resolves the state before epoch using positive modulo", () => {
		const active = getActiveWorldState(twoStateWorld, 999);
		expect(active.state.key).toBe("beta");
		expect(active.positionMs).toBe(4999);
		expect(active.remainingMs).toBe(1);
	});

	it("reports next state and remaining time", () => {
		const active = getActiveWorldState(twoStateWorld, 2000);
		expect(active.state.key).toBe("alpha");
		expect(active.nextState.key).toBe("beta");
		expect(active.elapsedMs).toBe(1000);
		expect(active.remainingMs).toBe(1000);
	});

	it("supports Duviri's five-state sequence", () => {
		duviriWorld.states.forEach((state, index) => {
			const nowMs = duviriWorld.epochMs + index * 7200000;
			const active = getActiveWorldState(duviriWorld, nowMs);

			expect(active.state.key).toBe(state.key);
			expect(active.nextState.key).toBe(
				duviriWorld.states[(index + 1) % duviriWorld.states.length].key
			);
		});

		expect(getActiveWorldState(duviriWorld, duviriWorld.epochMs + 36000000).state.key).toBe("joy");
		expect(getActiveWorldState(duviriWorld, duviriWorld.epochMs - 1).state.key).toBe("fear");
	});
});
