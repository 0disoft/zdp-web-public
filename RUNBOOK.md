# zdp-web-public Runbook

## Normal Checks

- Validate this repository with `zdp-architecture-linter`.
- Keep `webpub.toml`, `robots.txt`, and `llms.txt` aligned with the candidate-domain state before launch.
- Run `bun run check:localization`, `bun run check:glossary`, `bun run check:discovery`, and `bun run build` after public copy, glossary, or localization changes.
- Keep sibling `zdp-design-system` available at `../zdp-design-system` and `zdp-platform-localization` available at `../../platform/zdp-platform-localization` for local checks and CI.

## Localization Canary

- The `zdp-platform-localization` canary is limited to three home hero messages: `hero.title`, `hero.cta.products`, and `hero.cta.trust`.
- `bun run check:localization` must pass with catalog diagnostics 0 and production fallback messages 0 before public copy changes merge.
- Keep hardcoded static Astro copy available as the rollback path if the localization canary breaks the public home hero.
- This static public site does not require a runtime feature flag while the canary remains limited to the home hero.

## Failure Response

If localization breaks the home hero, revert the affected hero message usage to static Astro copy and keep the broader public copy migration paused.

If the canary needs to expand beyond the home hero title and CTA messages, pause for product review before moving more public copy into `zdp-platform-localization`.
