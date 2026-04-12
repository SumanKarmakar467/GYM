import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
      : "text-textSecondary hover:bg-white/5 hover:text-white focus-visible:bg-white/5 focus-visible:text-white"
  }`;

const Navbar = () => {
  const { logout } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);

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
    <header className={`navbar-shell sticky top-0 z-40 border-b border-borderSubtle ${isScrolled ? "is-scrolled" : ""}`}>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 md:px-6">
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
          className="hidden rounded-lg border border-white/20 px-3 py-2 text-sm text-white transition hover:bg-white/10 focus-visible:bg-white/10 md:inline-flex"
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

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={prefersReducedMotion ? false : { y: -12, opacity: 0 }}
            animate={prefersReducedMotion ? false : { y: 0, opacity: 1 }}
            exit={prefersReducedMotion ? false : { y: -12, opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.22 }}
            className="border-t border-white/10 bg-[#0f0f0f] px-4 py-3 md:hidden"
          >
            <div className="space-y-2">
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
                className="w-full rounded-lg border border-white/20 px-3 py-2 text-left text-sm text-white hover:bg-white/10 focus-visible:bg-white/10"
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
            className="fixed bottom-6 right-6 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 text-lg font-bold text-white shadow-[0_8px_24px_rgba(249,115,22,0.45)] hover:bg-orange-400 focus-visible:bg-orange-400"
            aria-label="Scroll to top"
          >
            ?
          </motion.button>
        ) : null}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
