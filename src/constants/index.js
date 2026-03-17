// ── Version & Changelog ────────────────────────────────
export const VERSION = "v1.11.0";
export const BUILD_DATE = "2026-03-17";
export const CHANGELOG = [
  {
    version: "v1.11.0", date: "2026-03-17",
    en: [
      "Fix: NRE_BASE null-safety guard (prevents NaN cascade on unknown site type)",
      "Fix: localStorage QuotaExceededError — warning toast instead of silent fail",
      "Fix: Sheets 401 token expiry — auto re-auth & retry (matches Drive behavior)",
      "Fix: Remove dead hpw/wpy state from preset serialization",
      "New: CSV export button on Year-by-Year ROI table",
      "New: Auto-saved indicator badge (calc cache status)",
      "New: Sensitivity Analysis — configurable variation % (was hardcoded ±10/20%)",
      "New: Preset JSON export per card / import from file",
    ],
    ko: [
      "수정: NRE_BASE null 안전 처리 (알 수 없는 사이트 타입 시 NaN 전파 방지)",
      "수정: localStorage 용량 초과 오류 — 무음 실패 대신 경고 토스트",
      "수정: Sheets 401 토큰 만료 — 자동 재인증 및 재시도 (Drive와 동일)",
      "수정: 프리셋 직렬화에서 미사용 hpw/wpy 상태 제거",
      "신규: 연도별 ROI 테이블 CSV 내보내기 버튼",
      "신규: 자동저장 표시 배지 (calc cache 상태)",
      "신규: 민감도 분석 — 변동폭 % 직접 설정 (기존 ±10/20% 고정값)",
      "신규: 프리셋 카드별 JSON 내보내기 / 파일 가져오기",
    ],
  },
  {
    version: "v1.10.1", date: "2026-03-16",
    en: [
      "New: ? Help button — tab overview + latest release notes (auto-updates with CHANGELOG)",
      "New: MANUAL_EN.md / MANUAL_KR.md — full Confluence manuals",
      "Refactor: App.jsx split into 15 modules (3118 → 1311 lines)",
      "Refactor: Chart.js removed — all charts now Recharts (-150KB bundle)",
      "Fix: Quotation PDF — Overhead/Margin rows hidden from customer view",
      "UX: Input guard rails — orange border + ⚠ when value out of range",
    ],
    ko: [
      "신규: ? 도움말 버튼 — 탭 설명 + 최신 릴리즈 노트 (CHANGELOG 자동 반영)",
      "신규: MANUAL_EN.md / MANUAL_KR.md — Confluence 업로드용 전체 매뉴얼",
      "리팩토링: App.jsx 15개 모듈 분리 (3118 → 1311줄)",
      "리팩토링: Chart.js 제거 → 전체 Recharts 통일 (번들 -150KB)",
      "수정: 견적서 PDF — Overhead/Margin 행 고객 노출 제거",
      "UX: 입력값 가드레일 — 범위 초과 시 주황 테두리 + ⚠ 표시",
    ],
  },
  {
    version: "v1.10.0", date: "2026-03-15",
    en: [
      "Fix: NRE labor config (laborInputs) now saved in team presets",
      "Fix: Drive 401 token expiry → silent re-auth & automatic retry",
      "Fix: Operational License added to SR Pricing area-mode OPEX",
      "UX: Reset Labor Defaults button in Pricing Calc tab",
      "New: Sensitivity Analysis panel (CAPEX ±20% / Labor ±20%)",
      "New: Scenario A/B save & compare (side-by-side key metrics)",
    ],
    ko: [
      "수정: NRE 인력 구성(laborInputs) 팀 프리셋에 저장됨",
      "수정: Drive 401 토큰 만료 → 자동 재인증 및 재시도",
      "수정: SR Pricing OPEX에 Operational License 포함",
      "UX: Pricing Calc 탭 인건비 기본값 초기화 버튼",
      "신규: 민감도 분석 패널 (CAPEX/인건비 ±20%)",
      "신규: 시나리오 A/B 저장 및 비교 (핵심 지표 나란히 비교)",
    ],
  },
  {
    version: "v1.9.2", date: "2026-03-14",
    en: ["Report/Quotation: 💾 Save to Google Drive button (auto-folder 'SR ATI ROI Reports')",
         "Added Department field to Internal Report & Quotation forms",
         "PDF includes Department in Project Info / Quote Details"],
    ko: ["리포트/견적서: 💾 Google Drive 저장 버튼 ('SR ATI ROI Reports' 폴더 자동 생성)",
         "내부 보고용 / 견적서 폼에 부서 필드 추가",
         "PDF에 부서 정보 포함 (프로젝트 정보 / 견적 세부사항)"],
  },
  {
    version: "v1.9.1", date: "2026-03-14",
    en: ["Mobile: all modal widths now responsive (min(width, 92vw))",
         "Touch targets enlarged (logout, update, tab, site card buttons)",
         "Tab font 10px → 11px, HW Config header 12px",
         "Pricing Calc state (sites/HW) now auto-saved to localStorage"],
    ko: ["모바일: 모든 모달 너비 반응형 적용 (min(width, 92vw))",
         "터치 타깃 확대 (로그아웃, 업데이트, 탭, 사이트 카드 버튼)",
         "탭 폰트 10px → 11px, HW Config 헤더 12px",
         "Pricing Calc 상태 (사이트/HW) localStorage 자동 저장"],
  },
  {
    version: "v1.9.0", date: "2026-03-14",
    en: ["Report split into two modes: Internal Report & Customer Quotation",
         "Quotation PDF: cover page, HW BOM, step-by-step pricing, ROI highlights, T&Cs",
         "Quote No. auto-generated (QT-YYYYMMDD-HHMM), configurable validity period",
         "New fields: Contact Person, SR Sales Rep"],
    ko: ["리포트 2모드 분리: 내부 보고용 / 고객 견적서",
         "견적서 PDF: 커버, HW BOM, 단계별 가격, ROI 하이라이트, 조건",
         "견적 번호 자동생성 (QT-YYYYMMDD-HHMM), 유효기간 설정",
         "신규 필드: 고객 담당자, SR 영업 담당"],
  },
  {
    version: "v1.8.1", date: "2026-03-13",
    en: ["UI/visibility fixes: tab overflow, KPI text, CR layout, ROI table",
         "i18n: all hardcoded strings replaced with T keys",
         "Analytics: CAPEX doughnut NRE fix, Radar/CBar labels in Korean",
         "New site diff defaults corrected (roadWidth consistency)"],
    ko: ["UI/가시성 수정: 탭 오버플로, KPI 텍스트, CR 레이아웃, ROI 테이블",
         "i18n: 하드코딩 문자열 전부 T 키로 교체",
         "애널리틱스: CAPEX 도넛 NRE 수정, 레이더/막대차트 한국어 레이블",
         "신규 사이트 난이도 기본값 일관성 수정"],
  },
  {
    version: "v1.8.0", date: "2026-03-13",
    en: ["Editable Hardware Configuration (prices, names, brands, custom items)",
         "Hardware Config Presets (save/load)",
         "PDF Report export (author, version, date, full summary)",
         "Analytics upgrade: Doughnut/Radar/Area charts via Chart.js"],
    ko: ["하드웨어 구성 편집 가능 (가격, 이름, 브랜드, 커스텀 추가)",
         "하드웨어 구성 프리셋 저장/불러오기",
         "PDF 리포트 내보내기 (작성자, 버전, 날짜, 전체 요약)",
         "애널리틱스 강화: Chart.js Doughnut/Radar/Area 차트 추가"],
  },
  {
    version: "v1.7.0", date: "2026-03-13",
    en: ["Added 🧮 Pricing Calc tab (5th tab)",
         "Site / HW input → CAPEX & OPEX auto-calculation",
         "NRE difficulty factor per site",
         "Apply to SR Pricing tab button"],
    ko: ["🧮 가격 계산 탭 추가 (5번째 탭)",
         "사이트 / HW 입력 → CAPEX & OPEX 자동 계산",
         "사이트별 NRE 난이도 계수",
         "SR Pricing 탭에 적용 버튼 추가"],
  },
  {
    version: "v1.6.0", date: "2026-03-13",
    en: ["Preset storage migrated to Google Sheets (team-shared)",
         "Auto-load presets from Sheets on login",
         "🔄 Refresh button in preset panel",
         "Offline fallback to localStorage if Sheets unavailable"],
    ko: ["프리셋 저장소를 Google Sheets로 전환 (팀 공유)",
         "로그인 시 Sheets에서 자동 로드",
         "프리셋 패널에 🔄 새로고침 버튼 추가",
         "Sheets 연결 불가 시 로컬 저장소로 폴백"],
  },
  {
    version: "v1.5.0", date: "2026-03-13",
    en: ["Added version badge & changelog modal to header",
         "Fixed area-mode OPEX description bug (stale opexPerM2 reference)"],
    ko: ["헤더에 버전 배지 및 변경 이력 모달 추가",
         "면적 방식 OPEX 설명 버그 수정 (구 변수 참조 오류)"],
  },
  {
    version: "v1.4.0", date: "2026-03-13",
    en: ["CAPEX: added Overhead (15%), First Plant Discount (40%), Difficulty Factor (×NRE)",
         "OPEX area mode: broken down into HW Warranty / Site Support / SW Update / Overhaul",
         "OPEX annual discount schedule (Year-1 30%, −3%/yr)",
         "Preset storage key upgraded to v4"],
    ko: ["CAPEX: 오버헤드(15%), 초도 할인율(40%), 난이도 계수(NRE 반영) 추가",
         "OPEX 면적 방식: HW보증 / 현장지원 / SW업데이트 / 오버홀 세분화",
         "OPEX 연도별 할인율 일정 추가 (1년차 30%, −3%/년)",
         "프리셋 저장 키 v4로 업그레이드"],
  },
  {
    version: "v1.3.1", date: "2026-03-13",
    en: ["Fixed allowed domain: seoulrobotics.com → seoulrobotics.org",
         "Removed hd parameter to fix Google login button not rendering"],
    ko: ["허용 도메인 수정: seoulrobotics.com → seoulrobotics.org",
         "hd 파라미터 제거로 Google 로그인 버튼 미표시 문제 해결"],
  },
  {
    version: "v1.3.0", date: "2026-03-13",
    en: ["Security: restricted login to @seoulrobotics.org Google accounts only",
         "Security: added clamp validation on all localStorage preset parameters"],
    ko: ["보안: Google 로그인을 @seoulrobotics.org 계정만 허용",
         "보안: localStorage 프리셋 전체 파라미터 범위 검증 추가"],
  },
  {
    version: "v1.2.0", date: "2026-03-12",
    en: ["Fixed preset save logic", "Fixed SR ROI calculation logic"],
    ko: ["프리셋 저장 로직 수정", "SR ROI 계산 로직 수정"],
  },
  {
    version: "v1.1.0", date: "2026-03-12",
    en: ["Added EN / KR language toggle"],
    ko: ["EN / KR 언어 전환 추가"],
  },
  {
    version: "v1.0.1", date: "2026-03-12",
    en: ["Fixed SR Total calculation"],
    ko: ["SR Total 계산 수정"],
  },
  {
    version: "v1.0.0", date: "2026-03-12",
    en: ["Initial release: Production / Transport / Workforce / SR Pricing tabs",
         "Google OAuth login", "Factory preset save/load", "ROI charts & table"],
    ko: ["초기 릴리즈: 생산 / 운송 / 인력 / SR 가격 탭",
         "Google OAuth 로그인", "공장 프리셋 저장/불러오기", "ROI 차트 및 테이블"],
  },
];

// ── Google Auth ────────────────────────────────────────
export const CLIENT_ID = "318386102464-2bavuh812hpk4gsegb5tkvrsnhartsm9.apps.googleusercontent.com";
export const ALLOWED_DOMAIN = "seoulrobotics.org";
export const SHEET_ID = "1drJd-Ete7ANEzhNliihFboZ4v8d4jngD9U_fTAjy71s";
export const SHEET_NAME = "Presets";
export const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
export const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";
export const DRIVE_FOLDER_ID = "1CBJSurqLXL2LqBIZVYiIyxJ5BaNLkhn_"; // Shared Drive: SR ATI ROI Reports

export const DEFAULT_HW_CONFIG = [
  { id: "xt32",   brand: "Hesai", label: "Lidar XT32",   price: 4500  },
  { id: "ot128",  brand: "Hesai", label: "Lidar OT128",  price: 12600 },
  { id: "qt128",  brand: "Hesai", label: "Lidar QT128",  price: 5000  },
  { id: "zt128",  brand: "Hesai", label: "Lidar ZT128",  price: 1620  },
  { id: "server", brand: "SR",    label: "Server",       price: 27000 },
  { id: "etc",    brand: "SR",    label: "Accessories",  price: 1000  },
];
export const HW_PRESET_KEY = "sr-hw-presets-v1";

export const DEFAULT_LABOR = [
  { id: "jr",  label: "Jr. Engineer",  rate: 7351,  hc: 5, mm: 8 },
  { id: "mid", label: "Mid Engineer",  rate: 9905,  hc: 3, mm: 8 },
  { id: "sr",  label: "Sr. Engineer",  rate: 11607, hc: 2, mm: 8 },
];

export const NRE_BASE = { length: 5, area: 100 };
export const DEV_LICENSE_AMT = 84000;

export const COUNTRIES = {
  US: { name: "🇺🇸 United States",  holidays: 11, avgWage: 52000, surcharge: 30, inflation: 3.0 },
  KR: { name: "🇰🇷 South Korea",    holidays: 16, avgWage: 38000, surcharge: 25, inflation: 3.0 },
  DE: { name: "🇩🇪 Germany",        holidays: 13, avgWage: 58000, surcharge: 40, inflation: 2.5 },
  JP: { name: "🇯🇵 Japan",          holidays: 16, avgWage: 34000, surcharge: 28, inflation: 1.0 },
  CN: { name: "🇨🇳 China",          holidays: 11, avgWage: 18000, surcharge: 35, inflation: 2.5 },
  MX: { name: "🇲🇽 Mexico",         holidays:  7, avgWage: 12000, surcharge: 20, inflation: 5.0 },
  CZ: { name: "🇨🇿 Czech Republic", holidays: 13, avgWage: 22000, surcharge: 35, inflation: 4.0 },
  IN: { name: "🇮🇳 India",          holidays: 14, avgWage:  8000, surcharge: 20, inflation: 5.0 },
};

export const STORAGE_KEY = "sr-ati-presets-v4";
export const CALC_CACHE_KEY = "sr-calc-cache-v1";
