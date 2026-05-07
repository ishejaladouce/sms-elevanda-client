import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Table from "../components/ui/Table.jsx";
import PageHeader from "../components/layout/PageHeader.jsx";
import { api } from "../services/api.js";
import { useClientContextStore } from "../store/clientContextStore.js";
import { withStudentId } from "../utils/studentQuery.js";

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function TimetablePage() {
  const selectedStudentId = useClientContextStore((s) => s.selectedStudentId);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  async function loadTimetable() {
    setLoading(true);
    setPageError("");
    try {
      const res = await api.get(withStudentId("/api/client/timetable", selectedStudentId));
      setItems(res.data?.data?.items ?? []);
    } catch (err) {
      setPageError(err?.response?.data?.message || "Failed to load timetable");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTimetable();
  }, [selectedStudentId]);

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
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Timetable"
          subtitle="Your weekly schedule at a glance."
          pill="School week"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 fade-up fade-up-delay-1">
          <Card className="lg:col-span-1">
            <div className="text-xs uppercase tracking-wider font-medium text-muted">
              Today &middot; {dayLabels[today]}
            </div>
            <div className="mt-1 text-sm text-muted">
              {todayItems.length} lesson{todayItems.length === 1 ? "" : "s"}
            </div>
            <div className="mt-4 space-y-2">
              {todayItems.length === 0 ? (
                <div className="text-muted text-sm">No lessons today.</div>
              ) : (
                todayItems.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-control bg-surface2/50 px-3 py-2 ring-1 ring-white/[0.04]"
                  >
                    <div className="font-medium text-text text-sm">{t.subject}</div>
                    <div className="text-muted text-xs font-mono mt-0.5">
                      {t.startTime} &mdash; {t.endTime}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs uppercase tracking-wider font-medium text-muted">
                All lessons
              </div>
              <Button variant="secondary" size="sm" onClick={loadTimetable} disabled={loading}>
                Refresh
              </Button>
            </div>
            <Table columns={columns} rows={items} rowKey={(r) => r.id} />
          </Card>
        </div>
      </div>
    </div>
  );
}

