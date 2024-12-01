# Warframe 世界循環時間計算網站

這是一個 **[Warframe 世界循環時間計算網站](https://meowxiaoxiang.github.io/Warframe-World-State-Timer/)**，專為 Warframe 玩家設計，旨在提供即時準確的世界晝夜變化資訊。玩家可方便地查閱地球森林、夜靈平原、奧布山谷和魔裔禁地的當前狀態，以及下一次晝夜變換的預期時間，協助規劃遊戲內活動。

## 功能特色

- 顯示各地區當前的晝或夜狀態，例如「白晝進行中」或「夜晚進行中」。
- 提供距離下一次晝夜變化的準確倒計時，幫助玩家掌握時間節點。
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

## 資料來源

網站的計算邏輯基於 **[Warframe Fandom](https://warframe.fandom.com/wiki/World_State)** 所提供的數據，並整合到專屬的 `world_cycles.json` 資料檔案中，用於記錄各地區的晝夜長度和循環起始時間。