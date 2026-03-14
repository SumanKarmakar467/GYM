import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import useAuth from "../hooks/useAuth";

const goalCards = [
  { key: "athlete", title: "Athlete", icon: "⚡", desc: "Power and explosiveness" },
  { key: "bodybuilder", title: "Bodybuilder", icon: "💪", desc: "High volume muscle gain" },
  { key: "weight_loss", title: "Weight Loss", icon: "🔥", desc: "Fat burn and conditioning" },
  { key: "maintain_health", title: "Maintain Health", icon: "🫀", desc: "Balanced fitness routine" },
  { key: "flexibility", title: "Flexibility", icon: "🧘", desc: "Mobility and recovery" }
];

const steps = 4;

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    weight: "",
    height: "",
    goal: "",
    workoutLocation: "home"
  });

  const bmi = useMemo(() => {
    if (!form.weight || !form.height) return null;
    const h = Number(form.height) / 100;
    if (!h) return null;
    return (Number(form.weight) / (h * h)).toFixed(1);
  }, [form.weight, form.height]);

  const validateStep = () => {
    if (step === 1) return form.name.length > 1 && form.email.includes("@") && form.password.length >= 6;
    if (step === 2) return Number(form.age) > 0 && Number(form.weight) > 0 && Number(form.height) > 0;
    if (step === 3) return !!form.goal;
    if (step === 4) return !!form.workoutLocation;
    return false;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(steps, s + 1));
  };

  const prev = () => setStep((s) => Math.max(1, s - 1));

  const submit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError("");
    try {
      await register({
        ...form,
        age: Number(form.age),
        weight: Number(form.weight),
        height: Number(form.height)
      });
      await api.post("/workout/generate");
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Onboarding failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto panel p-6">
        <div className="mb-6">
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-accent transition-all duration-300" style={{ width: `${(step / steps) * 100}%` }} />
          </div>
          <p className="text-xs text-white/60 mt-2">Step {step} of 4</p>
        </div>

        <div className="animate-fade-slide-in">
          {step === 1 && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold">Basic Profile</h2>
              <input
                className="w-full rounded-lg bg-black/30 border border-white/15 px-3 py-2"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
              <input
                className="w-full rounded-lg bg-black/30 border border-white/15 px-3 py-2"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
              <input
                className="w-full rounded-lg bg-black/30 border border-white/15 px-3 py-2"
                placeholder="Password (min 6)"
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold">Body Metrics</h2>
              <div className="grid md:grid-cols-3 gap-3">
                <input
                  className="rounded-lg bg-black/30 border border-white/15 px-3 py-2"
                  placeholder="Age"
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                />
                <input
                  className="rounded-lg bg-black/30 border border-white/15 px-3 py-2"
                  placeholder="Weight kg"
                  type="number"
                  value={form.weight}
                  onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))}
                />
                <input
                  className="rounded-lg bg-black/30 border border-white/15 px-3 py-2"
                  placeholder="Height cm"
                  type="number"
                  value={form.height}
                  onChange={(e) => setForm((p) => ({ ...p, height: e.target.value }))}
                />
              </div>
              {bmi && <p className="text-white/80">BMI preview: {bmi}</p>}
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold mb-3">Choose Your Goal</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {goalCards.map((goal) => (
                  <button
                    key={goal.key}
                    onClick={() => setForm((p) => ({ ...p, goal: goal.key }))}
                    className={`text-left rounded-xl p-4 border transition ${
                      form.goal === goal.key ? "border-accent bg-accent/10" : "border-white/10 bg-white/5"
                    }`}
                  >
                    <p className="text-lg">{goal.icon}</p>
                    <p className="font-semibold">{goal.title}</p>
                    <p className="text-sm text-white/70">{goal.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold mb-3">Workout Location</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {["home", "gym"].map((place) => (
                  <button
                    key={place}
                    onClick={() => setForm((p) => ({ ...p, workoutLocation: place }))}
                    className={`rounded-xl p-6 border transition-transform duration-300 ${
                      form.workoutLocation === place
                        ? "border-accent bg-accent/10 -translate-y-1"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <p className="text-lg font-bold capitalize">{place}</p>
                    <p className="text-sm text-white/70">
                      {place === "home" ? "Bodyweight + resistance bands" : "Full equipment access"}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

        <div className="flex justify-between mt-6">
          <button onClick={prev} disabled={step === 1} className="px-4 py-2 rounded-lg border border-white/20 disabled:opacity-40">
            Back
          </button>
          {step < 4 ? (
            <button onClick={next} className="px-4 py-2 rounded-lg bg-accent text-black font-semibold">
              Next
            </button>
          ) : (
            <button onClick={submit} disabled={loading} className="px-4 py-2 rounded-lg bg-accent text-black font-semibold">
              {loading ? "Creating..." : "Finish"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
