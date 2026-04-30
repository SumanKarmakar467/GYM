const widthCycle = ["w-full", "w-5/6", "w-2/3", "w-3/4", "w-1/2"];

export default function SkeletonCard({ lines = 3 }) {
  const count = Number.isFinite(lines) && lines > 0 ? Math.floor(lines) : 3;

  return (
    <div className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="h-4 w-28 rounded bg-white/10" />
      <div className="mt-4 space-y-2.5">
        {Array.from({ length: count }).map((_, index) => (
          <div key={`line-${index}`} className={`h-3 rounded bg-white/10 ${widthCycle[index % widthCycle.length]}`} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SkeletonCard lines={4} />
      <SkeletonCard lines={3} />
      <SkeletonCard lines={5} />
      <SkeletonCard lines={3} />
    </div>
  );
}
