# Warframe 世界循環時間計算網站

這是一個 **[Warframe 世界循環時間計算網站](https://meowxiaoxiang.github.io/Warframe-World-State-Timer/)**，專為 Warframe 玩家設計，提供即時準確的世界晝夜變化資訊。玩家可方便地查閱地球森林、夜靈平原、奧布山谷和魔裔禁地的當前狀態，以及下一次晝夜變換的預期時間，協助規劃遊戲內活動。

## 功能特色

-   顯示各地區當前的晝或夜狀態。
-   提供距離下一次晝夜變化的倒計時，幫助玩家掌握時間節點。
-   自動更新狀態與時間，每分鐘刷新一次，保證資訊即時性。
-   模態框功能顯示未來兩天內的晝夜變化，讓玩家提前規劃活動時間。
-   直觀的色彩標示：
    -   **綠色**：當前進行中的狀態（白晝或夜晚）。
    -   **橘色**：下一次即將開始的狀態。
    -   **粉紅色**：已經結束的狀態。
    -   **灰色**：尚未開始的狀態。

## 使用技術

-   **HTML**：搭建網站結構，設計卡片與模態框的元素。
-   **CSS**：優化視覺效果，包括卡片樣式、狀態標示及顏色區分。
-   **JavaScript**：負責晝夜計算邏輯，動態更新顯示的晝夜狀態及剩餘時間。
-   **Day.js**：處理時間與時區相關的計算，確保跨時區的準確性。
-   **Bootstrap 5**：提供排版與模態框的功能，增強網站的易用性。
-   **Vue.js 3**：用於開發互動式前端，實現了語言切換與主題切換功能。
-   **Vue I18n**：實現多語言支持，提供簡便的語言切換功能。
-   **Vite**：作為構建工具，提供快速的開發與構建體驗。

## 資料來源

本專案的計算邏輯基於以下三個主要資料來源：

1. **[Warframe Fandom (World State)](https://warframe.fandom.com/wiki/World_State)**

    - 提供了詳細的遊戲世界狀態數據與晝夜循環邏輯的解釋。
    - 過往主要依靠此資料作為硬編碼基礎。

2. **[Warframe Worldstate Parser (WFCD)](https://github.com/WFCD/warframe-worldstate-parser)**

    - 此開源套件解析 Warframe 官方動態世界狀態 API，透過標準化處理流程，幫助準確解析複雜的世界循環邏輯。

3. **[Warframe 官方動態世界狀態 API](https://content.warframe.com/dynamic/worldState.php)**
    - 提供遊戲內部即時世界狀態的 JSON 數據，如賞金、循環狀態等。

---

本專案使用上述資料來源，特別針對夜靈平原（Plains of Eidolon）和扎日曼號（Zariman Ten Zero）建立精準的起始時間（`startTime`）：

1. 首先進入 [Warframe 官方動態世界狀態 API](https://content.warframe.com/dynamic/worldState.php)（建議安裝 JSON 瀏覽器插件以方便查看資料）。
2. 在 JSON 資料中尋找 `SyndicateMissions` 項目。
3. 篩選 `Tag` 值為 `CetusSyndicate`（夜靈平原）或 `ZarimanSyndicate`（扎日曼號）的項目，取得對應的 `Expiry` 值。
4. 使用程式將該 `Expiry` 值轉換為 UTC 格式，作為 `startTime` 的硬編碼值。

以下為簡單的 Python 程式碼範例，用於將 `Expiry` 值轉換為 UTC 格式：

```python
from datetime import datetime, timezone

# 假設從 API 取得的 Expiry 時間為 UNIX 時間戳
expiry_timestamp_ms = 1733724920369  # 替換為實際 API 資料中的值
expiry_timestamp = expiry_timestamp_ms / 1000 # 由豪秒(ms)轉換成秒
utc_time = datetime.fromtimestamp(expiry_timestamp, tz=timezone.utc)

# 格式化為所需格式
formatted_time = utc_time.strftime('%Y-%m-%dT%H:%M:%SZ')
print(formatted_time)  # 輸出格式如 '2024-12-01T00:00:00Z'
```

最後，將生成的 `startTime` 值與其他資料整合到 `world_cycles.json` 中，作為專案內部循環邏輯的基礎。

### `world_cycles.json` 範例 (/public/data/world_cycles.json)

```json
{
	"worlds": {
		"earth": {
			"name_zh-TW": "地球森林",
			"name_en-US": "Earth Forest",
			"startTime": "2024-12-01T00:00:00Z", // 此時間為範例請勿使用
			"loopTime": 28800, // 總循環時間
			"dayTime": 14400, // 白晝持續時間
			"nightTime": 14400, // 夜晚持續時間
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

-   **name_zh-TW**: 地點的中文名稱。
-   **name_en-US**: 地點的英文名稱。
-   **startTime**: 每個地區的開始時間（時區請用 UTC，請勿使用本地時區）。
-   **loopTime**: 總循環時間（以秒為單位）。
-   **dayTime**: 白晝持續時間（以秒為單位）。
-   **nightTime**: 夜晚持續時間（以秒為單位）。
-   **dayStatusName_zh-TW** 和 **nightStatusName_zh-TW**: 白天與夜晚的狀態名稱（中文）。
-   **dayStatusName_en-US** 和 **nightStatusName_en-US**: 白天與夜晚的狀態名稱（英文）。
-   **dayIcon** 和 **nightIcon**: 白天和夜晚的對應圖標。

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