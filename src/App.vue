<template>
	<div id="app" class="container">
		<LoadingComponent v-show="loadingVisible" @loading-complete="onLoadingComplete" />
		<div id="main-content" :class="{ visible: !loadingVisible }">
			<HeaderBar :site-name="t('app.siteName')" :current-time="currentTime" :current-timezone="currentTimezone" />
			<section v-if="dataLoadStatus === 'error' && dataLoadError" class="data-error" role="alert">
				<div>
					<h2>{{ t("dataLoad.errorTitle") }}</h2>
					<p>{{ t(dataLoadError.messageKey) }}</p>
				</div>
				<button type="button" class="btn btn-primary" @click="retryWorldDataLoad">
					{{ t("dataLoad.retry") }}
				</button>
			</section>
			<section v-else-if="dataLoadStatus === 'loading'" class="data-loading" aria-live="polite">
				{{ t("dataLoad.loading") }}
			</section>
			<div id="card-container" class="container">
				<CardComponent v-for="world in worlds" :key="world.id" :world="world"
					:status="worldStatus[world.id]?.status"
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
import {
	calculateWorldStatus,
	normalizeWorldCycle,
	parseWorldCyclesData,
	WorldCyclesDataValidationError,
} from "./domain/worldCycles";
import type { ModalExpose, RawWorldCyclesData, WorldCycle, WorldStatusMap } from "./domain/worldCycles";

dayjs.extend(timezone);

const { locale, t } = useI18n();

const loadingVisible = ref(true);
const worlds = ref<WorldCycle[]>([]);
const rawWorldData = ref<RawWorldCyclesData | null>(null);
const worldStatus = ref<WorldStatusMap>({});
const dataLoadStatus = ref<"idle" | "loading" | "success" | "error">("idle");
const dataLoadError = ref<{ messageKey: string } | null>(null);
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
const worldCyclesDataUrl =
	`${import.meta.env.BASE_URL}data/world_cycles.json?v=${__WORLD_CYCLES_DATA_HASH__}`;
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
	const response = await fetch(worldCyclesDataUrl);
	if (!response.ok) {
		throw new WorldCyclesDataHttpError(response.status);
	}

	const data = await response.json();
	rawWorldData.value = parseWorldCyclesData(data);
	worlds.value = transformWorldData();
};

class WorldCyclesDataHttpError extends Error {
	constructor(readonly status: number) {
		super(`Failed to load world cycle data: ${status}`);
		this.name = "WorldCyclesDataHttpError";
	}
}

const getDataLoadErrorMessageKey = (error: unknown): string => {
	if (error instanceof WorldCyclesDataHttpError) {
		return "dataLoad.errorHttp";
	}

	if (error instanceof WorldCyclesDataValidationError) {
		return "dataLoad.errorSchema";
	}

	if (error instanceof SyntaxError) {
		return "dataLoad.errorJson";
	}

	if (error instanceof TypeError) {
		return "dataLoad.errorNetwork";
	}

	return "dataLoad.errorUnknown";
};

const loadWorldsData = async () => {
	dataLoadStatus.value = "loading";
	dataLoadError.value = null;

	try {
		await fetchWorldsData();
		worldStatus.value = calculateWorldStatus(worlds.value, { t });
		dataLoadStatus.value = "success";
	} catch (error) {
		console.error(error);
		rawWorldData.value = null;
		worlds.value = [];
		worldStatus.value = {};
		dataLoadError.value = {
			messageKey: getDataLoadErrorMessageKey(error),
		};
		dataLoadStatus.value = "error";
	}
};

const retryWorldDataLoad = () => {
	void loadWorldsData();
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
	const languageMap: Record<string, string> = {
		"en-US": "en",
		"zh-CN": "zh-Hans",
		"zh-TW": "zh-Hant",
	};
	document.documentElement.lang = languageMap[locale.value] || "zh-Hant";
};

const updateManifestLink = () => {
	const manifestElement = document.getElementById("app-manifest");
	if (!manifestElement) return;

	const manifestMap: Record<string, string> = {
		"en-US": "manifest.en-US.webmanifest",
		"zh-CN": "manifest.zh-CN.webmanifest",
		"zh-TW": "manifest.zh-TW.webmanifest",
	};
	const manifestName = manifestMap[locale.value] || "manifest.zh-TW.webmanifest";
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
	await loadWorldsData();
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

.data-loading,
.data-error {
	width: min(92vw, 520px);
	margin: 1rem auto 0;
}

.data-loading {
	padding: 0.9rem 1rem;
	text-align: center;
	color: var(--text-color);
}

.data-error {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	padding: 1rem;
	border: 1px solid rgba(220, 53, 69, 0.32);
	border-radius: 8px;
	background: rgba(220, 53, 69, 0.08);
	color: var(--text-color);
}

.data-error h2 {
	margin: 0 0 0.35rem;
	font-size: 1rem;
	font-weight: 700;
}

.data-error p {
	margin: 0;
	font-size: 0.92rem;
}

.data-error .btn {
	flex: 0 0 auto;
}

@media (max-width: 575px) {
	.data-error {
		align-items: stretch;
		flex-direction: column;
	}
}
</style>
