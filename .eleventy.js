import { IdAttributePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
  // 排除不需要輸出為網頁的文件
  eleventyConfig.ignores.add("CLAUDE.md");
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("wireframe.md");
  eleventyConfig.ignores.add("個人食譜記錄網站_需求說明書.md");
  eleventyConfig.ignores.add("recipes/recipes.njk");

  // Passthrough copy
  eleventyConfig.addPassthroughCopy("uploads");
  eleventyConfig.addPassthroughCopy("admin");
  // src/assets → _site/assets（去掉 src/ 前綴）
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Watch targets
  eleventyConfig.addWatchTarget("src/assets/");

  // Plugin
  eleventyConfig.addPlugin(IdAttributePlugin);

  // Filters
  eleventyConfig.addFilter("limit", (arr, max) => arr.slice(0, max));

  return {
    pathPrefix: "/recipe-net/",
    dir: {
      input: ".",
      includes: "src/_includes",
      data: "src/_data",
      output: "_site",
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
