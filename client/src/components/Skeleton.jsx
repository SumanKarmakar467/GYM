const Skeleton = ({ width = "100%", height = "1rem", borderRadius = "0.5rem", className = "" }) => {
  return (
    <div
      className={`animate-pulse bg-zinc-700/50 ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
};

export const SkeletonCard = () => {
  return <Skeleton height="130px" borderRadius="1rem" className="w-full border border-zinc-800/60" />;
};

export const SkeletonText = ({ width = "100%" }) => {
  return <Skeleton width={width} height="0.9rem" borderRadius="0.35rem" />;
};

export default Skeleton;
