import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api from "../api/api";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form.email, form.password);
      try {
        await api.post("/workout/generate");
      } catch {
        // plan may already exist
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <form onSubmit={submit} className="panel w-full max-w-md p-6 space-y-4 animate-fade-slide-in">
        <h1 className="text-2xl font-bold">GymForge Login</h1>
        <input
          className="w-full rounded-lg bg-black/30 border border-white/15 px-3 py-2"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          required
        />
        <input
          className="w-full rounded-lg bg-black/30 border border-white/15 px-3 py-2"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          required
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button className="w-full bg-accent text-black font-semibold rounded-lg py-2" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p className="text-sm text-white/70">
          New user?{" "}
          <Link to="/onboarding" className="text-accent">
            Start onboarding
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
