import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import {
  buildRuntimeGlossaryManifests,
  GLOSSARY_RUNTIME_MANIFEST_PATH_BY_LOCALE,
  serializeRuntimeManifest
} from "./glossary-build";

const root = resolve(".");
const results = await buildRuntimeGlossaryManifests(root);
const failedLocales = results.filter((result) => result.diagnostics.length > 0);

if (failedLocales.length > 0) {
  console.error("Glossary generation failed:");
  for (const result of failedLocales) {
    for (const diagnostic of result.diagnostics) {
      console.error(`[${result.locale}] - ${diagnostic}`);
    }
  }
  process.exit(1);
}

for (const result of results) {
  const outputPath = join(root, GLOSSARY_RUNTIME_MANIFEST_PATH_BY_LOCALE[result.locale]);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, serializeRuntimeManifest(result.runtimeManifest), "utf8");

  console.log(
    `Glossary manifest generated (${result.locale}): ${result.runtimeManifest.length} terms from ${result.sourceFiles.length} source file(s).`
  );
}
