import { VERSION, BUILD_DATE, CHANGELOG } from "../../constants";

export default function HelpModal({ onClose, lang, t }) {
  const cl = CHANGELOG[0]; // always latest — auto-updates when CHANGELOG[0] changes
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-14 px-2">
      <div className="bg-white rounded-2xl shadow-xl w-[min(560px,96vw)] max-h-[82vh] flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="font-bold text-gray-800">{lang === "ko" ? "🛠 기능 가이드" : "🛠 Feature Guide"}</div>
            <div className="text-xs text-gray-400 mt-0.5">{VERSION} · {BUILD_DATE}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="overflow-y-auto p-4 space-y-5">
          {/* Tab overview */}
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
              {lang === "ko" ? "탭 구성" : "Tab Overview"}
            </div>
            <div className="space-y-2">
              {t.tabs.map((tab, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-xs font-bold text-blue-700 whitespace-nowrap pt-0.5 w-36 shrink-0">{tab}</span>
                  <span className="text-xs text-gray-500 leading-relaxed">{t.tabDescs[i]}</span>
                </div>
              ))}
            </div>
          </div>
          {/* What's new */}
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
              {lang === "ko" ? `🆕 ${cl.version} 새 기능` : `🆕 What's new in ${cl.version}`}
            </div>
            <ul className="space-y-1.5">
              {(lang === "ko" ? cl.ko : cl.en).map((item, i) => (
                <li key={i} className="text-xs text-gray-600 flex gap-2">
                  <span className="text-blue-400 shrink-0 mt-0.5">•</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 flex justify-between items-center">
          <a href="https://seoulrobotics.atlassian.net/wiki/x/EAAi5" target="_blank" rel="noreferrer"
            className="text-xs text-blue-500 hover:underline">
            {lang === "ko" ? "📖 전체 매뉴얼" : "📖 Full Manual"}
          </a>
          <button onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-xl text-sm">
            {lang === "ko" ? "닫기" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
