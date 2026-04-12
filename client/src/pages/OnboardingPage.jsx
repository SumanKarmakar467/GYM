import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";

const wizardSteps = [
  {
    key: "goal",
    title: "Fitness Goal",
    subtitle: "Choose what you want to prioritize first.",
    options: ["Burn Fat", "Build Muscle", "Improve Endurance"]
  },
  {
    key: "level",
    title: "Experience Level",
    subtitle: "Tell us your current training level.",
    options: ["Beginner", "Intermediate", "Advanced"]
  },
  {
    key: "duration",
    title: "Plan Duration",
    subtitle: "Choose how long you want the program to run.",
    options: ["1 week", "1 month", "3 months", "6 months"]
  },
  {
    key: "equipment",
    title: "Equipment Access",
    subtitle: "Select what equipment you have available.",
    options: ["Full Gym", "Home Gym", "Bodyweight Only"]
  }
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState({ goal: "", level: "", duration: "", equipment: "" });
  const [loading, setLoading] = useState(false);

  const currentStep = wizardSteps[step - 1];

  const selectedValue = useMemo(() => answers[currentStep.key], [answers, currentStep.key]);
  const progressPercent = `${(step / wizardSteps.length) * 100}%`;

  const chooseOption = (option) => {
    if (loading) return;
    setAnswers((prev) => ({ ...prev, [currentStep.key]: option }));
  };

  const goBack = () => {
    if (loading || step === 1) return;
    setDirection(-1);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const goNext = () => {
    if (!selectedValue || loading || step === wizardSteps.length) return;
    setDirection(1);
    setStep((prev) => Math.min(wizardSteps.length, prev + 1));
  };

  const generatePlan = async () => {
    if (!selectedValue || loading) return;

    setLoading(true);
    const loadingToastId = toast.loading("Forging your plan...");

    try {
      await api.post("/workout/generate", answers);
      toast.dismiss(loadingToastId);
      toast.success("Your plan is ready!");
      navigate("/workout", { replace: true });
    } catch {
      toast.dismiss(loadingToastId);
      toast.error("Could not generate plan. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell grid items-center">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-borderSubtle bg-bgSecondary p-6 md:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brandSecondary">Onboarding</p>
        <h1 className="mt-2 text-3xl font-bold">Step {step} of 4</h1>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full bg-brandPrimary"
            style={{ width: progressPercent, transition: prefersReducedMotion ? "none" : "width 0.4s ease" }}
          />
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.section
            key={currentStep.key}
            custom={direction}
            initial={prefersReducedMotion ? false : (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 })}
            animate={prefersReducedMotion ? false : { x: 0, opacity: 1 }}
            exit={prefersReducedMotion ? false : (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 })}
            transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: "easeInOut" }}
            className="mt-6"
          >
            <h2 className="text-2xl font-semibold">{currentStep.title}</h2>
            <p className="mt-1 text-textSecondary">{currentStep.subtitle}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label={currentStep.title}>
              {currentStep.options.map((option) => {
                const active = selectedValue === option;

                return (
                  <motion.button
                    key={option}
                    type="button"
                    disabled={loading}
                    onClick={() => chooseOption(option)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        chooseOption(option);
                      }
                    }}
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.03, borderColor: "rgba(249,115,22,0.5)" }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                    role="radio"
                    aria-checked={active}
                    tabIndex={0}
                    className={`relative rounded-2xl border p-4 text-left ${
                      active
                        ? "border-orange-400 bg-orange-500/15"
                        : "border-borderSubtle bg-bgPrimary hover:border-orange-400/70 focus-visible:border-orange-400/70"
                    }`}
                    style={{ transition: prefersReducedMotion ? "none" : "border-color 0.2s ease, background-color 0.2s ease" }}
                  >
                    <p className="text-base font-semibold">{option}</p>
                    {active ? (
                      <span className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-400 text-xs font-bold text-black">
                        ?
                      </span>
                    ) : null}
                  </motion.button>
                );
              })}
            </div>
          </motion.section>
        </AnimatePresence>

        {loading ? (
          <div className="mt-5 inline-flex items-center gap-3 rounded-xl border border-brandPrimary/30 bg-brandPrimary/10 px-4 py-3 text-sm">
            <span>Forging your plan</span>
            <span className="flex items-center gap-1">
              {[0, 1, 2].map((dot) => (
                <motion.span
                  key={dot}
                  animate={prefersReducedMotion ? false : { y: [0, -8, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: prefersReducedMotion ? 0 : 0.8,
                    delay: prefersReducedMotion ? 0 : dot * 0.2
                  }}
                  className="h-1.5 w-1.5 rounded-full bg-brandPrimary"
                />
              ))}
            </span>
          </div>
        ) : null}

        <div className="mt-8 flex items-center justify-between">
          <button type="button" className="btn-ghost" onClick={goBack} disabled={step === 1 || loading}>
            Back
          </button>

          {step < 4 ? (
            <button type="button" className="btn-primary" onClick={goNext} disabled={!selectedValue || loading}>
              Next
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={generatePlan} disabled={!selectedValue || loading}>
              Generate Plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
