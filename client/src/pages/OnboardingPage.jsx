import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";
import FireButton from "../components/ui/FireButton";
import GymCard from "../components/ui/GymCard";
import useAuth from "../hooks/useAuth";

const bodyTypeOptions = [
  {
    label: "Lean and Athletic",
    profileGoal: "athlete",
    workoutGoal: "Burn Fat",
    copy: "Sharp conditioning, visible definition, fast movement.",
    image: "/images/body-types/lean-athlete.jpg",
    imagePosition: "center",
    imageFit: "contain"
  },
  {
    label: "Muscular",
    profileGoal: "bodybuilder",
    workoutGoal: "Build Muscle",
    copy: "Balanced size, strong shape, classic hypertrophy work.",
    image: "/images/body-types/muscular.jpg",
    imagePosition: "center",
    imageFit: "contain"
  },
  {
    label: "Power and Strength",
    profileGoal: "powerlifter",
    workoutGoal: "Build Muscle",
    copy: "Heavy lifts, dense muscle, performance-first progression.",
    image: "/images/body-types/power-strength.jpg",
    imagePosition: "center",
    imageFit: "contain"
  },
  {
    label: "Functional Endurance",
    profileGoal: "crossfit",
    workoutGoal: "Improve Endurance",
    copy: "Work capacity, stamina, strength that keeps moving.",
    image: "/images/body-types/functional-endurance.jpg",
    imagePosition: "center",
    imageFit: "contain"
  }
];

const levelOptions = [
  { label: "Beginner", copy: "New or returning after a long break." },
  { label: "Intermediate", copy: "Training consistently and ready to progress." },
  { label: "Advanced", copy: "Experienced with hard sessions and recovery." }
];

const durationOptions = [
  { label: "1 month", weeks: 4, copy: "Fast reset" },
  { label: "3 months", weeks: 12, copy: "Visible change" },
  { label: "6 months", weeks: 24, copy: "Full transformation" }
];

const equipmentOptions = [
  {
    label: "Full Gym",
    environment: "gym",
    copy: "Machines, racks, cables, dumbbells.",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80"
  },
  {
    label: "Home Gym",
    environment: "home",
    copy: "Dumbbells, bands, bench, compact equipment.",
    image:
      "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=900&q=80"
  },
  {
    label: "Bodyweight Only",
    environment: "home",
    copy: "No equipment. Just space, control, and consistency.",
    image:
      "https://images.unsplash.com/photo-1550345332-09e3ac987658?auto=format&fit=crop&w=900&q=80"
  }
];

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" }
];

const dietOptions = [
  { label: "Veg", value: "veg", copy: "Paneer, dal, tofu, curd, oats, legumes." },
  { label: "Non-Veg", value: "non-veg", copy: "Eggs, chicken, fish, curd, dal, greens." }
];

const steps = ["Body Stats", "Profile", "Physique", "Diet", "Duration", "Workout Place"];

const feetToCm = (feet, inches) => Math.round((Number(feet) * 12 + Number(inches || 0)) * 2.54);

const OnboardingPage = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [heightUnit, setHeightUnit] = useState("cm");
  const [form, setForm] = useState({
    age: "",
    heightCm: "",
    heightFt: "",
    heightIn: "",
    weightKg: "",
    gender: "",
    bodyType: "",
    dietPreference: "veg",
    level: "Beginner",
    duration: "1 month",
    equipment: "Home Gym"
  });

  const selectedBodyType = useMemo(
    () => bodyTypeOptions.find((option) => option.label === form.bodyType) || null,
    [form.bodyType]
  );

  const selectedDuration = useMemo(
    () => durationOptions.find((option) => option.label === form.duration) || durationOptions[0],
    [form.duration]
  );

  const selectedEquipment = useMemo(
    () => equipmentOptions.find((option) => option.label === form.equipment) || equipmentOptions[1],
    [form.equipment]
  );

  const normalizedHeightCm = useMemo(() => {
    if (heightUnit === "cm") {
      return Number(form.heightCm);
    }

    return feetToCm(form.heightFt, form.heightIn);
  }, [form.heightCm, form.heightFt, form.heightIn, heightUnit]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const getStepError = (targetStep = step) => {
    if (targetStep === 0) {
      const age = Number(form.age);
      const weightKg = Number(form.weightKg);

      if (!Number.isFinite(age) || age < 13 || age > 100) {
        return "Age must be between 13 and 100.";
      }

      if (!Number.isFinite(normalizedHeightCm) || normalizedHeightCm < 120 || normalizedHeightCm > 260) {
        return "Height must be between 120 and 260 cm.";
      }

      if (!Number.isFinite(weightKg) || weightKg < 20 || weightKg > 500) {
        return "Weight must be between 20 and 500 kg.";
      }
    }

    if (targetStep === 1) {
      if (!genderOptions.some((option) => option.value === form.gender)) {
        return "Please select your gender.";
      }

      if (!levelOptions.some((option) => option.label === form.level)) {
        return "Please select your experience level.";
      }
    }

    if (targetStep === 2 && !selectedBodyType) {
      return "Please choose your target body type.";
    }

    if (targetStep === 3 && !dietOptions.some((option) => option.value === form.dietPreference)) {
      return "Please choose a diet preference.";
    }

    if (targetStep === 4 && !selectedDuration) {
      return "Please choose a program duration.";
    }

    if (targetStep === 5 && !selectedEquipment) {
      return "Please choose where you want to workout.";
    }

    return "";
  };

  const goNext = () => {
    const errorMessage = getStepError();
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goBack = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const validateAll = () => {
    for (let index = 0; index < steps.length; index += 1) {
      const errorMessage = getStepError(index);
      if (errorMessage) {
        setStep(index);
        return errorMessage;
      }
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) {
      return;
    }

    const errorMessage = validateAll();
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    setLoading(true);
    const loadingToastId = toast.loading("Saving your profile and generating plan...");

    try {
      await api.post("/onboarding", {
        age: Number(form.age),
        heightCm: normalizedHeightCm,
        weightKg: Number(form.weightKg),
        gender: form.gender,
        goal: selectedBodyType.profileGoal,
        environment: selectedEquipment.environment,
        durationWeeks: selectedDuration.weeks,
        dietPreference: form.dietPreference
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

  const motionProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, x: 34, scale: 0.98 },
        animate: { opacity: 1, x: 0, scale: 1 },
        exit: { opacity: 0, x: -34, scale: 0.98 },
        transition: { duration: 0.32, ease: "easeOut" }
      };

  return (
    <div className="min-h-screen overflow-hidden bg-charcoal px-4 py-8 text-chalk md:px-6">
      <div
        className="pointer-events-none fixed inset-0 opacity-80"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,69,0,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,69,0,0.035) 1px, transparent 1px)",
          backgroundSize: "42px 42px"
        }}
      />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_50%_0%,rgba(255,69,0,0.18),transparent_62%)]" />

      <main className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
        <form onSubmit={handleSubmit}>
          <GymCard className="grid overflow-hidden lg:grid-cols-[0.82fr_1.18fr]" hover={false}>
            <aside className="onboarding-aside relative min-h-[260px] border-b border-white/[0.06] bg-iron p-6 md:p-8 lg:border-b-0 lg:border-r">
              <div
                className="absolute inset-0 opacity-70"
                style={{
                  backgroundImage:
                    "linear-gradient(145deg, rgba(255,69,0,0.22), transparent 48%), url(/images/hero-collage/front-pose.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center top"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-iron via-iron/82 to-iron/20" />
              <div className="onboarding-aside-glow" aria-hidden="true" />
              <div className="relative flex h-full flex-col justify-between gap-8">
                <div>
                  <p className="font-body text-xs font-bold uppercase tracking-[3px] text-fire">Onboarding</p>
                  <h1 className="mt-3 font-display text-5xl leading-none tracking-wide md:text-6xl">
                    Build Your Plan
                  </h1>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-mist">
                    Answer a few focused questions. GymForge will shape the workout plan around your body, goal, and training setup.
                  </p>
                </div>

                <div className="space-y-3">
                  {steps.map((item, index) => {
                    const active = index === step;
                    const complete = index < step;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setStep(index)}
                        className={`flex w-full items-center gap-3 border px-3 py-2 text-left transition ${
                          active
                            ? "border-fire bg-fire/15 text-chalk"
                            : complete
                              ? "border-gold/40 bg-gold/10 text-chalk"
                              : "border-white/[0.08] bg-black/25 text-mist hover:border-fire/40"
                        }`}
                        style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
                        disabled={loading}
                      >
                        <span className="font-display text-2xl text-fire">{String(index + 1).padStart(2, "0")}</span>
                        <span className="font-body text-xs font-bold uppercase tracking-[2px]">{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            <section className="bg-plate p-5 md:p-8">
              <div className="mb-7">
                <div className="h-1 bg-steel">
                  <div
                    className="h-full bg-gradient-to-r from-fire to-gold transition-all duration-500"
                    style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-[2px] text-mist">
                  <span>{steps[step]}</span>
                  <span>{step + 1}/{steps.length}</span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={step} {...motionProps}>
                  {step === 0 ? (
                    <div>
                      <h2 className="font-cond text-4xl font-bold uppercase tracking-wide">First, your body stats</h2>
                      <p className="mt-2 text-sm text-mist">Age, height, and weight help us set better training volume.</p>

                      <div className="mt-6 grid gap-4 md:grid-cols-3">
                        <Field label="Age">
                          <input
                            type="number"
                            min="13"
                            max="100"
                            value={form.age}
                            onChange={(event) => updateField("age", event.target.value)}
                            className="input-field"
                            placeholder="21"
                            required
                          />
                        </Field>

                        <Field
                          label="Height"
                          action={
                            <div className="grid grid-cols-2 border border-white/10 text-[10px] uppercase tracking-[2px]">
                              {["cm", "feet"].map((unit) => (
                                <button
                                  key={unit}
                                  type="button"
                                  onClick={() => setHeightUnit(unit)}
                                  className={`px-2 py-1 ${heightUnit === unit ? "bg-fire text-white" : "bg-black/20 text-mist"}`}
                                >
                                  {unit}
                                </button>
                              ))}
                            </div>
                          }
                        >
                          {heightUnit === "cm" ? (
                            <input
                              type="number"
                              min="120"
                              max="260"
                              value={form.heightCm}
                              onChange={(event) => updateField("heightCm", event.target.value)}
                              className="input-field"
                              placeholder="178"
                              required
                            />
                          ) : (
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="number"
                                min="3"
                                max="8"
                                value={form.heightFt}
                                onChange={(event) => updateField("heightFt", event.target.value)}
                                className="input-field"
                                placeholder="5 ft"
                                required
                              />
                              <input
                                type="number"
                                min="0"
                                max="11"
                                value={form.heightIn}
                                onChange={(event) => updateField("heightIn", event.target.value)}
                                className="input-field"
                                placeholder="10 in"
                              />
                            </div>
                          )}
                        </Field>

                        <Field label="Weight (kg)">
                          <input
                            type="number"
                            min="20"
                            max="500"
                            value={form.weightKg}
                            onChange={(event) => updateField("weightKg", event.target.value)}
                            className="input-field"
                            placeholder="84"
                            required
                          />
                        </Field>
                      </div>
                    </div>
                  ) : null}

                  {step === 1 ? (
                    <div>
                      <h2 className="font-cond text-4xl font-bold uppercase tracking-wide">Now, your training profile</h2>
                      <p className="mt-2 text-sm text-mist">Pick the identity and difficulty level that match you today.</p>

                      <div className="mt-6 grid gap-5 lg:grid-cols-2">
                        <OptionGroup
                          title="Gender"
                          options={genderOptions}
                          value={form.gender}
                          onSelect={(value) => updateField("gender", value)}
                          getValue={(option) => option.value}
                          getTitle={(option) => option.label}
                        />
                        <OptionGroup
                          title="Experience Level"
                          options={levelOptions}
                          value={form.level}
                          onSelect={(value) => updateField("level", value)}
                          getValue={(option) => option.label}
                          getTitle={(option) => option.label}
                          getCopy={(option) => option.copy}
                        />
                      </div>
                    </div>
                  ) : null}

                  {step === 2 ? (
                    <div>
                      <h2 className="font-cond text-4xl font-bold uppercase tracking-wide">What type of body do you want?</h2>
                      <p className="mt-2 text-sm text-mist">Choose the physique that makes you want to show up tomorrow.</p>

                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {bodyTypeOptions.map((option) => (
                          <ImageChoice
                            key={option.label}
                            option={option}
                            active={form.bodyType === option.label}
                            onClick={() => updateField("bodyType", option.label)}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {step === 3 ? (
                    <div>
                      <h2 className="font-cond text-4xl font-bold uppercase tracking-wide">Choose your diet lane</h2>
                      <p className="mt-2 text-sm text-mist">Your meal plan will adapt to your food preference, weight, and physique goal.</p>

                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {dietOptions.map((option) => {
                          const active = form.dietPreference === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => updateField("dietPreference", option.value)}
                              className={`border p-5 text-left transition hover:-translate-y-1 ${
                                active ? "border-fire bg-fire/15" : "border-white/[0.08] bg-iron hover:border-fire/50"
                              }`}
                              style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}
                              disabled={loading}
                            >
                              <p className="font-display text-4xl text-fire">{option.label}</p>
                              <p className="mt-3 text-sm leading-relaxed text-mist">{option.copy}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {step === 4 ? (
                    <div>
                      <h2 className="font-cond text-4xl font-bold uppercase tracking-wide">Choose program duration</h2>
                      <p className="mt-2 text-sm text-mist">Short sprint or full transformation. Pick the runway.</p>

                      <div className="mt-6 grid gap-4 md:grid-cols-3">
                        {durationOptions.map((option) => {
                          const active = form.duration === option.label;
                          return (
                            <button
                              key={option.label}
                              type="button"
                              onClick={() => updateField("duration", option.label)}
                              className={`border p-5 text-left transition hover:-translate-y-1 ${
                                active ? "border-fire bg-fire/15" : "border-white/[0.08] bg-iron hover:border-fire/50"
                              }`}
                              style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}
                              disabled={loading}
                            >
                              <p className="font-display text-5xl text-fire">{option.weeks}</p>
                              <p className="font-body text-xs font-bold uppercase tracking-[2px] text-mist">Weeks</p>
                              <h3 className="mt-4 font-cond text-2xl font-bold uppercase">{option.label}</h3>
                              <p className="mt-1 text-sm text-mist">{option.copy}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {step === 5 ? (
                    <div>
                      <h2 className="font-cond text-4xl font-bold uppercase tracking-wide">Where do you want to workout?</h2>
                      <p className="mt-2 text-sm text-mist">Your plan adapts to the equipment you actually have.</p>

                      <div className="mt-6 grid gap-4 md:grid-cols-3">
                        {equipmentOptions.map((option) => (
                          <ImageChoice
                            key={option.label}
                            option={option}
                            active={form.equipment === option.label}
                            onClick={() => updateField("equipment", option.label)}
                            compact
                          />
                        ))}
                      </div>

                      <div className="mt-6 border border-fire/20 bg-fire/10 p-4">
                        <p className="font-body text-xs font-bold uppercase tracking-[2px] text-fire">Ready to forge</p>
                        <p className="mt-1 text-sm text-mist">
                          {selectedBodyType?.label || "Your target physique"} · {form.level} · {form.dietPreference === "non-veg" ? "Non-Veg" : "Veg"} · {selectedDuration.label} · {selectedEquipment.label}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 0 || loading}
                  className="border border-white/10 px-5 py-3 text-xs font-bold uppercase tracking-widest text-mist transition hover:border-fire/40 hover:text-chalk disabled:pointer-events-none disabled:opacity-40"
                >
                  Back
                </button>

                {step < steps.length - 1 ? (
                  <FireButton onClick={goNext} disabled={loading}>
                    Continue
                  </FireButton>
                ) : (
                  <FireButton type="submit" disabled={loading}>
                    {loading ? "Setting Up" : "Complete Setup"}
                  </FireButton>
                )}
              </div>
            </section>
          </GymCard>
        </form>
      </main>
    </div>
  );
};

const Field = ({ label, action, children }) => (
  <label className="text-sm">
    <span className="mb-2 flex min-h-7 items-center justify-between gap-3 text-mist">
      <span>{label}</span>
      {action}
    </span>
    {children}
  </label>
);

const OptionGroup = ({ title, options, value, onSelect, getValue, getTitle, getCopy = () => "" }) => (
  <div>
    <p className="mb-3 font-body text-xs font-bold uppercase tracking-[2px] text-mist">{title}</p>
    <div className="grid gap-3">
      {options.map((option) => {
        const optionValue = getValue(option);
        const active = value === optionValue;
        return (
          <button
            key={optionValue}
            type="button"
            onClick={() => onSelect(optionValue)}
            className={`border p-4 text-left transition hover:-translate-y-0.5 ${
              active ? "border-fire bg-fire/15 text-chalk" : "border-white/[0.08] bg-iron text-mist hover:border-fire/40"
            }`}
          >
            <p className="font-cond text-xl font-bold uppercase tracking-wide">{getTitle(option)}</p>
            {getCopy(option) ? <p className="mt-1 text-sm text-mist">{getCopy(option)}</p> : null}
          </button>
        );
      })}
    </div>
  </div>
);

const ImageChoice = ({ option, active, onClick, compact = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group relative min-h-[210px] overflow-hidden border text-left transition duration-300 hover:-translate-y-1 ${
      active ? "border-fire shadow-[0_0_0_2px_rgba(255,69,0,0.22)]" : "border-white/[0.08] hover:border-fire/50"
    } ${compact ? "min-h-[250px]" : ""}`}
    style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}
  >
    <img
      src={option.image}
      alt=""
      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
      style={{
        objectFit: option.imageFit || "cover",
        objectPosition: option.imagePosition || "center"
      }}
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-iron via-iron/55 to-transparent" />
    <div className={`absolute inset-x-0 bottom-0 p-5 ${active ? "bg-fire/10" : ""}`}>
      <p className="font-cond text-2xl font-bold uppercase tracking-wide text-white">{option.label}</p>
      <p className="mt-2 text-sm leading-relaxed text-chalk/80">{option.copy}</p>
      {"workoutGoal" in option ? (
        <p className="mt-3 font-body text-xs font-bold uppercase tracking-[2px] text-fire">Plan focus: {option.workoutGoal}</p>
      ) : null}
    </div>
  </button>
);

export default OnboardingPage;

