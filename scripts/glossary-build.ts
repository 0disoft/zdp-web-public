import { readdir, readFile } from "node:fs/promises";
import type { Dirent } from "node:fs";
import { join, relative, resolve } from "node:path";
import {
  buildGlossaryManifest,
  type GlossaryManifestEntry as DevexGlossaryManifestEntry
} from "../../../platform/zdp-platform-devex/src/glossary-devex";

export const GLOSSARY_TERMS_ROOT = "glossary/terms";
export const GLOSSARY_LOCALE = "ko";
export const GLOSSARY_LOCALES_ROOT = `glossary/locales/${GLOSSARY_LOCALE}`;
export const COMMON_GLOSSARY_TERMS_ROOT = "../../contracts/zdp-libs-ts/glossary/terms";
export const COMMON_GLOSSARY_LOCALES_ROOT = `../../contracts/zdp-libs-ts/glossary/locales/${GLOSSARY_LOCALE}`;
export const GLOSSARY_PRODUCT = "zdp-web-public";
export const GLOSSARY_SITE = "web-public-home";
export const GLOSSARY_RUNTIME_MANIFEST_PATH = "src/content/glossary-manifest.json";
export const STABLE_GENERATED_AT = "2026-06-05T00:00:00.000Z";

const WEB_PUBLIC_GLOSSARY_SOURCE_PATHS: Readonly<Record<string, string>> = {
  "design.oklch": "/design#design-foundation",
  "design.oklab": "/design#design-foundation",
  "design.design-token": "/design#design-tokens",
  "design.primitive-token": "/design#design-tokens",
  "design.base-token": "/design#design-tokens",
  "design.component-token": "/design#design-tokens",
  "design.theme": "/design#design-tokens",
  "design.color-scheme": "/design#design-tokens",
  "design.dark-mode": "/design#design-tokens",
  "design.light-mode": "/design#design-tokens",
  "design.focus-ring": "/design#design-tokens",
  "design.focus-visible": "/design#design-tokens",
  "design.accessibility": "/design#design-tokens",
  "design.wcag": "/design#design-tokens",
  "design.contrast-ratio": "/design#design-tokens",
  "design.user-select": "/design#design-tokens",
  "design.text-selection": "/design#design-tokens",
  "design.tooltip": "/design#design-tokens",
  "design.popover": "/design#design-tokens",
  "design.menu": "/design#design-tokens",
  "design.toast": "/design#design-tokens",
  "design.skeleton": "/design#design-tokens",
  "design.progress": "/design#design-tokens",
  "design.spinner": "/design#design-tokens",
  "design.pagination": "/design#design-tokens",
  "design.accordion": "/design#design-tokens",
  "design.disclosure": "/design#design-tokens",
  "design.segmented-control": "/design#design-tokens",
  "design.avatar": "/design#design-tokens",
  "design.identity-chip": "/design#design-tokens",
  "design.command-field": "/design#design-tokens",
  "design.sort-header": "/design#design-tokens",
  "design.semantic-token": "/design#design-tokens",
  "platform.astro": "/design#design-start",
  "platform.svelte": "/design#design-start",
  "platform.sveltekit": "/design#design-start",
  "platform.island-architecture": "/design#design-start",
  "platform.static-site": "/design#design-start",
  "platform.static-site-generation": "/design#design-start",
  "platform.server-side-rendering": "/design#design-start",
  "platform.client-side-rendering": "/design#design-start",
  "platform.hydration": "/design#design-start",
  "platform.runtime": "/design#design-start",
  "platform.build-time": "/design#design-start",
  "platform.bundle": "/design#design-start",
  "platform.adapter": "/design#design-start",
  "platform.virtual-dom": "/design#design-start",
  "platform.runes": "/design#design-start",
  "platform.single-page-app": "/design#design-start",
  "platform.seo": "/design#design-start",
  "platform.sitemap": "/design#design-start",
  "platform.robots-txt": "/design#design-start",
  "platform.llms-txt": "/design#design-start",
  "platform.rss": "/design#design-start",
  "platform.atom": "/design#design-start",
  "platform.json-feed": "/design#design-start",
  "platform.search-index": "/design#design-start",
  "platform.web-app-manifest": "/design#design-start",
  "platform.locale": "/design#design-start",
  "platform.i18n": "/design#design-start",
  "platform.localization": "/design#design-start",
  "platform.message-catalog": "/design#design-start",
  "platform.fallback-locale": "/design#design-start",
  "platform.translation-status": "/design#design-start",
  "platform.font-stack": "/design#design-tokens",
  "platform.web-font": "/design#design-tokens",
  "platform.fontsource": "/design#design-tokens",
  "platform.tauri": "/design#design-start",
  "platform.webview": "/design#design-start",
  "platform.flutter": "/design#design-tokens",
  "platform.flutter-token": "/design#design-tokens",
  "security.vault": "/security#design-tokens",
  "security.secret": "/security#design-tokens",
  "security.credential": "/security#design-tokens",
  "security.api-key": "/security#design-tokens",
  "security.oauth-token": "/security#design-tokens",
  "security.webhook-secret": "/security#design-tokens",
  "security.plaintext": "/security#design-checks",
  "security.encryption": "/security#design-checks",
  "security.audit-log": "/security#design-checks",
  "security.audit-trail": "/security#design-checks",
  "security.append-only": "/security#design-checks",
  "security.masking": "/security#design-checks",
  "security.least-privilege": "/security#design-checks",
  "security.consent": "/security#design-checks",
  "security.data-minimization": "/security#design-checks",
  "security.privacy-access-broker": "/security#design-tokens",
  "security.owasp-asvs": "/security#design-tokens",
  "security.session": "/security#design-tokens",
  "security.permission": "/security#design-tokens",
  "security.access-control": "/security#design-tokens",
  "operations.rate-limit": "/security#design-tokens",
  "operations.deletion-propagation": "/security#design-checks",
  "operations.cache": "/design#design-start"
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
    diagnostics.push(`${GLOSSARY_TERMS_ROOT} must contain at least one YAML glossary source.`);
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
  await collectYamlFiles(join(root, COMMON_GLOSSARY_TERMS_ROOT), files);
  await collectYamlFiles(join(root, COMMON_GLOSSARY_LOCALES_ROOT), files);
  await collectYamlFiles(join(root, GLOSSARY_TERMS_ROOT), files);
  await collectYamlFiles(join(root, GLOSSARY_LOCALES_ROOT), files);
  return files.sort((left, right) => left.localeCompare(right));
}

async function collectYamlFiles(directory: string, files: string[]): Promise<void> {
  let entries: Dirent<string>[];
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return;
    }

    throw error;
  }

  for (const entry of entries) {
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
