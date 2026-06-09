# zdp-web-public

ZDP 공개 웹 서비스 저장소다. 초기 목적은 `8ailors.xyz` 본체 사이트 후보와 공개 제품 목록, 문서, 정책, 문의 경로를 Astro 기반 정적 사이트로 운영하는 것이다.

## 현재 범위

- Astro 정적 사이트 골격
- 8ailors 본체 사이트 후보 정보 구조
- 첫 홈 화면의 제품, 디자인, 보안, 결제 안전, 실험실, 로드맵, 노트, 정책, 문의 섹션
- `/products`, `/design`, `/security`, `/payment-safety`, `/labs`, `/roadmap`, `/notes`, `/trust`, `/contact` 정적 페이지
- 디자인 시스템 Breadcrumb, Badge, EmptyState, Grid, Icon, Inline, KeyValue, Link, SkipLink, Stack, Table, Toolbar, VisuallyHidden, 현재 페이지 표시를 적용한 정적 페이지 탐색
- 디자인, 보안, 결제 안전, 실험실, 로드맵 페이지의 공개 검증 기준 블록
- 디자인, 보안, 결제 안전, 실험실, 로드맵 페이지의 핵심 정보 화면
- 전문용어를 클릭하면 열리는 right sheet / bottom sheet 기반 용어 설명
- 키보드 사용자를 위한 디자인 시스템 본문 건너뛰기 링크
- 후보 도메인 상태를 설명하는 공개 전 안내 블록
- ZDP 공개 제품과 실험 목록
- 공개 문서, 블로그, 정책, 문의 경로
- Cloudflare Static Assets 배포를 전제로 한 정적 웹 계약

## 현재 제외

- 로그인 앱, 콘솔, 관리자 UI
- 결제, 원장, 크레딧, 구독 처리
- 개인정보 저장 또는 원본 사용자 데이터 접근
- AI provider 호출, AI 사용자 데이터 검색, 장기 메모리
- 백엔드 API의 최종 계약 소유

## 계약

루트 `service.yaml`이 이 저장소의 서비스 계약이다. 실제 도메인을 구매하기 전까지 `8ailors.xyz`는 `candidate_public_domains`에만 둔다.

루트 `webpub.toml`은 공개 발행 메타데이터 계약이다. 도메인 구매 전에는 `domain_status = "candidate"`와 검색 노출 차단 정책을 유지한다. 현재 생성된 페이지도 `indexing = "blocked"` 상태로 둔다.

## 교차 제품 표준 적용

이 저장소는 `zdp-architecture/docs/45-cross-cutting-product-standards.md`의 공개 웹 표준을 따른다.

- 사용자에게 보이는 문구와 페이지 구조는 공개 가능한 정적 콘텐츠만 둔다.
- 색상 원본은 OKLCH 기반 토큰으로 관리하고, 화면 CSS는 의미 토큰을 참조한다.
- `robots.txt`, `webpub.toml`, `llms.txt`는 후보 도메인 상태를 기준으로 작성하며 내부 URL, staging URL, 고객 데이터, 비공개 문서를 넣지 않는다.
- RSS, Atom, JSON Feed는 공개 콘텐츠가 실제로 생긴 뒤 빌드 타임 정적 산출물로 생성한다. 런타임 피드 생성은 기본값이 아니다.
- 로그인, 결제, 개인정보, AI 사용자 데이터 흐름이 필요해지면 이 저장소가 아니라 별도 서비스 계약에서 먼저 소유권을 정한다.

## 검증

아키텍처 검증은 `zdp-architecture-linter`에서 이 저장소를 대상으로 실행한다.

```bash
bun run glossary:generate
bun run check
bun run check:localization
bun run check:glossary
bun run check:discovery
bun run build
```

`check:localization`은 `messages/` 아래의 `zdp-platform-localization` schema/content 분리를 검사하고, 임시 디렉터리에서 strict production compile을 실행해 fallback message가 0개인지 확인한다. 홈의 작은 Astro dogfooding 표면이라도 문구 JSON이 schema params를 깨거나 잘못된 message syntax를 갖거나 production manifest에 fallback이 생기면 `bun run check`가 먼저 실패해야 한다.

`glossary:generate`는 `../../contracts/zdp-libs-ts/glossary/terms/*.yaml` 공통 용어 계약, `../../contracts/zdp-libs-ts/glossary/locales/ko/*.yaml` 공통 한국어 문구, `glossary/terms/*.yaml` 사이트 전용 용어 계약, `glossary/locales/ko/*.yaml` 사이트 전용 한국어 문구를 `zdp-platform-devex`의 glossary manifest 빌더로 함께 읽고 `src/content/glossary-manifest.json`을 만든다. Astro 런타임은 이 JSON만 소비하며, `src/content/glossary.ts`에는 용어 본문을 중복해서 넣지 않는다.

`check:glossary`는 YAML에서 다시 만든 런타임 manifest와 현재 `src/content/glossary-manifest.json`이 같은지 비교한다. `bun run check`는 stale manifest를 고치지 않고 실패해야 하므로, 용어 YAML을 수정한 뒤에는 먼저 `bun run glossary:generate`로 generated JSON을 갱신한다. 용어 설명 원천은 사이트 코드 안 임시 배열이 아니라 ZDP 플랫폼 glossary 계약을 따르는 YAML이어야 한다.

`check:discovery`는 후보 도메인 단계의 `webpub.toml`, `robots.txt`, `llms.txt`, 페이지 목록, 디자인 시스템 소비 계약, 검색 제출용 산출물 부재를 함께 확인한다. 홈과 상세 페이지가 `zdp-design-system`의 grid, toolbar, key-value, table, empty-state public utility를 실제로 소비하고, sibling design system이 ConfirmAction, icon glyph, choice control, themed scrollbar, brand font, expressive font 계약도 제공하는지 함께 본다. 브랜드 워드마크 폰트는 앱이 직접 Fontsource 패키지를 소유하지 않고 `zdp-design-system/brand-fonts.css`와 `--zdp-font-family-brand`를 통해 소비하며, `lang="ko"` 표면에서도 실제 워드마크 텍스트에 `.zdp-brand-wordmark`를 붙이고 `semibold` weight를 유지한다. 표현용 폰트는 public 사이트가 실제 캠페인 섹션에서 필요해질 때 `zdp-design-system/expressive-fonts.css`를 별도 import해서 쓴다. `sitemap.xml`, `rss.xml`, `atom.xml`, `feed.json`은 지금 빠진 것이 아니라 `domain_status = "live"`가 되기 전까지 의도적으로 만들지 않는 파일이다.

용어 설명은 hover tooltip이 아니라 click sheet 패턴으로 유지한다. 데스크톱에서는 오른쪽 sheet, 모바일에서는 bottom sheet로 열리고, sheet root는 stable `term_id`와 `data-zdp-ad-exclude`를 남긴다. Sheet 안에는 광고 slot을 넣지 않고, 광고 실험은 별도 용어 detail page 계약에서만 다룬다. Vault, Audit Log, OKLCH처럼 여러 공개 사이트가 반복해서 쓰는 용어는 `zdp-libs-ts/glossary/terms/*.yaml`과 `zdp-libs-ts/glossary/locales/<locale>/*.yaml`에 추가하고, 이 사이트에서만 쓰는 용어만 `glossary/terms/*.yaml`과 `glossary/locales/<locale>/*.yaml`에 둔다. 공통 용어의 base term에는 AI 작업 지시와 cross-locale 리뷰 기준으로 쓰는 `canonical_label`을 두고, 한국어·영어·일본어 같은 실제 표시 문구는 locale 파일의 `label`, `aliases`, `match_phrases`가 소유한다. Locale `short`는 정확히 1문단 2문장으로, `long`은 정확히 2문단이며 각 문단은 4문장으로 작성한다. 본문에 볼드체 마크다운 문법(`**`)과 띄어쓰기 없이 100자 이상 연결된 긴 단어는 사용하지 않는다. 공통 용어의 관련 화면 경로는 이 저장소의 manifest 빌더에서 term id별로 붙인 뒤 `bun run glossary:generate`로 런타임 manifest를 갱신한다.

`robots.txt`와 페이지 메타 태그는 공개 전까지 검색 노출을 막는다.
