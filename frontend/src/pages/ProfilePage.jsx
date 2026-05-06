import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import { api } from "../services/api.js";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

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
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl">Profile</h1>
            <p className="text-muted mt-1">Account details</p>
          </div>
          <Link className="text-accent hover:underline text-sm" to="/dashboard">
            Back to dashboard
          </Link>
        </div>

        {pageError ? <div className="mt-4 text-danger text-sm">{pageError}</div> : null}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="User">
            <div className="space-y-2">
              <div className="text-sm text-muted">Name</div>
              <div>{loading ? "—" : user?.name ?? "—"}</div>
              <div className="text-sm text-muted mt-3">Email</div>
              <div className="font-mono">{loading ? "—" : user?.email ?? "—"}</div>
              <div className="text-sm text-muted mt-3">Role</div>
              <div className="font-mono">{loading ? "—" : user?.role ?? "—"}</div>
            </div>
          </Card>

          <Card title="Device">
            <div className="space-y-2">
              <div className="text-sm text-muted">Device ID</div>
              <div className="font-mono break-all">{loading ? "—" : user?.deviceId ?? "—"}</div>
              <div className="text-sm text-muted mt-3">Device verified</div>
              <div>{loading ? "—" : user?.isDeviceVerified ? "Yes" : "No"}</div>
            </div>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

