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
  readonly summary?: string;
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
    summary: "일관된 토큰과 컴포넌트로 익숙한 화면을 만듭니다.",
    items: [
      {
        title: "Foundation",
        body: "색상은 OKLCH 토큰으로, 서체는 Pretendard Variable로 시작합니다. lang 속성을 붙이면 ko·en·zh·ja·hi별 서체 스택이 자동 교체됩니다.",
        status: "토대"
      },
      {
        title: "Components",
        body: "버튼부터 Dialog·Menu·Toast·Skeleton까지 60개 Svelte 컴포넌트를 제공합니다. Astro 표면에서는 같은 이름의 CSS 클래스(zdp-*)를 씁니다.",
        status: "요소"
      },
      {
        title: "Patterns",
        body: "공유(ShareDock), 검색, 브레드크럼, 용어 시트(TermSheet)는 패턴으로 정의해 둡니다. 어느 표면에서든 같은 방식으로 동작합니다.",
        status: "패턴"
      },
      {
        title: "Interaction",
        body: "위험한 작업은 ConfirmAction으로 슬라이드·홀드 확인합니다. 키보드 단축키는 intent 기반으로 등록하고, IME·텍스트 입력 중에는 자동으로 무시합니다.",
        status: "인터랙션"
      }
    ],
    facts: [
      {
        term: "기준 패키지",
        description: "zdp-design-system (v0.41+)"
      },
      {
        term: "적용 대상",
        description: "Astro 공개 사이트, Svelte 앱, Tauri WebView, Flutter native"
      },
      {
        term: "토큰 계층",
        description: "raw → semantic → component. 제품 코드는 raw 색상을 직접 쓰지 않습니다."
      },
      {
        term: "색상",
        description: "OKLCH 우선, HEX는 @supports 분기 fallback."
      },
      {
        term: "다크 모드",
        description: "[data-zdp-theme=\"dark\"]로 semantic 토큰을 덮어씁니다. 전역 invert 금지."
      },
      {
        term: "서체",
        description: "UI: Pretendard Variable / 브랜드: Playwrite AU VIC Guides / 표현용: 6종 opt-in"
      },
      {
        term: "Motion",
        description: "fast 120ms · normal 180ms. prefers-reduced-motion 환경에서는 1ms."
      },
      {
        term: "Flutter / Native",
        description: "tokens/zdp.tokens.json 토큰 이름을 theme adapter 입력으로 사용합니다."
      }
    ],
    checks: [
      {
        item: "Public export",
        status: "유지",
        note: "zdp-design-system 공개 API만 씁니다. 내부 경로 직접 참조 금지."
      },
      {
        item: "Focus",
        status: "유지",
        note: "모든 인터랙티브 요소에 키보드 포커스 링이 보여야 합니다."
      },
      {
        item: "Flat UI",
        status: "유지",
        note: "box-shadow·그라디언트 금지. --zdp-shadow-*는 의도적으로 none입니다."
      },
      {
        item: "Dark mode",
        status: "유지",
        note: "다크 모드는 [data-zdp-theme=\"dark\"] semantic 토큰 오버라이드만 씁니다."
      },
      {
        item: "Token fork 금지",
        status: "유지",
        note: "토큰 이름을 제품별 별칭으로 복사해 fork하지 않습니다."
      },
      {
        item: "ConfirmAction 패턴",
        status: "유지",
        note: "되돌리기 어려운 작업에는 반드시 ConfirmAction을 씁니다."
      },
      {
        item: "i18n 서체",
        status: "유지",
        note: ".zdp-surface-reset + lang 속성 조합으로 서체 스택을 자동 교체합니다."
      },
      {
        item: "Term sheet 광고 제외",
        status: "유지",
        note: "TermSheet에는 data-zdp-ad-exclude가 붙어 있어 광고 삽입을 막습니다."
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
        body: "인증·결제·원장·개인정보 접근은 독립된 서비스 경계 안에서만 처리합니다. 제품 코드에는 제품 로직만 있어야 합니다.",
        status: "원칙"
      },
      {
        title: "감사 로그",
        body: "권한 변경·결제·개인정보 접근·관리자 작업은 모두 불변 감사 로그에 기록됩니다. 행 수정과 삭제는 허용하지 않습니다.",
        status: "운영"
      },
      {
        title: "최소 권한",
        body: "서비스와 사용자에게 필요한 범위 이상의 권한을 부여하지 않습니다. 자동 처리 시스템은 동의 확인 후 허가된 범위만 접근합니다.",
        status: "원칙"
      }
    ],
    facts: [
      {
        term: "비밀값 저장",
        description: "일반 DB와 분리된 vault에 보관. 암호화 필수."
      },
      {
        term: "감사 로그",
        description: "append-only. 수정·삭제 불가."
      },
      {
        term: "자동화 시스템 접근",
        description: "Privacy Access Broker 경유, 동의·목적 확인 후 최소 데이터만 전달."
      },
      {
        term: "관리자 열람",
        description: "마스킹 우선. 원문 열람 시 사유·만료 시간 입력 후 감사 로그 기록."
      },
      {
        term: "계정 삭제",
        description: "DB·검색 색인·캐시·외부 provider 토큰 전체에 삭제 전파."
      }
    ],
    checks: [
      {
        item: "제품-플랫폼 경계",
        status: "유지",
        note: "결제·원장·권한·개인정보 접근 로직은 제품 저장소에 직접 넣지 않습니다."
      },
      {
        item: "비밀값 격리",
        status: "유지",
        note: "API 키·OAuth 토큰·webhook secret은 별도 vault에만 저장합니다."
      },
      {
        item: "불변 감사 로그",
        status: "유지",
        note: "권한 변경·결제·개인정보 접근·관리자 작업은 삭제 불가 로그에 남깁니다."
      },
      {
        item: "자동화 시스템 접근 경계",
        status: "유지",
        note: "외부 처리 엔진은 동의 확인 후 필요한 조각만 전달받습니다."
      },
      {
        item: "삭제 전파",
        status: "유지",
        note: "계정 삭제 시 모든 저장소에 삭제 이벤트를 전파합니다."
      }
    ]
  },

  {
    id: "labs",
    path: "/labs",
    label: "실험실",
    heading: "실험실",
    summary: "검증 중인 제품과 기술 실험입니다.",
    items: [],
    facts: [],
    checks: []
  },
  {
    id: "roadmap",
    path: "/roadmap",
    label: "로드맵",
    heading: "로드맵",
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
