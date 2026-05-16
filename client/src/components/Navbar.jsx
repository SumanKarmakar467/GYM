import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import DownloadAppButton from "./DownloadAppButton";
import useAuth from "../hooks/useAuth";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/workout", label: "Workout" },
  { to: "/todos", label: "Todos" },
  { to: "/wallpaper", label: "Wallpaper" },
  { to: "/profile", label: "Profile" }
];

const Navbar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);

  const getNavLinkClass = (to) => {
    const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);

    return `border-l-2 px-3 py-2 font-body text-xs font-semibold uppercase tracking-widest ${
      isActive
        ? "border-fire bg-fire/10 text-fire"
        : "border-transparent text-mist hover:bg-white/[0.03] hover:text-chalk focus-visible:bg-white/[0.03] focus-visible:text-chalk"
    }`;
  };

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 40);
      setShowTop(y > 400);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <header className={`navbar-shell sticky top-0 z-40 border-b border-fire/20 bg-iron ${isScrolled ? "is-scrolled" : ""}`}>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link to="/dashboard" className="font-display text-3xl tracking-widest text-chalk">
          Gym<span className="text-fire">Forge</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={getNavLinkClass(item.to)}>
              {item.label}
            </NavLink>
          ))}
          {user?.role === "admin" ? (
            <NavLink to="/admin" className={getNavLinkClass("/admin")}>
              Admin
            </NavLink>
          ) : null}
          <DownloadAppButton variant="small" />
        </nav>

        <button
          type="button"
          onClick={logout}
          className="hidden border border-fire/30 px-4 py-2 font-body text-xs font-semibold uppercase tracking-widest text-chalk transition hover:bg-fire/10 focus-visible:bg-fire/10 md:inline-flex"
          style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
        >
          Logout
        </button>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center border border-fire/30 text-chalk md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
        >
          <span className="grid gap-1" aria-hidden="true">
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={prefersReducedMotion ? false : { y: -12, opacity: 0 }}
            animate={prefersReducedMotion ? false : { y: 0, opacity: 1 }}
            exit={prefersReducedMotion ? false : { y: -12, opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.22 }}
            className="border-t border-white/10 bg-iron px-4 py-3 md:hidden"
          >
            <div className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={getNavLinkClass(item.to)}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
              {user?.role === "admin" ? (
                <NavLink to="/admin" className={getNavLinkClass("/admin")} onClick={() => setIsOpen(false)}>
                  Admin
                </NavLink>
              ) : null}
              <div className="pt-1">
                <DownloadAppButton variant="small" />
              </div>

              <button
                type="button"
                onClick={async () => {
                  setIsOpen(false);
                  await logout();
                }}
                className="w-full border border-fire/30 px-3 py-2 text-left text-sm text-chalk hover:bg-fire/10 focus-visible:bg-fire/10"
              >
                Logout
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 top-[68px] z-[-1] bg-transparent"
          aria-label="Close menu"
        />
      ) : null}

      <AnimatePresence>
        {showTop ? (
          <motion.button
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 inline-flex h-11 w-11 items-center justify-center bg-fire text-lg font-bold text-white shadow-[0_8px_24px_rgba(255,69,0,0.45)] hover:bg-ember focus-visible:bg-ember"
            aria-label="Scroll to top"
          >
            ^
          </motion.button>
        ) : null}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
