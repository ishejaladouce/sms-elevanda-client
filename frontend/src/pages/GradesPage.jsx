import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Table from "../components/ui/Table.jsx";
import PageHeader from "../components/layout/PageHeader.jsx";
import { api } from "../services/api.js";
import { useClientContextStore } from "../store/clientContextStore.js";
import { withStudentId } from "../utils/studentQuery.js";

export default function GradesPage() {
  const selectedStudentId = useClientContextStore((s) => s.selectedStudentId);

  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [term, setTerm] = useState("ALL");

  async function loadGrades() {
    setLoading(true);
    setPageError("");
    try {
      const res = await api.get(withStudentId("/api/client/grades", selectedStudentId));
      setGrades(res.data?.data?.items ?? []);
    } catch (err) {
      setPageError(err?.response?.data?.message || "Failed to load grades");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGrades();
  }, [selectedStudentId]);

  const terms = useMemo(() => {
    const all = Array.from(new Set(grades.map((g) => g.term).filter(Boolean)));
    return all.length ? all : [];
  }, [grades]);

  const visibleGrades = useMemo(() => {
    if (term === "ALL") return grades;
    return grades.filter((g) => g.term === term);
  }, [grades, term]);

  const columns = useMemo(
    () => [
      { key: "subject", header: "Subject" },
      { key: "term", header: "Term", render: (r) => <span className="text-muted">{r.term}</span> },
      { key: "score", header: "Score", render: (r) => <span className="font-mono">{r.score}</span> },
      { key: "updatedBy", header: "Updated by", render: (r) => <span className="text-muted">{r.updatedBy}</span> },
    ],
    []
  );

  const avg = useMemo(() => {
    if (!visibleGrades.length) return null;
    const total = visibleGrades.reduce((sum, g) => sum + Number(g.score || 0), 0);
    return Math.round((total / visibleGrades.length) * 10) / 10;
  }, [visibleGrades]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Grades"
          subtitle="Every subject score, organised by term."
          pill="Academic results"
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
          <Card className="md:col-span-1">
            <div className="text-xs uppercase tracking-wider font-medium text-muted">
              Average score
            </div>
            <div className="mt-3 text-3xl sm:text-4xl font-display tracking-tight text-text tabular-nums">
              {loading ? "—" : avg ?? "—"}
              <span className="text-base text-muted font-sans ml-1.5">/ 100</span>
            </div>
            <div className="text-muted text-sm mt-2">Based on current filter.</div>
          </Card>

          <Card className="md:col-span-2">
            <div className="text-xs uppercase tracking-wider font-medium text-muted mb-4">
              Filter
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-text mb-2">Term</label>
                <select
                  className="w-full h-12 rounded-control bg-surface2/50 ring-1 ring-white/[0.06] hover:ring-white/[0.12] focus:ring-2 focus:ring-accent/50 px-4 outline-none transition-all"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                >
                  <option value="ALL">All terms</option>
                  {terms.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <Button variant="secondary" size="lg" onClick={loadGrades} disabled={loading}>
                Refresh
              </Button>
            </div>
          </Card>
        </div>

        <div className="mt-8 fade-up fade-up-delay-2">
          <Table columns={columns} rows={visibleGrades} rowKey={(r) => r.id} />
          {!loading ? (
            <div className="text-muted text-sm mt-3">
              Showing {visibleGrades.length} record(s)
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

