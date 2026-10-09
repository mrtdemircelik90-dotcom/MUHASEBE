import "@/App.css";
import "@/index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinanceProvider } from "@/lib/finance-store";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Income from "@/pages/Income";
import Expense from "@/pages/Expense";
import Accounts from "@/pages/Accounts";
import CurrentAccounts from "@/pages/CurrentAccounts";
import Upcoming from "@/pages/Upcoming";
import Reports from "@/pages/Reports";
import Transactions from "@/pages/Transactions";

function App() {
  return (
    <FinanceProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="gelir" element={<Income />} />
            <Route path="gider" element={<Expense />} />
            <Route path="hesaplar" element={<Accounts />} />
            <Route path="cari" element={<CurrentAccounts />} />
            <Route path="yaklasan" element={<Upcoming />} />
            <Route path="raporlar" element={<Reports />} />
            <Route path="hareketler" element={<Transactions />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FinanceProvider>
  );
}

export default App;
