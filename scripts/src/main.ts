import { copy, exists, expandGlob } from "jsr:@std/fs@1.0.18";
import { dirname, join } from "jsr:@std/path@1.1.0";

// /myPath/index.html => /myPath.html
async function generateSimpleHtmlFiles(outDir: URL) {
  const pattern = join(outDir.pathname, "/**/index.html");

  const fileEntries = [];
  for await (const entry of expandGlob(pattern)) {
    if (dirname(entry.path) === outDir.pathname) {
      continue;
    }
    fileEntries.push(entry);
  }

  await Promise.all(
    fileEntries.map(async (entry) => {
      if (entry.isDirectory || entry.isSymlink) {
        return;
      }
      const copyPath = `${dirname(entry.path)}.html`;
      if (await exists(copyPath)) {
        const yellow = "\u001b[33m";
        const reset = "\u001b[0m";
        console.warn(
          [
            `${yellow}[WARN: generate_simple_html_files]${reset}`,
            `Skip generatimg because the file already exists: ${copyPath}`,
          ].join(" "),
        );
        return;
      }
      await copy(entry.path, copyPath);
    }),
  );
}

await generateSimpleHtmlFiles(new URL(import.meta.resolve("./../../dist")));
