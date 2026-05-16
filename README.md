# Warframe 世界循環時間表網站

這是一個 **[Warframe 世界循環時間表網站](https://meowxiaoxiang.github.io/Warframe-World-State-Timer/)**，專為 Warframe 玩家設計，提供即時準確的世界循環資訊。玩家可方便地查閱夜靈平野、奧布山谷、魔裔禁地、扎日曼號與渡域的目前狀態，以及下一次狀態切換的預期時間，協助規劃遊戲內活動。

## 功能特色

- 顯示各地區當前循環狀態。
- 支援二狀態與多狀態循環，例如渡域的五段 Mood Spiral。
- 提供距離下一次狀態變化的倒計時，幫助玩家掌握時間節點。
- 自動更新狀態與時間，保證資訊即時性。
- 模態框功能顯示未來兩天內的狀態時間表，讓玩家提前規劃活動時間。
- 直觀的色彩標示：
  - **綠色**：當前進行中的狀態。
  - **橘色**：下一次即將開始的狀態。
  - **粉紅色**：已經結束的狀態。
  - **灰色**：尚未開始的狀態。

## 使用技術

- **HTML**：搭建網站結構，設計卡片與模態框的元素。
- **CSS**：優化視覺效果，包括卡片樣式、狀態標示及顏色區分。
- **TypeScript**：負責世界循環計算邏輯，動態更新顯示狀態及剩餘時間。
- **Day.js**：處理時間與時區相關的計算，確保跨時區的準確性。
- **Bootstrap 5**：提供排版與模態框的功能，增強網站的易用性。
- **Vue.js 3**：用於開發互動式前端，實現了語言切換與主題切換功能。
- **Vue I18n**：實現多語言支持，提供簡便的語言切換功能。
- **Vite**：作為構建工具，提供快速的開發與構建體驗。
- **vite-plugin-pwa**：提供 PWA（可安裝與離線快取）能力。
- **pnpm 11**：使用快速且節省磁碟空間的依賴管理工具。

## 資料來源

本專案的世界循環校準值主要參考 Warframe Wiki，並在本專案內轉換成 `epochMs + states[]` 的靜態資料。

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

補充：[Warframe Worldstate Parser (WFCD)](https://github.com/WFCD/warframe-worldstate-parser) 與 [Warframe 官方動態世界狀態 API](https://content.warframe.com/dynamic/worldState.php) 可作為理解 world state 的背景參考，但目前世界循環時間表不即時解析它們，而是以本地 v2 cycle data 為準。

### `world_cycles.json`

主要資料來源位於 `src/data/world_cycles.json`，會在 build 時編譯進前端 bundle，讓 App 首屏與離線行為不依賴額外 fetch。

為了保留既有 GitHub Pages 靜態 URL 的相容性，`public/data/world_cycles.json` 仍會隨部署輸出，但 App 本身不會從這個路徑載入資料。更新 cycle data 時，兩份檔案需要保持一致，`pnpm verify:cycles` 會檢查這件事。

範例：

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
- **icon**: emoji 或 `public/` 下的圖片路徑。此資料會在 build 時編譯進前端 bundle。
- **theme.light / theme.dark**: 狀態在淺色與深色模式下的識別色，包含 `accent`、`surface`、`text`。
- 世界名稱與狀態翻譯存放於 `src/locales/zh-TW.json` 與 `src/locales/en.json`。

## 安裝與使用

### 環境需求

- Node.js 22.13+
- Corepack（用於啟用 `packageManager` 指定的 pnpm 版本）

```bash
corepack enable
```

### 安裝依賴

```bash
pnpm install
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

`verify:cycles` 會驗證現有世界循環資料、確認 public 相容副本與編譯來源一致、渡域五段循環順序、未來時間表推演與基本效能。

### 構建網站

```bash
pnpm build
```

命令會 Build 並生成生產版本的網站，將輸出到 `./dist` 目錄。

## PWA 支援

- 已整合 Web App Manifest 與 Service Worker。
- 部署後可在支援的瀏覽器中「安裝」到桌面或主畫面。
- `world_cycles.json` 會編譯進前端 bundle，跟隨同一個 build 版本被 Service Worker 快取，降低額外 fetch 失敗風險。
- `public/data/world_cycles.json` 保留為 legacy 靜態檔相容用途，不作為 App runtime 載入來源。

## 版本更新

此專案曾經是純 HTML、CSS 和 JavaScript 版本，並且已經更新為基於 Vue 3 的版本，提供更多的交互功能，例如語言切換與主題切換等。舊版純靜態站已封存在 `archive/legacy-static-site`，方便需要時對照早期實作。
