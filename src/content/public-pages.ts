import { defaultLocale, localizePath, siteLocales, type SupportedLocale } from "../lib/site-locales";

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
  readonly path: `/${SupportedLocale}${string}`;
  readonly basePath: `/${string}`;
  readonly label: string;
  readonly heading: string;
  readonly summary?: string;
  readonly items: readonly PublicPageItem[];
  readonly details: readonly PublicPageDetail[];
  readonly checks: readonly PublicPageCheck[];
}

type BasePublicPage = Omit<PublicPage, "path" | "basePath">;

export const publicPageIds = [
  "products",
  "design",
  "security",
  "labs",
  "roadmap",
  "notes",
  "trust",
  "contact",
  "privacy",
  "terms",
  "refunds",
  "about"
] as const;

export type PublicPageId = (typeof publicPageIds)[number];

/*
 * mf:anchor zdp.web-public.public-page-catalog
 * purpose: Locate the public page catalog that drives static route and discovery content.
 * search: public pages, locale paths, trust pages, privacy, terms
 * invariant: Public content stays locale-owned and avoids private architecture, customer, or secret-bearing claims.
 * risk: privacy, config
 */
const publicPagesByLocaleSource: Record<SupportedLocale, readonly BasePublicPage[]> = {
  en: [
    {
      id: "products",
      label: "Products",
      heading: "Products",
      summary: "Products and experiments from 8ailors appear here only after they are ready for public review.",
      items: [],
      details: [],
      checks: []
    },
    {
      id: "design",
      label: "Design",
      heading: "Design",
      summary:
        "Different screens should still feel familiar. Every feature must work without a mouse, and high-risk actions must ask for clear confirmation.",
      items: [
        {
          title: "One learned interaction carries across the site",
          body:
            "Buttons, inputs, and links follow the same rules on every screen. Once someone learns a pattern, the next page should not make them relearn it.",
          status: "Consistency"
        },
        {
          title: "Every control is reachable without a mouse",
          body:
            "Links, buttons, and fields can be reached with the keyboard, and the current focus position is always visible.",
          status: "Accessibility"
        },
        {
          title: "Important actions cannot fire by accident",
          body:
            "Actions such as deletion or payment require an intentional confirmation pattern before they run.",
          status: "Safety"
        },
        {
          title: "Language settings shape type and wrapping",
          body:
            "The site starts with English and Korean, then expands toward Chinese, Spanish, French, Hindi, Japanese, Vietnamese, Russian, Indonesian, Malay, and Thai. Font and line-breaking rules must follow the selected language.",
          status: "Localization"
        }
      ],
      details: [
        {
          title: "Readable in light and dark environments",
          body:
            "The surface supports both light and dark color schemes. Visitors can follow the operating system setting or choose the mode directly."
        },
        {
          title: "Visible values remain copyable",
          body:
            "Prices, dates, code, addresses, and other displayed data should not be blocked from text selection."
        },
        {
          title: "Unfamiliar terms open in place",
          body:
            "Technical terms can open a short explanation without sending the visitor away from the current page."
        }
      ],
      checks: [
        {
          item: "Keyboard focus is always visible",
          status: "Promise",
          note: "The current position must be visible on every focusable element."
        },
        {
          item: "Readable text remains selectable",
          status: "Promise",
          note: "Data surfaces do not disable text selection."
        },
        {
          item: "Dangerous actions require confirmation",
          status: "Promise",
          note: "Destructive or paid actions do not run from a casual click."
        },
        {
          item: "Glossary sheets stay ad-free",
          status: "Promise",
          note: "Term sheets explain the term and do not contain advertising slots."
        }
      ]
    },
    {
      id: "security",
      label: "Security",
      heading: "Security",
      summary:
        "User information is protected behind separate boundaries. Sensitive access is recorded with who, when, and why, and the record is not deletable.",
      items: [
        {
          title: "Payments and personal data stay outside product code",
          body:
            "Payment details and personal data are stored behind separate boundaries so feature code cannot casually inspect them.",
          status: "Isolation"
        },
        {
          title: "Employee access leaves a record",
          body:
            "When sensitive data is viewed, the reason and time are recorded in an append-only audit log.",
          status: "Audit"
        },
        {
          title: "Automation receives only the minimum data",
          body:
            "Jobs such as notifications, settlement, and backups receive only the fields needed for the approved purpose.",
          status: "Limit"
        }
      ],
      details: [
        {
          title: "Sensitive access needs a reason and an expiry",
          body:
            "Employees must state why they need access and how long it should last. The access event remains in an audit trail."
        },
        {
          title: "Deletion requests propagate across stores",
          body:
            "Account deletion removes the user's data from databases, search indexes, caches, and backup workflows where applicable."
        },
        {
          title: "Passwords and payment details are not stored as plaintext",
          body:
            "Passwords are hashed, and payment details are handled by a separate payment system rather than stored in application tables."
        }
      ],
      checks: [
        {
          item: "Personal data is not viewed without purpose",
          status: "Promise",
          note: "Access reasons are recorded and cannot be erased as ordinary app data."
        },
        {
          item: "Account deletion also deletes related data",
          status: "Promise",
          note: "Deletion events must reach every relevant storage layer."
        },
        {
          item: "Payment details are not stored on our servers",
          status: "Promise",
          note: "Payments are processed through a separated payment provider."
        }
      ]
    },
    {
      id: "labs",
      label: "Labs",
      heading: "Labs",
      summary:
        "Unproven products and technical experiments live in a separate area so a failed experiment does not affect core platform behavior.",
      items: [],
      details: [],
      checks: []
    },
    {
      id: "roadmap",
      label: "Roadmap",
      heading: "Roadmap",
      summary: "Public roadmap items appear only after review, so the page reflects committed direction rather than rough internal brainstorming.",
      items: [],
      details: [],
      checks: []
    },
    {
      id: "notes",
      label: "Notes",
      heading: "Notes",
      summary: "Product and platform notes explain design choices, structural changes, and policy decisions that are ready to be public.",
      items: [],
      details: [],
      checks: []
    },
    {
      id: "trust",
      label: "Trust",
      heading: "Trust",
      summary: "Trust pages describe data protection, privacy, and security practices in terms visitors can verify.",
      items: [],
      details: [],
      checks: []
    },
    {
      id: "contact",
      label: "Contact",
      heading: "Contact",
      summary: "Business inquiries are handled by email.",
      items: [
        {
          title: "Email",
          body: "hello@8ailors.xyz. We usually reply within two business days.",
          status: "Contact"
        }
      ],
      details: [],
      checks: []
    },
    {
      id: "privacy",
      label: "Privacy",
      heading: "Privacy",
      summary: "This page states what is collected, why it is processed, how long it is kept, and how deletion works.",
      items: [
        {
          title: "Collection",
          body: "Only the minimum information needed for the service is collected. Email, device identifiers, and logs are each limited to their own purpose.",
          status: "Collection"
        },
        {
          title: "Use",
          body: "Data is used for service delivery, security, and error response. It is not used for marketing or third-party sharing without consent.",
          status: "Purpose"
        },
        {
          title: "Retention",
          body: "When an account deletion request is accepted, related data is removed from active stores and backup workflows where applicable.",
          status: "Retention"
        }
      ],
      details: [],
      checks: []
    },
    {
      id: "terms",
      label: "Terms",
      heading: "Terms",
      summary: "The terms define service use, responsibilities, and the limits of each party's obligations.",
      items: [
        {
          title: "Service",
          body: "Current product and platform features are provided as described. Labs features may change or stop while they are being tested.",
          status: "Scope"
        },
        {
          title: "Conduct",
          body: "Using another person's account or abusing the service in ways that harm users or systems is not allowed.",
          status: "Conduct"
        },
        {
          title: "Responsibility",
          body: "Legal responsibility for interruptions, data loss, or defects is limited to the extent allowed by applicable law.",
          status: "Liability"
        }
      ],
      details: [],
      checks: []
    },
    {
      id: "refunds",
      label: "Refunds",
      heading: "Refunds",
      summary: "Refund rules explain cancellation conditions, review steps, and expected timing.",
      items: [
        {
          title: "Conditions",
          body: "A full refund is provided when the service is not delivered, a severe defect occurs, or the law requires it.",
          status: "Conditions"
        },
        {
          title: "Process",
          body: "Email requests are reviewed within five business days, and approved refunds are returned to the original payment method.",
          status: "Process"
        }
      ],
      details: [],
      checks: []
    },
    {
      id: "about",
      label: "About",
      heading: "About",
      summary: "About Rodisoft and 8ailors.",
      items: [
        {
          title: "Rodisoft",
          body: "Rodisoft designs and builds software products and platform systems with a focus on safe user-centered tools.",
          status: "Company"
        },
        {
          title: "8ailors",
          body: "8ailors is the public portal for Rodisoft products, experiments, policies, and notes.",
          status: "Brand"
        }
      ],
      details: [],
      checks: []
    }
  ],
  ko: [
    {
      id: "products",
      label: "제품",
      heading: "제품",
      summary: "8ailors에서 만들고 있는 제품과 실험입니다. 각 제품은 충분히 검증된 뒤에만 공개 목록에 올라갑니다.",
      items: [],
      details: [],
      checks: []
    },
    {
      id: "design",
      label: "디자인",
      heading: "디자인",
      summary:
        "화면이 달라도 조작법은 같습니다. 마우스 없이도 모든 기능을 사용할 수 있으며, 되돌리기 어려운 작업은 항상 확인을 거칩니다.",
      items: [
        {
          title: "한 화면에서 익힌 조작이 전체에 통합니다",
          body:
            "버튼, 입력, 링크는 어느 화면에서든 같은 규칙을 씁니다. 새로운 화면에 들어가도 조작법을 다시 배울 필요가 없습니다.",
          status: "일관성"
        },
        {
          title: "마우스 없이도 모든 요소를 탐색할 수 있습니다",
          body:
            "키보드로 링크, 버튼, 입력 필드를 이동할 수 있고, 지금 어디에 있는지 포커스 표시로 항상 알려줍니다.",
          status: "접근성"
        },
        {
          title: "실수로 중요한 작업을 눌러도 실행되지 않습니다",
          body:
            "삭제나 결제처럼 되돌리기 어려운 작업은 슬라이드하거나 2초 이상 누른 뒤에만 실행됩니다. 의도를 다시 한번 확인합니다.",
          status: "안전"
        },
        {
          title: "언어 설정에 맞는 서체와 줄바꿈이 자동으로 적용됩니다",
          body:
            "한국어·영어로 시작하며, 중국어·스페인어·프랑스어·힌디어·일본어·베트남어·러시아어·인도네시아어·말레이어·태국어까지 확대합니다. 언어별 서체와 줄바꿈 방식은 자동으로 선택됩니다.",
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
      label: "보안",
      heading: "보안",
      summary:
        "사용자 정보는 서비스와 분리된 경계에서 보호합니다. 누가, 언제, 어떤 데이터를 봤는지 모두 기록하고, 그 기록은 삭제할 수 없습니다.",
      items: [
        {
          title: "결제와 개인정보는 서비스 코드와 분리된 곳에 보관합니다",
          body:
            "결제 정보와 개인정보는 서비스 코드와 다른 경계에서 저장됩니다. 기능을 개발할 때 그 값을 직접 꺼내볼 수 없도록 구조적으로 차단합니다.",
          status: "격리"
        },
        {
          title: "임직원이 열람하면 흔적이 남습니다",
          body:
            "개인정보나 결제 내역을 열람하면 사유와 시간이 기록됩니다. 그 기록은 어떤 권한으로도 삭제할 수 없는 별도 감사 로그에 남습니다.",
          status: "기록"
        },
        {
          title: "자동화 처리는 필요한 최소한의 데이터만 봅니다",
          body:
            "알림·정산·백업 같은 자동 처리는 동의된 범위 안에서 필요한 최소 데이터만 전달받습니다. 동의 없이 전체 정보를 읽지 않습니다.",
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
          body:
            "사용자가 계정 삭제를 요청하면 데이터베이스, 검색 색인, 캐시, 백업에서 해당 데이터를 제거합니다. 삭제 요청 자체도 감사 로그에 남습니다."
        },
        {
          title: "비밀번호와 결제 정보는 평문으로 남지 않습니다",
          body:
            "비밀번호는 해싱 후 저장하고, 결제 정보는 별도 결제 시스템에서만 처리합니다. 서버에 민감한 금융 정보가 평문으로 저장되지 않습니다."
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
      label: "실험실",
      heading: "실험실",
      summary:
        "아직 검증되지 않은 제품과 기술 실험을 진행합니다. 실험은 독립된 환경에서만 실행되며, 실패하더라도 플랫폼 핵심 기능에는 영향을 주지 않습니다.",
      items: [],
      details: [],
      checks: []
    },
    {
      id: "roadmap",
      label: "로드맵",
      heading: "로드맵",
      summary: "8ailors와 ZDP 플랫폼의 다음 단계를 정리합니다. 검토가 끝난 항목만 공개 로드맵에 올라갑니다.",
      items: [],
      details: [],
      checks: []
    },
    {
      id: "notes",
      label: "기록",
      heading: "기록",
      summary: "제품과 플랫폼을 만들며 나온 기록과 결정 사유입니다. 기술 선택, 구조 변경, 정책 결정의 과정을 남깁니다.",
      items: [],
      details: [],
      checks: []
    },
    {
      id: "trust",
      label: "정책",
      heading: "정책",
      summary: "데이터 보호, 개인정보 처리, 보안 정책에 관한 기준입니다. 사용자가 자신의 데이터를 어떻게 관리하고 삭제할 수 있는지를 명시합니다.",
      items: [],
      details: [],
      checks: []
    },
    {
      id: "contact",
      label: "문의",
      heading: "문의",
      summary: "업무 관련 문의는 이메일로 접수합니다.",
      items: [
        {
          title: "이메일",
          body: "hello@8ailors.xyz. 영업일 기준 2일 안에 답변합니다.",
          status: "연락처"
        }
      ],
      details: [],
      checks: []
    },
    {
      id: "privacy",
      label: "개인정보",
      heading: "개인정보",
      summary: "수집 항목, 처리 목적, 보관 기간, 삭제 절차를 명시합니다.",
      items: [
        {
          title: "수집",
          body: "필요한 최소 정보만 수집합니다. 이메일, 기기 식별자, 로그 기록은 각각의 목적에 맞게 제한적으로 사용합니다.",
          status: "수집"
        },
        {
          title: "사용",
          body: "서비스 제공, 보안, 오류 대응에만 사용합니다. 동의 없이 마케팅이나 제3자 제공에 활용하지 않습니다.",
          status: "목적"
        },
        {
          title: "보관",
          body: "계정 삭제 요청 시 데이터베이스와 백업에서 해당 정보를 제거합니다. 삭제 요청 자체도 감사 로그에 남습니다.",
          status: "보관"
        }
      ],
      details: [],
      checks: []
    },
    {
      id: "terms",
      label: "약관",
      heading: "약관",
      summary: "서비스 이용 조건, 권리·의무, 책임 범위를 정합니다.",
      items: [
        {
          title: "제공",
          body: "현재 버전의 제품과 플랫폼 기능을 제공합니다. 실험실 기능은 별도 안내 없이 변경되거나 중단될 수 있습니다.",
          status: "범위"
        },
        {
          title: "의무",
          body: "타인의 계정을 무단으로 사용하거나, 서비스를 악용하여 다른 사용자나 시스템에 피해를 주는 행위를 금지합니다.",
          status: "의무"
        },
        {
          title: "책임",
          body: "서비스 중단, 데이터 손실, 오류로 인한 피해에 대한 법적 책임은 관련 법규가 정한 한도 내에 제한됩니다.",
          status: "책임"
        }
      ],
      details: [],
      checks: []
    },
    {
      id: "refunds",
      label: "환불",
      heading: "환불",
      summary: "결제 취소와 환불 조건, 절차, 기한을 명시합니다.",
      items: [
        {
          title: "조건",
          body: "서비스 미제공, 중대한 오류, 또는 법적 의무가 있는 경우 전액 환불합니다. 단순 변심은 개시 후 7일 이내에 처리합니다.",
          status: "조건"
        },
        {
          title: "절차",
          body: "이메일로 접수 후 영업일 기준 5일 안에 검토, 승인 시 10일 안에 결제 수단으로 환불합니다.",
          status: "절차"
        }
      ],
      details: [],
      checks: []
    },
    {
      id: "about",
      label: "소개",
      heading: "소개",
      summary: "Rodisoft와 8ailors에 대해 설명합니다.",
      items: [
        {
          title: "Rodisoft",
          body: "제품과 플랫폼을 설계하고 개발하는 소프트웨어 집단입니다. 사용자 중심의 안전한 소프트웨어를 목표로 합니다.",
          status: "회사"
        },
        {
          title: "8ailors",
          body: "Rodisoft의 제품과 실험, 정책, 기록을 공개하는 포털입니다. 충분히 검증된 제품만 공개 목록에 올립니다.",
          status: "브랜드"
        }
      ],
      details: [],
      checks: []
    }
  ]
};

export const publicPagesByLocale: Readonly<Record<SupportedLocale, readonly PublicPage[]>> = {
  en: buildPublicPagesForLocale("en"),
  ko: buildPublicPagesForLocale("ko")
};

export const publicPages = publicPagesByLocale[defaultLocale];

export const publicEntryPaths = ["/", ...publicPageIds.map((id) => `/${id}` as `/${string}`)] as const;

export const publicLocalizedPaths = siteLocales.flatMap((locale) => [
  localizePath("/", locale),
  ...publicPageIds.map((id) => localizePath(`/${id}`, locale))
]);

export function getPublicPages(locale: SupportedLocale): readonly PublicPage[] {
  return publicPagesByLocale[locale];
}

export function getPublicPage(locale: SupportedLocale, id: string): PublicPage | undefined {
  return publicPagesByLocale[locale].find((page) => page.id === id);
}

function buildPublicPagesForLocale(locale: SupportedLocale): readonly PublicPage[] {
  return publicPagesByLocaleSource[locale].map((page) => ({
    ...page,
    basePath: `/${page.id}` as `/${string}`,
    path: localizePath(`/${page.id}`, locale)
  }));
}
