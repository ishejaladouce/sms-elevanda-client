import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import PageHeader from "../components/layout/PageHeader.jsx";
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
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Notifications"
          subtitle={loading ? "Loading..." : `${unreadCount} unread, ${items.length} total`}
          pill="School updates"
          action={
            <>
              <Link className="text-sm text-accent hover:text-accentHover transition" to="/dashboard">
                &larr; Back to dashboard
              </Link>
              <Button variant="secondary" size="sm" onClick={loadNotifications} disabled={loading}>
                Refresh
              </Button>
            </>
          }
        />

        {pageError ? (
          <div className="mb-6 rounded-control bg-danger/10 ring-1 ring-danger/30 px-4 py-3 text-sm text-danger">
            {pageError}
          </div>
        ) : null}

        <div className="space-y-3 fade-up fade-up-delay-1">
          {items.length === 0 && !loading ? (
            <Card>
              <div className="text-center text-muted py-8">No notifications yet.</div>
            </Card>
          ) : null}

          {items.map((n) => (
            <Card key={n.id} padded={false} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-xs text-muted">{formatDateTime(n.createdAt)}</div>
                  <div className="mt-1.5 text-text">{n.message}</div>
                </div>
                <div className="flex-none">
                  {n.isRead ? <Badge>Read</Badge> : <Badge variant="warning">Unread</Badge>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

