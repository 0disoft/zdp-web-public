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
  readonly detail: string;
  readonly items: readonly PublicPageItem[];
}

export const publicPages: readonly PublicPage[] = [
  {
    id: "products",
    path: "/products",
    label: "제품",
    heading: "제품 표면",
    summary:
      "chatgpt.com이나 claude.ai 같은 개별 제품이 생기면, 8ailors는 그 제품들을 찾고 비교하고 신뢰할 수 있게 묶는 공개 허브가 된다.",
    detail:
      "지금은 제품을 과장해서 나열하지 않는다. 실제로 공개 가능한 제품, 실험, 문서 링크가 생겼을 때만 이 페이지에서 연결한다.",
    items: [
      {
        title: "공개 제품",
        body: "사용자가 직접 쓰는 제품은 준비된 뒤 별도 제품 사이트로 보낸다.",
        status: "launch later"
      },
      {
        title: "실험실",
        body: "검증 전 실험은 내부 기준과 종료 조건이 닫힌 뒤 제한적으로 공개한다.",
        status: "private"
      },
      {
        title: "제품 기록",
        body: "출시 상태, 변경 내역, 공개 가능한 제품 노트를 한곳에서 연결한다.",
        status: "planned"
      }
    ]
  },
  {
    id: "notes",
    path: "/notes",
    label: "노트",
    heading: "공개 기록",
    summary:
      "내부 아키텍처 문서를 그대로 꺼내지 않고, 외부 사람이 읽어도 되는 제품 방향과 운영 기록만 선별한다.",
    detail:
      "ZDP 내부 기준서 전체를 공개 블로그처럼 쓰지 않는다. 바깥 사람이 제품을 이해하는 데 필요한 기록만 분리한다.",
    items: [
      {
        title: "빌드 노트",
        body: "제품을 만든 이유, 포기한 선택지, 다음 공개 계획을 짧게 남긴다.",
        status: "draft"
      },
      {
        title: "기술 노트",
        body: "Jiffy, Prasso, Webpub처럼 공개 가능한 도구 실험을 별도 기록으로 정리한다.",
        status: "draft"
      },
      {
        title: "운영 노트",
        body: "장애, 비용, 보안 같은 이야기는 과장 없이 검증 가능한 수준에서만 공개한다.",
        status: "guarded"
      }
    ]
  },
  {
    id: "trust",
    path: "/trust",
    label: "정책",
    heading: "신뢰 경계",
    summary:
      "로그인, 결제, AI 사용자 데이터 접근이 들어오기 전까지도 공개 사이트가 말해도 되는 선과 아직 말하면 안 되는 선을 분리한다.",
    detail:
      "8ailors는 제품이 늘어나도 신뢰 정책의 입구가 되어야 한다. 단, 실제 약관과 개인정보 문서는 첫 공개 제품의 책임 범위가 닫힌 뒤 분리한다.",
    items: [
      {
        title: "개인정보",
        body: "현재 첫 화면은 정적 사이트이며 원본 사용자 데이터를 저장하지 않는다.",
        status: "no user data"
      },
      {
        title: "약관",
        body: "첫 공개 제품의 책임 범위가 정해진 뒤 제품별 약관과 연결한다.",
        status: "pending"
      },
      {
        title: "보안 연락",
        body: "공개 전 보안 제보 경로와 처리 기준을 별도 정책으로 고정한다.",
        status: "pending"
      }
    ]
  },
  {
    id: "contact",
    path: "/contact",
    label: "문의",
    heading: "연락 경로",
    summary:
      "도메인과 메일 발신 경로가 준비되기 전에는 임시 연락처를 박지 않고, 공개 가능한 채널이 생길 때 연결한다.",
    detail:
      "문의 페이지는 폼을 가장하고 개인정보를 받지 않는다. 백엔드, 스팸 방지, 보관 정책이 준비될 때까지 정적 연락 경계만 둔다.",
    items: [
      {
        title: "사업체 본체",
        body: "8ailors는 ZDP 플랫폼들의 회사형 공개 표면으로 시작한다.",
        status: "candidate"
      },
      {
        title: "제품 문의",
        body: "제품별 문의는 첫 제품이 공개될 때 각 제품 페이지에서 분리한다.",
        status: "planned"
      },
      {
        title: "파트너 연락",
        body: "외부 협업 채널은 공개 정책과 보안 연락 경로가 준비된 뒤 연다.",
        status: "closed"
      }
    ]
  }
];
