import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Table from "../components/ui/Table.jsx";
import PageHeader from "../components/layout/PageHeader.jsx";
import { api } from "../services/api.js";
import { useClientContextStore } from "../store/clientContextStore.js";
import { withStudentId } from "../utils/studentQuery.js";

function formatDate(value) {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return String(value);
  }
}

function statusBadge(status) {
  if (status === "PRESENT") return <Badge variant="success">PRESENT</Badge>;
  if (status === "ABSENT") return <Badge variant="danger">ABSENT</Badge>;
  if (status === "LATE") return <Badge variant="warning">LATE</Badge>;
  return <Badge variant="neutral">{status}</Badge>;
}

export default function AttendancePage() {
  const selectedStudentId = useClientContextStore((s) => s.selectedStudentId);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  async function loadAttendance() {
    setLoading(true);
    setPageError("");
    try {
      const res = await api.get(withStudentId("/api/client/attendance", selectedStudentId));
      setItems(res.data?.data?.items ?? []);
    } catch (err) {
      setPageError(err?.response?.data?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAttendance();
  }, [selectedStudentId]);

  const summary = useMemo(() => {
    const counts = { PRESENT: 0, ABSENT: 0, LATE: 0 };
    for (const a of items) {
      if (counts[a.status] !== undefined) counts[a.status] += 1;
    }
    return counts;
  }, [items]);

  const columns = useMemo(
    () => [
      { key: "date", header: "Date", render: (r) => <span className="text-muted">{formatDate(r.date)}</span> },
      { key: "status", header: "Status", render: (r) => statusBadge(r.status) },
    ],
    []
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Attendance"
          subtitle="Daily records, totals and trends."
          pill="School attendance"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 fade-up fade-up-delay-1">
          <SummaryCard label="Present" value={loading ? "—" : summary.PRESENT} tone="success" />
          <SummaryCard label="Absent" value={loading ? "—" : summary.ABSENT} tone="danger" />
          <SummaryCard label="Late" value={loading ? "—" : summary.LATE} tone="warning" />
        </div>

        <div className="mt-8 flex items-center justify-between mb-4 fade-up fade-up-delay-2">
          <div>
            <h2 className="font-display text-xl text-text">Records</h2>
            <p className="text-sm text-muted mt-1">All marked attendance entries.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={loadAttendance} disabled={loading}>
            Refresh
          </Button>
        </div>

        <div className="fade-up fade-up-delay-2">
          <Table columns={columns} rows={items} rowKey={(r) => r.id} />
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, tone }) {
  const tones = {
    success: "text-success",
    danger: "text-danger",
    warning: "text-accent",
  };
  return (
    <Card>
      <div className="text-xs uppercase tracking-wider font-medium text-muted">
        {label}
      </div>
      <div className={["mt-3 text-3xl sm:text-4xl font-display tracking-tight tabular-nums", tones[tone]].join(" ")}>
        {value}
      </div>
    </Card>
  );
}

