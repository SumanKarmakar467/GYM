const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-[#0a0a0a]">
      <div className="w-full max-w-xs px-6 text-center">
        <p
          className="text-4xl font-black tracking-[0.08em]"
          style={{ animation: "loaderPulse 1.2s ease-in-out infinite" }}
        >
          <span className="text-white">GYM</span>
          <span className="text-orange-500">FORGE</span>
        </p>

        <div className="mt-5 h-[2px] w-full overflow-hidden rounded bg-orange-500/20">
          <div
            className="h-full rounded bg-orange-500"
            style={{ width: 0, animation: "loaderProgress 1.5s ease-in-out infinite" }}
          />
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
