import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import FireButton from "../components/ui/FireButton";
import useAuth from "../hooks/useAuth";
import { getPostAuthRoute } from "../utils/authRoute";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getPasswordStrength = (password) => {
  if (!password) {
    return { label: "", width: "0%", barClass: "bg-steel" };
  }

  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasMixed = /(?=.*[a-z])(?=.*[A-Z])|(?=.*[A-Za-z])(?=.*\d)/.test(password);

  if (password.length >= 10 && hasNumber && hasSpecial) {
    return { label: "Strong", width: "100%", barClass: "bg-emerald-500" };
  }

  if (password.length >= 8 && password.length <= 10 && hasMixed) {
    return { label: "Medium", width: "66%", barClass: "bg-gold" };
  }

  return { label: "Weak", width: "33%", barClass: "bg-red-500" };
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { user, register, loginWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [welcomeActive, setWelcomeActive] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    dietPreference: "veg"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const finishWelcome = (route) => {
    const delay = prefersReducedMotion ? 250 : 1800;
    window.setTimeout(() => {
      navigate(route, { replace: true });
    }, delay);
  };

  if (user && !welcomeActive && !submitting) {
    return <Navigate to={getPostAuthRoute(user)} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const password = form.password;
    const confirmPassword = form.confirmPassword;

    if (!name) {
      toast.error("Full name is required.");
      return;
    }

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await register({ name, email, password, dietPreference: form.dietPreference });
      setWelcomeActive(true);
      toast.success("Account created. Let's forge your plan.");
      finishWelcome("/onboarding");
    } catch (error) {
      const message = error.response?.data?.message || "Backend server is not running. Start the server with npm run dev.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleRegister = async () => {
    setSubmitting(true);
    try {
      const nextUser = await loginWithGoogle();
      setWelcomeActive(true);
      toast.success("Welcome back.");
      finishWelcome(getPostAuthRoute(nextUser));
    } catch {
      toast.error("Failed to continue with Google.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-stage grid min-h-screen place-items-center bg-iron px-4 py-10 text-chalk">
      <AnimatePresence>
        {welcomeActive ? (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={prefersReducedMotion ? false : { opacity: 1 }}
            exit={prefersReducedMotion ? false : { opacity: 0 }}
            className="register-welcome-overlay"
            aria-live="polite"
          >
            <motion.div
              initial={prefersReducedMotion ? false : { scale: 0.84, y: 24, opacity: 0 }}
              animate={prefersReducedMotion ? false : { scale: 1, y: 0, opacity: 1 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.45, ease: "easeOut" }}
              className="register-welcome-card"
            >
              <div className="register-welcome-mark">
                <span>GF</span>
              </div>
              <div className="register-welcome-rings">
                <span />
                <span />
                <span />
              </div>
              <p className="register-welcome-kicker">Account created</p>
              <h2>Your Forge Is Ready</h2>
              <p className="register-welcome-copy">Building your onboarding path, workout profile, and first training dashboard.</p>
              <div className="register-welcome-loader">
                <span />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="w-full max-w-md">
        <p className="text-center font-display text-5xl tracking-widest">
          <span className="text-chalk">GYM</span>
          <span className="text-fire">FORGE</span>
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 border border-fire/20 bg-plate p-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
          style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}
        >
          <h1 className="text-center font-cond text-3xl font-bold uppercase tracking-wide text-chalk">Create your account</h1>

          <div className="mt-6 space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              className="input-field"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              autoComplete="name"
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="input-field"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              autoComplete="email"
              required
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="input-field pr-20"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-widest text-mist hover:text-fire"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div>
              <div className="h-2 overflow-hidden bg-steel">
                <div
                  className={`h-full ${strength.barClass}`}
                  style={{ width: strength.width, transition: "width 0.3s ease" }}
                />
              </div>
              <p className="mt-2 text-xs text-mist">{strength.label ? `Strength: ${strength.label}` : "Strength: -"}</p>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[2px] text-mist">Diet Preference</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "veg", label: "Veg" },
                  { value: "non-veg", label: "Non-Veg" }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, dietPreference: option.value }))}
                    className={`border px-3 py-3 text-sm font-bold uppercase tracking-widest transition ${
                      form.dietPreference === option.value
                        ? "border-fire bg-fire/15 text-fire"
                        : "border-white/10 bg-white/[0.04] text-mist hover:border-fire/40"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="input-field pr-20"
                value={form.confirmPassword}
                onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-widest text-mist hover:text-fire"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <FireButton type="submit" disabled={submitting} className="mt-6 w-full">
            {submitting ? "Creating" : "Create Account"}
          </FireButton>

          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={submitting}
            className="mt-3 flex w-full items-center justify-center gap-2 border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-chalk hover:border-fire/40 hover:bg-fire/10 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="font-bold text-fire">G</span>
            Continue with Google
          </button>

          <p className="mt-5 text-center text-sm text-mist">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-fire hover:text-ember">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
