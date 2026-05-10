import dayjs from "dayjs";
import { assertValidWorldCycle } from "./engine";
import type { CycleEntry, CycleStatusClass, ScheduleRange, WorldCycle } from "./types";

export function getDefaultScheduleRange(now = dayjs()): ScheduleRange {
	return {
		startMs: now.startOf("day").subtract(1, "day").add(12, "hour").valueOf(),
		endMs: now.startOf("day").add(2, "day").add(12, "hour").valueOf(),
	};
}

export function calculateCycleEntries(world: WorldCycle, range: ScheduleRange): CycleEntry[] {
	assertValidWorldCycle(world);

	if (range.endMs <= range.startMs) {
		return [];
	}

	const entries: CycleEntry[] = [];
	const loopDurationMs = world.loopDurationMs;
	let cycleStartMs =
		world.epochMs +
		Math.floor((range.startMs - world.epochMs) / loopDurationMs) * loopDurationMs;

	while (cycleStartMs < range.endMs) {
		let stateOffsetMs = 0;

		world.states.forEach((state, stateIndex) => {
			const startMs = cycleStartMs + stateOffsetMs;
			const endMs = startMs + state.durationMs;

			if (endMs > range.startMs && startMs < range.endMs) {
				entries.push({
					worldId: world.id,
					stateKey: state.key,
					stateIndex,
					label: state.label,
					icon: state.icon,
					theme: state.theme,
					start: dayjs(startMs),
					end: dayjs(endMs),
					startMs,
					endMs,
				});
			}

			stateOffsetMs += state.durationMs;
		});

		cycleStartMs += loopDurationMs;
	}

	return entries;
}

export function filterEntriesForTodayAndTomorrow(
	entries: CycleEntry[],
	now = dayjs()
): CycleEntry[] {
	const todayStartMs = now.startOf("day").valueOf();
	const tomorrowEndMs = now.startOf("day").add(1, "day").endOf("day").valueOf();

	return entries.filter((entry) => entry.startMs >= todayStartMs && entry.startMs < tomorrowEndMs);
}

export function assignCycleStatuses(
	entries: CycleEntry[],
	nowMs = Date.now()
): CycleEntry[] {
	const withBaseStatuses = entries.map((entry): CycleEntry => {
		let statusClass: CycleStatusClass;

		if (nowMs >= entry.startMs && nowMs < entry.endMs) {
			statusClass = "status-ongoing";
		} else if (nowMs >= entry.endMs) {
			statusClass = "status-ended";
		} else {
			statusClass = "status-not-started";
		}

		return {
			...entry,
			statusClass,
		};
	});

	const nextCycle = withBaseStatuses.find(
		(entry) => entry.statusClass === "status-not-started"
	);

	if (!nextCycle) {
		return withBaseStatuses;
	}

	return withBaseStatuses.map((entry) =>
		entry === nextCycle ? { ...entry, statusClass: "status-next" } : entry
	);
}
