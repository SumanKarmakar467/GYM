import { useState } from "react";
import { usePWAInstall } from "../hooks/usePWAInstall";

export default function DownloadAppButton({ variant = "hero" }) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  const handleClick = async () => {
    if (isInstalled || justInstalled) return;

    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (isInstallable) {
      setInstalling(true);
      const success = await install();
      setInstalling(false);
      if (success) setJustInstalled(true);
      return;
    }

    setShowIOSModal(true);
  };

  const isHero = variant === "hero";

  if (isInstalled || justInstalled) {
    return (
      <button
        disabled
        style={{
          background: "rgba(249,115,22,0.1)",
          border: "1px solid rgba(249,115,22,0.3)",
          color: "#f97316",
          padding: isHero ? "14px 28px" : "10px 20px",
          borderRadius: "10px",
          fontSize: isHero ? "15px" : "13px",
          fontWeight: 700,
          cursor: "default",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}
      >
        <span>✓</span> App Installed
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        style={{
          background: isHero ? "#f97316" : "transparent",
          border: isHero ? "none" : "1px solid rgba(249,115,22,0.5)",
          color: "#fff",
          padding: isHero ? "14px 28px" : "10px 20px",
          borderRadius: "10px",
          fontSize: isHero ? "15px" : "13px",
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "all 0.2s",
          position: "relative",
          overflow: "hidden"
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.transform = "translateY(-2px)";
          if (isHero) event.currentTarget.style.boxShadow = "0 8px 24px rgba(249,115,22,0.4)";
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.transform = "translateY(0)";
          event.currentTarget.style.boxShadow = "none";
        }}
      >
        {installing ? (
          <>
            <span
              style={{
                width: "14px",
                height: "14px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "#fff",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                display: "inline-block"
              }}
            />
            Installing...
          </>
        ) : (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {isHero ? "Download App - Free" : "Download App"}
          </>
        )}
      </button>

      {showIOSModal && (
        <div
          onClick={() => setShowIOSModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 9999,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: "0 16px 16px"
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              background: "#1a1a1a",
              border: "1px solid rgba(249,115,22,0.2)",
              borderRadius: "20px",
              padding: "28px",
              width: "100%",
              maxWidth: "420px",
              animation: "fadeUp 0.3s ease"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px"
              }}
            >
              <span style={{ fontWeight: 700, fontSize: "17px" }}>Install GymForge</span>
              <button
                onClick={() => setShowIOSModal(false)}
                style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "20px" }}
              >
                ✕
              </button>
            </div>

            {isIOS ? (
              <div>
                <p style={{ color: "#aaa", fontSize: "14px", marginBottom: "20px", lineHeight: 1.6 }}>
                  To install GymForge on your iPhone:
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {[
                    { n: "1", text: "Tap the Share button at the bottom of Safari" },
                    { n: "2", text: "Scroll down and tap Add to Home Screen" },
                    { n: "3", text: "Tap Add in the top right corner" }
                  ].map((step) => (
                    <div key={step.n} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: "rgba(249,115,22,0.15)",
                          border: "1px solid rgba(249,115,22,0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#f97316",
                          fontWeight: 700,
                          fontSize: "14px",
                          flexShrink: 0
                        }}
                      >
                        {step.n}
                      </div>
                      <p style={{ color: "#aaa", fontSize: "14px", margin: 0, lineHeight: 1.5, paddingTop: "6px" }}>
                        {step.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p style={{ color: "#aaa", fontSize: "14px", marginBottom: "20px", lineHeight: 1.6 }}>
                  To install GymForge on your device:
                </p>
                {[
                  { n: "1", text: "Open this site in Chrome or Edge" },
                  { n: "2", text: "Tap the menu in the top right" },
                  { n: "3", text: "Tap Add to Home Screen or Install App" }
                ].map((step) => (
                  <div
                    key={step.n}
                    style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "14px" }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "rgba(249,115,22,0.15)",
                        border: "1px solid rgba(249,115,22,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#f97316",
                        fontWeight: 700,
                        fontSize: "14px",
                        flexShrink: 0
                      }}
                    >
                      {step.n}
                    </div>
                    <p style={{ color: "#aaa", fontSize: "14px", margin: 0, lineHeight: 1.5, paddingTop: "6px" }}>
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
