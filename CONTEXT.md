# CONTEXT.md — 個人食譜記錄網站 領域詞彙

記錄這個專案裡有特定意義的詞彙，避免同一個概念在不同地方被用不同名字稱呼。跟 [CLAUDE.md](CLAUDE.md)（開發規則）跟需求說明書（功能規格）是互補關係，這份文件只管「名詞怎麼稱呼」。

## Recipe view-model

`src/assets/js/recipe-view-model.js` 匯出的 `normalizeRecipe(raw)` / `toListSummary(recipe, meta)` 兩個函式，是全站唯一定義「一篇食譜長什麼樣」的 deep module（module／深模組等詞彙見 `/codebase-design`）。

- **`normalizeRecipe(raw)`**：吃一個原生 JS 物件（gray-matter 解析出來的 frontmatter 形狀），產出完整正規化後的食譜——`ingredients`/`seasonings` 統一是 `{name, amount}[]`，`steps` 刻意維持 `string[]`（跟前兩者形狀不對稱，是 `admin/config.yml` 裡 widget 設計本來的樣子，不是遺漏）。
- **`toListSummary(recipe, meta)`**：從 `normalizeRecipe` 的輸出推導出食譜列表卡片用的精簡版，刻意只留第一張照片當縮圖，並補上含 pathPrefix 的完整 `url`。

**兩個 adapter 消費同一個 seam：**
- Node／Eleventy build 端：`src/_data/recipes.js`（列表摘要）與 `recipes/recipes.11tydata.js` 的 `eleventyComputed`（單篇食譜完整資料，樣板裡透過 `recipe.*` 存取）
- 瀏覽器／Decap CMS 端：`admin/preview-templates.js`，先用 `toPlainData()` 把 Decap 的 Immutable 資料轉成原生物件，再呼叫同一個 `normalizeRecipe()`

兩邊都是純 ES module `import`，不透過 bundler。渲染邏輯（Nunjucks 樣板 vs. React `h()` 呼叫）不共用，只有「資料怎麼從 raw frontmatter 變成正規化形狀」這件事收斂成一處。

## PathPrefix

網站部署在 GitHub Pages 的 `/recipe-net/` 子路徑下。前台範本用 Eleventy 內建的 `| url` filter 套用；`recipe-view-model.js` 產生的 `url`／`photo` 欄位、`admin/config.yml` 的 `public_folder` 則是各自手動把這段前綴烘進值裡——因為 Decap CMS 跟 recipe-view-model.js 都在 Eleventy 的 build pipeline 之外，套不到 `url` filter。**凡是已經含 pathPrefix 的欄位（`recipe.url`、`recipe.photo`／`recipe.photos`），樣板裡不可再套用 `| url` 過濾器**，否則會重複疊加前綴。
