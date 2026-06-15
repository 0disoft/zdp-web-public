import { renderAstroText } from "@zdp/localization-astro";
import type { MessageArgs } from "@zdp/localization-core";
import { createPublicLocalizationRuntime } from "./localization-catalog";
import { defaultLocale, type SupportedLocale } from "./site-locales";

const runtimes = new Map<SupportedLocale, ReturnType<typeof createPublicLocalizationRuntime>>();

function getRuntime(locale: SupportedLocale) {
  const existing = runtimes.get(locale);
  if (existing !== undefined) {
    return existing;
  }

  const runtime = createPublicLocalizationRuntime({ locale });
  runtimes.set(locale, runtime);
  return runtime;
}

export function localizedHomeText(
  key: string,
  args: MessageArgs | undefined,
  dev: boolean,
  locale: SupportedLocale = defaultLocale,
): string {
  return renderAstroText(getRuntime(locale), {
    scope: "home",
    key,
    args,
    dev,
  });
}
