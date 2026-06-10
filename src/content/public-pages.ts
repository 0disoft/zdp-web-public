export interface PublicPageItem {
  readonly title: string;
  readonly body: string;
  readonly status: string;
}

export interface PublicPageDetail {
  readonly title: string;
  readonly body: string;
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
  readonly details: readonly PublicPageDetail[];
  readonly checks: readonly PublicPageCheck[];
}

export const publicPages: readonly PublicPage[] = [
  {
    id: "products",
    path: "/products",
    label: "제품",
    heading: "제품",
    summary: "8ailors에서 만들고 있는 제품과 실험입니다. 각 제품은 충분히 검증된 뒤에만 공개 목록에 올라갑니다.",
    items: [],
    details: [],
    checks: []
  },
  {
    id: "design",
    path: "/design",
    label: "디자인",
    heading: "디자인",
    summary: "화면이 달라도 조작법은 같습니다. 마우스 없이도 모든 기능을 사용할 수 있으며, 되돌리기 어려운 작업은 항상 확인을 거칩니다.",
    items: [
      {
        title: "한 화면에서 익힌 조작이 전체에 통합니다",
        body: "버튼, 입력, 링크는 어느 화면에서든 같은 규칙을 씁니다. 새로운 화면에 들어가도 조작법을 다시 배울 필요가 없습니다.",
        status: "일관성"
      },
      {
        title: "마우스 없이도 모든 요소를 탐색할 수 있습니다",
        body: "키보드로 링크, 버튼, 입력 필드를 이동할 수 있고, 지금 어디에 있는지 포커스 표시로 항상 알려줍니다.",
        status: "접근성"
      },
      {
        title: "실수로 중요한 작업을 눌러도 실행되지 않습니다",
        body: "삭제나 결제처럼 되돌리기 어려운 작업은 슬라이드하거나 2초 이상 누른 뒤에만 실행됩니다. 의도를 다시 한번 확인합니다.",
        status: "안전"
      },
      {
        title: "언어 설정에 맞는 서체와 줄바꿈이 자동으로 적용됩니다",
        body: "한국어·영어로 시작하며, 스페인어·중국어·힌디어·프랑스어·일본어·독일어·포르투갈어·인도네시아어까지 10개 언어로 확대합니다. 언어별 서체와 줄바꿈 방식은 자동으로 선택됩니다.",
        status: "현지화"
      }
    ],
    details: [
      {
        title: "어떤 환경에서도 읽을 수 있습니다",
        body: "밝은 배경과 어두운 배경을 모두 지원합니다. OS 설정을 따라가거나, 화면에서 직접 선택할 수도 있습니다."
      },
      {
        title: "화면에 보이는 값은 복사할 수 있습니다",
        body: "가격, 날짜, 코드, 주소처럼 화면에 표시된 데이터는 의도적으로 막지 않습니다. 필요한 정보를 쉽게 가져갈 수 있습니다."
      },
      {
        title: "모르는 용어는 클릭하면 설명이 나옵니다",
        body: "전문 용어가 나오면 클릭 한 번으로 그 자리에서 설명을 볼 수 있습니다. 별도 페이지로 이동하지 않아도 됩니다."
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
    summary: "사용자 정보는 서비스와 분리된 경계에서 보호합니다. 누가, 언제, 어떤 데이터를 봤는지 모두 기록하고, 그 기록은 삭제할 수 없습니다.",
    items: [
      {
        title: "결제와 개인정보는 서비스 코드와 분리된 곳에 보관합니다",
        body: "결제 정보와 개인정보는 서비스 코드와 다른 경계에서 저장됩니다. 기능을 개발할 때 그 값을 직접 꺼내볼 수 없도록 구조적으로 차단합니다.",
        status: "격리"
      },
      {
        title: "임직원이 열람하면 흔적이 남습니다",
        body: "개인정보나 결제 내역을 열람하면 사유와 시간이 기록됩니다. 그 기록은 어떤 권한으로도 삭제할 수 없는 별도 감사 로그에 남습니다.",
        status: "기록"
      },
      {
        title: "자동화 처리는 필요한 최소한의 데이터만 봅니다",
        body: "알림·정산·백업 같은 자동 처리는 동의된 범위 안에서 필요한 최소 데이터만 전달받습니다. 동의 없이 전체 정보를 읽지 않습니다.",
        status: "제한"
      }
    ],
    details: [
      {
        title: "개인정보는 사유와 기한을 정하고 열람합니다",
        body: "임직원이 개인정보를 볼 때는 사유와 만료 시간을 입력해야 합니다. 열람 기록은 삭제할 수 없는 별도 감사 로그에 남습니다."
      },
      {
        title: "계정을 삭제하면 흔적도 함께 지웁니다",
        body: "사용자가 계정 삭제를 요청하면 데이터베이스, 검색 색인, 캐시, 백업에서 해당 데이터를 제거합니다. 삭제 요청 자체도 감사 로그에 남습니다."
      },
      {
        title: "비밀번호와 결제 정보는 평문으로 남지 않습니다",
        body: "비밀번호는 해싱 후 저장하고, 결제 정보는 별도 결제 시스템에서만 처리합니다. 서버에 민감한 금융 정보가 평문으로 저장되지 않습니다."
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
        note: "결제는 분리된 외부 시스템에서만 처리합니다."
      }
    ]
  },

  {
    id: "labs",
    path: "/labs",
    label: "실험실",
    heading: "실험실",
    summary: "아직 검증되지 않은 제품과 기술 실험을 진행합니다. 실험은 독립된 환경에서만 실행되며, 실패하더라도 플랫폼 핵심 기능에는 영향을 주지 않습니다.",
    items: [],
    details: [],
    checks: []
  },
  {
    id: "roadmap",
    path: "/roadmap",
    label: "로드맵",
    heading: "로드맵",
    summary: "8ailors와 ZDP 플랫폼의 다음 단계를 정리합니다. 검토가 끝난 항목만 공개 로드맵에 올라갑니다.",
    items: [],
    details: [],
    checks: []
  },
  {
    id: "notes",
    path: "/notes",
    label: "기록",
    heading: "기록",
    summary: "제품과 플랫폼을 만들며 나온 기록과 결정 사유입니다. 기술 선택, 구조 변경, 정책 결정의 과정을 남깁니다.",
    items: [],
    details: [],
    checks: []
  },
  {
    id: "trust",
    path: "/trust",
    label: "정책",
    heading: "정책",
    summary: "데이터 보호, 개인정보 처리, 보안 정책에 관한 기준입니다. 사용자가 자신의 데이터를 어떻게 관리하고 삭제할 수 있는지를 명시합니다.",
    items: [],
    details: [],
    checks: []
  },
  {
    id: "contact",
    path: "/contact",
    label: "문의",
    heading: "문의",
    summary: "편지를 기다리는 마음으로.",
    items: [
      {
        title: "이메일",
        body: "hello@8ailors.xyz — 답장은 영업일 기준 2일 안에 갑니다.",
        status: "연락처"
      }
    ],
    details: [],
    checks: []
  },
  {
    id: "privacy",
    path: "/privacy",
    label: "개인정보",
    heading: "개인정보",
    summary: "당신의 이야기는 여기서 잠들고, 떠날 때는 흔적 없이 사라집니다.",
    items: [
      {
        title: "수집",
        body: "필요한 것만, 당신이 허락한 것만. 이메일, 기기 식별자, 로그 기록은 각자의 목적에 맞게 제한적으로 사용됩니다.",
        status: "수집"
      },
      {
        title: "사용",
        body: "약속한 길로만, 다른 데로 흘러가지 않습니다. 동의 없이 마케팅이나 제3자에게 전달되지 않습니다.",
        status: "목적"
      },
      {
        title: "보관",
        body: "떠나는 날, 모든 기억을 깨끗이 지웁니다. 계정 삭제 요청 시 데이터베이스와 백업에서 해당 정보를 제거합니다.",
        status: "보관"
      }
    ],
    details: [],
    checks: []
  },
  {
    id: "terms",
    path: "/terms",
    label: "약관",
    heading: "약관",
    summary: "서로를 존중하는 약속입니다.",
    items: [
      {
        title: "제공",
        body: "현재 버전의 제품과 플랫폼 기능을 제공합니다. 실험실은 언제든지 변할 수 있는 바다이므로, 별도 안내 없이 중단될 수 있습니다.",
        status: "범위"
      },
      {
        title: "의무",
        body: "타인의 계정을 무단으로 사용하거나, 서비스를 악용하여 다른 사람에게 피해를 주는 행위는 금지됩니다.",
        status: "의무"
      },
      {
        title: "책임",
        body: "법적 책임은 관련 법규가 정한 한도 내에 있지만, 신뢰에는 한도가 없습니다.",
        status: "책임"
      }
    ],
    details: [],
    checks: []
  },
  {
    id: "refunds",
    path: "/refunds",
    label: "환불",
    heading: "환불",
    summary: "돌아가는 길도 우아하게.",
    items: [
      {
        title: "조건",
        body: "서비스 미제공, 중대한 오류, 또는 법적 의무가 있는 경우 전액 환불합니다. 마음이 변한 경우에는 개시 후 7일 이내에 가능합니다.",
        status: "조건"
      },
      {
        title: "절차",
        body: "이메일 한 통이면 충분합니다. 접수 후 영업일 기준 5일 안에 검토하고, 승인 시 10일 안에 결제 수단으로 환불합니다.",
        status: "절차"
      }
    ],
    details: [],
    checks: []
  },
  {
    id: "about",
    path: "/about",
    label: "소개",
    heading: "소개",
    summary: "Rodisoft가 만드는 세밀한 소프트웨어 이야기.",
    items: [
      {
        title: "Rodisoft",
        body: "세밀함을 추구하는 소프트웨어 집단입니다. 사용자 중심의 안전한 소프트웨어를 만드는 것을 목표로 합니다.",
        status: "회사"
      },
      {
        title: "8ailors",
        body: "충분히 검증된 것만 바다에 띄웁니다. 제품과 실험, 정책, 기록을 공개하는 포털입니다.",
        status: "브랜드"
      }
    ],
    details: [],
    checks: []
  }
];
