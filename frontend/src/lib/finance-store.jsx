import React, { createContext, useContext, useEffect, useState } from "react";
import {
  SEED_ACCOUNTS,
  SEED_CARI,
  SEED_INCOME,
  SEED_EXPENSE,
  SEED_UPCOMING,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from "./seed";

const STORAGE_KEY = "liravest-finance-v1";

const defaultState = {
  accounts: SEED_ACCOUNTS,
  cari: SEED_CARI,
  income: SEED_INCOME,
  expense: SEED_EXPENSE,
  upcoming: SEED_UPCOMING,
  transfers: [],
};

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
};

const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const FinanceContext = createContext(null);

export const FinanceProvider = ({ children }) => {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // ----- Account helpers
  const addAccount = (acc) =>
    setState((s) => ({
      ...s,
      accounts: [...s.accounts, { ...acc, id: uid("acc"), balance: Number(acc.balance) || 0 }],
    }));

  const deleteAccount = (id) =>
    setState((s) => ({ ...s, accounts: s.accounts.filter((a) => a.id !== id) }));

  const updateAccount = (id, patch) =>
    setState((s) => ({
      ...s,
      accounts: s.accounts.map((a) =>
        a.id === id
          ? {
              ...a,
              ...patch,
              balance: patch.balance !== undefined ? Number(patch.balance) || 0 : a.balance,
            }
          : a,
      ),
    }));

  const adjustAccount = (id, delta) =>
    setState((s) => ({
      ...s,
      accounts: s.accounts.map((a) =>
        a.id === id ? { ...a, balance: Number(a.balance) + Number(delta) } : a,
      ),
    }));

  // ----- Cari helpers
  const addCari = (c) =>
    setState((s) => ({
      ...s,
      cari: [...s.cari, { ...c, id: uid("cari"), balance: Number(c.balance) || 0 }],
    }));

  const deleteCari = (id) =>
    setState((s) => ({ ...s, cari: s.cari.filter((c) => c.id !== id) }));

  const updateCari = (id, patch) =>
    setState((s) => ({
      ...s,
      cari: s.cari.map((c) =>
        c.id === id
          ? {
              ...c,
              ...patch,
              balance: patch.balance !== undefined ? Number(patch.balance) || 0 : c.balance,
            }
          : c,
      ),
    }));

  const adjustCari = (id, delta) =>
    setState((s) => ({
      ...s,
      cari: s.cari.map((c) =>
        c.id === id ? { ...c, balance: Number(c.balance) + Number(delta) } : c,
      ),
    }));

  // ----- Income
  const addIncome = (item) => {
    const payload = {
      ...item,
      id: uid("inc"),
      amount: Number(item.amount) || 0,
      status: "received",
    };
    setState((s) => ({
      ...s,
      income: [payload, ...s.income],
      accounts: s.accounts.map((a) =>
        a.id === payload.account_id ? { ...a, balance: a.balance + payload.amount } : a,
      ),
      cari: payload.cari_id
        ? s.cari.map((c) =>
            c.id === payload.cari_id
              ? { ...c, balance: c.balance - payload.amount }
              : c,
          )
        : s.cari,
    }));
  };

  const deleteIncome = (id) =>
    setState((s) => {
      const target = s.income.find((i) => i.id === id);
      if (!target) return s;
      return {
        ...s,
        income: s.income.filter((i) => i.id !== id),
        accounts: s.accounts.map((a) =>
          a.id === target.account_id ? { ...a, balance: a.balance - target.amount } : a,
        ),
        cari: target.cari_id
          ? s.cari.map((c) =>
              c.id === target.cari_id ? { ...c, balance: c.balance + target.amount } : c,
            )
          : s.cari,
      };
    });

  const updateIncome = (id, patch) =>
    setState((s) => {
      const old = s.income.find((i) => i.id === id);
      if (!old) return s;
      const next = {
        ...old,
        ...patch,
        amount: Number(patch.amount ?? old.amount) || 0,
      };
      const accDelta = {};
      accDelta[old.account_id] = (accDelta[old.account_id] || 0) - old.amount;
      accDelta[next.account_id] = (accDelta[next.account_id] || 0) + next.amount;
      const cariDelta = {};
      if (old.cari_id) cariDelta[old.cari_id] = (cariDelta[old.cari_id] || 0) + old.amount;
      if (next.cari_id) cariDelta[next.cari_id] = (cariDelta[next.cari_id] || 0) - next.amount;
      return {
        ...s,
        income: s.income.map((i) => (i.id === id ? next : i)),
        accounts: s.accounts.map((a) =>
          accDelta[a.id] ? { ...a, balance: a.balance + accDelta[a.id] } : a,
        ),
        cari: s.cari.map((c) =>
          cariDelta[c.id] ? { ...c, balance: c.balance + cariDelta[c.id] } : c,
        ),
      };
    });

  // ----- Expense
  const addExpense = (item) => {
    const payload = {
      ...item,
      id: uid("exp"),
      amount: Number(item.amount) || 0,
      status: "paid",
    };
    setState((s) => ({
      ...s,
      expense: [payload, ...s.expense],
      accounts: s.accounts.map((a) =>
        a.id === payload.account_id ? { ...a, balance: a.balance - payload.amount } : a,
      ),
      cari: payload.cari_id
        ? s.cari.map((c) =>
            c.id === payload.cari_id
              ? { ...c, balance: c.balance - payload.amount }
              : c,
          )
        : s.cari,
    }));
  };

  const deleteExpense = (id) =>
    setState((s) => {
      const target = s.expense.find((e) => e.id === id);
      if (!target) return s;
      return {
        ...s,
        expense: s.expense.filter((e) => e.id !== id),
        accounts: s.accounts.map((a) =>
          a.id === target.account_id ? { ...a, balance: a.balance + target.amount } : a,
        ),
        cari: target.cari_id
          ? s.cari.map((c) =>
              c.id === target.cari_id ? { ...c, balance: c.balance + target.amount } : c,
            )
          : s.cari,
      };
    });

  const updateExpense = (id, patch) =>
    setState((s) => {
      const old = s.expense.find((e) => e.id === id);
      if (!old) return s;
      const next = {
        ...old,
        ...patch,
        amount: Number(patch.amount ?? old.amount) || 0,
      };
      const accDelta = {};
      accDelta[old.account_id] = (accDelta[old.account_id] || 0) + old.amount;
      accDelta[next.account_id] = (accDelta[next.account_id] || 0) - next.amount;
      const cariDelta = {};
      if (old.cari_id) cariDelta[old.cari_id] = (cariDelta[old.cari_id] || 0) + old.amount;
      if (next.cari_id) cariDelta[next.cari_id] = (cariDelta[next.cari_id] || 0) - next.amount;
      return {
        ...s,
        expense: s.expense.map((e) => (e.id === id ? next : e)),
        accounts: s.accounts.map((a) =>
          accDelta[a.id] ? { ...a, balance: a.balance + accDelta[a.id] } : a,
        ),
        cari: s.cari.map((c) =>
          cariDelta[c.id] ? { ...c, balance: c.balance + cariDelta[c.id] } : c,
        ),
      };
    });

  // ----- Transfer
  const transfer = ({ from_id, to_id, amount, description }) => {
    const amt = Number(amount) || 0;
    if (!amt || from_id === to_id) return false;
    setState((s) => ({
      ...s,
      accounts: s.accounts.map((a) => {
        if (a.id === from_id) return { ...a, balance: a.balance - amt };
        if (a.id === to_id) return { ...a, balance: a.balance + amt };
        return a;
      }),
      transfers: [
        {
          id: uid("tr"),
          from_id,
          to_id,
          amount: amt,
          description: description || "Hesaplar arası virman",
          date: new Date().toISOString().slice(0, 10),
        },
        ...s.transfers,
      ],
    }));
    return true;
  };

  // ----- Upcoming
  const addUpcoming = (item) =>
    setState((s) => ({
      ...s,
      upcoming: [
        {
          ...item,
          id: uid("up"),
          amount: Number(item.amount) || 0,
          status: "pending",
        },
        ...s.upcoming,
      ],
    }));

  const settleUpcoming = (id, account_id) => {
    setState((s) => {
      const u = s.upcoming.find((x) => x.id === id);
      if (!u) return s;
      const nowDate = new Date().toISOString().slice(0, 10);
      const sign = u.type === "collection" ? 1 : -1;

      const newIncome = u.type === "collection"
        ? [{
            id: uid("inc"),
            date: nowDate,
            amount: u.amount,
            category: "SaaS Abonelikleri",
            account_id,
            cari_id: u.cari_id || null,
            description: `(Tahsilat) ${u.description}`,
            status: "received",
          }, ...s.income]
        : s.income;

      const newExpense = u.type === "payment"
        ? [{
            id: uid("exp"),
            date: nowDate,
            amount: u.amount,
            category: "Diğer Gider",
            account_id,
            cari_id: u.cari_id || null,
            description: `(Ödeme) ${u.description}`,
            status: "paid",
          }, ...s.expense]
        : s.expense;

      return {
        ...s,
        upcoming: s.upcoming.map((x) =>
          x.id === id ? { ...x, status: "settled", settled_at: nowDate, account_id } : x,
        ),
        accounts: s.accounts.map((a) =>
          a.id === account_id ? { ...a, balance: a.balance + sign * u.amount } : a,
        ),
        cari: u.cari_id
          ? s.cari.map((c) =>
              c.id === u.cari_id ? { ...c, balance: c.balance - sign * u.amount } : c,
            )
          : s.cari,
        income: newIncome,
        expense: newExpense,
      };
    });
  };

  const deleteUpcoming = (id) =>
    setState((s) => ({ ...s, upcoming: s.upcoming.filter((u) => u.id !== id) }));

  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
  };

  const value = {
    ...state,
    categories: { income: INCOME_CATEGORIES, expense: EXPENSE_CATEGORIES },
    addAccount,
    deleteAccount,
    updateAccount,
    adjustAccount,
    addCari,
    deleteCari,
    updateCari,
    adjustCari,
    addIncome,
    deleteIncome,
    updateIncome,
    addExpense,
    deleteExpense,
    updateExpense,
    transfer,
    addUpcoming,
    settleUpcoming,
    deleteUpcoming,
    resetAll,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
};
