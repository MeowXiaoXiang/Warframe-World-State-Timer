<template>
    <div class="modal fade" tabindex="-1" role="dialog" ref="modal" :aria-hidden="!isVisible">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header" :class="isDarkTheme ? 'bg-dark text-light' : 'bg-light text-dark'">
                    <h5 class="modal-title">
                        {{ t("modal.title") }} - <span>{{ localWorld?.name }}</span>
                    </h5>
                    <button type="button" class="btn-close" :class="{ 'btn-close-white': isDarkTheme }" aria-label="Close" @click="closeModal"></button>
                </div>
                <div class="modal-legend" :class="isDarkTheme ? 'bg-dark text-light' : 'bg-light text-dark'">
                    <span class="legend-item status-not-started">{{ t("modal.legend.notStarted") }}</span>
                    <span class="legend-item status-next">{{ t("modal.legend.next") }}</span>
                    <span class="legend-item status-ongoing">{{ t("modal.legend.ongoing") }}</span>
                    <span class="legend-item status-ended">{{ t("modal.legend.ended") }}</span>
                </div>
                <div class="modal-state-strip">
                    <span
                        v-for="state in localWorld?.states"
                        :key="state.key"
                        class="state-chip"
                        :style="getStateStyle(state.theme)"
                    >
                        <img
                            v-if="state.icon && isImage(state.icon)"
                            :src="state.icon"
                            alt=""
                            aria-hidden="true"
                            class="state-chip-image"
                            :class="{ 'svg-icon': isSvg(state.icon) }"
                            @error="handleImageError"
                        />
                        <span
                            v-if="state.icon && isImage(state.icon)"
                            hidden
                            class="state-chip-icon image-fallback"
                            aria-hidden="true"
                        >?</span>
                        <span v-else-if="state.icon" class="state-chip-icon" aria-hidden="true">{{ state.icon }}</span>
                        {{ state.label }}
                    </span>
                </div>
                <div class="modal-body" :class="isDarkTheme ? 'text-light' : 'text-dark'">
                    <template v-for="(cycles, date) in localGroupedCycles" :key="date">
                        <div class="schedule-date">{{ date }}</div>
                        <div class="timeline-list">
                            <div
                                v-for="cycle in cycles"
                                :key="`${cycle.stateKey}-${cycle.startMs}`"
                                class="cycle-item"
                                :class="cycle.statusClass"
                                :style="getStateStyle(cycle.theme)"
                            >
                                <div class="cycle-state">
                                    <img
                                        v-if="cycle.icon && isImage(cycle.icon)"
                                        :src="cycle.icon"
                                        alt=""
                                        aria-hidden="true"
                                        class="cycle-image"
                                        :class="{ 'svg-icon': isSvg(cycle.icon) }"
                                        @error="handleImageError"
                                    />
                                    <span
                                        v-if="cycle.icon && isImage(cycle.icon)"
                                        hidden
                                        class="cycle-icon image-fallback"
                                        aria-hidden="true"
                                    >?</span>
                                    <span v-else-if="cycle.icon" class="cycle-icon" aria-hidden="true">{{ cycle.icon }}</span>
                                    <span>{{ cycle.label }}</span>
                                </div>
                                <div class="cycle-time">
                                    {{ cycle.start.format("HH:mm") }} ~ {{ cycle.end.format("HH:mm") }}
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Modal as BootstrapModal } from "bootstrap";
import { useI18n } from "vue-i18n";
import {
    assignCycleStatuses,
    calculateCycleEntries,
    filterEntriesForTodayAndTomorrow,
    getDefaultScheduleRange,
} from "../domain/worldCycles";
import { isDarkTheme } from "../utils/themeManager";
import type {
    GroupedCycleEntries,
    WorldCycle,
    WorldStatePalette,
    WorldStateTheme,
} from "../domain/worldCycles";

const { t } = useI18n();

const isImage = (icon: string): boolean => {
    return /\.(svg|png|jpe?g|gif|webp|avif)$/i.test(icon);
};

const isSvg = (icon: string): boolean => {
    return /\.svg$/i.test(icon);
};

const handleImageError = (event: Event) => {
    const image = event.currentTarget;
    if (!(image instanceof HTMLImageElement)) return;

    image.hidden = true;
    const fallback = image.nextElementSibling;
    if (fallback instanceof HTMLElement) {
        fallback.hidden = false;
    }
};

const getStateStyle = (theme: WorldStateTheme): Record<string, string> => {
    const palette: WorldStatePalette = theme[isDarkTheme.value ? "dark" : "light"];

    return {
        "--state-accent": palette.accent,
        "--state-surface": palette.surface,
        "--state-text": palette.text,
    };
};

defineProps<{
    world?: WorldCycle | null;
}>();

const modal = ref<HTMLElement | null>(null);
const isVisible = ref(false);
let bootstrapModal: BootstrapModal | null = null;
const localWorld = ref<WorldCycle | null>(null);
const localGroupedCycles = ref<GroupedCycleEntries>({});
const emit = defineEmits<{
    "modal-closed": [];
}>();

onMounted(() => {
    if (modal.value) {
        bootstrapModal = new BootstrapModal(modal.value, {
            backdrop: true,
            keyboard: true,
        });

        modal.value.addEventListener("hidden.bs.modal", () => {
            isVisible.value = false;
            clearLocalData();
            emit("modal-closed");
        });
    }
});

const clearLocalData = () => {
    localWorld.value = null;
    localGroupedCycles.value = {};
};

const updateGroupedCycles = (world: WorldCycle) => {
    if (!world) return;
    const rawCycles = calculateCycleEntries(world, getDefaultScheduleRange());
    const filteredCycles = filterEntriesForTodayAndTomorrow(rawCycles);
    const assignedCycles = assignCycleStatuses(filteredCycles);

    const grouped: GroupedCycleEntries = {};
    assignedCycles.forEach((cycle) => {
        const date = cycle.start.format("YYYY/MM/DD");
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(cycle);
    });
    localGroupedCycles.value = grouped;
};

const openModal = (data: { world?: WorldCycle } | null) => {
    if (!bootstrapModal) {
        console.warn("Bootstrap modal is not initialized.");
        return;
    }

    if (!data || !data.world) {
        console.error("Invalid data provided to openModal.");
        return;
    }

    isVisible.value = true;
    if (!localWorld.value || localWorld.value.id !== data.world.id) {
        setWorldAndCycles(data.world);
    }

    bootstrapModal.show();
};

const setWorldAndCycles = (world: WorldCycle) => {
    localWorld.value = world;
    updateGroupedCycles(world);
};

const updateData = (world: WorldCycle) => {
    if (!bootstrapModal) {
        console.warn("updateData called when modal is not initialized.");
        return;
    }

    setWorldAndCycles(world);
};

const closeModal = () => {
    if (!bootstrapModal) return;
    isVisible.value = false;
    bootstrapModal.hide();
};

defineExpose({
    openModal,
    closeModal,
    updateData,
});
</script>

<style scoped>
.modal-content {
    border-radius: 14px;
    overflow: hidden;
    border: none;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.32);
    background-color: #f8f9fa;
}

[data-theme="dark"] .modal-content {
    background-color: #1d222b;
    box-shadow: 0 18px 46px rgba(0, 0, 0, 0.5);
}

.modal-dialog.modal-lg {
    max-width: min(580px, calc(100vw - 1.5rem));
    margin: 0.75rem auto;
}

:global(.modal-backdrop.show) {
    opacity: 0.5;
}

.modal-state-strip {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px 12px;
    background-color: #f8f9fa;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    font-weight: bold;
}

[data-theme="dark"] .modal-state-strip {
    background-color: #323842;
    border-bottom-color: rgba(255, 255, 255, 0.1);
    color: #d9e0eb;
}

.state-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 999px;
    background-color: var(--state-surface);
    color: var(--state-text);
    border: 1px solid color-mix(in srgb, var(--state-accent) 38%, transparent);
    font-size: 0.9rem;
}

.state-chip-icon {
    line-height: 1;
}

.state-chip-image {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    object-fit: contain;
}

[data-theme="dark"] .state-chip {
    background-color: var(--state-surface);
    color: var(--state-text);
    border-color: color-mix(in srgb, var(--state-accent) 52%, transparent);
}

.modal-body {
    max-height: calc(100dvh - 220px);
    overflow-y: auto;
    padding: 18px 16px 12px;
    background-color: #f9f9f9;
    color: #333;
}

.modal-body > :last-child {
    margin-bottom: 0;
}

[data-theme="dark"] .modal-body {
    background-color: #262c35;
    color: #dfe6f1;
}

.schedule-date {
    font-size: 1.4rem;
    font-weight: bold;
    margin: 15px 0;
    text-align: center;
    color: #4a4a4a;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    padding-bottom: 5px;
}

.modal-body > .schedule-date:first-child {
    margin-top: 6px;
}

[data-theme="dark"] .schedule-date {
    color: #d6deea;
    border-bottom-color: rgba(255, 255, 255, 0.12);
}

.timeline-list {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 7px;
    margin-bottom: 14px;
}

.cycle-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    min-height: 42px;
    padding: 8px 12px;
    border-radius: 8px;
    background-color: white;
    border: 1px solid #ddd;
    border-left: 6px solid var(--state-accent);
    font-size: 1.04rem;
    color: #333;
    width: 100%;
    text-align: left;
    transition: background-color 0.3s ease, color 0.3s ease;
}

.cycle-state {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    line-height: 1.2;
}

.cycle-icon {
    line-height: 1;
}

.cycle-image {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    object-fit: contain;
}

.svg-icon {
    filter: invert(0);
    transition: filter 0.3s ease;
}

[data-theme="dark"] .svg-icon {
    filter: invert(1);
}

.cycle-time {
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    line-height: 1.2;
}

[data-theme="dark"] .cycle-item {
    background-color: #3f4651;
    color: #dfe6f1;
    border-color: #636d7c;
    border-left-color: var(--state-accent);
}

.status-not-started {
    background-color: #c2bbbb !important;
    color: #302f2f !important;
}

.status-next {
    background-color: #ffc400 !important;
    color: #7e4703 !important;
}

.status-ongoing {
    background-color: #c2ff68 !important;
    color: #226942 !important;
}

.status-ended {
    background-color: #ff97b6 !important;
    color: #8a0037 !important;
}

[data-theme="dark"] .status-not-started {
    background-color: #4a505a !important;
    color: #d0d7e2 !important;
}

[data-theme="dark"] .status-next {
    background-color: #9c7417 !important;
    color: #fff0c7 !important;
}

[data-theme="dark"] .status-ongoing {
    background-color: #0f7f77 !important;
    color: #d7fff9 !important;
}

[data-theme="dark"] .status-ended {
    background-color: #6d163d !important;
    color: #ffe0ee !important;
}

.modal-legend {
    display: flex;
    justify-content: space-around;
    padding: 10px 15px;
    background-color: #f8f9fa;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] .modal-legend.bg-dark {
    background-color: #2a303a !important;
    border-bottom-color: rgba(255, 255, 255, 0.1);
    color: #dfe6f1;
}

.legend-item {
    display: inline-block;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 0.9rem;
    font-weight: bold;
    color: #333;
}

[data-theme="dark"] .legend-item {
    color: #dfe6f1;
    background-color: #4a505a;
}

.modal-body::-webkit-scrollbar {
    width: 10px;
}

.modal-body::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 6px;
}

.modal-body::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 6px;
    border: 2px solid #f1f1f1;
}

.modal-body::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

[data-theme="dark"] .modal-body::-webkit-scrollbar-track {
    background: #262c34;
    border-radius: 6px;
}

[data-theme="dark"] .modal-body::-webkit-scrollbar-thumb {
    background: #5f6875;
    border-radius: 6px;
    border: 2px solid #262c34;
}

[data-theme="dark"] .modal-body::-webkit-scrollbar-thumb:hover {
    background: #747f8f;
}

.modal-body {
    scrollbar-width: thin;
    scrollbar-color: #c1c1c1 #f1f1f1;
}

[data-theme="dark"] .modal-body {
    scrollbar-color: #5f6875 #262c34;
}

[data-theme="dark"] .modal-header.bg-dark {
    background-color: #1f252e !important;
    border-bottom-color: rgba(255, 255, 255, 0.1);
    color: #e3eaf5;
}

@media (max-width: 767px) {
    .modal-dialog.modal-lg {
        max-width: calc(100vw - 2rem);
        margin: 1rem auto;
    }

    .modal-content {
        max-height: calc(100dvh - 2rem);
    }

    .modal-body {
        max-height: calc(100dvh - 230px);
        padding: 16px 14px 10px;
    }

    .cycle-item {
        align-items: flex-start;
        flex-direction: column;
        gap: 4px;
    }
}
</style>
