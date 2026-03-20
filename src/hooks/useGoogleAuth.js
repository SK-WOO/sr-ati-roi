import { useState, useEffect, useRef } from "react";
import { CLIENT_ID, ALLOWED_DOMAIN, SHEETS_SCOPE, DRIVE_SCOPE } from "../constants";

export default function useGoogleAuth() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [driveToken, setDriveToken] = useState(null);
  const sheetsClientRef = useRef(null);
  const driveClientRef = useRef(null);
  // 진행 중인 Promise 참조 — 동시 호출 시 같은 Promise 반환
  const sheetsInflightRef = useRef(null);
  const driveInflightRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (res) => {
          try {
            const b64 = res.credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
            const padded = b64.padEnd(b64.length + (4 - b64.length % 4) % 4, "=");
            const p = JSON.parse(atob(padded));
            if (!p.email?.endsWith(`@${ALLOWED_DOMAIN}`)) return;
            setUser({ name: p.name, email: p.email, picture: p.picture });
            sheetsClientRef.current?.requestAccessToken({ prompt: "" });
          } catch {}
        },
      });
      sheetsClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SHEETS_SCOPE,
        callback: (r) => { if (r.access_token) setAccessToken(r.access_token); },
      });
      driveClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: DRIVE_SCOPE,
        callback: (r) => { if (r.access_token) setDriveToken(r.access_token); },
      });
      setReady(true);
    };
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, []);

  const requestSheetsToken = () => {
    // 이미 진행 중이면 같은 Promise 반환 (중복 호출 방지)
    if (sheetsInflightRef.current) return sheetsInflightRef.current;
    const p = new Promise((resolve) => {
      sheetsClientRef.current.callback = (r) => {
        sheetsInflightRef.current = null;
        if (r.access_token) { setAccessToken(r.access_token); resolve(r.access_token); }
        else resolve(null);
      };
      sheetsClientRef.current.requestAccessToken({ prompt: "" });
    });
    sheetsInflightRef.current = p;
    return p;
  };

  const requestDriveToken = () => {
    if (driveInflightRef.current) return driveInflightRef.current;
    const p = new Promise((resolve) => {
      driveClientRef.current.callback = (r) => {
        driveInflightRef.current = null;
        if (r.access_token) { setDriveToken(r.access_token); resolve(r.access_token); }
        else resolve(null);
      };
      driveClientRef.current.requestAccessToken();
    });
    driveInflightRef.current = p;
    return p;
  };

  const logout = () => {
    if (window.google) window.google.accounts.id.disableAutoSelect();
    setUser(null);
    setAccessToken(null);
    setDriveToken(null);
    sheetsInflightRef.current = null;
    driveInflightRef.current = null;
  };
  return { user, ready, logout, accessToken, driveToken, requestDriveToken, requestSheetsToken };
}
