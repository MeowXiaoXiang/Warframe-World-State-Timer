dayjs.extend(dayjs_plugin_utc);
dayjs.extend(dayjs_plugin_timezone);

// 世界資料設定
const worlds = {
    plains: {
        name: '夜靈平原',
        startTime: "2021-02-05T12:27:54Z",
        loopTime: 8998.875,
        dayTime: 5998.875,
        nightTime: 3000,
        dayStatusName: '白晝',
        nightStatusName: '夜晚',
        dayIcon: '☀️',
        nightIcon: '🌙'
    },
    earth: {
        name: '地球森林',
        startTime: "2015-12-03T00:00:00Z",
        loopTime: 28800 + 14400, // 12小時
        dayTime: 28800, // 8小時
        nightTime: 14400, // 4小時
        dayStatusName: '白晝',
        nightStatusName: '夜晚',
        dayIcon: '☀️',
        nightIcon: '🌙'
    },
    orb: {
        name: '奧布山谷',
        startTime: "2021-01-09T08:13:48Z",
        loopTime: 2200,
        dayTime: 1600,
        nightTime: 600,
        dayStatusName: '溫暖',
        nightStatusName: '寒冷',
        dayIcon: '🔥',
        nightIcon: '❄️'
    },
    cambion: {
        name: '魔裔禁地',
        startTime: "2021-02-05T12:27:54Z",
        loopTime: 9000,
        dayTime: 5000,
        nightTime: 4000,
        dayStatusName: 'Fass',
        nightStatusName: 'Vome',
        dayIcon: '🟧',
        nightIcon: '🟦'
    }
};

function updateCycle(worldKey) {
    const world = worlds[worldKey];
    const currentTime = dayjs().tz("Asia/Taipei");
    const startTime = dayjs(world.startTime).tz("Asia/Taipei");
    const timeElapsed = currentTime.diff(startTime, 'second');
    const timeInCycle = timeElapsed % world.loopTime;

    let status = "";
    let nextCycle = "";
    let icon = "";
    let timeLeft = 0;

    if (timeInCycle < world.dayTime) {
        // 白天狀態
        status = world.dayStatusName;
        nextCycle = world.nightStatusName;
        icon = world.dayIcon;
        timeLeft = world.dayTime - timeInCycle;
    } else {
        // 夜晚狀態
        status = world.nightStatusName;
        nextCycle = world.dayStatusName;
        icon = world.nightIcon;
        timeLeft = world.loopTime - timeInCycle;
    }

    // 計算剩餘時間
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const timeString = hours > 0 ? `${hours} 小時 ${minutes} 分` : `${minutes} 分`;

    document.getElementById(`status-${worldKey}`).textContent = status;
    document.getElementById(`next-cycle-${worldKey}`).textContent = nextCycle;
    document.getElementById(`output-${worldKey}`).textContent = timeString;
    document.getElementById(`status-icon-${worldKey}`).textContent = icon;
}

function updateAllCycles() {
    for (let worldKey in worlds) {
        updateCycle(worldKey);
    }
    // 更新當前時間
    document.getElementById('current-time').textContent = '現在時間：' + dayjs().tz("Asia/Taipei").format('YYYY/MM/DD HH:mm');
}

// 當模態框即將顯示時
var timeModal = document.getElementById('timeModal');
timeModal.addEventListener('show.bs.modal', function (event) {
    var button = event.relatedTarget;
    var worldKey = button.getAttribute('data-world');
    showModal(worldKey);
});

function showModal(worldKey) {
    const world = worlds[worldKey];
    document.getElementById('modal-world-name').textContent = world.name;
    document.getElementById('modal-day-title').textContent = world.dayStatusName;
    document.getElementById('modal-night-title').textContent = world.nightStatusName;

    const modalContentBody = document.getElementById('modal-content-body');
    modalContentBody.innerHTML = '';

    const now = dayjs().tz("Asia/Taipei");
    const todayStart = now.startOf('day');
    const tomorrowStart = now.add(1, 'day').startOf('day');
    const endOfTomorrow = tomorrowStart.add(1, 'day'); // 明天的結束時間

    const startTime = dayjs(world.startTime).tz("Asia/Taipei");

    const timeElapsedSinceStart = todayStart.diff(startTime, 'second');
    const cyclesElapsed = Math.floor(timeElapsedSinceStart / world.loopTime);
    let timePointer = startTime.add(cyclesElapsed * world.loopTime, 'second');

    const cycles = [];
    while (timePointer.isBefore(endOfTomorrow)) {
        const cycleStart = timePointer.clone();
        const cycleEnd = cycleStart.add(world.loopTime, 'second');

        // 收集今天和明天的循環
        if (cycleEnd.isAfter(todayStart) && cycleStart.isBefore(endOfTomorrow)) {
            cycles.push({ start: cycleStart.clone(), end: cycleEnd.clone() });
        }

        // 移動到下一個循環
        timePointer = timePointer.add(world.loopTime, 'second');
    }

    let isNext = true;

    const scheduleDateToday = document.createElement('div');
    scheduleDateToday.className = 'schedule-date';
    scheduleDateToday.textContent = todayStart.format('M/D');
    modalContentBody.appendChild(scheduleDateToday);

    cycles.forEach(cycle => {
        if (cycle.end.isBefore(tomorrowStart)) {
            const scheduleItem = document.createElement('div');
            scheduleItem.className = 'schedule-item';

            const dayDiv = document.createElement('div');
            dayDiv.className = 'schedule-period';
            dayDiv.style.width = '48%';

            const nightDiv = document.createElement('div');
            nightDiv.className = 'schedule-period';
            nightDiv.style.width = '48%';

            let dayStart = cycle.start.clone();
            let dayEnd = dayStart.add(world.dayTime, 'second');
            if (dayEnd.isBefore(tomorrowStart)) {
                const dayResult = createScheduleItem(dayStart, dayEnd, world.dayStatusName, isNext);
                dayDiv.appendChild(dayResult.element);
                if (dayResult.status === '進行中' || dayResult.status === '下一個') {
                    isNext = dayResult.isNextRemaining;
                }
            }

            let nightStart = dayEnd.clone();
            let nightEnd = nightStart.add(world.nightTime, 'second');
            if (nightEnd.isBefore(tomorrowStart)) {
                const nightResult = createScheduleItem(nightStart, nightEnd, world.nightStatusName, isNext);
                nightDiv.appendChild(nightResult.element);
                if (nightResult.status === '進行中' || nightResult.status === '下一個') {
                    isNext = nightResult.isNextRemaining;
                }
            }

            scheduleItem.appendChild(dayDiv);
            scheduleItem.appendChild(nightDiv);
            modalContentBody.appendChild(scheduleItem);
        }
    });

    const scheduleDateTomorrow = document.createElement('div');
    scheduleDateTomorrow.className = 'schedule-date';
    scheduleDateTomorrow.textContent = tomorrowStart.format('M/D');
    modalContentBody.appendChild(scheduleDateTomorrow);

    cycles.forEach(cycle => {
        if (cycle.start.isAfter(tomorrowStart) && cycle.start.isBefore(endOfTomorrow)) {
            const scheduleItem = document.createElement('div');
            scheduleItem.className = 'schedule-item';

            const dayDiv = document.createElement('div');
            dayDiv.className = 'schedule-period';
            dayDiv.style.width = '48%';

            const nightDiv = document.createElement('div');
            nightDiv.className = 'schedule-period';
            nightDiv.style.width = '48%';

            let dayStart = cycle.start.clone();
            let dayEnd = dayStart.add(world.dayTime, 'second');
            const dayResult = createScheduleItem(dayStart, dayEnd, world.dayStatusName, isNext);
            dayDiv.appendChild(dayResult.element);
            if (dayResult.status === '進行中' || dayResult.status === '下一個') {
                isNext = dayResult.isNextRemaining;
            }

            let nightStart = dayEnd.clone();
            let nightEnd = nightStart.add(world.nightTime, 'second');
            const nightResult = createScheduleItem(nightStart, nightEnd, world.nightStatusName, isNext);
            nightDiv.appendChild(nightResult.element);
            if (nightResult.status === '進行中' || nightResult.status === '下一個') {
                isNext = nightResult.isNextRemaining;
            }

            scheduleItem.appendChild(dayDiv);
            scheduleItem.appendChild(nightDiv);
            modalContentBody.appendChild(scheduleItem);
        }
    });
}

function createScheduleItem(startTime, endTime, statusName, isNext) {
    const currentTime = dayjs().tz("Asia/Taipei");

    const div = document.createElement('div');

    const timeDiv = document.createElement('div');
    timeDiv.className = 'schedule-time';
    timeDiv.textContent = startTime.format('HH:mm') + ' - ' + endTime.format('HH:mm');

    const statusLabel = document.createElement('div');
    statusLabel.className = 'status-label';

    let isNextRemaining = isNext; // 用於更新外部的 isNext
    let status = '';

    if (currentTime.isBefore(startTime)) {
        if (isNext) {
            // 下一個時間段
            statusLabel.textContent = '下一個';
            statusLabel.classList.add('status-next');
            isNextRemaining = false; // 已經找到下一個，設置為 false
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
        isNextRemaining = false; // 進行中，則下一個自動標為 "下一個"
        status = '進行中';
    }

    // 如果進行中的時間段結束後，標記下一個為 "下一個"
    if (status === '進行中') {
        // 下一個時間段設置為 "下一個" 並標示橘色
        statusLabel.textContent = '進行中';
        statusLabel.classList.add('status-ongoing');
        isNextRemaining = true; // 更新下一個時間段狀態
    } else if (status === '已結束' && !isNextRemaining) {
        // 標記下一個時間段為 "下一個" (橘色)
        statusLabel.textContent = '下一個';
        statusLabel.classList.add('status-next');
    }

    div.appendChild(timeDiv);
    div.appendChild(statusLabel);

    return { element: div, isNextRemaining, status };
}

// 確保網頁載入完成後馬上更新一次，然後每分鐘更新時間
window.onload = function () {
    updateAllCycles();  // 先執行一次更新
    setInterval(updateAllCycles, 60000);  // 然後每分鐘更新一次
};
