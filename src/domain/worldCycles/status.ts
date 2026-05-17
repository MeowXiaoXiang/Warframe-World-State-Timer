import type { ComposerTranslation } from "vue-i18n";
import { getActiveWorldState } from "./engine";
import type { WorldCycle, WorldStatusMap } from "./types";

interface TranslationContext {
	t: ComposerTranslation;
}

export function calculateWorldStatus(
	worlds: WorldCycle[],
	i18n: TranslationContext,
	nowMs = Date.now()
): WorldStatusMap {
	const worldStatus: WorldStatusMap = {};

	worlds.forEach((world) => {
		const activeState = getActiveWorldState(world, nowMs);

		worldStatus[world.id] = {
			status: activeState.state.label,
			icon: activeState.state.icon ?? "❓",
			theme: activeState.state.theme,
			timeLeft: formatTimeLeft(activeState.remainingMs, i18n),
			stateKey: activeState.state.key,
			nextStateKey: activeState.nextState.key,
		};
	});

	return worldStatus;
}

function formatTimeLeft(milliseconds: number, i18n: TranslationContext): string {
	const t = i18n.t;
	const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	const parts = [];
	if (hours > 0) parts.push(`${hours} ${t("time.hours")}`);
	if (minutes > 0) parts.push(`${minutes} ${t("time.minutes")}`);
	if (seconds > 0 || parts.length === 0) parts.push(`${seconds} ${t("time.seconds")}`);

	return parts.join(" ");
}
