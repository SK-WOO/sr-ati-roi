import { useState, useMemo, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

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

const WORKER = {
  fulltime:   { label: "Full-time"     },
  contractor: { label: "Contractor"    },
  hourly:     { label: "Hourly / Temp" },
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
      {unit && <span className="text-xs text-gray-400 w-12">{unit}</span>}
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

function PresetModal({ params, onSave, onClose }) {
  const [brand,  setBrand]  = useState("");
  const [country,setCountry]= useState("");
  const [plant,  setPlant]  = useState("");
  const [note,   setNote]   = useState("");
  const [author, setAuthor] = useState("");
  const [dept,   setDept]   = useState("");
  const valid = brand.trim() && country.trim() && plant.trim();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-80 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="font-bold text-gray-800 text-base">💾 Save Factory Preset</div>
        <div className="space-y-2">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wide pt-1">🏭 Factory Info</div>
          {[["Brand / OEM", brand, setBrand, "e.g. Hyundai"],
            ["Country",     country, setCountry, "e.g. USA"],
            ["Plant",       plant,   setPlant,   "e.g. HMGMA Georgia"]].map(([lbl, val, setter, ph]) => (
            <div key={lbl}>
              <div className="text-xs text-gray-500 mb-0.5">{lbl}</div>
              <input value={val} onChange={e => setter(e.target.value)} placeholder={ph}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500" />
            </div>
          ))}
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wide pt-2">👤 Author Info</div>
          {[["Name", author, setAuthor, "e.g. John Kim"],
            ["Department", dept, setDept, "e.g. Manufacturing Engineering"]].map(([lbl, val, setter, ph]) => (
            <div key={lbl}>
              <div className="text-xs text-gray-500 mb-0.5">{lbl}</div>
              <input value={val} onChange={e => setter(e.target.value)} placeholder={ph}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500" />
            </div>
          ))}
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Notes (optional)</div>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="e.g. UPH 30, 2-shift"
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 resize-none" />
          </div>
        </div>
        <div className="text-xs text-gray-400">All current parameter values will be saved.</div>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          <button disabled={!valid}
            onClick={() => onSave({ brand: brand.trim(), country: country.trim(), plant: plant.trim(), note: note.trim(), author: author.trim(), dept: dept.trim(), params, savedAt: new Date().toISOString() })}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold text-white transition-colors ${valid ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"}`}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function PresetPanel({ presets, onLoad, onDelete, onClose }) {
  const [search, setSearch] = useState("");
  const filtered = presets.filter(p =>
    [p.brand, p.country, p.plant].join(" ").toLowerCase().includes(search.toLowerCase())
  );
  const grouped = filtered.reduce((acc, p) => {
    const origIdx = presets.findIndex(op => op.savedAt === p.savedAt && op.plant === p.plant);
    (acc[p.brand] = acc[p.brand] || []).push({ ...p, _idx: origIdx });
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-96 max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="font-bold text-gray-800">🏭 Factory Presets</div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="px-4 pt-3">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search brand / country / plant..."
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div className="overflow-auto flex-1 p-4 space-y-4">
          {Object.keys(grouped).length === 0 && (
            <div className="text-center text-gray-400 text-sm py-8">No presets saved yet.</div>
          )}
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
                        {(p.author || p.dept) && (
                          <div className="text-xs text-gray-400 mt-0.5">👤 {[p.author, p.dept].filter(Boolean).join(" · ")}</div>
                        )}
                        {p.note && <div className="text-xs text-gray-400 mt-0.5 italic">{p.note}</div>}
                        <div className="text-xs text-blue-600 mt-1">
                          CAPA {c(p.params.capa)} · ${p.params.hrly || "—"}/hr
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button onClick={() => onLoad(p)} className="text-xs bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 whitespace-nowrap">Load</button>
                        <button onClick={() => onDelete(p._idx)} className="text-xs border border-red-200 text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 whitespace-nowrap">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-gray-100 text-xs text-gray-400 text-center">
          {presets.length} preset{presets.length !== 1 ? "s" : ""} saved
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [presets,    setPresets]    = useState([]);
  const [showSave,   setShowSave]   = useState(false);
  const [showList,   setShowList]   = useState(false);
  const [loadedName, setLoadedName] = useState(null);
  const [loadedIdx,  setLoadedIdx]  = useState(null);
  const [toast,      setToast]      = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("sr-ati-presets");
        if (r?.value) setPresets(JSON.parse(r.value));
      } catch { /* key doesn't exist yet */ }
    })();
  }, []);

  const savePresets = async (list) => {
    setPresets(list);
    try {
      const result = await window.storage.set("sr-ati-presets", JSON.stringify(list));
      if (!result) showToast("Storage save failed", false);
    } catch (e) {
      showToast("Storage error: " + (e?.message || String(e)), false);
    }
  };

  const [cKey,    setCKey]    = useState("US");
  const [regDays, setRegDays] = useState(250);
  const [holDays, setHolDays] = useState(20);
  const [regHrs,  setRegHrs]  = useState(8);
  const [otHrs,   setOtHrs]   = useState(2);
  const [nShifts, setNShifts] = useState(2);
  const [capa,    setCapa]    = useState(300000);
  const [yld,     setYld]     = useState(95);
  const [srRatio, setSrRatio] = useState(100);
  const [dist,    setDist]    = useState(1.5);
  const [spd,     setSpd]     = useState(30);
  const [tPre,    setTPre]    = useState(2);
  const [tPark,   setTPark]   = useState(1.5);
  const [tWlk1,   setTWlk1]  = useState(3);
  const [tHdwy,   setTHdwy]   = useState(8);
  const [tRide,   setTRide]   = useState(5);
  const [tWlk2,   setTWlk2]  = useState(2);
  const [tOvhd,   setTOvhd]   = useState(3);
  const [wType,    setWType]   = useState("hourly");
  const [discount, setDiscount]= useState(0);
  const [wageMode, setWageMode]= useState("hourly");
  const [hrly,     setHrly]   = useState(22);
  const [hpw,      setHpw]    = useState(40);
  const [wpy,      setWpy]    = useState(50);
  const [annWage,  setAnnWage]= useState(52000);
  const [srch,     setSrch]   = useState(30);
  const [infl,     setInfl]   = useState(3.0);
  const [capex,    setCapex]  = useState(2000000);
  const [life,     setLife]   = useState(7);
  const [opexPM,   setOpexPM] = useState(0.5);
  const [srGrw,    setSrGrw]  = useState(1.0);
  const [projYrs,  setProjYrs]= useState(7);
  const [tab,      setTab]    = useState("prod");

  const cd = COUNTRIES[cKey];

  const currentParams = () => ({
    cKey, regDays, holDays, regHrs, otHrs, nShifts, capa, yld, srRatio,
    dist, spd, tPre, tPark, tWlk1, tHdwy, tRide, tWlk2, tOvhd,
    wType, discount, wageMode, hrly, hpw, wpy, annWage, srch, infl,
    capex, life, opexPM, srGrw, projYrs,
  });

  const loadPreset = (preset) => {
    const p = preset.params;
    setCKey(p.cKey);
    setRegDays(p.regDays); setHolDays(p.holDays); setRegHrs(p.regHrs); setOtHrs(p.otHrs);
    setNShifts(p.nShifts); setCapa(p.capa); setYld(p.yld);
    setSrRatio(p.srRatio ?? 100);
    setDist(p.dist); setSpd(p.spd); setTPre(p.tPre); setTPark(p.tPark);
    setTWlk1(p.tWlk1); setTHdwy(p.tHdwy); setTRide(p.tRide); setTWlk2(p.tWlk2); setTOvhd(p.tOvhd);
    setWType(p.wType); setDiscount(p.discount || 0); setWageMode(p.wageMode);
    setHrly(p.hrly); setHpw(p.hpw); setWpy(p.wpy); setAnnWage(p.annWage);
    setSrch(p.srch); setInfl(p.infl);
    setCapex(p.capex); setLife(p.life); setOpexPM(p.opexPM); setSrGrw(p.srGrw); setProjYrs(p.projYrs);
    setLoadedName(`${preset.brand} · ${preset.country} · ${preset.plant}`);
    setLoadedIdx(preset._idx);
    setShowList(false);
  };

  const handleCountry = (key) => {
    const co = COUNTRIES[key];
    setCKey(key);
    setAnnWage(co.avgWage);
    setSrch(co.surcharge);
    setInfl(co.inflation);
    setHolDays(co.holidays);
  };

  const handleUpdatePreset = async () => {
    if (loadedIdx === null || loadedIdx < 0) {
      showToast("No preset loaded!", false);
      return;
    }
    const updated = [...presets];
    updated[loadedIdx] = { ...updated[loadedIdx], params: currentParams(), savedAt: new Date().toISOString() };
    await savePresets(updated);
    showToast(`✅ "${loadedName}" updated!`);
  };

  const R = useMemo(() => {
    const effDays  = Math.max(1, regDays + holDays - cd.holidays);
    const hps      = regHrs + otHrs;
    const totHrs   = effDays * hps * nShifts;
    const uph      = totHrs > 0 ? capa / (totHrs * (yld / 100)) : 0;
    const mpd      = capa / effDays;
    const srCapa   = capa * (srRatio / 100);
    const mpdSR    = srCapa / effDays;
    const driveT   = (dist / spd) * 60;
    const waitT    = tHdwy / 2;
    const cycleT   = tPre + driveT + tPark + tWlk1 + waitT + tRide + tWlk2 + tOvhd;
    const tripsPS      = (hps * 60) / cycleT;
    const totalDrvPS   = Math.ceil(mpd / (tripsPS * nShifts));
    const totalDrvTot  = totalDrvPS * nShifts;
    const drvPS        = Math.ceil(mpdSR / (tripsPS * nShifts));
    const drvTot       = drvPS * nShifts;
    const mannedDrvPS  = Math.ceil((mpd - mpdSR) / (tripsPS * nShifts));
    const mannedDrvTot = mannedDrvPS * nShifts;
    const hReg     = regDays * regHrs;
    const hOt      = regDays * otHrs;
    const hHolReg  = holDays * regHrs;
    const hHolOt   = holDays * otHrs;
    const totHrsP  = hReg + hOt + hHolReg + hHolOt;

    let annBase, impliedHrly;
    const disc = discount / 100;
    if (wageMode === "annual") {
      annBase     = annWage * (1 - disc);
      impliedHrly = totHrsP > 0 ? annBase / totHrsP : 0;
    } else {
      impliedHrly = hrly * (1 - disc);
      annBase     = impliedHrly * (hReg*1.0 + hOt*1.5 + hHolReg*2.0 + hHolOt*2.0);
    }
    const effHrly  = totHrsP > 0 ? annBase / totHrsP : 0;
    const compPP   = annBase * (1 + srch / 100);
    const annLaborTotal = totalDrvTot * compPP;  // SR 도입 전 전체 인건비 (차트 비교 기준)
    const annLabor      = mannedDrvTot * compPP; // SR 도입 후 잔존 인건비
    const annOpex  = srCapa * opexPM;
    const annDepr  = capex / life;
    const annSRTot = annDepr + annOpex;
    const inflR = infl / 100, srGrwR = srGrw / 100;
    let cumL = 0, cumS = 0;
    const chart = Array.from({ length: projYrs }, (_, i) => {
      const y = i + 1;
      const laborManned = annLabor      * Math.pow(1 + inflR,  i); // 잔존 manned 인건비
      const laborTotal  = annLaborTotal * Math.pow(1 + inflR,  i); // SR 도입 전 전체 인건비
      const opex  = annOpex * Math.pow(1 + srGrwR, i);
      const depr  = y <= life ? annDepr : 0;
      const srTot = opex + depr;
      const srCost = laborManned + srTot; // 실제 총 비용 (잔존 인건비 + SR 비용)
      cumL += laborTotal;
      cumS += srCost;
      return {
        year: `Y${y}`,
        "Manned Labor (Before)": Math.round(laborTotal),
        "Remaining Labor": Math.round(laborManned),
        "SR OPEX": Math.round(opex),
        "SR Depreciation": Math.round(depr),
        "SR Total Cost": Math.round(srCost),
        "Cum. Labor (Before)": Math.round(cumL),
        "Cum. SR Solution": Math.round(cumS),
        savings: Math.round(cumL - cumS)
      };
    });
    const bep    = chart.find(r => r.savings > 0)?.year ?? "N/A";
    const finSav = chart[chart.length - 1]?.savings ?? 0;
    const roiPct = capex > 0 ? (finSav / capex) * 100 : 0;
    return { effDays, totHrs, uph, mpd, srCapa, mpdSR, driveT, waitT, cycleT, tripsPS, totalDrvPS, totalDrvTot, drvPS, drvTot, mannedDrvPS, mannedDrvTot, hReg, hOt, hHolReg, hHolOt, totHrsP, impliedHrly, annBase, effHrly, compPP, annLabor, annLaborTotal, annDepr, annOpex, annSRTot, chart, bep, finSav, roiPct };
  }, [cd, regDays, holDays, regHrs, otHrs, nShifts, capa, yld, srRatio, dist, spd, tPre, tPark, tWlk1, tHdwy, tRide, tWlk2, tOvhd, wType, discount, wageMode, hrly, hpw, wpy, annWage, srch, infl, capex, life, opexPM, srGrw, projYrs]);

  const TABS = [
    { id: "prod",  label: "📦 Production" },
    { id: "trans", label: "🚗 Transport"  },
    { id: "work",  label: "👷 Workforce"  },
    { id: "sr",    label: "🤖 SR Pricing" },
  ];

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "system-ui,sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold ${toast.ok ? "bg-green-600" : "bg-red-500"}`}>
          {toast.msg}
        </div>
      )}

      {showSave && (
        <PresetModal
          params={currentParams()}
          onSave={p => { savePresets([...presets, p]); setShowSave(false); setLoadedName(`${p.brand} · ${p.country} · ${p.plant}`); setLoadedIdx(presets.length); showToast("✅ Preset saved!"); }}
          onClose={() => setShowSave(false)}
        />
      )}
      {showList && (
        <PresetPanel
          presets={presets}
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
            <div className="font-bold text-lg">ATI ROI Calculator</div>
            <div className="text-blue-200 text-xs">Autonomy Through Infrastructure</div>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button onClick={() => setShowList(true)}
              className="flex items-center gap-1.5 bg-blue-800 hover:bg-blue-900 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
              🏭 Presets {presets.length > 0 && <span className="bg-blue-500 text-white text-xs rounded-full px-1.5">{presets.length}</span>}
            </button>
            <button onClick={() => setShowSave(true)}
              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
              💾 Save New Preset
            </button>
          </div>
        </div>
        {loadedName && (
          <div className="max-w-6xl mx-auto mt-2">
            <div className="text-xs bg-blue-800 rounded-lg px-3 py-1.5 inline-flex flex-wrap items-center gap-2">
              <span className="text-blue-300">Loaded:</span>
              <span className="text-white font-semibold">{loadedName}</span>
              <button onClick={handleUpdatePreset} className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-0.5 rounded ml-1">💾 Update</button>
              <button onClick={() => { setLoadedName(null); setLoadedIdx(null); }} className="text-blue-400 hover:text-white ml-1">✕</button>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-sm font-bold text-gray-600 mb-2">🌏 Target Country</div>
            <select value={cKey} onChange={e => handleCountry(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 mb-3">
              {Object.entries(COUNTRIES).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
            </select>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="text-gray-500">Public Holidays</div>
                <div className="font-bold text-blue-700">{cd.holidays} days</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <div className="text-gray-500 mb-1">Avg. Annual Wage <span className="text-gray-400">(Annual mode)</span></div>
                <div className="flex items-center justify-center gap-0.5">
                  <span className="text-gray-400 text-xs">$</span>
                  <Inp v={annWage} set={setAnnWage} min={1000} max={500000} step={1000} w="w-20" comma />
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-2">
                <div className="text-gray-500 mb-1">Wage Inflation</div>
                <div className="flex items-center justify-center gap-0.5">
                  <Inp v={infl} set={setInfl} min={0} max={30} step={0.1} w="w-10" />
                  <span className="text-orange-600 font-bold text-xs">%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-200">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex-1 text-xs py-2 font-medium transition-colors ${tab === t.id ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="p-4">
              {tab === "prod" && <>
                <SecHead n="1" title="Production Parameters" sub="Inputs → CAPA & UPH back-calculation" />
                <Row label="Regular Working Days / Year"><Inp v={regDays} set={setRegDays} min={100} max={300} unit="days" /></Row>
                <Row label="Holiday Work Days / Year" hint="Weekend / special shifts"><Inp v={holDays} set={setHolDays} min={0} max={100} unit="days" /></Row>
                <Row label="Regular Hours / Shift"><Inp v={regHrs} set={setRegHrs} min={4} max={12} unit="h" /></Row>
                <Row label="Overtime Hours / Shift"><Inp v={otHrs} set={setOtHrs} min={0} max={6} unit="h" /></Row>
                <Row label="Number of Shifts"><Inp v={nShifts} set={setNShifts} min={1} max={3} unit="shifts" /></Row>
                <Row label="Annual Production Target (CAPA)"><Inp v={capa} set={setCapa} min={1000} max={2000000} step={10000} unit="units" w="w-28" comma /></Row>
                <Row label="Yield Rate"><Inp v={yld} set={setYld} min={50} max={100} step={0.5} unit="%" /></Row>
                <Row label="SR Coverage Ratio" hint="% of CAPA handled by SR solution"><Inp v={srRatio} set={setSrRatio} min={1} max={100} step={1} unit="%" /></Row>
                <div className="mt-3 bg-blue-50 rounded-lg p-3 grid grid-cols-2 gap-2 text-center text-xs">
                  <div><div className="text-gray-500">Effective Work Days</div><div className="font-bold text-blue-700">{c(R.effDays)} days</div></div>
                  <div><div className="text-gray-500">Back-calc. UPH</div><div className="font-bold text-blue-700">{R.uph.toFixed(1)} /h</div></div>
                  <div><div className="text-gray-500">Daily Moves (Total)</div><div className="font-bold text-blue-700">{c(Math.round(R.mpd))} /day</div></div>
                  <div><div className="text-gray-500">Daily Moves (SR)</div><div className="font-bold text-blue-700">{c(Math.round(R.mpdSR))} /day</div></div>
                  <div><div className="text-gray-500">SR CAPA</div><div className="font-bold text-blue-700">{c(Math.round(R.srCapa))} units ({srRatio}%)</div></div>
                  <div><div className="text-gray-500">Total Annual Hours</div><div className="font-bold text-blue-700">{c(R.totHrs)} h</div></div>
                </div>
              </>}

              {tab === "trans" && <>
                <SecHead n="2" title="Transport Cycle Time" sub="Full manned-driver cycle — 8 steps" />
                <div className="text-xs font-bold text-gray-400 mb-1">🔵 Pre-Drive</div>
                <Row label="Vehicle Inspection & Key Pickup"><Inp v={tPre} set={setTPre} min={0} max={30} step={0.5} unit="min" /></Row>
                <div className="text-xs font-bold text-gray-400 mt-2 mb-1">🚗 Drive Leg</div>
                <Row label="One-Way Drive Distance" hint="End-of-line → yard"><Inp v={dist} set={setDist} min={0.1} max={30} step={0.1} unit="km" /></Row>
                <Row label="In-Plant Drive Speed" hint="20–40 km/h"><Inp v={spd} set={setSpd} min={5} max={60} step={5} unit="km/h" /></Row>
                <div className="text-xs font-bold text-gray-400 mt-2 mb-1">🅿️ At Destination</div>
                <Row label="Parking & Documentation"><Inp v={tPark} set={setTPark} min={0} max={20} step={0.5} unit="min" /></Row>
                <Row label="Walk to Shuttle Stop"><Inp v={tWlk1} set={setTWlk1} min={0} max={20} step={0.5} unit="min" /></Row>
                <div className="text-xs font-bold text-gray-400 mt-2 mb-1">🚐 Return Leg</div>
                <Row label="Shuttle Headway" hint="Avg. wait = headway ÷ 2"><Inp v={tHdwy} set={setTHdwy} min={1} max={60} unit="min" /></Row>
                <Row label="Shuttle Ride (return)"><Inp v={tRide} set={setTRide} min={1} max={60} unit="min" /></Row>
                <Row label="Walk to Next Vehicle"><Inp v={tWlk2} set={setTWlk2} min={0} max={20} step={0.5} unit="min" /></Row>
                <div className="text-xs font-bold text-gray-400 mt-2 mb-1">⏱ Overhead</div>
                <Row label="Cycle Overhead" hint="Briefing, delays, breaks"><Inp v={tOvhd} set={setTOvhd} min={0} max={30} step={0.5} unit="min" /></Row>
                <div className="mt-3 bg-gray-50 rounded-lg p-3 text-xs">
                  <div className="font-bold text-gray-700 mb-2">📋 Cycle Breakdown</div>
                  <CR label="① Inspection & key pickup" value={`${tPre} min`} />
                  <CR label="② One-way drive"           value={`${R.driveT.toFixed(1)} min`} />
                  <CR label="③ Parking & docs"          value={`${tPark} min`} />
                  <CR label="④ Walk to shuttle"         value={`${tWlk1} min`} />
                  <CR label="⑤ Shuttle wait (avg)"      value={`${R.waitT.toFixed(1)} min`} col="text-orange-500" />
                  <CR label="⑥ Shuttle ride back"       value={`${tRide} min`} />
                  <CR label="⑦ Walk to next vehicle"    value={`${tWlk2} min`} />
                  <CR label="⑧ Overhead"                value={`${tOvhd} min`} />
                  <div className="flex justify-between pt-2 mt-1 border-t border-gray-300 font-bold">
                    <span className="text-blue-700">Total Cycle Time</span>
                    <span className="text-blue-700">{R.cycleT.toFixed(1)} min</span>
                  </div>
                  <div className="flex justify-between pt-1 font-semibold text-green-700">
                    <span>Trips / Driver / Shift</span><span>{R.tripsPS.toFixed(1)}</span>
                  </div>
                </div>
              </>}

              {tab === "work" && <>
                <SecHead n="3" title="Workforce Cost" sub="Regular / Overtime / Holiday premiums" />
                <Row label="Employment Type">
                  <select value={wType} onChange={e => { setWType(e.target.value); if (e.target.value === "fulltime") setDiscount(0); }}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none">
                    {Object.entries(WORKER).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </Row>
                {wType !== "fulltime" && (
                  <Row label="Contractor / Temp Discount" hint="Applied to hourly rate or annual wage">
                    <Inp v={discount} set={setDiscount} min={0} max={50} step={1} unit="%" />
                  </Row>
                )}
                <Row label="Wage Input Mode">
                  <div className="flex gap-1">
                    <button onClick={() => setWageMode("hourly")} className={`text-xs px-2 py-1 rounded ${wageMode === "hourly" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>Hourly Rate</button>
                    <button onClick={() => setWageMode("annual")} className={`text-xs px-2 py-1 rounded ${wageMode === "annual" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>Annual Avg.</button>
                  </div>
                </Row>
                {wageMode === "hourly" ? <>
                  <Row label="Base Hourly Rate" hint="HMGMA benchmark: $22/hr"><Inp v={hrly} set={setHrly} min={1} max={500} step={0.5} unit="$/hr" /></Row>
                  <Row label="Hours / Week"><Inp v={hpw} set={setHpw} min={10} max={80} unit="h" /></Row>
                  <Row label="Working Weeks / Year"><Inp v={wpy} set={setWpy} min={10} max={52} unit="wks" /></Row>
                </> : <>
                  <Row label="Annual Avg. Wage" hint="Used as-is (no premium applied)">
                    <Inp v={annWage} set={setAnnWage} min={1000} max={500000} step={1000} unit="$/yr" w="w-28" comma />
                  </Row>
                </>}
                <Row label="Benefits & Social Insurance" hint="Statutory contributions + fringe benefits"><Inp v={srch} set={setSrch} min={0} max={100} step={1} unit="%" /></Row>
                <Row label="Wage Inflation Rate"><Inp v={infl} set={setInfl} min={0} max={30} step={0.1} unit="%" /></Row>
                <div className="mt-3 bg-blue-50 rounded-lg p-3 text-xs">
                  <div className="font-bold text-blue-800 mb-2">⚡ Pay Premium Schedule
                    {wageMode === "annual" && <span className="font-normal text-blue-500 ml-1">(not applied in Annual mode)</span>}
                  </div>
                  <CR label="Regular hours"     value="× 1.0 (100%)" />
                  <CR label="Weekday overtime"  value="× 1.5 (150%)" col="text-orange-500" />
                  <CR label="Holiday / weekend" value="× 2.0 (200%)" col="text-red-600" />
                  <CR label="Holiday overtime"  value="× 2.0 (highest)" col="text-red-700" />
                </div>
                {wageMode === "hourly" && (
                  <div className="mt-3 bg-gray-50 rounded-lg p-3 text-xs">
                    <div className="font-bold text-gray-700 mb-2">📋 Annual Hours / Person</div>
                    <CR label={`Regular std. (${regDays}d × ${regHrs}h)`}  value={`${c(R.hReg)} h × 1.0`} />
                    <CR label={`Weekday OT (${regDays}d × ${otHrs}h)`}     value={`${c(R.hOt)} h × 1.5`}    col="text-orange-500" />
                    <CR label={`Holiday std. (${holDays}d × ${regHrs}h)`}  value={`${c(R.hHolReg)} h × 2.0`} col="text-red-600" />
                    <CR label={`Holiday OT (${holDays}d × ${otHrs}h)`}     value={`${c(R.hHolOt)} h × 2.0`}  col="text-red-700" />
                    <div className="flex justify-between pt-2 mt-1 border-t border-gray-300 font-bold">
                      <span>Total Hours / Person</span><span>{c(R.totHrsP)} h</span>
                    </div>
                    <div className="flex justify-between pt-1 font-semibold text-blue-700">
                      <span>Effective Avg. Hourly Rate</span><span>${R.effHrly.toFixed(2)}/hr</span>
                    </div>
                  </div>
                )}
                <div className="mt-3 bg-orange-50 rounded-lg p-3 grid grid-cols-2 gap-2 text-center text-xs">
                  <div>
                    <div className="text-gray-500">Annual Wage / Person</div>
                    <div className="font-bold text-orange-700">{$c(R.annBase)}</div>
                    {wageMode === "annual" && <div className="text-gray-400">{$c(annWage)}{discount > 0 ? ` − ${discount}%` : ""}</div>}
                    {wageMode === "hourly" && <div className="text-gray-400">${hrly}/hr{discount > 0 ? ` − ${discount}%` : ""} + premiums</div>}
                  </div>
                  <div>
                    <div className="text-gray-500">Total Cost / Person</div>
                    <div className="font-bold text-orange-700">{$c(R.compPP)}</div>
                    <div className="text-gray-400">+ {srch}% benefits & insurance</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-gray-500">Total Annual Labor ({c(R.drvTot)} drivers)</div>
                    <div className="font-bold text-orange-700 text-xl">{$c(R.annLabor)}</div>
                  </div>
                </div>
                <div className="mt-3 bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-xs">
                  <div className="font-bold text-yellow-800 mb-1">📌 HMGMA Benchmark (Hyundai Georgia)</div>
                  <div className="text-gray-500">UPH ≈ 30 · 67 drivers · $22/hr base</div>
                  <div className="mt-1 text-gray-600">Est. annual labor: <span className="font-bold text-yellow-700">
                    {$c(67 * hrly * (R.hReg*1.0 + R.hOt*1.5 + R.hHolReg*2.0 + R.hHolOt*2.0) * (1 + srch/100))}
                  </span></div>
                </div>
              </>}

              {tab === "sr" && <>
                <SecHead n="4" title="SR Solution Pricing" sub="CAPEX (depreciation) + OPEX per move" />
                <Row label="Initial CAPEX (HW + NRE)"><Inp v={capex} set={setCapex} min={100000} max={50000000} step={100000} unit="$" w="w-28" comma /></Row>
                <Row label="Useful Life" hint="Straight-line depreciation"><Inp v={life} set={setLife} min={1} max={20} unit="yrs" /></Row>
                <Row label="OPEX per Vehicle Move"><Inp v={opexPM} set={setOpexPM} min={0.01} max={100} step={0.1} unit="$/move" /></Row>
                <Row label="SR OPEX Annual Growth"><Inp v={srGrw} set={setSrGrw} min={0} max={20} step={0.5} unit="%/yr" /></Row>
                <Row label="ROI Analysis Period"><Inp v={projYrs} set={setProjYrs} min={1} max={20} unit="yrs" /></Row>
                <div className="mt-4 bg-purple-50 rounded-lg p-3 grid grid-cols-2 gap-2 text-center text-xs">
                  <div><div className="text-gray-500">Annual Depreciation</div><div className="font-bold text-purple-700">{$c(R.annDepr)}</div></div>
                  <div><div className="text-gray-500">Annual OPEX</div><div className="font-bold text-purple-700">{$c(R.annOpex)}</div></div>
                  <div><div className="text-gray-500">Annual SR Total</div><div className="font-bold text-purple-800 text-base">{$c(R.annSRTot)}</div></div>
                  <div><div className="text-gray-500">Year 1 Savings</div><div className="font-bold text-green-700 text-base">{$c(R.annLabor - R.annSRTot)}</div></div>
                  <div className="col-span-2"><div className="text-gray-500">Cumulative Break-Even</div><div className="font-bold text-purple-700 text-xl">{R.bep}</div></div>
                </div>
              </>}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KPI label="Back-calc. UPH"  value={`${R.uph.toFixed(1)}/h`}      sub="Required units/hr" />
            <KPI label="Cycle Time"       value={`${R.cycleT.toFixed(0)} min`} sub="8-step total" />
            <KPI label="SR Drivers"     value={c(R.drvTot)}        sub={`${c(R.drvPS)}/shift × ${nShifts} — SR ${srRatio}%`} hi />
            <KPI label="Manned Drivers" value={c(R.mannedDrvTot)}  sub={`${c(R.mannedDrvPS)}/shift × ${nShifts} — remaining ${100-srRatio}%`} />
            <KPI label="Break-Even"       value={R.bep}                        sub="Cumulative BEP" hi />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="font-bold text-gray-700 mb-1 text-sm">📊 Annual Cost — Manned vs SR Solution</div>
            <div className="text-xs text-gray-400 mb-3">Labor +{infl.toFixed(1)}%/yr · SR OPEX +{srGrw}%/yr · SR Coverage {srRatio}%</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={R.chart} margin={{ top:4, right:8, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{ fontSize:11 }} />
                <YAxis tickFormatter={v => `${(v/1e6).toFixed(1)}M`} tick={{ fontSize:10 }} width={55} />
                <Tooltip formatter={v => [`${c(v)}`, ""]} />
                <Legend wrapperStyle={{ fontSize:11 }} />
                <Bar dataKey="Manned Labor (Before)" fill="#ef4444" />
                <Bar dataKey="SR OPEX"         stackId="sr" fill="#3b82f6" />
                <Bar dataKey="SR Depreciation" stackId="sr" fill="#93c5fd" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="font-bold text-gray-700 mb-1 text-sm">📈 Cumulative Cost & Savings</div>
            <div className="text-xs text-gray-400 mb-3">Red = full manned cost · Blue = SR solution total cost · Green = savings</div>
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={R.chart} margin={{ top:4, right:8, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{ fontSize:11 }} />
                <YAxis tickFormatter={v => `${(v/1e6).toFixed(1)}M`} tick={{ fontSize:10 }} width={55} />
                <Tooltip formatter={v => [`${c(v)}`, ""]} />
                <Legend wrapperStyle={{ fontSize:11 }} />
                <Line type="monotone" dataKey="Cum. Labor (Before)" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Cum. SR Solution"    stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="savings" name="Cum. Savings" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={{ r:3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="font-bold text-gray-700 mb-3 text-sm">📋 Year-by-Year ROI Summary</div>
            <div className="overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    {["Year","Labor (Before)","Remaining Labor","SR OPEX","SR Depr.","SR Total Cost","Cum. Savings","ROI"].map(h =>
                      <th key={h} className="text-right first:text-left p-2 font-semibold text-gray-600">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {R.chart.map((r, i) => (
                    <tr key={i} className={`border-t border-gray-100 ${r.savings > 0 ? "bg-green-50" : ""}`}>
                      <td className="p-2 font-medium">{r.year}</td>
                      <td className="p-2 text-right text-red-400">${c(r["Manned Labor (Before)"])}</td>
                      <td className="p-2 text-right text-orange-500">${c(r["Remaining Labor"])}</td>
                      <td className="p-2 text-right text-blue-500">${c(r["SR OPEX"])}</td>
                      <td className="p-2 text-right text-blue-300">${c(r["SR Depreciation"])}</td>
                      <td className="p-2 text-right text-blue-800 font-semibold">${c(r["SR Total Cost"])}</td>
                      <td className={`p-2 text-right font-semibold ${r.savings > 0 ? "text-green-600" : "text-gray-400"}`}>
                        {r.savings >= 0 ? `+${c(r.savings)}` : `-${c(Math.abs(r.savings))}`}
                      </td>
                      <td className={`p-2 text-right ${r.savings > 0 ? "text-green-600" : "text-gray-400"}`}>
                        {r.savings > 0 ? `${((r.savings/capex)*100).toFixed(0)}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <KPI label={`${projYrs}-Yr Net Savings`} value={R.finSav > 0 ? $M(R.finSav) : "Negative"} sub="After full SR cost" hi={R.finSav > 0} />
            <KPI label="Total ROI" value={R.finSav > 0 ? `${c(R.roiPct, 0)}%` : "—"} sub={`vs CAPEX over ${projYrs} yrs`} />
            <KPI label="Max Annual Savings" value={$M(R.annLabor - R.annSRTot)} sub="Labor minus SR total" />
          </div>
        </div>
      </div>
    </div>
  );
}