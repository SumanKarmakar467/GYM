const styles = [
  {
    key: "Dark",
    title: "Dark",
    description: "Stealth black with subtle gradients."
  },
  {
    key: "Minimal",
    title: "Minimal",
    description: "Clean white layout with serif typography."
  },
  {
    key: "Fire",
    title: "Fire",
    description: "High-energy red/orange flame mode."
  }
];

const WallpaperGenerator = ({
  quote,
  setQuote,
  selectedStyle,
  onSelectStyle,
  onRandomQuote,
  onGeneratePreview,
  onDownload,
  previewRef,
  loadingRandom,
  saving,
  downloading
}) => {
  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
      <article className="card p-5 md:p-6">
        <h2 className="text-xl font-semibold">Controls</h2>
        <p className="mt-1 text-sm text-textSecondary">Customize your wallpaper quote and vibe.</p>

        <label className="mt-5 block text-sm text-textSecondary">Quote</label>
        <textarea
          rows={4}
          className="input-field mt-2 resize-y"
          value={quote}
          onChange={(event) => setQuote(event.target.value)}
          placeholder="Write your quote..."
        />

        <button
          type="button"
          className="btn-ghost mt-3"
          onClick={onRandomQuote}
          disabled={loadingRandom}
        >
          {loadingRandom ? "Generating..." : "Generate Random Quote"}
        </button>

        <div className="mt-6">
          <p className="text-sm text-textSecondary">Style</p>
          <div className="mt-2 grid gap-2">
            {styles.map((style) => (
              <button
                key={style.key}
                type="button"
                onClick={() => onSelectStyle(style.key)}
                className={`rounded-xl border p-3 text-left transition ${
                  selectedStyle === style.key
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-borderSubtle bg-bgPrimary hover:border-orange-500/60"
                }`}
              >
                <p className="font-semibold">{style.title}</p>
                <p className="mt-1 text-xs text-textSecondary">{style.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className="btn-primary" onClick={onGeneratePreview} disabled={saving}>
            {saving ? "Saving..." : "Generate Preview"}
          </button>
          <button type="button" className="btn-ghost" onClick={onDownload} disabled={downloading}>
            {downloading ? "Downloading..." : "Download PNG"}
          </button>
        </div>
      </article>

      <article className="card p-5 md:p-6">
        <h2 className="text-xl font-semibold">Live Preview</h2>
        <p className="mt-1 text-sm text-textSecondary">1080 × 1920 preview (scaled for display).</p>

        <div className="mt-4 flex justify-center">
          <div className="relative h-[520px] w-[290px] overflow-hidden rounded-[24px] border border-borderSubtle bg-black/40">
            <div
              ref={previewRef}
              className={`origin-top-left ${
                selectedStyle === "Dark"
                  ? "bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.22),transparent_45%),linear-gradient(160deg,#020202,#101010_65%,#181818)]"
                  : selectedStyle === "Minimal"
                    ? "border border-zinc-300 bg-white text-zinc-900"
                    : "bg-[linear-gradient(155deg,#2a0000,#7c1d00_45%,#f97316)]"
              }`}
              style={{ width: 1080, height: 1920, transform: "scale(0.26)" }}
            >
              <div className="flex h-full flex-col justify-between p-24">
                <div>
                  <p
                    className={`text-6xl font-bold tracking-[0.22em] ${
                      selectedStyle === "Minimal" ? "text-zinc-700" : "text-white/80"
                    }`}
                  >
                    GYMFORGE
                  </p>
                </div>

                <div className="space-y-6">
                  {selectedStyle === "Fire" ? <p className="text-7xl">🔥</p> : null}
                  <p
                    className={`max-w-[760px] text-8xl leading-tight ${
                      selectedStyle === "Minimal"
                        ? "font-serif text-zinc-900"
                        : selectedStyle === "Fire"
                          ? "font-extrabold text-white"
                          : "font-semibold text-white"
                    }`}
                  >
                    {quote || "No shortcuts. Just work."}
                  </p>
                </div>

                <p className={`text-4xl ${selectedStyle === "Minimal" ? "text-zinc-600" : "text-white/80"}`}>
                  Built for athletes who mean it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
};

export default WallpaperGenerator;
