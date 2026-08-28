# 高業學習系統：Concept 5 正式全站改版設計

日期：2026-08-28  
狀態：已確認

## 目標

把選定的 Concept 5「日系教學軟體 / Study System 1993」視覺語言套用到正式 React 前端全站，同時保留既有題庫載入、抽題、作答、判分、詳解、錯題本、收藏、統計、計時與 localStorage 行為。

改版要移除目前容易顯得 AI 模板化的羊皮紙背景、襯線大標、圓角膠囊、柔和漸層與漂浮卡片，改用九〇年代日系教學軟體的視窗結構、方形控制元件、硬陰影、頁碼、功能鍵與文件式資訊階層。

## 導入策略

採用「應用程式外框＋專屬頁面布局」：

- 全站共享應用程式 title bar、menu bar 與 status bar。
- 首頁使用 Concept 5 的左右雙欄首頁布局。
- 練習設定、逐題練習、模擬考、錯題本與統計依各自任務採用適合的內容視窗，不強迫每頁都複製首頁雙欄。
- 手機版將左側章節索引轉為頂部頁籤或內容工具列，維持單欄閱讀與至少 44px 的主要操作區。
- 不新增 UI framework、狀態管理或正式產品功能。

## 視覺系統

### 色票

- Machine Gray：`#D8D7D1`，應用程式機殼與次要表面。
- Charcoal：`#24262B`，主要文字、外框與硬陰影。
- Instruction Red：`#C93636`，警示、快捷提示與關鍵操作。
- CRT Blue：`#315C8C`，title bar、選取狀態與主要導覽。
- Paper White：`#F4F2E9`，文件與題目閱讀表面。
- Correct Green：`#2F7755`，正確答案。
- Warning Amber：`#A66A16`，待複核與倒數提醒。

不使用玻璃模糊、大面積漸層、圓形膠囊按鈕或柔和浮動陰影。主要邊界為 2–4px 實線，陰影以 4–8px 無模糊位移表現。

### 字體

- 繁體中文本文：`PingFang TC`、`Noto Sans TC`、`Microsoft JhengHei`、system sans-serif。
- 英文、數字、功能鍵與頁碼：Menlo / Monaco / Consolas / monospace。
- 不再使用 `Noto Serif TC` 作為標題；標題個性由高字重、緊字距、結構與頁碼建立。

### 動態

- 控制元件只使用 80–120ms 的 step-like 位移與硬陰影變化。
- 正確／錯誤保留短暫 pop 或 shake，但改成像素式 steps timing。
- Loading 使用磁碟讀取方塊，不使用呼吸光暈。
- 全部尊重 `prefers-reduced-motion`。

## 共用應用程式外框

`App` 在題庫載入完成後渲染：

1. `SystemTitleBar`：視窗控制圖示、產品名稱、`LOCAL DATA READY`。
2. `SystemMenuBar`：首頁、學習、紀錄與說明的語意導覽；不偽裝成可用但無作用的選單。
3. Route content：依頁面套用內容寬度與工作區布局。
4. `SystemStatusBar`：資料庫題數、localStorage 狀態與目前頁面提示。

Loading 與資料錯誤沿用相同視覺語言。現有 `useQuestionBank` 沒有公開錯誤 UI 狀態，本次不擴張資料 hook；只重畫目前可觸及的 loading 與空題庫狀態。

## 頁面設計

### 首頁

- 桌機：左側 `ChapterIndex`，右側 `LessonWorkspace`。
- 左側包含產品識別、開始學習、錯題本、收藏、統計與題庫總量。
- 右側包含學習進度、年份／隨機／科目／模擬考四個 lesson row，以及三科成績。
- 真實資料取代 mockup 數字；零進度時區塊進度顯示空白而非假資料。
- 清除進度置於 status/actions 區，不再用頁尾小字連結。

### 練習設定

- 使用 `SETUP / PAGE 02` 工作視窗。
- 年份、次別、科目以方形 toggle keys 呈現，選取為 CRT Blue。
- 條件結果與本輪題數放在表格式 summary row。
- 「開始練習」為 Instruction Red 的主要操作鍵。

### 逐題練習與題目卡

- 頁首顯示 session title、題數與 block progress。
- 題目卡是文件視窗，不使用 rounded card。
- 科目、年份、次別與題號置於文件 metadata header。
- A–D 選項採固定字母欄＋文字欄；hover、picked、correct、wrong、muted 皆有不同邊框、底色與文字提示。
- 收藏為右上角 `F8` 工具鍵。
- 作答後 verdict 與詳解作為同一文件的下方 response section。

### 詳解

- 標題為 `ANSWER REFERENCE / 詳解資料`。
- Markdown 保持寬鬆行高與可辨識的段落、清單、引用與 code 樣式。
- 待複核顯示琥珀色系統訊息列。
- 無詳解顯示 `DATA PENDING` 狀態，不使用柔和 pulse dot。

### 模擬考

- 頂部固定工具列包含返回、已答題數、計時與交卷。
- Timer 使用數位狀態框；最後 60 秒變成紅色警示，不改邏輯。
- 交卷後成績使用 result window 與表格式分數，不使用漸層金線。

### 錯題本與收藏

- 非空狀態沿用逐題練習視窗。
- 空狀態是系統對話框，清楚指出如何新增內容。
- 工具列顯示目前紀錄類型與題數。

### 統計

- 整體正確率改為大型數字＋十格 block meter，不再使用圓形 SVG ring。
- 錯題本與收藏用 compact record cells。
- 各科以表格列與直條進度顯示。

## 元件與樣式策略

- 保留 Tailwind 編譯流程，但把正式設計 token 寫入 `tailwind.config.js`。
- 在 `src/index.css` 建立語意元件類別：`system-window`、`system-panel`、`system-button`、`system-button-primary`、`system-tab`、`system-label`、`block-meter`、`status-cell`。
- React 元件仍可組合 Tailwind utilities，但共用互動狀態集中在語意 class，避免每頁重複長 class string。
- 新增少量純展示共用元件，例如 `SystemShell`、`BlockMeter`；不抽象出只有單一使用者的薄包裝元件。

## 資料與行為

- 路由表不變。
- `useQuestionBank`、`useLocalProgress`、`sampling`、`scoring` 與 store schema 不變。
- 作答即時／延後判定、送分題、錯題自動收錄、收藏、模擬考計時與清除進度行為不變。
- 視覺元件只接收既有 props 或可由既有資料推導的 display values。

## 響應式與無障礙

- 桌機基準：1440 × 1000；內容最大寬度約 1220px。
- 手機基準：390 × 844；取消外層機殼留白，工作區全寬。
- 主要操作區至少 44px；不允許水平溢出。
- `:focus-visible` 使用 3–4px Instruction Red 或高對比替代色。
- 選項狀態不只依賴顏色，同時保留字母、符號與 verdict 文字。
- 保持語意 heading、nav、article、table 與 `aria-pressed`。

## 測試與驗收

1. 更新元件測試，確認正式 class 與可存取狀態，不以完整 className 快照鎖死版面。
2. 既有 scoring、sampling、store 與流程測試全部保持通過。
3. 增加 `SystemShell`、block progress、題目狀態與首頁真實數據的重點測試。
4. `npm test` 與 `npm run build` 成功。
5. 逐頁檢查桌機與手機：首頁、三種練習設定、逐題作答前後、模擬考、空／非空錯題本、收藏、統計、loading。
6. 正式 `/` 不再出現舊設計的圓角膠囊、襯線標題、柔和漸層與漂浮卡片。

## 不在本次範圍

- 修改題庫、詳解資料或判分規則。
- 新增帳號、後端同步、音效或快捷鍵實際操作。
- 將其他五套 mockup 混入正式主題。
- 刪除 `frontend/mockups/`；它們保留作為設計比較紀錄。
