import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Table from "../components/ui/Table.jsx";
import { api } from "../services/api.js";

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
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  async function loadAttendance() {
    setLoading(true);
    setPageError("");
    try {
      const res = await api.get("/api/client/attendance");
      setItems(res.data?.data?.items ?? []);
    } catch (err) {
      setPageError(err?.response?.data?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAttendance();
  }, []);

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
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl">Attendance</h1>
            <p className="text-muted mt-1">Daily attendance records</p>
          </div>
          <Link className="text-accent hover:underline text-sm" to="/dashboard">
            Back to dashboard
          </Link>
        </div>

        {pageError ? <div className="mt-4 text-danger text-sm">{pageError}</div> : null}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Present">
            <div className="text-2xl font-semibold">{loading ? "—" : summary.PRESENT}</div>
          </Card>
          <Card title="Absent">
            <div className="text-2xl font-semibold">{loading ? "—" : summary.ABSENT}</div>
          </Card>
          <Card title="Late">
            <div className="text-2xl font-semibold">{loading ? "—" : summary.LATE}</div>
          </Card>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="font-display text-xl">Records</h2>
          <Button variant="secondary" size="sm" onClick={loadAttendance} disabled={loading}>
            Refresh
          </Button>
        </div>

        <div className="mt-3">
          <Table columns={columns} rows={items} rowKey={(r) => r.id} />
        </div>
      </div>
    </div>
  );
}

