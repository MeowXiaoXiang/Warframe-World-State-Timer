<template>
	<div class="info-header" :class="isDarkTheme ? 'header-dark' : 'header-light'">
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
import { isDarkTheme } from "../utils/themeManager";

defineProps({
	siteName: { type: String, required: true },
	currentTime: { type: String, required: true },
	currentTimezone: { type: String, required: true },
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

	.title-line {
		font-size: 0.88rem;
	}

	.meta-line {
		font-size: 0.74rem;
	}
}
</style>
