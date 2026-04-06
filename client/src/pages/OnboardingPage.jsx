import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const goals = [
  "Aesthetic",
  "Bodybuilder",
  "Fat Loss",
  "Maintain Health",
  "Strength & Power",
  "Functional Fitness"
];

const levels = ["Beginner", "Intermediate", "Advanced"];

const locations = [
  { key: "Home", text: "Dumbbells, bodyweight, resistance bands, and compact equipment." },
  { key: "Gym", text: "Full racks, barbells, machines, cables, and free weights." }
];

const genders = ["Male", "Female", "Other"];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    height: "",
    weight: "",
    age: "",
    gender: "Male",
    goal: "",
    location: "Home",
    level: "Beginner"
  });

  if (user?.onboardingComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  const stepValid = useMemo(() => {
    if (step === 1) {
      return Number(form.height) > 0 && Number(form.weight) > 0 && Number(form.age) > 0 && !!form.gender;
    }

    if (step === 2) {
      return !!form.goal;
    }

    if (step === 3) {
      return !!form.location;
    }

    return !!form.level;
  }, [form, step]);

  const goNext = () => {
    if (!stepValid) return;
    setStep((prev) => Math.min(4, prev + 1));
  };

  const goBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const submit = () => {
    if (!stepValid) return;

    navigate("/generating", {
      state: {
        onboardingData: {
          height: Number(form.height),
          weight: Number(form.weight),
          age: Number(form.age),
          gender: form.gender,
          goal: form.goal,
          location: form.location,
          level: form.level
        }
      }
    });
  };

  return (
    <div className="min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-surface p-6 sm:p-8">
        <h1 className="font-heading text-5xl text-zinc-100">Onboarding</h1>
        <p className="mt-1 text-zinc-400">Step {step} of 4</p>

        <div className="mt-5 flex items-center gap-2">
          {[1, 2, 3, 4].map((item) => (
            <span
              key={item}
              className={`h-2.5 flex-1 rounded-full transition ${item <= step ? "bg-fire" : "bg-zinc-700"}`}
            />
          ))}
        </div>

        {step === 1 ? (
          <section className="mt-7 space-y-4">
            <h2 className="font-heading text-4xl">Body Stats</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                type="number"
                className="input-dark"
                placeholder="Height (cm)"
                value={form.height}
                onChange={(event) => setForm((prev) => ({ ...prev, height: event.target.value }))}
                required
              />
              <input
                type="number"
                className="input-dark"
                placeholder="Weight (kg)"
                value={form.weight}
                onChange={(event) => setForm((prev) => ({ ...prev, weight: event.target.value }))}
                required
              />
              <input
                type="number"
                className="input-dark"
                placeholder="Age"
                value={form.age}
                onChange={(event) => setForm((prev) => ({ ...prev, age: event.target.value }))}
                required
              />
            </div>
            <select
              className="input-dark"
              value={form.gender}
              onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
            >
              {genders.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="mt-7">
            <h2 className="font-heading text-4xl">Select Goal</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {goals.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, goal }))}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    form.goal === goal
                      ? "border-fire bg-[rgba(255,77,0,0.15)] text-zinc-100"
                      : "border-white/10 bg-card text-zinc-300 hover:border-fire"
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="mt-7">
            <h2 className="font-heading text-4xl">Training Location</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {locations.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, location: item.key }))}
                  className={`rounded-2xl border p-4 text-left transition ${
                    form.location === item.key
                      ? "border-fire bg-[rgba(255,77,0,0.15)]"
                      : "border-white/10 bg-card hover:border-fire"
                  }`}
                >
                  <p className="font-heading text-3xl">{item.key}</p>
                  <p className="mt-1 text-sm text-zinc-400">{item.text}</p>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {step === 4 ? (
          <section className="mt-7">
            <h2 className="font-heading text-4xl">Experience Level</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {levels.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, level }))}
                  className={`rounded-2xl border px-4 py-4 transition ${
                    form.level === level
                      ? "border-fire bg-[rgba(255,77,0,0.15)]"
                      : "border-white/10 bg-card hover:border-fire"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-7 flex items-center justify-between">
          <button type="button" onClick={goBack} className="btn-ghost" disabled={step === 1}>
            Back
          </button>

          {step < 4 ? (
            <button type="button" onClick={goNext} className="btn-primary" disabled={!stepValid}>
              Continue
            </button>
          ) : (
            <button type="button" onClick={submit} className="btn-primary" disabled={!stepValid}>
              Generate My Plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
