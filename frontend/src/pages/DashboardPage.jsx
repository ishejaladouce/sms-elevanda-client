import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Table from "../components/ui/Table.jsx";
import { api } from "../services/api.js";

const LOW_BALANCE_LIMIT = 5000;

function formatDateTime(value) {
  try {
    return new Date(value).toLocaleString();
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

export default function DashboardPage() {
  const [balance, setBalance] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [latestGrades, setLatestGrades] = useState([]);
  const [attendanceItems, setAttendanceItems] = useState([]);
  const [todayLessons, setTodayLessons] = useState([]);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setPageError("");
        const today = new Date().getDay();
        const [balRes, histRes, gradesRes, attRes, ttRes] = await Promise.all([
          api.get("/api/client/fees/balance"),
          api.get("/api/client/fees/history"),
          api.get("/api/client/grades"),
          api.get("/api/client/attendance"),
          api.get("/api/client/timetable"),
        ]);

        if (!alive) return;
        setBalance(balRes.data?.data?.balance ?? 0);
        setRecentPayments((histRes.data?.data?.items ?? []).slice(0, 5));
        setLatestGrades((gradesRes.data?.data?.items ?? []).slice(0, 6));
        setAttendanceItems(attRes.data?.data?.items ?? []);
        const allLessons = ttRes.data?.data?.items ?? [];
        setTodayLessons(allLessons.filter((l) => l.dayOfWeek === today).slice(0, 5));
      } catch (err) {
        if (!alive) return;
        setPageError(err?.response?.data?.message || "Failed to load dashboard");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const low = typeof balance === "number" && balance < LOW_BALANCE_LIMIT;

  const attendanceSummary = useMemo(() => {
    const counts = { PRESENT: 0, ABSENT: 0, LATE: 0 };
    for (const a of attendanceItems) {
      if (counts[a.status] !== undefined) counts[a.status] += 1;
    }
    return counts;
  }, [attendanceItems]);

  const paymentColumns = useMemo(
    () => [
      { key: "createdAt", header: "Date", render: (r) => <span className="text-muted">{formatDateTime(r.createdAt)}</span> },
      {
        key: "type",
        header: "Type",
        render: (r) => (
          <Badge variant={r.type === "DEPOSIT" ? "success" : "warning"}>
            {r.type}
          </Badge>
        ),
      },
      { key: "amount", header: "Amount", render: (r) => <span className="font-mono">{r.amount}</span> },
      { key: "balance", header: "Balance", render: (r) => <span className="font-mono">{r.balance}</span> },
    ],
    []
  );

  const gradesColumns = useMemo(
    () => [
      { key: "subject", header: "Subject" },
      { key: "term", header: "Term", render: (r) => <span className="text-muted">{r.term}</span> },
      { key: "score", header: "Score", render: (r) => <span className="font-mono">{r.score}</span> },
    ],
    []
  );

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display text-3xl">Dashboard</h1>
        <p className="text-muted mt-1">Quick overview</p>

        {pageError ? <div className="mt-4 text-danger text-sm">{pageError}</div> : null}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card title="Fee balance">
            <div className="text-2xl font-semibold">{balance === null ? "—" : `${balance} RWF`}</div>
            {low ? (
              <div className="mt-2 text-danger text-sm">Low balance alert (below {LOW_BALANCE_LIMIT} RWF)</div>
            ) : null}
            <div className="mt-3 text-sm">
              <Link className="text-accent hover:underline" to="/fees">
                View fees
              </Link>
            </div>
          </Card>

          <Card title="Attendance">
            <div className="flex gap-2 flex-wrap">
              <div className="rounded-control border border-border bg-surface2 px-3 py-2">
                <div className="text-muted text-xs">Present</div>
                <div className="font-semibold">{attendanceSummary.PRESENT}</div>
              </div>
              <div className="rounded-control border border-border bg-surface2 px-3 py-2">
                <div className="text-muted text-xs">Absent</div>
                <div className="font-semibold">{attendanceSummary.ABSENT}</div>
              </div>
              <div className="rounded-control border border-border bg-surface2 px-3 py-2">
                <div className="text-muted text-xs">Late</div>
                <div className="font-semibold">{attendanceSummary.LATE}</div>
              </div>
            </div>
            <div className="mt-3 text-sm">
              <Link className="text-accent hover:underline" to="/attendance">
                View attendance
              </Link>
            </div>
          </Card>

          <Card title="Today’s timetable">
            {todayLessons.length === 0 ? (
              <div className="text-muted text-sm">No lessons today</div>
            ) : (
              <div className="space-y-2">
                {todayLessons.map((l) => (
                  <div key={l.id} className="rounded-control border border-border bg-surface2 px-3 py-2">
                    <div className="font-medium">{l.subject}</div>
                    <div className="text-muted text-sm font-mono">
                      {l.startTime} - {l.endTime}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 text-sm">
              <Link className="text-accent hover:underline" to="/timetable">
                View timetable
              </Link>
            </div>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Recent payments">
            <Table columns={paymentColumns} rows={recentPayments} rowKey={(r) => r.id} />
            <div className="mt-3 text-sm">
              <Link className="text-accent hover:underline" to="/fees">
                Open fees page
              </Link>
            </div>
          </Card>

          <Card title="Latest grades">
            <Table columns={gradesColumns} rows={latestGrades} rowKey={(r) => r.id} />
            <div className="mt-3 text-sm">
              <Link className="text-accent hover:underline" to="/grades">
                Open grades page
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

