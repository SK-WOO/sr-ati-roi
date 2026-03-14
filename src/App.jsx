import { useState, useMemo, useEffect, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from "recharts";
import {
  Chart as ChartJS, ArcElement, Tooltip as CTooltip, Legend as CLegend,
  CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler, RadialLinearScale
} from "chart.js";
import { Doughnut, Bar as CBar, Radar } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
ChartJS.register(ArcElement, CTooltip, CLegend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler, RadialLinearScale);

// ── Version & Changelog ────────────────────────────────
const VERSION = "v1.9.2";
const BUILD_DATE = "2026-03-14";
const CHANGELOG = [
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
const CLIENT_ID = "318386102464-2bavuh812hpk4gsegb5tkvrsnhartsm9.apps.googleusercontent.com";
const ALLOWED_DOMAIN = "seoulrobotics.org";
const SHEET_ID = "1drJd-Ete7ANEzhNliihFboZ4v8d4jngD9U_fTAjy71s";
const SHEET_NAME = "Presets";
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive";
const DRIVE_FOLDER_NAME = "SR ATI ROI Reports";
const SHARED_DRIVE_ID = "0AEhuFnmNRVDCUk9PVA";

function useGoogleAuth() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const tokenClientRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (res) => {
          try {
            const p = JSON.parse(atob(res.credential.split(".")[1]));
            if (!p.email?.endsWith(`@${ALLOWED_DOMAIN}`)) return;
            setUser({ name: p.name, email: p.email, picture: p.picture });
            tokenClientRef.current?.requestAccessToken({ prompt: "" });
          } catch {}
        },
      });
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SHEETS_SCOPE,
        callback: (tokenResponse) => {
          if (tokenResponse.access_token) setAccessToken(tokenResponse.access_token);
        },
      });
      setReady(true);
    };
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, []);

  const logout = () => {
    if (window.google) window.google.accounts.id.disableAutoSelect();
    setUser(null);
    setAccessToken(null);
  };
  return { user, ready, logout, accessToken };
}

function LoginScreen({ ready }) {
  const btnRef = useRef(null);

  useEffect(() => {
    if (!ready || !btnRef.current) return;
    window.google.accounts.id.renderButton(btnRef.current, {
      type: "standard",
      shape: "rectangular",
      theme: "outline",
      text: "signin_with",
      size: "large",
      logo_alignment: "left",
      width: 280,
    });
  }, [ready]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#1e3a5f,#1e293b)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "40px 36px",
        boxShadow: "0 20px 60px rgba(0,0,0,.3)", width: "100%", maxWidth: 360,
        textAlign: "center",
      }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🤖</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 3, marginBottom: 4 }}>
          SEOULROBOTICS
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>
          ATI ROI Calculator
        </div>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 28 }}>
          Autonomy Through Infrastructure
        </div>
        <div style={{ display: "flex", justifyContent: "center", minHeight: 44 }}>
          <div ref={btnRef} />
        </div>
        {!ready && (
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 12 }}>Loading...</div>
        )}
        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 16 }}>
          회사 Google Workspace 계정만 접근 가능합니다
        </p>
      </div>
    </div>
  );
}

// ── i18n ───────────────────────────────────────────────
const T = {
  en: {
    title: "SR ATI ROI Calculator",
    subtitle: "Autonomy Through Infrastructure",
    presets: "Presets",
    savePreset: "Save New Preset",
    loaded: "Loaded:",
    update: "💾 Update",
    targetCountry: "🌏 Target Country",
    publicHolidays: "Public Holidays",
    avgAnnualWage: "Avg. Annual Wage",
    wageInflation: "Wage Inflation",
    tabs: ["📦 Production", "🚗 Transport", "👷 Workforce", "🤖 SR Pricing", "🧮 Pricing Calc"],
    tabIds: ["prod", "trans", "work", "sr", "calc"],
    prodTitle: "Production Parameters",
    prodSub: "Inputs → CAPA & UPH back-calculation",
    regDays: "Regular Working Days / Year",
    holDays: "Holiday Work Days / Year",
    holDaysHint: "Weekend / special shifts",
    regHrs: "Regular Hours / Shift",
    otHrs: "Overtime Hours / Shift",
    nShifts: "Number of Shifts",
    capa: "Annual Production Target (CAPA)",
    yld: "Yield Rate",
    srRatio: "SR Coverage Ratio",
    srRatioHint: "% of CAPA handled by SR",
    effWorkDays: "Effective Work Days",
    backCalcUPH: "Back-calc. UPH",
    dailyMovesTotal: "Daily Moves (Total)",
    dailyMovesSR: "Daily Moves (SR)",
    srCapa: "SR CAPA",
    totalAnnHours: "Total Annual Hours",
    transTitle: "Transport Cycle Time",
    transSub: "Full manned-driver cycle — 8 steps",
    preDrive: "🔵 Pre-Drive",
    inspection: "Vehicle Inspection & Key Pickup",
    driveLeg: "🚗 Drive Leg",
    distance: "One-Way Drive Distance",
    distanceHint: "End-of-line → yard",
    speed: "In-Plant Drive Speed",
    speedHint: "20–40 km/h",
    atDest: "🅿️ At Destination",
    parking: "Parking & Documentation",
    walkToShuttle: "Walk to Shuttle Stop",
    returnLeg: "🚐 Return Leg",
    headway: "Shuttle Headway",
    headwayHint: "Avg. wait = headway ÷ 2",
    shuttleRide: "Shuttle Ride (return)",
    walkToVeh: "Walk to Next Vehicle",
    overhead: "⏱ Overhead",
    cycleOverhead: "Cycle Overhead",
    cycleOverheadHint: "Briefing, delays, breaks",
    cycleBreakdown: "📋 Cycle Breakdown",
    inspPickup: "① Inspection & key pickup",
    onewayDrive: "② One-way drive",
    parkDocs: "③ Parking & docs",
    walkShuttle: "④ Walk to shuttle",
    shuttleWait: "⑤ Shuttle wait (avg)",
    shuttleRideBack: "⑥ Shuttle ride back",
    walkNextVeh: "⑦ Walk to next vehicle",
    overheadLabel: "⑧ Overhead",
    totalCycleTime: "Total Cycle Time",
    tripsPerShift: "Trips / Driver / Shift",
    workTitle: "Workforce Cost",
    workSub: "Regular / Overtime / Holiday premiums",
    empType: "Employment Type",
    empTypes: { fulltime: "Full-time", contractor: "Contractor", hourly: "Hourly / Temp" },
    discount: "Contractor / Temp Discount",
    discountHint: "Applied to hourly rate or annual wage",
    wageMode: "Wage Input Mode",
    hourlyRate: "Hourly Rate",
    annualAvg: "Annual Avg.",
    baseHourlyRate: "Base Hourly Rate",
    baseHourlyHint: "HMGMA benchmark: $22/hr",
    hpw: "Hours / Week",
    wpy: "Working Weeks / Year",
    annAvgWage: "Annual Avg. Wage",
    annAvgWageHint: "Used as-is (no premium applied)",
    benefits: "Benefits & Social Insurance",
    benefitsHint: "Statutory contributions + fringe benefits",
    wageInflRate: "Wage Inflation Rate",
    payPremium: "⚡ Pay Premium Schedule",
    regularHrs: "Regular hours",
    weekdayOT: "Weekday overtime",
    holidayWknd: "Holiday / weekend",
    holidayOT: "Holiday overtime",
    annHoursP: "📋 Annual Hours / Person",
    regularStd: "Regular std.",
    weekdayOTLbl: "Weekday OT",
    holidayStd: "Holiday std.",
    holidayOTLbl: "Holiday OT",
    totalHoursP: "Total Hours / Person",
    effAvgHrly: "Effective Avg. Hourly Rate",
    annWageP: "Annual Wage / Person",
    totalCostP: "Total Cost / Person",
    totalAnnLabor: "Total Annual Labor",
    driversPre: "drivers (100% baseline, pre-SR)",
    benchmark: "📌 HMGMA Benchmark (Hyundai Georgia)",
    benchmarkSub: "UPH ≈ 30 · 67 drivers · $22/hr base",
    estAnnLabor: "Est. annual labor:",
    srTitle: "SR Solution Pricing",
    srSub: "CAPEX breakdown + OPEX mode selection",
    capexBreakdown: "💰 CAPEX Breakdown",
    hardware: "Hardware (HW)",
    hardwareHint: "Robots, sensors, infrastructure",
    nre: "NRE",
    nreHint: "Non-Recurring Engineering & development",
    installation: "Installation / Integration",
    other: "Other",
    margin: "Margin",
    marginHint: "Applied on total CAPEX base",
    subtotal: "Subtotal",
    totalCapex: "Total CAPEX",
    usefulLife: "Useful Life",
    usefulLifeHint: "Straight-line depreciation",
    opexMode: "⚙️ OPEX Mode",
    opexCalcMode: "OPEX Calculation Mode",
    perMove: "Per Move",
    perArea: "Per Area",
    opexPerMove: "OPEX per Vehicle Move",
    coverageArea: "Coverage Area",
    coverageAreaHint: "Total floor area covered by SR",
    opexPerM2: "OPEX per m² / month",
    srOpexGrowth: "SR OPEX Annual Growth",
    roiPeriod: "ROI Analysis Period",
    annDepr: "Annual Depreciation",
    annOpex: "Annual OPEX",
    annSRTotal: "Annual SR Total",
    yr1Savings: "Year 1 Savings",
    cumBEP: "Cumulative Break-Even",
    backCalcUPHkpi: "Back-calc. UPH",
    reqUnitsHr: "Required units/hr",
    cycleTimeKpi: "Cycle Time",
    stepTotal: "8-step total",
    srDrivers: "SR Drivers",
    breakEven: "Break-Even",
    cumBEPsub: "Cumulative BEP",
    annualCostTitle: "📊 Annual Cost — Manned (Baseline) vs SR Solution",
    annualCostSub: "Baseline labor fixed at 100% · SR Coverage {srRatio}% · CAPEX {capex}",
    cumCostTitle: "📈 Cumulative Cost & Savings",
    cumCostSub: "Depreciation ends after Y{life} · Green dashed = cumulative savings",
    tableTitle: "📋 Year-by-Year ROI Summary",
    tableHeaders: ["Year","Labor Baseline","Remaining Labor","SR OPEX","SR Depr.","SR Total","Cum. Savings","ROI"],
    netSavings: "-Yr Net Savings",
    afterSRCost: "After full SR cost",
    totalROI: "Total ROI",
    vsCapex: "vs CAPEX over",
    yrs: "yrs",
    maxAnnSavings: "Max Annual Savings",
    laborMinusSR: "Baseline labor minus SR total",
    negative: "Negative",
    days: "days", hrs: "h", shifts: "shifts", units: "units", pct: "%",
    km: "km", kmh: "km/h", min: "min", perHr: "$/hr", perYr: "$/yr", wks: "wks",
    pctYr: "%/yr", perMoveUnit: "$/move", m2: "m²", perM2Mo: "$/m²/mo", dollar: "$", yrsUnit: "yrs",
    saveFactoryPreset: "💾 Save Factory Preset",
    factoryInfo: "🏭 Factory Info",
    brandOEM: "Brand / OEM", brandPh: "e.g. Hyundai",
    countryLabel: "Country", countryPh: "e.g. USA",
    plant: "Plant", plantPh: "e.g. HMGMA Georgia",
    authorInfo: "👤 Author Info",
    name: "Name", namePh: "e.g. John Kim",
    dept: "Department", deptPh: "e.g. Manufacturing Engineering",
    notes: "Notes (optional)", notesPh: "e.g. UPH 30, 2-shift",
    presetHint: "All current parameter values will be saved.",
    cancel: "Cancel", save: "Save",
    factoryPresets: "🏭 Factory Presets",
    searchPh: "Search brand / country / plant...",
    noPresets: "No presets saved yet.",
    load: "Load", delete: "Delete",
    presetsCount: (n) => `${n} preset${n !== 1 ? "s" : ""} saved`,
    storageFail: "Storage save failed",
    presetSaved: "✅ Preset saved!",
    updated: (name) => `✅ "${name}" updated!`,
    noPresetLoaded: "No preset loaded!",
    srPerShift: (ps, shifts, ratio) => `${ps}/shift × ${shifts} — SR ${ratio}%`,
    moves: (n, pm) => `${n} moves × $${pm}`,
    areaCalc: (area, pm) => `${area}m² × $${pm}/mo × 12`,
    benefitsPct: (pct) => `+ ${pct}% benefits`,
    logout: "Logout",
    capexOverhead: "Overhead Costs",
    capexOverheadHint: "Applied to CAPEX base before margin",
    capexDiscount: "First Plant Discount",
    capexDiscountHint: "Initial project discount (e.g. 40% for first site)",
    diffFactor: "Difficulty Factor",
    diffFactorHint: "1.0 (easy) ~ 1.5 (hard) — multiplied to NRE",
    opexDetail: "⚙️ OPEX Detail (Area mode)",
    hwWarrantyRate: "HW Warranty Rate",
    hwWarrantyRateHint: "Annual % of Hardware cost",
    supportPerM2: "Site Support / m²",
    supportPerM2Hint: "Remote monitoring + on-site troubleshooting",
    swUpdatePerM2: "SW Update / m²",
    swUpdatePerM2Hint: "OTA, firmware, bug fixes",
    overhaulRate: "Overhaul Rate",
    overhaulRateHint: "% of HW cost per overhaul cycle",
    overhaulCycle: "Overhaul Cycle",
    overhaulCycleHint: "Years between major hardware overhauls",
    opexDiscountTitle: "📉 OPEX Discount Schedule",
    opexDiscount1: "Year 1 OPEX Discount",
    opexDiscount1Hint: "First year discount on OPEX (e.g. First Plant)",
    opexDiscountStep: "Annual Discount Decrease",
    opexDiscountStepHint: "Discount reduces by this % each year",
    opexBreakdown: "📋 OPEX Breakdown (Area mode)",
    hwWarrantyLbl: "HW Warranty",
    siteSupportLbl: "Site Support",
    swUpdateLbl: "SW Update",
    overhaulLbl: "Overhaul (ann.)",
    opexDirectLbl: "Direct OPEX",
    changelog: "Changelog",
    changelogTitle: "Release Notes",
    calcTab: "🧮 Pricing Calc",
    calcTitle: "Pricing Calculator",
    calcSub: "Site info → CAPEX & OPEX auto-calculation",
    sitesSection: "🏗 Use Cases / Sites",
    addSite: "+ Add Site",
    removeSite: "Remove",
    siteName: "Site Name",
    measureType: "Measurement Type",
    lengthType: "Length (m)",
    areaType: "Area (m²)",
    pathLength: "Path Length",
    areaWidth: "Width",
    areaHeight: "Height",
    difficultySection: "⚠️ Difficulty Factors",
    diffLabels: ["Outdoor/Indoor","Elevation","Road Width","Surface","Complexity","Paved/Unpaved","Vehicle Cap."],
    hwSection: "🔧 Hardware Configuration",
    annThroughput: "Annual Throughput",
    annThroughputHint: "Affects SW License vehicle weight multiplier",
    vwLabel: "Vehicle Weight Multiplier",
    nreResult: "📋 NRE Calculation",
    hwResult: "🔧 HW Total",
    capexResult: "💰 CAPEX Summary",
    opexResult: "📊 OPEX Summary",
    applyBtn: "✅ Apply to SR Pricing Tab",
    devLicense: "Dev License",
    hwWarrantyCalc: "HW Warranty",
    siteSupportCalc: "Site Support",
    swUpdateCalc: "SW Update",
    swLicenseCalc: "SW License",
    overhaulCalc: "Overhaul (ann.)",
    opexDirectCalc: "OPEX Direct",
    // HW Config
    hwBrand: "Brand", hwName: "Model", hwPriceLabel: "Unit Price ($)",
    addHwItem: "+ Add Custom HW", removeHw: "✕",
    resetHwDefault: "Reset to Default",
    hwPresetSection: "💾 HW Config Presets",
    saveHwPreset: "Save Config", hwPresetNamePh: "Config name (e.g. Nissan Line-1)",
    loadHwConfig: "Load", deleteHwConfig: "Delete",
    noHwPresets: "No HW configs saved.",
    // Analytics
    analyticsTitle: "📐 Analytics Deep Dive",
    capexPieTitle: "CAPEX Breakdown",
    costPieTitle: "Annual Cost Mix (Yr 1)",
    savingsRadarTitle: "ROI Radar",
    // Report
    reportBtn: "📄 Report",
    reportTitle: "SR ATI ROI Report",
    reportAuthorPh: "Author name",
    reportClientPh: "Client / OEM",
    reportProjectPh: "Project / Plant",
    reportNotesPh: "Additional notes (optional)",
    downloadPdf: "⬇ Download PDF",
    reportClose: "Close",
    reportSection: "📄 Export Report",
    reportModeInternal: "📋 Internal Report",
    reportModeQuotation: "📄 Quotation",
    contactPerson: "Contact Person",
    contactPersonPh: "e.g. John Smith",
    salesRep: "SR Sales Rep",
    salesRepPh: "e.g. Jane Lee",
    validityDays: "Quote Validity (days)",
    downloadQuotation: "⬇ Download Quotation",
    saveToDrive: "Drive",
    savedToDrive: "Saved to Google Drive ✓",
    saveToDriveFail: "Drive save failed — please re-login",
    saveToDriveNoAuth: "Drive access not granted — please logout and re-login",
    // Toast (sheets)
    sheetsLoadFail: "Sheets load failed — using local data",
    sheetsRefreshFail: "Sheets refresh failed",
    // Analytics labels
    cumSavingsTrajectory: "📈 Cumulative Savings Trajectory",
    annSavingsByYear: "💰 Annual Savings by Year",
    // OPEX area hint
    opexAreaHint: (area) => `${area} m² (warranty+support+SW+OH)`,
  },
  ko: {
    title: "SR ATI ROI 계산기",
    subtitle: "자율화 인프라를 통한 혁신",
    presets: "프리셋",
    savePreset: "새 프리셋 저장",
    loaded: "불러옴:",
    update: "💾 업데이트",
    targetCountry: "🌏 대상 국가",
    publicHolidays: "법정 공휴일",
    avgAnnualWage: "평균 연봉",
    wageInflation: "임금 인상률",
    tabs: ["📦 생산", "🚗 운송", "👷 인력", "🤖 SR 가격", "🧮 가격 계산"],
    tabIds: ["prod", "trans", "work", "sr", "calc"],
    prodTitle: "생산 파라미터",
    prodSub: "입력값 → CAPA & UPH 역산",
    regDays: "연간 정규 근무일",
    holDays: "연간 휴일 근무일",
    holDaysHint: "주말 / 특별 근무",
    regHrs: "교대당 정규 시간",
    otHrs: "교대당 초과 근무 시간",
    nShifts: "교대 수",
    capa: "연간 생산 목표 (CAPA)",
    yld: "양품률",
    srRatio: "SR 커버리지 비율",
    srRatioHint: "SR이 담당하는 CAPA 비율",
    effWorkDays: "실제 근무일",
    backCalcUPH: "역산 UPH",
    dailyMovesTotal: "일일 이동 (전체)",
    dailyMovesSR: "일일 이동 (SR)",
    srCapa: "SR CAPA",
    totalAnnHours: "연간 총 근무시간",
    transTitle: "운송 사이클 타임",
    transSub: "유인 운전 전체 사이클 — 8단계",
    preDrive: "🔵 운전 전",
    inspection: "차량 점검 및 키 수령",
    driveLeg: "🚗 운전 구간",
    distance: "편도 운전 거리",
    distanceHint: "라인 끝 → 야드",
    speed: "공장 내 운전 속도",
    speedHint: "20–40 km/h",
    atDest: "🅿️ 목적지에서",
    parking: "주차 및 서류 처리",
    walkToShuttle: "셔틀 정류장까지 도보",
    returnLeg: "🚐 복귀 구간",
    headway: "셔틀 배차 간격",
    headwayHint: "평균 대기 = 배차 간격 ÷ 2",
    shuttleRide: "셔틀 탑승 (복귀)",
    walkToVeh: "다음 차량까지 도보",
    overhead: "⏱ 부가 시간",
    cycleOverhead: "사이클 부가 시간",
    cycleOverheadHint: "브리핑, 지연, 휴식",
    cycleBreakdown: "📋 사이클 분석",
    inspPickup: "① 점검 및 키 수령",
    onewayDrive: "② 편도 운전",
    parkDocs: "③ 주차 및 서류",
    walkShuttle: "④ 셔틀까지 도보",
    shuttleWait: "⑤ 셔틀 대기 (평균)",
    shuttleRideBack: "⑥ 셔틀 복귀",
    walkNextVeh: "⑦ 다음 차량까지 도보",
    overheadLabel: "⑧ 부가 시간",
    totalCycleTime: "총 사이클 타임",
    tripsPerShift: "교대당 드라이버 운행 횟수",
    workTitle: "인건비",
    workSub: "정규 / 초과 / 공휴일 수당",
    empType: "고용 형태",
    empTypes: { fulltime: "정규직", contractor: "계약직", hourly: "시급 / 임시직" },
    discount: "계약직 / 임시직 할인",
    discountHint: "시급 또는 연봉에 적용",
    wageMode: "임금 입력 방식",
    hourlyRate: "시급",
    annualAvg: "연봉 평균",
    baseHourlyRate: "기본 시급",
    baseHourlyHint: "HMGMA 기준: $22/시간",
    hpw: "주당 근무 시간",
    wpy: "연간 근무 주수",
    annAvgWage: "연평균 임금",
    annAvgWageHint: "그대로 사용 (수당 미적용)",
    benefits: "복리후생 및 사회보험",
    benefitsHint: "법정 부담금 + 복리후생비",
    wageInflRate: "임금 인상률",
    payPremium: "⚡ 임금 할증 기준",
    regularHrs: "정규 시간",
    weekdayOT: "평일 초과 근무",
    holidayWknd: "공휴일 / 주말",
    holidayOT: "공휴일 초과 근무",
    annHoursP: "📋 인당 연간 근무시간",
    regularStd: "정규 표준",
    weekdayOTLbl: "평일 OT",
    holidayStd: "공휴일 표준",
    holidayOTLbl: "공휴일 OT",
    totalHoursP: "인당 총 근무시간",
    effAvgHrly: "실질 평균 시급",
    annWageP: "인당 연간 임금",
    totalCostP: "인당 총 비용",
    totalAnnLabor: "연간 총 인건비 (기준)",
    driversPre: "명 드라이버, 100% 기준",
    benchmark: "📌 HMGMA 기준 (현대 조지아 공장)",
    benchmarkSub: "UPH ≈ 30 · 드라이버 67명 · 기본 $22/시간",
    estAnnLabor: "예상 연간 인건비:",
    srTitle: "SR 솔루션 가격",
    srSub: "CAPEX 세부 항목 + OPEX 방식 선택",
    capexBreakdown: "💰 CAPEX 세부 항목",
    hardware: "하드웨어 (HW)",
    hardwareHint: "로봇, 센서, 인프라",
    nre: "NRE",
    nreHint: "비반복 엔지니어링 및 개발",
    installation: "설치 / 통합",
    other: "기타",
    margin: "마진",
    marginHint: "총 CAPEX 기준 적용",
    subtotal: "소계",
    totalCapex: "총 CAPEX",
    usefulLife: "내용 연수",
    usefulLifeHint: "정액법 감가상각",
    opexMode: "⚙️ OPEX 방식",
    opexCalcMode: "OPEX 계산 방식",
    perMove: "이동당",
    perArea: "면적당",
    opexPerMove: "차량 이동당 OPEX",
    coverageArea: "커버리지 면적",
    coverageAreaHint: "SR이 담당하는 총 바닥 면적",
    opexPerM2: "m²당 월 OPEX",
    srOpexGrowth: "SR OPEX 연간 증가율",
    roiPeriod: "ROI 분석 기간",
    annDepr: "연간 감가상각",
    annOpex: "연간 OPEX",
    annSRTotal: "연간 SR 총비용",
    yr1Savings: "1년차 절감액",
    cumBEP: "누적 손익분기점",
    backCalcUPHkpi: "역산 UPH",
    reqUnitsHr: "시간당 필요 생산량",
    cycleTimeKpi: "사이클 타임",
    stepTotal: "8단계 합계",
    srDrivers: "SR 드라이버",
    breakEven: "손익분기점",
    cumBEPsub: "누적 BEP",
    annualCostTitle: "📊 연간 비용 — 유인 기준 vs SR 솔루션",
    annualCostSub: "기준 인건비 100% 고정 · SR 커버리지 {srRatio}% · CAPEX {capex}",
    cumCostTitle: "📈 누적 비용 및 절감액",
    cumCostSub: "감가상각 Y{life} 이후 종료 · 녹색 점선 = 누적 절감액",
    tableTitle: "📋 연도별 ROI 요약",
    tableHeaders: ["연도","기준 인건비","잔여 인건비","SR OPEX","SR 감가상각","SR 합계","누적 절감액","ROI"],
    netSavings: "년 순 절감액",
    afterSRCost: "SR 전체 비용 차감 후",
    totalROI: "총 ROI",
    vsCapex: "vs CAPEX,",
    yrs: "년",
    maxAnnSavings: "최대 연간 절감액",
    laborMinusSR: "기준 인건비 − SR 총비용",
    negative: "마이너스",
    days: "일", hrs: "시간", shifts: "교대", units: "대", pct: "%",
    km: "km", kmh: "km/h", min: "분", perHr: "$/시간", perYr: "$/년", wks: "주",
    pctYr: "%/년", perMoveUnit: "$/이동", m2: "m²", perM2Mo: "$/m²/월", dollar: "$", yrsUnit: "년",
    saveFactoryPreset: "💾 공장 프리셋 저장",
    factoryInfo: "🏭 공장 정보",
    brandOEM: "브랜드 / OEM", brandPh: "예: 현대",
    countryLabel: "국가", countryPh: "예: 한국",
    plant: "공장", plantPh: "예: HMGMA 조지아",
    authorInfo: "👤 작성자 정보",
    name: "이름", namePh: "예: 김철수",
    dept: "부서", deptPh: "예: 생산기술팀",
    notes: "메모 (선택)", notesPh: "예: UPH 30, 2교대",
    presetHint: "현재 모든 파라미터 값이 저장됩니다.",
    cancel: "취소", save: "저장",
    factoryPresets: "🏭 공장 프리셋",
    searchPh: "브랜드 / 국가 / 공장 검색...",
    noPresets: "저장된 프리셋이 없습니다.",
    load: "불러오기", delete: "삭제",
    presetsCount: (n) => `프리셋 ${n}개 저장됨`,
    storageFail: "저장 실패",
    presetSaved: "✅ 프리셋 저장 완료!",
    updated: (name) => `✅ "${name}" 업데이트 완료!`,
    noPresetLoaded: "불러온 프리셋 없음!",
    srPerShift: (ps, shifts, ratio) => `교대당 ${ps}명 × ${shifts} — SR ${ratio}%`,
    moves: (n, pm) => `${n}회 × $${pm}`,
    areaCalc: (area, pm) => `${area}m² × $${pm}/월 × 12`,
    benefitsPct: (pct) => `+ ${pct}% 복리후생`,
    logout: "로그아웃",
    capexOverhead: "오버헤드 비용",
    capexOverheadHint: "마진 전 CAPEX 기준에 적용",
    capexDiscount: "초도 할인율",
    capexDiscountHint: "초도 프로젝트 할인 (예: 첫 사이트 40%)",
    diffFactor: "난이도 계수",
    diffFactorHint: "1.0 (쉬움) ~ 1.5 (어려움) — NRE에 곱해짐",
    opexDetail: "⚙️ OPEX 세부항목 (면적 방식)",
    hwWarrantyRate: "HW 보증 비율",
    hwWarrantyRateHint: "하드웨어 비용의 연간 %",
    supportPerM2: "현장지원 / m²",
    supportPerM2Hint: "원격 모니터링 + 현장 트러블슈팅",
    swUpdatePerM2: "SW 업데이트 / m²",
    swUpdatePerM2Hint: "OTA, 펌웨어, 버그수정",
    overhaulRate: "오버홀 비율",
    overhaulRateHint: "오버홀 주기당 HW 비용 %",
    overhaulCycle: "오버홀 주기",
    overhaulCycleHint: "주요 HW 오버홀 간격 (년)",
    opexDiscountTitle: "📉 OPEX 할인율 일정",
    opexDiscount1: "1년차 OPEX 할인율",
    opexDiscount1Hint: "1년차 OPEX 할인 (예: 초도 사이트)",
    opexDiscountStep: "연간 할인율 감소",
    opexDiscountStepHint: "매년 이 %만큼 할인율 감소",
    opexBreakdown: "📋 OPEX 세부항목 (면적 방식)",
    hwWarrantyLbl: "HW 보증",
    siteSupportLbl: "현장지원",
    swUpdateLbl: "SW 업데이트",
    overhaulLbl: "오버홀 (연간)",
    opexDirectLbl: "직접 OPEX",
    changelog: "변경 이력",
    changelogTitle: "릴리즈 노트",
    calcTab: "🧮 가격 계산",
    calcTitle: "가격 계산기",
    calcSub: "사이트 정보 → CAPEX & OPEX 자동 계산",
    sitesSection: "🏗 유스케이스 / 사이트",
    addSite: "+ 사이트 추가",
    removeSite: "삭제",
    siteName: "사이트명",
    measureType: "측정 방식",
    lengthType: "길이 (m)",
    areaType: "면적 (m²)",
    pathLength: "경로 길이",
    areaWidth: "너비",
    areaHeight: "높이",
    difficultySection: "⚠️ 난이도 요소",
    diffLabels: ["실외/실내","층수","도로 폭","표면 상태","복잡도","포장/비포장","차량 용량"],
    hwSection: "🔧 하드웨어 구성",
    annThroughput: "연간 처리량",
    annThroughputHint: "SW 라이센스 차량 중량 계수에 영향",
    vwLabel: "차량 중량 계수",
    nreResult: "📋 NRE 계산",
    hwResult: "🔧 HW 합계",
    capexResult: "💰 CAPEX 요약",
    opexResult: "📊 OPEX 요약",
    applyBtn: "✅ SR Pricing 탭에 적용",
    devLicense: "개발 라이센스",
    hwWarrantyCalc: "HW 보증",
    siteSupportCalc: "현장 지원",
    swUpdateCalc: "SW 업데이트",
    swLicenseCalc: "SW 라이센스",
    overhaulCalc: "오버홀 (연간)",
    opexDirectCalc: "직접 OPEX",
    // HW Config
    hwBrand: "브랜드", hwName: "모델명", hwPriceLabel: "단가 ($)",
    addHwItem: "+ 커스텀 HW 추가", removeHw: "✕",
    resetHwDefault: "기본값 초기화",
    hwPresetSection: "💾 HW 구성 프리셋",
    saveHwPreset: "구성 저장", hwPresetNamePh: "구성 이름 (예: Nissan Line-1)",
    loadHwConfig: "불러오기", deleteHwConfig: "삭제",
    noHwPresets: "저장된 HW 구성 없음.",
    // Analytics
    analyticsTitle: "📐 심화 분석",
    capexPieTitle: "CAPEX 구성 비율",
    costPieTitle: "연간 비용 구성 (1년차)",
    savingsRadarTitle: "ROI 레이더",
    // Report
    reportBtn: "📄 리포트",
    reportTitle: "SR ATI ROI 리포트",
    reportAuthorPh: "작성자 이름",
    reportClientPh: "고객 / OEM",
    reportProjectPh: "프로젝트 / 공장",
    reportNotesPh: "추가 메모 (선택)",
    downloadPdf: "⬇ PDF 다운로드",
    reportClose: "닫기",
    reportSection: "📄 리포트 내보내기",
    reportModeInternal: "📋 내부 보고용",
    reportModeQuotation: "📄 고객 견적서",
    contactPerson: "고객 담당자",
    contactPersonPh: "예: 김철수",
    salesRep: "SR 영업 담당",
    salesRepPh: "예: 이영희",
    validityDays: "견적 유효기간 (일)",
    downloadQuotation: "⬇ 견적서 PDF 다운로드",
    saveToDrive: "Drive",
    savedToDrive: "Google Drive에 저장됨 ✓",
    saveToDriveFail: "Drive 저장 실패 — 재로그인 필요",
    saveToDriveNoAuth: "Drive 권한 없음 — 로그아웃 후 재로그인 해주세요",
    // Toast (sheets)
    sheetsLoadFail: "Sheets 로드 실패 — 로컬 데이터 사용",
    sheetsRefreshFail: "Sheets 새로고침 실패",
    // Analytics labels
    cumSavingsTrajectory: "📈 누적 절감액 트렌드",
    annSavingsByYear: "💰 연도별 절감액",
    // OPEX area hint
    opexAreaHint: (area) => `${area} m² (보증+지원+SW+OH)`,
  }
};

const STORAGE_KEY = "sr-ati-presets-v4";
function loadPresets() { try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; } catch { return []; } }
function saveToStorage(list) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); return true; } catch { return false; } }

// ── Google Sheets helpers ───────────────────────────────
const SHEETS_BASE = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`;
const sheetsHeaders = ["id","brand","country","plant","author","dept","note","savedAt","params"];

async function sheetsLoad(token) {
  const res = await fetch(`${SHEETS_BASE}/values/${SHEET_NAME}!A:I`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Sheets read failed");
  const data = await res.json();
  const rows = data.values || [];
  // 첫 행이 헤더가 아니면 초기화
  if (rows.length === 0 || rows[0][0] !== "id") {
    await sheetsInitHeader(token);
    return [];
  }
  return rows.slice(1).map((row, i) => {
    try {
      return { _rowIndex: i + 2, id: row[0], brand: row[1], country: row[2],
        plant: row[3], author: row[4] || "", dept: row[5] || "",
        note: row[6] || "", savedAt: row[7], params: JSON.parse(row[8] || "{}") };
    } catch { return null; }
  }).filter(Boolean);
}

async function sheetsInitHeader(token) {
  await fetch(`${SHEETS_BASE}/values/${SHEET_NAME}!A1:I1?valueInputOption=RAW`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values: [sheetsHeaders] }),
  });
}

function presetToRow(preset) {
  return [
    preset.id || String(Date.now()),
    preset.brand, preset.country, preset.plant,
    preset.author || "", preset.dept || "", preset.note || "",
    preset.savedAt, JSON.stringify(preset.params),
  ];
}

async function sheetsAppend(token, preset) {
  const res = await fetch(
    `${SHEETS_BASE}/values/${SHEET_NAME}!A:I:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [presetToRow(preset)] }),
    }
  );
  if (!res.ok) throw new Error("Sheets append failed");
}

async function sheetsUpdateRow(token, rowIndex, preset) {
  const res = await fetch(
    `${SHEETS_BASE}/values/${SHEET_NAME}!A${rowIndex}:I${rowIndex}?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [presetToRow(preset)] }),
    }
  );
  if (!res.ok) throw new Error("Sheets update failed");
}

async function sheetsDeleteRow(token, rowIndex) {
  const res = await fetch(`${SHEETS_BASE}:batchUpdate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [{ deleteDimension: {
        range: { sheetId: 0, dimension: "ROWS",
          startIndex: rowIndex - 1, endIndex: rowIndex },
      }}],
    }),
  });
  if (!res.ok) throw new Error("Sheets delete failed");
}

// ── Google Drive helpers ────────────────────────────────
async function getDriveFolderId(token) {
  const q = encodeURIComponent(`name='${DRIVE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false and '${SHARED_DRIVE_ID}' in parents`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)&supportsAllDrives=true&includeItemsFromAllDrives=true&driveId=${SHARED_DRIVE_ID}&corpora=drive`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error("Drive folder search failed");
  const data = await res.json();
  if (data.files?.length > 0) return data.files[0].id;
  const createRes = await fetch("https://www.googleapis.com/drive/v3/files?supportsAllDrives=true", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: DRIVE_FOLDER_NAME, mimeType: "application/vnd.google-apps.folder", parents: [SHARED_DRIVE_ID] }),
  });
  if (!createRes.ok) throw new Error("Drive folder creation failed");
  return (await createRes.json()).id;
}

async function uploadToDrive(token, blob, fileName) {
  const folderId = await getDriveFolderId(token);
  const metadata = { name: fileName, mimeType: "application/pdf", parents: [folderId] };
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", blob);
  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink&supportsAllDrives=true",
    { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form }
  );
  if (!res.ok) throw new Error("Drive upload failed");
  return await res.json();
}

const clamp = (v, min, max, fallback) => { const n = Number(v); return (isNaN(n) || !isFinite(n)) ? fallback : Math.min(Math.max(n, min), max); };

const DEFAULT_HW_CONFIG = [
  { id: "xt32",   brand: "Hesai", label: "Lidar XT32",   price: 4500  },
  { id: "ot128",  brand: "Hesai", label: "Lidar OT128",  price: 12600 },
  { id: "qt128",  brand: "Hesai", label: "Lidar QT128",  price: 5000  },
  { id: "zt128",  brand: "Hesai", label: "Lidar ZT128",  price: 1620  },
  { id: "server", brand: "SR",    label: "Server",       price: 27000 },
  { id: "etc",    brand: "SR",    label: "Accessories",  price: 1000  },
];
const HW_PRESET_KEY = "sr-hw-presets-v1";
function loadHwPresets() { try { const r = localStorage.getItem(HW_PRESET_KEY); return r ? JSON.parse(r) : []; } catch { return []; } }
function saveHwPresets(list) { try { localStorage.setItem(HW_PRESET_KEY, JSON.stringify(list)); } catch {} }
const CALC_CACHE_KEY = "sr-calc-cache-v1";
function loadCalcCache() { try { const r = localStorage.getItem(CALC_CACHE_KEY); return r ? JSON.parse(r) : null; } catch { return null; } }
function saveCalcCache(data) { try { localStorage.setItem(CALC_CACHE_KEY, JSON.stringify(data)); } catch {} }
const NRE_UNIT = { length: 575, area: 11500 };
const NRE_BASE = { length: 5,   area: 100   };
const DEV_LICENSE_AMT = 84000;

const COUNTRIES = {
  US: { name: "🇺🇸 United States",  holidays: 11, avgWage: 52000, surcharge: 30, inflation: 3.0 },
  KR: { name: "🇰🇷 South Korea",    holidays: 16, avgWage: 38000, surcharge: 25, inflation: 3.0 },
  DE: { name: "🇩🇪 Germany",        holidays: 13, avgWage: 58000, surcharge: 40, inflation: 2.5 },
  JP: { name: "🇯🇵 Japan",          holidays: 16, avgWage: 34000, surcharge: 28, inflation: 1.0 },
  CN: { name: "🇨🇳 China",          holidays: 11, avgWage: 18000, surcharge: 35, inflation: 2.5 },
  MX: { name: "🇲🇽 Mexico",         holidays:  7, avgWage: 12000, surcharge: 20, inflation: 5.0 },
  CZ: { name: "🇨🇿 Czech Republic", holidays: 13, avgWage: 22000, surcharge: 35, inflation: 4.0 },
  IN: { name: "🇮🇳 India",          holidays: 14, avgWage:  8000, surcharge: 20, inflation: 5.0 },
};

const c  = (n, d = 0) => isNaN(n) || n == null ? "—" : Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const $c = (n, d = 0) => `$${c(n, d)}`;
const $M = (n) => `$${c(n / 1e6, 2)}M`;

function Inp({ v, set, min = 0, max = 1e9, step = 1, unit, w = "w-24", comma = false }) {
  const dec = step < 1 ? 1 : 0;
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState("");
  const formatted = comma
    ? Number(v).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec })
    : Number(v).toFixed(dec);
  return (
    <div className="flex items-center gap-1 min-w-0">
      <input type="text" inputMode="decimal"
        value={focused ? draft : formatted}
        onFocus={() => { setFocused(true); setDraft(String(v)); }}
        onChange={e => { const s = e.target.value.replace(/,/g, ""); setDraft(s); const n = parseFloat(s); if (!isNaN(n)) set(n); }}
        onBlur={() => { setFocused(false); const n = parseFloat(draft.replace(/,/g, "")); if (!isNaN(n)) set(Math.min(Math.max(n, min), max)); else set(v); }}
        className={`${w} min-w-0 border border-gray-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:border-blue-500`}
      />
      {unit && <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">{unit}</span>}
    </div>
  );
}

function SecHead({ n, title, sub }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">{n}</div>
      <div><div className="font-bold text-gray-800">{title}</div>{sub && <div className="text-xs text-gray-500">{sub}</div>}</div>
    </div>
  );
}

function Row({ label, hint, children }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 gap-2 min-w-0">
      <div className="flex-1 min-w-0"><div className="text-sm font-medium text-gray-700 leading-tight">{label}</div>{hint && <div className="text-xs text-gray-400 leading-tight">{hint}</div>}</div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function KPI({ label, value, sub, hi }) {
  return (
    <div className={`rounded-xl p-3 ${hi ? "bg-blue-600 text-white" : "bg-gray-50"}`}>
      <div className={`text-xs mb-1 truncate ${hi ? "text-blue-200" : "text-gray-500"}`}>{label}</div>
      <div className="text-lg font-bold leading-tight break-all">{value}</div>
      {sub && <div className={`text-[11px] mt-1 leading-tight ${hi ? "text-blue-200" : "text-gray-400"}`}>{sub}</div>}
    </div>
  );
}

function CR({ label, value, col = "text-gray-600" }) {
  return (
    <div className="flex justify-between py-1 border-b border-gray-100 text-xs gap-2 min-w-0">
      <span className="text-gray-500 truncate">{label}</span>
      <span className={`font-semibold whitespace-nowrap flex-shrink-0 ${col}`}>{value}</span>
    </div>
  );
}

function PresetModal({ params, onSave, onClose, t }) {
  const [brand, setBrand] = useState("");
  const [country, setCountry] = useState("");
  const [plant, setPlant] = useState("");
  const [note, setNote] = useState("");
  const [author, setAuthor] = useState("");
  const [dept, setDept] = useState("");
  const valid = brand.trim() && country.trim() && plant.trim();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-[min(320px,90vw)] space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="font-bold text-gray-800 text-base">{t.saveFactoryPreset}</div>
        <div className="space-y-2">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wide pt-1">{t.factoryInfo}</div>
          {[[t.brandOEM, brand, setBrand, t.brandPh],[t.countryLabel, country, setCountry, t.countryPh],[t.plant, plant, setPlant, t.plantPh]].map(([lbl, val, setter, ph]) => (
            <div key={lbl}>
              <div className="text-xs text-gray-500 mb-0.5">{lbl}</div>
              <input value={val} onChange={e => setter(e.target.value)} placeholder={ph}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500" />
            </div>
          ))}
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wide pt-2">{t.authorInfo}</div>
          {[[t.name, author, setAuthor, t.namePh],[t.dept, dept, setDept, t.deptPh]].map(([lbl, val, setter, ph]) => (
            <div key={lbl}>
              <div className="text-xs text-gray-500 mb-0.5">{lbl}</div>
              <input value={val} onChange={e => setter(e.target.value)} placeholder={ph}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500" />
            </div>
          ))}
          <div>
            <div className="text-xs text-gray-500 mb-0.5">{t.notes}</div>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder={t.notesPh}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 resize-none" />
          </div>
        </div>
        <div className="text-xs text-gray-400">{t.presetHint}</div>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">{t.cancel}</button>
          <button disabled={!valid}
            onClick={() => onSave({ brand: brand.trim(), country: country.trim(), plant: plant.trim(), note: note.trim(), author: author.trim(), dept: dept.trim(), params, savedAt: new Date().toISOString() })}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold text-white transition-colors ${valid ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"}`}>
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
}

function PresetPanel({ presets, onLoad, onDelete, onClose, t, sheetsLoading, onRefresh }) {
  const [search, setSearch] = useState("");
  const filtered = presets.filter(p => [p.brand, p.country, p.plant].join(" ").toLowerCase().includes(search.toLowerCase()));
  const grouped = filtered.reduce((acc, p) => {
    const origIdx = presets.findIndex(op => op.savedAt === p.savedAt && op.plant === p.plant);
    (acc[p.brand] = acc[p.brand] || []).push({ ...p, _idx: origIdx });
    return acc;
  }, {});
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[min(384px,92vw)] max-h-[85vh] flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="font-bold text-gray-800">{t.factoryPresets}</div>
            <span className="text-xs text-green-600 font-semibold">☁ Google Sheets</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onRefresh} disabled={sheetsLoading} className="text-xs text-blue-500 hover:text-blue-700 disabled:opacity-40">{sheetsLoading ? "⏳" : "🔄"}</button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
          </div>
        </div>
        <div className="px-4 pt-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPh}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div className="overflow-auto flex-1 p-4 space-y-4">
          {Object.keys(grouped).length === 0 && <div className="text-center text-gray-400 text-sm py-8">{t.noPresets}</div>}
          {Object.entries(grouped).map(([brand, items]) => (
            <div key={brand}>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{brand}</div>
              <div className="space-y-2">
                {items.map(p => (
                  <div key={p._idx} className="border border-gray-200 rounded-xl p-3 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 text-sm">{p.plant}</div>
                        <div className="text-xs text-gray-500">{p.country} · {new Date(p.savedAt).toLocaleDateString()}</div>
                        {(p.author || p.dept) && <div className="text-xs text-gray-400 mt-0.5">👤 {[p.author, p.dept].filter(Boolean).join(" · ")}</div>}
                        {p.note && <div className="text-xs text-gray-400 mt-0.5 italic">{p.note}</div>}
                        <div className="text-xs text-blue-600 mt-1">CAPA {c(p.params.capa)} · SR {p.params.srRatio}%</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button onClick={() => onLoad(p)} className="text-xs bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 whitespace-nowrap">{t.load}</button>
                        <button onClick={() => onDelete(p)} className="text-xs border border-red-200 text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 whitespace-nowrap">{t.delete}</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-gray-100 text-xs text-gray-400 text-center">{t.presetsCount(presets.length)}</div>
      </div>
    </div>
  );
}

function ChangelogModal({ onClose, lang }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[min(480px,92vw)] max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="font-bold text-gray-800">{lang === "ko" ? "릴리즈 노트" : "Release Notes"}</div>
            <div className="text-xs text-gray-400 mt-0.5">SR ATI ROI Calculator · {VERSION} · {BUILD_DATE}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="overflow-auto flex-1 p-4 space-y-4">
          {CHANGELOG.map(entry => (
            <div key={entry.version}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${entry.version === VERSION ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>{entry.version}</span>
                <span className="text-xs text-gray-400">{entry.date}</span>
                {entry.version === VERSION && <span className="text-xs text-blue-500 font-semibold">← {lang === "ko" ? "현재" : "current"}</span>}
              </div>
              <ul className="space-y-0.5 pl-1">
                {(lang === "ko" ? entry.ko : entry.en).map((line, i) => (
                  <li key={i} className="text-xs text-gray-600 flex gap-1.5"><span className="text-gray-300 mt-0.5">•</span><span>{line}</span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportModal({ onClose, t, lang, R, PC, capex, capexHW, capexNRE, capexInst, capexOther,
  capexBase, capexAfterOverhead, capexAfterMargin, capexOverhead, capexMargin, capexDiscount,
  opexMode, opexArea, life, projYrs, loadedName, googleUser, hwConfig, hwCounts, sites, accessToken }) {
  const [mode, setMode] = useState("internal");
  const [author, setAuthor] = useState(googleUser?.name || "");
  const [dept, setDept] = useState("");
  const [client, setClient] = useState("");
  const [project, setProject] = useState(loadedName || "");
  const [notes, setNotes] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [salesRep, setSalesRep] = useState(googleUser?.name || "");
  const [validDays, setValidDays] = useState(30);

  const buildInternalPdf = () => {
    const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
    const timeStr = now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
    const W = 210, M = 14;

    // Header bar
    doc.setFillColor(37,99,235);
    doc.rect(0,0,W,22,"F");
    doc.setTextColor(255,255,255);
    doc.setFont("helvetica","bold");
    doc.setFontSize(14);
    doc.text("SR ATI ROI Calculator", M, 10);
    doc.setFontSize(8);
    doc.setFont("helvetica","normal");
    doc.text(`${VERSION}  ·  ${dateStr}  ${timeStr}`, M, 16);
    doc.text("SEOULROBOTICS", W - M, 10, {align:"right"});
    doc.text("Autonomy Through Infrastructure", W - M, 16, {align:"right"});

    let y = 30;
    doc.setTextColor(30,30,30);

    // Project info
    doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.setTextColor(37,99,235);
    doc.text("Project Information", M, y); y += 6;
    doc.setDrawColor(37,99,235); doc.setLineWidth(0.3); doc.line(M, y, W-M, y); y += 4;
    autoTable(doc, { startY: y, margin:{left:M,right:M}, theme:"plain",
      styles:{fontSize:9,cellPadding:1.5},
      columnStyles:{0:{fontStyle:"bold",textColor:[100,100,100],cellWidth:45},1:{textColor:[30,30,30]}},
      body:[
        ["Author", author || "—"],
        ...(dept ? [["Department", dept]] : []),
        ["Client / OEM", client || "—"],
        ["Project / Plant", project || "—"],
        ...(notes ? [["Notes", notes]] : []),
      ],
    });
    y = doc.lastAutoTable.finalY + 8;

    // Production & Transport KPIs
    doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.setTextColor(37,99,235);
    doc.text("Production & Workforce", M, y); y += 6;
    doc.setDrawColor(37,99,235); doc.line(M, y, W-M, y); y += 4;
    autoTable(doc, { startY: y, margin:{left:M,right:M}, theme:"striped",
      headStyles:{fillColor:[37,99,235],fontSize:8,textColor:255},
      styles:{fontSize:9,cellPadding:2},
      head:[["Metric","Value","Metric","Value"]],
      body:[
        ["Cycle Time", `${R.cycleT.toFixed(1)} min`, "Back-calc UPH", `${R.uph.toFixed(1)} /hr`],
        ["SR Drivers (total)", String(R.drvTot), "Manned Drivers", String(R.mannedDrvTot)],
        ["Ann. Labor Baseline", `$${c(R.annLaborBaseline)}`, "Ann. Remaining Labor", `$${c(R.annLaborRemaining)}`],
        ["Cost / Person", `$${c(R.compPP)}`, "Effective Hourly", `$${R.effHrly.toFixed(2)}/hr`],
      ],
    });
    y = doc.lastAutoTable.finalY + 8;

    // CAPEX
    doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.setTextColor(37,99,235);
    doc.text("CAPEX Breakdown", M, y); y += 6;
    doc.setDrawColor(37,99,235); doc.line(M, y, W-M, y); y += 4;
    autoTable(doc, { startY: y, margin:{left:M,right:M}, theme:"striped",
      headStyles:{fillColor:[37,99,235],fontSize:8,textColor:255},
      styles:{fontSize:9,cellPadding:2},
      head:[["Item","Amount"]],
      body:[
        ["Hardware (HW)", `$${c(capexHW)}`],
        ["NRE", `$${c(capexNRE)}`],
        ["Installation / Integration", `$${c(capexInst)}`],
        ["Other", `$${c(capexOther)}`],
        ["Subtotal", `$${c(capexBase)}`],
        [`Overhead (+${capexOverhead}%)`, `$${c(capexBase * capexOverhead/100)}`],
        [`Margin (+${capexMargin}%)`, `$${c(capexAfterOverhead * capexMargin/100)}`],
        [`First Plant Discount (-${capexDiscount}%)`, `-$${c(capexAfterMargin * capexDiscount/100)}`],
        ["TOTAL CAPEX", `$${c(capex)}`],
      ],
      columnStyles:{0:{cellWidth:110},1:{halign:"right",fontStyle:"bold"}},
      didParseCell: (data) => { if (data.row.index === 8) { data.cell.styles.fillColor=[219,234,254]; data.cell.styles.fontStyle="bold"; data.cell.styles.fontSize=10; } },
    });
    y = doc.lastAutoTable.finalY + 8;

    // OPEX & ROI summary
    doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.setTextColor(37,99,235);
    doc.text("OPEX & ROI Summary", M, y); y += 6;
    doc.setDrawColor(37,99,235); doc.line(M, y, W-M, y); y += 4;
    autoTable(doc, { startY: y, margin:{left:M,right:M}, theme:"striped",
      headStyles:{fillColor:[37,99,235],fontSize:8,textColor:255},
      styles:{fontSize:9,cellPadding:2},
      head:[["Metric","Value","Metric","Value"]],
      body:[
        ["Ann. Depreciation", `$${c(R.annDepr)}`, "Ann. OPEX", `$${c(R.annOpex)}`],
        ["Ann. SR Total", `$${c(R.annSRTot)}`, "Yr 1 Savings", `$${c(R.yr1Savings)}`],
        ["Break-Even", R.bep, `${projYrs}-yr Net Savings`, `$${c(R.finSav)}`],
        ["Total ROI", R.finSav > 0 ? `${c(R.roiPct,0)}%` : "—", "Useful Life", `${life} yrs`],
      ],
    });
    y = doc.lastAutoTable.finalY + 8;

    // Year-by-year table
    if (y > 220) { doc.addPage(); y = 14; }
    doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.setTextColor(37,99,235);
    doc.text("Year-by-Year ROI", M, y); y += 6;
    doc.setDrawColor(37,99,235); doc.line(M, y, W-M, y); y += 4;
    autoTable(doc, { startY: y, margin:{left:M,right:M}, theme:"striped",
      headStyles:{fillColor:[37,99,235],fontSize:8,textColor:255},
      styles:{fontSize:8,cellPadding:1.5},
      head:[["Year","Labor Base","Rem. Labor","SR OPEX","SR Depr.","SR Total","Cum. Savings","ROI"]],
      body: R.chart.map(r => [
        r.year, `$${c(r["Labor Baseline"])}`, `$${c(r["Remaining Labor"])}`,
        `$${c(r["SR OPEX"])}`, `$${c(r["SR Depreciation"])}`, `$${c(r["SR Total"])}`,
        r.savings >= 0 ? `+$${c(r.savings)}` : `-$${c(Math.abs(r.savings))}`,
        r.savings > 0 ? `${((r.savings/capex)*100).toFixed(0)}%` : "—",
      ]),
      didParseCell: (data) => { if (data.section==="body" && parseFloat(R.chart[data.row.index]?.savings)>0) data.cell.styles.fillColor=[236,253,245]; },
      columnStyles:{0:{cellWidth:12},7:{halign:"right"}},
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i=1; i<=pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7); doc.setTextColor(150,150,150);
      doc.text(`SR ATI ROI Calculator ${VERSION}  ·  Confidential`, M, 292);
      doc.text(`Page ${i} / ${pageCount}`, W-M, 292, {align:"right"});
    }
    const fileName = `SR-ROI-Report_${(client||project||"export").replace(/[^a-zA-Z0-9]/g,"_")}_${now.toISOString().slice(0,10)}.pdf`;
    return { doc, fileName };
  };
  const generatePdf = () => { const { doc, fileName } = buildInternalPdf(); doc.save(fileName); };

  const buildQuotationPdf = () => {
    const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
    const validDate = new Date(now.getTime() + validDays * 86400000)
      .toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
    const quoteNo = `QT-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}-${String(now.getHours()).padStart(2,"0")}${String(now.getMinutes()).padStart(2,"0")}`;
    const W = 210, M = 14;

    // ── Cover header ──
    doc.setFillColor(15,23,42);
    doc.rect(0,0,W,28,"F");
    doc.setFillColor(37,99,235);
    doc.rect(0,22,W,6,"F");
    doc.setTextColor(255,255,255);
    doc.setFont("helvetica","bold"); doc.setFontSize(18);
    doc.text("COMMERCIAL QUOTATION", M, 13);
    doc.setFont("helvetica","normal"); doc.setFontSize(8);
    doc.text("SEOULROBOTICS  ·  Autonomy Through Infrastructure", M, 20);
    doc.setFont("helvetica","bold"); doc.setFontSize(9);
    doc.text("ATI — Autonomous Transport Infrastructure", W-M, 13, {align:"right"});
    doc.setFont("helvetica","normal"); doc.setFontSize(7.5);
    doc.text("sr-ati-roi.vercel.app", W-M, 20, {align:"right"});

    let y = 34;
    doc.setTextColor(30,30,30);

    // ── Quote meta + customer block side-by-side ──
    const col2X = M + 90;
    // Left: Quote details
    doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(37,99,235);
    doc.text("Quote Details", M, y);
    doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(30,30,30);
    const metaRows = [
      ["Quote No.", quoteNo],
      ["Date", dateStr],
      ["Valid Until", validDate],
      ["Prepared by", salesRep||"—"],
      ...(dept ? [["Department", dept]] : []),
    ];
    metaRows.forEach(([k,v], i) => {
      doc.setFont("helvetica","bold"); doc.setTextColor(80,80,80);
      doc.text(k, M, y+5+i*5.5);
      doc.setFont("helvetica","normal"); doc.setTextColor(30,30,30);
      doc.text(v, M+30, y+5+i*5.5);
    });
    // Right: Customer block
    doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(37,99,235);
    doc.text("Customer", col2X, y);
    doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(30,30,30);
    const custRows = [
      ["Company / OEM", client||"—"],
      ["Plant / Project", project||"—"],
      ["Contact Person", contactPerson||"—"],
    ];
    custRows.forEach(([k,v], i) => {
      doc.setFont("helvetica","bold"); doc.setTextColor(80,80,80);
      doc.text(k, col2X, y+5+i*5.5);
      doc.setFont("helvetica","normal"); doc.setTextColor(30,30,30);
      doc.text(v, col2X+32, y+5+i*5.5);
    });
    y += 34;

    // Divider
    doc.setDrawColor(200,200,200); doc.setLineWidth(0.3); doc.line(M, y, W-M, y); y += 6;

    // ── Section 1: Solution Overview ──
    doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(37,99,235);
    doc.text("1.  Solution Overview", M, y); y += 5;
    doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(60,60,60);
    doc.text("Seoul Robotics ATI replaces manual vehicle transport drivers with an autonomous infrastructure", M, y); y += 4.5;
    doc.text("platform powered by 3D LiDAR sensors — no vehicle modifications required.", M, y); y += 7;

    // Sites table
    autoTable(doc, { startY: y, margin:{left:M,right:M}, theme:"striped",
      headStyles:{fillColor:[37,99,235],fontSize:8,textColor:255},
      styles:{fontSize:8.5,cellPadding:2},
      head:[["Site Name","Type","Size","NRE Amount"]],
      body: PC.siteRows.map(r => [
        r.name,
        r.type === "area" ? `Area` : `Length`,
        r.type === "area" ? `${c(Math.round(r.totalSize))} m²` : `${c(Math.round(r.totalSize))} m`,
        `$${c(Math.round(r.nreAmt))}`,
      ]),
      columnStyles:{3:{halign:"right",fontStyle:"bold"}},
    });
    y = doc.lastAutoTable.finalY + 8;

    // ── Section 2: Hardware Bill of Materials ──
    if (y > 210) { doc.addPage(); y = 14; }
    doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(37,99,235);
    doc.text("2.  Hardware Bill of Materials", M, y); y += 5;
    const hwRows = hwConfig
      .filter(hw => (hwCounts[hw.id]||0) > 0)
      .map((hw, i) => [
        i+1,
        hw.brand,
        hw.label,
        hwCounts[hw.id]||0,
        `$${c(hw.price)}`,
        `$${c((hwCounts[hw.id]||0)*hw.price)}`,
      ]);
    hwRows.push(["","","","","Total HW", `$${c(PC.hwTotal)}`]);
    autoTable(doc, { startY: y, margin:{left:M,right:M}, theme:"striped",
      headStyles:{fillColor:[37,99,235],fontSize:8,textColor:255},
      styles:{fontSize:8.5,cellPadding:2},
      head:[["#","Brand","Model / Description","Qty","Unit Price","Amount"]],
      body: hwRows,
      columnStyles:{0:{cellWidth:8},3:{halign:"center"},4:{halign:"right"},5:{halign:"right",fontStyle:"bold"}},
      didParseCell: (d) => { if (d.row.index===hwRows.length-1) { d.cell.styles.fillColor=[219,234,254]; d.cell.styles.fontStyle="bold"; } },
    });
    y = doc.lastAutoTable.finalY + 8;

    // ── Section 3: Pricing Summary ──
    if (y > 190) { doc.addPage(); y = 14; }
    doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(37,99,235);
    doc.text("3.  Pricing Summary", M, y); y += 5;

    // CAPEX table
    doc.setFont("helvetica","bold"); doc.setFontSize(8.5); doc.setTextColor(60,60,60);
    doc.text("CAPEX", M, y); y += 3;
    autoTable(doc, { startY: y, margin:{left:M,right:M}, theme:"plain",
      styles:{fontSize:8.5,cellPadding:1.8},
      columnStyles:{0:{cellWidth:110,textColor:[60,60,60]},1:{halign:"right",fontStyle:"bold",textColor:[30,30,30]}},
      body:[
        ["Hardware (HW)", `$${c(PC.hwTotal)}`],
        ["NRE — Site Engineering", `$${c(Math.round(PC.totalNRE))}`],
        ["Development License", `$${c(DEV_LICENSE_AMT)}`],
        ["Subtotal", `$${c(Math.round(PC.capexSub))}`],
        [`Overhead (+${capexOverhead}%)`, `$${c(Math.round(PC.capexSub*capexOverhead/100))}`],
        [`Margin (+${capexMargin}%)`, `$${c(Math.round(PC.capexWithOH*capexMargin/100))}`],
        [`First Plant Discount (−${capexDiscount}%)`, `−$${c(Math.round(PC.capexWithMgn*capexDiscount/100))}`],
      ],
      didParseCell: (d) => { if (d.row.index===6) d.cell.styles.textColor=[22,163,74]; },
    });
    // CAPEX total highlight row
    autoTable(doc, { startY: doc.lastAutoTable.finalY, margin:{left:M,right:M}, theme:"plain",
      styles:{fontSize:10,cellPadding:2.5,fontStyle:"bold"},
      columnStyles:{0:{cellWidth:110,fillColor:[219,234,254],textColor:[37,99,235]},1:{halign:"right",fillColor:[219,234,254],textColor:[37,99,235]}},
      body:[["TOTAL CAPEX", `$${c(Math.round(PC.capexFinal))}`]],
    });
    y = doc.lastAutoTable.finalY + 5;

    // OPEX table
    doc.setFont("helvetica","bold"); doc.setFontSize(8.5); doc.setTextColor(60,60,60);
    doc.text("Annual OPEX", M, y); y += 3;
    autoTable(doc, { startY: y, margin:{left:M,right:M}, theme:"plain",
      styles:{fontSize:8.5,cellPadding:1.8},
      columnStyles:{0:{cellWidth:110,textColor:[60,60,60]},1:{halign:"right",fontStyle:"bold",textColor:[30,30,30]}},
      body:[
        ["HW Warranty", `$${c(Math.round(PC.hwWarranty))}`],
        ["Site Support", `$${c(Math.round(PC.siteSup))}`],
        ["SW Update & Maintenance", `$${c(Math.round(PC.swUpd))}`],
        ["SW License", `$${c(Math.round(PC.swLicense))}`],
        ["Overhaul (annualized)", `$${c(Math.round(PC.overhaulA))}`],
      ],
    });
    autoTable(doc, { startY: doc.lastAutoTable.finalY, margin:{left:M,right:M}, theme:"plain",
      styles:{fontSize:10,cellPadding:2.5,fontStyle:"bold"},
      columnStyles:{0:{cellWidth:110,fillColor:[237,233,254],textColor:[109,40,217]},1:{halign:"right",fillColor:[237,233,254],textColor:[109,40,217]}},
      body:[["TOTAL ANNUAL OPEX", `$${c(Math.round(PC.opexFinal))}`]],
    });
    y = doc.lastAutoTable.finalY + 8;

    // ── Section 4: ROI Highlights ──
    if (y > 230) { doc.addPage(); y = 14; }
    doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(37,99,235);
    doc.text("4.  ROI Highlights", M, y); y += 5;
    autoTable(doc, { startY: y, margin:{left:M,right:M}, theme:"striped",
      headStyles:{fillColor:[16,185,129],fontSize:8,textColor:255},
      styles:{fontSize:9,cellPadding:2.5,halign:"center"},
      head:[["Break-Even","Yr 1 Savings",`${projYrs}-yr Net Savings`,"Total ROI"]],
      body:[[
        R.bep,
        R.yr1Savings > 0 ? `$${c(R.yr1Savings)}` : "—",
        R.finSav > 0 ? `+$${c(R.finSav)}` : "—",
        R.finSav > 0 ? `${c(R.roiPct,0)}%` : "—",
      ]],
      columnStyles:{0:{fontStyle:"bold"},1:{fontStyle:"bold"},2:{fontStyle:"bold"},3:{fontStyle:"bold"}},
    });
    y = doc.lastAutoTable.finalY + 8;

    // ── Section 5: Terms & Conditions ──
    if (y > 240) { doc.addPage(); y = 14; }
    doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(37,99,235);
    doc.text("5.  Terms & Conditions", M, y); y += 5;
    const terms = [
      `• This quotation is valid for ${validDays} days from the date of issue (until ${validDate}).`,
      "• All prices are quoted in USD and exclude local taxes, duties, and shipping unless stated.",
      "• Final pricing is subject to a detailed site survey and signed Statement of Work (SoW).",
      "• Payment terms: 30% upon contract signing, 40% upon hardware delivery, 30% upon commissioning.",
      "• Seoul Robotics reserves the right to revise pricing upon scope changes or additional site findings.",
    ];
    doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(60,60,60);
    terms.forEach((line, i) => { doc.text(line, M, y + i*5.5); });
    y += terms.length*5.5 + 8;

    if (notes) {
      doc.setFont("helvetica","bold"); doc.setFontSize(8.5); doc.setTextColor(37,99,235);
      doc.text("Additional Notes", M, y); y += 4;
      doc.setFont("helvetica","normal"); doc.setTextColor(60,60,60);
      doc.text(notes, M, y, {maxWidth: W-M*2}); y += 8;
    }

    // ── Footer on all pages ──
    const pageCount = doc.internal.getNumberOfPages();
    for (let i=1; i<=pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(15,23,42); doc.rect(0,285,W,12,"F");
      doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(180,180,180);
      doc.text(`SEOULROBOTICS  ·  Commercial Quotation  ·  ${quoteNo}  ·  Confidential`, M, 291);
      doc.text(`Page ${i} / ${pageCount}`, W-M, 291, {align:"right"});
    }
    const fileName = `SR-Quotation_${(client||"Client").replace(/[^a-zA-Z0-9]/g,"_")}_${now.toISOString().slice(0,10)}.pdf`;
    return { doc, fileName };
  };
  const generateQuotationPdf = () => { const { doc, fileName } = buildQuotationPdf(); doc.save(fileName); };

  const [driveLoading, setDriveLoading] = useState(null);
  const saveToDriveHandler = async (m) => {
    if (!accessToken) {
      setDriveLoading("noauth");
      setTimeout(() => setDriveLoading(null), 4000);
      return;
    }
    setDriveLoading(m);
    try {
      const { doc, fileName } = m === "internal" ? buildInternalPdf() : buildQuotationPdf();
      await uploadToDrive(accessToken, doc.output("blob"), fileName);
      setDriveLoading("done");
      setTimeout(() => setDriveLoading(null), 3000);
    } catch {
      setDriveLoading("error");
      setTimeout(() => setDriveLoading(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[min(480px,92vw)] max-h-[85vh] flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="font-bold text-gray-800">{t.reportSection}</div>
            <div className="text-xs text-gray-400 mt-0.5">{VERSION} · {BUILD_DATE}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>

        {/* Mode toggle */}
        <div className="px-4 pt-3 pb-0">
          <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-semibold">
            <button onClick={()=>setMode("internal")}
              className={`flex-1 py-2.5 whitespace-nowrap px-2 transition-colors ${mode==="internal" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
              {t.reportModeInternal}
            </button>
            <button onClick={()=>setMode("quotation")}
              className={`flex-1 py-2.5 whitespace-nowrap px-2 transition-colors ${mode==="quotation" ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
              {t.reportModeQuotation}
            </button>
          </div>
        </div>

        <div className="overflow-auto flex-1 p-4 space-y-3">
          {mode === "internal" ? <>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              {lang==="ko" ? "현재 모든 계산 결과가 자동으로 포함됩니다." : "All current calculation results are automatically included."}
            </div>
            {[
              [t.name, author, setAuthor, t.reportAuthorPh],
              [t.dept, dept, setDept, t.deptPh],
              [t.brandOEM, client, setClient, t.reportClientPh],
              [t.plant, project, setProject, t.reportProjectPh],
            ].map(([lbl,val,set,ph]) => (
              <div key={lbl}>
                <div className="text-xs text-gray-500 mb-1 font-medium">{lbl}</div>
                <input value={val} onChange={e=>set(e.target.value)} placeholder={ph}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"/>
              </div>
            ))}
            <div>
              <div className="text-xs text-gray-500 mb-1 font-medium">{t.notes}</div>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder={t.reportNotesPh}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 resize-none"/>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
              <div className="font-semibold text-gray-600 mb-1">{lang==="ko" ? "포함 내용" : "Report Contents"}</div>
              {["Project Info","Production & Workforce KPIs","CAPEX Breakdown","OPEX & ROI Summary",`${projYrs}-Year ROI Table`].map(s=>(
                <div key={s} className="flex items-center gap-1.5 text-gray-500"><span className="text-green-500">✓</span>{s}</div>
              ))}
            </div>
          </> : <>
            <div className="bg-indigo-50 rounded-lg p-3 text-xs text-indigo-700">
              {lang==="ko"
                ? "고객 제공용 견적서입니다. HW BOM, 가격, ROI 하이라이트, 조건이 자동 포함됩니다."
                : "Customer-facing quotation with HW BOM, pricing, ROI highlights & terms — auto-generated."}
            </div>
            {[
              [t.brandOEM, client, setClient, t.reportClientPh],
              [t.plant, project, setProject, t.reportProjectPh],
              [t.contactPerson, contactPerson, setContactPerson, t.contactPersonPh],
              [t.salesRep, salesRep, setSalesRep, t.salesRepPh],
              [t.dept, dept, setDept, t.deptPh],
            ].map(([lbl,val,set,ph]) => (
              <div key={lbl}>
                <div className="text-xs text-gray-500 mb-1 font-medium">{lbl}</div>
                <input value={val} onChange={e=>set(e.target.value)} placeholder={ph}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"/>
              </div>
            ))}
            <div>
              <div className="text-xs text-gray-500 mb-1 font-medium">{t.validityDays}</div>
              <input type="number" value={validDays} onChange={e=>setValidDays(Number(e.target.value))} min={7} max={180}
                className="w-24 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"/>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1 font-medium">{t.notes}</div>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder={t.reportNotesPh}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500 resize-none"/>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
              <div className="font-semibold text-gray-600 mb-1">{lang==="ko" ? "포함 내용" : "Quotation Contents"}</div>
              {["Cover · Quote # · Validity","Solution Overview (Sites)","Hardware BOM (qty + price)","CAPEX & OPEX Pricing","ROI Highlights","Terms & Conditions"].map(s=>(
                <div key={s} className="flex items-center gap-1.5 text-gray-500"><span className="text-indigo-500">✓</span>{s}</div>
              ))}
            </div>
          </>}
        </div>
        <div className="p-4 border-t border-gray-100 space-y-2">
          <div className="flex gap-2">
            {mode === "internal"
              ? <button onClick={generatePdf} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 text-sm font-semibold">{t.downloadPdf}</button>
              : <button onClick={generateQuotationPdf} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-sm font-semibold">{t.downloadQuotation}</button>
            }
            <button onClick={() => saveToDriveHandler(mode)}
              disabled={driveLoading === mode || driveLoading === "done"}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg py-2 text-sm font-semibold">
              {driveLoading === mode ? "⏳" : driveLoading === "done" ? "✅" : "💾"} {t.saveToDrive}
            </button>
          </div>
          {driveLoading === "done" && <div className="text-xs text-green-600 text-center">{t.savedToDrive}</div>}
          {driveLoading === "error" && <div className="text-xs text-red-500 text-center">{t.saveToDriveFail}</div>}
          {driveLoading === "noauth" && <div className="text-xs text-orange-500 text-center">{t.saveToDriveNoAuth}</div>}
          <button onClick={onClose} className="w-full border border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">{t.reportClose}</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // ── Google Auth ──
  const { user: googleUser, ready: gsiReady, logout: googleLogout, accessToken } = useGoogleAuth();

  const [lang, setLang] = useState("en");
  const t = T[lang];

  const [presets, setPresets] = useState(() => loadPresets());
  const [sheetsLoading, setSheetsLoading] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [showList, setShowList] = useState(false);
  const [loadedName, setLoadedName] = useState(null);
  const [loadedRowIndex, setLoadedRowIndex] = useState(null);
  const [toast, setToast] = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2500); };

  // Sheets 연동: accessToken 확보되면 로드
  useEffect(() => {
    if (!accessToken) return;
    setSheetsLoading(true);
    sheetsLoad(accessToken)
      .then(list => { setPresets(list); saveToStorage(list); })
      .catch(() => showToast(t.sheetsLoadFail, false))
      .finally(() => setSheetsLoading(false));
  }, [accessToken]);

  const reloadFromSheets = async () => {
    if (!accessToken) return;
    setSheetsLoading(true);
    try { const list = await sheetsLoad(accessToken); setPresets(list); saveToStorage(list); }
    catch { showToast(t.sheetsRefreshFail, false); }
    finally { setSheetsLoading(false); }
  };

  const handleSavePreset = async (p) => {
    const newPreset = { ...p, id: String(Date.now()) };
    if (accessToken) {
      try {
        await sheetsAppend(accessToken, newPreset);
        await reloadFromSheets();
      } catch { showToast(t.storageFail, false); return; }
    } else {
      const next = [...presets, newPreset];
      setPresets(next); saveToStorage(next);
    }
    setShowSave(false);
    setLoadedName(`${p.brand} · ${p.country} · ${p.plant}`);
    showToast(t.presetSaved);
  };

  const handleDeletePreset = async (preset) => {
    if (accessToken && preset._rowIndex) {
      try {
        await sheetsDeleteRow(accessToken, preset._rowIndex);
        await reloadFromSheets();
      } catch { showToast(t.storageFail, false); }
    } else {
      const next = presets.filter(p => p.id !== preset.id);
      setPresets(next); saveToStorage(next);
    }
  };

  const [cKey, setCKey] = useState("US");
  const [regDays, setRegDays] = useState(250);
  const [holDays, setHolDays] = useState(11);
  const [regHrs, setRegHrs] = useState(8);
  const [otHrs, setOtHrs] = useState(2);
  const [nShifts, setNShifts] = useState(2);
  const [capa, setCapa] = useState(300000);
  const [yld, setYld] = useState(95);
  const [srRatio, setSrRatio] = useState(100);
  const [dist, setDist] = useState(1.5);
  const [spd, setSpd] = useState(30);
  const [tPre, setTPre] = useState(2);
  const [tPark, setTPark] = useState(1.5);
  const [tWlk1, setTWlk1] = useState(3);
  const [tHdwy, setTHdwy] = useState(8);
  const [tRide, setTRide] = useState(5);
  const [tWlk2, setTWlk2] = useState(2);
  const [tOvhd, setTOvhd] = useState(3);
  const [wType, setWType] = useState("hourly");
  const [discount, setDiscount] = useState(0);
  const [wageMode, setWageMode] = useState("hourly");
  const [hrly, setHrly] = useState(22);
  const [hpw, setHpw] = useState(40);
  const [wpy, setWpy] = useState(50);
  const [annWage, setAnnWage] = useState(52000);
  const [srch, setSrch] = useState(30);
  const [infl, setInfl] = useState(3.0);
  const [capexHW, setCapexHW] = useState(1000000);
  const [capexNRE, setCapexNRE] = useState(500000);
  const [capexInst, setCapexInst] = useState(300000);
  const [capexOther, setCapexOther] = useState(200000);
  const [capexMargin, setCapexMargin] = useState(15);
  const [life, setLife] = useState(7);
  const [opexMode, setOpexMode] = useState("move");
  const [opexPM, setOpexPM] = useState(0.5);
  const [opexArea, setOpexArea] = useState(500);
  const [opexPerM2, setOpexPerM2] = useState(5);
  const [srGrw, setSrGrw] = useState(1.0);
  const [projYrs, setProjYrs] = useState(7);
  const [tab, setTab] = useState("prod");
  const [capexOverhead, setCapexOverhead] = useState(15);
  const [capexDiscount, setCapexDiscount] = useState(40);
  const [diffFactor, setDiffFactor] = useState(1.2);
  const [hwWarrantyRate, setHwWarrantyRate] = useState(20);
  const [supportPerM2, setSupportPerM2] = useState(10.66);
  const [swUpdatePerM2, setSwUpdatePerM2] = useState(10.09);
  const [overhaulRate, setOverhaulRate] = useState(10);
  const [overhaulCycle, setOverhaulCycle] = useState(5);
  const [opexDiscount1, setOpexDiscount1] = useState(30);
  const [opexDiscountStep, setOpexDiscountStep] = useState(3);

  // ── Pricing Calc tab state (캐시에서 복원 — lazy initializer로 최초 1회만 읽음) ──
  const [sites, setSites] = useState(() => loadCalcCache()?.sites || [
    { id: 1, name: "Site 1", type: "area", pathLen: 0, width: 40, height: 35,
      diff: { outdoor:0, elevation:0, roadWidth:0.1, surface:0, complexity:0.1, paved:0, capacity:0.1 } },
  ]);
  const [hwConfig, setHwConfig] = useState(() => loadCalcCache()?.hwConfig || DEFAULT_HW_CONFIG);
  const [hwCounts, setHwCounts] = useState(() => loadCalcCache()?.hwCounts || { xt32:6, ot128:0, qt128:0, zt128:0, server:0, etc:6 });
  const [annThruput, setAnnThruput] = useState(() => loadCalcCache()?.annThruput || 300000);
  const [hwPresets, setHwPresets] = useState(() => loadHwPresets());
  const [hwPresetName, setHwPresetName] = useState("");
  const [showReport, setShowReport] = useState(false);

  // Pricing Calc 상태 변경 시 자동 캐시 저장
  useEffect(() => { saveCalcCache({ sites, hwConfig, hwCounts, annThruput }); }, [sites, hwConfig, hwCounts, annThruput]);

  const cd = COUNTRIES[cKey];
  const capexBase = capexHW + capexNRE * diffFactor + capexInst + capexOther;
  const capexAfterOverhead = capexBase * (1 + capexOverhead / 100);
  const capexAfterMargin = capexAfterOverhead * (1 + capexMargin / 100);
  const capex = capexAfterMargin * (1 - capexDiscount / 100);

  const currentParams = () => ({
    cKey, regDays, holDays, regHrs, otHrs, nShifts, capa, yld, srRatio,
    dist, spd, tPre, tPark, tWlk1, tHdwy, tRide, tWlk2, tOvhd,
    wType, discount, wageMode, hrly, hpw, wpy, annWage, srch, infl,
    capexHW, capexNRE, capexInst, capexOther, capexMargin, life,
    opexMode, opexPM, opexArea, opexPerM2, srGrw, projYrs,
    capexOverhead, capexDiscount, diffFactor,
    hwWarrantyRate, supportPerM2, swUpdatePerM2, overhaulRate, overhaulCycle,
    opexDiscount1, opexDiscountStep,
  });

  const loadPreset = (preset) => {
    const p = preset.params;
    if (Object.keys(COUNTRIES).includes(p.cKey)) setCKey(p.cKey);
    setRegDays(clamp(p.regDays, 100, 300, 250));
    setHolDays(clamp(p.holDays, 0, 100, 11));
    setRegHrs(clamp(p.regHrs, 4, 12, 8));
    setOtHrs(clamp(p.otHrs, 0, 6, 2));
    setNShifts(clamp(p.nShifts, 1, 3, 2));
    setCapa(clamp(p.capa, 1000, 2000000, 300000));
    setYld(clamp(p.yld, 50, 100, 95));
    setSrRatio(clamp(p.srRatio ?? 100, 1, 100, 100));
    setDist(clamp(p.dist, 0.1, 30, 1.5));
    setSpd(clamp(p.spd, 5, 60, 30));
    setTPre(clamp(p.tPre, 0, 30, 2));
    setTPark(clamp(p.tPark, 0, 20, 1.5));
    setTWlk1(clamp(p.tWlk1, 0, 20, 3));
    setTHdwy(clamp(p.tHdwy, 1, 60, 8));
    setTRide(clamp(p.tRide, 1, 60, 5));
    setTWlk2(clamp(p.tWlk2, 0, 20, 2));
    setTOvhd(clamp(p.tOvhd, 0, 30, 3));
    if (["fulltime","contractor","hourly"].includes(p.wType)) setWType(p.wType);
    setDiscount(clamp(p.discount || 0, 0, 50, 0));
    if (["hourly","annual"].includes(p.wageMode)) setWageMode(p.wageMode);
    setHrly(clamp(p.hrly, 1, 500, 22));
    setHpw(clamp(p.hpw, 10, 80, 40));
    setWpy(clamp(p.wpy, 10, 52, 50));
    setAnnWage(clamp(p.annWage, 1000, 500000, 52000));
    setSrch(clamp(p.srch, 0, 100, 30));
    setInfl(clamp(p.infl, 0, 30, 3));
    setCapexHW(clamp(p.capexHW ?? 1000000, 0, 50000000, 1000000));
    setCapexNRE(clamp(p.capexNRE ?? 500000, 0, 20000000, 500000));
    setCapexInst(clamp(p.capexInst ?? 300000, 0, 10000000, 300000));
    setCapexOther(clamp(p.capexOther ?? 200000, 0, 10000000, 200000));
    setCapexMargin(clamp(p.capexMargin ?? 15, 0, 50, 15));
    setLife(clamp(p.life, 1, 20, 7));
    if (["move","area"].includes(p.opexMode)) setOpexMode(p.opexMode ?? "move");
    setOpexPM(clamp(p.opexPM ?? 0.5, 0.01, 100, 0.5));
    setOpexArea(clamp(p.opexArea ?? 500, 1, 100000, 500));
    setOpexPerM2(clamp(p.opexPerM2 ?? 5, 0.1, 500, 5));
    setSrGrw(clamp(p.srGrw, 0, 20, 1));
    setProjYrs(clamp(p.projYrs, 1, 20, 7));
    setCapexOverhead(clamp(p.capexOverhead ?? 15, 0, 50, 15));
    setCapexDiscount(clamp(p.capexDiscount ?? 40, 0, 80, 40));
    setDiffFactor(clamp(p.diffFactor ?? 1.2, 1.0, 1.5, 1.2));
    setHwWarrantyRate(clamp(p.hwWarrantyRate ?? 20, 0, 50, 20));
    setSupportPerM2(clamp(p.supportPerM2 ?? 10.66, 0, 100, 10.66));
    setSwUpdatePerM2(clamp(p.swUpdatePerM2 ?? 10.09, 0, 100, 10.09));
    setOverhaulRate(clamp(p.overhaulRate ?? 10, 0, 50, 10));
    setOverhaulCycle(clamp(p.overhaulCycle ?? 5, 1, 20, 5));
    setOpexDiscount1(clamp(p.opexDiscount1 ?? 30, 0, 80, 30));
    setOpexDiscountStep(clamp(p.opexDiscountStep ?? 3, 0, 20, 3));
    setLoadedName(`${preset.brand} · ${preset.country} · ${preset.plant}`);
    setLoadedRowIndex(preset._rowIndex ?? null);
    setShowList(false);
  };

  const handleCountry = (key) => {
    const co = COUNTRIES[key];
    setCKey(key); setAnnWage(co.avgWage); setSrch(co.surcharge); setInfl(co.inflation); setHolDays(co.holidays);
  };

  const handleUpdatePreset = async () => {
    if (!loadedRowIndex) { showToast(t.noPresetLoaded, false); return; }
    const existing = presets.find(p => p._rowIndex === loadedRowIndex);
    if (!existing) { showToast(t.noPresetLoaded, false); return; }
    const updated = { ...existing, params: currentParams(), savedAt: new Date().toISOString() };
    if (accessToken) {
      try {
        await sheetsUpdateRow(accessToken, loadedRowIndex, updated);
        await reloadFromSheets();
      } catch { showToast(t.storageFail, false); return; }
    } else {
      const next = presets.map(p => p._rowIndex === loadedRowIndex ? updated : p);
      setPresets(next); saveToStorage(next);
    }
    showToast(t.updated(loadedName));
  };

  const applyPricingCalc = () => {
    setCapexHW(Math.round(PC.hwTotal));
    setCapexNRE(Math.round(PC.totalNRE));
    setCapexInst(DEV_LICENSE_AMT);
    setCapexOther(0);
    setDiffFactor(1.0);
    setOpexMode("area");
    setOpexArea(Math.round(PC.totalArea));
    setTab("sr");
    showToast(lang === "ko" ? "✅ SR Pricing 탭에 적용됨" : "✅ Applied to SR Pricing tab");
  };

  const R = useMemo(() => {
    const effDays = Math.max(1, regDays + holDays - cd.holidays);
    const hps = regHrs + otHrs;
    const totHrs = effDays * hps * nShifts;
    const uph = totHrs > 0 ? capa / (totHrs * (yld / 100)) : 0;
    const mpd = capa / effDays;
    const srCapa = capa * (srRatio / 100);
    const mpdSR = srCapa / effDays;
    const mpdManned = mpd - mpdSR;
    const driveT = (dist / spd) * 60;
    const waitT = tHdwy / 2;
    const cycleT = tPre + driveT + tPark + tWlk1 + waitT + tRide + tWlk2 + tOvhd;
    const tripsPS = (hps * 60) / cycleT;
    const totalDrvPS  = Math.ceil(mpd / (tripsPS * nShifts));
    const totalDrvTot = totalDrvPS * nShifts;
    const drvPS       = Math.ceil(mpdSR / (tripsPS * nShifts));
    const drvTot      = drvPS * nShifts;
    const mannedDrvPS = Math.ceil(mpdManned / (tripsPS * nShifts));
    const mannedDrvTot= mannedDrvPS * nShifts;
    const hReg = regDays * regHrs;
    const hOt = regDays * otHrs;
    const hHolReg = holDays * regHrs;
    const hHolOt = holDays * otHrs;
    const totHrsP = hReg + hOt + hHolReg + hHolOt;
    let annBase;
    const disc = discount / 100;
    if (wageMode === "annual") {
      annBase = annWage * (1 - disc);
    } else {
      const impl = hrly * (1 - disc);
      annBase = impl * (hReg * 1.0 + hOt * 1.5 + hHolReg * 2.0 + hHolOt * 2.0);
    }
    const effHrly = totHrsP > 0 ? annBase / totHrsP : 0;
    const compPP = annBase * (1 + srch / 100);
    const annLaborBaseline = totalDrvTot * compPP;
    const annLaborRemaining = mannedDrvTot * compPP;
    const annDepr = capex / life;
    let annOpex;
    if (opexMode === "move") {
      annOpex = srCapa * opexPM;
    } else {
      const hwWarranty = capexHW * (hwWarrantyRate / 100);
      const siteSup = opexArea * supportPerM2;
      const swUpd = opexArea * swUpdatePerM2;
      const overhaulAnn = (capexHW * overhaulRate / 100) / Math.max(1, overhaulCycle);
      const opexDirect = hwWarranty + siteSup + swUpd + overhaulAnn;
      annOpex = opexDirect * (1 + capexOverhead / 100) * (1 + capexMargin / 100);
    }
    const annSRTot = annDepr + annOpex;
    const inflR = infl / 100, srGrwR = srGrw / 100;
    let cumL = 0, cumS = 0;
    const chart = Array.from({ length: projYrs }, (_, i) => {
      const y = i + 1;
      const laborBaseline  = annLaborBaseline  * Math.pow(1 + inflR, i);
      const laborRemaining = annLaborRemaining * Math.pow(1 + inflR, i);
      const opexDiscRate = Math.max(0, opexDiscount1 - opexDiscountStep * i) / 100;
      const opex = annOpex * (1 - opexDiscRate) * Math.pow(1 + srGrwR, i);
      const depr = y <= life ? annDepr : 0;
      const srTot = opex + depr;
      const totalCostAfterSR = laborRemaining + srTot;
      cumL += laborBaseline;
      cumS += totalCostAfterSR;
      return {
        year: `Y${y}`,
        "Labor Baseline":    Math.round(laborBaseline),
        "Remaining Labor":   Math.round(laborRemaining),
        "SR OPEX":           Math.round(opex),
        "SR Depreciation":   Math.round(depr),
        "SR Total":          Math.round(srTot),
        "Cum. Labor Baseline":   Math.round(cumL),
        "Cum. After SR":         Math.round(cumS),
        savings: Math.round(cumL - cumS),
      };
    });
    const bep = chart.find(r => r.savings > 0)?.year ?? "N/A";
    const finSav = chart[chart.length - 1]?.savings ?? 0;
    const roiPct = capex > 0 ? (finSav / capex) * 100 : 0;
    const yr1Savings = annLaborBaseline - (annLaborRemaining + annSRTot);
    return {
      effDays, totHrs, uph, mpd, srCapa, mpdSR, mpdManned,
      driveT, waitT, cycleT, tripsPS,
      totalDrvPS, totalDrvTot, drvPS, drvTot, mannedDrvPS, mannedDrvTot,
      hReg, hOt, hHolReg, hHolOt, totHrsP, annBase, effHrly, compPP,
      annLaborBaseline, annLaborRemaining, annDepr, annOpex, annSRTot,
      chart, bep, finSav, roiPct, yr1Savings,
    };
  }, [cd, regDays, holDays, regHrs, otHrs, nShifts, capa, yld, srRatio,
      dist, spd, tPre, tPark, tWlk1, tHdwy, tRide, tWlk2, tOvhd,
      wType, discount, wageMode, hrly, annWage, srch, infl,
      capex, life, opexMode, opexPM, opexArea, opexPerM2, srGrw, projYrs,
      capexHW, capexOverhead, capexMargin, diffFactor, hwWarrantyRate, supportPerM2,
      swUpdatePerM2, overhaulRate, overhaulCycle, opexDiscount1, opexDiscountStep]);

  const PC = useMemo(() => {
    const siteRows = sites.map(s => {
      const totalSize = s.type === "length" ? s.pathLen : s.width * s.height;
      const baseUnit  = NRE_BASE[s.type];
      const converted = totalSize / Math.max(1, baseUnit);
      const diffSum   = Object.values(s.diff).reduce((a,b) => a+b, 0);
      const df        = 1 + diffSum;
      const adjusted  = converted * df;
      const nreAmt    = adjusted * NRE_UNIT[s.type];
      return { ...s, totalSize, converted, df, adjusted, nreAmt };
    });

    const totalNRE      = siteRows.reduce((s, r) => s + r.nreAmt, 0);
    const totalArea     = siteRows.reduce((s, r) => s + r.totalSize, 0);
    const totalAdjusted = siteRows.reduce((s, r) => s + r.adjusted, 0);

    const hwTotal = hwConfig.reduce((s, hw) => s + (hwCounts[hw.id] || 0) * hw.price, 0);

    const capexSub       = hwTotal + totalNRE + DEV_LICENSE_AMT;
    const capexWithOH    = capexSub * (1 + capexOverhead / 100);
    const capexWithMgn   = capexWithOH * (1 + capexMargin / 100);
    const capexFinal     = capexWithMgn * (1 - capexDiscount / 100);

    const vw = annThruput < 100000 ? 1.0 : annThruput < 150000 ? 1.01
             : annThruput < 200000 ? 1.02 : annThruput < 250000 ? 1.03
             : annThruput < 300000 ? 1.04 : annThruput < 350000 ? 1.05
             : annThruput < 400000 ? 1.06 : annThruput < 450000 ? 1.07
             : annThruput < 500000 ? 1.08 : 1.09;
    const swLicense = totalAdjusted * (siteRows[0]?.type === "length" ? 62.5 : 1250) * vw;

    const hwWarranty = hwTotal * (hwWarrantyRate / 100);
    const siteSup    = totalArea * supportPerM2;
    const swUpd      = totalArea * swUpdatePerM2;
    const overhaulA  = (hwTotal * overhaulRate / 100) / Math.max(1, overhaulCycle);
    const opexDirect = hwWarranty + siteSup + swUpd + overhaulA + swLicense;
    const opexFinal  = opexDirect * (1 + capexOverhead / 100) * (1 + capexMargin / 100);

    return {
      siteRows, totalNRE, totalArea, totalAdjusted,
      hwTotal, capexSub, capexWithOH, capexWithMgn, capexFinal,
      vw, swLicense, hwWarranty, siteSup, swUpd, overhaulA, opexDirect, opexFinal,
    };
  }, [sites, hwConfig, hwCounts, annThruput, capexOverhead, capexMargin, capexDiscount,
      hwWarrantyRate, supportPerM2, swUpdatePerM2, overhaulRate, overhaulCycle]);

  const lbl = {
    laborBaseline:  lang === "ko" ? "기준 인건비 (100%)" : "Labor Baseline (100%)",
    remaining:      lang === "ko" ? "잔여 유인 인건비"   : "Remaining Manned Labor",
    srOpex:         lang === "ko" ? "SR OPEX"            : "SR OPEX",
    srDepr:         lang === "ko" ? "SR 감가상각"        : "SR Depreciation",
    cumBaseline:    lang === "ko" ? "누적 기준 인건비"   : "Cum. Labor Baseline",
    cumAfterSR:     lang === "ko" ? "누적 도입 후 비용"  : "Cum. After SR",
    cumSavings:     lang === "ko" ? "누적 절감액"        : "Cum. Savings",
  };

  // ── Google 로그인 화면 ──
  if (!googleUser) return <LoginScreen ready={gsiReady} />;

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "system-ui,sans-serif" }}>
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold max-w-xs text-center ${toast.ok ? "bg-green-600" : "bg-red-500"}`}>
          {toast.msg}
        </div>
      )}
      {showSave && (
        <PresetModal params={currentParams()} t={t}
          onSave={handleSavePreset}
          onClose={() => setShowSave(false)}
        />
      )}
      {showList && (
        <PresetPanel presets={presets} t={t}
          onLoad={loadPreset}
          onDelete={handleDeletePreset}
          onClose={() => setShowList(false)}
          sheetsLoading={sheetsLoading}
          onRefresh={reloadFromSheets}
        />
      )}
      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} lang={lang} />}
      {showReport && (
        <ReportModal
          onClose={() => setShowReport(false)}
          t={t} lang={lang}
          R={R} PC={PC} capex={capex}
          capexHW={capexHW} capexNRE={capexNRE} capexInst={capexInst} capexOther={capexOther}
          capexBase={capexBase} capexAfterOverhead={capexAfterOverhead} capexAfterMargin={capexAfterMargin}
          capexOverhead={capexOverhead} capexMargin={capexMargin} capexDiscount={capexDiscount}
          opexMode={opexMode} opexArea={opexArea} life={life} projYrs={projYrs}
          loadedName={loadedName} googleUser={googleUser}
          hwConfig={hwConfig} hwCounts={hwCounts} sites={sites}
          accessToken={accessToken}
        />
      )}

      {/* Header */}
      <div className="bg-blue-700 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3">
          <div className="text-2xl font-black">SR</div>
          <div className="border-l border-blue-400 pl-3">
            <div className="font-bold text-lg">{t.title}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="text-blue-200 text-xs">{t.subtitle}</div>
              <button onClick={() => setShowChangelog(true)}
                className="text-xs bg-blue-800 hover:bg-blue-900 text-blue-300 hover:text-white px-2 py-0.5 rounded-full transition-colors">
                {VERSION} · {BUILD_DATE}
              </button>
            </div>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <a href="https://seoulrobotics.atlassian.net/wiki/x/EAAi5"
  target="_blank" rel="noreferrer"
  title="Manual"
  className="flex items-center justify-center w-8 h-8 bg-blue-800 hover:bg-blue-900 rounded-lg text-white text-base">
  📖
</a>
<a href="https://sr-gate.vercel.app/"
  title="Back to Gate"
  className="flex items-center justify-center w-8 h-8 bg-blue-800 hover:bg-blue-900 rounded-lg text-white text-base">
  🏠
</a>
            <div className="flex rounded-lg overflow-hidden border border-blue-400">
              <button onClick={() => setLang("en")} className={`px-3 py-1.5 text-xs font-bold transition-colors ${lang === "en" ? "bg-white text-blue-700" : "text-blue-200 hover:bg-blue-600"}`}>EN</button>
              <button onClick={() => setLang("ko")} className={`px-3 py-1.5 text-xs font-bold transition-colors ${lang === "ko" ? "bg-white text-blue-700" : "text-blue-200 hover:bg-blue-600"}`}>한국어</button>
            </div>
            <button onClick={() => setShowList(true)} className="flex items-center gap-1.5 bg-blue-800 hover:bg-blue-900 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
              {sheetsLoading ? "⏳" : "🏭"} {t.presets} {presets.length > 0 && <span className="bg-blue-500 text-white text-xs rounded-full px-1.5">{presets.length}</span>}
            </button>
            <button onClick={() => setShowReport(true)} className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
              {t.reportBtn}
            </button>
            <button onClick={() => setShowSave(true)} className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
              💾 {t.savePreset}
            </button>
            {/* 유저 정보 + 로그아웃 */}
            <div className="flex items-center gap-2 bg-blue-800 rounded-lg px-3 py-1.5">
              <img src={googleUser.picture} alt="" style={{ width: 22, height: 22, borderRadius: "50%" }} />
              <span className="text-xs text-blue-200 hidden sm:block">{googleUser.name}</span>
              <button onClick={googleLogout} className="text-xs text-blue-300 hover:text-white border border-blue-600 rounded px-2 py-1 ml-1">{t.logout}</button>
            </div>
          </div>
        </div>
        {loadedName && (
          <div className="max-w-6xl mx-auto mt-2">
            <div className="text-xs bg-blue-800 rounded-lg px-3 py-1.5 inline-flex flex-wrap items-center gap-2">
              <span className="text-blue-300">{t.loaded}</span>
              <span className="text-white font-semibold">{loadedName}</span>
              <button onClick={handleUpdatePreset} className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded ml-1">{t.update}</button>
              <button onClick={() => { setLoadedName(null); setLoadedRowIndex(null); }} className="text-blue-400 hover:text-white ml-1">✕</button>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-sm font-bold text-gray-600 mb-2">{t.targetCountry}</div>
            <select value={cKey} onChange={e => handleCountry(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 mb-3">
              {Object.entries(COUNTRIES).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
            </select>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="text-gray-500">{t.publicHolidays}</div>
                <div className="font-bold text-blue-700">{cd.holidays} {t.days}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <div className="text-gray-500 mb-1">{t.avgAnnualWage}</div>
                <div className="flex items-center justify-center gap-0.5">
                  <span className="text-gray-400 text-xs">$</span>
                  <Inp v={annWage} set={setAnnWage} min={1000} max={500000} step={1000} w="w-24" comma />
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-2">
                <div className="text-gray-500 mb-1">{t.wageInflation}</div>
                <div className="flex items-center justify-center gap-0.5">
                  <Inp v={infl} set={setInfl} min={0} max={30} step={0.1} w="w-14" />
                  <span className="text-orange-600 font-bold text-xs">%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-200 overflow-x-auto">
              {t.tabs.map((lbl2, i) => (
                <button key={t.tabIds[i]} onClick={() => setTab(t.tabIds[i])}
                  title={lbl2}
                  className={`flex-1 min-w-[58px] text-[11px] py-2 px-1 font-medium leading-tight transition-colors whitespace-nowrap ${tab === t.tabIds[i] ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                  {lbl2}
                </button>
              ))}
            </div>
            <div className="p-4">
              {tab === "prod" && <>
                <SecHead n="1" title={t.prodTitle} sub={t.prodSub} />
                <Row label={t.regDays}><Inp v={regDays} set={setRegDays} min={100} max={300} unit={t.days} /></Row>
                <Row label={t.holDays} hint={t.holDaysHint}><Inp v={holDays} set={setHolDays} min={0} max={100} unit={t.days} /></Row>
                <Row label={t.regHrs}><Inp v={regHrs} set={setRegHrs} min={4} max={12} unit={t.hrs} /></Row>
                <Row label={t.otHrs}><Inp v={otHrs} set={setOtHrs} min={0} max={6} unit={t.hrs} /></Row>
                <Row label={t.nShifts}><Inp v={nShifts} set={setNShifts} min={1} max={3} unit={t.shifts} /></Row>
                <Row label={t.capa}><Inp v={capa} set={setCapa} min={1000} max={2000000} step={10000} unit={t.units} w="w-28" comma /></Row>
                <Row label={t.yld}><Inp v={yld} set={setYld} min={50} max={100} step={0.5} unit={t.pct} /></Row>
                <Row label={t.srRatio} hint={t.srRatioHint}><Inp v={srRatio} set={setSrRatio} min={1} max={100} step={1} unit={t.pct} /></Row>
                <div className="mt-3 bg-blue-50 rounded-lg p-3 grid grid-cols-2 gap-2 text-center text-xs">
                  <div><div className="text-gray-500">{t.effWorkDays}</div><div className="font-bold text-blue-700">{c(R.effDays)} {t.days}</div></div>
                  <div><div className="text-gray-500">{t.backCalcUPH}</div><div className="font-bold text-blue-700">{R.uph.toFixed(1)} /h</div></div>
                  <div><div className="text-gray-500">{t.dailyMovesTotal}</div><div className="font-bold text-blue-700">{c(Math.round(R.mpd))}</div></div>
                  <div><div className="text-gray-500">{t.dailyMovesSR}</div><div className="font-bold text-blue-700">{c(Math.round(R.mpdSR))}</div></div>
                  <div><div className="text-gray-500">{t.srCapa}</div><div className="font-bold text-blue-700">{c(Math.round(R.srCapa))} ({srRatio}%)</div></div>
                  <div><div className="text-gray-500">{t.totalAnnHours}</div><div className="font-bold text-blue-700">{c(R.totHrs)} h</div></div>
                </div>
              </>}

              {tab === "trans" && <>
                <SecHead n="2" title={t.transTitle} sub={t.transSub} />
                <div className="text-xs font-bold text-gray-400 mb-1">{t.preDrive}</div>
                <Row label={t.inspection}><Inp v={tPre} set={setTPre} min={0} max={30} step={0.5} unit={t.min} /></Row>
                <div className="text-xs font-bold text-gray-400 mt-2 mb-1">{t.driveLeg}</div>
                <Row label={t.distance} hint={t.distanceHint}><Inp v={dist} set={setDist} min={0.1} max={30} step={0.1} unit={t.km} /></Row>
                <Row label={t.speed} hint={t.speedHint}><Inp v={spd} set={setSpd} min={5} max={60} step={5} unit={t.kmh} /></Row>
                <div className="text-xs font-bold text-gray-400 mt-2 mb-1">{t.atDest}</div>
                <Row label={t.parking}><Inp v={tPark} set={setTPark} min={0} max={20} step={0.5} unit={t.min} /></Row>
                <Row label={t.walkToShuttle}><Inp v={tWlk1} set={setTWlk1} min={0} max={20} step={0.5} unit={t.min} /></Row>
                <div className="text-xs font-bold text-gray-400 mt-2 mb-1">{t.returnLeg}</div>
                <Row label={t.headway} hint={t.headwayHint}><Inp v={tHdwy} set={setTHdwy} min={1} max={60} unit={t.min} /></Row>
                <Row label={t.shuttleRide}><Inp v={tRide} set={setTRide} min={1} max={60} unit={t.min} /></Row>
                <Row label={t.walkToVeh}><Inp v={tWlk2} set={setTWlk2} min={0} max={20} step={0.5} unit={t.min} /></Row>
                <div className="text-xs font-bold text-gray-400 mt-2 mb-1">{t.overhead}</div>
                <Row label={t.cycleOverhead} hint={t.cycleOverheadHint}><Inp v={tOvhd} set={setTOvhd} min={0} max={30} step={0.5} unit={t.min} /></Row>
                <div className="mt-3 bg-gray-50 rounded-lg p-3 text-xs">
                  <div className="font-bold text-gray-700 mb-2">{t.cycleBreakdown}</div>
                  <CR label={t.inspPickup}      value={`${tPre} ${t.min}`} />
                  <CR label={t.onewayDrive}     value={`${R.driveT.toFixed(1)} ${t.min}`} />
                  <CR label={t.parkDocs}        value={`${tPark} ${t.min}`} />
                  <CR label={t.walkShuttle}     value={`${tWlk1} ${t.min}`} />
                  <CR label={t.shuttleWait}     value={`${R.waitT.toFixed(1)} ${t.min}`} col="text-orange-500" />
                  <CR label={t.shuttleRideBack} value={`${tRide} ${t.min}`} />
                  <CR label={t.walkNextVeh}     value={`${tWlk2} ${t.min}`} />
                  <CR label={t.overheadLabel}   value={`${tOvhd} ${t.min}`} />
                  <div className="flex justify-between pt-2 mt-1 border-t border-gray-300 font-bold">
                    <span className="text-blue-700">{t.totalCycleTime}</span>
                    <span className="text-blue-700">{R.cycleT.toFixed(1)} {t.min}</span>
                  </div>
                  <div className="flex justify-between pt-1 font-semibold text-green-700">
                    <span>{t.tripsPerShift}</span><span>{R.tripsPS.toFixed(1)}</span>
                  </div>
                </div>
              </>}

              {tab === "work" && <>
                <SecHead n="3" title={t.workTitle} sub={t.workSub} />
                <Row label={t.empType}>
                  <select value={wType} onChange={e => { setWType(e.target.value); if (e.target.value === "fulltime") setDiscount(0); }}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none">
                    {Object.entries(t.empTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </Row>
                {wType !== "fulltime" && (
                  <Row label={t.discount} hint={t.discountHint}>
                    <Inp v={discount} set={setDiscount} min={0} max={50} step={1} unit={t.pct} />
                  </Row>
                )}
                <Row label={t.wageMode}>
                  <div className="flex gap-1">
                    <button onClick={() => setWageMode("hourly")} className={`text-xs px-2 py-1 rounded ${wageMode === "hourly" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>{t.hourlyRate}</button>
                    <button onClick={() => setWageMode("annual")} className={`text-xs px-2 py-1 rounded ${wageMode === "annual" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>{t.annualAvg}</button>
                  </div>
                </Row>
                {wageMode === "hourly" ? <>
                  <Row label={t.baseHourlyRate} hint={t.baseHourlyHint}><Inp v={hrly} set={setHrly} min={1} max={500} step={0.5} unit={t.perHr} /></Row>
                </> : <>
                  <Row label={t.annAvgWage} hint={t.annAvgWageHint}>
                    <Inp v={annWage} set={setAnnWage} min={1000} max={500000} step={1000} unit={t.perYr} w="w-28" comma />
                  </Row>
                </>}
                <Row label={t.benefits} hint={t.benefitsHint}><Inp v={srch} set={setSrch} min={0} max={100} step={1} unit={t.pct} /></Row>
                <Row label={t.wageInflRate}><Inp v={infl} set={setInfl} min={0} max={30} step={0.1} unit={t.pctYr} /></Row>
                <div className="mt-3 bg-blue-50 rounded-lg p-3 text-xs">
                  <div className="font-bold text-blue-800 mb-2">{t.payPremium}</div>
                  <CR label={t.regularHrs}  value="× 1.0 (100%)" />
                  <CR label={t.weekdayOT}   value="× 1.5 (150%)" col="text-orange-500" />
                  <CR label={t.holidayWknd} value="× 2.0 (200%)" col="text-red-600" />
                  <CR label={t.holidayOT}   value="× 2.0 (highest)" col="text-red-700" />
                </div>
                {wageMode === "hourly" && (
                  <div className="mt-3 bg-gray-50 rounded-lg p-3 text-xs">
                    <div className="font-bold text-gray-700 mb-2">{t.annHoursP}</div>
                    <CR label={`${t.regularStd} (${regDays}d × ${regHrs}h)`}  value={`${c(R.hReg)} h × 1.0`} />
                    <CR label={`${t.weekdayOTLbl} (${regDays}d × ${otHrs}h)`} value={`${c(R.hOt)} h × 1.5`} col="text-orange-500" />
                    <CR label={`${t.holidayStd} (${holDays}d × ${regHrs}h)`}  value={`${c(R.hHolReg)} h × 2.0`} col="text-red-600" />
                    <CR label={`${t.holidayOTLbl} (${holDays}d × ${otHrs}h)`} value={`${c(R.hHolOt)} h × 2.0`} col="text-red-700" />
                    <div className="flex justify-between pt-2 mt-1 border-t border-gray-300 font-bold">
                      <span>{t.totalHoursP}</span><span>{c(R.totHrsP)} h</span>
                    </div>
                    <div className="flex justify-between pt-1 font-semibold text-blue-700">
                      <span>{t.effAvgHrly}</span><span>${R.effHrly.toFixed(2)}/hr</span>
                    </div>
                  </div>
                )}
                <div className="mt-3 bg-orange-50 rounded-lg p-3 grid grid-cols-2 gap-2 text-center text-xs">
                  <div><div className="text-gray-500">{t.annWageP}</div><div className="font-bold text-orange-700">{$c(R.annBase)}</div></div>
                  <div>
                    <div className="text-gray-500">{t.totalCostP}</div>
                    <div className="font-bold text-orange-700">{$c(R.compPP)}</div>
                    <div className="text-gray-400">{t.benefitsPct(srch)}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-gray-500">{t.totalAnnLabor} ({c(R.totalDrvTot)} {t.driversPre})</div>
                    <div className="font-bold text-orange-700 text-xl">{$c(R.annLaborBaseline)}</div>
                  </div>
                </div>
                <div className="mt-3 bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-xs">
                  <div className="font-bold text-yellow-800 mb-1">{t.benchmark}</div>
                  <div className="text-gray-500">{t.benchmarkSub}</div>
                  <div className="mt-1 text-gray-600">{t.estAnnLabor} <span className="font-bold text-yellow-700">
                    {$c(67 * hrly * (R.hReg * 1.0 + R.hOt * 1.5 + R.hHolReg * 2.0 + R.hHolOt * 2.0) * (1 + srch / 100))}
                  </span></div>
                </div>
              </>}

              {tab === "sr" && <>
                <SecHead n="4" title={t.srTitle} sub={t.srSub} />
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{t.capexBreakdown}</div>
                <Row label={t.hardware} hint={t.hardwareHint}><Inp v={capexHW} set={setCapexHW} min={0} max={50000000} step={50000} unit={t.dollar} w="w-28" comma /></Row>
                <Row label={t.nre} hint={t.nreHint}><Inp v={capexNRE} set={setCapexNRE} min={0} max={20000000} step={50000} unit={t.dollar} w="w-28" comma /></Row>
                <Row label={t.installation}><Inp v={capexInst} set={setCapexInst} min={0} max={10000000} step={50000} unit={t.dollar} w="w-28" comma /></Row>
                <Row label={t.other}><Inp v={capexOther} set={setCapexOther} min={0} max={10000000} step={10000} unit={t.dollar} w="w-28" comma /></Row>
                <Row label={t.margin} hint={t.marginHint}><Inp v={capexMargin} set={setCapexMargin} min={0} max={50} step={0.5} unit={t.pct} /></Row>
                <Row label={t.capexOverhead} hint={t.capexOverheadHint}><Inp v={capexOverhead} set={setCapexOverhead} min={0} max={50} step={1} unit={t.pct} /></Row>
                <Row label={t.capexDiscount} hint={t.capexDiscountHint}><Inp v={capexDiscount} set={setCapexDiscount} min={0} max={80} step={1} unit={t.pct} /></Row>
                <Row label={t.diffFactor} hint={t.diffFactorHint}><Inp v={diffFactor} set={setDiffFactor} min={1.0} max={1.5} step={0.05} /></Row>
                <div className="mt-2 bg-purple-50 rounded-lg p-3 text-xs">
                  <CR label="HW"             value={$c(capexHW)} />
                  <CR label={`NRE (×${diffFactor})`} value={$c(capexNRE * diffFactor)} />
                  <CR label={t.installation} value={$c(capexInst)} />
                  <CR label={t.other}        value={$c(capexOther)} />
                  <CR label={t.subtotal}     value={$c(capexBase)} col="text-gray-700" />
                  <CR label={`${t.capexOverhead} (${capexOverhead}%)`} value={$c(capexBase * capexOverhead / 100)} col="text-blue-500" />
                  <CR label={`${t.margin} (${capexMargin}%)`} value={$c(capexAfterOverhead * capexMargin / 100)} col="text-orange-500" />
                  <CR label={`${t.capexDiscount} (-${capexDiscount}%)`} value={`-${$c(capexAfterMargin * capexDiscount / 100)}`} col="text-green-600" />
                  <div className="flex justify-between pt-2 mt-1 border-t border-gray-300 font-bold text-purple-700">
                    <span>{t.totalCapex}</span><span>{$c(capex)}</span>
                  </div>
                </div>
                <Row label={t.usefulLife} hint={t.usefulLifeHint}><Inp v={life} set={setLife} min={1} max={20} unit={t.yrsUnit} /></Row>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-3 mb-1">{t.opexMode}</div>
                <Row label={t.opexCalcMode}>
                  <div className="flex gap-1">
                    <button onClick={() => setOpexMode("move")} className={`text-xs px-2 py-1 rounded ${opexMode === "move" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>{t.perMove}</button>
                    <button onClick={() => setOpexMode("area")} className={`text-xs px-2 py-1 rounded ${opexMode === "area" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>{t.perArea}</button>
                  </div>
                </Row>
                {opexMode === "move"
                  ? <Row label={t.opexPerMove}><Inp v={opexPM} set={setOpexPM} min={0.01} max={100} step={0.1} unit={t.perMoveUnit} /></Row>
                  : <>
                    <Row label={t.coverageArea} hint={t.coverageAreaHint}><Inp v={opexArea} set={setOpexArea} min={1} max={100000} step={50} unit={t.m2} w="w-28" comma /></Row>
                    <div className="mt-2 text-xs font-bold text-gray-400 uppercase tracking-wide">{t.opexDetail}</div>
                    <Row label={t.hwWarrantyRate} hint={t.hwWarrantyRateHint}><Inp v={hwWarrantyRate} set={setHwWarrantyRate} min={0} max={50} step={1} unit={t.pct} /></Row>
                    <Row label={t.supportPerM2} hint={t.supportPerM2Hint}><Inp v={supportPerM2} set={setSupportPerM2} min={0} max={100} step={0.1} unit="$/m²" /></Row>
                    <Row label={t.swUpdatePerM2} hint={t.swUpdatePerM2Hint}><Inp v={swUpdatePerM2} set={setSwUpdatePerM2} min={0} max={100} step={0.1} unit="$/m²" /></Row>
                    <Row label={t.overhaulRate} hint={t.overhaulRateHint}><Inp v={overhaulRate} set={setOverhaulRate} min={0} max={50} step={1} unit={t.pct} /></Row>
                    <Row label={t.overhaulCycle} hint={t.overhaulCycleHint}><Inp v={overhaulCycle} set={setOverhaulCycle} min={1} max={20} unit={t.yrsUnit} /></Row>
                    {opexMode === "area" && (
                      <div className="mt-2 bg-blue-50 rounded-lg p-3 text-xs">
                        <div className="font-bold text-blue-800 mb-2">{t.opexBreakdown}</div>
                        <CR label={t.hwWarrantyLbl} value={$c(capexHW * hwWarrantyRate / 100)} />
                        <CR label={t.siteSupportLbl} value={$c(opexArea * supportPerM2)} />
                        <CR label={t.swUpdateLbl} value={$c(opexArea * swUpdatePerM2)} />
                        <CR label={t.overhaulLbl} value={$c((capexHW * overhaulRate / 100) / Math.max(1, overhaulCycle))} />
                        <CR label={t.opexDirectLbl} value={$c(capexHW * hwWarrantyRate / 100 + opexArea * supportPerM2 + opexArea * swUpdatePerM2 + (capexHW * overhaulRate / 100) / Math.max(1, overhaulCycle))} col="text-gray-700" />
                      </div>
                    )}
                  </>
                }
                <Row label={t.srOpexGrowth}><Inp v={srGrw} set={setSrGrw} min={0} max={20} step={0.5} unit={t.pctYr} /></Row>
                <div className="mt-2 text-xs font-bold text-gray-400 uppercase tracking-wide">{t.opexDiscountTitle}</div>
                <Row label={t.opexDiscount1} hint={t.opexDiscount1Hint}><Inp v={opexDiscount1} set={setOpexDiscount1} min={0} max={80} step={1} unit={t.pct} /></Row>
                <Row label={t.opexDiscountStep} hint={t.opexDiscountStepHint}><Inp v={opexDiscountStep} set={setOpexDiscountStep} min={0} max={20} step={1} unit={`${t.pctYr}`} /></Row>
                <Row label={t.roiPeriod}><Inp v={projYrs} set={setProjYrs} min={1} max={20} unit={t.yrsUnit} /></Row>
                <div className="mt-3 bg-purple-50 rounded-lg p-3 grid grid-cols-2 gap-2 text-center text-xs">
                  <div><div className="text-gray-500">{t.annDepr}</div><div className="font-bold text-purple-700">{$c(R.annDepr)}</div></div>
                  <div>
                    <div className="text-gray-500">{t.annOpex}</div>
                    <div className="font-bold text-purple-700">{$c(R.annOpex)}</div>
                    <div className="text-gray-400">{opexMode === "move" ? t.moves(c(Math.round(R.srCapa)), opexPM) : t.opexAreaHint(c(opexArea))}</div>
                  </div>
                  <div><div className="text-gray-500">{t.annSRTotal}</div><div className="font-bold text-purple-800 text-base">{$c(R.annSRTot)}</div></div>
                  <div><div className="text-gray-500">{t.yr1Savings}</div><div className={`font-bold text-base ${R.yr1Savings > 0 ? "text-green-700" : "text-red-500"}`}>{$c(R.yr1Savings)}</div></div>
                  <div className="col-span-2"><div className="text-gray-500">{t.cumBEP}</div><div className="font-bold text-purple-700 text-xl">{R.bep}</div></div>
                </div>
              </>}

              {tab === "calc" && <>
                <SecHead n="5" title={t.calcTitle} sub={t.calcSub} />

                {/* 사이트 목록 */}
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{t.sitesSection}</div>
                {sites.map((s, si) => {
                  const row = PC.siteRows[si];
                  return (
                    <div key={s.id} className="border border-gray-200 rounded-xl p-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <input value={s.name} onChange={e => setSites(sites.map((x,i) => i===si ? {...x, name:e.target.value} : x))}
                          className="text-sm font-semibold border-b border-gray-300 focus:outline-none focus:border-blue-500 w-28" />
                        <div className="flex gap-1">
                          <button onClick={() => setSites(sites.map((x,i) => i===si ? {...x, type: x.type==="area"?"length":"area", pathLen:0, width:40, height:35} : x))}
                            className={`text-xs px-2 py-1 rounded ${s.type==="area" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>{t.areaType}</button>
                          <button onClick={() => setSites(sites.map((x,i) => i===si ? {...x, type: x.type==="length"?"area":"length", pathLen:0, width:40, height:35} : x))}
                            className={`text-xs px-2 py-1 rounded ${s.type==="length" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>{t.lengthType}</button>
                          {sites.length > 1 && <button onClick={() => setSites(sites.filter((_,i)=>i!==si))} className="text-xs text-red-400 hover:text-red-600 ml-1">{t.removeSite}</button>}
                        </div>
                      </div>
                      {s.type === "length" ? (
                        <div className="flex items-center gap-2 text-xs mb-2">
                          <span className="text-gray-500 w-20">{t.pathLength}</span>
                          <Inp v={s.pathLen} set={v => setSites(sites.map((x,i)=>i===si?{...x,pathLen:v}:x))} min={0} max={10000} step={10} unit="m" />
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                          <div className="flex items-center gap-1"><span className="text-gray-500 w-8">{t.areaWidth}</span><Inp v={s.width} set={v => setSites(sites.map((x,i)=>i===si?{...x,width:v}:x))} min={0} max={1000} step={5} unit="m" /></div>
                          <span className="text-gray-300">×</span>
                          <div className="flex items-center gap-1"><span className="text-gray-500 w-8">{t.areaHeight}</span><Inp v={s.height} set={v => setSites(sites.map((x,i)=>i===si?{...x,height:v}:x))} min={0} max={1000} step={5} unit="m" /></div>
                          <span className="text-gray-400 text-xs">= {c(s.width*s.height)} m²</span>
                        </div>
                      )}
                      <div className="text-xs font-bold text-gray-400 mb-1">{t.difficultySection}</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        {Object.keys(s.diff).map((dk, di) => (
                          <div key={dk} className="flex items-center justify-between">
                            <span className="text-gray-500 text-xs">{t.diffLabels[di]}</span>
                            <Inp v={s.diff[dk]} set={v => setSites(sites.map((x,i)=>i===si?{...x,diff:{...x.diff,[dk]:v}}:x))}
                              min={0} max={di===0||di===5?0.1:0.3} step={0.05} w="w-14" />
                          </div>
                        ))}
                      </div>
                      {row && <div className="mt-2 text-xs text-blue-600 font-semibold">
                        Converted: {row.converted.toFixed(1)} × DF {row.df.toFixed(2)} = Adj. {row.adjusted.toFixed(1)} → NRE {$c(row.nreAmt)}
                      </div>}
                    </div>
                  );
                })}
                <button onClick={() => setSites([...sites, {id:Date.now(), name:`Site ${sites.length+1}`, type:"area", pathLen:0, width:40, height:35,
                  diff:{outdoor:0,elevation:0,roadWidth:0.1,surface:0,complexity:0.1,paved:0,capacity:0.1}}])}
                  className="w-full border border-dashed border-blue-300 text-blue-500 text-xs py-2 rounded-lg hover:bg-blue-50 mb-3">{t.addSite}</button>

                {/* HW 구성 */}
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{t.hwSection}</div>
                <div className="mb-2">
                  {/* 헤더 */}
                  <div className="flex items-center gap-1 text-xs text-gray-400 font-semibold mb-1 px-1">
                    <span className="w-16 shrink-0">{t.hwBrand}</span>
                    <span className="flex-1 min-w-0">{t.hwName}</span>
                    <span className="w-20 shrink-0 text-right">{t.hwPriceLabel}</span>
                    <span className="w-14 shrink-0 text-right">EA</span>
                    <span className="w-4 shrink-0"/>
                  </div>
                  {/* 데이터 행 */}
                  {hwConfig.map((hw) => (
                    <div key={hw.id} className="flex items-center gap-1 py-1 border-b border-gray-100 last:border-0">
                      <input value={hw.brand}
                        onChange={e => setHwConfig(hwConfig.map(h => h.id===hw.id ? {...h, brand:e.target.value} : h))}
                        className="w-16 shrink-0 border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:border-blue-400 min-w-0" />
                      <input value={hw.label}
                        onChange={e => setHwConfig(hwConfig.map(h => h.id===hw.id ? {...h, label:e.target.value} : h))}
                        className="flex-1 min-w-0 border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:border-blue-400" />
                      <div className="w-20 shrink-0">
                        <Inp v={hw.price} set={v => setHwConfig(hwConfig.map(h => h.id===hw.id ? {...h, price:v} : h))}
                          min={0} max={500000} step={100} w="w-20" comma />
                      </div>
                      <div className="w-14 shrink-0 flex items-center gap-0.5">
                        <Inp v={hwCounts[hw.id]||0} set={v => setHwCounts({...hwCounts,[hw.id]:v})} min={0} max={500} step={1} w="w-12" />
                      </div>
                      <div className="w-4 shrink-0 text-center">
                        {hw.id.startsWith("custom_") ? (
                          <button onClick={() => { setHwConfig(hwConfig.filter(h=>h.id!==hw.id)); const nc={...hwCounts}; delete nc[hw.id]; setHwCounts(nc); }}
                            className="text-red-400 hover:text-red-600 text-xs leading-none">{t.removeHw}</button>
                        ) : <span/>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mb-3">
                  <button onClick={() => { const id=`custom_${Date.now()}`; setHwConfig([...hwConfig,{id,brand:"",label:"Custom HW",price:0}]); setHwCounts({...hwCounts,[id]:0}); }}
                    className="text-xs text-blue-500 border border-blue-200 rounded-lg px-2 py-1 hover:bg-blue-50">{t.addHwItem}</button>
                  <button onClick={() => { const def = { xt32:6, ot128:0, qt128:0, zt128:0, server:0, etc:6 }; setHwConfig(DEFAULT_HW_CONFIG); setHwCounts(def); saveCalcCache({ sites, hwConfig: DEFAULT_HW_CONFIG, hwCounts: def, annThruput }); }}
                    className="text-xs text-gray-400 border border-gray-200 rounded-lg px-2 py-1 hover:bg-gray-50">{t.resetHwDefault}</button>
                </div>
                {/* HW Config Presets */}
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{t.hwPresetSection}</div>
                <div className="flex gap-1 mb-2">
                  <input value={hwPresetName} onChange={e => setHwPresetName(e.target.value)} placeholder={t.hwPresetNamePh}
                    className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400" />
                  <button onClick={() => {
                    if (!hwPresetName.trim()) return;
                    const p = { id: String(Date.now()), name: hwPresetName.trim(), savedAt: new Date().toISOString(), config: hwConfig, counts: hwCounts };
                    const next = [...hwPresets, p]; setHwPresets(next); saveHwPresets(next); setHwPresetName("");
                  }} className="text-xs bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700">{t.saveHwPreset}</button>
                </div>
                {hwPresets.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-2">{t.noHwPresets}</div>
                ) : (
                  <div className="space-y-1 mb-3">
                    {hwPresets.map(p => (
                      <div key={p.id} className="flex items-center justify-between border border-gray-200 rounded-lg px-2 py-1.5">
                        <div>
                          <div className="text-xs font-semibold text-gray-700">{p.name}</div>
                          <div className="text-xs text-gray-400">{new Date(p.savedAt).toLocaleDateString()}</div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => { setHwConfig(p.config); setHwCounts(p.counts); }}
                            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">{t.loadHwConfig}</button>
                          <button onClick={() => { const next=hwPresets.filter(x=>x.id!==p.id); setHwPresets(next); saveHwPresets(next); }}
                            className="text-xs border border-red-200 text-red-500 px-2 py-1 rounded hover:bg-red-50">{t.deleteHwConfig}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Row label={t.annThroughput} hint={t.annThroughputHint}>
                  <Inp v={annThruput} set={setAnnThruput} min={0} max={2000000} step={10000} w="w-28" comma />
                </Row>

                {/* 결과 요약 */}
                <div className="mt-3 bg-indigo-50 rounded-lg p-3 text-xs">
                  <div className="font-bold text-indigo-800 mb-2">{t.nreResult}</div>
                  {PC.siteRows.map(r => <CR key={r.id} label={`${r.name} (adj.${r.adjusted.toFixed(1)})`} value={$c(r.nreAmt)} />)}
                  <CR label={t.devLicense} value={$c(DEV_LICENSE_AMT)} />
                  <CR label={t.hwResult} value={$c(PC.hwTotal)} col="text-blue-700" />
                  <div className="flex justify-between pt-1 border-t border-indigo-200 font-bold text-indigo-700 mt-1">
                    <span>Subtotal (NRE+HW+License)</span><span>{$c(PC.capexSub)}</span>
                  </div>
                </div>

                <div className="mt-2 bg-purple-50 rounded-lg p-3 text-xs">
                  <div className="font-bold text-purple-800 mb-2">{t.capexResult}</div>
                  <CR label={`+ Overhead (${capexOverhead}%)`} value={$c(PC.capexSub * capexOverhead / 100)} col="text-blue-500" />
                  <CR label={`+ Margin (${capexMargin}%)`} value={$c(PC.capexWithOH * capexMargin / 100)} col="text-orange-500" />
                  <CR label={`- Discount (${capexDiscount}%)`} value={`-${$c(PC.capexWithMgn * capexDiscount / 100)}`} col="text-green-600" />
                  <div className="flex justify-between pt-1 border-t border-purple-200 font-bold text-purple-800 mt-1 text-sm">
                    <span>{t.totalCapex}</span><span>{$c(PC.capexFinal)}</span>
                  </div>
                </div>

                <div className="mt-2 bg-blue-50 rounded-lg p-3 text-xs">
                  <div className="font-bold text-blue-800 mb-2">{t.opexResult} <span className="font-normal text-gray-400 ml-1">{t.vwLabel}: ×{PC.vw}</span></div>
                  <CR label={t.hwWarrantyCalc} value={$c(PC.hwWarranty)} />
                  <CR label={t.siteSupportCalc} value={$c(PC.siteSup)} />
                  <CR label={t.swUpdateCalc} value={$c(PC.swUpd)} />
                  <CR label={t.swLicenseCalc} value={$c(PC.swLicense)} />
                  <CR label={t.overhaulCalc} value={$c(PC.overhaulA)} />
                  <CR label={t.opexDirectCalc} value={$c(PC.opexDirect)} col="text-gray-700" />
                  <CR label={`+ OH(${capexOverhead}%) + Margin(${capexMargin}%)`} value={$c(PC.opexFinal - PC.opexDirect)} col="text-orange-500" />
                  <div className="flex justify-between pt-1 border-t border-blue-200 font-bold text-blue-800 mt-1 text-sm">
                    <span>{t.annSRTotal}</span><span>{$c(PC.opexFinal)}</span>
                  </div>
                </div>

                <button onClick={applyPricingCalc}
                  className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-sm transition-colors">
                  {t.applyBtn}
                </button>
              </>}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KPI label={t.backCalcUPHkpi} value={`${R.uph.toFixed(1)}/h`}         sub={t.reqUnitsHr} />
            <KPI label={t.cycleTimeKpi}   value={`${R.cycleT.toFixed(0)} ${t.min}`} sub={t.stepTotal} />
            <KPI label={t.srDrivers}      value={c(R.drvTot)}                      sub={t.srPerShift(c(R.drvPS), nShifts, srRatio)} hi />
            <KPI label={t.breakEven}      value={R.bep}                             sub={t.cumBEPsub} hi />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="font-bold text-gray-700 mb-1 text-sm">{t.annualCostTitle}</div>
            <div className="text-xs text-gray-400 mb-3">{t.annualCostSub.replace("{srRatio}", srRatio).replace("{capex}", $M(capex))}</div>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={R.chart} margin={{ top:4, right:8, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{ fontSize:11 }} />
                <YAxis tickFormatter={v => `$${(v/1e6).toFixed(1)}M`} tick={{ fontSize:10 }} width={55} />
                <Tooltip formatter={v => [`$${c(v)}`, ""]} />
                <Legend wrapperStyle={{ fontSize:11 }} />
                <Bar dataKey="Labor Baseline"  name={lbl.laborBaseline} fill="#ef4444" />
                <Bar dataKey="Remaining Labor" name={lbl.remaining}     fill="#f97316" stackId="after" />
                <Bar dataKey="SR OPEX"         name={lbl.srOpex}        fill="#3b82f6" stackId="after" />
                <Bar dataKey="SR Depreciation" name={lbl.srDepr}        fill="#93c5fd" stackId="after" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="font-bold text-gray-700 mb-1 text-sm">{t.cumCostTitle}</div>
            <div className="text-xs text-gray-400 mb-3">{t.cumCostSub.replace("{life}", life)}</div>
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={R.chart} margin={{ top:4, right:8, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{ fontSize:11 }} />
                <YAxis tickFormatter={v => `$${(v/1e6).toFixed(1)}M`} tick={{ fontSize:10 }} width={55} />
                <Tooltip formatter={v => [`$${c(v)}`, ""]} />
                <Legend wrapperStyle={{ fontSize:11 }} />
                <Line type="monotone" dataKey="Cum. Labor Baseline" name={lbl.cumBaseline} stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Cum. After SR"       name={lbl.cumAfterSR}  stroke="#f97316" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="savings" name={lbl.cumSavings} stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={{ r:3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="font-bold text-gray-700 mb-3 text-sm">{t.tableTitle}</div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]" style={{minWidth:"580px"}}>
                <thead>
                  <tr className="bg-gray-50">
                    {t.tableHeaders.map(h => <th key={h} className="text-right first:text-left px-2 py-1.5 font-semibold text-gray-600 whitespace-nowrap">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {R.chart.map((r, i) => (
                    <tr key={i} className={`border-t border-gray-100 ${r.savings > 0 ? "bg-green-50" : ""}`}>
                      <td className="px-2 py-1.5 font-medium">{r.year}</td>
                      <td className="px-2 py-1.5 text-right text-red-400 whitespace-nowrap">${c(r["Labor Baseline"])}</td>
                      <td className="px-2 py-1.5 text-right text-orange-500 whitespace-nowrap">${c(r["Remaining Labor"])}</td>
                      <td className="px-2 py-1.5 text-right text-blue-500 whitespace-nowrap">${c(r["SR OPEX"])}</td>
                      <td className="px-2 py-1.5 text-right text-blue-300 whitespace-nowrap">${c(r["SR Depreciation"])}</td>
                      <td className="px-2 py-1.5 text-right text-blue-800 font-semibold whitespace-nowrap">${c(r["SR Total"])}</td>
                      <td className={`px-2 py-1.5 text-right font-semibold whitespace-nowrap ${r.savings > 0 ? "text-green-600" : "text-gray-400"}`}>
                        {r.savings >= 0 ? `+$${c(r.savings)}` : `-$${c(Math.abs(r.savings))}`}
                      </td>
                      <td className={`px-2 py-1.5 text-right whitespace-nowrap ${r.savings > 0 ? "text-green-600" : "text-gray-400"}`}>
                        {r.savings > 0 ? `${((r.savings / capex) * 100).toFixed(0)}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <KPI label={`${projYrs}${t.netSavings}`} value={R.finSav > 0 ? $M(R.finSav) : t.negative} sub={t.afterSRCost} hi={R.finSav > 0} />
            <KPI label={t.totalROI} value={R.finSav > 0 ? `${c(R.roiPct, 0)}%` : "—"} sub={`${t.vsCapex} ${projYrs} ${t.yrs}`} />
            <KPI label={t.maxAnnSavings} value={$M(R.annLaborBaseline - R.annSRTot)} sub={t.laborMinusSR} />
          </div>

          {/* Analytics Deep Dive */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="font-bold text-gray-700 mb-4 text-sm">{t.analyticsTitle}</div>
            <div className="grid grid-cols-2 gap-6">
              {/* Doughnut 1: CAPEX Breakdown */}
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-2 text-center">{t.capexPieTitle}</div>
                <div style={{height:180}}>
                  <Doughnut data={{
                    labels: ["HW", "NRE", "Installation", "Other", "Overhead", "Margin"],
                    datasets: [{ data: [
                      Math.max(0, capexHW),
                      Math.max(0, capexNRE),
                      Math.max(0, capexInst),
                      Math.max(0, capexOther),
                      Math.max(0, capexBase * capexOverhead / 100),
                      Math.max(0, capexAfterOverhead * capexMargin / 100),
                    ], backgroundColor: ["#3b82f6","#8b5cf6","#06b6d4","#f59e0b","#10b981","#f97316"],
                    borderWidth: 1, hoverOffset: 4 }],
                  }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position:"right", labels:{ font:{size:10}, boxWidth:12 } }, tooltip: { callbacks: { label: ctx => ` $${c(ctx.raw)}` } } } }} />
                </div>
              </div>
              {/* Doughnut 2: Annual Cost Mix */}
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-2 text-center">{t.costPieTitle}</div>
                <div style={{height:180}}>
                  <Doughnut data={{
                    labels: ["Remaining Labor","SR OPEX","SR Depreciation","Labor Saved"],
                    datasets: [{ data: [
                      Math.max(0, R.chart[0]?.["Remaining Labor"] || 0),
                      Math.max(0, R.chart[0]?.["SR OPEX"] || 0),
                      Math.max(0, R.chart[0]?.["SR Depreciation"] || 0),
                      Math.max(0, (R.chart[0]?.["Labor Baseline"] || 0) - (R.chart[0]?.["Remaining Labor"] || 0)),
                    ], backgroundColor: ["#f97316","#3b82f6","#93c5fd","#10b981"],
                    borderWidth: 1, hoverOffset: 4 }],
                  }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position:"right", labels:{ font:{size:10}, boxWidth:12 } }, tooltip: { callbacks: { label: ctx => ` $${c(ctx.raw)}` } } } }} />
                </div>
              </div>
              {/* Area Chart: Savings trajectory */}
              <div className="col-span-2">
                <div className="text-xs font-semibold text-gray-500 mb-2">{t.cumSavingsTrajectory}</div>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={R.chart} margin={{top:4,right:8,left:0,bottom:0}}>
                    <defs>
                      <linearGradient id="savGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                    <XAxis dataKey="year" tick={{fontSize:10}}/>
                    <YAxis tickFormatter={v=>`$${(v/1e6).toFixed(1)}M`} tick={{fontSize:10}} width={52}/>
                    <Tooltip formatter={v=>[`$${c(v)}`,"Cum. Savings"]}/>
                    <Area type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2} fill="url(#savGrad)" dot={false}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* Radar: ROI KPIs */}
              <div className="col-span-2">
                <div className="text-xs font-semibold text-gray-500 mb-2 text-center">{t.savingsRadarTitle}</div>
                <div style={{height:200}}>
                  <Radar data={{
                    labels: lang==="ko"
                      ? ["ROI %","BEP 속도","인건비절감%","OPEX 효율","1년차절감%","커버리지%"]
                      : ["ROI %","BEP Speed","Labor Save%","OPEX Efficiency","Yr1 Savings%","Coverage%"],
                    datasets: [{
                      label: lang==="ko" ? "ROI 지표" : "ROI Metrics",
                      data: [
                        Math.min(100, Math.max(0, R.roiPct / 3)),
                        R.bep === "N/A" ? 0 : Math.min(100, Math.max(0, (projYrs - parseInt(R.bep.replace("Y","")) + 1) / projYrs * 100)),
                        Math.min(100, Math.max(0, (1 - R.annLaborRemaining / Math.max(1,R.annLaborBaseline)) * 100)),
                        Math.min(100, Math.max(0, capex > 0 ? (1 - R.annOpex / Math.max(1,capex) * life) * 100 : 0)),
                        Math.min(100, Math.max(0, R.yr1Savings > 0 ? Math.min(R.yr1Savings / Math.max(1,R.annLaborBaseline) * 200, 100) : 0)),
                        Math.min(100, srRatio),
                      ],
                      backgroundColor: "rgba(59,130,246,0.15)", borderColor:"#3b82f6", pointBackgroundColor:"#3b82f6",
                    }],
                  }} options={{ responsive:true, maintainAspectRatio:false, scales:{ r:{ min:0, max:100, ticks:{stepSize:25,font:{size:9}}, pointLabels:{font:{size:10}} } }, plugins:{ legend:{display:false} } }} />
                </div>
              </div>
              {/* Horizontal bar: year-by-year savings */}
              <div className="col-span-2">
                <div className="text-xs font-semibold text-gray-500 mb-2">{t.annSavingsByYear}</div>
                <div style={{height: Math.max(120, R.chart.length * 28)}}>
                  <CBar data={{
                    labels: R.chart.map(r=>r.year),
                    datasets: [{
                      label: lang==="ko" ? "연간 절감액" : "Annual Savings",
                      data: R.chart.map(r => r["Labor Baseline"] - r["Remaining Labor"] - r["SR OPEX"] - r["SR Depreciation"]),
                      backgroundColor: R.chart.map(r => (r["Labor Baseline"] - r["Remaining Labor"] - r["SR OPEX"] - r["SR Depreciation"]) > 0 ? "#10b981" : "#ef4444"),
                      borderRadius: 4,
                    }],
                  }} options={{ indexAxis:"y", responsive:true, maintainAspectRatio:false,
                    plugins:{ legend:{display:false}, tooltip:{callbacks:{label: ctx=>`$${c(ctx.raw)}`}} },
                    scales:{ x:{ ticks:{callback:v=>`$${(v/1e6).toFixed(1)}M`,font:{size:10}}, grid:{color:"#f3f4f6"} }, y:{ticks:{font:{size:10}}} }
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}