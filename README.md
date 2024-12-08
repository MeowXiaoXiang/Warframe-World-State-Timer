# Warframe 世界循環時間計算網站

這是一個 **[Warframe 世界循環時間計算網站](https://meowxiaoxiang.github.io/Warframe-World-State-Timer/)**，專為 Warframe 玩家設計，提供即時準確的世界晝夜變化資訊。玩家可方便地查閱地球森林、夜靈平原、奧布山谷和魔裔禁地的當前狀態，以及下一次晝夜變換的預期時間，協助規劃遊戲內活動。

## 功能特色

- 顯示各地區當前的晝或夜狀態。
- 提供距離下一次晝夜變化的倒計時，幫助玩家掌握時間節點。
- 自動更新狀態與時間，每分鐘刷新一次，保證資訊即時性。
- 模態框功能顯示未來兩天內的晝夜變化，讓玩家提前規劃活動時間。
- 直觀的色彩標示：
  - **綠色**：當前進行中的狀態（白晝或夜晚）。
  - **橘色**：下一次即將開始的狀態。
  - **粉紅色**：已經結束的狀態。
  - **灰色**：尚未開始的狀態。

## 使用技術

- **HTML**：搭建網站結構，設計卡片與模態框的元素。
- **CSS**：優化視覺效果，包括卡片樣式、狀態標示及顏色區分。
- **JavaScript**：負責晝夜計算邏輯，動態更新顯示的晝夜狀態及剩餘時間。
- **Day.js**：處理時間與時區相關的計算，確保跨時區的準確性。
- **Bootstrap 5**：提供排版與模態框的功能，增強網站的易用性。
- **Vue.js 3**：用於開發互動式前端，實現了語言切換與主題切換功能。
- **Vue I18n**：實現多語言支持，提供簡便的語言切換功能。
- **Vite**：作為構建工具，提供快速的開發與構建體驗。

## 資料來源

網站的計算邏輯基於 **[Warframe Fandom (World State)](https://warframe.fandom.com/wiki/World_State)** 所提供的數據，並整合到專屬的 `world_cycles.json` 資料檔案中，用於記錄各地區的晝夜長度和循環起始時間。

### `world_cycles.json` 範例

```json
{
  "worlds": {
    "earth": {
      "name_zh-TW": "地球森林",
      "name_en-US": "Earth Forest",
      "startTime": "2024-12-01T00:00:00Z", // 此時間為範例請勿使用
      "loopTime": 28800,
      "dayTime": 14400,
      "nightTime": 14400,
      "dayStatusName_zh-TW": "白晝",
      "dayStatusName_en-US": "Day",
      "nightStatusName_zh-TW": "夜晚",
      "nightStatusName_en-US": "Night",
      "dayIcon": "☀️",
      "nightIcon": "🌙"
    }
  }
}
```

- **name_zh-TW**: 地點的中文名稱。
- **name_en-US**: 地點的英文名稱。
- **startTime**: 每個地區的開始時間（時區請用UTC，請勿使用本地時區）。
- **loopTime**: 總循環時間（以秒為單位）。
- **dayTime**: 白晝持續時間（以秒為單位）。
- **nightTime**: 夜晚持續時間（以秒為單位）。
- **dayStatusName_zh-TW** 和 **nightStatusName_zh-TW**: 白天與夜晚的狀態名稱（中文）。
- **dayStatusName_en-US** 和 **nightStatusName_en-US**: 白天與夜晚的狀態名稱（英文）。
- **dayIcon** 和 **nightIcon**: 白天和夜晚的對應圖標。

## 安裝與使用

### 安裝依賴

```bash
yarn install
```

### 開發模式

```bash
yarn dev
```

這會啟動開發伺服器，並讓你在瀏覽器中預覽網站。

### 構建網站

```bash
yarn build
```

命令會 Build 並生成生產版本的網站，將輸出到 `./dist` 目錄。

## 版本更新

此專案曾經是純 HTML、CSS 和 JavaScript 版本，並且已經更新為基於 Vue 3 的版本，提供更多的交互功能，例如語言切換、主題切換等。舊版的純 HTML、CSS、JS 版本仍然保留在 `old-version` 資料夾中，方便需要的開發者參考。