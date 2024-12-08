<template>
    <div v-show="visible" id="loading-overlay">
        <img id="loading-icon" src="/images/cycle_icon.png" alt="Loading" />
    </div>
</template>
<script setup>
import { ref, onMounted } from "vue";

// 是否顯示 Loading 畫面
const visible = ref(true);

// 回報給 App.vue ， 讓其知道 Loading 畫面已結束
const emit = defineEmits(["loading-complete"]);

// 模擬載入完成
onMounted(() => {
    const minDuration = 1000; // 最小動畫持續時間 (1 秒)
    const startTime = Date.now();

    // 確保動畫持續至少 1 秒
    const completeLoading = () => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(minDuration - elapsedTime, 0);

        setTimeout(() => {
            visible.value = false; // 隱藏 Loading 畫面
            emit("loading-complete");
        }, remainingTime);
    };

    completeLoading();
});
</script>


<style scoped>
/* Loading 全屏覆蓋背景 */
#loading-overlay {
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
    transition: opacity 0.5s ease-in-out; /* 淡出動畫 */
    background: linear-gradient(90deg, #121212, #333, #121212);
    background-size: 200% 200%;
    animation: gradient 2s ease infinite; /* 背景漸變動畫 */
    pointer-events: all; /* 避免在 Loading 狀態下點擊 */
}

#loading-overlay.transparent {
    opacity: 0; /* 完全透明 */
    pointer-events: none; /* 禁止事件傳遞 */
}

/* Loading 圖標樣式 */
#loading-icon {
    width: 120px;
    height: 120px;
    animation: bounce 1s ease-in-out infinite; /* 彈跳動畫 */
}

/* 背景漸變動畫 */
@keyframes gradient {
    0%, 100% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
}

/* 彈跳動畫 */
@keyframes bounce {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-15px);
    }
}
</style>
