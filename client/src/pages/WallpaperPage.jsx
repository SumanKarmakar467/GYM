import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import api from "../api/api";
import EmptyState from "../components/EmptyState";
import WallpaperGenerator from "../components/WallpaperGenerator";
import AppNavbar from "../components/layout/AppNavbar";

const WallpaperPage = () => {
  const previewRef = useRef(null);
  const [quote, setQuote] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Dark");
  const [loading, setLoading] = useState(true);
  const [loadingRandom, setLoadingRandom] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [hasSavedConfig, setHasSavedConfig] = useState(false);

  useEffect(() => {
    let active = true;

    const loadWallpaper = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/wallpaper");
        if (!active) {
          return;
        }

        if (data) {
          setQuote(String(data.quote || ""));
          setSelectedStyle(String(data.style || "Dark"));
          setHasSavedConfig(true);
        } else {
          setQuote("No shortcuts. Just work.");
          setSelectedStyle("Dark");
          setHasSavedConfig(false);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadWallpaper();

    return () => {
      active = false;
    };
  }, []);

  const generateRandomQuote = async () => {
    setLoadingRandom(true);
    try {
      const { data } = await api.get("/wallpaper/quote");
      setQuote(String(data?.quote || "No shortcuts. Just work."));
    } finally {
      setLoadingRandom(false);
    }
  };

  const savePreview = async () => {
    if (!quote.trim()) {
      return;
    }

    setSaving(true);
    try {
      await api.post("/wallpaper", {
        quote: quote.trim(),
        style: selectedStyle
      });
      setHasSavedConfig(true);
    } finally {
      setSaving(false);
    }
  };

  const downloadPreview = async () => {
    if (!previewRef.current || downloading) {
      return;
    }

    setDownloading(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true
      });

      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = "gymforge-wallpaper.png";
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="page-enter min-h-screen">
      <AppNavbar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-6">
        <section className="card p-6 md:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brandSecondary">Wallpaper Studio</p>
          <h1 className="mt-2 text-3xl font-bold">Motivational Wallpaper Generator</h1>
        </section>

        <div className="mt-5">
          {loading ? (
            <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
              <div className="card h-[620px] animate-pulse bg-white/5" />
              <div className="card h-[620px] animate-pulse bg-white/5" />
            </div>
          ) : (
            <>
              {!hasSavedConfig ? (
                <div className="mb-5">
                  <EmptyState
                    icon="🖼️"
                    title="No wallpaper saved yet. Create your first one."
                    subtitle="Tune your quote and style, then save a preview."
                    ctaLabel=""
                    ctaLink=""
                  />
                </div>
              ) : null}

              <WallpaperGenerator
                quote={quote}
                setQuote={setQuote}
                selectedStyle={selectedStyle}
                onSelectStyle={setSelectedStyle}
                onRandomQuote={generateRandomQuote}
                onGeneratePreview={savePreview}
                onDownload={downloadPreview}
                previewRef={previewRef}
                loadingRandom={loadingRandom}
                saving={saving}
                downloading={downloading}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default WallpaperPage;
