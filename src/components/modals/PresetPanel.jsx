import { useState, useRef } from "react";
import { c } from "../../utils/format";

export default function PresetPanel({ presets, onLoad, onDelete, onClose, t, sheetsLoading, onRefresh }) {
  const [search, setSearch] = useState("");
  const importRef = useRef(null);

  const handleExport = (p) => {
    const { _rowIndex, ...exportData } = p;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SR-preset_${(p.plant || p.brand || "preset").replace(/[^a-zA-Z0-9]/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data?.params || typeof data.params !== "object") throw new Error("invalid");
        onLoad({ ...data, id: data.id || String(Date.now()), _rowIndex: null });
        onClose();
      } catch { alert("Invalid preset JSON"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };
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
            <button onClick={() => importRef.current?.click()} className="text-xs text-indigo-500 hover:text-indigo-700 border border-indigo-200 rounded px-2 py-1">{t.importPreset}</button>
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
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
                        <button onClick={() => handleExport(p)} className="text-xs border border-gray-200 text-gray-500 px-2 py-1 rounded-lg hover:bg-gray-50 whitespace-nowrap">{t.exportPreset}</button>
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
