# 高業學習系統

以歷屆題庫為核心的證券商高級業務員練習平台，採用「Study System 1993」像素風教學軟體介面。

## 功能

- 年份、隨機與科目練習
- 50 題、60 分鐘模擬考
- 即時判分與題目詳解
- 本機錯題本、收藏與學習統計
- 手機與桌面響應式版面

## 本機執行

```bash
cd frontend
npm ci
npm run dev
```

## 測試與建置

```bash
cd frontend
npm test
npm run build
```

`main` 分支會透過 GitHub Actions 自動部署至 GitHub Pages。
