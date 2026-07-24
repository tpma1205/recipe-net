import { readdir, readFile } from "fs/promises";
import { join } from "path";
import matter from "gray-matter";
import { normalizeRecipe, toListSummary } from "../assets/js/recipe-view-model.js";

export default async function () {
  const recipesDir = join(process.cwd(), "recipes");
  let files;

  try {
    files = await readdir(recipesDir);
  } catch {
    return [];
  }

  const recipes = [];

  for (const file of files) {
    if (!file.endsWith(".md")) continue;

    const raw = await readFile(join(recipesDir, file), "utf-8");
    const { data } = matter(raw);
    const slug = file.replace(/\.md$/, "");

    recipes.push(toListSummary(normalizeRecipe(data), { slug }));
  }

  return recipes;
}
