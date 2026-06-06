type GlossaryCategory = "design" | "security" | "platform" | "operations";

interface GlossaryAdPolicy {
  readonly eligible: boolean;
  readonly slot: string | null;
  readonly note: string;
}

interface GlossaryManifestEntry {
  readonly id: string;
  readonly label: string;
  readonly summary: string;
  readonly detail: string;
  readonly category: GlossaryCategory;
  readonly aliases: readonly string[];
  readonly sourcePath: string;
  readonly adPolicy: GlossaryAdPolicy;
}

const initializedRoots = new WeakSet<Element>();
const categoryLabels: Record<GlossaryCategory, string> = {
  design: "Design",
  security: "Security",
  platform: "Platform",
  operations: "Operations"
};
const focusableSelector = [
  "a[href]",
  "area[href]",
  "button",
  "input",
  "select",
  "textarea",
  "iframe",
  "object",
  "embed",
  "details > summary:first-of-type",
  '[contenteditable="true"]',
  "[tabindex]"
].join(", ");
const mobileSheetMediaQuery = "(max-width: 640px)";

function initializeGlossarySheets(): void {
  for (const root of document.querySelectorAll("[data-glossary-root]")) {
    if (initializedRoots.has(root)) {
      continue;
    }

    initializedRoots.add(root);
    initializeGlossarySheet(root);
  }
}

function initializeGlossarySheet(root: Element): void {
  const sheet = root.querySelector<HTMLElement>("[data-glossary-sheet]");
  const manifestScript = root.querySelector<HTMLScriptElement>("[data-glossary-manifest]");

  if (!sheet || !manifestScript?.textContent) {
    return;
  }

  const sheetElement = sheet;
  const manifest = readManifest(manifestScript.textContent);
  const termsById = new Map(manifest.map((term) => [term.id, term]));
  const backdrop = root.querySelector<HTMLElement>(".glossary-sheet__backdrop");
  const title = root.querySelector<HTMLElement>("[data-glossary-title]");
  const category = root.querySelector<HTMLElement>("[data-glossary-category]");
  const summary = root.querySelector<HTMLElement>("[data-glossary-summary]");
  const detail = root.querySelector<HTMLElement>("[data-glossary-detail]");
  const source = root.querySelector<HTMLAnchorElement>("[data-glossary-source]");
  let activeTrigger: HTMLButtonElement | null = null;

  function openSheet(termId: string, trigger: HTMLButtonElement): void {
    const term = termsById.get(termId);
    if (!term) {
      return;
    }

    activeTrigger?.setAttribute("aria-expanded", "false");
    activeTrigger = trigger;
    activeTrigger.setAttribute("aria-expanded", "true");

    if (title) {
      title.textContent = term.label;
    }
    if (category) {
      category.textContent = categoryLabels[term.category];
    }
    if (summary) {
      summary.textContent = term.summary;
    }
    if (detail) {
      detail.textContent = term.detail;
    }
    if (source) {
      source.href = term.sourcePath;
    }

    sheetElement.dataset.termId = term.id;
    sheetElement.dataset.zdpTermId = term.id;
    sheetElement.dataset.zdpTermPlacement = getCurrentPlacement();

    sheetElement.classList.add("is-open");
    sheetElement.setAttribute("aria-hidden", "false");
    if (backdrop) {
      backdrop.hidden = false;
    }

    window.requestAnimationFrame(() => {
      sheetElement.focus();
    });
  }

  function closeSheet(): void {
    sheetElement.classList.remove("is-open");
    sheetElement.setAttribute("aria-hidden", "true");
    delete sheetElement.dataset.termId;
    delete sheetElement.dataset.zdpTermId;
    if (backdrop) {
      backdrop.hidden = true;
    }

    if (activeTrigger) {
      activeTrigger.setAttribute("aria-expanded", "false");
      activeTrigger.focus();
      activeTrigger = null;
    }
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const trigger = target.closest<HTMLButtonElement>("[data-glossary-term]");
    if (trigger) {
      openSheet(trigger.getAttribute("data-glossary-term") ?? "", trigger);
      return;
    }

    if (target.closest("[data-glossary-close]")) {
      closeSheet();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (sheetElement.getAttribute("aria-hidden") === "true") {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeSheet();
      return;
    }

    if (event.key === "Tab") {
      trapFocus(event, sheetElement);
    }
  });
}

function readManifest(content: string): readonly GlossaryManifestEntry[] {
  try {
    const parsed: unknown = JSON.parse(content);
    return Array.isArray(parsed) ? parsed.filter(isGlossaryManifestEntry) : [];
  } catch {
    return [];
  }
}

function isGlossaryManifestEntry(value: unknown): value is GlossaryManifestEntry {
  if (!isRecord(value) || !isGlossaryCategory(value.category) || !isRecord(value.adPolicy)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.label === "string" &&
    typeof value.summary === "string" &&
    typeof value.detail === "string" &&
    typeof value.sourcePath === "string" &&
    Array.isArray(value.aliases) &&
    value.aliases.every((entry) => typeof entry === "string") &&
    typeof value.adPolicy.eligible === "boolean" &&
    (typeof value.adPolicy.slot === "string" || value.adPolicy.slot === null) &&
    typeof value.adPolicy.note === "string"
  );
}

function trapFocus(event: KeyboardEvent, sheet: HTMLElement): void {
  const focusable = Array.from(sheet.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    isFocusableElement
  );

  if (focusable.length === 0) {
    event.preventDefault();
    sheet.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function getCurrentPlacement(): "right-sheet" | "bottom-sheet" {
  return window.matchMedia(mobileSheetMediaQuery).matches ? "bottom-sheet" : "right-sheet";
}

function isFocusableElement(element: HTMLElement): boolean {
  if (element.tabIndex < 0) {
    return false;
  }

  if (element.matches('[disabled], [hidden], [aria-hidden="true"]')) {
    return false;
  }

  if (element.closest('[hidden], [aria-hidden="true"], [inert]') !== null) {
    return false;
  }

  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") {
    return false;
  }

  return element.getClientRects().length > 0;
}

function isGlossaryCategory(value: unknown): value is GlossaryCategory {
  return value === "design" || value === "security" || value === "platform" || value === "operations";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeGlossarySheets, { once: true });
} else {
  initializeGlossarySheets();
}
