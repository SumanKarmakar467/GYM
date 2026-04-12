import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/workout", label: "Workout" },
  { to: "/todos", label: "Todos" },
  { to: "/wallpaper", label: "Wallpaper" },
  { to: "/profile", label: "Profile" }
];

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-orange-500/20 text-orange-300"
      : "text-textSecondary hover:bg-white/5 hover:text-white"
  }`;

const Navbar = () => {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-borderSubtle bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/dashboard" className="font-display text-3xl tracking-wide text-brandPrimary">
          GymForge
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={logout}
          className="hidden rounded-lg border border-white/20 px-3 py-2 text-sm text-white transition hover:bg-white/10 md:inline-flex"
        >
          Logout
        </button>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-white md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
        >
          ?
        </button>
      </div>

      <div
        className={`overflow-hidden border-t border-white/10 transition-all duration-300 md:hidden ${
          isOpen ? "max-h-[420px]" : "max-h-0"
        }`}
      >
        <div className="space-y-2 bg-[#0f0f0f] px-4 py-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={navLinkClass}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={async () => {
              setIsOpen(false);
              await logout();
            }}
            className="w-full rounded-lg border border-white/20 px-3 py-2 text-left text-sm text-white"
          >
            Logout
          </button>
        </div>
      </div>

      {isOpen ? <button type="button" onClick={() => setIsOpen(false)} className="fixed inset-0 top-[65px] z-[-1] bg-transparent" aria-label="Close menu" /> : null}
    </header>
  );
};

export default Navbar;
