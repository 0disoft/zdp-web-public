import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  buildRuntimeGlossaryManifest,
  GLOSSARY_RUNTIME_MANIFEST_PATH,
  serializeRuntimeManifest
} from "./glossary-build";

const root = resolve(".");
const failures: string[] = [];
const result = await buildRuntimeGlossaryManifest(root);

for (const diagnostic of result.diagnostics) {
  failures.push(diagnostic);
}

let currentRuntimeManifest = "";
try {
  currentRuntimeManifest = await readFile(join(root, GLOSSARY_RUNTIME_MANIFEST_PATH), "utf8");
} catch (error) {
  failures.push(
    `${GLOSSARY_RUNTIME_MANIFEST_PATH} is missing. Run bun run glossary:generate before checking.`
  );
}

const expectedRuntimeManifest = serializeRuntimeManifest(result.runtimeManifest);
if (currentRuntimeManifest !== "" && currentRuntimeManifest !== expectedRuntimeManifest) {
  failures.push(
    `${GLOSSARY_RUNTIME_MANIFEST_PATH} is stale. Run bun run glossary:generate after editing glossary/terms YAML.`
  );
}

if (failures.length > 0) {
  console.error("Glossary check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Glossary check passed: ${result.runtimeManifest.length} terms from ${result.sourceFiles.length} source file(s).`
);
