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
    ]
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
