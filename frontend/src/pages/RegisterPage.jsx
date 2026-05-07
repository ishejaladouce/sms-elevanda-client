import { forwardRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";
import { api } from "../services/api.js";
import { deviceId } from "../utils/device.js";

const schema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["STUDENT", "PARENT"]),
});

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

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

export default function RegisterPage() {
  const nav = useNavigate();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", role: "STUDENT" },
  });

  const role = form.watch("role");

  async function onSubmit(values) {
    try {
      form.clearErrors("root");
      await api.post("/api/auth/register", { ...values, deviceId: deviceId() });
      nav("/login");
    } catch (err) {
      const message =
        err?.response?.data?.message || "Registration failed. Please try again.";
      form.setError("root", { type: "server", message });
    }
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen relative overflow-hidden bg-bg text-text flex flex-col"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-12%] left-[-8%] h-[42rem] w-[42rem] rounded-full bg-accent/15 blur-[120px] aurora-blob" />
        <div className="absolute bottom-[-15%] right-[-10%] h-[34rem] w-[34rem] rounded-full bg-accent/8 blur-[120px] aurora-blob" />
        <div className="absolute inset-0 bg-grid opacity-50" />
      </div>
      <div className="spotlight -z-10" />
      <div className="grain-overlay -z-10" />

      <header className="relative z-20 px-5 sm:px-8 lg:px-12 py-5 flex items-center justify-between">
        <div className="font-display text-xl tracking-tight">
          <span className="text-text">SMS</span>{" "}
          <span className="text-accent">Elevanda</span>
        </div>
        <ThemeToggle size="sm" />
      </header>

      <div className="flex-1 px-5 sm:px-8 lg:px-12 pb-10 lg:pb-12">
        <div className="lg:grid lg:grid-cols-[1.2fr_1fr] lg:gap-12 xl:gap-16 max-w-7xl mx-auto h-full">
          {/* LEFT — content + steps */}
          <aside className="flex flex-col justify-center py-8 lg:py-12">
            <div className="fade-up inline-flex items-center gap-2 rounded-full bg-surface ring-1 ring-border px-3 py-1 text-xs text-muted self-start">
              <span className="status-dot h-1.5 w-1.5 rounded-full bg-accent" />
              Free for parents and students
            </div>

            <h1
              className="fade-up fade-up-delay-1 font-display tracking-tighter mt-6 leading-[0.95]"
              style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)" }}
            >
              Start the
              <br />
              school year{" "}
              <span className="text-gradient italic">strong.</span>
            </h1>

            <p className="fade-up fade-up-delay-2 mt-6 text-base sm:text-lg text-muted max-w-xl leading-relaxed">
              Create your SMS Elevanda account in under a minute. After your
              school admin verifies your device, your full portal opens up.
            </p>

            {/* 3-step bento */}
            <div className="fade-up fade-up-delay-3 mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-xl">
              <StepTile
                n="01"
                title="Fill details"
                description="Pick your role and add basic info."
              />
              <StepTile
                n="02"
                title="Get verified"
                description="A quick check by your school admin."
              />
              <StepTile
                n="03"
                title="You're in"
                description="Sign in and explore the full portal."
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
                    Create your account
                  </h2>
                  <p className="mt-1.5 text-muted text-sm">
                    It only takes a minute.
                  </p>
                </div>

                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="mt-6 space-y-4"
                >
                  <Input
                    label="Full name"
                    autoComplete="name"
                    icon={<UserIcon />}
                    placeholder="Enter your full name"
                    error={form.formState.errors.name?.message}
                    {...form.register("name")}
                  />
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
                    autoComplete="new-password"
                    icon={<LockIcon />}
                    placeholder="At least 6 characters"
                    error={form.formState.errors.password?.message}
                    {...form.register("password")}
                  />

                  <div>
                    <label className="block text-xs font-medium text-muted mb-2 tracking-wide uppercase">
                      I am a
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <RoleOption
                        active={role === "STUDENT"}
                        label="Student"
                        description="View my own records"
                        {...form.register("role")}
                        value="STUDENT"
                      />
                      <RoleOption
                        active={role === "PARENT"}
                        label="Parent"
                        description="Manage my children"
                        {...form.register("role")}
                        value="PARENT"
                      />
                    </div>
                  </div>

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
                    Create account &rarr;
                  </Button>
                </form>

                <div className="mt-5 text-center text-sm text-muted">
                  Already have an account?{" "}
                  <Link
                    className="text-accent font-medium hover:text-accentHover transition"
                    to="/login"
                  >
                    Sign in
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
                  Save this ID. An admin needs it to verify your device.
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function StepTile({ n, title, description }) {
  return (
    <div onMouseMove={handleTileMouseMove} className="tile p-5">
      <div className="flex items-center gap-3">
        <div className="flex-none w-10 h-10 rounded-xl bg-surface2 ring-1 ring-border flex items-center justify-center font-mono text-sm text-accent">
          {n}
        </div>
        <div className="text-text font-medium text-sm">{title}</div>
      </div>
      <div className="mt-3 text-sm text-muted leading-relaxed">{description}</div>
    </div>
  );
}

const RoleOption = forwardRef(function RoleOption(
  { active, label, description, ...props },
  ref
) {
  return (
    <label
      className={[
        "relative flex flex-col cursor-pointer rounded-control px-4 py-3 transition-all duration-200",
        active
          ? "bg-accent/10 ring-2 ring-accent"
          : "bg-surface ring-1 ring-border hover:ring-borderStrong",
      ].join(" ")}
    >
      <input ref={ref} type="radio" className="sr-only" {...props} />
      <span
        className={[
          "text-sm font-semibold",
          active ? "text-accent" : "text-text",
        ].join(" ")}
      >
        {label}
      </span>
      <span className="text-xs text-muted mt-0.5">{description}</span>
    </label>
  );
});
