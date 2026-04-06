import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const highlights = [
  "AI workout plans built around your goals",
  "Daily tracker with date-based filtering",
  "Weekly streak and progress insights"
];

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.onboardingComplete) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  if (user && !user.onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const loggedInUser = await login(form);
      navigate(loggedInUser.onboardingComplete ? "/dashboard" : "/onboarding", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to login.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04070b] text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_5%,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_90%_0%,rgba(59,130,246,0.1),transparent_38%),linear-gradient(180deg,#02060a,#04070b_52%,#02060a)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] opacity-25" />
      </div>

      <main className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-6 px-5 py-8 sm:px-8 lg:grid-cols-2">
        <section className="auth-enter relative hidden overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm lg:block">
          <div className="absolute -left-14 top-6 h-40 w-40 rounded-full bg-blue-500/20 blur-2xl auth-float" />
          <div className="absolute -right-10 bottom-8 h-36 w-36 rounded-full bg-blue-400/20 blur-2xl auth-float-delayed" />
          <p className="inline-flex rounded-full border border-blue-300/45 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-blue-200">
            Welcome Back
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            Log in and continue building your strongest self.
          </h1>
          <p className="mt-4 text-slate-300">
            GymForge keeps workouts, to-dos, and progress in one focused dashboard powered by your profile data.
          </p>
          <div className="mt-7 space-y-3">
            {highlights.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-200">v</span>
                <p className="text-sm text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <form onSubmit={handleSubmit} className="auth-enter rounded-3xl border border-white/10 bg-black/35 p-6 backdrop-blur-sm sm:p-8">
          <p className="text-sm uppercase tracking-[0.14em] text-blue-200">GymForge Login</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Sign in to your account</h2>
          <p className="mt-2 text-sm text-slate-400">Access your AI plan, daily tasks, and progress stats.</p>

          <div className="mt-6 space-y-4">
            <label className="block text-sm text-slate-300">
              Email
              <input
                type="email"
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-slate-100 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/35"
                placeholder="name@example.com"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                required
              />
            </label>
            <label className="block text-sm text-slate-300">
              Password
              <input
                type="password"
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-slate-100 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/35"
                placeholder="Enter password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                required
              />
            </label>
          </div>

          {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}

          <button
            type="submit"
            className="mt-6 w-full rounded-xl border border-blue-300 bg-blue-500 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link to="/" className="text-slate-400 transition hover:text-slate-200">
              Back to home
            </Link>
            <p className="text-slate-400">
              New user?{" "}
              <Link to="/register" className="font-medium text-blue-300 transition hover:text-blue-200">
                Create account
              </Link>
            </p>
          </div>
        </form>
      </main>

      <style>{`
        .auth-enter {
          animation: auth-enter 550ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .auth-float {
          animation: auth-float 3.4s ease-in-out infinite;
        }

        .auth-float-delayed {
          animation: auth-float 3.4s ease-in-out infinite 0.9s;
        }

        @keyframes auth-enter {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes auth-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-14px);
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;


