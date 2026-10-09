import React, { useMemo } from "react";
import { useFinance } from "@/lib/finance-store";
import { fmtTRY, monthKey, monthLabel, daysBetween } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CalendarClock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";

const KPI = ({ label, value, icon: Icon, tone = "emerald", subtitle, testid }) => {
  const toneMap = {
    emerald: { glow: "glow-emerald", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
    coral: { glow: "glow-coral", bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
    cyan: { glow: "", bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
    amber: { glow: "", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  }[tone];
  return (
    <Card className={`relative bg-[#131C2E] ${toneMap.border} border p-5 overflow-hidden ${toneMap.glow}`} data-testid={testid}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">{label}</div>
          <div className={`font-display font-bold text-2xl mt-2 font-mono-data ${toneMap.text}`}>{value}</div>
          {subtitle && <div className="text-xs text-slate-500 mt-1">{subtitle}</div>}
        </div>
        <div className={`h-10 w-10 rounded-xl ${toneMap.bg} ${toneMap.text} grid place-items-center`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
};

export default function Dashboard() {
  const { accounts, income, expense, upcoming, cari } = useFinance();

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const currentMonth = monthKey(new Date().toISOString());
  const monthIncome = income.filter((i) => monthKey(i.date) === currentMonth).reduce((s, i) => s + i.amount, 0);
  const monthExpense = expense.filter((e) => monthKey(e.date) === currentMonth).reduce((s, e) => s + e.amount, 0);
  const netCashflow = monthIncome - monthExpense;

  const upcomingPending = upcoming.filter((u) => u.status !== "settled");
  const upcomingCollections = upcomingPending.filter((u) => u.type === "collection").reduce((s, u) => s + u.amount, 0);
  const upcomingPayments = upcomingPending.filter((u) => u.type === "payment").reduce((s, u) => s + u.amount, 0);

  // Monthly trend data (last 6 months)
  const trendData = useMemo(() => {
    const map = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[k] = { month: monthLabel(k), Gelir: 0, Gider: 0 };
    }
    income.forEach((i) => { if (map[monthKey(i.date)]) map[monthKey(i.date)].Gelir += i.amount; });
    expense.forEach((e) => { if (map[monthKey(e.date)]) map[monthKey(e.date)].Gider += e.amount; });
    return Object.values(map);
  }, [income, expense]);

  // Category breakdown (expense)
  const expenseByCat = useMemo(() => {
    const map = {};
    expense.forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [expense]);

  const PIE_COLORS = ["#10B981", "#06B6D4", "#F59E0B", "#8B5CF6", "#F43F5E", "#64748B"];

  const nextUpcoming = [...upcomingPending]
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  const findCari = (id) => cari.find((c) => c.id === id);

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">Nakit Akışı & Özet Göstergeler</h1>
        <p className="text-sm text-slate-400 mt-1">Finansal konsolun anlık durumunu burada görürsün.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Toplam Likidite" value={fmtTRY(totalBalance)} icon={Wallet} tone="emerald" subtitle={`${accounts.length} aktif hesap`} testid="kpi-total-balance" />
        <KPI label="Bu Ay Gelir" value={fmtTRY(monthIncome)} icon={TrendingUp} tone="cyan" subtitle={`${income.filter((i) => monthKey(i.date) === currentMonth).length} kayıt`} testid="kpi-monthly-income" />
        <KPI label="Bu Ay Gider" value={fmtTRY(monthExpense)} icon={TrendingDown} tone="coral" subtitle={`${expense.filter((e) => monthKey(e.date) === currentMonth).length} kayıt`} testid="kpi-monthly-expense" />
        <KPI label="Net Nakit Akışı" value={fmtTRY(netCashflow)} icon={netCashflow >= 0 ? ArrowUpRight : ArrowDownRight} tone={netCashflow >= 0 ? "emerald" : "coral"} subtitle={netCashflow >= 0 ? "Pozitif akış" : "Dikkat: Negatif"} testid="kpi-net-cashflow" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="bg-[#131C2E] border-slate-800 p-5 lg:col-span-8" data-testid="chart-cashflow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-200">Nakit Akışı Trendi</h2>
              <p className="text-xs text-slate-500">Son 6 ay gelir ve gider karşılaştırması</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={trendData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1E2C44" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "#0E1522", border: "1px solid #1E2C44", borderRadius: 8 }} labelStyle={{ color: "#94A3B8" }} formatter={(v) => fmtTRY(v)} />
                <Area type="monotone" dataKey="Gelir" stroke="#10B981" strokeWidth={2} fill="url(#gIncome)" />
                <Area type="monotone" dataKey="Gider" stroke="#F43F5E" strokeWidth={2} fill="url(#gExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-[#131C2E] border-slate-800 p-5 lg:col-span-4" data-testid="chart-expense-breakdown">
          <h2 className="font-display text-lg font-semibold text-slate-200 mb-1">Gider Dağılımı</h2>
          <p className="text-xs text-slate-500 mb-3">Kategori bazlı pay</p>
          <div className="h-56">
            <ResponsiveContainer>
              <RePieChart>
                <Pie data={expenseByCat} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2}>
                  {expenseByCat.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="#131C2E" strokeWidth={2} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0E1522", border: "1px solid #1E2C44", borderRadius: 8 }} formatter={(v) => fmtTRY(v)} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {expenseByCat.slice(0, 4).map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-slate-400 truncate">{c.name}</span>
                </div>
                <span className="text-slate-300 font-mono-data">{fmtTRY(c.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Accounts snapshot + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="bg-[#131C2E] border-slate-800 p-5 lg:col-span-7" data-testid="dashboard-accounts-card">
          <h2 className="font-display text-lg font-semibold text-slate-200 mb-4">Banka & Kasa Portföyü</h2>
          <div className="space-y-2.5">
            {accounts.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0E1522] border border-slate-800/80">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-lg grid place-items-center shrink-0" style={{ background: `${a.color}22`, color: a.color }}>
                    <Wallet className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-200 truncate">{a.bank_name}</div>
                    <div className="text-xs text-slate-500 truncate">{a.account_name} · {a.account_type}</div>
                  </div>
                </div>
                <div className="font-mono-data font-bold text-emerald-400 text-sm">{fmtTRY(a.balance)}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-[#131C2E] border-slate-800 p-5 lg:col-span-5" data-testid="dashboard-upcoming-card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-200">Yaklaşan Vade</h2>
              <p className="text-xs text-slate-500">7 gün içindeki ödeme ve tahsilatlar</p>
            </div>
            <CalendarClock className="h-4 w-4 text-slate-500" />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3">
              <div className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">Tahsilat</div>
              <div className="font-mono-data font-bold text-emerald-400 mt-1">{fmtTRY(upcomingCollections)}</div>
            </div>
            <div className="rounded-lg bg-rose-500/5 border border-rose-500/20 p-3">
              <div className="text-[10px] font-mono tracking-widest text-rose-400 uppercase">Ödeme</div>
              <div className="font-mono-data font-bold text-rose-400 mt-1">{fmtTRY(upcomingPayments)}</div>
            </div>
          </div>
          <div className="space-y-2">
            {nextUpcoming.map((u) => {
              const d = daysBetween(u.due_date);
              const isOverdue = d < 0;
              return (
                <div key={u.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[#0E1522] border border-slate-800/80 text-xs">
                  <div className="min-w-0">
                    <div className="text-slate-200 font-medium truncate">{findCari(u.cari_id)?.company_name || u.description}</div>
                    <div className="text-slate-500 text-[11px]">
                      {isOverdue ? <span className="text-rose-400">{Math.abs(d)} gün gecikti</span> : d === 0 ? "Bugün" : `${d} gün sonra`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono-data font-bold ${u.type === "collection" ? "text-emerald-400" : "text-rose-400"}`}>
                      {u.type === "collection" ? "+" : "−"}{fmtTRY(u.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
            {nextUpcoming.length === 0 && <div className="text-sm text-slate-500 text-center py-6">Yaklaşan kayıt yok</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}
