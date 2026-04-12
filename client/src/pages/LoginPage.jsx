import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";
import { getReadableAuthError } from "../utils/authError";
import { getPostAuthRoute } from "../utils/authRoute";

const adminEmail = String(import.meta.env.VITE_ADMIN_EMAIL || "").trim().toLowerCase();

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, loginAsAdmin, loginWithGoogle } = useAuth();
  const { addToast } = useToast();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState("");

  useEffect(() => {
    const redirected = sessionStorage.getItem("redirected") === "1";
    const sessionExpired = sessionStorage.getItem("session_expired") === "1";

    if (redirected || sessionExpired) {
      setBanner(sessionExpired ? "Your session expired. Please log in again." : "Please log in to continue.");
      sessionStorage.removeItem("redirected");
      sessionStorage.removeItem("session_expired");
    }
  }, []);

  useEffect(() => {
    if (!banner) {
      return undefined;
    }

    const timer = window.setTimeout(() => setBanner(""), 3000);
    return () => window.clearTimeout(timer);
  }, [banner]);

  if (user) {
    return <Navigate to={getPostAuthRoute(user)} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const isAdminAttempt = adminEmail && form.email.trim().toLowerCase() === adminEmail;
      const nextUser = isAdminAttempt ? await loginAsAdmin(form) : await login(form);
      const target = location.state?.from || getPostAuthRoute(nextUser);
      navigate(target, { replace: true });
    } catch (error) {
      addToast(getReadableAuthError(error, "Unable to login."), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitting(true);

    try {
      const nextUser = await loginWithGoogle();
      const target = location.state?.from || getPostAuthRoute(nextUser);
      navigate(target, { replace: true });
    } catch (error) {
      addToast(getReadableAuthError(error, "Unable to login with Google."), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-enter page-shell grid items-center">
      {banner ? (
        <div className="fixed left-0 right-0 top-0 z-50 bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-white">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-center gap-3">
            <span>{banner}</span>
            <button type="button" onClick={() => setBanner("")} className="rounded border border-white/40 px-2 py-0.5 text-xs">
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-borderSubtle bg-black/35 md:grid-cols-2">
        <section className="relative hidden p-10 md:block">
          <h1 className="font-display text-7xl leading-[0.9] text-brandPrimary">Forge In</h1>
          <p className="mt-4 max-w-sm text-textSecondary">Continue your transformation with AI-guided training.</p>
          <svg viewBox="0 0 220 110" className="mt-10 w-full max-w-xs text-brandSecondary">
            <circle cx="35" cy="55" r="26" fill="currentColor" opacity="0.35" />
            <circle cx="58" cy="55" r="18" fill="currentColor" opacity="0.55" />
            <rect x="58" y="48" width="104" height="14" rx="7" fill="#D1D5DB" />
            <circle cx="162" cy="55" r="18" fill="currentColor" opacity="0.55" />
            <circle cx="185" cy="55" r="26" fill="currentColor" opacity="0.35" />
          </svg>
        </section>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 md:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brandSecondary">Welcome Back</p>
          <h2 className="mt-2 font-heading text-3xl">Login</h2>

          <div className="mt-6 space-y-4">
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
          </div>

          <button type="submit" className="btn-primary mt-6 w-full" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign In"}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900"
          >
            <span>G</span>
            Sign in with Google
          </button>

          <p className="mt-5 text-sm text-textSecondary">
            New here? <Link to="/register" className="text-brandSecondary">Create account</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
