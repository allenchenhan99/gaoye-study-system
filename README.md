# 高業學習系統

[![Deploy frontend to GitHub Pages](https://github.com/allenchenhan99/gaoye-study-system/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/allenchenhan99/gaoye-study-system/actions/workflows/deploy-pages.yml) <a href="https://buymeacoffee.com/allenchenhan99"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" height="36" alt="Buy Me a Coffee"></a>

為證券商高級業務員測驗打造的歷屆試題練習平台。介面取材自 1990 年代日系教學軟體，以清楚的題目文件、方形操作鍵與個人化學習記錄，提供專注且快速的複習流程。

**[開啟線上版本](https://allenchenhan99.github.io/gaoye-study-system/)**

## 專案特色

- **多種練習模式**：依年份、隨機抽題或指定科目建立練習。
- **完整模擬考**：50 題、60 分鐘計時，交卷後統一顯示成績與解析。
- **即時學習回饋**：逐題判分、正確答案、詳解與送分題狀態。
- **Google 帳號登入**：未登入僅顯示專案介紹，登入後才可進入題庫與練習功能。
- **個人雲端進度**：跨裝置同步作答進度、錯題本、收藏、模擬考與科目統計。
- **本機進度承接**：首次登入會安全地將既有 `localStorage` 紀錄合併至個人帳號。
- **離線保護**：雲端暫時不可用時保留裝置快取與待同步操作，上線或重新開啟網站後自動重試。
- **響應式介面**：支援桌面、平板與手機版面。

## 使用流程

1. 使用 Google 帳號登入個人學習空間。
2. 從首頁選擇年份、隨機、科目練習或模擬考。
3. 作答後檢查正確答案與題目詳解。
4. 透過錯題本、收藏與統計頁追蹤學習成果。

## 技術架構

| 項目 | 技術 |
| --- | --- |
| 前端 | React 18、TypeScript |
| 路由 | React Router（HashRouter） |
| 樣式 | Tailwind CSS、專案自有 Study System 元件樣式 |
| Markdown | React Markdown |
| 身分驗證 | Supabase Auth、Google OAuth |
| 資料庫 | Supabase Postgres、Row Level Security |
| 測試 | Vitest、React Testing Library |
| 建置 | Vite |
| 部署 | GitHub Actions、GitHub Pages |
| 快取 | 使用者命名空間的 Browser localStorage |

```text
Google OAuth ──► Supabase Auth ──► 登入門檻
                                      │
public/data/*.json ──► 題庫／練習／詳解 │
                                      ▼
                            useCloudProgress
                              │          │
                              ▼          ▼
                       Supabase DB   Device Cache
                         + RLS       (per user)
```

## 本機開發

### 環境需求

- Node.js 20 或更新版本
- npm
- Docker（執行本機 Supabase 與資料庫整合測試時需要）
- 一個 Supabase 專案
- Google Cloud OAuth 2.0 Client

### 安裝與啟動

```bash
git clone https://github.com/allenchenhan99/gaoye-study-system.git
cd gaoye-study-system/frontend
npm ci
cp .env.example .env.development.local
npm run dev
```

Vite 啟動後會在終端顯示本機網址，預設通常為 `http://localhost:5173/`。

在 `frontend/.env.development.local` 填入 Supabase 專案的公開連線設定。使用 development-only env 可避免 Vitest 誤連到正式 Supabase：

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

`VITE_SUPABASE_PUBLISHABLE_KEY` 是前端可公開使用的 publishable key；請勿將 `service_role` key 或 OAuth client secret 放入前端環境變數。

### Supabase 與 Google OAuth

1. 建立 Supabase 專案，執行 `supabase/migrations/` 內的 migration。
2. 在 Google Cloud Console 建立 Web OAuth client。
3. 在 Google 的 Authorized JavaScript origins 加入 `http://localhost:5173` 與 `https://allenchenhan99.github.io`，並將 Supabase 顯示的 provider callback URL 加入 Authorized redirect URIs。
4. 在 Supabase Auth Providers 啟用 Google，填入 Google client ID 與 secret。
5. 在 Supabase URL Configuration 加入：
   - `http://localhost:5173/`
   - `https://allenchenhan99.github.io/gaoye-study-system/`

資料表均啟用 Row Level Security；前端只能透過登入 session 存取與 `auth.uid()` 相符的個人資料。

### 測試與正式建置

```bash
supabase db start
supabase test db supabase/tests/database/learning_progress_rls.test.sql

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
│   ├── src/hooks/        # 題庫、登入與雲端進度 hooks
│   ├── src/lib/          # 型別、抽題、計分與儲存邏輯
│   └── src/pages/        # 練習、模擬考、複習與統計頁面
├── scripts/              # 題庫處理與匯出工具
├── supabase/migrations/  # Postgres schema、RLS 與原子操作函式
└── tests/                # Python 資料管線測試
```

## 部署

每次 push 到 `main` 後，GitHub Actions 會依序執行：

1. 啟動本機 Supabase，實際執行 migration、RLS 隔離與冪等 RPC 測試。
2. 安裝鎖定版本的前端依賴並執行完整測試。
3. 驗證 Supabase 公開設定可連線且已啟用 Google 登入。
4. 以 repository base path 建立正式版本。
5. 將 `frontend/dist` 發布至 GitHub Pages。

只有資料庫 migration contract、前端測試、Supabase 公開環境變數與正式建置全部通過時，才會更新線上網站。

正式部署前，請在 GitHub repository 的 **Settings → Secrets and variables → Actions → Variables** 建立：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## 資料安全

- 每張個人學習資料表均啟用並強制執行 RLS。
- 作答、模擬考與清除進度透過具冪等識別碼的資料庫函式處理，避免網路重送造成重複紀錄。
- 首次本機匯入以裝置識別碼去重，同一帳號不會重複合併相同資料。
- 尚未送達雲端的操作會依使用者隔離並依序保留在裝置佇列，恢復連線後以相同識別碼重試。
- 登出會結束 Supabase session；瀏覽器僅保留依使用者 ID 隔離的最近進度快取。

## 題庫與免責聲明

本專案以考試複習與學習工具為目的。題目、答案與詳解可能因法規修訂、官方更正或資料整理而有所差異；應試時請以主管機關及正式考試公告為準。本網站並非主管機關或考試單位的官方服務。

若發現題目資料問題或有功能建議，歡迎透過 [GitHub Issues](https://github.com/allenchenhan99/gaoye-study-system/issues) 回報。
