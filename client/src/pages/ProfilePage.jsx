import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import AppNavbar from "../components/layout/AppNavbar";
import useAuth from "../hooks/useAuth";

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });

const ProfilePage = () => {
  const { setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState("");
  const [avatarDirty, setAvatarDirty] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarMessage, setAvatarMessage] = useState("");

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
        setAvatar(profileRes.data?.user?.avatar || "");
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

  const onAvatarFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setAvatarError("");
    setAvatarMessage("");

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please upload a valid image file.");
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setAvatarError("Image is too large. Use a file under 2MB.");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setAvatar(dataUrl);
      setAvatarDirty(true);
    } catch {
      setAvatarError("Failed to load selected image.");
    }
  };

  const onSaveAvatar = async () => {
    if (avatarSaving || !avatarDirty) {
      return;
    }

    setAvatarSaving(true);
    setAvatarError("");
    setAvatarMessage("");

    try {
      const { data } = await api.patch("/profile/me", { avatar });
      setAvatar(data?.avatar || "");
      setAvatarDirty(false);
      setAvatarMessage("Profile image updated.");
      setProfile((prev) => (prev ? { ...prev, avatar: data?.avatar || "" } : prev));
      setUser((prev) => (prev ? { ...prev, avatar: data?.avatar || "" } : prev));
    } catch (error) {
      setAvatarError(error.response?.data?.message || "Failed to update profile image.");
    } finally {
      setAvatarSaving(false);
    }
  };

  const initials = String(profile?.name || "U").trim().slice(0, 1).toUpperCase();

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
            <div className="mt-5 grid gap-6 md:grid-cols-[auto_1fr]">
              <div>
                <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-full border border-borderSubtle bg-bgSecondary text-3xl font-semibold text-brandSecondary">
                  {avatar ? (
                    <img src={avatar} alt="Profile avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="mt-3 inline-flex cursor-pointer rounded-lg border border-white/20 px-3 py-2 text-xs text-white hover:bg-white/10"
                >
                  Change Image
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onAvatarFileChange}
                />
                <button
                  type="button"
                  onClick={onSaveAvatar}
                  disabled={!avatarDirty || avatarSaving}
                  className="mt-2 block rounded-lg border border-emerald-400/60 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-100 disabled:opacity-50"
                >
                  {avatarSaving ? "Saving..." : "Save Image"}
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-textSecondary">Name</p>
                <p className="text-lg font-semibold">{profile?.name || "-"}</p>
                <p className="mt-3 text-sm text-textSecondary">Email</p>
                <p className="text-lg font-semibold">{profile?.email || "-"}</p>

                {avatarError ? (
                  <p className="mt-3 rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
                    {avatarError}
                  </p>
                ) : null}

                {avatarMessage ? (
                  <p className="mt-3 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
                    {avatarMessage}
                  </p>
                ) : null}
              </div>
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
              <p className="text-sm">Duration: <span className="text-textSecondary">{workoutPlan?.durationLabel || workoutPlan?.daysPerWeek || "-"}</span></p>
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
