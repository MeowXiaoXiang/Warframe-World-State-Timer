<template>
    <div v-show="visible" id="loading-overlay">
        <img id="loading-icon" src="/images/cycle_icon.png" alt="Loading" />
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";

const visible = ref(true);

const emit = defineEmits<{
    "loading-complete": [];
}>();

onMounted(() => {
    const minDuration = 1000;
    const startTime = Date.now();

    const completeLoading = () => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(minDuration - elapsedTime, 0);

        setTimeout(() => {
            visible.value = false;
            emit("loading-complete");
        }, remainingTime);
    };

    completeLoading();
});
</script>


<style scoped>
#loading-overlay {
    --loading-bg-start: #dfeafe;
    --loading-bg-mid: #f5f9ff;
    --loading-bg-end: #cddff8;
    --loading-glow: rgba(255, 255, 255, 0.65);
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
    opacity: 1;
    transition: opacity 0.5s ease-in-out;
    background: linear-gradient(90deg, var(--loading-bg-start), var(--loading-bg-mid), var(--loading-bg-end));
    background-size: 200% 200%;
    animation: gradient 2s ease infinite;
    pointer-events: all;
}

#loading-overlay::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, var(--loading-glow) 0%, rgba(255, 255, 255, 0) 65%);
    opacity: 0.55;
    pointer-events: none;
}

[data-theme="dark"] #loading-overlay {
    --loading-bg-start: #11141a;
    --loading-bg-mid: #283246;
    --loading-bg-end: #11141a;
    --loading-glow: rgba(102, 140, 214, 0.28);
}

#loading-overlay.transparent {
    opacity: 0;
    pointer-events: none;
}

#loading-icon {
    position: relative;
    z-index: 1;
    width: 120px;
    height: 120px;
    filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.2));
    animation: bounce 1s ease-in-out infinite;
}

[data-theme="dark"] #loading-icon {
    filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.5));
}

@keyframes gradient {
    0%, 100% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
}

@keyframes bounce {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-15px);
    }
}
</style>
