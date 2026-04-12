import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import { getPostAuthRoute } from "../utils/authRoute";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getPasswordStrength = (password) => {
  if (!password) {
    return { label: "", width: "0%", barClass: "bg-zinc-700" };
  }

  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasMixed = /(?=.*[a-z])(?=.*[A-Z])|(?=.*[A-Za-z])(?=.*\d)/.test(password);

  if (password.length >= 10 && hasNumber && hasSpecial) {
    return { label: "Strong", width: "100%", barClass: "bg-emerald-500" };
  }

  if (password.length >= 6 && password.length <= 10 && hasMixed) {
    return { label: "Medium", width: "66%", barClass: "bg-orange-500" };
  }

  return { label: "Weak", width: "33%", barClass: "bg-red-500" };
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { user, register, loginWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  if (user) {
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

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await register({ name, email, password });
      toast.success("Account created! Let's forge your plan.");
      navigate("/onboarding", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleRegister = async () => {
    setSubmitting(true);
    try {
      const nextUser = await loginWithGoogle();
      toast.success("Welcome back! 💪");
      navigate(getPostAuthRoute(nextUser), { replace: true });
    } catch {
      toast.error("Failed to continue with Google.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#0a0a0a] px-4 py-10">
      <div className="w-full max-w-md">
        <p className="text-center text-3xl font-black tracking-[0.08em]">
          <span className="text-white">GYM</span>
          <span className="text-orange-500">FORGE</span>
        </p>

        <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-white/10 bg-[#111111] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
          <h1 className="text-center text-2xl font-bold text-white">Create your account</h1>

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
            <input
              type="password"
              placeholder="Password"
              className="input-field"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              autoComplete="new-password"
              required
            />

            <div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={`h-full ${strength.barClass}`}
                  style={{ width: strength.width, transition: "width 0.3s ease" }}
                />
              </div>
              <p className="mt-2 text-xs text-zinc-400">{strength.label ? `Strength: ${strength.label}` : "Strength: -"}</p>
            </div>

            <input
              type="password"
              placeholder="Confirm Password"
              className="input-field"
              value={form.confirmPassword}
              onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-black hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Creating..." : "Create Account"}
          </button>

          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={submitting}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span>G</span>
            Continue with Google
          </button>

          <p className="mt-5 text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-orange-400 hover:text-orange-300">
              Sign in →
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
