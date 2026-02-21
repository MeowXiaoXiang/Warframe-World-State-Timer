<template>
	<div id="app" class="container">
		<!-- Loading 畫面 -->
		<LoadingComponent v-show="loadingVisible" @loading-complete="onLoadingComplete" />
		<!-- 主內容 -->
		<div id="main-content" :class="{ visible: !loadingVisible }">
			<HeaderBar :site-name="t('app.siteName')" :current-time="currentTime" :current-timezone="currentTimezone" />
			<div id="card-container" class="container">
				<CardComponent v-for="world in worlds" :key="world.id" :world="world"
					:status="worldStatus[world.id]?.status" :next-cycle="worldStatus[world.id]?.nextCycle"
					:time-left="worldStatus[world.id]?.timeLeft" :icon="worldStatus[world.id]?.icon"
					@click="handleCardClick(world)" />
			</div>
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
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import CardComponent from "./components/Card.vue";
import FooterComponent from "./components/Footer.vue";
import LoadingComponent from "./components/Loading.vue";
import ModalComponent from "./components/Modal.vue";
import FloatingButtons from "./components/FloatingButtons.vue";
import HeaderBar from "./components/HeaderBar.vue";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import { calculateWorldStatus } from "./utils/worldCycleCalculator";

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
const timeZoneOffsetFormatter = new Intl.DateTimeFormat("en-US", {
	timeZone: userTimeZone,
	timeZoneName: "shortOffset",
});
const timeZoneShortFormatter = new Intl.DateTimeFormat("en-US", {
	timeZone: userTimeZone,
	timeZoneName: "short",
});
let updateTimerId = null;

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
	const timeZoneOffset =
		timeZoneOffsetFormatter
			.formatToParts(new Date())
			.find((part) => part.type === "timeZoneName")?.value ||
		timeZoneShortFormatter
			.formatToParts(new Date())
			.find((part) => part.type === "timeZoneName")?.value ||
		"UTC";
	currentTimezone.value = `${userTimeZone} (${timeZoneOffset})`;
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
	worldStatus.value = calculateWorldStatus(worlds.value, userTimeZone, { t }); // 立即同步狀態，避免切換語言瞬間不一致

	// 若互動視窗有綁定世界，切語言後同步到新語言物件
	if (selectedWorld.value) {
		selectedWorld.value = worlds.value.find((world) => world.id === selectedWorld.value.id) || null;
	}
});

// 初始化
onMounted(async () => {
	await fetchWorldsData();
	worldStatus.value = calculateWorldStatus(worlds.value, userTimeZone, { t });
	updateTimeAndTimezone();
	updateTimerId = setInterval(() => {
		worldStatus.value = calculateWorldStatus(worlds.value, userTimeZone, { t });
		updateTimeAndTimezone();
	}, 1000);
});

onUnmounted(() => {
	if (updateTimerId) {
		clearInterval(updateTimerId);
		updateTimerId = null;
	}
});
</script>

<style scoped>
#main-content {
	opacity: 0;
	padding-top: 72px;
	padding-bottom: max(72px, calc(60px + env(safe-area-inset-bottom)));
	transition: opacity 1s ease-in-out;
}

#main-content.visible {
	opacity: 1;
}

#card-container {
	margin-top: 0.75rem;
	padding-bottom: 0.5rem;
}
</style>
