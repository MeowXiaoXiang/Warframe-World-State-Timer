# Warframe 世界循環時間表網站

這是一個 **[Warframe 世界循環時間表網站](https://meowxiaoxiang.github.io/Warframe-World-State-Timer/)**，用來快速查看夜靈平野、奧布山谷、魔裔禁地、扎日曼號與渡域的目前狀態、剩餘時間，以及接下來的循環安排，方便玩家規劃遊戲內活動。

## 功能特色

- 顯示各地區目前循環狀態與剩餘時間。
- 支援二狀態與多狀態循環，例如渡域的五段 Mood Spiral。
- 每秒自動更新目前時間、時區與循環倒計時。
- 點擊卡片可查看今天與明天的狀態時間表。
- 支援繁體中文、英文、深色/淺色主題與 PWA 安裝。
- 直觀的色彩標示：
  - **綠色**：當前進行中的狀態。
  - **橘色**：下一次即將開始的狀態。
  - **粉紅色**：已經結束的狀態。
  - **灰色**：尚未開始的狀態。

## 使用技術

- **Vue 3 + TypeScript**：建立互動式前端與世界循環核心計算邏輯。
- **Vite**：負責開發伺服器與生產建置。
- **Vitest**：測試世界循環計算、排程與資料正規化。
- **Day.js**：處理時間與時區顯示。
- **Bootstrap 5**：提供 modal、dropdown 等互動元件基礎。
- **Vue I18n**：提供繁體中文與英文介面。
- **vite-plugin-pwa**：提供 PWA（可安裝與離線快取）能力。
- **pnpm 11**：使用快速且節省磁碟空間的依賴管理工具。

## 資料來源

本專案使用本地 v2 循環資料作為執行時資料來源，不在前端即時解析官方 world state。循環校準值主要參考 Warframe Wiki，並整理成 `epochMs + states[]` 的靜態資料。

1. **[Warframe Wiki: Template:CycleClock raw](https://wiki.warframe.com/index.php?title=Template%3ACycleClock&action=raw)**

    - 主要資料來源。
    - 提供 Plains of Eidolon / Earth、Orb Vallis、Cambion Drift、Duviri 的循環錨點、狀態持續時間與狀態文字。
    - 本專案只參考 raw template 中的校準值與資料模型概念，不直接複製 Wiki 模板或 gadget 程式碼。

2. **[Warframe Wiki: Template:Mainpage Box Timers](https://wiki.warframe.com/w/Template:Mainpage_Box_Timers)**

    - 輔助資料來源。
    - 用來確認首頁目前公開呈現哪些 timer，以及 Zariman 這類 `Countdown` 型資料的 `date`、`looptime`、`delaytime`。

3. **[Warframe Wiki: MediaWiki:Gadget-CycleClock.js](https://wiki.warframe.com/w/MediaWiki:Gadget-CycleClock.js)**

    - 行為參考，不作為資料來源。
    - 僅用來理解 Wiki 前端如何呈現 cycle clock；本專案不複製其 JS/CSS 實作。

[Warframe Worldstate Parser (WFCD)](https://github.com/WFCD/warframe-worldstate-parser) 與 [Warframe 官方動態世界狀態 API](https://api.warframe.com/cdn/worldState.php) 可作為理解 world state 的背景參考；本專案目前只使用整理後的本地循環資料，避免前端執行時依賴外部 API 可用性。

### `world_cycles.json`

主要資料檔位於 `public/data/world_cycles.json`。App 會從 GitHub Pages 靜態路徑載入這份 v2 循環資料，Service Worker 也會快取它，讓網站在重開與離線情境下更穩定。

```json
{
 "version": 2,
 "worlds": {
  "duviri": {
   "epochMs": 1766138452676,
   "states": [
    {
     "key": "joy",
     "durationMs": 7200000,
     "icon": "./images/states/duviri/joy.png",
     "theme": {
      "light": {
       "accent": "#d7a93a",
       "surface": "#ffedb2",
       "text": "#674800"
      },
      "dark": {
       "accent": "#f0c65b",
       "surface": "#3b300f",
       "text": "#fff0b3"
      }
     }
    }
   ]
  }
 }
}
```

- **version**: 資料格式版本，目前為 `2`。
- **epochMs**: 循環錨點時間，使用 Unix epoch milliseconds，避免時區與小數秒誤差。
- **states**: 任意長度的狀態陣列，依序循環。
- **key**: 狀態 key，對應 `src/locales/*.json` 的顯示文字。
- **durationMs**: 該狀態持續時間，單位為毫秒。
- **icon**: emoji 或 `public/` 下的圖片路徑。
- **theme.light / theme.dark**: 狀態在淺色與深色模式下的識別色，包含 `accent`、`surface`、`text`。
- 世界名稱與狀態翻譯存放於 `src/locales/zh-TW.json` 與 `src/locales/en.json`。

更完整的 v2 cycle engine 設計與資料來源紀錄可見 [docs/state-cycle-engine-v2.md](docs/state-cycle-engine-v2.md)。

## 安裝與使用

### 環境需求

- Node.js 22.13+
- Corepack（用於啟用 `packageManager` 指定的 pnpm 版本）

```bash
corepack enable
```

### 安裝依賴

```bash
pnpm install --frozen-lockfile
```

### 開發模式

```bash
pnpm dev
```

這會啟動開發伺服器，並讓你在瀏覽器中預覽網站。

### 測試與驗證

```bash
pnpm test
pnpm type-check
pnpm verify:cycles
```

`verify:cycles` 會驗證現有世界循環資料、渡域五段循環順序、未來時間表推演與基本效能。

### 構建網站

```bash
pnpm build
```

命令會產生生產版本網站，輸出到 `./dist` 目錄。

## PWA 支援

- 已整合 Web App Manifest 與 Service Worker。
- 部署後可在支援的瀏覽器中「安裝」到桌面或主畫面。
- `world_cycles.json` 會透過 `StaleWhileRevalidate` 策略快取，提升重開速度與離線可用性。

## 版本更新

此專案曾經是純 HTML、CSS 和 JavaScript 版本，目前已改為 Vue 3 + TypeScript。舊版純靜態站封存在 `archive/legacy-static-site`，方便需要時對照早期實作。
