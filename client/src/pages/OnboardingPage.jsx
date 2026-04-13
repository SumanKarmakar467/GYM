import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";
import useAuth from "../hooks/useAuth";

const bodyTypeOptions = [
  { label: "Lean and Athletic", profileGoal: "athlete", workoutGoal: "Burn Fat" },
  { label: "Muscular", profileGoal: "bodybuilder", workoutGoal: "Build Muscle" },
  { label: "Power and Strength", profileGoal: "powerlifter", workoutGoal: "Build Muscle" },
  { label: "Functional Endurance", profileGoal: "crossfit", workoutGoal: "Improve Endurance" }
];

const levelOptions = ["Beginner", "Intermediate", "Advanced"];
const durationOptions = ["1 month", "3 months", "6 months"];
const equipmentOptions = ["Full Gym", "Home Gym", "Bodyweight Only"];
const genderOptions = ["male", "female", "other"];

const durationToWeeks = {
  "1 month": 4,
  "3 months": 12,
  "6 months": 24
};

const equipmentToEnvironment = {
  "Full Gym": "gym",
  "Home Gym": "home",
  "Bodyweight Only": "home"
};

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    age: "",
    heightCm: "",
    weightKg: "",
    gender: "",
    bodyType: "",
    level: "Beginner",
    duration: "1 month",
    equipment: "Home Gym"
  });

  const selectedBodyType = useMemo(
    () => bodyTypeOptions.find((option) => option.label === form.bodyType) || null,
    [form.bodyType]
  );

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const age = Number(form.age);
    const heightCm = Number(form.heightCm);
    const weightKg = Number(form.weightKg);

    if (!Number.isFinite(age) || age < 13 || age > 100) {
      return "Age must be between 13 and 100.";
    }

    if (!Number.isFinite(heightCm) || heightCm < 120 || heightCm > 260) {
      return "Height must be between 120 and 260 cm.";
    }

    if (!Number.isFinite(weightKg) || weightKg < 20 || weightKg > 500) {
      return "Weight must be between 20 and 500 kg.";
    }

    if (!genderOptions.includes(form.gender)) {
      return "Please select your gender.";
    }

    if (!selectedBodyType) {
      return "Please choose your target body type.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) {
      return;
    }

    const errorMessage = validate();
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    setLoading(true);
    const loadingToastId = toast.loading("Saving your profile and generating plan...");

    try {
      await api.post("/onboarding", {
        age: Number(form.age),
        heightCm: Number(form.heightCm),
        weightKg: Number(form.weightKg),
        gender: form.gender,
        goal: selectedBodyType.profileGoal,
        environment: equipmentToEnvironment[form.equipment],
        durationWeeks: durationToWeeks[form.duration]
      });

      await api.post("/workout/generate", {
        goal: selectedBodyType.workoutGoal,
        level: form.level,
        duration: form.duration,
        equipment: form.equipment
      });

      await refreshUser();

      toast.dismiss(loadingToastId);
      toast.success("Profile completed. Welcome to your dashboard.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error(error.response?.data?.message || "Could not complete onboarding. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell grid items-center">
      <div className="mx-auto w-full max-w-4xl rounded-3xl border border-borderSubtle bg-bgSecondary p-6 md:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brandSecondary">Onboarding</p>
        <h1 className="mt-2 text-3xl font-bold">Tell us about your body and target physique</h1>
        <p className="mt-2 text-sm text-textSecondary">
          We use these inputs to personalize your dashboard, workout plan, and daily tracking.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm">
              <span className="mb-2 block text-textSecondary">Age</span>
              <input
                type="number"
                min="13"
                max="100"
                value={form.age}
                onChange={(event) => updateField("age", event.target.value)}
                className="input-field"
                required
              />
            </label>

            <label className="text-sm">
              <span className="mb-2 block text-textSecondary">Height (cm)</span>
              <input
                type="number"
                min="120"
                max="260"
                value={form.heightCm}
                onChange={(event) => updateField("heightCm", event.target.value)}
                className="input-field"
                required
              />
            </label>

            <label className="text-sm">
              <span className="mb-2 block text-textSecondary">Weight (kg)</span>
              <input
                type="number"
                min="20"
                max="500"
                value={form.weightKg}
                onChange={(event) => updateField("weightKg", event.target.value)}
                className="input-field"
                required
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm">
              <span className="mb-2 block text-textSecondary">Gender</span>
              <select
                value={form.gender}
                onChange={(event) => updateField("gender", event.target.value)}
                className="input-field"
                required
              >
                <option value="">Select gender</option>
                {genderOptions.map((value) => (
                  <option key={value} value={value}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              <span className="mb-2 block text-textSecondary">Experience Level</span>
              <select
                value={form.level}
                onChange={(event) => updateField("level", event.target.value)}
                className="input-field"
                required
              >
                {levelOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <p className="mb-2 text-sm text-textSecondary">What type of body do you want?</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {bodyTypeOptions.map((option) => {
                const active = form.bodyType === option.label;
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => updateField("bodyType", option.label)}
                    className={`rounded-2xl border p-4 text-left ${
                      active
                        ? "border-orange-400 bg-orange-500/15"
                        : "border-borderSubtle bg-bgPrimary hover:border-orange-400/70"
                    }`}
                    disabled={loading}
                  >
                    <p className="text-base font-semibold">{option.label}</p>
                    <p className="mt-1 text-xs text-textSecondary">Plan focus: {option.workoutGoal}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm">
              <span className="mb-2 block text-textSecondary">Program Duration</span>
              <select
                value={form.duration}
                onChange={(event) => updateField("duration", event.target.value)}
                className="input-field"
                required
              >
                {durationOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              <span className="mb-2 block text-textSecondary">Equipment Access</span>
              <select
                value={form.equipment}
                onChange={(event) => updateField("equipment", event.target.value)}
                className="input-field"
                required
              >
                {equipmentOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-2 flex justify-end">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Setting up..." : "Complete Setup"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;
