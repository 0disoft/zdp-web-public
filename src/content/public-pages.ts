export interface PublicPageItem {
  readonly title: string;
  readonly body: string;
  readonly status: string;
}

export interface PublicPageFact {
  readonly term: string;
  readonly description: string;
}

export interface PublicPageCheck {
  readonly item: string;
  readonly status: string;
  readonly note: string;
}

export interface PublicPage {
  readonly id: string;
  readonly path: `/${string}`;
  readonly label: string;
  readonly heading: string;
  readonly summary: string;
  readonly items: readonly PublicPageItem[];
  readonly facts: readonly PublicPageFact[];
  readonly checks: readonly PublicPageCheck[];
}

export const publicPages: readonly PublicPage[] = [
  {
    id: "products",
    path: "/products",
    label: "제품",
    heading: "제품",
    summary: "출시 예정 서비스입니다.",
    items: [],
    facts: [],
    checks: []
  },
  {
    id: "design",
    path: "/design",
    label: "디자인",
    heading: "디자인 표준",
    summary: "모든 서비스가 같은 시각 기준과 컴포넌트를 씁니다.",
    items: [
      {
        title: "Foundation",
        body: "색상은 OKLCH 토큰으로, 서체는 Pretendard Variable로 시작합니다. 다크 모드는 semantic 토큰별 dark 값을 따로 정의하고, filter: invert()로 만들지 않습니다.",
        status: "토대"
      },
      {
        title: "Components",
        body: "인터랙티브 컴포넌트는 크기와 포커스 규칙을 공통으로 씁니다. Astro에서는 CSS 클래스를, Svelte·Tauri에서는 컴포넌트를 직접 가져옵니다.",
        status: "요소"
      },
      {
        title: "Patterns",
        body: "공유, 검색, 브레드크럼 같은 반복 UI는 패턴으로 정의해 둡니다. 어느 페이지에서든 같은 방식으로 동작합니다.",
        status: "패턴"
      }
    ],
    facts: [
      {
        term: "기준 패키지",
        description: "zdp-design-system"
      },
      {
        term: "적용 대상",
        description: "공개 사이트(Astro), 앱(Svelte/SvelteKit), Tauri WebView, Flutter native"
      },
      {
        term: "토큰 계층",
        description: "raw token → semantic token → component token. 제품 코드는 raw 색상을 직접 쓰지 않습니다."
      },
      {
        term: "색상 원본",
        description: "OKLCH 우선. HEX는 브라우저 fallback 또는 레거시 호환용."
      },
      {
        term: "다크 모드",
        description: "semantic 토큰별 [data-zdp-theme=\"dark\"] 값을 따로 정의. 전역 invert 금지."
      },
      {
        term: "서체",
        description: "UI: Pretendard Variable / 브랜드 로고: Playwrite AU VIC Guides / 표현용: Tangerine, Google Sans 등 6종 opt-in"
      },
      {
        term: "Motion",
        description: "--zdp-motion-fast: 120ms / --zdp-motion-normal: 180ms. prefers-reduced-motion 환경에서는 1ms로 낮춤."
      },
      {
        term: "Flutter / Native",
        description: "tokens/zdp.tokens.json의 토큰 이름을 theme adapter 입력으로 사용."
      }
    ],
    checks: [
      {
        item: "Public export",
        status: "유지",
        note: "zdp-design-system의 공개 API만 씁니다. src/ 내부 경로 직접 참조 금지."
      },
      {
        item: "Focus",
        status: "유지",
        note: "모든 인터랙티브 요소에 키보드 포커스 링이 보입니다. focus 색을 브랜드 장식색으로 재사용하지 않습니다."
      },
      {
        item: "Quick navigation",
        status: "유지",
        note: "본문 바로 건너뛰기 링크(SkipLink)와 키보드 단축키를 제공합니다."
      },
      {
        item: "Flat UI",
        status: "유지",
        note: "box-shadow와 그라디언트는 쓰지 않습니다. 여백과 1px 테두리로 레이아웃에 깊이를 둡니다."
      },
      {
        item: "Expressive fonts opt-in",
        status: "유지",
        note: "표현용 폰트(expressive-fonts.css)는 명시적으로 import한 표면에서만 씁니다. 기본 UI 폰트를 바꾸지 않습니다."
      },
      {
        item: "User select",
        status: "유지",
        note: "앱 root, 카드, 테이블, toast body에 user-select: none을 적용하지 않습니다. 화면에 노출된 값은 복사할 수 있어야 합니다."
      },
      {
        item: "Dark mode",
        status: "유지",
        note: "다크 모드는 [data-zdp-theme=\"dark\"]로 semantic 토큰을 덮어씁니다. 직접 color: #fff 같은 하드코딩 금지."
      },
      {
        item: "Token fork 금지",
        status: "유지",
        note: "token name을 제품별 별칭으로 복사해 fork하지 않습니다."
      }
    ]
  },
  {
    id: "security",
    path: "/security",
    label: "보안",
    heading: "보안",
    summary: "돈, 권한, 개인정보는 제품 코드와 섞지 않습니다. 경계를 나누고 접근을 기록합니다.",
    items: [
      {
        title: "경계 분리",
        body: "인증, 결제, 원장, 개인정보 접근은 각자 독립된 서비스 경계 안에서만 처리합니다. 제품 코드에는 제품 고유 로직만 있어야 합니다.",
        status: "원칙"
      },
      {
        title: "감사 로그",
        body: "권한 변경, 결제 상태 변경, 개인정보 접근, 관리자 작업은 모두 불변 감사 로그에 기록됩니다. 행 수정과 삭제는 허용하지 않습니다.",
        status: "운영"
      },
      {
        title: "최소 권한",
        body: "서비스와 사용자에게 실제 필요한 범위 이상의 권한을 부여하지 않습니다. AI는 사용자 데이터의 소유자가 아니라 허가된 범위 안에서만 접근하는 소비자입니다.",
        status: "원칙"
      }
    ],
    facts: [
      {
        term: "비밀값 저장",
        description: "일반 DB와 물리적으로 분리된 vault에 보관. 암호화 필수."
      },
      {
        term: "감사 로그",
        description: "append-only 구조. 수정·삭제 불가."
      },
      {
        term: "AI 데이터 접근",
        description: "Privacy Access Broker를 거쳐 동의·목적 확인 후 최소 데이터만 전달."
      },
      {
        term: "관리자 열람",
        description: "마스킹 우선. 원문 열람은 사유·대상·만료 시간 입력 후 감사 로그에 기록."
      },
      {
        term: "계정 삭제",
        description: "DB, 검색 색인, AI 메모리, 외부 provider 토큰 전체에 삭제 전파."
      },
      {
        term: "보안 체크리스트",
        description: "OWASP ASVS 기반. 인증 필요 여부, 권한 검사, rate limit, 감사 로그 필요 여부를 매 PR에서 확인."
      }
    ],
    checks: [
      {
        item: "제품-플랫폼 경계",
        status: "유지",
        note: "결제, 원장, 권한, AI 개인정보 접근 로직은 제품 저장소에 직접 넣지 않습니다."
      },
      {
        item: "비밀값 격리",
        status: "유지",
        note: "API 키, OAuth 토큰, webhook secret은 별도 vault에만 저장합니다. 일반 DB와 분리합니다."
      },
      {
        item: "불변 감사 로그",
        status: "유지",
        note: "권한 변경·결제·개인정보 접근·관리자 작업은 삭제할 수 없는 감사 로그에 남깁니다."
      },
      {
        item: "AI 접근 경계",
        status: "유지",
        note: "LLM은 메일·메시지·결제 DB를 직접 읽지 않습니다. 동의 확인 후 필요한 조각만 전달받습니다."
      },
      {
        item: "삭제 전파",
        status: "유지",
        note: "계정 삭제 시 모든 저장소에 삭제 이벤트를 전파합니다. 동기 처리 대신 job으로 처리합니다."
      }
    ]
  },

  {
    id: "labs",
    path: "/labs",
    label: "실험실",
    heading: "실험실",
    summary: "검증 중인 제품과 기술 실험을 모아둘 자리입니다.",
    items: [],
    facts: [],
    checks: []
  },
  {
    id: "roadmap",
    path: "/roadmap",
    label: "로드맵",
    heading: "로드맵",
    summary: "지금 하는 일, 다음에 할 일, 아직 하지 않을 일을 정리할 자리입니다.",
    items: [],
    facts: [],
    checks: []
  },
  {
    id: "notes",
    path: "/notes",
    label: "기록",
    heading: "기록",
    summary: "개발 과정의 기록입니다.",
    items: [],
    facts: [],
    checks: []
  },
  {
    id: "trust",
    path: "/trust",
    label: "정책",
    heading: "정책",
    summary: "데이터 보호와 보안에 관한 기준입니다.",
    items: [],
    facts: [],
    checks: []
  },
  {
    id: "contact",
    path: "/contact",
    label: "문의",
    heading: "문의",
    summary: "서비스 개방 시 연락 채널을 공개합니다.",
    items: [],
    facts: [],
    checks: []
  }
];
