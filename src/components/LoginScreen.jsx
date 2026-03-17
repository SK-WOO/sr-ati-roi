import { useRef, useEffect } from "react";

export default function LoginScreen({ ready }) {
  const btnRef = useRef(null);

  useEffect(() => {
    if (!ready || !btnRef.current) return;
    window.google.accounts.id.renderButton(btnRef.current, {
      type: "standard",
      shape: "rectangular",
      theme: "outline",
      text: "signin_with",
      size: "large",
      logo_alignment: "left",
      width: 280,
    });
  }, [ready]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#1e3a5f,#1e293b)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "40px 36px",
        boxShadow: "0 20px 60px rgba(0,0,0,.3)", width: "100%", maxWidth: 360,
        textAlign: "center",
      }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🤖</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 3, marginBottom: 4 }}>
          SEOULROBOTICS
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>
          ATI ROI Calculator
        </div>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 28 }}>
          Autonomy Through Infrastructure
        </div>
        <div style={{ display: "flex", justifyContent: "center", minHeight: 44 }}>
          <div ref={btnRef} />
        </div>
        {!ready && (
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 12 }}>Loading...</div>
        )}
        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 16 }}>
          회사 Google Workspace 계정만 접근 가능합니다
        </p>
      </div>
    </div>
  );
}
