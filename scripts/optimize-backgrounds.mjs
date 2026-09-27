import { readFile, writeFile, stat } from "node:fs/promises";
import sharp from "sharp";

const backgrounds = ["hero.png", "auth/auth-background.png", "dashboard/dashboardbottom.png", "dashboard/dashboard-hero.png", "sectionBackgrounds/section2.png", "sectionBackgrounds/section3.png", "sectionBackgrounds/section4.png", "sectionBackgrounds/section5.png", "footer-background.png"];
const rows = [];
for (const source of backgrounds) {
  const input = `public/images/${source}`, output = input.replace(/\.png$/, ".webp");
  const original = await sharp(await readFile(input)).metadata();
  await sharp(input).webp({ quality: 85, effort: 6 }).toFile(output);
  const converted = await sharp(output).metadata();
  if (converted.width !== original.width || converted.height !== original.height) throw new Error("Image dimensions changed.");
  rows.push({ source, output: output.replace("public/", "/"), before: (await stat(input)).size, after: (await stat(output)).size, width: original.width, height: original.height });
}
await writeFile("docs/asset-performance.json", JSON.stringify(rows, null, 2) + "\n");
console.log(JSON.stringify({ count: rows.length, before: rows.reduce((n, row) => n + row.before, 0), after: rows.reduce((n, row) => n + row.after, 0) }));
