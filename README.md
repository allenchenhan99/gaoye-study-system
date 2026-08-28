# 高業學習系統

[![Deploy frontend to GitHub Pages](https://github.com/allenchenhan99/gaoye-study-system/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/allenchenhan99/gaoye-study-system/actions/workflows/deploy-pages.yml) <a href="https://buymeacoffee.com/allenchenhan99"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" height="36" alt="Buy Me a Coffee"></a>

為證券商高級業務員測驗打造的歷屆試題練習平台。介面取材自 1990 年代日系教學軟體，以清楚的題目文件、方形操作鍵與本機學習記錄，提供專注且快速的複習流程。

**[開啟線上版本](https://allenchenhan99.github.io/gaoye-study-system/)**

## 專案特色

- **多種練習模式**：依年份、隨機抽題或指定科目建立練習。
- **完整模擬考**：50 題、60 分鐘計時，交卷後統一顯示成績與解析。
- **即時學習回饋**：逐題判分、正確答案、詳解與送分題狀態。
- **個人複習工具**：自動收錄錯題、手動收藏題目、統計各科正確率。
- **本機優先**：目前所有進度儲存在瀏覽器 `localStorage`，不需註冊即可使用。
- **響應式介面**：支援桌面、平板與手機版面。

## 使用流程

1. 從首頁選擇年份、隨機、科目練習或模擬考。
2. 作答後檢查正確答案與題目詳解。
3. 透過錯題本與收藏集中複習。
4. 在統計頁追蹤累積題數及各科正確率。

## 技術架構

| 項目 | 技術 |
| --- | --- |
| 前端 | React 18、TypeScript |
| 路由 | React Router（HashRouter） |
| 樣式 | Tailwind CSS、專案自有 Study System 元件樣式 |
| Markdown | React Markdown |
| 測試 | Vitest、React Testing Library |
| 建置 | Vite |
| 部署 | GitHub Actions、GitHub Pages |
| 目前資料儲存 | Browser localStorage |

```text
public/data/*.json
        │
        ▼
useQuestionBank ──► 練習／模擬考／詳解
                          │
                          ▼
                  useLocalProgress
                          │
                          ▼
                     localStorage
```

## 本機開發

### 環境需求

- Node.js 20 或更新版本
- npm

### 安裝與啟動

```bash
git clone https://github.com/allenchenhan99/gaoye-study-system.git
cd gaoye-study-system/frontend
npm ci
npm run dev
```

Vite 啟動後會在終端顯示本機網址，預設通常為 `http://localhost:5173/`。

### 測試與正式建置

```bash
cd frontend
npm test
npm run build
```

## 專案結構

```text
gaoye-study-system/
├── data/                 # 題目答案與詳解來源資料
├── frontend/
│   ├── public/data/      # 網站實際載入的題庫資料
│   ├── src/components/   # 共用介面元件
│   ├── src/hooks/        # 題庫與本機進度 hooks
│   ├── src/lib/          # 型別、抽題、計分與儲存邏輯
│   └── src/pages/        # 練習、模擬考、複習與統計頁面
├── scripts/              # 題庫處理與匯出工具
└── tests/                # Python 資料管線測試
```

## 部署

每次 push 到 `main` 後，GitHub Actions 會依序執行：

1. 安裝鎖定版本的前端依賴。
2. 執行完整前端測試。
3. 以 repository base path 建立正式版本。
4. 將 `frontend/dist` 發布至 GitHub Pages。

只有測試與建置成功時才會更新線上網站。

## Roadmap

- [ ] Google 登入
- [ ] 個人學習進度雲端同步
- [ ] 匿名本機進度登入後遷移
- [ ] 跨裝置錯題本、收藏與統計
- [ ] 模擬考歷史記錄

## 題庫與免責聲明

本專案以考試複習與學習工具為目的。題目、答案與詳解可能因法規修訂、官方更正或資料整理而有所差異；應試時請以主管機關及正式考試公告為準。本網站並非主管機關或考試單位的官方服務。

若發現題目資料問題或有功能建議，歡迎透過 [GitHub Issues](https://github.com/allenchenhan99/gaoye-study-system/issues) 回報。
