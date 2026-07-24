/* ============================================================
   即時預覽面板：讓編輯食譜時右側預覽長得像正式食譜頁面

   資料正規化邏輯（normalizeRecipe）跟前台 recipe-single.njk
   共用同一份 src/assets/js/recipe-view-model.js。
   這裡只負責：(1) 把 Decap 的 Immutable 資料轉成原生物件，
   (2) 用 React h() 堆渲染邏輯——這兩件事無法跟 njk 共用。
   ============================================================ */
import { normalizeRecipe } from "../assets/js/recipe-view-model.js";

// Decap 的 entry.get("data") 是 Immutable 結構；.toJS() 遞迴轉成原生物件。
// 編輯中的欄位（尤其是 relation widget）有時已經是原生 Array，.toJS()
// 對非 Immutable 值會原樣通過，兩種情況都安全。
function toPlainData(data) {
  return typeof data.toJS === "function" ? data.toJS() : data;
}

// 食材／調味料共用同一種「品名—引導線—份量」列渲染邏輯
function renderIngredientRow(item, i) {
  return h(
    "li",
    { className: "ingredient-item", key: i },
    h("span", { className: "ingredient-name" }, item && item.name),
    h("span", { className: "ingredient-leader" }),
    h("span", { className: "ingredient-amount" }, item && item.amount)
  );
}

var RecipePreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var getAsset = this.props.getAsset;
    var recipe = normalizeRecipe(toPlainData(entry.get("data")));

    var metaItems = [];
    if (recipe.servings) {
      metaItems.push(
        h("div", { className: "recipe-meta-item", key: "servings" }, recipe.servings + " 人份")
      );
    }
    if (recipe.equipment.length > 0) {
      metaItems.push(
        h(
          "div",
          { className: "recipe-meta-item", key: "equipment" },
          recipe.equipment.join("・")
        )
      );
    }

    var photoEls =
      recipe.photos.length > 0
        ? h(
            "div",
            { className: "recipe-photos preview-photos-row" },
            recipe.photos.map(function (src, i) {
              var url = src && getAsset ? getAsset(src) : null;
              return url
                ? h("img", {
                    key: i,
                    src: url.toString(),
                    alt: recipe.title,
                    className: "photo-img preview-photo-thumb",
                  })
                : null;
            })
          )
        : null;

    var seasoningSection =
      recipe.seasonings.length > 0
        ? h(
            "section",
            { className: "recipe-section" },
            h("h2", { className: "section-title" }, "調味料"),
            h("ul", { className: "ingredient-list" }, recipe.seasonings.map(renderIngredientRow))
          )
        : h(
            "section",
            { className: "recipe-section" },
            h("h2", { className: "section-title" }, "調味料"),
            h("p", { className: "empty-note" }, "無需額外調味料")
          );

    var stepItems = recipe.steps.map(function (step, i) {
      return h(
        "li",
        { className: "step-item", key: i },
        h("span", { className: "step-num" }, i + 1),
        h("p", { className: "step-text" }, step)
      );
    });

    return h(
      "article",
      { className: "recipe-page" },
      h(
        "div",
        { className: "container" },
        h(
          "header",
          { className: "recipe-header" },
          h(
            "h1",
            { className: "recipe-title" },
            recipe.title,
            h(
              "svg",
              { className: "recipe-title-stroke", viewBox: "0 0 160 14", preserveAspectRatio: "none" },
              h("path", {
                d: "M2 8.5C24 3 46 11 68 6.5S112 2 138 7.5c6 1.2 12 2 20 1",
                fill: "none",
                stroke: "var(--color-primary)",
                strokeWidth: 3,
                strokeLinecap: "round",
              })
            )
          ),
          h(
            "div",
            { className: "recipe-header-tags" },
            recipe.tags.map(function (tag, i) {
              return h("span", { className: "tag tag--lg", key: i }, tag);
            })
          )
        ),
        metaItems.length > 0
          ? h("div", { className: "recipe-meta" }, metaItems)
          : null,
        photoEls,
        h(
          "div",
          { className: "recipe-ingredients-grid" },
          h(
            "section",
            { className: "recipe-section" },
            h("h2", { className: "section-title" }, "食材"),
            h("ul", { className: "ingredient-list" }, recipe.ingredients.map(renderIngredientRow))
          ),
          seasoningSection
        ),
        h(
          "section",
          { className: "recipe-section" },
          h("h2", { className: "section-title" }, "步驟"),
          h("ol", { className: "steps-list" }, stepItems)
        ),
        recipe.notes
          ? h(
              "section",
              { className: "recipe-notes-section" },
              h("p", { className: "recipe-notes-label" }, "備註"),
              h("p", { className: "recipe-notes" }, recipe.notes)
            )
          : null
      )
    );
  },
});

CMS.registerPreviewStyle("https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.1.0/style.css");
CMS.registerPreviewStyle("../assets/css/style.css");
CMS.registerPreviewStyle("preview-styles.css");
CMS.registerPreviewTemplate("recipes", RecipePreview);

// "更新於" → "更新時間"。registerLocale 會整組取代該語系字串，
// 所以先取得內建的完整 zh_Hant 翻譯，只改這一個欄位再整組寫回去，
// 避免其他文字被英文預設值取代。
var zhHant = CMS.getLocale("zh_Hant");
if (zhHant && zhHant.collection && zhHant.collection.defaultFields && zhHant.collection.defaultFields.updatedOn) {
  zhHant.collection.defaultFields.updatedOn.label = "更新時間";
  CMS.registerLocale("zh_Hant", zhHant);
}
