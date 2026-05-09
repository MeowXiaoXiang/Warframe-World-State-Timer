import type { Dayjs } from "dayjs";

export type LocaleCode = "zh-TW" | "en-US";

export interface RawWorldCycle {
  name?: string;
  "name_zh-TW"?: string;
  "name_en-US"?: string;
  startTime: string;
  loopTime: number;
  dayTime: number;
  nightTime: number;
  dayStatusName?: string;
  "dayStatusName_zh-TW"?: string;
  "dayStatusName_en-US"?: string;
  nightStatusName?: string;
  "nightStatusName_zh-TW"?: string;
  "nightStatusName_en-US"?: string;
  dayIcon: string;
  nightIcon: string;
}

export interface RawWorldCyclesData {
  worlds: Record<string, RawWorldCycle>;
}

export interface WorldCycle {
  id: string;
  name: string;
  dayStatusName: string;
  nightStatusName: string;
  dayIcon: string;
  nightIcon: string;
  startTime: Dayjs;
  loopTime: number;
  dayTime: number;
  nightTime: number;
}

export interface WorldStatus {
  status: string;
  nextCycle: string;
  icon: string;
  timeLeft: string;
}

export type WorldStatusMap = Record<string, WorldStatus>;

export type CycleStatusClass =
  | "status-ongoing"
  | "status-ended"
  | "status-not-started"
  | "status-next";

export interface CycleEntry {
  start: Dayjs;
  end: Dayjs;
  status: string;
  statusClass?: CycleStatusClass;
}

export interface GroupedCycles {
  [date: string]: {
    day: CycleEntry[];
    night: CycleEntry[];
  };
}

export interface ModalExpose {
  openModal: (data: { world: WorldCycle }) => void;
  closeModal: () => void;
  updateData: (world: WorldCycle) => void;
}
