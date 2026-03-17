import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

import useGoogleAuth from "./hooks/useGoogleAuth";
import LoginScreen from "./components/LoginScreen";
import { Inp, SecHead, Row, KPI, CR } from "./components/common";
import PresetModal from "./components/modals/PresetModal";
import PresetPanel from "./components/modals/PresetPanel";
import ChangelogModal from "./components/modals/ChangelogModal";
import HelpModal from "./components/modals/HelpModal";
import ScenarioModal from "./components/modals/ScenarioModal";
import ReportModal from "./components/modals/ReportModal";
import { VERSION, BUILD_DATE, DEFAULT_HW_CONFIG, DEFAULT_LABOR, NRE_BASE, DEV_LICENSE_AMT, COUNTRIES } from "./constants";
import T from "./i18n";
import { clamp, c, $c, $M } from "./utils/format";
import { loadPresets, saveToStorage, loadHwPresets, saveHwPresets, loadCalcCache, saveCalcCache } from "./utils/storage";
import { sheetsLoad, sheetsAppend, sheetsUpdateRow, sheetsDeleteRow } from "./utils/sheets";
import { calcOpexArea } from "./utils/calc";

export default function App() {
  // ── Google Auth ──
  const { user: googleUser, ready: gsiReady, logout: googleLogout, accessToken, driveToken, requestDriveToken, requestSheetsToken } = useGoogleAuth();

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

  const showToast = useCallback((msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2500); }, []);
  const tRef = useRef(t);
  useEffect(() => { tRef.current = t; });

  // Sheets 연동: accessToken 확보되면 로드
  useEffect(() => {
    if (!accessToken) return;
    setSheetsLoading(true);
    sheetsLoad(accessToken)
      .then(list => { setPresets(list); saveToStorage(list); })
      .catch((e) => showToast(`${tRef.current.sheetsLoadFail} (HTTP ${e.message})`, false))
      .finally(() => setSheetsLoading(false));
  }, [accessToken, showToast]);

  // Sheets 호출 시 401 만료 → 자동 재인증 후 1회 재시도
  const sheetsWithRetry = async (fn) => {
    try { return await fn(accessToken); }
    catch (e) {
      if (!e.message.startsWith("401")) throw e;
      showToast(tRef.current.sheetsTokenFail, true);
      const newTok = await requestSheetsToken();
      if (!newTok) throw e;
      return await fn(newTok);
    }
  };

  const reloadFromSheets = async () => {
    if (!accessToken) return;
    setSheetsLoading(true);
    try {
      const list = await sheetsWithRetry(tok => sheetsLoad(tok));
      setPresets(list); saveToStorage(list);
    }
    catch { showToast(t.sheetsRefreshFail, false); }
    finally { setSheetsLoading(false); }
  };

  const handleSavePreset = async (p) => {
    const newPreset = { ...p, id: String(Date.now()) };
    if (accessToken) {
      try {
        await sheetsWithRetry(tok => sheetsAppend(tok, newPreset));
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
        await sheetsWithRetry(tok => sheetsDeleteRow(tok, preset._rowIndex));
        await reloadFromSheets();
      } catch { showToast(t.storageFail, false); }
    } else {
      const next = presets.filter(p => p.id !== preset.id);
      setPresets(next); saveToStorage(next);
    }
  };

  const [cKey, setCKey] = useState("US");
  const [regDays, setRegDays] = useState(250);
  const [holDays, setHolDays] = useState(18);
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
  const [overhaulRate, setOverhaulRate] = useState(50);
  const [overhaulCycle, setOverhaulCycle] = useState(5);
  const [opexDiscount1, setOpexDiscount1] = useState(30);
  const [opexDiscountStep, setOpexDiscountStep] = useState(3);
  const [opexSwLicense, setOpexSwLicense] = useState(0);

  // ── Pricing Calc tab state (캐시에서 복원 — lazy initializer로 최초 1회만 읽음) ──
  const [laborInputs, setLaborInputs] = useState(() => {
    const cached = loadCalcCache()?.laborInputs;
    if (Array.isArray(cached) && cached.length > 0) return cached;
    return DEFAULT_LABOR;
  });
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
  const [scenarioA, setScenarioA] = useState(null);
  const [scenarioB, setScenarioB] = useState(null);
  const [showScenario, setShowScenario] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [sensitivityCapexStep, setSensitivityCapexStep] = useState(10);
  const [sensitivityLaborStep, setSensitivityLaborStep] = useState(10);
  const [cacheSaveStatus, setCacheSaveStatus] = useState(null); // null | 'saved' | 'quota'
  const cacheSaveTimerRef = useRef(null);

  // Pricing Calc 상태 변경 시 자동 캐시 저장
  useEffect(() => {
    const result = saveCalcCache({ sites, hwConfig, hwCounts, annThruput, laborInputs });
    if (cacheSaveTimerRef.current) clearTimeout(cacheSaveTimerRef.current);
    if (result === "quota") {
      setCacheSaveStatus("quota");
      showToast(tRef.current.quotaExceededWarn, false);
    } else {
      setCacheSaveStatus("saved");
      cacheSaveTimerRef.current = setTimeout(() => setCacheSaveStatus(null), 2000);
    }
  }, [sites, hwConfig, hwCounts, annThruput, laborInputs]); // eslint-disable-line react-hooks/exhaustive-deps

  const cd = COUNTRIES[cKey];
  const capexBase = capexHW + capexNRE * diffFactor + capexInst + capexOther;
  const capexAfterOverhead = capexBase * (1 + capexOverhead / 100);
  const capexAfterMargin = capexAfterOverhead * (1 + capexMargin / 100);
  const capex = capexAfterMargin * (1 - capexDiscount / 100);

  const currentParams = () => ({
    cKey, regDays, holDays, regHrs, otHrs, nShifts, capa, yld, srRatio,
    dist, spd, tPre, tPark, tWlk1, tHdwy, tRide, tWlk2, tOvhd,
    wType, discount, wageMode, hrly, annWage, srch, infl,
    capexHW, capexNRE, capexInst, capexOther, capexMargin, life,
    opexMode, opexPM, opexArea, opexPerM2, srGrw, projYrs,
    capexOverhead, capexDiscount, diffFactor,
    hwWarrantyRate, supportPerM2, swUpdatePerM2, overhaulRate, overhaulCycle,
    opexDiscount1, opexDiscountStep, opexSwLicense,
    laborInputs,
  });

  const loadPreset = (preset) => {
    const p = preset.params;
    if (Object.keys(COUNTRIES).includes(p.cKey)) setCKey(p.cKey);
    setRegDays(clamp(p.regDays, 100, 300, 250));
    setHolDays(clamp(p.holDays, 0, 100, 18));
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
    setOverhaulRate(clamp(p.overhaulRate ?? 50, 0, 100, 50));
    setOverhaulCycle(clamp(p.overhaulCycle ?? 5, 1, 20, 5));
    setOpexDiscount1(clamp(p.opexDiscount1 ?? 30, 0, 80, 30));
    setOpexDiscountStep(clamp(p.opexDiscountStep ?? 3, 0, 20, 3));
    setOpexSwLicense(clamp(p.opexSwLicense ?? 0, 0, 5000000, 0));
    if (p.laborInputs) {
      if (Array.isArray(p.laborInputs) && p.laborInputs.length > 0) {
        setLaborInputs(p.laborInputs.map(r => ({
          id:    r.id    || String(Date.now() + Math.random()),
          label: r.label || "Engineer",
          rate:  clamp(r.rate ?? 0, 0, 9999999, 0),
          hc:    clamp(r.hc   ?? 0, 0, 200, 0),
          mm:    clamp(r.mm   ?? 0, 0, 60,  0),
        })));
      } else if (!Array.isArray(p.laborInputs)) {
        // legacy object format → convert to array
        const legacy = p.laborInputs;
        setLaborInputs(DEFAULT_LABOR.map(d => ({
          ...d,
          hc: clamp(legacy[d.id]?.hc ?? d.hc, 0, 200, d.hc),
          mm: clamp(legacy[d.id]?.mm ?? d.mm, 0, 60,  d.mm),
        })));
      }
    }
    setLoadedName(`${preset.brand} · ${preset.country} · ${preset.plant}`);
    setLoadedRowIndex(preset._rowIndex ?? null);
    setShowList(false);
  };

  const handleCountry = (key) => {
    const co = COUNTRIES[key];
    setCKey(key); setAnnWage(co.avgWage); setSrch(co.surcharge); setInfl(co.inflation);
  };

  const handleUpdatePreset = async () => {
    if (!loadedRowIndex) { showToast(t.noPresetLoaded, false); return; }
    const existing = presets.find(p => p._rowIndex === loadedRowIndex);
    if (!existing) { showToast(t.noPresetLoaded, false); return; }
    const updated = { ...existing, params: currentParams(), savedAt: new Date().toISOString() };
    if (accessToken) {
      try {
        await sheetsWithRetry(tok => sheetsUpdateRow(tok, loadedRowIndex, updated));
        await reloadFromSheets();
      } catch { showToast(t.storageFail, false); return; }
    } else {
      const next = presets.map(p => p._rowIndex === loadedRowIndex ? updated : p);
      setPresets(next); saveToStorage(next);
    }
    showToast(t.updated(loadedName));
  };

  const saveScenario = (slot) => {
    const snap = {
      label: loadedName || (lang === "ko" ? "시나리오" : "Scenario"),
      capexStr: `$${c(Math.round(capex))}`,
      bep: R.bep,
      roi: R.finSav > 0 ? `${c(R.roiPct, 0)}%` : "—",
      yr1: R.yr1Savings,
      finSav: R.finSav,
      annOpex: R.annOpex,
      annDepr: R.annDepr,
      annLaborBaseline: R.annLaborBaseline,
    };
    if (slot === "A") setScenarioA(snap);
    else setScenarioB(snap);
    showToast(lang === "ko" ? `✅ 시나리오 ${slot} 저장됨` : `✅ Scenario ${slot} saved`);
  };

  const downloadCSV = () => {
    const headers = ["Year","Labor Baseline","Remaining Labor","SR OPEX","SR Depr.","SR Total","Cum. Savings","ROI %"];
    const rows = R.chart.map(r => [
      r.year, r["Labor Baseline"], r["Remaining Labor"], r["SR OPEX"],
      r["SR Depreciation"], r["SR Total"], r.savings,
      r.savings > 0 ? ((r.savings / capex) * 100).toFixed(1) : "0",
    ]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SR-ROI_${(loadedName || "export").replace(/[^a-zA-Z0-9]/g,"_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const applyPricingCalc = () => {
    setCapexHW(Math.round(PC.hwTotal));
    setCapexNRE(Math.round(PC.totalNRE));
    setCapexInst(DEV_LICENSE_AMT);
    setCapexOther(0);
    setDiffFactor(1.0);
    setOpexMode("area");
    setOpexArea(Math.round(PC.totalArea));
    setOpexSwLicense(Math.round(PC.swLicense));
    setTab("sr");
    showToast(lang === "ko" ? "✅ SR Pricing 탭에 적용됨" : "✅ Applied to SR Pricing tab");
  };

  const R = useMemo(() => {
    const effDays = Math.max(1, regDays + holDays);
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
      annOpex = calcOpexArea({
        hwCost: capexHW, area: opexArea, hwWarrantyRate, supportPerM2, swUpdatePerM2,
        overhaulRate, overhaulCycle, swLicense: opexSwLicense,
        overhead: capexOverhead, margin: capexMargin,
      }).opexFinal;
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
      swUpdatePerM2, overhaulRate, overhaulCycle, opexDiscount1, opexDiscountStep, opexSwLicense]);

  const PC = useMemo(() => {
    // baseLaborNRE = Σ(HC × MM × rate) across all labor rows
    const baseLaborNRE = laborInputs.reduce((s, r) => s + r.hc * r.mm * r.rate, 0);

    const siteRowsRaw = sites.map(s => {
      const totalSize = s.type === "length" ? s.pathLen : s.width * s.height;
      const baseUnit  = NRE_BASE[s.type] ?? 1;
      const converted = totalSize / Math.max(1, baseUnit);
      const diffSum   = Object.values(s.diff).reduce((a,b) => a+b, 0);
      const df        = 1 + diffSum;
      const adjusted  = converted * df;
      return { ...s, totalSize, converted, df, adjusted, nreAmt: 0 };
    });

    // Distribute baseLaborNRE proportionally by adjusted size × DF
    const totalSizeAll = siteRowsRaw.reduce((s, r) => s + Math.max(r.totalSize, 1), 0);
    const siteRows = siteRowsRaw.map(r => ({
      ...r,
      nreAmt: baseLaborNRE * (Math.max(r.totalSize, 1) / totalSizeAll) * r.df,
    }));

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

    const opex = calcOpexArea({
      hwCost: hwTotal, area: totalArea, hwWarrantyRate, supportPerM2, swUpdatePerM2,
      overhaulRate, overhaulCycle, swLicense,
      overhead: capexOverhead, margin: capexMargin,
    });

    return {
      siteRows, totalNRE, totalArea, totalAdjusted, baseLaborNRE,
      hwTotal, capexSub, capexWithOH, capexWithMgn, capexFinal,
      vw, swLicense,
      hwWarranty: opex.hwWarranty, siteSup: opex.siteSup, swUpd: opex.swUpd,
      overhaulA: opex.overhaulAnn, opexDirect: opex.opexDirect, opexFinal: opex.opexFinal,
    };
  }, [sites, hwConfig, hwCounts, annThruput, capexOverhead, capexMargin, capexDiscount,
      hwWarrantyRate, supportPerM2, swUpdatePerM2, overhaulRate, overhaulCycle, laborInputs]);

  const sensitivityRows = useMemo(() => {
    const compute = (capexMod, laborMod) => {
      const modCapex = capex * capexMod;
      const modAnnDepr = modCapex / Math.max(1, life);
      let cumL = 0, cumS = 0, bep = "N/A";
      for (let i = 0; i < projYrs; i++) {
        const lb = R.annLaborBaseline * laborMod * Math.pow(1 + infl / 100, i);
        const lr = R.annLaborRemaining * laborMod * Math.pow(1 + infl / 100, i);
        const od = Math.max(0, opexDiscount1 - opexDiscountStep * i) / 100;
        const opex = R.annOpex * (1 - od) * Math.pow(1 + srGrw / 100, i);
        const depr = (i + 1) <= life ? modAnnDepr : 0;
        cumL += lb;
        cumS += lr + opex + depr;
        if (bep === "N/A" && cumL - cumS > 0) bep = `Y${i + 1}`;
      }
      const savings = cumL - cumS;
      const roi = modCapex > 0 ? (savings / modCapex) * 100 : 0;
      return { bep, roi: Math.round(roi), savings: Math.round(savings) };
    };
    const cs = sensitivityCapexStep / 100;
    const ls = sensitivityLaborStep / 100;
    return [
      { label: lang === "ko" ? `CAPEX −${sensitivityCapexStep * 2}%` : `CAPEX −${sensitivityCapexStep * 2}%`, ...compute(1 - cs * 2, 1.0), base: false },
      { label: lang === "ko" ? `CAPEX −${sensitivityCapexStep}%`     : `CAPEX −${sensitivityCapexStep}%`,     ...compute(1 - cs,     1.0), base: false },
      { label: lang === "ko" ? "▶ 기준" : "▶ Base",                                                           ...compute(1.0,        1.0), base: true  },
      { label: lang === "ko" ? `인건비 +${sensitivityLaborStep}%`     : `Labor +${sensitivityLaborStep}%`,     ...compute(1.0, 1 + ls),     base: false },
      { label: lang === "ko" ? `인건비 +${sensitivityLaborStep * 2}%` : `Labor +${sensitivityLaborStep * 2}%`, ...compute(1.0, 1 + ls * 2), base: false },
    ];
  }, [capex, life, projYrs, infl, srGrw, opexDiscount1, opexDiscountStep,
      R.annLaborBaseline, R.annLaborRemaining, R.annOpex, lang,
      sensitivityCapexStep, sensitivityLaborStep]);

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
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} lang={lang} t={t} />}
      {showScenario && <ScenarioModal onClose={() => setShowScenario(false)} A={scenarioA} B={scenarioB} lang={lang} c={c} $c={$c} />}
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
          driveToken={driveToken} requestDriveToken={requestDriveToken}
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
            <button onClick={() => setShowHelp(true)} title={lang === "ko" ? "기능 가이드" : "Feature Guide"}
              className="flex items-center justify-center w-8 h-8 bg-blue-800 hover:bg-blue-900 rounded-lg text-white text-sm font-bold">
              ?
            </button>
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
        <div className="max-w-6xl mx-auto mt-2 flex flex-wrap items-center gap-2">
          {cacheSaveStatus === "saved" && (
            <span className="text-xs text-green-300 bg-blue-800 rounded-lg px-2 py-1">{t.autoSaved}</span>
          )}
          {cacheSaveStatus === "quota" && (
            <span className="text-xs text-red-300 bg-blue-800 rounded-lg px-2 py-1">{t.quotaExceededWarn}</span>
          )}
          {loadedName && (
            <div className="text-xs bg-blue-800 rounded-lg px-3 py-1.5 inline-flex flex-wrap items-center gap-2">
              <span className="text-blue-300">{t.loaded}</span>
              <span className="text-white font-semibold">{loadedName}</span>
              <button onClick={handleUpdatePreset} className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded ml-1">{t.update}</button>
              <button onClick={() => { setLoadedName(null); setLoadedRowIndex(null); }} className="text-blue-400 hover:text-white ml-1">✕</button>
            </div>
          )}
        </div>
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
                    <Row label={t.overhaulRate} hint={t.overhaulRateHint}><Inp v={overhaulRate} set={setOverhaulRate} min={0} max={100} step={1} unit={t.pct} /></Row>
                    <Row label={t.overhaulCycle} hint={t.overhaulCycleHint}><Inp v={overhaulCycle} set={setOverhaulCycle} min={1} max={20} unit={t.yrsUnit} /></Row>
                    <Row label={t.opexSwLicenseLbl} hint={t.opexSwLicenseHint}><Inp v={opexSwLicense} set={setOpexSwLicense} min={0} max={5000000} step={1000} unit={t.dollar} w="w-28" comma /></Row>
                    {opexMode === "area" && (
                      <div className="mt-2 bg-blue-50 rounded-lg p-3 text-xs">
                        <div className="font-bold text-blue-800 mb-2">{t.opexBreakdown}</div>
                        <CR label={t.hwWarrantyLbl} value={$c(capexHW * hwWarrantyRate / 100)} />
                        <CR label={t.siteSupportLbl} value={$c(opexArea * supportPerM2)} />
                        <CR label={t.swUpdateLbl} value={$c(opexArea * swUpdatePerM2)} />
                        <CR label={t.overhaulLbl} value={$c((capexHW * overhaulRate / 100) / Math.max(1, overhaulCycle))} />
                        {opexSwLicense > 0 && <CR label={t.opexSwLicenseLbl} value={$c(opexSwLicense)} />}
                        <CR label={t.opexDirectLbl} value={$c(capexHW * hwWarrantyRate / 100 + opexArea * supportPerM2 + opexArea * swUpdatePerM2 + (capexHW * overhaulRate / 100) / Math.max(1, overhaulCycle) + opexSwLicense)} col="text-gray-700" />
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

                {/* NRE Labor Config */}
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
                  {lang === "ko" ? "🔧 NRE 인력 구성" : "🔧 NRE Labor Config"}
                </div>
                <div className="mb-2">
                  {/* 헤더 */}
                  <div className="flex items-center gap-1 text-xs text-gray-400 font-semibold mb-1 px-1">
                    <span className="flex-1 min-w-0">{lang === "ko" ? "직급/역할" : "Role / Level"}</span>
                    <span className="w-20 shrink-0 text-right">{lang === "ko" ? "단가($/월)" : "Rate($/mo)"}</span>
                    <span className="w-10 shrink-0 text-right">HC</span>
                    <span className="w-10 shrink-0 text-right">MM</span>
                    <span className="w-20 shrink-0 text-right">{lang === "ko" ? "소계" : "Subtotal"}</span>
                    <span className="w-4 shrink-0" />
                  </div>
                  {/* 데이터 행 */}
                  {laborInputs.map((row, ri) => (
                    <div key={row.id} className="flex items-center gap-1 py-1 border-b border-gray-100 last:border-0">
                      <input value={row.label}
                        onChange={e => setLaborInputs(li => li.map((r, i) => i === ri ? { ...r, label: e.target.value } : r))}
                        className="flex-1 min-w-0 border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:border-blue-400" />
                      <div className="w-20 shrink-0">
                        <Inp v={row.rate} set={v => setLaborInputs(li => li.map((r, i) => i === ri ? { ...r, rate: v } : r))}
                          min={0} max={9999999} step={100} w="w-20" comma />
                      </div>
                      <div className="w-10 shrink-0">
                        <Inp v={row.hc} set={v => setLaborInputs(li => li.map((r, i) => i === ri ? { ...r, hc: v } : r))}
                          min={0} max={200} step={1} w="w-10" />
                      </div>
                      <div className="w-10 shrink-0">
                        <Inp v={row.mm} set={v => setLaborInputs(li => li.map((r, i) => i === ri ? { ...r, mm: v } : r))}
                          min={0} max={60} step={1} w="w-10" />
                      </div>
                      <span className="w-20 shrink-0 text-right text-xs text-indigo-700 font-semibold">{$c(row.hc * row.mm * row.rate)}</span>
                      <div className="w-4 shrink-0 text-center">
                        <button onClick={() => setLaborInputs(li => li.filter((_, i) => i !== ri))}
                          className="text-red-400 hover:text-red-600 text-xs leading-none">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mb-3">
                  <button onClick={() => setLaborInputs(li => [...li, { id: `custom_${Date.now()}`, label: "Engineer", rate: 0, hc: 1, mm: 8 }])}
                    className="text-xs text-blue-500 border border-blue-200 rounded-lg px-2 py-1 hover:bg-blue-50">
                    {lang === "ko" ? "+ 행 추가" : "+ Add Row"}
                  </button>
                  <button onClick={() => setLaborInputs(DEFAULT_LABOR)}
                    className="text-xs text-gray-400 border border-gray-200 rounded-lg px-2 py-1 hover:bg-gray-50">
                    {lang === "ko" ? "기본값 초기화" : "Reset Defaults"}
                  </button>
                  <span className="ml-auto text-xs font-bold text-indigo-800 self-center">
                    {lang === "ko" ? "합계:" : "Total:"} {$c(PC.baseLaborNRE)}
                  </span>
                </div>

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
                  <button onClick={() => { const def = { xt32:6, ot128:0, qt128:0, zt128:0, server:0, etc:6 }; setHwConfig(DEFAULT_HW_CONFIG); setHwCounts(def); saveCalcCache({ sites, hwConfig: DEFAULT_HW_CONFIG, hwCounts: def, annThruput, laborInputs }); }}
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
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold text-gray-700 text-sm">{t.tableTitle}</div>
              <button onClick={downloadCSV} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-lg transition-colors">{t.csvExport}</button>
            </div>
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

          {/* Sensitivity Analysis */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="font-bold text-gray-700 text-sm">
                {lang === "ko" ? "📊 민감도 분석" : "📊 Sensitivity Analysis"}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>CAPEX</span>
                <div className="flex items-center gap-1">
                  <Inp v={sensitivityCapexStep} set={setSensitivityCapexStep} min={1} max={50} step={1} w="w-12" />
                  <span>%</span>
                </div>
                <span className="text-gray-300">|</span>
                <span>{lang === "ko" ? "인건비" : "Labor"}</span>
                <div className="flex items-center gap-1">
                  <Inp v={sensitivityLaborStep} set={setSensitivityLaborStep} min={1} max={50} step={1} w="w-12" />
                  <span>%</span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-2 py-1.5 font-semibold text-gray-500">{lang === "ko" ? "시나리오" : "Scenario"}</th>
                    <th className="text-center px-2 py-1.5 font-semibold text-gray-500">{lang === "ko" ? "손익분기점" : "Break-Even"}</th>
                    <th className="text-center px-2 py-1.5 font-semibold text-gray-500">ROI %</th>
                    <th className="text-right px-2 py-1.5 font-semibold text-gray-500">{lang === "ko" ? "누적 절감" : "Cum. Savings"}</th>
                  </tr>
                </thead>
                <tbody>
                  {sensitivityRows.map((row, i) => (
                    <tr key={i} className={`border-t border-gray-50 ${row.base ? "bg-blue-50 font-semibold" : ""}`}>
                      <td className={`px-2 py-1.5 ${row.base ? "text-blue-700" : "text-gray-600"}`}>{row.label}</td>
                      <td className={`text-center px-2 py-1.5 ${row.base ? "text-blue-700" : "text-gray-500"}`}>{row.bep}</td>
                      <td className={`text-center px-2 py-1.5 ${row.base ? "text-blue-700" : row.roi >= 0 ? "text-green-600" : "text-red-500"}`}>{row.roi}%</td>
                      <td className={`text-right px-2 py-1.5 ${row.savings >= 0 ? (row.base ? "text-blue-700" : "text-green-600") : "text-red-500"}`}>
                        {row.savings >= 0 ? `+$${c(row.savings)}` : `-$${c(Math.abs(row.savings))}`}
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

          {/* Scenario Save & Compare */}
          <div className="flex gap-2 justify-end">
            <button onClick={() => saveScenario("A")}
              className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
              💾 {lang === "ko" ? "시나리오 A 저장" : "Save as A"}{scenarioA && <span className="text-green-600">✓</span>}
            </button>
            <button onClick={() => saveScenario("B")}
              className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
              💾 {lang === "ko" ? "시나리오 B 저장" : "Save as B"}{scenarioB && <span className="text-green-600">✓</span>}
            </button>
            <button onClick={() => setShowScenario(true)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-3 py-1.5 rounded-lg transition-colors">
              📊 {lang === "ko" ? "비교" : "Compare"}
            </button>
          </div>

          {/* Analytics Deep Dive */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="font-bold text-gray-700 mb-4 text-sm">{t.analyticsTitle}</div>
            <div className="grid grid-cols-2 gap-6">
              {/* Pie 1: CAPEX Breakdown */}
              {(() => {
                const capexPieData = [
                  { name: "HW",           value: Math.max(0, capexHW) },
                  { name: "NRE",          value: Math.max(0, capexNRE) },
                  { name: "Installation", value: Math.max(0, capexInst) },
                  { name: "Other",        value: Math.max(0, capexOther) },
                  { name: "Overhead",     value: Math.max(0, capexBase * capexOverhead / 100) },
                  { name: "Margin",       value: Math.max(0, capexAfterOverhead * capexMargin / 100) },
                ];
                const capexColors = ["#3b82f6","#8b5cf6","#06b6d4","#f59e0b","#10b981","#f97316"];
                return (
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-2 text-center">{t.capexPieTitle}</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={capexPieData} cx="40%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={1}>
                          {capexPieData.map((_, i) => <Cell key={i} fill={capexColors[i]} />)}
                        </Pie>
                        <Tooltip formatter={(v) => [`$${c(v)}`, ""]} />
                        <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={10} wrapperStyle={{fontSize:10}} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}
              {/* Pie 2: Annual Cost Mix */}
              {(() => {
                const costPieData = [
                  { name: "Remaining Labor",  value: Math.max(0, R.chart[0]?.["Remaining Labor"] || 0) },
                  { name: "SR OPEX",          value: Math.max(0, R.chart[0]?.["SR OPEX"] || 0) },
                  { name: "SR Depreciation",  value: Math.max(0, R.chart[0]?.["SR Depreciation"] || 0) },
                  { name: "Labor Saved",      value: Math.max(0, (R.chart[0]?.["Labor Baseline"] || 0) - (R.chart[0]?.["Remaining Labor"] || 0)) },
                ];
                const costColors = ["#f97316","#3b82f6","#93c5fd","#10b981"];
                return (
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-2 text-center">{t.costPieTitle}</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={costPieData} cx="40%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={1}>
                          {costPieData.map((_, i) => <Cell key={i} fill={costColors[i]} />)}
                        </Pie>
                        <Tooltip formatter={(v) => [`$${c(v)}`, ""]} />
                        <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={10} wrapperStyle={{fontSize:10}} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}
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
              {(() => {
                const radarLabels = lang==="ko"
                  ? ["ROI %","BEP 속도","인건비절감%","OPEX 효율","1년차절감%","커버리지%"]
                  : ["ROI %","BEP Speed","Labor Save%","OPEX Efficiency","Yr1 Savings%","Coverage%"];
                const radarValues = [
                  Math.min(100, Math.max(0, R.roiPct / 3)),
                  R.bep === "N/A" ? 0 : Math.min(100, Math.max(0, (projYrs - parseInt(R.bep.replace("Y","")) + 1) / projYrs * 100)),
                  Math.min(100, Math.max(0, (1 - R.annLaborRemaining / Math.max(1,R.annLaborBaseline)) * 100)),
                  Math.min(100, Math.max(0, capex > 0 ? (1 - R.annOpex / Math.max(1,capex) * life) * 100 : 0)),
                  Math.min(100, Math.max(0, R.yr1Savings > 0 ? Math.min(R.yr1Savings / Math.max(1,R.annLaborBaseline) * 200, 100) : 0)),
                  Math.min(100, srRatio),
                ];
                const radarData = radarLabels.map((subject, i) => ({ subject, value: radarValues[i] }));
                return (
                  <div className="col-span-2">
                    <div className="text-xs font-semibold text-gray-500 mb-2 text-center">{t.savingsRadarTitle}</div>
                    <ResponsiveContainer width="100%" height={220}>
                      <RadarChart data={radarData} margin={{top:10,right:30,bottom:10,left:30}}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{fontSize:10}} />
                        <PolarRadiusAxis angle={30} domain={[0,100]} tick={{fontSize:9}} tickCount={5} />
                        <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}
              {/* Horizontal bar: year-by-year savings */}
              {(() => {
                const savingsBarData = R.chart.map(r => ({
                  year: r.year,
                  savings: r["Labor Baseline"] - r["Remaining Labor"] - r["SR OPEX"] - r["SR Depreciation"],
                }));
                return (
                  <div className="col-span-2">
                    <div className="text-xs font-semibold text-gray-500 mb-2">{t.annSavingsByYear}</div>
                    <ResponsiveContainer width="100%" height={Math.max(120, R.chart.length * 28)}>
                      <BarChart data={savingsBarData} layout="vertical" margin={{top:4,right:16,left:0,bottom:0}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false}/>
                        <XAxis type="number" tickFormatter={v=>`$${(v/1e6).toFixed(1)}M`} tick={{fontSize:10}}/>
                        <YAxis type="category" dataKey="year" tick={{fontSize:10}} width={35}/>
                        <Tooltip formatter={v=>[`$${c(v)}`,""]}/>
                        <Bar dataKey="savings" radius={[0,4,4,0]}>
                          {savingsBarData.map((entry, i) => <Cell key={i} fill={entry.savings > 0 ? "#10b981" : "#ef4444"} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}