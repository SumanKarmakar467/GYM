import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";
import useAuth from "../hooks/useAuth";

const statusMessages = [
  "Analyzing your body metrics...",
  "Building your workout split...",
  "Selecting exercises for your goal...",
  "Optimizing rest & recovery...",
  "Your plan is ready!"
];

const GeneratingPage = () => {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const { user, refreshUser } = useAuth();
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState("");

  const onboardingData = useMemo(() => routeLocation.state?.onboardingData || null, [routeLocation.state]);

  useEffect(() => {
    if (!onboardingData) {
      if (user?.onboardingComplete) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
      return undefined;
    }

    let active = true;

    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % statusMessages.length);
    }, 550);

    const startedAt = Date.now();
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const next = Math.min(95, (elapsed / 2500) * 100);
      setProgress(next);
    }, 40);

    const generate = async () => {
      try {
        await api.post("/workout/generate", onboardingData);
        await refreshUser();

        if (!active) return;

        setMessageIndex(statusMessages.length - 1);
        setProgress(100);

        setTimeout(() => {
          if (active) {
            navigate("/dashboard", { replace: true });
          }
        }, 500);
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || "Failed to generate workout plan.");
      }
    };

    generate();

    return () => {
      active = false;
      clearInterval(messageTimer);
      clearInterval(progressTimer);
    };
  }, [navigate, onboardingData, refreshUser, user?.onboardingComplete]);

  return (
    <div className="min-h-screen grid place-items-center px-5">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-surface p-8 text-center">
        <h1 className="font-heading text-5xl">Generating Plan</h1>

        <div className="mt-8 flex justify-center">
          <div className="barbell-wrap" aria-hidden="true">
            <span className="plate plate-left-outer" />
            <span className="plate plate-left-inner" />
            <span className="bar" />
            <span className="plate plate-right-inner" />
            <span className="plate plate-right-outer" />
          </div>
        </div>

        <p className="mt-6 text-zinc-300">{statusMessages[messageIndex]}</p>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full transition-all duration-200"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, var(--fire), var(--gold))" }}
          />
        </div>

        {error ? (
          <div className="mt-5 rounded-xl border border-rose-600/60 bg-rose-900/20 p-4">
            <p className="text-sm text-rose-300">{error}</p>
            <button type="button" className="btn-ghost mt-3" onClick={() => navigate("/onboarding", { replace: true })}>
              Back To Onboarding
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default GeneratingPage;
