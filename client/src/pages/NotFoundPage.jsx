import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[#0a0a0a] px-4 text-center">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.22)_0%,rgba(249,115,22,0.08)_45%,transparent_72%)]"
        style={{ animation: "pulse 4s ease-in-out infinite" }}
      />

      <div className="relative z-10">
        <p className="text-8xl font-black text-[#f97316]">404</p>
        <h1 className="mt-3 text-2xl font-bold text-white">This page got lost on leg day.</h1>
        <p className="mt-2 text-sm text-zinc-300">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="mt-7 inline-flex rounded-xl border border-orange-500/60 bg-orange-500/15 px-5 py-2.5 text-sm font-semibold text-orange-200 hover:bg-orange-500/25"
        >
          Go Back Home →
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
