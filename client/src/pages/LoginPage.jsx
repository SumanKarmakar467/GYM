import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import FireButton from "../components/ui/FireButton";
import useAuth from "../hooks/useAuth";
import { getPostAuthRoute } from "../utils/authRoute";

const adminEmail = String(import.meta.env.VITE_ADMIN_EMAIL || "").trim().toLowerCase();

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginDemo, loginAsAdmin, loginWithGoogle } = useAuth();

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const isAdminAttempt = adminEmail && form.email.trim().toLowerCase() === adminEmail;
      const nextUser = isAdminAttempt ? await loginAsAdmin(form) : await login(form);
      const target = location.state?.from || getPostAuthRoute(nextUser);
      toast.success("Welcome back.");
      navigate(target, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitting(true);

    try {
      const nextUser = await loginWithGoogle();
      const target = location.state?.from || getPostAuthRoute(nextUser);
      toast.success("Welcome back.");
      navigate(target, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setSubmitting(true);

    try {
      const nextUser = await loginDemo();
      const target = location.state?.from || getPostAuthRoute(nextUser);
      toast.success("Demo mode ready.");
      navigate(target, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Demo login is unavailable.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-stage relative min-h-screen overflow-hidden bg-iron px-4 py-8 text-chalk">
      {banner ? (
        <div className="fixed left-0 right-0 top-0 z-50 bg-fire px-4 py-3 text-center text-sm font-semibold text-white">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-center gap-3">
            <span>{banner}</span>
            <button type="button" onClick={() => setBanner("")} className="border border-white/40 px-2 py-0.5 text-xs">
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,69,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,69,0,0.04) 1px,transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />
      <div className="login-bg-scan" aria-hidden="true" />
      <div className="login-bg-rings" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="login-bg-particles" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="login-bg-equipment" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div
        className="login-bg-core absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,69,0,0.1) 0%, transparent 70%)" }}
      />

      <main className="relative z-10 grid min-h-[calc(100vh-4rem)] place-items-center">
        <form
          onSubmit={handleSubmit}
          className="animate-slide-up w-full max-w-md border border-fire/20 bg-plate p-7 shadow-[0_28px_80px_rgba(0,0,0,0.45)] sm:p-10"
          style={{
            clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))"
          }}
        >
          <h1 className="text-center font-display text-5xl tracking-widest">
            GYM<span className="text-fire">FORGE</span>
          </h1>
          <p className="mb-8 text-center font-body text-xs font-semibold uppercase tracking-[3px] text-mist">
            Enter the Forge
          </p>

          <div className="space-y-4">
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-widest text-mist hover:text-fire"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <FireButton type="submit" className="mt-6 w-full" disabled={submitting}>
            {submitting ? "Signing In" : "Sign In"}
          </FireButton>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={submitting}
            className="mt-3 flex w-full items-center justify-center gap-2 border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-chalk hover:border-fire/40 hover:bg-fire/10 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="font-bold text-fire">G</span>
            Sign in with Google
          </button>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={submitting}
            className="mt-3 flex w-full items-center justify-center border border-fire/40 bg-fire/10 px-4 py-3 text-sm font-semibold text-chalk hover:bg-fire/20 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Try Demo
          </button>

          <p className="mt-5 text-center text-sm text-mist">
            New here?{" "}
            <Link to="/register" className="font-semibold text-fire hover:text-ember">
              Create account
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
};

export default LoginPage;
