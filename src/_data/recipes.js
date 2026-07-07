import { readdir, readFile } from "fs/promises";
import { join } from "path";
import matter from "gray-matter";

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

    recipes.push({
      title: data.title ?? "",
      tags: data.tags ?? [],
      equipment: data.equipment ?? [],
      servings: data.servings ?? 1,
      ingredients: (data.ingredients ?? []).map((i) => i.name ?? i),
      seasonings: (data.seasonings ?? []).map((s) => s.name ?? s),
      photo: (data.photos ?? [])[0] ?? null,
      url: `/recipes/${slug}/`,
    });
  }

  return recipes;
}
