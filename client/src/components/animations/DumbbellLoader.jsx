import { useMemo } from "react";

const colors = ["#FF6B35", "#FFB347", "#FF8C5A", "#FFCC80"];

const DumbbellLoader = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, index) => ({
        id: index,
        left: 8 + index * 7,
        delay: `${(index % 6) * 0.15}s`,
        color: colors[index % colors.length]
      })),
    []
  );

  return (
    <div className="relative flex flex-col items-center">
      <svg viewBox="0 0 200 80" className="h-24 w-[220px]" style={{ animation: "spin3d 1.5s linear infinite" }}>
        <circle cx="20" cy="40" r="18" fill="#2B2B35" />
        <circle cx="40" cy="40" r="14" fill="#3C3C48" />
        <rect x="40" y="34" width="120" height="12" rx="6" fill="#9CA3AF" />
        <circle cx="160" cy="40" r="14" fill="#3C3C48" />
        <circle cx="180" cy="40" r="18" fill="#2B2B35" />
      </svg>
      <div className="pointer-events-none absolute bottom-0 h-20 w-36">
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="absolute bottom-2 h-2.5 w-2.5 rounded-full"
            style={{
              left: `${particle.left}%`,
              backgroundColor: particle.color,
              animation: `fireRise 1.1s ease-out infinite ${particle.delay}`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default DumbbellLoader;