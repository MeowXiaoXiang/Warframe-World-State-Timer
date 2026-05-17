import dayjs from "dayjs";
import { assertValidWorldCycle } from "./engine";
import type { CycleEntry, CycleStatusClass, ScheduleRange, WorldCycle } from "./types";

export function getDefaultScheduleRange(now = dayjs()): ScheduleRange {
	return {
		// 多抓前後半天，讓跨午夜或從前一天延續到今天的狀態仍能被推演後再過濾。
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
	// 從 range.start 所在的那一輪開始推，保留與 range 起點重疊但較早開始的 state。
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

	// 保留既有 UI 行為：只顯示「開始時間」落在今天或明天的項目。
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

	const nextEntry = withBaseStatuses.find(
		(entry) => entry.statusClass === "status-not-started"
	);

	if (!nextEntry) {
		return withBaseStatuses;
	}

	return withBaseStatuses.map((entry) =>
		entry === nextEntry ? { ...entry, statusClass: "status-next" } : entry
	);
}
