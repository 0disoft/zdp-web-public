import runtimeGlossaryManifest from "./glossary-manifest.json";
import type { SupportedLocale } from "../lib/site-locales";

export type GlossaryLocale = SupportedLocale;
export type GlossaryCategory = "design" | "security" | "platform" | "operations";

export interface GlossaryMatchPhrase {
  readonly phrase: string;
  readonly autoMatch: boolean;
  readonly priority: number;
}

export interface GlossaryAdPolicy {
  readonly eligible: boolean;
  readonly slot: string | null;
  readonly note: string;
}

export interface GlossaryManifestEntry {
  readonly id: string;
  readonly label: string;
  readonly summary: string;
  readonly detail: string;
  readonly category: GlossaryCategory;
  readonly aliases: readonly string[];
  readonly matchPhrases: readonly GlossaryMatchPhrase[];
  readonly sourcePath: string;
  readonly adPolicy: GlossaryAdPolicy;
}

export type GlossaryTextToken =
  | {
      readonly type: "text";
      readonly text: string;
    }
  | {
      readonly type: "term";
      readonly text: string;
      readonly term: GlossaryManifestEntry;
    };

const publicGlossaryManifest =
  runtimeGlossaryManifest as readonly GlossaryManifestEntry[];

export function getGlossaryManifest(
  locale: GlossaryLocale = "en"
): readonly GlossaryManifestEntry[] {
  return locale === "ko" ? publicGlossaryManifest : [];
}

export function markGlossaryText(
  text: string,
  terms: readonly GlossaryManifestEntry[] = getGlossaryManifest("en")
): readonly GlossaryTextToken[] {
  if (text.length === 0 || terms.length === 0) {
    return [{ type: "text", text }];
  }

  const matchableTerms = terms
    .flatMap((term) =>
      [
        { alias: term.label, priority: 0, term },
        ...term.aliases.map((alias) => ({ alias, priority: 0, term })),
        ...term.matchPhrases
          .filter((matchPhrase) => matchPhrase.autoMatch)
          .map((matchPhrase) => ({
            alias: matchPhrase.phrase,
            priority: matchPhrase.priority,
            term
          }))
      ]
    )
    .filter((entry) => entry.alias.trim().length > 0)
    .sort((left, right) => right.priority - left.priority || right.alias.length - left.alias.length);

  if (matchableTerms.length === 0) {
    return [{ type: "text", text }];
  }

  const termByMatch = new Map<string, GlossaryManifestEntry>();
  for (const entry of matchableTerms) {
    termByMatch.set(entry.alias.toLocaleLowerCase(), entry.term);
  }

  const pattern = new RegExp(
    Array.from(new Set(matchableTerms.map((entry) => entry.alias)))
      .map((alias) => escapeRegExp(alias))
      .join("|"),
    "giu"
  );
  const tokens: GlossaryTextToken[] = [];
  let cursor = 0;

  for (const match of text.matchAll(pattern)) {
    const matchedText = match[0];
    const start = match.index ?? 0;
    const term = termByMatch.get(matchedText.toLocaleLowerCase());

    if (term === undefined) {
      continue;
    }

    if (start > cursor) {
      tokens.push({ type: "text", text: text.slice(cursor, start) });
    }

    tokens.push({ type: "term", text: matchedText, term });
    cursor = start + matchedText.length;
  }

  if (cursor < text.length) {
    tokens.push({ type: "text", text: text.slice(cursor) });
  }

  return tokens.length > 0 ? tokens : [{ type: "text", text }];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
