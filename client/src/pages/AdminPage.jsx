import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../api/api";
import AppNavbar from "../components/layout/AppNavbar";
import GymCard from "../components/ui/GymCard";

const metrics = [
  { key: "users", label: "Total Users" },
  { key: "registrations", label: "Registrations" },
  { key: "logins", label: "Logins" },
  { key: "activeUsers", label: "Active Users" },
  { key: "plans", label: "Workout Plans" },
  { key: "todos", label: "Todo Items" },
  { key: "completedTodos", label: "Completed Todos" },
  { key: "totalActivity", label: "Usage Events" }
];

const formatDate = (value) => (value ? new Date(value).toLocaleString() : "-");

const AdminPage = () => {
  const overviewQuery = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const { data } = await api.get("/admin/overview");
      return data;
    }
  });

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await api.get("/admin/users?limit=100");
      return data.users || [];
    }
  });

  const activityQuery = useQuery({
    queryKey: ["admin-activity"],
    queryFn: async () => {
      const { data } = await api.get("/admin/activity?limit=80");
      return data.activities || [];
    }
  });

  useEffect(() => {
    if (overviewQuery.isError || usersQuery.isError || activityQuery.isError) {
      toast.error("Failed to load admin data.");
    }
  }, [overviewQuery.isError, usersQuery.isError, activityQuery.isError]);

  return (
    <div className="min-h-screen bg-charcoal text-chalk">
      <AppNavbar />
      <main className="page-enter mx-auto w-full max-w-7xl px-4 pb-10 md:px-6">
        <section className="py-6">
          <p className="font-body text-xs font-bold uppercase tracking-[3px] text-fire">Control Center</p>
          <h1 className="mt-2 font-display text-5xl tracking-wide">Admin Section</h1>
          <p className="mt-2 max-w-2xl text-sm text-mist">
            Track registrations, login volume, user activity, and feature usage history.
          </p>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <GymCard key={metric.key} className="p-4">
              <p className="font-body text-xs font-bold uppercase tracking-[2px] text-mist">{metric.label}</p>
              <p className="mt-2 font-display text-5xl text-fire">
                {overviewQuery.data?.[metric.key] ?? 0}
              </p>
            </GymCard>
          ))}
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          <GymCard className="p-5 md:p-6" hover={false}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-body text-xs font-bold uppercase tracking-[2px] text-mist">User Registry</p>
                <h2 className="font-cond text-3xl font-bold uppercase tracking-wide">Users and Usage</h2>
              </div>
              <p className="text-sm text-mist">{usersQuery.data?.length || 0} users shown</p>
            </div>

            {usersQuery.isLoading ? (
              <p className="mt-5 text-mist">Loading users...</p>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-mist">
                      <th className="px-3 py-3">Name</th>
                      <th className="px-3 py-3">Email</th>
                      <th className="px-3 py-3">Role</th>
                      <th className="px-3 py-3">Logins</th>
                      <th className="px-3 py-3">Plans</th>
                      <th className="px-3 py-3">Todo Uses</th>
                      <th className="px-3 py-3">Last Activity</th>
                      <th className="px-3 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(usersQuery.data || []).map((item) => (
                      <tr key={item._id} className="border-b border-white/[0.04] hover:bg-white/[0.03]">
                        <td className="px-3 py-3 font-semibold">{item.name || "-"}</td>
                        <td className="px-3 py-3 text-mist">{item.email}</td>
                        <td className="px-3 py-3">
                          <span className="badge">{item.role || "user"}</span>
                        </td>
                        <td className="px-3 py-3 text-fire">{item.usage?.loginCount ?? 0}</td>
                        <td className="px-3 py-3">{item.usage?.planCount ?? 0}</td>
                        <td className="px-3 py-3">{item.usage?.todoActions ?? 0}</td>
                        <td className="px-3 py-3 text-mist">
                          <span className="block max-w-[220px] truncate">{item.usage?.lastActivity || "-"}</span>
                          <span className="text-xs">{formatDate(item.usage?.lastActivityAt)}</span>
                        </td>
                        <td className="px-3 py-3 text-mist">{formatDate(item.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GymCard>

          <GymCard className="p-5 md:p-6" hover={false}>
            <p className="font-body text-xs font-bold uppercase tracking-[2px] text-mist">Use History</p>
            <h2 className="font-cond text-3xl font-bold uppercase tracking-wide">Recent Activity</h2>

            {activityQuery.isLoading ? (
              <p className="mt-5 text-mist">Loading activity...</p>
            ) : (
              <div className="mt-5 space-y-3">
                {(activityQuery.data || []).map((activity) => (
                  <article key={activity.id} className="border-l-2 border-fire bg-steel/60 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{activity.message}</p>
                        <p className="mt-1 text-xs text-mist">
                          {activity.user?.name || "Unknown user"} - {activity.user?.email || "No email"}
                        </p>
                      </div>
                      <span className="badge flex-shrink-0">{activity.type}</span>
                    </div>
                    <p className="mt-2 text-xs text-mist">{formatDate(activity.createdAt)}</p>
                  </article>
                ))}

                {(activityQuery.data || []).length === 0 ? (
                  <p className="text-sm text-mist">No user activity has been recorded yet.</p>
                ) : null}
              </div>
            )}
          </GymCard>
        </section>
      </main>
    </div>
  );
};

export default AdminPage;
