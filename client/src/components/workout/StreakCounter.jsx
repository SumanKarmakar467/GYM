import { useEffect, useState } from "react";

const StreakCounter = ({ streak = 0 }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 800;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(streak * eased));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [streak]);

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2">
        <p className="font-display text-7xl leading-none text-brandPrimary">{display}</p>
        <span className="rounded-full border border-brandPrimary/60 px-2 py-0.5 text-xs font-semibold text-brandSecondary" style={{ animation: "flamePulse 1.1s ease-in-out infinite" }}>
          HOT
        </span>
      </div>
      <p className="-mt-1 text-xs uppercase tracking-[0.18em] text-textSecondary">Day Streak</p>
    </div>
  );
};

export default StreakCounter;
