<template>
	<div id="app" class="container">
		<LoadingComponent v-show="loadingVisible" @loading-complete="onLoadingComplete" />
		<div id="main-content" :class="{ visible: !loadingVisible }">
			<HeaderBar :site-name="t('app.siteName')" :current-time="currentTime" :current-timezone="currentTimezone" />
			<div id="card-container" class="container">
				<CardComponent v-for="world in worlds" :key="world.id" :world="world"
					:status="worldStatus[world.id]?.status" :next-cycle="worldStatus[world.id]?.nextCycle"
					:time-left="worldStatus[world.id]?.timeLeft" :icon="worldStatus[world.id]?.icon"
					:theme="worldStatus[world.id]?.theme"
					@click="handleCardClick(world)" />
			</div>
			<ModalComponent ref="modalComponent" :world="selectedWorld" @modal-closed="clearSelectedWorld" />
			<FloatingButtons />
			<FooterComponent />
		</div>
	</div>
</template>

<script setup lang="ts">
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
import { calculateWorldStatus, normalizeWorldCycle } from "./domain/worldCycles";
import type { ModalExpose, RawWorldCyclesData, WorldCycle, WorldStatusMap } from "./domain/worldCycles";

dayjs.extend(timezone);

const { locale, t } = useI18n();

const loadingVisible = ref(true);
const worlds = ref<WorldCycle[]>([]);
const rawWorldData = ref<RawWorldCyclesData | null>(null);
const worldStatus = ref<WorldStatusMap>({});
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
let updateTimerId: ReturnType<typeof setInterval> | null = null;

const modalComponent = ref<ModalExpose | null>(null);
const selectedWorld = ref<WorldCycle | null>(null);

const transformWorldData = (): WorldCycle[] => {
	if (!rawWorldData.value) return [];

	return Object.entries(rawWorldData.value.worlds).map(([id, world]) =>
		normalizeWorldCycle(id, world, { t })
	);
};

const fetchWorldsData = async () => {
	const response = await fetch(`${import.meta.env.BASE_URL}data/world_cycles.json`);
	rawWorldData.value = await response.json();
	worlds.value = transformWorldData();
};

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

const updateDocumentTitle = () => {
	document.title = t("app.siteName");
};

const updateDocumentLanguage = () => {
	document.documentElement.lang = locale.value === "en-US" ? "en" : "zh-Hant";
};

const updateManifestLink = () => {
	const manifestElement = document.getElementById("app-manifest");
	if (!manifestElement) return;

	const manifestName = locale.value === "en-US"
		? "manifest.en-US.webmanifest"
		: "manifest.zh-TW.webmanifest";
	manifestElement.setAttribute("href", `${import.meta.env.BASE_URL}${manifestName}`);
};

const handleCardClick = (world: WorldCycle) => {
	if (!modalComponent.value) {
		console.error("ModalComponent not found");
		return;
	}

	modalComponent.value.openModal({ world });
	selectedWorld.value = world;
};

const onLoadingComplete = () => {
	loadingVisible.value = false;
};

const clearSelectedWorld = () => {
	selectedWorld.value = null;
};

watch(
	() => {
		const selectedWorldId = selectedWorld.value?.id;
		return selectedWorldId ? worldStatus.value[selectedWorldId]?.stateKey : undefined;
	},
	(newStatus, oldStatus) => {
		if (!modalComponent.value || !selectedWorld.value) return;

		if (!oldStatus) {
			return;
		}

		if (newStatus !== oldStatus) {
			modalComponent.value.updateData(selectedWorld.value);
		}
	}
);

watch(locale, () => {
	worlds.value = transformWorldData();
	worldStatus.value = calculateWorldStatus(worlds.value, { t });
	updateDocumentTitle();
	updateDocumentLanguage();
	updateManifestLink();

	if (selectedWorld.value) {
		const selectedWorldId = selectedWorld.value.id;
		selectedWorld.value = worlds.value.find((world) => world.id === selectedWorldId) || null;
		if (selectedWorld.value && modalComponent.value) {
			modalComponent.value.updateData(selectedWorld.value);
		}
	}
});

onMounted(async () => {
	updateDocumentTitle();
	updateDocumentLanguage();
	updateManifestLink();
	await fetchWorldsData();
	worldStatus.value = calculateWorldStatus(worlds.value, { t });
	updateTimeAndTimezone();
	updateTimerId = setInterval(() => {
		worldStatus.value = calculateWorldStatus(worlds.value, { t });
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
