export const siteLocales = ["en", "ko"] as const;

export type SupportedLocale = (typeof siteLocales)[number];

export const defaultLocale: SupportedLocale = "en";

export const siteLocaleLabels: Record<SupportedLocale, { short: string; label: string }> = {
  en: {
    short: "EN",
    label: "English"
  },
  ko: {
    short: "KO",
    label: "한국어"
  }
};

const supportedLocaleSet = new Set<string>(siteLocales);

export function isSupportedLocale(value: string | undefined | null): value is SupportedLocale {
  return typeof value === "string" && supportedLocaleSet.has(value);
}

export function normalizeLocale(value: string | undefined | null): SupportedLocale {
  return isSupportedLocale(value) ? value : defaultLocale;
}

export function stripLocalePrefix(pathname: string): { locale: SupportedLocale | null; path: `/${string}` } {
  const safePath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const [firstSegment = "", ...restSegments] = safePath.split("/").filter(Boolean);

  if (isSupportedLocale(firstSegment)) {
    const rest = restSegments.length > 0 ? `/${restSegments.join("/")}` : "/";
    return {
      locale: firstSegment,
      path: rest as `/${string}`
    };
  }

  return {
    locale: null,
    path: safePath as `/${string}`
  };
}

export function localizePath(path: string, locale: SupportedLocale): `/${SupportedLocale}${string}` {
  const { path: unlocalizedPath } = stripLocalePrefix(path);
  const suffix = unlocalizedPath === "/" ? "" : unlocalizedPath;

  return `/${locale}${suffix}` as `/${SupportedLocale}${string}`;
}

export function allLocalizedPaths(path: string): readonly `/${SupportedLocale}${string}`[] {
  return siteLocales.map((locale) => localizePath(path, locale));
}
