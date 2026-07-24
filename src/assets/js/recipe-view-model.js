/**
 * Recipe view-model —— 全站唯一定義「一篇食譜長什麼樣」的地方。
 *
 * normalizeRecipe() 只接受原生 JS 物件（gray-matter 解析出來的形狀）。
 * Decap 預覽（admin/preview-templates.js）拿到的是 Immutable 風格的資料，
 * 呼叫端要自行先轉成這個形狀，這個模組不處理 Decap 特有的資料型別。
 *
 * Node（Eleventy build）與瀏覽器（Decap 預覽）都直接 import 這個檔案，
 * 純 ES module，不需要 bundler。
 */

// 必須跟 .eleventy.js 的 pathPrefix 設定一致
const PATH_PREFIX = "/recipe-net/";

/**
 * @param {Record<string, any>} raw frontmatter 原始物件
 * @returns {{
 *   title: string,
 *   tags: string[],
 *   equipment: string[],
 *   servings: number,
 *   ingredients: {name: string, amount: string}[],
 *   seasonings: {name: string, amount: string}[],
 *   steps: string[],
 *   photos: string[],
 *   notes: string,
 * }}
 */
export function normalizeRecipe(raw) {
  return {
    title: raw.title ?? "",
    tags: raw.tags ?? [],
    equipment: raw.equipment ?? [],
    servings: raw.servings ?? null,
    ingredients: (raw.ingredients ?? []).map(normalizeIngredient),
    seasonings: (raw.seasonings ?? []).map(normalizeIngredient),
    // steps 刻意維持字串陣列，跟 ingredients/seasonings 的物件形狀不對稱——
    // 這是 admin/config.yml 裡 steps widget 本來的儲存格式，不做資料遷移
    steps: (raw.steps ?? []).map((s) => (typeof s === "string" ? s : s?.step ?? "")),
    photos: (raw.photos ?? []).filter(Boolean),
    notes: raw.notes ?? "",
  };
}

function normalizeIngredient(item) {
  if (typeof item === "string") return { name: item, amount: "" };
  return { name: item?.name ?? "", amount: item?.amount ?? "" };
}

/**
 * 食譜卡片列表用的精簡摘要，從 normalizeRecipe() 的輸出推導。
 * 刻意只留第一張照片當縮圖——這裡是唯一做這個決定的地方。
 *
 * @param {ReturnType<typeof normalizeRecipe>} recipe
 * @param {{slug: string}} meta
 */
export function toListSummary(recipe, meta) {
  return {
    title: recipe.title,
    tags: recipe.tags,
    equipment: recipe.equipment,
    ingredients: recipe.ingredients.map((i) => i.name),
    seasonings: recipe.seasonings.map((s) => s.name),
    photo: recipe.photos[0] ?? null,
    url: `${PATH_PREFIX}recipes/${meta.slug}/`,
    slug: meta.slug,
  };
}
