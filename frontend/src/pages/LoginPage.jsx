import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";
import { api } from "../services/api.js";
import { deviceId } from "../utils/device.js";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

function handleMouseMove(e) {
  const target = e.currentTarget;
  const rect = target.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  target.style.setProperty("--mx", `${x}%`);
  target.style.setProperty("--my", `${y}%`);
}

function handleTileMouseMove(e) {
  const target = e.currentTarget;
  const rect = target.getBoundingClientRect();
  target.style.setProperty("--mx", `${e.clientX - rect.left}px`);
  target.style.setProperty("--my", `${e.clientY - rect.top}px`);
}

export default function LoginPage() {
  const nav = useNavigate();
  const location = useLocation();
  const flashNotice = location.state?.notice;
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values) {
    try {
      form.clearErrors("root");
      await api.post("/api/auth/login", { ...values, deviceId: deviceId() });
      nav("/dashboard");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Login failed. Please check your details and try again.";
      form.setError("root", { type: "server", message });
    }
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen relative overflow-hidden bg-bg text-text flex flex-col"
    >
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-12%] left-[-8%] h-[42rem] w-[42rem] rounded-full bg-accent/15 blur-[120px] aurora-blob" />
        <div className="absolute bottom-[-15%] right-[-10%] h-[34rem] w-[34rem] rounded-full bg-accent/8 blur-[120px] aurora-blob" />
        <div className="absolute inset-0 bg-grid opacity-50" />
      </div>
      <div className="spotlight -z-10" />
      <div className="grain-overlay -z-10" />

      {/* Top bar */}
      <header className="relative z-20 px-5 sm:px-8 lg:px-12 py-5 flex items-center justify-between">
        <div className="font-display text-xl tracking-tight">
          <span className="text-text">SMS</span>{" "}
          <span className="text-accent">Elevanda</span>
        </div>
        <ThemeToggle size="sm" />
      </header>

      {/* Split content */}
      <div className="flex-1 px-5 sm:px-8 lg:px-12 pb-10 lg:pb-12">
        <div className="lg:grid lg:grid-cols-[1.2fr_1fr] lg:gap-12 xl:gap-16 max-w-7xl mx-auto h-full">
          {/* LEFT — content + bento */}
          <aside className="flex flex-col justify-center py-8 lg:py-12">
            <div className="fade-up inline-flex items-center gap-2 rounded-full bg-surface ring-1 ring-border px-3 py-1 text-xs text-muted self-start">
              <span className="status-dot h-1.5 w-1.5 rounded-full bg-success" />
              School management, reimagined for Rwanda
            </div>

            <h1
              className="fade-up fade-up-delay-1 font-display tracking-tighter mt-6 leading-[0.95]"
              style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)" }}
            >
              Where school
              <br />
              meets <span className="text-gradient italic">home.</span>
            </h1>

            <p className="fade-up fade-up-delay-2 mt-6 text-base sm:text-lg text-muted max-w-xl leading-relaxed">
              SMS Elevanda keeps parents, students and staff perfectly in
              sync &mdash; fees, grades, attendance and timetable, all in one
              calm and beautiful place.
            </p>

            {/* Feature highlights — what every parent and student gets */}
            <div className="fade-up fade-up-delay-3 mt-10 grid grid-cols-2 gap-3 sm:gap-4 max-w-xl">
              <FeatureTile
                icon={<CoinsIcon />}
                title="Fees, simplified"
                body="Deposit, withdraw and always know your balance — without queues or paperwork."
              />
              <FeatureTile
                icon={<ChartIcon />}
                title="Grades you can trust"
                body="Every score, every term, every subject — straight from the teacher's hand."
              />
              <FeatureTile
                icon={<CalendarIcon />}
                title="Daily attendance"
                body="See present, late and absent days at a glance — no more guesswork."
              />
              <FeatureTile
                icon={<ClockIcon />}
                title="Today's lessons"
                body="The week's timetable in your pocket. Never miss what's coming up."
              />
            </div>
          </aside>

          {/* RIGHT — form */}
          <main className="flex items-center justify-center py-8 lg:py-12">
            <div className="fade-up fade-up-delay-2 w-full max-w-md">
              <div className="glass rounded-2xl p-7 sm:p-8 shadow-card relative overflow-hidden">
                <div className="pointer-events-none absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

                <div>
                  <h2 className="font-display text-2xl text-text tracking-tight">
                    Welcome back
                  </h2>
                  <p className="mt-1.5 text-muted text-sm">
                    Sign in to continue to your portal.
                  </p>
                </div>

                {flashNotice ? (
                  <div className="mt-5 rounded-control bg-success/10 ring-1 ring-success/30 px-4 py-3 text-success text-sm flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-success flex-none" />
                    <span>{flashNotice}</span>
                  </div>
                ) : null}

                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="mt-6 space-y-4"
                >
                  <Input
                    label="Email address"
                    type="email"
                    autoComplete="email"
                    icon={<MailIcon />}
                    placeholder="you@example.com"
                    error={form.formState.errors.email?.message}
                    {...form.register("email")}
                  />
                  <Input
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    icon={<LockIcon />}
                    placeholder="Enter your password"
                    error={form.formState.errors.password?.message}
                    {...form.register("password")}
                  />

                  {form.formState.errors.root?.message ? (
                    <div className="rounded-control bg-danger/10 ring-1 ring-danger/30 px-4 py-3 text-sm text-danger flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-danger flex-none" />
                      <span>{form.formState.errors.root.message}</span>
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    size="lg"
                    loading={form.formState.isSubmitting}
                    className="w-full mt-1"
                  >
                    Sign in &rarr;
                  </Button>
                </form>

                <div className="mt-5 text-center text-sm text-muted">
                  New here?{" "}
                  <Link
                    className="text-accent font-medium hover:text-accentHover transition"
                    to="/register"
                  >
                    Create an account
                  </Link>
                </div>
              </div>

              {/* Device pill */}
              <div className="mt-4 flex flex-col items-center gap-1.5">
                <div className="inline-flex items-center gap-2 rounded-full bg-surface ring-1 ring-border px-3 py-1.5 text-[11px] max-w-full">
                  <span className="text-muted">Device</span>
                  <span className="font-mono text-text/80 truncate max-w-[18rem]">
                    {deviceId()}
                  </span>
                </div>
                <div className="text-[11px] text-muted text-center px-2">
                  An admin must verify this device before login is allowed.
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   FEATURE TILES — value props shown on the marketing side
   ============================================================ */

function FeatureTile({ icon, title, body }) {
  return (
    <div onMouseMove={handleTileMouseMove} className="tile p-5">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 ring-1 ring-accent/25 text-accent">
        {icon}
      </span>
      <div className="mt-4 font-display text-lg sm:text-xl tracking-tight text-text">
        {title}
      </div>
      <p className="mt-1.5 text-xs sm:text-sm text-muted leading-relaxed">
        {body}
      </p>
    </div>
  );
}

function CoinsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
      <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m7 14 4-4 4 4 5-6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="m8 14 2 2 4-4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
