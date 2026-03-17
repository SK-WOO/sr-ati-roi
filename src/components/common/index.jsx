import { useState } from "react";

export function Inp({ v, set, min = 0, max = 1e9, step = 1, unit, w = "w-24", comma = false }) {
  const dec = step < 1 ? 1 : 0;
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState("");
  const formatted = comma
    ? Number(v).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec })
    : Number(v).toFixed(dec);

  const draftNum = focused ? parseFloat(draft.replace(/,/g, "")) : NaN;
  const outOfRange = focused && !isNaN(draftNum) && (draftNum < min || draftNum > max);
  const atLimit = !focused && max < 1e8 && (v <= min || v >= max);

  let borderClass = "border-gray-300 focus:border-blue-500";
  if (outOfRange) borderClass = "border-orange-400 focus:border-orange-500";
  else if (atLimit) borderClass = "border-yellow-400 focus:border-yellow-500";

  return (
    <div className="flex items-center gap-1 min-w-0">
      <input type="text" inputMode="decimal"
        value={focused ? draft : formatted}
        onFocus={() => { setFocused(true); setDraft(String(v)); }}
        onChange={e => { const s = e.target.value.replace(/,/g, ""); setDraft(s); const n = parseFloat(s); if (!isNaN(n)) set(n); }}
        onBlur={() => { setFocused(false); const n = parseFloat(draft.replace(/,/g, "")); if (!isNaN(n)) set(Math.min(Math.max(n, min), max)); else set(v); }}
        title={outOfRange ? `Range: ${min} – ${max}` : undefined}
        className={`${w} min-w-0 border ${borderClass} rounded px-2 py-1 text-sm text-right focus:outline-none`}
      />
      {unit && <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">{unit}</span>}
      {outOfRange && <span className="text-orange-400 text-xs flex-shrink-0" title={`Range: ${min} – ${max}`}>⚠</span>}
    </div>
  );
}

export function SecHead({ n, title, sub }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">{n}</div>
      <div><div className="font-bold text-gray-800">{title}</div>{sub && <div className="text-xs text-gray-500">{sub}</div>}</div>
    </div>
  );
}

export function Row({ label, hint, children }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 gap-2 min-w-0">
      <div className="flex-1 min-w-0"><div className="text-sm font-medium text-gray-700 leading-tight">{label}</div>{hint && <div className="text-xs text-gray-400 leading-tight">{hint}</div>}</div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export function KPI({ label, value, sub, hi }) {
  return (
    <div className={`rounded-xl p-3 ${hi ? "bg-blue-600 text-white" : "bg-gray-50"}`}>
      <div className={`text-xs mb-1 truncate ${hi ? "text-blue-200" : "text-gray-500"}`}>{label}</div>
      <div className="text-lg font-bold leading-tight break-all">{value}</div>
      {sub && <div className={`text-[11px] mt-1 leading-tight ${hi ? "text-blue-200" : "text-gray-400"}`}>{sub}</div>}
    </div>
  );
}

export function CR({ label, value, col = "text-gray-600" }) {
  return (
    <div className="flex justify-between py-1 border-b border-gray-100 text-xs gap-2 min-w-0">
      <span className="text-gray-500 truncate">{label}</span>
      <span className={`font-semibold whitespace-nowrap flex-shrink-0 ${col}`}>{value}</span>
    </div>
  );
}
