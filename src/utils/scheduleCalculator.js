import dayjs from "dayjs";

// 計算所需的循環數據(精確計算 4 天範圍)
export function calculateCycles(world) {
    console.time("calculateCycles");

    const now = dayjs();
    const startTime = dayjs(world.startTime);
    const loopTime = world.loopTime; // 每次循環的總時間
    const dayTime = world.dayTime; // 白天時間

    // 定義計算範圍：從前一天中午到後一天中午
    const rangeStart = now.startOf("day").subtract(1, "day").add(12, "hour");
    const rangeEnd = now.startOf("day").add(2, "day").add(12, "hour");

    const cycles = [];
    let cycleStartTime = calculateNearestCycleStart(startTime, rangeStart, loopTime);

    while (cycleStartTime.isBefore(rangeEnd)) {
        const dayStart = cycleStartTime;
        const nightStart = dayStart.add(dayTime, "second");
        const nextCycleStart = dayStart.add(loopTime, "second");

        // 僅保留在範圍內的數據
        if (dayStart.isBetween(rangeStart, rangeEnd, null, "[)")) {
            cycles.push({ start: dayStart, end: nightStart, status: world.dayStatusName });
        }
        if (nightStart.isBetween(rangeStart, rangeEnd, null, "[)")) {
            cycles.push({ start: nightStart, end: nextCycleStart, status: world.nightStatusName });
        }

        cycleStartTime = nextCycleStart;
    }

    console.timeEnd("calculateCycles");
    return cycles;
}

// 計算最接近的循環起始時間
function calculateNearestCycleStart(startTime, targetTime, loopTime) {
    const elapsedTime = targetTime.diff(startTime, "second");
    const remainder = elapsedTime % loopTime;
    return targetTime.subtract(remainder, "second");
}

// 篩選循環數據，只保留今天和隔天的數據
export function filterCycles(cycles) {
    const now = dayjs();
    const todayStart = now.startOf("day");
    const tomorrowEnd = todayStart.add(1, "day").endOf("day");

    return cycles.filter((cycle) => {
        const cycleStart = cycle.start;

        // 僅保留今天和隔天的數據
        return cycleStart.isBetween(todayStart, tomorrowEnd, null, "[)");
    });
}

// 為循環數據分配狀態
export function assignCycleStatuses(cycles) {
    const now = dayjs();
    cycles.forEach((cycle, index) => {
        if (now.isBetween(cycle.start, cycle.end)) {
            cycle.statusClass = "status-ongoing";
        } else if (now.isAfter(cycle.end)) {
            cycle.statusClass = "status-ended";
        } else {
            cycle.statusClass = "status-not-started";
        }
    });

    // 標記下一個循環
    const nextCycle = cycles.find((cycle) => cycle.statusClass === "status-not-started");
    if (nextCycle) nextCycle.statusClass = "status-next";

    return cycles;
}
