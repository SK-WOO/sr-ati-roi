import { useState, useMemo, useEffect, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

// ── Google Auth ────────────────────────────────────────
const CLIENT_ID = "318386102464-2bavuh812hpk4gsegb5tkvrsnhartsm9.apps.googleusercontent.com";
const ALLOWED_DOMAIN = "seoulrobotics.com";

function useGoogleAuth() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        hd: ALLOWED_DOMAIN,
        callback: (res) => {
          try {
            const p = JSON.parse(atob(res.credential.split(".")[1]));
            if (!p.email?.endsWith(`@${ALLOWED_DOMAIN}`)) return;
            setUser({ name: p.name, email: p.email, picture: p.picture });
          } catch {}
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
  };
  return { user, ready, logout };
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
    tabs: ["📦 Production", "🚗 Transport", "👷 Workforce", "🤖 SR Pricing"],
    tabIds: ["prod", "trans", "work", "sr"],
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
    tabs: ["📦 생산", "🚗 운송", "👷 인력", "🤖 SR 가격"],
    tabIds: ["prod", "trans", "work", "sr"],
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
  }
};

const STORAGE_KEY = "sr-ati-presets-v3";
function loadPresets() { try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; } catch { return []; } }
function saveToStorage(list) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); return true; } catch { return false; } }
const clamp = (v, min, max, fallback) => { const n = Number(v); return (isNaN(n) || !isFinite(n)) ? fallback : Math.min(Math.max(n, min), max); };

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
    <div className="flex items-center gap-1">
      <input type="text" inputMode="decimal"
        value={focused ? draft : formatted}
        onFocus={() => { setFocused(true); setDraft(String(v)); }}
        onChange={e => { const s = e.target.value.replace(/,/g, ""); setDraft(s); const n = parseFloat(s); if (!isNaN(n)) set(n); }}
        onBlur={() => { setFocused(false); const n = parseFloat(draft.replace(/,/g, "")); if (!isNaN(n)) set(Math.min(Math.max(n, min), max)); else set(v); }}
        className={`${w} border border-gray-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:border-blue-500`}
      />
      {unit && <span className="text-xs text-gray-400 w-14">{unit}</span>}
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
    <div className="flex items-center justify-between py-2 border-b border-gray-100 gap-2">
      <div className="flex-1"><div className="text-sm font-medium text-gray-700">{label}</div>{hint && <div className="text-xs text-gray-400">{hint}</div>}</div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function KPI({ label, value, sub, hi }) {
  return (
    <div className={`rounded-xl p-4 ${hi ? "bg-blue-600 text-white" : "bg-gray-50"}`}>
      <div className={`text-xs mb-1 ${hi ? "text-blue-200" : "text-gray-500"}`}>{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className={`text-xs mt-1 ${hi ? "text-blue-200" : "text-gray-400"}`}>{sub}</div>}
    </div>
  );
}

function CR({ label, value, col = "text-gray-600" }) {
  return (
    <div className="flex justify-between py-1 border-b border-gray-100 text-xs">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold ${col}`}>{value}</span>
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
      <div className="bg-white rounded-2xl shadow-xl p-6 w-80 space-y-4 max-h-[90vh] overflow-y-auto">
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

function PresetPanel({ presets, onLoad, onDelete, onClose, t }) {
  const [search, setSearch] = useState("");
  const filtered = presets.filter(p => [p.brand, p.country, p.plant].join(" ").toLowerCase().includes(search.toLowerCase()));
  const grouped = filtered.reduce((acc, p) => {
    const origIdx = presets.findIndex(op => op.savedAt === p.savedAt && op.plant === p.plant);
    (acc[p.brand] = acc[p.brand] || []).push({ ...p, _idx: origIdx });
    return acc;
  }, {});
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-96 max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="font-bold text-gray-800">{t.factoryPresets}</div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
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
                        <button onClick={() => onDelete(p._idx)} className="text-xs border border-red-200 text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 whitespace-nowrap">{t.delete}</button>
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

export default function App() {
  // ── Google Auth ──
  const { user: googleUser, ready: gsiReady, logout: googleLogout } = useGoogleAuth();

  const [lang, setLang] = useState("en");
  const t = T[lang];

  const [presets, setPresets] = useState(() => loadPresets());
  const [showSave, setShowSave] = useState(false);
  const [showList, setShowList] = useState(false);
  const [loadedName, setLoadedName] = useState(null);
  const [loadedIdx, setLoadedIdx] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2500); };
  const savePresets = (list) => { setPresets(list); if (!saveToStorage(list)) showToast(t.storageFail, false); };

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

  const cd = COUNTRIES[cKey];
  const capexBase = capexHW + capexNRE + capexInst + capexOther;
  const capex = capexBase * (1 + capexMargin / 100);

  const currentParams = () => ({
    cKey, regDays, holDays, regHrs, otHrs, nShifts, capa, yld, srRatio,
    dist, spd, tPre, tPark, tWlk1, tHdwy, tRide, tWlk2, tOvhd,
    wType, discount, wageMode, hrly, hpw, wpy, annWage, srch, infl,
    capexHW, capexNRE, capexInst, capexOther, capexMargin, life,
    opexMode, opexPM, opexArea, opexPerM2, srGrw, projYrs,
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
    setLoadedName(`${preset.brand} · ${preset.country} · ${preset.plant}`);
    setLoadedIdx(preset._idx);
    setShowList(false);
  };

  const handleCountry = (key) => {
    const co = COUNTRIES[key];
    setCKey(key); setAnnWage(co.avgWage); setSrch(co.surcharge); setInfl(co.inflation); setHolDays(co.holidays);
  };

  const handleUpdatePreset = () => {
    if (loadedIdx === null || loadedIdx < 0) { showToast(t.noPresetLoaded, false); return; }
    const updated = [...presets];
    updated[loadedIdx] = { ...updated[loadedIdx], params: currentParams(), savedAt: new Date().toISOString() };
    savePresets(updated);
    showToast(t.updated(loadedName));
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
    const annOpex = opexMode === "move" ? srCapa * opexPM : opexArea * opexPerM2 * 12;
    const annSRTot = annDepr + annOpex;
    const inflR = infl / 100, srGrwR = srGrw / 100;
    let cumL = 0, cumS = 0;
    const chart = Array.from({ length: projYrs }, (_, i) => {
      const y = i + 1;
      const laborBaseline  = annLaborBaseline  * Math.pow(1 + inflR, i);
      const laborRemaining = annLaborRemaining * Math.pow(1 + inflR, i);
      const opex = annOpex * Math.pow(1 + srGrwR, i);
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
      wType, discount, wageMode, hrly, hpw, wpy, annWage, srch, infl,
      capex, life, opexMode, opexPM, opexArea, opexPerM2, srGrw, projYrs]);

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
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold ${toast.ok ? "bg-green-600" : "bg-red-500"}`}>
          {toast.msg}
        </div>
      )}
      {showSave && (
        <PresetModal params={currentParams()} t={t}
          onSave={p => {
            const next = [...presets, p];
            savePresets(next);
            setShowSave(false);
            setLoadedName(`${p.brand} · ${p.country} · ${p.plant}`);
            setLoadedIdx(next.length - 1);
            showToast(t.presetSaved);
          }}
          onClose={() => setShowSave(false)}
        />
      )}
      {showList && (
        <PresetPanel presets={presets} t={t}
          onLoad={loadPreset}
          onDelete={idx => savePresets(presets.filter((_, i) => i !== idx))}
          onClose={() => setShowList(false)}
        />
      )}

      {/* Header */}
      <div className="bg-blue-700 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3">
          <div className="text-2xl font-black">SR</div>
          <div className="border-l border-blue-400 pl-3">
            <div className="font-bold text-lg">{t.title}</div>
            <div className="text-blue-200 text-xs">{t.subtitle}</div>
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
              🏭 {t.presets} {presets.length > 0 && <span className="bg-blue-500 text-white text-xs rounded-full px-1.5">{presets.length}</span>}
            </button>
            <button onClick={() => setShowSave(true)} className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
              💾 {t.savePreset}
            </button>
            {/* 유저 정보 + 로그아웃 */}
            <div className="flex items-center gap-2 bg-blue-800 rounded-lg px-3 py-1.5">
              <img src={googleUser.picture} alt="" style={{ width: 22, height: 22, borderRadius: "50%" }} />
              <span className="text-xs text-blue-200 hidden sm:block">{googleUser.name}</span>
              <button onClick={googleLogout} className="text-xs text-blue-300 hover:text-white border border-blue-600 rounded px-2 py-0.5 ml-1">{t.logout}</button>
            </div>
          </div>
        </div>
        {loadedName && (
          <div className="max-w-6xl mx-auto mt-2">
            <div className="text-xs bg-blue-800 rounded-lg px-3 py-1.5 inline-flex flex-wrap items-center gap-2">
              <span className="text-blue-300">{t.loaded}</span>
              <span className="text-white font-semibold">{loadedName}</span>
              <button onClick={handleUpdatePreset} className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-0.5 rounded ml-1">{t.update}</button>
              <button onClick={() => { setLoadedName(null); setLoadedIdx(null); }} className="text-blue-400 hover:text-white ml-1">✕</button>
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
                  <Inp v={annWage} set={setAnnWage} min={1000} max={500000} step={1000} w="w-20" comma />
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-2">
                <div className="text-gray-500 mb-1">{t.wageInflation}</div>
                <div className="flex items-center justify-center gap-0.5">
                  <Inp v={infl} set={setInfl} min={0} max={30} step={0.1} w="w-10" />
                  <span className="text-orange-600 font-bold text-xs">%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-200">
              {t.tabs.map((lbl2, i) => (
                <button key={t.tabIds[i]} onClick={() => setTab(t.tabIds[i])}
                  className={`flex-1 text-xs py-2 font-medium transition-colors ${tab === t.tabIds[i] ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
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
                  <Row label={t.hpw}><Inp v={hpw} set={setHpw} min={10} max={80} unit="h" /></Row>
                  <Row label={t.wpy}><Inp v={wpy} set={setWpy} min={10} max={52} unit={t.wks} /></Row>
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
                <div className="mt-2 bg-purple-50 rounded-lg p-3 text-xs">
                  <CR label="HW"             value={$c(capexHW)} />
                  <CR label="NRE"            value={$c(capexNRE)} />
                  <CR label={t.installation} value={$c(capexInst)} />
                  <CR label={t.other}        value={$c(capexOther)} />
                  <CR label={t.subtotal}     value={$c(capexBase)} col="text-gray-700" />
                  <CR label={`${t.margin} (${capexMargin}%)`} value={$c(capexBase * capexMargin / 100)} col="text-orange-500" />
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
                    <Row label={t.opexPerM2}><Inp v={opexPerM2} set={setOpexPerM2} min={0.1} max={500} step={0.5} unit={t.perM2Mo} /></Row>
                  </>
                }
                <Row label={t.srOpexGrowth}><Inp v={srGrw} set={setSrGrw} min={0} max={20} step={0.5} unit={t.pctYr} /></Row>
                <Row label={t.roiPeriod}><Inp v={projYrs} set={setProjYrs} min={1} max={20} unit={t.yrsUnit} /></Row>
                <div className="mt-3 bg-purple-50 rounded-lg p-3 grid grid-cols-2 gap-2 text-center text-xs">
                  <div><div className="text-gray-500">{t.annDepr}</div><div className="font-bold text-purple-700">{$c(R.annDepr)}</div></div>
                  <div>
                    <div className="text-gray-500">{t.annOpex}</div>
                    <div className="font-bold text-purple-700">{$c(R.annOpex)}</div>
                    <div className="text-gray-400">{opexMode === "move" ? t.moves(c(Math.round(R.srCapa)), opexPM) : t.areaCalc(c(opexArea), opexPerM2)}</div>
                  </div>
                  <div><div className="text-gray-500">{t.annSRTotal}</div><div className="font-bold text-purple-800 text-base">{$c(R.annSRTot)}</div></div>
                  <div><div className="text-gray-500">{t.yr1Savings}</div><div className={`font-bold text-base ${R.yr1Savings > 0 ? "text-green-700" : "text-red-500"}`}>{$c(R.yr1Savings)}</div></div>
                  <div className="col-span-2"><div className="text-gray-500">{t.cumBEP}</div><div className="font-bold text-purple-700 text-xl">{R.bep}</div></div>
                </div>
              </>}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KPI label={t.backCalcUPHkpi} value={`${R.uph.toFixed(1)}/h`}         sub={t.reqUnitsHr} />
            <KPI label={t.cycleTimeKpi}   value={`${R.cycleT.toFixed(0)} ${t.min}`} sub={t.stepTotal} />
            <KPI label={t.srDrivers}      value={c(R.drvTot)}                      sub={t.srPerShift(c(R.drvPS), nShifts, srRatio)} hi />
            <KPI label={t.breakEven}      value={R.bep}                             sub={t.cumBEPsub} hi />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="font-bold text-gray-700 mb-1 text-sm">{t.annualCostTitle}</div>
            <div className="text-xs text-gray-400 mb-3">{t.annualCostSub.replace("{srRatio}", srRatio).replace("{capex}", $c(capex))}</div>
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
            <div className="overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    {t.tableHeaders.map(h => <th key={h} className="text-right first:text-left p-2 font-semibold text-gray-600 whitespace-nowrap">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {R.chart.map((r, i) => (
                    <tr key={i} className={`border-t border-gray-100 ${r.savings > 0 ? "bg-green-50" : ""}`}>
                      <td className="p-2 font-medium">{r.year}</td>
                      <td className="p-2 text-right text-red-400">${c(r["Labor Baseline"])}</td>
                      <td className="p-2 text-right text-orange-500">${c(r["Remaining Labor"])}</td>
                      <td className="p-2 text-right text-blue-500">${c(r["SR OPEX"])}</td>
                      <td className="p-2 text-right text-blue-300">${c(r["SR Depreciation"])}</td>
                      <td className="p-2 text-right text-blue-800 font-semibold">${c(r["SR Total"])}</td>
                      <td className={`p-2 text-right font-semibold ${r.savings > 0 ? "text-green-600" : "text-gray-400"}`}>
                        {r.savings >= 0 ? `+$${c(r.savings)}` : `-$${c(Math.abs(r.savings))}`}
                      </td>
                      <td className={`p-2 text-right ${r.savings > 0 ? "text-green-600" : "text-gray-400"}`}>
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
        </div>
      </div>
    </div>
  );
}