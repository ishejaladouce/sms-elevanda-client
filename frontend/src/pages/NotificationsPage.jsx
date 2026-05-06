import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import { api } from "../services/api.js";

function formatDateTime(value) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  async function loadNotifications() {
    setLoading(true);
    setPageError("");
    try {
      const res = await api.get("/api/client/notifications");
      setItems(res.data?.data?.items ?? []);
    } catch (err) {
      setPageError(err?.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = useMemo(() => items.filter((n) => !n.isRead).length, [items]);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl">Notifications</h1>
            <p className="text-muted mt-1">
              {loading ? "Loading..." : `${unreadCount} unread`}
            </p>
          </div>
          <Link className="text-accent hover:underline text-sm" to="/dashboard">
            Back to dashboard
          </Link>
        </div>

        {pageError ? <div className="mt-4 text-danger text-sm">{pageError}</div> : null}

        <div className="mt-6 flex items-center justify-between">
          <div className="text-muted text-sm">{loading ? "Please wait..." : `${items.length} item(s)`}</div>
          <Button variant="secondary" size="sm" onClick={loadNotifications} disabled={loading}>
            Refresh
          </Button>
        </div>

        <div className="mt-3 space-y-3">
          {items.length === 0 && !loading ? <div className="text-muted text-sm">No notifications yet</div> : null}

          {items.map((n) => (
            <Card key={n.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-muted">{formatDateTime(n.createdAt)}</div>
                  <div className="mt-2">{n.message}</div>
                </div>
                <div>{n.isRead ? <Badge>Read</Badge> : <Badge variant="warning">Unread</Badge>}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

