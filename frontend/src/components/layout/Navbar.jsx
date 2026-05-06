import { useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Button from "../ui/Button.jsx";

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "px-3 py-2 rounded-control text-sm transition duration-200 ease-smooth",
          isActive ? "bg-accent text-bg" : "text-muted hover:bg-surface2 hover:text-text",
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

  const hideOnAuthPages = location.pathname === "/login" || location.pathname === "/register";
  if (hideOnAuthPages) return null;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-3">
        <Link to="/dashboard" className="font-display text-lg">
          SMS Elevanda
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavItem key={l.to} to={l.to} label={l.label} />
          ))}
        </nav>

        <div className="md:hidden">
          <Button variant="secondary" size="sm" onClick={() => setOpen((v) => !v)}>
            Menu
          </Button>
        </div>
      </div>

      {open ? (
        <div className="md:hidden border-t border-border bg-bg">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <NavItem key={l.to} to={l.to} label={l.label} onClick={() => setOpen(false)} />
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}

