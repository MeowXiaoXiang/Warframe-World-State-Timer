import dayjs from "dayjs";

export function calculateWorldStatus(worlds, userTimeZone, i18n) {
    const worldStatus = {};

    worlds.forEach((world) => {
        const now = dayjs().tz(userTimeZone);
        const startTime = world.startTime;
        const timeElapsed = now.diff(startTime, "second");
        const timeInCycle = timeElapsed % world.loopTime;

        let status, nextCycle, icon, timeLeft;

        if (timeInCycle < world.dayTime) {
            status = world.dayStatusName;
            nextCycle = world.nightStatusName;
            icon = world.dayIcon;
            timeLeft = formatTimeLeft(world.dayTime - timeInCycle, i18n);
        } else {
            status = world.nightStatusName;
            nextCycle = world.dayStatusName;
            icon = world.nightIcon;
            timeLeft = formatTimeLeft(world.loopTime - timeInCycle, i18n);
        }

        // 更新每個世界的狀態
        worldStatus[world.id] = {
            status,
            nextCycle,
            icon,
            timeLeft,
        };
    });

    return worldStatus;
}

function formatTimeLeft(seconds, i18n) {
    const t = i18n.t; // 使用 i18n 的翻譯方法
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (hours > 0) parts.push(`${hours} ${t("time.hours")}`); // h
    if (minutes > 0) parts.push(`${minutes} ${t("time.minutes")}`); // m
    if (secs > 0 || parts.length === 0) parts.push(`${secs} ${t("time.seconds")}`); // s

    return parts.join(" ");
}