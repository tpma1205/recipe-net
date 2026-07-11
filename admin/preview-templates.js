/* ============================================================
   即時預覽面板：讓編輯食譜時右側預覽長得像正式食譜頁面
   ============================================================ */
(function () {
  // 不同 widget（list / relation）在編輯中回傳的即時資料型別不一致
  // （Immutable List 或原生 Array），統一轉成原生 Array 再處理
  function toArr(v) {
    if (!v) return [];
    if (typeof v.toJS === "function") return v.toJS();
    if (Array.isArray(v)) return v;
    return [];
  }

  var RecipePreview = createClass({
    render: function () {
      var entry = this.props.entry;
      var getAsset = this.props.getAsset;
      var data = entry.get("data");

      var title = data.get("title") || "";
      var tags = toArr(data.get("tags"));
      var equipment = toArr(data.get("equipment"));
      var servings = data.get("servings");
      var ingredients = toArr(data.get("ingredients"));
      var seasonings = toArr(data.get("seasonings"));
      var steps = toArr(data.get("steps"));
      var photos = toArr(data.get("photos"));
      var notes = data.get("notes") || "";

      var metaItems = [];
      if (servings) {
        metaItems.push(
          h("div", { className: "recipe-meta-item", key: "servings" }, servings + " 人份")
        );
      }
      if (equipment.length > 0) {
        metaItems.push(
          h(
            "div",
            { className: "recipe-meta-item", key: "equipment" },
            equipment.join("・")
          )
        );
      }

      var photoEls =
        photos.length > 0
          ? h(
              "div",
              { className: "recipe-photos", style: { display: "flex", gap: "8px" } },
              photos.map(function (p, i) {
                var src = typeof p === "string" ? p : p && p.photo;
                var url = src && getAsset ? getAsset(src) : null;
                return url
                  ? h("img", {
                      key: i,
                      src: url.toString(),
                      alt: title,
                      className: "photo-img",
                      style: { width: "160px", height: "160px", objectFit: "cover", borderRadius: "12px" },
                    })
                  : null;
              })
            )
          : null;

      var ingredientItems = ingredients.map(function (item, i) {
        return h(
          "li",
          { className: "ingredient-item", key: i },
          h("span", { className: "ingredient-name" }, item && item.name),
          h("span", { className: "ingredient-amount" }, item && item.amount)
        );
      });

      var seasoningSection =
        seasonings.length > 0
          ? h(
              "section",
              { className: "recipe-section" },
              h("h2", { className: "section-title" }, "調味料"),
              h(
                "ul",
                { className: "ingredient-list" },
                seasonings.map(function (item, i) {
                  return h(
                    "li",
                    { className: "ingredient-item", key: i },
                    h("span", { className: "ingredient-name" }, item && item.name),
                    h("span", { className: "ingredient-amount" }, item && item.amount)
                  );
                })
              )
            )
          : h(
              "section",
              { className: "recipe-section" },
              h("h2", { className: "section-title" }, "調味料"),
              h("p", { className: "empty-note" }, "無需額外調味料")
            );

      var stepItems = steps.map(function (step, i) {
        var text = typeof step === "string" ? step : step && step.step;
        return h(
          "li",
          { className: "step-item", key: i },
          h("span", { className: "step-num" }, i + 1),
          h("p", { className: "step-text" }, text)
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
            h("h1", { className: "recipe-title" }, title),
            h(
              "div",
              { className: "recipe-header-tags" },
              tags.map(function (tag, i) {
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
              h("ul", { className: "ingredient-list" }, ingredientItems)
            ),
            seasoningSection
          ),
          h(
            "section",
            { className: "recipe-section" },
            h("h2", { className: "section-title" }, "步驟"),
            h("ol", { className: "steps-list" }, stepItems)
          ),
          notes
            ? h(
                "section",
                { className: "recipe-section" },
                h("h2", { className: "section-title" }, "備註"),
                h("p", { className: "recipe-notes" }, notes)
              )
            : null
        )
      );
    },
  });

  CMS.registerPreviewStyle("../assets/css/style.css");
  CMS.registerPreviewTemplate("recipes", RecipePreview);

  // "更新於" → "更新時間"。registerLocale 會整組取代該語系字串，
  // 所以先取得內建的完整 zh_Hant 翻譯，只改這一個欄位再整組寫回去，
  // 避免其他文字被英文預設值取代。
  var zhHant = CMS.getLocale("zh_Hant");
  if (zhHant && zhHant.collection && zhHant.collection.defaultFields && zhHant.collection.defaultFields.updatedOn) {
    zhHant.collection.defaultFields.updatedOn.label = "更新時間";
    CMS.registerLocale("zh_Hant", zhHant);
  }
})();
