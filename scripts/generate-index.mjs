import { readdir, writeFile } from "node:fs/promises";

const files = (await readdir(new URL("../public/resumes/", import.meta.url)))
  .filter((name) => name.toLowerCase().endsWith(".md"))
  .sort((a, b) => a.localeCompare(b, "zh-CN"));
await writeFile(new URL("../public/resumes/index.json", import.meta.url), JSON.stringify(files, null, 2) + "\n");
