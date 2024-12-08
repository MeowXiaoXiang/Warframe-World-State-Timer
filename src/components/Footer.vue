<template>
    <footer class="footer text-center py-2" :class="{ 'bg-dark text-light': isDarkTheme, 'bg-light text-dark': !isDarkTheme }">
        <div class="container">
            <p class="mb-1">Copyright © 2024 XiaoXiang_Meow</p>
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
</style>
