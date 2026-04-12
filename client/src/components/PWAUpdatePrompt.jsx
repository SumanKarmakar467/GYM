import { useRegisterSW } from "virtual:pwa-register/react";

export default function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "80px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#1a1a1a",
        border: "1px solid rgba(249,115,22,0.3)",
        borderRadius: "12px",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        zIndex: 9997,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        whiteSpace: "nowrap"
      }}
    >
      <span style={{ fontSize: "14px", color: "#aaa" }}>New version available</span>
      <button
        onClick={() => updateServiceWorker(true)}
        style={{
          background: "#f97316",
          color: "#fff",
          border: "none",
          padding: "7px 14px",
          borderRadius: "7px",
          fontSize: "13px",
          fontWeight: 700,
          cursor: "pointer"
        }}
      >
        Update now
      </button>
    </div>
  );
}
