import { readFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { resolve } from "node:path";
import {
	assignCycleStatuses,
	calculateCycleEntries,
	getActiveWorldState,
	getDefaultScheduleRange,
	positiveModulo,
} from "../src/domain/worldCycles";
import type {
	CycleEntry,
	RawWorldCyclesData,
	WorldCycle,
	WorldStateTheme,
} from "../src/domain/worldCycles";

const verificationTheme: WorldStateTheme = {
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

const labels: Record<string, { name: string; states: Record<string, string> }> = {
	plains_earth: {
		name: "Plains of Eidolon & Earth",
		states: {
			day: "Day",
			night: "Night",
		},
	},
	orb: {
		name: "Orb Vallis",
		states: {
			warm: "Warm",
			cold: "Cold",
		},
	},
	cambion: {
		name: "Cambion Drift",
		states: {
			fass: "Fass",
			vome: "Vome",
		},
	},
	zariman: {
		name: "Zariman Ten Zero",
		states: {
			grineer: "Grineer",
			corpus: "Corpus",
		},
	},
	duviri: {
		name: "Duviri",
		states: {
			joy: "Joy",
			anger: "Anger",
			envy: "Envy",
			sorrow: "Sorrow",
			fear: "Fear",
		},
	},
};

const legacyExpectations: Record<
	string,
	{
		epochMs: number;
		states: Array<{ key: string; durationMs: number }>;
	}
> = {
	plains_earth: {
		epochMs: Date.parse("2021-02-05T12:27:54Z"),
		states: [
			{ key: "day", durationMs: 5998874 },
			{ key: "night", durationMs: 3000000 },
		],
	},
	orb: {
		epochMs: Date.parse("2021-01-09T08:13:48Z"),
		states: [
			{ key: "warm", durationMs: 400000 },
			{ key: "cold", durationMs: 1200000 },
		],
	},
	cambion: {
		epochMs: Date.parse("2021-02-05T12:27:54Z"),
		states: [
			{ key: "fass", durationMs: 5998874 },
			{ key: "vome", durationMs: 3000000 },
		],
	},
	zariman: {
		epochMs: Date.parse("2025-02-06T12:34:30Z"),
		states: [
			{ key: "corpus", durationMs: 9000000 },
			{ key: "grineer", durationMs: 9000000 },
		],
	},
};

function normalizeForVerification(id: string, data: RawWorldCyclesData): WorldCycle {
	const rawWorld = data.worlds[id];
	if (!rawWorld) {
		throw new Error(`Missing world "${id}" in world_cycles.json.`);
	}

	const worldLabels = labels[id];
	if (!worldLabels) {
		throw new Error(`Missing verification labels for world "${id}".`);
	}

	const states = rawWorld.states.map((state) => ({
		key: state.key,
		label: worldLabels.states[state.key] ?? state.key,
		icon: state.icon,
		durationMs: state.durationMs,
		theme: state.theme,
	}));

	return {
		id,
		name: worldLabels.name,
		epochMs: rawWorld.epochMs,
		loopDurationMs: states.reduce((total, state) => total + state.durationMs, 0),
		states,
	};
}

function getStateStartOffsets(world: WorldCycle): number[] {
	let offsetMs = 0;
	return world.states.map((state) => {
		const startOffsetMs = offsetMs;
		offsetMs += state.durationMs;
		return startOffsetMs;
	});
}

function expectActiveState(world: WorldCycle, nowMs: number, expectedKey: string): void {
	const active = getActiveWorldState(world, nowMs);

	if (active.state.key !== expectedKey) {
		throw new Error(
			`${world.id}: expected ${expectedKey} at ${new Date(nowMs).toISOString()}, got ${active.state.key}.`
		);
	}
}

function assertStateSequence(world: WorldCycle): void {
	const startOffsets = getStateStartOffsets(world);

	world.states.forEach((state, stateIndex) => {
		const stateStartMs = world.epochMs + startOffsets[stateIndex];
		const stateEndMs = stateStartMs + state.durationMs;

		expectActiveState(world, stateStartMs, state.key);
		expectActiveState(world, stateStartMs + Math.floor(state.durationMs / 2), state.key);

		if (state.durationMs > 1) {
			expectActiveState(world, stateEndMs - 1, state.key);
		}

		const nextState = world.states[(stateIndex + 1) % world.states.length];
		expectActiveState(world, stateEndMs, nextState.key);
	});

	expectActiveState(world, world.epochMs + world.loopDurationMs, world.states[0].key);
	expectActiveState(world, world.epochMs - 1, world.states.at(-1)?.key ?? "");
}

function legacyStateAt(
	nowMs: number,
	epochMs: number,
	states: Array<{ key: string; durationMs: number }>
): string {
	const loopDurationMs = states.reduce((total, state) => total + state.durationMs, 0);
	const positionMs = positiveModulo(nowMs - epochMs, loopDurationMs);
	let offsetMs = 0;

	for (const state of states) {
		offsetMs += state.durationMs;
		if (positionMs < offsetMs) {
			return state.key;
		}
	}

	throw new Error("Unable to resolve legacy state.");
}

function assertLegacyAlgorithmParity(worldId: string): void {
	const legacy = legacyExpectations[worldId];
	if (!legacy) return;

	const states = legacy.states.map((state) => ({
		key: state.key,
		label: state.key,
		durationMs: state.durationMs,
		theme: verificationTheme,
	}));
	const legacyAsV2World: WorldCycle = {
		id: `${worldId}_legacy_algorithm_probe`,
		name: worldId,
		epochMs: legacy.epochMs,
		loopDurationMs: states.reduce((total, state) => total + state.durationMs, 0),
		states,
	};
	const loopDurationMs = legacyAsV2World.loopDurationMs;
	const firstStateDurationMs = legacy.states[0].durationMs;
	const probes = [
		legacy.epochMs,
		legacy.epochMs + 1,
		legacy.epochMs + firstStateDurationMs - 1,
		legacy.epochMs + firstStateDurationMs,
		legacy.epochMs + loopDurationMs - 1,
		legacy.epochMs + loopDurationMs,
		Date.now(),
	];

	probes.forEach((probeMs) => {
		const active = getActiveWorldState(legacyAsV2World, probeMs);
		const expectedKey = legacyStateAt(probeMs, legacy.epochMs, legacy.states);

		if (active.state.key !== expectedKey) {
			throw new Error(
				`${worldId}: v2 algorithm ${active.state.key} differs from legacy algorithm ${expectedKey} at ${new Date(probeMs).toISOString()}.`
			);
		}
	});
}

function assertLegacyDurationParity(world: WorldCycle): void {
	const legacy = legacyExpectations[world.id];
	if (!legacy) return;

	const expectedLoopDurationMs = legacy.states.reduce(
		(total, state) => total + state.durationMs,
		0
	);
	if (world.loopDurationMs !== expectedLoopDurationMs) {
		throw new Error(`${world.id}: loop duration changed from legacy value.`);
	}
}

function assertScheduleContiguity(entries: CycleEntry[], world: WorldCycle): void {
	for (let index = 1; index < entries.length; index += 1) {
		const previous = entries[index - 1];
		const current = entries[index];

		if (previous.endMs !== current.startMs) {
			throw new Error(
				`${world.id}: schedule gap/overlap between ${previous.stateKey} and ${current.stateKey}.`
			);
		}

		const expectedStateIndex = (previous.stateIndex + 1) % world.states.length;
		if (current.stateIndex !== expectedStateIndex) {
			throw new Error(
				`${world.id}: expected schedule state index ${expectedStateIndex}, got ${current.stateIndex}.`
			);
		}
	}
}

function assertRangeBoundaryInclusion(world: WorldCycle): void {
	const firstState = world.states[0];
	const secondState = world.states[1] ?? world.states[0];
	const range = {
		startMs: world.epochMs + Math.floor(firstState.durationMs / 2),
		endMs: world.epochMs + firstState.durationMs + Math.floor(secondState.durationMs / 2),
	};
	const entries = calculateCycleEntries(world, range);

	if (entries.length < 2) {
		throw new Error(`${world.id}: expected range boundary schedule to include crossed states.`);
	}

	if (entries[0].stateKey !== firstState.key) {
		throw new Error(`${world.id}: expected overlapping first range entry to be ${firstState.key}.`);
	}

	if (entries[1].stateKey !== secondState.key) {
		throw new Error(`${world.id}: expected second range entry to be ${secondState.key}.`);
	}
}

function assertDuviriSequence(world: WorldCycle): void {
	if (world.id !== "duviri") return;

	const expectedKeys = ["joy", "anger", "envy", "sorrow", "fear"];
	const actualKeys = world.states.map((state) => state.key);

	if (actualKeys.join(",") !== expectedKeys.join(",")) {
		throw new Error(`duviri: expected state order ${expectedKeys.join(",")}, got ${actualKeys.join(",")}.`);
	}

	world.states.forEach((state) => {
		if (state.durationMs !== 7200000) {
			throw new Error(`duviri: expected ${state.key} duration to be 7200000ms.`);
		}
	});
}

function verifySchedule(world: WorldCycle): void {
	const range = getDefaultScheduleRange();
	const entries = assignCycleStatuses(calculateCycleEntries(world, range));
	const stateKeys = new Set(entries.map((entry) => entry.stateKey));

	world.states.forEach((state) => {
		if (!stateKeys.has(state.key)) {
			throw new Error(`${world.id}: schedule did not include state "${state.key}".`);
		}
	});

	if (entries.length === 0) {
		throw new Error(`${world.id}: schedule produced no entries.`);
	}

	assertScheduleContiguity(entries, world);
	assertRangeBoundaryInclusion(world);
}

function benchmarkCycles(worlds: WorldCycle[]): void {
	const scheduleIterations = 1000;
	const statusIterations = 10000;
	const range = getDefaultScheduleRange();

	const scheduleStart = performance.now();
	for (let iteration = 0; iteration < scheduleIterations; iteration += 1) {
		worlds.forEach((world) => {
			assignCycleStatuses(calculateCycleEntries(world, range));
		});
	}
	const scheduleDurationMs = performance.now() - scheduleStart;

	const statusStart = performance.now();
	for (let iteration = 0; iteration < statusIterations; iteration += 1) {
		const nowMs = Date.now() + iteration;
		worlds.forEach((world) => {
			getActiveWorldState(world, nowMs);
		});
	}
	const statusDurationMs = performance.now() - statusStart;

	console.log(
		`Benchmark: ${scheduleIterations} schedule runs x ${worlds.length} worlds = ${scheduleDurationMs.toFixed(2)}ms`
	);
	console.log(
		`Benchmark: ${statusIterations} current-state runs x ${worlds.length} worlds = ${statusDurationMs.toFixed(2)}ms`
	);

	if (scheduleDurationMs > 5000) {
		throw new Error(`Schedule benchmark is unexpectedly slow: ${scheduleDurationMs.toFixed(2)}ms.`);
	}

	if (statusDurationMs > 1000) {
		throw new Error(`Current-state benchmark is unexpectedly slow: ${statusDurationMs.toFixed(2)}ms.`);
	}
}

function formatRemaining(milliseconds: number): string {
	const totalSeconds = Math.ceil(milliseconds / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	return `${hours}h ${minutes}m ${seconds}s`;
}

const dataPath = resolve("public/data/world_cycles.json");
const data = JSON.parse(await readFile(dataPath, "utf-8")) as RawWorldCyclesData;

if (data.version !== 2) {
	throw new Error(`Expected world_cycles.json version 2, got ${data.version}.`);
}

const worldIds = Object.keys(data.worlds);
const nowMs = Date.now();

console.log(`Verifying ${worldIds.length} world cycles from ${dataPath}`);

const worlds = worldIds.map((worldId) => normalizeForVerification(worldId, data));

worlds.forEach((world) => {
	assertStateSequence(world);
	assertLegacyAlgorithmParity(world.id);
	assertLegacyDurationParity(world);
	assertDuviriSequence(world);
	verifySchedule(world);

	const active = getActiveWorldState(world, nowMs);
	console.log(
		`${world.id}: current=${active.state.label}, next=${active.nextState.label}, remaining=${formatRemaining(active.remainingMs)}, states=${world.states.length}`
	);
});

benchmarkCycles(worlds);

console.log("Cycle verification completed.");
