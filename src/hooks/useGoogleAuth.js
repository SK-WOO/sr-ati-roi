import { useState, useEffect, useRef } from "react";
import { CLIENT_ID, ALLOWED_DOMAIN, SHEETS_SCOPE, DRIVE_SCOPE } from "../constants";

export default function useGoogleAuth() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [driveToken, setDriveToken] = useState(null);
  const sheetsClientRef = useRef(null);
  const driveClientRef = useRef(null);

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
            const p = JSON.parse(atob(res.credential.split(".")[1]));
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

  const requestDriveToken = () => new Promise((resolve) => {
    driveClientRef.current.callback = (r) => {
      if (r.access_token) { setDriveToken(r.access_token); resolve(r.access_token); }
      else resolve(null);
    };
    driveClientRef.current.requestAccessToken();
  });

  const logout = () => {
    if (window.google) window.google.accounts.id.disableAutoSelect();
    setUser(null);
    setAccessToken(null);
    setDriveToken(null);
  };
  return { user, ready, logout, accessToken, driveToken, requestDriveToken };
}
