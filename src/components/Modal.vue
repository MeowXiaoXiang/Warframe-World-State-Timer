<template>
    <div class="modal fade" tabindex="-1" role="dialog" ref="modal" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <!-- 標題 -->
                <div class="modal-header" :class="isDarkTheme ? 'bg-dark text-light' : 'bg-light text-dark'">
                    <h5 class="modal-title">
                        {{ t("modal.title") }} - <span>{{ localWorld?.name }}</span>
                    </h5>
                    <button type="button" class="btn-close" aria-label="Close" @click="closeModal"></button>
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
            console.log("Modal completely closed, clearing local data...");
            clearLocalData();
            emit("modal-closed"); // 通知父組件
        });
    }
});

const clearLocalData = () => {
    localWorld.value = null;
    localGroupedCycles.value = {};
    console.log("Local data cleared in Modal.vue.");
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

    console.log("Updating modal data...");
    setWorldAndCycles(world);
};


// 關閉互動視窗
const closeModal = () => {
    if (!bootstrapModal) return;
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
/* === 互動視窗子標題樣式 === */
.modal-subheader {
    display: flex;
    justify-content: space-around;
    padding: 10px 0;
    background-color: #f8f9fa;
    border-bottom: 1px solid #ddd;
    font-weight: bold;
}

[data-theme="dark"] .modal-subheader {
    background-color: #444;
    border-bottom-color: #666;
    color: #f4f4f9;
}

.modal-subtitle {
    font-size: 1.2rem;
    text-align: center;
    color: #4a4a4a;
}

[data-theme="dark"] .modal-subtitle {
    color: #cccccc;
}

/* === 互動視窗滾動內容 === */
.modal-body {
    max-height: 70vh;
    overflow-y: auto;
    padding: 20px;
    background-color: #f9f9f9;
    color: #333;
}

[data-theme="dark"] .modal-body {
    background-color: #333;
    color: #f4f4f9;
}

/* === 日期標題樣式 === */
.schedule-date {
    font-size: 1.4rem;
    font-weight: bold;
    margin: 15px 0;
    text-align: center;
    color: #4a4a4a;
    border-bottom: 2px solid #ddd;
    padding-bottom: 5px;
}

[data-theme="dark"] .schedule-date {
    color: #cccccc;
    border-bottom-color: #666;
}

/* === 白天與夜晚容器樣式 === */
.day-night-row {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 20px;
}

.day-container,
.night-container {
    flex: 1;
    padding: 10px;
    border-radius: 10px;
    background-color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

/* 白天容器樣式 - 淺色模式 */
.day-container {
    background-color: #fff4e0; /* 柔和奶油色，更明亮的日間感覺 */
}

/* 夜晚容器樣式 - 淺色模式 */
.night-container {
    background-color: #e2eafc; /* 淡淡的天空藍，帶有一絲夜晚感 */
}

/* 白天容器樣式 - 深色模式 */
[data-theme="dark"] .day-container {
    background-color: #aa7246; /* 柔和的琥珀棕色，適合作為深色模式的白天容器 */
}

/* 夜晚容器樣式 - 深色模式 */
[data-theme="dark"] .night-container {
    background-color: #24364e; /* 深海藍色，模擬夜晚的靜謐感 */
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
    background-color: #444;
    color: #f4f4f9;
    border-color: #666;
}

/* === 狀態樣式 === */
.status-not-started {
    background-color: #c2bbbb !important;
    color: #302f2f !important;
}

[data-theme="dark"] .status-not-started {
    background-color: #555 !important;
    color: #bcbcbc !important;
}

.status-next {
    background-color: #ffc400 !important;
    color: #7e4703 !important;
}

[data-theme="dark"] .status-next {
    background-color: #886600 !important;
    color: #ffd700 !important;
}

.status-ongoing {
    background-color: #c2ff68 !important;
    color: #226942 !important;
}

[data-theme="dark"] .status-ongoing {
    background-color: #005a32 !important;
    color: #b9e4c9 !important;
}

.status-ended {
    background-color: #ff97b6 !important;
    color: #8a0037 !important;
}

[data-theme="dark"] .status-ended {
    background-color: #993333 !important;
    color: #ffcccc !important;
}

/* === 圖例區域樣式 === */
.modal-legend {
    display: flex;
    justify-content: space-around;
    padding: 10px 15px;
    background-color: #f8f9fa;
    border-bottom: 1px solid #ddd;
}

[data-theme="dark"] .modal-legend {
    background-color: #444;
    border-bottom-color: #666;
    color: #f4f4f9;
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
    color: #f4f4f9;
    background-color: #555;
}
</style>
