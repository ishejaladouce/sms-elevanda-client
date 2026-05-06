import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Table from "../components/ui/Table.jsx";
import { api } from "../services/api.js";

export default function GradesPage() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [term, setTerm] = useState("ALL");

  async function loadGrades() {
    setLoading(true);
    setPageError("");
    try {
      const res = await api.get("/api/client/grades");
      setGrades(res.data?.data?.items ?? []);
    } catch (err) {
      setPageError(err?.response?.data?.message || "Failed to load grades");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGrades();
  }, []);

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
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl">Grades</h1>
            <p className="text-muted mt-1">Academic results</p>
          </div>
          <Link className="text-accent hover:underline text-sm" to="/dashboard">
            Back to dashboard
          </Link>
        </div>

        {pageError ? <div className="mt-4 text-danger text-sm">{pageError}</div> : null}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Average score" className="md:col-span-1">
            <div className="text-2xl font-semibold">{loading ? "—" : avg ?? "—"}</div>
            <div className="text-muted text-sm mt-1">Based on current filter</div>
          </Card>

          <Card title="Filter" className="md:col-span-2">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="flex-1">
                <label className="text-sm text-muted">Term</label>
                <select
                  className="mt-1 w-full rounded-control border border-border bg-surface2 px-3 py-2 outline-none focus:ring-2 focus:ring-accent/40 transition duration-200 ease-smooth"
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
              <Button variant="secondary" onClick={loadGrades} disabled={loading}>
                Refresh
              </Button>
            </div>
          </Card>
        </div>

        <div className="mt-6">
          <Table columns={columns} rows={visibleGrades} rowKey={(r) => r.id} />
          {!loading ? (
            <div className="text-muted text-sm mt-2">
              Showing {visibleGrades.length} record(s)
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

