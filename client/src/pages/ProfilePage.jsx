import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";
import AppNavbar from "../components/layout/AppNavbar";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });

const ProfilePage = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await api.get("/profile/me");
      return data;
    }
  });

  useEffect(() => {
    if (profileQuery.data) {
      setName(profileQuery.data.name || "");
      setAvatar(profileQuery.data.avatar || "");
    }
  }, [profileQuery.data]);

  const onboardingQuery = useQuery({
    queryKey: ["onboarding"],
    queryFn: async () => {
      const { data } = await api.get("/onboarding/me");
      return data;
    },
    retry: false
  });

  const hasNoOnboardingProfile = onboardingQuery.isSuccess && !onboardingQuery.data;

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch("/profile/me", { name, avatar });
      return data;
    },
    onSuccess: async () => {
      addToast("Profile updated.", "success");
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await refreshUser();
    },
    onError: () => addToast("Failed to update profile.", "error")
  });

  const onAvatarFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      addToast("Please upload an image file.", "error");
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      addToast("Image is too large. Please use a file under 2MB.", "error");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setAvatar(dataUrl);
      addToast("Profile picture ready. Click Save Changes.", "info");
    } catch {
      addToast("Failed to load image.", "error");
    }
  };

  const initials = (name || profileQuery.data?.name || "U").trim().slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen">
      <AppNavbar />
      <main className="mx-auto w-full max-w-4xl px-4 pb-10 md:px-6">
        <section className="card p-5 md:p-7">
          <h1 className="text-3xl font-bold">Profile</h1>
          <div className="mt-5 grid gap-5 md:grid-cols-[auto_1fr] md:items-start">
            <div className="w-full max-w-[180px]">
              <div className="grid h-40 w-40 place-items-center overflow-hidden rounded-2xl border border-borderSubtle bg-bgSecondary text-5xl font-semibold text-brandSecondary">
                {avatar ? (
                  <img src={avatar} alt="Profile avatar" className="h-full w-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <label htmlFor="avatar-upload" className="btn-ghost mt-3 inline-flex cursor-pointer text-sm">
                Upload Photo
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onAvatarFileChange}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-textSecondary">Display Name</p>
                <input className="input-field mt-1" value={name} onChange={(event) => setName(event.target.value)} />
              </div>
              <div>
                <p className="text-sm text-textSecondary">Email</p>
                <div className="mt-1 rounded-xl border border-borderSubtle bg-bgSecondary px-3 py-2.5 text-sm">
                  {profileQuery.data?.email || "-"}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-primary mt-5"
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </section>

        <section className="mt-5 card p-5 md:p-7">
          <h2 className="text-2xl font-semibold">Onboarding Profile</h2>
          {onboardingQuery.isError || hasNoOnboardingProfile ? (
            <p className="mt-2 text-textSecondary">No onboarding profile yet.</p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <p className="text-sm">Age: <span className="text-textSecondary">{onboardingQuery.data?.age ?? "-"}</span></p>
              <p className="text-sm">Weight: <span className="text-textSecondary">{onboardingQuery.data?.weightKg ?? "-"} kg</span></p>
              <p className="text-sm">Height: <span className="text-textSecondary">{onboardingQuery.data?.heightCm ?? "-"} cm</span></p>
              <p className="text-sm">Goal: <span className="text-textSecondary">{onboardingQuery.data?.goal ?? "-"}</span></p>
              <p className="text-sm">Environment: <span className="text-textSecondary">{onboardingQuery.data?.environment ?? "-"}</span></p>
              <p className="text-sm">Duration: <span className="text-textSecondary">{onboardingQuery.data?.durationWeeks ?? "-"} weeks</span></p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;
