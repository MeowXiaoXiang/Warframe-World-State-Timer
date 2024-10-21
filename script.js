// dayjs 插件擴展
dayjs.extend(dayjs_plugin_utc);
dayjs.extend(dayjs_plugin_timezone);

// 世界資料設定
const worlds = {
    plains: createWorldData('夜靈平原', "2021-02-05T12:27:54Z", 8998.875, 5998.875, 3000, '白晝', '夜晚', '☀️', '🌙'),
    earth: createWorldData('地球森林', "2015-12-03T00:00:00Z", 28800, 14400, 14400, '白晝', '夜晚', '☀️', '🌙'),
    orb: createWorldData('奧布山谷', "2021-01-09T08:13:48Z", 2200, 1600, 600, '溫暖', '寒冷', '🔥', '❄️'),
    cambion: createWorldData('魔裔禁地', "2021-02-05T12:27:54Z", 8998.875, 5998.875, 3000, 'Fass', 'Vome', '🟧', '🟦')
};

// 創建世界資料的函數
function createWorldData(name, startTime, loopTime, dayTime, nightTime, dayStatusName, nightStatusName, dayIcon, nightIcon) {
    return {
        name,
        startTime,
        loopTime,
        dayTime,
        nightTime,
        dayStatusName,
        nightStatusName,
        dayIcon,
        nightIcon
    };
}

// 更新單個世界的循環狀態
function updateCycle(worldKey) {
    const world = worlds[worldKey];
    const { status, nextCycle, timeLeft, icon } = calculateCycleData(world);

    // DOM 操作
    document.getElementById(`status-${worldKey}`).textContent = status;
    document.getElementById(`next-cycle-${worldKey}`).textContent = nextCycle;
    document.getElementById(`output-${worldKey}`).textContent = timeLeft;
    document.getElementById(`status-icon-${worldKey}`).textContent = icon;
}

// 計算世界循環資料
function calculateCycleData(world) {
    const currentTime = dayjs.utc(); // 使用UTC时间
    const startTime = dayjs.utc(world.startTime); // 解析为UTC时间
    const timeElapsed = currentTime.diff(startTime, 'second');
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

    const timeLeftFormatted = formatTimeLeft(timeLeft);
    return { status, nextCycle, timeLeft: timeLeftFormatted, icon };
}

// 格式化剩餘時間
function formatTimeLeft(timeLeft) {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    return hours > 0 ? `${hours} 小時 ${minutes} 分` : `${minutes} 分`;
}

// 更新所有世界的循環
function updateAllCycles() {
    for (let worldKey in worlds) {
        updateCycle(worldKey);
    }
    document.getElementById('current-time').textContent = '現在時間：' + dayjs().tz("Asia/Taipei").format('YYYY/MM/DD HH:mm');
}

// 顯示模態框的時候
var timeModal = document.getElementById('timeModal');
timeModal.addEventListener('show.bs.modal', function (event) {
    var button = event.relatedTarget;
    var worldKey = button.getAttribute('data-world');
    showModal(worldKey);
});

// 顯示模態框內容
function showModal(worldKey) {
    const world = worlds[worldKey];
    document.getElementById('modal-world-name').textContent = world.name;
    document.getElementById('modal-day-title').textContent = world.dayStatusName;
    document.getElementById('modal-night-title').textContent = world.nightStatusName;

    const modalContentBody = document.getElementById('modal-content-body');
    modalContentBody.innerHTML = ''; // 清空舊內容

    const cycles = calculateCyclesForModal(world);
    renderModalContent(cycles, modalContentBody, world);
}

// 計算要顯示的循環時間
function calculateCyclesForModal(world) {
    const now = dayjs.utc(); // 使用UTC时间
    const todayStart = now.startOf('day');
    const tomorrowStart = todayStart.add(1, 'day');
    const endOfTomorrow = tomorrowStart.add(1, 'day');

    const startTime = dayjs.utc(world.startTime); // 解析为UTC时间
    const timeElapsedSinceStart = todayStart.diff(startTime, 'second');
    const cyclesElapsed = Math.floor(timeElapsedSinceStart / world.loopTime);
    let timePointer = startTime.add(cyclesElapsed * world.loopTime, 'second');

    const cycles = [];
    while (timePointer.isBefore(endOfTomorrow)) {
        const cycleStart = timePointer.clone();
        const cycleEnd = cycleStart.add(world.loopTime, 'second');

        // 收集今天和明天的循环
        if (cycleEnd.isAfter(todayStart) && cycleStart.isBefore(endOfTomorrow)) {
            cycles.push({ start: cycleStart.clone(), end: cycleEnd.clone() });
        }

        // 移动到下一个循环
        timePointer = timePointer.add(world.loopTime, 'second');
    }

    return cycles;
}


// 渲染模態框內容
function renderModalContent(cycles, modalContentBody, world) {
    let isNext = true;

    // 顯示今天的循環
    const todayStart = dayjs().tz("Asia/Taipei").startOf('day');
    const tomorrowStart = dayjs().tz("Asia/Taipei").add(1, 'day').startOf('day');
    isNext = appendScheduleForDay(cycles, todayStart, tomorrowStart, modalContentBody, world, isNext);

    // 顯示明天的循環
    const endOfTomorrow = tomorrowStart.add(1, 'day');
    isNext = appendScheduleForDay(cycles, tomorrowStart, endOfTomorrow, modalContentBody, world, isNext);
}

// 為模態框添加循環內容
function appendScheduleForDay(cycles, dayStart, dayEnd, modalContentBody, world, isNext) {
    const scheduleDate = document.createElement('div');
    scheduleDate.className = 'schedule-date';
    scheduleDate.textContent = dayStart.format('M/D');
    modalContentBody.appendChild(scheduleDate);

    cycles.forEach(cycle => {
        if (cycle.start.isAfter(dayStart) && cycle.start.isBefore(dayEnd)) {
            const scheduleItem = document.createElement('div');
            scheduleItem.className = 'schedule-item';

            const dayDiv = document.createElement('div');
            dayDiv.className = 'schedule-period';
            dayDiv.style.width = '48%';

            const nightDiv = document.createElement('div');
            nightDiv.className = 'schedule-period';
            nightDiv.style.width = '48%';

            let dayStartTime = cycle.start.clone();
            let dayEndTime = dayStartTime.add(world.dayTime, 'second');
            const dayResult = createScheduleItem(dayStartTime, dayEndTime, world.dayStatusName, isNext);
            dayDiv.appendChild(dayResult.element);

            // 处理夜晚段
            let nightStartTime = dayEndTime.clone();
            let nightEndTime = nightStartTime.add(world.nightTime, 'second');
            const nightResult = createScheduleItem(nightStartTime, nightEndTime, world.nightStatusName, isNext);
            nightDiv.appendChild(nightResult.element);

            // 更新 isNext
            if (dayResult.status === '進行中' || nightResult.status === '進行中') {
                isNext = false;
            } else if ((dayResult.status === '尚未開始' || nightResult.status === '尚未開始') && isNext) {
                dayResult.element.querySelector('.status-label').textContent = '下一個';
                dayResult.element.querySelector('.status-label').classList.add('status-next');
                nightResult.element.querySelector('.status-label').textContent = '下一個';
                nightResult.element.querySelector('.status-label').classList.add('status-next');
                isNext = false;
            }

            scheduleItem.appendChild(dayDiv);
            scheduleItem.appendChild(nightDiv);
            modalContentBody.appendChild(scheduleItem);
        }
    });

    return isNext
}

function createScheduleItem(startTime, endTime, statusName, isNext) {
    const currentTime = dayjs.utc();

    const div = document.createElement('div');

    const timeDiv = document.createElement('div');
    timeDiv.className = 'schedule-time';
    timeDiv.textContent = startTime.tz("Asia/Taipei").format('HH:mm') + ' - ' + endTime.tz("Asia/Taipei").format('HH:mm');

    const statusLabel = document.createElement('div');
    statusLabel.className = 'status-label';

    let status = '';

    // 判斷當前時間與這段時間的關係
    if (currentTime.isBefore(startTime)) {
        if (isNext) {
            // 標記為「下一個」
            statusLabel.textContent = '下一個';
            statusLabel.classList.add('status-next');
            status = '下一個';
        } else {
            // 尚未開始
            statusLabel.textContent = '尚未開始';
            statusLabel.classList.add('status-upcoming');
            status = '尚未開始';
        }
    } else if (currentTime.isAfter(endTime)) {
        // 已結束
        statusLabel.textContent = '已結束';
        statusLabel.classList.add('status-ended');
        status = '已結束';
    } else {
        // 進行中
        statusLabel.textContent = '進行中';
        statusLabel.classList.add('status-ongoing');
        status = '進行中';
    }

    div.appendChild(timeDiv);
    div.appendChild(statusLabel);

    return { element: div, status }; // 回傳狀態
}

// 確保網頁載入完成後馬上更新一次，然後每分鐘更新時間
window.onload = function () {
    updateAllCycles();
    setInterval(updateAllCycles, 60000); // 每分鐘更新一次
};
