export default function ScenarioModal({ onClose, A, B, lang, c, $c }) {
  const hasA = !!A, hasB = !!B;
  const rows = [
    { key: "label",            label: lang === "ko" ? "시나리오"       : "Scenario" },
    { key: "capexStr",         label: "CAPEX" },
    { key: "bep",              label: lang === "ko" ? "손익분기점"     : "Break-Even" },
    { key: "roi",              label: "ROI" },
    { key: "yr1",              label: lang === "ko" ? "1년차 절감"     : "Yr 1 Savings",       fmt: v => v > 0 ? `$${c(v)}` : "—" },
    { key: "finSav",           label: lang === "ko" ? "누적 절감"      : "Cumulative Savings",  fmt: v => v > 0 ? `+$${c(v)}` : "—" },
    { key: "annLaborBaseline", label: lang === "ko" ? "기준 인건비"    : "Labor Baseline",      fmt: v => `$${c(v)}` },
    { key: "annOpex",          label: lang === "ko" ? "연간 OPEX"     : "Annual OPEX",          fmt: v => `$${c(v)}` },
    { key: "annDepr",          label: lang === "ko" ? "연간 감가상각"  : "Annual Depr.",         fmt: v => `$${c(v)}` },
  ];
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[min(520px,94vw)] max-h-[85vh] flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="font-bold text-gray-800">{lang === "ko" ? "📊 시나리오 비교" : "📊 Scenario Comparison"}</div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="overflow-y-auto p-4">
          {(!hasA && !hasB) ? (
            <div className="text-center text-gray-400 text-sm py-8">
              {lang === "ko" ? "저장된 시나리오가 없습니다. ROI 탭에서 저장하세요." : "No scenarios saved yet. Save from the ROI tab."}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-xs text-gray-400 font-semibold py-2 w-1/3">{lang === "ko" ? "항목" : "Metric"}</th>
                  <th className="text-center py-2 w-1/3">
                    <span className="bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs font-bold">A</span>
                  </th>
                  <th className="text-center py-2 w-1/3">
                    <span className="bg-purple-100 text-purple-700 rounded px-2 py-0.5 text-xs font-bold">B</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.key} className="border-t border-gray-50">
                    <td className="py-2 text-xs text-gray-500 pr-2">{row.label}</td>
                    <td className="py-2 text-center text-xs font-semibold text-blue-700">
                      {hasA ? (row.fmt ? row.fmt(A[row.key]) : A[row.key]) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="py-2 text-center text-xs font-semibold text-purple-700">
                      {hasB ? (row.fmt ? row.fmt(B[row.key]) : B[row.key]) : <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="p-4 border-t border-gray-100">
          <button onClick={onClose} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm">{lang === "ko" ? "닫기" : "Close"}</button>
        </div>
      </div>
    </div>
  );
}
