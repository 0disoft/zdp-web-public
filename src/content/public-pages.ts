export interface PublicPageItem {
  readonly title: string;
  readonly body: string;
  readonly status: string;
}

export interface PublicPage {
  readonly id: string;
  readonly path: `/${string}`;
  readonly label: string;
  readonly heading: string;
  readonly summary: string;
  readonly items: readonly PublicPageItem[];
}

export const publicPages: readonly PublicPage[] = [
  {
    id: "products",
    path: "/products",
    label: "제품",
    heading: "제품",
    summary: "출시 예정 서비스입니다.",
    items: []
  },
  {
    id: "design",
    path: "/design",
    label: "디자인",
    heading: "디자인",
    summary: "8ailors 화면과 제품 표면에 적용할 디자인 기준입니다.",
    items: []
  },
  {
    id: "security",
    path: "/security",
    label: "보안",
    heading: "보안",
    summary: "서비스 경계, 검증, 비밀값 관리 기준을 정리할 자리입니다.",
    items: []
  },
  {
    id: "payment-safety",
    path: "/payment-safety",
    label: "결제 안전",
    heading: "결제 안전",
    summary: "결제, 크레딧, 원장 경계를 공개 가능한 수준으로 정리할 자리입니다.",
    items: []
  },
  {
    id: "labs",
    path: "/labs",
    label: "실험실",
    heading: "실험실",
    summary: "검증 중인 제품과 기술 실험을 모아둘 자리입니다.",
    items: []
  },
  {
    id: "roadmap",
    path: "/roadmap",
    label: "로드맵",
    heading: "로드맵",
    summary: "지금 하는 일, 다음에 할 일, 아직 하지 않을 일을 정리할 자리입니다.",
    items: []
  },
  {
    id: "notes",
    path: "/notes",
    label: "기록",
    heading: "기록",
    summary: "개발 과정의 기록입니다.",
    items: []
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
    ]
  },
  {
    id: "contact",
    path: "/contact",
    label: "문의",
    heading: "문의",
    summary: "서비스 개방 시 연락 채널을 공개합니다.",
    items: []
  }
];
