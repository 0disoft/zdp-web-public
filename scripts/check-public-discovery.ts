import { access, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  publicEntryPaths,
  publicLocalizedPaths,
  publicPageIds,
  publicPagesByLocale,
  type PublicPage
} from "../src/content/public-pages";
import {
  getGlossaryManifest,
  markGlossaryText,
  type GlossaryManifestEntry
} from "../src/content/glossary";
import { defaultLocale, siteLocales, type SupportedLocale } from "../src/lib/site-locales";

const EXPECTED_CANDIDATE_DOMAIN = "8ailors.xyz";
const REQUIRED_WEBPUB_PAGES = ["/", ...publicLocalizedPaths] as const;
const FORBIDDEN_DISCOVERY_OUTPUTS = [
  "public/sitemap.xml",
  "public/rss.xml",
  "public/atom.xml",
  "public/feed.json"
] as const;
const FORBIDDEN_LLMS_PATTERNS = [
  { pattern: /https?:\/\//i, reason: "absolute URLs are not allowed before launch" },
  { pattern: /\blocalhost(?::\d+)?\b/i, reason: "local URLs are not public discovery content" },
  { pattern: /\b127\.0\.0\.1(?::\d+)?\b/, reason: "local URLs are not public discovery content" },
  { pattern: /\bstaging\.[a-z0-9.-]+\b/i, reason: "staging URLs are not public discovery content" },
  { pattern: /\binternal\.[a-z0-9.-]+\b/i, reason: "internal URLs are forbidden" },
  { pattern: /\/(?:internal|admin|customers?)(?:\/|\b)/i, reason: "private paths are forbidden" },
  { pattern: /\b(?:secret|token|api[_-]?key)\s*[:=]/i, reason: "secret-like values are forbidden" },
  { pattern: /\bsk-[a-z0-9_-]{12,}\b/i, reason: "secret-like values are forbidden" }
] as const;
const glossaryCanaryTextsByLocale: Record<SupportedLocale, readonly string[]> = {
  en: [
    "English and Korean are the first supported locales. Color schemes remain readable.",
    "A public sample of source tokens and shared UI parts applied through the same theme.",
    "Buttons, inputs, and links use the same rules across screens.",
    "Every control must be reachable without a mouse.",
    "Actions that are hard to undo require an explicit confirmation pattern before they run."
  ],
  ko: [
    "공통 테마로 적용되는 원천 토큰과 UI 요소의 실물 사양입니다.",
    "버튼, 입력, 링크는 어느 화면에서든 같은 규칙을 씁니다.",
    "마우스 없이 키보드로 모든 요소를 탐색할 수 있습니다.",
    "삭제·결제처럼 되돌리기 어려운 작업은 명확한 확인 뒤에 실행됩니다.",
    "언어 설정에 따라 서체와 줄바꿈 방식이 자동으로 바뀝니다."
  ]
} as const;

interface WebpubCandidateContract {
  readonly siteUrl: string | null;
  readonly canonicalDomain: string | null;
  readonly domainStatus: string | null;
  readonly language: string | null;
  readonly defaultLocale: string | null;
  readonly fallbackLocale: string | null;
  readonly locales: readonly string[];
  readonly localePolicy: string | null;
  readonly candidatePublicDomains: readonly string[];
  readonly pages: readonly string[];
  readonly robotsEnabled: boolean | null;
  readonly robotsDisallow: readonly string[];
}

interface PackageJson {
  readonly version: string | null;
  readonly dependencies: Readonly<Record<string, string>>;
  readonly scripts: Readonly<Record<string, string>>;
}

const root = readRootArgument();
const failures: string[] = [];

await checkWebpubContract();
await checkRobots();
await checkLlms();
await checkForbiddenDiscoveryOutputs();
await checkLocaleRouteContract();
await checkLayoutContract();
await checkLocalizationContract();
await checkDesignSystemConsumerContract();
await checkGlossarySheetContract();
checkPublicPageContentContract();
checkPublicPageRouteContract();

if (failures.length > 0) {
  console.error("Public discovery check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Public discovery check passed.");

async function checkWebpubContract(): Promise<void> {
  const content = await readText("webpub.toml");
  const contract = parseWebpubCandidateContract(content);

  expectEqual(contract.domainStatus, "candidate", "webpub.toml domain_status must stay candidate before launch.");
  expectEqual(contract.siteUrl, "", "webpub.toml site_url must stay empty before launch.");
  expectEqual(contract.canonicalDomain, "", "webpub.toml canonical_domain must stay empty before launch.");
  expectEqual(contract.language, defaultLocale, "webpub.toml language must match default locale.");
  expectEqual(contract.defaultLocale, defaultLocale, "webpub.toml default_locale must be English-first.");
  expectEqual(contract.fallbackLocale, defaultLocale, "webpub.toml fallback_locale must be English.");
  expectEqual(contract.localePolicy, "locale-prefixed-canonical", "webpub.toml locale_policy must stay explicit.");

  expectExactStringList(contract.locales, siteLocales, "webpub.toml locales must match supported site locales.");
  expectExactStringList(
    contract.candidatePublicDomains,
    [EXPECTED_CANDIDATE_DOMAIN],
    `webpub.toml candidate_public_domains must be exactly ["${EXPECTED_CANDIDATE_DOMAIN}"].`
  );
  expectExactStringList(
    contract.pages,
    REQUIRED_WEBPUB_PAGES,
    "webpub.toml pages must exactly match locale-prefixed public page paths."
  );
  expectEqual(contract.robotsEnabled, true, "webpub.toml robots.enabled must be true before launch.");

  if (!contract.robotsDisallow.includes("/")) {
    failures.push("webpub.toml robots.disallow must include / before launch.");
  }
}

async function checkRobots(): Promise<void> {
  const content = await readText("public/robots.txt");

  if (!/^User-agent:\s*\*/im.test(content)) {
    failures.push("public/robots.txt must apply to all user agents.");
  }

  if (!/^Disallow:\s*\/\s*$/im.test(content)) {
    failures.push("public/robots.txt must disallow / before launch.");
  }
}

async function checkLlms(): Promise<void> {
  const content = await readText("public/llms.txt");

  for (const path of REQUIRED_WEBPUB_PAGES) {
    if (!content.includes(`- \`${path}\``)) {
      failures.push(`public/llms.txt is missing core link ${path}.`);
    }
  }

  expectExactStringList(
    readLlmsCoreLinks(content),
    REQUIRED_WEBPUB_PAGES,
    "public/llms.txt Core Links must exactly match webpub locale paths."
  );

  for (const { pattern, reason } of FORBIDDEN_LLMS_PATTERNS) {
    if (pattern.test(content)) {
      failures.push(`public/llms.txt contains forbidden discovery content: ${reason}.`);
    }
  }
}

async function checkForbiddenDiscoveryOutputs(): Promise<void> {
  for (const path of FORBIDDEN_DISCOVERY_OUTPUTS) {
    if (await exists(path)) {
      failures.push(`${path} must not exist while domain_status is candidate.`);
    }
  }
}

async function checkLocaleRouteContract(): Promise<void> {
  const [entryPage, entrySurfacePage, localizedHomePage, localizedSurfacePage, localeRedirect, notFoundPage] = await Promise.all([
    readText("src/pages/index.astro"),
    readText("src/pages/[surface].astro"),
    readText("src/pages/[locale]/index.astro"),
    readText("src/pages/[locale]/[surface].astro"),
    readText("src/components/LocaleRedirect.astro"),
    readText("src/pages/404.astro")
  ]);

  for (const [path, content, requiredTexts] of [
    [
      "src/pages/index.astro",
      entryPage,
      ['import LocaleRedirect from "../components/LocaleRedirect.astro";', '<LocaleRedirect targetPath="/" />']
    ],
    [
      "src/pages/[surface].astro",
      entrySurfacePage,
      ['import LocaleRedirect from "../components/LocaleRedirect.astro";', "publicPageIds", "<LocaleRedirect targetPath={targetPath} />"]
    ],
    [
      "src/pages/[locale]/index.astro",
      localizedHomePage,
      ["siteLocales.map", "getPublicPages(locale)", 'locale={locale}', "localizedHomeText"]
    ],
    [
      "src/pages/[locale]/[surface].astro",
      localizedSurfacePage,
      ["siteLocales.flatMap", "getPublicPage(locale, surface)", "PublicShareDock", 'locale={locale}']
    ],
    [
      "src/components/LocaleRedirect.astro",
      localeRedirect,
      ['meta http-equiv="refresh"', "window.localStorage.getItem(localeStorageKey)", "navigator.languages", 'return "en";']
    ],
    [
      "src/pages/404.astro",
      notFoundPage,
      ["looksLikeLocale", "fallbackSegments", "window.location.replace", "defaultLocale", "siteLocales"]
    ]
  ] as const) {
    for (const requiredText of requiredTexts) {
      if (!content.includes(requiredText)) {
        failures.push(`${path} is missing locale routing contract ${requiredText}.`);
      }
    }
  }
}

async function checkLayoutContract(): Promise<void> {
  const content = await readText("src/layouts/BaseLayout.astro");

  for (const requiredText of [
    'name="robots"',
    'content="noindex,nofollow"',
    '<html lang={locale} data-zdp-locale={locale}',
    "getPublicPages(locale)",
    "siteLocales.map",
    "data-zdp-locale-value={locale}",
    'data-zdp-locale-option-value={optionLocale}',
    'const supportedLocales = ["en", "ko"]',
    "buildLocalizedCurrentPath",
    "navigateLocale",
    "applyLocale(pageLocale, true)",
    "searchLocale",
    "zdp-web-public-locale",
    "zdp-web-public-theme",
    "zdp-web-public-text-scale",
    "data-site-preference-menu",
    "site-preference-panel",
    "site-locale-switcher__name",
    "closePreferenceMenu"
  ]) {
    if (!content.includes(requiredText)) {
      failures.push(`BaseLayout.astro is missing locale-aware layout contract ${requiredText}.`);
    }
  }

  if (content.includes('type LocaleMode = "ko"') || content.includes('data-zdp-locale-value="ko"')) {
    failures.push("BaseLayout.astro must not preserve the old single-locale KO switcher contract.");
  }

  if (content.includes("site-preference-trigger__divider") || content.includes("site-preference-trigger__text")) {
    failures.push("BaseLayout.astro preference trigger must expose only the locale code, not extra text-size hints.");
  }
}

async function checkLocalizationContract(): Promise<void> {
  const [config, catalog, localizedAstro, homeEn, homeKo, runbook, serviceYaml] = await Promise.all([
    readText("localization.config.ts"),
    readText("src/lib/localization-catalog.ts"),
    readText("src/lib/localized-astro.ts"),
    readText("messages/en/home.json"),
    readText("messages/ko/home.json"),
    readText("RUNBOOK.md"),
    readText("service.yaml")
  ]);

  for (const requiredText of [
    'defaultLocale: "en"',
    'locales: ["en", "ko"]',
    'messages: "messages"',
    'scopes: ["home"]'
  ]) {
    if (!config.includes(requiredText)) {
      failures.push(`localization.config.ts is missing locale canary contract ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'import homeEnSource from "../../messages/en/home.json";',
    'import homeKoSource from "../../messages/ko/home.json";',
    "defaultLocale",
    "siteLocales",
    '...createContents("en"',
    '...createContents("ko"'
  ]) {
    if (!catalog.includes(requiredText)) {
      failures.push(`src/lib/localization-catalog.ts is missing bilingual catalog contract ${requiredText}.`);
    }
  }

  for (const key of ["hero.title", "hero.cta.products", "hero.cta.trust"]) {
    if (!homeEn.includes(`"${key}"`) || !homeKo.includes(`"${key}"`)) {
      failures.push(`messages/en and messages/ko must both define ${key}.`);
    }
  }

  for (const requiredText of [
    "locale: SupportedLocale = defaultLocale",
    "getRuntime(locale)"
  ]) {
    if (!localizedAstro.includes(requiredText)) {
      failures.push(`src/lib/localized-astro.ts is missing locale runtime contract ${requiredText}.`);
    }
  }

  for (const requiredText of [
    "Canonical public content paths are locale-prefixed",
    "English is the default and fallback locale",
    "complete `en` and `ko` message content"
  ]) {
    if (!runbook.includes(requiredText)) {
      failures.push(`RUNBOOK.md is missing locale routing contract ${requiredText}.`);
    }
  }

  for (const requiredText of [
    "locale-prefixed /en and /ko pages are generated",
    "English is the default and fallback locale",
    "complete en and ko messages"
  ]) {
    if (!serviceYaml.includes(requiredText)) {
      failures.push(`service.yaml is missing locale routing contract ${requiredText}.`);
    }
  }
}

async function checkDesignSystemConsumerContract(): Promise<void> {
  const [packageJson, globalCss, tokensCss, layout, homePage, surfacePage, shareDock] = await Promise.all([
    readPackageJson("package.json"),
    readText("src/styles/global.css"),
    readText("src/styles/tokens.css"),
    readText("src/layouts/BaseLayout.astro"),
    readText("src/pages/[locale]/index.astro"),
    readText("src/pages/[locale]/[surface].astro"),
    readText("src/components/PublicShareDock.astro")
  ]);

  if (packageJson.version !== "0.4.69") {
    failures.push("package.json version must stay 0.4.69 until a release bump is requested.");
  }

  if (packageJson.dependencies["zdp-design-system"] !== "file:../zdp-design-system") {
    failures.push('package.json dependencies.zdp-design-system must stay "file:../zdp-design-system".');
  }

  for (const requiredText of [
    '@import "zdp-design-system/styles.css";',
    '@import "zdp-design-system/brand-fonts.css";',
    '@import "zdp-design-system/locale-fonts.css";',
    ".zdp-surface-reset .brand .brand-name",
    ".site-preference-menu",
    ".site-preference-trigger",
    ".site-preference-panel",
    ".site-locale-switcher",
    "border-style: solid;",
    "border-color: transparent;",
    ".site-theme-toggle.zdp-theme-toggle",
    ".site-text-scale-control"
  ]) {
    if (!globalCss.includes(requiredText)) {
      failures.push(`src/styles/global.css is missing design-system consumer contract ${requiredText}.`);
    }
  }

  for (const forbiddenText of [
    ".site-preference-trigger__divider",
    ".site-preference-trigger__text",
    "site-preference-trigger__locale {\n  min-width",
    "site-preference-panel__title {\n  margin: 0 0 var(--space-2);\n  color: var(--color-muted);\n  font-size: var(--zdp-font-size-xs);\n  font-weight: var(--zdp-font-weight-bold)",
    "site-locale-switcher__name {\n  overflow: hidden;\n  font-size: var(--zdp-font-size-sm);\n  font-weight: var(--zdp-font-weight-medium)",
    'zdp-locale-switcher__item[aria-checked="true"] {\n  background: var(--color-clay-wash)',
    'zdp-text-scale-control__item[aria-checked="true"] {\n  background: var(--color-clay-wash)',
    'zdp-text-scale-control__item[aria-checked="true"] {\n  background: var(--color-surface)',
    'zdp-locale-switcher__item[aria-checked="true"] {\n  background: transparent;\n  border-block-end-color: var(--color-line)',
    'zdp-text-scale-control__item[aria-checked="true"] {\n  background: transparent;\n  border-block-end-color: var(--color-line)',
    'zdp-locale-switcher__item:focus-visible {\n  background: var(--zdp-color-focus-surface)',
    'zdp-locale-switcher__item:focus-visible {\n  background: transparent;\n  border-color: var(--zdp-color-focus-line)',
    'zdp-text-scale-control__item:focus-visible {\n  background: var(--zdp-color-focus-surface)',
    'zdp-text-scale-control__item:focus-visible {\n  background: transparent;\n  border-color: var(--zdp-color-focus-line)'
  ]) {
    if (globalCss.includes(forbiddenText)) {
      failures.push(`src/styles/global.css must keep the preference menu calm and non-bold; found ${forbiddenText}.`);
    }
  }

  for (const requiredText of [
    "zdp-locale-switcher__item {\n  position: relative;\n  justify-self: center;",
    "zdp-locale-switcher__item::after {\n  position: absolute;\n  inset-inline: var(--space-3);",
    "zdp-locale-switcher__item::after {\n  position: absolute;\n  inset-inline: var(--space-3);\n  inset-block-end: 0.22rem;\n  height: 0.16rem;\n  border-radius: var(--radius-pill);\n  background: var(--color-line);\n  content: \"\";\n  opacity: 0;\n  pointer-events: none;",
    "zdp-locale-switcher__item:hover:not(:disabled)::after {\n  background: var(--color-line);\n  opacity: 1;",
    'zdp-locale-switcher__item[aria-checked="true"]::after {\n  opacity: 1;',
    "zdp-locale-switcher__item:focus-visible {\n  background: transparent;\n  border-color: transparent;",
    "zdp-locale-switcher__item:focus-visible::after {\n  background: var(--zdp-color-focus-line);\n  opacity: 1;",
    "zdp-text-scale-control__item {\n  position: relative;\n  justify-self: center;",
    "zdp-text-scale-control__item::after {\n  position: absolute;\n  inset-inline: var(--space-3);",
    "zdp-text-scale-control__item::after {\n  position: absolute;\n  inset-inline: var(--space-3);\n  inset-block-end: 0.2rem;\n  height: 0.16rem;\n  border-radius: var(--radius-pill);\n  background: var(--color-line);\n  content: \"\";\n  opacity: 0;\n  pointer-events: none;",
    "zdp-text-scale-control__item:hover:not(:disabled)::after {\n  background: var(--color-line);\n  opacity: 1;",
    'zdp-text-scale-control__item[aria-checked="true"]::after {\n  opacity: 1;',
    "zdp-text-scale-control__item:focus-visible {\n  background: transparent;\n  border-color: transparent;",
    "zdp-text-scale-control__item:focus-visible::after {\n  background: var(--zdp-color-focus-line);\n  opacity: 1;"
  ]) {
    if (!globalCss.includes(requiredText)) {
      failures.push(`src/styles/global.css must use a text-width underline selected state for preference controls: ${requiredText}.`);
    }
  }

  for (const requiredText of [
    '[data-zdp-theme="dark"]',
    "color-scheme: dark;",
    "--font-sans: var(--zdp-font-family-multiscript);",
    "--font-title: var(--zdp-font-family-latin);",
    "--font-logo: var(--zdp-font-family-brand,",
    "--shadow-soft: none;",
    "--radius-pill: var(--zdp-radius-md);"
  ]) {
    if (!tokensCss.includes(requiredText)) {
      failures.push(`src/styles/tokens.css is missing theme token contract ${requiredText}.`);
    }
  }

  for (const [path, content, requiredTexts] of [
    [
      "src/layouts/BaseLayout.astro",
      layout,
      [
        'body class="zdp-surface-reset"',
        'class="zdp-skip-link"',
        'class="brand zdp-brand-lockup"',
        'class="brand-name zdp-brand-wordmark zdp-brand-wordmark--compact"',
        'role="search"',
        'aria-keyshortcuts="/"',
        'data-site-theme-toggle',
        'data-site-preference-menu',
        'data-site-locale-switcher',
        'data-site-text-scale-control'
      ]
    ],
    [
      "src/pages/[locale]/index.astro",
      homePage,
      [
        "zdp-button zdp-button--md zdp-button--primary",
        "zdp-button zdp-button--md zdp-button--secondary",
        "zdp-toolbar zdp-toolbar--gap-md zdp-toolbar--align-center",
        "surface-grid zdp-grid zdp-grid--columns-three zdp-grid--gap-md",
        "zdp-empty-state zdp-empty-state--raised"
      ]
    ],
    [
      "src/pages/[locale]/[surface].astro",
      surfacePage + shareDock,
      [
        "zdp-page-header zdp-page-header--align-start",
        "zdp-breadcrumb page-breadcrumb",
        "design-doc__layout zdp-container zdp-container--lg zdp-container--padding-md",
        "zdp-table zdp-table--density-compact",
        "zdp-share-dock",
        "zdp-share-action"
      ]
    ]
  ] as const) {
    for (const requiredText of requiredTexts) {
      if (!content.includes(requiredText)) {
        failures.push(`${path} is missing design-system consumer markup ${requiredText}.`);
      }
    }
  }
}

async function checkGlossarySheetContract(): Promise<void> {
  const [layout, homePage, surfacePage, globalCss, glossaryModule, glossaryText, glossarySheet, glossaryScript] = await Promise.all([
    readText("src/layouts/BaseLayout.astro"),
    readText("src/pages/[locale]/index.astro"),
    readText("src/pages/[locale]/[surface].astro"),
    readText("src/styles/global.css"),
    readText("src/content/glossary.ts"),
    readText("src/components/GlossaryText.astro"),
    readText("src/components/GlossarySheet.astro"),
    readText("src/scripts/glossary-sheet.ts")
  ]);

  for (const requiredText of [
    'import GlossarySheet from "../components/GlossarySheet.astro";',
    "<GlossarySheet locale={locale} />"
  ]) {
    if (!layout.includes(requiredText)) {
      failures.push(`BaseLayout.astro is missing glossary sheet shell ${requiredText}.`);
    }
  }

  for (const [path, content, requiredTexts] of [
    [
      "src/content/glossary.ts",
      glossaryModule,
      [
        "export type GlossaryLocale = SupportedLocale;",
        "locale === \"ko\" ? publicGlossaryManifest : []",
        'getGlossaryManifest("en")'
      ]
    ],
    [
      "src/components/GlossaryText.astro",
      glossaryText,
      [
        'locale = "en"',
        'class="glossary-trigger"',
        "data-glossary-term",
        "data-term-id",
        "data-zdp-term-id",
        'aria-haspopup="dialog"',
        'aria-controls="glossary-sheet"',
        'aria-expanded="false"'
      ]
    ],
      [
        "src/components/GlossarySheet.astro",
        glossarySheet,
        [
          "locale?: GlossaryLocale",
          "const glossaryTerms = getGlossaryManifest(locale);",
          "const hasGlossaryTerms = glossaryTerms.length > 0;",
          "JSON.stringify(glossaryTerms)",
          "{hasGlossaryTerms && (",
          "data-glossary-root",
          "data-glossary-locale={locale}",
          "glossaryCopy[locale]",
        'role="dialog"',
        'aria-modal="true"',
        'data-zdp-ad-exclude="true"',
        'data-zdp-term-placement="right-sheet"',
        'data-zdp-term-surface="sheet"',
        "data-glossary-manifest"
      ]
    ],
    [
      "src/scripts/glossary-sheet.ts",
      glossaryScript,
      ["data-glossary-term", "openSheet", "closeSheet", "renderDetailParagraphs", "trapFocus", "Escape"]
    ],
    [
      "src/styles/global.css",
      globalCss,
      [".glossary-trigger", ".glossary-trigger:focus-visible", ".glossary-sheet", ".glossary-sheet.is-open"]
    ],
    [
      "src/pages/[locale]/index.astro",
      homePage,
      ['import GlossaryText from "../../components/GlossaryText.astro";', "<GlossaryText text={section.summary} locale={locale} />"]
    ],
    [
      "src/pages/[locale]/[surface].astro",
      surfacePage,
      [
        'import GlossaryText from "../../components/GlossaryText.astro";',
        "<GlossaryText text={heroSummary} locale={locale} />",
        "<GlossaryText text={section.body} locale={locale} />",
        "<GlossaryText text={detail.body} locale={locale} />",
        "<GlossaryText text={check.note} locale={locale} />"
      ]
    ]
  ] as const) {
    for (const requiredText of requiredTexts) {
      if (!content.includes(requiredText)) {
        failures.push(`${path} is missing glossary sheet contract ${requiredText}.`);
      }
    }
  }

  for (const forbiddenText of [
    'getGlossaryManifest("ko")',
    'data-glossary-locale="ko"',
    "<GlossaryText text={section.summary} />",
    "<GlossaryText text={item.body} />",
    "<GlossaryText text={heroSummary} />",
    "<GlossaryText text={copy.showcaseSummary} />",
    "<GlossaryText text={section.body} />",
    "<GlossaryText text={detail.body} />",
    "<GlossaryText text={check.note} />",
    "JSON.stringify(getGlossaryManifest(locale))",
    "mouseenter",
    "mouseover",
    "data-glossary-hover",
    "data-glossary-ads",
    "data-glossary-ad-slot",
    ".glossary-sheet__ad-slot",
    'root.getAttribute("data-glossary-ads")',
    ":hover .glossary-sheet",
    'role="tooltip"'
  ]) {
    if (
      glossaryModule.includes(forbiddenText) ||
      glossaryText.includes(forbiddenText) ||
      glossaryScript.includes(forbiddenText) ||
      glossarySheet.includes(forbiddenText) ||
      globalCss.includes(forbiddenText) ||
      homePage.includes(forbiddenText) ||
      surfacePage.includes(forbiddenText) ||
      layout.includes(forbiddenText)
    ) {
      failures.push(`Glossary contract contains forbidden stale or unsafe pattern: ${forbiddenText}.`);
    }
  }

  const glossaryTermsByLocale = Object.fromEntries(
    siteLocales.map((locale) => [locale, getGlossaryManifest(locale)])
  ) as Record<SupportedLocale, readonly GlossaryManifestEntry[]>;

  if (glossaryTermsByLocale.ko.length === 0) {
    failures.push("Korean glossary manifest must keep reviewed glossary terms.");
  }

  checkGlossaryLocaleIsolation(glossaryTermsByLocale, glossarySheet);

  if (!globalCss.includes(".glossary-trigger:hover {\n  background: var(--color-accent-wash);\n  color: inherit;")) {
    failures.push("Glossary trigger hover must keep color: inherit.");
  }
}

function checkGlossaryLocaleIsolation(
  glossaryTermsByLocale: Record<SupportedLocale, readonly GlossaryManifestEntry[]>,
  glossarySheet: string
): void {
  for (const locale of siteLocales) {
    const terms = glossaryTermsByLocale[locale];
    const texts = collectGlossaryCandidateTexts(locale);
    const matchedTerms = texts.flatMap((text) =>
      markGlossaryText(text, terms).filter((token) => token.type === "term")
    );

    if (terms.length === 0 && matchedTerms.length > 0) {
      failures.push(`${locale} public content must not render glossary triggers before ${locale} glossary copy is reviewed.`);
    }

    const otherLocaleTerms = siteLocales
      .filter((otherLocale) => otherLocale !== locale)
      .flatMap((otherLocale) => glossaryTermsByLocale[otherLocale]);

    if (terms.length === 0 && otherLocaleTerms.length > 0) {
      const crossLocaleCanaryMatches = texts.flatMap((text) =>
        markGlossaryText(text, otherLocaleTerms).filter((token) => token.type === "term")
      );

      if (crossLocaleCanaryMatches.length === 0) {
        failures.push(`${locale} glossary isolation check must keep a cross-locale canary that would fail if another locale's terms were reused.`);
      }
    }
  }

  for (const locale of siteLocales) {
    for (const otherLocale of siteLocales) {
      if (locale === otherLocale) {
        continue;
      }

      const terms = glossaryTermsByLocale[locale];
      const otherTermsById = new Map(glossaryTermsByLocale[otherLocale].map((term) => [term.id, term]));

      for (const term of terms) {
        const otherTerm = otherTermsById.get(term.id);
        if (otherTerm === undefined) {
          continue;
        }

        for (const field of ["label", "summary", "detail"] as const) {
          if (normalizeComparableGlossaryText(term[field]) === normalizeComparableGlossaryText(otherTerm[field])) {
            failures.push(
              `${locale} glossary term ${term.id} must not reuse ${otherLocale} ${field}; localized glossary cards need locale-owned short and long copy.`
            );
          }
        }
      }
    }
  }

  for (const hardcodedLocale of siteLocales) {
    if (glossarySheet.includes(`getGlossaryManifest("${hardcodedLocale}")`)) {
      failures.push(`GlossarySheet.astro must not hard-code ${hardcodedLocale}; sheet content must come from the current route locale.`);
    }
  }
}

function collectGlossaryCandidateTexts(locale: SupportedLocale): readonly string[] {
  return [
    ...collectPublicPageTexts(publicPagesByLocale[locale]),
    ...glossaryCanaryTextsByLocale[locale]
  ];
}

function collectPublicPageTexts(pages: readonly PublicPage[]): readonly string[] {
  return pages.flatMap((page) => [
    page.label,
    page.heading,
    page.summary ?? "",
    ...page.items.flatMap((item) => [item.title, item.body, item.status]),
    ...page.details.flatMap((detail) => [detail.title, detail.body]),
    ...page.checks.flatMap((check) => [check.item, check.status, check.note])
  ]).filter((text) => text.trim().length > 0);
}

function normalizeComparableGlossaryText(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLocaleLowerCase();
}

function checkPublicPageContentContract(): void {
  for (const locale of siteLocales) {
    const pages = publicPagesByLocale[locale];

    if (pages.length !== publicPageIds.length) {
      failures.push(`publicPagesByLocale.${locale} must define every public page id.`);
    }

    const designPage = pages.find((entry) => entry.id === "design");
    if (designPage === undefined) {
      failures.push(`publicPagesByLocale.${locale} is missing design.`);
      continue;
    }

    if (designPage.items.length === 0) {
      failures.push(`publicPagesByLocale.${locale}.design must expose at least one public trust card.`);
    }

    if (designPage.checks.length === 0) {
      failures.push(`publicPagesByLocale.${locale}.design must expose at least one public trust evidence check.`);
    }
  }
}

function checkPublicPageRouteContract(): void {
  for (const locale of siteLocales) {
    const seenIds = new Set<string>();
    const seenPaths = new Set<string>();

    for (const page of publicPagesByLocale[locale]) {
      if (seenIds.has(page.id)) {
        failures.push(`publicPagesByLocale.${locale} has duplicate id ${page.id}.`);
      }

      if (seenPaths.has(page.path)) {
        failures.push(`publicPagesByLocale.${locale} has duplicate path ${page.path}.`);
      }

      seenIds.add(page.id);
      seenPaths.add(page.path);

      if (!publicPageIds.includes(page.id as (typeof publicPageIds)[number])) {
        failures.push(`publicPagesByLocale.${locale} includes unknown id ${page.id}.`);
      }

      if (page.basePath !== `/${page.id}`) {
        failures.push(`publicPagesByLocale.${locale}.${page.id} basePath must be /${page.id}. Found ${page.basePath}.`);
      }

      if (page.path !== `/${locale}/${page.id}`) {
        failures.push(`publicPagesByLocale.${locale}.${page.id} path must be /${locale}/${page.id}. Found ${page.path}.`);
      }

      if (page.label.trim().length === 0 || page.heading.trim().length === 0) {
        failures.push(`publicPagesByLocale.${locale}.${page.id} must expose a non-empty label and heading.`);
      }

      if (page.summary !== undefined && page.summary.trim().length === 0) {
        failures.push(`publicPagesByLocale.${locale}.${page.id} summary must be omitted instead of left empty.`);
      }

      for (const forbiddenSummary of ["정리할 자리입니다", "모아둘 자리입니다", "준비 중입니다"]) {
        if (page.summary?.includes(forbiddenSummary)) {
          failures.push(`publicPagesByLocale.${locale}.${page.id} summary must not expose scaffold copy: ${forbiddenSummary}.`);
        }
      }
    }
  }

  expectExactStringList(
    publicEntryPaths,
    ["/", ...publicPageIds.map((id) => `/${id}`)],
    "publicEntryPaths must list non-locale negotiation entries."
  );
}

function parseWebpubCandidateContract(content: string): WebpubCandidateContract {
  return {
    siteUrl: readTomlString(content, "site_url"),
    canonicalDomain: readTomlString(content, "canonical_domain"),
    domainStatus: readTomlString(content, "domain_status"),
    language: readTomlString(content, "language"),
    defaultLocale: readTomlString(content, "default_locale"),
    fallbackLocale: readTomlString(content, "fallback_locale"),
    locales: readTomlStringArray(content, "locales"),
    localePolicy: readTomlString(content, "locale_policy"),
    candidatePublicDomains: readTomlStringArray(content, "candidate_public_domains"),
    pages: readTomlPageUrls(content),
    robotsEnabled: readRobotsBoolean(content, "enabled"),
    robotsDisallow: readRobotsStringArray(content, "disallow")
  };
}

function readTomlString(content: string, key: string): string | null {
  const match = content.match(new RegExp(`^${escapeRegExp(key)}\\s*=\\s*"([^"]*)"`, "m"));
  return match?.[1] ?? null;
}

function readTomlStringArray(content: string, key: string): readonly string[] {
  const match = content.match(new RegExp(`^${escapeRegExp(key)}\\s*=\\s*\\[(.*)\\]`, "m"));
  if (match === null) {
    return [];
  }

  return Array.from(match[1].matchAll(/"([^"]*)"/g), (entry) => entry[1]);
}

function readTomlPageUrls(content: string): readonly string[] {
  const urls: string[] = [];
  const pageBlocks = content.split(/\[\[pages\]\]/g).slice(1);

  for (const block of pageBlocks) {
    const url = readTomlString(block.trimStart(), "url");
    if (url !== null) {
      urls.push(url);
    }
  }

  return urls;
}

function readLlmsCoreLinks(content: string): readonly string[] {
  const links: string[] = [];
  const coreLinksStart = content.indexOf("## Core Links");
  if (coreLinksStart === -1) {
    return links;
  }

  const rest = content.slice(coreLinksStart + "## Core Links".length);
  const nextSection = rest.search(/\n##\s+/);
  const coreLinksBlock = nextSection === -1 ? rest : rest.slice(0, nextSection);

  for (const match of coreLinksBlock.matchAll(/^- `([^`]+)`:/gm)) {
    links.push(match[1]);
  }

  return links;
}

function readRobotsBoolean(content: string, key: string): boolean | null {
  const robotsBlock = readRobotsBlock(content);
  const match = robotsBlock.match(new RegExp(`^${escapeRegExp(key)}\\s*=\\s*(true|false)`, "m"));
  return match === null ? null : match[1] === "true";
}

function readRobotsStringArray(content: string, key: string): readonly string[] {
  return readTomlStringArray(readRobotsBlock(content), key);
}

function readRobotsBlock(content: string): string {
  const start = content.indexOf("[robots]");
  if (start === -1) {
    return "";
  }

  const rest = content.slice(start + "[robots]".length);
  const nextSection = rest.search(/\n\[/);
  return nextSection === -1 ? rest : rest.slice(0, nextSection);
}

function expectEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    failures.push(`${message} Found ${JSON.stringify(actual)}.`);
  }
}

function expectExactStringList(
  actual: readonly string[],
  expected: readonly string[],
  message: string
): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    failures.push(`${message} Expected ${expectedJson}. Found ${actualJson}.`);
  }
}

async function readText(path: string): Promise<string> {
  return await readFile(join(root, path), "utf8");
}

async function readPackageJson(path: string): Promise<PackageJson> {
  const parsed: unknown = JSON.parse(await readText(path));

  if (!isRecord(parsed)) {
    throw new Error(`${path} must be a JSON object.`);
  }

  return {
    version: typeof parsed.version === "string" ? parsed.version : null,
    dependencies: readStringRecord(parsed.dependencies),
    scripts: readStringRecord(parsed.scripts)
  };
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(join(root, path));
    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return false;
    }

    throw error;
  }
}

function readRootArgument(): string {
  const rootFlagIndex = process.argv.indexOf("--root");
  if (rootFlagIndex === -1) {
    return resolve(".");
  }

  const value = process.argv[rootFlagIndex + 1];
  if (value === undefined || value.trim().length === 0) {
    console.error("--root requires a path.");
    process.exit(1);
  }

  return resolve(value);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readStringRecord(value: unknown): Readonly<Record<string, string>> {
  if (!isRecord(value)) {
    return {};
  }

  const output: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "string") {
      output[key] = entry;
    }
  }

  return output;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
