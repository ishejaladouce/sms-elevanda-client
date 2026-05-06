import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Table from "../components/ui/Table.jsx";
import { api } from "../services/api.js";

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function TimetablePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  async function loadTimetable() {
    setLoading(true);
    setPageError("");
    try {
      const res = await api.get("/api/client/timetable");
      setItems(res.data?.data?.items ?? []);
    } catch (err) {
      setPageError(err?.response?.data?.message || "Failed to load timetable");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTimetable();
  }, []);

  const today = new Date().getDay();
  const todayItems = useMemo(() => items.filter((i) => i.dayOfWeek === today), [items, today]);

  const columns = useMemo(
    () => [
      { key: "dayOfWeek", header: "Day", render: (r) => <span className="text-muted">{dayLabels[r.dayOfWeek] ?? r.dayOfWeek}</span> },
      { key: "subject", header: "Subject" },
      { key: "startTime", header: "Start", render: (r) => <span className="font-mono">{r.startTime}</span> },
      { key: "endTime", header: "End", render: (r) => <span className="font-mono">{r.endTime}</span> },
    ],
    []
  );

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl">Timetable</h1>
            <p className="text-muted mt-1">Weekly schedule</p>
          </div>
          <Link className="text-accent hover:underline text-sm" to="/dashboard">
            Back to dashboard
          </Link>
        </div>

        {pageError ? <div className="mt-4 text-danger text-sm">{pageError}</div> : null}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card title="Today" className="lg:col-span-1">
            <div className="text-sm text-muted">
              {dayLabels[today]} • {todayItems.length} lesson(s)
            </div>
            <div className="mt-3 space-y-2">
              {todayItems.length === 0 ? (
                <div className="text-muted text-sm">No lessons today</div>
              ) : (
                todayItems.map((t) => (
                  <div key={t.id} className="rounded-control border border-border bg-surface2 px-3 py-2">
                    <div className="font-medium">{t.subject}</div>
                    <div className="text-muted text-sm font-mono">
                      {t.startTime} - {t.endTime}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card title="All lessons" className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <div className="text-muted text-sm">{loading ? "Loading..." : `${items.length} lesson(s)`}</div>
              <Button variant="secondary" size="sm" onClick={loadTimetable} disabled={loading}>
                Refresh
              </Button>
            </div>
            <div className="mt-3">
              <Table columns={columns} rows={items} rowKey={(r) => r.id} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

