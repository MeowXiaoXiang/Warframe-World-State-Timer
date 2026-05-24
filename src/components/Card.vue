<template>
    <div class="card shadow-sm">
        <div class="card-body d-flex justify-content-between align-items-center">
            <div class="text-container">
                <p class="card-text fw-bold">
                    {{ world.name }} - {{ status }}
                </p>
                <p class="time-left">
                    <span :class="isDarkTheme ? 'text-light' : 'text-dark'">
                        {{ t("card.timeLeftMessage.prefix") }}
                    </span>
                    <span :class="[
                        'badge',
                        'state-badge'
                    ]" :style="stateBadgeStyle">
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
            <div class="status-icon">
                <template v-if="shouldShowImage">
                    <img
                        :src="icon"
                        :alt="world.name"
                        class="icon-image"
                        :class="{ 'svg-icon': isSvg(icon) }"
                        @error="handleImageError"
                    />
                </template>
                <template v-else>
                    <span>{{ fallbackIcon }}</span>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { computed, ref, watch } from "vue";
import { isDarkTheme } from "../utils/themeManager";
import type { WorldCycle, WorldStatePalette, WorldStateTheme } from "../domain/worldCycles";

const { t } = useI18n();

const props = withDefaults(defineProps<{
    world: WorldCycle;
    status?: string | null;
    timeLeft?: string | null;
    icon?: string;
    theme?: WorldStateTheme | null;
}>(), {
    status: null,
    timeLeft: null,
    icon: "❓",
    theme: null,
});
const imageLoadFailed = ref(false);

watch(
    () => props.icon,
    () => {
        imageLoadFailed.value = false;
    }
);

const stateBadgeStyle = computed(() => {
    if (!props.theme) return {};
    const palette: WorldStatePalette = props.theme[isDarkTheme.value ? "dark" : "light"];

    return {
        "--state-accent": palette.accent,
        "--state-surface": palette.surface,
        "--state-text": palette.text,
    };
});

const shouldShowImage = computed(() => isImage(props.icon) && !imageLoadFailed.value);

const fallbackIcon = computed(() => isImage(props.icon) ? "❓" : props.icon);

const handleImageError = () => {
    imageLoadFailed.value = true;
};

const isImage = (icon: string): boolean => {
    return /\.(svg|png|jpe?g|gif|webp|avif)$/i.test(icon);
};

const isSvg = (icon: string): boolean => {
    return /\.svg$/i.test(icon);
};
</script>

<style scoped>
.card {
    border-radius: 12px !important;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1) !important;
    margin: 20px auto !important;
    max-width: 400px !important;
    transition: transform 0.3s ease, box-shadow 0.3s ease,
        background-color 0.3s ease;
    cursor: pointer !important;
}

[data-theme="dark"] .card {
    --bs-card-bg: #444;
    --bs-card-border-color: rgba(255, 255, 255, 0.12);
}

.card:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

.card-body {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    padding: 20px !important;
    background-color: var(--card-background);
    border-radius: 12px !important;
}

.card-text {
    font-size: 1.2rem !important;
    font-weight: bold !important;
    color: var(--text-color) !important;
}

.time-left {
    font-size: 1rem !important;
    color: var(--text-color-secondary, #555) !important;
}

.time-left span {
    margin-right: 6px;
}

.status-icon {
    font-size: 40px !important;
    margin-left: 20px !important;
}

.icon-image {
    width: 70px;
    height: 70px;
    object-fit: contain;
}

.svg-icon {
    width: 60px;
    height: 60px;
    filter: invert(0);
    transition: filter 0.3s ease;
}

[data-theme="dark"] .svg-icon {
    filter: invert(1);
}

.state-badge {
    background-color: var(--state-surface, var(--bs-info)) !important;
    color: var(--state-text, #111) !important;
    border: 1px solid color-mix(in srgb, var(--state-accent) 45%, transparent);
}

[data-theme="dark"] .badge.bg-warning {
    background-color: #886600 !important;
}

[data-theme="dark"] .badge.bg-info {
    background-color: #004c99 !important;
}
</style>
