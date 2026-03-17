import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { VERSION, BUILD_DATE, DEV_LICENSE_AMT } from "../../constants";
import { c } from "../../utils/format";
import { uploadToDrive } from "../../utils/drive";

export default function ReportModal({ onClose, t, lang, R, PC, capex, capexHW, capexNRE, capexInst, capexOther,
  capexBase, capexAfterOverhead, capexAfterMargin, capexOverhead, capexMargin, capexDiscount,
  opexMode, opexArea, life, projYrs, loadedName, googleUser, hwConfig, hwCounts, sites,
  driveToken, requestDriveToken }) {
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
    const safe = (s) => (s||"").replace(/[^a-zA-Z0-9]/g,"_");
    const fileName = `SR-ROI-Report_${safe(client||project||"export")}_${safe(author)}_${now.toISOString().slice(0,10)}.pdf`;
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
      ],
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
      columnStyles:{0:{textColor:[60,60,60]}},
      body:[
        ["Includes: HW Warranty / Site Support / SW Update & Maintenance / SW License / Overhaul"],
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
    const safe = (s) => (s||"").replace(/[^a-zA-Z0-9]/g,"_");
    const fileName = `SR-Quotation_${safe(client||"Client")}_${safe(salesRep)}_${now.toISOString().slice(0,10)}.pdf`;
    return { doc, fileName };
  };
  const generateQuotationPdf = () => { const { doc, fileName } = buildQuotationPdf(); doc.save(fileName); };

  const [driveLoading, setDriveLoading] = useState(null);
  const [driveError, setDriveError] = useState(null);
  const saveToDriveHandler = async (m) => {
    setDriveLoading(m);
    setDriveError(null);
    try {
      let token = driveToken || await requestDriveToken();
      if (!token) { setDriveLoading("noauth"); setTimeout(() => setDriveLoading(null), 6000); return; }
      const { doc, fileName } = m === "internal" ? buildInternalPdf() : buildQuotationPdf();
      const blob = doc.output("blob");
      try {
        await uploadToDrive(token, blob, fileName);
      } catch (e) {
        if (e.message.startsWith("401")) {
          // Token expired — silent re-auth and retry once
          token = await requestDriveToken();
          if (!token) throw new Error("401 — re-auth failed");
          await uploadToDrive(token, blob, fileName);
        } else throw e;
      }
      setDriveLoading("done");
      setTimeout(() => setDriveLoading(null), 3000);
    } catch (e) {
      setDriveError(e.message);
      setDriveLoading("error");
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
          {driveLoading === "error" && <div className="text-xs text-red-500 text-center">{t.saveToDriveFail}{driveError ? ` (${driveError})` : ""}</div>}
          {driveLoading === "noauth" && <div className="text-xs text-orange-500 text-center">{t.saveToDriveNoAuth}</div>}
          {!driveLoading && <div className="text-xs text-gray-400 text-center">{t.saveToDriveHint}</div>}
          <button onClick={onClose} className="w-full border border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">{t.reportClose}</button>
        </div>
      </div>
    </div>
  );
}
