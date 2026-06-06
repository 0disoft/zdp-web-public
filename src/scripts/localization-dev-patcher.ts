import { installAstroDevPatcher } from "@zdp/localization-astro";
import { installZdpLocalizationRuntime } from "@zdp/localization-runtime";
import {
  zdpLocalizationDevSchemaHash,
  zdpLocalizationDevVersion,
  patchEventName,
} from "virtual:zdp-localization/runtime";
import { createPublicLocalizationRuntime } from "../lib/localization-catalog";

const runtime = installZdpLocalizationRuntime(
  createPublicLocalizationRuntime({
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
