import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";

const goalCards = [
  {
    key: "bodybuilder",
    icon: "BB",
    title: "Bodybuilder",
    description: "Hypertrophy focus for maximum muscle gain.",
    bestFor: "Size and symmetry"
  },
  {
    key: "calisthenics",
    icon: "CL",
    title: "Calisthenics",
    description: "Functional and aesthetic bodyweight progression.",
    bestFor: "Skill and control"
  },
  {
    key: "powerlifter",
    icon: "PL",
    title: "Powerlifter",
    description: "Squat, bench, and deadlift strength progression.",
    bestFor: "Raw power"
  },
  {
    key: "crossfit",
    icon: "CF",
    title: "CrossFit",
    description: "Conditioning + strength hybrid intensity.",
    bestFor: "Versatility"
  },
  {
    key: "athlete",
    icon: "AT",
    title: "Athlete",
    description: "Speed, agility, endurance, and explosiveness.",
    bestFor: "Performance"
  }
];

const environmentCards = [
  {
    key: "gym",
    title: "GYM",
    items: ["Barbells", "Dumbbells", "Machines", "Cables"]
  },
  {
    key: "home",
    title: "HOME",
    items: ["Bodyweight", "Bands", "Pull-up bar", "Dumbbells optional"]
  }
];

const durationCards = [
  { weeks: 4, label: "Kickstart" },
  { weeks: 8, label: "Foundation" },
  { weeks: 12, label: "Transformation" },
  { weeks: 24, label: "Elite" }
];

const validGenders = ["male", "female", "other"];
const validGoals = ["bodybuilder", "calisthenics", "powerlifter", "crossfit", "athlete"];
const validEnvironments = ["gym", "home"];
const validDurations = [4, 8, 12, 24];

const clampNumber = (value, min, max, fallback) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, numeric));
};

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { refreshUser } = useAuth();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    age: 24,
    weightKg: 70,
    heightFeet: 5,
    heightCmExtra: 10,
    gender: "male",
    goal: "bodybuilder",
    environment: "gym",
    durationWeeks: 8
  });

  const mediaQuery = useQuery({
    queryKey: ["onboarding-media"],
    queryFn: async () => {
      const { data } = await api.get("/media/onboarding");
      return data;
    },
    retry: false
  });

  const onboardingMedia = mediaQuery.data || {};

  const heightCm = useMemo(
    () => Math.round(form.heightFeet * 30.48 + form.heightCmExtra),
    [form.heightFeet, form.heightCmExtra]
  );

  const isStepValid = useMemo(() => {
    if (step === 1) {
      return (
        form.age >= 13 &&
        form.age <= 100 &&
        form.weightKg >= 20 &&
        form.weightKg <= 500 &&
        form.heightFeet >= 4 &&
        form.heightFeet <= 8 &&
        form.heightCmExtra >= 0 &&
        form.heightCmExtra <= 30 &&
        heightCm >= 120 &&
        heightCm <= 260
      );
    }

    if (step === 2) return Boolean(form.goal);
    if (step === 3) return Boolean(form.environment);
    return validDurations.includes(form.durationWeeks);
  }, [form, heightCm, step]);

  const next = () => {
    if (!isStepValid) return;
    setStep((prev) => Math.min(4, prev + 1));
  };

  const back = () => setStep((prev) => Math.max(1, prev - 1));

  const saveAndContinue = async () => {
    if (!isStepValid) return;

    const payload = {
      age: Math.round(clampNumber(form.age, 13, 100, 24)),
      weightKg: Math.round(clampNumber(form.weightKg, 20, 500, 70)),
      heightCm: Math.round(clampNumber(heightCm, 120, 260, 178)),
      gender: validGenders.includes(form.gender) ? form.gender : "male",
      goal: validGoals.includes(form.goal) ? form.goal : "bodybuilder",
      environment: validEnvironments.includes(form.environment) ? form.environment : "gym",
      durationWeeks: validDurations.includes(Number(form.durationWeeks)) ? Number(form.durationWeeks) : 8
    };

    setSaving(true);
    try {
      await api.post("/onboarding", payload);
      await refreshUser();

      navigate("/generating", { replace: true });
    } catch (error) {
      if (error.response?.status === 401) {
        addToast("Session expired. Please login again.", "error");
        navigate("/login", { replace: true });
        return;
      }

      const details = Array.isArray(error.response?.data?.errors)
        ? ` ${error.response.data.errors[0]}`
        : "";
      addToast(`${error.response?.data?.message || "Failed to save onboarding profile."}${details}`, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="mx-auto w-full max-w-5xl rounded-3xl border border-borderSubtle bg-black/30 p-5 md:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brandSecondary">Onboarding</p>
        <h1 className="mt-2 font-heading text-3xl md:text-4xl">Build Your Blueprint</h1>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full bg-brandPrimary transition-all" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
        <p className="mt-2 text-sm text-textSecondary">Step {step} of 4</p>

        {step === 1 ? (
          <section className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="text-sm text-textSecondary">
              Age
              <input
                type="number"
                min="13"
                max="100"
                className="input-field mt-1"
                value={form.age}
                onChange={(event) => setForm((prev) => ({ ...prev, age: Number(event.target.value) }))}
              />
            </label>
            <label className="text-sm text-textSecondary">
              Weight (kg)
              <input
                type="number"
                className="input-field mt-1"
                value={form.weightKg}
                onChange={(event) => setForm((prev) => ({ ...prev, weightKg: Number(event.target.value) }))}
              />
            </label>
            <label className="text-sm text-textSecondary">
              Height (feet)
              <input
                type="number"
                min="4"
                max="8"
                className="input-field mt-1"
                value={form.heightFeet}
                onChange={(event) => setForm((prev) => ({ ...prev, heightFeet: Number(event.target.value) }))}
              />
            </label>
            <label className="text-sm text-textSecondary">
              Additional cm
              <input
                type="number"
                min="0"
                max="30"
                className="input-field mt-1"
                value={form.heightCmExtra}
                onChange={(event) => setForm((prev) => ({ ...prev, heightCmExtra: Number(event.target.value) }))}
              />
            </label>

            <div className="md:col-span-2">
              <p className="text-sm text-textSecondary">Stored as {heightCm} cm</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  ["male", "Male"],
                  ["female", "Female"],
                  ["other", "Other"]
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`rounded-xl border px-4 py-2 text-sm ${
                      form.gender === key ? "border-brandPrimary bg-brandPrimary/20" : "border-borderSubtle"
                    }`}
                    onClick={() => setForm((prev) => ({ ...prev, gender: key }))}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 grid gap-3 sm:grid-cols-2">
              {(onboardingMedia.inputs || []).map((item) => (
                <article key={item.key} className="overflow-hidden rounded-2xl border border-borderSubtle bg-bgSecondary">
                  <img src={item.imageUrl} alt={item.title} className="h-36 w-full object-cover" loading="lazy" />
                  <div className="p-3">
                    <p className="font-heading text-base">{item.title}</p>
                    <p className="mt-1 text-xs text-textSecondary">{item.subtitle}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="mt-6 grid gap-3 md:grid-cols-2">
            {goalCards.map((card) => (
              <button
                key={card.key}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, goal: card.key }))}
                onMouseMove={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  const rotateX = ((event.clientY - rect.top) / rect.height - 0.5) * -8;
                  const rotateY = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
                  event.currentTarget.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
                }}
                className={`rounded-2xl border p-4 text-left transition ${
                  form.goal === card.key ? "border-brandPrimary bg-brandPrimary/10" : "border-borderSubtle bg-bgSecondary"
                }`}
                style={form.goal === card.key ? { animation: "pulseGlow 1.8s infinite" } : undefined}
              >
                {onboardingMedia.goals?.[card.key] ? (
                  <img
                    src={onboardingMedia.goals[card.key]}
                    alt={`${card.title} animated preview`}
                    className="h-36 w-full rounded-xl border border-borderSubtle object-cover"
                    loading="lazy"
                  />
                ) : (
                  <p className="text-2xl">{card.icon}</p>
                )}
                <h3 className="mt-3 font-heading text-lg">{card.title}</h3>
                <p className="mt-1 text-sm text-textSecondary">{card.description}</p>
                <p className="mt-2 font-mono text-xs text-brandSecondary">Best for: {card.bestFor}</p>
              </button>
            ))}
          </section>
        ) : null}

        {step === 3 ? (
          <section className="mt-6 grid gap-4 md:grid-cols-2">
            {environmentCards.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`rounded-2xl border p-5 text-left transition ${
                  form.environment === item.key
                    ? "scale-[1.02] border-brandPrimary bg-brandPrimary/10"
                    : "border-borderSubtle bg-bgSecondary opacity-75"
                }`}
                onClick={() => setForm((prev) => ({ ...prev, environment: item.key }))}
              >
                {onboardingMedia.environments?.[item.key] ? (
                  <img
                    src={onboardingMedia.environments[item.key]}
                    alt={`${item.title} setup animated preview`}
                    className="h-36 w-full rounded-xl border border-borderSubtle object-cover"
                    loading="lazy"
                  />
                ) : null}
                <h3 className="mt-3 font-heading text-2xl">{item.title}</h3>
                <ul className="mt-3 space-y-1 text-sm text-textSecondary">
                  {item.items.map((feature) => (
                    <li key={feature}>- {feature}</li>
                  ))}
                </ul>
              </button>
            ))}
          </section>
        ) : null}

        {step === 4 ? (
          <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {durationCards.map((item) => (
              <button
                key={item.weeks}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, durationWeeks: item.weeks }))}
                className={`rounded-2xl border p-4 text-left ${
                  form.durationWeeks === item.weeks ? "border-brandPrimary bg-brandPrimary/10" : "border-borderSubtle"
                }`}
              >
                <p className="font-heading text-2xl">
                  {item.weeks === 12 ? "3 Months" : item.weeks === 24 ? "6 Months" : `${item.weeks} Weeks`}
                </p>
                <p className="text-sm text-textSecondary">{item.label}</p>
              </button>
            ))}
          </section>
        ) : null}

        <div className="mt-8 flex items-center justify-between">
          <button type="button" className="btn-ghost" onClick={back} disabled={step === 1}>
            Back
          </button>

          {step < 4 ? (
            <button type="button" className="btn-primary" onClick={next} disabled={!isStepValid}>
              Continue
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={saveAndContinue} disabled={!isStepValid || saving}>
              {saving ? "Saving..." : "Generate My Plan"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
