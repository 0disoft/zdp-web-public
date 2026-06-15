import { installAstroDevPatcher } from "@zdp/localization-astro";
import { installZdpLocalizationRuntime } from "@zdp/localization-runtime";
import {
  zdpLocalizationDevSchemaHash,
  zdpLocalizationDevVersion,
  patchEventName,
} from "virtual:zdp-localization/runtime";
import { createPublicLocalizationRuntime } from "../lib/localization-catalog";
import { normalizeLocale } from "../lib/site-locales";

const runtime = installZdpLocalizationRuntime(
  createPublicLocalizationRuntime({
    locale: normalizeLocale(document.documentElement.dataset.zdpLocale),
    schemaHash: zdpLocalizationDevSchemaHash ?? undefined,
    version: zdpLocalizationDevVersion,
  }),
);

if (import.meta.hot) {
  installAstroDevPatcher(runtime, {
    root: document,
    hot: {
      on(_event, callback) {
        import.meta.hot?.on(patchEventName, callback);
      },
    },
    onSchemaMismatch() {
      import.meta.hot?.invalidate();
    },
  });
}
