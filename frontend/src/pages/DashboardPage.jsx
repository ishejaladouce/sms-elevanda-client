import { useEffect, useState } from "react";
import Card from "../components/ui/Card.jsx";
import { api } from "../services/api.js";

export default function DashboardPage() {
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await api.get("/api/client/fees/balance");
      if (alive) setBalance(res.data?.data?.balance ?? 0);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const low = typeof balance === "number" && balance < 5000;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display text-3xl">Dashboard</h1>
        <p className="text-muted mt-1">Quick overview</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card title="Fee balance">
            <div className="text-2xl font-semibold">{balance === null ? "—" : `${balance} RWF`}</div>
            {low ? <div className="mt-2 text-danger text-sm">Low balance alert (below 5000 RWF)</div> : null}
          </Card>

          <Card title="Next steps">
            <div className="text-sm text-muted">
              We will add recent payments, grades summary, attendance, and today’s timetable next.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

