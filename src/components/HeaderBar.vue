<template>
	<div class="info-header" :class="isDarkTheme ? 'header-dark' : 'header-light'">
		<button
			v-if="canInstall"
			type="button"
			class="install-btn"
			:aria-label="t('header.installApp')"
			:title="t('header.installApp')"
			@click="installApp"
		>
			<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
				<path d="M5 20h14v-2H5zM11 3h2v8h3l-4 5-4-5h3z" />
			</svg>
		</button>
		<div class="title-line">
			<img class="title-icon" src="/images/cycle_icon.svg" :alt="siteName" />
			<span>{{ siteName }}</span>
		</div>
		<div class="meta-line">
			<span class="meta-pill">{{ currentTime }}</span>
			<span class="meta-pill">{{ currentTimezone }}</span>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { isDarkTheme } from "../utils/themeManager";

const { t } = useI18n();

defineProps({
	siteName: { type: String, required: true },
	currentTime: { type: String, required: true },
	currentTimezone: { type: String, required: true },
});

const deferredInstallPrompt = ref(null);
const canInstall = ref(false);
const displayModeMediaQuery = window.matchMedia("(display-mode: standalone)");

const isStandaloneMode = () => displayModeMediaQuery.matches || window.navigator.standalone === true;

const syncInstallAvailability = () => {
	if (isStandaloneMode()) {
		canInstall.value = false;
		deferredInstallPrompt.value = null;
	}
};

const handleBeforeInstallPrompt = (event) => {
	event.preventDefault();
	if (isStandaloneMode()) {
		return;
	}

	deferredInstallPrompt.value = event;
	canInstall.value = true;
};

const handleAppInstalled = () => {
	canInstall.value = false;
	deferredInstallPrompt.value = null;
};

const installApp = async () => {
	if (!deferredInstallPrompt.value) {
		return;
	}

	deferredInstallPrompt.value.prompt();
	await deferredInstallPrompt.value.userChoice;
	canInstall.value = false;
	deferredInstallPrompt.value = null;
};

onMounted(() => {
	syncInstallAvailability();
	window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
	window.addEventListener("appinstalled", handleAppInstalled);
	displayModeMediaQuery.addEventListener("change", syncInstallAvailability);
});

onUnmounted(() => {
	window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
	window.removeEventListener("appinstalled", handleAppInstalled);
	displayModeMediaQuery.removeEventListener("change", syncInstallAvailability);
});
</script>

<style scoped>
.info-header {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 1020;
	padding: 8px 12px;
	text-align: center;
	box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
	transition: background-color 0.3s, color 0.3s;
}

.header-light {
	background: #f8f9fa;
	color: #222;
}

.header-dark {
	background: #212529;
	color: #f2f2f2;
}

.install-btn {
	position: absolute;
	top: 50%;
	right: 12px;
	transform: translateY(-50%);
	width: 31px;
	height: 31px;
	border: 1px solid transparent;
	border-radius: 10px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0;
	cursor: pointer;
	backdrop-filter: blur(4px);
	box-shadow: 0 1px 5px rgba(0, 0, 0, 0.14);
	transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.install-btn svg {
	width: 17px;
	height: 17px;
	fill: currentColor;
}

.install-btn:hover {
	transform: translateY(calc(-50% - 1px));
	box-shadow: 0 2px 7px rgba(0, 0, 0, 0.16);
}

.install-btn:active {
	transform: translateY(-50%);
	box-shadow: 0 2px 7px rgba(0, 0, 0, 0.15);
}

.install-btn:focus-visible {
	outline: 2px solid #9ec5fe;
	outline-offset: 2px;
}

.header-light .install-btn {
	background: rgba(11, 94, 215, 0.08);
	border-color: rgba(11, 94, 215, 0.16);
	color: #0a58ca;
}

.header-dark .install-btn {
	background: rgba(147, 197, 253, 0.12);
	border-color: rgba(147, 197, 253, 0.2);
	color: #cfe3ff;
}

.title-line {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	font-size: 0.95rem;
	font-weight: 600;
	line-height: 1.2;
}

.title-icon {
	width: 18px;
	height: 18px;
}

.meta-line {
	margin-top: 4px;
	font-size: 0.8rem;
	line-height: 1.2;
	display: flex;
	justify-content: center;
	gap: 8px;
	flex-wrap: wrap;
}

.meta-pill {
	display: inline-block;
	padding: 3px 10px;
	border-radius: 999px;
	font-size: 0.76rem;
	line-height: 1.2;
	max-width: min(92vw, 520px);
	overflow-wrap: anywhere;
}

.header-light .meta-pill {
	background-color: rgba(0, 0, 0, 0.05);
	color: black;
}

.header-dark .meta-pill {
	background-color: rgba(255, 255, 255, 0.05);
	color: white;
}

@media (max-width: 575px) {
	.info-header {
		padding: 7px 10px;
	}

	.install-btn {
		right: 10px;
		width: 28px;
		height: 28px;
		border-radius: 9px;
	}

	.install-btn svg {
		width: 16px;
		height: 16px;
	}

	.title-line {
		font-size: 0.88rem;
	}

	.meta-line {
		font-size: 0.74rem;
	}
}
</style>
