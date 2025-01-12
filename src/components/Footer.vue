<template>
    <footer class="footer text-center py-2" :class="{ 'bg-dark text-light': isDarkTheme, 'bg-light text-dark': !isDarkTheme }">
        <div class="container">
            <p class="mb-1">
                © 2025
                <!-- 個人 Github 頁面連結 -->
                <a
                    href="https://github.com/MeowXiaoXiang"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="name-btn"
                    :class="{ 'name-btn-dark': isDarkTheme, 'name-btn-light': !isDarkTheme }"
                >
                    Michael Lan (MeowXiaoXiang)
                </a>
                <!-- MIT License 按鈕 -->
                <a
                    href="https://github.com/MeowXiaoXiang/Warframe-World-State-Timer/blob/main/LICENSE"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="mit-btn"
                    :class="{ 'mit-btn-dark': isDarkTheme, 'mit-btn-light': !isDarkTheme }"
                >
                    MIT License
                </a>
                <!-- GitHub 按鈕 -->
                <a
                    href="https://github.com/MeowXiaoXiang/Warframe-World-State-Timer"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="ms-2 github-icon"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.52-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.64 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38C13.71 14.53 16 11.54 16 8c0-4.42-3.58-8-8-8z" />
                    </svg>
                </a>
            </p>
        </div>
    </footer>
</template>

<script setup>
import { isDarkTheme } from "../utils/themeManager";
</script>

<style scoped>
.footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
    font-size: 0.9rem;
    transition: background-color 0.3s, color 0.3s;
}

/* 名字按鈕樣式 */
.name-btn {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 0.9rem;
    text-decoration: none;
    transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
}

/* 深色模式 */
.name-btn-dark {
    background-color: inherit;
    color: white;
}

.name-btn-dark:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

/* 浅色模式 */
.name-btn-light {
    background-color: inherit;
    color: black;
}

.name-btn-light:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

/* MIT License 按鈕 */
.mit-btn {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 50px;
    font-size: 0.75rem;
    text-decoration: none;
    transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
    margin-left: 2px;
    margin-right: 2px;
}

/* 深色模式 */
.mit-btn-dark {
    background-color: rgba(255, 255, 255, 0.05);
    color: white;
}

.mit-btn-dark:hover {
    background-color: rgba(255, 255, 255, 0.2);
}

/* 浅色模式 */
.mit-btn-light {
    background-color: rgba(0, 0, 0, 0.05);
    color: black;
}

.mit-btn-light:hover {
    background-color: rgba(0, 0, 0, 0.2);
}
</style>
