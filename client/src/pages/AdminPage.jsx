import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../api/api";
import AppNavbar from "../components/layout/AppNavbar";

const metrics = [
  { key: "users", label: "Total Users" },
  { key: "admins", label: "Admins" },
  { key: "onboardedUsers", label: "Onboarded Users" },
  { key: "profiles", label: "Onboarding Profiles" },
  { key: "plans", label: "Workout Plans" },
  { key: "todos", label: "Todo Items" },
  { key: "completedTodos", label: "Completed Todos" }
];

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
      const { data } = await api.get("/admin/users");
      return data.users || [];
    }
  });

  useEffect(() => {
    if (usersQuery.isError) {
      toast.error("Failed to load users.");
    }
  }, [usersQuery.isError]);

  return (
    <div className="min-h-screen">
      <AppNavbar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-6">
        <section className="card p-5 md:p-7">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brandSecondary">Control Center</p>
          <h1 className="mt-2 text-3xl font-bold">Admin Panel</h1>
          <p className="mt-2 text-sm text-textSecondary">Monitor users and system usage from one place.</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <article key={metric.key} className="card p-4">
                <p className="text-xs uppercase tracking-wide text-textSecondary">{metric.label}</p>
                <p className="mt-2 font-display text-5xl text-brandPrimary">
                  {overviewQuery.data?.[metric.key] ?? 0}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-5 card p-5 md:p-7">
          <h2 className="text-2xl font-semibold">Recent Users</h2>

          {usersQuery.isLoading ? (
            <p className="mt-3 text-textSecondary">Loading users...</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-borderSubtle text-textSecondary">
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Onboarded</th>
                    <th className="px-3 py-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {(usersQuery.data || []).map((item) => (
                    <tr key={item._id} className="border-b border-borderSubtle/70">
                      <td className="px-3 py-2">{item.name || "-"}</td>
                      <td className="px-3 py-2 text-textSecondary">{item.email}</td>
                      <td className="px-3 py-2">
                        <span className="badge">{item.role || "user"}</span>
                      </td>
                      <td className="px-3 py-2">{item.isOnboarded ? "Yes" : "No"}</td>
                      <td className="px-3 py-2 text-textSecondary">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminPage;
