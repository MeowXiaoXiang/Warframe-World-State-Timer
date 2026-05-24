import type {
	RawWorldCycle,
	RawWorldCyclesData,
	RawWorldState,
	WorldStatePalette,
	WorldStateTheme,
} from "./types";

export const WORLD_CYCLES_SCHEMA_VERSION = 2;

export class WorldCyclesDataValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "WorldCyclesDataValidationError";
	}
}

function fail(path: string, requirement: string): never {
	throw new WorldCyclesDataValidationError(`${path}: ${requirement}.`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertNonEmptyString(
	value: unknown,
	path: string,
): asserts value is string {
	if (typeof value !== "string" || value.trim().length === 0) {
		fail(path, "must be a non-empty string");
	}
}

function parsePalette(value: unknown, path: string): WorldStatePalette {
	if (!isRecord(value)) {
		fail(path, "must be an object");
	}

	assertNonEmptyString(value.accent, `${path}.accent`);
	assertNonEmptyString(value.surface, `${path}.surface`);
	assertNonEmptyString(value.text, `${path}.text`);

	return {
		accent: value.accent,
		surface: value.surface,
		text: value.text,
	};
}

function parseTheme(value: unknown, path: string): WorldStateTheme {
	if (!isRecord(value)) {
		fail(path, "must be an object");
	}

	return {
		light: parsePalette(value.light, `${path}.light`),
		dark: parsePalette(value.dark, `${path}.dark`),
	};
}

function parseState(value: unknown, path: string): RawWorldState {
	if (!isRecord(value)) {
		fail(path, "must be an object");
	}

	assertNonEmptyString(value.key, `${path}.key`);
	if (typeof value.durationMs !== "number" || !Number.isFinite(value.durationMs) || value.durationMs <= 0) {
		fail(`${path}.durationMs`, "must be a finite positive number");
	}

	if (value.icon !== undefined && typeof value.icon !== "string") {
		fail(`${path}.icon`, "must be a string when present");
	}

	return {
		key: value.key,
		durationMs: value.durationMs,
		icon: value.icon,
		theme: parseTheme(value.theme, `${path}.theme`),
	};
}

function parseWorld(value: unknown, path: string): RawWorldCycle {
	if (!isRecord(value)) {
		fail(path, "must be an object");
	}

	if (typeof value.epochMs !== "number" || !Number.isFinite(value.epochMs)) {
		fail(`${path}.epochMs`, "must be a finite number");
	}

	if (!Array.isArray(value.states)) {
		fail(`${path}.states`, "must be an array");
	}

	if (value.states.length === 0) {
		fail(`${path}.states`, "must contain at least one state");
	}

	return {
		epochMs: value.epochMs,
		states: value.states.map((state, index) =>
			parseState(state, `${path}.states[${index}]`)
		),
	};
}

export function parseWorldCyclesData(input: unknown): RawWorldCyclesData {
	if (!isRecord(input)) {
		fail("worldCyclesData", "must be an object");
	}

	if (input.version !== WORLD_CYCLES_SCHEMA_VERSION) {
		fail(
			"version",
			`must be ${WORLD_CYCLES_SCHEMA_VERSION}`,
		);
	}

	if (!isRecord(input.worlds)) {
		fail("worlds", "must be an object");
	}

	const worldEntries = Object.entries(input.worlds);
	if (worldEntries.length === 0) {
		fail("worlds", "must contain at least one world");
	}

	const worlds: Record<string, RawWorldCycle> = {};
	worldEntries.forEach(([worldId, world]) => {
		if (worldId.trim().length === 0) {
			fail("worlds", "must not contain an empty world id");
		}
		worlds[worldId] = parseWorld(world, `worlds.${worldId}`);
	});

	return {
		version: WORLD_CYCLES_SCHEMA_VERSION,
		worlds,
	};
}
