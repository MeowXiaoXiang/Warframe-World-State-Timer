<template>
    <div class="card shadow-sm">
        <div class="card-body d-flex justify-content-between align-items-center">
            <div class="text-container">
                <!-- 世界名稱與當前狀態 -->
                <p class="card-text fw-bold">
                    {{ world.name }} - {{ status }}
                </p>
                <!-- 剩餘時間與下一循環 -->
                <p class="time-left">
                    <span :class="isDarkTheme ? 'text-light' : 'text-dark'">
                        {{ t("card.timeLeftMessage.prefix") }}
                    </span>
                    <span :class="[
                        'badge',
                        status === world.dayStatusName ? 'bg-warning' : 'bg-info',
                        isDarkTheme ? 'text-light' : 'text-dark'
                    ]">
                        {{ status }}
                    </span>
                    <span :class="isDarkTheme ? 'text-light' : 'text-dark'">
                        {{ t("card.timeLeftMessage.suffix") }}
                    </span>
                    <span class="badge" :class="isDarkTheme ? 'bg-secondary text-light' : 'bg-light text-dark'">
                        {{ timeLeft }}
                    </span>
                </p>
            </div>
            <!-- 狀態圖標 -->
            <div class="status-icon">
                <template v-if="isImage(icon)">
                    <!-- 圖片類型 -->
                    <img :src="icon" :alt="world.name" class="icon-image" :class="{ 'svg-icon': isSvg(icon) }" />
                </template>
                <template v-else>
                    <!-- Emoji 或 Unicode -->
                    <span>{{ icon }}</span>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { isDarkTheme } from "../utils/themeManager"; // 引入 isDarkTheme

const { t } = useI18n();

defineProps({
    world: { type: Object, required: true },
    status: { type: String, default: null },
    nextCycle: { type: String, default: null },
    timeLeft: { type: String, default: null },
    icon: { type: String, default: "❓" },
});

/**
 * 判斷是否是圖片路徑（根據後綴名）
 * @param {string} icon
 * @returns {boolean} 是否為圖片
 */
const isImage = (icon) => {
    return /\.(svg|png|jpg|jpeg|gif)$/i.test(icon);
};

/**
 * 判斷是否是 SVG 圖片
 * @param {string} icon
 * @returns {boolean} 是否為 SVG
 */
const isSvg = (icon) => {
    return /\.svg$/i.test(icon);
};
</script>

<style scoped>
/* === 卡片樣式 === */
.card {
    border-radius: 12px !important;
    /* 卡片的圓角設計 */
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1) !important;
    /* 陰影效果讓卡片有浮起感 */
    margin: 20px auto !important;
    /* 水平置中，且上下有間距 */
    max-width: 400px !important;
    /* 卡片的最大寬度，避免太寬 */
    transition: transform 0.3s ease, box-shadow 0.3s ease,
        background-color 0.3s ease;
    /* 卡片 hover 時的動畫效果，增加背景色變化 */
    cursor: pointer !important;
    /* 滑鼠經過時顯示點擊手勢 */
}

/* 卡片 hover 時的效果 */
.card:hover {
    transform: scale(1.05);
    /* 輕微放大 */
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
    /* 加強陰影效果 */
}

/* 卡片內容設定 */
.card-body {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    padding: 20px !important;
    /* 卡片內部的間距 */
    background-color: var(--card-background);
    /* 使用 CSS 變數控制背景色 */
    border-radius: 12px !important;
    /* 圓角保持一致 */
}

.card-text {
    font-size: 1.2rem !important;
    /* 主要文字大小 */
    font-weight: bold !important;
    /* 文字加粗 */
    color: var(--text-color) !important;
    /* 使用全局文字顏色變數 */
}

.time-left {
    font-size: 1rem !important;
    /* 副文字大小 */
    color: var(--text-color-secondary, #555) !important;
    /* 可選的次級文字顏色，默認為灰色 */
}

.time-left span {
    margin-right: 6px;
    /* 調整間距大小 */
}

.status-icon {
    font-size: 40px !important;
    /* 狀態圖示的大小 */
    margin-left: 20px !important;
    /* 與文字的間距 */
}

.icon-image {
    width: 70px; /* 圖片寬度 */
    height: 70px; /* 圖片高度 */
    object-fit: contain; /* 確保圖片縮放不變形 */
}

.svg-icon {
        width: 60px;
        height: 60px;
        filter: invert(0); /* 預設顏色 */
        transition: filter 0.3s ease;
    }

[data-theme="dark"] .svg-icon {
    filter: invert(1); /* 在暗色主題時反轉顏色 */
}

/* === 自定義 Bootstrap badge 顏色覆蓋 === */
[data-theme="dark"] .badge.bg-warning {
    background-color: #886600 !important;
}

[data-theme="dark"] .badge.bg-info {
    background-color: #004c99 !important;
}
</style>
