import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    key: "daysPerWeek",
    title: "Days Per Week",
    subtitle: "Pick your weekly commitment.",
    options: ["3 days", "4 days", "5 days", "6 days"]
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
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({ goal: "", level: "", daysPerWeek: "", equipment: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentStep = wizardSteps[step - 1];

  const selectedValue = useMemo(
    () => answers[currentStep.key],
    [answers, currentStep.key]
  );

  const progressPercent = `${(step / wizardSteps.length) * 100}%`;

  const chooseOption = (option) => {
    if (loading) return;
    setError("");
    setAnswers((prev) => ({ ...prev, [currentStep.key]: option }));
  };

  const goBack = () => {
    if (loading) return;
    setError("");
    setStep((prev) => Math.max(1, prev - 1));
  };

  const goNext = () => {
    if (!selectedValue || loading) return;
    setError("");
    setStep((prev) => Math.min(wizardSteps.length, prev + 1));
  };

  const generatePlan = async () => {
    if (!selectedValue || loading) return;

    setLoading(true);
    setError("");

    try {
      await api.post("/workout/generate", answers);
      navigate("/workout", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not generate your workout plan. Please try again.");
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
          <div className="h-full bg-brandPrimary transition-all duration-300" style={{ width: progressPercent }} />
        </div>

        <section className="mt-6">
          <h2 className="text-2xl font-semibold">{currentStep.title}</h2>
          <p className="mt-1 text-textSecondary">{currentStep.subtitle}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {currentStep.options.map((option) => {
              const active = selectedValue === option;

              return (
                <button
                  key={option}
                  type="button"
                  disabled={loading}
                  onClick={() => chooseOption(option)}
                  className={`relative rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-brandPrimary bg-brandPrimary/10"
                      : "border-borderSubtle bg-bgPrimary hover:-translate-y-0.5 hover:border-brandPrimary/70"
                  }`}
                >
                  <p className="text-base font-semibold">{option}</p>
                  {active ? (
                    <span className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brandPrimary text-xs font-bold text-black">
                      ✓
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>

        {error ? (
          <p className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>
        ) : null}

        {loading ? (
          <div className="mt-5 inline-flex items-center gap-3 rounded-xl border border-brandPrimary/30 bg-brandPrimary/10 px-4 py-3 text-sm">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-brandPrimary border-r-transparent" />
            Forging your plan…
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
