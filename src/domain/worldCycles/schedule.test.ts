import { describe, expect, it } from "vitest";
import dayjs from "dayjs";
import {
	assignCycleStatuses,
	calculateCycleEntries,
	filterEntriesForTodayAndTomorrow,
} from "./schedule";
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

const world: WorldCycle = {
	id: "test_schedule",
	name: "Test Schedule",
	epochMs: 1000,
	loopDurationMs: 6000,
	states: [
		{ key: "one", label: "One", durationMs: 1000, theme: testTheme },
		{ key: "two", label: "Two", durationMs: 2000, theme: testTheme },
		{ key: "three", label: "Three", durationMs: 3000, theme: testTheme },
	],
};

describe("calculateCycleEntries", () => {
	it("includes states that overlap the requested range", () => {
		const entries = calculateCycleEntries(world, {
			startMs: 1500,
			endMs: 4500,
		});

		expect(entries.map((entry) => entry.stateKey)).toEqual(["one", "two", "three"]);
		expect(entries[0].startMs).toBe(1000);
		expect(entries[0].endMs).toBe(2000);
		expect(entries[2].startMs).toBe(4000);
		expect(entries[2].endMs).toBe(7000);
	});

	it("expands multiple loops contiguously", () => {
		const entries = calculateCycleEntries(world, {
			startMs: 1000,
			endMs: 13000,
		});

		expect(entries.map((entry) => entry.stateKey)).toEqual([
			"one",
			"two",
			"three",
			"one",
			"two",
			"three",
		]);

		for (let index = 1; index < entries.length; index += 1) {
			expect(entries[index].startMs).toBe(entries[index - 1].endMs);
		}
	});

	it("returns an empty list for invalid ranges", () => {
		expect(calculateCycleEntries(world, { startMs: 5000, endMs: 5000 })).toEqual([]);
		expect(calculateCycleEntries(world, { startMs: 6000, endMs: 5000 })).toEqual([]);
	});
});

describe("filterEntriesForTodayAndTomorrow", () => {
	it("keeps entries starting today or tomorrow", () => {
		const now = dayjs("2026-05-10T08:00:00");
		const entries = [
			{
				worldId: world.id,
				stateKey: "past",
				stateIndex: 0,
				label: "Past",
				theme: testTheme,
				start: dayjs("2026-05-09T23:59:59"),
				end: dayjs("2026-05-10T00:30:00"),
				startMs: dayjs("2026-05-09T23:59:59").valueOf(),
				endMs: dayjs("2026-05-10T00:30:00").valueOf(),
			},
			{
				worldId: world.id,
				stateKey: "today",
				stateIndex: 1,
				label: "Today",
				theme: testTheme,
				start: dayjs("2026-05-10T00:00:00"),
				end: dayjs("2026-05-10T01:00:00"),
				startMs: dayjs("2026-05-10T00:00:00").valueOf(),
				endMs: dayjs("2026-05-10T01:00:00").valueOf(),
			},
			{
				worldId: world.id,
				stateKey: "tomorrow",
				stateIndex: 2,
				label: "Tomorrow",
				theme: testTheme,
				start: dayjs("2026-05-11T23:59:59"),
				end: dayjs("2026-05-12T00:30:00"),
				startMs: dayjs("2026-05-11T23:59:59").valueOf(),
				endMs: dayjs("2026-05-12T00:30:00").valueOf(),
			},
			{
				worldId: world.id,
				stateKey: "future",
				stateIndex: 0,
				label: "Future",
				theme: testTheme,
				start: dayjs("2026-05-12T00:00:00"),
				end: dayjs("2026-05-12T01:00:00"),
				startMs: dayjs("2026-05-12T00:00:00").valueOf(),
				endMs: dayjs("2026-05-12T01:00:00").valueOf(),
			},
		];

		const filtered = filterEntriesForTodayAndTomorrow(entries, now);
		expect(filtered.map((entry) => entry.stateKey)).toEqual(["today", "tomorrow"]);
	});
});

describe("assignCycleStatuses", () => {
	it("marks ended, ongoing, next, and not-started entries", () => {
		const entries = calculateCycleEntries(world, {
			startMs: 1000,
			endMs: 13000,
		});
		const assigned = assignCycleStatuses(entries, 4500);

		expect(assigned.map((entry) => entry.statusClass)).toEqual([
			"status-ended",
			"status-ended",
			"status-ongoing",
			"status-next",
			"status-not-started",
			"status-not-started",
		]);
	});
});
