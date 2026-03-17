import { SHEET_ID, SHEET_NAME } from "../constants";

const SHEETS_BASE = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`;
const sheetsHeaders = ["id","brand","country","plant","author","dept","note","savedAt","params"];

export async function sheetsLoad(token) {
  const res = await fetch(`${SHEETS_BASE}/values/${SHEET_NAME}!A:I`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`${res.status}`);
  const data = await res.json();
  const rows = data.values || [];
  // 첫 행이 헤더가 아니면 초기화
  if (rows.length === 0 || rows[0][0] !== "id") {
    await sheetsInitHeader(token);
    return [];
  }
  return rows.slice(1).map((row, i) => {
    try {
      return { _rowIndex: i + 2, id: row[0], brand: row[1], country: row[2],
        plant: row[3], author: row[4] || "", dept: row[5] || "",
        note: row[6] || "", savedAt: row[7], params: JSON.parse(row[8] || "{}") };
    } catch { return null; }
  }).filter(Boolean);
}

export async function sheetsInitHeader(token) {
  await fetch(`${SHEETS_BASE}/values/${SHEET_NAME}!A1:I1?valueInputOption=RAW`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values: [sheetsHeaders] }),
  });
}

export function presetToRow(preset) {
  return [
    preset.id || String(Date.now()),
    preset.brand, preset.country, preset.plant,
    preset.author || "", preset.dept || "", preset.note || "",
    preset.savedAt, JSON.stringify(preset.params),
  ];
}

export async function sheetsAppend(token, preset) {
  const res = await fetch(
    `${SHEETS_BASE}/values/${SHEET_NAME}!A:I:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [presetToRow(preset)] }),
    }
  );
  if (!res.ok) throw new Error("Sheets append failed");
}

export async function sheetsUpdateRow(token, rowIndex, preset) {
  const res = await fetch(
    `${SHEETS_BASE}/values/${SHEET_NAME}!A${rowIndex}:I${rowIndex}?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [presetToRow(preset)] }),
    }
  );
  if (!res.ok) throw new Error("Sheets update failed");
}

export async function sheetsDeleteRow(token, rowIndex) {
  const res = await fetch(`${SHEETS_BASE}:batchUpdate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [{ deleteDimension: {
        range: { sheetId: 0, dimension: "ROWS",
          startIndex: rowIndex - 1, endIndex: rowIndex },
      }}],
    }),
  });
  if (!res.ok) throw new Error("Sheets delete failed");
}
