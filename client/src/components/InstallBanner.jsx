import { useEffect, useState } from "react";
import { usePWAInstall } from "../hooks/usePWAInstall";

export default function InstallBanner() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const wasDismissed = localStorage.getItem("gymforge-banner-dismissed");
    if (wasDismissed) return undefined;
    if (isInstalled) return undefined;
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, [isInstalled]);

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem("gymforge-banner-dismissed", "1");
  };

  if (!isMobile || !visible || dismissed || isInstalled || (!isInstallable && !isIOS)) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#111",
        borderTop: "1px solid rgba(249,115,22,0.3)",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        zIndex: 9998,
        animation: "fadeUp 0.4s ease"
      }}
    >
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "10px",
          background: "#0a0a0a",
          border: "1px solid rgba(249,115,22,0.3)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }}
      >
        <span style={{ fontSize: "9px", fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>GYM</span>
        <span style={{ fontSize: "7px", fontWeight: 900, color: "#f97316", letterSpacing: "-0.5px" }}>FORGE</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: "#fff" }}>Install GymForge</p>
        <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>Add to home screen - free, no app store</p>
      </div>
      <button
        onClick={async () => {
          await install();
          if (!isIOS) dismiss();
        }}
        style={{
          background: "#f97316",
          color: "#fff",
          border: "none",
          padding: "9px 16px",
          borderRadius: "8px",
          fontWeight: 700,
          fontSize: "13px",
          cursor: "pointer",
          flexShrink: 0,
          whiteSpace: "nowrap"
        }}
      >
        Install
      </button>
      <button
        onClick={dismiss}
        style={{
          background: "none",
          border: "none",
          color: "#444",
          cursor: "pointer",
          fontSize: "20px",
          padding: "4px",
          flexShrink: 0
        }}
      >
        ✕
      </button>
    </div>
  );
}
