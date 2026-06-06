import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import {
  buildGlossaryManifest,
  type GlossaryManifestEntry as DevexGlossaryManifestEntry
} from "../../../platform/zdp-platform-devex/src/glossary-devex";

export const GLOSSARY_ROOT = "glossary/terms";
export const COMMON_GLOSSARY_ROOT = "../../contracts/zdp-libs-ts/glossary/terms";
export const GLOSSARY_LOCALE = "ko";
export const GLOSSARY_PRODUCT = "zdp-web-public";
export const GLOSSARY_SITE = "web-public-home";
export const GLOSSARY_RUNTIME_MANIFEST_PATH = "src/content/glossary-manifest.json";
export const STABLE_GENERATED_AT = "2026-06-05T00:00:00.000Z";

const WEB_PUBLIC_GLOSSARY_SOURCE_PATHS: Readonly<Record<string, string>> = {
  "design.oklch": "/design#design-foundation",
  "design.semantic-token": "/design#design-tokens",
  "platform.astro": "/design#design-start",
  "platform.svelte": "/design#design-start",
  "platform.tauri": "/design#design-start",
  "platform.flutter-token": "/design#design-tokens",
  "security.vault": "/security#design-tokens",
  "security.audit-log": "/security#design-checks",
  "security.privacy-access-broker": "/security#design-tokens",
  "security.owasp-asvs": "/security#design-tokens",
  "operations.rate-limit": "/security#design-tokens"
};

export interface RuntimeGlossaryAdPolicy {
  readonly eligible: boolean;
  readonly slot: string | null;
  readonly note: string;
}

export interface RuntimeGlossaryMatchPhrase {
  readonly phrase: string;
  readonly autoMatch: boolean;
  readonly priority: number;
}

export interface RuntimeGlossaryManifestEntry {
  readonly id: string;
  readonly label: string;
  readonly summary: string;
  readonly detail: string;
  readonly category: "design" | "security" | "platform" | "operations";
  readonly aliases: readonly string[];
  readonly matchPhrases: readonly RuntimeGlossaryMatchPhrase[];
  readonly sourcePath: string;
  readonly adPolicy: RuntimeGlossaryAdPolicy;
}

export interface RuntimeGlossaryBuildResult {
  readonly sourceFiles: readonly string[];
  readonly runtimeManifest: readonly RuntimeGlossaryManifestEntry[];
  readonly diagnostics: readonly string[];
}

export async function buildRuntimeGlossaryManifest(root = resolve(".")): Promise<RuntimeGlossaryBuildResult> {
  const sourceFiles = await readGlossarySourceFiles(root);
  const diagnostics: string[] = [];

  if (sourceFiles.length === 0) {
    diagnostics.push(`${GLOSSARY_ROOT} must contain at least one YAML glossary source.`);
  }

  const result = buildGlossaryManifest({
    sources: await Promise.all(
      sourceFiles.map(async (file) => ({
        file: toPortablePath(relative(root, file)),
        source: await readFile(file, "utf8")
      }))
    ),
    locale: GLOSSARY_LOCALE,
    product: GLOSSARY_PRODUCT,
    site: GLOSSARY_SITE,
    generatedAt: STABLE_GENERATED_AT
  });

  for (const diagnostic of result.report.diagnostics) {
    if (diagnostic.severity === "error") {
      diagnostics.push(
        `${diagnostic.file}.${diagnostic.path}: ${diagnostic.code} ${diagnostic.message}`
      );
    }
  }

  if (result.manifest.locale !== GLOSSARY_LOCALE) {
    diagnostics.push(`Glossary locale must be ${GLOSSARY_LOCALE}. Found ${result.manifest.locale}.`);
  }

  if (result.report.product !== GLOSSARY_PRODUCT || result.report.site !== GLOSSARY_SITE) {
    diagnostics.push("Glossary build report must stay scoped to zdp-web-public/web-public-home.");
  }

  if (result.manifest.terms.length < 10) {
    diagnostics.push("Public glossary must include at least 10 reviewed terms for the first sheet pass.");
  }

  for (const term of result.manifest.terms) {
    if (term.interaction.trigger !== "click") {
      diagnostics.push(`${term.id} must use click interaction.`);
    }

    if (
      term.interaction.surface !== "term-sheet" ||
      term.interaction.desktopPlacement !== "right-sheet" ||
      term.interaction.mobilePlacement !== "bottom-sheet"
    ) {
      diagnostics.push(`${term.id} must use right-sheet/bottom-sheet term sheet placements.`);
    }

    if (term.adPolicy.hoverCard !== "forbidden") {
      diagnostics.push(`${term.id} must forbid hover-card advertising.`);
    }

    if (term.adPolicy.termSheet !== "forbidden") {
      diagnostics.push(`${term.id} must forbid Term Sheet advertising.`);
    }
  }

  return {
    sourceFiles: sourceFiles.map((file) => toPortablePath(relative(root, file))),
    runtimeManifest: result.manifest.terms
      .map(toRuntimeGlossaryEntry)
      .sort((left, right) => left.label.localeCompare(right.label, GLOSSARY_LOCALE)),
    diagnostics
  };
}

export function toRuntimeGlossaryEntry(term: DevexGlossaryManifestEntry): RuntimeGlossaryManifestEntry {
  return {
    id: term.id,
    label: term.label,
    summary: term.short,
    detail: term.long ?? term.short,
    category: readCategory(term.id),
    aliases: term.aliases,
    matchPhrases: term.matchPhrases,
    sourcePath: WEB_PUBLIC_GLOSSARY_SOURCE_PATHS[term.id] ?? term.canonicalPath ?? "/",
    adPolicy:
      term.adPolicy.detailPage === "future-experiment-only"
        ? createReservedDetailAdPolicy(`glossary-detail-${term.id.replaceAll(".", "-")}`)
        : createForbiddenAdPolicy()
  };
}

export function serializeRuntimeManifest(
  manifest: readonly RuntimeGlossaryManifestEntry[]
): string {
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

async function readGlossarySourceFiles(root: string): Promise<readonly string[]> {
  const files: string[] = [];
  await collectYamlFiles(join(root, COMMON_GLOSSARY_ROOT), files);
  await collectYamlFiles(join(root, GLOSSARY_ROOT), files);
  return files.sort((left, right) => left.localeCompare(right));
}

async function collectYamlFiles(directory: string, files: string[]): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectYamlFiles(entryPath, files);
      continue;
    }

    if (entry.isFile() && /\.(?:ya?ml)$/i.test(entry.name)) {
      files.push(entryPath);
    }
  }
}

function createReservedDetailAdPolicy(slot: string): RuntimeGlossaryAdPolicy {
  return {
    eligible: true,
    slot,
    note: "별도 용어 상세 페이지에서만 실험할 수 있는 예약 슬롯입니다."
  };
}

function createForbiddenAdPolicy(): RuntimeGlossaryAdPolicy {
  return {
    eligible: false,
    slot: null,
    note: "이 용어 설명에는 광고를 배치하지 않습니다."
  };
}

function readCategory(termId: string): RuntimeGlossaryManifestEntry["category"] {
  const namespace = termId.split(".")[0];
  if (
    namespace === "design" ||
    namespace === "security" ||
    namespace === "platform" ||
    namespace === "operations"
  ) {
    return namespace;
  }

  return "platform";
}

function toPortablePath(path: string): string {
  return path.replaceAll("\\", "/");
}
