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
checkPublicPageContentContract();

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
    layout,
    designSystemPackageJson,
    designSystemConsumerContract
  ] = await Promise.all([
    readPackageJson("package.json"),
    readText("src/styles/global.css"),
    readText("src/styles/tokens.css"),
    readText("src/pages/index.astro"),
    readText("src/pages/[surface].astro"),
    readText("src/layouts/BaseLayout.astro"),
    readPackageJson("../zdp-design-system/package.json"),
    readText("../zdp-design-system/docs/CONSUMER_CONTRACT.md")
  ]);

  if (packageJson.version !== "0.4.1") {
    failures.push("package.json version must be 0.4.1 for the design-system consumer smoke contract.");
  }

  if (packageJson.dependencies["zdp-design-system"] !== "file:../zdp-design-system") {
    failures.push('package.json dependencies.zdp-design-system must stay "file:../zdp-design-system".');
  }

  if (designSystemPackageJson.version !== "0.13.0") {
    failures.push("Sibling zdp-design-system package must be version 0.13.0 for the consumer contract.");
  }

  if (
    designSystemPackageJson.scripts["consumer:check"] !==
    "bun scripts/check-consumer-contract.ts"
  ) {
    failures.push("Sibling zdp-design-system package must expose consumer:check.");
  }

  for (const requiredText of [
    '@import "zdp-design-system/styles.css";',
    '@import "zdp-design-system/locale-fonts.css";',
    "--font-sans: var(--zdp-font-family-multiscript);",
    "--shadow-soft: none;",
    "--radius-pill: var(--zdp-radius-md);"
  ]) {
    const source = requiredText.startsWith("@import") ? globalCss : tokensCss;

    if (!source.includes(requiredText)) {
      failures.push(`Design system consumer contract is missing ${requiredText}.`);
    }
  }

  for (const requiredText of [
    "# Consumer Contract",
    "Astro",
    "Svelte",
    "Tauri",
    "Flutter",
    "tokens/zdp.tokens.json",
    ".zdp-surface-reset",
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
        'body class="zdp-surface-reset"',
        'href="/design"',
        'href="/security"',
        'href="/payment-safety"',
        'href="/labs"',
        'href="/roadmap"'
      ]
    ],
    [
      "src/pages/index.astro",
      homePage,
      [
        "zdp-button zdp-button--md zdp-button--primary",
        "zdp-button zdp-button--md zdp-button--secondary",
        "zdp-surface zdp-surface--panel zdp-surface--padding-lg"
      ]
    ],
    [
      "src/pages/[surface].astro",
      surfacePage,
      [
        "zdp-callout zdp-callout--info",
        "zdp-callout__mark",
        "zdp-callout__body",
        "zdp-badge zdp-badge--primary zdp-badge--sm",
        "zdp-button zdp-button--md zdp-button--secondary"
      ]
    ]
  ] as const) {
    for (const requiredText of requiredTexts) {
      if (!content.includes(requiredText)) {
        failures.push(`${path} is missing design system usage ${requiredText}.`);
      }
    }
  }
}

function checkPublicPageContentContract(): void {
  const pagesThatMustHaveTrustCards = [
    "design",
    "security",
    "payment-safety",
    "labs",
    "roadmap"
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
