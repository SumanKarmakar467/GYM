import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/api";
import AppNavbar from "../components/layout/AppNavbar";

const todayKey = () => new Date().toISOString().slice(0, 10);

const DietPage = () => {
  const prefersReducedMotion = useReducedMotion();
  const [diet, setDiet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState("");

  const loadDiet = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/diet", { params: { date: todayKey() } });
      setDiet(data);
    } catch {
      toast.error("Could not load diet plan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiet();
  }, []);

  const completedKeys = useMemo(() => new Set(diet?.today?.completedKeys || []), [diet]);
  const totals = useMemo(() => {
    const foods = diet?.foods || [];
    const completed = foods.filter((food) => completedKeys.has(food.key));
    return {
      protein: completed.reduce((sum, food) => sum + Number(food.protein || 0), 0),
      fiber: completed.reduce((sum, food) => sum + Number(food.fiber || 0), 0),
      calories: completed.reduce((sum, food) => sum + Number(food.calories || 0), 0)
    };
  }, [completedKeys, diet]);

  const toggleFood = async (food) => {
    const completed = !completedKeys.has(food.key);
    setUpdatingKey(food.key);
    try {
      await api.patch("/diet/log", { date: todayKey(), itemKey: food.key, completed });
      await loadDiet();
      toast.success(completed ? "Meal marked complete." : "Meal reopened.");
    } catch {
      toast.error("Could not update diet tracker.");
    } finally {
      setUpdatingKey("");
    }
  };

  return (
    <div className="min-h-screen">
      <AppNavbar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-6">
        <section className="card overflow-hidden p-6 md:p-8">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
            className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
          >
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-brandSecondary">Diet Forge</p>
              <h1 className="mt-2 text-4xl font-bold">Eat for the body you are building.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-textSecondary">
                Your plan adapts to weight, physique goal, and {diet?.profile?.dietPreference === "non-veg" ? "non-veg" : "veg"} preference.
                Track every meal like a workout set.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Metric label="Protein" value={`${totals.protein}/${diet?.profile?.proteinGrams || 0}g`} />
              <Metric label="Fiber" value={`${totals.fiber}/${diet?.profile?.fiberGrams || 0}g`} />
              <Metric label="Calories" value={`${totals.calories}/${diet?.profile?.calories || 0}`} />
            </div>
          </motion.div>
        </section>

        {loading ? (
          <section className="mt-5 grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => <div key={item} className="card h-72 animate-pulse bg-white/5" />)}
          </section>
        ) : null}

        {!loading && diet ? (
          <>
            <section className="mt-5 grid gap-4 md:grid-cols-3">
              <TargetCard title="Body Goal" value={diet.profile.bodyGoal} caption={`${diet.profile.weightKg}kg bodyweight`} />
              <TargetCard title="Diet Type" value={diet.profile.dietPreference === "non-veg" ? "Non-Veg" : "Veg"} caption="Chosen during registration/onboarding" />
              <TargetCard title="Today" value={`${diet.today.percent}%`} caption={`${diet.today.completed}/${diet.today.total} meals maintained`} tone={diet.today.percent === 100 ? "green" : diet.today.percent === 0 ? "red" : "orange"} />
            </section>

            <section className="mt-5 grid gap-5 md:grid-cols-2">
              {diet.foods.map((food, index) => {
                const done = completedKeys.has(food.key);
                return (
                  <motion.article
                    key={food.key}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
                    animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: prefersReducedMotion ? 0 : index * 0.06 }}
                    className={`group overflow-hidden border bg-plate transition ${
                      done ? "border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.14)]" : "border-white/[0.08] hover:border-fire/50"
                    }`}
                    style={{ clipPath: "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))" }}
                  >
                    <div className="relative h-52 overflow-hidden">
                      <img src={food.image} alt={food.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-iron via-iron/35 to-transparent" />
                      <div className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-xs font-bold uppercase tracking-[2px] text-white">{food.meal}</div>
                      <button
                        type="button"
                        onClick={() => toggleFood(food)}
                        disabled={updatingKey === food.key}
                        className={`absolute bottom-4 right-4 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[2px] transition ${
                          done ? "bg-emerald-500 text-black" : "bg-fire text-white hover:bg-ember"
                        }`}
                      >
                        {updatingKey === food.key ? "Saving" : done ? "Maintained" : "Mark Done"}
                      </button>
                    </div>
                    <div className="p-5">
                      <h2 className="text-2xl font-bold">{food.name}</h2>
                      <p className="mt-2 text-sm leading-6 text-textSecondary">{food.note}</p>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                        <Mini label="Protein" value={`${food.protein}g`} />
                        <Mini label="Fiber" value={`${food.fiber}g`} />
                        <Mini label="Energy" value={food.calories} />
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </section>

            <section className="card mt-5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">14-day diet consistency</h2>
                  <p className="mt-1 text-sm text-textSecondary">Green means maintained. Red means you missed meals.</p>
                </div>
                <p className="text-sm text-textSecondary">{diet.history.filter((day) => day.percent === 100).length} perfect days</p>
              </div>
              <div className="mt-5 grid gap-2" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
                {diet.history.map((day) => (
                  <div key={day.date} title={`${day.date}: ${day.percent}%`} className="space-y-2 text-center">
                    <div className={`mx-auto h-8 w-8 rounded ${day.percent === 100 ? "bg-emerald-400" : day.percent > 0 ? "bg-emerald-700" : "bg-red-600"}`} />
                    <p className="text-[10px] text-mist">{new Date(`${day.date}T12:00:00`).getDate()}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
};

const Metric = ({ label, value }) => (
  <div className="rounded-xl border border-white/[0.08] bg-iron p-3 text-center">
    <p className="text-xs uppercase tracking-[2px] text-mist">{label}</p>
    <p className="mt-2 text-xl font-bold text-fire">{value}</p>
  </div>
);

const TargetCard = ({ title, value, caption, tone = "orange" }) => {
  const toneClass = tone === "green" ? "text-emerald-300" : tone === "red" ? "text-red-300" : "text-fire";
  return (
    <article className="card p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-brandSecondary">{title}</p>
      <p className={`mt-3 text-3xl font-bold ${toneClass}`}>{value}</p>
      <p className="mt-2 text-sm text-textSecondary">{caption}</p>
    </article>
  );
};

const Mini = ({ label, value }) => (
  <div className="rounded-lg bg-black/25 p-2">
    <p className="text-xs text-mist">{label}</p>
    <p className="mt-1 font-bold text-chalk">{value}</p>
  </div>
);

export default DietPage;
