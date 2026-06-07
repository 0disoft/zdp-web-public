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
    heading: "디자인",
    summary: "화면이 달라도 조작법은 같습니다. 키보드만으로도 됩니다.",
    items: [
      {
        title: "어디서나 같은 방식으로 작동합니다",
        body: "버튼, 입력, 링크는 어느 화면에서든 같은 규칙을 씁니다. 한 화면에서 익힌 조작이 전체에 통합니다.",
        status: "일관성"
      },
      {
        title: "키보드만으로도 탐색할 수 있습니다",
        body: "마우스 없이 키보드로 모든 요소를 탐색할 수 있습니다. 지금 어디 있는지 항상 화면에 표시됩니다.",
        status: "접근성"
      },
      {
        title: "위험한 작업은 실수로 눌리지 않습니다",
        body: "삭제나 결제처럼 되돌리기 어려운 작업은 밀거나 2초 누른 뒤에만 실행됩니다.",
        status: "안전"
      },
      {
        title: "내 언어에 맞게 표시됩니다",
        body: "한국어·영어로 시작하며 스페인어·중국어·힌디어·프랑스어·일본어·독일어·포르투갈어·인도네시아어까지 10개 언어로 확대합니다. 언어별 서체와 줄바꿈 방식은 자동으로 선택됩니다.",
        status: "현지화"
      }
    ],
    facts: [
      {
        term: "다크 모드",
        description: "지원합니다. OS 설정과 별개로 직접 선택할 수 있습니다."
      },
      {
        term: "텍스트 복사",
        description: "화면에 표시된 값은 복사할 수 있습니다. 의도적으로 막지 않습니다."
      },
      {
        term: "용어 설명",
        description: "전문 용어는 클릭하면 그 자리에서 설명을 볼 수 있습니다."
      }
    ],
    checks: [
      {
        item: "키보드 포커스는 항상 보입니다",
        status: "약속",
        note: "어느 요소에 있든 현재 위치가 화면에 표시됩니다."
      },
      {
        item: "화면의 텍스트는 복사할 수 있습니다",
        status: "약속",
        note: "데이터를 보여주는 영역에 선택 차단을 걸지 않습니다."
      },
      {
        item: "위험한 작업은 확인을 거칩니다",
        status: "약속",
        note: "삭제·결제는 밀거나 2초 누른 뒤에만 실행됩니다."
      },
      {
        item: "용어 팝업에 광고를 넣지 않습니다",
        status: "약속",
        note: "용어 설명 창은 설명만 보여줍니다."
      }
    ]
  },
  {
    id: "security",
    path: "/security",
    label: "보안",
    heading: "보안",
    summary: "내 정보를 누가 봤는지, 저희도 감시받습니다.",
    items: [
      {
        title: "결제와 개인정보는 따로 보관합니다",
        body: "결제 정보와 개인정보는 서비스 코드와 분리된 곳에 저장됩니다. 기능을 개발할 때 그 값을 직접 꺼내볼 수 없습니다.",
        status: "격리"
      },
      {
        title: "열람하면 흔적이 남습니다",
        body: "임직원이 개인정보나 결제 내역을 열람하면 기록이 남습니다. 그 기록은 삭제할 수 없습니다.",
        status: "기록"
      },
      {
        title: "자동화도 필요한 것만 봅니다",
        body: "알림·정산 같은 자동 처리는 필요한 최소한의 데이터만 전달받습니다. 동의 없이 전체 정보를 읽지 않습니다.",
        status: "제한"
      }
    ],
    facts: [
      {
        term: "개인정보 열람",
        description: "사유와 만료 시간 입력 후에만 가능. 이력은 삭제 불가."
      },
      {
        term: "계정 삭제",
        description: "요청하면 DB·검색 색인·캐시 전체에서 삭제됩니다."
      },
      {
        term: "비밀번호·결제 정보",
        description: "서버에 평문으로 저장되지 않습니다."
      }
    ],
    checks: [
      {
        item: "개인정보는 업무 목적 외에 열람하지 않습니다",
        status: "약속",
        note: "열람 사유를 기록하고, 그 이력은 삭제되지 않습니다."
      },
      {
        item: "계정을 삭제하면 데이터도 삭제됩니다",
        status: "약속",
        note: "모든 저장소에 삭제가 전파됩니다."
      },
      {
        item: "결제 정보는 저희 서버에 저장되지 않습니다",
        status: "약속",
        note: "결제는 분리된 외부 시스템에서만 처리됩니다."
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
