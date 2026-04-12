import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import AppNavbar from "../components/layout/AppNavbar";
import useAuth from "../hooks/useAuth";

const ProfilePage = () => {
  const { setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);

      try {
        const [profileRes, workoutRes] = await Promise.all([
          api.get("/auth/me"),
          api.get("/workout/me")
        ]);

        if (!active) {
          return;
        }

        setProfile(profileRes.data?.user || null);
        setWorkoutPlan(workoutRes.data || null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const onChangePassword = async (event) => {
    event.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      const { data } = await api.patch("/auth/password", {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordMessage(data?.message || "Password updated.");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setPasswordError(error.response?.data?.message || "Failed to update password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const onDeleteAccount = async () => {
    if (deleteText !== "DELETE" || deletePending) {
      return;
    }

    setDeletePending(true);
    setDeleteError("");

    try {
      await api.delete("/auth/me");
      localStorage.removeItem("token");
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      setDeleteError(error.response?.data?.message || "Failed to delete account.");
      setDeletePending(false);
    }
  };

  return (
    <div className="page-enter min-h-screen">
      <AppNavbar />
      <main className="mx-auto w-full max-w-4xl px-4 pb-10 md:px-6">
        <section className="card p-5 md:p-7">
          <h1 className="text-3xl font-bold">Profile / Settings</h1>

          {loading ? (
            <div className="mt-5 space-y-3">
              <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
              <div className="h-5 w-56 animate-pulse rounded bg-white/10" />
            </div>
          ) : (
            <div className="mt-5 space-y-2">
              <p className="text-sm text-textSecondary">Name</p>
              <p className="text-lg font-semibold">{profile?.name || "-"}</p>
              <p className="mt-3 text-sm text-textSecondary">Email</p>
              <p className="text-lg font-semibold">{profile?.email || "-"}</p>
            </div>
          )}

          <form onSubmit={onChangePassword} className="mt-8 rounded-2xl border border-borderSubtle bg-bgSecondary p-4">
            <h2 className="text-xl font-semibold">Change Password</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <input
                type="password"
                placeholder="Old password"
                className="input-field"
                value={passwordForm.oldPassword}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, oldPassword: event.target.value }))}
                required
              />
              <input
                type="password"
                placeholder="New password"
                className="input-field"
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                required
              />
              <input
                type="password"
                placeholder="Confirm password"
                className="input-field"
                value={passwordForm.confirmPassword}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                required
              />
            </div>

            {passwordError ? (
              <p className="mt-3 rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
                {passwordError}
              </p>
            ) : null}

            {passwordMessage ? (
              <p className="mt-3 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
                {passwordMessage}
              </p>
            ) : null}

            <button type="submit" className="btn-primary mt-4" disabled={passwordSaving}>
              {passwordSaving ? "Updating..." : "Update Password"}
            </button>
          </form>
        </section>

        <section className="card mt-5 p-5 md:p-7">
          <h2 className="text-2xl font-semibold">Fitness Settings</h2>
          {loading ? (
            <div className="mt-4 space-y-3">
              <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-44 animate-pulse rounded bg-white/10" />
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <p className="text-sm">Goal: <span className="text-textSecondary">{workoutPlan?.goal || "-"}</span></p>
              <p className="text-sm">Level: <span className="text-textSecondary">{workoutPlan?.level || "-"}</span></p>
              <p className="text-sm">Days: <span className="text-textSecondary">{workoutPlan?.daysPerWeek || "-"}</span></p>
              <p className="text-sm">Equipment: <span className="text-textSecondary">{workoutPlan?.equipment || "-"}</span></p>
            </div>
          )}

          <Link to="/onboarding" className="btn-ghost mt-5 inline-flex">Re-do Onboarding</Link>
        </section>

        <section className="card mt-5 border-rose-500/50 p-5 md:p-7">
          <h2 className="text-2xl font-semibold text-rose-100">Danger Zone</h2>
          <p className="mt-2 text-sm text-rose-200/90">Delete your account and all associated data permanently.</p>
          <button
            type="button"
            onClick={() => {
              setDeleteText("");
              setDeleteError("");
              setModalOpen(true);
            }}
            className="mt-4 rounded-xl border border-rose-500/70 bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-500/25"
          >
            Delete Account
          </button>
        </section>
      </main>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/60 bg-[#111] p-6">
            <h3 className="text-xl font-bold">Type DELETE to confirm</h3>
            <p className="mt-2 text-sm text-zinc-300">This action cannot be undone.</p>
            <input
              type="text"
              className="input-field mt-4"
              value={deleteText}
              onChange={(event) => setDeleteText(event.target.value)}
              placeholder="DELETE"
            />

            {deleteError ? (
              <p className="mt-3 rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
                {deleteError}
              </p>
            ) : null}

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-200"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onDeleteAccount}
                disabled={deleteText !== "DELETE" || deletePending}
                className="rounded-xl border border-rose-500/70 bg-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletePending ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProfilePage;
