<template>
	<div id="app" class="container">
		<!-- Loading 畫面 -->
		<LoadingComponent v-show="loadingVisible" @loading-complete="onLoadingComplete" />
		<!-- 主內容 -->
		<div id="main-content" :class="{ visible: !loadingVisible }">
			<div id="card-container" class="container mt-5">
				<CardComponent v-for="world in worlds" :key="world.id" :world="world"
					:status="worldStatus[world.id]?.status" :next-cycle="worldStatus[world.id]?.nextCycle"
					:time-left="worldStatus[world.id]?.timeLeft" :icon="worldStatus[world.id]?.icon"
					@click="handleCardClick(world)" />
			</div>
			<!-- 時間與時區 -->
			<p class="text-center mt-3" :class="{ 'text-light': isDarkTheme, 'text-dark': !isDarkTheme }">
				{{ t('app.currentTime') }}: {{ currentTime }}
			</p>
			<p class="text-center" :class="{ 'text-light': isDarkTheme, 'text-dark': !isDarkTheme }">
				{{ t('app.timezone') }}: {{ currentTimezone }}
			</p>
			<!-- 互動視窗 -->
			<ModalComponent ref="modalComponent" :world="selectedWorld" @modal-closed="clearSelectedWorld" />
			<!-- 懸浮按鈕 -->
			<FloatingButtons />
			<!-- 頁尾 -->
			<FooterComponent />
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import CardComponent from "./components/Card.vue";
import FooterComponent from "./components/Footer.vue";
import LoadingComponent from "./components/Loading.vue";
import ModalComponent from "./components/Modal.vue";
import FloatingButtons from "./components/FloatingButtons.vue";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import { calculateWorldStatus } from "./utils/worldCycleCalculator";
import { isDarkTheme } from "./utils/themeManager";

dayjs.extend(timezone);

const { locale, t } = useI18n(); // 使用 vue-i18n

// 全局狀態
const loadingVisible = ref(true);
const worlds = ref([]); // 保存處理後的世界資料
const rawWorldData = ref(null); // 保存原始的 world_cycles.json 資料
const worldStatus = ref({}); // 動態狀態資料
const currentTime = ref("");
const currentTimezone = ref("");
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// 管理互動視窗狀態
const modalComponent = ref(null);
const selectedWorld = ref(null);

// 從原始資料根據語言提取資料
const transformWorldData = (locale) => {
	console.debug(`Transforming world data to ${locale}`);
	if (!rawWorldData.value) return [];

	return Object.entries(rawWorldData.value.worlds).map(([id, world]) => ({
		id,
		name: world[`name_${locale}`] || world.name, // 動態根據語言選取名稱
		dayStatusName: world[`dayStatusName_${locale}`] || world.dayStatusName,
		nightStatusName: world[`nightStatusName_${locale}`] || world.nightStatusName,
		dayIcon: world.dayIcon,
		nightIcon: world.nightIcon,
		startTime: dayjs(world.startTime).tz(userTimeZone),
		loopTime: world.loopTime,
		dayTime: world.dayTime,
		nightTime: world.nightTime,
	}));
};

// 從 JSON 獲取世界資料（僅讀取一次）
const fetchWorldsData = async () => {
	const response = await fetch("./data/world_cycles.json");
	rawWorldData.value = await response.json(); // 存原始資料
	worlds.value = transformWorldData(locale.value); // 初始化為當前語言
};

// 更新當前時間和時區
const updateTimeAndTimezone = () => {
	currentTime.value = dayjs().tz(userTimeZone).format("YYYY/MM/DD HH:mm:ss");
	currentTimezone.value = `${userTimeZone} (${new Date()
		.toLocaleString("en-US", { timeZoneName: "short" })
		.split(" ")
		.pop()})`;
};

// 處理卡片點擊事件
const handleCardClick = (world) => {
	if (!modalComponent.value) {
		console.error("ModalComponent not found");
		return;
	}

	modalComponent.value.openModal({ world });
	selectedWorld.value = world;
};

// 初始載入
const onLoadingComplete = () => {
	loadingVisible.value = false;
};

// 關閉互動視窗後自動清除 App.vue 端的所需資料
const clearSelectedWorld = () => {
	selectedWorld.value = null;
};

// 監控 selectedWorld 的狀態變化
watch(
	() => worldStatus.value[selectedWorld.value?.id]?.status, // 偵測 selectedWorld 的 status
	(newStatus, oldStatus) => {
		if (!modalComponent.value || !selectedWorld.value) return;

		// 當 oldStatus 不存在，僅記錄而不更新
		if (!oldStatus) {
			console.debug("Skip initial modal update.");
			return;
		}

		// 僅在狀態變化時觸發更新
		if (newStatus !== oldStatus) {
			console.debug(
				`world: ${selectedWorld.value.name} status updated, triggering modal update`
			);
			modalComponent.value.updateData(selectedWorld.value);
		}
	}
);

// 監控語言變化，切換語言（修改為僅更新處理後的資料）
watch(locale, () => {
	console.debug(`Language switched to: ${locale.value}`);
	worlds.value = transformWorldData(locale.value); // 僅更新語言變化
});

// 初始化
onMounted(async () => {
	await fetchWorldsData();
	worldStatus.value = calculateWorldStatus(worlds.value, userTimeZone, { t });
	updateTimeAndTimezone();
	setInterval(() => {
		worldStatus.value = calculateWorldStatus(worlds.value, userTimeZone, { t });
		updateTimeAndTimezone();
	}, 1000);
});
</script>

<style scoped>
#main-content {
	opacity: 0;
	padding-bottom: 60px;
	transition: opacity 1s ease-in-out;
}

#main-content.visible {
	opacity: 1;
}
</style>