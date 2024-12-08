dayjs.extend(dayjs_plugin_utc);
dayjs.extend(dayjs_plugin_timezone);
dayjs.extend(dayjs_plugin_isBetween);

let worldsData; // 世界資料
let currentModalWorldKey = null; // 記錄當前模態框對應的世界

// 獲取用戶時區
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// 初始化
async function init() {
    try {
        const response = await fetch('data/world_cycles.json');
        const data = await response.json();
        worldsData = data.worlds;

        generateCards(worldsData);
        updateAllCycles();
        setInterval(updateAllCycles, 1000);
    } catch (error) {
        console.error('初始化失敗', error);
    }
}

// 動態生成卡片
function generateCards(worlds) {
    const container = document.getElementById('card-container');
    container.innerHTML = ''; // 清空容器，避免重複渲染
    for (const [key, world] of Object.entries(worlds)) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.bsToggle = 'modal';
        card.dataset.bsTarget = '#timeModal';
        card.dataset.world = key;

        card.innerHTML = `
            <div class="card-body">
                <div>
                    <p class="card-text">${world.name} - <span id="status-${key}"></span></p>
                    <p class="time-left">距離 <span id="next-cycle-${key}" class="badge bg-primary"></span> 還有 <span id="output-${key}" class="badge bg-secondary"></span></p>
                </div>
                <div id="status-icon-${key}" class="status-icon"></div>
            </div>
        `;
        container.appendChild(card);
    }
}

// 更新所有世界的循環
function updateAllCycles() {
    for (const [key, world] of Object.entries(worldsData)) {
        updateCycle(key, world);
    }

    const currentTimeElement = document.getElementById('current-time');
    const currentTimezoneElement = document.getElementById('current-timezone');

    if (currentTimeElement) {
        const currentTime = dayjs().tz(userTimeZone).format('YYYY/MM/DD HH:mm:ss');
        currentTimeElement.textContent = `現在時間：${currentTime}`;
    }

    if (currentTimezoneElement) {
        const timeZoneOffset = new Date().toLocaleString('en-US', { timeZoneName: 'short' }).split(' ').pop();
        currentTimezoneElement.textContent = `時區：${userTimeZone} (${timeZoneOffset})`;
    }
}


// 更新個別世界的循環
function updateCycle(worldKey, world) {
    const { status, nextCycle, timeLeft, icon } = calculateCycleData(world);

    const statusElement = document.getElementById(`status-${worldKey}`);
    const nextCycleElement = document.getElementById(`next-cycle-${worldKey}`);
    const outputElement = document.getElementById(`output-${worldKey}`);
    const statusIconElement = document.getElementById(`status-icon-${worldKey}`);

    // 追蹤上次狀態
    if (!world.previousStatus) {
        world.previousStatus = status; // 初始化上次狀態
    }

    // 若狀態變化，且模態框為當前世界，觸發更新
    if (world.previousStatus !== status) {
        world.previousStatus = status; // 更新上次狀態

        if (currentModalWorldKey === worldKey) {
            const modalContentBody = document.getElementById('modal-content-body');
            modalContentBody.innerHTML = ''; // 清空內容

            const cycles = calculateCyclesForModal(world);
            const now = dayjs().tz(userTimeZone);
            const todayStart = now.startOf('day');
            const tomorrowStart = todayStart.add(1, 'day');
            const filteredCycles = filterCyclesForDisplay(cycles, todayStart, tomorrowStart);

            renderModalContent(filteredCycles, modalContentBody, world); // 渲染更新後的模態框
        }
    }

    // 更新卡片內容
    if (statusElement && nextCycleElement && outputElement && statusIconElement) {
        statusElement.textContent = status;
        nextCycleElement.textContent = nextCycle;
        outputElement.textContent = timeLeft;
        statusIconElement.textContent = icon;

        // 根據日夜狀態決定顏色
        nextCycleElement.classList.add("badge", getStatusColors(status, world), "text-dark");
        outputElement.classList.add("badge", "bg-light", "text-dark");
    }
}
// 根據 status 和 world 動態設置顏色
function getStatusColors(status, world) {
    let nextCycleColor

    // 判斷當前狀態是日間還是夜晚
    if (status === world.dayStatusName) {
        // 如果是日間，顯示對應的顏色
        nextCycleColor = "bg-info"; // 藍色，因為距離[夜晚]
    } else {
        // 如果是夜晚，顯示對應的顏色
        nextCycleColor = "bg-warning"; // 黃色，因為距離[白晝]
    }

    return nextCycleColor;
}

// 計算世界的循環資料
function calculateCycleData(world) {
    const now = dayjs.utc();
    const startTime = dayjs.utc(world.startTime);
    const timeElapsed = now.diff(startTime, 'second');
    const timeInCycle = timeElapsed % world.loopTime;

    let status, nextCycle, icon, timeLeft;

    if (timeInCycle < world.dayTime) {
        status = world.dayStatusName;
        nextCycle = world.nightStatusName;
        icon = world.dayIcon;
        timeLeft = world.dayTime - timeInCycle;
    } else {
        status = world.nightStatusName;
        nextCycle = world.dayStatusName;
        icon = world.nightIcon;
        timeLeft = world.loopTime - timeInCycle;
    }

    return { status, nextCycle, timeLeft: formatTimeLeft(timeLeft), icon };
}

// 剩餘時間做格式
function formatTimeLeft(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours} 小時 ${minutes} 分 ${secs} 秒`;
    } else if (minutes > 0) {
        return `${minutes} 分 ${secs} 秒`;
    } else {
        return `${secs} 秒`;
    }
}

// 設定循環狀態
function assignCycleStatuses(filteredCycles, now) {
    let hasOngoing = false;
    let nextIndex = -1;

    // 第一遍判斷進行中與已結束
    filteredCycles.forEach((cycle, index) => {
        if (now.isBetween(cycle.start, cycle.end)) {
            cycle.statusClass = "status-ongoing";
            hasOngoing = true;
            nextIndex = index + 1; // 設置下一個循環的索引
        } else if (now.isAfter(cycle.end)) {
            cycle.statusClass = "status-ended";
        } else {
            cycle.statusClass = "status-not-started";
        }
    });

    // 第二遍設定下一個循環
    if (hasOngoing && nextIndex < filteredCycles.length) {
        filteredCycles[nextIndex].statusClass = "status-next";
    } else if (!hasOngoing) {
        // 如果沒有進行中的項目，選擇當前時間最近的未開始循環
        const nextCycle = filteredCycles.find(cycle => now.isBefore(cycle.start));
        if (nextCycle) {
            nextCycle.statusClass = "status-next";
        }
    }

    return filteredCycles;
}

// 計算模態框所需的循環資料
function calculateCyclesForModal(world) {
    const now = dayjs.utc();
    const startTime = dayjs.utc(world.startTime);
    const yesterdayStart = now.startOf('day').subtract(1, 'day');
    const tomorrowEnd = now.startOf('day').add(2, 'day').endOf('day');

    const cycles = [];
    let timePointer = startTime;

    while (timePointer.isBefore(tomorrowEnd)) {
        const dayStart = timePointer;
        const nightStart = dayStart.add(world.dayTime, 'second');
        const nextCycleStart = dayStart.add(world.loopTime, 'second');

        if (dayStart.isBetween(yesterdayStart, tomorrowEnd, null, '[)')) {
            cycles.push({ start: dayStart, end: nightStart, status: world.dayStatusName });
        }
        if (nightStart.isBetween(yesterdayStart, tomorrowEnd, null, '[)')) {
            cycles.push({ start: nightStart, end: nextCycleStart, status: world.nightStatusName });
        }

        timePointer = nextCycleStart;
    }

    return cycles;
}

// 過濾出當天與隔天的循環數據，因為我們是算4天的循環(但最第一天和最後一天只有半天來當作預算的，所以需要切出中間需求的兩天)
function filterCyclesForDisplay(cycles, todayStart, tomorrowStart) {
    return cycles.filter(cycle => {
        const cycleStart = cycle.start.tz(userTimeZone);
        return cycleStart.isSame(todayStart, 'day') || cycleStart.isSame(tomorrowStart, 'day');
    });
}

// 創建白天和夜晚的容器
function createDayNightContainers(parentElement, date) {
    const dateHeader = document.createElement('div');
    dateHeader.className = 'schedule-date';
    dateHeader.textContent = date;
    parentElement.appendChild(dateHeader);

    const dayNightRow = document.createElement('div');
    dayNightRow.className = 'day-night-row';

    const dayContainer = document.createElement('div');
    dayContainer.className = 'day-container';
    dayNightRow.appendChild(dayContainer);

    const nightContainer = document.createElement('div');
    nightContainer.className = 'night-container';
    dayNightRow.appendChild(nightContainer);

    parentElement.appendChild(dayNightRow);

    return { dayContainer, nightContainer };
}

// 更新模態框的標題
function updateModalHeader(world) {
    const modalWorldName = document.getElementById('modal-world-name');
    const modalDayTitle = document.getElementById('modal-day-title');
    const modalNightTitle = document.getElementById('modal-night-title');

    if (modalWorldName && modalDayTitle && modalNightTitle) {
        modalWorldName.textContent = world.name || "未知世界"; // 空資料
        modalDayTitle.textContent = world.dayStatusName || "白晝";
        modalNightTitle.textContent = world.nightStatusName || "夜晚";
    }
}

// 渲染模態框的內容
function renderModalContent(filteredCycles, modalContentBody, world) {
    const now = dayjs().tz(userTimeZone);
    const updatedCycles = assignCycleStatuses(filteredCycles, now);

    let currentDay = null;
    let dayContainer = null;
    let nightContainer = null;

    updatedCycles.forEach(cycle => {
        const cycleDay = cycle.start.tz(userTimeZone).format('YYYY/MM/DD');

        if (currentDay !== cycleDay) {
            const containers = createDayNightContainers(modalContentBody, cycleDay);
            dayContainer = containers.dayContainer;
            nightContainer = containers.nightContainer;
            currentDay = cycleDay;
        }

        const cycleItem = document.createElement('div');
        cycleItem.className = `cycle-item ${cycle.statusClass}`;
        cycleItem.textContent = `${cycle.start.tz(userTimeZone).format('HH:mm')} ~ ${cycle.end.tz(userTimeZone).format('HH:mm')}`;

        if (cycle.status === world.dayStatusName) {
            dayContainer.appendChild(cycleItem);
        } else {
            nightContainer.appendChild(cycleItem);
        }
    });
}

// 顯示模態框內容
function showModal(worldKey) {
    const world = worldsData[worldKey];
    if (!world) return;

    currentModalWorldKey = worldKey; // 記錄當前模態框的世界

    // 更新模態框標題
    updateModalHeader(world);

    // 清空模態框內容
    const modalContentBody = document.getElementById('modal-content-body');
    modalContentBody.innerHTML = '';

    // 計算並過濾循環數據
    const cycles = calculateCyclesForModal(world);
    const now = dayjs().tz(userTimeZone);
    const todayStart = now.startOf('day');
    const tomorrowStart = todayStart.add(1, 'day');
    const filteredCycles = filterCyclesForDisplay(cycles, todayStart, tomorrowStart);

    // 渲染模態框內容
    renderModalContent(filteredCycles, modalContentBody, world);
}

// 模態框打開事件
const timeModal = document.getElementById('timeModal');
timeModal.addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget;
    const worldKey = button.getAttribute('data-world');
    showModal(worldKey);
});
timeModal.addEventListener('hidden.bs.modal', function () {
    currentModalWorldKey = null; // 清空當前模態框的世界記錄
});


// 初始化
init();