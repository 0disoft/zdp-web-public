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
    heading: "디자인",
    summary: "8ailors 화면과 제품 표면에 적용할 디자인 기준입니다.",
    items: [
      {
        title: "공통 토큰",
        body: "색상, 글꼴, 간격, 포커스 상태를 제품마다 새로 만들지 않고 하나의 기준에서 가져옵니다.",
        status: "기준화"
      },
      {
        title: "접근성 우선",
        body: "키보드 포커스, 대비, 글꼴 크기, 모바일 폭을 초기 화면부터 함께 확인합니다.",
        status: "기본값"
      },
      {
        title: "절제된 표면",
        body: "그림자와 그라데이션보다 여백, 테두리, 타이포그래피로 화면의 위계를 만듭니다.",
        status: "원칙"
      }
    ],
    facts: [
      {
        term: "기준 저장소",
        description: "zdp-design-system"
      },
      {
        term: "적용 표면",
        description: "공개 사이트, 제품 실험실, 앱 셸 후보"
      },
      {
        term: "기본 방향",
        description: "Pretendard-first 글꼴, 선명한 focus, flat UI, responsive layout"
      }
    ],
    checks: [
      {
        item: "Public export",
        status: "유지",
        note: "공유 CSS와 컴포넌트는 zdp-design-system public export만 사용합니다."
      },
      {
        item: "Focus",
        status: "유지",
        note: "링크, 버튼, 입력류는 키보드 focus가 보이는 상태로 유지합니다."
      },
      {
        item: "Flat UI",
        status: "유지",
        note: "그림자와 그라데이션 대신 여백, 테두리, 글자 위계로 화면을 나눕니다."
      }
    ]
  },
  {
    id: "security",
    path: "/security",
    label: "보안",
    heading: "보안",
    summary: "서비스 경계, 검증, 비밀값 관리 기준을 정리할 자리입니다.",
    items: [
      {
        title: "비밀값 분리",
        body: "공개 웹사이트에는 API 키, 토큰, 내부 계정 정보, 운영 대시보드 링크를 넣지 않습니다.",
        status: "비공개"
      },
      {
        title: "정적 공개 표면",
        body: "후보 사이트 단계에서는 로그인, 관리자 기능, 사용자별 데이터 처리를 만들지 않습니다.",
        status: "정적"
      },
      {
        title: "검증 가능한 계약",
        body: "공개 경로, robots 정책, discovery 파일은 빌드 전 검사로 함께 확인합니다.",
        status: "검사"
      }
    ],
    facts: [
      {
        term: "공개 단계",
        description: "candidate domain, noindex, robots blocked"
      },
      {
        term: "비밀값 정책",
        description: "API 키, 토큰, 내부 계정 정보, 대시보드 링크 비공개"
      },
      {
        term: "운영 원천",
        description: "service.yaml, webpub.toml, discovery check"
      }
    ],
    checks: [
      {
        item: "Secrets",
        status: "차단",
        note: "공개 사이트에는 비밀값, 내부 대시보드, staging URL을 넣지 않습니다."
      },
      {
        item: "Indexing",
        status: "차단",
        note: "후보 도메인 단계에서는 noindex,nofollow와 robots 차단을 유지합니다."
      },
      {
        item: "Private flows",
        status: "분리",
        note: "로그인, 관리자, 사용자별 데이터 처리는 이 저장소 밖에서 먼저 계약을 정합니다."
      }
    ]
  },
  {
    id: "payment-safety",
    path: "/payment-safety",
    label: "결제 안전",
    heading: "결제 안전",
    summary: "결제, 크레딧, 원장 경계를 공개 가능한 수준으로 정리할 자리입니다.",
    items: [
      {
        title: "결제 코드 없음",
        body: "이 공개 사이트는 결제, 환불, 크레딧, 원장 처리를 직접 구현하지 않습니다.",
        status: "분리"
      },
      {
        title: "원장 경계",
        body: "돈의 진실은 제품 화면이 아니라 별도 플랫폼 계약과 검증 가능한 기록에서 관리합니다.",
        status: "원칙"
      },
      {
        title: "출시 전 차단",
        body: "가격, 결제, 구독 안내는 실제 정책과 운영 준비가 끝나기 전까지 공개하지 않습니다.",
        status: "보류"
      }
    ],
    facts: [
      {
        term: "결제 구현",
        description: "이 공개 사이트에는 checkout, 환불, 크레딧 차감 코드가 없습니다."
      },
      {
        term: "원장 소유",
        description: "돈의 진실은 별도 money platform 계약에서 다룹니다."
      },
      {
        term: "공개 조건",
        description: "정책, provider 준비, rollback 기준이 확인된 뒤 가격/결제 문구를 공개합니다."
      }
    ],
    checks: [
      {
        item: "Checkout",
        status: "없음",
        note: "이 사이트는 가격표, checkout, 환불, 크레딧 차감을 직접 구현하지 않습니다."
      },
      {
        item: "Ledger",
        status: "분리",
        note: "돈의 상태는 공개 페이지 문구가 아니라 별도 원장 계약에서 검증합니다."
      },
      {
        item: "Payment copy",
        status: "보류",
        note: "결제 안내는 실제 정책, provider 준비, rollback 기준이 생긴 뒤 공개합니다."
      }
    ]
  },
  {
    id: "labs",
    path: "/labs",
    label: "실험실",
    heading: "실험실",
    summary: "검증 중인 제품과 기술 실험을 모아둘 자리입니다.",
    items: [
      {
        title: "폐기 가능한 실험",
        body: "제품 후보는 성공 기준, 종료 기준, 비용 상한을 먼저 적고 작게 검증합니다.",
        status: "실험"
      },
      {
        title: "코어 오염 방지",
        body: "실험 코드는 인증, 결제, 개인정보, 권한 판단을 직접 소유하지 않습니다.",
        status: "격리"
      },
      {
        title: "승격 조건",
        body: "운영 증거와 소유권이 생긴 실험만 별도 제품 저장소로 옮깁니다.",
        status: "검토"
      }
    ],
    facts: [
      {
        term: "기준 저장소",
        description: "zdp-products-lab"
      },
      {
        term: "격리선",
        description: "실험은 인증, 결제, 개인정보, 권한 판단을 직접 소유하지 않습니다."
      },
      {
        term: "승격 조건",
        description: "소유자, 비용 상한, 운영 증거, 종료 기준이 확인된 뒤 제품 저장소로 이동합니다."
      }
    ],
    checks: [
      {
        item: "Experiment rule",
        status: "필수",
        note: "제품 후보는 성공 기준, 종료 기준, 비용 상한이 없으면 구현하지 않습니다."
      },
      {
        item: "Design system",
        status: "필수",
        note: "실험 화면도 디자인 시스템 public contract를 먼저 소비합니다."
      },
      {
        item: "Promotion",
        status: "검토",
        note: "인증, 결제, 개인정보, 권한 판단이 필요해지면 실험실 밖으로 승격 검토합니다."
      }
    ]
  },
  {
    id: "roadmap",
    path: "/roadmap",
    label: "로드맵",
    heading: "로드맵",
    summary: "지금 하는 일, 다음에 할 일, 아직 하지 않을 일을 정리할 자리입니다.",
    items: [
      {
        title: "지금",
        body: "공개 사이트, 디자인 시스템, 제품 실험실처럼 초기 제품 표면을 지탱할 뼈대를 다집니다.",
        status: "현재"
      },
      {
        title: "다음",
        body: "보안, 개인정보, 결제 안전, 실험 기준을 공개 가능한 문서와 화면으로 정리합니다.",
        status: "다음"
      },
      {
        title: "아직 안 함",
        body: "실제 운영 흐름이 생기기 전에는 네이티브 앱, 관리자 콘솔, 결제 화면을 억지로 만들지 않습니다.",
        status: "보류"
      }
    ],
    facts: [
      {
        term: "현재",
        description: "공개 사이트, 디자인 시스템, 제품 실험실의 초기 표면을 정리합니다."
      },
      {
        term: "다음",
        description: "보안, 개인정보, 결제 안전, 실험 기준을 공개 가능한 문서와 화면으로 엮습니다."
      },
      {
        term: "보류",
        description: "운영 흐름이 생기기 전에는 네이티브 앱, 관리자 콘솔, 결제 화면을 만들지 않습니다."
      }
    ],
    checks: [
      {
        item: "Roadmap shape",
        status: "유지",
        note: "지금 하는 일, 다음에 할 일, 아직 안 할 일을 분리해서 공개합니다."
      },
      {
        item: "Deferred apps",
        status: "보류",
        note: "네이티브 앱과 관리자 콘솔은 실제 운영 흐름이 생기기 전까지 만들지 않습니다."
      },
      {
        item: "Claims",
        status: "차단",
        note: "로드맵 문구는 검증되지 않은 일정, 매출, 고객 수를 약속하지 않습니다."
      }
    ]
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
    items: [
      {
        title: "개인정보",
        body: "정적 사이트로 운영되며 사용자 데이터를 수집하지 않습니다.",
        status: "수집 없음"
      }
    ],
    facts: [],
    checks: [
      {
        item: "Collection",
        status: "없음",
        note: "정적 사이트 단계에서는 사용자를 식별하는 데이터를 수집하지 않습니다."
      },
      {
        item: "Privacy owner",
        status: "분리",
        note: "개인정보 처리 흐름이 필요하면 별도 privacy 계약에서 먼저 소유권을 정합니다."
      }
    ]
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
