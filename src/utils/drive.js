import { DRIVE_FOLDER_ID } from "../constants";

export async function uploadToDrive(token, blob, fileName) {
  const metadata = { name: fileName, mimeType: "application/pdf", parents: [DRIVE_FOLDER_ID] };
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", blob);
  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name&supportsAllDrives=true",
    { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`${res.status} — ${err?.error?.message || "unknown"}`);
  }
  return await res.json();
}
