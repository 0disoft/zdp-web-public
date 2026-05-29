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
