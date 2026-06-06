import { access, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { publicPages } from "../src/content/public-pages";

const EXPECTED_CANDIDATE_DOMAIN = "8ailors.xyz";
const FORBIDDEN_DISCOVERY_OUTPUTS = [
  "public/sitemap.xml",
  "public/rss.xml",
  "public/atom.xml",
  "public/feed.json"
] as const;

const REQUIRED_WEBPUB_PAGES = ["/", ...publicPages.map((page) => page.path)];
const FORBIDDEN_LLMS_PATTERNS = [
  { pattern: /https?:\/\//i, reason: "absolute URLs are not allowed before launch" },
  { pattern: /\blocalhost(?::\d+)?\b/i, reason: "local URLs are not public discovery content" },
  { pattern: /\b127\.0\.0\.1(?::\d+)?\b/, reason: "local URLs are not public discovery content" },
  { pattern: /\bstaging\.[a-z0-9.-]+\b/i, reason: "staging URLs are not public discovery content" },
  { pattern: /\binternal\.[a-z0-9.-]+\b/i, reason: "internal URLs are not public discovery content" },
  { pattern: /\/(?:internal|admin|customers?)(?:\/|\b)/i, reason: "private paths are forbidden" },
  { pattern: /\b(?:secret|token|api[_-]?key)\s*[:=]/i, reason: "secret-like values are forbidden" },
  { pattern: /\bsk-[a-z0-9_-]{12,}\b/i, reason: "secret-like values are forbidden" }
] as const;

interface WebpubCandidateContract {
  readonly siteUrl: string | null;
  readonly canonicalDomain: string | null;
  readonly domainStatus: string | null;
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
await checkLayoutNoindex();
await checkDesignSystemConsumerContract();
await checkNoLocalStatusBadge();
await checkNoLocalTextLink();
await checkNoLocalSkipLink();
await checkNoViewportScaledTypography();
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

  if (
    contract.candidatePublicDomains.length !== 1 ||
    contract.candidatePublicDomains[0] !== EXPECTED_CANDIDATE_DOMAIN
  ) {
    failures.push(
      `webpub.toml candidate_public_domains must be exactly ["${EXPECTED_CANDIDATE_DOMAIN}"].`
    );
  }

  for (const path of REQUIRED_WEBPUB_PAGES) {
    if (!contract.pages.includes(path)) {
      failures.push(`webpub.toml is missing page ${path}.`);
    }
  }

  expectExactStringList(
    contract.pages,
    REQUIRED_WEBPUB_PAGES,
    "webpub.toml pages must exactly match src/content/public-pages.ts."
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
    "public/llms.txt Core Links must exactly match src/content/public-pages.ts."
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

async function checkLayoutNoindex(): Promise<void> {
  const content = await readText("src/layouts/BaseLayout.astro");

  if (!content.includes('name="robots"') || !content.includes('content="noindex,nofollow"')) {
    failures.push("BaseLayout.astro must keep noindex,nofollow before launch.");
  }
}

async function checkDesignSystemConsumerContract(): Promise<void> {
  const [
    packageJson,
    globalCss,
    tokensCss,
    homePage,
    surfacePage,
    publicShareDock,
    layout,
    astroConfig,
    designSystemPackageJson,
    designSystemConsumerContract,
    designSystemTokenCss,
    designSystemExpressiveFontCss,
    designSystemComponentCss
  ] = await Promise.all([
    readPackageJson("package.json"),
    readText("src/styles/global.css"),
    readText("src/styles/tokens.css"),
    readText("src/pages/index.astro"),
    readText("src/pages/[surface].astro"),
    readText("src/components/PublicShareDock.astro"),
    readText("src/layouts/BaseLayout.astro"),
    readText("astro.config.mjs"),
    readPackageJson("../zdp-design-system/package.json"),
    readText("../zdp-design-system/docs/CONSUMER_CONTRACT.md"),
    readText("../zdp-design-system/src/styles/tokens.css"),
    readText("../zdp-design-system/src/styles/expressive-fonts.css"),
    readText("../zdp-design-system/src/styles/components.css")
  ]);

  if (packageJson.version !== "0.4.67") {
    failures.push(
      "package.json version must be 0.4.67 for the glossary trigger inline padding contract."
    );
  }

  if (!packageJson.scripts.check.startsWith("bun run check:glossary &&")) {
    failures.push("package.json scripts.check must validate glossary freshness before Astro checks.");
  }

  if (packageJson.scripts.check.includes("bun run glossary:generate")) {
    failures.push("package.json scripts.check must not generate glossary files before stale-manifest checks.");
  }

  if (!packageJson.scripts.check.includes("bun run check:glossary")) {
    failures.push("package.json scripts.check must include bun run check:glossary.");
  }

  for (const requiredText of [
    "fileURLToPath",
    "localizationContentPackageEntry",
    "../../platform/zdp-platform-localization/packages/content/src/index.ts",
    "resolve:",
    "alias:",
    "'@zdp/localization-content': localizationContentPackageEntry"
  ]) {
    if (!astroConfig.includes(requiredText)) {
      failures.push(`astro.config.mjs is missing localization content alias contract ${requiredText}.`);
    }
  }

  if (packageJson.scripts["check:glossary"] !== "bun scripts/check-glossary.ts") {
    failures.push('package.json scripts.check:glossary must be "bun scripts/check-glossary.ts".');
  }

  if (packageJson.scripts["glossary:generate"] !== "bun scripts/generate-glossary.ts") {
    failures.push('package.json scripts.glossary:generate must be "bun scripts/generate-glossary.ts".');
  }

  if (packageJson.dependencies["zdp-design-system"] !== "file:../zdp-design-system") {
    failures.push('package.json dependencies.zdp-design-system must stay "file:../zdp-design-system".');
  }

  if ("@fontsource/playwrite-au-vic-guides" in packageJson.dependencies) {
    failures.push("zdp-web-public must use zdp-design-system/brand-fonts.css instead of owning @fontsource/playwrite-au-vic-guides.");
  }

  if (designSystemPackageJson.version !== "0.41.15") {
    failures.push("Sibling zdp-design-system package must be version 0.41.15 for the Storybook accessibility contract.");
  }

  if (
    designSystemPackageJson.scripts["consumer:check"] !==
    "bun scripts/check-consumer-contract.ts"
  ) {
    failures.push("Sibling zdp-design-system package must expose consumer:check.");
  }

  for (const requiredText of [
    '@import "zdp-design-system/styles.css";',
    '@import "zdp-design-system/brand-fonts.css";',
    '@import "zdp-design-system/locale-fonts.css";',
    "--font-sans: var(--zdp-font-family-multiscript);",
    "--font-title: var(--zdp-font-family-latin);",
    "--font-logo: var(--zdp-font-family-brand,",
    '[data-zdp-theme="dark"]',
    "color-scheme: dark;",
    "--shadow-soft: none;",
    "--radius-pill: var(--zdp-radius-md);"
  ]) {
    const source =
      requiredText.startsWith("@import") ||
      requiredText.startsWith("var(")
        ? globalCss
        : tokensCss;

    if (!source.includes(requiredText)) {
      failures.push(`Design system consumer contract is missing ${requiredText}.`);
    }
  }

  for (const requiredText of [
    "font-family: var(--font-logo);",
    ".zdp-surface-reset .brand .brand-name",
    "font-weight: var(--zdp-font-weight-semibold);",
    "font-weight: var(--zdp-font-weight-regular);"
  ]) {
    if (!globalCss.includes(requiredText)) {
      failures.push(`Brand wordmark style is missing ${requiredText}.`);
    }
  }

  if (globalCss.includes(".page-hero--docs .page-hero__inner,\n.design-doc__layout")) {
    failures.push("Design docs must not widen the hero and document layout away from the header container rail.");
  }

  if (
    /\.page-hero--docs[\s\S]{0,220}max-inline-size:\s*var\(--zdp-breakpoint-wide\)/.test(globalCss) ||
    /\.design-doc__layout[\s\S]{0,220}max-inline-size:\s*var\(--zdp-breakpoint-wide\)/.test(globalCss)
  ) {
    failures.push("Design docs must not use breakpoint-wide for the hero or document container.");
  }

  for (const requiredText of [
    "# Consumer Contract",
    "Astro",
    "Svelte",
    "Tauri",
    "Flutter",
    "ConfirmAction",
    "Divider",
    "EmptyState",
    "Grid",
    "Icon",
    "Inline",
    "Kbd",
    "KeyValue",
    "Link",
    "ShareDock",
    "ShortcutHint",
    "SkipLink",
    "Stack",
    "Table",
    "Toolbar",
    "VisuallyHidden",
    "tokens/zdp.tokens.json",
    ".zdp-surface-reset",
    ".zdp-page",
    ".zdp-container",
    ".zdp-section",
    ".zdp-page-header",
    ".zdp-visually-hidden",
    ".zdp-stack",
    ".zdp-inline",
    ".zdp-divider",
    ".zdp-grid",
    ".zdp-icon",
    ".zdp-share-dock",
        ".zdp-toolbar",
        ".zdp-command-field",
        ".zdp-command-field__input",
        ".zdp-kbd",
        ".zdp-shortcut-hint",
        "ariaKeyShortcuts",
        "실제 keydown",
        "control.choiceSize",
    "control.switchWidth",
    "control.scrollbarSize",
    "font.family.brand",
    "font.family.expressionSans",
    "expressive-fonts.css",
    "brand-fonts.css",
    ".zdp-brand-wordmark",
    "color.scrollbar.track",
    "control.glyphMd",
    "zdpShareIcons",
    "zdp-design-system/share",
    "ThemeToggle은 light/dark",
    ".zdp-theme-toggle",
    "onconfirm",
    "readonly",
    "zdp-design-system/src/..."
  ]) {
    if (!designSystemConsumerContract.includes(requiredText)) {
      failures.push(`Sibling design-system consumer contract is missing ${requiredText}.`);
    }
  }

  for (const [path, content, requiredTexts] of [
    [
      "src/layouts/BaseLayout.astro",
      layout,
      [
        'html lang="ko" data-zdp-theme="light"',
        'body class="zdp-surface-reset"',
        'zdp-web-public-theme',
        'class="shell zdp-page zdp-page--canvas"',
        'site-header zdp-container zdp-container--lg zdp-container--padding-md',
        'site-footer zdp-container zdp-container--lg zdp-container--padding-md',
        'class="zdp-skip-link"',
        'href="#content"',
        'main id="content"',
        'tabindex="-1"',
        'class="zdp-link zdp-link--muted"',
        'aria-current={item.href === currentPath ? "page" : undefined}',
        'class="brand zdp-brand-lockup"',
        'class="brand-mark zdp-brand-lockup__mark"',
        'class="brand-name zdp-brand-wordmark zdp-brand-wordmark--compact"',
        'data-site-theme-toggle',
        'data-zdp-theme-toggle',
        'data-zdp-theme-state="light"',
        'aria-label="다크 모드로 전환"',
        'aria-pressed="false"',
        "라이트 모드로 전환",
        "다크 모드로 전환",
        "brand-mark__ship",
        "brand-mark__sail",
        "brand-mark__hull",
        '{ href: "/design", label: "디자인" }',
        '{ href: "/security", label: "보안" }',
        '{ href: "/labs", label: "실험실" }',
        '{ href: "/roadmap", label: "로드맵" }'
      ]
    ],
    [
      "src/pages/index.astro",
      homePage,
      [
        "zdp-button zdp-button--md zdp-button--primary",
        "zdp-button zdp-button--md zdp-button--secondary",
        "hero zdp-section zdp-section--spacing-xl",
        "hero-copy-block zdp-container zdp-container--lg zdp-container--padding-md",
        "section zdp-section zdp-section--spacing-lg zdp-divider zdp-divider--horizontal zdp-divider--subtle",
        "section-inner zdp-container zdp-container--lg zdp-container--padding-md",
        "zdp-inline zdp-inline--gap-sm zdp-inline--align-center",
        "zdp-toolbar zdp-toolbar--gap-md zdp-toolbar--align-center",
        "zdp-toolbar__main",
        "zdp-toolbar__actions",
        "surface-grid zdp-grid zdp-grid--columns-three zdp-grid--gap-md",
        "zdp-surface zdp-surface--panel zdp-surface--padding-lg",
        "zdp-empty-state zdp-empty-state--raised",
        "zdp-empty-state__body",
        "zdp-empty-state__actions",
        "zdp-badge zdp-badge--primary zdp-badge--sm",
        "zdp-link"
      ]
    ],
    [
      "src/pages/[surface].astro",
      surfacePage + publicShareDock,
      [
        "page-hero zdp-section zdp-section--spacing-xl",
        "page-hero__inner zdp-container zdp-container--lg zdp-container--padding-md",
        "zdp-page-header zdp-page-header--align-start",
        "zdp-page-header__body",
        "zdp-page-header__title",
        "zdp-page-header__summary",
        "zdp-badge zdp-badge--primary zdp-badge--sm",
        "zdp-badge zdp-badge--neutral zdp-badge--sm",
        "zdp-button zdp-button--md zdp-button--secondary",
        "zdp-page-header__actions",
        "zdp-breadcrumb page-breadcrumb",
        "zdp-breadcrumb__link",
        "zdp-breadcrumb__current",
        "design-doc zdp-section zdp-section--spacing-lg zdp-divider zdp-divider--horizontal zdp-divider--subtle",
        "design-doc__layout zdp-container zdp-container--lg zdp-container--padding-md",
        "design-doc__rail",
        "design-doc__nav",
        "design-doc__article",
        "design-showcase",
        "showcase-group",
        "swatch-grid",
        "swatch-card",
        "typography-specimen zdp-surface zdp-surface--panel zdp-surface--padding-md",
        "components-preview zdp-surface zdp-surface--panel zdp-surface--padding-lg",
        "preview-row zdp-inline",
        "기본 방향",
        "컴포넌트 & 토큰 카탈로그",
        "Color Palette",
        "Typography",
        "Interactive Components",
        "기준 토큰",
        "검증 체크리스트",
        "zdp-visually-hidden",
        "zdp-key-value zdp-key-value--columns-two",
        "zdp-table-wrap",
        "zdp-table zdp-table--density-compact",
        "zdp-table__caption zdp-table__caption--hidden",
        "zdp-kbd zdp-kbd--md",
        'scope="col"',
        'scope="row"',
        'import PublicShareDock from "../components/PublicShareDock.astro";',
        'import { zdpShareIcons, type ZdpShareIconName } from "zdp-design-system/share";',
        'placement?: "side"',
        'placement="rail"',
        "zdp-share-dock zdp-share-dock--${placement}",
        "zdp-share-dock__list",
        "zdp-share-action",
        "zdp-share-action__tooltip",
        'icon: "telegram"',
        'icon: "line"',
        'icon: "whatsapp"',
        'icon: "x"',
        'icon: "reddit"',
        "zdpShareIcons[action.icon]",
        "zdpShareIcons[platform.icon]",
        "zdp-share-icon zdp-share-icon--${platform.icon}",
        "data-share-panel",
        "data-share-action={action.id}",
        'data-share-platform={platform.id}',
        "data-share-label",
        "링크 복사",
        "기기 공유",
        "텔레그램",
        "라인",
        "왓츠앱",
        "레딧",
        "buildShareHref",
        "navigator.share",
        "navigator.clipboard.writeText",
        "복사 권한 필요",
        "zdp-empty-state surface-placeholder",
        "핵심 정보",
        'aria-current="page"'
      ]
    ]
  ] as const) {
    for (const requiredText of requiredTexts) {
      if (!content.includes(requiredText)) {
        failures.push(`${path} is missing design system usage ${requiredText}.`);
      }
    }
  }

  for (const requiredText of [
    ".zdp-skip-link",
    ".zdp-skip-link:focus-visible",
    ".zdp-visually-hidden",
    ".zdp-page",
    ".zdp-page--canvas",
    ".zdp-container",
    ".zdp-container--lg",
    ".zdp-container--padding-md",
    ".zdp-section",
    ".zdp-section--spacing-lg",
    ".zdp-section--spacing-xl",
    ".zdp-page-header",
    ".zdp-page-header__body",
    ".zdp-page-header__title",
    ".zdp-page-header__summary",
    ".zdp-page-header__actions",
    ".zdp-stack",
    ".zdp-stack--gap-md",
    ".zdp-inline",
    ".zdp-inline--gap-sm",
    ".zdp-divider",
    ".zdp-divider--horizontal",
    ".zdp-grid",
    ".zdp-grid--columns-three",
    ".zdp-grid--gap-md",
    ".zdp-icon",
    ".zdp-icon--sm",
    ".zdp-icon--md",
    ".zdp-share-dock",
    ".zdp-share-dock--side",
    ".zdp-share-dock--rail",
    ".zdp-share-dock--bottom",
    ".zdp-share-dock--inline",
    ".zdp-share-dock__list",
    ".zdp-share-action",
    ".zdp-share-action__tooltip",
    ".zdp-confirm-action",
    ".zdp-confirm-action__fill",
    ".zdp-confirm-action--danger",
    ".zdp-key-value",
    ".zdp-table-wrap",
    ".zdp-table",
    ".zdp-empty-state",
    ".zdp-toolbar",
    ".zdp-toolbar__main",
    ".zdp-toolbar__actions",
    ".zdp-kbd",
    ".zdp-kbd--md",
    ".zdp-shortcut-hint",
    ".zdp-shortcut-hint__separator",
    ".zdp-command-field",
    ".zdp-command-field__input",
    ".zdp-brand-wordmark",
    ".zdp-brand-lockup",
    "font-size: calc(var(--zdp-type-page-title-size) - 0.8rem)",
    "font-size: calc(var(--zdp-type-page-title-compact-size) - 0.5rem)",
    ".zdp-theme-toggle",
    ".zdp-theme-toggle__icon",
    "var(--zdp-color-focus-surface)",
    "var(--zdp-color-focus-line)",
    "position: fixed",
    "pointer-events: none",
    "pointer-events: auto",
    "clip: rect(0 0 0 0)",
    "clip-path: inset(50%)",
    "white-space: nowrap"
  ]) {
    if (!designSystemComponentCss.includes(requiredText)) {
      failures.push(`Sibling design-system component CSS is missing ${requiredText}.`);
    }
  }

  for (const requiredText of [
    ".showcase-group",
    ".swatch-card:hover",
    "--color-swatch-info-surface",
    "--color-swatch-info-ink",
    "--color-swatch-info-muted",
    "--color-swatch-info-line",
    "background: var(--color-swatch-info-surface)",
    "color: var(--color-swatch-info-ink)",
    "color: var(--color-swatch-info-muted)",
    ".typography-specimen",
    ".components-preview",
    ".preview-row",
    ".site-theme-toggle"
  ]) {
    if (!globalCss.includes(requiredText)) {
      failures.push(`src/styles/global.css is missing design showcase contract ${requiredText}.`);
    }
  }

  for (const forbiddenText of [".share-dock", ".share-action", ".share-icon"]) {
    if (globalCss.includes(forbiddenText)) {
      failures.push(`src/styles/global.css must not keep local share dock styling ${forbiddenText}.`);
    }
  }

  if (surfacePage.includes('class="swatch-info" style="color:')) {
    failures.push("src/pages/[surface].astro must not override swatch-info text color inline.");
  }

  for (const forbiddenText of ["design-doc__toc", "On this page"]) {
    if (surfacePage.includes(forbiddenText)) {
      failures.push(`src/pages/[surface].astro must not keep duplicate page TOC text ${forbiddenText}.`);
    }

    if (globalCss.includes(forbiddenText)) {
      failures.push(`src/styles/global.css must not keep duplicate page TOC styling ${forbiddenText}.`);
    }
  }

  for (const requiredText of [
    "scrollbar-color: var(--zdp-color-scrollbar-thumb) var(--zdp-color-scrollbar-track)",
    "scrollbar-width: thin",
    "html::-webkit-scrollbar",
    "body::-webkit-scrollbar",
    "height: var(--zdp-control-scrollbar-size)",
    "width: var(--zdp-control-scrollbar-size)",
    "background: var(--zdp-color-scrollbar-track)",
    "background-color: var(--zdp-color-scrollbar-thumb)",
    "background-color: var(--zdp-color-scrollbar-thumb-hover)",
    "html::-webkit-scrollbar-corner",
    "body::-webkit-scrollbar-corner"
  ]) {
    if (!globalCss.includes(requiredText)) {
      failures.push(`src/styles/global.css is missing root themed scrollbar contract ${requiredText}.`);
    }
  }

  for (const requiredText of [
    "scrollbar-width: thin",
    "::-webkit-scrollbar-thumb",
    "var(--zdp-control-scrollbar-size)",
    "--zdp-font-family-brand",
    "--zdp-font-family-expression-sans",
    "--zdp-font-family-expression-editorial",
    "--zdp-type-page-title-size: 2.75rem",
    "--zdp-type-page-title-compact-size: 2rem"
  ]) {
    if (!designSystemTokenCss.includes(requiredText)) {
      failures.push(`Sibling design-system token CSS is missing ${requiredText}.`);
    }
  }

  for (const requiredText of [
    "family=Google+Sans",
    "family=Tangerine:wght@400;700",
    "family=Libertinus+Keyboard"
  ]) {
    if (!designSystemExpressiveFontCss.includes(requiredText)) {
      failures.push(`Sibling design-system expressive font CSS is missing ${requiredText}.`);
    }
  }
}

async function checkNoLocalStatusBadge(): Promise<void> {
  const [globalCss, homePage, surfacePage] = await Promise.all([
    readText("src/styles/global.css"),
    readText("src/pages/index.astro"),
    readText("src/pages/[surface].astro")
  ]);

  if (/(^|\n)\s*\.status\b/.test(globalCss)) {
    failures.push("src/styles/global.css must not define local .status badge styling.");
  }

  for (const [path, content] of [
    ["src/pages/index.astro", homePage],
    ["src/pages/[surface].astro", surfacePage]
  ] as const) {
    if (content.includes('class="status"')) {
      failures.push(`${path} must use zdp-badge instead of local status badge markup.`);
    }
  }
}

async function checkNoLocalTextLink(): Promise<void> {
  const [globalCss, homePage, layout] = await Promise.all([
    readText("src/styles/global.css"),
    readText("src/pages/index.astro"),
    readText("src/layouts/BaseLayout.astro")
  ]);

  if (/(^|\n)\s*\.text-link\b/.test(globalCss)) {
    failures.push("src/styles/global.css must not define local .text-link styling.");
  }

  if (homePage.includes('class="text-link"')) {
    failures.push("src/pages/index.astro must use zdp-link instead of local text-link markup.");
  }

  if (layout.includes("<a href={item.href}")) {
    failures.push("BaseLayout.astro nav links must use zdp-link instead of local anchor-only markup.");
  }

  for (const requiredText of [
    ".zdp-surface-reset .brand:focus-visible",
    ".site-theme-toggle.zdp-theme-toggle[data-zdp-theme-state=\"dark\"]",
    ".site-theme-toggle.zdp-theme-toggle:hover:not(:disabled)",
    ".site-theme-toggle.zdp-theme-toggle:focus-visible",
    ".zdp-surface-reset .nav-list .zdp-link--muted:not(:focus-visible)",
    ".zdp-surface-reset .nav-list .zdp-link--muted:not(:focus-visible)::after",
    ".zdp-surface-reset .nav-list .zdp-link--muted:hover:not(:focus-visible)::after",
    ".zdp-surface-reset .nav-list .zdp-link--muted[aria-current=\"page\"]:not(:focus-visible)::after",
    ".zdp-surface-reset .nav-list .zdp-link--muted[aria-current=\"page\"]:not(:focus-visible)"
  ]) {
    if (!globalCss.includes(requiredText)) {
      failures.push(`src/styles/global.css is missing shared link focus bridge ${requiredText}.`);
    }
  }
}

async function checkNoLocalSkipLink(): Promise<void> {
  const [globalCss, layout] = await Promise.all([
    readText("src/styles/global.css"),
    readText("src/layouts/BaseLayout.astro")
  ]);

  if (/(^|\n)\s*\.skip-link\b/.test(globalCss)) {
    failures.push("src/styles/global.css must not define local .skip-link styling.");
  }

  if (layout.includes('class="skip-link"')) {
    failures.push("src/layouts/BaseLayout.astro must use zdp-skip-link instead of local skip-link markup.");
  }
}

async function checkNoViewportScaledTypography(): Promise<void> {
  const globalCss = await readText("src/styles/global.css");

  if (/font-size:\s*clamp\([^;]*vw/i.test(globalCss) || /font-size:[^;]*\d(?:\.\d+)?vw/i.test(globalCss)) {
    failures.push("src/styles/global.css must use stepped font sizes instead of viewport-scaled font-size values.");
  }

  if (/line-height:\s*(?:0\.\d+|1);/.test(globalCss)) {
    failures.push("src/styles/global.css must avoid cramped heading line-height values that can clip text.");
  }

  for (const forbiddenText of [
    ".page-hero h1 {\n  margin: 0;\n  max-width: 13ch",
    "font-size: 5rem",
    ".page-hero h1 {\n    font-size: 3.5rem"
  ]) {
    if (globalCss.includes(forbiddenText)) {
      failures.push(`src/styles/global.css must not use oversized generic page title styling: ${forbiddenText}.`);
    }
  }

  for (const requiredText of [
    "font-size: var(--zdp-type-page-title-size);",
    "line-height: var(--zdp-type-page-title-line-height);",
    "font-size: var(--zdp-type-page-title-compact-size);"
  ]) {
    if (!globalCss.includes(requiredText)) {
      failures.push(`src/styles/global.css must use moderated design-system page title token: ${requiredText}.`);
    }
  }
}

async function checkGlossarySheetContract(): Promise<void> {
  const [
    layout,
    surfacePage,
    homePage,
    globalCss,
    glossaryData,
    glossaryText,
    glossarySheet,
    glossaryScript,
    glossaryYaml,
    glossaryManifest,
    glossaryBuild,
    glossaryGenerate,
    glossaryCheck
  ] =
    await Promise.all([
      readText("src/layouts/BaseLayout.astro"),
      readText("src/pages/[surface].astro"),
      readText("src/pages/index.astro"),
      readText("src/styles/global.css"),
      readText("src/content/glossary.ts"),
      readText("src/components/GlossaryText.astro"),
      readText("src/components/GlossarySheet.astro"),
      readText("src/scripts/glossary-sheet.ts"),
      readText("glossary/terms/public.yaml"),
      readText("src/content/glossary-manifest.json"),
      readText("scripts/glossary-build.ts"),
      readText("scripts/generate-glossary.ts"),
      readText("scripts/check-glossary.ts")
    ]);

  for (const requiredText of [
    'import GlossarySheet from "../components/GlossarySheet.astro";',
    "<GlossarySheet />"
  ]) {
    if (!layout.includes(requiredText)) {
      failures.push(`BaseLayout.astro is missing glossary sheet shell ${requiredText}.`);
    }
  }

  for (const [path, content, requiredTexts] of [
    [
      "src/content/glossary.ts",
      glossaryData,
      [
        "export type GlossaryLocale",
        'import runtimeGlossaryManifest from "./glossary-manifest.json";',
        "const publicGlossaryManifest",
        "matchPhrases",
        "adPolicy",
        "getGlossaryManifest",
        "markGlossaryText"
      ]
    ],
        [
          "src/components/GlossaryText.astro",
          glossaryText,
          [
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
            "data-glossary-root",
            'role="dialog"',
            'aria-modal="true"',
            'aria-hidden="true"',
            'data-zdp-ad-exclude="true"',
            'data-zdp-term-placement="right-sheet"',
            'data-zdp-term-surface="sheet"',
            "data-glossary-close",
            "data-glossary-summary",
            "data-glossary-detail",
            "data-glossary-source",
            "data-glossary-manifest"
          ]
        ],
    [
      "src/scripts/glossary-sheet.ts",
      glossaryScript,
      [
        "data-glossary-term",
            "openSheet",
            "closeSheet",
            "Escape",
            "trapFocus",
            "dataset.zdpTermId",
            "dataset.zdpTermPlacement",
            "getCurrentPlacement",
            "getClientRects().length > 0",
            "requestAnimationFrame"
          ]
        ],
    [
      "src/styles/global.css",
      globalCss,
      [
        ".glossary-trigger",
        ".glossary-trigger:focus-visible",
            ".glossary-sheet__backdrop",
            ".glossary-sheet",
            ".glossary-sheet.is-open",
            "transform: translateX(100%)",
            "transform: translateY(100%)",
            "height: min(82dvh, 34rem)"
      ]
    ],
    [
      "glossary/terms/public.yaml",
      glossaryYaml,
      [
        "terms:",
        "id: design.oklch",
        "id: security.privacy-access-broker",
        "id: security.owasp-asvs",
        "id: operations.rate-limit",
        "products:",
        "- zdp-web-public",
        "sites:",
        "- web-public-home",
        "translation_status: reviewed",
        "trigger: click",
        "surface: term-sheet",
            "desktop_placement: right-sheet",
            "mobile_placement: bottom-sheet",
            "hover_card: forbidden",
            "term_sheet: forbidden",
            "detail_page: future-experiment-only"
          ]
        ],
    [
      "src/content/glossary-manifest.json",
      glossaryManifest,
      [
        '"id": "design.oklch"',
            '"id": "security.privacy-access-broker"',
            '"id": "security.owasp-asvs"',
            '"id": "operations.rate-limit"',
            '"slot": "glossary-detail-design-oklch"',
            '"matchPhrases"'
          ]
        ],
    [
      "scripts/glossary-build.ts",
      glossaryBuild,
      [
        "buildRuntimeGlossaryManifest",
        "buildGlossaryManifest",
            "GLOSSARY_RUNTIME_MANIFEST_PATH",
            "src/content/glossary-manifest.json",
            "toRuntimeGlossaryEntry",
            "hover-card advertising",
            "Term Sheet advertising",
            "glossary-detail-${term.id.replaceAll"
          ]
        ],
    [
      "scripts/generate-glossary.ts",
      glossaryGenerate,
      [
        "buildRuntimeGlossaryManifest",
        "serializeRuntimeManifest",
        "writeFile",
        "Glossary manifest generated"
      ]
    ],
    [
      "scripts/check-glossary.ts",
      glossaryCheck,
      [
        "buildRuntimeGlossaryManifest",
        "GLOSSARY_RUNTIME_MANIFEST_PATH",
        "is stale",
        "Run bun run glossary:generate",
        "Glossary check passed"
      ]
    ],
    [
      "src/pages/[surface].astro",
      surfacePage,
      [
        'import GlossaryText from "../components/GlossaryText.astro";',
        "heroSummary &&",
        "<GlossaryText text={overviewText} />",
        "<GlossaryText text={section.body} />",
        "<GlossaryText text={fact.description} />",
        "<GlossaryText text={check.note} />"
      ]
    ],
    [
      "src/pages/index.astro",
      homePage,
      [
        'import GlossaryText from "../components/GlossaryText.astro";',
        "const homeSections = publicPages.filter",
        "section.summary &&",
        "<GlossaryText text={item.body} />"
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
    "mouseenter",
    "mouseover",
    "data-glossary-hover",
    "data-glossary-ads",
    "data-glossary-ad-slot",
    "data-glossary-ad-note",
    ".glossary-sheet__ad-slot",
    'root.getAttribute("data-glossary-ads")',
    ":hover .glossary-sheet",
    "role=\"tooltip\""
  ]) {
    if (
      glossaryScript.includes(forbiddenText) ||
      glossarySheet.includes(forbiddenText) ||
      globalCss.includes(forbiddenText)
    ) {
      failures.push(`Glossary contract must stay click-sheet based, not hover-tooltip based: ${forbiddenText}.`);
    }
  }

  if (
    /\.glossary-trigger(?:\s|\{)[\s\S]{0,260}color:\s*var\(--color-ink\);/.test(globalCss) ||
    /\.glossary-trigger:hover(?:\s|\{)[\s\S]{0,160}color:\s*var\(--color-accent-strong\);/.test(globalCss)
  ) {
    failures.push("Glossary trigger text must inherit the surrounding sentence color in light and dark themes.");
  }

  if (
    !globalCss.includes(
      ".glossary-trigger:hover {\n  background: var(--color-accent-wash);\n  color: inherit;"
    )
  ) {
    failures.push("Glossary trigger hover must keep color: inherit.");
  }

  if (!/\.glossary-trigger\s*\{[\s\S]{0,180}padding:\s*0 0\.2rem;/.test(globalCss)) {
    failures.push("Glossary trigger must reserve readable inline padding.");
  }

  for (const forbiddenText of [
    "publicGlossaryManifestTerms",
    "Privacy Access Broker",
    "OWASP ASVS",
    "사람이 느끼는 밝기와 색 차이",
    "웹 애플리케이션 보안을 점검"
  ]) {
    if (glossaryData.includes(forbiddenText)) {
      failures.push(`src/content/glossary.ts must not duplicate YAML glossary source text: ${forbiddenText}.`);
    }
  }
}

function checkPublicPageContentContract(): void {
  const pagesThatMustHaveTrustCards = [
    "design"
  ] as const;

  for (const pageId of pagesThatMustHaveTrustCards) {
    const page = publicPages.find((entry) => entry.id === pageId);
    if (page === undefined) {
      failures.push(`publicPages is missing ${pageId}.`);
      continue;
    }

    if (page.items.length === 0) {
      failures.push(`publicPages.${pageId} must expose at least one public trust card.`);
    }

    if (page.checks.length === 0) {
      failures.push(`publicPages.${pageId} must expose at least one public trust evidence check.`);
    }
  }
}

function checkPublicPageRouteContract(): void {
  const seenIds = new Set<string>();
  const seenPaths = new Set<string>();

  for (const page of publicPages) {
    if (seenIds.has(page.id)) {
      failures.push(`publicPages has duplicate id ${page.id}.`);
    }

    if (seenPaths.has(page.path)) {
      failures.push(`publicPages has duplicate path ${page.path}.`);
    }

    seenIds.add(page.id);
    seenPaths.add(page.path);

    if (page.path !== `/${page.id}`) {
      failures.push(`publicPages.${page.id} path must be /${page.id}. Found ${page.path}.`);
    }

    if (page.label.trim().length === 0 || page.heading.trim().length === 0) {
      failures.push(`publicPages.${page.id} must expose a non-empty label and heading.`);
    }

    if (page.summary !== undefined && page.summary.trim().length === 0) {
      failures.push(`publicPages.${page.id} summary must be omitted instead of left empty.`);
    }

    for (const forbiddenSummary of [
      "정리할 자리입니다",
      "모아둘 자리입니다",
      "준비 중입니다"
    ]) {
      if (page.summary?.includes(forbiddenSummary)) {
        failures.push(`publicPages.${page.id} summary must not expose scaffold copy: ${forbiddenSummary}.`);
      }
    }
  }
}

function parseWebpubCandidateContract(content: string): WebpubCandidateContract {
  return {
    siteUrl: readTomlString(content, "site_url"),
    canonicalDomain: readTomlString(content, "canonical_domain"),
    domainStatus: readTomlString(content, "domain_status"),
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
