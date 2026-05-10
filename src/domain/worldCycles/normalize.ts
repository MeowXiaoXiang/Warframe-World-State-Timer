import type { ComposerTranslation } from "vue-i18n";
import { getLoopDurationMs } from "./engine";
import type { RawWorldCycle, WorldCycle, WorldState } from "./types";

interface TranslationContext {
	t: ComposerTranslation;
}

function translateOrFallback(t: ComposerTranslation, key: string, fallback: string): string {
	const translated = t(key);
	return translated === key ? fallback : translated;
}

export function normalizeWorldCycle(
	id: string,
	rawWorld: RawWorldCycle,
	i18n: TranslationContext
): WorldCycle {
	const states: WorldState[] = rawWorld.states.map((state) => ({
		key: state.key,
		label: translateOrFallback(
			i18n.t,
			`worlds.${id}.states.${state.key}`,
			state.key
		),
		icon: state.icon,
		theme: state.theme,
		durationMs: state.durationMs,
	}));

	return {
		id,
		name: translateOrFallback(i18n.t, `worlds.${id}.name`, id),
		epochMs: rawWorld.epochMs,
		loopDurationMs: getLoopDurationMs(states),
		states,
	};
}
