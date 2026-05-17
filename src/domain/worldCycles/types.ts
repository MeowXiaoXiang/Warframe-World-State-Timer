import type { Dayjs } from "dayjs";

export interface WorldState {
	key: string;
	label: string;
	icon?: string;
	theme: WorldStateTheme;
	durationMs: number;
}

export interface WorldStateTheme {
	light: WorldStatePalette;
	dark: WorldStatePalette;
}

export interface WorldStatePalette {
	accent: string;
	surface: string;
	text: string;
}

export interface RawWorldState {
	key: string;
	icon?: string;
	theme: WorldStateTheme;
	durationMs: number;
}

export interface RawWorldCycle {
	epochMs: number;
	states: RawWorldState[];
}

export interface RawWorldCyclesData {
	version: 2;
	worlds: Record<string, RawWorldCycle>;
}

export interface WorldCycle {
	id: string;
	name: string;
	epochMs: number;
	loopDurationMs: number;
	states: WorldState[];
}

export interface ActiveWorldState {
	worldId: string;
	state: WorldState;
	nextState: WorldState;
	stateIndex: number;
	nextStateIndex: number;
	startedAtMs: number;
	endsAtMs: number;
	elapsedMs: number;
	remainingMs: number;
	positionMs: number;
	loopDurationMs: number;
}

export type CycleStatusClass =
	| "status-ongoing"
	| "status-ended"
	| "status-not-started"
	| "status-next";

export interface CycleEntry {
	worldId: string;
	stateKey: string;
	stateIndex: number;
	label: string;
	icon?: string;
	theme: WorldStateTheme;
	start: Dayjs;
	end: Dayjs;
	startMs: number;
	endMs: number;
	statusClass?: CycleStatusClass;
}

export interface GroupedCycleEntries {
	[date: string]: CycleEntry[];
}

export interface ScheduleRange {
	startMs: number;
	endMs: number;
}

export interface WorldStatus {
	status: string;
	icon: string;
	theme: WorldStateTheme;
	timeLeft: string;
	stateKey: string;
	nextStateKey: string;
}

export type WorldStatusMap = Record<string, WorldStatus>;

export interface ModalExpose {
	openModal: (data: { world: WorldCycle }) => void;
	closeModal: () => void;
	updateData: (world: WorldCycle) => void;
}
