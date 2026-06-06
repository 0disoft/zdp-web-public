import { defineConfig } from 'astro/config';
import { zdpLocalizationI18n } from '@zdp/localization-vite';
import { fileURLToPath } from 'node:url';
import localizationConfig from './localization.config.ts';

const localizationContentPackageEntry = fileURLToPath(
  new URL('../../platform/zdp-platform-localization/packages/content/src/index.ts', import.meta.url)
);

export default defineConfig({
  output: 'static',
  vite: {
    resolve: {
      alias: {
        '@zdp/localization-content': localizationContentPackageEntry
      }
    },
    plugins: [
      zdpLocalizationI18n({
        config: localizationConfig,
        typesOut: '.zdp/localization/types/index.d.ts'
      })
    ]
  }
});
