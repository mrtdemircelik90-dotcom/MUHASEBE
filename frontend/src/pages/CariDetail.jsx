import React, { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useFinance } from "@/lib/finance-store";
import { fmtTRY, fmtDate } from "@/lib/format";
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
  Plus,
  Minus,
  Building2,
  Phone,
  Mail,
  Trash2,
  Search,
} from "lucide-react";
import { IncomeDialog, ExpenseDialog } from "@/components/FinanceDialogs";

export default function CariDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cari, accounts, income, expense, upcoming, deleteIncome, deleteExpense } = useFinance();
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [q, setQ] = useState("");

  const entity = cari.find((c) => c.id === id);
  const findAccount = (aid) => accounts.find((a) => a.id === aid);

  const statement = useMemo(() => {
    if (!entity) return [];
    const incomes = income
      .filter((i) => i.cari_id === id)
      .map((i) => ({
        id: i.id,
        kind: "income",
        date: i.date,
        direction: "+",
        label: "Tahsilat",
        amount: i.amount,
        category: i.category,
        description: i.description,
        account: findAccount(i.account_id)?.bank_name,
      }));
    const expenses = expense
      .filter((e) => e.cari_id === id)
      .map((e) => ({
        id: e.id,
        kind: "expense",
        date: e.date,
        direction: "−",
        label: "Ödeme",
        amount: e.amount,
        category: e.category,
        description: e.description,
        account: findAccount(e.account_id)?.bank_name,
      }));
    return [...incomes, ...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [entity, id, income, expense, accounts]);

  const upcomingForThis = useMemo(
    () => upcoming.filter((u) => u.cari_id === id && u.status !== "settled"),
    [upcoming, id],
  );

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    if (!term) return statement;
    return statement.filter(
      (r) =>
        r.description?.toLowerCase().includes(term) ||
        r.category?.toLowerCase().includes(term) ||
        r.account?.toLowerCase().includes(term),
    );
  }, [statement, q]);

  const totalIn = statement.filter((r) => r.direction === "+").reduce((s, r) => s + r.amount, 0);
  const totalOut = statement.filter((r) => r.direction === "−").reduce((s, r) => s + r.amount, 0);

  if (!entity) {
    return (
      <div className="text-center py-20">
        <div className="text-slate-400 mb-4">Cari bulunamadı.</div>
        <Button onClick={() => navigate("/cari")}>Carilere dön</Button>
      </div>
    );
  }

  const isCustomer = entity.type === "customer";

  return (
    <div className="space-y-6" data-testid="cari-detail-page">
      <div>
        <Link to="/cari" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 font-mono tracking-wider uppercase" data-testid="back-to-cari">
          <ArrowLeft className="h-3.5 w-3.5" /> Cari Hesaplar
        </Link>
      </div>

      <Card className="bg-[#131C2E] border-slate-800 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className={`h-14 w-14 rounded-xl grid place-items-center ${isCustomer ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">{entity.company_name}</h1>
              <p className="text-sm text-slate-400">{entity.contact_person} · {entity.category}</p>
              <div className="flex gap-4 text-[11px] text-slate-500 mt-2 flex-wrap">
                <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {entity.phone || "-"}</span>
                <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {entity.email || "-"}</span>
                <span className="font-mono">VKN: {entity.tax_no} · {entity.tax_office}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
              {isCustomer ? "Alacak Bakiye" : "Borç Bakiye"}
            </div>
            <div className={`font-display font-bold text-3xl font-mono-data mt-1 ${isCustomer ? "text-emerald-400" : "text-rose-400"}`} data-testid="cari-detail-balance">
              {isCustomer ? "+" : "−"}{fmtTRY(entity.balance)}
            </div>
            <div className="flex gap-3 mt-2 text-xs justify-end">
              <span className="text-emerald-400 font-mono-data">Tahsilat: {fmtTRY(totalIn)}</span>
              <span className="text-rose-400 font-mono-data">Ödeme: {fmtTRY(totalOut)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-6 flex-wrap">
          <Button onClick={() => setIncomeOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5" data-testid="cari-detail-add-income">
            <Plus className="h-4 w-4" /> Tahsilat Kaydet
          </Button>
          <Button onClick={() => setExpenseOpen(true)} className="bg-rose-500 hover:bg-rose-600 text-white gap-1.5" data-testid="cari-detail-add-expense">
            <Minus className="h-4 w-4" /> Ödeme Kaydet
          </Button>
        </div>
      </Card>

      {upcomingForThis.length > 0 && (
        <Card className="bg-[#131C2E] border border-amber-500/20 p-4">
          <h2 className="font-display text-lg font-semibold text-slate-200 mb-3">Bu Cariye Ait Yaklaşan Vadeler</h2>
          <div className="space-y-2">
            {upcomingForThis.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[#0E1522] border border-slate-800/80 text-xs">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={u.type === "collection" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}>
                    {u.type === "collection" ? "Tahsilat" : "Ödeme"}
                  </Badge>
                  <span className="text-slate-200">{u.description}</span>
                  <span className="text-slate-500">{fmtDate(u.due_date)}</span>
                </div>
                <span className={`font-mono-data font-bold ${u.type === "collection" ? "text-emerald-400" : "text-rose-400"}`}>
                  {u.type === "collection" ? "+" : "−"}{fmtTRY(u.amount)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="bg-[#131C2E] border-slate-800 p-4">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="font-display text-lg font-semibold text-slate-200">Cari Ekstresi · {statement.length} hareket</h2>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input placeholder="Açıklama / hesap ara..." value={q} onChange={(e) => setQ(e.target.value)} className="bg-[#0E1522] border-slate-700 pl-9 w-56" data-testid="cari-detail-search" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-800">
                <th className="py-3 px-2 font-mono">Tarih</th>
                <th className="py-3 px-2 font-mono">İşlem</th>
                <th className="py-3 px-2 font-mono">Açıklama</th>
                <th className="py-3 px-2 font-mono">Kategori</th>
                <th className="py-3 px-2 font-mono">Hesap</th>
                <th className="py-3 px-2 font-mono text-right">Tutar</th>
                <th className="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => {
                const Icon = r.direction === "+" ? ArrowUpRight : ArrowDownRight;
                const color = r.direction === "+" ? "text-emerald-400" : "text-rose-400";
                return (
                  <tr key={`${r.kind}-${r.id}`} className="border-b border-slate-800/60 hover:bg-slate-800/20" data-testid={`cari-detail-row-${idx}`}>
                    <td className="py-3 px-2 text-slate-400 font-mono-data text-xs">{fmtDate(r.date)}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1.5">
                        <Icon className={`h-4 w-4 ${color}`} />
                        <span className={`text-xs font-medium ${color}`}>{r.label}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-slate-200 max-w-xs truncate">{r.description || "-"}</td>
                    <td className="py-3 px-2">
                      <Badge variant="outline" className="bg-slate-800/60 border-slate-700 text-slate-300 text-[11px]">{r.category}</Badge>
                    </td>
                    <td className="py-3 px-2 text-slate-400 text-xs">{r.account || "-"}</td>
                    <td className={`py-3 px-2 text-right font-mono-data font-bold ${color}`}>{r.direction}{fmtTRY(r.amount)}</td>
                    <td className="py-3 px-2 text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-rose-400" onClick={() => (r.kind === "income" ? deleteIncome(r.id) : deleteExpense(r.id))}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-10 text-center text-slate-500">Henüz hareket yok. Yukarıdan Tahsilat / Ödeme ekleyebilirsin.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <IncomeDialog open={incomeOpen} onOpenChange={setIncomeOpen} defaults={{ cari_id: id }} />
      <ExpenseDialog open={expenseOpen} onOpenChange={setExpenseOpen} defaults={{ cari_id: id }} />
    </div>
  );
}
