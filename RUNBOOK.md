# zdp-web-public Runbook

## Normal Checks

- Validate this repository with `zdp-architecture-linter`.
- Keep `webpub.toml`, `robots.txt`, and `llms.txt` aligned with the candidate-domain state before launch.
- Run `bun run check:localization`, `bun run check:glossary`, `bun run check:discovery`, and `bun run build` after public copy, glossary, or localization changes.
- Keep `zdp-design-system` on the public npm package range declared in `package.json`, and keep `zdp-platform-localization` available at `../../platform/zdp-platform-localization` for local checks and CI.

## Locale Routing

- Canonical public content paths are locale-prefixed: `/en/...` and `/ko/...`.
- English is the default and fallback locale.
- `/` and non-locale section paths such as `/design` are negotiation entries. They choose stored locale first, then browser language, then English.
- Unsupported locale prefixes such as `/fr/design` are handled by the static `404.html` fallback and redirect to the matching English path when the host serves the 404 page for unknown paths.
- A path that already contains a supported locale must not be auto-switched by stored preferences.
- Static Astro is still the runtime boundary. If server-side `Accept-Language` negotiation becomes required, add an edge route contract before replacing the static redirect entry pages.

## Localization Canary

- The `zdp-platform-localization` canary is limited to three home hero messages: `hero.title`, `hero.cta.products`, and `hero.cta.trust`.
- The canary must include complete `en` and `ko` message content. English is the default locale, not a fallback generated from Korean copy.
- `bun run check:localization` must pass with catalog diagnostics 0 and production fallback messages 0 before public copy changes merge.
- Keep hardcoded static Astro copy available as the rollback path if the localization canary breaks the public home hero.
- This static public site does not require a runtime feature flag while the canary remains limited to the home hero.

## Failure Response

If localization breaks the home hero, revert the affected hero message usage to static Astro copy and keep the broader public copy migration paused.

If the canary needs to expand beyond the home hero title and CTA messages, pause for product review before moving more public copy into `zdp-platform-localization`.
