import React, { useMemo, useState } from "react";
import { useFinance } from "@/lib/finance-store";
import { fmtTRY, fmtDate } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, TrendingUp, Search, Plus } from "lucide-react";
import { IncomeDialog } from "@/components/FinanceDialogs";
import { toast } from "sonner";

export default function Income() {
  const { income, accounts, cari, deleteIncome } = useFinance();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const findAccount = (id) => accounts.find((a) => a.id === id);
  const findCari = (id) => cari.find((c) => c.id === id);

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    return income
      .filter((i) =>
        !term ||
        i.description?.toLowerCase().includes(term) ||
        i.category?.toLowerCase().includes(term) ||
        findCari(i.cari_id)?.company_name?.toLowerCase().includes(term),
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [income, q]);

  const total = filtered.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6" data-testid="income-page">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Gelir Kayıtları</h1>
          <p className="text-sm text-slate-400 mt-1">Toplam {filtered.length} kayıt · {fmtTRY(total)}</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5" data-testid="income-page-add-button">
          <Plus className="h-4 w-4" /> Yeni Gelir
        </Button>
      </div>

      <Card className="bg-[#131C2E] border-slate-800 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input placeholder="Açıklama, kategori veya cari ara..." value={q} onChange={(e) => setQ(e.target.value)} className="bg-[#0E1522] border-slate-700 pl-9" data-testid="income-filter-search-input" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-800">
                <th className="py-3 px-2 font-mono">Tarih</th>
                <th className="py-3 px-2 font-mono">Açıklama</th>
                <th className="py-3 px-2 font-mono">Kategori</th>
                <th className="py-3 px-2 font-mono">Hesap</th>
                <th className="py-3 px-2 font-mono">Cari</th>
                <th className="py-3 px-2 font-mono text-right">Tutar</th>
                <th className="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i, idx) => (
                <tr key={i.id} className="border-b border-slate-800/60 hover:bg-slate-800/20" data-testid={`income-row-${idx}`}>
                  <td className="py-3 px-2 text-slate-400 font-mono-data text-xs">{fmtDate(i.date)}</td>
                  <td className="py-3 px-2 text-slate-200 max-w-xs truncate">{i.description || "-"}</td>
                  <td className="py-3 px-2">
                    <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-medium">{i.category}</Badge>
                  </td>
                  <td className="py-3 px-2 text-slate-400 text-xs">{findAccount(i.account_id)?.bank_name || "-"}</td>
                  <td className="py-3 px-2 text-slate-400 text-xs">{findCari(i.cari_id)?.company_name || "-"}</td>
                  <td className="py-3 px-2 text-right font-mono-data font-bold text-emerald-400">+{fmtTRY(i.amount)}</td>
                  <td className="py-3 px-2 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-rose-400" onClick={() => { deleteIncome(i.id); toast.success("Gelir silindi"); }} data-testid={`income-delete-button-${idx}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-10 text-center text-slate-500">Kayıt bulunamadı</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <IncomeDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
