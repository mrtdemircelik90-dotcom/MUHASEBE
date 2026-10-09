import React, { useMemo, useState } from "react";
import { useFinance } from "@/lib/finance-store";
import { fmtTRY, fmtDate } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowUpRight, ArrowDownRight, ArrowLeftRight } from "lucide-react";

export default function Transactions() {
  const { income, expense, transfers, accounts, cari } = useFinance();
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const findAccount = (id) => accounts.find((a) => a.id === id);
  const findCari = (id) => cari.find((c) => c.id === id);

  const unified = useMemo(() => {
    const incomeRows = income.map((i) => ({
      id: i.id,
      kind: "income",
      date: i.date,
      description: i.description,
      category: i.category,
      account: findAccount(i.account_id)?.bank_name,
      cari: findCari(i.cari_id)?.company_name,
      amount: i.amount,
      direction: "+",
    }));
    const expenseRows = expense.map((e) => ({
      id: e.id,
      kind: "expense",
      date: e.date,
      description: e.description,
      category: e.category,
      account: findAccount(e.account_id)?.bank_name,
      cari: findCari(e.cari_id)?.company_name,
      amount: e.amount,
      direction: "−",
    }));
    const transferRows = transfers.map((t) => ({
      id: t.id,
      kind: "transfer",
      date: t.date,
      description: t.description,
      category: "Virman",
      account: `${findAccount(t.from_id)?.bank_name} → ${findAccount(t.to_id)?.bank_name}`,
      cari: "-",
      amount: t.amount,
      direction: "↔",
    }));
    return [...incomeRows, ...expenseRows, ...transferRows].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [income, expense, transfers, accounts, cari]);

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    return unified.filter((r) => {
      if (typeFilter !== "all" && r.kind !== typeFilter) return false;
      if (!term) return true;
      return (
        r.description?.toLowerCase().includes(term) ||
        r.category?.toLowerCase().includes(term) ||
        r.cari?.toLowerCase().includes(term) ||
        r.account?.toLowerCase().includes(term)
      );
    });
  }, [unified, q, typeFilter]);

  return (
    <div className="space-y-6" data-testid="transactions-page">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Hareket Geçmişi (Defter-i Kebir)</h1>
        <p className="text-sm text-slate-400 mt-1">Tüm gelir, gider ve transferlerin kronolojik listesi · {filtered.length} kayıt</p>
      </div>

      <Card className="bg-[#131C2E] border-slate-800 p-4">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input placeholder="Açıklama, cari, hesap ara..." value={q} onChange={(e) => setQ(e.target.value)} className="bg-[#0E1522] border-slate-700 pl-9" data-testid="transactions-search-input" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="bg-[#0E1522] border-slate-700 w-[180px]" data-testid="transactions-type-filter"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Hareketler</SelectItem>
              <SelectItem value="income">Gelirler</SelectItem>
              <SelectItem value="expense">Giderler</SelectItem>
              <SelectItem value="transfer">Virmanlar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-800">
                <th className="py-3 px-2 font-mono">Tarih</th>
                <th className="py-3 px-2 font-mono">Tip</th>
                <th className="py-3 px-2 font-mono">Açıklama</th>
                <th className="py-3 px-2 font-mono">Kategori</th>
                <th className="py-3 px-2 font-mono">Hesap</th>
                <th className="py-3 px-2 font-mono">Cari</th>
                <th className="py-3 px-2 font-mono text-right">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => {
                const Icon = r.kind === "income" ? ArrowUpRight : r.kind === "expense" ? ArrowDownRight : ArrowLeftRight;
                const color = r.kind === "income" ? "text-emerald-400" : r.kind === "expense" ? "text-rose-400" : "text-cyan-400";
                return (
                  <tr key={r.id} className="border-b border-slate-800/60 hover:bg-slate-800/20" data-testid={`transaction-row-${idx}`}>
                    <td className="py-3 px-2 text-slate-400 font-mono-data text-xs">{fmtDate(r.date)}</td>
                    <td className="py-3 px-2"><Icon className={`h-4 w-4 ${color}`} /></td>
                    <td className="py-3 px-2 text-slate-200 max-w-xs truncate">{r.description}</td>
                    <td className="py-3 px-2">
                      <Badge variant="outline" className="bg-slate-800/60 border-slate-700 text-slate-300 text-[11px]">{r.category}</Badge>
                    </td>
                    <td className="py-3 px-2 text-slate-400 text-xs">{r.account || "-"}</td>
                    <td className="py-3 px-2 text-slate-400 text-xs">{r.cari || "-"}</td>
                    <td className={`py-3 px-2 text-right font-mono-data font-bold ${color}`}>{r.direction}{fmtTRY(r.amount)}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-slate-500">Kayıt bulunamadı</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
