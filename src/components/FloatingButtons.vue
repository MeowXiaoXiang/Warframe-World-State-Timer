<template>
	<div class="floating-container" :class="isDarkTheme ? 'dark' : 'light'">
		<div class="dropdown">
			<button class="floating-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"
				:title="t('floatingButtons.switchLanguage')">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="language-icon" width="32"
					height="32">
					<path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"
						:stroke="isDarkTheme ? '#F8F9FA' : '#333'"
						d="M48 112h288M192 64v48M272 448l96-224 96 224M301.5 384h133M281.3 112S257 206 199 277 80 384 80 384" />
					<path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"
						:stroke="isDarkTheme ? '#F8F9FA' : '#333'" d="M256 336s-35-27-72-75-56-85-56-85" />
				</svg>
			</button>
			<ul class="dropdown-menu custom-menu" :class="isDarkTheme ? 'dark' : 'light'">
				<li>
					<a class="dropdown-item" href="#" @click.prevent="switchLanguage('zh-TW')">中文</a>
				</li>
				<li class="divider"></li>
				<li>
					<a class="dropdown-item" href="#" @click.prevent="switchLanguage('en-US')">English</a>
				</li>
			</ul>
		</div>

		<button class="floating-btn" @click="toggleTheme"
			:title="isDarkTheme ? t('floatingButtons.switchToLightTheme') : t('floatingButtons.switchToDarkTheme')">
			<svg v-if="isDarkTheme" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
				:class="['theme-icon', 'theme-icon-sun']" fill="none" stroke-width="2">
				<circle cx="12" cy="12" r="5" />
				<path
					d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
			</svg>
			<svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
				:class="['theme-icon', 'theme-icon-moon']" fill="none" stroke-width="2">
				<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
			</svg>
		</button>
	</div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { toggleTheme, isDarkTheme } from "../utils/themeManager";
import { useI18n } from "vue-i18n";
import { Dropdown } from "bootstrap";

const { locale, t } = useI18n();

const switchLanguage = (lang: "zh-TW" | "en-US") => {
	locale.value = lang;
	localStorage.setItem("locale", lang);
};

onMounted(() => {
	const dropdownElementList = Array.from(
		document.querySelectorAll<HTMLElement>(".dropdown-toggle")
	);
	dropdownElementList.forEach(
		(dropdownToggleEl) => new Dropdown(dropdownToggleEl)
	);
});
</script>

<style scoped>
.floating-container {
	position: fixed;
	bottom: 18px;
	right: 20px;
	z-index: 1050;
	display: flex;
	gap: 10px;
	flex-direction: column;
	transition: all 0.3s ease-in-out;
}

/* 只有螢幕寬度 <= 560px，且 footer 超過 56px 時才往上補 */
@media (max-width: 560px) {
	.floating-container {
		bottom: calc(10px + max(0px, calc(var(--app-footer-height, 0px))));
	}
}

@media (min-width: 720px) {
    .floating-container .dropdown {
        animation: moveToHorizontal 0.3s ease-in-out forwards;
    }
}

@keyframes moveToHorizontal {
    0% { transform: translate(0, 0); }
    50% { transform: translate(-70px, 0); }
    100% { transform: translate(-70px, 70px); }
}

@media (max-width: 719px) {
    .floating-container .dropdown {
        animation: moveToVertical 0.3s ease-in-out forwards;
    }
}

@keyframes moveToVertical {
    0% { transform: translate(-70px, 70px); }
    50% { transform: translate(-70px, 0); }
    100% { transform: translate(0, 0); }
}

.floating-btn {
	width: 60px;
	height: 60px;
	border: none;
	border-radius: 50%;
	display: flex;
	justify-content: center;
	align-items: center;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
	background-color: var(--bs-light);
	transition: transform 0.2s ease-in-out, background-color 0.3s ease-in-out, color 0.3s ease-in-out;
	cursor: pointer;
	padding: 0;
}

.floating-btn:hover {
	transform: scale(1.1);
}

.floating-container.dark .floating-btn {
	background-color: #444;
	color: #f8f9fa;
}

.floating-container.dark .floating-btn:hover {
	background-color: #666;
	color: #f8f9fa;
}

.floating-container.light .floating-btn {
	background-color: #f8f9fa;
	color: #333;
}

.floating-container.light .floating-btn:hover {
	background-color: #ddd;
	color: #333;
}

.theme-icon {
	width: 30px;
	height: 30px;
	transition: stroke 0.3s ease-in-out;
}

.theme-icon-moon {
	stroke: #333;
}

.theme-icon-moon:hover {
	stroke: #4169e1;
}

.theme-icon-sun {
	stroke: #f8f9fa;
}

.theme-icon-sun:hover {
	stroke: #f39c12;
}

.dropdown-menu.custom-menu {
	border-radius: 16px;
	min-width: 120px;
	padding: 10px 0;
	text-align: center;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
	transition: background-color 0.3s ease, color 0.3s ease;
}

.dropdown-menu.light {
	background-color: #f8f9fa;
	color: #333;
}

.dropdown-menu.dark {
	background-color: #444;
	color: #f8f9fa;
}

.dropdown-menu .dropdown-item {
	background-color: transparent;
	color: inherit;
	transition: background-color 0.3s ease, color 0.3s ease;
}

.dropdown-menu.light .dropdown-item:hover {
	background-color: #ddd;
	color: #333;
}

.dropdown-menu.dark .dropdown-item:hover {
	background-color: #666;
	color: #f8f9fa;
}
</style>
