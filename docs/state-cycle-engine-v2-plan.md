# State Cycle Engine v2 設計與改寫計畫

## 背景

目前專案的世界循環資料與計算邏輯以 day/night 二狀態為核心：

- `startTime`
- `loopTime`
- `dayTime`
- `nightTime`
- `dayStatusName`
- `nightStatusName`
- `dayIcon`
- `nightIcon`

這對 Plains of Eidolon、Orb Vallis、Cambion Drift、Zariman 這類二狀態循環足夠，但不適合 Duviri 這種五狀態循環，也不利於未來新增其他多狀態世界循環。

v2 的目標不是替 day/night 補特例，而是把核心模型改成任意狀態數的 cycle engine。

## 設計核心

每個世界都是一個由 `epochMs` 錨定、由 `states[]` 組成的循環。

```text
WorldCycle = epochMs + states[]
WorldState = key + durationMs + icon + theme
```

計算時只需要：

```text
nowMs = Date.now()
elapsedMs = nowMs - epochMs
positionMs = positiveModulo(elapsedMs, loopDurationMs)
currentState = findStateByPosition(positionMs)
nextState = states[(currentIndex + 1) % states.length]
```

`loopDurationMs` 由 `states[].durationMs` 加總取得，不再手寫。

## 新資料格式

`public/data/world_cycles.json` 將升級為 v2 schema。下方是節錄範例；正式資料中每個 state 都需要包含 `theme.light` 與 `theme.dark`。

```json
{
  "version": 2,
  "worlds": {
    "plains_earth": {
      "epochMs": 1766129867176,
      "states": [
        {
          "key": "day",
          "durationMs": 5998874,
          "icon": "☀️",
          "theme": {
            "light": { "accent": "#f6a623", "surface": "#ffe2a6", "text": "#5f3b00" },
            "dark": { "accent": "#ffbf47", "surface": "#4a320d", "text": "#ffe8a3" }
          }
        },
        {
          "key": "night",
          "durationMs": 3000000,
          "icon": "🌙",
          "theme": {
            "light": { "accent": "#6674e8", "surface": "#dde3ff", "text": "#243187" },
            "dark": { "accent": "#93a2ff", "surface": "#202a62", "text": "#eef1ff" }
          }
        }
      ]
    },
    "orb": {
      "epochMs": 1766128805676,
      "states": [
        { "key": "warm", "durationMs": 400000, "icon": "🔥" },
        { "key": "cold", "durationMs": 1200000, "icon": "❄️" }
      ]
    },
    "duviri": {
      "epochMs": 1766138452676,
      "states": [
        { "key": "joy", "durationMs": 7200000, "icon": "./images/states/duviri/joy.png" },
        { "key": "anger", "durationMs": 7200000, "icon": "./images/states/duviri/anger.png" },
        { "key": "envy", "durationMs": 7200000, "icon": "./images/states/duviri/envy.png" },
        { "key": "sorrow", "durationMs": 7200000, "icon": "./images/states/duviri/sorrow.png" },
        { "key": "fear", "durationMs": 7200000, "icon": "./images/states/duviri/fear.png" }
      ]
    }
  }
}
```

### 不再作為新版核心的欄位

以下欄位會從 v2 domain model 移除：

- `startTime`
- `loopTime`
- `dayTime`
- `nightTime`
- `dayStatusName`
- `nightStatusName`
- `dayIcon`
- `nightIcon`

這些是舊二狀態模型的概念。v2 不做舊格式相容層，而是直接將現有資料轉成 `epochMs + states[]`。

## i18n 策略

`world_cycles.json` 只放循環資料，不放翻譯文字。

世界名稱與狀態名稱移到 `src/locales/*.json`：

```json
{
  "worlds": {
    "duviri": {
      "name": "Duviri",
      "states": {
        "joy": "Joy",
        "anger": "Anger",
        "envy": "Envy",
        "sorrow": "Sorrow",
        "fear": "Fear"
      }
    }
  }
}
```

中文檔使用相同 key：

```json
{
  "worlds": {
    "duviri": {
      "name": "渡域",
      "states": {
        "joy": "喜悅",
        "anger": "憤怒",
        "envy": "嫉妒",
        "sorrow": "悲傷",
        "fear": "恐懼"
      }
    }
  }
}
```

## 圖示策略

第一版不建立 icon registry。

`icon` 暫時保留為 string，支援：

- emoji 或純文字
- public image path
- SVG
- PNG
- JPG/JPEG
- GIF
- WebP/AVIF 可在 UI 判斷中補上

範例：

```json
{ "icon": "☀️" }
{ "icon": "./images/states/zariman/grineer.svg" }
{ "icon": "./images/states/duviri/joy.png" }
```

若未來需要統一圖示風格，再改成 `iconKey` 搭配 `iconRegistry.ts`。

## 資料來源與限制

本地參考資料來自 Warframe Wiki 的 raw template / gadget，保存在本機但不提交：

- `wiki.warframe.com.rawcode`
- `wiki.warframe.com.js`

這些檔案已加入 `.git/info/exclude`，不放進 repo。

### 來源分級

主要資料來源：

- [Template:CycleClock raw](https://wiki.warframe.com/index.php?title=Template%3ACycleClock&action=raw)
  - 用於 Plains of Eidolon / Earth、Orb Vallis、Cambion Drift、Duviri 的 `epochMs`、狀態持續時間與 state messages。
- [Template:Mainpage Box Timers](https://wiki.warframe.com/w/Template:Mainpage_Box_Timers)
  - 用於確認首頁公開 timer 清單。
  - 用於 Zariman 這類 `Countdown` 型 timer 的 `date`、`looptime`、`delaytime`。

行為參考：

- [MediaWiki:Gadget-CycleClock.js](https://wiki.warframe.com/w/MediaWiki:Gadget-CycleClock.js)
  - 僅參考 Wiki 如何呈現 cycle clock。
  - 不作為校準資料來源，不複製其 JS/CSS 實作。

### CycleClock 類資料

Wiki `CycleClock` 模型提供：

- `epoch`
- `stateDurations`
- `stateMessages`

可直接轉換成 v2：

```text
epoch -> epochMs
stateDurations -> states[].durationMs
stateMessages -> states[].key / locale label
```

目前 rawcode 已涵蓋：

- Plains of Eidolon / Earth
- Orb Vallis
- Cambion Drift
- Duviri

### Countdown 類資料

Zariman 不是 `CycleClock`，而是 Wiki `Countdown`：

```text
date = February 6, 2025 12:34:30 UTC
looptime = 18000
delaytime = 9000
```

可手動轉成二狀態 cycle：

```json
{
  "epochMs": 1738845270000,
  "states": [
    { "key": "grineer", "durationMs": 9000000, "icon": "./images/states/zariman/grineer.svg" },
    { "key": "corpus", "durationMs": 9000000, "icon": "./images/states/zariman/corpus.svg" }
  ]
}
```

注意：Grineer / Corpus 的起始順序需要以現有站台行為或遊戲狀態再次確認。

Daily Reset、Weekly Reset、Baro、Ergo、Eleanor 等 countdown 不納入這一輪 `WorldCycle` 重構，避免模型過度膨脹。

## TypeScript 型別構想

```ts
export interface RawWorldCyclesData {
  version: 2;
  worlds: Record<string, RawWorldCycle>;
}

export interface RawWorldCycle {
  epochMs: number;
  states: RawWorldState[];
}

export interface RawWorldState {
  key: string;
  durationMs: number;
  icon?: string;
  theme: WorldStateTheme;
}

export interface WorldCycle {
  id: string;
  name: string;
  epochMs: number;
  loopDurationMs: number;
  states: WorldState[];
}

export interface WorldState {
  key: string;
  label: string;
  icon?: string;
  durationMs: number;
  theme: WorldStateTheme;
}

export interface WorldStateTheme {
  light: WorldStatePalette;
  dark: WorldStatePalette;
}

export interface WorldStatePalette {
  accent: string;
  surface: string;
  text: string;
}

export interface ActiveWorldState {
  worldId: string;
  state: WorldState;
  nextState: WorldState;
  stateIndex: number;
  nextStateIndex: number;
  startedAtMs: number;
  endsAtMs: number;
  elapsedMs: number;
  remainingMs: number;
  positionMs: number;
  loopDurationMs: number;
}

export interface CycleEntry {
  worldId: string;
  stateKey: string;
  stateIndex: number;
  label: string;
  icon?: string;
  theme: WorldStateTheme;
  start: Dayjs;
  end: Dayjs;
  startMs: number;
  endMs: number;
  statusClass?: CycleStatusClass;
}
```

## UI 方向

### Card

Card 改成顯示 current / next state：

```text
World name - Current state
Current state ends in timeLeft
icon
```

不再知道 day/night。

### Modal

Modal 從 day/night 雙欄改為通用 timeline。

建議第一版：

```text
Today
08:00 - 10:00  Joy      ongoing
10:00 - 12:00  Anger    next
12:00 - 14:00  Envy

Tomorrow
...
```

桌面與手機先共用垂直列表，穩定後再考慮更精緻的水平時間軸。

## 分階段改寫計畫

### Phase 0: Branch 與文件

- 建立 `refactor/state-cycle-engine-v2` 分支。
- 將 wiki rawcode/js 加入 `.git/info/exclude`。
- 新增本文件記錄 v2 設計。
- 不改 runtime 行為。

### Phase 1: v2 型別與資料

- 新增 `src/domain/worldCycles/types.ts`。
- 將 `public/data/world_cycles.json` 改成 v2 schema。
- 將世界名稱與 state label 移到 `src/locales/zh-TW.json`、`src/locales/en.json`。
- 暫時不重構 UI，先讓 TypeScript 型別可以表達 v2 資料。

### Phase 2: Cycle Engine

- 新增或重構 cycle engine utility。
- 實作：
  - positive modulo
  - `getActiveWorldState(world, nowMs)`
  - `calculateWorldStatus(worlds, i18n, nowMs?)`
  - `calculateCycleEntries(world, range)`
  - `assignCycleStatuses(entries, nowMs?)`
- 全部以毫秒計算，顯示時再格式化。

### Phase 3: Timeline Modal

- 移除 day/night grouping。
- Modal 改成日期分組的 state timeline。
- 保留 existing behavior：
  - ongoing
  - ended
  - next
  - not-started
- 確認 Plains、Orb、Cambion、Zariman 二狀態世界仍正常。

### Phase 4: Duviri 正式加入

- 加入 Duviri v2 data。
- 加入 Duviri locale labels。
- 放入已整理好的 Duviri 圖示資源。
- 驗證五狀態 schedule 與 current/next state。

### Phase 5: 驗證與收斂

- 執行：

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm type-check
pnpm verify:cycles
pnpm build
git diff --check
```

## 目前實作狀態

- 已建立 `src/domain/worldCycles/`，包含 engine、schedule、status、normalize 與型別。
- 已將 `public/data/world_cycles.json` 升級為 v2 schema。
- 已加入 Duviri 五段 Mood Spiral：`joy`、`anger`、`envy`、`sorrow`、`fear`。
- 已將循環狀態圖片整理到 `public/images/states/{world}/`。
- 已讓 Card / Modal 讀取通用 `states[]`，Modal 改成日期分組 timeline。
- 已新增 Vitest 測試與 `pnpm verify:cycles` 驗證腳本。

- production preview 檢查：

```bash
pnpm preview --host 127.0.0.1 --port 4173
```

- 驗證路徑：

```text
http://127.0.0.1:4173/Warframe-World-State-Timer/
```

## 暫不處理

- 不重寫 PWA manifest。
- 不刪除 `old-version`。
- 不把 Wiki rawcode/js 提交到 repo。
- 不把 Daily/Weekly Reset、Baro、Ergo、Eleanor 納入 `WorldCycle`。
- 不先做 icon registry。

## 判斷原則

這次重構不是新增 Duviri 特例，而是建立任意狀態數的世界循環引擎。

Duviri 是壓力測試案例，不是架構特例。
