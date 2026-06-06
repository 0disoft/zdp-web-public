import { renderAstroText } from "@zdp/localization-astro";
import type { MessageArgs } from "@zdp/localization-core";
import { createPublicLocalizationRuntime } from "./localization-catalog";

const runtime = createPublicLocalizationRuntime();

export function localizedHomeText(
  key: string,
  args: MessageArgs | undefined,
  dev: boolean,
): string {
  return renderAstroText(runtime, {
    scope: "home",
    key,
    args,
    dev,
  });
}
