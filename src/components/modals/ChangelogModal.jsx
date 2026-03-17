import { VERSION, BUILD_DATE, CHANGELOG } from "../../constants";

export default function ChangelogModal({ onClose, lang }) {
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
