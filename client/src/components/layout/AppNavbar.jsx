import { Link, NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const baseNavItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/plan", label: "Plan" },
  { to: "/tracker", label: "Tracker" },
  { to: "/profile", label: "Profile" }
];

const AppNavbar = () => {
  const { user, logout } = useAuth();
  const navItems = user?.role === "admin"
    ? [...baseNavItems, { to: "/admin", label: "Admin" }]
    : baseNavItems;

  return (
    <header className="sticky top-0 z-30 mb-6 border-b border-borderSubtle bg-black/65 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/dashboard" className="font-display text-3xl tracking-wide text-brandPrimary">
          GymForge
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-2 py-1 text-sm font-medium transition ${
                  isActive
                    ? "bg-brandPrimary/20 text-brandPrimary"
                    : "text-textSecondary hover:bg-brandPrimary/10 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button type="button" onClick={logout} className="btn-ghost text-sm">
          Logout
        </button>
      </div>
    </header>
  );
};

export default AppNavbar;
