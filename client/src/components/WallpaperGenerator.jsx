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

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayLabels = ["Mon", "", "Wed", "", "Fri", "", ""];

const chunkWeeks = (days = []) =>
  Array.from({ length: Math.ceil(days.length / 7) }).map((_, index) => days.slice(index * 7, index * 7 + 7));

const getCellClass = (day) => {
  if (!day || day.state === "blank") {
    return day?.urgent ? "bg-red-500 shadow-[0_0_18px_rgba(239,68,68,0.45)]" : "bg-white/10";
  }

  if (day.state === "missed") {
    return day.percent === 0 ? "bg-red-600" : "bg-red-500/80";
  }

  if (day.state === "partial") {
    if (day.percent >= 75) return "bg-emerald-400";
    if (day.percent >= 50) return "bg-emerald-500/80";
    return "bg-emerald-700";
  }

  return "bg-emerald-400";
};

const WallpaperProgressHeatmap = ({ days = [], compact = false }) => {
  const weeks = chunkWeeks(days);
  const today = days[days.length - 1] || { total: 0, completed: 0, percent: 0, urgent: true, state: "blank" };
  const missedDays = days.filter((day) => day.state === "missed" || day.urgent).length;
  const completedDays = days.filter((day) => day.state === "done").length;

  return (
    <div className={`${compact ? "rounded-[34px] bg-black/30 p-8" : "rounded-2xl border border-borderSubtle bg-bgPrimary p-4"}`}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className={`${compact ? "text-4xl" : "text-sm"} font-bold uppercase tracking-[0.18em] text-white/80`}>Workout commits</p>
          <p className={`${compact ? "mt-3 text-6xl" : "mt-1 text-xl"} font-black ${today.urgent || today.state === "missed" ? "text-red-300" : "text-emerald-300"}`}>
            {today.total > 0 ? `${today.percent}% today` : "No workout today"}
          </p>
          <p className={`${compact ? "mt-2 text-3xl" : "mt-1 text-xs"} text-white/60`}>
            {today.completed}/{today.total} done | {missedDays} missed | {completedDays} green days
          </p>
        </div>
        <div className={`${compact ? "text-3xl" : "text-xs"} text-white/55`}>
          <span className="text-red-300">Red</span> means missed
        </div>
      </div>

      <div className={`${compact ? "mt-10" : "mt-4"}`}>
        <div className="grid gap-1" style={{ gridTemplateColumns: `28px repeat(${Math.max(weeks.length, 1)}, minmax(0, 1fr))` }}>
          <div />
          {weeks.map((week, index) => {
            const first = week[0]?.date ? new Date(`${week[0].date}T12:00:00`) : null;
            const previous = weeks[index - 1]?.[0]?.date ? new Date(`${weeks[index - 1][0].date}T12:00:00`) : null;
            const showMonth = first && (!previous || first.getMonth() !== previous.getMonth());
            return (
              <span key={`month-${index}`} className={`${compact ? "text-2xl" : "text-[10px]"} truncate text-center text-white/60`}>
                {showMonth ? monthLabels[first.getMonth()] : ""}
              </span>
            );
          })}

          {dayLabels.map((label, rowIndex) => (
            <div key={`row-${rowIndex}`} className="contents">
              <span className={`${compact ? "text-2xl" : "text-[10px]"} flex items-center text-white/60`}>{label}</span>
              {weeks.map((week, weekIndex) => {
                const day = week[rowIndex];
                return (
                  <span
                    key={`${weekIndex}-${rowIndex}`}
                    title={day ? `${day.date}: ${day.completed}/${day.total}` : ""}
                    className={`${compact ? "h-7 w-7 rounded-md" : "h-3 w-3 rounded-[3px]"} ${getCellClass(day)}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <div className={`mt-5 flex items-center justify-end gap-2 ${compact ? "text-2xl" : "text-[11px]"} text-white/55`}>
          <span>Less</span>
          <span className={`${compact ? "h-6 w-6" : "h-3 w-3"} rounded-sm bg-white/10`} />
          <span className={`${compact ? "h-6 w-6" : "h-3 w-3"} rounded-sm bg-emerald-700`} />
          <span className={`${compact ? "h-6 w-6" : "h-3 w-3"} rounded-sm bg-emerald-500/80`} />
          <span className={`${compact ? "h-6 w-6" : "h-3 w-3"} rounded-sm bg-emerald-400`} />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

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
  downloading,
  progressDays = []
}) => {
  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
      <article className="card p-5 md:p-6">
        <h2 className="text-xl font-semibold">Controls</h2>
        <p className="mt-1 text-sm text-textSecondary">Customize your wallpaper quote and live progress tracker.</p>

        <label className="mt-5 block text-sm text-textSecondary">Quote</label>
        <textarea
          rows={4}
          className="input-field mt-2 resize-y"
          value={quote}
          onChange={(event) => setQuote(event.target.value)}
          placeholder="Write your quote..."
        />

        <button type="button" className="btn-ghost mt-3" onClick={onRandomQuote} disabled={loadingRandom}>
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

        <div className="mt-6 rounded-xl border border-borderSubtle bg-bgPrimary p-3">
          <p className="text-sm font-semibold">Live workout contribution tracker</p>
          <p className="mt-1 text-xs leading-5 text-textSecondary">
            The phone wallpaper refreshes from your todos every 30 seconds. Green means completed, red means missed, and blank means no workout was planned.
          </p>
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
        <p className="mt-1 text-sm text-textSecondary">1080 x 1920 preview with real-time workout commits.</p>

        <div className="mt-4 flex justify-center">
          <div className="relative h-[520px] w-[292px] overflow-hidden rounded-[24px] border border-borderSubtle bg-black/40">
            <div
              ref={previewRef}
              className={`origin-top-left ${
                selectedStyle === "Dark"
                  ? "bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.22),transparent_45%),linear-gradient(160deg,#020202,#101010_65%,#181818)]"
                  : selectedStyle === "Minimal"
                    ? "border border-zinc-300 bg-white text-zinc-900"
                    : "bg-[linear-gradient(155deg,#2a0000,#7c1d00_45%,#f97316)]"
              }`}
              style={{ width: 1080, height: 1920, transform: "scale(0.27)" }}
            >
              <div className="flex h-full flex-col justify-between p-20">
                <p className={`text-6xl font-bold tracking-[0.22em] ${selectedStyle === "Minimal" ? "text-zinc-700" : "text-white/80"}`}>
                  GYMFORGE
                </p>

                <WallpaperProgressHeatmap days={progressDays} compact />

                <div className="space-y-6">
                  {selectedStyle === "Fire" ? <p className="text-7xl">FIRE</p> : null}
                  <p
                    className={`max-w-[760px] text-7xl leading-tight ${
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
                  Green when you complete. Red when you miss.
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
