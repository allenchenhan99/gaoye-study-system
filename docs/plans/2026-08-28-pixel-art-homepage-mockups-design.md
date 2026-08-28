# 高業考古題平台：Pixel-art 首頁概念稿設計

日期：2026-08-28  
狀態：已確認

## 目標

在不改動既有 React 功能、路由與題庫資料的前提下，製作六套可直接於瀏覽器檢視的靜態首頁概念稿。六套方案使用相同內容，但採用明顯不同的 pixel-art 視覺語言與資訊排列，讓使用者能以桌機與手機尺寸比較後，再選定正式全站方向。

## 交付形式

- 位置：`frontend/mockups/`
- 一個概念展間首頁，列出六套方案並提供入口。
- 每套方案為獨立 HTML/CSS 視覺稿，避免樣式互相污染。
- 每套皆以響應式 CSS 支援桌機與手機，不串接 React、localStorage 或正式題庫。
- 使用一致的真實產品資訊與代表性統計數字，以便公平比較。
- 所有操作元件僅呈現 hover、focus 與 pressed 等視覺狀態；不實作正式測驗流程。

## 共通內容

六套首頁均包含：

1. 「證券商高級業務員」產品識別。
2. 題庫總量、已作答、正確率與錯題數。
3. 年份練習、隨機練習、科目練習與模擬考入口。
4. 錯題本、收藏與統計入口。
5. 一個能代表該方案視覺個性的 signature element。

長篇繁體中文使用清楚的系統黑體；像素字體只用於英文、數字、短標籤與顯示型標題。避免用難以閱讀的低解析中文字模擬像素效果。

## 六套方案

### 1. 股市掌機 / Market Pocket

- 色票：LCD Ink `#18332B`、LCD Mid `#4F715D`、LCD Light `#A8C38E`、Shell `#D8D1B8`、Key `#5A5350`。
- 版面：中央掌機機身；主畫面為單欄模式選單，統計像 HUD，底部以實體 A/B/方向鍵暗示操作。
- Signature：以 CSS 與 crisp-edge SVG 組成的掌機外殼及低解析度 K 線開機動畫。
- 手機：機殼貼齊畫面，保留螢幕與實體按鍵層級。

### 2. 券商終端機 / Broker Terminal 88

- 色票：Terminal Black `#090D0C`、Phosphor Amber `#FFB000`、Quote Green `#44FF88`、Alert Red `#FF4D4D`、Grid `#23332D`。
- 版面：行情跑馬燈＋左側功能碼＋中央任務清單＋右側績效表，資訊密度最高。
- Signature：首頁導覽採券商終端機功能鍵語法，例如 `F1 年份練習`、`F4 模擬考`。
- 手機：折疊為上下區塊，功能碼保留為兩欄鍵盤。

### 3. 16-bit 應試 RPG / License Quest

- 色票：Night Navy `#18223C`、Forest `#2F6B4F`、Quest Gold `#F2C14E`、Potion Red `#D95763`、Cloud `#E8E3D4`。
- 版面：左側考生角色狀態，右側任務告示板；三科是三個區域，模擬考是主線任務。
- Signature：像素角色與「證照攻略進度」狀態欄，答題數轉譯為 EXP。
- 手機：角色狀態壓成頂部 HUD，任務卡改為縱向清單。

### 4. 補習班街機 / Cram School Arcade

- 色票：Cabinet Navy `#111A3A`、Arcade Red `#ED3F4F`、Token Yellow `#FFD447`、Electric Blue `#37A8FF`、Screen White `#F3F1E7`。
- 版面：大型 `SELECT MODE` 標題，模式入口像街機選角；統計以排行榜排列。
- Signature：目前選中模式有像素箭頭與投幣提示 `PRESS START`，但不使用無目的閃爍。
- 手機：模式卡變為可掃讀的兩欄選角格。

### 5. 日系教學軟體 / Study System 1993

- 色票：Machine Gray `#D8D7D1`、Charcoal `#24262B`、Instruction Red `#C93636`、CRT Blue `#315C8C`、Paper White `#F4F2E9`。
- 版面：左側章節索引、右側內容面板，像 90 年代電腦教學軟體與操作手冊的混合。
- Signature：以視窗標題列、頁碼、磁碟狀態與鍵盤捷徑建立年代感。
- 手機：索引轉成頂部頁籤，主要內容維持單欄文件感。

### 6. 電子讀書寵物 / Study Pet

- 色票：Berry `#A84968`、Mint `#7AC7A4`、Custard `#F6D67A`、Plum `#4A3457`、Milk `#FFF8DE`。
- 版面：中央像素寵物與今日任務，周圍是連續作答、正確率與三科成長狀態。
- Signature：學習進度直接改變寵物狀態與房間道具，讓統計不只是一排數字卡。
- 手機：寵物舞台優先，任務與模式入口置於下方兩欄。

## 響應式與可讀性

- 桌機基準：1440 × 1000；手機基準：390 × 844。
- 不允許水平溢出或以縮小整張桌機稿代替手機排版。
- 主要中文文字至少 16px，輔助標籤至少 12px。
- 高對比 focus 樣式；不以顏色作為唯一狀態提示。
- 動畫尊重 `prefers-reduced-motion`；每套最多一個主要動態焦點。
- 像素邊界以整數尺寸、硬陰影與 `image-rendering: pixelated` 表現，不使用柔和玻璃效果、模糊背景或大面積漸層。

## 檔案結構

```text
frontend/mockups/
  index.html
  shared.css
  assets/
    pixel-icons.svg
  market-pocket/
    index.html
    style.css
  broker-terminal/
    index.html
    style.css
  license-quest/
    index.html
    style.css
  cram-arcade/
    index.html
    style.css
  study-system/
    index.html
    style.css
  study-pet/
    index.html
    style.css
```

## 驗證

1. 透過現有 Vite dev server 開啟概念展間及六個頁面。
2. 分別以 1440 × 1000 與 390 × 844 擷取畫面。
3. 檢查文字換行、內容遮擋、水平溢出、對比與焦點狀態。
4. 確認 mockup 沒有修改既有 `src/` 行為，也不影響正式 `npm test` 與 `npm run build`。

## 不在本次範圍

- 將任一設計套用到正式 React 頁面。
- 重畫測驗、詳解、統計等內頁。
- 新增後端、題庫功能或學習狀態邏輯。
- 決定最終品牌方向；本輪只提供可比較的視覺選項。
