# zdp-web-public

ZDP 공개 웹 표면 저장소다. 초기 목적은 `8ailors.xyz` 본체 사이트 후보와 공개 제품 목록, 문서, 정책, 문의 경로를 Astro 기반 정적 사이트로 운영하는 것이다.

## 현재 범위

- Astro 정적 사이트 골격
- 8ailors 본체 사이트 후보 정보 구조
- 첫 홈 화면의 제품, 노트, 정책, 문의 섹션
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

루트 `webpub.toml`은 공개 발행 메타데이터 계약이다. 도메인 구매 전에는 `domain_status = "candidate"`와 검색 노출 차단 정책을 유지한다.

## 검증

아키텍처 검증은 `zdp-architecture-linter`에서 이 저장소를 대상으로 실행한다.

```bash
bun run check
bun run build
```

`robots.txt`와 페이지 메타 태그는 공개 전까지 검색 노출을 막는다.
