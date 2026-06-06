import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import {
  buildRuntimeGlossaryManifest,
  GLOSSARY_RUNTIME_MANIFEST_PATH,
  serializeRuntimeManifest
} from "./glossary-build";

const root = resolve(".");
const result = await buildRuntimeGlossaryManifest(root);

if (result.diagnostics.length > 0) {
  console.error("Glossary generation failed:");
  for (const diagnostic of result.diagnostics) {
    console.error(`- ${diagnostic}`);
  }
  process.exit(1);
}

const outputPath = join(root, GLOSSARY_RUNTIME_MANIFEST_PATH);
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, serializeRuntimeManifest(result.runtimeManifest), "utf8");

console.log(
  `Glossary manifest generated: ${result.runtimeManifest.length} terms from ${result.sourceFiles.length} source file(s).`
);
