<template>
	<div class="floating-container" :class="isDarkTheme ? 'dark' : 'light'">
		<!-- 語言切換懸浮球 -->
		<div class="dropdown">
			<button class="floating-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"
				title="切換語言">
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

		<!-- 主題切換懸浮球 -->
		<button class="floating-btn" @click="toggleTheme" :title="isDarkTheme ? '切換至淺色主題' : '切換至深色主題'">
			<!-- 深色模式下顯示太陽 -->
			<svg v-if="isDarkTheme" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
				:class="['theme-icon', 'theme-icon-sun']" fill="none" stroke-width="2">
				<circle cx="12" cy="12" r="5" />
				<path
					d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
			</svg>
			<!-- 淺色模式下顯示月亮 -->
			<svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
				:class="['theme-icon', 'theme-icon-moon']" fill="none" stroke-width="2">
				<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
			</svg>
		</button>
	</div>
</template>

<script setup>
import { onMounted } from "vue";
import { toggleTheme, isDarkTheme } from "../utils/themeManager"; // 引入全域主題管理
import { useI18n } from "vue-i18n";
import { Dropdown } from "bootstrap";

const { locale } = useI18n();

// 切換語言
const switchLanguage = (lang) => {
	locale.value = lang;
	localStorage.setItem("locale", lang); // 儲存到 localStorage
	console.debug(`切換語言至：${lang}`);
};

// 初始化下拉選單
onMounted(() => {
	const dropdownElementList = [].slice.call(
		document.querySelectorAll(".dropdown-toggle")
	);
	dropdownElementList.map(
		(dropdownToggleEl) => new Dropdown(dropdownToggleEl)
	);
});
</script>

<style scoped>
/* === 容器樣式 === */
.floating-container {
	position: fixed;
	/* 固定在頁面 */
	bottom: 55px;
	/* 距離底部 55px */
	right: 20px;
	/* 距離右側 20px */
	z-index: 1050;
	/* 保持最上層顯示 */
	display: flex;
	/* 彈性佈局 */
	gap: 10px;
	/* 子項目間距 */
	flex-direction: column;
	/* 預設垂直排列 */
	transition: all 0.3s ease-in-out;
	/* 容器過渡動畫 */
}

@media (min-width: 585px) {
	.floating-container {
		bottom: 18px;
		/* 大於 585px 時距離底部調整到 20px */
	}
}

/* === 🟢 當螢幕變寬 (>=720px) 時，變成水平模式 === */
@media (min-width: 720px) {
    /* 先讓按鈕動畫執行 */
    .floating-container .dropdown {
        animation: moveToHorizontal 0.3s ease-in-out forwards;
    }
}

/* === 🟢 進入水平模式的動畫 === */
@keyframes moveToHorizontal {
    0% { transform: translate(0, 0); }
    50% { transform: translate(-70px, 0); }
	/* 先往左 */
    100% { transform: translate(-70px, 70px); }
	/* 再往下 */
}

/* === 🔴 當螢幕變窄 (<720px) 時，回到垂直模式 === */
@media (max-width: 719px) {
    /* 先讓語言按鈕執行回復動畫 */
    .floating-container .dropdown {
        animation: moveToVertical 0.3s ease-in-out forwards;
    }
}

/* === 🔴 回到垂直模式的動畫 === */
@keyframes moveToVertical {
    0% { transform: translate(-70px, 70px); }
	/* 這裡是 moveToHorizontal 最後的位置 */
    50% { transform: translate(-70px, 0); }
	/* 先往上 */
    100% { transform: translate(0, 0); }
	/* 回到原始位置 */
}

/* === 按鈕樣式 === */
.floating-btn {
	width: 60px;
	/* 按鈕寬度 */
	height: 60px;
	/* 按鈕高度 */
	border: none;
	/* 移除邊框 */
	border-radius: 50%;
	/* 圓形按鈕 */
	display: flex;
	/* 彈性佈局 */
	justify-content: center;
	/* 水平居中 */
	align-items: center;
	/* 垂直居中 */
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
	/* 陰影效果 */
	background-color: var(--bs-light);
	/* 預設背景色 */
	transition: transform 0.2s ease-in-out, background-color 0.3s ease-in-out, color 0.3s ease-in-out;
	/* 過渡效果 */
	cursor: pointer;
	/* 滑鼠變為點擊樣式 */
	padding: 0;
	/* 移除內邊距 */
}

/* 滑鼠懸停時按鈕縮放效果 */
.floating-btn:hover {
	transform: scale(1.1);
	/* 放大按鈕 */
}

/* === 深色模式按鈕樣式 === */
.floating-container.dark .floating-btn {
	background-color: #444;
	/* 深色模式按鈕背景色 */
	color: #f8f9fa;
	/* 按鈕內的文字或圖標為白色 */
}

/* 滑鼠懸停時的深色模式效果 */
.floating-container.dark .floating-btn:hover {
	background-color: #666;
	/* 深色模式懸停時變更背景色 */
	color: #f8f9fa;
	/* 保持文字或圖標為白色 */
}

/* === 淺色模式按鈕樣式 === */
.floating-container.light .floating-btn {
	background-color: #f8f9fa;
	/* 淺色模式按鈕背景色 */
	color: #333;
	/* 按鈕內的文字或圖標為黑色 */
}

/* 滑鼠懸停時的淺色模式效果 */
.floating-container.light .floating-btn:hover {
	background-color: #ddd;
	/* 淺色模式懸停時變更背景色 */
	color: #333;
	/* 保持文字或圖標為黑色 */
}

/* === SVG 圖標樣式 === */
.theme-icon {
	width: 30px;
	/* 圖標寬度 */
	height: 30px;
	/* 圖標高度 */
	transition: stroke 0.3s ease-in-out;
	/* 線條顏色過渡效果 */
}

.theme-icon-moon {
	stroke: #333;
	/* 月亮圖標默認顏色（淺色模式） */
}

.theme-icon-moon:hover {
	stroke: #4169e1;
	/* 月亮圖標滑鼠懸停變為藍色 */
}

.theme-icon-sun {
	stroke: #f8f9fa;
	/* 太陽圖標默認顏色（深色模式） */
}

.theme-icon-sun:hover {
	stroke: #f39c12;
	/* 太陽圖標滑鼠懸停變為金黃色 */
}

/* === 下拉選單樣式 === */
.dropdown-menu.custom-menu {
	border-radius: 16px;
	/* 圓角設計 */
	min-width: 120px;
	/* 最小寬度 */
	padding: 10px 0;
	/* 上下內邊距 */
	text-align: center;
	/* 內容居中 */
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
	/* 添加陰影效果 */
	transition: background-color 0.3s ease, color 0.3s ease;
	/* 過渡效果 */
}

/* 淺色模式下的下拉選單 */
.dropdown-menu.light {
	background-color: #f8f9fa;
	/* 與淺色模式按鈕一致 */
	color: #333;
	/* 字體顏色為黑色 */
}

/* 深色模式下的下拉選單 */
.dropdown-menu.dark {
	background-color: #444;
	/* 與深色模式按鈕一致 */
	color: #f8f9fa;
	/* 字體顏色為白色 */
}

/* 下拉選單選項樣式 */
.dropdown-menu .dropdown-item {
	background-color: transparent;
	/* 背景默認透明 */
	color: inherit;
	/* 繼承父級顏色 */
	transition: background-color 0.3s ease, color 0.3s ease;
	/* 過渡效果 */
}

/* 淺色模式下的下拉選單選項懸停效果 */
.dropdown-menu.light .dropdown-item:hover {
	background-color: #ddd;
	/* 背景變淺灰 */
	color: #333;
	/* 字體保持黑色 */
}

/* 深色模式下的下拉選單選項懸停效果 */
.dropdown-menu.dark .dropdown-item:hover {
	background-color: #666;
	/* 背景變深灰 */
	color: #f8f9fa;
	/* 字體保持白色 */
}
</style>
