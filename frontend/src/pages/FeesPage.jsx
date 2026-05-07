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
import PageHeader from "../components/layout/PageHeader.jsx";
import { useCountUp } from "../hooks/useCountUp.js";
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
  const animatedBalance = useCountUp(Number(balance) || 0, { duration: 1200 });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Fees"
          subtitle="Track your balance, deposit funds, or request a refund."
          pill="School fees, simplified"
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
              Current balance
            </div>
            <div className="mt-3 text-3xl sm:text-4xl font-display tracking-tight text-text tabular-nums">
              {loading ? "—" : animatedBalance.toLocaleString()}
              <span className="text-base text-muted font-sans ml-1.5">RWF</span>
            </div>
            {lowBalance && !loading ? (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-2.5 py-1 text-xs text-danger ring-1 ring-danger/20">
                <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                Low balance (under 5,000 RWF)
              </div>
            ) : !loading ? (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs text-success ring-1 ring-success/20">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                On track
              </div>
            ) : null}
          </Card>

          <Card title="Deposit" className="lg:col-span-1">
            <form onSubmit={depositForm.handleSubmit(submitDeposit)} className="space-y-4">
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
            <form onSubmit={withdrawForm.handleSubmit(submitWithdraw)} className="space-y-4">
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

        <div className="mt-8 fade-up fade-up-delay-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl text-text">Transaction history</h2>
              <p className="text-sm text-muted mt-1">All deposits and refund requests.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={loadFees} disabled={loading}>
              Refresh
            </Button>
          </div>

          <Table columns={columns} rows={history} rowKey={(r) => r.id} />
        </div>
      </div>
    </div>
  );
}

