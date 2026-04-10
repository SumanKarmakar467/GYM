import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import DumbbellLoader from "../components/animations/DumbbellLoader";
import useToast from "../hooks/useToast";

const quotes = [
  "Forging your perfect physique...",
  "Calculating optimal rep ranges...",
  "Building your transformation blueprint...",
  "Analyzing your body metrics...",
  "Programming gains just for you..."
];

const GeneratingPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const quote = quotes[quoteIndex % quotes.length];
    let charIndex = 0;
    setTyped("");

    const interval = window.setInterval(() => {
      charIndex += 1;
      setTyped(quote.slice(0, charIndex));

      if (charIndex >= quote.length) {
        window.clearInterval(interval);
      }
    }, 34);

    return () => window.clearInterval(interval);
  }, [quoteIndex]);

  useEffect(() => {
    const quoteTimer = window.setInterval(() => {
      setQuoteIndex((prev) => prev + 1);
    }, 3000);

    return () => window.clearInterval(quoteTimer);
  }, []);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        await api.post("/workout/generate");

        if (active) {
          navigate("/plan", { replace: true });
        }
      } catch (error) {
        addToast(error.response?.data?.message || "Failed to generate plan.", "error");
        navigate("/onboarding", { replace: true });
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [navigate, addToast]);

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-2xl rounded-3xl border border-borderSubtle bg-black/45 p-8 text-center md:p-10">
        <DumbbellLoader />
        <p className="mx-auto mt-10 h-8 max-w-lg font-mono text-sm text-brandSecondary">
          {typed}
          <span className="ml-1 animate-pulse">|</span>
        </p>

        <div className="mt-8 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full w-full origin-left animate-pulse bg-gradient-to-r from-brandPrimary to-brandSecondary" />
        </div>
      </div>
    </div>
  );
};

export default GeneratingPage;