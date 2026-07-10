# 個人食譜記錄網站

個人食譜記錄網站，使用 Eleventy (11ty) 靜態網站產生器 + Decap CMS 管理後台，部署於 GitHub Pages。

## 本地開發

```bash
npm install
npm run dev
```

開啟 `http://localhost:8080`

## 部署流程

push 至 `main` 分支後，GitHub Actions 自動建置並部署至 GitHub Pages。

## 設定步驟（首次部署）

### 1. 填寫 GitHub Repo 資訊

編輯 [`admin/config.yml`](admin/config.yml)，將以下 placeholder 替換為實際值：

```yaml
backend:
  repo: YOUR_GITHUB_USERNAME/YOUR_REPO_NAME  # 例：john/recipe-site
  base_url: YOUR_CLOUDFLARE_WORKER_URL       # 例：https://my-oauth.my-name.workers.dev
```

### 2. 設定 GitHub Pages

1. 進入 GitHub Repo → Settings → Pages
2. Source 選擇 **GitHub Actions**

### 3. 設定 Cloudflare Workers OAuth Proxy

Decap CMS 需要一個 OAuth 代理服務來處理 GitHub 登入。

1. 前往 [Cloudflare Workers](https://workers.cloudflare.com/)
2. 參考 [decap-cms-github-oauth-provider](https://github.com/vencax/netlify-cms-github-oauth-provider) 或使用現成 Worker template
3. 在 Cloudflare Workers 環境變數中設定：
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
4. 將 Worker URL 填入 `admin/config.yml` 的 `base_url`

### 4. 設定 GitHub OAuth App

1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Homepage URL：你的 GitHub Pages URL（例：`https://username.github.io/recipe-site`）
3. Authorization callback URL：`https://YOUR_CLOUDFLARE_WORKER_URL/callback`
4. 取得 Client ID 與 Client Secret，填入 Cloudflare Workers 環境變數

## 新增食譜

方式一（推薦）：開啟網站的 `/admin/` 路徑，透過 Decap CMS 表單填寫。

方式二：直接在 `recipes/` 目錄新增 Markdown 檔案，格式參考現有範例。

## 目錄結構

```
├── admin/           # Decap CMS 設定
├── recipes/         # 食譜 Markdown 原始檔
├── uploads/         # 食譜照片（2MB 以下）
├── src/
│   ├── _includes/   # Eleventy 版型
│   ├── _data/       # 建置時期資料
│   └── assets/      # CSS / JS
├── .github/
│   └── workflows/   # GitHub Actions CI/CD
└── .eleventy.js
```
