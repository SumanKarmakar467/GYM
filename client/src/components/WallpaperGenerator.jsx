import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import useAuth from "../hooks/useAuth";
import useWallpaper from "../hooks/useWallpaper";

const themes = {
  "Dark Motivational": {
    bg: "linear-gradient(160deg, #05070c, #121826)",
    text: "#f5f7ff",
    accent: "#39ff14"
  },
  "Minimal White": {
    bg: "linear-gradient(180deg, #ffffff, #f4f5f8)",
    text: "#1e2433",
    accent: "#1759ff"
  },
  "Neon Gym": {
    bg: "linear-gradient(140deg, #0f0f13, #151f2b, #102f1a)",
    text: "#eaffea",
    accent: "#39ff14"
  },
  "Nature Calm": {
    bg: "linear-gradient(140deg, #243b2f, #17322b, #102124)",
    text: "#e8fff2",
    accent: "#9ef01a"
  }
};

const WallpaperGenerator = ({ todos = [] }) => {
  const { user } = useAuth();
  const { saveConfig } = useWallpaper();
  const [selectedIds, setSelectedIds] = useState([]);
  const [theme, setTheme] = useState("Dark Motivational");
  const previewRef = useRef(null);

  const selectedTodos = useMemo(
    () => todos.filter((todo) => selectedIds.includes(todo._id)),
    [todos, selectedIds]
  );

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((it) => it !== id) : [...prev, id]));
  };

  const download = async () => {
    if (!previewRef.current) return;
    const canvas = await html2canvas(previewRef.current, { scale: 2 });
    const link = document.createElement("a");
    link.download = "gymforge-wallpaper.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    await saveConfig({ selectedTodos: selectedIds, theme });
  };

  const palette = themes[theme];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="panel p-5">
        <h2 className="text-xl font-bold mb-4">Wallpaper Generator</h2>
        <p className="text-white/70 mb-4">Select exercises, choose a theme, then export PNG.</p>
        <div className="space-y-2 max-h-72 overflow-auto pr-2">
          {todos.map((todo) => (
            <label key={todo._id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
              <span>{todo.exerciseName}</span>
              <input
                type="checkbox"
                checked={selectedIds.includes(todo._id)}
                onChange={() => toggleSelect(todo._id)}
              />
            </label>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/15"
          >
            {Object.keys(themes).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <button onClick={download} className="w-full bg-accent text-black font-semibold rounded-lg py-2">
            Download as Wallpaper
          </button>
          <p className="text-xs text-white/60">Tip: On mobile, open image and choose "Set as wallpaper".</p>
        </div>
      </div>

      <div className="grid place-items-center">
        <div
          ref={previewRef}
          style={{
            width: 375,
            height: 812,
            position: "relative",
            borderRadius: 28,
            padding: 28,
            background: palette.bg,
            color: palette.text
          }}
        >
          <h3 style={{ color: palette.accent, marginTop: 0 }}>No excuses. Just progress.</h3>
          <div style={{ marginTop: 24, display: "grid", gap: 10 }}>
            {selectedTodos.length === 0 && <p style={{ opacity: 0.8 }}>Pick exercises from the list.</p>}
            {selectedTodos.map((todo) => (
              <div key={todo._id} style={{ display: "flex", gap: 10, alignItems: "center", opacity: 0.95 }}>
                <span style={{ color: palette.accent }}>✓</span>
                <span>{todo.exerciseName}</span>
              </div>
            ))}
          </div>
          <p style={{ position: "absolute", bottom: 40, color: palette.accent, fontWeight: 700 }}>
            {user?.name || "GymForge Athlete"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WallpaperGenerator;
