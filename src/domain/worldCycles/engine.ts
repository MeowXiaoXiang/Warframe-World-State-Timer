import type { ActiveWorldState, WorldCycle, WorldState } from "./types";

export function positiveModulo(value: number, divisor: number): number {
	if (!Number.isFinite(value) || !Number.isFinite(divisor) || divisor <= 0) {
		throw new Error("positiveModulo requires a finite positive divisor.");
	}

	// JavaScript 的 % 會保留負號；epoch 前的時間也要能正確落在上一輪循環。
	return ((value % divisor) + divisor) % divisor;
}

export function getLoopDurationMs(states: WorldState[]): number {
	return states.reduce((total, state) => total + state.durationMs, 0);
}

export function assertValidWorldCycle(world: WorldCycle): void {
	if (!Number.isFinite(world.epochMs)) {
		throw new Error(`World cycle "${world.id}" has an invalid epochMs.`);
	}

	if (world.states.length === 0) {
		throw new Error(`World cycle "${world.id}" must contain at least one state.`);
	}

	world.states.forEach((state) => {
		if (!Number.isFinite(state.durationMs) || state.durationMs <= 0) {
			throw new Error(
				`World cycle "${world.id}" state "${state.key}" must have a positive durationMs.`
			);
		}
	});

	const calculatedLoopDurationMs = getLoopDurationMs(world.states);
	if (world.loopDurationMs !== calculatedLoopDurationMs) {
		throw new Error(
			`World cycle "${world.id}" loopDurationMs does not match the sum of states.`
		);
	}
}

export function getActiveWorldState(
	world: WorldCycle,
	nowMs = Date.now()
): ActiveWorldState {
	assertValidWorldCycle(world);

	const loopDurationMs = world.loopDurationMs;
	const positionMs = positiveModulo(nowMs - world.epochMs, loopDurationMs);

	let stateStartOffsetMs = 0;
	for (let stateIndex = 0; stateIndex < world.states.length; stateIndex += 1) {
		const state = world.states[stateIndex];
		const stateEndOffsetMs = stateStartOffsetMs + state.durationMs;

		if (positionMs < stateEndOffsetMs) {
			const nextStateIndex = (stateIndex + 1) % world.states.length;
			// 用 nowMs 回推/前推實際邊界，避免另外做 epoch + loop index 的重複計算。
			const startedAtMs = nowMs - (positionMs - stateStartOffsetMs);
			const endsAtMs = nowMs + (stateEndOffsetMs - positionMs);

			return {
				worldId: world.id,
				state,
				nextState: world.states[nextStateIndex],
				stateIndex,
				nextStateIndex,
				startedAtMs,
				endsAtMs,
				elapsedMs: positionMs - stateStartOffsetMs,
				remainingMs: stateEndOffsetMs - positionMs,
				positionMs,
				loopDurationMs,
			};
		}

		stateStartOffsetMs = stateEndOffsetMs;
	}

	throw new Error(`Unable to resolve active state for world cycle "${world.id}".`);
}
