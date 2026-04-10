import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";
import { getReadableAuthError } from "../utils/authError";
import { getPostAuthRoute } from "../utils/authRoute";

const getStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { user, register, loginWithGoogle } = useAuth();
  const { addToast } = useToast();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const strength = getStrength(form.password);

  if (user) {
    return <Navigate to={getPostAuthRoute(user)} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      addToast("Passwords do not match.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const nextUser = await register({ name: form.name, email: form.email, password: form.password });
      navigate(getPostAuthRoute(nextUser), { replace: true });
    } catch (error) {
      addToast(getReadableAuthError(error, "Unable to create account."), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleRegister = async () => {
    setSubmitting(true);
    try {
      const nextUser = await loginWithGoogle();
      navigate(getPostAuthRoute(nextUser), { replace: true });
    } catch (error) {
      addToast(getReadableAuthError(error, "Unable to continue with Google."), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell grid items-center">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-borderSubtle bg-black/35 md:grid-cols-2">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 md:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brandSecondary">Start Journey</p>
          <h1 className="mt-2 font-heading text-3xl">Create Account</h1>

          <div className="mt-6 space-y-4">
            <input
              type="text"
              placeholder="Name"
              className="input-field"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="input-field"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="input-field pr-20"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-textSecondary"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className={`h-full transition-all ${
                  strength <= 1 ? "bg-red-500" : strength <= 3 ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${(strength / 4) * 100}%` }}
              />
            </div>

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm password"
              className="input-field"
              value={form.confirmPassword}
              onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              required
            />
          </div>

          <button type="submit" className="btn-primary mt-6 w-full" disabled={submitting}>
            {submitting ? "Creating..." : "Create Account"}
          </button>

          <button
            type="button"
            onClick={handleGoogleRegister}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900"
          >
            <span>G</span>
            Continue with Google
          </button>

          <p className="mt-5 text-sm text-textSecondary">
            Already have an account? <Link to="/login" className="text-brandSecondary">Login</Link>
          </p>
        </form>

        <section className="relative hidden p-10 md:block">
          <h2 className="font-display text-7xl leading-[0.9] text-brandPrimary">Build Hard</h2>
          <p className="mt-4 max-w-sm text-textSecondary">Track smart with personalized AI programming and daily focus.</p>
          <div className="mt-8 space-y-3">
            {["4-step onboarding", "AI-generated programming", "Calendar + streak tracker"].map((item, index) => (
              <p key={item} className="rounded-xl border border-borderSubtle bg-bgSecondary px-4 py-3 text-sm text-white">
                {index + 1}. {item}
              </p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default RegisterPage;
