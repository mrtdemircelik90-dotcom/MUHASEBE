import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  CalendarClock,
  PieChart,
  ListChecks,
  Plus,
  Minus,
  ArrowLeftRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toaster } from "sonner";
import { IncomeDialog, ExpenseDialog, TransferDialog } from "./FinanceDialogs";
import { useFinance } from "@/lib/finance-store";
import { fmtTRY } from "@/lib/format";

const NAV = [
  { key: "dashboard", path: "/", label: "Nakit Akışı", icon: LayoutDashboard, testid: "nav-dashboard-button" },
  { key: "income", path: "/gelir", label: "Gelirler", icon: TrendingUp, testid: "nav-income-button" },
  { key: "expense", path: "/gider", label: "Giderler", icon: TrendingDown, testid: "nav-expense-button" },
  { key: "accounts", path: "/hesaplar", label: "Banka & Kasa", icon: Wallet, testid: "nav-accounts-button" },
  { key: "cari", path: "/cari", label: "Cari Hesaplar", icon: Users, testid: "nav-cari-button" },
  { key: "upcoming", path: "/yaklasan", label: "Yaklaşan Ödeme", icon: CalendarClock, testid: "nav-upcoming-button" },
  { key: "reports", path: "/raporlar", label: "Raporlar", icon: PieChart, testid: "nav-reports-button" },
  { key: "transactions", path: "/hareketler", label: "Hareket Geçmişi", icon: ListChecks, testid: "nav-transactions-button" },
];

export default function Layout() {
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const { accounts, resetAll } = useFinance();
  const navigate = useNavigate();

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="min-h-screen bg-[#090D14] text-slate-100 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 border-r border-slate-800/80 bg-[#090D14]/95 backdrop-blur-xl z-30">
        <div className="px-6 py-6 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 grid place-items-center shadow-lg shadow-emerald-500/20">
              <span className="font-display font-black text-slate-950 text-lg">L</span>
            </div>
            <div>
              <div className="font-display font-bold text-lg leading-tight tracking-tight">Liravest</div>
              <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Finans Konsolu</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV.map(({ key, path, label, icon: Icon, testid }) => (
            <NavLink
              key={key}
              to={path}
              end={path === "/"}
              data-testid={testid}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-medium border border-transparent"
                }`
              }
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800/80">
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3">
            <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase mb-1">Toplam Likidite</div>
            <div className="font-display font-bold text-emerald-400 text-lg font-mono-data" data-testid="sidebar-total-balance">{fmtTRY(totalBalance)}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Tüm veriler başlangıç durumuna döndürülecek. Emin misiniz?")) {
                resetAll();
                navigate("/");
              }
            }}
            className="w-full mt-2 text-slate-500 hover:text-slate-300 text-xs"
            data-testid="reset-all-button"
          >
            <RefreshCw className="h-3 w-3 mr-1.5" /> Örnek verileri sıfırla
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-[#090D14]/85 backdrop-blur-xl border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between">
          <div className="md:hidden flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 grid place-items-center">
              <span className="font-display font-black text-slate-950">L</span>
            </div>
            <span className="font-display font-bold">Liravest</span>
          </div>
          <div className="hidden md:block">
            <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Finans Kontrol Merkezi</div>
            <div className="text-sm text-slate-300">
              {new Intl.DateTimeFormat("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date())}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIncomeOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold gap-1.5"
              size="sm"
              data-testid="quick-add-income-button"
            >
              <Plus className="h-4 w-4" /> Gelir
            </Button>
            <Button
              onClick={() => setExpenseOpen(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white font-semibold gap-1.5"
              size="sm"
              data-testid="quick-add-expense-button"
            >
              <Minus className="h-4 w-4" /> Gider
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white" data-testid="header-more-menu">
                  Daha fazla
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#131C2E] border-slate-700 text-slate-200">
                <DropdownMenuItem onClick={() => setTransferOpen(true)} data-testid="menu-transfer-button">
                  <ArrowLeftRight className="h-4 w-4 mr-2" /> Hesaplar Arası Virman
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem onClick={() => navigate("/raporlar")}>
                  <PieChart className="h-4 w-4 mr-2" /> Raporlara Git
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      {/* Global dialogs */}
      <IncomeDialog open={incomeOpen} onOpenChange={setIncomeOpen} />
      <ExpenseDialog open={expenseOpen} onOpenChange={setExpenseOpen} />
      <TransferDialog open={transferOpen} onOpenChange={setTransferOpen} />

      <Toaster theme="dark" position="top-right" richColors toastOptions={{ style: { background: "#131C2E", border: "1px solid #1E2C44", color: "#F8FAFC" } }} />
    </div>
  );
}
