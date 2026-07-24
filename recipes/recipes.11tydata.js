import { normalizeRecipe } from "../src/assets/js/recipe-view-model.js";

export default {
  layout: "recipe-single.njk",
  eleventyComputed: {
    recipe: (data) => normalizeRecipe(data),
  },
};
