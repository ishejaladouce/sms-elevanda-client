import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Badge from "../components/ui/Badge.jsx";
import Table from "../components/ui/Table.jsx";
import { api } from "../services/api.js";
import { useClientContextStore } from "../store/clientContextStore.js";
import { withStudentId } from "../utils/studentQuery.js";

const moneySchema = z.object({
  amount: z.coerce.number().int().positive(),
  note: z.string().max(200).optional(),
});

function formatDate(value) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

export default function FeesPage() {
  const selectedStudentId = useClientContextStore((s) => s.selectedStudentId);

  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const depositForm = useForm({
    resolver: zodResolver(moneySchema),
    defaultValues: { amount: "", note: "" },
  });

  const withdrawForm = useForm({
    resolver: zodResolver(moneySchema),
    defaultValues: { amount: "", note: "" },
  });

  async function loadFees() {
    setLoading(true);
    setPageError("");
    try {
      const [balRes, histRes] = await Promise.all([
        api.get(withStudentId("/api/client/fees/balance", selectedStudentId)),
        api.get(withStudentId("/api/client/fees/history", selectedStudentId)),
      ]);

      setBalance(balRes.data?.data?.balance ?? 0);
      setHistory(histRes.data?.data?.items ?? []);
    } catch (err) {
      setPageError(err?.response?.data?.message || "Failed to load fees");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFees();
  }, [selectedStudentId]);

  const columns = useMemo(
    () => [
      {
        key: "createdAt",
        header: "Date",
        render: (r) => <span className="text-muted">{formatDate(r.createdAt)}</span>,
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
      { key: "amount", header: "Amount", render: (r) => <span className="font-mono">{r.amount}</span> },
      { key: "balance", header: "Balance", render: (r) => <span className="font-mono">{r.balance}</span> },
      { key: "note", header: "Note", render: (r) => <span className="text-muted">{r.note || "—"}</span> },
    ],
    []
  );

  async function submitDeposit(values) {
    try {
      depositForm.clearErrors("root");
      await api.post(withStudentId("/api/client/fees/deposit", selectedStudentId), values);
      depositForm.reset();
      await loadFees();
    } catch (err) {
      const message = err?.response?.data?.message || "Deposit failed";
      depositForm.setError("root", { type: "server", message });
    }
  }

  async function submitWithdraw(values) {
    try {
      withdrawForm.clearErrors("root");
      await api.post(withStudentId("/api/client/fees/withdraw", selectedStudentId), values);
      withdrawForm.reset();
      await loadFees();
    } catch (err) {
      const message = err?.response?.data?.message || "Withdraw failed";
      withdrawForm.setError("root", { type: "server", message });
    }
  }

  const lowBalance = balance < 5000;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl">Fees</h1>
            <p className="text-muted mt-1">Balance and payment history</p>
          </div>
          <Link className="text-accent hover:underline text-sm" to="/dashboard">
            Back to dashboard
          </Link>
        </div>

        {pageError ? <div className="mt-4 text-danger text-sm">{pageError}</div> : null}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card title="Current balance" className="lg:col-span-1">
            <div className="text-2xl font-semibold">{loading ? "—" : `${balance} RWF`}</div>
            {lowBalance && !loading ? (
              <div className="mt-2 text-danger text-sm">Low balance alert (below 5000 RWF)</div>
            ) : null}
          </Card>

          <Card title="Deposit" className="lg:col-span-1">
            <form onSubmit={depositForm.handleSubmit(submitDeposit)} className="space-y-3">
              <Input
                label="Amount (RWF)"
                inputMode="numeric"
                error={depositForm.formState.errors.amount?.message}
                {...depositForm.register("amount")}
              />
              <Input label="Note (optional)" error={depositForm.formState.errors.note?.message} {...depositForm.register("note")} />
              {depositForm.formState.errors.root?.message ? (
                <div className="text-danger text-sm">{depositForm.formState.errors.root.message}</div>
              ) : null}
              <Button type="submit" loading={depositForm.formState.isSubmitting} className="w-full">
                Deposit
              </Button>
            </form>
          </Card>

          <Card title="Withdraw" className="lg:col-span-1">
            <form onSubmit={withdrawForm.handleSubmit(submitWithdraw)} className="space-y-3">
              <Input
                label="Amount (RWF)"
                inputMode="numeric"
                error={withdrawForm.formState.errors.amount?.message}
                {...withdrawForm.register("amount")}
              />
              <Input label="Note (optional)" error={withdrawForm.formState.errors.note?.message} {...withdrawForm.register("note")} />
              {withdrawForm.formState.errors.root?.message ? (
                <div className="text-danger text-sm">{withdrawForm.formState.errors.root.message}</div>
              ) : null}
              <Button variant="secondary" type="submit" loading={withdrawForm.formState.isSubmitting} className="w-full">
                Request withdraw
              </Button>
            </form>
          </Card>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">History</h2>
            <Button variant="secondary" size="sm" onClick={loadFees} disabled={loading}>
              Refresh
            </Button>
          </div>

          <div className="mt-3">
            <Table columns={columns} rows={history} rowKey={(r) => r.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

