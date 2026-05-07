import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import PageHeader from "../components/layout/PageHeader.jsx";
import { api } from "../services/api.js";
import { useThemeStore } from "../store/themeStore.js";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  async function loadProfile() {
    setLoading(true);
    setPageError("");
    try {
      const res = await api.get("/api/client/profile");
      setProfile(res.data?.data ?? null);
    } catch (err) {
      setPageError(err?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await api.post("/api/auth/logout");
    window.location.href = "/login";
  }

  useEffect(() => {
    loadProfile();
  }, []);

  const user = profile?.student?.user || null;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="Profile"
          subtitle="Your account details, device and appearance."
          pill="Settings"
          action={
            <Link className="text-sm text-accent hover:text-accentHover transition" to="/dashboard">
              &larr; Back to dashboard
            </Link>
          }
        />

        {pageError ? (
          <div className="mb-6 rounded-control bg-danger/10 ring-1 ring-danger/30 px-4 py-3 text-sm text-danger">
            {pageError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 fade-up fade-up-delay-1">
          <Card title="Account">
            <div className="space-y-4">
              <Field label="Name" value={loading ? "—" : user?.name ?? "—"} />
              <Field label="Email" value={loading ? "—" : user?.email ?? "—"} mono />
              <Field label="Role" value={loading ? "—" : user?.role ?? "—"} mono />
            </div>
          </Card>

          <Card title="Device">
            <div className="space-y-4">
              <Field
                label="Device ID"
                value={loading ? "—" : user?.deviceId ?? "—"}
                mono
              />
              <div>
                <div className="text-xs uppercase tracking-wider font-medium text-muted">
                  Verification
                </div>
                <div className="mt-2">
                  {loading ? (
                    <span className="text-text">—</span>
                  ) : user?.isDeviceVerified ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs text-success ring-1 ring-success/25">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-2.5 py-1 text-xs text-danger ring-1 ring-danger/25">
                      <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                      Not verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Appearance */}
        <div className="mt-5 fade-up fade-up-delay-2">
          <Card title="Appearance">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-text font-medium">Theme</div>
                <div className="text-sm text-muted mt-1">
                  Switch between dark and light modes. Your choice is saved on this device.
                </div>
              </div>
              <div className="inline-flex rounded-control bg-surface2 ring-1 ring-border p-1">
                <ThemeOption
                  active={theme === "dark"}
                  label="Dark"
                  onClick={() => setTheme("dark")}
                />
                <ThemeOption
                  active={theme === "light"}
                  label="Light"
                  onClick={() => setTheme("light")}
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 flex justify-end">
          <Button variant="secondary" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

function ThemeOption({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-4 h-9 rounded-md text-sm font-medium transition-all",
        active
          ? "bg-accent text-bg shadow-sm"
          : "text-muted hover:text-text",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function Field({ label, value, mono }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider font-medium text-muted">
        {label}
      </div>
      <div className={["mt-1.5 text-text", mono ? "font-mono break-all text-sm" : ""].join(" ")}>
        {value}
      </div>
    </div>
  );
}

