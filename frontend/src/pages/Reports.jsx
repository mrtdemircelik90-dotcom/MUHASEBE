import React, { useMemo } from "react";
import { useFinance } from "@/lib/finance-store";
import { fmtTRY, monthKey, monthLabel } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { toast } from "sonner";

const COLORS = ["#10B981", "#06B6D4", "#F59E0B", "#8B5CF6", "#F43F5E", "#64748B", "#EC4899", "#22D3EE", "#A855F7"];

const downloadCSV = (filename, rows) => {
  if (!rows.length) return toast.error("Veri yok");
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("CSV dışa aktarıldı");
};

export default function Reports() {
  const { income, expense, accounts, cari } = useFinance();

  const monthlyData = useMemo(() => {
    const map = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[k] = { month: monthLabel(k), Gelir: 0, Gider: 0, Net: 0 };
    }
    income.forEach((i) => { if (map[monthKey(i.date)]) map[monthKey(i.date)].Gelir += i.amount; });
    expense.forEach((e) => { if (map[monthKey(e.date)]) map[monthKey(e.date)].Gider += e.amount; });
    Object.keys(map).forEach((k) => { map[k].Net = map[k].Gelir - map[k].Gider; });
    return Object.values(map);
  }, [income, expense]);

  const incomeByCategory = useMemo(() => {
    const m = {};
    income.forEach((i) => { m[i.category] = (m[i.category] || 0) + i.amount; });
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [income]);

  const expenseByCategory = useMemo(() => {
    const m = {};
    expense.forEach((e) => { m[e.category] = (m[e.category] || 0) + e.amount; });
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [expense]);

  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const totalExpense = expense.reduce((s, e) => s + e.amount, 0);
  const net = totalIncome - totalExpense;

  const findAccount = (id) => accounts.find((a) => a.id === id);
  const findCari = (id) => cari.find((c) => c.id === id);

  const exportAll = () => {
    const rows = [
      ...income.map((i) => ({
        Tur: "Gelir",
        Tarih: i.date,
        Aciklama: i.description,
        Kategori: i.category,
        Hesap: findAccount(i.account_id)?.bank_name || "",
        Cari: findCari(i.cari_id)?.company_name || "",
        Tutar: i.amount,
      })),
      ...expense.map((e) => ({
        Tur: "Gider",
        Tarih: e.date,
        Aciklama: e.description,
        Kategori: e.category,
        Hesap: findAccount(e.account_id)?.bank_name || "",
        Cari: findCari(e.cari_id)?.company_name || "",
        Tutar: -e.amount,
      })),
    ].sort((a, b) => new Date(b.Tarih) - new Date(a.Tarih));
    downloadCSV(`liravest-tum-hareketler-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <div className="space-y-6" data-testid="reports-page">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Finansal Raporlar & Analitik</h1>
          <p className="text-sm text-slate-400 mt-1">Son 12 ay performans analizi ve dışa aktarma</p>
        </div>
        <Button onClick={exportAll} className="bg-cyan-500 hover:bg-cyan-600 text-white gap-1.5" data-testid="export-csv-button">
          <Download className="h-4 w-4" /> Tümünü CSV İndir
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#131C2E] border border-emerald-500/20 p-5">
          <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">Toplam Gelir</div>
          <div className="font-display font-bold text-2xl text-emerald-400 font-mono-data mt-2" data-testid="report-total-income">{fmtTRY(totalIncome)}</div>
        </Card>
        <Card className="bg-[#131C2E] border border-rose-500/20 p-5">
          <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">Toplam Gider</div>
          <div className="font-display font-bold text-2xl text-rose-400 font-mono-data mt-2" data-testid="report-total-expense">{fmtTRY(totalExpense)}</div>
        </Card>
        <Card className={`bg-[#131C2E] border ${net >= 0 ? "border-emerald-500/20" : "border-rose-500/20"} p-5`}>
          <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">Net Kar/Zarar</div>
          <div className={`font-display font-bold text-2xl font-mono-data mt-2 ${net >= 0 ? "text-emerald-400" : "text-rose-400"}`} data-testid="report-net">{fmtTRY(net)}</div>
        </Card>
      </div>

      {/* Monthly comparison */}
      <Card className="bg-[#131C2E] border-slate-800 p-5">
        <h2 className="font-display text-lg font-semibold text-slate-200 mb-4">Aylık Gelir vs Gider (12 Ay)</h2>
        <div className="h-80">
          <ResponsiveContainer>
            <BarChart data={monthlyData}>
              <CartesianGrid stroke="#1E2C44" vertical={false} />
              <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#0E1522", border: "1px solid #1E2C44", borderRadius: 8 }} formatter={(v) => fmtTRY(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Gelir" fill="#10B981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Gider" fill="#F43F5E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Net flow line */}
      <Card className="bg-[#131C2E] border-slate-800 p-5">
        <h2 className="font-display text-lg font-semibold text-slate-200 mb-4">Net Nakit Akışı Trendi</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={monthlyData}>
              <CartesianGrid stroke="#1E2C44" vertical={false} />
              <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#0E1522", border: "1px solid #1E2C44", borderRadius: 8 }} formatter={(v) => fmtTRY(v)} />
              <Line type="monotone" dataKey="Net" stroke="#06B6D4" strokeWidth={3} dot={{ fill: "#06B6D4", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#131C2E] border-slate-800 p-5">
          <h2 className="font-display text-lg font-semibold text-slate-200 mb-4">Gelir Kategori Dağılımı</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <RePieChart>
                <Pie data={incomeByCategory} dataKey="value" nameKey="name" outerRadius={90} paddingAngle={2}>
                  {incomeByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#131C2E" strokeWidth={2} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0E1522", border: "1px solid #1E2C44", borderRadius: 8 }} formatter={(v) => fmtTRY(v)} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-3">
            {incomeByCategory.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-2 w-2 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-400 truncate">{c.name}</span>
                </div>
                <span className="text-slate-300 font-mono-data">{fmtTRY(c.value)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-[#131C2E] border-slate-800 p-5">
          <h2 className="font-display text-lg font-semibold text-slate-200 mb-4">Gider Kategori Dağılımı</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <RePieChart>
                <Pie data={expenseByCategory} dataKey="value" nameKey="name" outerRadius={90} paddingAngle={2}>
                  {expenseByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#131C2E" strokeWidth={2} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0E1522", border: "1px solid #1E2C44", borderRadius: 8 }} formatter={(v) => fmtTRY(v)} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-3">
            {expenseByCategory.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-2 w-2 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-400 truncate">{c.name}</span>
                </div>
                <span className="text-slate-300 font-mono-data">{fmtTRY(c.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
