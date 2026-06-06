/// <reference path="../.astro/types.d.ts" />

declare module "virtual:zdp-localization/runtime" {
  export const zdpLocalizationDevSchemaHash: string | null;
  export const zdpLocalizationDevVersion: number;
  export const patchEventName: "zdp-localization:patch";
  export const errorEventName: "zdp-localization:error";
}
