import React, { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useFinance } from "@/lib/finance-store";
import { fmtTRY, fmtDate } from "@/lib/format";
import { downloadCSV, DATE_RANGES, inRange } from "@/lib/csv";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Plus,
  Minus,
  Wallet,
  Trash2,
  Search,
  Download,
  Pencil,
} from "lucide-react";
import { IncomeDialog, ExpenseDialog, TransferDialog } from "@/components/FinanceDialogs";
import EditEntryDialog from "@/components/EditEntryDialog";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { toast } from "sonner";

export default function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accounts, income, expense, transfers, cari, deleteIncome, deleteExpense } = useFinance();
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState({ kind: null, entry: null });
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [rangeKey, setRangeKey] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const account = accounts.find((a) => a.id === id);
  const findCari = (cid) => cari.find((c) => c.id === cid);
  const findAccount = (aid) => accounts.find((a) => a.id === aid);
  const range = DATE_RANGES.find((r) => r.key === rangeKey) || DATE_RANGES[0];

  const openEdit = (kind, originalId) => {
    const entry = kind === "income" ? income.find((i) => i.id === originalId) : expense.find((e) => e.id === originalId);
    if (!entry) return;
    setEditing({ kind, entry });
    setEditOpen(true);
  };

  const statement = useMemo(() => {
    if (!account) return [];
    const incomes = income
      .filter((i) => i.account_id === id)
      .map((i) => ({
        id: i.id, kind: "income", date: i.date, direction: "+",
        amount: i.amount, category: i.category, description: i.description,
        cari: findCari(i.cari_id)?.company_name,
      }));
    const expenses = expense
      .filter((e) => e.account_id === id)
      .map((e) => ({
        id: e.id, kind: "expense", date: e.date, direction: "−",
        amount: e.amount, category: e.category, description: e.description,
        cari: findCari(e.cari_id)?.company_name,
      }));
    const txIn = transfers.filter((t) => t.to_id === id).map((t) => ({
      id: t.id, kind: "transfer-in", date: t.date, direction: "+",
      amount: t.amount, category: "Virman (Gelen)",
      description: `${findAccount(t.from_id)?.bank_name} → ${account.bank_name}: ${t.description}`,
      cari: null,
    }));
    const txOut = transfers.filter((t) => t.from_id === id).map((t) => ({
      id: t.id, kind: "transfer-out", date: t.date, direction: "−",
      amount: t.amount, category: "Virman (Giden)",
      description: `${account.bank_name} → ${findAccount(t.to_id)?.bank_name}: ${t.description}`,
      cari: null,
    }));
    return [...incomes, ...expenses, ...txIn, ...txOut].sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );
  }, [account, id, income, expense, transfers, cari, accounts]);

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    return statement.filter((r) => {
      if (!inRange(r.date, range, customFrom, customTo)) return false;
      if (typeFilter !== "all" && !r.kind.startsWith(typeFilter)) return false;
      if (!term) return true;
      return (
        r.description?.toLowerCase().includes(term) ||
        r.category?.toLowerCase().includes(term) ||
        r.cari?.toLowerCase().includes(term)
      );
    });
  }, [statement, q, typeFilter, range, customFrom, customTo]);

  const totalIn = filtered.filter((r) => r.direction === "+").reduce((s, r) => s + r.amount, 0);
  const totalOut = filtered.filter((r) => r.direction === "−").reduce((s, r) => s + r.amount, 0);

  // Balance evolution over last 90 days
  const balanceSeries = useMemo(() => {
    if (!account) return [];
    const days = 90;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build a per-day net delta map for this account
    const deltas = {};
    const bump = (iso, delta) => {
      if (!iso) return;
      const d = new Date(iso);
      d.setHours(0, 0, 0, 0);
      const k = d.toISOString().slice(0, 10);
      deltas[k] = (deltas[k] || 0) + delta;
    };
    income.filter((i) => i.account_id === id).forEach((i) => bump(i.date, i.amount));
    expense.filter((e) => e.account_id === id).forEach((e) => bump(e.date, -e.amount));
    transfers.filter((t) => t.to_id === id).forEach((t) => bump(t.date, t.amount));
    transfers.filter((t) => t.from_id === id).forEach((t) => bump(t.date, -t.amount));

    // Walk backward from current balance to compute each day's end-of-day balance
    const series = [];
    let bal = account.balance;
    const todayKey = today.toISOString().slice(0, 10);
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      series.unshift({
        date: k,
        label: new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short" }).format(d),
        balance: Math.round(bal * 100) / 100,
      });
      // Reverse this day's delta to get previous day's end balance
      if (k !== todayKey || true) {
        bal -= (deltas[k] || 0);
      }
    }
    return series;
  }, [account, id, income, expense, transfers]);

  const exportCSV = () => {
    const rows = filtered.map((r) => ({
      Tarih: r.date,
      Tip: r.kind,
      Yon: r.direction === "+" ? "Giris" : "Cikis",
      Aciklama: r.description || "",
      Kategori: r.category,
      Cari: r.cari || "",
      Tutar: r.direction === "+" ? r.amount : -r.amount,
    }));
    downloadCSV(`${account.bank_name.replace(/\s+/g, "_")}_ekstre_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  if (!account) {
    return (
      <div className="text-center py-20">
        <div className="text-slate-400 mb-4">Hesap bulunamadı.</div>
        <Button onClick={() => navigate("/hesaplar")}>Hesaplara dön</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="account-detail-page">
      <div>
        <Link to="/hesaplar" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 font-mono tracking-wider uppercase" data-testid="back-to-accounts">
          <ArrowLeft className="h-3.5 w-3.5" /> Hesaplar
        </Link>
      </div>

      <Card className="bg-[#131C2E] border-slate-800 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full blur-3xl opacity-30" style={{ background: account.color }} />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl grid place-items-center" style={{ background: `${account.color}22`, color: account.color }}>
              <Wallet className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">{account.bank_name}</h1>
              <p className="text-sm text-slate-400">{account.account_name} · {account.account_type}</p>
              <p className="text-[11px] font-mono text-slate-500 mt-1">{account.iban}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Güncel Bakiye</div>
            <div className="font-display font-bold text-3xl text-emerald-400 font-mono-data mt-1" data-testid="account-detail-balance">{fmtTRY(account.balance)}</div>
            <div className="flex gap-3 mt-2 text-xs justify-end">
              <span className="text-emerald-400 font-mono-data">+ {fmtTRY(totalIn)}</span>
              <span className="text-rose-400 font-mono-data">− {fmtTRY(totalOut)}</span>
            </div>
          </div>
        </div>
        <div className="relative flex gap-2 mt-6 flex-wrap">
          <Button onClick={() => setIncomeOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5" data-testid="account-detail-add-income">
            <Plus className="h-4 w-4" /> Para Girişi
          </Button>
          <Button onClick={() => setExpenseOpen(true)} className="bg-rose-500 hover:bg-rose-600 text-white gap-1.5" data-testid="account-detail-add-expense">
            <Minus className="h-4 w-4" /> Para Çıkışı
          </Button>
          <Button onClick={() => setTransferOpen(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white gap-1.5" data-testid="account-detail-transfer">
            <ArrowLeftRight className="h-4 w-4" /> Virman
          </Button>
        </div>
      </Card>

      {/* Balance trend */}
      <Card className="bg-[#131C2E] border-slate-800 p-5" data-testid="account-balance-chart">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-200">Bakiye Değişim Trendi</h2>
            <p className="text-xs text-slate-500">Son 90 günün gün sonu bakiyeleri</p>
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer>
            <AreaChart data={balanceSeries} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={account.color} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={account.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1E2C44" vertical={false} />
              <XAxis dataKey="label" stroke="#64748B" fontSize={10} interval={Math.floor(balanceSeries.length / 10)} />
              <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#0E1522", border: "1px solid #1E2C44", borderRadius: 8 }} labelStyle={{ color: "#94A3B8" }} formatter={(v) => fmtTRY(v)} />
              <Area type="monotone" dataKey="balance" stroke={account.color} strokeWidth={2} fill="url(#balGrad)" name="Bakiye" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="bg-[#131C2E] border-slate-800 p-4">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="font-display text-lg font-semibold text-slate-200">Hesap Ekstresi · {filtered.length} / {statement.length} hareket</h2>
          <div className="flex gap-2 flex-wrap items-center">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input placeholder="Açıklama / cari ara..." value={q} onChange={(e) => setQ(e.target.value)} className="bg-[#0E1522] border-slate-700 pl-9 w-48" data-testid="account-detail-search" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-[#0E1522] border-slate-700 w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Hareketler</SelectItem>
                <SelectItem value="income">Girişler</SelectItem>
                <SelectItem value="expense">Çıkışlar</SelectItem>
                <SelectItem value="transfer">Virmanlar</SelectItem>
              </SelectContent>
            </Select>
            <Select value={rangeKey} onValueChange={setRangeKey}>
              <SelectTrigger className="bg-[#0E1522] border-slate-700 w-[140px]" data-testid="account-detail-range"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DATE_RANGES.map((r) => <SelectItem key={r.key} value={r.key}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={exportCSV} variant="outline" size="sm" className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 gap-1.5" data-testid="account-detail-export">
              <Download className="h-4 w-4" /> CSV
            </Button>
          </div>
        </div>

        {rangeKey === "custom" && (
          <div className="flex gap-2 mb-4 items-center text-xs">
            <span className="text-slate-400">Başlangıç:</span>
            <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="bg-[#0E1522] border-slate-700 w-40" />
            <span className="text-slate-400">Bitiş:</span>
            <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="bg-[#0E1522] border-slate-700 w-40" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-800">
                <th className="py-3 px-2 font-mono">Tarih</th>
                <th className="py-3 px-2 font-mono">Tip</th>
                <th className="py-3 px-2 font-mono">Açıklama</th>
                <th className="py-3 px-2 font-mono">Kategori</th>
                <th className="py-3 px-2 font-mono">Cari</th>
                <th className="py-3 px-2 font-mono text-right">Tutar</th>
                <th className="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => {
                const Icon = r.direction === "+" ? ArrowUpRight : r.direction === "−" ? ArrowDownRight : ArrowLeftRight;
                const color = r.direction === "+" ? "text-emerald-400" : "text-rose-400";
                const canEdit = r.kind === "income" || r.kind === "expense";
                return (
                  <tr key={`${r.kind}-${r.id}`} className="border-b border-slate-800/60 hover:bg-slate-800/20" data-testid={`account-detail-row-${idx}`}>
                    <td className="py-3 px-2 text-slate-400 font-mono-data text-xs">{fmtDate(r.date)}</td>
                    <td className="py-3 px-2"><Icon className={`h-4 w-4 ${color}`} /></td>
                    <td className="py-3 px-2 text-slate-200 max-w-xs truncate">{r.description || "-"}</td>
                    <td className="py-3 px-2">
                      <Badge variant="outline" className="bg-slate-800/60 border-slate-700 text-slate-300 text-[11px]">{r.category}</Badge>
                    </td>
                    <td className="py-3 px-2 text-slate-400 text-xs">{r.cari || "-"}</td>
                    <td className={`py-3 px-2 text-right font-mono-data font-bold ${color}`}>{r.direction}{fmtTRY(r.amount)}</td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        {canEdit && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-emerald-400" onClick={() => openEdit(r.kind, r.id)} data-testid={`account-detail-edit-${idx}`} title="Düzenle">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {canEdit && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-rose-400" onClick={() => { r.kind === "income" ? deleteIncome(r.id) : deleteExpense(r.id); toast.success("Kayıt silindi"); }} data-testid={`account-detail-delete-${idx}`} title="Sil">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-10 text-center text-slate-500">Seçili filtrelerde hareket yok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <IncomeDialog open={incomeOpen} onOpenChange={setIncomeOpen} defaults={{ account_id: id }} />
      <ExpenseDialog open={expenseOpen} onOpenChange={setExpenseOpen} defaults={{ account_id: id }} />
      <TransferDialog open={transferOpen} onOpenChange={setTransferOpen} />
      <EditEntryDialog open={editOpen} onOpenChange={setEditOpen} kind={editing.kind} entry={editing.entry} />
    </div>
  );
}
