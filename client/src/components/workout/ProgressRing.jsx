import { useEffect, useMemo, useState } from "react";

const circumference = 314;

const ProgressRing = ({ percent = 0, label = "this week" }) => {
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => setAnimatedPercent(Math.max(0, Math.min(100, percent))), 80);
    return () => window.clearTimeout(timeout);
  }, [percent]);

  const offset = useMemo(() => circumference * (1 - animatedPercent / 100), [animatedPercent]);

  return (
    <div className="grid place-items-center gap-3">
      <div className="relative h-[120px] w-[120px]">
        <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
          <circle cx="60" cy="60" r="50" stroke="var(--border-subtle)" strokeWidth="10" fill="none" />
          <circle
            cx="60"
            cy="60"
            r="50"
            stroke="var(--color-primary)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <p className="font-cond text-3xl font-bold leading-none text-chalk">{Math.round(animatedPercent)}%</p>
        </div>
      </div>
      <p className="text-xs uppercase tracking-wide text-mist">{label}</p>
    </div>
  );
};

export default ProgressRing;
