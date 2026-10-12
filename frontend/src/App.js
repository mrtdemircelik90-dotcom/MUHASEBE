import "@/App.css";
import "@/index.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";
import { FinanceProvider } from "@/lib/finance-store";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Income from "@/pages/Income";
import Expense from "@/pages/Expense";
import Accounts from "@/pages/Accounts";
import CurrentAccounts from "@/pages/CurrentAccounts";
import CariDetail from "@/pages/CariDetail";
import AccountDetail from "@/pages/AccountDetail";
import Upcoming from "@/pages/Upcoming";
import Reports from "@/pages/Reports";
import Transactions from "@/pages/Transactions";
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";

function AppRouter() {
  const location = useLocation();
  // CRITICAL: Detect OAuth callback synchronously during render.
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <FinanceProvider>
              <Layout />
            </FinanceProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="gelir" element={<Income />} />
        <Route path="gider" element={<Expense />} />
        <Route path="hesaplar" element={<Accounts />} />
        <Route path="hesaplar/:id" element={<AccountDetail />} />
        <Route path="cari" element={<CurrentAccounts />} />
        <Route path="cari/:id" element={<CariDetail />} />
        <Route path="yaklasan" element={<Upcoming />} />
        <Route path="raporlar" element={<Reports />} />
        <Route path="hareketler" element={<Transactions />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
