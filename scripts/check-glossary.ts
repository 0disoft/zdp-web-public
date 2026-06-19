import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  buildRuntimeGlossaryManifests,
  GLOSSARY_RUNTIME_MANIFEST_PATH_BY_LOCALE,
  serializeRuntimeManifest
} from "./glossary-build";

const root = resolve(".");
const failures: string[] = [];
const results = await buildRuntimeGlossaryManifests(root);

for (const result of results) {
  for (const diagnostic of result.diagnostics) {
    failures.push(`[${result.locale}] ${diagnostic}`);
  }

  const manifestPath = GLOSSARY_RUNTIME_MANIFEST_PATH_BY_LOCALE[result.locale];
  let currentRuntimeManifest = "";
  try {
    currentRuntimeManifest = await readFile(join(root, manifestPath), "utf8");
  } catch (error) {
    failures.push(
      `${manifestPath} is missing. Run bun run glossary:generate before checking.`
    );
    continue;
  }

  const expectedRuntimeManifest = serializeRuntimeManifest(result.runtimeManifest);
  if (currentRuntimeManifest !== "" && currentRuntimeManifest !== expectedRuntimeManifest) {
    failures.push(
      `${manifestPath} is stale. Run bun run glossary:generate after editing common or local glossary YAML.`
    );
  }
}

if (failures.length > 0) {
  console.error("Glossary check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Glossary check passed: ${results
    .map((result) => `${result.locale}:${result.runtimeManifest.length}`)
    .join(", ")}`
);
