/**
 * search.js
 * 即時關鍵字搜尋 + 標籤篩選
 */

(function () {
  "use strict";

  // ── DOM refs ─────────────────────────────────────────────
  const searchInput = document.getElementById("search-input");
  const searchCount = document.getElementById("search-count");
  const recipeGrid  = document.getElementById("recipe-grid");
  const noResults   = document.getElementById("no-results");
  const filterTags  = document.querySelectorAll(".filter-tag");

  if (!searchInput || !recipeGrid) return;

  // ── 讀取資料（建置時期產生的索引） ──────────────────────
  /** @type {Array<{title:string, tags:string[], equipment:string[], ingredients:string[], seasonings:string[], photo:string|null, url:string, slug:string}>} */
  let recipes = [];

  /** @type {string[]} */
  let activeFilters = []; // 空陣列 = 全部

  // ── 篩選邏輯 ─────────────────────────────────────────────
  /**
   * @param {string} keyword
   * @param {string[]} filters
   * @returns {Set<string>} 符合條件的食譜 slug set
   */
  function getMatchedSlugs(keyword, filters) {
    const kw = keyword.trim().toLowerCase();
    return new Set(
      recipes
        .filter((r) => {
          // 標籤篩選（需同時符合所有已選標籤）
          if (filters.length > 0) {
            const hasAll = filters.every(
              (f) =>
                r.tags.includes(f) || r.equipment.includes(f)
            );
            if (!hasAll) return false;
          }

          // 關鍵字搜尋（空白時全部通過）
          if (!kw) return true;

          return [
            r.title,
            ...r.tags,
            ...r.equipment,
            ...r.ingredients,
            ...r.seasonings,
          ]
            .join(" ")
            .toLowerCase()
            .includes(kw);
        })
        .map((r) => r.slug)
    );
  }

  // ── DOM 更新 ─────────────────────────────────────────────
  function render() {
    const kw      = searchInput.value;
    const matched = getMatchedSlugs(kw, activeFilters);
    const cards   = recipeGrid.querySelectorAll(".recipe-card");
    let visible   = 0;

    cards.forEach((card) => {
      const slug = card.querySelector(".recipe-card-link")?.dataset.slug;
      if (matched.has(slug)) {
        card.hidden = false;
        visible++;
      } else {
        card.hidden = true;
      }
    });

    // 計數顯示
    if (kw.trim() || activeFilters.length > 0) {
      searchCount.textContent = `${visible} 筆`;
    } else {
      searchCount.textContent = "";
    }

    // 無結果
    noResults.hidden = visible > 0;
  }

  // ── 事件 ─────────────────────────────────────────────────
  searchInput.addEventListener("input", render);

  filterTags.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tag = btn.dataset.tag;

      if (tag === "__all__") {
        // 全部 → 清除篩選
        activeFilters = [];
        filterTags.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      } else {
        // 取消「全部」的 active
        const allBtn = document.querySelector('.filter-tag[data-tag="__all__"]');
        if (allBtn) allBtn.classList.remove("active");

        // 切換 active
        const idx = activeFilters.indexOf(tag);
        if (idx === -1) {
          activeFilters.push(tag);
          btn.classList.add("active");
        } else {
          activeFilters.splice(idx, 1);
          btn.classList.remove("active");
        }

        // 若全部取消選取，恢復「全部」
        if (activeFilters.length === 0 && allBtn) {
          allBtn.classList.add("active");
        }
      }

      render();
    });
  });

  // ── 載入索引資料後初始 render ──────────────────────────────
  fetch(window.RECIPES_INDEX_URL || "/assets/recipes-index.json")
    .then((res) => res.json())
    .then((data) => {
      recipes = data;
      render();
    });
})();
