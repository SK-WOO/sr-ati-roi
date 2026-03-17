import { useState } from "react";

export default function PresetModal({ params, onSave, onClose, t }) {
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
