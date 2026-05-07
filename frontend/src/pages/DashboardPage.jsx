import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Badge from "../components/ui/Badge.jsx";
import Table from "../components/ui/Table.jsx";
import { api } from "../services/api.js";
import { useClientContextStore } from "../store/clientContextStore.js";
import { withStudentId } from "../utils/studentQuery.js";
import { useCountUp } from "../hooks/useCountUp.js";

const LOW_BALANCE_LIMIT = 5000;

function formatDateTime(value) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

function handleTileMouseMove(e) {
  const target = e.currentTarget;
  const rect = target.getBoundingClientRect();
  target.style.setProperty("--mx", `${e.clientX - rect.left}px`);
  target.style.setProperty("--my", `${e.clientY - rect.top}px`);
}

export default function DashboardPage() {
  const selectedStudentId = useClientContextStore((s) => s.selectedStudentId);
  const setSelectedStudentId = useClientContextStore((s) => s.setSelectedStudentId);

  const [balance, setBalance] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [latestGrades, setLatestGrades] = useState([]);
  const [attendanceItems, setAttendanceItems] = useState([]);
  const [todayLessons, setTodayLessons] = useState([]);
  const [pageError, setPageError] = useState("");
  const [isParent, setIsParent] = useState(false);
  const [children, setChildren] = useState([]);
  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setPageError("");
        const today = new Date().getDay();
        const [profileRes, balRes, histRes, gradesRes, attRes, ttRes] = await Promise.all([
          api.get(withStudentId("/api/client/profile", selectedStudentId)),
          api.get(withStudentId("/api/client/fees/balance", selectedStudentId)),
          api.get(withStudentId("/api/client/fees/history", selectedStudentId)),
          api.get(withStudentId("/api/client/grades", selectedStudentId)),
          api.get(withStudentId("/api/client/attendance", selectedStudentId)),
          api.get(withStudentId("/api/client/timetable", selectedStudentId)),
        ]);

        if (!alive) return;
        setIsParent(Boolean(profileRes.data?.data?.isParent));
        setChildren(profileRes.data?.data?.parent?.children ?? []);
        setProfileName(profileRes.data?.data?.student?.user?.name || "");
        const pickedStudentId = profileRes.data?.data?.student?.id || "";
        if (!selectedStudentId && pickedStudentId) setSelectedStudentId(pickedStudentId);

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
  }, [selectedStudentId, setSelectedStudentId]);

  const low = typeof balance === "number" && balance < LOW_BALANCE_LIMIT;

  const attendanceSummary = useMemo(() => {
    const counts = { PRESENT: 0, ABSENT: 0, LATE: 0 };
    for (const a of attendanceItems) {
      if (counts[a.status] !== undefined) counts[a.status] += 1;
    }
    return counts;
  }, [attendanceItems]);

  const totalAttendance =
    attendanceSummary.PRESENT + attendanceSummary.ABSENT + attendanceSummary.LATE;
  const attendancePercent =
    totalAttendance > 0
      ? Math.round((attendanceSummary.PRESENT / totalAttendance) * 100)
      : 0;

  const paymentColumns = useMemo(
    () => [
      {
        key: "createdAt",
        header: "Date",
        render: (r) => <span className="text-muted">{formatDateTime(r.createdAt)}</span>,
      },
      {
        key: "type",
        header: "Type",
        render: (r) => (
          <Badge variant={r.type === "DEPOSIT" ? "success" : "warning"}>
            {r.type}
          </Badge>
        ),
      },
      { key: "amount", header: "Amount", render: (r) => <span className="font-mono tabular-nums">{r.amount}</span> },
      { key: "balance", header: "Balance", render: (r) => <span className="font-mono tabular-nums">{r.balance}</span> },
    ],
    []
  );

  const gradesColumns = useMemo(
    () => [
      { key: "subject", header: "Subject" },
      { key: "term", header: "Term", render: (r) => <span className="text-muted">{r.term}</span> },
      { key: "score", header: "Score", render: (r) => <span className="font-mono tabular-nums">{r.score}</span> },
    ],
    []
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 fade-up">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-surface ring-1 ring-border px-3 py-1 text-xs text-muted mb-3">
              <span className="status-dot h-1.5 w-1.5 rounded-full bg-success" />
              Live overview
            </div>
            <h1 className="font-display text-3xl sm:text-4xl tracking-tight text-text">
              {profileName ? `Welcome back, ${profileName.split(" ")[0]}.` : "Dashboard"}
            </h1>
            <p className="text-muted mt-2">
              Here's a quick overview of fees, grades, attendance and your timetable.
            </p>
          </div>

          {isParent && children.length > 0 ? (
            <div className="w-full sm:w-auto">
              <label className="block text-xs uppercase tracking-wider font-medium text-muted mb-2">
                Selected child
              </label>
              <select
                className="w-full sm:w-64 h-11 rounded-control bg-surface ring-1 ring-border hover:ring-borderStrong focus:ring-2 focus:ring-accent/60 px-3 outline-none transition-all"
                value={selectedStudentId || ""}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.user?.name || c.admissionNumber || c.id}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        {pageError ? (
          <div className="mb-6 rounded-control bg-danger/10 ring-1 ring-danger/30 px-4 py-3 text-sm text-danger fade-up">
            {pageError}
          </div>
        ) : null}

        {/* Bento stat grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 fade-up fade-up-delay-1">
          <FeeBalanceCard balance={balance} low={low} />
          <AttendanceRingCard percent={attendancePercent} summary={attendanceSummary} />
          <GradesAvgCard grades={latestGrades} />
          <TodayLessonsCard lessons={todayLessons} />
        </div>

        {/* Tables */}
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 fade-up fade-up-delay-2">
          <div onMouseMove={handleTileMouseMove} className="tile overflow-hidden">
            <div className="px-6 pt-6 pb-3 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider font-medium text-muted">
                  Recent payments
                </div>
                <div className="mt-1 text-sm text-muted">Last 5 transactions</div>
              </div>
              <Link to="/fees" className="text-xs text-accent hover:text-accentHover transition">
                View all &rarr;
              </Link>
            </div>
            <div className="p-1 sm:p-2 pt-2">
              <Table columns={paymentColumns} rows={recentPayments} rowKey={(r) => r.id} />
            </div>
          </div>

          <div onMouseMove={handleTileMouseMove} className="tile overflow-hidden">
            <div className="px-6 pt-6 pb-3 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider font-medium text-muted">
                  Latest grades
                </div>
                <div className="mt-1 text-sm text-muted">Most recent results</div>
              </div>
              <Link to="/grades" className="text-xs text-accent hover:text-accentHover transition">
                View all &rarr;
              </Link>
            </div>
            <div className="p-1 sm:p-2 pt-2">
              <Table columns={gradesColumns} rows={latestGrades} rowKey={(r) => r.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeeBalanceCard({ balance, low }) {
  const target = balance ?? 0;
  const value = useCountUp(target, { duration: 1200 });

  return (
    <div onMouseMove={handleTileMouseMove} className="tile p-5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider font-medium text-muted">
          Fee balance
        </span>
        {low ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-danger/15 px-2 py-0.5 text-[10px] text-danger ring-1 ring-danger/25">
            <span className="h-1 w-1 rounded-full bg-danger" />
            Low
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] text-success ring-1 ring-success/25">
            <span className="h-1 w-1 rounded-full bg-success" />
            On track
          </span>
        )}
      </div>
      <div className="mt-3 font-display text-3xl tracking-tight tabular-nums">
        {balance === null ? "—" : value.toLocaleString()}
        <span className="text-base text-muted font-sans ml-1">RWF</span>
      </div>
      <Link
        to="/fees"
        className="mt-3 inline-flex text-xs text-accent hover:text-accentHover transition"
      >
        Manage fees &rarr;
      </Link>
    </div>
  );
}

function AttendanceRingCard({ percent, summary }) {
  const radius = 26;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (percent / 100) * circ;

  return (
    <div onMouseMove={handleTileMouseMove} className="tile p-5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider font-medium text-muted">
          Attendance
        </span>
        <span className="text-[10px] text-muted font-medium">This term</span>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <svg width="68" height="68" viewBox="0 0 68 68" className="-rotate-90 flex-none">
          <circle cx="34" cy="34" r={radius} stroke="currentColor" className="text-borderStrong" strokeWidth="6" fill="none" />
          <circle
            cx="34"
            cy="34"
            r={radius}
            stroke="currentColor"
            className="text-accent ring-anim"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circ}
            style={{
              strokeDashoffset: offset,
              "--circ": circ,
              "--off": offset,
            }}
          />
        </svg>
        <div className="flex-1">
          <div className="font-display text-3xl tracking-tight tabular-nums">
            {percent}<span className="text-muted text-base font-sans">%</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-1.5 text-[10px]">
            <Pill tone="success">P {summary.PRESENT}</Pill>
            <Pill tone="danger">A {summary.ABSENT}</Pill>
            <Pill tone="warning">L {summary.LATE}</Pill>
          </div>
        </div>
      </div>
    </div>
  );
}

function GradesAvgCard({ grades }) {
  const avg = useMemo(() => {
    if (!grades.length) return null;
    const total = grades.reduce((sum, g) => sum + Number(g.score || 0), 0);
    return Math.round((total / grades.length) * 10) / 10;
  }, [grades]);

  const target = avg !== null ? Math.round(avg) : 0;
  const value = useCountUp(target, { duration: 1200 });

  return (
    <div onMouseMove={handleTileMouseMove} className="tile p-5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider font-medium text-muted">
          Avg score
        </span>
        <span className="text-[10px] text-muted font-medium">
          {grades.length} record{grades.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="mt-3 font-display text-3xl tracking-tight tabular-nums">
        {avg === null ? "—" : value}
        <span className="text-base text-muted font-sans ml-1">/ 100</span>
      </div>
      <Link
        to="/grades"
        className="mt-3 inline-flex text-xs text-accent hover:text-accentHover transition"
      >
        View all grades &rarr;
      </Link>
    </div>
  );
}

function TodayLessonsCard({ lessons }) {
  return (
    <div onMouseMove={handleTileMouseMove} className="tile p-5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider font-medium text-muted">
          Today
        </span>
        <span className="text-[10px] text-muted font-medium">
          {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
        </span>
      </div>
      {lessons.length === 0 ? (
        <div className="mt-4 text-sm text-muted">No lessons scheduled today.</div>
      ) : (
        <div className="mt-3 space-y-1.5">
          {lessons.slice(0, 3).map((l) => (
            <div key={l.id} className="flex items-center gap-2.5 rounded-lg bg-surface2 ring-1 ring-border px-2.5 py-1.5">
              <span className="text-[11px] font-mono text-muted">{l.startTime}</span>
              <span className="text-xs sm:text-sm font-medium text-text truncate">{l.subject}</span>
            </div>
          ))}
        </div>
      )}
      <Link
        to="/timetable"
        className="mt-3 inline-flex text-xs text-accent hover:text-accentHover transition"
      >
        Full timetable &rarr;
      </Link>
    </div>
  );
}

function Pill({ children, tone }) {
  const tones = {
    success: "bg-success/15 text-success ring-success/25",
    danger: "bg-danger/15 text-danger ring-danger/25",
    warning: "bg-accent/15 text-accent ring-accent/30",
  };
  return (
    <span className={["inline-flex items-center rounded-full px-1.5 py-0.5 ring-1 font-medium", tones[tone]].join(" ")}>
      {children}
    </span>
  );
}
