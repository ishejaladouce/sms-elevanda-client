import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { api } from "../../services/api.js";
import ThemeToggle from "../ui/ThemeToggle.jsx";

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "px-3 py-2 rounded-control text-sm font-medium transition-all duration-200 ease-smooth",
          isActive
            ? "text-text bg-surface2"
            : "text-muted hover:text-text hover:bg-surface2",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const nav = useNavigate();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const links = useMemo(
    () => [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/fees", label: "Fees" },
      { to: "/grades", label: "Grades" },
      { to: "/attendance", label: "Attendance" },
      { to: "/timetable", label: "Timetable" },
      { to: "/notifications", label: "Notifications" },
      { to: "/profile", label: "Profile" },
    ],
    []
  );

  const hideOnAuthPages =
    location.pathname === "/login" || location.pathname === "/register";
  if (hideOnAuthPages) return null;

  async function handleLogout() {
    try {
      await api.post("/api/auth/logout");
    } catch {
      /* ignore - cookie still cleared on server side */
    }
    nav("/login");
  }

  return (
    <header className="sticky top-0 z-30 bg-bg/85 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          <Link
            to="/dashboard"
            className="font-display text-lg sm:text-xl leading-none tracking-tight"
          >
            <span className="text-text">SMS</span>{" "}
            <span className="text-accent">Elevanda</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <NavItem key={l.to} to={l.to} label={l.label} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle size="sm" className="hidden sm:inline-flex" />
            <button
              onClick={handleLogout}
              className="hidden sm:inline-flex h-9 px-4 items-center rounded-control text-sm font-medium text-muted hover:text-text hover:bg-surface2 transition-all"
            >
              Logout
            </button>

            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-control text-text hover:bg-surface2 transition-all"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {open ? (
                  <path
                    d="M5 5L15 15M15 5L5 15"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M3 6H17M3 10H17M3 14H17"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div className="lg:hidden bg-bg border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <NavItem
                key={l.to}
                to={l.to}
                label={l.label}
                onClick={() => setOpen(false)}
              />
            ))}
            <div className="mt-2 flex items-center justify-between gap-2">
              <ThemeToggle size="sm" />
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-left rounded-control text-sm font-medium text-muted hover:text-text hover:bg-surface2 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
