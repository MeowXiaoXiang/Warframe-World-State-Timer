<template>
    <div class="modal fade" tabindex="-1" role="dialog" ref="modal" :aria-hidden="!isVisible">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <!-- 標題 -->
                <div class="modal-header" :class="isDarkTheme ? 'bg-dark text-light' : 'bg-light text-dark'">
                    <h5 class="modal-title">
                        {{ t("modal.title") }} - <span>{{ localWorld?.name }}</span>
                    </h5>
                    <button type="button" class="btn-close" :class="{ 'btn-close-white': isDarkTheme }" aria-label="Close" @click="closeModal"></button>
                </div>
                <!-- 圖例 -->
                <div class="modal-legend" :class="isDarkTheme ? 'bg-dark text-light' : 'bg-light text-dark'">
                    <span class="legend-item status-not-started">{{ t("modal.legend.notStarted") }}</span>
                    <span class="legend-item status-next">{{ t("modal.legend.next") }}</span>
                    <span class="legend-item status-ongoing">{{ t("modal.legend.ongoing") }}</span>
                    <span class="legend-item status-ended">{{ t("modal.legend.ended") }}</span>
                </div>
                <!-- 子標題 -->
                <div class="modal-subheader">
                    <div class="modal-subtitle day-title">{{ localWorld?.dayStatusName }}</div>
                    <div class="modal-subtitle night-title">{{ localWorld?.nightStatusName }}</div>
                </div>
                <!-- 滾動內容 -->
                <div class="modal-body" :class="isDarkTheme ? 'text-light' : 'text-dark'">
                    <template v-for="(group, date) in localGroupedCycles" :key="date">
                        <div class="schedule-date">{{ date }}</div>
                        <div class="day-night-row">
                            <div class="day-container">
                                <div v-for="cycle in group.day" :key="cycle.start.format('HH:mm')" class="cycle-item"
                                    :class="cycle.statusClass">
                                    {{ cycle.start.format("HH:mm") }} ~ {{ cycle.end.format("HH:mm") }}
                                </div>
                            </div>
                            <div class="night-container">
                                <div v-for="cycle in group.night" :key="cycle.start.format('HH:mm')" class="cycle-item"
                                    :class="cycle.statusClass">
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

<script setup>
import { ref, onMounted } from "vue";
import { Modal } from "bootstrap";
import { useI18n } from "vue-i18n";
import { calculateCycles, filterCycles, assignCycleStatuses } from "../utils/scheduleCalculator";
import { isDarkTheme } from "../utils/themeManager";

const { t } = useI18n();

// Props
defineProps({
    world: { type: Object, required: false },
});

// Ref & Variables
const modal = ref(null);
const isVisible = ref(false); // 是否顯示互動視窗
let bootstrapModal = null;
const localWorld = ref(null);
const localGroupedCycles = ref({});
const emit = defineEmits(['modal-closed']);

onMounted(() => {
    if (modal.value) {
        bootstrapModal = new Modal(modal.value, {
            backdrop: true,
            keyboard: true,
        });

        // 當模態框完全關閉時觸發清除
        modal.value.addEventListener("hidden.bs.modal", () => {
            console.debug("Modal completely closed, clearing local data...");
            isVisible.value = false;
            clearLocalData();
            emit("modal-closed"); // 通知父組件
        });
    }
});

const clearLocalData = () => {
    localWorld.value = null;
    localGroupedCycles.value = {};
    console.debug("Local data cleared in Modal.vue.");
};

// 更新分組數據
const updateGroupedCycles = (world) => {
    if (!world) return;
    const rawCycles = calculateCycles(world);
    const filteredCycles = filterCycles(rawCycles);
    const assignedCycles = assignCycleStatuses(filteredCycles);

    const grouped = {};
    assignedCycles.forEach((cycle) => {
        const date = cycle.start.format("YYYY/MM/DD");
        if (!grouped[date]) grouped[date] = { day: [], night: [] };
        if (cycle.status === world.dayStatusName) {
            grouped[date].day.push(cycle);
        } else {
            grouped[date].night.push(cycle);
        }
    });
    localGroupedCycles.value = grouped;
};

// 開啟互動視窗
const openModal = (data) => {
    if (!bootstrapModal) {
        console.warn("Bootstrap modal is not initialized.");
        return;
    }

    if (!data || !data.world) {
        console.error("Invalid data provided to openModal.");
        return;
    }

    isVisible.value = true;
    // 更新資料僅當目標世界不同時
    if (!localWorld.value || localWorld.value.id !== data.world.id) {
        setWorldAndCycles(data.world);
    }

    bootstrapModal.show();
};

// 更新互動視窗數據
const setWorldAndCycles = (world) => {
    localWorld.value = world;
    updateGroupedCycles(world);
};

// 更新當前已開啟的互動視窗資料
const updateData = (world) => {
    if (!bootstrapModal) {
        console.warn("updateData called when modal is not initialized.");
        return;
    }

    console.debug("Updating modal data...");
    setWorldAndCycles(world);
};


// 關閉互動視窗
const closeModal = () => {
    if (!bootstrapModal) return;
    isVisible.value = false; // 設定不可見狀態
    bootstrapModal.hide(); // 只調用 Bootstrap 的隱藏方法
};

// 暴露方法
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
    max-width: min(700px, calc(100vw - 1.5rem));
    margin: 0.75rem auto;
}

:global(.modal-backdrop.show) {
    opacity: 0.5;
}

/* === 互動視窗子標題樣式 === */
.modal-subheader {
    display: flex;
    justify-content: space-around;
    padding: 10px 0;
    background-color: #f8f9fa;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    font-weight: bold;
}

[data-theme="dark"] .modal-subheader {
    background-color: #323842;
    border-bottom-color: rgba(255, 255, 255, 0.1);
    color: #d9e0eb;
}

.modal-subtitle {
    font-size: 1.2rem;
    text-align: center;
    color: #4a4a4a;
}

[data-theme="dark"] .modal-subtitle {
    color: #d4dbe7;
}

/* === 互動視窗滾動內容 === */
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

/* === 日期標題樣式 === */
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

/* === 白天與夜晚容器樣式 === */
.day-night-row {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 14px;
}

.day-container,
.night-container {
    flex: 1;
    padding: 10px;
    border-radius: 10px;
    background-color: white;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

/* 白天容器樣式 - 淺色模式 */
.day-container {
    background-color: #fff4e0;
    /* 柔和奶油色，更明亮的日間感覺 */
}

/* 夜晚容器樣式 - 淺色模式 */
.night-container {
    background-color: #e2eafc;
    /* 淡淡的天空藍，帶有一絲夜晚感 */
}

/* 白天容器樣式 - 深色模式 */
[data-theme="dark"] .day-container {
    background-color: #332f22;
    border: 1px solid rgba(255, 221, 153, 0.18);
}

[data-theme="dark"] .night-container {
    background-color: #1f2940;
    border: 1px solid rgba(153, 194, 255, 0.2);
}

/* === 卡片樣式 === */
.cycle-item {
    padding: 10px;
    border-radius: 8px;
    background-color: white;
    border: 1px solid #ddd;
    font-size: 1.1rem;
    color: #333;
    width: 100%;
    max-width: 200px;
    text-align: center;
    margin-bottom: 5px;
    transition: background-color 0.3s ease, color 0.3s ease;
}

[data-theme="dark"] .cycle-item {
    background-color: #3f4651;
    color: #dfe6f1;
    border-color: #636d7c;
}

/* === 狀態樣式 === */

/* === 淺色主題 === */
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

/* === 深色主題 === */
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

/* === 圖例區域樣式 === */
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

/* === 滾動條樣式 === */
/* 淺色主題滾動條 */
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

/* 深色主題滾動條 */
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

/* Firefox 滾動條樣式 */

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
}
</style>
